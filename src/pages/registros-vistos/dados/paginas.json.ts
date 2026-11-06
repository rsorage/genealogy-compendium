import type { APIRoute } from 'astro';
import { carregarRegistros } from '../../../lib/registros-build';

/** Dados da aba «Páginas consultadas», carregados só quando a aba é aberta. */
export const GET: APIRoute = async () => {
  const { paginas } = await carregarRegistros();
  return new Response(JSON.stringify({ paginas }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
