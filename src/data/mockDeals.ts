import {
  Startup,
  StartupAnalysis,
  FinancialModel,
  ValuationEstimate,
  DueDiligenceItem,
  InvestmentPortfolio,
  Contact,
  Interaction,
  Task,
} from '../types';

export const INITIAL_DEMO_STARTUPS: Startup[] = [
  {
    id: 'startup-syn-01',
    name: 'Synthetix Health',
    sector: 'HealthTech & IA Clinique',
    stage: 'Série A',
    country: 'France',
    city: 'Paris',
    website: 'https://synthetixhealth.example.com',
    foundedYear: 2023,
    description: 'Plateforme d\'aide au diagnostic oncologique par vision par ordinateur et modèles multimodaux certifiés CE Médical Classe IIa.',
    valueProposition: 'Réduction de 45% du temps d\'analyse anatomo-pathologique et détection précoce des micro-métastases avec 98.4% de sensibilité.',
    founders: [
      {
        name: 'Dr. Camille Laurent',
        role: 'CEO & Co-fondatrice',
        email: 'camille@synthetixhealth.example.com',
        linkedin: 'https://linkedin.com/in/camille-laurent-md',
        bio: 'Ancienne cheffe de clinique AP-HP, PhD en imagerie médicale (ENS Paris).'
      },
      {
        name: 'Alexandre Meyer',
        role: 'CTO & Co-fondateur',
        email: 'alexandre@synthetixhealth.example.com',
        linkedin: 'https://linkedin.com/in/alex-meyer-ai',
        bio: 'Ex-Lead Research Scientist chez Inria & DeepMind Health.'
      }
    ],
    targetAmount: 4000000,
    valuationAsked: 18000000,
    currency: 'EUR',
    pipelineStage: 'due_diligence',
    followUpDate: '2026-11-05',
    leadPartner: 'Marc de Saint-Ange',
    confidentialNotes: 'Points d\'attention : négociation des accords de données avec les CHU de Lyon et Bordeaux. Brevet européen délivré en mai 2025. Co-investisseur potentiel : Eurazeo Growth.',
    tags: ['MedTech', 'IA Diagnostique', 'Oncologie', 'CE Mark'],
    createdAt: '2026-08-14T10:00:00Z',
    updatedAt: '2026-10-20T14:30:00Z',
  },
  {
    id: 'startup-aur-02',
    name: 'Aura Climate Systems',
    sector: 'ClimateTech & MRV',
    stage: 'Seed',
    country: 'Suisse',
    city: 'Lausanne',
    website: 'https://auraclimate.example.com',
    foundedYear: 2024,
    description: 'Système IoT et logiciel de mesure, reporting et vérification (MRV) continue des puits de carbone géologiques et agricoles.',
    valueProposition: 'Certification temps réel des crédits carbone haute intégrité avec audit cryptographique inaltérable.',
    founders: [
      {
        name: 'Elena Rossi',
        role: 'CEO',
        email: 'elena@auraclimate.example.com',
        linkedin: 'https://linkedin.com/in/elena-rossi-climate',
        bio: 'Diplômée EPFL, ex-consultante senior carbone chez McKinsey Sustainability.'
      }
    ],
    targetAmount: 2000000,
    valuationAsked: 8500000,
    currency: 'EUR',
    pipelineStage: 'analyse_preliminaire',
    followUpDate: '2026-11-12',
    leadPartner: 'Sarah Benali',
    confidentialNotes: 'Très forte traction en Suisse romande et Allemagne. Dépendance initiale à 2 gros clients industriels (Holcim, BASF).',
    tags: ['Carbon Removal', 'IoT', 'B2B SaaS', 'ESG'],
    createdAt: '2026-09-01T09:15:00Z',
    updatedAt: '2026-10-18T16:00:00Z',
  },
  {
    id: 'startup-kin-03',
    name: 'Kinetix Robotics',
    sector: 'DeepTech / Robotique',
    stage: 'Série B',
    country: 'Allemagne',
    city: 'Munich',
    website: 'https://kinetixrobotics.example.com',
    foundedYear: 2021,
    description: 'Bras robotiques collaboratifs légers à guidage proprioceptif pour lignes d\'assemblage haute cadence pharmaceutique et aéronautique.',
    valueProposition: 'Intégration en moins de 4 heures sans cage de sécurité, payback client inférieur à 9 mois.',
    founders: [
      {
        name: 'Hans Becker',
        role: 'CEO & Founder',
        email: 'hans@kinetixrobotics.example.com',
        linkedin: 'https://linkedin.com/in/hans-becker-tum',
        bio: 'Docteur TU Munich, 12 ans chez Kuka Robotics.'
      }
    ],
    targetAmount: 12000000,
    valuationAsked: 48000000,
    currency: 'EUR',
    pipelineStage: 'investi',
    leadPartner: 'Marc de Saint-Ange',
    confidentialNotes: 'Participation souscrite au tour Série B (€3.5M investis). Représentation au board active.',
    tags: ['Hardware', 'Robotique Industrielle', 'Manufacturing 4.0'],
    createdAt: '2025-03-10T11:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
  },
  {
    id: 'startup-pay-04',
    name: 'PayPulse Embedded',
    sector: 'FinTech B2B',
    stage: 'Pre-seed',
    country: 'Royaume-Uni',
    city: 'Londres',
    website: 'https://paypulse.example.com',
    foundedYear: 2025,
    description: 'API d\'orchestration des flux de paiement instantané transfrontaliers B2B adossée à l\'infrastructure SEPA Instant et FedNow.',
    valueProposition: 'Règlement B2B en moins de 3 secondes avec conversion FX dynamique et frais divisés par 3.',
    founders: [
      {
        name: 'Liam Vance',
        role: 'CEO',
        email: 'liam@paypulse.example.com',
        bio: 'Ex-Revolut Business product lead.'
      }
    ],
    targetAmount: 900000,
    valuationAsked: 3800000,
    currency: 'EUR',
    pipelineStage: 'rencontre',
    followUpDate: '2026-11-02',
    leadPartner: 'Sarah Benali',
    confidentialNotes: 'Discussion prévue le 2 novembre avec les deux co-fondateurs techniques. Valider la licence EMI britannique.',
    tags: ['Paiement B2B', 'Fintech', 'API', 'Open Banking'],
    createdAt: '2026-10-05T14:20:00Z',
    updatedAt: '2026-10-25T11:10:00Z',
  }
];

