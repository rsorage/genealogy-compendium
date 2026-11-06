#!/usr/bin/env python3
"""Exportação do acervo privado para os dados públicos de Pessoas e Documentos.

Lê `01 Indice/persons.yaml` (as conclusões) e os blocos YAML das fichas em
`02 Documentos/**/*.md` (as evidências: personas e asserts), aplica o recorte
e as regras de publicação, e grava `src/content/pessoas.json` e
`src/content/documentos.json`, que o build do Astro valida de novo.

Recorte (decisão de Ramon, 06/11/2026): «até os italianos» — publica-se quem
nasceu na Itália (ou, sem lugar de nascimento, quem só está documentado lá), e
dali para cima sem limite; quem nasceu no Brasil fica para outra fase.

Privacidade (as mesmas regras do site, 14/10 e 26/10/2026):
- ninguém nascido depois de 1925; sem data de nascimento, a pessoa só entra se
  tiver morte registrada, se aparecer como adulto num documento de até 1925, ou se
  for pai/mãe de alguém que passa por uma destas regras (07/11/2026);
- âncoras (07/11/2026): o casal em que as duas linhas se juntam, nomeado em
  `publicacao-pessoas.json` › `ancoras`, entra com rótulo («Meu avô») e sem dossiê;
  as ligações que chegam às âncoras e aos pais delas podem citar POR REFERÊNCIA um
  documento não publicado (tipo, lugar, ano), sem página nem transcrição;
- documentos: nascimentos e demais até 1925; óbitos até 1955, só de quem nasceu
  até 1925; transcrição integral só para documentos até 1925;
- nenhuma imagem, nenhum caminho de arquivo, nenhum número de documento pessoal;
- o texto de apresentação de cada pessoa é o campo `public_summary` do
  persons.yaml, escrito à mão; o `summary` interno NUNCA é exportado.

    python3 scripts/exportar-pessoas-documentos.py [--acervo /caminho] [--verificar]

Requer PyYAML. Não altera o acervo, não cria commits, não publica.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.stderr.write("PyYAML não encontrado: pip install pyyaml\n")
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
DESTINO = ROOT / "src" / "content"

# A varredura de conteúdo privado e a lista de portais são as de exportar-registros.py.
_spec = importlib.util.spec_from_file_location("exportar_registros", ROOT / "scripts" / "exportar-registros.py")
registros = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(registros)

CORTE = 1925
CORTE_OBITOS = 1955
FM_RE = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)", re.S)
ID_DOC_RE = re.compile(r"\b(?:IT|BR|UY|US)-[A-Z]{3}-\d{3}[a-z]?\b")
LINHAS = {"suraci", "cardillo", "marsicano", "vecchia", "rede"}

# firmeza do acervo → vocabulário público (1:1; «rejected» não é publicado)
FIRMEZA = {"certain": "certa", "stated": "declarada", "probable": "provavel", "doubtful": "duvidosa"}

TIPOS_OBITO = {"death", "burial"}
# record_type do acervo → tipo público
TIPO_DOC = {
    "birth": "nascita", "baptism": "battesimo", "marriage": "matrimonio", "marriage_banns": "pubblicazioni",
    "marriage_file": "processetti", "death": "morte", "burial": "sepoltura", "parish_marriage": "matrimonio",
    "census": "catasto", "military": "lista_di_leva", "passenger_list": "lista_de_bordo", "passport": "passaporte",
    "notarial": "notarial", "index": "indice", "newspaper": "jornal", "other": "outro",
}
# em documentos brasileiros, os tipos em português
TIPO_DOC_BR = {"birth": "nascimento", "marriage": "casamento", "death": "obito", "passenger_list": "hospedaria"}
JURISDICAO = {"civil": "Registro civil", "parish": "Arquivo paroquial", "fiscal": "Catasto", "military": "Leva militar",
              "notarial": "Notariado", "press": "Imprensa", "other": ""}
PAPEIS_ADULTOS = {"father", "mother", "spouse", "declarant", "witness", "official", "signatory", "godparent", "midwife",
                  "household_head", "consenting_party", "informant", "neighbor"}
# o «subject» destes tipos de ato é, por definição, adulto
TIPOS_SUJEITO_ADULTO = {"marriage", "marriage_banns", "marriage_file", "parish_marriage", "military", "notarial", "passport"}
PAPEL = {
    "subject": "registrado", "father": "pai", "mother": "mãe", "spouse": "cônjuge", "child": "filho(a)", "sibling": "irmão/irmã",
    "grandparent": "avô/avó", "grandchild": "neto(a)", "relative": "parente", "declarant": "declarante", "witness": "testemunha",
    "official": "oficial", "signatory": "assina", "informant": "informante", "consenting_party": "consente",
    "godparent": "padrinho/madrinha", "midwife": "parteira", "household_head": "chefe do fuoco",
    "household_member": "membro do fuoco", "neighbor": "confinante",
}

# Lugares de nascimento do persons.yaml → país. Um lugar fora desta tabela vai para o
# relatório como «indeterminado» e a pessoa só entra pela lista privada `publicar_pessoas`.
PAISES = {
    "IT": ["Laganadi", "Padula", "Buonabitacolo", "Casaletto Spartano", "Battaglia", "Vibonati", "Sant'Eufemia d'Aspromonte",
           "Scilla", "Messina", "San Mauro Cilento", "Roccagloriosa", "Lagonegro", "San Giorgio Morgeto", "Casalbuttano",
           "Catanzaro", "Reggio Calabria", "Pellaro", "Tropea", "Podargoni", "Gioiosa Marea", "Cremona", "Genova"],
    "BR": ["Carangola", "Patrocínio do Muriaé", "Rio de Janeiro", "Niterói", "Macaé", "Duque de Caxias", "São Paulo",
           "Juiz de Fora", "Manhuaçu", "Vitória", "Santos", "João Pessoa", "(MG)", "(RJ)", "(SP)", "(PB)", "(ES)"],
    "UY": ["Montevideo", "Montevidéu", "Uruguai"],
    "US": ["USA", "New Jersey", "Ohio", "Cleveland", "New York"],
    "MA": ["Marrocos"],
}


# ---------------------------------------------------------------- utilidades

def texto(valor) -> str:
    return " ".join(str(valor if valor is not None else "").split())


def ano_de(valor) -> int | None:
    m = re.search(r"(\d{4})", str(valor or ""))
    return int(m[1]) if m else None


def publico(valor: str, onde: str) -> str:
    """Texto que vai ao ar: sem caminhos locais nem identificadores pessoais (a varredura do site)."""
    valor = texto(valor)
    if re.search(r"(?:/Users/|/home/|file://|\b(?:CPF|RG)\s*[:=]|\d{3}\.\d{3}\.\d{3}-\d{2})", valor, re.I):
        raise ValueError(f"Conteúdo privado em {onde}; revisar no acervo.")
    return valor


def publico_multilinha(valor: str, onde: str) -> str:
    """Como publico(), mas preserva as quebras de linha (transcrições e ressalvas)."""
    linhas = [" ".join(l.split()) for l in str(valor or "").replace("\r\n", "\n").split("\n")]
    texto_plano = "\n".join(linhas).strip()
    publico(texto_plano.replace("\n", " "), onde)
    return texto_plano


def pais_do_lugar(lugar: str) -> str | None:
    lugar = texto(lugar)
    if not lugar:
        return None
    for pais, marcas in PAISES.items():
        if any(marca.casefold() in lugar.casefold() for marca in marcas):
            return pais
    return None


def ler_ficha(caminho: Path) -> tuple[dict, str] | None:
    try:
        t = caminho.read_text("utf-8", errors="replace")
    except OSError:
        return None
    m = FM_RE.match(t)
    if not m:
        return None
    d = yaml.safe_load(m[1])
    if not isinstance(d, dict) or not d.get("id"):
        return None
    return d, t[m.end():]


def secao(corpo: str, padrao: str) -> str:
    """Corpo da primeira seção «## …» cujo título casa com o padrão (regex, sem o «## »)."""
    m = re.search(r"^## (?:" + padrao + r")[^\n]*\n(.*?)(?=^## |\Z)", corpo, re.S | re.M | re.I)
    return m[1].strip() if m else ""


