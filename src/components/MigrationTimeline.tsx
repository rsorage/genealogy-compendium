import React, { useState } from 'react';
import {
  Compass,
  Ship,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  ArrowRight,
  Layers,
  Filter,
  Check,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { migrationStages, historicalRecordsDatabase } from '../data/genealogyData';
import { MigrationStage, HistoricalRecord } from '../types/genealogy';
import { D3MigrationMap } from './D3MigrationMap';

interface MigrationTimelineProps {
  onSelectRecord?: (record: HistoricalRecord) => void;
}

export const MigrationTimeline: React.FC<MigrationTimelineProps> = ({ onSelectRecord }) => {
  // Lineage Filter: 'both' | 'suraci' | 'cardillo'
  const [selectedLineage, setSelectedLineage] = useState<'both' | 'suraci' | 'cardillo'>('both');
  const [activeStageId, setActiveStageId] = useState<string>(migrationStages[0].id);

  // Filter chronological stages according to selected lineage
  const filteredStages = migrationStages.filter((stage) => {
    if (selectedLineage === 'both') return true;
    if (stage.branch === 'unified') return true;
    return stage.branch === selectedLineage;
  });

  const currentStage =
    filteredStages.find((s) => s.id === activeStageId) || filteredStages[0] || migrationStages[0];

  return (
    <div className="space-y-10 py-6">
      {/* Page Title & Curatorial Subtitle */}
      <div className="border-b border-[#E7E2D8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#8C3A27] mb-1">
            Transatlantic Cartography &amp; Settlement Chronology
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
            Migration Timeline &amp; Cartographic Atlas
          </h1>
          <p className="font-editorial text-sm sm:text-base text-[#57534E] mt-1 max-w-2xl">
            An interactive D3.js visualization tracing the geographic shift from the mountains of Southern Italy across the Atlantic Ocean to the coffee plantations and urban quarters of São Paulo.
          </p>
        </div>

        {/* Nautical Mileage & Duration Stamp */}
        <div className="flex items-center gap-3 text-xs font-mono text-[#78716C] bg-[#F5F0E6] px-4 py-2.5 rounded-lg border border-[#E7E0D2] shrink-0">
          <div>
            <span className="font-semibold text-[#1C1917]">~5,200</span> Nautical Miles
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span className="font-semibold text-[#1C1917]">20–24</span> Days at Sea
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span className="font-semibold text-[#8C3A27]">8</span> Decades Mapped
          </div>
        </div>
      </div>

      {/* FEATURED: LINEAGE PATH FILTERING UI */}
      <section className="bg-white border border-[#E7E2D8] rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2ECE1] pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8C3A27]" />
            <span className="text-xs uppercase tracking-widest font-sans font-semibold text-[#1C1917]">
              Lineage Path Selector:
            </span>
          </div>
          <span className="text-xs font-sans text-[#78716C]">
            Select an ancestral lineage to highlight its specific oceanic corridor and settlement history
          </span>
        </div>

        {/* Primary 3-Way Segmented Control */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Button 1: Both Families (Unified) */}
          <button
            onClick={() => setSelectedLineage('both')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
              selectedLineage === 'both'
                ? 'bg-[#F5F0E6] border-[#1C1917] shadow-sm ring-1 ring-[#1C1917]/20'
                : 'bg-[#FAF8F5] border-[#E7E2D8] hover:bg-white hover:border-[#D6CEBE]'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C]">
                  Unified Compendium
                </span>
                {selectedLineage === 'both' && (
                  <Check className="w-4 h-4 text-[#1C1917] shrink-0" />
                )}
              </div>
              <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                Both Lineages (Dual Paths)
              </h3>
              <p className="text-xs font-editorial text-[#57534E] leading-relaxed">
                Display the comparative routes of both the Calabrian and Campanian migrations, culminating in the 1932 marriage union in São Paulo.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#EAE4D7] flex items-center gap-2 text-[11px] font-mono text-[#78716C]">
              <span className="w-2 h-2 rounded-full bg-[#8C3A27]" />
              <span>Suraci (1897)</span>
              <span aria-hidden="true">·</span>
              <span className="w-2 h-2 rounded-full bg-[#2B6CB0]" />
              <span>Cardillo (1893)</span>
            </div>
          </button>

          {/* Button 2: Sorage / Suraci Lineage */}
          <button
            onClick={() => setSelectedLineage('suraci')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
              selectedLineage === 'suraci'
                ? 'bg-[#FAF3F0] border-[#8C3A27] shadow-sm ring-1 ring-[#8C3A27]/30'
                : 'bg-[#FAF8F5] border-[#E7E2D8] hover:bg-white hover:border-[#D6CEBE]'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C3A27] font-semibold">
                  Calabrian Lineage
                </span>
                {selectedLineage === 'suraci' && (
                  <Check className="w-4 h-4 text-[#8C3A27] shrink-0" />
                )}
              </div>
              <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                Sorage Lineage (it: Suraci)
              </h3>
              <p className="text-xs font-editorial text-[#57534E] leading-relaxed">
                From the Strait of Messina &amp; Motta San Giovanni aboard the steamship <em>Caffaro</em> (1897) to the artisan shoemaker bottega on Rua da Mooca.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#EAE4D7] flex items-center justify-between text-[11px] font-mono text-[#8C3A27]">
              <span>Reggio Calabria ➔ Santos ➔ Mooca</span>
              <span className="font-semibold">1897</span>
            </div>
          </button>

          {/* Button 3: Cardillo / Cardilo Lineage */}
          <button
            onClick={() => setSelectedLineage('cardillo')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
              selectedLineage === 'cardillo'
                ? 'bg-[#F0F5FA] border-[#2B6CB0] shadow-sm ring-1 ring-[#2B6CB0]/30'
                : 'bg-[#FAF8F5] border-[#E7E2D8] hover:bg-white hover:border-[#D6CEBE]'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#2B6CB0] font-semibold">
                  Campanian Lineage
                </span>
                {selectedLineage === 'cardillo' && (
                  <Check className="w-4 h-4 text-[#2B6CB0] shrink-0" />
                )}
              </div>
              <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                Cardillo Lineage (br: Cardilo, Cardilho)
              </h3>
              <p className="text-xs font-editorial text-[#57534E] leading-relaxed">
                From the Cilento valleys of Salerno aboard the <em>Piroscafo Italia</em> (1893) to the coffee groves of Fazenda Santa Gertrudes &amp; Campinas masonry.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#EAE4D7] flex items-center justify-between text-[11px] font-mono text-[#2B6CB0]">
              <span>Salerno ➔ Santos ➔ Campinas &amp; Bixiga</span>
              <span className="font-semibold">1893</span>
            </div>
          </button>
        </div>

        {/* Dynamic Contextual Dossier Strip for Selected Lineage */}
        <div className="p-4 bg-[#FAF7F2] border border-[#E7E0D2] rounded-xl">
          {selectedLineage === 'suraci' && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8C3A27]" />
                  <span className="font-semibold text-[#1C1917]">
                    Sorage Lineage Route Profile:
                  </span>
                  <span className="text-[#57534E]">
                    Calabria ➔ Liguria (Genoa) ➔ Santos ➔ Hospedaria do Brás ➔ Mooca (São Paulo)
                  </span>
                </div>
                {onSelectRecord && (
                  <button
                    onClick={() => onSelectRecord(historicalRecordsDatabase[0])}
                    className="text-[#8C3A27] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Fortunato Suraci 1871 Birth Act</span>
                  </button>
                )}
              </div>
              <p className="text-xs font-editorial text-[#44403C] leading-relaxed">
                Fortunato Suraci completed military service in Reggio Calabria before emigrating in 1897 aboard the <em>Caffaro</em>. Upon arrival in São Paulo, his name was recorded as &ldquo;Fortunato Sorage&rdquo;. In 1901 he married Carmela Morabito and established his leather shoe craft on Rua da Mooca.
              </p>
            </div>
          )}

          {selectedLineage === 'cardillo' && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2B6CB0]" />
                  <span className="font-semibold text-[#1C1917]">
                    Cardillo Lineage Route Profile:
                  </span>
                  <span className="text-[#57534E]">
                    Castelnuovo Cilento &amp; Salerno ➔ Genoa ➔ Santos ➔ Fazenda Santa Gertrudes ➔ Campinas &amp; Bixiga
                  </span>
                </div>
                {onSelectRecord && (
                  <button
                    onClick={() => onSelectRecord(historicalRecordsDatabase[1])}
                    className="text-[#2B6CB0] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View 1893 Piroscafo Italia Manifest</span>
                  </button>
                )}
              </div>
              <p className="text-xs font-editorial text-[#44403C] leading-relaxed">
                Giovanni Cardillo (24) and wife Rosa Esposito (20) sailed aboard the steamship <em>Italia</em> in September 1893 with subsidized colono tickets. At Hospedaria do Brás, clerks recorded their name as &ldquo;Cardilho&rdquo;. They harvested coffee at Fazenda Santa Gertrudes before moving to Campinas, where Giovanni worked as a master builder.
              </p>
            </div>
          )}

          {selectedLineage === 'both' && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1C1917]" />
                  <span className="font-semibold text-[#1C1917]">
                    Dual Convergence Profile:
                  </span>
                  <span className="text-[#57534E]">
                    Comparing the 1893 Cardillo and 1897 Suraci Transatlantic Crossings
                  </span>
                </div>
                {onSelectRecord && (
                  <button
                    onClick={() => onSelectRecord(historicalRecordsDatabase[4])}
                    className="text-[#8C3A27] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View 1932 Achiropita Union Deed</span>
                  </button>
                )}
              </div>
              <p className="text-xs font-editorial text-[#44403C] leading-relaxed">
                Both lineages independently traversed the Atlantic during the 1890s immigration wave, each experiencing phonetic surname transformation by Brazilian cartório scribes. In 1932, Paschoal Sorage and Concetta Cardillo married in the Bixiga neighborhood, permanently joining both histories.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CORE FEATURE: Interactive Zoomable D3 Migration Map & Decade Scrubber */}
      <section className="space-y-3">
        <D3MigrationMap
          branchFilter={selectedLineage}
          onBranchFilterChange={setSelectedLineage}
          onSelectRecord={onSelectRecord}
        />
      </section>

      {/* SECTION II: Chronological Itinerary & In-Depth Historical Chapters */}
      <section className="bg-white border border-[#E7E2D8] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E2D8] pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8C3A27]" />
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#1C1917]">
              Detailed Migration Chapters ({filteredStages.length} Milestones)
            </h2>
          </div>
          <div className="text-xs font-sans text-[#78716C] flex items-center gap-2">
            <span>Filtered for: </span>
            <span className="font-semibold text-[#1C1917]">
              {selectedLineage === 'suraci'
                ? 'Sorage / Suraci'
                : selectedLineage === 'cardillo'
                ? 'Cardillo / Cardilo'
                : 'All Lineages'}
            </span>
          </div>
        </div>

        {/* Milestone Stepper Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredStages.map((stage) => {
            const isSelected = activeStageId === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#F5F0E6] border-[#8C3A27] shadow-xs ring-1 ring-[#8C3A27]/20'
                    : 'bg-[#FAF8F5] border-[#E7E2D8] hover:border-[#D6CEBE]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className={`font-semibold ${isSelected ? 'text-[#8C3A27]' : 'text-[#78716C]'}`}>
                    STAGE {stage.stepNumber}
                  </span>
                  <span className="text-[#A8A29E] text-[10px]">{stage.year}</span>
                </div>
                <h4 className="font-display text-sm font-semibold text-[#1C1917] truncate">
                  {stage.title.split(':')[0]}
                </h4>
                <p className="text-[11px] font-sans text-[#57534E] truncate mt-0.5">
                  {stage.locationName}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E5DFD3] pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#8C3A27] mb-1">
                <span>STAGE {currentStage.stepNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{currentStage.year}</span>
                <span aria-hidden="true">·</span>
                <span className="uppercase text-[#57534E]">
                  {currentStage.branch === 'suraci'
                    ? 'Suraci Branch'
                    : currentStage.branch === 'cardillo'
                    ? 'Cardillo Branch'
                    : 'Unified Milestone'}
                </span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                {currentStage.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#57534E] font-medium bg-white px-3 py-1.5 rounded-md border border-[#E7E2D8]">
              <MapPin className="w-3.5 h-3.5 text-[#8C3A27]" />
              <span>{currentStage.locationName}</span>
            </div>
          </div>

          <p className="font-editorial text-base text-[#292524] leading-relaxed">
            {currentStage.narrative}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Historical Context */}
            <div className="bg-white p-4 rounded-lg border border-[#E7E2D8] space-y-1.5 text-xs font-sans">
              <span className="font-semibold text-[#8C3A27] uppercase tracking-wider text-[11px] block">
                Diaspora Phenomenon:
              </span>
              <p className="text-[#57534E] leading-relaxed">
                {currentStage.historicalContext}
              </p>
            </div>

            {/* Archival Proof & Figures */}
            <div className="bg-white p-4 rounded-lg border border-[#E7E2D8] space-y-2 text-xs font-sans">
              <div>
                <span className="font-semibold text-[#1C1917] uppercase tracking-wider text-[11px] block">
                  Primary Archival Citation:
                </span>
                <p className="font-mono text-[11px] text-[#44403C] mt-0.5">
                  {currentStage.archivalSource}
                </p>
              </div>

              <div className="pt-2 border-t border-[#F2ECE1]">
                <span className="text-[#78716C] font-medium mr-1.5">Family Participants:</span>
                <span className="font-editorial italic text-[#1C1917]">
                  {currentStage.keyActors.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
