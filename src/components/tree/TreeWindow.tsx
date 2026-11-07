import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Anchor, ArrowUp, Briefcase, ChevronRight, MapPin, Search, Users } from 'lucide-react';

export type Confidence = 'certain' | 'stated' | 'probable' | 'doubtful';
export type RelationType = 'father' | 'mother' | 'spouse' | 'sibling' | 'child';

export interface NodePlace {
  /** «Laganadi», «Padula (?)», «Messina (Ospedale Civico)» */
  name: string;
  /** «Reggio Calabria, Calábria, Itália» */
  context: string;
}

/** One person as the tree needs it (a subset of the exported person, serialised as island props). */
export interface TreeNode {
  id: string;
  name: string;
  aliases: string[];
  life: string;
  place?: NodePlace;
  occupation: string;
  emigration: string;
  line: string;
  sex: 'M' | 'F' | '?';
  anchor?: string;
  noDossier: boolean;
  needsResearch: boolean;
  relations: { type: RelationType; person: string; confidence: Confidence; sourceLabel: string; document?: string }[];
}

export interface Mode {
  id: string;
  label: string;
  /** root: one person (a line) or a couple (the grandparents) */
  root: string[];
  lines: string[];
}

interface Props {
  persons: TreeNode[];
  modes: Mode[];
}

// The same strokes as the confidence badges of the dossiers (src/lib/persons.ts).
const STROKE: Record<Confidence, 'solid' | 'dashed' | 'dotted'> = { certain: 'solid', stated: 'dashed', probable: 'dashed', doubtful: 'dotted' };
const CONFIDENCE_LABEL: Record<Confidence, string> = { certain: 'certa', stated: 'declarada', probable: 'provável', doubtful: 'duvidosa' };
const CONFIDENCE_ORDER: Confidence[] = ['certain', 'probable', 'stated', 'doubtful'];
const LINE_LABEL: Record<string, string> = { suraci: 'Suraci → Sorage', vecchia: 'Vecchia', cardillo: 'Cardillo → Cardilo', marsicano: 'Marsicano', rede: 'Rede' };
const STROKE_COLOR = '#C9C1B2';

