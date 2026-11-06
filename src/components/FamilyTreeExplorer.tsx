import React, { useState } from 'react';
import {
  Compass,
  Users,
  Anchor,
  Heart,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Ship,
  MapPin,
  Briefcase,
  FileText,
  GitBranch,
  ArrowDown,
  Info,
} from 'lucide-react';
import { peopleDatabase } from '../data/genealogyData';
import { Person, BranchId } from '../types/genealogy';
import { RelationshipPathIndicator } from './RelationshipPathIndicator';

interface FamilyTreeExplorerProps {
  onSelectPerson: (person: Person) => void;
}

type TreeDisplayMode = 'convergent' | 'suraci' | 'cardillo' | 'pedigree';

export const FamilyTreeExplorer: React.FC<FamilyTreeExplorerProps> = ({ onSelectPerson }) => {
  const [viewMode, setViewMode] = useState<TreeDisplayMode>('convergent');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [focusedPersonId, setFocusedPersonId] = useState<string>('sorage-researcher-modern');

  const focusedPerson = peopleDatabase.find((p) => p.id === focusedPersonId) || peopleDatabase[0];

  const handleFocusById = (id: string) => {
    setFocusedPersonId(id);
  };

  // Helper to retrieve person safely by ID
  const getPerson = (id: string): Person | undefined => peopleDatabase.find((p) => p.id === id);

  // Compute set of IDs that are direct ancestors or descendants of the focused person
  const relatedPersonIds = React.useMemo(() => {
    const ids = new Set<string>();
    ids.add(focusedPersonId);

    // Recursively collect ancestors
    const addAncestors = (pId?: string) => {
      if (!pId) return;
      const p = getPerson(pId);
      if (!p) return;
      if (p.fatherId) {
        ids.add(p.fatherId);
        addAncestors(p.fatherId);
      }
      if (p.motherId) {
        ids.add(p.motherId);
        addAncestors(p.motherId);
      }
    };

    // Recursively collect descendants
    const addDescendants = (pId: string) => {
      const p = getPerson(pId);
      if (!p) return;
      p.childrenIds.forEach((cId) => {
        ids.add(cId);
        addDescendants(cId);
      });
    };

    addAncestors(focusedPersonId);
    addDescendants(focusedPersonId);

    // Also include spouse
    const p = getPerson(focusedPersonId);
    if (p) {
      p.spouseIds.forEach((sId) => ids.add(sId));
    }

    return ids;
  }, [focusedPersonId]);

  return (
    <div className="space-y-8 py-6">
      {/* Title & Archival Header */}
      <div className="border-b border-[#E7E2D8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-sans font-semibold text-[#8C3A27] mb-1">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Interactive Archival Family Tree · 1838 – Present</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
            Lineage Trees: Suraci &amp; Cardillo
          </h1>
          <p className="font-editorial text-sm sm:text-base text-[#57534E] mt-1 max-w-2xl leading-relaxed">
            Follow the direct generational tree from the 19th-century Italian patriarchs in Calabria and Campania across the Atlantic Ocean, culminating in the 1932 marriage union in São Paulo.
          </p>
        </div>

        {/* Global Statistics Strip */}
        <div className="flex items-center gap-3 text-xs font-sans text-[#78716C] bg-[#F5F0E6] px-4 py-2.5 rounded-lg border border-[#E7E0D2] shrink-0">
          <div>
            <span className="font-mono font-semibold text-[#1C1917] tabular-nums">11</span> Documented
          </div>
          <span aria-hidden="true" className="text-[#C4BDB0]">·</span>
          <div>
            <span className="font-mono font-semibold text-[#1C1917] tabular-nums">4</span> Generations
          </div>
          <span aria-hidden="true" className="text-[#C4BDB0]">·</span>
          <div>
            <span className="font-mono font-semibold text-[#8C3A27] tabular-nums">2</span> Italian Cradle Regions
          </div>
        </div>
      </div>

      {/* Control Ribbon: Tree Mode Switcher, Zoom Controls, Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E7E2D8] shadow-2xs">
        {/* Tree Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4EFE6] rounded-lg overflow-x-auto scrollbar-none">
          <button
            onClick={() => setViewMode('convergent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'convergent'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-[#8C3A27]" />
            <span>Dual Convergent Tree (Full Lineage)</span>
          </button>
          <button
            onClick={() => setViewMode('suraci')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'suraci'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#8C3A27]" />
            <span>Suraci ➔ Sorage (Calabria)</span>
          </button>
          <button
            onClick={() => setViewMode('cardillo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'cardillo'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#2B6CB0]" />
            <span>Cardillo ➔ Cardilho (Campania)</span>
          </button>
          <button
            onClick={() => setViewMode('pedigree')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'pedigree'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#78350F]" />
            <span>Direct Pedigree Chart (Ahnentafel)</span>
          </button>
        </div>

        {/* Zoom Controls & Legend */}
        <div className="flex items-center justify-between lg:justify-end gap-3 text-xs">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#F4EFE6] p-1 rounded-lg">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(75, prev - 10))}
              disabled={zoomLevel <= 75}
              title="Zoom Out"
              className="p-1 rounded hover:bg-white text-[#57534E] disabled:opacity-40 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 text-[#57534E] tabular-nums font-medium">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(125, prev + 10))}
              disabled={zoomLevel >= 125}
              title="Zoom In"
              className="p-1 rounded hover:bg-white text-[#57534E] disabled:opacity-40 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              title="Reset Zoom"
              className="p-1 rounded hover:bg-white text-[#78716C] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-sans text-[#78716C] border-l border-[#E7E0D2] pl-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#8C3A27]" />
              <span>Suraci (Calabria)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2B6CB0]" />
              <span>Cardillo (Campania)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#78350F]" />
              <span>1932 Unified</span>
            </span>
          </div>
        </div>
      </div>

      {/* PERSISTENT RELATIONSHIP PATH INDICATOR */}
      {focusedPerson && (
        <div className="sticky top-18 z-20 shadow-xs">
          <div className="relative">
            <RelationshipPathIndicator
              person={focusedPerson}
              onSelectPersonById={handleFocusById}
            />
            {/* Quick Button to open full biographical dossier */}
            <div className="absolute top-4 right-4 hidden sm:flex items-center gap-2">
              <button
                onClick={() => onSelectPerson(focusedPerson)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#1C1917] hover:bg-[#342F2C] rounded-md transition-colors shadow-2xs cursor-pointer"
              >
                <span>Open Full Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TREE CANVAS WRAPPER WITH ZOOM & HORIZONTAL SCROLL */}
      <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl p-4 sm:p-6 lg:p-8 overflow-x-auto shadow-inner">
        {/* Subtle scroll cue on mobile */}
        <div className="text-[11px] font-mono text-[#A8A29E] flex items-center justify-between pb-3 mb-3 border-b border-[#EAE3D5]">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#8C3A27]" />
            <span>Click any ancestor card to highlight their lineage and inspect documented records</span>
          </span>
          <span className="hidden sm:inline text-right">
            Active Focus: <strong className="text-[#1C1917] font-semibold">{focusedPerson.originalItalianName}</strong>
          </span>
        </div>

        {/* Zoom Scaler Container */}
        <div
          style={{
            zoom: `${zoomLevel}%`,
            transition: 'zoom 0.2s ease',
          }}
          className="min-w-[920px]"
        >
          {/* VIEW MODE 1: DUAL CONVERGENT TREE (The Master Tree) */}
          {viewMode === 'convergent' && (
            <DualConvergentTree
              focusedPersonId={focusedPersonId}
              relatedPersonIds={relatedPersonIds}
              onFocusPerson={handleFocusById}
              onOpenDossier={onSelectPerson}
            />
          )}

          {/* VIEW MODE 2: SURACI BRANCH TREE (Calabria ➔ Mooca) */}
          {viewMode === 'suraci' && (
            <SingleBranchTree
              branch="suraci"
              focusedPersonId={focusedPersonId}
              relatedPersonIds={relatedPersonIds}
              onFocusPerson={handleFocusById}
              onOpenDossier={onSelectPerson}
            />
          )}

          {/* VIEW MODE 3: CARDILLO BRANCH TREE (Campania ➔ Campinas) */}
          {viewMode === 'cardillo' && (
            <SingleBranchTree
              branch="cardillo"
              focusedPersonId={focusedPersonId}
              relatedPersonIds={relatedPersonIds}
              onFocusPerson={handleFocusById}
              onOpenDossier={onSelectPerson}
            />
          )}

          {/* VIEW MODE 4: DIRECT PEDIGREE AHNENTAFEL */}
          {viewMode === 'pedigree' && (
            <AhnentafelPedigreeTree
              rootPersonId={focusedPersonId}
              onFocusPerson={handleFocusById}
              onOpenDossier={onSelectPerson}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DUAL CONVERGENT TREE COMPONENT
// ============================================================================
interface DualTreeProps {
  focusedPersonId: string;
  relatedPersonIds: Set<string>;
  onFocusPerson: (id: string) => void;
  onOpenDossier: (person: Person) => void;
}

const DualConvergentTree: React.FC<DualTreeProps> = ({
  focusedPersonId,
  relatedPersonIds,
  onFocusPerson,
  onOpenDossier,
}) => {
  const antonino = peopleDatabase.find((p) => p.id === 'suraci-antonino-1842')!;
  const francesca = peopleDatabase.find((p) => p.id === 'minniti-francesca-1845')!;
  const fortunato = peopleDatabase.find((p) => p.id === 'suraci-fortunato-1871')!;
  const carmela = peopleDatabase.find((p) => p.id === 'morabito-carmela-1875')!;
  const paschoal = peopleDatabase.find((p) => p.id === 'sorage-paschoal-1904')!;

  const gennaro = peopleDatabase.find((p) => p.id === 'cardillo-gennaro-1838')!;
  const filomena = peopleDatabase.find((p) => p.id === 'deluca-filomena-1842')!;
  const giovanni = peopleDatabase.find((p) => p.id === 'cardillo-giovanni-1869')!;
  const rosa = peopleDatabase.find((p) => p.id === 'esposito-rosa-1873')!;
  const concetta = peopleDatabase.find((p) => p.id === 'cardillo-concetta-1908')!;
  const antonio = peopleDatabase.find((p) => p.id === 'cardillo-antonio-1902')!;

  const renato = peopleDatabase.find((p) => p.id === 'sorage-renato-1938')!;
  const ramon = peopleDatabase.find((p) => p.id === 'sorage-researcher-modern')!;

  return (
    <div className="space-y-10 py-2">
      {/* ==================================================================== */}
      {/* GENERATION 1: HOMELAND PROGENITORS (c. 1838 - 1870s) */}
      {/* ==================================================================== */}
      <div className="relative">
        {/* Tier Header Line */}
        <div className="flex items-center gap-3 border-b border-[#E2DACB] pb-2 mb-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] bg-[#F3ECE4] px-2.5 py-0.5 rounded border border-[#E7DDCE]">
            Generation I
          </span>
          <h2 className="font-display text-lg font-semibold text-[#1C1917]">
            The Italian Progenitors in the Homeland (Pre-Emigration Era · c. 1838–1870s)
          </h2>
          <span className="text-xs text-[#78716C] hidden md:inline">
            · Artisan families in the Kingdom of the Two Sicilies &amp; Post-Risorgimento Italy
          </span>
        </div>

        {/* Gen 1 Two Wings Grid */}
        <div className="grid grid-cols-2 gap-8 lg:gap-14">
          {/* Left Wing: Suraci (Calabria) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-sans pb-1 text-[#8C3A27]">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C3A27]" />
                Calabrian Branch: Suraci (Reggio Calabria)
              </span>
              <span className="font-mono text-[11px] text-[#78716C]">Aspromonte Foothills</span>
            </div>

            {/* Couple Container */}
            <div className="p-3 bg-white/90 rounded-xl border border-[#E7E0D2] shadow-2xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TreeNodeCard
                  person={antonino}
                  isFocused={focusedPersonId === antonino.id}
                  isInActivePath={relatedPersonIds.has(antonino.id)}
                  onFocus={() => onFocusPerson(antonino.id)}
                  onOpenDossier={() => onOpenDossier(antonino)}
                  roleBadge="Paternal Patriarch"
                />
                <TreeNodeCard
                  person={francesca}
                  isFocused={focusedPersonId === francesca.id}
                  isInActivePath={relatedPersonIds.has(francesca.id)}
                  onFocus={() => onFocusPerson(francesca.id)}
                  onOpenDossier={() => onOpenDossier(francesca)}
                  roleBadge="Paternal Matriarch"
                />
              </div>

              {/* Marriage Bar */}
              <div className="flex items-center justify-center gap-2 py-1 bg-[#FAF6F0] rounded-md border border-[#ECE4D5] text-[11px] font-sans text-[#78716C]">
                <Heart className="w-3 h-3 text-[#8C3A27]" />
                <span>Casados em Reggio Calabria (c. 1868) · 2 filhos documentados</span>
              </div>
            </div>
          </div>

          {/* Right Wing: Cardillo (Campania) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-sans pb-1 text-[#2B6CB0]">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2B6CB0]" />
                Campanian Branch: Cardillo (Salerno &amp; Cilento)
              </span>
              <span className="font-mono text-[11px] text-[#78716C]">Valle del Calore</span>
            </div>

            {/* Couple Container */}
            <div className="p-3 bg-white/90 rounded-xl border border-[#E7E0D2] shadow-2xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TreeNodeCard
                  person={gennaro}
                  isFocused={focusedPersonId === gennaro.id}
                  isInActivePath={relatedPersonIds.has(gennaro.id)}
                  onFocus={() => onFocusPerson(gennaro.id)}
                  onOpenDossier={() => onOpenDossier(gennaro)}
                  roleBadge="Maternal Patriarch"
                />
                <TreeNodeCard
                  person={filomena}
                  isFocused={focusedPersonId === filomena.id}
                  isInActivePath={relatedPersonIds.has(filomena.id)}
                  onFocus={() => onFocusPerson(filomena.id)}
                  onOpenDossier={() => onOpenDossier(filomena)}
                  roleBadge="Maternal Matriarch"
                />
              </div>

              {/* Marriage Bar */}
              <div className="flex items-center justify-center gap-2 py-1 bg-[#F0F5FA] rounded-md border border-[#D7E3EE] text-[11px] font-sans text-[#78716C]">
                <Heart className="w-3 h-3 text-[#2B6CB0]" />
                <span>Casados em Castelnuovo Cilento (c. 1865) · Família de tanoeiros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connecting Orthogonal Branches from Gen 1 to Gen 2 */}
        <div className="grid grid-cols-2 gap-8 lg:gap-14 h-8 relative">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-0.5 h-full bg-[#8C3A27]/40" />
            <div className="w-2 h-2 rounded-full bg-[#8C3A27] -mt-1" />
          </div>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-0.5 h-full bg-[#2B6CB0]/40" />
            <div className="w-2 h-2 rounded-full bg-[#2B6CB0] -mt-1" />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* GENERATION 2: THE IMMIGRANT PIONEERS & OCEAN CROSSING (1890s) */}
      {/* ==================================================================== */}
      <div className="relative">
        {/* Tier Header Line */}
        <div className="flex items-center gap-3 border-b border-[#E2DACB] pb-2 mb-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] bg-[#F3ECE4] px-2.5 py-0.5 rounded border border-[#E7DDCE]">
            Generation II
          </span>
          <h2 className="font-display text-lg font-semibold text-[#1C1917]">
            The Transatlantic Immigrant Pioneers &amp; Surname Evolution (1890s–1910s)
          </h2>
          <span className="text-xs text-[#78716C] hidden md:inline">
            · The crossing aboard steamships Caffaro &amp; Italia to Santos &amp; Hospedaria do Brás
          </span>
        </div>

        {/* Gen 2 Two Wings Grid */}
        <div className="grid grid-cols-2 gap-8 lg:gap-14">
          {/* Left Wing: Fortunato Suraci & Carmela Morabito */}
          <div className="space-y-3">
            {/* Maritime Emigration Banner */}
            <div className="bg-[#FAF2ED] border border-[#ECD7CC] rounded-lg px-3 py-2 flex items-center justify-between text-xs text-[#8C3A27]">
              <span className="flex items-center gap-1.5 font-semibold">
                <Ship className="w-4 h-4 text-[#8C3A27]" />
                <span>1897: Piroscafo Caffaro ➔ Santos &amp; Mooca</span>
              </span>
              <span className="font-mono text-[11px] text-[#A0402C] hidden sm:inline">Suraci ➔ Sorage</span>
            </div>

            {/* Couple Container */}
            <div className="p-3 bg-white/90 rounded-xl border border-[#E7E0D2] shadow-2xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TreeNodeCard
                  person={fortunato}
                  isFocused={focusedPersonId === fortunato.id}
                  isInActivePath={relatedPersonIds.has(fortunato.id)}
                  onFocus={() => onFocusPerson(fortunato.id)}
                  onOpenDossier={() => onOpenDossier(fortunato)}
                  roleBadge="Immigrant Progenitor"
                  isEmigrant
                />
                <TreeNodeCard
                  person={carmela}
                  isFocused={focusedPersonId === carmela.id}
                  isInActivePath={relatedPersonIds.has(carmela.id)}
                  onFocus={() => onFocusPerson(carmela.id)}
                  onOpenDossier={() => onOpenDossier(carmela)}
                  roleBadge="Immigrant Matriarch"
                  isEmigrant
                />
              </div>

              {/* Marriage Bar in Mooca */}
              <div className="flex items-center justify-center gap-2 py-1 bg-[#FAF6F0] rounded-md border border-[#ECE4D5] text-[11px] font-sans text-[#78716C]">
                <Heart className="w-3 h-3 text-[#8C3A27]" />
                <span>Casamento Civil: 27 Julho 1901 · Mooca, São Paulo (Reg. Civ. Termo 312)</span>
              </div>
            </div>
          </div>

          {/* Right Wing: Giovanni Cardillo & Rosa Esposito */}
          <div className="space-y-3">
            {/* Maritime Emigration Banner */}
            <div className="bg-[#EDF4FA] border border-[#CCDDEE] rounded-lg px-3 py-2 flex items-center justify-between text-xs text-[#2B6CB0]">
              <span className="flex items-center gap-1.5 font-semibold">
                <Ship className="w-4 h-4 text-[#2B6CB0]" />
                <span>1893: Piroscafo Italia ➔ Santos &amp; Campinas</span>
              </span>
              <span className="font-mono text-[11px] text-[#225790] hidden sm:inline">Cardillo ➔ Cardilho</span>
            </div>

            {/* Couple Container */}
            <div className="p-3 bg-white/90 rounded-xl border border-[#E7E0D2] shadow-2xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TreeNodeCard
                  person={giovanni}
                  isFocused={focusedPersonId === giovanni.id}
                  isInActivePath={relatedPersonIds.has(giovanni.id)}
                  onFocus={() => onFocusPerson(giovanni.id)}
                  onOpenDossier={() => onOpenDossier(giovanni)}
                  roleBadge="Immigrant Progenitor"
                  isEmigrant
                />
                <TreeNodeCard
                  person={rosa}
                  isFocused={focusedPersonId === rosa.id}
                  isInActivePath={relatedPersonIds.has(rosa.id)}
                  onFocus={() => onFocusPerson(rosa.id)}
                  onOpenDossier={() => onOpenDossier(rosa)}
                  roleBadge="Immigrant Matriarch"
                  isEmigrant
                />
              </div>

              {/* Plantation Settlement Note */}
              <div className="flex items-center justify-center gap-2 py-1 bg-[#F0F5FA] rounded-md border border-[#D7E3EE] text-[11px] font-sans text-[#78716C]">
                <MapPin className="w-3 h-3 text-[#2B6CB0]" />
                <span>Fazenda Santa Gertrudes ➔ Estabelecidos no Cambuí, Campinas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connecting Orthogonal Branches from Gen 2 down to Gen 3 */}
        <div className="grid grid-cols-2 gap-8 lg:gap-14 h-8 relative">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-0.5 h-full bg-[#8C3A27]/40" />
            <div className="w-2 h-2 rounded-full bg-[#8C3A27] -mt-1" />
          </div>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-0.5 h-full bg-[#2B6CB0]/40" />
            <div className="w-2 h-2 rounded-full bg-[#2B6CB0] -mt-1" />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* GENERATION 3 & THE HISTORIC CONVERGENCE UNION (1900s - 1932) */}
      {/* ==================================================================== */}
      <div className="relative">
        {/* Tier Header Line */}
        <div className="flex items-center gap-3 border-b border-[#E2DACB] pb-2 mb-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] bg-[#F3ECE4] px-2.5 py-0.5 rounded border border-[#E7DDCE]">
            Generation III
          </span>
          <h2 className="font-display text-lg font-semibold text-[#1C1917]">
            First Brazilian Generation &amp; The Historic 1932 Convergence Union
          </h2>
          <span className="text-xs text-[#78716C] hidden md:inline">
            · Born in Mooca &amp; Campinas · United at Paróquia Nossa Senhora da Achiropita (Bixiga)
          </span>
        </div>

        {/* The Convergence Union Structure */}
        <div className="bg-gradient-to-b from-[#FFFDF9] to-[#F9F5EC] border-2 border-[#DCD2C0] rounded-2xl p-5 lg:p-6 shadow-sm relative">
          {/* Corner Archival Seals */}
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8C3A27] font-semibold mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8C3A27]" />
              THE GENEALOGICAL CONVERGENCE NODE
            </span>
            <span className="text-[#78716C]">São Paulo Capital · 1932</span>
          </div>

          {/* Cards & Convergence Seal Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Groom: Paschoal Sorage (Mooca, 1904) */}
            <div className="md:col-span-4">
              <div className="text-xs font-sans text-[#8C3A27] font-semibold mb-1 flex items-center gap-1">
                <span>Calabrian Descent (Paternal)</span>
              </div>
              <TreeNodeCard
                person={paschoal}
                isFocused={focusedPersonId === paschoal.id}
                isInActivePath={relatedPersonIds.has(paschoal.id)}
                onFocus={() => onFocusPerson(paschoal.id)}
                onOpenDossier={() => onOpenDossier(paschoal)}
                roleBadge="Groom · 1st Gen Brazilian"
              />
            </div>

            {/* Central Marriage Link Medallion */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#D5C9B3] shadow-xs text-center space-y-2 relative">
              <div className="w-10 h-10 rounded-full bg-[#8C3A27] text-white flex items-center justify-center shadow-xs">
                <Heart className="w-5 h-5 fill-current" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#8C3A27] block">
                  Matrimônio Canônico &amp; Civil
                </span>
                <h4 className="font-display text-base font-bold text-[#1C1917] mt-0.5">
                  15 Outubro 1932
                </h4>
                <p className="font-editorial text-xs text-[#57534E] mt-1 leading-snug">
                  Paróquia Nossa Senhora da Achiropita (Bixiga, São Paulo)
                </p>
              </div>

              <div className="pt-2 border-t border-[#F0EAE0] w-full text-[11px] font-mono text-[#78716C] flex items-center justify-center gap-1.5">
                <FileText className="w-3 h-3 text-[#8C3A27]" />
                <span>Livro Matrimonial 09, Fl. 142</span>
              </div>

              {/* Archival Note */}
              <div className="text-[10px] text-[#8C3A27] font-medium bg-[#FAF2ED] px-2 py-0.5 rounded border border-[#ECD7CC]">
                União das linhagens Suraci &amp; Cardillo
              </div>
            </div>

            {/* Bride & Brother: Concetta Cardillo + Antonio Cardilho */}
            <div className="md:col-span-4 space-y-3">
              <div className="text-xs font-sans text-[#2B6CB0] font-semibold mb-1 flex items-center justify-between">
                <span>Campanian Descent (Maternal)</span>
                <span className="text-[10px] font-mono text-[#78716C]">Campinas ➔ SP</span>
              </div>
              <TreeNodeCard
                person={concetta}
                isFocused={focusedPersonId === concetta.id}
                isInActivePath={relatedPersonIds.has(concetta.id)}
                onFocus={() => onFocusPerson(concetta.id)}
                onOpenDossier={() => onOpenDossier(concetta)}
                roleBadge="Bride · 1st Gen Brazilian"
              />

              {/* Sibling Accordion / Subcard */}
              <div className="pt-1 border-t border-[#E5DFD3]">
                <div className="flex items-center justify-between text-[11px] text-[#78716C] mb-1">
                  <span className="font-medium">Irmão da noiva (Padrinho):</span>
                </div>
                <div
                  onClick={() => onFocusPerson(antonio.id)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    focusedPersonId === antonio.id
                      ? 'bg-white border-[#2B6CB0] ring-1 ring-[#2B6CB0]/30 shadow-xs'
                      : 'bg-white/80 border-[#E2DACB] hover:border-[#2B6CB0] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-display font-semibold text-[#1C1917]">
                      {antonio.originalItalianName}
                    </span>
                    <span className="font-mono text-[10px] text-[#78716C]">1902–1974</span>
                  </div>
                  <div className="text-[10px] font-sans text-[#57534E] flex items-center justify-between mt-0.5">
                    <span>Mestre de Obras · Grafou &quot;Cardilho&quot;</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDossier(antonio);
                      }}
                      className="text-[#2B6CB0] hover:underline cursor-pointer font-medium"
                    >
                      Dossiê
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Central Descendant Trunk Line from 1932 Wedding to Gen 4 */}
        <div className="flex flex-col items-center justify-center h-10 relative">
          <div className="w-0.5 h-full bg-[#8C3A27]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#8C3A27] -mt-1" />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* GENERATION 4 & 5: CONTEMPORARY DESCENDANTS & COMPILERS (1938 - PRESENT) */}
      {/* ==================================================================== */}
      <div className="relative">
        {/* Tier Header Line */}
        <div className="flex items-center gap-3 border-b border-[#E2DACB] pb-2 mb-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] bg-[#F3ECE4] px-2.5 py-0.5 rounded border border-[#E7DDCE]">
            Generation IV &amp; V
          </span>
          <h2 className="font-display text-lg font-semibold text-[#1C1917]">
            Contemporary Descendants &amp; Compilers of the Compendium (1938–Present)
          </h2>
          <span className="text-xs text-[#78716C] hidden md:inline">
            · Preservation of archival memories, Italian citizenship quest &amp; paleographic analysis
          </span>
        </div>

        {/* Linear Descendant Stem */}
        <div className="max-w-xl mx-auto space-y-4">
          {/* Renato Sorage (1938 - 2018) */}
          <div className="relative">
            <TreeNodeCard
              person={renato}
              isFocused={focusedPersonId === renato.id}
              isInActivePath={relatedPersonIds.has(renato.id)}
              onFocus={() => onFocusPerson(renato.id)}
              onOpenDossier={() => onOpenDossier(renato)}
              roleBadge="Son of the 1932 Union · Civil Engineer"
            />
          </div>

          {/* Vertical connecting line */}
          <div className="flex flex-col items-center justify-center h-7">
            <div className="w-0.5 h-full bg-[#8C3A27]/60" />
            <ArrowDown className="w-3.5 h-3.5 text-[#8C3A27] -mt-1" />
          </div>

          {/* R. Sorage (Researcher / Present) */}
          <div className="relative">
            <TreeNodeCard
              person={ramon}
              isFocused={focusedPersonId === ramon.id}
              isInActivePath={relatedPersonIds.has(ramon.id)}
              onFocus={() => onFocusPerson(ramon.id)}
              onOpenDossier={() => onOpenDossier(ramon)}
              roleBadge="Compiler & Genealogical Author (RSorage@gmail.com)"
              isResearcher
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SINGLE BRANCH TREE COMPONENT (Suraci or Cardillo Focused)
// ============================================================================
interface SingleBranchTreeProps {
  branch: 'suraci' | 'cardillo';
  focusedPersonId: string;
  relatedPersonIds: Set<string>;
  onFocusPerson: (id: string) => void;
  onOpenDossier: (person: Person) => void;
}

const SingleBranchTree: React.FC<SingleBranchTreeProps> = ({
  branch,
  focusedPersonId,
  relatedPersonIds,
  onFocusPerson,
  onOpenDossier,
}) => {
  const isSuraci = branch === 'suraci';
  const branchColor = isSuraci ? '#8C3A27' : '#2B6CB0';

  const gen1 = peopleDatabase.filter((p) => p.branch === branch && p.generation === 1);
  const gen2 = peopleDatabase.filter((p) => p.branch === branch && p.generation === 2);
  const gen3 = peopleDatabase.filter((p) => (p.branch === branch || p.branch === 'unified') && p.generation === 3);
  const gen4 = peopleDatabase.filter((p) => p.generation === 4);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2">
      {/* Branch Header Banner */}
      <div
        className="p-4 rounded-xl border text-center space-y-1.5"
        style={{
          backgroundColor: isSuraci ? '#FAF2ED' : '#EDF4FA',
          borderColor: isSuraci ? '#ECD7CC' : '#CCDDEE',
        }}
      >
        <span
          className="text-xs font-mono font-bold uppercase tracking-wider block"
          style={{ color: branchColor }}
        >
          {isSuraci ? 'Calabrian Patronymic Descent · Suraci ➔ Sorage' : 'Campanian Patronymic Descent · Cardillo ➔ Cardilho / Cardilo'}
        </span>
        <h3 className="font-display text-xl font-bold text-[#1C1917]">
          {isSuraci ? 'The Reggio Calabria Lineage (1842–Present)' : 'The Castelnuovo Cilento Lineage (1838–Present)'}
        </h3>
        <p className="font-editorial text-xs text-[#57534E] max-w-lg mx-auto">
          {isSuraci
            ? 'From master stonecutter Antonino Suraci in Reggio Calabria to Fortunato Suraci aboard the Piroscafo Caffaro (1897) and settlement in Bairro da Mooca.'
            : 'From vineyard cooper Gennaro Cardillo in Cilento to Giovanni Cardillo aboard the Piroscafo Italia (1893) and the coffee farms of Campinas.'}
        </p>
      </div>

      {/* Generation 1 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#E2DACB] pb-1 text-xs font-mono text-[#78716C]">
          <span className="font-bold text-[#1C1917]">Tier 1 · Homeland Roots in Italy</span>
          <span>(1838–1870s)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gen1.map((p) => (
            <TreeNodeCard
              key={p.id}
              person={p}
              isFocused={focusedPersonId === p.id}
              isInActivePath={relatedPersonIds.has(p.id)}
              onFocus={() => onFocusPerson(p.id)}
              onOpenDossier={() => onOpenDossier(p)}
              roleBadge="Generation I · Progenitor"
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-0.5 h-6 bg-[#A8A29E]" />
      </div>

      {/* Generation 2 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#E2DACB] pb-1 text-xs font-mono text-[#78716C]">
          <span className="font-bold text-[#1C1917]">Tier 2 · Transatlantic Immigrant Generation</span>
          <span>(1890s Migration)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gen2.map((p) => (
            <TreeNodeCard
              key={p.id}
              person={p}
              isFocused={focusedPersonId === p.id}
              isInActivePath={relatedPersonIds.has(p.id)}
              onFocus={() => onFocusPerson(p.id)}
              onOpenDossier={() => onOpenDossier(p)}
              roleBadge="Generation II · Pioneer"
              isEmigrant
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-0.5 h-6 bg-[#A8A29E]" />
      </div>

      {/* Generation 3 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#E2DACB] pb-1 text-xs font-mono text-[#78716C]">
          <span className="font-bold text-[#1C1917]">Tier 3 · 1st Generation Born in Brazil &amp; 1932 Marriage</span>
          <span>(1900s–1980s)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gen3.map((p) => (
            <TreeNodeCard
              key={p.id}
              person={p}
              isFocused={focusedPersonId === p.id}
              isInActivePath={relatedPersonIds.has(p.id)}
              onFocus={() => onFocusPerson(p.id)}
              onOpenDossier={() => onOpenDossier(p)}
              roleBadge="Generation III · Brazilian Born"
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-0.5 h-6 bg-[#A8A29E]" />
      </div>

      {/* Generation 4 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#E2DACB] pb-1 text-xs font-mono text-[#78716C]">
          <span className="font-bold text-[#1C1917]">Tier 4 · Modern Descendants &amp; Compilers</span>
          <span>(1938–Present)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gen4.map((p) => (
            <TreeNodeCard
              key={p.id}
              person={p}
              isFocused={focusedPersonId === p.id}
              isInActivePath={relatedPersonIds.has(p.id)}
              onFocus={() => onFocusPerson(p.id)}
              onOpenDossier={() => onOpenDossier(p)}
              roleBadge="Generation IV · Modern"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// AHNENTAFEL DIRECT PEDIGREE TREE (Ancestors of Root Person)
// ============================================================================
interface AhnentafelProps {
  rootPersonId: string;
  onFocusPerson: (id: string) => void;
  onOpenDossier: (person: Person) => void;
}

const AhnentafelPedigreeTree: React.FC<AhnentafelProps> = ({
  rootPersonId,
  onFocusPerson,
  onOpenDossier,
}) => {
  const root = peopleDatabase.find((p) => p.id === rootPersonId) || peopleDatabase[peopleDatabase.length - 1];

  const getP = (id?: string) => (id ? peopleDatabase.find((p) => p.id === id) : undefined);

  const father = getP(root.fatherId);
  const mother = getP(root.motherId);

  const patGrandfather = father ? getP(father.fatherId) : undefined;
  const patGrandmother = father ? getP(father.motherId) : undefined;

  const matGrandfather = mother ? getP(mother.fatherId) : undefined;
  const matGrandmother = mother ? getP(mother.motherId) : undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      <div className="text-center space-y-1 bg-[#FAF6F0] p-4 rounded-xl border border-[#E7E0D2]">
        <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#8C3A27]">
          Direct Pedigree Tree (Ahnentafel Format)
        </span>
        <h3 className="font-display text-xl font-bold text-[#1C1917]">
          Ancestral Bloodline of {root.originalItalianName}
        </h3>
        <p className="font-editorial text-xs text-[#57534E]">
          Displaying direct ascendant pedigree back to 19th-century Italian roots.
        </p>
      </div>

      {/* Level 3: Great-Grandparents (Homeland) */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-[#78716C] uppercase tracking-wider font-semibold">
          Great-Grandparents (Homeland Generation I · c. 1838–1845)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {patGrandfather ? (
            <TreeNodeCard
              person={patGrandfather}
              isFocused={false}
              isInActivePath={true}
              onFocus={() => onFocusPerson(patGrandfather.id)}
              onOpenDossier={() => onOpenDossier(patGrandfather)}
              roleBadge="Paternal G-Grandfather"
            />
          ) : (
            <EmptyPedigreeSlot label="Paternal G-Grandfather" />
          )}

          {patGrandmother ? (
            <TreeNodeCard
              person={patGrandmother}
              isFocused={false}
              isInActivePath={true}
              onFocus={() => onFocusPerson(patGrandmother.id)}
              onOpenDossier={() => onOpenDossier(patGrandmother)}
              roleBadge="Paternal G-Grandmother"
            />
          ) : (
            <EmptyPedigreeSlot label="Paternal G-Grandmother" />
          )}

          {matGrandfather ? (
            <TreeNodeCard
              person={matGrandfather}
              isFocused={false}
              isInActivePath={true}
              onFocus={() => onFocusPerson(matGrandfather.id)}
              onOpenDossier={() => onOpenDossier(matGrandfather)}
              roleBadge="Maternal G-Grandfather"
            />
          ) : (
            <EmptyPedigreeSlot label="Maternal G-Grandfather" />
          )}

          {matGrandmother ? (
            <TreeNodeCard
              person={matGrandmother}
              isFocused={false}
              isInActivePath={true}
              onFocus={() => onFocusPerson(matGrandmother.id)}
              onOpenDossier={() => onOpenDossier(matGrandmother)}
              roleBadge="Maternal G-Grandmother"
            />
          ) : (
            <EmptyPedigreeSlot label="Maternal G-Grandmother" />
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-0.5 h-6 bg-[#A8A29E]" />
      </div>

      {/* Level 2: Grandparents (Immigrants) */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-[#78716C] uppercase tracking-wider font-semibold">
          Grandparents (Immigrant Pioneers · Generation II)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {father ? (
            <TreeNodeCard
              person={father}
              isFocused={false}
              isInActivePath={true}
              onFocus={() => onFocusPerson(father.id)}
              onOpenDossier={() => onOpenDossier(father)}
              roleBadge="Father / Direct Line"
            />
          ) : (
            <EmptyPedigreeSlot label="Father" />
          )}

          {mother ? (
            <TreeNodeCard
              person={mother}
              isFocused={false}
              isInActivePath={true}
              onFocus={() => onFocusPerson(mother.id)}
              onOpenDossier={() => onOpenDossier(mother)}
              roleBadge="Mother / Direct Line"
            />
          ) : (
            <EmptyPedigreeSlot label="Mother" />
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-0.5 h-6 bg-[#A8A29E]" />
      </div>

      {/* Level 1: Root Person */}
      <div className="space-y-2 max-w-md mx-auto">
        <div className="text-xs font-mono text-[#78716C] uppercase tracking-wider font-semibold text-center">
          Subject of Pedigree (Generation {root.generation})
        </div>
        <TreeNodeCard
          person={root}
          isFocused={true}
          isInActivePath={true}
          onFocus={() => onFocusPerson(root.id)}
          onOpenDossier={() => onOpenDossier(root)}
          roleBadge="Selected Individual"
        />
      </div>
    </div>
  );
};

const EmptyPedigreeSlot: React.FC<{ label: string }> = ({ label }) => (
  <div className="border border-dashed border-[#D5C9B3] bg-white/40 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[140px] text-xs text-[#A8A29E]">
    <Users className="w-5 h-5 mb-1 stroke-1" />
    <span className="font-medium text-[#78716C]">{label}</span>
    <span className="text-[10px] mt-0.5">Archival quest in progress</span>
  </div>
);

// ============================================================================
// RICH TREE NODE CARD COMPONENT
// ============================================================================
interface TreeNodeCardProps {
  person: Person;
  isFocused: boolean;
  isInActivePath: boolean;
  onFocus: () => void;
  onOpenDossier: () => void;
  roleBadge?: string;
  isEmigrant?: boolean;
  isResearcher?: boolean;
}

const TreeNodeCard: React.FC<TreeNodeCardProps> = ({
  person,
  isFocused,
  isInActivePath,
  onFocus,
  onOpenDossier,
  roleBadge,
  isEmigrant,
  isResearcher,
}) => {
  const getBranchColor = () => {
    if (person.branch === 'suraci') return '#8C3A27';
    if (person.branch === 'cardillo') return '#2B6CB0';
    return '#78350F';
  };

  const branchColor = getBranchColor();

  return (
    <div
      onClick={onFocus}
      className={`relative rounded-xl p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
        isFocused
          ? 'bg-white border-2 shadow-md ring-2 ring-offset-1'
          : isInActivePath
          ? 'bg-white border border-[#D0C5B0] shadow-2xs hover:border-[#8C3A27]'
          : 'bg-white/90 border border-[#E7E0D2] opacity-85 hover:opacity-100 hover:border-[#8C3A27] shadow-2xs'
      }`}
      style={{
        borderColor: isFocused ? branchColor : undefined,
      }}
    >
      <div className="space-y-2.5">
        {/* Top Meta Line: Generation & Role Badge */}
        <div className="flex items-center justify-between text-[11px] font-sans">
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${branchColor}12`,
              color: branchColor,
            }}
          >
            {roleBadge || `Gen ${person.generation}`}
          </span>
          <span className="font-mono tabular-nums text-[#78716C] text-[11px] font-medium">
            {person.birthYear} – {person.deathYear ?? 'Present'}
          </span>
        </div>

        {/* Names */}
        <div>
          <h4 className="font-display text-base sm:text-lg font-bold text-[#1C1917] group-hover:text-[#8C3A27] transition-colors leading-snug">
            {person.originalItalianName}
          </h4>
          {person.brazilianSpellingVariants.length > 0 && (
            <p className="text-[11px] font-editorial italic text-[#78716C] mt-0.5">
              In Brazil:{' '}
              <span className="font-sans font-medium text-[#44403C] not-italic">
                {person.brazilianSpellingVariants.join(', ')}
              </span>
            </p>
          )}
        </div>

        {/* Vitals & Places */}
        <div className="space-y-1 text-xs text-[#57534E] font-sans pt-1 border-t border-[#F4EFE6]">
          <div className="flex items-start gap-1.5 text-[11px]">
            <MapPin className="w-3 h-3 text-[#A8A29E] shrink-0 mt-0.5" />
            <span className="text-[#292524] truncate" title={person.birthPlace}>
              {person.birthCommune}, {person.birthRegion}
            </span>
          </div>

          {(isEmigrant || person.immigrationYear) && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#8C3A27]">
              <Anchor className="w-3 h-3 shrink-0" />
              <span className="truncate">
                Emigrated {person.immigrationYear} ({person.shipName || 'Steamship'})
              </span>
            </div>
          )}

          {person.occupation && (
            <div className="flex items-start gap-1.5 text-[11px] text-[#78716C]">
              <Briefcase className="w-3 h-3 text-[#A8A29E] shrink-0 mt-0.5" />
              <span className="truncate">{person.occupation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Action Bar */}
      <div className="pt-2.5 mt-2.5 border-t border-[#F4EFE6] flex items-center justify-between text-[11px] text-[#78716C]">
        <div className="flex items-center gap-1">
          {isFocused ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Selected
            </span>
          ) : (
            <span className="text-[#8C3A27] font-medium group-hover:underline">Focus Path</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDossier();
          }}
          className="text-[#1C1917] hover:text-[#8C3A27] font-medium inline-flex items-center gap-0.5 cursor-pointer bg-[#F5F0E6] hover:bg-[#EBE3D5] px-2 py-0.5 rounded transition-colors"
        >
          <span>Dossier</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
