#!/usr/bin/env python3
"""Export of the private archive to the public «Registros vistos» data.

Reads `01 Indice/registros-vistos/{linhas-transcritas,mapa-imagens}.csv` from the
archive, applies the publication rules (cutoffs by record type, accepted portals,
the private selection `publicacao.json`, a sweep for private content) and writes
JSON into `src/content/records/`, which the Astro build validates again
(`src/content.config.ts`) before generating the pages.

Standard library only. Does not query portals, does not change the CSVs,
does not commit and does not publish.

    python3 scripts/export_records.py                 # writes the JSON
    python3 scripts/export_records.py --check         # only checks; exits 1 if stale
    python3 scripts/export_records.py --archive /path/to/archive

The selection logic is the one of the previous site (genealogia-website,
`scripts/exportar-registros.py`), ported on 2026-11-06 with no rule change;
the tests came along (`tests/test_export_records.py`).
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
OUTPUT_DIR = ROOT / "src" / "content" / "records"
PUBLIC_NOTES = ROOT / "scripts" / "records" / "public-notes.json"
# Cutoffs by record type (Ramon's decision, 2026-10-26):
# - births and every other record: 100 years (up to 1925);
# - deaths: 70 years (up to 1955), provided the person was provably born by
#   1925; nobody born after 1925 is published.
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
# Coverage values are archive vocabulary and visitor-facing text (Portuguese).
COVERAGES = {"lida inteira", "procurada", "cabeçalho"}
REVIEW_LABELS = {"imagem_sem_segunda_conferencia": "Leitura em imagem registrada; ainda sem segunda conferência."}

# CSV column (archive, Portuguese) → public JSON key (English). Order is the output order.
NAME_FIELDS = {
    "id": "id", "nome": "given_name", "sobrenome": "surname", "pai": "father", "mae": "mother",
    "conjuge_nome": "spouse_given_name", "conjuge_sobrenome": "spouse_surname", "comune": "comune",
    "serie": "series", "ano": "year", "parte": "part", "num_atto": "act_number", "data_evento": "event_date",
    "imagem": "image", "papel": "role", "leitura": "reading",
}
PAGE_FIELDS = {
    "comune": "comune", "serie": "series", "ano": "year", "parte": "part", "imagem": "image", "colecao": "collection",
    "volume_ou_waypoint": "volume_or_waypoint", "dgs_ou_manifest": "dgs_or_manifest",
    "paginas_impressas": "printed_pages", "cobertura": "coverage",
}
PRIVATE_RE = re.compile(r"(?:/Users/|/home/|file://|\b(?:CPF|RG)\s*[:=]|\d{3}\.\d{3}\.\d{3}-\d{2})", re.I)


def text(value: str) -> str:
    return " ".join((value or "").split())


def sort_name(value: str) -> str:
    # Doubt marks stay visible; they must not push «S[uraci?]» to the top of the list.
    value = unicodedata.normalize("NFD", value.casefold())
    return "".join(c for c in value if c.isalnum() and not unicodedata.combining(c))


def years(value: str, limit: int = CUTOFF) -> tuple[int, int] | None:
    """Only explicit years and ranges. Never guess «1908?» or empty dates."""
    m = re.fullmatch(r"(\d{4})(?:\s*[-–]\s*(\d{4}))?", text(value))
    if not m:
        return None
    start, end = int(m[1]), int(m[2] or m[1])
    return (start, end) if 1000 <= start <= end <= limit else None


def is_death_record(row: dict) -> bool:
    """Deaths have their own cutoff; the series or the source type must say so."""
    series = text(row.get("serie", "")).casefold()
    kind = text(row.get("tipo_fonte", "")).casefold()
    return series.startswith(("morti", "óbito", "obito", "sepolt")) or kind.startswith(("morte", "óbito", "obito", "sepoltura"))


def cutoff_for(row: dict) -> int:
    return DEATH_CUTOFF if is_death_record(row) else CUTOFF


def birth_year(row: dict) -> int | None:
    """Birth year proven by the row itself: «n. … YYYY» in the role, or event year minus age."""
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


def safe_fields(row: dict, fields: dict[str, str]) -> dict:
    result = {public: text(row.get(column, "")) for column, public in fields.items()}
    # An irregular row must not carry local paths or personal identifiers to the site.
    for value in result.values():
        if PRIVATE_RE.search(value):
            raise ValueError("A selected field contains private content; review the row in the archive.")
    return result


def content_summary(value: str) -> str:
    """Structural description, never copying names, marginal notes or OCR from the free-text field."""
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
    """Visitor-facing category of a series (Portuguese labels)."""
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
    # «Defunti» (parish), «Defunciones» (Uruguay) and death certificates are deaths like «Morti»:
    # the 1955 cutoff already treated them so (is_death_record); the public label follows (2026-11-06).
    if s.startswith(("morti", "defunt", "defuncion", "óbito", "obito")):
        return "Óbitos"
    if s.startswith("cittadinanz"):
        return "Cidadania"
    if "leva" in s or "alistamento" in s:
        return "Recrutamento militar"
    return "Outras fontes"


def roles_for(value: str) -> list[str]:
    """Visitor-facing role labels derived from the archive's free-text role."""
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
    number, part = item["act_number"], item["part"]
    match = re.fullmatch(r"(?:(I|II)-)?(\d+)", number)
    if not match:
        return ""
    part, number = match[1] or part, str(int(match[2]))
    # Antenati identifies the volume independently of the canvas. On other portals, group only
    # explicit references to the same image; never merge copies by similarity.
    parsed = urlsplit(item["url"])
    volume = re.match(r"(/ark:/12657/an_ua\d+)/", parsed.path) if parsed.hostname == "antenati.cultura.gov.it" else None
    reference = "https://antenati.cultura.gov.it" + volume[1] if volume else item["url"]
    identity = [reference, item["comune"], item["series"], item["year"], part, number]
    return "A-" + hashlib.sha256(json.dumps(identity, ensure_ascii=False).encode()).hexdigest()[:16]


