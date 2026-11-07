/**
 * Build side (Node): loads the exported collections and builds the catalogue slices.
 * Do not import from code that runs in the browser.
 */
import { createHash } from 'node:crypto';
import { getCollection } from 'astro:content';
import { groupSlices, type RecordsMeta, type Occurrence, type Page, type Slice } from './records';

export function sha256Hex8(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 8);
}

export interface RecordsData {
  meta: RecordsMeta;
  names: Occurrence[];
  pages: Page[];
  slices: Slice[];
}

let cache: Promise<RecordsData> | undefined;

/** Loads once per build; the catalogue pages call this hundreds of times. */
export function loadRecords(): Promise<RecordsData> {
  cache ??= (async () => {
    const [nameEntries, pageEntries, metaEntries] = await Promise.all([
      getCollection('recordNames'),
      getCollection('recordPages'),
      getCollection('recordsMeta'),
    ]);
    const meta = metaEntries[0]?.data;
    if (!meta) throw new Error('src/content/records/meta.json missing: run the exporter.');
    const names = nameEntries.map((e) => e.data);
    const pages = pageEntries.map((e) => e.data);
    return { meta, names, pages, slices: groupSlices(names, sha256Hex8) };
  })();
  return cache;
}

/** Catalogue path → route parameter (comune/series/year), without the base and without surrounding slashes. */
export function sliceParameter(s: Slice): string {
  return s.path.slice('/registros-vistos/catalogo/'.length, -1);
}
