/**
 * Lugares de nascimento: do comune (como está no acervo) para província, região e país,
 * para que os cartões não mostrem «Laganadi» seco. Jurisdição atual nos nomes de região;
 * a histórica (Principato Citra, Calabria Ulteriore…) fica para o dossiê.
 *
 * Um comune que não esteja aqui derruba o build de propósito: é melhor acrescentar uma
 * linha do que publicar um lugar sem contexto.
 */

export interface Lugar {
  /** O comune (ou a cidade) como veio do acervo, sem endereço nem sigla de estado. */
  nome: string;
  provincia?: string;
  regiao: string;
  pais: string;
  /** Leitura incerta no acervo («Padula (?)», «Br[i]ola (?)»). */
  incerto: boolean;
}

type Entrada = [provincia: string | undefined, regiao: string, pais: string];

const COMUNI: Record<string, Entrada> = {
  // Calábria
  Laganadi: ['Reggio Calabria', 'Calábria', 'Itália'],
  "Sant'Eufemia d'Aspromonte": ['Reggio Calabria', 'Calábria', 'Itália'],
  Scilla: ['Reggio Calabria', 'Calábria', 'Itália'],
  'San Giorgio Morgeto': ['Reggio Calabria', 'Calábria', 'Itália'],
  // Campânia (Cilento e Vallo di Diano)
  Padula: ['Salerno', 'Campânia', 'Itália'],
  Buonabitacolo: ['Salerno', 'Campânia', 'Itália'],
  'Casaletto Spartano': ['Salerno', 'Campânia', 'Itália'],
  Vibonati: ['Salerno', 'Campânia', 'Itália'],
  Roccagloriosa: ['Salerno', 'Campânia', 'Itália'],
  'San Mauro Cilento': ['Salerno', 'Campânia', 'Itália'],
  // Basilicata
  Lagonegro: ['Potenza', 'Basilicata', 'Itália'],
  // Sicília
  Messina: ['Messina', 'Sicília', 'Itália'],
  // Lombardia
  'Casalbuttano ed Uniti': ['Cremona', 'Lombardia', 'Itália'],
  // Brasil
  Carangola: [undefined, 'Minas Gerais', 'Brasil'],
  'Patrocínio do Muriaé': [undefined, 'Minas Gerais', 'Brasil'],
};

const ESTADOS_BR: Record<string, string> = { MG: 'Minas Gerais', RJ: 'Rio de Janeiro', SP: 'São Paulo', ES: 'Espírito Santo' };

/** Interpreta o lugar do acervo. Lança erro se o comune não estiver na tabela (e não for leitura incerta). */
export function lugarDe(bruto: string | undefined): Lugar | undefined {
  if (!bruto) return undefined;
  let nome = bruto.trim();
  const incerto = /\(\?\)\s*$/.test(nome) || nome.includes('[');
  nome = nome.replace(/\s*\(\?\)\s*$/, '');
  // endereço depois do comune: «Messina, Via Orti 10»
  nome = nome.replace(/,\s*(via|piazza|corso|vico|strada|contrada)\b.*$/i, '');
  // sigla de estado brasileiro: «Carangola (MG)»
  const estado = nome.match(/\s*\(([A-Z]{2})\)\s*$/);
  if (estado) nome = nome.replace(/\s*\([A-Z]{2}\)\s*$/, '');

  const e = COMUNI[nome];
  if (e) return { nome, provincia: e[0], regiao: e[1], pais: e[2], incerto };
  if (estado && ESTADOS_BR[estado[1]]) return { nome, regiao: ESTADOS_BR[estado[1]], pais: 'Brasil', incerto };
  if (incerto) return { nome: bruto.trim(), regiao: '', pais: '', incerto };
  throw new Error(`Lugar sem província/região/país na tabela src/lib/lugares.ts: «${bruto}»`);
}

/** «Reggio Calabria, Calábria, Itália» — o que vem depois do nome do comune. */
export function contextoDoLugar(l: Lugar): string {
  return [l.provincia, l.regiao, l.pais].filter(Boolean).join(', ');
}

/** Uma linha: «Laganadi · Reggio Calabria, Calábria, Itália». */
export function lugarLegivel(bruto: string | undefined): string {
  const l = lugarDe(bruto);
  if (!l) return '';
  const ctx = contextoDoLugar(l);
  return `${l.nome}${l.incerto ? ' (?)' : ''}${ctx ? ` · ${ctx}` : ''}`;
}
