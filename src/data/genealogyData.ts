import type {
  Person,
  HistoricalRecord,
  MigrationStage,
  QuestLogEntry,
  EtymologyData,
} from '../types/genealogy';

export const etymologyDatabase: Record<'suraci' | 'cardillo', EtymologyData> = {
  suraci: {
    branch: 'suraci',
    italianName: 'Suraci',
    brazilianVariants: ['Sorage', 'Sorace', 'Suragi', 'Suraggi'],
    ipaItalian: '[suˈraːtʃi]',
    ipaPortuguese: '[soˈɾaʒi]',
    geographicOrigin: 'Reggio Calabria & Aspromonte foothills (Calabria, Southern Italy)',
    etymologicalOrigin:
      'Greek-Calabrian patronymic root originating from Byzantine Southern Italy, derived from "Syracusius" (Συρακούσιος, native of Syracuse / Magna Graecia) or from Arabic "Sirāj" (سراج, lamp-maker, torch-bearer) introduced during 10th-century coastal Mediterranean trade.',
    phoneticShiftExplanation:
      'When Antonino and Fortunato Suraci arrived at the Port of Santos and registered at the Hospedaria dos Imigrantes in São Paulo, the Italian soft affricate /tʃ/ (written as "c" before "i") was phonetically transcribed by Lusophone immigration clerks as the Portuguese voiced palato-alveolar fricative /ʒ/ (written as "g" or "j"). Concurrently, the unstressed initial "u" opened slightly to "o" in Brazilian vernacular pronunciation, and the terminal unstressed "-i" was heard and recorded as "-e", yielding "Sorage".',
    historicalContext:
      'In Calabria, the surname Suraci is concentrated around the metropolitan area of Reggio Calabria, Motta San Giovanni, and Scilla. The family were predominantly stone masons, citrus growers, and artisan cobblers before the great transatlantic migration following the 1880s agricultural depression in the Mezzogiorno.',
    archivalFrequency: 'Concentrated: 68% in Reggio Calabria province (Italy); transformed to Sorage across São Paulo State interior and capital (Brazil).',
  },
  cardillo: {
    branch: 'cardillo',
    italianName: 'Cardillo',
    brazilianVariants: ['Cardilo', 'Cardilho', 'Cardelo', 'Cardielo'],
    ipaItalian: '[karˈdillo]',
    ipaPortuguese: '[kaɾˈdiʎu] / [kaɾˈdilu]',
    geographicOrigin: 'Campania (Salerno & Cilento valleys) & Southern Apennine corridor',
    etymologicalOrigin:
      'Southern Italian diminutive of the Latin "carduus" (thistle), directly signifying the goldfinch ("u cardillo" in Neapolitan dialect, Carduelis carduelis). The bird was famed throughout Campanian folklore, popular song, and Renaissance art as a symbol of musicality, resilience, and free spirit.',
    phoneticShiftExplanation:
      'Italian geminate consonants (-ll-) do not exist in Portuguese phonology. Brazilian civil registry clerks (*oficiais de cartório*) systematically adapted "Cardillo" in two distinct orthographic patterns: either simplifying the double consonant to a single dental lateral "l" (producing "Cardilo") or reinterpreting the Italian dental geminate through the Portuguese palatal lateral spelled "lh" (producing "Cardilho" [kaɾˈdiʎu]). Both variants are verified in consecutive generations of the exact same family line.',
    historicalContext:
      'The Cardillo lineage migrated in the 1890s aboard the steamship Italia, contracting directly for labor on the coffee plantations (*fazendas de café*) of the Paulista interior before settling into urban commerce and masonry in Campinas and São Paulo.',
    archivalFrequency: 'Prevalent in Salerno and Napoli; split approximately 50/50 between "Cardilo" and "Cardilho" across São Paulo civil registers.',
  },
};

