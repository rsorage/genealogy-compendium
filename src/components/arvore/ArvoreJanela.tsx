import { useEffect, useMemo, useState } from 'react';
import { Anchor, ArrowUp, Briefcase, ChevronRight, MapPin, Search } from 'lucide-react';

export type FirmezaT = 'certa' | 'declarada' | 'provavel' | 'duvidosa';
export type TipoRel = 'pai' | 'mae' | 'conjuge' | 'irmao' | 'filho';

export interface NoJanela {
  id: string;
  nome: string;
  outros: string[];
  vida: string;
  lugar: string;
  ocupacao: string;
  emigracao: string;
  linha: string;
  sexo: 'M' | 'F' | '?';
  ancora?: string;
  semDossie: boolean;
  carecePesquisa: boolean;
  relacoes: { tipo: TipoRel; pessoa: string; firmeza: FirmezaT; rotuloFonte: string; documento?: string }[];
}

export interface Modo {
  id: string;
  rotulo: string;
  /** raiz: uma pessoa (linha) ou um casal (os avós) */
  raiz: string[];
  linhas: string[];
}

interface Props {
  pessoas: NoJanela[];
  modos: Modo[];
}

const COR_F: Record<FirmezaT, string> = { certa: '#2A6F54', declarada: '#57534E', provavel: '#B07A1A', duvidosa: '#8C3A27' };
const ESTILO_F: Record<FirmezaT, 'solid' | 'dashed' | 'dotted'> = { certa: 'solid', declarada: 'dashed', provavel: 'dashed', duvidosa: 'dotted' };
const ROTULO_F: Record<FirmezaT, string> = { certa: 'certa', declarada: 'declarada', provavel: 'provável', duvidosa: 'duvidosa' };
const COR_LINHA: Record<string, string> = { suraci: '#8C3A27', vecchia: '#8C3A27', cardillo: '#2B6CB0', marsicano: '#2B6CB0', rede: '#78716C' };
const ROTULO_LINHA: Record<string, string> = { suraci: 'Suraci → Sorage', vecchia: 'Vecchia', cardillo: 'Cardillo → Cardilo', marsicano: 'Marsicano', rede: 'Rede' };

