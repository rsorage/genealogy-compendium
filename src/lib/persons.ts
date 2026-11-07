/**
 * Persons and documents — labels and helpers shared by the pages (build) and the islands.
 * Everything the visitor reads is in Portuguese; identifiers are in English.
 */
import type { CollectionEntry } from 'astro:content';

export type Person = CollectionEntry<'persons'>['data'];
export type Document = CollectionEntry<'documents'>['data'];
export type Confidence = Person['relations'][number]['confidence'];
export type Line = Person['line'];
export type DocumentType = Document['type'];
export type RelationType = Person['relations'][number]['type'];

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  certain: 'certa',
  stated: 'declarada',
  probable: 'provável',
  doubtful: 'duvidosa',
};

export const CONFIDENCE_EXPLANATION: Record<Confidence, string> = {
  certain: 'O próprio ato o estabelece, ou várias fontes independentes concordam.',
  stated: 'A fonte afirma, sem corroboração independente (idades declaradas entram aqui).',
  probable: 'Inferência com pontos de contato explicitados na justificativa.',
  doubtful: 'Registrado, mas há contra-indícios conhecidos.',
};

/** Colour classes by confidence (the same as the reading grades in Registros vistos). */
export const CONFIDENCE_CLASS: Record<Confidence, string> = {
  certain: 'text-[#2A6F54] bg-[#EEF5F0] border-[#CFE2D6]',
  stated: 'text-[#1C1917] bg-[#F3EFE6] border-[#D6CEBE]',
  probable: 'text-[#8A5A14] bg-[#FBF4E6] border-[#EBD9B4]',
  doubtful: 'text-[#8C3A27] bg-[#FAF3F0] border-[#E8D9CE]',
};

/** Edge stroke in the tree: solid, dashed, dotted. */
export const CONFIDENCE_STROKE: Record<Confidence, 'solid' | 'dashed' | 'dotted'> = {
  certain: 'solid',
  stated: 'dashed',
  probable: 'dashed',
  doubtful: 'dotted',
};

/** Best first; used to pick the strongest or the weakest of several. */
export const CONFIDENCE_ORDER: Confidence[] = ['certain', 'probable', 'stated', 'doubtful'];

export const LINE_LABEL: Record<Line, string> = {
  suraci: 'Suraci → Sorage',
  cardillo: 'Cardillo → Cardilo',
  marsicano: 'Marsicano',
  vecchia: 'Vecchia',
  rede: 'Rede (testemunhas, oficiais, vizinhos)',
};

export const LINE_DESCRIPTION: Record<Line, string> = {
  suraci: 'Laganadi (Reggio Calabria) → Carangola (MG): Luigi Suraci, pais, irmãos e ascendentes, incluindo os Versaci.',
  cardillo: 'Padula e Casaletto Spartano (Salerno) → Patrocínio do Muriaé (MG): Luigi Cardillo, pais, irmãos e ascendentes até o século XVIII.',
  marsicano: 'Vibonati, Roccagloriosa e San Mauro Cilento: a família de Rosa Marsicano, mãe de Luigi Cardillo.',
  vecchia: 'Província de Cremona → Carangola (MG): os Vecchia, família de Isolina, mulher de Luigi Suraci.',
  rede: 'Pessoas que não são da família, mas aparecem repetidamente nos atos: testemunhas, oficiais, padrinhos, confinantes.',
};

export const LINE_ORDER: Line[] = ['suraci', 'vecchia', 'cardillo', 'marsicano', 'rede'];

/** Document type labels by country: Italian acts keep their Italian names; Brazilian ones are certidões. */
const DOCUMENT_TYPE_LABEL_IT: Record<DocumentType, string> = {
  birth: 'Atto di nascita',
  baptism: 'Battesimo',
  marriage: 'Atto di matrimonio',
  parish_marriage: 'Matrimonio (paroquial)',
  marriage_banns: 'Pubblicazioni di matrimonio',
  marriage_file: 'Processetti matrimoniali',
  death: 'Atto di morte',
  burial: 'Sepoltura',
  census: 'Catasto onciario',
  military: 'Lista di leva',
  passenger_list: 'Lista de bordo',
  passport: 'Passaporte',
  notarial: 'Ato notarial',
  index: 'Índice',
  newspaper: 'Jornal',
  other: 'Outro documento',
};
/** Brazilian records are certidões; elsewhere (Uruguay, United States…) a generic Portuguese label. */
const DOCUMENT_TYPE_LABEL_BR: Partial<Record<DocumentType, string>> = {
  birth: 'Certidão de nascimento',
  baptism: 'Registro de batismo',
  marriage: 'Certidão de casamento',
  parish_marriage: 'Casamento (paroquial)',
  death: 'Certidão de óbito',
  burial: 'Registro de sepultamento',
  passenger_list: 'Matrícula de hospedaria',
  census: 'Censo',
};
const DOCUMENT_TYPE_LABEL_OTHER: Partial<Record<DocumentType, string>> = {
  birth: 'Registro de nascimento',
  baptism: 'Registro de batismo',
  marriage: 'Registro de casamento',
  parish_marriage: 'Casamento (paroquial)',
  death: 'Registro de óbito',
  burial: 'Registro de sepultamento',
  passenger_list: 'Lista de passageiros',
  census: 'Censo',
};

