import { useEffect, useMemo, useState } from 'react';
import { Search, ExternalLink, ArrowUp, ArrowDown, Users } from 'lucide-react';

export type FirmezaT = 'certa' | 'declarada' | 'provavel' | 'duvidosa';
export interface NoArvore {
  id: string;
  nome: string;
  vida: string;
  lugar: string;
  linha: string;
  sexo: 'M' | 'F' | '?';
  relacoes: { tipo: 'pai' | 'mae' | 'conjuge' | 'irmao' | 'filho'; pessoa: string; firmeza: FirmezaT }[];
}

interface Props {
  pessoas: NoArvore[];
  raizes: { id: string; rotulo: string }[];
  focoInicial: string;
  rotulosLinha: Record<string, string>;
}

const COR: Record<FirmezaT, string> = { certa: '#2A6F54', declarada: '#57534E', provavel: '#B07A1A', duvidosa: '#8C3A27' };
const ESTILO: Record<FirmezaT, string> = { certa: 'solid', declarada: 'dashed', provavel: 'dashed', duvidosa: 'dotted' };
const ROTULO_F: Record<FirmezaT, string> = { certa: 'certa', declarada: 'declarada', provavel: 'provável', duvidosa: 'duvidosa' };
const ORDEM_F: FirmezaT[] = ['certa', 'declarada', 'provavel', 'duvidosa'];

