import React from 'react';
import { X, Calendar, MapPin, Anchor, Briefcase, FileText, User, ArrowRight } from 'lucide-react';
import { Person, HistoricalRecord } from '../types/genealogy';
import { historicalRecordsDatabase, peopleDatabase } from '../data/genealogyData';
import { RelationshipPathIndicator } from './RelationshipPathIndicator';

interface AncestorDossierModalProps {
  person: Person | null;
  onClose: () => void;
  onSelectPersonById: (personId: string) => void;
  onSelectRecord: (record: HistoricalRecord) => void;
}

export const AncestorDossierModal: React.FC<AncestorDossierModalProps> = ({
  person,
  onClose,
  onSelectPersonById,
  onSelectRecord,
}) => {
  if (!person) return null;

  const father = person.fatherId ? peopleDatabase.find((p) => p.id === person.fatherId) : null;
  const mother = person.motherId ? peopleDatabase.find((p) => p.id === person.motherId) : null;
  const spouses = person.spouseIds
    .map((id) => peopleDatabase.find((p) => p.id === id))
    .filter(Boolean) as Person[];
  const children = person.childrenIds
    .map((id) => peopleDatabase.find((p) => p.id === id))
    .filter(Boolean) as Person[];

  const attachedRecords = historicalRecordsDatabase.filter((r) =>
    person.associatedRecordIds?.includes(r.id) || r.relatedPersonIds?.includes(person.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-[#FBF9F5] border border-[#E7E2D8] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto archive-scroll shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-20 bg-[#FBF9F5]/95 backdrop-blur-md px-6 py-4 border-b border-[#E7E2D8] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#78716C] uppercase">
            <span>Dossier Personale</span>
            <span aria-hidden="true">·</span>
            <span>Gen {person.generation}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#8C3A27] font-semibold">
              {person.branch === 'suraci' ? 'Suraci Branch' : person.branch === 'cardillo' ? 'Cardillo Branch' : 'Unified Lineage'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded-md transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Main Name & Aliases Banner */}
          <div className="space-y-2 border-b border-[#E7E2D8] pb-6">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917]">
              {person.originalItalianName}
            </h2>
            {person.brazilianSpellingVariants.length > 0 && (
              <p className="font-editorial text-base text-[#57534E] italic">
                Recorded in Brazilian civil registers as:{' '}
                <span className="font-sans font-medium text-[#8C3A27] not-italic">
                  {person.brazilianSpellingVariants.join(', ')}
                </span>
              </p>
            )}
          </div>

          {/* Persistent Relationship Path Indicator */}
          <RelationshipPathIndicator
            person={person}
            onSelectPersonById={onSelectPersonById}
          />

          {/* Quick Vital Metadata Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-[#E7E2D8] text-xs font-sans">
            <div className="space-y-1">
              <span className="text-[#78716C] flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#8C3A27]" />
                Vital Lifespan:
              </span>
              <p className="font-semibold text-[#1C1917] text-sm font-mono">
                {person.birthYear} – {person.deathYear ?? 'Present'}
              </p>
              {person.birthDateString && (
                <p className="text-[11px] text-[#78716C]">{person.birthDateString}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[#78716C] flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#8C3A27]" />
                Birthplace &amp; Origin:
              </span>
              <p className="font-semibold text-[#1C1917] text-sm">
                {person.birthCommune}
              </p>
              <p className="text-[11px] text-[#78716C]">{person.birthRegion}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[#78716C] flex items-center gap-1 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-[#8C3A27]" />
                Artisan Trade:
              </span>
              <p className="font-semibold text-[#1C1917] text-sm">
                {person.occupation ?? 'Homemaker / Farmer'}
              </p>
            </div>

            {person.immigrationYear && (
              <div className="space-y-1 sm:col-span-2 md:col-span-3 pt-2 border-t border-[#F4EFE6] flex items-center gap-2 text-[#8C3A27]">
                <Anchor className="w-4 h-4 shrink-0" />
                <span className="font-medium">
                  Transatlantic Migration: {person.immigrationYear} aboard {person.shipName} ➔ Santos / {person.brazilianSettlement}
                </span>
              </div>
            )}
          </div>

          {/* Biography Narrative */}
          <div className="space-y-2">
            <h3 className="font-display text-xl font-semibold text-[#1C1917]">
              Archival Biography
            </h3>
            <p className="font-editorial text-base text-[#292524] leading-relaxed bg-white p-5 rounded-xl border border-[#E7E2D8]">
              {person.biography}
            </p>
          </div>

          {/* Direct Lineage Relations */}
          <div className="space-y-3">
            <h3 className="font-display text-xl font-semibold text-[#1C1917]">
              Direct Family Network
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              {/* Parents */}
              <div className="bg-white p-4 rounded-lg border border-[#E7E2D8] space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
                  Parents:
                </div>
                <div className="space-y-1">
                  {father ? (
                    <button
                      onClick={() => onSelectPersonById(father.id)}
                      className="text-left w-full hover:text-[#8C3A27] font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>Father: {father.originalItalianName}</span>
                      <ArrowRight className="w-3 h-3 text-[#A8A29E]" />
                    </button>
                  ) : (
                    <div className="text-[#78716C] italic">Father: Unrecorded in current records</div>
                  )}

                  {mother ? (
                    <button
                      onClick={() => onSelectPersonById(mother.id)}
                      className="text-left w-full hover:text-[#8C3A27] font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>Mother: {mother.originalItalianName}</span>
                      <ArrowRight className="w-3 h-3 text-[#A8A29E]" />
                    </button>
                  ) : (
                    <div className="text-[#78716C] italic">Mother: Unrecorded in current records</div>
                  )}
                </div>
              </div>

              {/* Spouses & Children */}
              <div className="bg-white p-4 rounded-lg border border-[#E7E2D8] space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
                  Spouse &amp; Children:
                </div>
                <div className="space-y-1">
                  {spouses.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelectPersonById(s.id)}
                      className="text-left w-full hover:text-[#8C3A27] font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span>Spouse: {s.originalItalianName}</span>
                      <ArrowRight className="w-3 h-3 text-[#A8A29E]" />
                    </button>
                  ))}

                  {children.length > 0 ? (
                    <div className="pt-1 text-[11px] text-[#57534E]">
                      <span>Children: </span>
                      {children.map((c, i) => (
                        <button
                          key={c.id}
                          onClick={() => onSelectPersonById(c.id)}
                          className="hover:underline text-[#8C3A27] font-medium mr-1.5 cursor-pointer"
                        >
                          {c.originalItalianName.split(' ')[0]}
                          {i < children.length - 1 ? ',' : ''}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[#78716C] italic text-[11px]">No direct children recorded</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Attached Primary Documents */}
          {attachedRecords.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                Associated Primary Documents ({attachedRecords.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachedRecords.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => {
                      onClose();
                      onSelectRecord(record);
                    }}
                    className="bg-white p-3.5 rounded-lg border border-[#E7E2D8] hover:border-[#8C3A27] transition-all cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#8C3A27]">
                        {record.plateNumber}
                      </div>
                      <h4 className="font-display text-sm font-semibold text-[#1C1917]">
                        {record.title}
                      </h4>
                      <p className="text-[11px] text-[#78716C] mt-0.5">
                        {record.year} · {record.commune}
                      </p>
                    </div>
                    <FileText className="w-4 h-4 text-[#8C3A27] shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
