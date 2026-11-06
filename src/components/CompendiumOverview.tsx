import React, { useState } from 'react';
import { Volume2, BookOpen, Compass, ChevronRight, FileText, ArrowRight, Quote } from 'lucide-react';
import { etymologyDatabase, historicalRecordsDatabase } from '../data/genealogyData';
import type { HistoricalRecord } from '../types/genealogy';

interface CompendiumOverviewProps {
  onNavigateToTree: () => void;
  onNavigateToRecords: () => void;
  onNavigateToRegistrosVistos?: () => void;
  onNavigateToQuests: () => void;
  onSelectRecord: (record: HistoricalRecord) => void;
}

export const CompendiumOverview: React.FC<CompendiumOverviewProps> = ({
  onNavigateToTree,
  onNavigateToRecords,
  onNavigateToRegistrosVistos,
  onNavigateToQuests,
  onSelectRecord,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<'suraci' | 'cardillo'>('suraci');
  const [audioFeedback, setAudioFeedback] = useState<string | null>(null);

  const activeEtymology = etymologyDatabase[selectedBranch];

  const handleSpeak = (text: string, lang: 'it-IT' | 'pt-BR') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onstart = () => setAudioFeedback(`Playing audio: "${text}" (${lang})`);
      utterance.onend = () => setAudioFeedback(null);
      utterance.onerror = () => setAudioFeedback(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setAudioFeedback(`Phonetic rendering: ${text}`);
      setTimeout(() => setAudioFeedback(null), 2500);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Editorial Fascicle Header */}
      <section className="border-b border-[#E7E2D8] pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans text-[#78716C] uppercase tracking-widest mb-6">
          <div className="flex items-center gap-2">
            <span>Fascicle III</span>
            <span aria-hidden="true">·</span>
            <span>Italo-Brasilian Family Chronicles</span>
            <span aria-hidden="true">·</span>
            <span>Privately Documented</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span>Calabria &amp; Campania</span>
            <span aria-hidden="true">➔</span>
            <span>Santos &amp; São Paulo</span>
          </div>
        </div>

        {/* Hero Title and Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#1C1917] leading-[1.1] text-balance">
              The Transatlantic Chronicles of Suraci &amp; Cardillo
            </h1>
            <p className="font-editorial text-xl sm:text-2xl text-[#57534E] leading-relaxed italic">
              An archival compendium and paleographic enquiry into the genealogical mutations of two Southern Italian lineages and their Brazilian settlements.
            </p>
          </div>

          <div className="lg:col-span-4 bg-[#F5F1E8] border border-[#E5DFD3] p-5 rounded-lg space-y-3">
            <div className="text-xs font-sans uppercase tracking-widest font-semibold text-[#8C3A27]">
              Archival Provenance Note
            </div>
            <p className="text-xs text-[#57534E] leading-relaxed font-sans">
              Compiled from primary documents held in the <span className="text-[#1C1917] font-medium">Archivio di Stato di Reggio Calabria</span>, <span className="text-[#1C1917] font-medium">Archivio di Stato di Salerno</span>, <span className="text-[#1C1917] font-medium">Museu da Imigração do Estado de São Paulo</span>, and São Paulo civil parish registers.
            </p>
            <div className="pt-2 border-t border-[#E5DFD3] flex items-center justify-between text-xs text-[#78716C]">
              <span>Compiler: R. Sorage</span>
              <span className="font-mono tabular-nums">1842–Present</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Plates Banner & Narrative Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="prose prose-stone max-w-none text-[#292524] font-editorial text-lg leading-relaxed space-y-5">
            <p className="drop-cap">
              Between the years of 1893 and 1897, the twin trajectories of this family chronicle departed the sunny shores of the Tyrrhenian and Ionian Seas. From the terraced olive groves of Reggio Calabria and the rugged mountain vales of Cilento in Salerno, our ancestors embarked on the steamships <em>Italia</em> and <em>Caffaro</em> to traverse the Atlantic Ocean toward Brazil.
            </p>
            <p>
              Like thousands of immigrants fleeing the post-Risorgimento agrarian depression of the Italian Mezzogiorno, they carried little material wealth but brought indelible artisan trades: stone masonry, cordwaining, viticulture, and railway metalwork.
            </p>
            <p>
              Yet as their boots touched the granite docks of Santos and they mounted the cog trains toward São Paulo&apos;s Hospedaria dos Imigrantes, an immediate bureaucratic metamorphosis took place. Through the pen strokes of Portuguese-speaking civil scribes, the venerable Calabrian patronymic <strong className="font-sans font-semibold text-[#8C3A27]">Suraci</strong> evolved into the Brazilian <strong className="font-sans font-semibold text-[#8C3A27]">Sorage</strong>, while the Campanian <strong className="font-sans font-semibold text-[#8C3A27]">Cardillo</strong> split into the phonetic variations <strong className="font-sans font-semibold text-[#8C3A27]">Cardilo</strong> and <strong className="font-sans font-semibold text-[#8C3A27]">Cardilho</strong>.
            </p>
          </div>

          {/* Quick Nav Row */}
          <div className="pt-4 border-t border-[#E7E2D8] flex flex-wrap items-center gap-4">
            <button
              onClick={onNavigateToTree}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1C1917] bg-[#EFE9DC] hover:bg-[#E5DFD1] rounded-md transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#8C3A27]" />
              <span>Explore Lineage Tree</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
            {onNavigateToRegistrosVistos && (
              <button
                onClick={onNavigateToRegistrosVistos}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#8C3A27] bg-[#FAF3F0] hover:bg-[#F5E8E4] border border-[#E8DDD5] rounded-md transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#8C3A27]" />
                <span>Registros Vistos (Acervo)</span>
              </button>
            )}
            <button
              onClick={onNavigateToRecords}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#78716C]" />
              <span>Primary Facsimiles</span>
            </button>
            <button
              onClick={onNavigateToQuests}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              <span>Research Quests</span>
            </button>
          </div>
        </div>

        {/* Featured Visual Plate */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#F4EFE6] border border-[#E7E2D8] p-4 rounded-lg">
          <div className="space-y-2">
            <div className="relative overflow-hidden rounded-md border border-[#DCD5C6] group">
              <img
                src="/imagens/archive_manuscript_plate.jpg"
                alt="Archival civil registration ledger from Reggio Calabria, Italy"
                className="w-full h-72 object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-[#1C1917]/80 text-[#FBF9F5] text-[10px] uppercase font-sans tracking-widest px-2.5 py-1 rounded backdrop-blur-xs">
                Plate I · Archival Facsimile
              </div>
            </div>
            <div className="pt-2">
              <p className="font-editorial text-sm italic text-[#44403C]">
                Fig. 1 — Original 1871 birth register volume showing the entry for Fortunato Suraci, with official Savoyard municipal wax seal and iron-gall clerk script.
              </p>
              <div className="flex items-center justify-between text-xs text-[#78716C] mt-2 pt-2 border-t border-[#E3DDD0]">
                <span>Archivio di Stato di Reggio Calabria</span>
                <button
                  onClick={() => onSelectRecord(historicalRecordsDatabase[0])}
                  className="text-[#8C3A27] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  Inspect Paleography
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: The Encyclopedia Onomastic & Phonetic Dossier */}
      <section className="bg-white border border-[#E7E2D8] rounded-xl p-6 sm:p-8 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2D8] pb-6">
          <div>
            <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#8C3A27] mb-1">
              Encyclopedia Article · Onomastic Analysis
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#1C1917]">
              Etymological Roots &amp; Phonetic Mutations
            </h2>
          </div>

          {/* Interactive Branch Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#F4EFE6] rounded-lg shrink-0">
            <button
              onClick={() => setSelectedBranch('suraci')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedBranch === 'suraci'
                  ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Suraci ➔ Sorage (Calabria)
            </button>
            <button
              onClick={() => setSelectedBranch('cardillo')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedBranch === 'cardillo'
                  ? 'bg-white text-[#1C1917] shadow-xs font-semibold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Cardillo ➔ Cardilo / Cardilho (Campania)
            </button>
          </div>
        </div>

        {/* Audio feedback notice if active */}
        {audioFeedback && (
          <div className="text-xs bg-[#F5EFEB] text-[#8C3A27] px-3 py-1.5 rounded border border-[#E8D9CE] font-mono">
            {audioFeedback}
          </div>
        )}

        {/* Etymology Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Dossier Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-baseline gap-4">
              <div>
                <span className="text-xs uppercase font-sans text-[#78716C] tracking-wider block">Italian Original</span>
                <span className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
                  {activeEtymology.italianName}
                </span>
              </div>
              <span className="text-2xl text-[#A8A29E] font-light">➔</span>
              <div>
                <span className="text-xs uppercase font-sans text-[#78716C] tracking-wider block">Brazilian Variants</span>
                <div className="flex flex-wrap gap-2 items-center">
                  {activeEtymology.brazilianVariants.map((variant) => (
                    <span key={variant} className="font-display text-2xl sm:text-3xl font-medium text-[#8C3A27]">
                      {variant}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Phonetic Pronunciation Box */}
            <div className="bg-[#FAF7F0] border border-[#E5DFD3] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#57534E] uppercase tracking-wider font-sans">
                  Acoustic &amp; IPA Transcription
                </div>
                <div className="flex items-center gap-4 text-sm font-mono text-[#292524]">
                  <span>IT: <strong className="text-[#1C1917]">{activeEtymology.ipaItalian}</strong></span>
                  <span className="text-[#A8A29E]">·</span>
                  <span>BR: <strong className="text-[#8C3A27]">{activeEtymology.ipaPortuguese}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeak(activeEtymology.italianName, 'it-IT')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-[#F3EFE6] border border-[#D6CEBE] text-[#1C1917] rounded shadow-2xs transition-colors cursor-pointer"
                  title="Listen to Italian pronunciation"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#8C3A27]" />
                  <span>Hear Italian</span>
                </button>
                <button
                  onClick={() => handleSpeak(activeEtymology.brazilianVariants[0], 'pt-BR')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-[#F3EFE6] border border-[#D6CEBE] text-[#1C1917] rounded shadow-2xs transition-colors cursor-pointer"
                  title="Listen to Brazilian Portuguese pronunciation"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#2A6F54]" />
                  <span>Hear Brazilian</span>
                </button>
              </div>
            </div>

            {/* Deep Etymological Text */}
            <div className="space-y-3 font-editorial text-base text-[#44403C] leading-relaxed">
              <h4 className="font-display text-lg font-semibold text-[#1C1917] not-italic">
                Origins &amp; Mediterranean Linguistic Roots
              </h4>
              <p>{activeEtymology.etymologicalOrigin}</p>

              <h4 className="font-display text-lg font-semibold text-[#1C1917] not-italic pt-2">
                How Portuguese Clerks Phonetically Mutated the Surname
              </h4>
              <p>{activeEtymology.phoneticShiftExplanation}</p>
            </div>
          </div>

          {/* Encyclopedia Margin Notes & Historical Callouts */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#FAF7F2] border border-[#E7E0D2] p-5 rounded-lg space-y-4">
              <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#78716C] border-b border-[#E3DACB] pb-2">
                Encyclopedia Margin Callout · Paleography
              </div>

              <div className="space-y-3 text-xs text-[#57534E] font-sans leading-relaxed">
                <p>
                  <strong className="text-[#1C1917] font-semibold">The Clerk&apos;s Ear in Santos Harbor:</strong> In the 1890s, illiterate or semi-literate immigrants orally responded to questions posed by Brazilian immigration clerks (*oficiais de triagem*).
                </p>
                <p>
                  The clerk had no Italian passport spelling reference in hand unless conscription records were presented. They recorded what they heard according to the orthographic conventions of Portuguese.
                </p>
                <div className="bg-white p-3 rounded border border-[#E2DAD0] font-mono text-[11px] space-y-1">
                  <div className="text-[#8C3A27] font-semibold">Phonetic Rule Formula:</div>
                  <div>IT [tʃ] + [i] ➔ PT [ʒ] written as &apos;g&apos; (Suraci ➔ Sorage)</div>
                  <div>IT double [ll] ➔ PT simplified &apos;l&apos; or palatal &apos;lh&apos; (Cardillo ➔ Cardilo / Cardilho)</div>
                </div>
              </div>
            </div>

            {/* Regional Territory Card */}
            <div className="bg-[#FAF7F2] border border-[#E7E0D2] p-5 rounded-lg space-y-3">
              <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#78716C] border-b border-[#E3DACB] pb-2">
                Geographic Heartlands
              </div>
              <div className="text-xs font-sans space-y-2 text-[#57534E]">
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-[#1C1917]">Ancestral Region:</span>
                  <span className="text-right text-[#44403C]">{activeEtymology.geographicOrigin}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-[#1C1917]">Historical Frequency:</span>
                  <span className="text-right text-[#44403C]">{activeEtymology.archivalFrequency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Plates Gallery (Encyclopedia Exhibition) */}
      <section className="space-y-6">
        <div className="border-b border-[#E7E2D8] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#8C3A27]">
              Curatorial Photographic Plates
            </div>
            <h2 className="font-display text-3xl font-medium text-[#1C1917]">
              Primary Document Plates &amp; Historical Context
            </h2>
          </div>
          <button
            onClick={onNavigateToRecords}
            className="text-xs font-semibold text-[#8C3A27] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Open Complete Document Vault
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Ship */}
          <div className="bg-white border border-[#E7E2D8] rounded-lg overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative h-48 overflow-hidden bg-[#EAE5DA]">
                <img
                  src="/imagens/migration_ship_plate.jpg"
                  alt="Historic steamship departing Genoa for Santos"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 bg-[#1C1917]/85 text-white text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded">
                  Plate II · Maritime
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                  Piroscafo Italia &amp; The Atlantic Run
                </h3>
                <p className="font-editorial text-xs text-[#57534E] leading-relaxed">
                  The steamships that transported the Cardillo and Suraci families from Genoa to Santos between 1893 and 1897, weathering 22-day steerage voyages.
                </p>
              </div>
            </div>
            <div className="p-4 pt-0 border-t border-[#F2ECE1] mt-3">
              <button
                onClick={() => onSelectRecord(historicalRecordsDatabase[1])}
                className="text-xs text-[#8C3A27] font-semibold hover:underline inline-flex items-center gap-1 mt-2 cursor-pointer"
              >
                Inspect Passenger Manifest
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Ancestral Village */}
          <div className="bg-white border border-[#E7E2D8] rounded-lg overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative h-48 overflow-hidden bg-[#EAE5DA]">
                <img
                  src="/imagens/calabria_ancestral_village.jpg"
                  alt="Ancient stone hillside village in Calabria"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 bg-[#1C1917]/85 text-white text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded">
                  Plate III · Topography
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                  The Calabrian Foothills &amp; Motta
                </h3>
                <p className="font-editorial text-xs text-[#57534E] leading-relaxed">
                  Stone terraces overlooking the Strait of Messina. The ancestral soil of Antonino Suraci and Francesca Minniti before the diaspora.
                </p>
              </div>
            </div>
            <div className="p-4 pt-0 border-t border-[#F2ECE1] mt-3">
              <button
                onClick={onNavigateToTree}
                className="text-xs text-[#8C3A27] font-semibold hover:underline inline-flex items-center gap-1 mt-2 cursor-pointer"
              >
                View Calabrian Lineage
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Family Portrait */}
          <div className="bg-white border border-[#E7E2D8] rounded-lg overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative h-48 overflow-hidden bg-[#EAE5DA]">
                <img
                  src="/imagens/immigrant_family_portrait.jpg"
                  alt="Vintage cabinet card portrait of Italian immigrant family in São Paulo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 bg-[#1C1917]/85 text-white text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded">
                  Plate IV · Iconography
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-display text-lg font-semibold text-[#1C1917]">
                  Cabinet Portrait · Photographia Lombardi
                </h3>
                <p className="font-editorial text-xs text-[#57534E] leading-relaxed">
                  Formal studio portrait of the newly settled immigrant family in São Paulo, Rua do Commercio, preserving dignity and cultural cohesion.
                </p>
              </div>
            </div>
            <div className="p-4 pt-0 border-t border-[#F2ECE1] mt-3">
              <button
                onClick={() => onSelectRecord(historicalRecordsDatabase[4])}
                className="text-xs text-[#8C3A27] font-semibold hover:underline inline-flex items-center gap-1 mt-2 cursor-pointer"
              >
                Inspect Family Union Act
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Methodological Quote Strip */}
      <section className="bg-[#F5F0E6] border-y border-[#E4DDD0] py-8 px-6 sm:px-12 my-8 rounded-md">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <Quote className="w-7 h-7 mx-auto text-[#B8AC98]" />
          <blockquote className="font-editorial text-xl sm:text-2xl italic text-[#292524] leading-relaxed">
            &ldquo;In every transcribed spelling variant, in every distorted consonant of an immigration clerk, lies not an error, but the living sound of our ancestors&apos; voices crossing the ocean.&rdquo;
          </blockquote>
          <div className="text-xs font-sans uppercase tracking-widest text-[#78716C]">
            Compiler&apos;s Dedication · São Paulo &amp; Reggio Calabria
          </div>
        </div>
      </section>
    </div>
  );
};
