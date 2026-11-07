import { useEffect, useMemo, useState } from 'react';
import { Search, X, User, FileText, ArrowRight, BookOpen } from 'lucide-react';

interface SearchIndex {
  persons: { id: string; name: string; aliases: string[]; life: string; place: string; line: string }[];
  documents: { id: string; title: string; type: string; place: string; year: number }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

function normalize(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const SUGGESTIONS = ['Luigi Suraci', 'Biase Cardillo', 'Francesca Versaci', 'Laganadi 1881', 'Padula catasto', 'Vecchia'];

/** Quick search (Ctrl+K) over published persons and documents, plus the shortcut to the transcribed names. */
export default function GlobalSearch({ open, onClose }: Props) {
  const [q, setQ] = useState('');
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!open || index || failed) return;
    fetch('/busca/indice.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setIndex)
      .catch(() => setFailed(true));
  }, [open, index, failed]);

  const terms = useMemo(() => normalize(q).split(/\s+/).filter(Boolean), [q]);
  const persons = useMemo(
    () => (index && terms.length ? index.persons.filter((p) => terms.every((t) => normalize(`${p.name} ${p.aliases.join(' ')} ${p.life} ${p.place}`).includes(t))).slice(0, 6) : []),
    [index, terms],
  );
  const documents = useMemo(
    () => (index && terms.length ? index.documents.filter((d) => terms.every((t) => normalize(`${d.title} ${d.type} ${d.place} ${d.year} ${d.id}`).includes(t))).slice(0, 6) : []),
    [index, terms],
  );

  if (!open) return null;
  const query = q.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/50 backdrop-blur-xs" onClick={onClose} role="presentation">
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
          <button onClick={onClose} className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded-md cursor-pointer" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto archive-scroll p-3 space-y-4 text-sm font-sans">
          {!query ? (
            <div className="space-y-2 px-1 py-2">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">Experimente</div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setQ(s)} className="text-[11px] bg-white border border-[#E7E2D8] text-[#57534E] hover:text-[#8C3A27] hover:border-[#8C3A27] px-2.5 py-1 rounded-md cursor-pointer">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {failed && <p className="text-xs text-[#8C3A27] px-1">Não foi possível carregar o índice de busca.</p>}
              {persons.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C] px-1">Pessoas</div>
                  {persons.map((p) => (
                    <a key={p.id} href={`/pessoas/${p.id}/`} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white hover:bg-[#F5F0E6] border border-[#E7E2D8]">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <User className="w-4 h-4 text-[#8C3A27] shrink-0" />
                        <span className="truncate">
                          <span className="font-semibold text-[#1C1917]">{p.name}</span>
                          {(p.life || p.place) && <span className="text-[#78716C] text-xs"> · {[p.life, p.place].filter(Boolean).join(' · ')}</span>}
                        </span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                    </a>
                  ))}
                </div>
              )}
              {documents.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C] px-1">Documentos</div>
                  {documents.map((d) => (
                    <a key={d.id} href={`/documentos/${d.id}/`} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white hover:bg-[#F5F0E6] border border-[#E7E2D8]">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-[#8C3A27] shrink-0" />
                        <span className="truncate">
                          <span className="font-semibold text-[#1C1917]">{d.title}</span>
                          <span className="text-[#78716C] text-xs"> · {d.type} · {d.place} · {d.year}</span>
                        </span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                    </a>
                  ))}
                </div>
              )}
              {index && persons.length === 0 && documents.length === 0 && (
                <p className="text-xs text-[#78716C] px-1">Nenhuma pessoa ou documento com «{query}». Experimente os nomes transcritos:</p>
              )}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[#8C3A27] px-1">Registros vistos</div>
                <a href={`/registros-vistos/?q=${encodeURIComponent(query)}`} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white hover:bg-[#F5F0E6] border border-[#E7E2D8]">
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#8C3A27] shrink-0" />
                    <span>
                      <span className="font-semibold text-[#1C1917]">Buscar «{query}» nos nomes transcritos</span>
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