def read_csv(path: Path, required: set[str]) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if not required.issubset(reader.fieldnames or []):
            raise ValueError(f"Required columns missing in {path.name}.")
        return list(reader)


def export(source: Path, annotations: dict, private_selection: dict | None = None) -> tuple[dict, dict]:
    private_selection = private_selection or {}
    if set(private_selection) - {"hide_occurrences", "hide_pages"}:
        raise ValueError("Unknown key in the private publication selection.")
    for key, pattern in (("hide_occurrences", r"L-\d+"), ("hide_pages", r"P-[a-f0-9]{16}")):
        values = private_selection.get(key, [])
        if not isinstance(values, list) or not all(isinstance(v, str) and re.fullmatch(pattern, v) for v in values):
            raise ValueError("Invalid list in the private selection: " + key)
    names = read_csv(source / "linhas-transcritas.csv", set(NAME_FIELDS) | {"url_imagem"})
    pages = read_csv(source / "mapa-imagens.csv", set(PAGE_FIELDS) | {"url", "conteudo"})
    excluded = []
    dates = []
    output_names = []
    output_pages = {}
    seen_ids = set()
    for group, rows, link_field, fields in (
        ("names", names, "url_imagem", NAME_FIELDS),
        ("pages", pages, "url", PAGE_FIELDS),
    ):
        for number, row in enumerate(rows, 2):
            reason = None
            limit = cutoff_for(row)
            interval = years(row.get("ano", ""), limit)
            link = public_url(row.get(link_field, ""))
            if group == "names" and row.get("id") in private_selection.get("hide_occurrences", []):
                reason = "entry omitted by the private publication selection"
            elif not interval:
                reason = ("year missing, uncertain or beyond the 1955 cutoff for deaths" if limit == DEATH_CUTOFF
                          else "year missing, uncertain or beyond the 1925 cutoff")
            elif not link:
                reason = "link missing or outside the accepted official image addresses"
            elif not text(row.get("serie", "")) or (group == "names" and not text(row.get("comune", ""))):
                reason = "place or series missing"
            elif group == "names":
                if not re.fullmatch(r"L-\d+", row["id"]) or not row["nome"]:
                    reason = "identifier or name missing/invalid"
                elif row["id"] in seen_ids:
                    raise ValueError(f"Duplicate identifier: {row['id']}.")
                elif not re.match(r"^(certa|provável|duvidosa)(?:$| \()", row["leitura"]):
                    reason = "reading grade not recognised"
                elif any(int(y) > limit for key in ("data_evento", "papel")
                         for y in re.findall(r"(?<!\d)(\d{4})(?!\d)", row.get(key, ""))):
                    reason = "event or role mentions a date after the cutoff"
                elif interval[1] > CUTOFF and (birth_year(row) is None or birth_year(row) > BORN_BY):
                    reason = "death after 1925 without a birth proven by 1925"
            elif text(row.get("cobertura", "")) not in COVERAGES:
                reason = "reading coverage not recognised"
            if reason:
                excluded.append({"file": group, "csv_line": number, "reason": reason})
                continue
            item = safe_fields(row, fields)
            if group == "names" and interval[1] > CUTOFF and (birth_year(row) or BORN_BY) > 1900:
                # The spouse of someone born after 1900 may have been born after 1925.
                item["spouse_given_name"] = item["spouse_surname"] = ""
            if not item["comune"]:
                item["comune"] = "Localidade não indicada"
            item.update(url=link[0], portal=link[1], start=interval[0], end=interval[1], category=category(item["series"]))
            date = text(row.get("lido_em", ""))
            if re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
                dates.append(date)
            if group == "names":
                seen_ids.add(item["id"])
                review = text(row.get("conferencia", ""))
                if review and review not in REVIEW_LABELS:
                    raise ValueError("Review state not recognised: " + item["id"])
                optional = safe_fields(row, {"nota_publica": "public_note"})
                item["note"] = annotations.get(item["id"], optional["public_note"])
                item["review"] = REVIEW_LABELS.get(review, "")
                item["roles"] = roles_for(item["role"])
                item["act_id"] = act_id(item)
                alternative = text(row.get("url_imagem_alternativa", ""))
                if alternative:
                    alternative_link = public_url(alternative)
                    if not alternative_link:
                        raise ValueError("Alternative link not accepted: " + item["id"])
                    item["alt_url"], item["alt_portal"] = alternative_link
                output_names.append(item)
            else:
                identity = json.dumps([item[k] for k in ("url", "comune", "series", "year", "part")], ensure_ascii=False)
                item["id"] = "P-" + hashlib.sha256(identity.encode()).hexdigest()[:16]
                if item["id"] in private_selection.get("hide_pages", []):
                    excluded.append({"file": group, "csv_line": number, "reason": "entry omitted by the private publication selection"})
                    continue
                item["description"] = content_summary(row.get("conteudo", ""))
                item["consulted_on"] = date
                item["visits"] = 1
                if item["id"] in output_pages:
                    previous = output_pages[item["id"]]
                    # The same image may be revisited. Keep the explicit coverages; never infer a
                    # full reading from the existence of a transcription.
                    previous["visits"] += 1
                    previous["coverages"] = sorted(set(previous["coverages"]) | {item["coverage"]})
                    previous["consulted_on"] = max(previous["consulted_on"], date)
                    if not previous["image"]:
                        previous["image"] = item["image"]
                    continue
                item["coverages"] = [item["coverage"]]
                output_pages[item["id"]] = item
    unknown_notes = set(annotations) - {r["id"] for r in output_names}
    if unknown_notes:
        raise ValueError("Public notes point to occurrences absent from the export: " + ", ".join(sorted(unknown_notes)))
    pages_by_url = {}
    for page in output_pages.values():
        page["transcribed_names"] = 0
        pages_by_url.setdefault(page["url"], []).append(page)
    for item in output_names:
        linked_pages = {page["id"]: page for url in {item["url"], item.get("alt_url", "")}
                        for page in pages_by_url.get(url, [])
                        if page["comune"] == item["comune"] and page["year"] == item["year"] and page["series"] == item["series"]}
        item["pages"] = sorted(linked_pages)
        for page in linked_pages.values():
            page["transcribed_names"] += 1
    ordered_names = sorted(output_names, key=lambda r: (sort_name(r["surname"]), sort_name(r["given_name"]), r["start"], r["id"]))
    ordered_pages = sorted(output_pages.values(), key=lambda r: (r["comune"].casefold(), r["category"], r["start"], r["volume_or_waypoint"], int(r["image"]) if r["image"].isdigit() else 0, r["id"]))
    data = {"version": 1,
            "cutoffs": {"births_and_others": CUTOFF, "deaths": DEATH_CUTOFF, "born_by": BORN_BY},
            "last_consulted": max(dates, default=""), "names": ordered_names, "pages": ordered_pages}
    report = {"input": {"names": len(names), "pages": len(pages)},
              "exported": {"names": len(ordered_names), "pages": len(ordered_pages)},
              "repeated_visits_grouped": len(pages) - sum(e["file"] == "pages" for e in excluded) - len(ordered_pages),
              "excluded_by_reason": dict(Counter(e["reason"] for e in excluded)), "excluded": excluded}
    return data, report


