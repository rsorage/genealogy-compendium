import { useEffect, useMemo, useState, type FC } from 'react';
import {
  Search,
  ExternalLink,
  ChevronRight,
  Link2,
  Check,
  CircleHelp,
  CircleCheck,
  CircleDashed,
  BookOpen,
  Layers,
  Eye,
  ScanSearch,
  FileText,
} from 'lucide-react';
import type { OcorrenciaPublicada, Pagina } from '../../lib/registros';
import {
  nomeCompleto,
  nomeConjuge,
  grauLeitura,
  ressalvaLeitura,
  rotuloPapel,
  referencia,
  dataLegivel,
  ROTULO_COBERTURA,
  EXPLICACAO_COBERTURA,
} from '../../lib/registros';

type Aba = 'nomes' | 'paginas';

interface Props {
  totais: { nomes: number; paginas: number };
}

const PASSO = 60;

function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function contem(alvo: string[], termos: string[]): boolean {
  const texto = normalizar(alvo.join(' \u0001 '));
  return termos.every((t) => texto.includes(t));
}

const ESTILO_LEITURA: Record<'certa' | 'provável' | 'duvidosa', { classe: string; Icone: FC<{ className?: string }> }> = {
  certa: { classe: 'text-[#2A6F54] bg-[#EEF5F0] border-[#CFE2D6]', Icone: CircleCheck },
  provável: { classe: 'text-[#8A5A14] bg-[#FBF4E6] border-[#EBD9B4]', Icone: CircleDashed },
  duvidosa: { classe: 'text-[#57534E] bg-[#F3EFE6] border-[#D6CEBE]', Icone: CircleHelp },
};

const ESTILO_COBERTURA: Record<Pagina['cobertura'], string> = {
  'lida inteira': 'text-[#2A6F54] bg-[#EEF5F0] border-[#CFE2D6]',
  procurada: 'text-[#8A5A14] bg-[#FBF4E6] border-[#EBD9B4]',
  cabeçalho: 'text-[#57534E] bg-[#F3EFE6] border-[#D6CEBE]',
};