export function documentTypeLabel(d: Pick<Document, 'type' | 'country'>): string {
  if (d.country === 'BR') return DOCUMENT_TYPE_LABEL_BR[d.type] ?? DOCUMENT_TYPE_LABEL_IT[d.type];
  if (d.country !== 'IT') return DOCUMENT_TYPE_LABEL_OTHER[d.type] ?? DOCUMENT_TYPE_LABEL_IT[d.type];
  return DOCUMENT_TYPE_LABEL_IT[d.type];
}

export const REPOSITORY_LABEL: Record<string, string> = {
  antenati: 'Portale Antenati (Archivi di Stato)',
  familysearch: 'FamilySearch',
  archivio_stato: 'Archivio di Stato',
  comune: 'Comune (cópia enviada por correspondência)',
  parish: 'Arquivo paroquial',
  cartorio: 'Cartório de registro civil',
  bn: 'Biblioteca Nacional — Hemeroteca Digital',
  diocesano: 'Archivio Storico Diocesano Reggio Calabria–Bova',
};

export function repositoryLabel(code: string): string {
  return REPOSITORY_LABEL[code] ?? code;
}

const MONTHS = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

/** An archive date in readable Portuguese: 1881-12-26 → 26 dez. 1881; ~1736 → c. 1736; <1810 → antes de 1810; 1802/1816 → entre 1802 e 1816. */
export function readableArchiveDate(date: string | undefined): string {
  if (!date) return '';
  const part = (v: string) => {
    const m = v.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
    if (!m) return v;
    const [, y, mo, d] = m;
    if (d) return `${Number(d)} ${MONTHS[Number(mo) - 1]} ${y}`;
    if (mo) return `${MONTHS[Number(mo) - 1]} ${y}`;
    return y;
  };
  if (date.includes('/')) {
    const [start, end] = date.split('/');
    if (!start) return `antes de ${part(end)}`;
    if (!end) return `depois de ${part(start)}`;
    return `entre ${part(start)} e ${part(end)}`;
  }
  if (date.startsWith('~')) return `c. ${part(date.slice(1))}`;
  if (date.startsWith('<')) return `antes de ${part(date.slice(1))}`;
  if (date.startsWith('>')) return `depois de ${part(date.slice(1))}`;
  return part(date);
}

/** Only the year (or the approximation), for lists and cards. */
export function shortYear(date: string | undefined): string {
  if (!date) return '';
  const m = date.match(/(\d{4})/);
  if (!m) return '';
  if (date.startsWith('~')) return `c. ${m[1]}`;
  if (date.startsWith('<') || date.startsWith('/')) return `antes de ${m[1]}`;
  if (date.startsWith('>')) return `depois de ${m[1]}`;
  if (date.includes('/')) {
    const end = date.split('/')[1]?.match(/(\d{4})/);
    return end && end[1] !== m[1] ? `${m[1]}/${end[1]}` : m[1];
  }
  return m[1];
}

/** «1881–1953», «c. 1736–1802», «n. 1884», «† 1802». */
export function lifeSpan(p: Pick<Person, 'birth' | 'death'>): string {
  const b = shortYear(p.birth?.date);
  const d = shortYear(p.death?.date);
  if (b && d) return `${b}–${d}`;
  if (b) return `n. ${b}`;
  if (d) return `† ${d}`;
  return '';
}

export function personPath(id: string): string {
  return `/pessoas/${id}/`;
}

export function documentPath(id: string): string {
  return `/documentos/${id}/`;
}

/** Role names in the act, capitalised as a label. */
export function rolesLabel(roles: string[]): string {
  return roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ');
}

export const RELATION_LABEL: Record<RelationType, string> = {
  father: 'Pai',
  mother: 'Mãe',
  spouse: 'Cônjuge',
  sibling: 'Irmão/irmã',
  child: 'Filho/filha',
};

export const RELATION_ORDER: RelationType[] = ['father', 'mother', 'spouse', 'sibling', 'child'];

/** Default root person of each line, for the tree and the listings. */
export const LINE_ROOT: Partial<Record<Line, string>> = {
  suraci: 'P-suraci-luigi-1881',
  cardillo: 'P-cardillo-luigi-1892',
  marsicano: 'P-marsicano-rosa-1866',
  vecchia: 'P-vecchia-isolina-1884',
};

/** The archive's occupation codes (English) → Portuguese. */
export const OCCUPATION_LABEL: Record<string, string> = {
  shoemaker: 'sapateiro', farmhand: 'jornaleiro (bracciante)', farmer: 'lavrador (contadino)', tailor: 'alfaiate',
  blacksmith: 'ferreiro', carpenter: 'carpinteiro (falegname)', butcher: 'açougueiro', shopkeeper: 'lojista',
  apothecary: 'boticário', priest: 'padre', midwife: 'parteira', landowner: 'proprietário (possidente)',
  gentleman: 'civil / galantuomo', notary: 'notário', servant: 'criado(a)', spinner: 'fiandeira (filatrice)',
  weaver: 'tecelão/tecelã', mason: 'pedreiro', merchant: 'negociante', student: 'estudante', none: 'sem ofício declarado',
};
export function occupationLabel(code: string | undefined): string {
  if (!code) return '';
  return OCCUPATION_LABEL[code] ?? code;
}