function normalizar(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function Cartao({
  no,
  firmeza,
  papel,
  destaque = false,
  aoFocar,
}: {
  no: NoArvore;
  firmeza?: FirmezaT;
  papel?: string;
  destaque?: boolean;
  aoFocar: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-stretch min-w-0">
      {firmeza && (
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-sans text-[#78716C] mb-1" title={`Parentesco ${ROTULO_F[firmeza]}`}>
          <span aria-hidden="true" className="inline-block w-5 border-t-2" style={{ borderTopStyle: ESTILO[firmeza] as 'solid', borderColor: COR[firmeza] }} />
          <span style={{ color: COR[firmeza] }}>{ROTULO_F[firmeza]}</span>
        </div>
      )}
      <div
        className={`rounded-lg border bg-white px-3 py-2 text-left transition-colors ${
          destaque ? 'border-[#8C3A27] shadow-sm' : 'border-[#E7E2D8] hover:border-[#8C3A27]'
        }`}
      >
        {papel && <div className="text-[10px] uppercase tracking-wider font-sans text-[#78716C]">{papel}</div>}
        <button onClick={() => aoFocar(no.id)} className="block w-full text-left cursor-pointer" title="Centrar a árvore nesta pessoa">
          <span className={`font-display font-semibold leading-snug text-[#1C1917] hover:text-[#8C3A27] ${destaque ? 'text-xl' : 'text-base'}`}>{no.nome}</span>
        </button>
        <div className="text-[11px] font-sans text-[#57534E] flex items-center justify-between gap-2">
          <span>
            {no.vida && <span className="font-mono tabular-nums text-[#8C3A27]">{no.vida}</span>}
            {no.vida && no.lugar && ' · '}
            {no.lugar}
          </span>
          <a href={`/pessoas/${no.id}/`} className="text-[#78716C] hover:text-[#8C3A27] shrink-0" title="Abrir o dossiê" aria-label={`Dossiê de ${no.nome}`}>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ArvoreExplorer({ pessoas, raizes, focoInicial, rotulosLinha }: Props) {
  const porId = useMemo(() => new Map(pessoas.map((p) => [p.id, p])), [pessoas]);
  const [foco, setFoco] = useState(focoInicial);
  const [q, setQ] = useState('');
  const [historico, setHistorico] = useState<string[]>([]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('pessoa');
    if (id && porId.has(id)) setFoco(id);
  }, [porId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('pessoa', foco);
    window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
  }, [foco]);

  const focar = (id: string) => {
    if (id === foco) return;
    setHistorico((h) => [...h.slice(-9), foco]);
    setFoco(id);
    setQ('');
  };

  const no = porId.get(foco) ?? pessoas[0];
  const rel = (tipo: NoArvore['relacoes'][number]['tipo']) =>
    no.relacoes.filter((r) => r.tipo === tipo).map((r) => ({ ...r, no: porId.get(r.pessoa)! })).filter((r) => r.no);
  const pais = [...rel('pai'), ...rel('mae')];
  const conjuges = rel('conjuge');
  const irmaos = rel('irmao');
  const filhos = rel('filho').sort((a, b) => (a.no.vida || '').localeCompare(b.no.vida || ''));
  // avós: os pais de cada pai/mãe, com a pior firmeza do caminho
  const avos = pais.flatMap((p) =>
    p.no.relacoes
      .filter((r) => r.tipo === 'pai' || r.tipo === 'mae')
      .map((r) => ({ ...r, no: porId.get(r.pessoa)!, via: p.no, firmeza: ORDEM_F[Math.max(ORDEM_F.indexOf(r.firmeza), ORDEM_F.indexOf(p.firmeza))] }))
      .filter((r) => r.no),
  );
  // irmãos inferidos: outros filhos dos mesmos pais (quando o acervo não tem sibling_of explícito)
  const irmaosInferidos = pais
    .flatMap((p) => p.no.relacoes.filter((r) => r.tipo === 'filho' && r.pessoa !== no.id).map((r) => ({ ...r, no: porId.get(r.pessoa)!, via: p.no })))
    .filter((r, i, a) => r.no && a.findIndex((x) => x.pessoa === r.pessoa) === i && !irmaos.some((s) => s.pessoa === r.pessoa))
    .sort((a, b) => (a.no.vida || '').localeCompare(b.no.vida || ''));

  const sugestoes = useMemo(() => {
    const termos = normalizar(q).split(/\s+/).filter(Boolean);
    if (!termos.length) return [];
    return pessoas.filter((p) => termos.every((t) => normalizar(`${p.nome} ${p.vida} ${p.lugar}`).includes(t))).slice(0, 8);
  }, [q, pessoas]);

  return (
    <section className="space-y-6" aria-label="Explorador da árvore">
      {/* Controles */}
      <div className="bg-white border border-[#E7E2D8] rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F4EFE6] rounded-lg w-fit">
          {raizes.map((r) => (
            <button
              key={r.id}
              onClick={() => focar(r.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                porId.get(foco)?.linha === porId.get(r.id)?.linha ? 'bg-white text-[#1C1917] shadow-xs font-semibold' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {r.rotulo}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C3A27] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Centrar em outra pessoa… (ex.: Biase Cardillo, Francesca Versaci)"
            aria-label="Procurar pessoa para centrar a árvore"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#D6CEBE] bg-[#FAF8F5] text-sm font-sans text-[#1C1917] focus:outline-none focus:border-[#8C3A27] focus:bg-white placeholder:text-[#A8A29E]"
          />
          {sugestoes.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#E7E2D8] rounded-lg shadow-lg overflow-hidden text-sm font-sans">
              {sugestoes.map((p) => (
                <li key={p.id}>
                  <button onClick={() => focar(p.id)} className="w-full text-left px-3 py-2 hover:bg-[#F5F0E6] cursor-pointer flex justify-between gap-3">
                    <span className="text-[#1C1917]">{p.nome}</span>
                    <span className="text-[#78716C] font-mono tabular-nums text-xs">{p.vida}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {historico.length > 0 && (
          <button
            onClick={() => {
              const anterior = historico[historico.length - 1];
              setHistorico((h) => h.slice(0, -1));
              setFoco(anterior);
            }}
            className="text-xs font-semibold text-[#8C3A27] hover:underline cursor-pointer whitespace-nowrap"
          >
            ← voltar a {porId.get(historico[historico.length - 1])?.nome}
          </button>
        )}
      </div>

      {/* Avós */}
      {avos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-sans font-semibold text-[#78716C]">
            <ArrowUp className="w-3 h-3" /> Avós
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {avos.map((a) => (
              <Cartao key={a.pessoa + a.via.id} no={a.no} firmeza={a.firmeza} papel={`${a.tipo === 'pai' ? 'pai' : 'mãe'} de ${a.via.nome.split(' ')[0]}`} aoFocar={focar} />
            ))}
          </div>
        </div>
      )}

      {/* Pais */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-sans font-semibold text-[#78716C]">
          <ArrowUp className="w-3 h-3" /> Pais
        </div>
        {pais.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
            {pais.map((p) => (
              <Cartao key={p.pessoa} no={p.no} firmeza={p.firmeza} papel={p.tipo === 'pai' ? 'pai' : 'mãe'} aoFocar={focar} />
            ))}
          </div>
        ) : (
          <p className="text-xs font-sans text-[#78716C] text-center">Pais não documentados — é aqui que a pesquisa continua.</p>
        )}
      </div>

      {/* Foco, cônjuges e irmãos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Cartao no={no} destaque aoFocar={focar} />
          {conjuges.map((c) => (
            <Cartao key={c.pessoa} no={c.no} firmeza={c.firmeza} papel="cônjuge" aoFocar={focar} />
          ))}
        </div>
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-sans font-semibold text-[#78716C]">
            <Users className="w-3 h-3" /> Irmãos
          </div>
          {irmaos.length + irmaosInferidos.length > 0 ? (
            <ul className="space-y-1.5">
              {[...irmaos, ...irmaosInferidos].map((i) => (
                <li key={i.pessoa} className="flex items-center justify-between gap-2 bg-white border border-[#E7E2D8] rounded-md px-3 py-1.5 text-sm font-sans">
                  <button onClick={() => focar(i.pessoa)} className="text-left text-[#1C1917] hover:text-[#8C3A27] cursor-pointer truncate">
                    {i.no.nome}
                  </button>
                  <span className="font-mono tabular-nums text-[11px] text-[#78716C] shrink-0">{i.no.vida}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs font-sans text-[#78716C]">Nenhum irmão documentado.</p>
          )}
        </div>
      </div>

      {/* Filhos */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-sans font-semibold text-[#78716C]">
          <ArrowDown className="w-3 h-3" /> Filhos
        </div>
        {filhos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filhos.map((f) => (
              <Cartao key={f.pessoa} no={f.no} firmeza={f.firmeza} aoFocar={focar} />
            ))}
          </div>
        ) : (
          <p className="text-xs font-sans text-[#78716C] text-center">Nenhum filho nascido na Itália documentado.</p>
        )}
      </div>

      <p className="text-[11px] font-sans text-[#78716C] border-t border-[#EFEAE0] pt-3">
        Linha de {rotulosLinha[no.linha] ?? no.linha}. Traço cheio: parentesco certo; tracejado: declarado ou provável; pontilhado: duvidoso. O dossiê
        de cada pessoa diz qual documento sustenta cada ligação.
      </p>
    </section>
  );
}