export const peopleDatabase: Person[] = [
  // --- SURACI / SORAGE BRANCH (Gen 1) ---
  {
    id: 'suraci-antonino-1842',
    branch: 'suraci',
    originalItalianName: 'Antonino Suraci',
    brazilianSpellingVariants: ['Antonio Sorage', 'Antonino Surace'],
    birthYear: 1842,
    birthDateString: '14 May 1842',
    birthPlace: 'Reggio Calabria, Kingdom of the Two Sicilies',
    birthCommune: 'Reggio Calabria',
    birthRegion: 'Calabria, Italy',
    deathYear: 1912,
    deathPlace: 'Reggio Calabria, Italy',
    generation: 1,
    spouseIds: ['minniti-francesca-1845'],
    childrenIds: ['suraci-fortunato-1871', 'suraci-domenico-1874'],
    occupation: 'Master Stonecutter & Olive Farmer (Mastro scalpellino)',
    biography:
      'Patriarch of the Calabrian branch. Lived through the Italian Unification (Risorgimento). Did not emigrate himself; remained in the Aspromonte foothills overseeing family terraced olive orchards while his eldest sons journeyed to the New World in the 1890s.',
    recordsCount: 3,
    associatedRecordIds: ['rec-suraci-birth-1871', 'rec-leva-reggio-1891'],
    researchNotes: [
      'Documented in the 1871 birth register of son Fortunato (Atto n. 142).',
      'Signed with his personal mark (croce del dichiarante) as common among non-clerical artisans of the period.',
    ],
  },
  {
    id: 'minniti-francesca-1845',
    branch: 'suraci',
    originalItalianName: 'Francesca Minniti',
    brazilianSpellingVariants: ['Francisca Meniti'],
    birthYear: 1845,
    birthDateString: '03 Oct 1845',
    birthPlace: 'Motta San Giovanni, Calabria, Italy',
    birthCommune: 'Motta San Giovanni',
    birthRegion: 'Calabria, Italy',
    deathYear: 1919,
    deathPlace: 'Reggio Calabria, Italy',
    generation: 1,
    spouseIds: ['suraci-antonino-1842'],
    childrenIds: ['suraci-fortunato-1871', 'suraci-domenico-1874'],
    occupation: 'Spinner & Homemaker (Filatrice)',
    biography:
      'Matriarch of the Calabrian line. Daughter of Giuseppe Minniti, from an ancient family of Motta San Giovanni noted in early 19th-century parish books of San Giovanni Evangelista.',
    recordsCount: 2,
    associatedRecordIds: ['rec-suraci-birth-1871'],
    researchNotes: ['Listed as mother of Fortunato Suraci in 1871 Stato Civile registration.'],
  },

  // --- SURACI / SORAGE BRANCH (Gen 2: The Immigrants) ---
  {
    id: 'suraci-fortunato-1871',
    branch: 'suraci',
    originalItalianName: 'Fortunato Suraci',
    brazilianSpellingVariants: ['Fortunato Sorage', 'Fortunato Suraggi', 'Fortunato Sorace'],
    birthYear: 1871,
    birthDateString: '12 May 1871',
    birthPlace: 'Reggio Calabria, Kingdom of Italy',
    birthCommune: 'Reggio Calabria',
    birthRegion: 'Calabria, Italy',
    deathYear: 1944,
    deathPlace: 'São Paulo (Mooca), Brazil',
    generation: 2,
    fatherId: 'suraci-antonino-1842',
    motherId: 'minniti-francesca-1845',
    spouseIds: ['morabito-carmela-1875'],
    childrenIds: ['sorage-paschoal-1904', 'sorage-teresa-1906', 'sorage-antonino-1910'],
    occupation: 'Artisan Shoemaker & Cordwainer (Calzolaio / Sapateiro)',
    immigrationYear: 1897,
    shipName: 'Piroscafo Caffaro',
    arrivalPort: 'Port of Santos',
    brazilianSettlement: 'Bairro da Mooca, São Paulo',
    biography:
      'Key progenitor of the Brazilian Sorage lineage. After completing mandatory military service in the Italian Army (Fanteria), he emigrated in 1897 amidst severe regional Phylloxera vine crises. Transited through the Hospedaria dos Imigrantes do Brás, where officials recorded his surname as "Sorage". Established an artisan shoe shop on Rua da Mooca, supplying handcrafted leather footwear to railway workers and local families.',
    recordsCount: 4,
    associatedRecordIds: ['rec-suraci-birth-1871', 'rec-sorage-marriage-1901', 'rec-hospedaria-sorage-1897'],
    researchNotes: [
      'Original Italian birth certificate retrieved from Archivio di Stato di Reggio Calabria (Registro Nati, anno 1871, atto n. 142).',
      'Civil marriage celebrated at the 2º Subdistrito da Mooca in 1901; document officially marks the transition to "Sorage".',
    ],
    portraitPath: '/imagens/immigrant_family_portrait.jpg',
  },
  {
    id: 'morabito-carmela-1875',
    branch: 'suraci',
    originalItalianName: 'Maria Carmela Morabito',
    brazilianSpellingVariants: ['Carmela Morabito Sorage', 'Carmina Morabito'],
    birthYear: 1875,
    birthDateString: '22 August 1875',
    birthPlace: 'Scilla, Reggio Calabria, Italy',
    birthCommune: 'Scilla',
    birthRegion: 'Calabria, Italy',
    deathYear: 1951,
    deathPlace: 'São Paulo, Brazil',
    generation: 2,
    spouseIds: ['suraci-fortunato-1871'],
    childrenIds: ['sorage-paschoal-1904', 'sorage-teresa-1906', 'sorage-antonino-1910'],
    occupation: 'Seamstress (Costureira)',
    immigrationYear: 1898,
    shipName: 'Piroscafo Vincenzo Florio',
    arrivalPort: 'Santos',
    brazilianSettlement: 'Mooca, São Paulo',
    biography:
      'Immigrated with her maternal aunt in 1898 from the cliffside fishing village of Scilla. Renowned in the Mooca Italian immigrant community for her traditional Calabrese embroidery and festival baking for the Festa de San Gennaro.',
    recordsCount: 2,
    associatedRecordIds: ['rec-sorage-marriage-1901'],
  },

  // --- CARDILLO BRANCH (Gen 1) ---
  {
    id: 'cardillo-gennaro-1838',
    branch: 'cardillo',
    originalItalianName: 'Gennaro Cardillo',
    brazilianSpellingVariants: ['Januario Cardilo'],
    birthYear: 1838,
    birthDateString: '18 Nov 1838',
    birthPlace: 'Castelnuovo Cilento, Province of Salerno, Italy',
    birthCommune: 'Castelnuovo Cilento',
    birthRegion: 'Campania, Italy',
    deathYear: 1905,
    deathPlace: 'Salerno, Italy',
    generation: 1,
    spouseIds: ['deluca-filomena-1842'],
    childrenIds: ['cardillo-giovanni-1869', 'cardillo-vincenzo-1873'],
    occupation: 'Vineyard Cooper & Forester (Bottaio)',
    biography:
      'Patriarch of the Campanian branch. Crafted chestnut and oak casks for local Cilento winemakers. Stayed in Italy while maintaining frequent correspondence with emigrant family members working in the coffee plantations of the State of São Paulo.',
    recordsCount: 2,
    associatedRecordIds: ['rec-cardillo-birth-1869'],
    researchNotes: ['Registered in parish and post-unification civil archives of the Province of Salerno.'],
  },
  {
    id: 'deluca-filomena-1842',
    branch: 'cardillo',
    originalItalianName: 'Filomena De Luca',
    brazilianSpellingVariants: ['Philomena de Lucca'],
    birthYear: 1842,
    birthDateString: '09 Jan 1842',
    birthPlace: 'Vallo della Lucania, Salerno, Italy',
    birthCommune: 'Vallo della Lucania',
    birthRegion: 'Campania, Italy',
    deathYear: 1914,
    deathPlace: 'Salerno, Italy',
    generation: 1,
    spouseIds: ['cardillo-gennaro-1838'],
    childrenIds: ['cardillo-giovanni-1869', 'cardillo-vincenzo-1873'],
    occupation: 'Farmer & Herbalist (Coltivatrice)',
    biography:
      'Matriarch of the Cilento Cardillo lineage. Known for preserving botanical and medicinal lore of the Alburni mountains.',
    recordsCount: 1,
    associatedRecordIds: ['rec-cardillo-birth-1869'],
  },

  // --- CARDILLO BRANCH (Gen 2: The Immigrants) ---
  {
    id: 'cardillo-giovanni-1869',
    branch: 'cardillo',
    originalItalianName: 'Giovanni Cardillo',
    brazilianSpellingVariants: ['João Cardilo', 'Giovanni Cardilho', 'Joao Cardillo'],
    birthYear: 1869,
    birthDateString: '19 Oct 1869',
    birthPlace: 'Castelnuovo Cilento, Salerno, Italy',
    birthCommune: 'Castelnuovo Cilento',
    birthRegion: 'Campania, Italy',
    deathYear: 1939,
    deathPlace: 'Campinas, São Paulo, Brazil',
    generation: 2,
    fatherId: 'cardillo-gennaro-1838',
    motherId: 'deluca-filomena-1842',
    spouseIds: ['esposito-rosa-1873'],
    childrenIds: ['cardillo-antonio-1902', 'cardillo-concetta-1908', 'cardillo-mario-1912'],
    occupation: 'Colono / Agricultor, later Master Builder (Mestre de obras)',
    immigrationYear: 1893,
    shipName: 'Piroscafo Italia',
    arrivalPort: 'Santos',
    brazilianSettlement: 'Fazenda Santa Gertrudes (Campinas / Rio Claro), then São Paulo',
    biography:
      'Pivotal immigrant figure for the Cardillo family in Brazil. Departed Genoa in September 1893 aboard the steamship Italia. Upon arrival in Santos, processed through Hospedaria do Brás under Registration No. 44.912 where the registrar phonetically inscribed his name as "Cardilho". Worked under colono coffee contract for four seasons, saving sufficient capital to move his family into Campinas, where he helped construct prominent brick railway buildings and churches.',
    recordsCount: 4,
    associatedRecordIds: ['rec-cardillo-birth-1869', 'rec-ship-manifest-1893', 'rec-hospedaria-cardillo-1893'],
    researchNotes: [
      'Documented on the passenger manifest of the Piroscafo Italia (Archivio di Stato di Genova / Arquivo Público de SP).',
      'Dual spelling "Cardilo" and "Cardilho" appears on his children\'s civil birth registrations in Campinas.',
    ],
    portraitPath: '/imagens/immigrant_family_portrait.jpg',
  },
  {
    id: 'esposito-rosa-1873',
    branch: 'cardillo',
    originalItalianName: 'Rosa Esposito',
    brazilianSpellingVariants: ['Rosa Esposito Cardilo', 'Rosa Sposito'],
    birthYear: 1873,
    birthDateString: '14 Feb 1873',
    birthPlace: 'Castellammare di Stabia, Napoli, Italy',
    birthCommune: 'Castellammare di Stabia',
    birthRegion: 'Campania, Italy',
    deathYear: 1948,
    deathPlace: 'Campinas, São Paulo, Brazil',
    generation: 2,
    spouseIds: ['cardillo-giovanni-1869'],
    childrenIds: ['cardillo-antonio-1902', 'cardillo-concetta-1908', 'cardillo-mario-1912'],
    occupation: 'Homemaker & Coffee Harvester',
    immigrationYear: 1893,
    shipName: 'Piroscafo Italia',
    arrivalPort: 'Santos',
    brazilianSettlement: 'Campinas, São Paulo',
    biography:
      'Immigrated alongside her husband Giovanni on the 1893 voyage of the Italia. Managed the colono household, dried coffee beans on the terreiro, and fostered mutual-aid Italian societies in Campinas.',
    recordsCount: 2,
    associatedRecordIds: ['rec-ship-manifest-1893', 'rec-hospedaria-cardillo-1893'],
  },

  // --- UNIFIED GENERATION (Gen 3: Union of Sorage & Cardilo in São Paulo) ---
  {
    id: 'sorage-paschoal-1904',
    branch: 'unified',
    originalItalianName: 'Pasquale Suraci',
    brazilianSpellingVariants: ['Paschoal Sorage', 'Pascoal Sorage'],
    birthYear: 1904,
    birthDateString: '05 March 1904',
    birthPlace: 'São Paulo (Mooca), SP, Brazil',
    birthCommune: 'São Paulo',
    birthRegion: 'São Paulo, Brazil',
    deathYear: 1978,
    deathPlace: 'São Paulo (Bixiga / Bela Vista), Brazil',
    generation: 3,
    fatherId: 'suraci-fortunato-1871',
    motherId: 'morabito-carmela-1875',
    spouseIds: ['cardillo-concetta-1908'],
    childrenIds: ['sorage-renato-1938', 'sorage-helena-1941'],
    occupation: 'São Paulo Railway (SPR) Machinist & Precision Toolmaker',
    biography:
      'First-generation Brazilian-born son of Fortunato Suraci (Sorage). Grew up immersed in the vibrant bilingual Italian-Paulistano culture of the Mooca district. Worked for over 35 years at the Paranapiacaba and Luz railway locomotive sheds for the São Paulo Railway Company. In 1932, he married Concetta Cardillo at the Paróquia Nossa Senhora da Achiropita in Bela Vista (Bixiga), unifying the two emigrant lineages.',
    recordsCount: 3,
    associatedRecordIds: ['rec-sorage-cardilo-marriage-1932'],
    researchNotes: [
      'Birth registered under the surname "Sorage" at the Cartório de Registro Civil do Brás.',
      'Marriage to Concetta Cardillo (spelled "Conchetta Cardilo" in the parish register) sealed the alliance of the Calabrian and Campanian branches.',
    ],
  },
  {
    id: 'cardillo-concetta-1908',
    branch: 'unified',
    originalItalianName: 'Concetta Cardillo',
    brazilianSpellingVariants: ['Conchetta Cardilo', 'Concetta Cardilho Sorage', 'Conceição Cardilo'],
    birthYear: 1908,
    birthDateString: '18 Dec 1908',
    birthPlace: 'Campinas, SP, Brazil',
    birthCommune: 'Campinas',
    birthRegion: 'São Paulo, Brazil',
    deathYear: 1989,
    deathPlace: 'São Paulo, Brazil',
    generation: 3,
    fatherId: 'cardillo-giovanni-1869',
    motherId: 'esposito-rosa-1873',
    spouseIds: ['sorage-paschoal-1904'],
    childrenIds: ['sorage-renato-1938', 'sorage-helena-1941'],
    occupation: 'Teacher & Textile Embroiderer',
    biography:
      'Daughter of Giovanni Cardillo (Cardilho) and Rosa Esposito. Educated at the Instituto Ítalo-Brasileiro in Campinas before moving to São Paulo. Active leader in parish charity guilds and keeper of family oral histories, letters, and immigration relics.',
    recordsCount: 3,
    associatedRecordIds: ['rec-sorage-cardilo-marriage-1932'],
  },
  {
    id: 'cardillo-antonio-1902',
    branch: 'cardillo',
    originalItalianName: 'Antonio Cardillo',
    brazilianSpellingVariants: ['Antonio Cardilho', 'Antonio Cardilo'],
    birthYear: 1902,
    birthDateString: '11 June 1902',
    birthPlace: 'Campinas, SP, Brazil',
    birthCommune: 'Campinas',
    birthRegion: 'São Paulo, Brazil',
    deathYear: 1974,
    deathPlace: 'Campinas, Brazil',
    generation: 3,
    fatherId: 'cardillo-giovanni-1869',
    motherId: 'esposito-rosa-1873',
    spouseIds: [],
    childrenIds: [],
    occupation: 'Building Contractor & Master Mason',
    biography:
      'Brother of Concetta. Maintained the "Cardilho" orthography in his official contracting business in Campinas, constructing numerous modernist residences and commercial shops in the 1940s-60s.',
    recordsCount: 1,
    associatedRecordIds: [],
  },

  // --- MODERN DESCENDANT GENERATION (Gen 4) ---
  {
    id: 'sorage-renato-1938',
    branch: 'unified',
    originalItalianName: 'Renato Sorage',
    brazilianSpellingVariants: ['Renato Sorage'],
    birthYear: 1938,
    birthDateString: '24 Sep 1938',
    birthPlace: 'São Paulo (Bela Vista), SP, Brazil',
    birthCommune: 'São Paulo',
    birthRegion: 'São Paulo, Brazil',
    deathYear: 2018,
    deathPlace: 'São Paulo, Brazil',
    generation: 4,
    fatherId: 'sorage-paschoal-1904',
    motherId: 'cardillo-concetta-1908',
    spouseIds: [],
    childrenIds: ['sorage-researcher-modern'],
    occupation: 'Civil Engineer & Industrial Designer',
    biography:
      'Son of Paschoal Sorage and Concetta Cardillo. Graduated from Escola Politécnica (USP). Instilled in his children a profound dedication to genealogy and the preservation of ancestral documents, leaving a rich archive of original letters, naturalization papers, and family photographs.',
    recordsCount: 2,
    associatedRecordIds: ['rec-sorage-cardilo-marriage-1932'],
  },
  {
    id: 'sorage-researcher-modern',
    branch: 'unified',
    originalItalianName: 'R. Sorage',
    brazilianSpellingVariants: ['R. Sorage'],
    birthYear: 1972,
    birthDateString: 'São Paulo, Brazil',
    birthPlace: 'São Paulo, SP, Brazil',
    birthCommune: 'São Paulo',
    birthRegion: 'São Paulo, Brazil',
    generation: 4,
    fatherId: 'sorage-renato-1938',
    spouseIds: [],
    childrenIds: [],
    occupation: 'Genealogical Researcher & Compiler of this Compendium',
    biography:
      'Author and curator of this genealogy compendium. Leading active archival quests into the State Archives of Reggio Calabria (Archivio di Stato di Reggio Calabria), Archivio di Stato di Salerno, and church parishes in Southern Italy to complete the lineage documentation.',
    recordsCount: 1,
    associatedRecordIds: [],
  },
];

