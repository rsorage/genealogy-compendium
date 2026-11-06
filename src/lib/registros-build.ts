/**
 * Lado do build (Node): carrega as coleções exportadas e monta os recortes do catálogo.
 * Não importar em código que roda no navegador.
 */
import { createHash } from 'node:crypto';
import { getCollection } from 'astro:content';
import { agruparRecortes, type MetaExportacao, type Ocorrencia, type Pagina, type Recorte } from './registros';

export function sha256Hex8(texto: string): string {
  return createHash('sha256').update(texto, 'utf8').digest('hex').slice(0, 8);
}

export interface DadosRegistros {
  meta: MetaExportacao;
  nomes: Ocorrencia[];
  paginas: Pagina[];
  recortes: Recorte[];
}

let cache: Promise<DadosRegistros> | undefined;

/** Carrega uma vez por build; as páginas do catálogo chamam isto centenas de vezes. */
export function carregarRegistros(): Promise<DadosRegistros> {
  cache ??= (async () => {
    const [nomesEntradas, paginasEntradas, metaEntradas] = await Promise.all([
      getCollection('registrosNomes'),
      getCollection('registrosPaginas'),
      getCollection('exportacao'),
    ]);
    const meta = metaEntradas[0]?.data;
    if (!meta) throw new Error('src/content/registros-vistos/meta.json ausente: rode o exportador.');
    const nomes = nomesEntradas.map((e) => e.data);
    const paginas = paginasEntradas.map((e) => e.data);
    return { meta, nomes, paginas, recortes: agruparRecortes(nomes, sha256Hex8) };
  })();
  return cache;
}

/** Caminho do catálogo → parâmetros de rota (comune/serie/ano), sem a base e sem barras nas pontas. */
export function parametroRecorte(r: Recorte): string {
  return r.caminho.slice('/registros-vistos/catalogo/'.length, -1);
}