export const INITIAL_DEMO_ANALYSES: Record<string, StartupAnalysis> = {
  'startup-syn-01': {
    startupId: 'startup-syn-01',
    criteria: [
      { id: 'c1', name: 'Qualité et complémentarité de l\'équipe fondatrice', weight: 15, score: 9.5, rationale: 'Duo médecin-chercheuse + chercheur DeepMind d\'un niveau exceptionnel.', category: 'equipe' },
      { id: 'c2', name: 'Taille et dynamique du marché cible (TAM / SAM)', weight: 10, score: 8.5, rationale: 'Marché mondial de la pathologie digitale en croissance de 18% par an.', category: 'marche' },
      { id: 'c3', name: 'Différenciation produit & barrières technologiques / IP', weight: 12, score: 9.0, rationale: 'Brevet européen délivré, données d\'entraînement exclusives issues de 4 centres hospitaliers.', category: 'produit' },
      { id: 'c4', name: 'Traction commerciale & vélocité des ventes', weight: 10, score: 7.5, rationale: '8 CHU sous contrat annuel payant, 14 en phase pilote active.', category: 'traction' },
      { id: 'c5', name: 'Revenus récurrents (ARR) & rétention brute/nette', weight: 10, score: 8.0, rationale: 'ARR actuel à 1.8M€, NRR de 128% grâce à l\'extension par service hospitalier.', category: 'finance' },
      { id: 'c6', name: 'Marge brute et économie unitaire (CAC/LTV)', weight: 8, score: 8.5, rationale: 'Marge brute de 79%, ratio LTV/CAC supérieur à 4.2x.', category: 'finance' },
      { id: 'c7', name: 'Consommation de trésorerie (Burn Rate) & runway', weight: 8, score: 7.0, rationale: 'Burn mensuel stable à 110k€, runway restant de 14 mois avant nouveau tour.', category: 'finance' },
      { id: 'c8', name: 'Durée de trésorerie disponible et discipline budgétaire', weight: 7, score: 7.5, rationale: 'Excellente rigueur sur les embauches R&D.', category: 'finance' },
      { id: 'c9', name: 'Intensité concurrentielle et positionnement', weight: 7, score: 7.0, rationale: 'Concurrence américaine (Paige.ai, PathAI) forte mais absente sur les spécificités réglementaires UE.', category: 'marche' },
      { id: 'c10', name: 'Risques réglementaires, juridiques et IP', weight: 7, score: 8.0, rationale: 'Certification CE Médical Classe IIa déjà validée auprès de l\'organisme notifié.', category: 'risque' },
      { id: 'c11', name: 'Capacité d\'exécution opérationnelle', weight: 6, score: 8.5, rationale: 'Jalons techniques délivrés avec 1 mois d\'avance sur la roadmap 2025.', category: 'equipe' },
      { id: 'c12', name: 'Adéquation avec la thèse d\'investissement du fonds', weight: 0, score: 9.0, rationale: 'Cœur de cible de notre poche HealthTech & DeepTech souveraine.', category: 'produit' },
    ],
    compositeScore: 83.2,
    thesisFit: 'Excellente opportunité DeepTech / MedTech souveraine européenne avec barrière réglementaire franchie.',
    keyStrengths: [
      'Double expertise clinique et IA de classe mondiale',
      'Marquage CE Médical Classe IIa obtenu',
      'Données d\'entraînement exclusives sous conventions hospitalières'
    ],
    keyWeaknesses: [
      'Cycles de vente hospitaliers relativement longs (6 à 9 mois)',
      'Intensité des besoins en calcul GPU lors de l\'inférence à grande échelle'
    ],
    regulatoryTechRisks: 'Modifications futures de l\'AI Act européen pour les systèmes médicaux à haut risque (anticiper la documentation technique continue).',
    recommendation: 'favorable',
    recommendationNotes: 'Recommandation de soumission au comité d\'investissement pour un ticket de 2M€ en co-lead avec Eurazeo.',
    analyzedAt: '2026-10-15T15:00:00Z',
  }
};

