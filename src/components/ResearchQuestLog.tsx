import React, { useState } from 'react';
import {
  Compass,
  Search,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileQuestion,
  Building2,
  ChevronRight,
  Send,
  Filter,
} from 'lucide-react';
import { questLogEntries } from '../data/genealogyData';
import type { QuestLogEntry, BranchId } from '../types/genealogy';

interface ResearchQuestLogProps {
  onOpenContactModal: (targetQuestCode?: string) => void;
}

export const ResearchQuestLog: React.FC<ResearchQuestLogProps> = ({ onOpenContactModal }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<BranchId | 'all'>('all');
  const [selectedQuest, setSelectedQuest] = useState<QuestLogEntry>(questLogEntries[0]);

  const filteredQuests = questLogEntries.filter((q) => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (branchFilter !== 'all' && q.branch !== branchFilter) return false;
    return true;
  });

  const getStatusBadge = (status: QuestLogEntry['status']) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Solved Mystery
          </span>
        );
      case 'investigating':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Active Investigation
          </span>
        );
      case 'awaiting_archive':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-blue-800">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Awaiting Italian Archive
          </span>
        );
      case 'brick_wall':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-rose-800">
            <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
            Genealogical Brick Wall
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 py-6">
      {/* Title & Curatorial Subtitle */}
      <div className="border-b border-[#E7E2D8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#8C3A27] mb-1">
            The Researcher&apos;s Notebook &amp; Open Inquiries
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
            Genealogy Quests &amp; Archival Findings
          </h1>
          <p className="font-editorial text-sm sm:text-base text-[#57534E] mt-1 max-w-2xl">
            Live catalog of ongoing inquiries, archive queries sent to Italy, solved orthographic mysteries, and our open brick walls.
          </p>
        </div>

        {/* Global Progress Strip */}
        <div className="flex items-center gap-3 text-xs font-sans text-[#78716C] bg-[#F5F0E6] px-4 py-2.5 rounded-lg border border-[#E7E0D2] shrink-0">
          <div>
            <span className="font-mono font-semibold text-[#1C1917]">{questLogEntries.length}</span> Total Quests
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span className="font-mono font-semibold text-emerald-700">2</span> Solved
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span className="font-mono font-semibold text-[#8C3A27]">3</span> Open Inquiries
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E7E2D8] shadow-2xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4EFE6] rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'All Quests' },
            { id: 'investigating', label: 'Active Inquiries' },
            { id: 'awaiting_archive', label: 'Awaiting Archive' },
            { id: 'resolved', label: 'Solved' },
            { id: 'brick_wall', label: 'Brick Walls' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Branch Filter */}
        <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
          <span className="font-medium mr-1 hidden sm:inline">Lineage:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'suraci', label: 'Suraci / Sorage' },
            { id: 'cardillo', label: 'Cardillo / Cardilo' },
          ].map((br) => (
            <button
              key={br.id}
              onClick={() => setBranchFilter(br.id as any)}
              className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap cursor-pointer ${
                branchFilter === br.id
                  ? 'bg-[#1C1917] text-white font-semibold'
                  : 'bg-[#F4EFE6] text-[#57534E] hover:bg-[#EBE5DA]'
              }`}
            >
              {br.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quests Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): List of Inquiries */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs uppercase tracking-wider font-sans font-semibold text-[#78716C] px-1">
            Active Research Logbook ({filteredQuests.length}):
          </div>

          <div className="space-y-3">
            {filteredQuests.map((quest) => (
              <div
                key={quest.id}
                onClick={() => setSelectedQuest(quest)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  selectedQuest.id === quest.id
                    ? 'bg-white border-[#8C3A27] shadow-sm'
                    : 'bg-[#FAF8F5] border-[#E7E2D8] hover:bg-white hover:border-[#D6CEBE]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#78716C]">
                  <span className="font-semibold text-[#1C1917]">{quest.code}</span>
                  <span>{getStatusBadge(quest.status)}</span>
                </div>

                <h3 className="font-display text-base font-semibold text-[#1C1917] leading-snug">
                  {quest.title}
                </h3>

                <div className="text-xs text-[#57534E] font-sans flex items-center justify-between pt-1 border-t border-[#F2ECE1]">
                  <span>Target: <strong className="text-[#292524]">{quest.targetPerson}</strong></span>
                  <span className="text-[#78716C]">{quest.primaryCommune.split('/')[0]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Lead Promo Card */}
          <div className="bg-[#FAF7F0] border border-[#E5DFD3] rounded-xl p-5 space-y-3">
            <div className="text-xs font-sans font-semibold text-[#8C3A27] uppercase tracking-wider">
              Have a lead or shared ancestor?
            </div>
            <p className="text-xs text-[#57534E] font-sans leading-relaxed">
              If you have old family photos, baptism certificates, or recollections about the Suraci/Sorage or Cardillo/Cardilho branches, please share with our archive.
            </p>
            <button
              onClick={() => onOpenContactModal(selectedQuest.code)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-[#FBF9F5] bg-[#1C1917] hover:bg-[#342F2C] rounded-md transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Clue to Researcher</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Detailed Quest Dossier */}
        <div className="lg:col-span-7 bg-white border border-[#E7E2D8] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E7E2D8] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#78716C] mb-1">
                <span>{selectedQuest.code}</span>
                <span aria-hidden="true">·</span>
                <span>Branch: {selectedQuest.branch === 'suraci' ? 'Suraci (Calabria)' : 'Cardillo (Campania)'}</span>
                <span aria-hidden="true">·</span>
                <span>Updated: {selectedQuest.lastUpdated}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                {selectedQuest.title}
              </h2>
            </div>
            <div className="shrink-0">{getStatusBadge(selectedQuest.status)}</div>
          </div>

          {/* Quick Target Strip */}
          <div className="grid grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-lg border border-[#E7E0D2] text-xs font-sans">
            <div>
              <span className="text-[#78716C] block font-medium">Target Individual(s):</span>
              <span className="font-semibold text-[#1C1917] text-sm mt-0.5 block">
                {selectedQuest.targetPerson}
              </span>
            </div>
            <div>
              <span className="text-[#78716C] block font-medium">Geographic Focus:</span>
              <span className="font-semibold text-[#1C1917] text-sm mt-0.5 block">
                {selectedQuest.primaryCommune}
              </span>
            </div>
          </div>

          {/* Working Hypothesis */}
          <div className="space-y-2">
            <div className="text-xs font-sans font-semibold text-[#8C3A27] uppercase tracking-wider">
              Working Hypothesis:
            </div>
            <p className="font-editorial text-base text-[#292524] leading-relaxed bg-[#FAF9F5] p-4 rounded-md border border-[#E9E4D8]">
              {selectedQuest.hypothesis}
            </p>
          </div>

          {/* Current Archival Findings */}
          <div className="space-y-2">
            <div className="text-xs font-sans font-semibold text-[#57534E] uppercase tracking-wider">
              Current Archival Findings &amp; Discoveries:
            </div>
            <p className="font-editorial text-base text-[#292524] leading-relaxed bg-[#FAF9F5] p-4 rounded-md border border-[#E9E4D8]">
              {selectedQuest.currentFindings}
            </p>
          </div>

          {/* Archives Queried Table */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-sans font-semibold text-[#78716C] uppercase tracking-wider">
              Italian &amp; Brazilian Archives Queried:
            </div>
            <div className="border border-[#E7E2D8] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#F4EFE6] text-[#57534E] border-b border-[#E7E2D8]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Repository / Institution</th>
                    <th className="py-2.5 px-3 font-semibold">Protocol / File Ref</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE1]">
                  {selectedQuest.archivesQueried.map((query, i) => (
                    <tr key={i} className="hover:bg-[#FAF8F5]">
                      <td className="py-2.5 px-3 font-medium text-[#1C1917]">{query.institution}</td>
                      <td className="py-2.5 px-3 font-mono text-[#57534E]">{query.protocolOrDate}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-medium text-[#8C3A27]">{query.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-sans font-semibold text-[#78716C] uppercase tracking-wider">
              Next Action Items in the Quest:
            </div>
            <p className="text-xs font-sans text-[#44403C] leading-relaxed bg-[#F5F1E8] p-3.5 rounded-md border border-[#E5DFD3]">
              {selectedQuest.nextSteps}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