function normalize(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

type Relation = TreeNode['relations'][number];

/** The weakest of several confidences (a couple's stem carries the worse of the two links). */
function weakest(...cs: (Confidence | undefined)[]): Confidence | undefined {
  const present = cs.filter((c): c is Confidence => !!c);
  if (!present.length) return undefined;
  return present.sort((a, b) => CONFIDENCE_ORDER.indexOf(b) - CONFIDENCE_ORDER.indexOf(a))[0];
}

function Source({ relation, muted = false }: { relation: Relation; muted?: boolean }) {
  return relation.document ? (
    <a href={`/documentos/${relation.document}/`} className={muted ? 'text-[#57534E] hover:text-[#8C3A27] hover:underline' : 'text-[#8C3A27] hover:underline'}>
      {relation.sourceLabel}&nbsp;↗
    </a>
  ) : (
    <span className="italic">{relation.sourceLabel}</span>
  );
}

/**
 * The filiation line of a card: where this person's link to their parents comes from.
 * «Pais: X» when father and mother come from the same act; «Pai: X · Mãe: Y» otherwise.
 */
function filiationLine(node: TreeNode): ReactNode {
  const father = node.relations.find((r) => r.type === 'father');
  const mother = node.relations.find((r) => r.type === 'mother');
  if (!father && !mother) return null;
  if (father && mother && father.sourceLabel === mother.sourceLabel && father.document === mother.document) {
    return (
      <>
        Pais: <Source relation={father} muted />
      </>
    );
  }
  const parts: ReactNode[] = [];
  if (father)
    parts.push(
      <span key="father">
        Pai: <Source relation={father} muted />
      </span>,
    );
  if (mother)
    parts.push(
      <span key="mother">
        Mãe: <Source relation={mother} muted />
      </span>,
    );
  return parts.flatMap((p, i) => (i ? [' · ', p] : [p]));
}

function Rail({ label }: { label: string }) {
  return <div className="text-[10px] uppercase tracking-widest font-sans font-semibold text-[#78716C]">{label}</div>;
}

function Card({
  node,
  role,
  highlight = false,
  hasParents,
  onClimb,
}: {
  node: TreeNode;
  role: string;
  highlight?: boolean;
  hasParents: boolean;
  onClimb: (id: string) => void;
}) {
  const filiation = filiationLine(node);
  return (
    <article
      className={`bg-white border rounded-xl p-4 flex flex-col justify-between min-w-0 ${
        highlight ? 'border-[#8C3A27] shadow-sm' : 'border-[#E7E2D8]'
      }`}
    >
      <div className="space-y-3 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] font-sans">
          <span className="font-mono font-semibold uppercase tracking-wider bg-[#F5F0E6] text-[#8C3A27] px-2 py-0.5 rounded">{role}</span>
          <span className="font-mono tabular-nums text-[#78716C]">{node.life || 's.d.'}</span>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-[#1C1917] leading-snug">{node.name}</h3>
          {node.aliases.length > 0 && (
            <p className="text-xs font-editorial italic text-[#78716C] mt-0.5">
              Também escrito: <span className="font-sans font-medium text-[#44403C] not-italic">{node.aliases.slice(0, 3).join(', ')}</span>
            </p>
          )}
        </div>
        <div className="space-y-1.5 text-xs text-[#57534E] font-sans pt-2 border-t border-[#F4EFE6] min-w-0">
          {node.place && (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#A8A29E] shrink-0 mt-0.5" />
              <span className="min-w-0">
                <span className="text-[#292524] font-medium">{node.place.name}</span>
                {node.place.context && <span className="text-[#78716C]"> · {node.place.context}</span>}
              </span>
            </div>
          )}
          {node.emigration && (
            <div className="flex items-start gap-1.5 text-[#8C3A27] font-medium">
              <Anchor className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="min-w-0">{node.emigration}</span>
            </div>
          )}
          {node.occupation && (
            <div className="flex items-center gap-1.5 text-[#78716C]">
              <Briefcase className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
              <span className="truncate">{node.occupation}</span>
            </div>
          )}
          {filiation && (
            <div className="flex items-start gap-1.5 text-[11px] text-[#78716C]">
              <Users className="w-3.5 h-3.5 text-[#A8A29E] shrink-0 mt-0.5" />
              <span className="min-w-0">{filiation}</span>
            </div>
          )}
          {node.needsResearch && <div className="text-[11px] text-[#8A5A14] bg-[#FBF4E6] border border-[#EBD9B4] rounded px-2 py-0.5 inline-block">carece pesquisa</div>}
        </div>
      </div>
      <div className="pt-3 mt-3 border-t border-[#F4EFE6] flex items-center justify-between text-[11px] font-sans">
        {hasParents ? (
          <button onClick={() => onClimb(node.id)} className="inline-flex items-center gap-1 text-[#8C3A27] font-semibold hover:underline cursor-pointer">
            <ArrowUp className="w-3 h-3" /> Subir
          </button>
        ) : (
          <span className="text-[#A8A29E]">pais não documentados</span>
        )}
        {node.noDossier ? (
          <span className="text-[#A8A29E]">sem dossiê</span>
        ) : (
          <a href={`/pessoas/${node.id}/`} className="inline-flex items-center gap-0.5 text-[#8C3A27] font-medium hover:underline">
            Dossiê <ChevronRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </article>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-[#D6CEBE] rounded-xl p-4 flex items-center justify-center text-center text-xs font-sans text-[#A8A29E] min-h-[120px]">
      {text}
    </div>
  );
}

/** A couple's union: thin line from one card to the other, «∞» ring at the junction, legend in one line. */
function Union({ a, b }: { a?: TreeNode; b?: TreeNode }) {
  const relation = a && b ? a.relations.find((r) => r.type === 'spouse' && r.person === b.id) : undefined;
  return (
    <div className="flex flex-col items-center gap-1.5 -mt-px">
      <div className="flex items-center w-full" aria-hidden="true">
        <span className="flex-1 border-t" style={{ borderColor: STROKE_COLOR, borderTopStyle: relation ? STROKE[relation.confidence] : 'solid' }} />
        <span
          className="w-[22px] h-[22px] rounded-full border-[1.5px] border-[#8C3A27] text-[#8C3A27] bg-[#FBF9F5] flex items-center justify-center text-[11px] leading-none mx-2"
          title={relation ? `Casamento (ligação ${CONFIDENCE_LABEL[relation.confidence]})` : 'Casamento'}
        >
          ∞
        </span>
        <span className="flex-1 border-t" style={{ borderColor: STROKE_COLOR, borderTopStyle: relation ? STROKE[relation.confidence] : 'solid' }} />
      </div>
      <div className="text-[11px] leading-snug font-sans text-[#78716C] text-center px-2 min-h-[2.6em]">
        {relation ? (
          <>
            Casamento · <Source relation={relation} />
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

/** The stem from the couple to the child: a thin line whose style (solid, dashed, dotted) carries the link's confidence. */
function Stem({ confidence, title }: { confidence?: Confidence; title?: string }) {
  return (
    <div className="flex flex-col items-center pt-3" aria-hidden="true" title={title}>
      <span className="h-10 w-0 border-l" style={{ borderColor: STROKE_COLOR, borderLeftStyle: confidence ? STROKE[confidence] : 'dashed' }} />
    </div>
  );
}

/** A couple: two cards side by side, the union below and the stem to the child. */
function Couple({
  father,
  mother,
  fatherRole,
  motherRole,
  fatherRelation,
  motherRelation,
  hasParents,
  onClimb,
}: {
  father?: TreeNode;
  mother?: TreeNode;
  fatherRole: string;
  motherRole: string;
  fatherRelation?: Relation;
  motherRelation?: Relation;
  hasParents: (id: string) => boolean;
  onClimb: (id: string) => void;
}) {
  const confidence = weakest(fatherRelation?.confidence, motherRelation?.confidence);
  const title = [fatherRelation && `pai: ${fatherRelation.sourceLabel}`, motherRelation && `mãe: ${motherRelation.sourceLabel}`].filter(Boolean).join(' · ');
  return (
    <div className="min-w-0 flex flex-col h-full">
      <div className="grid grid-cols-2 gap-3 flex-1">
        {father ? <Card node={father} role={fatherRole} hasParents={hasParents(father.id)} onClimb={onClimb} /> : <Empty text={`${fatherRole}: não documentado`} />}
        {mother ? <Card node={mother} role={motherRole} hasParents={hasParents(mother.id)} onClimb={onClimb} /> : <Empty text={`${motherRole}: não documentada`} />}
      </div>
      <Union a={father} b={mother} />
      {(father || mother) && <Stem confidence={confidence} title={title} />}
    </div>
  );
}

export default function TreeWindow({ persons, modes }: Props) {
  const byId = useMemo(() => new Map(persons.map((p) => [p.id, p])), [persons]);
  const [root, setRoot] = useState<string[]>(modes[0].root);
  const [trail, setTrail] = useState<{ label: string; root: string[] }[]>([{ label: modes[0].label, root: modes[0].root }]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('pessoa');
    if (id && byId.has(id) && !modes.some((m) => m.root.length === 1 && m.root[0] === id)) {
      setRoot([id]);
      setTrail([{ label: modes[0].label, root: modes[0].root }, { label: byId.get(id)!.name, root: [id] }]);
    }
  }, [byId, modes]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (root.length === 1) params.set('pessoa', root[0]);
    else params.delete('pessoa');
    const search = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (search ? `?${search}` : ''));
  }, [root]);

  const parentsOf = (id: string) => {
    const node = byId.get(id);
    const father = node?.relations.find((r) => r.type === 'father');
    const mother = node?.relations.find((r) => r.type === 'mother');
    return { father, mother, fatherNode: father && byId.get(father.person), motherNode: mother && byId.get(mother.person) };
  };
  const hasParents = (id: string) => !!(parentsOf(id).fatherNode || parentsOf(id).motherNode);

  const goToMode = (mode: Mode) => {
    setRoot(mode.root);
    setTrail([{ label: mode.label, root: mode.root }]);
    setQ('');
  };
  const climb = (id: string) => {
    const node = byId.get(id)!;
    setRoot([id]);
    setTrail((t) => [...t, { label: node.name, root: [id] }]);
    setQ('');
  };
  const back = (i: number) => {
    setRoot(trail[i].root);
    setTrail((t) => t.slice(0, i + 1));
  };

  const suggestions = useMemo(() => {
    const terms = normalize(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return persons
      .filter((p) => terms.every((t) => normalize(`${p.name} ${p.aliases.join(' ')} ${p.life} ${p.place?.name ?? ''} ${p.place?.context ?? ''}`).includes(t)))
      .slice(0, 8);
  }, [q, persons]);

  const activeMode = modes.find((m) => m.root.join() === root.join()) ?? modes.find((m) => root.length === 1 && m.lines.includes(byId.get(root[0])!.line));
  const couple = root.length === 2;
  const nodes = root.map((id) => byId.get(id)!);
  const firstName = (n: TreeNode) => n.name.split(' ')[0];

  // Level 1: the parents of each root person. Level 2 (only when the root is one person): the parents of each parent.
  const level1 = nodes.map((n) => ({ of: n, ...parentsOf(n.id) }));
  const level2 = couple ? [] : [level1[0].fatherNode, level1[0].motherNode].map((x) => (x ? { of: x, ...parentsOf(x.id) } : undefined));

  return (
    <div className="space-y-6">
      {/* Modes + search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E7E2D8] shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#F4EFE6] rounded-lg overflow-x-auto scrollbar-none">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => goToMode(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                activeMode?.id === m.id ? 'bg-white text-[#1C1917] shadow-xs font-semibold' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {m.label}
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
          {suggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#E7E2D8] rounded-lg shadow-lg overflow-hidden text-sm font-sans">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <button onClick={() => climb(p.id)} className="w-full text-left px-3 py-2 hover:bg-[#F5F0E6] cursor-pointer flex justify-between gap-3">
                    <span className="text-[#1C1917]">{p.name}</span>
                    <span className="text-[#78716C] font-mono tabular-nums text-xs">{p.life}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Climbing trail */}
      <nav className="flex flex-wrap items-center gap-2 text-xs font-sans text-[#78716C]" aria-label="Por onde subiu">
        {trail.map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">›</span>}
            {i < trail.length - 1 ? (
              <button onClick={() => back(i)} className="text-[#8C3A27] hover:underline cursor-pointer">
                {t.label}
              </button>
            ) : (
              <span className="text-[#1C1917] font-semibold">{t.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Level 2: grandparents (only when the root is one person) */}
      {!couple && (
        <section aria-label="Avós" className="space-y-2">
          <Rail label="Avós" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {level2.map((g, i) => {
              const side = i === 0 ? 'paterno' : 'materno';
              return (
                <Couple
                  key={i}
                  father={g?.fatherNode}
                  mother={g?.motherNode}
                  fatherRole={`Avô ${side}`}
                  motherRole={`Avó ${side === 'paterno' ? 'paterna' : 'materna'}`}
                  fatherRelation={g?.father}
                  motherRelation={g?.mother}
                  hasParents={hasParents}
                  onClimb={climb}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Level 1: parents */}
      <section aria-label="Pais" className="space-y-2">
        <Rail label={couple ? 'Os pais deles' : 'Pais'} />
        <div className={`grid gap-x-6 gap-y-6 ${couple ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
          {level1.map((p) => {
            const suffix = couple ? ` de ${firstName(p.of)}` : '';
            return (
              <Couple
                key={p.of.id}
                father={p.fatherNode}
                mother={p.motherNode}
                fatherRole={`Pai${suffix}`}
                motherRole={`Mãe${suffix}`}
                fatherRelation={p.father}
                motherRelation={p.mother}
                hasParents={hasParents}
                onClimb={climb}
              />
            );
          })}
        </div>
      </section>

      {/* Level 0: the root */}
      <section aria-label="Pé da árvore" className="space-y-1">
        <div className={`grid gap-3 ${couple ? 'grid-cols-2 max-w-3xl' : 'grid-cols-1 max-w-md'} mx-auto`}>
          {nodes.map((n) => (
            <Card key={n.id} node={n} role={n.anchor ?? (activeMode && activeMode.root.length === 1 && activeMode.root[0] === n.id ? 'Imigrante' : LINE_LABEL[n.line] ?? n.line)} highlight hasParents={hasParents(n.id)} onClimb={climb} />
          ))}
        </div>
        {couple && (
          <div className="max-w-3xl mx-auto">
            <Union a={nodes[0]} b={nodes[1]} />
          </div>
        )}
        {!couple &&
          nodes[0].relations
            .filter((r) => r.type === 'spouse' && byId.has(r.person))
            .map((r) => (
              <p key={r.person} className="text-center text-[11px] font-sans text-[#78716C] pt-2">
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full border border-[#8C3A27] text-[#8C3A27] text-[10px] leading-none mr-1.5 align-middle">∞</span>
                Casamento com{' '}
                <button onClick={() => climb(r.person)} className="text-[#8C3A27] hover:underline cursor-pointer">
                  {byId.get(r.person)!.name}
                </button>{' '}
                · <Source relation={r} />
              </p>
            ))}
      </section>

      <p className="text-[11px] font-sans text-[#78716C] border-t border-[#EFEAE0] pt-3">
        A haste entre um casal e o filho leva a firmeza da ligação (cheia: certa; tracejada: declarada ou provável; pontilhada: duvidosa); cada
        cartão diz de que ato vem a sua filiação. «Subir» põe a pessoa no pé da árvore e mostra os pais e avós dela. Documentos de depois de 1925 são citados,
        não publicados.
      </p>
    </div>
  );
}