export const INITIAL_DEMO_FINANCIALS: Record<string, FinancialModel> = {
  'startup-syn-01': {
    startupId: 'startup-syn-01',
    currency: 'EUR',
    scenario: 'central',
    annualData: [
      {
        year: 2024,
        isForecast: false,
        revenue: 820000,
        arr: 950000,
        cogs: 180000,
        grossMargin: 640000,
        grossMarginPercent: 78.0,
        opexRAndD: 750000,
        opexSalesMarketing: 380000,
        opexGA: 160000,
        totalOpex: 1290000,
        ebitda: -650000,
        cashBalance: 2400000,
        monthlyBurn: 85000,
        runwayMonths: 28,
      },
      {
        year: 2025,
        isForecast: false,
        revenue: 1650000,
        arr: 1800000,
        cogs: 340000,
        grossMargin: 1310000,
        grossMarginPercent: 79.4,
        opexRAndD: 1200000,
        opexSalesMarketing: 850000,
        opexGA: 260000,
        totalOpex: 2310000,
        ebitda: -1000000,
        cashBalance: 1540000,
        monthlyBurn: 110000,
        runwayMonths: 14,
      },
      {
        year: 2026,
        isForecast: true,
        revenue: 3800000,
        arr: 4200000,
        cogs: 720000,
        grossMargin: 3080000,
        grossMarginPercent: 81.0,
        opexRAndD: 2100000,
        opexSalesMarketing: 1650000,
        opexGA: 450000,
        totalOpex: 4200000,
        ebitda: -1120000,
        cashBalance: 4420000, // Post levée
        monthlyBurn: 145000,
        runwayMonths: 30,
      },
      {
        year: 2027,
        isForecast: true,
        revenue: 8100000,
        arr: 8900000,
        cogs: 1450000,
        grossMargin: 6650000,
        grossMarginPercent: 82.1,
        opexRAndD: 3200000,
        opexSalesMarketing: 2900000,
        opexGA: 750000,
        totalOpex: 6850000,
        ebitda: -200000,
        cashBalance: 2680000,
        monthlyBurn: 80000,
        runwayMonths: 33,
      },
      {
        year: 2028,
        isForecast: true,
        revenue: 15400000,
        arr: 16800000,
        cogs: 2600000,
        grossMargin: 12800000,
        grossMarginPercent: 83.1,
        opexRAndD: 4500000,
        opexSalesMarketing: 4800000,
        opexGA: 1200000,
        totalOpex: 10500000,
        ebitda: 2300000,
        cashBalance: 4980000,
        monthlyBurn: 0,
        runwayMonths: 999, // Cash flow positif
      }
    ],
    growthHypothesis: 'Triplement du nombre de CHU équipés (France, Allemagne, Benelux) consécutif au déploiement du réseau de distribution certifié.',
    notes: 'Hypothèse prudente retenant un churn hospitalier annuel de 3% et un coût d\'infrastructure cloud optimisé par clusters dédiés.',
    lastUpdated: '2026-10-16T11:00:00Z',
  }
};

