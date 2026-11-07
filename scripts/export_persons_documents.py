#!/usr/bin/env python3
"""Export of the private archive to the public Persons and Documents data.

Reads `01 Indice/persons.yaml` (the conclusions) and the YAML front matter of the
record sheets in `02 Documentos/**/*.md` (the evidence: personas and asserts),
applies the scope and the publication rules, and writes `src/content/persons.json`
and `src/content/documents.json`, which the Astro build validates again.

Scope (Ramon's decision, 2026-11-06): «up to the Italians» — whoever was born in
Italy (or, with no birthplace, whoever is documented only there) is published, and
from there upwards without limit; people born in Brazil wait for another phase.

Privacy (the same rules as the site, 2026-10-14 and 2026-10-26):
- nobody born after 1925; without a birth date a person only enters if they have a
  recorded death, appear as an adult in a document up to 1925, or are the parent of
  someone who passes one of these rules (2026-11-07);
- anchors (2026-11-07): the couple where the two lines meet, named in
  `publicacao-pessoas.json` › `anchors`, enters with a label («Meu avô») and no
  dossier; the relations reaching the anchors and their parents may cite BY REFERENCE
  an unpublished document (type, place, year) — no page, no transcription;
- documents: births and everything else up to 1925; deaths up to 1955, only of people
  born by 1925; full transcription only for documents up to 1925;
- no image, no file path, no personal document number;
- each person's presentation text is the hand-written `public_summary` field of
  persons.yaml; the internal `summary` is NEVER exported.

    python3 scripts/export_persons_documents.py [--archive /path] [--check]

Requires PyYAML. Does not change the archive, does not commit, does not publish.
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
    sys.stderr.write("PyYAML not found: pip install pyyaml\n")
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "src" / "content"

# The private-content sweep and the portal list are the ones of export_records.py.
_spec = importlib.util.spec_from_file_location("export_records", ROOT / "scripts" / "export_records.py")
records = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(records)

CUTOFF = 1925
DEATH_CUTOFF = 1955
FRONT_MATTER_RE = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)", re.S)
DOCUMENT_ID_RE = re.compile(r"\b(?:IT|BR|UY|US)-[A-Z]{3}-\d{3}[a-z]?\b")
LINES = {"suraci", "cardillo", "marsicano", "vecchia", "rede"}

# Archive confidence vocabulary, published as is (best first); «rejected» is never published.
CONFIDENCES = ("certain", "stated", "probable", "doubtful")

DEATH_TYPES = {"death", "burial"}
# Archive record_type values that may be published (the site labels them by country).
RECORD_TYPES = {"birth", "baptism", "marriage", "marriage_banns", "marriage_file", "parish_marriage", "death", "burial",
                "census", "military", "passenger_list", "passport", "notarial", "index", "newspaper", "other"}
# Visitor-facing labels (Portuguese).
JURISDICTION_LABELS = {"civil": "Registro civil", "parish": "Arquivo paroquial", "fiscal": "Catasto", "military": "Leva militar",
                       "notarial": "Notariado", "press": "Imprensa", "other": ""}
ADULT_ROLES = {"father", "mother", "spouse", "declarant", "witness", "official", "signatory", "godparent", "midwife",
               "household_head", "consenting_party", "informant", "neighbor"}
# The «subject» of these record types is an adult by definition.
ADULT_SUBJECT_TYPES = {"marriage", "marriage_banns", "marriage_file", "parish_marriage", "military", "notarial", "passport"}
ROLE_LABELS = {
    "subject": "registrado", "father": "pai", "mother": "mãe", "spouse": "cônjuge", "child": "filho(a)", "sibling": "irmão/irmã",
    "grandparent": "avô/avó", "grandchild": "neto(a)", "relative": "parente", "declarant": "declarante", "witness": "testemunha",
    "official": "oficial", "signatory": "assina", "informant": "informante", "consenting_party": "consente",
    "godparent": "padrinho/madrinha", "midwife": "parteira", "household_head": "chefe do fuoco",
    "household_member": "membro do fuoco", "neighbor": "confinante",
}

# Birthplaces in persons.yaml → country. A place outside this table goes to the report as
# «undetermined» and the person only enters through the private list `publish_persons`.
COUNTRIES = {
    "IT": ["Laganadi", "Padula", "Buonabitacolo", "Casaletto Spartano", "Battaglia", "Vibonati", "Sant'Eufemia d'Aspromonte",
           "Scilla", "Messina", "San Mauro Cilento", "Roccagloriosa", "Lagonegro", "San Giorgio Morgeto", "Casalbuttano",
           "Catanzaro", "Reggio Calabria", "Pellaro", "Tropea", "Podargoni", "Gioiosa Marea", "Cremona", "Genova"],
    "BR": ["Carangola", "Patrocínio do Muriaé", "Rio de Janeiro", "Niterói", "Macaé", "Duque de Caxias", "São Paulo",
           "Juiz de Fora", "Manhuaçu", "Vitória", "Santos", "João Pessoa", "(MG)", "(RJ)", "(SP)", "(PB)", "(ES)"],
    "UY": ["Montevideo", "Montevidéu", "Uruguai"],
    "US": ["USA", "New Jersey", "Ohio", "Cleveland", "New York"],
    "MA": ["Marrocos"],
}


# ---------------------------------------------------------------- helpers

def text(value) -> str:
    return " ".join(str(value if value is not None else "").split())


def year_of(value) -> int | None:
    m = re.search(r"(\d{4})", str(value or ""))
    return int(m[1]) if m else None


def confidence_of(value) -> str | None:
    """Archive confidence (default certain); None for «rejected» or unknown values."""
    c = text(value) or "certain"
    return c if c in CONFIDENCES else None


def public(value: str, where: str) -> str:
    """Text that goes live: no local paths, no personal identifiers (the site's own sweep)."""
    value = text(value)
    if records.PRIVATE_RE.search(value):
        raise ValueError(f"Private content in {where}; review it in the archive.")
    return value


def public_multiline(value: str, where: str) -> str:
    """Like public(), but keeps line breaks (transcriptions and caveats)."""
    lines = [" ".join(l.split()) for l in str(value or "").replace("\r\n", "\n").split("\n")]
    plain = "\n".join(lines).strip()
    public(plain.replace("\n", " "), where)
    return plain


def country_of_place(place: str) -> str | None:
    place = text(place)
    if not place:
        return None
    for country, markers in COUNTRIES.items():
        if any(marker.casefold() in place.casefold() for marker in markers):
            return country
    return None


def read_sheet(path: Path) -> tuple[dict, str] | None:
    try:
        t = path.read_text("utf-8", errors="replace")
    except OSError:
        return None
    m = FRONT_MATTER_RE.match(t)
    if not m:
        return None
    d = yaml.safe_load(m[1])
    if not isinstance(d, dict) or not d.get("id"):
        return None
    return d, t[m.end():]


def section(body: str, pattern: str) -> str:
    """Body of the first «## …» section whose title matches the pattern (regex, without «## »)."""
    m = re.search(r"^## (?:" + pattern + r")[^\n]*\n(.*?)(?=^## |\Z)", body, re.S | re.M | re.I)
    return m[1].strip() if m else ""


def transcription_of(body: str, full: bool) -> str:
    """Full: the first «Transcrição…» section (its code block, if any). Otherwise only the genealogical excerpts."""
    sec = section(body, r"Transcri") if full else section(body, r"Transcrição dos trechos genealógicos")
    if not sec:
        return ""
    blocks = re.findall(r"```[a-z]*\n(.*?)```", sec, re.S)
    if blocks:
        return "\n\n".join(b.rstrip() for b in blocks)
    # no code block: the section text, stripped of local links and file citations
    sec = re.sub(r"\[([^\]]+)\]\(<?[^)>]*>?\)", r"\1", sec)
    return sec.strip()


def caveats_of(body: str) -> str:
    sec = section(body, r"Ressalvas de leitura|Ressalvas")
    sec = re.sub(r"\[([^\]]+)\]\(<?[^)>]*>?\)", r"\1", sec)
    return sec.strip()


def title_of(body: str, id_: str) -> str:
    m = re.search(r"^#[ \t]+(.+?)[ \t]*$", body, re.M)
    if not m:
        return id_
    h = m[1].strip()
    parts = re.split(r"\s+[—–-]\s+", h, maxsplit=1)
    return parts[1].strip() if len(parts) == 2 and parts[0].strip() == id_ else h


def public_link(source: dict) -> tuple[str, str] | None:
    candidates = [text(source.get("url"))]
    ark = text(source.get("ark"))
    if ark.startswith("ark:/"):
        candidates.append("https://antenati.cultura.gov.it/" + ark)
    reference = text(source.get("reference"))
    candidates += re.findall(r"https?://[^\s)\]>\"«»]+", reference)
    # bare arks: «ark:/12657/…» is Antenati, «ark:/61903/…» is FamilySearch
    for bare in re.findall(r"(?<![/\w])ark:/(?:12657|61903)/[A-Za-z0-9_:/.-]+", reference):
        host = "antenati.cultura.gov.it" if bare.startswith("ark:/12657") else "www.familysearch.org"
        candidates.append(f"https://{host}/{bare.rstrip('.,;')}")
    for c in candidates:
        if not c:
            continue
        ok = records.public_url(c)
        if ok:
            return ok
    return None


# ---------------------------------------------------------------- reading the archive

def read_archive(archive: Path) -> tuple[list[dict], list[dict]]:
    data = yaml.safe_load((archive / "01 Indice" / "persons.yaml").read_text("utf-8"))
    persons = data.get("persons") or []
    sheets = []
    for path in sorted((archive / "02 Documentos").rglob("*.md")):
        read = read_sheet(path)
        if not read:
            continue
        d, body = read
        if d.get("record_type") == "negative_search":
            continue
        d["_body"] = body
        d["_folder"] = path.parent.name
        sheets.append(d)
    return persons, sheets


# ---------------------------------------------------------------- rules

def birth_country(p: dict, appearances: list[tuple[dict, dict]]) -> str | None:
    """From the birthplace in persons.yaml; otherwise from the birthplace some record DECLARES for the
    person (declares.birth_place). The country of the documents themselves does not count: an immigrant
    documented only in Brazil was born in Italy. With none of that, undetermined — decided in
    publicacao-pessoas.json."""
    country = country_of_place(text((p.get("birth") or {}).get("place")))
    if country:
        return country
    found = set()
    for _, persona in appearances:
        declared = persona.get("declares") or {}
        for key in ("birth_place", "birth_place_raw"):
            country = country_of_place(text(declared.get(key)))
            if country:
                found.add(country)
    if len(found) == 1:
        return found.pop()
    if found:
        return None
    # No declared place anywhere: whoever is documented only in Italy counts as Italian (witnesses,
    # officials, godparents of Laganadi). A Brazilian document in the mix makes the case undetermined —
    # never «Brazilian»: an immigrant documented only in Brazil was born in Italy.
    document_countries = {text((s.get("place") or {}).get("country")) for s, _ in appearances}
    return "IT" if document_countries == {"IT"} else None


def passes_cutoff(p: dict, appearances: list[tuple[dict, dict]]) -> tuple[bool, str]:
    """(publishable, reason). Rule (a) birth by 1925; (b) recorded death; (c) adult in a document up to 1925."""
    born = year_of((p.get("birth") or {}).get("date"))
    if born is not None:
        return (born <= CUTOFF, "" if born <= CUTOFF else "born after 1925")
    if (p.get("death") or {}).get("date"):
        return True, ""
    for sheet, persona in appearances:
        year = year_of(sheet.get("date_event") or sheet.get("date_recorded"))
        roles = set(persona.get("roles") or [])
        adult = bool(roles & ADULT_ROLES) or ("subject" in roles and text(sheet.get("record_type")) in ADULT_SUBJECT_TYPES)
        if year and year <= CUTOFF and adult:
            return True, ""
    return False, "no birth date, no death and no adult appearance up to 1925"


def public_event(event: dict | None, where: str, published_documents: set[str]) -> dict | None:
    if not event:
        return None
    confidence = confidence_of(event.get("confidence"))
    if not confidence:
        return None
    basis = public(event.get("basis", ""), where)
    out = {"confidence": confidence, "basis": basis,
           "documents": sorted({d for d in DOCUMENT_ID_RE.findall(basis) if d in published_documents})}
    if event.get("date"):
        out["date"] = text(event["date"])
    if event.get("place"):
        out["place"] = public(event["place"], where)
    return out


# Visitor-facing names of record types for citations by reference (Portuguese).
REFERENCE_TYPE_LABELS = {"birth": "nascimento", "baptism": "batismo", "marriage": "casamento", "marriage_banns": "proclamas",
                         "death": "óbito", "burial": "sepultamento", "census": "censo", "newspaper": "jornal", "other": ""}


def unpublished_reference(sheet: dict) -> str:
    """How a document that does NOT go live is cited: only its type, place and year."""
    place = sheet.get("place") or {}
    year = year_of(sheet.get("date_event") or sheet.get("date_recorded"))
    kind = REFERENCE_TYPE_LABELS.get(text(sheet.get("record_type")), "")
    if text(sheet.get("record_type")) == "other":
        raw = text(sheet.get("record_type_raw")).casefold()
        kind = "árvore do FamilySearch (fonte secundária)" if "familysearch" in raw else "documento"
    parts = [kind, ", ".join(v for v in (text(place.get("comune")), text(place.get("province"))) if v), str(year) if year else "s.d."]
    jurisdiction = JURISDICTION_LABELS.get(text(sheet.get("jurisdiction")), "")
    return ", ".join(p for p in parts if p) + (f" — {jurisdiction.casefold()}" if jurisdiction else "") + ", não publicado"


def export(archive: Path, selection: dict | None = None) -> tuple[dict, dict]:
    selection = selection or {}
    if {k for k in selection if not k.startswith("_")} - {"publish_persons", "hide_persons", "hide_documents", "anchors"}:
        raise ValueError("Unknown key in the private publication selection.")
    anchors: dict[str, dict] = selection.get("anchors") or {}
    if not isinstance(anchors, dict) or not all(isinstance(v, dict) and text(v.get("label")) for v in anchors.values()):
        raise ValueError("anchors must map id → {label}.")
    persons_yaml, sheets = read_archive(archive)
    by_id = {p["id"]: p for p in persons_yaml}
    if len(by_id) != len(persons_yaml):
        raise ValueError("Duplicate person identifier in persons.yaml.")

    # appearances: person → [(sheet, persona)]
    appearances: dict[str, list[tuple[dict, dict]]] = defaultdict(list)
    for s in sheets:
        for persona in s.get("personas") or []:
            if persona.get("same_as"):
                appearances[persona["same_as"]].append((s, persona))

    # Parents of someone provably born by 1925 were born earlier still (2026-11-07); the propagation
    # uses every child_of assert, published or not, because it is only an age inference.
    parents_of: dict[str, set[str]] = defaultdict(set)
    for s in sheets:
        for a in s.get("asserts") or []:
            if a.get("relation") == "child_of" and confidence_of(a.get("confidence")):
                parents_of[a.get("subject")].add(a.get("object"))
    cutoff_basis: dict[str, str] = {}
    for p in persons_yaml:
        ok, _ = passes_cutoff(p, appearances.get(p["id"], []))
        if ok:
            born = year_of((p.get("birth") or {}).get("date"))
            cutoff_basis[p["id"]] = f"nascimento em {born}" if born else ("morte registrada" if (p.get("death") or {}).get("date") else "adulto num documento até 1925")
    queue = list(cutoff_basis)
    while queue:
        child = queue.pop()
        for parent in parents_of.get(child, ()):
            if parent in by_id and parent not in cutoff_basis:
                cutoff_basis[parent] = f"pai/mãe de {by_id[child]['display_name']} ({cutoff_basis[child]})"
                queue.append(parent)

    # 1) who gets in
    excluded: dict[str, str] = {}
    published: dict[str, dict] = {}
    undetermined: list[str] = []
    for p in persons_yaml:
        pid = p["id"]
        if pid in selection.get("hide_persons", []):
            excluded[pid] = "hidden by the private selection"
            continue
        line = text(p.get("line"))
        if line not in LINES:
            raise ValueError(f"{pid}: field line missing or invalid ({line!r}); values: {sorted(LINES)}")
        if pid not in cutoff_basis:
            excluded[pid] = passes_cutoff(p, appearances.get(pid, []))[1]
            continue
        if pid not in selection.get("publish_persons", []):
            country = birth_country(p, appearances.get(pid, []))
            if country is None:
                undetermined.append(pid)
                excluded[pid] = "birth country undetermined (decide in publish_persons/hide_persons)"
                continue
            if country != "IT":
                excluded[pid] = f"out of scope: born in {country}"
                continue
        published[pid] = p

    # 2) documents
    published_sheets: dict[str, dict] = {}
    excluded_documents: dict[str, str] = {}
    for s in sheets:
        sid = s["id"]
        if sid in selection.get("hide_documents", []):
            excluded_documents[sid] = "hidden by the private selection"
            continue
        record_type = text(s.get("record_type"))
        year = year_of(s.get("date_event") or s.get("date_recorded"))
        if year is None:
            excluded_documents[sid] = "no date"
            continue
        limit = DEATH_CUTOFF if record_type in DEATH_TYPES else CUTOFF
        if year > limit:
            excluded_documents[sid] = f"after the {limit} cutoff"
            continue
        subjects = [pe for pe in (s.get("personas") or []) if "subject" in (pe.get("roles") or [])]
        if year > CUTOFF:
            # death 1926–1955: only of someone provably born by 1925
            births = []
            for pe in subjects:
                declared = pe.get("declares") or {}
                n = year_of(declared.get("birth_date"))
                if n is None and isinstance(declared.get("age"), int):
                    n = year - declared["age"]
                if n is None and pe.get("same_as") in by_id:
                    n = year_of((by_id[pe["same_as"]].get("birth") or {}).get("date"))
                births.append(n)
            if not births or any(n is None or n > CUTOFF for n in births):
                excluded_documents[sid] = "death after 1925 without a birth proven by 1925"
                continue
        out_of_scope = [pe.get("same_as") for pe in subjects if pe.get("same_as") and pe["same_as"] not in published and pe["same_as"] in by_id]
        if out_of_scope:
            excluded_documents[sid] = "document of a person out of scope: " + ", ".join(out_of_scope)
            continue
        if not any(pe.get("same_as") in published for pe in (s.get("personas") or [])):
            excluded_documents[sid] = "no published person in this document"
            continue
        published_sheets[sid] = s

    # 3) assembling the documents
    documents = []
    for sid, s in sorted(published_sheets.items()):
        source = s.get("source") or {}
        place = s.get("place") or {}
        country = text(place.get("country"))
        record_type = text(s.get("record_type"))
        if record_type not in RECORD_TYPES:
            raise ValueError(f"{sid}: record_type not publishable ({record_type!r}).")
        year = year_of(s.get("date_event") or s.get("date_recorded"))
        register = s.get("register") or {}
        reference = " · ".join(v for v in (
            text(register.get("series")), text(register.get("year")),
            f"parte {register['part']}" if register.get("part") else "",
            f"ato n.º {register['act']}" if register.get("act") else "",
            f"fólio {register['folio']}" if register.get("folio") else "",
            f"livro {register['book']}" if register.get("book") else "",
            f"imagem {register['image']}" if register.get("image") else "",
        ) if v)
        link = public_link(source)
        document_persons, transcribed_names = [], []
        for pe in s.get("personas") or []:
            declared = pe.get("declares") or {}
            roles = [ROLE_LABELS.get(r, r) for r in (pe.get("roles") or [])]
            entry = {"name_as_written": public(pe.get("name_as_written", ""), sid), "roles": roles}
            if isinstance(declared.get("age"), int):
                entry["age"] = declared["age"]
            if declared.get("occupation_raw"):
                entry["occupation"] = public(declared["occupation_raw"], sid)
            if isinstance(declared.get("literate"), bool):
                entry["literate"] = declared["literate"]
            if pe.get("same_as") in published:
                entry["person"] = pe["same_as"]
                entry["confidence"] = confidence_of(pe.get("confidence")) or "certain"
                document_persons.append(entry)
            elif pe.get("same_as") in by_id:
                continue  # person out of scope: not named in the table
            else:
                transcribed_names.append(entry)
        body = s["_body"]
        documents.append({
            "id": sid,
            "title": public(title_of(body, sid), sid),
            "type": record_type,
            "type_raw": public(s.get("record_type_raw") or "", sid),
            "date": text(s.get("date_event") or s.get("date_recorded")),
            "year": year,
            "place": public(", ".join(v for v in (text(place.get("comune")), text(place.get("province"))) if v), sid),
            "country": country,
            "jurisdiction": JURISDICTION_LABELS.get(text(s.get("jurisdiction")), "") or public(s.get("jurisdiction_raw", ""), sid),
            "repository": public(source.get("repository_raw") or source.get("repository", ""), sid),
            "reference": public(reference, sid),
            **({"url": link[0], "portal": link[1]} if link else {}),
            "persons": document_persons,
            "transcribed_names": transcribed_names,
            "transcription": public_multiline(transcription_of(body, full=year <= CUTOFF), sid),
            "caveats": public_multiline(caveats_of(body), sid),
            "lines": sorted({published[pe["person"]]["line"] for pe in document_persons}),
        })
    document_ids = set(published_sheets)

    # 4) assembling the persons
    persons = []
    dropped_relations = 0
    anchor_set = set(anchors)
    for aid in list(anchors):
        anchor_set |= {o for o in parents_of.get(aid, ()) if o in published}
    for aid in list(anchors):
        for o in parents_of.get(aid, ()):
            anchor_set |= {oo for oo in parents_of.get(o, ()) if oo in published}
    sheet_by_id = {s["id"]: s for s in sheets}
    asserts_by_person: dict[str, list] = defaultdict(list)
    for s in sheets:
        for a in s.get("asserts") or []:
            if s["id"] in published_sheets or {a.get("subject"), a.get("object")} & anchor_set:
                asserts_by_person[a.get("subject")].append((s["id"], a))
                asserts_by_person[a.get("object")].append((s["id"], a))
    for pid, p in sorted(published.items()):
        relations = {}
        for sid, a in asserts_by_person.get(pid, []):
            subject, obj, rel = a.get("subject"), a.get("object"), a.get("relation")
            other = obj if subject == pid else subject
            if other not in published:
                dropped_relations += 1
                continue
            confidence = confidence_of(a.get("confidence"))
            if not confidence:
                continue  # rejected: stays in the private graph
            if rel == "child_of":
                if subject == pid:
                    kind = "mother" if text(published[obj].get("sex")) == "F" else "father"
                else:
                    kind = "child"
            elif rel == "spouse_of":
                kind = "spouse"
            elif rel == "sibling_of":
                kind = "sibling"
            else:
                continue
            key = (kind, other)
            current = relations.get(key)
            if sid in published_sheets:
                entry = {"type": kind, "person": other, "confidence": confidence, "documents": [sid]}
            else:
                # citation by reference: type, place and year — no page, no transcription, no names
                entry = {"type": kind, "person": other, "confidence": confidence, "documents": [],
                         "reference": unpublished_reference(sheet_by_id[sid])}
            if a.get("rationale"):
                entry["rationale"] = public(a["rationale"], f"{sid}/asserts")
            if current:
                current["documents"] = sorted(set(current["documents"]) | ({sid} if sid in published_sheets else set()))
                if "reference" in entry and "reference" not in current:
                    current["reference"] = entry["reference"]
                # the published confidence is the best that some document supports
                if CONFIDENCES.index(confidence) < CONFIDENCES.index(current["confidence"]):
                    current["confidence"] = confidence
            else:
                relations[key] = entry
        person_appearances = []
        for s, persona in appearances.get(pid, []):
            if s["id"] not in published_sheets:
                continue
            declared = persona.get("declares") or {}
            item = {"document": s["id"], "name_as_written": public(persona.get("name_as_written", ""), pid),
                    "roles": [ROLE_LABELS.get(r, r) for r in (persona.get("roles") or [])]}
            if isinstance(declared.get("age"), int):
                item["age"] = declared["age"]
            if declared.get("occupation_raw"):
                item["occupation"] = public(declared["occupation_raw"], pid)
            if isinstance(declared.get("literate"), bool):
                item["literate"] = declared["literate"]
            person_appearances.append(item)
        person_appearances.sort(key=lambda i: text(published_sheets[i["document"]].get("date_event") or published_sheets[i["document"]].get("date_recorded")))
        summary = text(p.get("public_summary"))
        persons.append({
            "id": pid,
            "display_name": public(p.get("display_name", ""), pid),
            "aliases": [public(a, pid) for a in (p.get("aliases") or [])],
            "sex": text(p.get("sex")) or "?",
            "line": p["line"],
            **({"birth": public_event(p.get("birth"), f"{pid}/birth", document_ids)} if p.get("birth") else {}),
            **({"death": public_event(p.get("death"), f"{pid}/death", document_ids)} if p.get("death") else {}),
            **({"occupation": public(p["occupation"], pid)} if p.get("occupation") else {}),
            **({"familysearch": text(p["familysearch"])} if p.get("familysearch") else {}),
            "public_summary": public(summary, pid),
            "cutoff_basis": cutoff_basis[pid],
            **({"needs_research": True} if p.get("needs_research") is True else {}),
            **({"anchor": {"label": public(anchors[pid]["label"], pid)}, "no_dossier": True} if pid in anchors else {}),
            "relations": sorted(relations.values(), key=lambda r: (["father", "mother", "spouse", "sibling", "child"].index(r["type"]), r["person"])),
            "appearances": person_appearances,
        })

    report = {
        "persons": {"in_archive": len(persons_yaml), "published": len(persons),
                    "without_public_summary": sorted(p["id"] for p in persons if not p["public_summary"]),
                    "excluded_by_reason": dict(Counter(re.sub(r": .*", "", m) for m in excluded.values())),
                    "excluded": excluded, "birth_country_undetermined": undetermined},
        "documents": {"in_archive": len(sheets), "published": len(documents),
                      "without_public_link": sorted(d["id"] for d in documents if "url" not in d),
                      "without_transcription": sorted(d["id"] for d in documents if not d["transcription"]),
                      "excluded_by_reason": dict(Counter(re.sub(r": .*", "", m) for m in excluded_documents.values())),
                      "excluded": excluded_documents},
        "relations_dropped_for_pointing_to_unpublished_person": dropped_relations,
    }
    data = {"persons": persons, "documents": documents}
    return data, report


def serialize(data: dict) -> dict[str, str]:
    dump = lambda obj: json.dumps(obj, ensure_ascii=False, indent=1, sort_keys=True) + "\n"
    return {"persons.json": dump(data["persons"]), "documents.json": dump(data["documents"])}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--archive", type=Path, default=ROOT.parent / "family-research")
    parser.add_argument("--check", action="store_true", help="only checks; exits 1 if the export is stale")
    parser.add_argument("--report", type=Path, default=None)
    args = parser.parse_args()
    if not (args.archive / "01 Indice" / "persons.yaml").exists():
        raise ValueError(f"persons.yaml not found in {args.archive}")
    selection_file = args.archive / "01 Indice" / "publicacao-pessoas.json"
    selection = json.loads(selection_file.read_text("utf-8")) if selection_file.exists() else {}
    data, report = export(args.archive, selection)
    files = serialize(data)
    stale = any(not (OUTPUT_DIR / n).exists() or (OUTPUT_DIR / n).read_text("utf-8") != c for n, c in files.items())
    r = report
    print(f"Persons: {r['persons']['published']} of {r['persons']['in_archive']} published; without public summary: {len(r['persons']['without_public_summary'])}; birth country undetermined: {len(r['persons']['birth_country_undetermined'])}.")
    for reason, n in sorted(r["persons"]["excluded_by_reason"].items()):
        print(f"  excluded: {n} — {reason}")
    print(f"Documents: {r['documents']['published']} of {r['documents']['in_archive']} published; without public link: {len(r['documents']['without_public_link'])}; without transcription: {len(r['documents']['without_transcription'])}.")
    for reason, n in sorted(r["documents"]["excluded_by_reason"].items()):
        print(f"  excluded: {n} — {reason}")
    if args.check:
        print("Export is stale." if stale else "src/content/persons.json and documents.json are up to date.")
        return int(stale)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, content in files.items():
        (OUTPUT_DIR / name).write_text(content, "utf-8")
    report["generated_on"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    report_file = args.report or (args.archive / "01 Indice" / "export-report-persons-documents.json")
    report_file.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"Data written to {OUTPUT_DIR.relative_to(ROOT)}/. Private report: {report_file}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, yaml.YAMLError) as error:
        print(f"Export aborted: {error}", file=sys.stderr)
        sys.exit(2)
