export interface Waypoint {
  id: string;
  name: string;
  italianName?: string;
  brazilianName?: string;
  region: string;
  country: 'Italy' | 'Maritime' | 'Brazil';
  coordinates: [number, number]; // [longitude, latitude]
  branch: 'suraci' | 'cardillo' | 'both';
  decadeIntroduced: number; // e.g. 1870, 1890, 1930
  type: 'ancestral_origin' | 'port_of_departure' | 'at_sea' | 'port_of_arrival' | 'hostel' | 'coffee_fazenda' | 'urban_settlement';
  description: string;
  archivalFact: string;
  keyAncestors: string[];
  historicalRecordId?: string;
}

export interface DecadeMilestone {
  decade: number;
  label: string;
  periodSpan: string;
  theme: string;
  geographicLocus: 'Calabria & Campania' | 'Transatlantic Crossing' | 'Santos & Hospedaria do Brás' | 'Paulista Coffee Interior' | 'Mooca & Bixiga (São Paulo)' | 'Metropolitan Consolidation';
  historicalContext: string;
  suraciStatus: string;
  cardilloStatus: string;
  activeWaypointIds: string[];
  activeRouteProgress: number; // 0 to 100% progress of the migration journey
}

export const waypointsDatabase: Waypoint[] = [
  // Italy - Suraci Branch
  {
    id: 'wp-reggio-calabria',
    name: 'Reggio Calabria',
    italianName: 'Reggio di Calabria & Motta San Giovanni',
    region: 'Calabria, Southern Italy',
    country: 'Italy',
    coordinates: [15.65, 38.11],
    branch: 'suraci',
    decadeIntroduced: 1860,
    type: 'ancestral_origin',
    description:
      'The ancestral soil of the Suraci family. Antonino Suraci lived as a master stonecutter in the Spirito Santo quarter, terracing olive orchards facing the Strait of Messina.',
    archivalFact:
      'Documented in the 1871 birth register of Fortunato Suraci (Atto di Nascita n. 142, Archivio di Stato di Reggio Calabria).',
    keyAncestors: ['Antonino Suraci', 'Francesca Minniti', 'Fortunato Suraci'],
    historicalRecordId: 'rec-suraci-birth-1871',
  },
  {
    id: 'wp-scilla',
    name: 'Scilla',
    italianName: 'Scilla (Costa Viola)',
    region: 'Calabria, Italy',
    country: 'Italy',
    coordinates: [15.71, 38.25],
    branch: 'suraci',
    decadeIntroduced: 1870,
    type: 'ancestral_origin',
    description:
      'Picturesque cliffside coastal commune in the Strait of Messina. Birthplace of Maria Carmela Morabito (1875), wife of Fortunato Suraci.',
    archivalFact:
      'Parish of Maria Santissima Immacolata holds maternal ancestral baptismal entries dating to the early 1800s.',
    keyAncestors: ['Maria Carmela Morabito'],
  },

  // Italy - Cardillo Branch
  {
    id: 'wp-castelnuovo-cilento',
    name: 'Castelnuovo Cilento',
    italianName: 'Castelnuovo Cilento (Salerno)',
    region: 'Campania, Southern Italy',
    country: 'Italy',
    coordinates: [15.15, 40.19],
    branch: 'cardillo',
    decadeIntroduced: 1860,
    type: 'ancestral_origin',
    description:
      'Hillside fortress commune in the Cilento valleys where Gennaro Cardillo crafted wine casks and cooperage barrels. Birthplace of Giovanni Cardillo (1869).',
    archivalFact:
      'Archivio di Stato di Salerno holds Atto di Nascita n. 47 (Anno 1869) confirming birth on 19 October.',
    keyAncestors: ['Gennaro Cardillo', 'Filomena De Luca', 'Giovanni Cardillo'],
    historicalRecordId: 'rec-cardillo-birth-1869',
  },
  {
    id: 'wp-castellammare',
    name: 'Castellammare di Stabia',
    italianName: 'Castellammare di Stabia (Napoli)',
    region: 'Campania, Italy',
    country: 'Italy',
    coordinates: [14.48, 40.69],
    branch: 'cardillo',
    decadeIntroduced: 1870,
    type: 'ancestral_origin',
    description:
      'Coastal maritime city on the Gulf of Naples. Birthplace of Rosa Esposito (1873), who married Giovanni Cardillo before boarding for Brazil.',
    archivalFact:
      'Noted in the passenger manifest of the steamship Italia as spouse accompanying passenger Giovanni Cardillo.',
    keyAncestors: ['Rosa Esposito'],
  },

  // Italy - Genoa Port of Departure
  {
    id: 'wp-genova',
    name: 'Port of Genoa (Genova)',
    italianName: 'Porto di Genova - Capitaneria di Porto',
    region: 'Liguria, Italy',
    country: 'Italy',
    coordinates: [8.92, 44.41],
    branch: 'both',
    decadeIntroduced: 1890,
    type: 'port_of_departure',
    description:
      'The chief Mediterranean departure terminal for Italian transatlantic emigration. Giovanni Cardillo boarded the Piroscafo Italia here in September 1893; Fortunato Suraci boarded the Caffaro here in 1897.',
    archivalFact:
      'Passenger rolls preserved in the Archivio di Stato di Genova record subsidized steerage tickets issued by the São Paulo Immigration Society.',
    keyAncestors: ['Giovanni Cardillo (1893)', 'Fortunato Suraci (1897)'],
    historicalRecordId: 'rec-ship-manifest-1893',
  },

  // Atlantic Waypoint
  {
    id: 'wp-atlantic-equator',
    name: 'Mid-Atlantic Steerage Run',
    italianName: 'Rotta Transatlantica Equatoriale',
    region: 'Atlantic Ocean',
    country: 'Maritime',
    coordinates: [-24.5, 5.0],
    branch: 'both',
    decadeIntroduced: 1890,
    type: 'at_sea',
    description:
      'A grueling 20 to 24-day ocean crossing in third-class steerage (*stiva*), navigating equatorial doldrums and heavy trade swells aboard coal-fired steamships.',
    archivalFact:
      'Logbooks of the Piroscafo Italia recorded daily ship medical inspections for cholera and tropical fevers before nearing the Tropic of Capricorn.',
    keyAncestors: ['Fortunato Suraci', 'Giovanni Cardillo', 'Rosa Esposito'],
  },

  // Brazil - Port of Santos
  {
    id: 'wp-santos',
    name: 'Port of Santos',
    brazilianName: 'Porto de Santos - Cais de Desembarque',
    region: 'Litoral Paulista, Brazil',
    country: 'Brazil',
    coordinates: [-46.33, -23.96],
    branch: 'both',
    decadeIntroduced: 1890,
    type: 'port_of_arrival',
    description:
      'The oceanic gateway to São Paulo. Immigrants disembarked along the granite docks, cleared federal health quarantine, and boarded the British-built São Paulo Railway cog line.',
    archivalFact:
      'Arrivals registered in the Livro de Vapores da Inspetoria de Imigração do Porto de Santos (1893 e 1897).',
    keyAncestors: ['Fortunato Suraci', 'Giovanni Cardillo', 'Rosa Esposito'],
  },

  // Brazil - Hospedaria dos Imigrantes do Brás
  {
    id: 'wp-hospedaria-bras',
    name: 'Hospedaria dos Imigrantes (Brás)',
    brazilianName: 'Hospedaria do Brás, São Paulo',
    region: 'Capital de São Paulo, Brazil',
    country: 'Brazil',
    coordinates: [-46.61, -23.54],
    branch: 'both',
    decadeIntroduced: 1890,
    type: 'hostel',
    description:
      'Mammoth state immigration pavilion where over 2.5 million immigrants were quarantined, fed, and registered. Here, clerk transcription phonetically altered "Suraci" to "Sorage" and "Cardillo" to "Cardilho".',
    archivalFact:
      'Matrícula de Imigrantes Livro 044, fl. 89: "Giovanni Cardilho, italiano, 24 annos, destinado à Fazenda Santa Gertrudes".',
    keyAncestors: ['Fortunato Sorage', 'Giovanni Cardilho', 'Carmela Morabito'],
    historicalRecordId: 'rec-hospedaria-cardillo-1893',
  },

  // Brazil - Fazenda Santa Gertrudes / Campinas
  {
    id: 'wp-campinas-fazenda',
    name: 'Fazenda Santa Gertrudes & Campinas',
    brazilianName: 'Campinas & Santa Gertrudes (Cordeirópolis)',
    region: 'Interior Paulista, Brazil',
    country: 'Brazil',
    coordinates: [-47.06, -22.90],
    branch: 'cardillo',
    decadeIntroduced: 1890,
    type: 'coffee_fazenda',
    description:
      'Giovanni Cardillo worked for four agricultural seasons under colono coffee contract on the expansive plantations before relocating to Campinas as a master mason.',
    archivalFact:
      '1º Cartório de Registro Civil de Campinas holds birth records of their children alternating between "Cardilo" and "Cardilho".',
    keyAncestors: ['Giovanni Cardillo', 'Rosa Esposito', 'Antonio Cardilho', 'Concetta Cardillo'],
  },

  // Brazil - Bairro da Mooca
  {
    id: 'wp-mooca',
    name: 'Bairro da Mooca',
    brazilianName: 'Bairro da Mooca, São Paulo',
    region: 'Capital de São Paulo, Brazil',
    country: 'Brazil',
    coordinates: [-46.59, -23.56],
    branch: 'suraci',
    decadeIntroduced: 1900,
    type: 'urban_settlement',
    description:
      'The industrial and cultural epicenter of Italian São Paulo. Fortunato Sorage founded an artisan cordwainer workshop on Rua da Mooca, crafting handcrafted leather shoes.',
    archivalFact:
      'Civil Marriage Termo n. 312 (1901) at the Cartório da Mooca officially registered the bridegroom as "Fortunato Sorage, natural de Reggio Calabria".',
    keyAncestors: ['Fortunato Sorage', 'Maria Carmela Morabito', 'Paschoal Sorage'],
    historicalRecordId: 'rec-sorage-marriage-1901',
  },

  // Brazil - Bela Vista / Bixiga (The Union)
  {
    id: 'wp-bixiga-union',
    name: 'Bela Vista / Bixiga (The Historic Union)',
    brazilianName: 'Paróquia N. S. da Achiropita, Bixiga, São Paulo',
    region: 'Capital de São Paulo, Brazil',
    country: 'Brazil',
    coordinates: [-46.64, -23.55],
    branch: 'both',
    decadeIntroduced: 1930,
    type: 'urban_settlement',
    description:
      'The vibrant neighborhood where Paschoal Sorage (railway machinist, son of Fortunato) married Concetta Cardillo in 1932, intertwining both family trajectories.',
    archivalFact:
      'Matrimonial Register of Paróquia da Achiropita (1932, Fl. 142) records witnesses from both the Mooca and Campinas branches.',
    keyAncestors: ['Paschoal Sorage', 'Concetta Cardillo', 'Renato Sorage'],
    historicalRecordId: 'rec-sorage-cardilo-marriage-1932',
  },
];