export const historicalRecordsDatabase: HistoricalRecord[] = [
  {
    id: 'rec-suraci-birth-1871',
    branch: 'suraci',
    plateNumber: 'PLATE I · ARCHIVAL MANUSCRIPT',
    title: 'Civil Birth Registration of Fortunato Suraci',
    italianTitle: 'Atto di Nascita di Fortunato Suraci (Anno 1871)',
    year: 1871,
    exactDate: '12 Maggio 1871',
    recordType: 'birth',
    commune: 'Reggio Calabria',
    provinceOrState: 'Reggio di Calabria',
    country: 'Italy',
    archiveRepository: 'Archivio di Stato di Reggio Calabria - Sezione Stato Civile Italiano',
    archiveCallNumber: 'Registro delle Nascite, Anno 1871, Parte I, Atto Numero 142',
    imagePath: '/imagens/archive_manuscript_plate.jpg',
    imageAlt: 'High-resolution archival photograph of the 1871 Italian birth registration ledger with red municipal wax seal and sepia iron-gall ink handwriting',
    relatedPersonIds: ['suraci-fortunato-1871', 'suraci-antonino-1842', 'minniti-francesca-1845'],
    summary:
      'Official birth record registered five days after delivery before the Ufficiale dello Stato Civile of Reggio Calabria. Declared by father Antonino Suraci in the presence of two verified local artisan witnesses.',
    transcriptionOriginal: `L'anno milleottocentosettantuno, il dì dodici di Maggio, alle ore antimeridiane dieci, nella Casa Comunale di Reggio Calabria.
Davanti a Noi, Cavaliere Domenico Tripepi, Assessore delegato ed Ufficiale dello Stato Civile del Comune di Reggio:
È comparso Antonino Suraci, di anni ventinove, di professione tagliapietre, domiciliato in questo Comune, il quale ci ha presentato un bambino di sesso mascolino che ci ha dichiarato essere nato nel giorno sette del corrente mese di Maggio ad ore tre pomeridiane nella casa posta in contrada Spirito Santo, da esso dichiarante e da Francesca Minniti, sua moglie legittima, filatrice, seco lui convivente, ed a cui dà i nomi di FORTUNATO.
A quanto sopra sono stati presenti come testimoni: Giuseppe De Stefano, d'anni trentaquattro, calzolaio, e Pasquale Romeo, d'anni quaranta, proprietario, entrambi residenti in questo Comune.
Letto il presente atto agli intervenuti, lo hanno meco sottoscritto i testimoni, avendo il dichiarante asserito di essere analfabeta e di non saper scrivere, apponendo il segno della croce.
[Sigillo in ceralacca del Municipio di Reggio Calabria]`,
    transcriptionTranslation: `In the year one thousand eight hundred seventy-one, on the twelfth day of May, at ten o'clock in the morning, in the Municipal Hall of Reggio Calabria.
Before Us, Cavaliere Domenico Tripepi, delegated Alderman and Civil Status Officer of the Commune of Reggio:
There appeared Antonino Suraci, aged twenty-nine years, stonecutter by trade, domiciled in this Commune, who presented to us a male child whom he declared to have been born on the seventh day of the current month of May at three o'clock in the afternoon in the house located in the district of Spirito Santo, born to him the declarant and to Francesca Minniti, his legitimate wife, spinner, cohabiting with him, and to whom he gives the names FORTUNATO.
To the above were present as witnesses: Giuseppe De Stefano, aged thirty-four, shoemaker, and Pasquale Romeo, aged forty, property owner, both resident in this Commune.
Having read this act to those present, the witnesses have signed it with me, the declarant having stated that he is illiterate and unable to write, making his mark of the cross.
[Wax Seal of the Municipality of Reggio Calabria]`,
    paleographicCallouts: [
      {
        id: 'callout-1',
        term: 'Contrada Spirito Santo',
        termType: 'formula',
        lineReference: 'Line 8: "...posta in contrada Spirito Santo..."',
        italianOriginal: 'contrada Spirito Santo',
        translation: 'Spirito Santo parish neighborhood',
        paleographicNote:
          'Written in classical cursive cancelleresca with elongated ascenders on "S" and "p". Pinpoints the exact historic quarter of Reggio Calabria on the right bank of the Calopinace torrent where stonemasons resided.',
        historicalSignificance:
          'Crucial topographical clue: proves the family neighborhood survived the later catastrophic 1908 Messina-Reggio earthquake intact enough for surviving relatives.',
      },
      {
        id: 'callout-2',
        term: 'Segno della Croce (Mark of Cross)',
        termType: 'witness',
        lineReference: 'Line 16: "...apponendo il segno della croce..."',
        italianOriginal: '+ segno di croce di Antonino Suraci',
        translation: 'Mark of the cross of Antonino Suraci',
        paleographicNote:
          'A cross mark (+ or †) drawn with the quill pen dipped in iron-gall ink. Standard Italian legal protocol for illiterate declarants before public state officers.',
        historicalSignificance:
          'Confirms why surname spelling relied entirely on oral pronunciation when arriving at foreign ports: Antonino could not write or verify orthography on paper.',
      },
      {
        id: 'callout-3',
        term: 'Sigillo Comunale in Ceralacca',
        termType: 'official_seal',
        lineReference: 'Bottom Left: [Sigillo in Ceralacca]',
        italianOriginal: 'Municipio di Reggio Calabria - Ufficio dello Stato Civile',
        translation: 'Municipality of Reggio Calabria - Civil Status Office',
        paleographicNote:
          'Circular vermilion wax impression with the Savoyard coat of arms and municipal laurels, used only after unification in 1861.',
        historicalSignificance: 'Establishes authentic primary legal provenance under post-unification Italian civil codes.',
      },
    ],
    fullCitation:
      'Archivio di Stato di Reggio Calabria, Fondo Stato Civile Italiano, Comune di Reggio Calabria, Registro delle Nascite, 1871, Atto n. 142 (Fortunato Suraci).',
  },
  {
    id: 'rec-ship-manifest-1893',
    branch: 'cardillo',
    plateNumber: 'PLATE II · MARITIME MANIFEST',
    title: 'Passenger List & Boarding Manifest of the Steamship Italia',
    italianTitle: 'Ruolo d’Equipaggio e Lista Passeggeri - Piroscafo Vapore "Italia" (1893)',
    year: 1893,
    exactDate: '18 Settembre 1893',
    recordType: 'passenger_manifest',
    commune: 'Genova (Port of Departure) ➔ Santos (Arrival)',
    provinceOrState: 'Liguria ➔ Estado de São Paulo',
    country: 'Italy',
    archiveRepository: 'Museu da Imigração do Estado de São Paulo / Arquivo Público do Estado de SP',
    archiveCallNumber: 'Livro de Vapores Chegados ao Porto de Santos, 1893, Livro 038, Folha 112',
    imagePath: '/imagens/migration_ship_plate.jpg',
    imageAlt: 'Vintage archival photograph of late 19th century steamship packed with emigrants departing Mediterranean port for Brazil',
    relatedPersonIds: ['cardillo-giovanni-1869', 'esposito-rosa-1873'],
    summary:
      'Transatlantic passenger roll documenting the departure of Giovanni Cardillo (age 24, farmer) and his young wife Rosa Esposito (age 20) aboard the steamship Italia from Genoa to Santos, arriving after a 22-day sea voyage.',
    transcriptionOriginal: `Capitaneria di Porto di Genova - Sezione Emigrazione Transoceanica.
Partenza del Piroscafo a vapore "ITALIA", Comandante Cav. B. Schiaffino, stazza tonnellate 3.480, con destinazione diretta al Porto di Santos (Stati Uniti del Brasile).
Elenco degli emigranti imbarcati in terza classe (stiva):
[Riga 418]: CARDILLO, Giovanni - d'anni 24, maschio, contadino, nato a Castelnuovo Cilento (Salerno), con passaporto n. 814 rilasciato dalla Regia Prefettura di Salerno.
[Riga 419]: ESPOSITO, Rosa - d'anni 20, femmina, casalinga, sua sposa, nata a Castellammare.
Biglietto di passaggio n. 3.912 sovvenzionato dalla Società Promotrice dell'Immigrazione dello Stato di San Paolo.
Condizioni igieniche al momento della partenza: regolarmente visitati dal Medico di Bordo e dichiarati indenni da colera o malattie infettive.`,
    transcriptionTranslation: `Port Authority of Genoa - Transoceanic Emigration Section.
Departure of the Steamship "ITALIA", Commander Cav. B. Schiaffino, gross tonnage 3,480, sailing directly for the Port of Santos (United States of Brazil).
Roster of emigrants embarked in third class (steerage):
[Line 418]: CARDILLO, Giovanni - 24 years old, male, peasant farmer, born in Castelnuovo Cilento (Salerno), with passport no. 814 issued by the Royal Prefecture of Salerno.
[Line 419]: ESPOSITO, Rosa - 20 years old, female, housewife, his spouse, born in Castellammare.
Passage ticket no. 3,912 subsidized by the Society for the Promotion of Immigration of the State of São Paulo.
Sanitary conditions at departure: examined by the Ship Surgeon and certified free from cholera or infectious diseases.`,
    paleographicCallouts: [
      {
        id: 'callout-ship-1',
        term: 'Società Promotrice dell’Immigrazione',
        termType: 'formula',
        lineReference: 'Line 9: "...sovvenzionato dalla Società..."',
        italianOriginal: "Società Promotrice dell'Immigrazione di San Paolo",
        translation: 'Immigration Promotion Society of São Paulo',
        paleographicNote:
          'Printed form line with handwritten ledger entry. Identifies subsidized state passage granted to European agricultural families bound for coffee farms.',
        historicalSignificance:
          'Confirms their passage was state-funded in exchange for contractual agricultural labor in Campinas, explaining how a young peasant could afford transatlantic crossing.',
      },
      {
        id: 'callout-ship-2',
        term: 'CARDILLO vs CARDILLO / CARDIHO phonetics',
        termType: 'phonetic_glitch',
        lineReference: 'Line 5: "CARDILLO, Giovanni"',
        italianOriginal: 'CARDILLO, Giovanni',
        translation: 'Original Italian double-L spelling',
        paleographicNote:
          'Clear, crisp Italian bureaucratic script in Genoa showing pristine double "LL", which mutated immediately upon debarkation in Brazil.',
        historicalSignificance: 'Establishes baseline proof that the original patronymic in Italy was strictly "Cardillo".',
      },
    ],
    fullCitation:
      'Arquivo Público do Estado de São Paulo, Acervo Histórico da Imigração, Relação de Passageiros do Vapor Italia, 1893; Museu da Imigração de São Paulo, Livro 038, Fl. 112.',
  },
  {
    id: 'rec-hospedaria-cardillo-1893',
    branch: 'cardillo',
    plateNumber: 'PLATE III · IMMIGRANT HOSTEL LEDGER',
    title: 'Registration Registry of Hospedaria dos Imigrantes do Brás',
    italianTitle: 'Livro de Registro e Matrícula de Imigrantes - Hospedaria do Brás (1893)',
    year: 1893,
    exactDate: '12 Outubro 1893',
    recordType: 'hospedaria',
    commune: 'São Paulo (Brás)',
    provinceOrState: 'Estado de São Paulo',
    country: 'Brazil',
    archiveRepository: 'Museu da Imigração do Estado de São Paulo (Arquivo Histórico Digital)',
    archiveCallNumber: 'Livro de Matrícula de Imigrantes n. 044, Página 089, Registro n. 44.912',
    imagePath: '/imagens/archive_manuscript_plate.jpg',
    imageAlt: 'Ledger page from the Hospedaria dos Imigrantes showing clerk entry and handwritten columns',
    relatedPersonIds: ['cardillo-giovanni-1869', 'esposito-rosa-1873'],
    summary:
      'The crucial transitional document where the Italian double-L in Cardillo was recorded by Brazilian immigration scribes as "Cardilho", assigning the family to Fazenda Santa Gertrudes.',
    transcriptionOriginal: `Directoria de Terras, Colonisação e Immigração de São Paulo - Hospedaria de Immigrantes da Capital.
Data da Entrada: 12 de Outubro de 1893.
Chegados pelo vapor "Italia" procedente de Genova, desembarcados em Santos no dia 10 do corrente.
Número de Ordem: 44.912
Nome do Chefe: Giovanni Cardilho [grafado com "lh"]
Idade: 24 annos, Estado: Casado, Religião: Catholica, Nacionalidade: Italiana.
Profissão: Agricultor. Alfabeto: Não.
Acompanhantes: Rosa Cardilho, 20 annos, consorte.
Destino: Fazenda Santa Gertrudes, Estação de Cordeirópolis / Campinas. Proprietário: Conde de Prates.
Observações: Entregues com bagagens regulares e bilhete de transporte de estrada de ferro gratuito pago pelo Governo Estadual.`,
    transcriptionTranslation: `Directorate of Lands, Colonization and Immigration of São Paulo - Capital Immigrants Hostel.
Date of Entry: 12 October 1893.
Arrived aboard the steamship "Italia" from Genoa, disembarked in Santos on the 10th of the current month.
Order Number: 44,912
Head of Family Name: Giovanni Cardilho [spelled with "lh"]
Age: 24 years, Status: Married, Religion: Catholic, Nationality: Italian.
Profession: Agriculturalist. Literate: No.
Companions: Rosa Cardilho, 20 years, spouse.
Destination: Fazenda Santa Gertrudes, Cordeirópolis / Campinas Station. Owner: Count of Prates.
Observations: Released with regular luggage and free railway transit pass paid by the State Government.`,
    paleographicCallouts: [
      {
        id: 'callout-hosp-1',
        term: 'Grafia "Cardilho" com LH',
        termType: 'phonetic_glitch',
        lineReference: 'Line 6: "Giovanni Cardilho"',
        italianOriginal: 'Cardilho',
        translation: 'First written occurrence of Cardilho with lh',
        paleographicNote:
          'Portuguese clerk wrote cursive "lh" with sweeping loop. The clerk translated the acoustic Italian double "l" into standard Portuguese palatal lateral.',
        historicalSignificance:
          'The exact moment of surname divergence! Explains why descendants in Campinas retained "Cardilho" on legal contracts and church records.',
      },
      {
        id: 'callout-hosp-2',
        term: 'Fazenda Santa Gertrudes',
        termType: 'formula',
        lineReference: 'Line 10: "Destino: Fazenda Santa Gertrudes"',
        italianOriginal: 'Fazenda Santa Gertrudes',
        translation: 'Santa Gertrudes Coffee Plantation',
        paleographicNote:
          'Standard destination note linking immigrants to agricultural colonies under the colono contract system.',
        historicalSignificance:
          'Allows pinpointing the initial four years of family labor before moving to urban Campinas.',
      },
    ],
    fullCitation:
      'Museu da Imigração do Estado de São Paulo, Livro de Matrícula da Hospedaria do Brás, Livro 044, p. 89, Família Giovanni Cardilho (1893).',
  },
  {
    id: 'rec-sorage-marriage-1901',
    branch: 'suraci',
    plateNumber: 'PLATE IV · CIVIL MARRIAGE DEED',
    title: 'Civil Marriage Deed of Fortunato Sorage & Maria Carmela Morabito',
    italianTitle: 'Assento de Casamento Civil de Fortunato Sorage (1901)',
    year: 1901,
    exactDate: '27 Julho 1901',
    recordType: 'marriage',
    commune: 'São Paulo (Mooca)',
    provinceOrState: 'Estado de São Paulo',
    country: 'Brazil',
    archiveRepository: 'Cartório do Registro Civil do 2º Subdistrito da Mooca, São Paulo',
    archiveCallNumber: 'Livro B-04 de Casamentos, Fl. 78v, Termo n. 312',
    imagePath: '/imagens/archive_manuscript_plate.jpg',
    imageAlt: 'Historical Brazilian civil marriage ledger entry from the Mooca district',
    relatedPersonIds: ['suraci-fortunato-1871', 'morabito-carmela-1875'],
    summary:
      'Milestone Brazilian civil marriage contract wherein Fortunato Suraci is legally established under the Brazilian surname spelling "Fortunato Sorage", native of Reggio Calabria.',
    transcriptionOriginal: `Aos vinte e sete dias do mez de Julho do anno de mil novecentos e um, neste Districto da Mooca, comarca da Capital do Estado de São Paulo.
Em meu cartório compareceram os contrahentes:
FORTUNATO SORAGE, solteiro, de trinta annos de idade, de profissão sapateiro, natural de Reggio Calabria, Itália, domiciliado e residente nesta Capital na Rua da Mooca n. 84, filho legítimo de Antonio Sorage e de Francisca Minniti, já fallecidos;
E DONA MARIA CARMELA MORABITO, solteira, de vinte e seis annos de idade, de profissão costureira, natural de Scilla, Província de Reggio Calabria, residente na mesma rua n. 92, filha legítima de Paschoal Morabito e de Teresa Periti.
Não havendo impedimento algum, foram solenemente declarados casados segundo as leis civis da República dos Estados Unidos do Brazil.
Testemunhas presentes: Vincenzo Lofredo, funileiro, e Giovanni Battista Rossi, alfaiate.`,
    transcriptionTranslation: `On the twenty-seventh day of the month of July of the year one thousand nine hundred and one, in this District of Mooca, judicial district of the Capital of the State of São Paulo.
In my registry appeared the contracting parties:
FORTUNATO SORAGE, bachelor, thirty years of age, shoemaker by trade, native of Reggio Calabria, Italy, domiciled and residing in this Capital at Rua da Mooca no. 84, legitimate son of Antonio Sorage and of Francisca Minniti, deceased;
AND DONA MARIA CARMELA MORABITO, spinster, twenty-six years of age, seamstress by profession, native of Scilla, Province of Reggio Calabria, residing on the same street at no. 92, legitimate daughter of Paschoal Morabito and of Teresa Periti.
There being no impediment, they were solemnly pronounced married according to the civil laws of the Republic of the United States of Brazil.
Present witnesses: Vincenzo Lofredo, tinsmith, and Giovanni Battista Rossi, tailor.`,
    paleographicCallouts: [
      {
        id: 'callout-marr-1',
        term: 'Consolidação de "Sorage"',
        termType: 'formula',
        lineReference: 'Line 4: "FORTUNATO SORAGE"',
        italianOriginal: 'Suraci ➔ Sorage',
        translation: 'Legal consolidation as Sorage',
        paleographicNote:
          'Set in formal calligraphic round hand by the Mooca civil registrar. This document represents the official legal fixation of "Sorage" for all subsequent Brazilian descendants.',
        historicalSignificance:
          'Crucial proof for Italian citizenship by descent (jure sanguinis): establishes direct continuity between Fortunato Suraci (Reggio Calabria 1871) and Fortunato Sorage (São Paulo 1901).',
      },
      {
        id: 'callout-marr-2',
        term: 'Endereço na Rua da Mooca',
        termType: 'witness',
        lineReference: 'Line 6: "...na Rua da Mooca n. 84..."',
        italianOriginal: 'Rua da Mooca 84',
        translation: 'Rua da Mooca 84, São Paulo',
        paleographicNote: 'Specifies residential address in the heart of the Italian immigrant enclave.',
        historicalSignificance:
          'Historical maps of São Paulo from 1905 show this building as a ground-floor bottega and upper-floor living quarters.',
      },
    ],
    fullCitation:
      'Cartório de Registro Civil das Pessoas Naturais do 2º Subdistrito da Mooca, São Paulo, Livro de Casamentos B-04, Folha 78v, Termo 312 (1901).',
  },
  {
    id: 'rec-cardillo-birth-1869',
    branch: 'cardillo',
    plateNumber: 'PLATE V · STATO CIVILE ITALIANO',
    title: 'Civil Birth Registration of Giovanni Cardillo',
    italianTitle: 'Atto di Nascita di Giovanni Cardillo (Anno 1869)',
    year: 1869,
    exactDate: '19 Ottobre 1869',
    recordType: 'birth',
    commune: 'Castelnuovo Cilento',
    provinceOrState: 'Salerno',
    country: 'Italy',
    archiveRepository: 'Archivio di Stato di Salerno - Sezione Stato Civile',
    archiveCallNumber: 'Comune di Castelnuovo Cilento, Registro Nati, Anno 1869, Atto n. 47',
    imagePath: '/imagens/archive_manuscript_plate.jpg',
    imageAlt: '19th century Italian birth act ledger from Archivio di Stato di Salerno',
    relatedPersonIds: ['cardillo-giovanni-1869', 'cardillo-gennaro-1838', 'deluca-filomena-1842'],
    summary:
      'Birth registration in the post-unification Italian civil registers of Castelnuovo Cilento for Giovanni Cardillo, declared by his father Gennaro Cardillo.',
    transcriptionOriginal: `Nel Comune di Castelnuovo Cilento, Circondario di Vallo della Lucania, Provincia di Salerno.
L'anno milleottocentosessantanove, il dì venti di Ottobre, ad ore nove antimeridiane, innanzi a Noi Sindaco ed Ufficiale dello Stato Civile:
È comparso Gennaro Cardillo, d'anni trentuno, bottaio, domiciliato in questo Comune, il quale ci ha presentato un maschio e dichiarato che lo stesso è nato il giorno diciannove del corrente mese ad ore due della notte, dalla sua legittima consorte Filomena De Luca, contadina, seco lui convivente, al quale dà il nome di GIOVANNI.
Testimoni: Antonio Di Matteo, sarto, e Pasquale Marotta, guardia campestre.`,
    transcriptionTranslation: `In the Commune of Castelnuovo Cilento, District of Vallo della Lucania, Province of Salerno.
In the year one thousand eight hundred sixty-nine, on the twentieth day of October, at nine o'clock in the morning, before Us Mayor and Civil Status Officer:
There appeared Gennaro Cardillo, aged thirty-one, cooper, domiciled in this Commune, who presented to us a male child and declared that he was born on the nineteenth day of the current month at two o'clock at night, to his legitimate wife Filomena De Luca, peasant, cohabiting with him, to whom he gives the name GIOVANNI.
Witnesses: Antonio Di Matteo, tailor, and Pasquale Marotta, rural guard.`,
    paleographicCallouts: [
      {
        id: 'callout-cb-1',
        term: 'Circondario di Vallo della Lucania',
        termType: 'formula',
        lineReference: 'Line 1: "...Circondario di Vallo della Lucania..."',
        italianOriginal: 'Circondario di Vallo della Lucania',
        translation: 'District of Vallo della Lucania',
        paleographicNote: 'Administrative division of the post-Risorgimento Kingdom of Italy.',
        historicalSignificance: 'Directs researchers to the regional notary archives located in Vallo della Lucania.',
      },
    ],
    fullCitation:
      'Archivio di Stato di Salerno, Stato Civile Italiano, Comune di Castelnuovo Cilento, Atti di Nascita, 1869, Atto n. 47.',
  },
  {
    id: 'rec-sorage-cardilo-marriage-1932',
    branch: 'unified',
    plateNumber: 'PLATE VI · PARISH & CIVIL UNION',
    title: 'Marriage Record of Paschoal Sorage and Concetta Cardillo',
    italianTitle: 'Assento de Matrimônio de Paschoal Sorage e Conchetta Cardilo (1932)',
    year: 1932,
    exactDate: '15 Outubro 1932',
    recordType: 'marriage',
    commune: 'São Paulo (Bixiga / Bela Vista)',
    provinceOrState: 'Estado de São Paulo',
    country: 'Brazil',
    archiveRepository: 'Arquivo da Paróquia Nossa Senhora da Achiropita & Cartório da Bela Vista',
    archiveCallNumber: 'Livro Matrimonial 09, Fl. 142, Termo 876',
    imagePath: '/imagens/immigrant_family_portrait.jpg',
    imageAlt: 'Historical studio portrait commemorating the Italian-Brazilian wedding in Bixiga',
    relatedPersonIds: ['sorage-paschoal-1904', 'cardillo-concetta-1908', 'sorage-renato-1938'],
    summary:
      'The genealogical keystroke uniting the two lineages: the marriage of Paschoal Sorage (son of Fortunato Suraci) and Concetta Cardillo (daughter of Giovanni Cardillo) in São Paulo.',
    transcriptionOriginal: `Paróquia de Nossa Senhora da Achiropita - Bairro da Bela Vista (Bixiga), São Paulo.
Aos quinze dias do mês de Outubro de mil novecentos e trinta e dois, feitas as denunciações canônicas sem impedimento:
Receberam-se em matrimônio PASCHOAL SORAGE, com vinte e oito anos, nascido na Mooca, mecânico da São Paulo Railway, filho legítimo de Fortunato Sorage e Carmela Morabito;
E CONCHETTA CARDILO, com vinte e três anos, nascida em Campinas, costureira, filha legítima de João Cardilo e Rosa Esposito.
Celebrante: Reverendo Padre Ciro de Angelis.
Padrinhos do noivo: Antonino Sorage e Teresa Sorage.
Padrinhos da noiva: Antonio Cardilho e Maria Esposito Rossi.`,
    transcriptionTranslation: `Parish of Our Lady of Achiropita - Bela Vista (Bixiga) District, São Paulo.
On the fifteenth day of the month of October of one thousand nine hundred and thirty-two, the canonical banns having been read without impediment:
Were united in matrimony PASCHOAL SORAGE, aged twenty-eight, born in Mooca, mechanic of the São Paulo Railway, legitimate son of Fortunato Sorage and Carmela Morabito;
AND CONCHETTA CARDILO, aged twenty-three, born in Campinas, seamstress, legitimate daughter of João Cardilo and Rosa Esposito.
Celebrant: Reverend Father Ciro de Angelis.
Groom's witnesses: Antonino Sorage and Teresa Sorage.
Bride's witnesses: Antonio Cardilho and Maria Esposito Rossi.`,
    paleographicCallouts: [
      {
        id: 'callout-union-1',
        term: 'Ortografia Flutuante dos Padrinhos',
        termType: 'phonetic_glitch',
        lineReference: 'Line 9: "Antonio Cardilho"',
        italianOriginal: 'Cardilo vs Cardilho',
        translation: 'Sibling spelled with LH while bride spelled with L',
        paleographicNote:
          'Remarkable orthographic proof: bride is registered as "Cardilo" in line 5, but her brother signs as "Antonio Cardilho" with LH in line 9.',
        historicalSignificance:
          'Proves in a single primary document that Cardilo and Cardilho are identical family lines, preventing confusion during citizenship or inheritance proofs.',
      },
    ],
    fullCitation:
      'Arquivo Metropolitano de São Paulo, Paróquia Nossa Senhora da Achiropita, Livro de Casamentos 09, 1932, Fl. 142.',
  },
];

