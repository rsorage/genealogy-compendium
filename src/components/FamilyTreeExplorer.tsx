import React, { useState } from 'react';
import { Compass, Users, Sparkles, FileText, ChevronRight, Anchor, Heart, ArrowRight } from 'lucide-react';
import { peopleDatabase, historicalRecordsDatabase } from '../data/genealogyData';
import type { Person, BranchId } from '../types/genealogy';
import { RelationshipPathIndicator } from './RelationshipPathIndicator';

interface FamilyTreeExplorerProps {
  onSelectPerson: (person: Person) => void;
}

export const FamilyTreeExplorer: React.FC<FamilyTreeExplorerProps> = ({ onSelectPerson }) => {
  const [activeBranch, setActiveBranch] = useState<BranchId>('unified');
  const [generationFilter, setGenerationFilter] = useState<number | 'all'>('all');
  const [focusedPerson, setFocusedPerson] = useState<Person>(
    peopleDatabase.find((p) => p.id === 'sorage-paschoal-1904') || peopleDatabase[0]
  );

  // Filter people according to branch & generation
  const filteredPeople = peopleDatabase.filter((person) => {
    if (activeBranch !== 'unified') {
      if (person.branch !== activeBranch && person.branch !== 'unified') {
        return false;
      }
    }
    if (generationFilter !== 'all' && person.generation !== generationFilter) {
      return false;
    }
    return true;
  });

  const getBranchBadge = (person: Person) => {
    if (person.branch === 'suraci') {
      return <span className="text-[#8C3A27] font-medium">Suraci ➔ Sorage</span>;
    }
    if (person.branch === 'cardillo') {
      return <span className="text-[#2B6CB0] font-medium">Cardillo ➔ Cardilho / Cardilo</span>;
    }
    return <span className="text-[#78350F] font-medium">Unified Italo-Brasilian</span>;
  };

  const handleFocusById = (id: string) => {
    const found = peopleDatabase.find((p) => p.id === id);
    if (found) {
      setFocusedPerson(found);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Title & Curatorial Subtitle */}
      <div className="border-b border-[#E7E2D8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#8C3A27] mb-1">
            Archival Pedigree &amp; Generational Succession
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
            Lineage Trees: Suraci &amp; Cardillo
          </h1>
          <p className="font-editorial text-sm sm:text-base text-[#57534E] mt-1 max-w-2xl">
            Trace the generational progression from the 19th-century Italian patriarchs in Calabria and Campania through the ocean crossing and the 1932 marriage in São Paulo.
          </p>
        </div>

        {/* Global Statistics Strip */}
        <div className="flex items-center gap-4 text-xs font-sans text-[#78716C] bg-[#F5F0E6] px-4 py-2.5 rounded-lg border border-[#E7E0D2] shrink-0">
          <div>
            <span className="font-mono font-semibold text-[#1C1917] tabular-nums">11</span> Documented
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span className="font-mono font-semibold text-[#1C1917] tabular-nums">4</span> Generations
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span className="font-mono font-semibold text-[#8C3A27] tabular-nums">6</span> Primary Records
          </div>
        </div>
      </div>

      {/* Control Ribbon: Branch Switcher & Generation Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E7E2D8] shadow-2xs">
        {/* Branch Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4EFE6] rounded-lg overflow-x-auto">
          <button
            onClick={() => setActiveBranch('unified')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeBranch === 'unified'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            All Lineages (Unified Pedigree)
          </button>
          <button
            onClick={() => setActiveBranch('suraci')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeBranch === 'suraci'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Suraci / Sorage (Calabria)
          </button>
          <button
            onClick={() => setActiveBranch('cardillo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeBranch === 'cardillo'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Cardillo / Cardilo (Campania)
          </button>
        </div>

        {/* Generation Filter Tabs */}
        <div className="flex items-center gap-1 text-xs text-[#78716C]">
          <span className="font-medium mr-1 hidden sm:inline">Tier:</span>
          {(['all', 1, 2, 3, 4] as const).map((gen) => (
            <button
              key={gen}
              onClick={() => setGenerationFilter(gen)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                generationFilter === gen
                  ? 'bg-[#1C1917] text-white font-semibold'
                  : 'bg-[#F4EFE6] text-[#57534E] hover:bg-[#EBE5DA]'
              }`}
            >
              {gen === 'all' ? 'All' : `Gen ${gen}`}
            </button>
          ))}
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

      {/* Union Callout Box when Unified Branch is viewed */}
      {activeBranch === 'unified' && generationFilter === 'all' && (
        <div className="bg-[#FAF7F0] border border-[#E5DFD3] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-[#8C3A27] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display text-base font-semibold text-[#1C1917]">
                The Historic Union: São Paulo, 1932
              </h4>
              <p className="font-editorial text-xs text-[#57534E] leading-relaxed">
                The Calabrian line of <strong>Paschoal Sorage</strong> (son of Fortunato Suraci) married <strong>Concetta Cardillo</strong> (daughter of Giovanni Cardillo) at the Paróquia de Nossa Senhora da Achiropita (Bixiga), permanently uniting both Italian immigrant heritages.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-[#78716C] shrink-0">
            Reg. Civ. Bela Vista 1932
          </div>
        </div>
      )}

      {/* Generation Tiers */}
      <div className="space-y-12">
        {/* Tier 1: Italian Progenitors */}
        {(generationFilter === 'all' || generationFilter === 1) && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E7E2D8] pb-2">
              <span className="text-xs font-mono font-semibold text-[#8C3A27] uppercase tracking-wider bg-[#F5EFEB] px-2 py-0.5 rounded">
                Generation I
              </span>
              <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                The Italian Progenitors in the Homeland (c. 1838–1870s)
              </h3>
              <span className="text-xs text-[#78716C] hidden sm:inline">· Pre-Emigration Era</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredPeople
                .filter((p) => p.generation === 1)
                .map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    isFocused={focusedPerson.id === person.id}
                    onFocusPerson={() => setFocusedPerson(person)}
                    onSelectPerson={onSelectPerson}
                    getBranchBadge={getBranchBadge}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Tier 2: The Transatlantic Immigrants */}
        {(generationFilter === 'all' || generationFilter === 2) && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E7E2D8] pb-2">
              <span className="text-xs font-mono font-semibold text-[#8C3A27] uppercase tracking-wider bg-[#F5EFEB] px-2 py-0.5 rounded">
                Generation II
              </span>
              <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                The Emigrant Pioneers &amp; Transatlantic Crossing (1890s–1910s)
              </h3>
              <span className="text-xs text-[#78716C] hidden sm:inline">· Steamships Italia &amp; Caffaro</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredPeople
                .filter((p) => p.generation === 2)
                .map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    isFocused={focusedPerson.id === person.id}
                    onFocusPerson={() => setFocusedPerson(person)}
                    onSelectPerson={onSelectPerson}
                    getBranchBadge={getBranchBadge}
                    isEmigrant
                  />
                ))}
            </div>
          </div>
        )}

        {/* Tier 3: Brazilian Born & The Union */}
        {(generationFilter === 'all' || generationFilter === 3) && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E7E2D8] pb-2">
              <span className="text-xs font-mono font-semibold text-[#8C3A27] uppercase tracking-wider bg-[#F5EFEB] px-2 py-0.5 rounded">
                Generation III
              </span>
              <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                First Brazilian Generation &amp; The Mooca/Bixiga Convergence (1900s–1970s)
              </h3>
              <span className="text-xs text-[#78716C] hidden sm:inline">· Unification Era</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPeople
                .filter((p) => p.generation === 3)
                .map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    isFocused={focusedPerson.id === person.id}
                    onFocusPerson={() => setFocusedPerson(person)}
                    onSelectPerson={onSelectPerson}
                    getBranchBadge={getBranchBadge}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Tier 4: Modern Descendants & Genealogical Compiler */}
        {(generationFilter === 'all' || generationFilter === 4) && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E7E2D8] pb-2">
              <span className="text-xs font-mono font-semibold text-[#8C3A27] uppercase tracking-wider bg-[#F5EFEB] px-2 py-0.5 rounded">
                Generation IV
              </span>
              <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                Contemporary Descendants &amp; Compilers (1930s–Present)
              </h3>
              <span className="text-xs text-[#78716C] hidden sm:inline">· Preservation &amp; Archive Quests</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPeople
                .filter((p) => p.generation === 4)
                .map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    isFocused={focusedPerson.id === person.id}
                    onFocusPerson={() => setFocusedPerson(person)}
                    onSelectPerson={onSelectPerson}
                    getBranchBadge={getBranchBadge}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface PersonCardProps {
  person: Person;
  isFocused: boolean;
  onFocusPerson: () => void;
  onSelectPerson: (person: Person) => void;
  getBranchBadge: (person: Person) => React.ReactNode;
  isEmigrant?: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  isFocused,
  onFocusPerson,
  onSelectPerson,
  getBranchBadge,
  isEmigrant,
}) => {
  return (
    <div
      onClick={onFocusPerson}
      className={`border transition-all duration-200 rounded-xl p-4 flex flex-col justify-between cursor-pointer group relative ${
        isFocused
          ? 'bg-white border-[#8C3A27] ring-2 ring-[#8C3A27]/25 shadow-md'
          : 'bg-white border-[#E7E2D8] hover:border-[#8C3A27] hover:shadow-sm'
      }`}
    >
      <div className="space-y-3">
        {/* Top Meta Line: Unboxed, clean metadata */}
        <div className="flex items-center justify-between text-[11px] font-sans text-[#78716C]">
          <div>{getBranchBadge(person)}</div>
          <div className="font-mono tabular-nums">
            {person.birthYear} – {person.deathYear ?? 'Present'}
          </div>
        </div>

        {/* Names */}
        <div>
          <h4 className="font-display text-lg font-semibold text-[#1C1917] group-hover:text-[#8C3A27] transition-colors leading-snug">
            {person.originalItalianName}
          </h4>
          {person.brazilianSpellingVariants.length > 0 && (
            <p className="text-xs font-editorial italic text-[#78716C] mt-0.5">
              In Brazil: <span className="font-sans font-medium text-[#44403C] not-italic">{person.brazilianSpellingVariants.join(', ')}</span>
            </p>
          )}
        </div>

        {/* Vital Place & Immigration Tag */}
        <div className="space-y-1.5 text-xs text-[#57534E] font-sans pt-1 border-t border-[#F4EFE6]">
          <div className="flex items-start gap-1.5">
            <span className="text-[#A8A29E] shrink-0">Birth:</span>
            <span className="text-[#292524] truncate" title={person.birthPlace}>
              {person.birthCommune}, {person.birthRegion}
            </span>
          </div>

          {isEmigrant && person.immigrationYear && (
            <div className="flex items-center gap-1.5 text-[#8C3A27] font-medium">
              <Anchor className="w-3 h-3 shrink-0" />
              <span>
                Emigrated {person.immigrationYear} ({person.shipName ?? 'Vapore'})
              </span>
            </div>
          )}

          {person.occupation && (
            <div className="flex items-start gap-1.5 text-[#78716C]">
              <span className="text-[#A8A29E] shrink-0">Trade:</span>
              <span className="truncate">{person.occupation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Strip */}
      <div className="pt-3 mt-3 border-t border-[#F4EFE6] flex items-center justify-between text-[11px] text-[#78716C]">
        <div className="flex items-center gap-1 text-[11px] text-[#8C3A27] font-medium">
          {isFocused ? (
            <span className="flex items-center gap-1 text-emerald-800 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Path Active
            </span>
          ) : (
            <span className="group-hover:text-[#8C3A27]">Trace Path</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectPerson(person);
          }}
          className="text-[#8C3A27] font-medium hover:underline inline-flex items-center gap-0.5 cursor-pointer"
        >
          <span>Dossier</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
