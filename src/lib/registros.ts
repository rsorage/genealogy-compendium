/**
 * Registros vistos — utilidades partilhadas pelas páginas estáticas (build) e pela
 * ilha de busca (navegador). Nada aqui lê o acervo: só trabalha sobre o JSON exportado.
 */
import type { CollectionEntry } from 'astro:content';

export type Ocorrencia = CollectionEntry<'registrosNomes'>['data'];
export type Pagina = CollectionEntry<'registrosPaginas'>['data'];
export type MetaExportacao = CollectionEntry<'exportacao'>['data'];

/** Uma ocorrência acrescida do endereço da sua página estática no catálogo. */
export type OcorrenciaPublicada = Ocorrencia & { url_catalogo: string };

export interface Recorte {
  comune: string;
  serie: string;
  ano: string;
  /** Caminho absoluto, com barra final: /registros-vistos/catalogo/<comune>/<serie>/<ano>/ */
  caminho: string;
  linhas: OcorrenciaPublicada[];
}

export const BASE_CATALOGO = '/registros-vistos/catalogo/';

// ---------------------------------------------------------------- endereços

/**
 * Mesmo algoritmo do `slug()` do site anterior (catalogo_estatico.py), para que os
 * 217 endereços já indexados pelo Google continuem válidos:
 * NFKD → só ASCII → minúsculas → sequências não alfanuméricas viram «-» → sem «-» nas pontas;
 * vazio vira «sem-identificacao»; acima de 80 caracteres, corta em 70 e acrescenta 8 hex do sha256.
 */
export function slug(valor: string, sha256Hex8?: (texto: string) => string): string {
  let plano = valor
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase();
  plano = plano.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'sem-identificacao';
  if (plano.length > 80) {
    if (!sha256Hex8) throw new Error('slug longo exige função de hash');
    plano = plano.slice(0, 70).replace(/-+$/g, '') + '-' + sha256Hex8(valor);
  }
  return plano;
}

/** Agrupa as ocorrências por (localidade, série, ano) e atribui a cada uma o endereço do recorte. */
export function agruparRecortes(nomes: Ocorrencia[], sha256Hex8: (texto: string) => string): Recorte[] {
  const grupos = new Map<string, Recorte>();
  const rotas = new Map<string, string>();
  for (const linha of nomes) {
    const chave = JSON.stringify([linha.comune, linha.serie, linha.ano]);
    let grupo = grupos.get(chave);
    if (!grupo) {
      const caminho = BASE_CATALOGO + [linha.comune, linha.serie, linha.ano].map((v) => slug(v, sha256Hex8)).join('/') + '/';
      const dono = rotas.get(caminho);
      if (dono && dono !== chave) {
        throw new Error(`Dois recortes produzem o mesmo endereço; revisar os rótulos antes de gerar: ${caminho}`);
      }
      rotas.set(caminho, chave);
      grupo = { comune: linha.comune, serie: linha.serie, ano: linha.ano, caminho, linhas: [] };
      grupos.set(chave, grupo);
    }
    grupo.linhas.push({ ...linha, url_catalogo: grupo.caminho });
  }
  return [...grupos.values()].sort((a, b) =>
    a.comune.localeCompare(b.comune, 'pt') || a.serie.localeCompare(b.serie, 'pt') || a.ano.localeCompare(b.ano, 'pt'),
  );
}

/** Recortes agrupados por localidade, para as listagens. */
export function porLocalidade(recortes: Recorte[]): { comune: string; recortes: Recorte[] }[] {
  const mapa = new Map<string, Recorte[]>();
  for (const r of recortes) mapa.set(r.comune, [...(mapa.get(r.comune) ?? []), r]);
  return [...mapa.entries()].map(([comune, recortes]) => ({ comune, recortes }));
}

// ---------------------------------------------------------------- rótulos

export function nomeCompleto(o: Pick<Ocorrencia, 'nome' | 'sobrenome'>): string {
  return [o.nome, o.sobrenome].filter(Boolean).join(' ');
}