export const decadeMilestones: DecadeMilestone[] = [
  {
    decade: 1860,
    label: '1860s',
    periodSpan: '1860–1869',
    theme: 'Risorgimento & Southern Italian Roots',
    geographicLocus: 'Calabria & Campania',
    historicalContext:
      'The Kingdom of the Two Sicilies is annexed into the unified Kingdom of Italy (1861). The Southern agrarian economy faces rising land taxes and trade dislocations. Patriarchs Antonino Suraci (Calabria) and Gennaro Cardillo (Campania) work in stone masonry and barrel-making.',
    suraciStatus:
      'Antonino Suraci marries Francesca Minniti in Motta San Giovanni / Reggio Calabria, terracing family olive orchards.',
    cardilloStatus:
      'Gennaro Cardillo and Filomena De Luca live in Castelnuovo Cilento. Giovanni Cardillo is born on 19 October 1869.',
    activeWaypointIds: ['wp-reggio-calabria', 'wp-castelnuovo-cilento'],
    activeRouteProgress: 5,
  },
  {
    decade: 1870,
    label: '1870s',
    periodSpan: '1870–1879',
    theme: 'Birth of the Emigrant Generation',
    geographicLocus: 'Calabria & Campania',
    historicalContext:
      'Stato Civile Italiano compulsory civil registration is instituted across Southern Italy. The future transatlantic emigrants are born into artisan and agrarian peasant families.',
    suraciStatus:
      'Fortunato Suraci is born on 12 May 1871 in the Spirito Santo quarter of Reggio Calabria (Atto n. 142).',
    cardilloStatus:
      'Giovanni Cardillo attends village trade apprenticeships in Cilento; Rosa Esposito is born in Castellammare (1873).',
    activeWaypointIds: ['wp-reggio-calabria', 'wp-scilla', 'wp-castelnuovo-cilento', 'wp-castellammare'],
    activeRouteProgress: 10,
  },
  {
    decade: 1880,
    label: '1880s',
    periodSpan: '1880–1889',
    theme: 'Agrarian Crisis & Brazilian Subsidies',
    geographicLocus: 'Calabria & Campania',
    historicalContext:
      'Severe agricultural depression and the phylloxera epidemic strike Southern Italian vineyards. Concurrently in Brazil, the 1888 Golden Law (Lei Áurea) abolishes slavery, leading the São Paulo government to aggressively recruit and subsidize European immigrant farm families.',
    suraciStatus:
      'Fortunato Suraci completes mandatory military conscription (*Leva Militare*) in the Italian Royal Army in Calabria.',
    cardilloStatus:
      'Giovanni Cardillo reaches adulthood in Cilento; family receives informational gazettes from recruitment agents in Salerno.',
    activeWaypointIds: ['wp-reggio-calabria', 'wp-castelnuovo-cilento'],
    activeRouteProgress: 18,
  },
  {
    decade: 1890,
    label: '1890s',
    periodSpan: '1890–1899',
    theme: 'La Grande Emigrazione & The Crossing',
    geographicLocus: 'Transatlantic Crossing',
    historicalContext:
      'Peak transatlantic migration decade. Families take trains north to Genoa to board steerage on steamships. The crossing takes 22 days to reach Santos, followed by ascent up the Serra do Mar railway to the Hospedaria do Brás in São Paulo.',
    suraciStatus:
      'Fortunato Suraci departs Genoa on the Piroscafo Caffaro (1897). Registered at Hospedaria do Brás as "Fortunato Sorage".',
    cardilloStatus:
      'Giovanni Cardillo and wife Rosa Esposito sail on the Piroscafo Italia (September 1893). Processed as "Giovanni Cardilho" and dispatched to Fazenda Santa Gertrudes.',
    activeWaypointIds: ['wp-genova', 'wp-atlantic-equator', 'wp-santos', 'wp-hospedaria-bras', 'wp-campinas-fazenda'],
    activeRouteProgress: 55,
  },
  {
    decade: 1900,
    label: '1900s',
    periodSpan: '1900–1909',
    theme: 'Early Settlement: Coffee & Workshops',
    geographicLocus: 'Santos & Hospedaria do Brás',
    historicalContext:
      'The families transition from subsidized agricultural labor into urban trades. The Italian community in São Paulo forms mutual-aid societies, dialect newspapers (*Fanfulla*), and artisan craft cooperatives.',
    suraciStatus:
      'Fortunato Sorage marries Carmela Morabito in Mooca (1901) and opens an artisan shoe workshop on Rua da Mooca. Son Paschoal is born in 1904.',
    cardilloStatus:
      'The Cardillos transition from the coffee fazenda into the city of Campinas. Giovanni becomes a master builder (*mestre de obras*). Daughter Concetta is born in 1908.',
    activeWaypointIds: ['wp-mooca', 'wp-campinas-fazenda'],
    activeRouteProgress: 75,
  },
  {
    decade: 1910,
    label: '1910s–20s',
    periodSpan: '1910–1929',
    theme: 'Urban Industrialization & Railway Guilds',
    geographicLocus: 'Mooca & Bixiga (São Paulo)',
    historicalContext:
      'São Paulo undergoes explosive industrial growth. Italian-Brazilian youth enter the railways, textile mills, and municipal works. Children grow up fluent in Portuguese while speaking Italian dialect at the dinner table.',
    suraciStatus:
      'Paschoal Sorage trains as an apprentice machinist and joins the prestigious São Paulo Railway (SPR) company at Paranapiacaba.',
    cardilloStatus:
      'Antonio Cardilho establishes a contracting firm in Campinas; sister Concetta moves to São Paulo capital to teach and embroider.',
    activeWaypointIds: ['wp-mooca', 'wp-campinas-fazenda'],
    activeRouteProgress: 88,
  },
  {
    decade: 1930,
    label: '1930s',
    periodSpan: '1930–1939',
    theme: 'The Historic Union in Bixiga (1932)',
    geographicLocus: 'Mooca & Bixiga (São Paulo)',
    historicalContext:
      'Amidst the Constitutionalist Revolution of 1932 in São Paulo, the two family branches meet. Paschoal Sorage and Concetta Cardillo wed at the Italian parish of Nossa Senhora da Achiropita in Bixiga, uniting Calabrian and Campanian lineages.',
    suraciStatus:
      'Paschoal Sorage signs civil marriage record as groom, celebrated alongside railway colleagues from Mooca.',
    cardilloStatus:
      'Concetta Cardillo marries Paschoal. Sibling Antonio Cardilho signs as official matrimonial witness in Bixiga.',
    activeWaypointIds: ['wp-bixiga-union', 'wp-mooca'],
    activeRouteProgress: 95,
  },
  {
    decade: 1940,
    label: '1940s+',
    periodSpan: '1940–Present',
    theme: 'Generational Legacy & Archival Quests',
    geographicLocus: 'Metropolitan Consolidation',
    historicalContext:
      'Descendant generations graduate from Brazilian universities into engineering, public service, and arts. The family preserves original ship tickets, naturalization deeds, and letters that form the basis for today’s genealogical inquiries.',
    suraciStatus:
      'Renato Sorage (b. 1938) graduates in civil engineering, fostering family oral history and documenting the Calabrian links.',
    cardilloStatus:
      'Descendants preserve verified evidence proving the orthographic equivalence between Cardillo, Cardilo, and Cardilho.',
    activeWaypointIds: ['wp-bixiga-union', 'wp-reggio-calabria', 'wp-castelnuovo-cilento'],
    activeRouteProgress: 100,
  },
];

