import React, { useState } from 'react';
import { Anchor, ArrowRight, Compass, Ship, User, ChevronRight, Sparkles } from 'lucide-react';
import type { Person } from '../types/genealogy';
import { peopleDatabase } from '../data/genealogyData';

interface PathNode {
  person: Person;
  roleLabel: string;
  isImmigrant: boolean;
  immigrationDetail?: string;
  generationBadge: string;
}

interface RelationshipLine {
  id: string;
  lineageTitle: string;
  immigrantAncestorName: string;
  immigrantYear: number;
  shipName: string;
  branchBadgeColor: string;
  nodes: PathNode[];
  summaryNote: string;
}

interface RelationshipPathIndicatorProps {
  person: Person;
  onSelectPersonById: (personId: string) => void;
  compact?: boolean;
}

export const RelationshipPathIndicator: React.FC<RelationshipPathIndicatorProps> = ({
  person,
  onSelectPersonById,
  compact = false,
}) => {
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);

  // Compute direct lines of descent from earliest known immigrant ancestor(s)
  const relationshipLines: RelationshipLine[] = React.useMemo(() => {
    const lines: RelationshipLine[] = [];

    // Helper to find ancestor by ID
    const findPerson = (id?: string) => (id ? peopleDatabase.find((p) => p.id === id) : undefined);

    // Case 1: Person IS the immigrant ancestor themselves (Generation 2)
    if (person.generation === 2) {
      lines.push({
        id: `immigrant-self-${person.id}`,
        lineageTitle: person.branch === 'suraci' ? 'Suraci ➔ Sorage Line' : 'Cardillo ➔ Cardilho Line',
        immigrantAncestorName: person.originalItalianName,
        immigrantYear: person.immigrationYear || (person.branch === 'suraci' ? 1897 : 1893),
        shipName: person.shipName || (person.branch === 'suraci' ? 'Piroscafo Caffaro' : 'Piroscafo Italia'),
        branchBadgeColor: person.branch === 'suraci' ? '#8C3A27' : '#2B6CB0',
        nodes: [
          {
            person,
            roleLabel: 'Earliest Immigrant Pioneer (Self)',
            isImmigrant: true,
            immigrationDetail: `Emigrated ${person.immigrationYear || '1890s'} aboard ${person.shipName || 'Vapore'}`,
            generationBadge: 'Gen II · Immigrant',
          },
        ],
        summaryNote: `Direct immigrant progenitor: arrived in Brazil through Santos harbor, establishing the family in ${person.brazilianSettlement || 'São Paulo'}.`,
      });
      return lines;
    }

    // Case 2: Italian Progenitors (Generation 1, Pre-emigration parents)
    if (person.generation === 1) {
      // Find the immigrant child
      const immigrantChild = peopleDatabase.find(
        (p) => (p.fatherId === person.id || p.motherId === person.id) && p.generation === 2
      );

      if (immigrantChild) {
        lines.push({
          id: `progenitor-${person.id}`,
          lineageTitle: person.branch === 'suraci' ? 'Suraci Line (Calabria)' : 'Cardillo Line (Campania)',
          immigrantAncestorName: immigrantChild.originalItalianName,
          immigrantYear: immigrantChild.immigrationYear || 1897,
          shipName: immigrantChild.shipName || 'Transatlantic Steamship',
          branchBadgeColor: person.branch === 'suraci' ? '#8C3A27' : '#2B6CB0',
          nodes: [
            {
              person,
              roleLabel: 'Homeland Progenitor in Italy',
              isImmigrant: false,
              generationBadge: 'Gen I · Italy',
            },
            {
              person: immigrantChild,
              roleLabel: `Child (Earliest Immigrant · ${immigrantChild.immigrationYear})`,
              isImmigrant: true,
              immigrationDetail: `Emigrated ${immigrantChild.immigrationYear} (${immigrantChild.shipName})`,
              generationBadge: 'Gen II · Immigrant',
            },
          ],
          summaryNote: `Pre-emigration progenitor who remained in ${person.birthPlace}. Parent of the transatlantic immigrant pioneer ${immigrantChild.originalItalianName}.`,
        });
      }
      return lines;
    }

    // Case 3: Generation 3 (First Brazilian-born generation)
    if (person.generation === 3) {
      // Find immigrant parent
      const father = findPerson(person.fatherId);
      const mother = findPerson(person.motherId);
      const immigrantParent = [father, mother].find((p) => p && p.generation === 2);

      if (immigrantParent) {
        lines.push({
          id: `gen3-${immigrantParent.id}`,
          lineageTitle:
            immigrantParent.branch === 'suraci' ? 'Sorage (Suraci) Descent' : 'Cardillo (Cardilho) Descent',
          immigrantAncestorName: immigrantParent.originalItalianName,
          immigrantYear: immigrantParent.immigrationYear || 1897,
          shipName: immigrantParent.shipName || 'Transatlantic Steamship',
          branchBadgeColor: immigrantParent.branch === 'suraci' ? '#8C3A27' : '#2B6CB0',
          nodes: [
            {
              person: immigrantParent,
              roleLabel: `Earliest Immigrant Ancestor (${immigrantParent.immigrationYear})`,
              isImmigrant: true,
              immigrationDetail: `${immigrantParent.shipName || 'Steamship'} ➔ Santos`,
              generationBadge: 'Gen II · Immigrant',
            },
            {
              person,
              roleLabel: `Child (1st Brazilian-Born Generation · ${person.birthYear})`,
              isImmigrant: false,
              generationBadge: 'Gen III · 1st Gen BR',
            },
          ],
          summaryNote: `1st generation born in Brazil (${person.birthPlace}) directly descending from the immigrant pioneer ${immigrantParent.originalItalianName}.`,
        });
      }
      return lines;
    }

    // Case 4: Generation 4 (Descendants & Compilers)
    if (person.generation === 4) {
      // Dual descent from both Fortunato Suraci (paternal) and Giovanni Cardillo (maternal)
      const fortunato = peopleDatabase.find((p) => p.id === 'suraci-fortunato-1871');
      const giovanni = peopleDatabase.find((p) => p.id === 'cardillo-giovanni-1869');
      const paschoal = peopleDatabase.find((p) => p.id === 'sorage-paschoal-1904');
      const concetta = peopleDatabase.find((p) => p.id === 'cardillo-concetta-1908');
      const renato = peopleDatabase.find((p) => p.id === 'sorage-renato-1938');

      // Paternal Suraci / Sorage Path
      if (fortunato && paschoal) {
        const pathNodes: PathNode[] = [
          {
            person: fortunato,
            roleLabel: 'Earliest Immigrant Ancestor (Piroscafo Caffaro, 1897)',
            isImmigrant: true,
            immigrationDetail: '1897 Piroscafo Caffaro ➔ Santos & Mooca',
            generationBadge: 'Gen II · Immigrant',
          },
          {
            person: paschoal,
            roleLabel: 'Son (1st Gen Brazilian-Born · 1904 Mooca)',
            isImmigrant: false,
            generationBadge: 'Gen III',
          },
        ];

        if (person.id !== 'sorage-renato-1938' && renato) {
          pathNodes.push({
            person: renato,
            roleLabel: 'Father (2nd Gen BR · 1938 São Paulo)',
            isImmigrant: false,
            generationBadge: 'Gen IV',
          });
          pathNodes.push({
            person,
            roleLabel: 'Great-Grandson (3rd Gen BR · Researcher)',
            isImmigrant: false,
            generationBadge: 'Gen V / Contemporary',
          });
        } else {
          pathNodes.push({
            person,
            roleLabel: 'Grandson (2nd Gen Brazilian-Born · 1938)',
            isImmigrant: false,
            generationBadge: 'Gen IV',
          });
        }

        lines.push({
          id: 'paternal-suraci-line',
          lineageTitle: 'Paternal Line: Suraci ➔ Sorage (Calabria)',
          immigrantAncestorName: fortunato.originalItalianName,
          immigrantYear: 1897,
          shipName: 'Piroscafo Caffaro',
          branchBadgeColor: '#8C3A27',
          nodes: pathNodes,
          summaryNote: `Direct paternal line of descent from Fortunato Suraci (Reggio Calabria, 1871), who arrived in Santos in 1897.`,
        });
      }

      // Maternal Cardillo / Cardilho Path
      if (giovanni && concetta) {
        const pathNodes: PathNode[] = [
          {
            person: giovanni,
            roleLabel: 'Earliest Immigrant Ancestor (Piroscafo Italia, 1893)',
            isImmigrant: true,
            immigrationDetail: '1893 Piroscafo Italia ➔ Santos & Campinas',
            generationBadge: 'Gen II · Immigrant',
          },
          {
            person: concetta,
            roleLabel: 'Daughter (1st Gen Brazilian-Born · 1908 Campinas)',
            isImmigrant: false,
            generationBadge: 'Gen III',
          },
        ];

        if (person.id !== 'sorage-renato-1938' && renato) {
          pathNodes.push({
            person: renato,
            roleLabel: 'Father (2nd Gen BR · 1938 São Paulo)',
            isImmigrant: false,
            generationBadge: 'Gen IV',
          });
          pathNodes.push({
            person,
            roleLabel: 'Great-Grandson (3rd Gen BR · Researcher)',
            isImmigrant: false,
            generationBadge: 'Gen V / Contemporary',
          });
        } else {
          pathNodes.push({
            person,
            roleLabel: 'Grandson (2nd Gen Brazilian-Born · 1938)',
            isImmigrant: false,
            generationBadge: 'Gen IV',
          });
        }

        lines.push({
          id: 'maternal-cardillo-line',
          lineageTitle: 'Maternal Line: Cardillo ➔ Cardilho (Campania)',
          immigrantAncestorName: giovanni.originalItalianName,
          immigrantYear: 1893,
          shipName: 'Piroscafo Italia',
          branchBadgeColor: '#2B6CB0',
          nodes: pathNodes,
          summaryNote: `Direct maternal line of descent from Giovanni Cardillo (Castelnuovo Cilento, 1869), who arrived in Santos in 1893.`,
        });
      }

      return lines;
    }

    return lines;
  }, [person]);

  if (relationshipLines.length === 0) return null;

  const currentLine = relationshipLines[activeLineIndex] || relationshipLines[0];

  return (
    <div className="bg-[#FAF7F2] border border-[#E7E0D2] rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E0D2] pb-2.5">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-[#8C3A27] shrink-0" />
          <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#1C1917]">
            Relationship Path · Direct Descent from Earliest Immigrant
          </span>
        </div>

        {/* Multi-line selector (if person descends from both Suraci & Cardillo) */}
        {relationshipLines.length > 1 && (
          <div className="flex items-center gap-1.5 p-0.5 bg-white rounded-md border border-[#E2DACB] text-[11px] font-sans">
            {relationshipLines.map((line, idx) => (
              <button
                key={line.id}
                onClick={() => setActiveLineIndex(idx)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeLineIndex === idx
                    ? 'bg-[#1C1917] text-white font-semibold'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {line.lineageTitle.split(':')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Breadcrumb Stepper Trail */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {currentLine.nodes.map((node, idx) => {
          const isTarget = node.person.id === person.id;
          const isFirst = idx === 0;

          return (
            <React.Fragment key={node.person.id}>
              {/* Stepper Card */}
              <button
                onClick={() => onSelectPersonById(node.person.id)}
                className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer shrink-0 max-w-[220px] ${
                  isTarget
                    ? 'bg-white border-[#8C3A27] ring-1 ring-[#8C3A27]/25 shadow-xs'
                    : 'bg-white/80 border-[#E2DACB] hover:bg-white hover:border-[#8C3A27]'
                }`}
                title={`Click to view dossier for ${node.person.originalItalianName}`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                  <span
                    className={`font-semibold ${
                      node.isImmigrant ? 'text-[#8C3A27]' : 'text-[#78716C]'
                    }`}
                  >
                    {node.generationBadge}
                  </span>
                  {node.isImmigrant && (
                    <span className="flex items-center gap-1 text-[#8C3A27]">
                      <Ship className="w-2.5 h-2.5" />
                      <span>{currentLine.immigrantYear}</span>
                    </span>
                  )}
                </div>

                <div className="font-display text-sm font-semibold text-[#1C1917] truncate">
                  {node.person.originalItalianName}
                </div>

                <div className="text-[11px] font-sans text-[#57534E] truncate mt-0.5">
                  {node.roleLabel}
                </div>
              </button>

              {/* Connecting Arrow */}
              {idx < currentLine.nodes.length - 1 && (
                <div className="shrink-0 text-[#A8A29E] flex items-center px-0.5">
                  <ArrowRight className="w-4 h-4 text-[#8C3A27]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Explanatory Context Subtitle */}
      {!compact && (
        <div className="text-xs font-editorial text-[#57534E] leading-relaxed pt-1 border-t border-[#EAE3D5] flex items-center justify-between">
          <span>{currentLine.summaryNote}</span>
          <span className="text-[11px] font-mono text-[#78716C] shrink-0 ml-3 hidden sm:inline">
            Pioneer: {currentLine.immigrantAncestorName} ({currentLine.shipName}, {currentLine.immigrantYear})
          </span>
        </div>
      )}
    </div>
  );
};
