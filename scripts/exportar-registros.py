#!/usr/bin/env python3
"""Exportação do acervo privado para os dados públicos de «Registros vistos».

Lê `01 Indice/registros-vistos/{linhas-transcritas,mapa-imagens}.csv` do acervo,
aplica a seleção pública (cortes por tipo de registro, portais aceitos, seleção
privada `publicacao.json`, varredura de conteúdo privado) e grava JSON em
`src/content/registros-vistos/`, que o build do Astro valida de novo
(`src/content.config.ts`) antes de gerar as páginas.

Usa somente a biblioteca padrão. Não consulta portais, não altera os CSV,
não cria commits e não publica.

    python3 scripts/exportar-registros.py                 # grava os JSON
    python3 scripts/exportar-registros.py --verificar     # só confere; sai com 1 se desatualizado
    python3 scripts/exportar-registros.py --acervo /caminho/do/acervo

A lógica de seleção é a mesma do site anterior (genealogia-website,
`scripts/exportar-registros.py`), portada em 06/11/2026 sem mudança de regra;
os testes vieram junto (`tests/test_exportar_registros.py`).
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
DESTINO = ROOT / "src" / "content" / "registros-vistos"
NOTAS = ROOT / "scripts" / "registros-vistos" / "notas-publicas.json"
# Cortes por tipo de registro (decisão de Ramon, 26/10/2026):
# - nascimentos e os demais registros: 100 anos (até 1925);
# - óbitos: 70 anos (até 1955), desde que a pessoa registrada comprovadamente
#   tenha nascido até 1925; ninguém nascido depois de 1925 é publicado.
CUTOFF = 1925
DEATH_CUTOFF = 1955
BORN_BY = 1925
PORTALS = {
    "www.familysearch.org": ("FamilySearch", ("/ark:/61903/", "/search/film/")),
    "familysearch.org": ("FamilySearch", ("/ark:/61903/", "/search/film/")),
    "antenati.cultura.gov.it": ("Portale Antenati", ("/ark:/",)),
    "www.archiviodiocesanoreggiobova.it": (
        "Arquivo Diocesano de Reggio Calabria–Bova",
        ("/photo_details/", "/wp-content/uploads/wp_photo_seller/", "/consultazione-registri-parrocchiali/"),
    ),
    "www.gazzettaufficiale.it": ("Gazzetta Ufficiale", ("/eli/",)),
}
COVERAGES = {"lida inteira", "procurada", "cabeçalho"}
REVIEW_LABELS = {"imagem_sem_segunda_conferencia": "Leitura em imagem registrada; ainda sem segunda conferência."}
NAME_FIELDS = ("id", "nome", "sobrenome", "pai", "mae", "conjuge_nome", "conjuge_sobrenome",
               "comune", "serie", "ano", "parte", "num_atto", "data_evento", "imagem", "papel", "leitura")
PAGE_FIELDS = ("comune", "serie", "ano", "parte", "imagem", "colecao", "volume_ou_waypoint",
               "dgs_ou_manifest", "paginas_impressas", "cobertura")


def text(value: str) -> str:
    return " ".join((value or "").split())


def sort_name(value: str) -> str:
    # Sinais de dúvida continuam visíveis; não devem deslocar «S[uraci?]» para o início.
    value = unicodedata.normalize("NFD", value.casefold())
    return "".join(c for c in value if c.isalnum() and not unicodedata.combining(c))


def years(value: str, limit: int = CUTOFF) -> tuple[int, int] | None:
    """Só anos e intervalos explícitos. Não adivinhar «1908?» ou datas vazias."""
    m = re.fullmatch(r"(\d{4})(?:\s*[-–]\s*(\d{4}))?", text(value))
    if not m:
        return None
    start, end = int(m[1]), int(m[2] or m[1])
    return (start, end) if 1000 <= start <= end <= limit else None


def is_death_record(row: dict) -> bool:
    """Óbitos têm corte próprio; a série ou o tipo de fonte precisam dizê-lo."""
    serie = text(row.get("serie", "")).casefold()
    kind = text(row.get("tipo_fonte", "")).casefold()
    return serie.startswith(("morti", "óbito", "obito", "sepolt")) or kind.startswith(("morte", "óbito", "obito", "sepoltura"))


def cutoff_for(row: dict) -> int:
    return DEATH_CUTOFF if is_death_record(row) else CUTOFF


def birth_year(row: dict) -> int | None:
    """Ano de nascimento comprovado pela própria linha: «n. … AAAA» no papel ou ano menos idade."""
    explicit = re.search(r"\bn\.\s[^;)]*?(?<!\d)(\d{4})(?!\d)", row.get("papel", ""))
    if explicit:
        return int(explicit[1])
    age = text(row.get("idade", ""))
    event = re.match(r"(\d{4})", text(row.get("data_evento", ""))) or re.match(r"(\d{4})", text(row.get("ano", "")))
    if re.fullmatch(r"\d{1,3}", age) and event:
        return int(event[1]) - int(age)
    return None


def public_url(value: str) -> tuple[str, str] | None:
    try:
        parsed = urlsplit(value.strip())
        host = parsed.hostname
        if (parsed.scheme != "https" or host not in PORTALS or parsed.username
                or parsed.password or parsed.port not in (None, 443)):
            return None
        label, prefixes = PORTALS[host]
        if not parsed.path.startswith(prefixes):
            return None
        query = urlencode(sorted((k, v) for k, v in parse_qsl(parsed.query)
                                 if k in {"i", "cat", "cc", "locale"}))
        fragment = parsed.fragment if re.fullmatch(r"page=\d+", parsed.fragment) else ""
        host = "www.familysearch.org" if host == "familysearch.org" else host
        return urlunsplit(("https", host, parsed.path, query, fragment)), label
    except ValueError:
        return None


def safe_fields(row: dict, fields: tuple[str, ...]) -> dict:
    result = {key: text(row.get(key, "")) for key in fields}
    # Uma linha irregular não deve levar caminhos locais ou identificadores pessoais ao site.
    for value in result.values():
        if re.search(r"(?:/Users/|/home/|file://|\b(?:CPF|RG)\s*[:=]|\d{3}\.\d{3}\.\d{3}-\d{2})", value, re.I):
            raise ValueError("Campo selecionado contém conteúdo privado; revisar a linha no acervo.")
    return result


def content_summary(value: str) -> str:
    """Descrição estrutural, sem copiar nomes, notas marginais ou OCR do campo livre."""
    value = text(value)
    if re.search(r"transcri[cç][aã]o autom[aá]tica|\bOCR\b", value, re.I):
        return "Página consultada; conteúdo nominal não publicado."
    if re.match(r"(?:índice|indice|divisória do índice)", value, re.I):
        return "Índice do volume."
    if re.match(r"(?:capa|frontispício|cartão|cart[aã]o do microfilme)", value, re.I):
        return "Capa, frontispício ou identificação do volume."
    if re.match(r"(?:folha sem|duas páginas de formulário|formulário|página.*branco|esquerda em branco)", value, re.I):
        return "Formulário, folha em branco ou identificação do volume."
    m = re.match(r"(?:atos?|atti)\s*(?:n\.?\s*[.º°os]*\s*)?(\d+)(?:\s*[-–]\s*(\d+))?", value, re.I)
    if m:
        return f"Atos {m[1]}–{m[2]}." if m[2] else f"Referência inicial: ato {m[1]}."
    if "inscritos" in value and "sorteio" in value:
        return "Lista de recrutamento em ordem de sorteio."
    return ""


def category(series: str) -> str:
    s = series.casefold()
    if "battesim" in s:
        return "Batismos"
    if "presunti morti" in s or "orfani" in s:
        return "Listas do terremoto"
    if "pubblicaz" in s:
        return "Proclamas de casamento"
    if "matrimon" in s or "casamento" in s:
        return "Casamentos"
    if s.startswith("nati"):
        return "Nascimentos"
    # «Defunti» (paroquial), «Defunciones» (Uruguai) e certidões de óbito são óbitos como «Morti»:
    # o corte de 1955 já os tratava assim (is_death_record); o rótulo público agora acompanha (06/11/2026).
    if s.startswith(("morti", "defunt", "defuncion", "óbito", "obito")):
        return "Óbitos"
    if s.startswith("cittadinanz"):
        return "Cidadania"
    if "leva" in s or "alistamento" in s:
        return "Recrutamento militar"
    return "Outras fontes"


def roles_for(value: str) -> list[str]:
    role = value.casefold()
    roles = []
    if role.startswith(("pai", "padre")):
        roles.append("Pai")
    if role.startswith(("mãe", "madre")):
        roles.append("Mãe")
    if "declarante" in role or role == "dichiarante":
        roles.append("Declarante")
    if "testemunha" in role or role == "testimone":
        roles.append("Testemunha")
    if role.startswith(("padrinho", "madrinha")):
        roles.append("Padrinho/madrinha")
    if role.startswith(("comparente", "comparecente")) or "comparente" in role:
        roles.append("Comparecente")
    if role in {"sposo", "noivo"}:
        roles.append("Noivo")
    if role in {"sposa", "noiva"}:
        roles.append("Noiva")
    if role.startswith("cônjuge"):
        roles.append("Cônjuge")
    if role.startswith(("nato", "nata", "batiz", "falec", "morto", "morta", "defunt", "presunt", "inscrito", "órfão")):
        roles.append("Pessoa registrada")
    return roles or ["Outra menção"]


def act_id(item: dict) -> str:
    number, part = item["num_atto"], item["parte"]
    match = re.fullmatch(r"(?:(I|II)-)?(\d+)", number)
    if not match:
        return ""
    part, number = match[1] or part, str(int(match[2]))
    # O Antenati identifica o volume independentemente do canvas. Em outros portais,
    # agrupar só a referência explícita à mesma imagem; não fundir cópias por semelhança.
    parsed = urlsplit(item["url"])
    volume = re.match(r"(/ark:/12657/an_ua\d+)/", parsed.path) if parsed.hostname == "antenati.cultura.gov.it" else None
    reference = "https://antenati.cultura.gov.it" + volume[1] if volume else item["url"]
    identity = [reference, item["comune"], item["serie"], item["ano"], part, number]
    return "A-" + hashlib.sha256(json.dumps(identity, ensure_ascii=False).encode()).hexdigest()[:16]


def read_csv(path: Path, required: set[str]) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if not required.issubset(reader.fieldnames or []):
            raise ValueError(f"Colunas obrigatórias ausentes em {path.name}.")
        return list(reader)


def export(source: Path, annotations: dict, private_selection: dict | None = None) -> tuple[dict, dict]:
    private_selection = private_selection or {}
    if set(private_selection) - {"ocultar_ocorrencias", "ocultar_paginas"}:
        raise ValueError("Chave não reconhecida na seleção privada de publicação.")
    for key, pattern in (("ocultar_ocorrencias", r"L-\d+"), ("ocultar_paginas", r"P-[a-f0-9]{16}")):
        values = private_selection.get(key, [])
        if not isinstance(values, list) or not all(isinstance(v, str) and re.fullmatch(pattern, v) for v in values):
            raise ValueError("Lista inválida na seleção privada: " + key)
    names = read_csv(source / "linhas-transcritas.csv", set(NAME_FIELDS) | {"url_imagem"})
    pages = read_csv(source / "mapa-imagens.csv", set(PAGE_FIELDS) | {"url", "conteudo"})
    excluded = []
    dates = []
    output_names = []
    output_pages = {}
    seen_ids = set()
    for group, rows, link_field, fields in (
        ("nomes", names, "url_imagem", NAME_FIELDS),
        ("paginas", pages, "url", PAGE_FIELDS),
    ):
        for number, row in enumerate(rows, 2):
            reason = None
            limit = cutoff_for(row)
            interval = years(row.get("ano", ""), limit)
            link = public_url(row.get(link_field, ""))
            if group == "nomes" and row.get("id") in private_selection.get("ocultar_ocorrencias", []):
                reason = "entrada omitida pela seleção privada de publicação"
            elif not interval:
                reason = ("ano ausente, incerto ou fora do corte de 1955 para óbitos" if limit == DEATH_CUTOFF
                          else "ano ausente, incerto ou fora do corte de 1925")
            elif not link:
                reason = "link ausente ou fora dos endereços de imagens oficiais aceitos"
            elif not text(row.get("serie", "")) or (group == "nomes" and not text(row.get("comune", ""))):
                reason = "localidade ou série ausente"
            elif group == "nomes":
                if not re.fullmatch(r"L-\d+", row["id"]) or not row["nome"]:
                    reason = "identificador ou nome ausente/inválido"
                elif row["id"] in seen_ids:
                    raise ValueError(f"Identificador repetido: {row['id']}.")
                elif not re.match(r"^(certa|provável|duvidosa)(?:$| \()", row["leitura"]):
                    reason = "grau de leitura não reconhecido"
                elif any(int(y) > limit for key in ("data_evento", "papel")
                         for y in re.findall(r"(?<!\d)(\d{4})(?!\d)", row.get(key, ""))):
                    reason = "evento ou papel menciona data posterior ao corte"
                elif interval[1] > CUTOFF and (birth_year(row) is None or birth_year(row) > BORN_BY):
                    reason = "óbito posterior a 1925 sem nascimento comprovado até 1925"
            elif text(row.get("cobertura", "")) not in COVERAGES:
                reason = "cobertura de leitura não reconhecida"
            if reason:
                excluded.append({"arquivo": group, "linha_csv": number, "motivo": reason})
                continue
            item = safe_fields(row, fields)
            if group == "nomes" and interval[1] > CUTOFF and (birth_year(row) or BORN_BY) > 1900:
                # Cônjuge de quem nasceu depois de 1900 pode ter nascido depois de 1925.
                item["conjuge_nome"] = item["conjuge_sobrenome"] = ""
            if not item["comune"]:
                item["comune"] = "Localidade não indicada"
            item.update(url=link[0], portal=link[1], inicio=interval[0], fim=interval[1], tipo=category(item["serie"]))
            date = text(row.get("lido_em", ""))
            if re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
                dates.append(date)
            if group == "nomes":
                seen_ids.add(item["id"])
                review = text(row.get("conferencia", ""))
                if review and review not in REVIEW_LABELS:
                    raise ValueError("Estado de conferência não reconhecido: " + item["id"])
                optional = safe_fields(row, ("nota_publica",))
                item["nota"] = annotations.get(item["id"], optional["nota_publica"])
                item["conferencia"] = REVIEW_LABELS.get(review, "")
                item["papeis"] = roles_for(item["papel"])
                item["ato_id"] = act_id(item)
                alternative = text(row.get("url_imagem_alternativa", ""))
                if alternative:
                    alternative_link = public_url(alternative)
                    if not alternative_link:
                        raise ValueError("Link alternativo não aceito: " + item["id"])
                    item["url_alternativa"], item["portal_alternativo"] = alternative_link
                output_names.append(item)
            else:
                identity = json.dumps([item[k] for k in ("url", "comune", "serie", "ano", "parte")], ensure_ascii=False)
                item["id"] = "P-" + hashlib.sha256(identity.encode()).hexdigest()[:16]
                if item["id"] in private_selection.get("ocultar_paginas", []):
                    excluded.append({"arquivo": group, "linha_csv": number, "motivo": "entrada omitida pela seleção privada de publicação"})
                    continue
                item["descricao"] = content_summary(row.get("conteudo", ""))
                item["consultado_em"] = date
                item["anotacoes"] = 1
                if item["id"] in output_pages:
                    previous = output_pages[item["id"]]
                    # A mesma imagem pode ser revisitada. Preservar as coberturas explícitas,
                    # sem inferir leitura integral da existência de uma transcrição.
                    previous["anotacoes"] += 1
                    previous["coberturas"] = sorted(set(previous["coberturas"]) | {item["cobertura"]})
                    previous["consultado_em"] = max(previous["consultado_em"], date)
                    if not previous["imagem"]:
                        previous["imagem"] = item["imagem"]
                    continue
                item["coberturas"] = [item["cobertura"]]
                output_pages[item["id"]] = item
    unknown_notes = set(annotations) - {r["id"] for r in output_names}
    if unknown_notes:
        raise ValueError("Notas públicas apontam para ocorrências ausentes da exportação: " + ", ".join(sorted(unknown_notes)))
    pages_by_url = {}
    for page in output_pages.values():
        page["nomes_transcritos"] = 0
        pages_by_url.setdefault(page["url"], []).append(page)
    for item in output_names:
        linked_pages = {page["id"]: page for url in {item["url"], item.get("url_alternativa", "")}
                        for page in pages_by_url.get(url, [])
                        if page["comune"] == item["comune"] and page["ano"] == item["ano"] and page["serie"] == item["serie"]}
        item["paginas"] = sorted(linked_pages)
        for page in linked_pages.values():
            page["nomes_transcritos"] += 1
    ordered_names = sorted(output_names, key=lambda r: (sort_name(r["sobrenome"]), sort_name(r["nome"]), r["inicio"], r["id"]))
    ordered_pages = sorted(output_pages.values(), key=lambda r: (r["comune"].casefold(), r["tipo"], r["inicio"], r["volume_ou_waypoint"], int(r["imagem"]) if r["imagem"].isdigit() else 0, r["id"]))
    data = {"versao": 1, "corte": DEATH_CUTOFF,
            "cortes": {"nascimentos_e_demais": CUTOFF, "obitos": DEATH_CUTOFF, "nascidos_ate": BORN_BY}, "ultima_consulta": max(dates, default=""), "nomes": ordered_names, "paginas": ordered_pages}
    report = {"entradas": {"nomes": len(names), "paginas": len(pages)},
              "exportadas": {"nomes": len(ordered_names), "paginas": len(ordered_pages)},
              "consultas_repetidas_agrupadas": len(pages) - sum(e["arquivo"] == "paginas" for e in excluded) - len(ordered_pages),
              "excluidas_por_motivo": dict(Counter(e["motivo"] for e in excluded)), "excluidas": excluded}
    return data, report


def differences(before: dict, after: dict) -> dict:
    result = {}
    for group in ("nomes", "paginas"):
        old = {r["id"]: r for r in before.get(group, [])}
        new = {r["id"]: r for r in after[group]}
        result[group] = {
            "novas": sorted(new.keys() - old.keys()), "removidas": sorted(old.keys() - new.keys()),
            "alteradas": sorted(k for k in old.keys() & new.keys() if old[k] != new[k]),
        }
    return result


def serializar(data: dict) -> dict[str, str]:
    """Os três arquivos públicos. JSON estável (chaves ordenadas) para que o diff do git diga a verdade."""
    meta = {"versao": data["versao"], "cortes": data["cortes"], "ultima_consulta": data["ultima_consulta"],
            "gerado_em": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "totais": {"nomes": len(data["nomes"]), "paginas": len(data["paginas"])}}
    dump = lambda obj: json.dumps(obj, ensure_ascii=False, indent=1, sort_keys=True) + "\n"
    return {"nomes.json": dump(data["nomes"]), "paginas.json": dump(data["paginas"]),
            "meta.json": dump({"registros-vistos": meta})}


def carregar_anterior(destino: Path) -> dict:
    anterior = {}
    for grupo in ("nomes", "paginas"):
        arquivo = destino / f"{grupo}.json"
        anterior[grupo] = json.loads(arquivo.read_text(encoding="utf-8")) if arquivo.exists() else []
    return anterior


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--acervo", type=Path, default=ROOT.parent / "family-research", help="pasta raiz do acervo privado")
    parser.add_argument("--verificar", action="store_true", help="confere a atualização sem gravar; sai com 1 se houver diferenças")
    parser.add_argument("--relatorio", type=Path, default=None,
                        help="onde gravar o relatório detalhado (padrão: no acervo, registros-vistos/relatorio-exportacao-compendium.json)")
    args = parser.parse_args()
    source = args.acervo / "01 Indice" / "registros-vistos"
    if not source.is_dir():
        raise ValueError(f"Pasta do acervo não encontrada: {source}")
    notes = json.loads(NOTAS.read_text(encoding="utf-8"))
    if not isinstance(notes, dict) or not all(re.fullmatch(r"L-\d+", k) and isinstance(v, str) for k, v in notes.items()):
        raise ValueError("Notas públicas devem ser um mapa de identificadores para textos revisados.")
    selection_file = source / "publicacao.json"
    selection = json.loads(selection_file.read_text(encoding="utf-8")) if selection_file.exists() else {}
    if not isinstance(selection, dict):
        raise ValueError("A seleção privada de publicação deve ser um objeto JSON.")
    data, report = export(source, notes, selection)
    report["mudancas"] = differences(carregar_anterior(DESTINO), data)
    arquivos = serializar(data)
    # meta.json carrega a data de geração; compara-se só o conteúdo que importa.
    desatualizado = any(not (DESTINO / nome).exists() or (DESTINO / nome).read_text(encoding="utf-8") != conteudo
                        for nome, conteudo in arquivos.items() if nome != "meta.json")
    for group, title in (("nomes", "Ocorrências"), ("paginas", "Páginas")):
        delta = report["mudancas"][group]
        print(f"{title}: {len(data[group])} exportadas; {len(delta['novas'])} novas, {len(delta['alteradas'])} alteradas, {len(delta['removidas'])} removidas.")
    print(f"Consultas repetidas agrupadas: {report['consultas_repetidas_agrupadas']}.")
    for reason, count in sorted(report["excluidas_por_motivo"].items()):
        print(f"Fora da exportação: {count} — {reason}.")
    if args.verificar:
        print("Exportação desatualizada." if desatualizado else "src/content/registros-vistos atualizado; exportação reproduzível.")
        return int(desatualizado)
    DESTINO.mkdir(parents=True, exist_ok=True)
    for nome, conteudo in arquivos.items():
        (DESTINO / nome).write_text(conteudo, encoding="utf-8")
    relatorio = args.relatorio or (source / "relatorio-exportacao-compendium.json")
    relatorio.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Dados gravados em {DESTINO.relative_to(ROOT)}/ ({'com' if desatualizado else 'sem'} alterações).")
    print(f"Relatório detalhado (privado, fora do repositório): {relatorio}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, csv.Error) as error:
        print(f"Exportação interrompida: {error}", file=sys.stderr)
        sys.exit(2)
