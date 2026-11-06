/**
 * Lado do build (Node): carrega pessoas e documentos exportados e monta os índices que as
 * páginas usam. Não importar em código que roda no navegador.
 */
import { getCollection } from 'astro:content';
import type { Documento, Pessoa } from './pessoas';

export interface Acervo {
  pessoas: Pessoa[];
  documentos: Documento[];
  pessoaPorId: Map<string, Pessoa>;
  documentoPorId: Map<string, Documento>;
  /** documento → pessoas publicadas que ele nomeia */
  pessoasDoDocumento: Map<string, Pessoa[]>;
}

let cache: Promise<Acervo> | undefined;

export function carregarAcervo(): Promise<Acervo> {
  cache ??= (async () => {
    const [pe, de] = await Promise.all([getCollection('pessoas'), getCollection('documentos')]);
    const pessoas = pe.map((e) => e.data).sort((a, b) => a.nome_exibicao.localeCompare(b.nome_exibicao, 'pt'));
    const documentos = de.map((e) => e.data).sort((a, b) => a.data_documento.localeCompare(b.data_documento) || a.id.localeCompare(b.id));
    const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));
    const documentoPorId = new Map(documentos.map((d) => [d.id, d]));
    const pessoasDoDocumento = new Map<string, Pessoa[]>();
    for (const d of documentos) {
      pessoasDoDocumento.set(
        d.id,
        d.pessoas.map((x) => pessoaPorId.get(x.pessoa)).filter((x): x is Pessoa => !!x),
      );
    }
    // integridade: toda relação e toda aparição apontam para algo publicado
    for (const p of pessoas) {
      for (const r of p.relacoes) if (!pessoaPorId.has(r.pessoa)) throw new Error(`${p.id}: relação com pessoa não publicada ${r.pessoa}`);
      for (const a of p.aparece_em) if (!documentoPorId.has(a.documento)) throw new Error(`${p.id}: aparição em documento não publicado ${a.documento}`);
    }
    return { pessoas, documentos, pessoaPorId, documentoPorId, pessoasDoDocumento };
  })();
  return cache;
}
