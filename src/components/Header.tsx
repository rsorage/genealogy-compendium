import React from 'react';
import { Search, Mail } from 'lucide-react';

interface HeaderProps {
  activeTab: 'compendium' | 'tree' | 'records' | 'migration' | 'quest';
  onSelectTab: (tab: 'compendium' | 'tree' | 'records' | 'migration' | 'quest') => void;
  onOpenSearch: () => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenContact,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E7E2D8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (4-5 Nav Links) — Zone 3 (1 Primary Action) */}
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onSelectTab('compendium')}
            className="text-left group cursor-pointer focus:outline-none shrink-0"
          >
            <span className="font-display text-2xl lg:text-3xl font-medium tracking-tight text-[#1C1917] group-hover:text-[#8C3A27] transition-colors whitespace-nowrap">
              SURACI &amp; CARDILLO
            </span>
          </button>

          {/* Zone 2: 5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]">
            <button
              onClick={() => onSelectTab('compendium')}
              className={`hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                activeTab === 'compendium'
                  ? 'text-[#1C1917] border-b-2 border-[#8C3A27] font-semibold'
                  : 'hover:border-b-2 hover:border-[#D6CEBE]'
              }`}
            >
              The Compendium
            </button>
            <button
              onClick={() => onSelectTab('tree')}
              className={`hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                activeTab === 'tree'
                  ? 'text-[#1C1917] border-b-2 border-[#8C3A27] font-semibold'
                  : 'hover:border-b-2 hover:border-[#D6CEBE]'
              }`}
            >
              Lineage Trees
            </button>
            <button
              onClick={() => onSelectTab('records')}
              className={`hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                activeTab === 'records'
                  ? 'text-[#1C1917] border-b-2 border-[#8C3A27] font-semibold'
                  : 'hover:border-b-2 hover:border-[#D6CEBE]'
              }`}
            >
              Historical Records
            </button>
            <button
              onClick={() => onSelectTab('migration')}
              className={`hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                activeTab === 'migration'
                  ? 'text-[#1C1917] border-b-2 border-[#8C3A27] font-semibold'
                  : 'hover:border-b-2 hover:border-[#D6CEBE]'
              }`}
            >
              Migration Routes
            </button>
            <button
              onClick={() => onSelectTab('quest')}
              className={`hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                activeTab === 'quest'
                  ? 'text-[#1C1917] border-b-2 border-[#8C3A27] font-semibold'
                  : 'hover:border-b-2 hover:border-[#D6CEBE]'
              }`}
            >
              Research Quests
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Quick Search Affordance */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded-md transition-colors cursor-pointer"
              aria-label="Search genealogy archives"
              title="Search people, records & places (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenContact}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#FBF9F5] bg-[#1C1917] hover:bg-[#342F2C] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Submit Family Clue</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-[#E7E2D8] text-xs font-medium text-[#57534E] gap-4 scrollbar-none">
          <button
            onClick={() => onSelectTab('compendium')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'compendium' ? 'text-[#8C3A27] font-semibold bg-[#F3EFE6]' : ''}`}
          >
            Compendium
          </button>
          <button
            onClick={() => onSelectTab('tree')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'tree' ? 'text-[#8C3A27] font-semibold bg-[#F3EFE6]' : ''}`}
          >
            Lineage Trees
          </button>
          <button
            onClick={() => onSelectTab('records')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'records' ? 'text-[#8C3A27] font-semibold bg-[#F3EFE6]' : ''}`}
          >
            Records
          </button>
          <button
            onClick={() => onSelectTab('migration')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'migration' ? 'text-[#8C3A27] font-semibold bg-[#F3EFE6]' : ''}`}
          >
            Migration
          </button>
          <button
            onClick={() => onSelectTab('quest')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'quest' ? 'text-[#8C3A27] font-semibold bg-[#F3EFE6]' : ''}`}
          >
            Quests
          </button>
        </div>
      </div>
    </header>
  );
};
