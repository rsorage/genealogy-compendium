import type { APIRoute } from 'astro';
import { carregarAcervo } from '../../lib/pessoas-build';
import { ROTULO_TIPO_DOC, periodoVida } from '../../lib/pessoas';

/** Índice leve para a busca rápida (Ctrl+K): pessoas e documentos publicados. */
export const GET: APIRoute = async () => {
  const { pessoas, documentos } = await carregarAcervo();
  const indice = {
    pessoas: pessoas.filter((p) => !p.sem_dossie).map((p) => ({ id: p.id, nome: p.nome_exibicao, outros: p.nomes_alternativos, vida: periodoVida(p), lugar: p.nascimento?.lugar ?? '', linha: p.linha })),
    documentos: documentos.map((d) => ({ id: d.id, titulo: d.titulo, tipo: ROTULO_TIPO_DOC[d.tipo], lugar: d.lugar, ano: d.ano })),
  };
  return new Response(JSON.stringify(indice), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
