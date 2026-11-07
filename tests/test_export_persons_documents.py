"""Checks of the scope and the privacy of Persons and Documents, with a fictional archive."""
import importlib.util
import json
import tempfile
import textwrap
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("export_persons_documents", Path(__file__).resolve().parents[1] / "scripts" / "export_persons_documents.py")
exporter = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(exporter)

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
Seconda riga.
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


class Archive(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "01 Indice").mkdir()
        (self.root / "02 Documentos" / "Italia - Fictio").mkdir(parents=True)
        self.persons = PERSONS
        self.sheets = {"a.md": FICHA_NASC_ANTONIO, "b.md": FICHA_NASC_LUIGI, "c.md": FICHA_BR_1905,
                       "d.md": FICHA_OBITO_1930, "e.md": FICHA_NASC_1930, "n.md": FICHA_NEG}

    def export(self, selection=None):
        (self.root / "01 Indice" / "persons.yaml").write_text(textwrap.dedent(self.persons), "utf-8")
        for name, content in self.sheets.items():
            (self.root / "02 Documentos" / "Italia - Fictio" / name).write_text(content, "utf-8")
        return exporter.export(self.root, selection)

    def person(self, data, pid):
        return next(p for p in data["persons"] if p["id"] == pid)

    def test_scope_and_privacy_of_persons(self):
        data, report = self.export()
        ids = {p["id"] for p in data["persons"]}
        self.assertEqual(ids, {"P-fictio-antonio-1849", "P-fictio-luigi-1881", "P-testemunha-giuseppe"})
        self.assertIn("born after 1925", report["persons"]["excluded"]["P-vivo-ramon-1990"])
        self.assertIn("out of scope", report["persons"]["excluded"]["P-brasil-joao-1905"])
        self.assertIn("no birth date", report["persons"]["excluded"]["P-semdoc-maria"])
        self.assertIn("P-indeterminada-rosa", report["persons"]["birth_country_undetermined"])

    def test_names_of_excluded_persons_do_not_leak(self):
        data, _ = self.export()
        texto = json.dumps(data, ensure_ascii=False)
        for proibido in ("Ramon Vivo", "João Brasil", "SEGREDO", "/Users/", "interno", "Maria Semdoc"):
            self.assertNotIn(proibido, texto, proibido)
        luigi = self.person(data, "P-fictio-luigi-1881")
        self.assertEqual([r["type"] for r in luigi["relations"]], ["father"])  # the Brazilian child does not appear

    def test_public_summary_comes_from_its_own_field(self):
        data, report = self.export()
        self.assertEqual(self.person(data, "P-fictio-antonio-1849")["public_summary"], "Carpinteiro em Laganadi; pai de Luigi.")
        self.assertEqual(self.person(data, "P-testemunha-giuseppe")["public_summary"], "")
        self.assertEqual(report["persons"]["without_public_summary"], ["P-testemunha-giuseppe"])

    def test_relations_carry_confidence_and_document(self):
        data, _ = self.export()
        antonio = self.person(data, "P-fictio-antonio-1849")
        filhos = [r for r in antonio["relations"] if r["type"] == "child"]
        self.assertEqual(filhos, [{"type": "child", "person": "P-fictio-luigi-1881", "confidence": "certain", "documents": ["IT-FIC-002"]}])
        self.assertEqual(antonio["birth"]["documents"], ["IT-FIC-001"])
        self.assertEqual(antonio["death"]["confidence"], "probable")

    def test_appearances_carry_what_the_clerk_wrote(self):
        data, _ = self.export()
        antonio = self.person(data, "P-fictio-antonio-1849")
        ap = next(a for a in antonio["appearances"] if a["document"] == "IT-FIC-002")
        self.assertEqual(ap["age"], 32)
        self.assertEqual(ap["occupation"], "falegname")
        self.assertFalse(ap["literate"])
        self.assertEqual(ap["roles"], ["declarante", "pai"])

    def test_documents_cutoffs_and_transcription(self):
        data, report = self.export()
        ids = {d["id"] for d in data["documents"]}
        self.assertEqual(ids, {"IT-FIC-001", "IT-FIC-002", "IT-FIC-003"})
        self.assertIn("document of a person out of scope", report["documents"]["excluded"]["BR-FIC-001"])
        self.assertIn("after the", report["documents"]["excluded"]["IT-FIC-004"])
        death = next(d for d in data["documents"] if d["id"] == "IT-FIC-003")
        self.assertNotIn("INTEGRAL", death["transcription"])
        self.assertIn("di anni 81", death["transcription"])
        self.assertEqual([p["name_as_written"] for p in death["persons"]], ["Antonio Fictio"])  # living declarant omitted
        self.assertEqual(death["persons"][0]["confidence"], "probable")
        luigi = next(d for d in data["documents"] if d["id"] == "IT-FIC-002")
        self.assertIn("Numero Trenta", luigi["transcription"])
        self.assertEqual(luigi["type_raw"], "")
        self.assertEqual([n["name_as_written"] for n in luigi["transcribed_names"]], ["Angelo Misiano"])
        self.assertIn("Numero Trenta — Luigi Fictio.\nSeconda riga.", luigi["transcription"])
        self.assertIn("trentadue", luigi["caveats"])
        self.assertNotIn("04 Pesquisa", luigi["caveats"])
        self.assertEqual(luigi["url"], "https://antenati.cultura.gov.it/ark:/12657/an_ua2/y")
        self.assertEqual(luigi["reference"], "Nati · 1881 · ato n.º 30")

    def test_late_death_without_proven_birth_is_excluded(self):
        self.sheets["d.md"] = FICHA_OBITO_1930.replace("age: 81", "sex: M")
        self.persons = self.persons.replace('    death: { date: "<1920", confidence: probable, basis: "«fu» em IT-FIC-002" }\n', "")
        self.persons = self.persons.replace('birth: { date: "1849-03-01", place: Laganadi, confidence: certain, basis: "IT-FIC-001, ato 3/1849" }',
                                            'birth: { place: Laganadi, confidence: stated, basis: "sem data" }')
        # without birth date and death, Antonio still enters through the adult appearance of 1881
        data, report = self.export()
        self.assertIn("IT-FIC-003", report["documents"]["excluded"])

    def test_line_is_required(self):
        self.persons = self.persons.replace("    line: rede\n    summary: \"só aparece como testemunha\"", "    summary: \"só aparece como testemunha\"")
        with self.assertRaisesRegex(ValueError, "line"):
            self.export()

    def test_private_path_in_basis_aborts(self):
        self.persons = self.persons.replace('basis: "IT-FIC-002 (ato 30)"', 'basis: "ver /Users/rsorage/x.md"')
        with self.assertRaisesRegex(ValueError, "Private content"):
            self.export()

    def test_private_selection(self):
        data, _ = self.export({"publish_persons": ["P-indeterminada-rosa"], "hide_persons": ["P-testemunha-giuseppe"]})
        ids = {p["id"] for p in data["persons"]}
        self.assertIn("P-indeterminada-rosa", ids)
        self.assertNotIn("P-testemunha-giuseppe", ids)
        with self.assertRaisesRegex(ValueError, "Unknown key"):
            self.export({"publicar_pessoas": []})

    def test_immigrant_documented_only_in_brazil_is_not_brazilian(self):
        self.persons += """
  - id: P-imigrante-lazzaro-1864
    display_name: "Lazzaro Imigrante"
    sex: M
    line: vecchia
    birth: { date: "~1864", confidence: stated, basis: "33 anos em 1897 (BR-FIC-002)" }
    summary: "interno"
"""
        self.sheets["f.md"] = FICHA_BR_1905.replace("BR-FIC-001", "BR-FIC-002").replace("record_type: birth", "record_type: passenger_list").replace(
            "date_event: 1905-05-05", "date_event: 1897-11-15").replace(
            'name_as_written: "João Brasil", roles: [subject], declares: { sex: M }, same_as: P-brasil-joao-1905',
            'name_as_written: "Lazzaro Imigrante", roles: [subject, household_head], declares: { sex: M, age: 33, birth_place_raw: "Fredossi [não identificado]" }, same_as: P-imigrante-lazzaro-1864').replace(
            "subject: P-brasil-joao-1905, relation: child_of, object: P-fictio-luigi-1881", "subject: P-imigrante-lazzaro-1864, relation: spouse_of, object: P-fictio-luigi-1881")
        _, report = self.export()
        self.assertIn("P-imigrante-lazzaro-1864", report["persons"]["birth_country_undetermined"])
        data, _ = self.export({"publish_persons": ["P-imigrante-lazzaro-1864"]})
        self.assertIn("P-imigrante-lazzaro-1864", {p["id"] for p in data["persons"]})

    def test_bare_ark_in_reference_becomes_official_link(self):
        self.assertEqual(exporter.public_link({"reference": "Nati 1881, bookmark permanente ark:/12657/an_ua16430014/LepKnZD; serviço IIIF"}),
                         ("https://antenati.cultura.gov.it/ark:/12657/an_ua16430014/LepKnZD", "Portale Antenati"))
        self.assertEqual(exporter.public_link({"reference": "FamilySearch ark:/61903/3:1:3Q9M-C9YN-X3SG-M, imagem 1726."})[0],
                         "https://www.familysearch.org/ark:/61903/3:1:3Q9M-C9YN-X3SG-M")
        self.assertIsNone(exporter.public_link({"reference": "https://evil.example/ark:/12657/x"}))

    def test_anchors_inferred_parents_and_citation_by_reference(self):
        # Granddaughter (b. 1922, deceased), daughter of Luigi and of a woman with no dates at all, whose father has none either.
        self.persons += """
  - id: P-fictio-neta-1922
    display_name: "Neta Fictio"
    sex: F
    line: suraci
    birth: { date: "1922-08-06", place: "Carangola (MG)", confidence: certain, basis: "BR-FIC-003" }
    death: { date: "2004-12-09", confidence: certain, basis: "certidão" }
    summary: "interno"
  - id: P-semdata-mae
    display_name: "Mãe Semdata"
    sex: F
    line: rede
    needs_research: true
    summary: "interno"
  - id: P-semdata-avo
    display_name: "Avô Semdata"
    sex: M
    line: rede
    summary: "interno"
"""
        self.sheets["g.md"] = """---
id: BR-FIC-003
record_type: marriage
jurisdiction: civil
place: { comune: "Patrocínio do Muriaé", province: MG, country: BR }
register: { series: "Casamentos", year: 1945, act: 7 }
date_event: 1945-06-27
source: { repository: cartorio, reference: "livro 9" }
personas:
  - { id: p1, name_as_written: "Neta Fictio", roles: [subject, spouse], declares: { sex: F, birth_date: 1922-08-06 }, same_as: P-fictio-neta-1922, confidence: certain }
  - { id: p2, name_as_written: "Luiz Fictio", roles: [father], declares: { sex: M }, same_as: P-fictio-luigi-1881, confidence: certain }
  - { id: p3, name_as_written: "Mãe Semdata", roles: [mother], declares: { sex: F }, same_as: P-semdata-mae, confidence: certain }
  - { id: p4, name_as_written: "Pessoa Viva", roles: [witness], declares: { sex: M } }
asserts:
  - { subject: P-fictio-neta-1922, relation: child_of, object: P-fictio-luigi-1881, confidence: certain }
  - { subject: P-fictio-neta-1922, relation: child_of, object: P-semdata-mae, confidence: certain }
  - { subject: P-semdata-mae, relation: spouse_of, object: P-fictio-luigi-1881, confidence: certain }
---

# BR-FIC-003 — casamento de 1945
"""
        self.sheets["h.md"] = """---
id: BR-FIC-004
record_type: other
record_type_raw: "perfis da Árvore Familiar do FamilySearch"
jurisdiction: other
jurisdiction_raw: "árvore colaborativa"
place: { comune: "Rio de Janeiro", province: RJ, country: BR }
date_recorded: 2026-11-07
source: { repository: familysearch, reference: "perfil X" }
personas:
  - { id: p1, name_as_written: "Mãe Semdata", roles: [subject], declares: { sex: F }, same_as: P-semdata-mae, confidence: certain }
  - { id: p2, name_as_written: "Avô Semdata", roles: [father], declares: { sex: M }, same_as: P-semdata-avo, confidence: stated }
asserts:
  - { subject: P-semdata-mae, relation: child_of, object: P-semdata-avo, confidence: stated }
---

# BR-FIC-004 — árvore
"""
        selection = {"publish_persons": ["P-fictio-neta-1922", "P-semdata-mae", "P-semdata-avo"],
                     "anchors": {"P-fictio-neta-1922": {"label": "Minha avó"}}}
        data, report = self.export(selection)
        ids = {p["id"] for p in data["persons"]}
        self.assertIn("P-semdata-mae", ids)   # mother of someone born in 1922
        self.assertIn("P-semdata-avo", ids)   # the mother's father — propagation
        neta = self.person(data, "P-fictio-neta-1922")
        self.assertEqual(neta["anchor"], {"label": "Minha avó"})
        self.assertTrue(neta["no_dossier"])
        self.assertEqual(neta["cutoff_basis"], "nascimento em 1922")
        mae = self.person(data, "P-semdata-mae")
        self.assertTrue(mae["needs_research"])
        self.assertIn("pai/mãe de Neta Fictio", mae["cutoff_basis"])
        # the documents of 1945 and 2026 are NOT published…
        self.assertNotIn("BR-FIC-003", {d["id"] for d in data["documents"]})
        self.assertNotIn("BR-FIC-004", {d["id"] for d in data["documents"]})
        # …but the relations up to the anchor and her parents cite them by reference
        father = next(r for r in neta["relations"] if r["type"] == "father")
        self.assertEqual(father["documents"], [])
        self.assertEqual(father["reference"], "casamento, Patrocínio do Muriaé, MG, 1945 — registro civil, não publicado")
        grandfather = next(r for r in mae["relations"] if r["type"] == "father")
        self.assertIn("árvore do FamilySearch (fonte secundária), Rio de Janeiro, RJ, 2026", grandfather["reference"])
        self.assertNotIn("Pessoa Viva", json.dumps(data, ensure_ascii=False))
        # the Luigi→granddaughter relation appears on both sides
        luigi = self.person(data, "P-fictio-luigi-1881")
        self.assertIn("P-fictio-neta-1922", [r["person"] for r in luigi["relations"] if r["type"] == "child"])

    def test_without_anchor_unpublished_document_is_not_cited(self):
        self.sheets["g.md"] = """---
id: BR-FIC-005
record_type: death
jurisdiction: civil
place: { comune: "Carangola", province: MG, country: BR }
date_event: 1960-01-01
source: { repository: cartorio, reference: "x" }
personas:
  - { id: p1, name_as_written: "Giuseppe Testemunha", roles: [subject], declares: { sex: M, age: 100 }, same_as: P-testemunha-giuseppe, confidence: certain }
  - { id: p2, name_as_written: "Antonio Fictio", roles: [father], declares: { sex: M }, same_as: P-fictio-antonio-1849, confidence: certain }
asserts:
  - { subject: P-testemunha-giuseppe, relation: child_of, object: P-fictio-antonio-1849, confidence: certain }
---

# BR-FIC-005
"""
        # the Brazilian document makes Giuseppe's country undetermined; he enters through the selection, but without an anchor nothing cites it
        data, _ = self.export({"publish_persons": ["P-testemunha-giuseppe"]})
        giuseppe = self.person(data, "P-testemunha-giuseppe")
        self.assertEqual(giuseppe["relations"], [])

    def test_archive_is_not_changed(self):
        self.export()
        before = {p: p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        exporter.export(self.root)
        self.assertEqual(before, {p: p.read_bytes() for p in self.root.rglob("*") if p.is_file()})


if __name__ == "__main__":
    unittest.main()
