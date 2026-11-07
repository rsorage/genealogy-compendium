/**
 * Records seen — helpers shared by the static pages (build) and the search island
 * (browser). Nothing here reads the archive: it only works on the exported JSON.
 */
import type { CollectionEntry } from 'astro:content';

export type Occurrence = CollectionEntry<'recordNames'>['data'];
export type Page = CollectionEntry<'recordPages'>['data'];
export type RecordsMeta = CollectionEntry<'recordsMeta'>['data'];
export type ReadingGrade = 'certa' | 'provável' | 'duvidosa';

/** An occurrence plus the address of its static catalogue page. */
export type PublishedOccurrence = Occurrence & { catalogue_url: string };

/** A slice of the catalogue: one static page per (comune, series, year). */
export interface Slice {
  comune: string;
  series: string;
  year: string;
  /** Absolute path, with trailing slash: /registros-vistos/catalogo/<comune>/<series>/<year>/ */
  path: string;
  rows: PublishedOccurrence[];
}

export const CATALOGUE_BASE = '/registros-vistos/catalogo/';

// ---------------------------------------------------------------- addresses

/**
 * Same algorithm as the previous site's `slug()` (catalogo_estatico.py), so that the
 * 217 addresses already indexed by Google stay valid:
 * NFKD → ASCII only → lowercase → non-alphanumeric runs become «-» → no leading/trailing «-»;
 * empty becomes «sem-identificacao»; above 80 characters, cut at 70 and append 8 hex of sha256.
 */
export function slug(value: string, sha256Hex8?: (text: string) => string): string {
  let plain = value
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase();
  plain = plain.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'sem-identificacao';
  if (plain.length > 80) {
    if (!sha256Hex8) throw new Error('a long slug requires a hash function');
    plain = plain.slice(0, 70).replace(/-+$/g, '') + '-' + sha256Hex8(value);
  }
  return plain;
}

/** Groups the occurrences by (comune, series, year) and gives each one the address of its slice. */
export function groupSlices(names: Occurrence[], sha256Hex8: (text: string) => string): Slice[] {
  const groups = new Map<string, Slice>();
  const routes = new Map<string, string>();
  for (const row of names) {
    const key = JSON.stringify([row.comune, row.series, row.year]);
    let group = groups.get(key);
    if (!group) {
      const path = CATALOGUE_BASE + [row.comune, row.series, row.year].map((v) => slug(v, sha256Hex8)).join('/') + '/';
      const owner = routes.get(path);
      if (owner && owner !== key) {
        throw new Error(`Two slices produce the same address; review the labels before generating: ${path}`);
      }
      routes.set(path, key);
      group = { comune: row.comune, series: row.series, year: row.year, path, rows: [] };
      groups.set(key, group);
    }
    group.rows.push({ ...row, catalogue_url: group.path });
  }
  return [...groups.values()].sort((a, b) =>
    a.comune.localeCompare(b.comune, 'pt') || a.series.localeCompare(b.series, 'pt') || a.year.localeCompare(b.year, 'pt'),
  );
}

/** Slices grouped by comune, for the listings. */
export function byPlace(slices: Slice[]): { comune: string; slices: Slice[] }[] {
  const map = new Map<string, Slice[]>();
  for (const s of slices) map.set(s.comune, [...(map.get(s.comune) ?? []), s]);
  return [...map.entries()].map(([comune, slices]) => ({ comune, slices }));
}

// ---------------------------------------------------------------- labels

export function fullName(o: Pick<Occurrence, 'given_name' | 'surname'>): string {
  return [o.given_name, o.surname].filter(Boolean).join(' ');
}

export function spouseName(o: Pick<Occurrence, 'spouse_given_name' | 'spouse_surname'>): string {
  return [o.spouse_given_name, o.spouse_surname].filter(Boolean).join(' ');
}

/** The reading grade without the caveat in parentheses. */
export function readingGrade(reading: string): ReadingGrade {
  return reading.split(' (')[0] as ReadingGrade;
}

/** The caveat in parentheses, when there is one. */
export function readingCaveat(reading: string): string {
  const i = reading.indexOf(' (');
  return i >= 0 ? reading.slice(i + 2).replace(/\)$/, '') : '';
}

export function roleLabel(o: Pick<Occurrence, 'role' | 'roles'>): string {
  if (o.roles.length === 1 && o.roles[0] !== 'Pessoa registrada') return o.roles[0];
  if (o.role === 'mãe, declarante') return 'Mãe e declarante';
  return o.role ? o.role[0].toUpperCase() + o.role.slice(1) : 'Outra menção';
}

export function reference(o: Pick<Occurrence, 'series' | 'year' | 'part' | 'act_number' | 'image'>): string {
  return [
    o.series,
    o.year,
    o.part ? `Parte ${o.part}` : '',
    o.act_number ? `Ato / n.º ${o.act_number}` : '',
    o.image ? `Imagem ${o.image}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

/** 1884-01-05 → 05/01/1884; other formats stay as they are. */
export function readableDate(value: string): string {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}

export function actLabel(o: Pick<Occurrence, 'act_number' | 'part'>): string {
  let label = o.act_number ? `Ato / n.º ${o.act_number}` : 'Referência transcrita';
  if (o.part) label += ` · Parte ${o.part}`;
  return label;
}

export const COVERAGE_LABEL: Record<Page['coverage'], string> = {
  'lida inteira': 'Lida inteira',
  procurada: 'Só procurada',
  cabeçalho: 'Só o cabeçalho',
};

export const COVERAGE_EXPLANATION: Record<Page['coverage'], string> = {
  'lida inteira': 'Todas as linhas da imagem foram lidas em boa resolução.',
  procurada: 'Só procuramos sobrenomes; as linhas não foram todas lidas.',
  cabeçalho: 'Só identificamos o conteúdo da imagem.',
};

/** Sorts the acts of a slice: part, then number (numeric), then the rest. */
export function sortActs(rows: PublishedOccurrence[]): [string, PublishedOccurrence[]][] {
  const acts = new Map<string, PublishedOccurrence[]>();
  for (const r of rows) {
    const key = r.act_id || r.id;
    acts.set(key, [...(acts.get(key) ?? []), r]);
  }
  return [...acts.entries()].sort(([ka, a], [kb, b]) => {
    const pa = a[0].part.localeCompare(b[0].part);
    if (pa) return pa;
    const na = /^\d+$/.test(a[0].act_number) ? Number(a[0].act_number) : 1e9;
    const nb = /^\d+$/.test(b[0].act_number) ? Number(b[0].act_number) : 1e9;
    return na - nb || a[0].act_number.localeCompare(b[0].act_number) || ka.localeCompare(kb);
  });
}

/** Anchor of an act's section on the static page. */
export function actSectionId(key: string): string {
  return key.startsWith('A-') ? key : 'ref-' + key;
}

/** JSON-LD BreadcrumbList for a navigation trail (absolute site paths). */
export function breadcrumbsJsonLd(items: { name: string; path: string }[], site = 'https://genealogia.rsorage.com'): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: site + item.path,
    })),
  }).replace(/</g, '\\u003c');
}
