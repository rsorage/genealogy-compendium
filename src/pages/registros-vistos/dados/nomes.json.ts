import type { APIRoute } from 'astro';
import { loadRecords } from '../../../lib/records-build';

/** Data of the «Nomes transcritos» tab, loaded by the search island. Already validated by the build. */
export const GET: APIRoute = async () => {
  const { meta, slices } = await loadRecords();
  const names = slices.flatMap((s) => s.rows);
  return new Response(JSON.stringify({ meta, names }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
