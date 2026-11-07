import { useMemo, useState } from 'react';
import { Search, ExternalLink, FileText } from 'lucide-react';

/** What the list needs of each document (a subset, serialised as island props). */
export interface DocumentSummary {
  id: string;
  title: string;
  typeLabel: string;
  year: number;
  readableDate: string;
  place: string;
  lines: string[];
  linesLabel: string;
  persons: string[];
  hasLink: boolean;
  hasTranscription: boolean;
  path: string;
}

interface Props {
  documents: DocumentSummary[];
  lineLabels: Record<string, string>;
}

function normalize(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export default function DocumentList({ documents, lineLabels }: Props) {
  const [q, setQ] = useState('');
  const [line, setLine] = useState('all');
  const [type, setType] = useState('all');
  const [place, setPlace] = useState('all');
  const [order, setOrder] = useState<'date' | 'place'>('date');

  const lines = useMemo(() => [...new Set(documents.flatMap((d) => d.lines))].sort(), [documents]);
  const types = useMemo(() => [...new Set(documents.map((d) => d.typeLabel))].sort((a, b) => a.localeCompare(b, 'pt')), [documents]);
  const places = useMemo(() => [...new Set(documents.map((d) => d.place))].sort((a, b) => a.localeCompare(b, 'pt')), [documents]);
  const terms = useMemo(() => normalize(q).split(/\s+/).filter(Boolean), [q]);

  const list = useMemo(() => {
    const r = documents.filter((d) => {
      if (line !== 'all' && !d.lines.includes(line)) return false;
      if (type !== 'all' && d.typeLabel !== type) return false;
      if (place !== 'all' && d.place !== place) return false;
      if (terms.length === 0) return true;
      const haystack = normalize([d.title, d.place, String(d.year), d.typeLabel, d.id, ...d.persons].join(' '));
      return terms.every((t) => haystack.includes(t));
    });
    return order === 'place'
      ? [...r].sort((a, b) => a.place.localeCompare(b.place, 'pt') || a.year - b.year)
      : r;
  }, [documents, line, type, place, terms, order]);

  const filtering = q.trim() || line !== 'all' || type !== 'all' || place !== 'all';

  return (
    <section className="space-y-5" aria-label="Lista de documentos">
      <div className="bg-white border border-[#E7E2D8] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C3A27] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nome, lugar, ano, identificador… (ex.: Suraci 1881, Padula catasto, IT-CAR-042)"
            aria-label="Filtrar documentos"
            className="w-full pl-10 pr-20 py-2.5 rounded-lg border border-[#D6CEBE] bg-[#FAF8F5] text-sm font-sans text-[#1C1917] focus:outline-none focus:border-[#8C3A27] focus:bg-white transition-all placeholder:text-[#A8A29E]"
          />
          {q && (
            <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78716C] hover:text-[#1C1917] cursor-pointer">
              Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-sans">
          {(
            [
              ['Linha', line, setLine, [['all', 'Todas as linhas'], ...lines.map((l) => [l, lineLabels[l] ?? l])]],
              ['Tipo', type, setType, [['all', 'Todos os tipos'], ...types.map((t) => [t, t])]],
              ['Lugar', place, setPlace, [['all', 'Todos os lugares'], ...places.map((l) => [l, l])]],
              ['Ordem', order, setOrder as (v: string) => void, [['date', 'Por data'], ['place', 'Por lugar e data']]],
            ] as [string, string, (v: string) => void, string[][]][]
          ).map(([label, value, set, options]) => (
            <label key={label} className="block">
              <span className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">{label}</span>
              <select
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
              >
                {options.map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs text-[#57534E]">
          <span>
            <strong className="text-[#1C1917] font-mono tabular-nums">{list.length}</strong> {list.length === 1 ? 'documento' : 'documentos'}
            {filtering ? ' com estes critérios' : ''}
          </span>
          {filtering && (
            <button
              onClick={() => {
                setQ('');
                setLine('all');
                setType('all');
                setPlace('all');
              }}
              className="text-[#8C3A27] hover:underline font-semibold cursor-pointer"
            >
              Redefinir filtros
            </button>
          )}
        </div>
      </div>

      <ol className="divide-y divide-[#EFEAE0] border-y border-[#E7E2D8]">
        {list.map((d) => (
          <li key={d.id} className="py-4 grid grid-cols-1 sm:grid-cols-[110px_minmax(0,1fr)_auto] gap-x-6 gap-y-1 items-start">
            <div className="font-mono text-sm tabular-nums text-[#8C3A27]">{d.readableDate}</div>
            <div className="min-w-0 space-y-1">
              <a href={d.path} className="font-display text-lg font-semibold text-[#1C1917] hover:text-[#8C3A27] leading-snug">
                {d.title}
              </a>
              <div className="text-xs font-sans text-[#57534E]">
                {d.typeLabel} · {d.place}
                <span className="text-[#A8A29E]"> · {d.linesLabel}</span>
              </div>
              {d.persons.length > 0 && (
                <div className="text-xs font-sans text-[#78716C] truncate">{d.persons.join(' · ')}</div>
              )}
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-2 text-[11px] font-sans text-[#78716C] shrink-0">
              {d.hasLink ? (
                <span className="inline-flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> imagem no portal
                </span>
              ) : (
                <span>sem imagem pública</span>
              )}
              {d.hasTranscription && (
                <span className="inline-flex items-center gap-1">
                  <FileText className="w-3 h-3" /> transcrição
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
