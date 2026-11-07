import type { APIRoute } from 'astro';
import { loadArchive } from '../../lib/persons-build';
import { documentTypeLabel, lifeSpan } from '../../lib/persons';
import { placeLabel } from '../../lib/places';

/** Light index for the quick search (Ctrl+K): published persons and documents. */
export const GET: APIRoute = async () => {
  const { persons, documents } = await loadArchive();
  const index = {
    persons: persons
      .filter((p) => !p.no_dossier)
      .map((p) => ({ id: p.id, name: p.display_name, aliases: p.aliases, life: lifeSpan(p), place: placeLabel(p.birth?.place), line: p.line })),
    documents: documents.map((d) => ({ id: d.id, title: d.title, type: documentTypeLabel(d), place: d.place, year: d.year })),
  };
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