def differences(before: dict, after: dict) -> dict:
    result = {}
    for group in ("names", "pages"):
        old = {r["id"]: r for r in before.get(group, [])}
        new = {r["id"]: r for r in after[group]}
        result[group] = {
            "added": sorted(new.keys() - old.keys()), "removed": sorted(old.keys() - new.keys()),
            "changed": sorted(k for k in old.keys() & new.keys() if old[k] != new[k]),
        }
    return result


def serialize(data: dict) -> dict[str, str]:
    """The three public files. Stable JSON (sorted keys) so that the git diff tells the truth."""
    meta = {"version": data["version"], "cutoffs": data["cutoffs"], "last_consulted": data["last_consulted"],
            "generated_on": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "totals": {"names": len(data["names"]), "pages": len(data["pages"])}}
    dump = lambda obj: json.dumps(obj, ensure_ascii=False, indent=1, sort_keys=True) + "\n"
    return {"names.json": dump(data["names"]), "pages.json": dump(data["pages"]),
            "meta.json": dump({"records": meta})}


def load_previous(output_dir: Path) -> dict:
    previous = {}
    for group in ("names", "pages"):
        file = output_dir / f"{group}.json"
        previous[group] = json.loads(file.read_text(encoding="utf-8")) if file.exists() else []
    return previous


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--archive", type=Path, default=ROOT.parent / "family-research", help="root folder of the private archive")
    parser.add_argument("--check", action="store_true", help="check without writing; exits 1 if the export is stale")
    parser.add_argument("--report", type=Path, default=None,
                        help="where to write the detailed report (default: in the archive, registros-vistos/export-report-records.json)")
    args = parser.parse_args()
    source = args.archive / "01 Indice" / "registros-vistos"
    if not source.is_dir():
        raise ValueError(f"Archive folder not found: {source}")
    notes = json.loads(PUBLIC_NOTES.read_text(encoding="utf-8"))
    if not isinstance(notes, dict) or not all(re.fullmatch(r"L-\d+", k) and isinstance(v, str) for k, v in notes.items()):
        raise ValueError("Public notes must map identifiers to reviewed texts.")
    selection_file = source / "publicacao.json"
    selection = json.loads(selection_file.read_text(encoding="utf-8")) if selection_file.exists() else {}
    if not isinstance(selection, dict):
        raise ValueError("The private publication selection must be a JSON object.")
    data, report = export(source, notes, selection)
    report["changes"] = differences(load_previous(OUTPUT_DIR), data)
    files = serialize(data)
    # meta.json carries the generation date; only the content that matters is compared.
    stale = any(not (OUTPUT_DIR / name).exists() or (OUTPUT_DIR / name).read_text(encoding="utf-8") != content
                for name, content in files.items() if name != "meta.json")
    for group, title in (("names", "Occurrences"), ("pages", "Pages")):
        delta = report["changes"][group]
        print(f"{title}: {len(data[group])} exported; {len(delta['added'])} added, {len(delta['changed'])} changed, {len(delta['removed'])} removed.")
    print(f"Repeated visits grouped: {report['repeated_visits_grouped']}.")
    for reason, count in sorted(report["excluded_by_reason"].items()):
        print(f"Excluded: {count} — {reason}.")
    if args.check:
        print("Export is stale." if stale else "src/content/records is up to date; export reproducible.")
        return int(stale)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, content in files.items():
        (OUTPUT_DIR / name).write_text(content, encoding="utf-8")
    report_file = args.report or (source / "export-report-records.json")
    report_file.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Data written to {OUTPUT_DIR.relative_to(ROOT)}/ ({'with' if stale else 'without'} changes).")
    print(f"Detailed report (private, outside the repository): {report_file}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, csv.Error) as error:
        print(f"Export aborted: {error}", file=sys.stderr)
        sys.exit(2)
