import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Anchor, ArrowUp, Briefcase, ChevronRight, MapPin, Search } from 'lucide-react';

export type FirmezaT = 'certa' | 'declarada' | 'provavel' | 'duvidosa';
export type TipoRel = 'pai' | 'mae' | 'conjuge' | 'irmao' | 'filho';

export interface LugarNo {
  nome: string;
  /** «Reggio Calabria, Calábria, Itália» */
  contexto: string;
  incerto: boolean;
}

export interface NoJanela {
  id: string;
  nome: string;
  outros: string[];
  vida: string;
  lugar?: LugarNo;
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

// Os mesmos traços dos selos de firmeza dos dossiês (src/lib/pessoas.ts).
const ESTILO_F: Record<FirmezaT, 'solid' | 'dashed' | 'dotted'> = { certa: 'solid', declarada: 'dashed', provavel: 'dashed', duvidosa: 'dotted' };
const ROTULO_F: Record<FirmezaT, string> = { certa: 'certa', declarada: 'declarada', provavel: 'provável', duvidosa: 'duvidosa' };
const ORDEM_F: FirmezaT[] = ['certa', 'provavel', 'declarada', 'duvidosa'];
const ROTULO_LINHA: Record<string, string> = { suraci: 'Suraci → Sorage', vecchia: 'Vecchia', cardillo: 'Cardillo → Cardilo', marsicano: 'Marsicano', rede: 'Rede' };
const COR_TRACO = '#C9C1B2';

function normalizar(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

type Rel = NoJanela['relacoes'][number];

/** A mais fraca de várias firmezas (a haste de um casal leva a pior das duas ligações). */
function maisFraca(...fs: (FirmezaT | undefined)[]): FirmezaT | undefined {
  const presentes = fs.filter((f): f is FirmezaT => !!f);
  if (!presentes.length) return undefined;
  return presentes.sort((a, b) => ORDEM_F.indexOf(b) - ORDEM_F.indexOf(a))[0];
}

function Fonte({ rel }: { rel: Rel }) {
  return rel.documento ? (
    <a href={`/documentos/${rel.documento}/`} className="text-[#8C3A27] hover:underline">
      {rel.rotuloFonte} ↗
    </a>
  ) : (
    <span className="italic">{rel.rotuloFonte}</span>
  );
}

/**
 * A frase da faixa de uma geração: de onde vem a ligação dos pais ao filho.
 * «segundo X» quando pai e mãe vêm do mesmo ato; «pai segundo X; mãe segundo Y» quando não.
 */
function fraseFontes(pai?: Rel, mae?: Rel): ReactNode {
  if (pai && mae && pai.rotuloFonte === mae.rotuloFonte && pai.documento === mae.documento) {
    return (
      <>
        segundo <Fonte rel={pai} />
      </>
    );
  }
  const partes: ReactNode[] = [];
  if (pai)
    partes.push(
      <span key="pai">
        pai segundo <Fonte rel={pai} />
      </span>,
    );
  if (mae)
    partes.push(
      <span key="mae">
        mãe segundo <Fonte rel={mae} />
      </span>,
    );
  return partes.flatMap((p, i) => (i ? ['; ', p] : [p]));
}

function Faixa({ rotulo, fontes }: { rotulo: string; fontes: { quem?: string; pai?: Rel; mae?: Rel }[] }) {
  const comFonte = fontes.filter((f) => f.pai || f.mae);
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-sans">
      <span className="text-[10px] uppercase tracking-widest font-semibold text-[#78716C]">{rotulo}</span>
      {comFonte.length > 0 && (
        <span className="text-[11px] text-[#57534E]">
          {comFonte.flatMap((f, i) => [
            i ? <span key={`sep${i}`}> · </span> : null,
            <span key={i}>
              {f.quem ? `pais de ${f.quem} ` : ''}
              {fraseFontes(f.pai, f.mae)}
            </span>,
          ])}
        </span>
      )}
    </div>
  );
}

function Cartao({
  no,
  papel,
  destaque = false,
  temPais,
  aoSubir,
}: {
  no: NoJanela;
  papel: string;
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
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#A8A29E] shrink-0 mt-0.5" />
              <span className="min-w-0">
                <span className="text-[#292524] font-medium">
                  {no.lugar.nome}
                  {no.lugar.incerto ? ' (?)' : ''}
                </span>
                {no.lugar.contexto && <span className="text-[#78716C]"> · {no.lugar.contexto}</span>}
              </span>
            </div>
          )}
          {no.emigracao && (
            <div className="flex items-start gap-1.5 text-[#8C3A27] font-medium">
              <Anchor className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="min-w-0">{no.emigracao}</span>
            </div>
          )}
          {no.ocupacao && (
            <div className="flex items-center gap-1.5 text-[#78716C]">
              <Briefcase className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
              <span className="truncate">{no.ocupacao}</span>
            </div>
          )}
          {no.carecePesquisa && <div className="text-[11px] text-[#8A5A14] bg-[#FBF4E6] border border-[#EBD9B4] rounded px-2 py-0.5 inline-block">carece pesquisa</div>}
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

/** A união de um casal: linha fina de um cartão ao outro, anel «∞» na junção e a legenda numa linha. */
function Uniao({ a, b }: { a?: NoJanela; b?: NoJanela }) {
  const rel = a && b ? a.relacoes.find((r) => r.tipo === 'conjuge' && r.pessoa === b.id) : undefined;
  return (
    <div className="flex flex-col items-center gap-1.5 -mt-px">
      <div className="flex items-center w-full" aria-hidden="true">
        <span className="flex-1 border-t" style={{ borderColor: COR_TRACO, borderTopStyle: rel ? ESTILO_F[rel.firmeza] : 'solid' }} />
        <span
          className="w-[22px] h-[22px] rounded-full border-[1.5px] border-[#8C3A27] text-[#8C3A27] bg-[#FBF9F5] flex items-center justify-center text-[11px] leading-none mx-2"
          title={rel ? `Casamento (ligação ${ROTULO_F[rel.firmeza]})` : 'Casamento'}
        >
          ∞
        </span>
        <span className="flex-1 border-t" style={{ borderColor: COR_TRACO, borderTopStyle: rel ? ESTILO_F[rel.firmeza] : 'solid' }} />
      </div>
      <div className="text-[11px] leading-snug font-sans text-[#78716C] text-center px-2 min-h-[2.6em]">
        {rel ? (
          <>
            Casamento · <Fonte rel={rel} />
          </>
        ) : a && b ? (
          <span className="italic">casamento não documentado</span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>
    </div>
  );
}

/** A haste do casal ao filho: traço fino, cujo estilo (cheio, tracejado, pontilhado) leva a firmeza da ligação. */
function Haste({ firmeza, titulo }: { firmeza?: FirmezaT; titulo?: string }) {
  return (
    <div className="flex flex-col items-center pt-3" aria-hidden="true" title={titulo}>
      <span className="h-10 w-0 border-l" style={{ borderColor: COR_TRACO, borderLeftStyle: firmeza ? ESTILO_F[firmeza] : 'dashed' }} />
    </div>
  );
}

/** Um casal: dois cartões lado a lado, a união embaixo e a haste para o filho. */
function Casal({
  pai,
  mae,
  papelPai,
  papelMae,
  relPai,
  relMae,
  temPais,
  aoSubir,
}: {
  pai?: NoJanela;
  mae?: NoJanela;
  papelPai: string;
  papelMae: string;
  relPai?: Rel;
  relMae?: Rel;
  temPais: (id: string) => boolean;
  aoSubir: (id: string) => void;
}) {
  const firmeza = maisFraca(relPai?.firmeza, relMae?.firmeza);
  const titulo = [relPai && `pai: ${relPai.rotuloFonte}`, relMae && `mãe: ${relMae.rotuloFonte}`].filter(Boolean).join(' · ');
  return (
    <div className="min-w-0 flex flex-col h-full">
      <div className="grid grid-cols-2 gap-3 flex-1">
        {pai ? <Cartao no={pai} papel={papelPai} temPais={temPais(pai.id)} aoSubir={aoSubir} /> : <Vazio texto={`${papelPai}: não documentado`} />}
        {mae ? <Cartao no={mae} papel={papelMae} temPais={temPais(mae.id)} aoSubir={aoSubir} /> : <Vazio texto={`${papelMae}: não documentada`} />}
      </div>
      <Uniao a={pai} b={mae} />
      {(pai || mae) && <Haste firmeza={firmeza} titulo={titulo} />}
    </div>
  );
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
    return pessoas
      .filter((p) => termos.every((t) => normalizar(`${p.nome} ${p.outros.join(' ')} ${p.vida} ${p.lugar?.nome ?? ''} ${p.lugar?.contexto ?? ''}`).includes(t)))
      .slice(0, 8);
  }, [q, pessoas]);

  const modoAtivo = modos.find((m) => m.raiz.join() === raiz.join()) ?? modos.find((m) => raiz.length === 1 && m.linhas.includes(porId.get(raiz[0])!.linha));
  const casal = raiz.length === 2;
  const nos = raiz.map((id) => porId.get(id)!);
  const primeiroNome = (n: NoJanela) => n.nome.split(' ')[0];

  // Nível 1: os pais de cada pessoa da raiz. Nível 2 (só quando a raiz é uma pessoa): os pais de cada um dos pais.
  const nivel1 = nos.map((n) => ({ de: n, ...pais(n.id) }));
  const nivel2 = casal ? [] : [nivel1[0].paiNo, nivel1[0].maeNo].map((x) => (x ? { de: x, ...pais(x.id) } : undefined));

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
        <section aria-label="Avós" className="space-y-2">
          <Faixa
            rotulo="Avós"
            fontes={nivel2.map((g, i) => ({ quem: g ? `${primeiroNome(g.de)} (${i === 0 ? 'pai' : 'mãe'})` : undefined, pai: g?.pai, mae: g?.mae }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {nivel2.map((g, i) => {
              const lado = i === 0 ? 'paterno' : 'materno';
              return (
                <Casal
                  key={i}
                  pai={g?.paiNo}
                  mae={g?.maeNo}
                  papelPai={`Avô ${lado}`}
                  papelMae={`Avó ${lado === 'paterno' ? 'paterna' : 'materna'}`}
                  relPai={g?.pai}
                  relMae={g?.mae}
                  temPais={temPais}
                  aoSubir={subir}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Nível 1: pais */}
      <section aria-label="Pais" className="space-y-2">
        <Faixa rotulo={casal ? 'Os pais deles' : 'Pais'} fontes={nivel1.map((p) => ({ quem: casal ? primeiroNome(p.de) : undefined, pai: p.pai, mae: p.mae }))} />
        <div className={`grid gap-x-6 gap-y-6 ${casal ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
          {nivel1.map((p) => {
            const sufixo = casal ? ` de ${primeiroNome(p.de)}` : '';
            return (
              <Casal
                key={p.de.id}
                pai={p.paiNo}
                mae={p.maeNo}
                papelPai={`Pai${sufixo}`}
                papelMae={`Mãe${sufixo}`}
                relPai={p.pai}
                relMae={p.mae}
                temPais={temPais}
                aoSubir={subir}
              />
            );
          })}
        </div>
      </section>

      {/* Nível 0: a raiz */}
      <section aria-label="Pé da árvore" className="space-y-1">
        <div className={`grid gap-3 ${casal ? 'grid-cols-2 max-w-3xl' : 'grid-cols-1 max-w-md'} mx-auto`}>
          {nos.map((n) => (
            <Cartao key={n.id} no={n} papel={n.ancora ?? (modoAtivo && modoAtivo.raiz.length === 1 && modoAtivo.raiz[0] === n.id ? 'Imigrante' : ROTULO_LINHA[n.linha] ?? n.linha)} destaque temPais={temPais(n.id)} aoSubir={subir} />
          ))}
        </div>
        {casal && (
          <div className="max-w-3xl mx-auto">
            <Uniao a={nos[0]} b={nos[1]} />
          </div>
        )}
        {!casal &&
          nos[0].relacoes
            .filter((r) => r.tipo === 'conjuge' && porId.has(r.pessoa))
            .map((r) => (
              <p key={r.pessoa} className="text-center text-[11px] font-sans text-[#78716C] pt-2">
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full border border-[#8C3A27] text-[#8C3A27] text-[10px] leading-none mr-1.5 align-middle">∞</span>
                Casamento com{' '}
                <button onClick={() => subir(r.pessoa)} className="text-[#8C3A27] hover:underline cursor-pointer">
                  {porId.get(r.pessoa)!.nome}
                </button>{' '}
                · <Fonte rel={r} />
              </p>
            ))}
      </section>

      <p className="text-[11px] font-sans text-[#78716C] border-t border-[#EFEAE0] pt-3">
        A haste entre um casal e o filho leva a firmeza da ligação (cheia: certa; tracejada: declarada ou provável; pontilhada: duvidosa) — e a faixa de
        cada geração diz de que ato ela vem. «Subir» põe a pessoa no pé da árvore e mostra os pais e avós dela. Documentos de depois de 1925 são citados,
        não publicados.
      </p>
    </div>
  );
}
