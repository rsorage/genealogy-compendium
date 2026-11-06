import React, { useState } from 'react';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  FileCheck,
  Info,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { historicalRecordsDatabase } from '../data/genealogyData';
import { HistoricalRecord, PaleographicCallout, BranchId } from '../types/genealogy';

interface HistoricalRecordsViewerProps {
  initialRecord?: HistoricalRecord | null;
  onSelectPersonById: (personId: string) => void;
}

export const HistoricalRecordsViewer: React.FC<HistoricalRecordsViewerProps> = ({
  initialRecord,
  onSelectPersonById,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<HistoricalRecord>(
    initialRecord || historicalRecordsDatabase[0]
  );
  const [activeBranchFilter, setActiveBranchFilter] = useState<BranchId | 'all'>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [selectedCallout, setSelectedCallout] = useState<PaleographicCallout | null>(
    selectedRecord.paleographicCallouts[0] || null
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  // Filter records
  const filteredRecords = historicalRecordsDatabase.filter((rec) => {
    if (activeBranchFilter !== 'all' && rec.branch !== activeBranchFilter && rec.branch !== 'unified') {
      return false;
    }
    if (activeTypeFilter !== 'all' && rec.recordType !== activeTypeFilter) {
      return false;
    }
    return true;
  });

  const handleSelectRecord = (record: HistoricalRecord) => {
    setSelectedRecord(record);
    setSelectedCallout(record.paleographicCallouts[0] || null);
    setZoomLevel(1);
    setCopiedCitation(false);
  };

  const handleCopyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2200);
  };

  return (
    <div className="space-y-10 py-6">
      {/* Title & Curatorial Subtitle */}
      <div className="border-b border-[#E7E2D8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#8C3A27] mb-1">
            Primary Sources &amp; Paleographic Transcriptions
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
            Historical Records &amp; Facsimiles
          </h1>
          <p className="font-editorial text-sm sm:text-base text-[#57534E] mt-1 max-w-2xl">
            Examine authentic civil birth acts, marriage declarations, maritime passenger rolls, and immigrant hostel entries with side-by-side paleographic transcriptions and margin callouts.
          </p>
        </div>

        {/* Global Statistics */}
        <div className="text-xs text-[#78716C] font-sans bg-[#F5F0E6] px-3.5 py-2 rounded-md border border-[#E7E0D2] shrink-0">
          Showing <span className="font-mono font-semibold text-[#1C1917]">{filteredRecords.length}</span> of{' '}
          <span className="font-mono font-semibold text-[#1C1917]">{historicalRecordsDatabase.length}</span> Archival Plates
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E7E2D8] shadow-2xs">
        {/* Branch Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4EFE6] rounded-lg overflow-x-auto">
          <button
            onClick={() => setActiveBranchFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeBranchFilter === 'all'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            All Archives
          </button>
          <button
            onClick={() => setActiveBranchFilter('suraci')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeBranchFilter === 'suraci'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Suraci / Sorage
          </button>
          <button
            onClick={() => setActiveBranchFilter('cardillo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeBranchFilter === 'cardillo'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Cardillo / Cardilho
          </button>
        </div>

        {/* Record Type Dropdown / Buttons */}
        <div className="flex items-center gap-1.5 text-xs text-[#78716C] overflow-x-auto">
          <span className="font-medium mr-1 hidden sm:inline">Type:</span>
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'birth', label: 'Birth Acts (Nascite)' },
            { id: 'marriage', label: 'Marriages' },
            { id: 'passenger_manifest', label: 'Passenger Lists' },
            { id: 'hospedaria', label: 'Hostel Reg.' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveTypeFilter(type.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap cursor-pointer ${
                activeTypeFilter === type.id
                  ? 'bg-[#1C1917] text-white font-semibold'
                  : 'bg-[#F4EFE6] text-[#57534E] hover:bg-[#EBE5DA]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Encyclopedia Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Record Selector Drawer & High-Res Facsimile Plate */}
        <div className="lg:col-span-5 space-y-6">
          {/* Document Picker Pill List */}
          <div className="bg-white border border-[#E7E2D8] rounded-lg p-3 space-y-2">
            <div className="text-[11px] uppercase tracking-wider font-sans font-semibold text-[#78716C] px-1">
              Select Archival Document:
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto archive-scroll pr-1">
              {filteredRecords.map((record) => (
                <button
                  key={record.id}
                  onClick={() => handleSelectRecord(record)}
                  className={`w-full text-left p-2.5 rounded-md transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedRecord.id === record.id
                      ? 'bg-[#F5F0E6] text-[#1C1917] font-semibold border border-[#E3DDD0]'
                      : 'hover:bg-[#FAF7F0] text-[#57534E]'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs truncate font-medium">{record.title}</div>
                    <div className="text-[10px] text-[#78716C] truncate mt-0.5">
                      {record.year} · {record.commune}
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedRecord.id === record.id ? 'text-[#8C3A27]' : 'text-[#A8A29E]'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Facsimile Plate Card */}
          <div className="bg-white border border-[#E7E2D8] rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-[#F4EFE6] border-b border-[#E7E2D8] flex items-center justify-between text-xs font-sans">
              <span className="font-semibold text-[#8C3A27] uppercase tracking-wider text-[11px]">
                {selectedRecord.plateNumber}
              </span>
              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                  className="p-1 text-[#57534E] hover:text-[#1C1917] hover:bg-[#EAE4D7] rounded transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] px-1 text-[#78716C]">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.25, z + 0.25))}
                  className="p-1 text-[#57534E] hover:text-[#1C1917] hover:bg-[#EAE4D7] rounded transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 text-[#57534E] hover:text-[#1C1917] hover:bg-[#EAE4D7] rounded transition-colors cursor-pointer ml-1"
                  title="Reset Scale"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Facsimile Viewport with Zoom */}
            <div className="relative overflow-hidden bg-[#2C2724] h-84 sm:h-96 flex items-center justify-center p-2">
              <div
                className="transition-transform duration-200 cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={selectedRecord.imagePath}
                  alt={selectedRecord.imageAlt}
                  className="max-h-full max-w-full object-contain rounded shadow-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Document Metadata Caption */}
            <div className="p-4 bg-[#FAF7F0] space-y-3 border-t border-[#E7E2D8]">
              <div className="text-xs space-y-1.5 font-sans">
                <div className="flex items-start justify-between">
                  <span className="text-[#78716C] font-medium">Archive:</span>
                  <span className="text-right text-[#1C1917] font-medium max-w-[240px]">
                    {selectedRecord.archiveRepository}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#78716C] font-medium">Call Number:</span>
                  <span className="text-right font-mono text-[11px] text-[#44403C]">
                    {selectedRecord.archiveCallNumber}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#78716C] font-medium">Date &amp; Place:</span>
                  <span className="text-right text-[#44403C]">
                    {selectedRecord.exactDate} ({selectedRecord.commune})
                  </span>
                </div>
              </div>

              {/* Related Ancestors Links */}
              {selectedRecord.relatedPersonIds.length > 0 && (
                <div className="pt-2 border-t border-[#E5DFD3] text-xs">
                  <span className="text-[#78716C] mr-2">Associated Ancestors:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedRecord.relatedPersonIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => onSelectPersonById(id)}
                        className="text-[11px] text-[#8C3A27] hover:underline font-medium bg-white px-2 py-0.5 rounded border border-[#DCD5C6] cursor-pointer"
                      >
                        {id.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Side-by-Side Paleographic Transcription & Callouts */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-[#E7E2D8] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E7E2D8] pb-3">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                {selectedRecord.title}
              </h2>
              <span className="font-editorial text-sm italic text-[#8C3A27]">
                {selectedRecord.italianTitle}
              </span>
            </div>
            <p className="font-editorial text-sm sm:text-base text-[#44403C] leading-relaxed">
              {selectedRecord.summary}
            </p>
          </div>

          {/* Paleographic Callouts Toolbar */}
          {selectedRecord.paleographicCallouts.length > 0 && (
            <div className="bg-[#FAF7F0] border border-[#E5DFD3] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-sans uppercase tracking-widest font-semibold text-[#8C3A27] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Interactive Paleographic Callouts ({selectedRecord.paleographicCallouts.length})</span>
                </div>
                <span className="text-[11px] text-[#78716C]">Click to inspect archaic formulas</span>
              </div>

              {/* Callout Buttons */}
              <div className="flex flex-wrap gap-2">
                {selectedRecord.paleographicCallouts.map((callout) => (
                  <button
                    key={callout.id}
                    onClick={() => setSelectedCallout(callout)}
                    className={`px-3 py-1.5 rounded-md text-xs font-sans transition-all cursor-pointer ${
                      selectedCallout?.id === callout.id
                        ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs font-semibold'
                        : 'bg-white hover:bg-[#F3EFE6] text-[#44403C] border border-[#D6CEBE]'
                    }`}
                  >
                    {callout.term}
                  </button>
                ))}
              </div>

              {/* Active Callout Expanded Card */}
              {selectedCallout && (
                <div className="bg-white border border-[#D6CEBE] rounded-lg p-4 space-y-3 mt-3 animate-fade-in shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C3A27] block">
                        {selectedCallout.termType.toUpperCase()}
                      </span>
                      <h4 className="font-display text-base font-semibold text-[#1C1917]">
                        {selectedCallout.term}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-[#78716C] bg-[#F5F0E6] px-2 py-0.5 rounded">
                      {selectedCallout.lineReference}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1 border-t border-[#F2ECE1]">
                    <div>
                      <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider block">
                        Paleographic Scribal Analysis
                      </span>
                      <p className="font-sans text-[#44403C] mt-1 leading-relaxed">
                        {selectedCallout.paleographicNote}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider block">
                        Genealogical &amp; Legal Significance
                      </span>
                      <p className="font-sans text-[#44403C] mt-1 leading-relaxed">
                        {selectedCallout.historicalSignificance}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transcriptions: Original & Scholarly Translation */}
          <div className="bg-white border border-[#E7E2D8] rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-3">
              <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                Archival Transcriptions
              </h3>
              <div className="text-xs text-[#78716C] font-mono">
                Line-by-line verbatim collation
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Transcription */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#8C3A27] uppercase tracking-wider font-sans">
                  Original Handwritten Script ({selectedRecord.country === 'Italy' ? 'Italian' : 'Portuguese'})
                </div>
                <div className="bg-[#FAF8F5] border border-[#E7E2D8] p-4 rounded-md font-editorial text-sm text-[#292524] leading-relaxed whitespace-pre-line archive-scroll max-h-96 overflow-y-auto">
                  {selectedRecord.transcriptionOriginal}
                </div>
              </div>

              {/* Translation */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#57534E] uppercase tracking-wider font-sans">
                  Scholarly English Translation &amp; Apparatus
                </div>
                <div className="bg-[#F8F6F1] border border-[#E7E2D8] p-4 rounded-md font-sans text-xs text-[#44403C] leading-relaxed whitespace-pre-line archive-scroll max-h-96 overflow-y-auto">
                  {selectedRecord.transcriptionTranslation}
                </div>
              </div>
            </div>

            {/* Standard Archival Citation Box */}
            <div className="bg-[#F5F1E8] border border-[#E5DFD3] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-sans font-semibold tracking-wider text-[#57534E]">
                  Formal Archival Citation (Genealogical Citation Standard)
                </span>
                <button
                  onClick={() => handleCopyCitation(selectedRecord.fullCitation)}
                  className="inline-flex items-center gap-1 text-xs text-[#8C3A27] hover:text-[#5F2418] font-medium cursor-pointer"
                >
                  {copiedCitation ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-xs text-[#292524] select-all bg-white p-2.5 rounded border border-[#E0D8CB]">
                {selectedRecord.fullCitation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