def transcricao_de(corpo: str, integral: bool) -> str:
    """Integral: a primeira seção «Transcrição…» (o bloco de código, se houver). Senão só «trechos genealógicos»."""
    sec = secao(corpo, r"Transcri") if integral else secao(corpo, r"Transcrição dos trechos genealógicos")
    if not sec:
        return ""
    blocos = re.findall(r"```[a-z]*\n(.*?)```", sec, re.S)
    if blocos:
        return "\n\n".join(b.rstrip() for b in blocos)
    # sem bloco de código: o texto da seção, sem links locais nem citações de arquivo
    sec = re.sub(r"\[([^\]]+)\]\(<?[^)>]*>?\)", r"\1", sec)
    return sec.strip()


def ressalvas_de(corpo: str) -> str:
    sec = secao(corpo, r"Ressalvas de leitura|Ressalvas")
    sec = re.sub(r"\[([^\]]+)\]\(<?[^)>]*>?\)", r"\1", sec)
    return sec.strip()


def titulo_de(corpo: str, id_: str) -> str:
    m = re.search(r"^#[ \t]+(.+?)[ \t]*$", corpo, re.M)
    if not m:
        return id_
    h = m[1].strip()
    partes = re.split(r"\s+[—–-]\s+", h, maxsplit=1)
    return partes[1].strip() if len(partes) == 2 and partes[0].strip() == id_ else h


