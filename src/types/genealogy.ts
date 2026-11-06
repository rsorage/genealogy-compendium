export type BranchId = 'suraci' | 'cardillo' | 'unified';

export interface LifeEvent {
  year: string;
  type: 'birth' | 'marriage' | 'migration' | 'arrival' | 'settlement' | 'death' | 'naturalization';
  place: string;
  description: string;
  citation?: string;
}

export interface Person {
  id: string;
  branch: BranchId;
  originalItalianName: string;
  brazilianSpellingVariants: string[];
  birthYear: number;
  birthDateString?: string;
  birthPlace: string;
  birthCommune: string;
  birthRegion: string;
  deathYear?: number;
  deathPlace?: string;
  generation: 1 | 2 | 3 | 4; // 1 = Progenitors in Italy, 2 = Immigrant Generation, 3 = First Brazilian-born, 4 = Modern Descendants
  fatherId?: string;
  motherId?: string;
  spouseIds: string[];
  childrenIds: string[];
  occupation?: string;
  immigrationYear?: number;
  shipName?: string;
  arrivalPort?: string;
  brazilianSettlement?: string;
  biography: string;
  recordsCount: number;
  associatedRecordIds: string[];
  researchNotes?: string[];
  portraitPath?: string;
}

export interface PaleographicCallout {
  id: string;
  term: string;
  termType: 'formula' | 'date_format' | 'patronymic' | 'witness' | 'official_seal' | 'phonetic_glitch';
  lineReference: string;
  italianOriginal: string;
  translation: string;
  paleographicNote: string;
  historicalSignificance: string;
}

export interface HistoricalRecord {
  id: string;
  branch: BranchId;
  plateNumber: string;
  title: string;
  italianTitle: string;
  year: number;
  exactDate: string;
  recordType: 'birth' | 'marriage' | 'death' | 'passenger_manifest' | 'hospedaria' | 'military_leva' | 'parochial';
  commune: string;
  provinceOrState: string;
  country: 'Italy' | 'Brazil';
  archiveRepository: string;
  archiveCallNumber: string;
  imagePath: string;
  imageAlt: string;
  relatedPersonIds: string[];
  summary: string;
  transcriptionOriginal: string;
  transcriptionTranslation: string;
  paleographicCallouts: PaleographicCallout[];
  fullCitation: string;
}

export interface MigrationStage {
  id: string;
  stepNumber: string;
  branch: BranchId;
  year: string;
  title: string;
  locationName: string;
  coordinates: { x: number; y: number }; // Percentage on thematic route chart
  narrative: string;
  archivalSource: string;
  historicalContext: string;
  keyActors: string[];
}

export interface QuestLogEntry {
  id: string;
  branch: BranchId;
  code: string;
  title: string;
  status: 'resolved' | 'investigating' | 'awaiting_archive' | 'brick_wall';
  targetPerson: string;
  primaryCommune: string;
  hypothesis: string;
  currentFindings: string;
  archivesQueried: {
    institution: string;
    protocolOrDate: string;
    status: 'Sent' | 'In Search' | 'Document Found' | 'Negative Certificate';
  }[];
  nextSteps: string;
  lastUpdated: string;
}

export interface EtymologyData {
  branch: BranchId;
  italianName: string;
  brazilianVariants: string[];
  ipaItalian: string;
  ipaPortuguese: string;
  geographicOrigin: string;
  etymologicalOrigin: string;
  phoneticShiftExplanation: string;
  historicalContext: string;
  archivalFrequency: string;
}
