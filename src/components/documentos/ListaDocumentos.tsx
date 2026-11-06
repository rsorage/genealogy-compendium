import { useMemo, useState } from 'react';
import { Search, ExternalLink, FileText } from 'lucide-react';

/** O que a lista precisa de cada documento (um subconjunto, serializado como props da ilha). */
export interface ResumoDocumento {
  id: string;
  titulo: string;
  tipoRotulo: string;
  ano: number;
  dataLegivel: string;
  lugar: string;
  linhas: string[];
  linhasRotulo: string;
  pessoas: string[];
  temLink: boolean;
  temTranscricao: boolean;
  caminho: string;
}

interface Props {
  documentos: ResumoDocumento[];
  rotulosLinha: Record<string, string>;
}

function normalizar(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export default function ListaDocumentos({ documentos, rotulosLinha }: Props) {
  const [q, setQ] = useState('');
  const [linha, setLinha] = useState('todas');
  const [tipo, setTipo] = useState('todos');
  const [lugar, setLugar] = useState('todos');
  const [ordem, setOrdem] = useState<'data' | 'lugar'>('data');

  const linhas = useMemo(() => [...new Set(documentos.flatMap((d) => d.linhas))].sort(), [documentos]);
  const tipos = useMemo(() => [...new Set(documentos.map((d) => d.tipoRotulo))].sort((a, b) => a.localeCompare(b, 'pt')), [documentos]);
  const lugares = useMemo(() => [...new Set(documentos.map((d) => d.lugar))].sort((a, b) => a.localeCompare(b, 'pt')), [documentos]);
  const termos = useMemo(() => normalizar(q).split(/\s+/).filter(Boolean), [q]);

  const lista = useMemo(() => {
    const r = documentos.filter((d) => {
      if (linha !== 'todas' && !d.linhas.includes(linha)) return false;
      if (tipo !== 'todos' && d.tipoRotulo !== tipo) return false;
      if (lugar !== 'todos' && d.lugar !== lugar) return false;
      if (termos.length === 0) return true;
      const alvo = normalizar([d.titulo, d.lugar, String(d.ano), d.tipoRotulo, d.id, ...d.pessoas].join(' '));
      return termos.every((t) => alvo.includes(t));
    });
    return ordem === 'lugar'
      ? [...r].sort((a, b) => a.lugar.localeCompare(b.lugar, 'pt') || a.ano - b.ano)
      : r;
  }, [documentos, linha, tipo, lugar, termos, ordem]);

  const filtrando = q.trim() || linha !== 'todas' || tipo !== 'todos' || lugar !== 'todos';

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
              ['Linha', linha, setLinha, [['todas', 'Todas as linhas'], ...linhas.map((l) => [l, rotulosLinha[l] ?? l])]],
              ['Tipo', tipo, setTipo, [['todos', 'Todos os tipos'], ...tipos.map((t) => [t, t])]],
              ['Lugar', lugar, setLugar, [['todos', 'Todos os lugares'], ...lugares.map((l) => [l, l])]],
              ['Ordem', ordem, setOrdem as (v: string) => void, [['data', 'Por data'], ['lugar', 'Por lugar e data']]],
            ] as [string, string, (v: string) => void, string[][]][]
          ).map(([rotulo, valor, setar, opcoes]) => (
            <label key={rotulo} className="block">
              <span className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">{rotulo}</span>
              <select
                value={valor}
                onChange={(e) => setar(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
              >
                {opcoes.map(([v, r]) => (
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
            <strong className="text-[#1C1917] font-mono tabular-nums">{lista.length}</strong> {lista.length === 1 ? 'documento' : 'documentos'}
            {filtrando ? ' com estes critérios' : ''}
          </span>
          {filtrando && (
            <button
              onClick={() => {
                setQ('');
                setLinha('todas');
                setTipo('todos');
                setLugar('todos');
              }}
              className="text-[#8C3A27] hover:underline font-semibold cursor-pointer"
            >
              Redefinir filtros
            </button>
          )}
        </div>
      </div>

      <ol className="divide-y divide-[#EFEAE0] border-y border-[#E7E2D8]">
        {lista.map((d) => (
          <li key={d.id} className="py-4 grid grid-cols-1 sm:grid-cols-[110px_minmax(0,1fr)_auto] gap-x-6 gap-y-1 items-start">
            <div className="font-mono text-sm tabular-nums text-[#8C3A27]">{d.dataLegivel}</div>
            <div className="min-w-0 space-y-1">
              <a href={d.caminho} className="font-display text-lg font-semibold text-[#1C1917] hover:text-[#8C3A27] leading-snug">
                {d.titulo}
              </a>
              <div className="text-xs font-sans text-[#57534E]">
                {d.tipoRotulo} · {d.lugar}
                <span className="text-[#A8A29E]"> · {d.linhasRotulo}</span>
              </div>
              {d.pessoas.length > 0 && (
                <div className="text-xs font-sans text-[#78716C] truncate">{d.pessoas.join(' · ')}</div>
              )}
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-2 text-[11px] font-sans text-[#78716C] shrink-0">
              {d.temLink ? (
                <span className="inline-flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> imagem no portal
                </span>
              ) : (
                <span>sem imagem pública</span>
              )}
              {d.temTranscricao && (
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