export const INITIAL_DEMO_VALUATIONS: Record<string, ValuationEstimate[]> = {
  'startup-syn-01': [
    {
      id: 'val-syn-mult-01',
      startupId: 'startup-syn-01',
      method: 'multiples_revenue',
      methodLabel: 'Multiples de Revenus / ARR comparables',
      calculatedPreMoney: 16200000,
      calculatedPostMoney: 20200000,
      targetRaise: 4000000,
      lowEstimate: 14400000,
      highEstimate: 19800000,
      assumptions: {
        arrBase: 1800000,
        multipleLow: 8.0,
        multipleMedian: 9.0,
        multipleHigh: 11.0,
        sectorBenchmark: 'B2B Healthcare AI SaaS Europe'
      },
      evaluationDate: '2026-10-15',
      limitations: 'Les multiples de marché reflètent l\'environnement actuel des levées Série A en santé digitale en Europe de l\'Ouest.'
    },
    {
      id: 'val-syn-vc-02',
      startupId: 'startup-syn-01',
      method: 'vc_method',
      methodLabel: 'Méthode VC (First Chicago / VC Method)',
      calculatedPreMoney: 17150000,
      calculatedPostMoney: 21150000,
      targetRaise: 4000000,
      lowEstimate: 15200000,
      highEstimate: 19500000,
      assumptions: {
        exitHorizonYears: 5,
        targetExitValuation: 120000000,
        targetROI: 7.0, // 7x MOIC
        futureDilutionPercent: 25.0
      },
      evaluationDate: '2026-10-15',
      limitations: 'Hypothèse de sortie industrielle vers un acteur majeur de l\'imagerie (Philips, Siemens Healthineers, Roche Diagnostics).'
    },
    {
      id: 'val-syn-dcf-03',
      startupId: 'startup-syn-01',
      method: 'dcf',
      methodLabel: 'Flux de Trésorerie Actualisés (DCF)',
      calculatedPreMoney: 15800000,
      calculatedPostMoney: 19800000,
      targetRaise: 4000000,
      lowEstimate: 13500000,
      highEstimate: 18200000,
      assumptions: {
        waccDiscountRate: 22.0, // Taux d'actualisation venture
        terminalGrowthRate: 3.5,
        projectionYears: 5
      },
      evaluationDate: '2026-10-15',
      limitations: 'Sensible aux hypothèses de cash-flow sur les années 4 et 5 et au taux d\'actualisation élevé adapté au risque startup.'
    }
  ]
};

