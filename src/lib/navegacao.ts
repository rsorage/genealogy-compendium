/**
 * Mapa único de rotas do site. As vistas antigas eram abas trocadas por estado
 * React (sem URL); agora cada uma é uma página estática com endereço próprio,
 * o que é o que permite ao Google (e aos parentes) encontrá-las.
 */
export type SecaoId = 'compendio' | 'arvore' | 'registros-vistos' | 'documentos' | 'atlas' | 'frentes';

export interface Secao {
  id: SecaoId;
  caminho: string;
  rotulo: string;
  rotuloCurto: string;
}

export const SECOES: Secao[] = [
  { id: 'compendio', caminho: '/', rotulo: 'O Compêndio', rotuloCurto: 'Compêndio' },
  { id: 'arvore', caminho: '/arvore/', rotulo: 'Árvores de linhagem', rotuloCurto: 'Árvores' },
  { id: 'registros-vistos', caminho: '/registros-vistos/', rotulo: 'Registros vistos', rotuloCurto: 'Registros vistos' },
  { id: 'documentos', caminho: '/documentos/', rotulo: 'Documentos', rotuloCurto: 'Documentos' },
  { id: 'atlas', caminho: '/atlas/', rotulo: 'Atlas da migração', rotuloCurto: 'Atlas' },
  { id: 'frentes', caminho: '/frentes/', rotulo: 'Frentes de pesquisa', rotuloCurto: 'Frentes' },
];

/** Nomes das abas antigas (App.tsx) → rota. Mantido enquanto os componentes gerados ainda os usam. */
const ABAS_ANTIGAS: Record<string, string> = {
  compendium: '/',
  tree: '/arvore/',
  'registros-vistos': '/registros-vistos/',
  records: '/documentos/',
  migration: '/atlas/',
  quest: '/frentes/',
};

export function caminhoDaAba(aba: string): string {
  return ABAS_ANTIGAS[aba] ?? '/';
}

export function irPara(caminho: string): void {
  if (typeof window !== 'undefined') window.location.assign(caminho);
}

export function secaoAtiva(pathname: string): SecaoId {
  if (pathname === '/' || pathname === '') return 'compendio';
  const achada = SECOES.find((s) => s.caminho !== '/' && pathname.startsWith(s.caminho));
  return achada?.id ?? 'compendio';
}

/** Lê um parâmetro da URL atual no navegador (ilhas que abrem um item a partir de um link). */
export function parametroDaUrl(nome: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(nome);
}
