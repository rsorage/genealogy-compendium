/**
 * Pessoas e documentos — rótulos e utilidades partilhadas pelas páginas (build) e pelas ilhas.
 */
import type { CollectionEntry } from 'astro:content';

export type Pessoa = CollectionEntry<'pessoas'>['data'];
export type Documento = CollectionEntry<'documentos'>['data'];
export type Firmeza = Pessoa['relacoes'][number]['firmeza'];
export type Linha = Pessoa['linha'];

export const ROTULO_FIRMEZA: Record<Firmeza, string> = {
  certa: 'certa',
  declarada: 'declarada',
  provavel: 'provável',
  duvidosa: 'duvidosa',
};

export const EXPLICACAO_FIRMEZA: Record<Firmeza, string> = {
  certa: 'O próprio ato o estabelece, ou várias fontes independentes concordam.',
  declarada: 'A fonte afirma, sem corroboração independente (idades declaradas entram aqui).',
  provavel: 'Inferência com pontos de contato explicitados na justificativa.',
  duvidosa: 'Registrado, mas há contra-indícios conhecidos.',
};

/** Classes de cor por firmeza (as mesmas dos graus de leitura em Registros vistos). */
export const CLASSE_FIRMEZA: Record<Firmeza, string> = {
  certa: 'text-[#2A6F54] bg-[#EEF5F0] border-[#CFE2D6]',
  declarada: 'text-[#1C1917] bg-[#F3EFE6] border-[#D6CEBE]',
  provavel: 'text-[#8A5A14] bg-[#FBF4E6] border-[#EBD9B4]',
  duvidosa: 'text-[#8C3A27] bg-[#FAF3F0] border-[#E8D9CE]',
};

/** Traço da aresta na árvore: cheio, tracejado, pontilhado. */
export const TRACO_FIRMEZA: Record<Firmeza, string> = {
  certa: 'solid',
  declarada: 'dashed',
  provavel: 'dashed',
  duvidosa: 'dotted',
};

export const ROTULO_LINHA: Record<Linha, string> = {
  suraci: 'Suraci → Sorage',
  cardillo: 'Cardillo → Cardilo',
  marsicano: 'Marsicano',
  vecchia: 'Vecchia',
  rede: 'Rede (testemunhas, oficiais, vizinhos)',
};

export const DESCRICAO_LINHA: Record<Linha, string> = {
  suraci: 'Laganadi (Reggio Calabria) → Carangola (MG): Luigi Suraci, pais, irmãos e ascendentes, incluindo os Versaci.',
  cardillo: 'Padula e Casaletto Spartano (Salerno) → Patrocínio do Muriaé (MG): Luigi Cardillo, pais, irmãos e ascendentes até o século XVIII.',
  marsicano: 'Vibonati, Roccagloriosa e San Mauro Cilento: a família de Rosa Marsicano, mãe de Luigi Cardillo.',
  vecchia: 'Província de Cremona → Carangola (MG): os Vecchia, família de Isolina, mulher de Luigi Suraci.',
  rede: 'Pessoas que não são da família, mas aparecem repetidamente nos atos: testemunhas, oficiais, padrinhos, confinantes.',
};

export const ORDEM_LINHAS: Linha[] = ['suraci', 'vecchia', 'cardillo', 'marsicano', 'rede'];

export const ROTULO_TIPO_DOC: Record<Documento['tipo'], string> = {
  nascita: 'Atto di nascita',
  battesimo: 'Battesimo',
  matrimonio: 'Atto di matrimonio',
  pubblicazioni: 'Pubblicazioni di matrimonio',
  processetti: 'Processetti matrimoniali',
  morte: 'Atto di morte',
  sepoltura: 'Sepoltura',
  catasto: 'Catasto onciario',
  lista_di_leva: 'Lista di leva',
  lista_de_bordo: 'Lista de bordo',
  passaporte: 'Passaporte',
  notarial: 'Ato notarial',
  indice: 'Índice',
  jornal: 'Jornal',
  outro: 'Outro documento',
  nascimento: 'Certidão de nascimento',
  casamento: 'Certidão de casamento',
  obito: 'Certidão de óbito',
  hospedaria: 'Matrícula de hospedaria',
};

export const ROTULO_REPOSITORIO: Record<string, string> = {
  antenati: 'Portale Antenati (Archivi di Stato)',
  familysearch: 'FamilySearch',
  archivio_stato: 'Archivio di Stato',
  comune: 'Comune (cópia enviada por correspondência)',
  parish: 'Arquivo paroquial',
  cartorio: 'Cartório de registro civil',
  bn: 'Biblioteca Nacional — Hemeroteca Digital',
  diocesano: 'Archivio Storico Diocesano Reggio Calabria–Bova',
};