def link_publico(fonte: dict) -> tuple[str, str] | None:
    candidatos = [texto(fonte.get("url"))]
    ark = texto(fonte.get("ark"))
    if ark.startswith("ark:/"):
        candidatos.append("https://antenati.cultura.gov.it/" + ark)
    referencia = texto(fonte.get("reference"))
    candidatos += re.findall(r"https?://[^\s)\]>\"«»]+", referencia)
    # arks escritos sem endereço: «ark:/12657/…» é o Antenati, «ark:/61903/…» é o FamilySearch
    for ark_solto in re.findall(r"(?<![/\w])ark:/(?:12657|61903)/[A-Za-z0-9_:/.-]+", referencia):
        host = "antenati.cultura.gov.it" if ark_solto.startswith("ark:/12657") else "www.familysearch.org"
        candidatos.append(f"https://{host}/{ark_solto.rstrip('.,;')}")
    for c in candidatos:
        if not c:
            continue
        ok = registros.public_url(c)
        if ok:
            return ok
    return None


# ---------------------------------------------------------------- leitura do acervo

def ler_acervo(acervo: Path) -> tuple[list[dict], list[dict]]:
    dados = yaml.safe_load((acervo / "01 Indice" / "persons.yaml").read_text("utf-8"))
    pessoas = dados.get("persons") or []
    fichas = []
    for caminho in sorted((acervo / "02 Documentos").rglob("*.md")):
        lida = ler_ficha(caminho)
        if not lida:
            continue
        d, corpo = lida
        if d.get("record_type") == "negative_search":
            continue
        d["_corpo"] = corpo
        d["_pasta"] = caminho.parent.name
        fichas.append(d)
    return pessoas, fichas


# ---------------------------------------------------------------- regras

def pais_de_nascimento(p: dict, aparicoes: list[tuple[dict, dict]]) -> str | None:
    """Do lugar de nascimento do persons.yaml; senão, do lugar de nascimento que algum ato DECLARA para a
    pessoa (declares.birth_place). O país dos documentos em si não serve: um imigrante documentado só no
    Brasil nasceu na Itália. Sem nada disso, indeterminado — decide-se em publicacao-pessoas.json."""
    pais = pais_do_lugar(texto((p.get("birth") or {}).get("place")))
    if pais:
        return pais
    achados = set()
    for _, persona in aparicoes:
        dec = persona.get("declares") or {}
        for chave in ("birth_place", "birth_place_raw"):
            pais = pais_do_lugar(texto(dec.get(chave)))
            if pais:
                achados.add(pais)
    if len(achados) == 1:
        return achados.pop()
    if achados:
        return None
    # Sem lugar declarado em parte alguma: quem só está documentado na Itália conta como italiano
    # (testemunhas, oficiais, padrinhos de Laganadi). Um documento brasileiro no meio torna o caso
    # indeterminado — nunca «brasileiro»: um imigrante documentado só no Brasil nasceu na Itália.
    paises_docs = {texto((f.get("place") or {}).get("country")) for f, _ in aparicoes}
    return "IT" if paises_docs == {"IT"} else None