function normalizar(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

type Rel = NoJanela['relacoes'][number];

function Cartao({
  no,
  papel,
  ligacao,
  destaque = false,
  temPais,
  aoSubir,
}: {
  no: NoJanela;
  papel: string;
  ligacao?: Rel;
  destaque?: boolean;
  temPais: boolean;
  aoSubir: (id: string) => void;
}) {
  return (
    <article
      className={`bg-white border rounded-xl p-4 flex flex-col justify-between min-w-0 ${
        destaque ? 'border-[#8C3A27] shadow-sm' : 'border-[#E7E2D8]'
      }`}
    >
      <div className="space-y-3 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] font-sans">
          <span className="font-mono font-semibold uppercase tracking-wider bg-[#F5F0E6] text-[#8C3A27] px-2 py-0.5 rounded">{papel}</span>
          <span className="font-mono tabular-nums text-[#78716C]">{no.vida || 's.d.'}</span>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-[#1C1917] leading-snug">{no.nome}</h3>
          {no.outros.length > 0 && (
            <p className="text-xs font-editorial italic text-[#78716C] mt-0.5">
              Também escrito: <span className="font-sans font-medium text-[#44403C] not-italic">{no.outros.slice(0, 3).join(', ')}</span>
            </p>
          )}
        </div>
        <div className="space-y-1.5 text-xs text-[#57534E] font-sans pt-2 border-t border-[#F4EFE6] min-w-0">
          {no.lugar && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
              <span className="text-[#292524] truncate">{no.lugar}</span>
            </div>
          )}
          {no.emigracao && (
            <div className="flex items-center gap-1.5 text-[#8C3A27] font-medium">
              <Anchor className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{no.emigracao}</span>
            </div>
          )}
          {no.ocupacao && (
            <div className="flex items-center gap-1.5 text-[#78716C]">
              <Briefcase className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
              <span className="truncate">{no.ocupacao}</span>
            </div>
          )}
          {no.carecePesquisa && <div className="text-[11px] text-[#8A5A14] bg-[#FBF4E6] border border-[#EBD9B4] rounded px-2 py-0.5 inline-block">carece pesquisa</div>}
          {ligacao && (
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: COR_F[ligacao.firmeza] }} title={ligacao.rotuloFonte}>
              <span aria-hidden="true" className="inline-block w-4 border-t-2" style={{ borderTopStyle: ESTILO_F[ligacao.firmeza], borderColor: COR_F[ligacao.firmeza] }} />
              <span className="truncate">ligação {ROTULO_F[ligacao.firmeza]} · {ligacao.rotuloFonte}</span>
            </div>
          )}
        </div>
      </div>
      <div className="pt-3 mt-3 border-t border-[#F4EFE6] flex items-center justify-between text-[11px] font-sans">
        {temPais ? (
          <button onClick={() => aoSubir(no.id)} className="inline-flex items-center gap-1 text-[#8C3A27] font-semibold hover:underline cursor-pointer">
            <ArrowUp className="w-3 h-3" /> Subir
          </button>
        ) : (
          <span className="text-[#A8A29E]">pais não documentados</span>
        )}
        {no.semDossie ? (
          <span className="text-[#A8A29E]">sem dossiê</span>
        ) : (
          <a href={`/pessoas/${no.id}/`} className="inline-flex items-center gap-0.5 text-[#8C3A27] font-medium hover:underline">
            Dossiê <ChevronRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </article>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <div className="border border-dashed border-[#D6CEBE] rounded-xl p-4 flex items-center justify-center text-center text-xs font-sans text-[#A8A29E] min-h-[120px]">
      {texto}
    </div>
  );
}

/** Barra de casamento entre dois cartões, com o ato ou a referência. */
function Casamento({ a, b }: { a: NoJanela; b?: NoJanela }) {
  if (!b) return null;
  const rel = a.relacoes.find((r) => r.tipo === 'conjuge' && r.pessoa === b.id);
  if (!rel) return <div className="h-5" />;
  return (
    <div className="flex items-center justify-center gap-2 text-[11px] font-sans text-[#78716C] py-1.5">
      <span aria-hidden="true" className="h-px w-8 border-t-2" style={{ borderTopStyle: ESTILO_F[rel.firmeza], borderColor: COR_F[rel.firmeza] }} />
      <span>
        ∞ casamento ·{' '}
        {rel.documento ? (
          <a href={`/documentos/${rel.documento}/`} className="text-[#8C3A27] hover:underline">
            {rel.rotuloFonte}
          </a>
        ) : (
          <span className="italic">{rel.rotuloFonte}</span>
        )}
      </span>
      <span aria-hidden="true" className="h-px w-8 border-t-2" style={{ borderTopStyle: ESTILO_F[rel.firmeza], borderColor: COR_F[rel.firmeza] }} />
    </div>
  );
}

function Haste({ firmeza }: { firmeza?: FirmezaT }) {
  return <div aria-hidden="true" className="mx-auto h-6 w-0 border-l-2" style={{ borderLeftStyle: firmeza ? ESTILO_F[firmeza] : 'dashed', borderColor: firmeza ? COR_F[firmeza] : '#D6CEBE' }} />;
}

export default function ArvoreJanela({ pessoas, modos }: Props) {
  const porId = useMemo(() => new Map(pessoas.map((p) => [p.id, p])), [pessoas]);
  const [raiz, setRaiz] = useState<string[]>(modos[0].raiz);
  const [trilha, setTrilha] = useState<{ rotulo: string; raiz: string[] }[]>([{ rotulo: modos[0].rotulo, raiz: modos[0].raiz }]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('pessoa');
    if (id && porId.has(id) && !modos.some((m) => m.raiz.length === 1 && m.raiz[0] === id)) {
      setRaiz([id]);
      setTrilha([{ rotulo: modos[0].rotulo, raiz: modos[0].raiz }, { rotulo: porId.get(id)!.nome, raiz: [id] }]);
    }
  }, [porId, modos]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (raiz.length === 1) params.set('pessoa', raiz[0]);
    else params.delete('pessoa');
    const busca = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (busca ? `?${busca}` : ''));
  }, [raiz]);

  const pais = (id: string) => {
    const no = porId.get(id);
    const pai = no?.relacoes.find((r) => r.tipo === 'pai');
    const mae = no?.relacoes.find((r) => r.tipo === 'mae');
    return { pai, mae, paiNo: pai && porId.get(pai.pessoa), maeNo: mae && porId.get(mae.pessoa) };
  };
  const temPais = (id: string) => !!(pais(id).paiNo || pais(id).maeNo);

  const irPara = (modo: Modo) => {
    setRaiz(modo.raiz);
    setTrilha([{ rotulo: modo.rotulo, raiz: modo.raiz }]);
    setQ('');
  };
  const subir = (id: string) => {
    const no = porId.get(id)!;
    setRaiz([id]);
    setTrilha((t) => [...t, { rotulo: no.nome, raiz: [id] }]);
    setQ('');
  };
  const voltar = (i: number) => {
    setRaiz(trilha[i].raiz);
    setTrilha((t) => t.slice(0, i + 1));
  };

  const sugestoes = useMemo(() => {
    const termos = normalizar(q).split(/\s+/).filter(Boolean);
    if (!termos.length) return [];
    return pessoas.filter((p) => termos.every((t) => normalizar(`${p.nome} ${p.outros.join(' ')} ${p.vida} ${p.lugar}`).includes(t))).slice(0, 8);
  }, [q, pessoas]);

  const modoAtivo = modos.find((m) => m.raiz.join() === raiz.join()) ?? modos.find((m) => raiz.length === 1 && m.linhas.includes(porId.get(raiz[0])!.linha));
  const casal = raiz.length === 2;
  const nos = raiz.map((id) => porId.get(id)!);

  // Níveis acima da raiz: para um casal, só os pais (2 casais); para uma pessoa, pais e avós.
  const nivel1 = nos.map((n) => ({ de: n, ...pais(n.id) }));
  // nivel2[i]: avô/avó i (0 avô paterno, 1 avó paterna, 2 avô materno, 3 avó materna) com a ligação até o pai/mãe
  const nivel2 = casal
    ? []
    : nivel1.flatMap((p) =>
        [p.paiNo, p.maeNo].flatMap((x) => {
          if (!x) return [null, null];
          const g = pais(x.id);
          return [g.paiNo ? { de: g.paiNo, ligacao: g.pai } : null, g.maeNo ? { de: g.maeNo, ligacao: g.mae } : null];
        }),
      );

  return (
    <div className="space-y-6">
      {/* Modos + busca */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E7E2D8] shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#F4EFE6] rounded-lg overflow-x-auto scrollbar-none">
          {modos.map((m) => (
            <button
              key={m.id}
              onClick={() => irPara(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                modoAtivo?.id === m.id ? 'bg-white text-[#1C1917] shadow-xs font-semibold' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {m.rotulo}
            </button>
          ))}
        </div>
        <div className="relative lg:w-80">
          <Search className="w-4 h-4 text-[#8C3A27] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Começar a árvore em… (nome)"
            aria-label="Procurar pessoa para pôr no pé da árvore"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D6CEBE] bg-[#FAF8F5] text-sm font-sans text-[#1C1917] focus:outline-none focus:border-[#8C3A27] focus:bg-white placeholder:text-[#A8A29E]"
          />
          {sugestoes.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#E7E2D8] rounded-lg shadow-lg overflow-hidden text-sm font-sans">
              {sugestoes.map((p) => (
                <li key={p.id}>
                  <button onClick={() => subir(p.id)} className="w-full text-left px-3 py-2 hover:bg-[#F5F0E6] cursor-pointer flex justify-between gap-3">
                    <span className="text-[#1C1917]">{p.nome}</span>
                    <span className="text-[#78716C] font-mono tabular-nums text-xs">{p.vida}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Trilha da subida */}
      <nav className="flex flex-wrap items-center gap-2 text-xs font-sans text-[#78716C]" aria-label="Por onde subiu">
        {trilha.map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">›</span>}
            {i < trilha.length - 1 ? (
              <button onClick={() => voltar(i)} className="text-[#8C3A27] hover:underline cursor-pointer">
                {t.rotulo}
              </button>
            ) : (
              <span className="text-[#1C1917] font-semibold">{t.rotulo}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Nível 2: avós (só quando a raiz é uma pessoa) */}
      {!casal && (
        <section aria-label="Avós" className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest font-sans font-semibold text-[#78716C]">Avós</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {nivel2.map((g, i) => {
              const lado = i < 2 ? 'paterno' : 'materno';
              const papel = `${i % 2 === 0 ? 'Avô' : 'Avó'} ${lado}`;
              if (!g) return <Vazio key={i} texto={`${papel}: não documentado`} />;
              return <Cartao key={g.de.id} no={g.de} papel={papel} ligacao={g.ligacao} temPais={temPais(g.de.id)} aoSubir={subir} />;
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((lado) => {
              const par = [nivel2[lado * 2], nivel2[lado * 2 + 1]];
              const progenitor = lado === 0 ? nivel1[0] : nivel1[0];
              const ligacao = lado === 0 ? progenitor.pai && pais(progenitor.pai.pessoa) : progenitor.mae && pais(progenitor.mae.pessoa);
              return (
                <div key={lado}>
                  {par[0] && par[1] ? <Casamento a={par[0].de} b={par[1].de} /> : <div className="h-5" />}
                  {(par[0] || par[1]) && <Haste firmeza={ligacao?.pai?.firmeza ?? ligacao?.mae?.firmeza} />}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Nível 1: pais */}
      <section aria-label="Pais" className="space-y-1">
        <div className="text-[10px] uppercase tracking-widest font-sans font-semibold text-[#78716C]">{casal ? 'Os pais deles' : 'Pais'}</div>
        <div className={`grid gap-3 ${casal ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'}`}>
          {nivel1.flatMap((p, i) =>
            [
              ['pai', p.paiNo, p.pai],
              ['mae', p.maeNo, p.mae],
            ].map(([tipo, no, rel], j) => {
              const papel = tipo === 'pai' ? 'Pai' : 'Mãe';
              const sufixo = casal ? ` de ${p.de.nome.split(' ')[0]}` : '';
              return no ? (
                <Cartao key={(no as NoJanela).id} no={no as NoJanela} papel={papel + sufixo} ligacao={rel as Rel} temPais={temPais((no as NoJanela).id)} aoSubir={subir} />
              ) : (
                <Vazio key={`${i}-${j}`} texto={`${papel}${sufixo}: não documentado`} />
              );
            }),
          )}
        </div>
        <div className={`grid gap-3 ${casal ? 'grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
          {nivel1.map((p) => (
            <div key={p.de.id}>
              {p.paiNo && p.maeNo ? <Casamento a={p.paiNo} b={p.maeNo} /> : <div className="h-5" />}
              {(p.paiNo || p.maeNo) && <Haste firmeza={p.pai?.firmeza ?? p.mae?.firmeza} />}
            </div>
          ))}
        </div>
      </section>

      {/* Nível 0: a raiz */}
      <section aria-label="Pé da árvore" className="space-y-1">
        <div className={`grid gap-3 ${casal ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 max-w-md mx-auto'}`}>
          {nos.map((n) => (
            <Cartao key={n.id} no={n} papel={n.ancora ?? (modoAtivo && modoAtivo.raiz.length === 1 && modoAtivo.raiz[0] === n.id ? 'Imigrante' : ROTULO_LINHA[n.linha] ?? n.linha)} destaque temPais={temPais(n.id)} aoSubir={subir} />
          ))}
        </div>
        {casal && <Casamento a={nos[0]} b={nos[1]} />}
        {!casal &&
          nos[0].relacoes
            .filter((r) => r.tipo === 'conjuge' && porId.has(r.pessoa))
            .map((r) => (
              <p key={r.pessoa} className="text-center text-xs font-sans text-[#78716C]">
                ∞ casamento com{' '}
                <button onClick={() => subir(r.pessoa)} className="text-[#8C3A27] hover:underline cursor-pointer">
                  {porId.get(r.pessoa)!.nome}
                </button>{' '}
                ·{' '}
                {r.documento ? (
                  <a href={`/documentos/${r.documento}/`} className="text-[#8C3A27] hover:underline">
                    {r.rotuloFonte}
                  </a>
                ) : (
                  <span className="italic">{r.rotuloFonte}</span>
                )}
              </p>
            ))}
      </section>

      <p className="text-[11px] font-sans text-[#78716C] border-t border-[#EFEAE0] pt-3">
        Traço cheio: ligação certa; tracejado: declarada ou provável; pontilhado: duvidosa. «Subir» põe a pessoa no pé da árvore e mostra os pais e avós dela.
        Documentos de depois de 1925 são citados, não publicados.
      </p>
    </div>
  );
}
