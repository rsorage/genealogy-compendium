import { useEffect, useMemo, useState } from 'react';
import { Anchor, ArrowRight, ChevronRight, Heart, Search } from 'lucide-react';

export type FirmezaT = 'certa' | 'declarada' | 'provavel' | 'duvidosa';
export type TipoRel = 'pai' | 'mae' | 'conjuge' | 'irmao' | 'filho';

export interface NoArvore {
  id: string;
  nome: string;
  outros: string[];
  vida: string;
  anoNasc: string;
  anoMorte: string;
  lugar: string;
  ocupacao: string;
  linha: string;
  sexo: 'M' | 'F' | '?';
  documentos: number;
  relacoes: { tipo: TipoRel; pessoa: string; firmeza: FirmezaT; documentos: string[] }[];
}

export interface Uniao {
  raiz: string;
  conjuge: string;
  firmeza: FirmezaT;
  documento?: { id: string; titulo: string; data: string; lugar: string };
}

interface Props {
  pessoas: NoArvore[];
  linhas: { id: string; rotulo: string; raiz: string; inclui: string[] }[];
  unioes: Uniao[];
  totalDocumentos: number;
  rotulosLinha: Record<string, string>;
}

const COR_LINHA: Record<string, string> = { suraci: '#8C3A27', vecchia: '#8C3A27', cardillo: '#2B6CB0', marsicano: '#2B6CB0', rede: '#78716C' };
const COR_F: Record<FirmezaT, string> = { certa: '#2A6F54', declarada: '#57534E', provavel: '#B07A1A', duvidosa: '#8C3A27' };
const ESTILO_F: Record<FirmezaT, string> = { certa: 'solid', declarada: 'dashed', provavel: 'dashed', duvidosa: 'dotted' };
const ROTULO_F: Record<FirmezaT, string> = { certa: 'certa', declarada: 'declarada', provavel: 'provável', duvidosa: 'duvidosa' };
const ORDEM_F: FirmezaT[] = ['certa', 'declarada', 'provavel', 'duvidosa'];
const ROTULO_REL: Record<TipoRel, string> = { pai: 'pai', mae: 'mãe', conjuge: 'cônjuge', irmao: 'irmão/irmã', filho: 'filho(a)' };
const ROMANOS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const NOME_GERACAO = ['A geração do imigrante', 'Pais', 'Avós', 'Bisavós', 'Trisavós', 'Tetravós', 'Pentavós', 'Hexavós', 'Heptavós'];