def passa_na_data(p: dict, aparicoes: list[tuple[dict, dict]]) -> tuple[bool, str]:
    """(publicável, motivo). Regra (a) nascimento até 1925; (b) morte registrada; (c) adulto num documento até 1925."""
    nasc = ano_de((p.get("birth") or {}).get("date"))
    if nasc is not None:
        return (nasc <= CORTE, "" if nasc <= CORTE else "nascimento depois de 1925")
    if (p.get("death") or {}).get("date"):
        return True, ""
    for ficha, persona in aparicoes:
        ano = ano_de(ficha.get("date_event") or ficha.get("date_recorded"))
        papeis = set(persona.get("roles") or [])
        adulto = bool(papeis & PAPEIS_ADULTOS) or ("subject" in papeis and texto(ficha.get("record_type")) in TIPOS_SUJEITO_ADULTO)
        if ano and ano <= CORTE and adulto:
            return True, ""
    return False, "sem data de nascimento, sem morte e sem aparição adulta até 1925"


def evento_publico(ev: dict | None, onde: str, docs_publicados: set[str]) -> dict | None:
    if not ev:
        return None
    firmeza = FIRMEZA.get(texto(ev.get("confidence")) or "certain")
    if not firmeza:
        return None
    base = publico(ev.get("basis", ""), onde)
    saida = {"firmeza": firmeza, "base": base,
             "documentos": sorted({d for d in ID_DOC_RE.findall(base) if d in docs_publicados})}
    if ev.get("date"):
        saida["data"] = texto(ev["date"])
    if ev.get("place"):
        saida["lugar"] = publico(ev["place"], onde)
    return saida


TIPO_REFERENCIA = {"birth": "nascimento", "baptism": "batismo", "marriage": "casamento", "marriage_banns": "proclamas",
                   "death": "óbito", "burial": "sepultamento", "census": "censo", "newspaper": "jornal", "other": ""}


def referencia_nao_publicada(f: dict) -> str:
    """Como se cita um documento que NÃO vai ao ar: só o tipo, o lugar e o ano."""
    lugar = f.get("place") or {}
    ano = ano_de(f.get("date_event") or f.get("date_recorded"))
    tipo = TIPO_REFERENCIA.get(texto(f.get("record_type")), "")
    if texto(f.get("record_type")) == "other":
        raw = texto(f.get("record_type_raw")).casefold()
        tipo = "árvore do FamilySearch (fonte secundária)" if "familysearch" in raw else "documento"
    partes = [tipo, ", ".join(v for v in (texto(lugar.get("comune")), texto(lugar.get("province"))) if v), str(ano) if ano else "s.d."]
    jur = JURISDICAO.get(texto(f.get("jurisdiction")), "")
    return ", ".join(p for p in partes if p) + (f" — {jur.casefold()}" if jur else "") + ", não publicado"