export const migrationStages: MigrationStage[] = [
  {
    id: 'stage-1',
    stepNumber: '01',
    branch: 'suraci',
    year: '1871–1897',
    title: 'The Calabrian Cradle: Reggio & Aspromonte',
    locationName: 'Reggio Calabria & Scilla, Italy',
    coordinates: { x: 74, y: 32 },
    narrative:
      'The Suraci family resided for generations in the olive groves and stone masonry quarters of Reggio Calabria and Motta San Giovanni overlooking the Strait of Messina. By the late 1880s, phylloxera wiped out vineyards, and severe land tariffs prompted Fortunato Suraci to take the decision to seek passage overseas.',
    archivalSource: 'Archivio di Stato di Reggio Calabria (Stato Civile Nascita 1871)',
    historicalContext:
      'Calabria experienced intense emigration during the first phase of "La Grande Emigrazione", with over 600,000 leaving between 1880 and 1914.',
    keyActors: ['Antonino Suraci', 'Francesca Minniti', 'Fortunato Suraci'],
  },
  {
    id: 'stage-2',
    stepNumber: '02',
    branch: 'cardillo',
    year: '1869–1893',
    title: 'The Cilento Terraces: Castelnuovo & Salerno',
    locationName: 'Castelnuovo Cilento & Salerno, Italy',
    coordinates: { x: 70, y: 26 },
    narrative:
      'Giovanni Cardillo grew up in the rugged hills of Cilento (Salerno), where his father Gennaro made wine barrels. Contracted as agricultural laborers by Brazilian recruitment agents operating in Naples and Salerno, Giovanni and his young wife Rosa departed with tickets subsidized by the São Paulo State government.',
    archivalSource: 'Archivio di Stato di Salerno & Capitaneria di Porto di Genova',
    historicalContext:
      'The São Paulo government subsidized transatlantic fares to supply labor to replace enslaved workers after the 1888 abolition (Lei Áurea).',
    keyActors: ['Gennaro Cardillo', 'Giovanni Cardillo', 'Rosa Esposito'],
  },
  {
    id: 'stage-3',
    stepNumber: '03',
    branch: 'unified',
    year: '1893 / 1897',
    title: 'Transatlantic Crossing from Genoa',
    locationName: 'Piroscafo Italia & Piroscafo Caffaro (Ligurian Sea to Atlantic)',
    coordinates: { x: 52, y: 44 },
    narrative:
      'Both families traveled north to the great emigration port of Genoa. Giovanni Cardillo boarded the steamship Italia in September 1893; Fortunato Suraci boarded the Caffaro in 1897. The journey in steerage lasted 20 to 24 days across the Atlantic, weathering equatorial storms and rigid quarantine inspections.',
    archivalSource: 'Ruoli d’Imbarco della Regia Capitaneria di Genova (1893 / 1897)',
    historicalContext:
      'Steam propulsion reduced the Atlantic crossing from 45 days down to approximately 21 days, though steerage conditions remained cramped and austere.',
    keyActors: ['Giovanni Cardillo (1893)', 'Fortunato Suraci (1897)'],
  },
  {
    id: 'stage-4',
    stepNumber: '04',
    branch: 'unified',
    year: '1893 / 1897',
    title: 'Arrival at Santos & Hospedaria do Brás',
    locationName: 'Port of Santos & Hospedaria dos Imigrantes, São Paulo',
    coordinates: { x: 34, y: 72 },
    narrative:
      'Debarking at the quays of Santos, immigrants took the famous cog railway up the Serra do Mar (São Paulo Railway) to the mammoth Hospedaria dos Imigrantes in the Brás neighborhood of São Paulo. Here, surname phonetic mutations were officially penned into the registration ledgers: "Suraci" became "Sorage", and "Cardillo" became "Cardilho" and "Cardilo".',
    archivalSource: 'Museu da Imigração do Estado de São Paulo (Livros de Matrícula 038 e 044)',
    historicalContext:
      'Over 2.5 million immigrants passed through the Hospedaria do Brás, undergoing medical fumigation, food distribution, and contractual dispatch to coffee plantations.',
    keyActors: ['Fortunato Sorage', 'Giovanni Cardilho'],
  },
  {
    id: 'stage-5',
    stepNumber: '05',
    branch: 'unified',
    year: '1901–1932',
    title: 'Urban Synthesis: Mooca, Campinas & Bixiga',
    locationName: 'São Paulo (Mooca & Bela Vista / Bixiga) and Campinas',
    coordinates: { x: 28, y: 82 },
    narrative:
      'While the Cardillos worked on the coffee estates of Campinas before establishing masonry workshops, Fortunato Sorage established his artisan shoemaking bottega on Rua da Mooca. Their children, Paschoal Sorage and Concetta Cardillo, met in São Paulo and married at the Nossa Senhora da Achiropita church in Bixiga in 1932, intertwining the two genealogies.',
    archivalSource: 'Cartórios da Mooca e Bela Vista / Paróquia N. S. da Achiropita',
    historicalContext:
      'The Italian immigrants rapidly formed mutual aid societies, founded soccer clubs (like Palestra Italia / Palmeiras and Juventus da Mooca), and built the industrial fabric of São Paulo.',
    keyActors: ['Paschoal Sorage', 'Concetta Cardillo', 'Renato Sorage'],
  },
];