// Simplified coastal GeoJSON geometry for the Atlantic Basin (Europe, W. Africa, Brazil, Mediterranean)
export const atlanticBasinLandGeoJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // South America / Brazil eastern seaboard
    {
      type: 'Feature',
      properties: { name: 'South America' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-35.0, -5.0],
            [-34.8, -7.5],
            [-35.5, -9.5],
            [-38.5, -13.0],
            [-39.0, -15.5],
            [-40.0, -19.5],
            [-41.0, -22.0],
            [-43.2, -23.0],
            [-46.3, -24.0], // Santos
            [-48.5, -25.5],
            [-50.0, -28.0],
            [-52.0, -32.0],
            [-53.5, -34.0],
            [-56.0, -35.0],
            [-58.5, -34.5],
            [-60.0, -30.0],
            [-58.0, -25.0],
            [-54.0, -20.0],
            [-50.0, -15.0],
            [-48.0, -10.0],
            [-45.0, -5.0],
            [-44.0, -2.5],
            [-41.5, -2.8],
            [-38.5, -3.7],
            [-35.0, -5.0],
          ],
        ],
      },
    },
    // Western Europe & Mediterranean (Italy, France, Spain, Portugal)
    {
      type: 'Feature',
      properties: { name: 'Western Europe' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.5, 37.0], // SW Portugal
            [-9.0, 39.5],
            [-8.5, 42.0],
            [-9.0, 43.5], // NW Spain
            [-4.5, 43.5],
            [-1.5, 43.5],
            [-1.2, 46.0], // France Biscay
            [-4.5, 48.5], // Brittany
            [-1.5, 49.5],
            [1.5, 50.5],
            [3.0, 51.5],
            [5.0, 49.0],
            [7.5, 47.5],
            [8.5, 46.0],
            [8.9, 44.4], // Genoa
            [10.0, 43.5], // Tuscany
            [12.5, 41.9], // Rome
            [14.5, 40.8], // Naples
            [15.1, 40.2], // Salerno / Cilento
            [15.8, 39.5], // Calabria
            [15.65, 38.1], // Reggio Calabria (Toe of Italy)
            [16.5, 38.0],
            [17.0, 39.0],
            [17.0, 40.5], // Taranto
            [18.5, 40.2], // Otranto
            [16.0, 41.5], // Bari
            [14.0, 42.5],
            [12.5, 44.5], // Venice gulf
            [11.0, 45.5],
            [7.0, 44.0], // Nice / French Riviera
            [5.0, 43.3], // Marseille
            [3.0, 42.5],
            [2.0, 41.5], // Barcelona
            [0.0, 40.0],
            [-0.5, 38.5],
            [-2.5, 36.8],
            [-5.5, 36.0], // Gibraltar
            [-6.5, 36.5], // Cadiz
            [-7.5, 37.0],
            [-9.5, 37.0],
          ],
        ],
      },
    },
    // Sicily
    {
      type: 'Feature',
      properties: { name: 'Sicily' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [15.6, 38.2], // Messina
            [15.1, 37.5], // Catania
            [15.3, 36.6], // Syracuse
            [14.2, 37.0],
            [12.5, 37.6], // Marsala
            [12.5, 38.1], // Trapani
            [13.4, 38.1], // Palermo
            [15.6, 38.2],
          ],
        ],
      },
    },
    // Western / Northern Africa (Morocco, Mauritania, Senegal, Gulf of Guinea)
    {
      type: 'Feature',
      properties: { name: 'North & West Africa' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-5.5, 35.8], // Tangier
            [-6.8, 34.0], // Rabat
            [-9.5, 30.5], // Agadir
            [-13.0, 27.5],
            [-16.5, 21.0], // Cap Blanc
            [-16.5, 16.0], // Senegal
            [-17.5, 14.7], // Dakar / Cap-Vert
            [-16.5, 12.0],
            [-13.5, 9.5],
            [-11.5, 7.0],
            [-7.5, 4.5], // Liberia
            [-3.0, 5.0],
            [1.0, 6.0],
            [5.0, 4.5],
            [8.5, 4.0],
            [10.0, 10.0],
            [12.0, 20.0],
            [15.0, 30.0],
            [10.5, 37.0], // Tunisia
            [8.5, 37.0],
            [3.0, 36.8], // Algiers
            [-1.0, 35.8], // Oran
            [-5.5, 35.8],
          ],
        ],
      },
    },
  ],
};