export default function BuscaRegistros({ totais }: Props) {
  const [aba, setAba] = useState<Aba>('nomes');
  const [q, setQ] = useState('');
  const [localidade, setLocalidade] = useState('todas');
  const [tipo, setTipo] = useState('todos');
  const [leitura, setLeitura] = useState('todas');
  const [cobertura, setCobertura] = useState('todas');
  const [nomes, setNomes] = useState<OcorrenciaPublicada[] | null>(null);
  const [paginas, setPaginas] = useState<Pagina[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [limite, setLimite] = useState(PASSO);
  const [copiado, setCopiado] = useState<string | null>(null);

  // A consulta pode chegar pela URL (?q=…), vinda do diálogo de busca ou de um link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inicial = params.get('q');
    if (inicial) setQ(inicial);
    if (params.get('aba') === 'paginas') setAba('paginas');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    if (aba === 'paginas') params.set('aba', 'paginas');
    else params.delete('aba');
    const busca = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (busca ? `?${busca}` : ''));
  }, [q, aba]);

  useEffect(() => {
    fetch('/registros-vistos/dados/nomes.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { nomes: OcorrenciaPublicada[] }) => setNomes(d.nomes))
      .catch(() => setErro('Não foi possível carregar os nomes transcritos. As listagens estáticas continuam disponíveis abaixo.'));
  }, []);

  useEffect(() => {
    if (aba !== 'paginas' || paginas) return;
    fetch('/registros-vistos/dados/paginas.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { paginas: Pagina[] }) => setPaginas(d.paginas))
      .catch(() => setErro('Não foi possível carregar as páginas consultadas.'));
  }, [aba, paginas]);

  useEffect(() => setLimite(PASSO), [q, aba, localidade, tipo, leitura, cobertura]);

  const termos = useMemo(() => normalizar(q).split(/\s+/).filter(Boolean), [q]);

  const localidades = useMemo(() => {
    const fonte: { comune: string }[] = aba === 'nomes' ? nomes ?? [] : paginas ?? [];
    return [...new Set(fonte.map((r) => r.comune))].sort((a, b) => a.localeCompare(b, 'pt'));
  }, [aba, nomes, paginas]);

  const tipos = useMemo(() => {
    const fonte: { tipo: string }[] = aba === 'nomes' ? nomes ?? [] : paginas ?? [];
    return [...new Set(fonte.map((r) => r.tipo))].sort((a, b) => a.localeCompare(b, 'pt'));
  }, [aba, nomes, paginas]);

  const nomesFiltrados = useMemo(() => {
    if (!nomes) return [];
    return nomes.filter((o) => {
      if (localidade !== 'todas' && o.comune !== localidade) return false;
      if (tipo !== 'todos' && o.tipo !== tipo) return false;
      if (leitura !== 'todas' && grauLeitura(o.leitura) !== leitura) return false;
      if (termos.length === 0) return true;
      return contem(
        [o.nome, o.sobrenome, o.pai, o.mae, o.conjuge_nome, o.conjuge_sobrenome, o.comune, o.serie, o.ano, o.num_atto, o.papel, o.nota, o.data_evento],
        termos,
      );
    });
  }, [nomes, localidade, tipo, leitura, termos]);

  const paginasFiltradas = useMemo(() => {
    if (!paginas) return [];
    return paginas.filter((p) => {
      if (localidade !== 'todas' && p.comune !== localidade) return false;
      if (tipo !== 'todos' && p.tipo !== tipo) return false;
      if (cobertura !== 'todas' && !p.coberturas.includes(cobertura as Pagina['cobertura'])) return false;
      if (termos.length === 0) return true;
      return contem([p.comune, p.serie, p.ano, p.parte, p.colecao, p.volume_ou_waypoint, p.descricao, p.imagem], termos);
    });
  }, [paginas, localidade, tipo, cobertura, termos]);

  const filtrando = q.trim() || localidade !== 'todas' || tipo !== 'todos' || leitura !== 'todas' || cobertura !== 'todas';
  const limpar = () => {
    setQ('');
    setLocalidade('todas');
    setTipo('todos');
    setLeitura('todas');
    setCobertura('todas');
  };

  const copiarLink = (o: OcorrenciaPublicada) => {
    const url = `${window.location.origin}${o.url_catalogo}#${o.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopiado(o.id);
      setTimeout(() => setCopiado(null), 1800);
    });
  };

  const mudarAba = (nova: Aba) => {
    setAba(nova);
    setLocalidade('todas');
    setTipo('todos');
    setExpandido(null);
  };

  const total = aba === 'nomes' ? nomesFiltrados.length : paginasFiltradas.length;
  const carregando = aba === 'nomes' ? nomes === null : paginas === null;

  return (
    <section className="space-y-5" aria-label="Busca nos registros vistos">
      {/* Abas */}
      <div className="flex items-center gap-1 p-1 bg-[#F4EFE6] rounded-lg w-fit" role="tablist">
        {(
          [
            ['nomes', 'Nomes transcritos', totais.nomes, Eye],
            ['paginas', 'Páginas consultadas', totais.paginas, Layers],
          ] as const
        ).map(([id, rotulo, n, Icone]) => (
          <button
            key={id}
            role="tab"
            aria-selected={aba === id}
            onClick={() => mudarAba(id)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              aba === id ? 'bg-white text-[#1C1917] shadow-xs font-semibold' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Icone className={`w-3.5 h-3.5 ${aba === id ? 'text-[#8C3A27]' : ''}`} />
            <span>{rotulo}</span>
            <span className="font-mono text-[10px] text-[#A8A29E] tabular-nums">{n.toLocaleString('pt-BR')}</span>
          </button>
        ))}
      </div>

      {/* Caixa de busca e filtros */}
      <div className="bg-white border border-[#E7E2D8] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C3A27] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              aba === 'nomes'
                ? 'Sobrenome, nome, pai ou mãe, localidade, ano, número do ato… (ex.: Suraci, Versaci 1878, Laganadi 1881)'
                : 'Localidade, série, ano, volume… (ex.: Laganadi Nati 1881)'
            }
            aria-label="Termos de busca"
            className="w-full pl-10 pr-20 py-2.5 rounded-lg border border-[#D6CEBE] bg-[#FAF8F5] text-sm font-sans text-[#1C1917] focus:outline-none focus:border-[#8C3A27] focus:bg-white transition-all placeholder:text-[#A8A29E]"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78716C] hover:text-[#1C1917] cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
          <label className="block">
            <span className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">Localidade</span>
            <select
              value={localidade}
              onChange={(e) => setLocalidade(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
            >
              <option value="todas">Todas as localidades</option>
              {localidades.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">Tipo de registro</span>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
            >
              <option value="todos">Todos os tipos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          {aba === 'nomes' ? (
            <label className="block">
              <span className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">Grau de leitura</span>
              <select
                value={leitura}
                onChange={(e) => setLeitura(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
              >
                <option value="todas">Todos os graus</option>
                <option value="certa">Leitura certa</option>
                <option value="provável">Leitura provável</option>
                <option value="duvidosa">Leitura duvidosa</option>
              </select>
            </label>
          ) : (
            <label className="block">
              <span className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">Cobertura da leitura</span>
              <select
                value={cobertura}
                onChange={(e) => setCobertura(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
              >
                <option value="todas">Qualquer cobertura</option>
                <option value="lida inteira">Lida inteira</option>
                <option value="procurada">Só procurada</option>
                <option value="cabeçalho">Só o cabeçalho</option>
              </select>
            </label>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs text-[#57534E]">
          <span>
            {carregando ? (
              'Carregando…'
            ) : (
              <>
                <strong className="text-[#1C1917] font-mono tabular-nums">{total.toLocaleString('pt-BR')}</strong>{' '}
                {aba === 'nomes' ? (total === 1 ? 'ocorrência' : 'ocorrências') : total === 1 ? 'página' : 'páginas'}
                {filtrando ? ' com estes critérios' : ''}
              </>
            )}
          </span>
          {filtrando && (
            <button onClick={limpar} className="text-[#8C3A27] hover:underline font-semibold cursor-pointer">
              Redefinir filtros
            </button>
          )}
        </div>
      </div>

      {erro && (
        <div className="text-xs bg-[#F5EFEB] text-[#8C3A27] px-3 py-2 rounded border border-[#E8D9CE] font-sans" role="alert">
          {erro}
        </div>
      )}

      {/* Resultados */}
      {!carregando && total === 0 && !erro && (
        <div className="bg-white border border-[#E7E2D8] rounded-xl p-10 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[#D6CEBE] mx-auto" />
          <h3 className="font-display text-lg font-semibold text-[#1C1917]">Nada com estes critérios</h3>
          <p className="font-editorial text-sm text-[#57534E] max-w-md mx-auto">
            Não encontrar um nome aqui não significa que ele não esteja nos livros: estas transcrições são parciais. Tente
            uma grafia próxima (Suraci, Soraci, Surace, Sorace) ou tire um filtro.
          </p>
        </div>
      )}

      {aba === 'nomes' && nomes && (
        <ul className="space-y-2.5" aria-label="Ocorrências">
          {nomesFiltrados.slice(0, limite).map((o) => {
            const aberto = expandido === o.id;
            const grau = grauLeitura(o.leitura);
            const { classe, Icone } = ESTILO_LEITURA[grau];
            const conjuge = nomeConjuge(o);
            const ressalva = ressalvaLeitura(o.leitura);
            return (
              <li
                key={o.id}
                id={o.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  aberto ? 'border-[#8C3A27] shadow-sm' : 'border-[#E7E2D8] hover:border-[#D6CEBE]'
                }`}
              >
                <button
                  onClick={() => setExpandido(aberto ? null : o.id)}
                  aria-expanded={aberto}
                  className="w-full text-left p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-[#78716C]">
                      <span className="font-semibold text-[#1C1917]">{o.tipo}</span>
                      <span aria-hidden="true">·</span>
                      <span>{o.comune}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#8C3A27] font-semibold tabular-nums">{o.ano}</span>
                      {o.num_atto && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            ato n.º {o.num_atto}
                            {o.parte ? `, parte ${o.parte}` : ''}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg sm:text-xl font-semibold text-[#1C1917] leading-snug">{nomeCompleto(o)}</h3>
                      <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E7E0D2] text-[#57534E]">
                        {rotuloPapel(o)}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded border ${classe}`}>
                        <Icone className="w-3 h-3" />
                        leitura {grau}
                      </span>
                    </div>
                    {(o.pai || o.mae) && (
                      <div className="text-xs text-[#57534E] font-sans">
                        {o.pai && (
                          <>
                            <span className="text-[#78716C]">pai</span> {o.pai}
                          </>
                        )}
                        {o.pai && o.mae && <span className="text-[#D6CEBE]"> · </span>}
                        {o.mae && (
                          <>
                            <span className="text-[#78716C]">mãe</span> {o.mae}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-[#A8A29E] shrink-0 transition-transform ${aberto ? 'rotate-90 text-[#8C3A27]' : ''}`}
                  />
                </button>

                {aberto && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-[#F2ECE1] bg-[#FAF8F5] space-y-4 text-xs font-sans animate-fade-in">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-3">
                      {[
                        ['Papel no ato', o.papel],
                        ['Pai', o.pai],
                        ['Mãe', o.mae],
                        ['Cônjuge', conjuge],
                        ['Data indicada', dataLegivel(o.data_evento)],
                        ['Referência', referencia(o)],
                        ['Ressalva de leitura', ressalva],
                        ['Conferência', o.conferencia],
                        ['Portal de origem', o.portal],
                      ]
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <div key={k} className="flex gap-3">
                            <dt className="w-32 shrink-0 text-[#78716C]">{k}</dt>
                            <dd className="text-[#1C1917]">{v}</dd>
                          </div>
                        ))}
                    </dl>
                    {o.nota && (
                      <p className="font-editorial text-sm text-[#292524] leading-relaxed bg-white p-3.5 rounded-lg border border-[#E7E0D2]">
                        {o.nota}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                      <a
                        href={o.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#8C3A27] hover:underline font-semibold"
                      >
                        Conferir no {o.portal} <ExternalLink className="w-3 h-3" />
                      </a>
                      {o.url_alternativa && (
                        <a
                          href={o.url_alternativa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#57534E] hover:text-[#1C1917] hover:underline"
                        >
                          Ver também no {o.portal_alternativo} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <a href={`${o.url_catalogo}#${o.id}`} className="inline-flex items-center gap-1 text-[#57534E] hover:text-[#1C1917] hover:underline">
                        <FileText className="w-3 h-3" /> Ver o recorte {o.comune} · {o.serie} · {o.ano}
                      </a>
                      <button
                        onClick={() => copiarLink(o)}
                        className="inline-flex items-center gap-1 text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                        title="Copiar o link desta ocorrência"
                      >
                        {copiado === o.id ? <Check className="w-3 h-3 text-[#2A6F54]" /> : <Link2 className="w-3 h-3" />}
                        {copiado === o.id ? 'Link copiado' : 'Copiar link'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {aba === 'paginas' && paginas && (
        <ul className="space-y-2.5" aria-label="Páginas consultadas">
          {paginasFiltradas.slice(0, limite).map((p) => (
            <li key={p.id} id={p.id} className="bg-white border border-[#E7E2D8] hover:border-[#D6CEBE] rounded-xl p-4 sm:px-5 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-[#78716C]">
                <span className="font-semibold text-[#1C1917]">{p.tipo}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#8C3A27] font-semibold tabular-nums">{p.ano}</span>
                {p.consultado_em && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>consultada em {dataLegivel(p.consultado_em)}</span>
                  </>
                )}
                {p.anotacoes > 1 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{p.anotacoes} visitas</span>
                  </>
                )}
              </div>
              <h3 className="font-display text-lg font-semibold text-[#1C1917] leading-snug">
                {p.comune} <span className="text-[#78716C] font-medium">· {p.serie}</span>
                {p.parte && <span className="text-[#78716C] font-medium"> · {p.parte}</span>}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {p.coberturas.map((c) => (
                  <span
                    key={c}
                    title={EXPLICACAO_COBERTURA[c]}
                    className={`inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded border ${ESTILO_COBERTURA[c]}`}
                  >
                    <ScanSearch className="w-3 h-3" />
                    {ROTULO_COBERTURA[c]}
                  </span>
                ))}
                {p.nomes_transcritos > 0 && (
                  <span className="text-[11px] font-sans text-[#57534E]">
                    {p.nomes_transcritos} {p.nomes_transcritos === 1 ? 'nome transcrito' : 'nomes transcritos'}
                  </span>
                )}
              </div>
              {p.descricao && <p className="font-editorial text-sm text-[#44403C]">{p.descricao}</p>}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-sans text-[#78716C]">
                {p.volume_ou_waypoint && <span className="truncate max-w-full">{p.volume_ou_waypoint}</span>}
                {p.imagem && <span>imagem {p.imagem}</span>}
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#8C3A27] hover:underline font-semibold"
                >
                  Abrir no {p.portal} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!carregando && total > limite && (
        <div className="text-center pt-2">
          <button
            onClick={() => setLimite((l) => l + PASSO * 2)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1C1917] bg-[#EFE9DC] hover:bg-[#E5DFD1] rounded-md transition-colors cursor-pointer"
          >
            Mostrar mais ({(total - limite).toLocaleString('pt-BR')} restantes)
          </button>
        </div>
      )}
    </section>
  );
}
