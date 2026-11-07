/**
 * Build side (Node): loads the exported persons and documents and builds the indexes the
 * pages use. Do not import from code that runs in the browser.
 */
import { getCollection } from 'astro:content';
import type { Document, Person } from './persons';

export interface Archive {
  persons: Person[];
  documents: Document[];
  personById: Map<string, Person>;
  documentById: Map<string, Document>;
  /** document → published persons it names */
  personsOfDocument: Map<string, Person[]>;
}

let cache: Promise<Archive> | undefined;

export function loadArchive(): Promise<Archive> {
  cache ??= (async () => {
    const [pe, de] = await Promise.all([getCollection('persons'), getCollection('documents')]);
    const persons = pe.map((e) => e.data).sort((a, b) => a.display_name.localeCompare(b.display_name, 'pt'));
    const documents = de.map((e) => e.data).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    const personById = new Map(persons.map((p) => [p.id, p]));
    const documentById = new Map(documents.map((d) => [d.id, d]));
    const personsOfDocument = new Map<string, Person[]>();
    for (const d of documents) {
      personsOfDocument.set(
        d.id,
        d.persons.map((x) => personById.get(x.person)).filter((x): x is Person => !!x),
      );
    }
    // integrity: every relation and every appearance points to something published
    for (const p of persons) {
      for (const r of p.relations) if (!personById.has(r.person)) throw new Error(`${p.id}: relation with unpublished person ${r.person}`);
      for (const a of p.appearances) if (!documentById.has(a.document)) throw new Error(`${p.id}: appearance in unpublished document ${a.document}`);
    }
    return { persons, documents, personById, documentById, personsOfDocument };
  })();
  return cache;
}