export function nomeConjuge(o: Pick<Ocorrencia, 'conjuge_nome' | 'conjuge_sobrenome'>): string {
  return [o.conjuge_nome, o.conjuge_sobrenome].filter(Boolean).join(' ');
}

/** O grau de leitura sem a ressalva entre parênteses. */
export function grauLeitura(leitura: string): 'certa' | 'provável' | 'duvidosa' {
  return leitura.split(' (')[0] as 'certa' | 'provável' | 'duvidosa';
}

/** A ressalva entre parênteses, quando há. */
export function ressalvaLeitura(leitura: string): string {
  const i = leitura.indexOf(' (');
  return i >= 0 ? leitura.slice(i + 2).replace(/\)$/, '') : '';
}

export function rotuloPapel(o: Pick<Ocorrencia, 'papel' | 'papeis'>): string {
  if (o.papeis.length === 1 && o.papeis[0] !== 'Pessoa registrada') return o.papeis[0];
  if (o.papel === 'mãe, declarante') return 'Mãe e declarante';
  return o.papel ? o.papel[0].toUpperCase() + o.papel.slice(1) : 'Outra menção';
}

export function referencia(o: Pick<Ocorrencia, 'serie' | 'ano' | 'parte' | 'num_atto' | 'imagem'>): string {
  return [
    o.serie,
    o.ano,
    o.parte ? `Parte ${o.parte}` : '',
    o.num_atto ? `Ato / n.º ${o.num_atto}` : '',
    o.imagem ? `Imagem ${o.imagem}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

/** 1884-01-05 → 05/01/1884; outros formatos ficam como estão. */
export function dataLegivel(valor: string): string {
  const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valor;
}

export function rotuloAto(o: Pick<Ocorrencia, 'num_atto' | 'parte'>): string {
  let rotulo = o.num_atto ? `Ato / n.º ${o.num_atto}` : 'Referência transcrita';
  if (o.parte) rotulo += ` · Parte ${o.parte}`;
  return rotulo;
}

export const ROTULO_COBERTURA: Record<Pagina['cobertura'], string> = {
  'lida inteira': 'Lida inteira',
  procurada: 'Só procurada',
  cabeçalho: 'Só o cabeçalho',
};

export const EXPLICACAO_COBERTURA: Record<Pagina['cobertura'], string> = {
  'lida inteira': 'Todas as linhas da imagem foram lidas em boa resolução.',
  procurada: 'Só procuramos sobrenomes; as linhas não foram todas lidas.',
  cabeçalho: 'Só identificamos o conteúdo da imagem.',
};

/** Ordena os atos de um recorte: parte, depois número (numérico), depois o resto. */
export function ordenarAtos(linhas: OcorrenciaPublicada[]): [string, OcorrenciaPublicada[]][] {
  const atos = new Map<string, OcorrenciaPublicada[]>();
  for (const l of linhas) {
    const chave = l.ato_id || l.id;
    atos.set(chave, [...(atos.get(chave) ?? []), l]);
  }
  return [...atos.entries()].sort(([ka, a], [kb, b]) => {
    const pa = a[0].parte.localeCompare(b[0].parte);
    if (pa) return pa;
    const na = /^\d+$/.test(a[0].num_atto) ? Number(a[0].num_atto) : 1e9;
    const nb = /^\d+$/.test(b[0].num_atto) ? Number(b[0].num_atto) : 1e9;
    return na - nb || a[0].num_atto.localeCompare(b[0].num_atto) || ka.localeCompare(kb);
  });
}

/** Âncora da seção de um ato na página estática. */
export function idSecaoAto(chave: string): string {
  return chave.startsWith('A-') ? chave : 'ref-' + chave;
}

/** JSON-LD BreadcrumbList para uma trilha de navegação (caminhos absolutos do site). */
export function jsonLdTrilha(itens: { nome: string; caminho: string }[], site = 'https://genealogia.rsorage.com'): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nome,
      item: site + item.caminho,
    })),
  }).replace(/</g, '\\u003c');
}
