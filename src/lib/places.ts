/**
 * Places of birth and death: from the comune (as written in the archive) to province, region
 * and country, so that cards do not show a bare «Laganadi». Current jurisdiction in the region
 * names; the historical one (Principato Citra, Calabria Ulteriore…) belongs in the dossier text.
 *
 * A place missing from this table breaks the build on purpose: adding a line is better than
 * publishing a place without context.
 */

export interface Place {
  /** The comune (or city) as it came from the archive, without address, state code or country. */
  name: string;
  /** A detail kept from the archive, in parentheses: a frazione, a hospital («Ospedale Civico»). */
  detail?: string;
  province?: string;
  region?: string;
  country: string;
  /** Uncertain reading in the archive («Padula (?)», «Br[i]ola (?)»). */
  uncertain: boolean;
}

type Entry = [province: string | undefined, region: string | undefined, country: string];

const PLACES: Record<string, Entry> = {
  // Calabria
  Laganadi: ['Reggio Calabria', 'Calábria', 'Itália'],
  "Sant'Eufemia d'Aspromonte": ['Reggio Calabria', 'Calábria', 'Itália'],
  Scilla: ['Reggio Calabria', 'Calábria', 'Itália'],
  'San Giorgio Morgeto': ['Reggio Calabria', 'Calábria', 'Itália'],
  'Reggio Calabria': ['Reggio Calabria', 'Calábria', 'Itália'],
  Catanzaro: ['Catanzaro', 'Calábria', 'Itália'],
  // Campania (Cilento and Vallo di Diano)
  Padula: ['Salerno', 'Campânia', 'Itália'],
  Buonabitacolo: ['Salerno', 'Campânia', 'Itália'],
  'Casaletto Spartano': ['Salerno', 'Campânia', 'Itália'],
  Battaglia: ['Salerno', 'Campânia', 'Itália'],
  Vibonati: ['Salerno', 'Campânia', 'Itália'],
  Roccagloriosa: ['Salerno', 'Campânia', 'Itália'],
  'San Mauro Cilento': ['Salerno', 'Campânia', 'Itália'],
  // Basilicata
  Lagonegro: ['Potenza', 'Basilicata', 'Itália'],
  // Sicily
  Messina: ['Messina', 'Sicília', 'Itália'],
  // Lombardy
  'Casalbuttano ed Uniti': ['Cremona', 'Lombardia', 'Itália'],
  // Brazil
  Carangola: [undefined, 'Minas Gerais', 'Brasil'],
  'Patrocínio do Muriaé': [undefined, 'Minas Gerais', 'Brasil'],
  'Rio de Janeiro': [undefined, 'Rio de Janeiro', 'Brasil'],
  // Elsewhere
  Montevideo: [undefined, undefined, 'Uruguai'],
  'Saddle River': ['Bergen', 'Nova Jérsei', 'Estados Unidos'],
  Safi: [undefined, undefined, 'Marrocos'],
};

const BRAZILIAN_STATES: Record<string, string> = { MG: 'Minas Gerais', RJ: 'Rio de Janeiro', SP: 'São Paulo', ES: 'Espírito Santo' };
/** Parentheticals that only repeat the country and are dropped. */
const COUNTRY_WORDS = new Set(['Uruguai', 'Brasil', 'Itália', 'Italia', 'Marrocos', 'USA']);

/** Interprets a place of the archive. Throws if the place is not in the table (and is not an uncertain reading). */
export function placeOf(raw: string | undefined): Place | undefined {
  if (!raw) return undefined;
  let name = raw.trim();
  const uncertain = /\(\?\)\s*$/.test(name) || name.includes('[');
  name = name.replace(/\s*\(\?\)\s*$/, '');
  // «Messina, Via Orti 10», «Safi, Marrocos», «Saddle River, Bergen, New Jersey, USA»: the first segment names the place
  name = name.split(',')[0].trim();
  // parenthetical: a state code («Carangola (MG)»), a country («Montevideo (Uruguai)») or a detail («Messina (Ospedale Civico)»)
  let detail: string | undefined;
  let state: string | undefined;
  const paren = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (paren) {
    name = paren[1].trim();
    const inside = paren[2].trim();
    if (/^[A-Z]{2}$/.test(inside)) state = inside;
    else if (!COUNTRY_WORDS.has(inside)) detail = inside;
  }

  const e = PLACES[name];
  if (e) return { name, detail, province: e[0], region: e[1], country: e[2], uncertain };
  if (state && BRAZILIAN_STATES[state]) return { name, detail, region: BRAZILIAN_STATES[state], country: 'Brasil', uncertain };
  if (uncertain) return { name: raw.trim(), country: '', uncertain };
  throw new Error(`Place without province/region/country in src/lib/places.ts: «${raw}»`);
}

/** «Reggio Calabria, Calábria, Itália» — what follows the place name (a province or region equal to the name is not repeated). */
export function placeContext(p: Place): string {
  return [p.province, p.region, p.country].filter((v): v is string => !!v && v !== p.name).filter((v, i, a) => a.indexOf(v) === i).join(', ');
}

/** The name with its detail and uncertainty mark: «Messina (Ospedale Civico)», «Padula (?)». */
export function placeName(p: Place): string {
  return `${p.name}${p.detail ? ` (${p.detail})` : ''}${p.uncertain ? ' (?)' : ''}`;
}

/** One line: «Laganadi · Reggio Calabria, Calábria, Itália». */
export function placeLabel(raw: string | undefined): string {
  const p = placeOf(raw);
  if (!p) return '';
  const context = placeContext(p);
  return `${placeName(p)}${context ? ` · ${context}` : ''}`;
}