export const INITIAL_DEMO_DUE_DILIGENCE: Record<string, DueDiligenceItem[]> = {
  'startup-syn-01': [
    {
      id: 'dd-syn-1',
      startupId: 'startup-syn-01',
      category: 'corporate_capital',
      categoryLabel: 'Société & Actionnariat',
      title: 'Table de capitalisation et pacte d\'actionnaires Seed',
      description: 'Vérifier la répartition du capital, les BSPCE attribués et les droits de véto existants.',
      status: 'valide',
      riskLevel: 'faible',
      findings: 'Cap table propre : fondateurs à 78%, business angels 14%, pool BSPCE 8%. Aucun droit bloquant anormal.',
      verifiedAt: '2026-10-10'
    },
    {
      id: 'dd-syn-2',
      startupId: 'startup-syn-01',
      category: 'finances_audit',
      categoryLabel: 'Finances & Comptabilité',
      title: 'Revue des états financiers 2024 et 2025 (P&L, Cash Flow)',
      description: 'Audit des revenus récurrents, reconnaissance du revenu selon IFRS 15 et passifs fiscaux/sociaux.',
      status: 'valide',
      riskLevel: 'faible',
      findings: 'Comptes certifiés par KPMG. Rapprochement bancaire conforme à l\'euro près.',
      verifiedAt: '2026-10-12'
    },
    {
      id: 'dd-syn-3',
      startupId: 'startup-syn-01',
      category: 'produit_tech',
      categoryLabel: 'Produit & Architecture Technique',
      title: 'Audit de la dette technique, scalabilité GPU et dépendances open source',
      description: 'Revue de code, sécurité de l\'infrastructure Kubernetes et licences des modèles sources.',
      status: 'en_cours',
      riskLevel: 'moyen',
      findings: 'Revue d\'architecture satisfaisante. Points d\'optimisation recommandés sur le batching des inférences sous TensorRT.',
      verifiedAt: '2026-10-14'
    },
    {
      id: 'dd-syn-4',
      startupId: 'startup-syn-01',
      category: 'propriete_intellectuelle',
      categoryLabel: 'Propriété Intellectuelle (IP)',
      title: 'Cession effective des droits d\'auteurs des fondateurs et brevet EP',
      description: 'Vérifier que tous les algorithmes développés sont 100% la propriété exclusive de la société.',
      status: 'valide',
      riskLevel: 'faible',
      findings: 'Brevet EP3987211A1 enregistré au nom de Synthetix Health SAS. Contrats de cession signés.',
      verifiedAt: '2026-10-08'
    },
    {
      id: 'dd-syn-5',
      startupId: 'startup-syn-01',
      category: 'cybersecurite_rgpd',
      categoryLabel: 'Données Personnelles & Conformité Médicale',
      title: 'Hébergement Données de Santé (HDS) et conformité RGPD patient',
      description: 'Vérifier les accords DPA avec les hôpitaux et la certification HDS des serveurs OVHcloud.',
      status: 'valide',
      riskLevel: 'faible',
      findings: 'Architecture cloud 100% HDS certifiée, DPO externe mandaté, zéro donnée nominative hébergée hors UE.',
      verifiedAt: '2026-10-11'
    },
    {
      id: 'dd-syn-6',
      startupId: 'startup-syn-01',
      category: 'juridique_reglementaire',
      categoryLabel: 'Réglementaire & Marquage CE',
      title: 'Attestation de conformité CE Médical Classe IIa',
      description: 'Examen du dossier technique remis au BSI / GMED.',
      status: 'valide',
      riskLevel: 'faible',
      findings: 'Certificat CE Médical en cours de validité jusqu\'en 2029 sous MDR 2017/745.',
      verifiedAt: '2026-10-09'
    }
  ]
};

