import type { APIRoute } from 'astro';
import { carregarRegistros } from '../../../lib/registros-build';

/** Dados da aba «Nomes transcritos», carregados pela ilha de busca. Já validados pelo build. */
export const GET: APIRoute = async () => {
  const { meta, recortes } = await carregarRegistros();
  const nomes = recortes.flatMap((r) => r.linhas);
  return new Response(JSON.stringify({ meta, nomes }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
