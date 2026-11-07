/**
 * Single route map of the site. The old views were tabs switched by React state (no URL);
 * now each one is a static page with its own address, which is what lets Google (and the
 * relatives) find them. Paths are visitor-facing, so they stay in Portuguese.
 */
export type SectionId = 'compendium' | 'tree' | 'records' | 'documents' | 'atlas' | 'fronts';

export interface Section {
  id: SectionId;
  path: string;
  label: string;
  shortLabel: string;
}

export const SECTIONS: Section[] = [
  { id: 'compendium', path: '/', label: 'O Compêndio', shortLabel: 'Compêndio' },
  { id: 'tree', path: '/arvore/', label: 'Pessoas e árvores', shortLabel: 'Pessoas' },
  { id: 'records', path: '/registros-vistos/', label: 'Registros vistos', shortLabel: 'Registros vistos' },
  { id: 'documents', path: '/documentos/', label: 'Documentos', shortLabel: 'Documentos' },
  { id: 'atlas', path: '/atlas/', label: 'Atlas da migração', shortLabel: 'Atlas' },
  { id: 'fronts', path: '/frentes/', label: 'Frentes de pesquisa', shortLabel: 'Frentes' },
];

/** Old tab names (App.tsx) → route. Kept while the generated components still use them. */
const LEGACY_TABS: Record<string, string> = {
  compendium: '/',
  tree: '/arvore/',
  'registros-vistos': '/registros-vistos/',
  records: '/documentos/',
  migration: '/atlas/',
  quest: '/frentes/',
};

export function pathOfTab(tab: string): string {
  return LEGACY_TABS[tab] ?? '/';
}

export function goTo(path: string): void {
  if (typeof window !== 'undefined') window.location.assign(path);
}

export function activeSection(pathname: string): SectionId {
  if (pathname === '/' || pathname === '') return 'compendium';
  if (pathname.startsWith('/pessoas/')) return 'tree';
  const found = SECTIONS.find((s) => s.path !== '/' && pathname.startsWith(s.path));
  return found?.id ?? 'compendium';
}

/** Reads a parameter of the current URL in the browser (islands that open an item from a link). */
export function urlParameter(name: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(name);
}
