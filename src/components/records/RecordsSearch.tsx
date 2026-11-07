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
import type { PublishedOccurrence, Page, ReadingGrade } from '../../lib/records';
import {
  fullName,
  spouseName,
  readingGrade,
  readingCaveat,
  roleLabel,
  reference,
  readableDate,
  COVERAGE_LABEL,
  COVERAGE_EXPLANATION,
} from '../../lib/records';

type Tab = 'names' | 'pages';

interface Props {
  totals: { names: number; pages: number };
}

const PAGE_SIZE = 60;
const ALL = 'all';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function contains(fields: string[], terms: string[]): boolean {
  const text = normalize(fields.join(' \u0001 '));
  return terms.every((t) => text.includes(t));
}

const READING_STYLE: Record<ReadingGrade, { className: string; Icon: FC<{ className?: string }> }> = {
  certa: { className: 'text-[#2A6F54] bg-[#EEF5F0] border-[#CFE2D6]', Icon: CircleCheck },
  provável: { className: 'text-[#8A5A14] bg-[#FBF4E6] border-[#EBD9B4]', Icon: CircleDashed },
  duvidosa: { className: 'text-[#57534E] bg-[#F3EFE6] border-[#D6CEBE]', Icon: CircleHelp },
};

const COVERAGE_STYLE: Record<Page['coverage'], string> = {
  'lida inteira': 'text-[#2A6F54] bg-[#EEF5F0] border-[#CFE2D6]',
  procurada: 'text-[#8A5A14] bg-[#FBF4E6] border-[#EBD9B4]',
  cabeçalho: 'text-[#57534E] bg-[#F3EFE6] border-[#D6CEBE]',
};