export const questLogEntries: QuestLogEntry[] = [
  {
    id: 'quest-01',
    code: 'QST-RC-01',
    branch: 'suraci',
    title: 'Locating Canonical Marriage of Antonino Suraci & Francesca Minniti (c. 1867)',
    status: 'investigating',
    targetPerson: 'Antonino Suraci & Francesca Minniti',
    primaryCommune: 'Reggio Calabria / Motta San Giovanni',
    hypothesis:
      'Antonino and Francesca married shortly before the birth of Fortunato (May 1871). Because civil registration in Southern Italy only became compulsory in 1866, the marriage could be recorded either in the first civil registers or in the parish registers of San Giovanni Evangelista in Motta San Giovanni.',
    currentFindings:
      'Scanned Portale Antenati for Reggio Calabria civil marriages 1866–1870. A promising index match for an Antonino Suraci appears in the 1868 decennial index, volume 4, page 32, but digital images for this specific volume are currently missing from the online portal.',
    archivesQueried: [
      {
        institution: 'Archivio di Stato di Reggio Calabria',
        protocolOrDate: 'Prot. 2024/0912-E',
        status: 'In Search',
      },
      {
        institution: 'Archivio Storico Diocesano di Reggio Calabria-Bova',
        protocolOrDate: 'Inquiry sent Oct 2024',
        status: 'Sent',
      },
    ],
    nextSteps:
      'Commission local researcher or await direct response from the Diocesan Archive regarding the Parrocchia di Spirito Santo marriage registers for 1867–1869.',
    lastUpdated: '18 Oct 2024',
  },
  {
    id: 'quest-02',
    code: 'QST-SA-02',
    branch: 'cardillo',
    title: 'Discrepancy in Birth Year for Giovanni Cardillo (1869 vs 1871 on ship)',
    status: 'resolved',
    targetPerson: 'Giovanni Cardillo',
    primaryCommune: 'Castelnuovo Cilento, Salerno',
    hypothesis:
      'The passenger list of the steamship Italia listed Giovanni Cardillo as age 24 in September 1893 (implying birth in 1869), whereas his Brazilian death declaration in Campinas cited age 68 in 1939 (implying birth in 1871).',
    currentFindings:
      'Solved! Located the original Atto di Nascita n. 47 in the 1869 civil register of Castelnuovo Cilento (Archivio di Stato di Salerno). Giovanni was indeed born on 19 October 1869. The later Brazilian death record simply suffered from an oral estimation by his surviving son.',
    archivesQueried: [
      {
        institution: 'Archivio di Stato di Salerno',
        protocolOrDate: 'Atti di Nascita 1869, Atto n. 47',
        status: 'Document Found',
      },
    ],
    nextSteps:
      'Annotate certified copy in family file and link to citizenship dossier to explain the minor two-year discrepancy.',
    lastUpdated: '12 Sep 2024',
  },
  {
    id: 'quest-03',
    code: 'QST-MS-03',
    branch: 'suraci',
    title: 'Tracing the Leva Militare (Conscription Draft) of Fortunato Suraci (Classe 1871)',
    status: 'awaiting_archive',
    targetPerson: 'Fortunato Suraci',
    primaryCommune: 'Distretto Militare di Reggio Calabria',
    hypothesis:
      'Fortunato was born in 1871 and would have been drafted into the Regio Esercito (Italian Royal Army) around 1891 (Classe 1871). The military draft roll (*Ruolo Matricolare*) typically records exact physical description (height, eye color, hair, scars) and literacy status before emigration.',
    currentFindings:
      'The Archivio di Stato di Reggio Calabria holds the *Liste di Leva* for the Circondario of Reggio. Draft list index confirms "Suraci Fortunato di Antonino e Minniti Francesca, n. 12 Maggio 1871", registered under volume 1871.',
    archivesQueried: [
      {
        institution: 'Archivio di Stato di Reggio Calabria - Sezione Militare',
        protocolOrDate: 'Request Req-7814/RC',
        status: 'In Search',
      },
    ],
    nextSteps:
      'Request high-resolution scan of the Foglio Matricolare to document his military service unit and physical description.',
    lastUpdated: '04 Nov 2024',
  },
  {
    id: 'quest-04',
    code: 'QST-BR-04',
    branch: 'cardillo',
    title: 'The "Cardilo" vs "Cardilho" Split in Early Campinas Cartórios (1898–1915)',
    status: 'resolved',
    targetPerson: 'Children of Giovanni Cardillo & Rosa Esposito',
    primaryCommune: 'Campinas, São Paulo',
    hypothesis:
      'Why did sibling Antonio sign as "Cardilho" while sister Concetta was baptized and registered as "Cardilo"? Did the family intentionally change it, or was it purely at the clerk’s discretion?',
    currentFindings:
      'Examined sequential registers at the 1º Cartório de Registro Civil de Campinas. Found that between 1898 and 1910, two different clerks alternated shifts: Clerk A (Silva) habitually wrote "Cardilo" with a single l, while Clerk B (Menezes) always transcribed Italian double-L names with "lh". The family, not reading Portuguese fluently at the time, accepted both spellings indiscriminately.',
    archivesQueried: [
      {
        institution: '1º Cartório de Registro Civil de Campinas',
        protocolOrDate: 'Searched in person / Certidões de Inteiro Teor',
        status: 'Document Found',
      },
    ],
    nextSteps:
      'Include paleographic comparison note in the encyclopedia article on orthographic shifts.',
    lastUpdated: '15 Oct 2024',
  },
  {
    id: 'quest-05',
    code: 'QST-RC-05',
    branch: 'suraci',
    title: 'Investigating Brick Wall: Parents of Antonino Suraci (c. 1810s)',
    status: 'brick_wall',
    targetPerson: 'Parents of Antonino Suraci (b. 1842)',
    primaryCommune: 'Reggio Calabria',
    hypothesis:
      'Antonino Suraci was born in 1842, prior to Italian unification, during the reign of Ferdinand II of Bourbon (Kingdom of the Two Sicilies). His birth must be recorded in the *Stato Civile della Restaurazione* (1816–1865) for Reggio Calabria.',
    currentFindings:
      'The decennial indices for Reggio for 1841–1850 list multiple Suraci boys named Antonino. Without the parents’ given names from a marriage record or death record, we cannot determine which 1842 entry is our direct ancestor.',
    archivesQueried: [
      {
        institution: 'Portale Antenati (MiC)',
        protocolOrDate: 'Stato Civile Borbonico 1842',
        status: 'In Search',
      },
    ],
    nextSteps:
      'Solve Quest QST-RC-01 first: finding Antonino’s marriage act will name his parents, instantly breaking through this brick wall.',
    lastUpdated: '01 Nov 2024',
  },
];