export function rotuloRepositorio(codigo: string): string {
  return ROTULO_REPOSITORIO[codigo] ?? codigo;
}

const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

/** Uma data do acervo em português legível: 1881-12-26 → 26 dez. 1881; ~1736 → c. 1736; <1810 → antes de 1810; 1802/1816 → entre 1802 e 1816. */
export function dataAcervoLegivel(data: string | undefined): string {
  if (!data) return '';
  const parte = (v: string) => {
    const m = v.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
    if (!m) return v;
    const [, a, me, d] = m;
    if (d) return `${Number(d)} ${MESES[Number(me) - 1]} ${a}`;
    if (me) return `${MESES[Number(me) - 1]} ${a}`;
    return a;
  };
  if (data.includes('/')) {
    const [ini, fim] = data.split('/');
    if (!ini) return `antes de ${parte(fim)}`;
    if (!fim) return `depois de ${parte(ini)}`;
    return `entre ${parte(ini)} e ${parte(fim)}`;
  }
  if (data.startsWith('~')) return `c. ${parte(data.slice(1))}`;
  if (data.startsWith('<')) return `antes de ${parte(data.slice(1))}`;
  if (data.startsWith('>')) return `depois de ${parte(data.slice(1))}`;
  return parte(data);
}

/** Só o ano (ou a aproximação), para listas e cartões. */
export function anoCurto(data: string | undefined): string {
  if (!data) return '';
  const m = data.match(/(\d{4})/);
  if (!m) return '';
  if (data.startsWith('~')) return `c. ${m[1]}`;
  if (data.startsWith('<') || data.startsWith('/')) return `antes de ${m[1]}`;
  if (data.startsWith('>')) return `depois de ${m[1]}`;
  if (data.includes('/')) {
    const f = data.split('/')[1]?.match(/(\d{4})/);
    return f && f[1] !== m[1] ? `${m[1]}/${f[1]}` : m[1];
  }
  return m[1];
}

/** «1881–1953», «c. 1736–1802», «n. 1884», «† 1802». */
export function periodoVida(p: Pick<Pessoa, 'nascimento' | 'morte'>): string {
  const n = anoCurto(p.nascimento?.data);
  const m = anoCurto(p.morte?.data);
  if (n && m) return `${n}–${m}`;
  if (n) return `n. ${n}`;
  if (m) return `† ${m}`;
  return '';
}

export function caminhoPessoa(id: string): string {
  return `/pessoas/${id}/`;
}

export function caminhoDocumento(id: string): string {
  return `/documentos/${id}/`;
}

/** Nome do papel no ato, capitalizado para rótulo. */
export function rotuloPapeis(papeis: string[]): string {
  return papeis.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
}

export const ROTULO_RELACAO: Record<Pessoa['relacoes'][number]['tipo'], string> = {
  pai: 'Pai',
  mae: 'Mãe',
  conjuge: 'Cônjuge',
  irmao: 'Irmão/irmã',
  filho: 'Filho/filha',
};

/** Pessoa-raiz padrão de cada linha, para a árvore e as listagens. */
export const RAIZ_DA_LINHA: Partial<Record<Linha, string>> = {
  suraci: 'P-suraci-luigi-1881',
  cardillo: 'P-cardillo-luigi-1892',
  marsicano: 'P-marsicano-rosa-1866',
  vecchia: 'P-vecchia-isolina-1884',
};

/** Os códigos de ofício do vocabulário do acervo (em inglês) → português. */
export const ROTULO_OCUPACAO: Record<string, string> = {
  shoemaker: 'sapateiro', farmhand: 'jornaleiro (bracciante)', farmer: 'lavrador (contadino)', tailor: 'alfaiate',
  blacksmith: 'ferreiro', carpenter: 'carpinteiro (falegname)', butcher: 'açougueiro', shopkeeper: 'lojista',
  apothecary: 'boticário', priest: 'padre', midwife: 'parteira', landowner: 'proprietário (possidente)',
  gentleman: 'civil / galantuomo', notary: 'notário', servant: 'criado(a)', spinner: 'fiandeira (filatrice)',
  weaver: 'tecelão/tecelã', mason: 'pedreiro', merchant: 'negociante', student: 'estudante', none: 'sem ofício declarado',
};
export function rotuloOcupacao(codigo: string | undefined): string {
  if (!codigo) return '';
  return ROTULO_OCUPACAO[codigo] ?? codigo;
}