export default function RecordsSearch({ totals }: Props) {
  const [tab, setTab] = useState<Tab>('names');
  const [q, setQ] = useState('');
  const [place, setPlace] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [reading, setReading] = useState(ALL);
  const [coverage, setCoverage] = useState(ALL);
  const [names, setNames] = useState<PublishedOccurrence[] | null>(null);
  const [pages, setPages] = useState<Page[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [copied, setCopied] = useState<string | null>(null);

  // The query may arrive through the URL (?q=…), from the search dialog or from a link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q');
    if (initial) setQ(initial);
    if (params.get('aba') === 'paginas') setTab('pages');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    if (tab === 'pages') params.set('aba', 'paginas');
    else params.delete('aba');
    const search = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (search ? `?${search}` : ''));
  }, [q, tab]);

  useEffect(() => {
    fetch('/registros-vistos/dados/nomes.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { names: PublishedOccurrence[] }) => setNames(d.names))
      .catch(() => setError('Não foi possível carregar os nomes transcritos. As listagens estáticas continuam disponíveis abaixo.'));
  }, []);

  useEffect(() => {
    if (tab !== 'pages' || pages) return;
    fetch('/registros-vistos/dados/paginas.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { pages: Page[] }) => setPages(d.pages))
      .catch(() => setError('Não foi possível carregar as páginas consultadas.'));
  }, [tab, pages]);

  useEffect(() => setLimit(PAGE_SIZE), [q, tab, place, category, reading, coverage]);

  const terms = useMemo(() => normalize(q).split(/\s+/).filter(Boolean), [q]);

  const places = useMemo(() => {
    const source: { comune: string }[] = tab === 'names' ? names ?? [] : pages ?? [];
    return [...new Set(source.map((r) => r.comune))].sort((a, b) => a.localeCompare(b, 'pt'));
  }, [tab, names, pages]);

  const categories = useMemo(() => {
    const source: { category: string }[] = tab === 'names' ? names ?? [] : pages ?? [];
    return [...new Set(source.map((r) => r.category))].sort((a, b) => a.localeCompare(b, 'pt'));
  }, [tab, names, pages]);

  const filteredNames = useMemo(() => {
    if (!names) return [];
    return names.filter((o) => {
      if (place !== ALL && o.comune !== place) return false;
      if (category !== ALL && o.category !== category) return false;
      if (reading !== ALL && readingGrade(o.reading) !== reading) return false;
      if (terms.length === 0) return true;
      return contains(
        [o.given_name, o.surname, o.father, o.mother, o.spouse_given_name, o.spouse_surname, o.comune, o.series, o.year, o.act_number, o.role, o.note, o.event_date],
        terms,
      );
    });
  }, [names, place, category, reading, terms]);

  const filteredPages = useMemo(() => {
    if (!pages) return [];
    return pages.filter((p) => {
      if (place !== ALL && p.comune !== place) return false;
      if (category !== ALL && p.category !== category) return false;
      if (coverage !== ALL && !p.coverages.includes(coverage as Page['coverage'])) return false;
      if (terms.length === 0) return true;
      return contains([p.comune, p.series, p.year, p.part, p.collection, p.volume_or_waypoint, p.description, p.image], terms);
    });
  }, [pages, place, category, coverage, terms]);

  const filtering = q.trim() || place !== ALL || category !== ALL || reading !== ALL || coverage !== ALL;
  const reset = () => {
    setQ('');
    setPlace(ALL);
    setCategory(ALL);
    setReading(ALL);
    setCoverage(ALL);
  };

  const copyLink = (o: PublishedOccurrence) => {
    const url = `${window.location.origin}${o.catalogue_url}#${o.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(o.id);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setPlace(ALL);
    setCategory(ALL);
    setExpanded(null);
  };

  const total = tab === 'names' ? filteredNames.length : filteredPages.length;
  const loading = tab === 'names' ? names === null : pages === null;

  return (
    <section className="space-y-5" aria-label="Busca nos registros vistos">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#F4EFE6] rounded-lg w-fit" role="tablist">
        {(
          [
            ['names', 'Nomes transcritos', totals.names, Eye],
            ['pages', 'Páginas consultadas', totals.pages, Layers],
          ] as const
        ).map(([id, label, n, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => switchTab(id)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              tab === id ? 'bg-white text-[#1C1917] shadow-xs font-semibold' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${tab === id ? 'text-[#8C3A27]' : ''}`} />
            <span>{label}</span>
            <span className="font-mono text-[10px] text-[#A8A29E] tabular-nums">{n.toLocaleString('pt-BR')}</span>
          </button>
        ))}
      </div>

      {/* Search box and filters */}
      <div className="bg-white border border-[#E7E2D8] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C3A27] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              tab === 'names'
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
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
            >
              <option value={ALL}>Todas as localidades</option>
              {places.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">Tipo de registro</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
            >
              <option value={ALL}>Todos os tipos</option>
              {categories.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          {tab === 'names' ? (
            <label className="block">
              <span className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">Grau de leitura</span>
              <select
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
              >
                <option value={ALL}>Todos os graus</option>
                <option value="certa">Leitura certa</option>
                <option value="provável">Leitura provável</option>
                <option value="duvidosa">Leitura duvidosa</option>
              </select>
            </label>
          ) : (
            <label className="block">
              <span className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">Cobertura da leitura</span>
              <select
                value={coverage}
                onChange={(e) => setCoverage(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
              >
                <option value={ALL}>Qualquer cobertura</option>
                <option value="lida inteira">Lida inteira</option>
                <option value="procurada">Só procurada</option>
                <option value="cabeçalho">Só o cabeçalho</option>
              </select>
            </label>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs text-[#57534E]">
          <span>
            {loading ? (
              'Carregando…'
            ) : (
              <>
                <strong className="text-[#1C1917] font-mono tabular-nums">{total.toLocaleString('pt-BR')}</strong>{' '}
                {tab === 'names' ? (total === 1 ? 'ocorrência' : 'ocorrências') : total === 1 ? 'página' : 'páginas'}
                {filtering ? ' com estes critérios' : ''}
              </>
            )}
          </span>
          {filtering && (
            <button onClick={reset} className="text-[#8C3A27] hover:underline font-semibold cursor-pointer">
              Redefinir filtros
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-xs bg-[#F5EFEB] text-[#8C3A27] px-3 py-2 rounded border border-[#E8D9CE] font-sans" role="alert">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && total === 0 && !error && (
        <div className="bg-white border border-[#E7E2D8] rounded-xl p-10 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[#D6CEBE] mx-auto" />
          <h3 className="font-display text-lg font-semibold text-[#1C1917]">Nada com estes critérios</h3>
          <p className="font-editorial text-sm text-[#57534E] max-w-md mx-auto">
            Não encontrar um nome aqui não significa que ele não esteja nos livros: estas transcrições são parciais. Tente
            uma grafia próxima (Suraci, Soraci, Surace, Sorace) ou tire um filtro.
          </p>
        </div>
      )}

      {tab === 'names' && names && (
        <ul className="space-y-2.5" aria-label="Ocorrências">
          {filteredNames.slice(0, limit).map((o) => {
            const open = expanded === o.id;
            const grade = readingGrade(o.reading);
            const { className, Icon } = READING_STYLE[grade];
            const spouse = spouseName(o);
            const caveat = readingCaveat(o.reading);
            return (
              <li
                key={o.id}
                id={o.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  open ? 'border-[#8C3A27] shadow-sm' : 'border-[#E7E2D8] hover:border-[#D6CEBE]'
                }`}
              >
                <button
                  onClick={() => setExpanded(open ? null : o.id)}
                  aria-expanded={open}
                  className="w-full text-left p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-[#78716C]">
                      <span className="font-semibold text-[#1C1917]">{o.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{o.comune}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#8C3A27] font-semibold tabular-nums">{o.year}</span>
                      {o.act_number && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            ato n.º {o.act_number}
                            {o.part ? `, parte ${o.part}` : ''}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg sm:text-xl font-semibold text-[#1C1917] leading-snug">{fullName(o)}</h3>
                      <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E7E0D2] text-[#57534E]">
                        {roleLabel(o)}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded border ${className}`}>
                        <Icon className="w-3 h-3" />
                        leitura {grade}
                      </span>
                    </div>
                    {(o.father || o.mother) && (
                      <div className="text-xs text-[#57534E] font-sans">
                        {o.father && (
                          <>
                            <span className="text-[#78716C]">pai</span> {o.father}
                          </>
                        )}
                        {o.father && o.mother && <span className="text-[#D6CEBE]"> · </span>}
                        {o.mother && (
                          <>
                            <span className="text-[#78716C]">mãe</span> {o.mother}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-[#A8A29E] shrink-0 transition-transform ${open ? 'rotate-90 text-[#8C3A27]' : ''}`}
                  />
                </button>

                {open && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-[#F2ECE1] bg-[#FAF8F5] space-y-4 text-xs font-sans animate-fade-in">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-3">
                      {[
                        ['Papel no ato', o.role],
                        ['Pai', o.father],
                        ['Mãe', o.mother],
                        ['Cônjuge', spouse],
                        ['Data indicada', readableDate(o.event_date)],
                        ['Referência', reference(o)],
                        ['Ressalva de leitura', caveat],
                        ['Conferência', o.review],
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
                    {o.note && (
                      <p className="font-editorial text-sm text-[#292524] leading-relaxed bg-white p-3.5 rounded-lg border border-[#E7E0D2]">
                        {o.note}
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
                      {o.alt_url && (
                        <a
                          href={o.alt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#57534E] hover:text-[#1C1917] hover:underline"
                        >
                          Ver também no {o.alt_portal} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <a href={`${o.catalogue_url}#${o.id}`} className="inline-flex items-center gap-1 text-[#57534E] hover:text-[#1C1917] hover:underline">
                        <FileText className="w-3 h-3" /> Ver o recorte {o.comune} · {o.series} · {o.year}
                      </a>
                      <button
                        onClick={() => copyLink(o)}
                        className="inline-flex items-center gap-1 text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                        title="Copiar o link desta ocorrência"
                      >
                        {copied === o.id ? <Check className="w-3 h-3 text-[#2A6F54]" /> : <Link2 className="w-3 h-3" />}
                        {copied === o.id ? 'Link copiado' : 'Copiar link'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {tab === 'pages' && pages && (
        <ul className="space-y-2.5" aria-label="Páginas consultadas">
          {filteredPages.slice(0, limit).map((p) => (
            <li key={p.id} id={p.id} className="bg-white border border-[#E7E2D8] hover:border-[#D6CEBE] rounded-xl p-4 sm:px-5 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-[#78716C]">
                <span className="font-semibold text-[#1C1917]">{p.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#8C3A27] font-semibold tabular-nums">{p.year}</span>
                {p.consulted_on && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>consultada em {readableDate(p.consulted_on)}</span>
                  </>
                )}
                {p.visits > 1 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{p.visits} visitas</span>
                  </>
                )}
              </div>
              <h3 className="font-display text-lg font-semibold text-[#1C1917] leading-snug">
                {p.comune} <span className="text-[#78716C] font-medium">· {p.series}</span>
                {p.part && <span className="text-[#78716C] font-medium"> · {p.part}</span>}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {p.coverages.map((c) => (
                  <span
                    key={c}
                    title={COVERAGE_EXPLANATION[c]}
                    className={`inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded border ${COVERAGE_STYLE[c]}`}
                  >
                    <ScanSearch className="w-3 h-3" />
                    {COVERAGE_LABEL[c]}
                  </span>
                ))}
                {p.transcribed_names > 0 && (
                  <span className="text-[11px] font-sans text-[#57534E]">
                    {p.transcribed_names} {p.transcribed_names === 1 ? 'nome transcrito' : 'nomes transcritos'}
                  </span>
                )}
              </div>
              {p.description && <p className="font-editorial text-sm text-[#44403C]">{p.description}</p>}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-sans text-[#78716C]">
                {p.volume_or_waypoint && <span className="truncate max-w-full">{p.volume_or_waypoint}</span>}
                {p.image && <span>imagem {p.image}</span>}
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

      {!loading && total > limit && (
        <div className="text-center pt-2">
          <button
            onClick={() => setLimit((l) => l + PAGE_SIZE * 2)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1C1917] bg-[#EFE9DC] hover:bg-[#E5DFD1] rounded-md transition-colors cursor-pointer"
          >
            Mostrar mais ({(total - limit).toLocaleString('pt-BR')} restantes)
          </button>
        </div>
      )}
    </section>
  );
}
