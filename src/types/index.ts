export type PipelineStageId =
  | 'qualifier'
  | 'premier_contact'
  | 'analyse_preliminaire'
  | 'rencontre'
  | 'due_diligence'
  | 'negociation'
  | 'decision'
  | 'investi'
  | 'refuse';

export interface PipelineStageConfig {
  id: PipelineStageId;
  label: string;
  order: number;
  description: string;
  color: string;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: 'qualifier', label: '1. À qualifier', order: 1, description: 'Opportunité entrante à filtrer', color: 'slate' },
  { id: 'premier_contact', label: '2. Premier contact', order: 2, description: 'Échange initial avec les fondateurs', color: 'blue' },
  { id: 'analyse_preliminaire', label: '3. Analyse préliminaire', order: 3, description: 'Revue du deck, marché et métriques', color: 'indigo' },
  { id: 'rencontre', label: '4. Rencontre', order: 4, description: 'Pitch approfondi & séance Q&A', color: 'cyan' },
  { id: 'due_diligence', label: '5. Due diligence', order: 5, description: 'Audit financier, juridique & tech', color: 'amber' },
  { id: 'negociation', label: '6. Négociation', order: 6, description: 'Term sheet et valorisation', color: 'orange' },
  { id: 'decision', label: '7. Décision', order: 7, description: 'Comité d\'investissement (IC)', color: 'purple' },
  { id: 'investi', label: '8. Investi', order: 8, description: 'Closing réalisé et portefeuille', color: 'emerald' },
  { id: 'refuse', label: '9. Refusé / Abandonné', order: 9, description: 'Dossier écarté ou désistement', color: 'rose' },
];

export interface Founder {
  name: string;
  role: string;
  email?: string;
  linkedin?: string;
  phone?: string;
  bio?: string;
}

export interface Startup {
  id: string;
  name: string;
  sector: string;
  stage: 'Pre-seed' | 'Seed' | 'Série A' | 'Série B' | 'Growth';
  country: string;
  city: string;
  website: string;
  foundedYear: number;
  description: string;
  valueProposition: string;
  founders: Founder[];
  targetAmount: number;
  valuationAsked?: number;
  currency: 'EUR' | 'USD' | 'GBP';
  pipelineStage: PipelineStageId;
  refusalReason?: string;
  refusalDate?: string;
  followUpDate?: string;
  leadPartner?: string;
  confidentialNotes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  startupId: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
}

export interface Interaction {
  id: string;
  startupId: string;
  type: 'call' | 'reunion' | 'email' | 'pitch' | 'note';
  date: string;
  participants: string;
  summary: string;
  nextSteps?: string;
}

export interface Task {
  id: string;
  startupId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'haute' | 'moyenne' | 'basse';
}

export interface ScoringCriterion {
  id: string;
  name: string;
  weight: number; // percentage
  score: number; // 1 to 10
  rationale: string;
  category: 'equipe' | 'marche' | 'produit' | 'traction' | 'finance' | 'risque';
}

export interface StartupAnalysis {
  startupId: string;
  criteria: ScoringCriterion[];
  compositeScore: number; // 0 to 100
  thesisFit: string;
  keyStrengths: string[];
  keyWeaknesses: string[];
  regulatoryTechRisks: string;
  recommendation: 'favorable' | 'approfondir' | 'prudence' | 'defavorable';
  recommendationNotes: string;
  analyzedAt: string;
}

export interface FinancialYearData {
  year: number;
  isForecast: boolean;
  revenue: number;
  arr?: number;
  cogs: number;
  grossMargin: number; // calculated
  grossMarginPercent: number; // calculated
  opexRAndD: number;
  opexSalesMarketing: number;
  opexGA: number;
  totalOpex: number; // calculated
  ebitda: number; // calculated
  cashBalance: number;
  monthlyBurn: number;
  runwayMonths: number; // calculated
}

export interface FinancialModel {
  startupId: string;
  currency: string;
  scenario: 'prudent' | 'central' | 'optimiste';
  annualData: FinancialYearData[];
  growthHypothesis: string;
  notes: string;
  lastUpdated: string;
}

export type ValuationMethod =
  | 'multiples_revenue'
  | 'multiples_ebitda'
  | 'dcf'
  | 'vc_method'
  | 'dilution_scenario'
  | 'scorecard_summary';

export interface ValuationEstimate {
  id: string;
  startupId: string;
  method: ValuationMethod;
  methodLabel: string;
  calculatedPreMoney: number;
  calculatedPostMoney: number;
  targetRaise: number;
  lowEstimate: number;
  highEstimate: number;
  assumptions: Record<string, any>;
  evaluationDate: string;
  limitations: string;
}

export type DueDiligenceCategory =
  | 'corporate_capital'
  | 'equipe_rh'
  | 'finances_audit'
  | 'produit_tech'
  | 'propriete_intellectuelle'
  | 'marche_clients'
  | 'contrats_fournisseurs'
  | 'juridique_reglementaire'
  | 'cybersecurite_rgpd'
  | 'esg_gouvernance';

export interface DueDiligenceItem {
  id: string;
  startupId: string;
  category: DueDiligenceCategory;
  categoryLabel: string;
  title: string;
  description: string;
  status: 'non_demarre' | 'en_cours' | 'valide' | 'bloquant';
  riskLevel: 'faible' | 'moyen' | 'eleve';
  findings: string;
  verifiedAt?: string;
  hasAttachment?: boolean;
}

export interface EncryptedAttachment {
  id: string;
  startupId: string;
  itemId?: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  encryptedBase64: string;
  ivBase64: string;
  uploadedAt: string;
}

export interface InvestmentPortfolio {
  startupId: string;
  investedAmount: number;
  investmentDate: string;
  roundType: 'Pre-seed' | 'Seed' | 'Série A' | 'Série B' | 'Autre';
  entryValuation: number;
  ownershipPercentage: number;
  currentValuation: number;
  moic: number; // calculated: currentValuation * (ownership / 100) / investedAmount
  irrEstimate: number;
  boardSeat: boolean;
  notes: string;
  updates: {
    date: string;
    summary: string;
    kpi: string;
  }[];
}

export interface VaultMetadata {
  version: number;
  saltBase64: string;
  ivBase64: string;
  iterations: number;
  encryptedMasterKeyBase64: string;
  passkeyCredentialId?: string;
  encryptedMasterKeyPasskey?: string;
  createdAt: string;
  lastUnlockedAt?: string;
}

export interface ShareExportFilter {
  startupId: string;
  includeGeneralInfo: boolean;
  includeFinancials: boolean;
  includeValuation: boolean;
  includeDueDiligence: boolean;
  includePrivateNotes: boolean; // default false
  customNoteForRecipient?: string;
}
