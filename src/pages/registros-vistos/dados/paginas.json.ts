import type { APIRoute } from 'astro';
import { loadRecords } from '../../../lib/records-build';

/** Data of the «Páginas consultadas» tab, loaded only when the tab is opened. */
export const GET: APIRoute = async () => {
  const { pages } = await loadRecords();
  return new Response(JSON.stringify({ pages }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
