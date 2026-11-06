"""Verificações do recorte e da privacidade de Pessoas e Documentos, com um acervo fictício."""
import importlib.util
import json
import tempfile
import textwrap
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("exportar_pd", Path(__file__).resolve().parents[1] / "scripts" / "exportar-pessoas-documentos.py")
exportar = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(exportar)

PERSONS = """
version: 1
persons:
  - id: P-fictio-antonio-1849
    display_name: "Antonio Fictio"
    aliases: ["Antonio Fittio"]
    sex: M
    line: suraci
    birth: { date: "1849-03-01", place: Laganadi, confidence: certain, basis: "IT-FIC-001, ato 3/1849" }
    death: { date: "<1920", confidence: probable, basis: "«fu» em IT-FIC-002" }
    occupation: carpenter
    familysearch: ABCD-123
    summary: "SEGREDO INTERNO: conflito registado, ver /Users/pesquisa/nota.md"
    public_summary: "Carpinteiro em Laganadi; pai de Luigi."
  - id: P-fictio-luigi-1881
    display_name: "Luigi Fictio"
    sex: M
    line: suraci
    birth: { date: "1881-12-26", place: Laganadi, confidence: certain, basis: "IT-FIC-002 (ato 30)" }
    summary: "interno"
    public_summary: "Emigrou."
  - id: P-brasil-joao-1905
    display_name: "João Brasil"
    sex: M
    line: suraci
    birth: { date: "1905-05-05", place: "Carangola (MG)", confidence: certain, basis: "BR-FIC-001" }
    summary: "interno"
  - id: P-vivo-ramon-1990
    display_name: "Ramon Vivo"
    sex: M
    line: suraci
    birth: { date: "1990-03-22", confidence: certain, basis: "certidão" }
    summary: "interno"
  - id: P-testemunha-giuseppe
    display_name: "Giuseppe Testemunha"
    sex: M
    line: rede
    summary: "só aparece como testemunha"
  - id: P-semdoc-maria
    display_name: "Maria Semdoc"
    sex: F
    line: rede
    summary: "sem documento nenhum"
  - id: P-indeterminada-rosa
    display_name: "Rosa Indeterminada"
    sex: F
    line: rede
    birth: { date: "~1850", place: "Lugar desconhecido", confidence: stated, basis: "idade declarada" }
    summary: "interno"
"""

FICHA_NASC_ANTONIO = """---
id: IT-FIC-001
record_type: birth
jurisdiction: civil
place: { comune: Laganadi, province: RC, country: IT }
register: { series: "Nati", year: 1849, act: 3 }
date_event: 1849-03-01
source: { repository: antenati, reference: "Nati 1849", url: "https://antenati.cultura.gov.it/ark:/12657/an_ua1/x" }
personas:
  - { id: p1, name_as_written: "Antonio Fictio", roles: [subject], declares: { sex: M }, same_as: P-fictio-antonio-1849, confidence: certain }
asserts: []
---

# IT-FIC-001 — FICTIO Antonio — nascimento

## Transcrição

```text
Antonio Fictio nato il primo marzo 1849.
```
"""

FICHA_NASC_LUIGI = """---
id: IT-FIC-002
record_type: birth
jurisdiction: civil
place: { comune: Laganadi, province: RC, country: IT }
register: { series: "Nati", year: 1881, act: 30 }
date_event: 1881-12-26
source: { repository: antenati, reference: "Nati 1881, pág. 11", url: "https://antenati.cultura.gov.it/ark:/12657/an_ua2/y" }
personas:
  - { id: p1, name_as_written: "Luigi Fictio", roles: [subject], declares: { sex: M, birth_date: 1881-12-26 }, same_as: P-fictio-luigi-1881, confidence: certain }
  - { id: p2, name_as_written: "Antonio Fictio", roles: [declarant, father], declares: { sex: M, age: 32, occupation_raw: "falegname", literate: false }, same_as: P-fictio-antonio-1849, confidence: certain }
  - { id: p3, name_as_written: "Giuseppe Testemunha", roles: [witness], declares: { sex: M, age: 50 }, same_as: P-testemunha-giuseppe, confidence: certain }
  - { id: p4, name_as_written: "Angelo Misiano", roles: [witness], declares: { sex: M, age: 30 } }
asserts:
  - { subject: P-fictio-luigi-1881, relation: child_of, object: P-fictio-antonio-1849, confidence: certain }
---

# IT-FIC-002 — FICTIO Luigi — nascimento, 26/12/1881

## Transcrição (leitura própria)

```text
Numero Trenta — Luigi Fictio.
```

## Ressalvas de leitura

A idade do pai lê-se «trentadue»; ver [nota](<../../04 Pesquisa/x.md>).
"""