def exportar(acervo: Path, selecao: dict | None = None) -> tuple[dict, dict]:
    selecao = selecao or {}
    if {k for k in selecao if not k.startswith("_")} - {"publicar_pessoas", "ocultar_pessoas", "ocultar_documentos", "ancoras"}:
        raise ValueError("Chave não reconhecida na seleção privada de publicação.")
    ancoras: dict[str, dict] = selecao.get("ancoras") or {}
    if not isinstance(ancoras, dict) or not all(isinstance(v, dict) and texto(v.get("rotulo")) for v in ancoras.values()):
        raise ValueError("ancoras deve mapear id → {rotulo}.")
    pessoas_yaml, fichas = ler_acervo(acervo)
    por_id = {p["id"]: p for p in pessoas_yaml}
    if len(por_id) != len(pessoas_yaml):
        raise ValueError("Identificador de pessoa repetido no persons.yaml.")

    # aparições: pessoa → [(ficha, persona)]
    aparicoes: dict[str, list[tuple[dict, dict]]] = defaultdict(list)
    for f in fichas:
        for persona in f.get("personas") or []:
            if persona.get("same_as"):
                aparicoes[persona["same_as"]].append((f, persona))

    # pais de quem comprovadamente nasceu até 1925 nasceram antes ainda (07/11/2026); a propagação
    # usa todos os asserts child_of, publicados ou não, porque é só uma inferência de idade.
    pais_de: dict[str, set[str]] = defaultdict(set)
    for f in fichas:
        for a in f.get("asserts") or []:
            if a.get("relation") == "child_of" and FIRMEZA.get(texto(a.get("confidence")) or "certain"):
                pais_de[a.get("subject")].add(a.get("object"))
    base_corte: dict[str, str] = {}
    for p in pessoas_yaml:
        ok, _ = passa_na_data(p, aparicoes.get(p["id"], []))
        if ok:
            nasc = ano_de((p.get("birth") or {}).get("date"))
            base_corte[p["id"]] = f"nascimento em {nasc}" if nasc else ("morte registrada" if (p.get("death") or {}).get("date") else "adulto num documento até 1925")
    fila = list(base_corte)
    while fila:
        filho = fila.pop()
        for pai in pais_de.get(filho, ()):
            if pai in por_id and pai not in base_corte:
                base_corte[pai] = f"pai/mãe de {por_id[filho]['display_name']} ({base_corte[filho]})"
                fila.append(pai)

    # 1) quem entra
    excluidas: dict[str, str] = {}
    publicadas: dict[str, dict] = {}
    indeterminadas: list[str] = []
    for p in pessoas_yaml:
        pid = p["id"]
        if pid in selecao.get("ocultar_pessoas", []):
            excluidas[pid] = "omitida pela seleção privada"
            continue
        linha = texto(p.get("line"))
        if linha not in LINHAS:
            raise ValueError(f"{pid}: campo line ausente ou inválido ({linha!r}); valores: {sorted(LINHAS)}")
        if pid not in base_corte:
            excluidas[pid] = passa_na_data(p, aparicoes.get(pid, []))[1]
            continue
        if pid not in selecao.get("publicar_pessoas", []):
            pais = pais_de_nascimento(p, aparicoes.get(pid, []))
            if pais is None:
                indeterminadas.append(pid)
                excluidas[pid] = "país de nascimento indeterminado (decidir em publicar_pessoas/ocultar_pessoas)"
                continue
            if pais != "IT":
                excluidas[pid] = f"fora do recorte: nascimento em {pais}"
                continue
        publicadas[pid] = p

    # 2) documentos
    docs_pub: dict[str, dict] = {}
    docs_exc: dict[str, str] = {}
    for f in fichas:
        fid = f["id"]
        if fid in selecao.get("ocultar_documentos", []):
            docs_exc[fid] = "omitido pela seleção privada"
            continue
        tipo_acervo = texto(f.get("record_type"))
        ano = ano_de(f.get("date_event") or f.get("date_recorded"))
        if ano is None:
            docs_exc[fid] = "sem data"
            continue
        limite = CORTE_OBITOS if tipo_acervo in TIPOS_OBITO else CORTE
        if ano > limite:
            docs_exc[fid] = f"depois do corte de {limite}"
            continue
        sujeitos = [pe for pe in (f.get("personas") or []) if "subject" in (pe.get("roles") or [])]
        if ano > CORTE:
            # óbito 1926–1955: só de quem comprovadamente nasceu até 1925
            nascs = []
            for pe in sujeitos:
                dec = pe.get("declares") or {}
                n = ano_de(dec.get("birth_date"))
                if n is None and isinstance(dec.get("age"), int):
                    n = ano - dec["age"]
                if n is None and pe.get("same_as") in por_id:
                    n = ano_de((por_id[pe["same_as"]].get("birth") or {}).get("date"))
                nascs.append(n)
            if not nascs or any(n is None or n > CORTE for n in nascs):
                docs_exc[fid] = "óbito posterior a 1925 sem nascimento comprovado até 1925"
                continue
        fora = [pe.get("same_as") for pe in sujeitos if pe.get("same_as") and pe["same_as"] not in publicadas and pe["same_as"] in por_id]
        if fora:
            docs_exc[fid] = "documento de pessoa fora do recorte: " + ", ".join(fora)
            continue
        if not any(pe.get("same_as") in publicadas for pe in (f.get("personas") or [])):
            docs_exc[fid] = "nenhuma pessoa publicada neste documento"
            continue
        docs_pub[fid] = f

    # 3) montagem dos documentos
    documentos = []
    for fid, f in sorted(docs_pub.items()):
        fonte = f.get("source") or {}
        lugar = f.get("place") or {}
        pais = texto(lugar.get("country"))
        tipo_acervo = texto(f.get("record_type"))
        tipo = (TIPO_DOC_BR.get(tipo_acervo) if pais == "BR" else None) or TIPO_DOC.get(tipo_acervo, "outro")
        ano = ano_de(f.get("date_event") or f.get("date_recorded"))
        reg = f.get("register") or {}
        referencia = " · ".join(v for v in (
            texto(reg.get("series")), texto(reg.get("year")),
            f"parte {reg['part']}" if reg.get("part") else "",
            f"ato n.º {reg['act']}" if reg.get("act") else "",
            f"fólio {reg['folio']}" if reg.get("folio") else "",
            f"livro {reg['book']}" if reg.get("book") else "",
            f"imagem {reg['image']}" if reg.get("image") else "",
        ) if v)
        link = link_publico(fonte)
        pessoas_doc, nomes = [], []
        for pe in f.get("personas") or []:
            dec = pe.get("declares") or {}
            papeis = [PAPEL.get(r, r) for r in (pe.get("roles") or [])]
            entrada = {"nome_escrito": publico(pe.get("name_as_written", ""), fid), "papeis": papeis}
            if isinstance(dec.get("age"), int):
                entrada["idade"] = dec["age"]
            if dec.get("occupation_raw"):
                entrada["oficio"] = publico(dec["occupation_raw"], fid)
            if isinstance(dec.get("literate"), bool):
                entrada["assina"] = dec["literate"]
            if pe.get("same_as") in publicadas:
                entrada["pessoa"] = pe["same_as"]
                entrada["firmeza"] = FIRMEZA.get(texto(pe.get("confidence")) or "certain", "certa")
                pessoas_doc.append(entrada)
            elif pe.get("same_as") in por_id:
                continue  # pessoa fora do recorte: não nomeada na tabela
            else:
                nomes.append(entrada)
        corpo = f["_corpo"]
        documentos.append({
            "id": fid,
            "titulo": publico(titulo_de(corpo, fid), fid),
            "tipo": tipo,
            "tipo_original": publico(f.get("record_type_raw") or "", fid),
            "data_documento": texto(f.get("date_event") or f.get("date_recorded")),
            "ano": ano,
            "lugar": publico(", ".join(v for v in (texto(lugar.get("comune")), texto(lugar.get("province"))) if v), fid),
            "pais": pais,
            "jurisdicao": JURISDICAO.get(texto(f.get("jurisdiction")), "") or publico(f.get("jurisdiction_raw", ""), fid),
            "repositorio": publico(fonte.get("repository_raw") or fonte.get("repository", ""), fid),
            "referencia": publico(referencia, fid),
            **({"url": link[0], "portal": link[1]} if link else {}),
            "pessoas": pessoas_doc,
            "nomes_transcritos": nomes,
            "transcricao": publico_multilinha(transcricao_de(corpo, integral=ano <= CORTE), fid),
            "ressalvas": publico_multilinha(ressalvas_de(corpo), fid),
            "linhas": sorted({publicadas[pe["pessoa"]]["line"] for pe in pessoas_doc}),
        })
    ids_docs = set(docs_pub)

    # 4) montagem das pessoas
    pessoas = []
    relacoes_descartadas = 0
    conjunto_ancora = set(ancoras)
    for aid in list(ancoras):
        conjunto_ancora |= {o for o in pais_de.get(aid, ()) if o in publicadas}
    for aid in list(ancoras):
        for o in pais_de.get(aid, ()):
            conjunto_ancora |= {oo for oo in pais_de.get(o, ()) if oo in publicadas}
    ficha_por_id = {f["id"]: f for f in fichas}
    asserts_por_pessoa: dict[str, list] = defaultdict(list)
    for f in fichas:
        for a in f.get("asserts") or []:
            if f["id"] in docs_pub or {a.get("subject"), a.get("object")} & conjunto_ancora:
                asserts_por_pessoa[a.get("subject")].append((f["id"], a))
                asserts_por_pessoa[a.get("object")].append((f["id"], a))
    for pid, p in sorted(publicadas.items()):
        relacoes = {}
        for fid, a in asserts_por_pessoa.get(pid, []):
            s, o, rel = a.get("subject"), a.get("object"), a.get("relation")
            outro = o if s == pid else s
            if outro not in publicadas:
                relacoes_descartadas += 1
                continue
            firmeza = FIRMEZA.get(texto(a.get("confidence")) or "certain")
            if not firmeza:
                continue  # rejected: fica no grafo privado
            if rel == "child_of":
                if s == pid:
                    tipo = "mae" if texto(publicadas[o].get("sex")) == "F" else "pai"
                else:
                    tipo = "filho"
            elif rel == "spouse_of":
                tipo = "conjuge"
            elif rel == "sibling_of":
                tipo = "irmao"
            else:
                continue
            chave = (tipo, outro)
            atual = relacoes.get(chave)
            if fid in docs_pub:
                entrada = {"tipo": tipo, "pessoa": outro, "firmeza": firmeza, "documentos": [fid]}
            else:
                # citação por referência: tipo, lugar e ano — sem página, sem transcrição, sem nomes
                entrada = {"tipo": tipo, "pessoa": outro, "firmeza": firmeza, "documentos": [],
                           "referencia": referencia_nao_publicada(ficha_por_id[fid])}
            if a.get("rationale"):
                entrada["justificativa"] = publico(a["rationale"], f"{fid}/asserts")
            if atual:
                atual["documentos"] = sorted(set(atual["documentos"]) | ({fid} if fid in docs_pub else set()))
                if "referencia" in entrada and "referencia" not in atual:
                    atual["referencia"] = entrada["referencia"]
                # a firmeza publicada é a melhor que algum documento sustenta
                ordem = ["certa", "declarada", "provavel", "duvidosa"]
                if ordem.index(firmeza) < ordem.index(atual["firmeza"]):
                    atual["firmeza"] = firmeza
            else:
                relacoes[chave] = entrada
        aparece = []
        for f, persona in aparicoes.get(pid, []):
            if f["id"] not in docs_pub:
                continue
            dec = persona.get("declares") or {}
            item = {"documento": f["id"], "nome_escrito": publico(persona.get("name_as_written", ""), pid),
                    "papeis": [PAPEL.get(r, r) for r in (persona.get("roles") or [])]}
            if isinstance(dec.get("age"), int):
                item["idade"] = dec["age"]
            if dec.get("occupation_raw"):
                item["oficio"] = publico(dec["occupation_raw"], pid)
            if isinstance(dec.get("literate"), bool):
                item["assina"] = dec["literate"]
            aparece.append(item)
        aparece.sort(key=lambda i: texto(docs_pub[i["documento"]].get("date_event") or docs_pub[i["documento"]].get("date_recorded")))
        resumo = texto(p.get("public_summary"))
        pessoas.append({
            "id": pid,
            "nome_exibicao": publico(p.get("display_name", ""), pid),
            "nomes_alternativos": [publico(a, pid) for a in (p.get("aliases") or [])],
            "sexo": texto(p.get("sex")) or "?",
            "linha": p["line"],
            **({"nascimento": evento_publico(p.get("birth"), f"{pid}/birth", ids_docs)} if p.get("birth") else {}),
            **({"morte": evento_publico(p.get("death"), f"{pid}/death", ids_docs)} if p.get("death") else {}),
            **({"ocupacao": publico(p["occupation"], pid)} if p.get("occupation") else {}),
            **({"familysearch": texto(p["familysearch"])} if p.get("familysearch") else {}),
            "resumo": publico(resumo, pid),
            "base_do_corte": base_corte[pid],
            **({"carece_pesquisa": True} if p.get("needs_research") is True else {}),
            **({"ancora": {"rotulo": publico(ancoras[pid]["rotulo"], pid)}, "sem_dossie": True} if pid in ancoras else {}),
            "relacoes": sorted(relacoes.values(), key=lambda r: (["pai", "mae", "conjuge", "irmao", "filho"].index(r["tipo"]), r["pessoa"])),
            "aparece_em": aparece,
        })

    relatorio = {
        "pessoas": {"no_acervo": len(pessoas_yaml), "publicadas": len(pessoas), "sem_resumo_publico": sorted(p["id"] for p in pessoas if not p["resumo"]),
                    "excluidas_por_motivo": dict(Counter(re.sub(r": .*", "", m) for m in excluidas.values())),
                    "excluidas": excluidas, "pais_indeterminado": indeterminadas},
        "documentos": {"no_acervo": len(fichas), "publicados": len(documentos), "sem_link_publico": sorted(d["id"] for d in documentos if "url" not in d),
                       "sem_transcricao": sorted(d["id"] for d in documentos if not d["transcricao"]),
                       "excluidos_por_motivo": dict(Counter(re.sub(r": .*", "", m) for m in docs_exc.values())), "excluidos": docs_exc},
        "relacoes_descartadas_por_apontar_para_pessoa_nao_publicada": relacoes_descartadas,
    }
    dados = {"pessoas": pessoas, "documentos": documentos}
    return dados, relatorio