export const INITIAL_DEMO_PORTFOLIO: Record<string, InvestmentPortfolio> = {
  'startup-kin-03': {
    startupId: 'startup-kin-03',
    investedAmount: 3500000,
    investmentDate: '2025-06-20',
    roundType: 'Série B',
    entryValuation: 35000000,
    ownershipPercentage: 10.0,
    currentValuation: 48000000,
    moic: 1.37,
    irrEstimate: 29.4,
    boardSeat: true,
    notes: 'Participation stratégique en co-lead avec Earlybird. Suivi trimestriel en board.',
    updates: [
      {
        date: '2026-09-15',
        summary: 'Signature d\'un contrat cadre mondial avec Sanofi pour 40 unités cobotiques.',
        kpi: 'ARR Industrie en hausse de 42% YoY'
      },
      {
        date: '2026-06-30',
        summary: 'Inauguration de la ligne d\'assemblage automatisée à Munich, cadence x2.5.',
        kpi: 'Marge brute matérielle passée de 48% à 56%'
      }
    ]
  }
};

export const INITIAL_DEMO_CONTACTS: Contact[] = [
  {
    id: 'cnt-1',
    startupId: 'startup-syn-01',
    name: 'Dr. Camille Laurent',
    role: 'CEO & Co-fondatrice',
    email: 'camille@synthetixhealth.example.com',
    phone: '+33 6 12 34 56 78',
    linkedin: 'https://linkedin.com/in/camille-laurent-md',
    notes: 'Contact principal. Très réactive sur Signal ou email.'
  },
  {
    id: 'cnt-2',
    startupId: 'startup-aur-02',
    name: 'Elena Rossi',
    role: 'CEO',
    email: 'elena@auraclimate.example.com',
    phone: '+41 78 901 23 45',
    linkedin: 'https://linkedin.com/in/elena-rossi-climate'
  }
];

export const INITIAL_DEMO_INTERACTIONS: Interaction[] = [
  {
    id: 'int-1',
    startupId: 'startup-syn-01',
    type: 'reunion',
    date: '2026-10-18',
    participants: 'Marc de Saint-Ange, Dr. Camille Laurent, Alexandre Meyer',
    summary: 'Revue technique approfondie de la version 2.4 de l\'algorithme. Démonstration en direct sur 15 cas de biopsies réelles.',
    nextSteps: 'Finaliser la term sheet et convoquer le comité d\'investissement pour le 5 novembre.'
  },
  {
    id: 'int-2',
    startupId: 'startup-aur-02',
    type: 'call',
    date: '2026-10-12',
    participants: 'Sarah Benali, Elena Rossi',
    summary: 'Présentation de la roadmap produit MRV carbone.',
    nextSteps: 'Recevoir le modèle financier détaillé et les retours clients pilotes.'
  }
];

export const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'tsk-1',
    startupId: 'startup-syn-01',
    title: 'Boucler la synthèse d\'investissement pour le comité de décision',
    dueDate: '2026-11-04',
    completed: false,
    priority: 'haute'
  },
  {
    id: 'tsk-2',
    startupId: 'startup-aur-02',
    title: 'Appel de référence avec le directeur RSE d\'Holcim Suisse',
    dueDate: '2026-11-10',
    completed: false,
    priority: 'moyenne'
  },
  {
    id: 'tsk-3',
    startupId: 'startup-pay-04',
    title: 'Analyse réglementaire de l\'autorisation FCA / EMI',
    dueDate: '2026-11-08',
    completed: false,
    priority: 'moyenne'
  }
];