FICHA_BR_1905 = """---
id: BR-FIC-001
record_type: birth
jurisdiction: civil
place: { comune: Carangola, province: MG, country: BR }
register: { series: "Nascimentos", year: 1905, act: 12 }
date_event: 1905-05-05
source: { repository: familysearch, reference: "x", url: "https://www.familysearch.org/ark:/61903/3:1:ABC" }
personas:
  - { id: p1, name_as_written: "João Brasil", roles: [subject], declares: { sex: M }, same_as: P-brasil-joao-1905, confidence: certain }
  - { id: p2, name_as_written: "Luiz Fictio", roles: [father, declarant], declares: { sex: M, age: 23 }, same_as: P-fictio-luigi-1881, confidence: certain }
asserts:
  - { subject: P-brasil-joao-1905, relation: child_of, object: P-fictio-luigi-1881, confidence: certain }
---

# BR-FIC-001 — BRASIL João — nascimento

## Transcrição

```text
João, filho de Luiz Fictio.
```
"""

FICHA_OBITO_1930 = """---
id: IT-FIC-003
record_type: death
jurisdiction: civil
place: { comune: Laganadi, province: RC, country: IT }
register: { series: "Morti", year: 1930, act: 4 }
date_event: 1930-02-02
source: { repository: antenati, reference: "Morti 1930", url: "https://antenati.cultura.gov.it/ark:/12657/an_ua3/z" }
personas:
  - { id: p1, name_as_written: "Antonio Fictio", roles: [subject], declares: { sex: M, age: 81 }, same_as: P-fictio-antonio-1849, confidence: probable, rationale: "idade bate com 1849" }
  - { id: p2, name_as_written: "Ramon Vivo", roles: [declarant], declares: { sex: M }, same_as: P-vivo-ramon-1990, confidence: certain }
asserts: []
---

# IT-FIC-003 — FICTIO Antonio — óbito, 1930

## Transcrição

```text
INTEGRAL NÃO PUBLICÁVEL
```

## Transcrição dos trechos genealógicos

```text
Antonio Fictio, di anni 81.
```
"""

FICHA_NASC_1930 = """---
id: IT-FIC-004
record_type: birth
jurisdiction: civil
place: { comune: Laganadi, province: RC, country: IT }
register: { series: "Nati", year: 1930, act: 9 }
date_event: 1930-01-01
source: { repository: antenati, reference: "Nati 1930", url: "https://antenati.cultura.gov.it/ark:/12657/an_ua4/w" }
personas:
  - { id: p1, name_as_written: "Nascido Tarde", roles: [subject], declares: { sex: M } }
asserts: []
---

# IT-FIC-004 — nascimento de 1930
"""

FICHA_NEG = """---
id: NEG-001
record_type: negative_search
jurisdiction: civil
place: { comune: Laganadi, province: RC, country: IT }
source: { repository: antenati, reference: "x" }
personas: []
---

# NEG-001 — busca negativa
"""