def serializar(dados: dict) -> dict[str, str]:
    dump = lambda obj: json.dumps(obj, ensure_ascii=False, indent=1, sort_keys=True) + "\n"
    return {"pessoas.json": dump(dados["pessoas"]), "documentos.json": dump(dados["documentos"])}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--acervo", type=Path, default=ROOT.parent / "family-research")
    parser.add_argument("--verificar", action="store_true", help="só confere; sai com 1 se desatualizado")
    parser.add_argument("--relatorio", type=Path, default=None)
    args = parser.parse_args()
    if not (args.acervo / "01 Indice" / "persons.yaml").exists():
        raise ValueError(f"persons.yaml não encontrado em {args.acervo}")
    arq_sel = args.acervo / "01 Indice" / "publicacao-pessoas.json"
    selecao = json.loads(arq_sel.read_text("utf-8")) if arq_sel.exists() else {}
    dados, relatorio = exportar(args.acervo, selecao)
    arquivos = serializar(dados)
    desatualizado = any(not (DESTINO / n).exists() or (DESTINO / n).read_text("utf-8") != c for n, c in arquivos.items())
    r = relatorio
    print(f"Pessoas: {r['pessoas']['publicadas']} de {r['pessoas']['no_acervo']} publicadas; sem resumo público: {len(r['pessoas']['sem_resumo_publico'])}; país indeterminado: {len(r['pessoas']['pais_indeterminado'])}.")
    for motivo, n in sorted(r["pessoas"]["excluidas_por_motivo"].items()):
        print(f"  fora: {n} — {motivo}")
    print(f"Documentos: {r['documentos']['publicados']} de {r['documentos']['no_acervo']} publicados; sem link público: {len(r['documentos']['sem_link_publico'])}; sem transcrição: {len(r['documentos']['sem_transcricao'])}.")
    for motivo, n in sorted(r["documentos"]["excluidos_por_motivo"].items()):
        print(f"  fora: {n} — {motivo}")
    if args.verificar:
        print("Exportação desatualizada." if desatualizado else "src/content/pessoas.json e documentos.json atualizados.")
        return int(desatualizado)
    DESTINO.mkdir(parents=True, exist_ok=True)
    for nome, conteudo in arquivos.items():
        (DESTINO / nome).write_text(conteudo, "utf-8")
    relatorio["gerado_em"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    destino_rel = args.relatorio or (args.acervo / "01 Indice" / "relatorio-exportacao-pessoas-documentos.json")
    destino_rel.write_text(json.dumps(relatorio, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"Dados gravados em {DESTINO.relative_to(ROOT)}/. Relatório privado: {destino_rel}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, yaml.YAMLError) as erro:
        print(f"Exportação interrompida: {erro}", file=sys.stderr)
        sys.exit(2)
