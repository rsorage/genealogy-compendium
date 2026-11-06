import React, { useState, useEffect } from 'react';
import { Search, X, User, FileText, Compass, HelpCircle, ArrowRight } from 'lucide-react';
import { peopleDatabase, historicalRecordsDatabase, questLogEntries, migrationStages } from '../data/genealogyData';
import { Person, HistoricalRecord } from '../types/genealogy';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPerson: (person: Person) => void;
  onSelectRecord: (record: HistoricalRecord) => void;
  onNavigateTab: (tab: 'compendium' | 'tree' | 'records' | 'migration' | 'quest') => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onClose,
  onSelectPerson,
  onSelectRecord,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled by parent
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const normalized = query.toLowerCase().trim();

  // Search Results
  const matchedPeople = normalized
    ? peopleDatabase.filter(
        (p) =>
          p.originalItalianName.toLowerCase().includes(normalized) ||
          p.brazilianSpellingVariants.some((v) => v.toLowerCase().includes(normalized)) ||
          p.birthCommune.toLowerCase().includes(normalized) ||
          p.occupation?.toLowerCase().includes(normalized) ||
          p.biography.toLowerCase().includes(normalized)
      )
    : [];

  const matchedRecords = normalized
    ? historicalRecordsDatabase.filter(
        (r) =>
          r.title.toLowerCase().includes(normalized) ||
          r.italianTitle.toLowerCase().includes(normalized) ||
          r.commune.toLowerCase().includes(normalized) ||
          r.archiveRepository.toLowerCase().includes(normalized) ||
          r.summary.toLowerCase().includes(normalized)
      )
    : [];

  const matchedQuests = normalized
    ? questLogEntries.filter(
        (q) =>
          q.title.toLowerCase().includes(normalized) ||
          q.code.toLowerCase().includes(normalized) ||
          q.targetPerson.toLowerCase().includes(normalized) ||
          q.hypothesis.toLowerCase().includes(normalized)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-[#FBF9F5] border border-[#E7E2D8] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E7E2D8] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#8C3A27] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ancestors, Brazilian spellings, archives, communes (e.g. Sorage, Cardillo, Reggio)..."
            className="w-full text-sm font-sans bg-transparent text-[#1C1917] focus:outline-none placeholder:text-[#A8A29E]"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] font-mono text-[#A8A29E] bg-[#F4EFE6] px-1.5 py-0.5 rounded border border-[#E7E0D2]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto archive-scroll p-4 space-y-4">
          {!query ? (
            <div className="text-center py-8 space-y-2">
              <Compass className="w-8 h-8 text-[#D6CEBE] mx-auto" />
              <p className="text-xs text-[#78716C] font-sans">
                Search across 12 ancestors, 6 primary historical records, and 5 research quests.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['Sorage', 'Suraci', 'Cardillo', 'Cardilho', 'Reggio Calabria', 'Mooca', 'Caffaro'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="text-[11px] bg-white border border-[#E7E2D8] text-[#57534E] hover:text-[#8C3A27] hover:border-[#8C3A27] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : matchedPeople.length === 0 && matchedRecords.length === 0 && matchedQuests.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#78716C] font-sans">
              No matching ancestors, records, or inquiries found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-4 text-xs font-sans">
              {/* Matched People */}
              {matchedPeople.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C] px-1">
                    Ancestors ({matchedPeople.length})
                  </div>
                  {matchedPeople.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => {
                        onClose();
                        onSelectPerson(person);
                      }}
                      className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-[#F5F0E6] border border-[#E7E2D8] transition-all flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#8C3A27] shrink-0" />
                        <div>
                          <div className="font-semibold text-[#1C1917]">
                            {person.originalItalianName}
                          </div>
                          <div className="text-[11px] text-[#78716C]">
                            {person.birthYear}–{person.deathYear ?? 'Present'} · {person.birthCommune} · Variants: {person.brazilianSpellingVariants.join(', ')}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                    </button>
                  ))}
                </div>
              )}

              {/* Matched Records */}
              {matchedRecords.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C] px-1">
                    Historical Documents ({matchedRecords.length})
                  </div>
                  {matchedRecords.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => {
                        onClose();
                        onNavigateTab('records');
                        onSelectRecord(record);
                      }}
                      className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-[#F5F0E6] border border-[#E7E2D8] transition-all flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#2B6CB0] shrink-0" />
                        <div>
                          <div className="font-semibold text-[#1C1917]">{record.title}</div>
                          <div className="text-[11px] text-[#78716C]">
                            {record.year} · {record.commune} · {record.archiveRepository.split('-')[0]}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                    </button>
                  ))}
                </div>
              )}

              {/* Matched Quests */}
              {matchedQuests.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C] px-1">
                    Research Quests ({matchedQuests.length})
                  </div>
                  {matchedQuests.map((quest) => (
                    <button
                      key={quest.id}
                      onClick={() => {
                        onClose();
                        onNavigateTab('quest');
                      }}
                      className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-[#F5F0E6] border border-[#E7E2D8] transition-all flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-[#8C3A27] shrink-0" />
                        <div>
                          <div className="font-semibold text-[#1C1917]">
                            <span className="font-mono text-[#8C3A27] mr-1.5">{quest.code}</span>
                            {quest.title}
                          </div>
                          <div className="text-[11px] text-[#78716C]">
                            Target: {quest.targetPerson} ({quest.primaryCommune})
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