class Acervo(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.raiz = Path(self.temp.name)
        (self.raiz / "01 Indice").mkdir()
        (self.raiz / "02 Documentos" / "Italia - Fictio").mkdir(parents=True)
        self.persons = PERSONS
        self.fichas = {"a.md": FICHA_NASC_ANTONIO, "b.md": FICHA_NASC_LUIGI, "c.md": FICHA_BR_1905,
                       "d.md": FICHA_OBITO_1930, "e.md": FICHA_NASC_1930, "n.md": FICHA_NEG}

    def exportar(self, selecao=None):
        (self.raiz / "01 Indice" / "persons.yaml").write_text(textwrap.dedent(self.persons), "utf-8")
        for nome, conteudo in self.fichas.items():
            (self.raiz / "02 Documentos" / "Italia - Fictio" / nome).write_text(conteudo, "utf-8")
        return exportar.exportar(self.raiz, selecao)

    def pessoa(self, dados, pid):
        return next(p for p in dados["pessoas"] if p["id"] == pid)

    def test_recorte_e_privacidade_das_pessoas(self):
        dados, rel = self.exportar()
        ids = {p["id"] for p in dados["pessoas"]}
        self.assertEqual(ids, {"P-fictio-antonio-1849", "P-fictio-luigi-1881", "P-testemunha-giuseppe"})
        self.assertIn("nascimento depois de 1925", rel["pessoas"]["excluidas"]["P-vivo-ramon-1990"])
        self.assertIn("fora do recorte", rel["pessoas"]["excluidas"]["P-brasil-joao-1905"])
        self.assertIn("sem data", rel["pessoas"]["excluidas"]["P-semdoc-maria"])
        self.assertIn("P-indeterminada-rosa", rel["pessoas"]["pais_indeterminado"])

    def test_nomes_de_pessoas_excluidas_nao_vazam(self):
        dados, _ = self.exportar()
        texto = json.dumps(dados, ensure_ascii=False)
        for proibido in ("Ramon Vivo", "João Brasil", "SEGREDO", "/Users/", "interno", "Maria Semdoc"):
            self.assertNotIn(proibido, texto, proibido)
        luigi = self.pessoa(dados, "P-fictio-luigi-1881")
        self.assertEqual([r["tipo"] for r in luigi["relacoes"]], ["pai"])  # o filho brasileiro não aparece

    def test_resumo_publico_vem_do_campo_novo(self):
        dados, rel = self.exportar()
        self.assertEqual(self.pessoa(dados, "P-fictio-antonio-1849")["resumo"], "Carpinteiro em Laganadi; pai de Luigi.")
        self.assertEqual(self.pessoa(dados, "P-testemunha-giuseppe")["resumo"], "")
        self.assertEqual(rel["pessoas"]["sem_resumo_publico"], ["P-testemunha-giuseppe"])

    def test_relacoes_carregam_firmeza_e_documento(self):
        dados, _ = self.exportar()
        antonio = self.pessoa(dados, "P-fictio-antonio-1849")
        filhos = [r for r in antonio["relacoes"] if r["tipo"] == "filho"]
        self.assertEqual(filhos, [{"tipo": "filho", "pessoa": "P-fictio-luigi-1881", "firmeza": "certa", "documentos": ["IT-FIC-002"]}])
        self.assertEqual(antonio["nascimento"]["documentos"], ["IT-FIC-001"])
        self.assertEqual(antonio["morte"]["firmeza"], "provavel")

    def test_aparicoes_trazem_o_que_o_escrivao_escreveu(self):
        dados, _ = self.exportar()
        antonio = self.pessoa(dados, "P-fictio-antonio-1849")
        ap = next(a for a in antonio["aparece_em"] if a["documento"] == "IT-FIC-002")
        self.assertEqual(ap["idade"], 32)
        self.assertEqual(ap["oficio"], "falegname")
        self.assertFalse(ap["assina"])
        self.assertEqual(ap["papeis"], ["declarante", "pai"])

    def test_documentos_cortes_e_transcricao(self):
        dados, rel = self.exportar()
        ids = {d["id"] for d in dados["documentos"]}
        self.assertEqual(ids, {"IT-FIC-001", "IT-FIC-002", "IT-FIC-003"})
        self.assertIn("documento de pessoa fora do recorte", rel["documentos"]["excluidos"]["BR-FIC-001"])
        self.assertIn("depois do corte", rel["documentos"]["excluidos"]["IT-FIC-004"])
        obito = next(d for d in dados["documentos"] if d["id"] == "IT-FIC-003")
        self.assertNotIn("INTEGRAL", obito["transcricao"])
        self.assertIn("di anni 81", obito["transcricao"])
        self.assertEqual([p["nome_escrito"] for p in obito["pessoas"]], ["Antonio Fictio"])  # declarante vivo omitido
        self.assertEqual(obito["pessoas"][0]["firmeza"], "provavel")
        luigi = next(d for d in dados["documentos"] if d["id"] == "IT-FIC-002")
        self.assertIn("Numero Trenta", luigi["transcricao"])
        self.assertEqual([n["nome_escrito"] for n in luigi["nomes_transcritos"]], ["Angelo Misiano"])
        self.assertIn("trentadue", luigi["ressalvas"])
        self.assertNotIn("04 Pesquisa", luigi["ressalvas"])
        self.assertEqual(luigi["url"], "https://antenati.cultura.gov.it/ark:/12657/an_ua2/y")
        self.assertEqual(luigi["referencia"], "Nati · 1881 · ato n.º 30")

    def test_obito_tardio_sem_nascimento_comprovado_fica_fora(self):
        self.fichas["d.md"] = FICHA_OBITO_1930.replace("age: 81", "sex: M")
        self.persons = self.persons.replace('    death: { date: "<1920", confidence: probable, basis: "«fu» em IT-FIC-002" }\n', "")
        self.persons = self.persons.replace('birth: { date: "1849-03-01", place: Laganadi, confidence: certain, basis: "IT-FIC-001, ato 3/1849" }',
                                            'birth: { place: Laganadi, confidence: stated, basis: "sem data" }')
        # sem data de nascimento e sem morte, Antonio ainda entra pela aparição adulta de 1881
        dados, rel = self.exportar()
        self.assertIn("IT-FIC-003", rel["documentos"]["excluidos"])

    def test_line_obrigatorio(self):
        self.persons = self.persons.replace("    line: rede\n    summary: \"só aparece como testemunha\"", "    summary: \"só aparece como testemunha\"")
        with self.assertRaisesRegex(ValueError, "line"):
            self.exportar()

    def test_caminho_privado_na_base_interrompe(self):
        self.persons = self.persons.replace('basis: "IT-FIC-002 (ato 30)"', 'basis: "ver /Users/rsorage/x.md"')
        with self.assertRaisesRegex(ValueError, "privado"):
            self.exportar()

    def test_selecao_privada(self):
        dados, _ = self.exportar({"publicar_pessoas": ["P-indeterminada-rosa"], "ocultar_pessoas": ["P-testemunha-giuseppe"]})
        ids = {p["id"] for p in dados["pessoas"]}
        self.assertIn("P-indeterminada-rosa", ids)
        self.assertNotIn("P-testemunha-giuseppe", ids)
        with self.assertRaisesRegex(ValueError, "Chave"):
            self.exportar({"publicar": []})

    def test_imigrante_documentado_so_no_brasil_nao_vira_brasileiro(self):
        self.persons += """
  - id: P-imigrante-lazzaro-1864
    display_name: "Lazzaro Imigrante"
    sex: M
    line: vecchia
    birth: { date: "~1864", confidence: stated, basis: "33 anos em 1897 (BR-FIC-002)" }
    summary: "interno"
"""
        self.fichas["f.md"] = FICHA_BR_1905.replace("BR-FIC-001", "BR-FIC-002").replace("record_type: birth", "record_type: passenger_list").replace(
            "date_event: 1905-05-05", "date_event: 1897-11-15").replace(
            'name_as_written: "João Brasil", roles: [subject], declares: { sex: M }, same_as: P-brasil-joao-1905',
            'name_as_written: "Lazzaro Imigrante", roles: [subject, household_head], declares: { sex: M, age: 33, birth_place_raw: "Fredossi [não identificado]" }, same_as: P-imigrante-lazzaro-1864').replace(
            "subject: P-brasil-joao-1905, relation: child_of, object: P-fictio-luigi-1881", "subject: P-imigrante-lazzaro-1864, relation: spouse_of, object: P-fictio-luigi-1881")
        _, rel = self.exportar()
        self.assertIn("P-imigrante-lazzaro-1864", rel["pessoas"]["pais_indeterminado"])
        dados, _ = self.exportar({"publicar_pessoas": ["P-imigrante-lazzaro-1864"]})
        self.assertIn("P-imigrante-lazzaro-1864", {p["id"] for p in dados["pessoas"]})

    def test_ark_solto_na_referencia_vira_link_oficial(self):
        self.assertEqual(exportar.link_publico({"reference": "Nati 1881, bookmark permanente ark:/12657/an_ua16430014/LepKnZD; serviço IIIF"}),
                         ("https://antenati.cultura.gov.it/ark:/12657/an_ua16430014/LepKnZD", "Portale Antenati"))
        self.assertEqual(exportar.link_publico({"reference": "FamilySearch ark:/61903/3:1:3Q9M-C9YN-X3SG-M, imagem 1726."})[0],
                         "https://www.familysearch.org/ark:/61903/3:1:3Q9M-C9YN-X3SG-M")
        self.assertIsNone(exportar.link_publico({"reference": "https://evil.example/ark:/12657/x"}))

    def test_acervo_nao_e_alterado(self):
        self.exportar()
        antes = {p: p.read_bytes() for p in self.raiz.rglob("*") if p.is_file()}
        exportar.exportar(self.raiz)
        self.assertEqual(antes, {p: p.read_bytes() for p in self.raiz.rglob("*") if p.is_file()})


if __name__ == "__main__":
    unittest.main()