function normalizar(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Geração de cada pessoa a partir da raiz: pai/mãe +1, filho −1, cônjuge e irmão 0 (busca em largura). */
function geracoesDesde(raiz: string, porId: Map<string, NoArvore>): Map<string, number> {
  const g = new Map<string, number>([[raiz, 0]]);
  const fila = [raiz];
  while (fila.length) {
    const atual = fila.shift()!;
    const no = porId.get(atual);
    if (!no) continue;
    for (const r of no.relacoes) {
      if (g.has(r.pessoa) || !porId.has(r.pessoa)) continue;
      g.set(r.pessoa, g.get(atual)! + (r.tipo === 'pai' || r.tipo === 'mae' ? 1 : r.tipo === 'filho' ? -1 : 0));
      fila.push(r.pessoa);
    }
  }
  return g;
}

/** Caminho mais curto no grafo (passos com relação e firmeza) entre duas pessoas. */
function caminho(de: string, ate: string, porId: Map<string, NoArvore>): { pessoa: string; rel?: TipoRel; firmeza?: FirmezaT; docs?: string[] }[] | null {
  if (de === ate) return [{ pessoa: de }];
  const anterior = new Map<string, { de: string; rel: TipoRel; firmeza: FirmezaT; docs: string[] }>();
  const visto = new Set([de]);
  const fila = [de];
  while (fila.length) {
    const atual = fila.shift()!;
    for (const r of porId.get(atual)?.relacoes ?? []) {
      if (visto.has(r.pessoa) || !porId.has(r.pessoa)) continue;
      visto.add(r.pessoa);
      anterior.set(r.pessoa, { de: atual, rel: r.tipo, firmeza: r.firmeza, docs: r.documentos });
      if (r.pessoa === ate) {
        const passos: { pessoa: string; rel?: TipoRel; firmeza?: FirmezaT; docs?: string[] }[] = [];
        let cursor = ate;
        while (cursor !== de) {
          const a = anterior.get(cursor)!;
          passos.unshift({ pessoa: cursor, rel: a.rel, firmeza: a.firmeza, docs: a.docs });
          cursor = a.de;
        }
        passos.unshift({ pessoa: de });
        return passos;
      }
      fila.push(r.pessoa);
    }
  }
  return null;
}

function nomeGeracao(g: number): string {
  if (g < 0) return g === -1 ? 'Filhos da geração do imigrante' : `${-g} gerações abaixo do imigrante`;
  return NOME_GERACAO[g] ?? `${g}.ª geração acima do imigrante`;
}

function Selo({ linha, rotulo }: { linha: string; rotulo: string }) {
  return (
    <span className="text-[11px] font-sans font-medium" style={{ color: COR_LINHA[linha] ?? '#78716C' }}>
      {rotulo}
    </span>
  );
}

export default function ArvoreGeracoes({ pessoas, linhas, unioes, totalDocumentos, rotulosLinha }: Props) {
  const porId = useMemo(() => new Map(pessoas.map((p) => [p.id, p])), [pessoas]);
  const [linhaAtiva, setLinhaAtiva] = useState<string>('todas');
  const [geracaoAtiva, setGeracaoAtiva] = useState<number | 'todas'>('todas');
  const [selecionada, setSelecionada] = useState<string>(linhas[0]?.raiz ?? pessoas[0]?.id);
  const [q, setQ] = useState('');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('pessoa');
    if (id && porId.has(id)) {
      setSelecionada(id);
      const dona = linhas.find((l) => l.inclui.includes(porId.get(id)!.linha));
      if (dona) setLinhaAtiva(dona.id);
    }
  }, [porId, linhas]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('pessoa', selecionada);
    window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
  }, [selecionada]);

  // geração de cada pessoa, relativa à raiz da sua linha
  const geracoes = useMemo(() => {
    const g = new Map<string, number>();
    const linhaDe = new Map<string, string>();
    for (const l of linhas) {
      for (const [id, n] of geracoesDesde(l.raiz, porId)) {
        if (!g.has(id)) {
          g.set(id, n);
          linhaDe.set(id, l.id);
        }
      }
    }
    return { g, linhaDe };
  }, [linhas, porId]);

  const linhasVisiveis = linhaAtiva === 'todas' ? linhas : linhas.filter((l) => l.id === linhaAtiva);
  const raizVisivel = linhasVisiveis[0]?.raiz;
  const raizSelecionada = linhas.find((l) => l.id === geracoes.linhaDe.get(selecionada))?.raiz ?? raizVisivel;
  const trilha = useMemo(() => (raizSelecionada ? caminho(selecionada, raizSelecionada, porId) : null), [selecionada, raizSelecionada, porId]);

  const visiveis = pessoas.filter((p) => linhaAtiva === 'todas' || linhasVisiveis.some((l) => l.id === geracoes.linhaDe.get(p.id)));
  const ligadas = visiveis.filter((p) => geracoes.g.has(p.id));
  const soltas = visiveis.filter((p) => !geracoes.g.has(p.id));
  const niveis = [...new Set(ligadas.map((p) => geracoes.g.get(p.id)!))].sort((a, b) => a - b);
  const niveisMostrados = geracaoAtiva === 'todas' ? niveis : niveis.filter((n) => n === geracaoAtiva);

  const sugestoes = useMemo(() => {
    const termos = normalizar(q).split(/\s+/).filter(Boolean);
    if (!termos.length) return [];
    return pessoas.filter((p) => termos.every((t) => normalizar(`${p.nome} ${p.outros.join(' ')} ${p.vida} ${p.lugar}`).includes(t))).slice(0, 8);
  }, [q, pessoas]);

  const selecionar = (id: string) => {
    setSelecionada(id);
    setQ('');
    const dona = linhas.find((l) => l.id === geracoes.linhaDe.get(id));
    if (dona && linhaAtiva !== 'todas' && dona.id !== linhaAtiva) setLinhaAtiva(dona.id);
  };

  const unioesVisiveis = unioes.filter((u) => linhasVisiveis.some((l) => l.raiz === u.raiz));
  const sel = porId.get(selecionada)!;

  return (
    <div className="space-y-8">
      {/* Faixa de estatísticas */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-sans text-[#78716C] bg-[#F5F0E6] px-4 py-2.5 rounded-lg border border-[#E7E0D2] w-fit">
        <div>
          <span className="font-mono font-semibold text-[#1C1917] tabular-nums">{pessoas.length}</span> pessoas documentadas
        </div>
        <span aria-hidden="true">·</span>
        <div>
          <span className="font-mono font-semibold text-[#1C1917] tabular-nums">{niveis.length}</span> gerações
        </div>
        <span aria-hidden="true">·</span>
        <div>
          <span className="font-mono font-semibold text-[#8C3A27] tabular-nums">{totalDocumentos}</span> documentos primários
        </div>
      </div>

      {/* Controles: linha, geração, busca */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E7E2D8] shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#F4EFE6] rounded-lg overflow-x-auto scrollbar-none">
          {[{ id: 'todas', rotulo: 'Todas as linhas' }, ...linhas].map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setLinhaAtiva(l.id);
                setGeracaoAtiva('todas');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                linhaAtiva === l.id ? 'bg-white text-[#1C1917] shadow-xs font-semibold' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {l.rotulo}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-[#78716C] overflow-x-auto scrollbar-none">
          <span className="font-medium mr-1 hidden sm:inline">Geração:</span>
          {(['todas', ...niveis] as const).map((n) => (
            <button
              key={String(n)}
              onClick={() => setGeracaoAtiva(n as number | 'todas')}
              title={typeof n === 'number' ? nomeGeracao(n) : 'Todas as gerações'}
              className={`px-2.5 py-1 rounded font-mono transition-colors cursor-pointer whitespace-nowrap ${
                geracaoAtiva === n ? 'bg-[#1C1917] text-[#FBF9F5]' : 'bg-[#F4EFE6] text-[#57534E] hover:bg-[#EAE4D6]'
              }`}
            >
              {n === 'todas' ? 'Todas' : n === 0 ? 'Imigr.' : n > 0 ? `+${n}` : `${n}`}
            </button>
          ))}
        </div>
        <div className="relative xl:w-72">
          <Search className="w-4 h-4 text-[#8C3A27] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Traçar o caminho de… (nome)"
            aria-label="Procurar pessoa para traçar o caminho"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D6CEBE] bg-[#FAF8F5] text-sm font-sans text-[#1C1917] focus:outline-none focus:border-[#8C3A27] focus:bg-white placeholder:text-[#A8A29E]"
          />
          {sugestoes.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#E7E2D8] rounded-lg shadow-lg overflow-hidden text-sm font-sans">
              {sugestoes.map((p) => (
                <li key={p.id}>
                  <button onClick={() => selecionar(p.id)} className="w-full text-left px-3 py-2 hover:bg-[#F5F0E6] cursor-pointer flex justify-between gap-3">
                    <span className="text-[#1C1917]">{p.nome}</span>
                    <span className="text-[#78716C] font-mono tabular-nums text-xs">{p.vida}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Caminho até o imigrante */}
      <section className="bg-white border border-[#E7E2D8] rounded-xl p-5 space-y-4" aria-label="Caminho documentado">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2ECE1] pb-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-sans font-semibold text-[#1C1917]">
            <Anchor className="w-4 h-4 text-[#8C3A27]" />
            <span>Caminho documentado · de {sel.nome} até o imigrante</span>
          </div>
          <a href={`/pessoas/${sel.id}/`} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#FBF9F5] bg-[#1C1917] hover:bg-[#342F2C] rounded-md transition-colors whitespace-nowrap">
            Abrir o dossiê <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
        {trilha ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
            {trilha.map((passo, i) => {
              const p = porId.get(passo.pessoa)!;
              const g = geracoes.g.get(p.id);
              return (
                <div key={p.id} className="flex items-center gap-2 shrink-0">
                  {i > 0 && passo.rel && passo.firmeza && (
                    <div className="flex flex-col items-center text-[10px] font-sans w-24" style={{ color: COR_F[passo.firmeza] }}>
                      <span className="whitespace-nowrap">{ROTULO_REL[passo.rel]} · {ROTULO_F[passo.firmeza]}</span>
                      <span aria-hidden="true" className="w-full border-t-2 my-1" style={{ borderTopStyle: ESTILO_F[passo.firmeza] as 'solid', borderColor: COR_F[passo.firmeza] }} />
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                  <button
                    onClick={() => selecionar(p.id)}
                    className={`text-left rounded-lg border px-4 py-3 min-w-[200px] cursor-pointer transition-colors ${
                      p.id === sel.id ? 'border-[#8C3A27] bg-white' : 'border-[#E7E2D8] bg-[#FAF8F5] hover:border-[#8C3A27]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-[#8C3A27]">
                      <span>{g === 0 ? 'Imigrante' : g !== undefined ? `Geração ${g > 0 ? ROMANOS[g] ?? g : g}` : ''}</span>
                      <span className="text-[#78716C] tabular-nums">{p.vida}</span>
                    </div>
                    <div className="font-display text-base font-semibold text-[#1C1917] mt-1">{p.nome}</div>
                    <div className="text-[11px] font-sans text-[#78716C] truncate">{p.lugar}</div>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm font-editorial text-[#57534E]">
            Nenhum caminho documentado liga {sel.nome} ao imigrante desta linha: a pessoa está no acervo por aparecer nos atos, não por parentesco provado.
          </p>
        )}
        {trilha && trilha.length > 1 && (
          <p className="text-[11px] font-sans text-[#78716C]">
            {trilha.length - 1} {trilha.length === 2 ? 'passo' : 'passos'}; a firmeza mais fraca do caminho é{' '}
            <strong style={{ color: COR_F[ORDEM_F[Math.max(...trilha.slice(1).map((t) => ORDEM_F.indexOf(t.firmeza!)))]] }}>
              {ROTULO_F[ORDEM_F[Math.max(...trilha.slice(1).map((t) => ORDEM_F.indexOf(t.firmeza!)))]]}
            </strong>
            . Cada passo é uma ligação que um ato afirma; o dossiê diz qual.
          </p>
        )}
      </section>

      {/* O casal imigrante */}
      {unioesVisiveis.map((u) => {
        const a = porId.get(u.raiz)!;
        const b = porId.get(u.conjuge)!;
        return (
          <section key={u.raiz + u.conjuge} className="bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl p-5 flex flex-col md:flex-row md:items-start gap-4" aria-label="O casal imigrante">
            <Heart className="w-5 h-5 text-[#8C3A27] shrink-0 mt-1" />
            <div className="flex-1 space-y-1">
              <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                O casal imigrante{u.documento ? `: ${u.documento.lugar}, ${u.documento.data}` : ''}
              </h3>
              <p className="font-editorial text-sm text-[#44403C] leading-relaxed">
                <button onClick={() => selecionar(a.id)} className="font-semibold text-[#1C1917] hover:text-[#8C3A27] cursor-pointer">{a.nome}</button>
                {a.lugar ? ` (${a.lugar})` : ''} e{' '}
                <button onClick={() => selecionar(b.id)} className="font-semibold text-[#1C1917] hover:text-[#8C3A27] cursor-pointer">{b.nome}</button>
                {b.lugar ? ` (${b.lugar})` : ''}
                {u.documento ? (
                  <>
                    {' '}— casamento registrado em{' '}
                    <a href={`/documentos/${u.documento.id}/`} className="text-[#8C3A27] underline decoration-[#E8D9CE] hover:decoration-[#8C3A27]">
                      {u.documento.titulo}
                    </a>
                    .
                  </>
                ) : (
                  '.'
                )}
              </p>
            </div>
            <div className="text-[11px] font-mono text-[#78716C] shrink-0" style={{ color: COR_F[u.firmeza] }}>
              ligação {ROTULO_F[u.firmeza]}
            </div>
          </section>
        );
      })}

      {/* Gerações */}
      {niveisMostrados.map((n) => {
        const grupo = ligadas.filter((p) => geracoes.g.get(p.id) === n).sort((a, b) => (a.anoNasc || '9999').localeCompare(b.anoNasc || '9999') || a.nome.localeCompare(b.nome, 'pt'));
        const anos = grupo.map((p) => p.anoNasc).filter(Boolean).sort();
        return (
          <section key={n} className="space-y-4" aria-label={nomeGeracao(n)}>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-xs font-semibold tracking-widest uppercase bg-[#F5F0E6] text-[#8C3A27] px-3 py-1 rounded">
                {n === 0 ? 'Imigrante' : n > 0 ? `Geração ${ROMANOS[n] ?? n}` : `Geração ${n}`}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#1C1917]">{nomeGeracao(n)}</h2>
              {anos.length > 0 && (
                <span className="text-xs font-sans text-[#78716C]">
                  · nascidos {anos[0]}{anos.length > 1 && anos[anos.length - 1] !== anos[0] ? `–${anos[anos.length - 1]}` : ''} · {grupo.length} {grupo.length === 1 ? 'pessoa' : 'pessoas'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {grupo.map((p) => {
                const ativa = p.id === sel.id;
                const relSel = sel.relacoes.find((r) => r.pessoa === p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => selecionar(p.id)}
                    className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer group bg-white transition-all ${
                      ativa ? 'border-[#8C3A27] ring-2 ring-[#8C3A27]/25 shadow-md' : 'border-[#E7E2D8] hover:border-[#8C3A27] hover:shadow-sm'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-sans text-[#78716C]">
                        <Selo linha={p.linha} rotulo={rotulosLinha[p.linha]?.split(' (')[0] ?? p.linha} />
                        <span className="font-mono tabular-nums">{p.vida}</span>
                      </div>
                      <div>
                        <h4 className="font-display text-lg font-semibold text-[#1C1917] group-hover:text-[#8C3A27] transition-colors leading-snug">{p.nome}</h4>
                        {p.outros.length > 0 && (
                          <p className="text-xs font-editorial italic text-[#78716C] mt-0.5">
                            Também escrito: <span className="font-sans font-medium text-[#44403C] not-italic">{p.outros.slice(0, 3).join(', ')}</span>
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs text-[#57534E] font-sans pt-1 border-t border-[#F4EFE6]">
                        {p.lugar && (
                          <div className="flex items-start gap-1.5">
                            <span className="text-[#A8A29E] shrink-0">Nascimento:</span>
                            <span className="text-[#292524] truncate">{p.lugar}</span>
                          </div>
                        )}
                        {p.ocupacao && (
                          <div className="flex items-start gap-1.5 text-[#78716C]">
                            <span className="text-[#A8A29E] shrink-0">Ofício:</span>
                            <span className="truncate">{p.ocupacao}</span>
                          </div>
                        )}
                        {relSel && !ativa && (
                          <div className="flex items-center gap-1.5" style={{ color: COR_F[relSel.firmeza] }}>
                            <span aria-hidden="true" className="inline-block w-4 border-t-2" style={{ borderTopStyle: ESTILO_F[relSel.firmeza] as 'solid', borderColor: COR_F[relSel.firmeza] }} />
                            <span>{ROTULO_REL[relSel.tipo]} de {sel.nome.split(' ')[0]} · {ROTULO_F[relSel.firmeza]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#F4EFE6] flex items-center justify-between text-[11px] text-[#78716C]">
                      <span className="text-[#8C3A27] font-medium">
                        {ativa ? (
                          <span className="flex items-center gap-1 text-[#2A6F54] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2A6F54]" /> caminho ativo
                          </span>
                        ) : (
                          <span className="group-hover:underline">traçar caminho</span>
                        )}
                      </span>
                      <a href={`/pessoas/${p.id}/`} onClick={(e) => e.stopPropagation()} className="text-[#8C3A27] font-medium hover:underline inline-flex items-center gap-0.5">
                        Dossiê <ChevronRight className="w-3 h-3" />
                        <span className="sr-only"> de {p.nome}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {geracaoAtiva === 'todas' && soltas.length > 0 && (
        <section className="space-y-3 border-t border-[#E7E2D8] pt-6" aria-label="Sem ligação documentada">
          <h2 className="font-display text-xl font-medium text-[#1C1917]">Sem caminho documentado até o imigrante</h2>
          <p className="font-editorial text-sm text-[#57534E] max-w-3xl">
            Pessoas do acervo que ainda não estão ligadas à linha por nenhum ato — candidatos, homônimos a excluir, ou a rede de testemunhas e oficiais com ficha própria.
          </p>
          <div className="flex flex-wrap gap-2">
            {soltas.map((p) => (
              <a key={p.id} href={`/pessoas/${p.id}/`} className="text-xs font-sans bg-white border border-[#E7E2D8] hover:border-[#8C3A27] rounded-md px-2.5 py-1 text-[#44403C]">
                {p.nome} <span className="text-[#A8A29E] font-mono">{p.vida}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
