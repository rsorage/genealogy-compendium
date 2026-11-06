import { useEffect, useMemo, useState } from 'react';
import { Search, X, User, FileText, ArrowRight, BookOpen } from 'lucide-react';

interface Indice {
  pessoas: { id: string; nome: string; outros: string[]; vida: string; lugar: string; linha: string }[];
  documentos: { id: string; titulo: string; tipo: string; lugar: string; ano: number }[];
}

interface Props {
  aberta: boolean;
  aoFechar: () => void;
}

function normalizar(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const SUGESTOES = ['Luigi Suraci', 'Biase Cardillo', 'Francesca Versaci', 'Laganadi 1881', 'Padula catasto', 'Vecchia'];

/** Busca rápida (Ctrl+K) sobre pessoas e documentos publicados, mais o atalho para os nomes transcritos. */
export default function BuscaGlobal({ aberta, aoFechar }: Props) {
  const [q, setQ] = useState('');
  const [indice, setIndice] = useState<Indice | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aoFechar]);

  useEffect(() => {
    if (!aberta || indice || erro) return;
    fetch('/busca/indice.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setIndice)
      .catch(() => setErro(true));
  }, [aberta, indice, erro]);

  const termos = useMemo(() => normalizar(q).split(/\s+/).filter(Boolean), [q]);
  const pessoas = useMemo(
    () => (indice && termos.length ? indice.pessoas.filter((p) => termos.every((t) => normalizar(`${p.nome} ${p.outros.join(' ')} ${p.vida} ${p.lugar}`).includes(t))).slice(0, 6) : []),
    [indice, termos],
  );
  const documentos = useMemo(
    () => (indice && termos.length ? indice.documentos.filter((d) => termos.every((t) => normalizar(`${d.titulo} ${d.tipo} ${d.lugar} ${d.ano} ${d.id}`).includes(t))).slice(0, 6) : []),
    [indice, termos],
  );

  if (!aberta) return null;
  const consulta = q.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/50 backdrop-blur-xs" onClick={aoFechar} role="presentation">
      <div
        className="bg-[#FBF9F5] border border-[#E7E2D8] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Busca rápida"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E7E2D8]">
          <Search className="w-4 h-4 text-[#8C3A27] shrink-0" />
          <input
            autoFocus
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pessoa, documento, lugar, ano…"
            className="flex-1 bg-transparent text-base font-sans text-[#1C1917] focus:outline-none placeholder:text-[#A8A29E]"
            aria-label="Termos de busca"
          />
          <button onClick={aoFechar} className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded-md cursor-pointer" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto archive-scroll p-3 space-y-4 text-sm font-sans">
          {!consulta ? (
            <div className="space-y-2 px-1 py-2">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">Experimente</div>
              <div className="flex flex-wrap gap-2">
                {SUGESTOES.map((s) => (
                  <button key={s} onClick={() => setQ(s)} className="text-[11px] bg-white border border-[#E7E2D8] text-[#57534E] hover:text-[#8C3A27] hover:border-[#8C3A27] px-2.5 py-1 rounded-md cursor-pointer">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {erro && <p className="text-xs text-[#8C3A27] px-1">Não foi possível carregar o índice de busca.</p>}
              {pessoas.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C] px-1">Pessoas</div>
                  {pessoas.map((p) => (
                    <a key={p.id} href={`/pessoas/${p.id}/`} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white hover:bg-[#F5F0E6] border border-[#E7E2D8]">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <User className="w-4 h-4 text-[#8C3A27] shrink-0" />
                        <span className="truncate">
                          <span className="font-semibold text-[#1C1917]">{p.nome}</span>
                          {(p.vida || p.lugar) && <span className="text-[#78716C] text-xs"> · {[p.vida, p.lugar].filter(Boolean).join(' · ')}</span>}
                        </span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                    </a>
                  ))}
                </div>
              )}
              {documentos.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C] px-1">Documentos</div>
                  {documentos.map((d) => (
                    <a key={d.id} href={`/documentos/${d.id}/`} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white hover:bg-[#F5F0E6] border border-[#E7E2D8]">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-[#8C3A27] shrink-0" />
                        <span className="truncate">
                          <span className="font-semibold text-[#1C1917]">{d.titulo}</span>
                          <span className="text-[#78716C] text-xs"> · {d.tipo} · {d.lugar} · {d.ano}</span>
                        </span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                    </a>
                  ))}
                </div>
              )}
              {indice && pessoas.length === 0 && documentos.length === 0 && (
                <p className="text-xs text-[#78716C] px-1">Nenhuma pessoa ou documento com «{consulta}». Experimente os nomes transcritos:</p>
              )}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[#8C3A27] px-1">Registros vistos</div>
                <a href={`/registros-vistos/?q=${encodeURIComponent(consulta)}`} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white hover:bg-[#F5F0E6] border border-[#E7E2D8]">
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#8C3A27] shrink-0" />
                    <span>
                      <span className="font-semibold text-[#1C1917]">Buscar «{consulta}» nos nomes transcritos</span>
                      <span className="block text-[11px] text-[#78716C]">Ocorrências lidas nos livros consultados, com link para a imagem no portal de origem.</span>
                    </span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                </a>
              </div>
            </>
          )}
        </div>
        <div className="px-4 py-2 border-t border-[#E7E2D8] text-[10px] font-sans text-[#A8A29E] flex justify-between">
          <span>Esc fecha · Ctrl/Cmd+K abre</span>
          <span>Só pessoas e documentos publicados</span>
        </div>
      </div>
    </div>
  );
}
