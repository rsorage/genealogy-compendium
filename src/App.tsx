/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CompendiumOverview } from './components/CompendiumOverview';
import { FamilyTreeExplorer } from './components/FamilyTreeExplorer';
import { HistoricalRecordsViewer } from './components/HistoricalRecordsViewer';
import { MigrationTimeline } from './components/MigrationTimeline';
import { ResearchQuestLog } from './components/ResearchQuestLog';
import { AncestorDossierModal } from './components/AncestorDossierModal';
import { LeadSubmissionModal } from './components/LeadSubmissionModal';
import { RegistrosVistosView } from './components/RegistrosVistosView';
import { SearchDialog } from './components/SearchDialog';
import { Person, HistoricalRecord } from './types/genealogy';
import { peopleDatabase, historicalRecordsDatabase } from './data/genealogyData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'compendium' | 'tree' | 'registros-vistos' | 'records' | 'migration' | 'quest'>('compendium');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HistoricalRecord | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [presetQuestCode, setPresetQuestCode] = useState<string | undefined>(undefined);

  // Global hotkey: Cmd+K / Ctrl+K opens search dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectPersonById = (personId: string) => {
    const person = peopleDatabase.find((p) => p.id === personId);
    if (person) {
      setSelectedPerson(person);
    }
  };

  const handleSelectRecordFromAnywhere = (record: HistoricalRecord) => {
    setSelectedRecord(record);
    setActiveTab('records');
  };

  const handleOpenContactWithQuest = (questCode?: string) => {
    setPresetQuestCode(questCode);
    setIsContactOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] selection:bg-[#E2D9CC] selection:text-[#1C1917]">
      {/* Strict Top Bar Contract Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenContact={() => handleOpenContactWithQuest(undefined)}
      />

      {/* Main Reading Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'compendium' && (
          <CompendiumOverview
            onNavigateToTree={() => setActiveTab('tree')}
            onNavigateToRecords={() => setActiveTab('records')}
            onNavigateToRegistrosVistos={() => setActiveTab('registros-vistos')}
            onNavigateToQuests={() => setActiveTab('quest')}
            onSelectRecord={handleSelectRecordFromAnywhere}
          />
        )}

        {activeTab === 'tree' && (
          <FamilyTreeExplorer onSelectPerson={setSelectedPerson} />
        )}

        {activeTab === 'registros-vistos' && (
          <RegistrosVistosView
            onSelectFacsimileRecord={handleSelectRecordFromAnywhere}
            onOpenContactModal={handleOpenContactWithQuest}
          />
        )}

        {activeTab === 'records' && (
          <HistoricalRecordsViewer
            initialRecord={selectedRecord}
            onSelectPersonById={handleSelectPersonById}
          />
        )}

        {activeTab === 'migration' && (
          <MigrationTimeline onSelectRecord={handleSelectRecordFromAnywhere} />
        )}

        {activeTab === 'quest' && (
          <ResearchQuestLog onOpenContactModal={handleOpenContactWithQuest} />
        )}
      </main>

      {/* Editorial Museum Footer */}
      <footer className="mt-20 border-t border-[#E7E2D8] bg-[#F5F0E6] text-[#57534E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-6 space-y-3">
              <span className="font-display text-xl font-semibold text-[#1C1917] tracking-tight block">
                SURACI &amp; CARDILLO ARCHIVAL COMPENDIUM
              </span>
              <p className="font-editorial text-sm leading-relaxed text-[#57534E] max-w-md">
                A private scholarly initiative dedicated to reconstructing the genealogical record, paleographic transcriptions, and phonetic evolution of the Suraci (Sorage) and Cardillo (Cardilo, Cardilho) families between Italy and Brazil.
              </p>
              <div className="text-xs font-sans text-[#78716C] pt-2">
                Curated by R. Sorage · Contact:{' '}
                <a
                  href="mailto:RSorage@gmail.com"
                  className="text-[#8C3A27] font-semibold hover:underline"
                >
                  RSorage@gmail.com
                </a>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs font-sans">
              <span className="font-semibold uppercase tracking-wider text-[#1C1917] block">
                Archival Repositories Consulted
              </span>
              <ul className="space-y-1.5 text-[#57534E]">
                <li>Archivio di Stato di Reggio Calabria</li>
                <li>Archivio di Stato di Salerno</li>
                <li>Museu da Imigração do Estado de São Paulo</li>
                <li>Cartório do Registro Civil do Brás &amp; Mooca</li>
                <li>Paróquia Nossa Senhora da Achiropita (Bixiga)</li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs font-sans">
              <span className="font-semibold uppercase tracking-wider text-[#1C1917] block">
                Onomastic Summary
              </span>
              <div className="space-y-1 text-[#57534E]">
                <p>
                  <strong className="text-[#1C1917]">Suraci ➔ Sorage:</strong> Reggio Calabria (1871) to São Paulo (1897).
                </p>
                <p>
                  <strong className="text-[#1C1917]">Cardillo ➔ Cardilo / Cardilho:</strong> Castelnuovo Cilento (1869) to Santos &amp; Campinas (1893).
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E5DFD3] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#78716C]">
            <div>
              &copy; {new Date().getFullYear()} Suraci &amp; Cardillo Genealogy Archive. All primary facsimiles cited for historical and familial research.
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('registros-vistos')}
                className="hover:text-[#8C3A27] transition-colors cursor-pointer font-medium"
              >
                Registros Vistos
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-[#1C1917] transition-colors cursor-pointer"
              >
                Quick Search (Ctrl+K)
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => handleOpenContactWithQuest(undefined)}
                className="hover:text-[#8C3A27] transition-colors cursor-pointer"
              >
                Send Archival Lead
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Ancestor Personal Dossier Modal */}
      <AncestorDossierModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onSelectPersonById={handleSelectPersonById}
        onSelectRecord={handleSelectRecordFromAnywhere}
      />

      {/* Clue / Contact Submission Modal */}
      <LeadSubmissionModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        presetQuestCode={presetQuestCode}
      />

      {/* Quick Search Dialog */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPerson={setSelectedPerson}
        onSelectRecord={handleSelectRecordFromAnywhere}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
}
