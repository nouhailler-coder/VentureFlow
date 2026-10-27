import React, { useState } from 'react';
import {
  X,
  Building,
  Target,
  BarChart3,
  Calculator,
  FileCheck2,
  Lock,
  Mail,
  Linkedin,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  Users,
  Calendar,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import {
  Startup,
  StartupAnalysis,
  FinancialModel,
  ValuationEstimate,
  DueDiligenceItem,
  ScoringCriterion,
  PipelineStageId,
  PIPELINE_STAGES,
} from '../../types';

interface StartupDetailModalProps {
  startupId: string;
  onClose: () => void;
  onOpenValuationTab?: () => void;
  onOpenDueDiligenceTab?: () => void;
}

export const StartupDetailModal: React.FC<StartupDetailModalProps> = ({
  startupId,
  onClose,
  onOpenValuationTab,
  onOpenDueDiligenceTab,
}) => {
  const {
    startups,
    analyses,
    financials,
    valuations,
    dueDiligence,
    contacts,
    interactions,
    saveStartup,
    saveAnalysis,
    saveFinancialModel,
    saveContact,
    deleteContact,
    saveInteraction,
  } = useVault();

  const startup = startups.find((s) => s.id === startupId);
  const analysis = analyses[startupId];
  const financial = financials[startupId];
  const dealValuations = valuations[startupId] || [];
  const dealDiligence = dueDiligence[startupId] || [];
  const dealContacts = contacts.filter((c) => c.startupId === startupId);
  const dealInteractions = interactions.filter((i) => i.startupId === startupId);

  type SubTab = 'identite' | 'scoring' | 'finances' | 'crm' | 'notes';
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('identite');

  // Edit startup state
  const [editingStartup, setEditingStartup] = useState<Startup>(
    startup || {
      id: startupId,
      name: '',
      sector: '',
      stage: 'Seed',
      country: 'France',
      city: '',
      website: '',
      foundedYear: 2024,
      description: '',
      valueProposition: '',
      founders: [],
      targetAmount: 0,
      currency: 'EUR',
      pipelineStage: 'qualifier',
      confidentialNotes: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  // Scoring state
  const defaultCriteria: ScoringCriterion[] = [
    { id: 'c1', name: 'Qualité et complémentarité de l\'équipe fondatrice', weight: 15, score: 7, rationale: '', category: 'equipe' },
    { id: 'c2', name: 'Taille et dynamique du marché cible (TAM / SAM)', weight: 10, score: 7, rationale: '', category: 'marche' },
    { id: 'c3', name: 'Différenciation produit & barrières technologiques / IP', weight: 12, score: 7, rationale: '', category: 'produit' },
    { id: 'c4', name: 'Traction commerciale & vélocité des ventes', weight: 10, score: 7, rationale: '', category: 'traction' },
    { id: 'c5', name: 'Revenus récurrents (ARR) & rétention brute/nette', weight: 10, score: 7, rationale: '', category: 'finance' },
    { id: 'c6', name: 'Marge brute et économie unitaire (CAC/LTV)', weight: 8, score: 7, rationale: '', category: 'finance' },
    { id: 'c7', name: 'Consommation de trésorerie (Burn Rate) & runway', weight: 8, score: 7, rationale: '', category: 'finance' },
    { id: 'c8', name: 'Discipline budgétaire et horizon trésorerie', weight: 7, score: 7, rationale: '', category: 'finance' },
    { id: 'c9', name: 'Intensité concurrentielle et positionnement', weight: 7, score: 7, rationale: '', category: 'marche' },
    { id: 'c10', name: 'Risques réglementaires, juridiques et IP', weight: 7, score: 7, rationale: '', category: 'risque' },
    { id: 'c11', name: 'Capacité d\'exécution opérationnelle', weight: 6, score: 7, rationale: '', category: 'equipe' },
  ];

  const [scoringCriteria, setScoringCriteria] = useState<ScoringCriterion[]>(
    analysis?.criteria || defaultCriteria
  );
  const [recommendation, setRecommendation] = useState<'favorable' | 'approfondir' | 'prudence' | 'defavorable'>(
    analysis?.recommendation || 'approfondir'
  );
  const [thesisFit, setThesisFit] = useState(analysis?.thesisFit || '');
  const [recommendationNotes, setRecommendationNotes] = useState(analysis?.recommendationNotes || '');

  // Calculate composite score
  const totalWeight = scoringCriteria.reduce((acc, c) => acc + c.weight, 0);
  const calculatedComposite =
    totalWeight > 0
      ? (
          scoringCriteria.reduce((acc, c) => acc + (c.score * c.weight), 0) /
          totalWeight * 10
        ).toFixed(1)
      : '0.0';

  // Contact form state
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  // Interaction form state
  const [newInteractionType, setNewInteractionType] = useState<'call' | 'reunion' | 'email' | 'pitch' | 'note'>('call');
  const [newInteractionDate, setNewInteractionDate] = useState(new Date().toISOString().slice(0, 10));
  const [newInteractionSummary, setNewInteractionSummary] = useState('');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  if (!startup) {
    return null;
  }

  const handleSaveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStartup(editingStartup);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2000);
  };

  const handleSaveScoring = async () => {
    const newAnalysis: StartupAnalysis = {
      startupId,
      criteria: scoringCriteria,
      compositeScore: parseFloat(calculatedComposite),
      thesisFit,
      keyStrengths: analysis?.keyStrengths || [],
      keyWeaknesses: analysis?.keyWeaknesses || [],
      regulatoryTechRisks: analysis?.regulatoryTechRisks || '',
      recommendation,
      recommendationNotes,
      analyzedAt: new Date().toISOString(),
    };
    await saveAnalysis(newAnalysis);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2000);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName) return;
    await saveContact({
      id: `cnt_${Date.now()}`,
      startupId,
      name: newContactName,
      role: newContactRole || 'Fondateur',
      email: newContactEmail,
    });
    setNewContactName('');
    setNewContactRole('');
    setNewContactEmail('');
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteractionSummary) return;
    await saveInteraction({
      id: `int_${Date.now()}`,
      startupId,
      type: newInteractionType,
      date: newInteractionDate,
      participants: 'Équipe d\'investissement',
      summary: newInteractionSummary,
    });
    setNewInteractionSummary('');
  };

  const formatEuro = (val: number | undefined) => {
    if (!val) return '—';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header Drawer */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{editingStartup.name}</h2>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-emerald-400 font-medium">{editingStartup.stage}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">{editingStartup.sector}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {editingStartup.city}, {editingStartup.country} · Cible : {formatEuro(editingStartup.targetAmount)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccessMsg && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Chiffré & sauvegardé
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 overflow-x-auto text-xs">
          {[
            { id: 'identite', label: '1. Fiche & Fondateurs', icon: Building },
            { id: 'scoring', label: '2. Scoring Multi-Critères (12)', icon: Target },
            { id: 'finances', label: '3. Finances & Métriques', icon: BarChart3 },
            { id: 'crm', label: '4. Contacts & Échanges', icon: Users },
            { id: 'notes', label: '5. Notes Confidentielles', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
                  activeSubTab === tab.id
                    ? 'border-emerald-500 text-white bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: IDENTITÉ & FICHE STARTUP */}
          {activeSubTab === 'identite' && (
            <form onSubmit={handleSaveBasicInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nom de la startup</label>
                  <input
                    type="text"
                    value={editingStartup.name}
                    onChange={(e) => setEditingStartup({ ...editingStartup, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Secteur d'activité</label>
                  <input
                    type="text"
                    value={editingStartup.sector}
                    onChange={(e) => setEditingStartup({ ...editingStartup, sector: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stade de maturité</label>
                  <select
                    value={editingStartup.stage}
                    onChange={(e) => setEditingStartup({ ...editingStartup, stage: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Série A">Série A</option>
                    <option value="Série B">Série B</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Étape dans le pipeline</label>
                  <select
                    value={editingStartup.pipelineStage}
                    onChange={(e) => setEditingStartup({ ...editingStartup, pipelineStage: e.target.value as PipelineStageId })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    {PIPELINE_STAGES.map((stg) => (
                      <option key={stg.id} value={stg.id}>
                        {stg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pays & Ville</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Pays"
                      value={editingStartup.country}
                      onChange={(e) => setEditingStartup({ ...editingStartup, country: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Ville"
                      value={editingStartup.city}
                      onChange={(e) => setEditingStartup({ ...editingStartup, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Site Web public</label>
                  <input
                    type="url"
                    value={editingStartup.website}
                    onChange={(e) => setEditingStartup({ ...editingStartup, website: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Montant recherché (€)</label>
                  <input
                    type="number"
                    value={editingStartup.targetAmount}
                    onChange={(e) => setEditingStartup({ ...editingStartup, targetAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valorisation demandée pré-money (€)</label>
                  <input
                    type="number"
                    value={editingStartup.valuationAsked || ''}
                    onChange={(e) => setEditingStartup({ ...editingStartup, valuationAsked: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description d'activité</label>
                <textarea
                  rows={2}
                  value={editingStartup.description}
                  onChange={(e) => setEditingStartup({ ...editingStartup, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Proposition de valeur & différenciation</label>
                <textarea
                  rows={2}
                  value={editingStartup.valueProposition}
                  onChange={(e) => setEditingStartup({ ...editingStartup, valueProposition: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SCORING MULTI-CRITÈRES (12 critères du cahier des charges) */}
          {activeSubTab === 'scoring' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Score Global d'Analyse</div>
                  <div className="text-2xl font-bold text-white tabular-nums mt-0.5">
                    {calculatedComposite} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Avis du comité</label>
                    <select
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value as any)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-medium"
                    >
                      <option value="favorable">Favorable (Poursuivre)</option>
                      <option value="approfondir">À approfondir</option>
                      <option value="prudence">Prudence / Réserves</option>
                      <option value="defavorable">Défavorable</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveScoring}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 mt-3 sm:mt-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Sauvegarder le scoring</span>
                  </button>
                </div>
              </div>

              {/* 12 Criteria Sliders */}
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Grille des 12 Critères Fondateurs (Pondération personnalisable)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scoringCriteria.map((crit, idx) => (
                    <div key={crit.id} className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">{crit.name}</span>
                        <div className="flex items-center gap-2 font-mono tabular-nums">
                          <span className="text-emerald-400 font-bold">{crit.score}/10</span>
                          <span className="text-slate-500 text-[11px]">({crit.weight}%)</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={crit.score}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          const updated = [...scoringCriteria];
                          updated[idx].score = val;
                          setScoringCriteria(updated);
                        }}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />

                      <input
                        type="text"
                        placeholder="Rationnel / observation..."
                        value={crit.rationale}
                        onChange={(e) => {
                          const updated = [...scoringCriteria];
                          updated[idx].rationale = e.target.value;
                          setScoringCriteria(updated);
                        }}
                        className="w-full px-2.5 py-1 text-[11px] bg-slate-900 border border-slate-800/80 rounded text-slate-300 placeholder-slate-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualitative Thesis & Remarks */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Adéquation avec la thèse d'investissement du fonds
                  </label>
                  <textarea
                    rows={2}
                    value={thesisFit}
                    onChange={(e) => setThesisFit(e.target.value)}
                    placeholder="Pourquoi ce dossier correspond ou s'écarte de notre thèse..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Recommandations de l'analyste & prochaines étapes
                  </label>
                  <textarea
                    rows={2}
                    value={recommendationNotes}
                    onChange={(e) => setRecommendationNotes(e.target.value)}
                    placeholder="Synthèse de l'avis de l'équipe pour le comité d'investissement..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              {/* Mandatory Section 6.3 disclaimer */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 leading-relaxed">
                <strong>Avertissement méthodologique :</strong> Ce score est une grille d'analyse multi-critères
                paramétrable d'aide à la décision. Il ne constitue en aucun cas une recommandation d'investissement certaine
                ou une garantie de rendement futur.
              </div>
            </div>
          )}

          {/* TAB 3: FINANCES & P&L */}
          {activeSubTab === 'finances' && (
            <div className="space-y-5">
              {financial ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Scénario : <strong className="text-white uppercase">{financial.scenario}</strong>
                    </span>
                    <span className="text-xs text-slate-400">
                      Hypothèse : {financial.growthHypothesis}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-800 rounded-lg">
                      <thead className="bg-slate-950 text-slate-400">
                        <tr>
                          <th className="p-2.5">Indicateur Financier</th>
                          {financial.annualData.map((d) => (
                            <th key={d.year} className="p-2.5 text-right font-mono">
                              {d.year} {d.isForecast ? '(P)' : ''}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                        <tr>
                          <td className="p-2.5 font-sans font-medium text-slate-200">Chiffre d'Affaires / ARR</td>
                          {financial.annualData.map((d) => (
                            <td key={d.year} className="p-2.5 text-right text-emerald-400 font-semibold">
                              {formatEuro(d.arr || d.revenue)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-2.5 font-sans text-slate-400">Coût des ventes (COGS)</td>
                          {financial.annualData.map((d) => (
                            <td key={d.year} className="p-2.5 text-right text-slate-400">
                              {formatEuro(d.cogs)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-2.5 font-sans font-medium text-slate-200">Marge Brute (€ et %)</td>
                          {financial.annualData.map((d) => (
                            <td key={d.year} className="p-2.5 text-right text-slate-200">
                              {formatEuro(d.grossMargin)} ({d.grossMarginPercent}%)
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-2.5 font-sans text-slate-400">Dépenses Opérationnelles (Opex)</td>
                          {financial.annualData.map((d) => (
                            <td key={d.year} className="p-2.5 text-right text-slate-400">
                              {formatEuro(d.totalOpex)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-2.5 font-sans font-medium text-slate-200">EBITDA</td>
                          {financial.annualData.map((d) => (
                            <td
                              key={d.year}
                              className={`p-2.5 text-right font-semibold ${
                                d.ebitda >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {formatEuro(d.ebitda)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-2.5 font-sans text-slate-400">Trésorerie Disponible (Fin d'exercice)</td>
                          {financial.annualData.map((d) => (
                            <td key={d.year} className="p-2.5 text-right text-slate-300">
                              {formatEuro(d.cashBalance)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-2.5 font-sans text-slate-400">Runway Estimé (Mois)</td>
                          {financial.annualData.map((d) => (
                            <td
                              key={d.year}
                              className={`p-2.5 text-right font-bold ${
                                d.runwayMonths <= 6
                                  ? 'text-rose-400'
                                  : d.runwayMonths <= 12
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {d.runwayMonths > 60 ? 'Cash flow +' : `${d.runwayMonths} mois`}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p>Aucun modèle financier renseigné pour cette startup.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CRM CONTACTS & INTERACTIONS */}
          {activeSubTab === 'crm' && (
            <div className="space-y-6">
              {/* Contacts section */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Fondateurs & Contacts Clés
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {dealContacts.map((cnt) => (
                    <div key={cnt.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start justify-between">
                      <div>
                        <div className="font-medium text-xs text-white">{cnt.name}</div>
                        <div className="text-[11px] text-slate-400">{cnt.role}</div>
                        {cnt.email && (
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{cnt.email}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteContact(cnt.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddContact} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Nom complet"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Rôle (ex: CEO)"
                    value={newContactRole}
                    onChange={(e) => setNewContactRole(e.target.value)}
                    className="w-32 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium cursor-pointer"
                  >
                    Ajouter
                  </button>
                </form>
              </div>

              {/* Interactions section */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Historique des Échanges & Comptes-Rendus
                </h3>

                <div className="space-y-3 mb-4">
                  {dealInteractions.map((int) => (
                    <div key={int.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-emerald-400 uppercase tracking-wide">
                          {int.type}
                        </span>
                        <span>{int.date}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{int.summary}</p>
                      {int.nextSteps && (
                        <div className="text-[11px] text-slate-400 pt-1">
                          <strong>Prochaine étape :</strong> {int.nextSteps}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddInteraction} className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex gap-2">
                    <select
                      value={newInteractionType}
                      onChange={(e) => setNewInteractionType(e.target.value as any)}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    >
                      <option value="call">Appel téléphonique</option>
                      <option value="reunion">Réunion / Pitch</option>
                      <option value="email">Email</option>
                      <option value="note">Note interne</option>
                    </select>
                    <input
                      type="date"
                      value={newInteractionDate}
                      onChange={(e) => setNewInteractionDate(e.target.value)}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Synthèse de l'échange..."
                    value={newInteractionSummary}
                    onChange={(e) => setNewInteractionSummary(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium cursor-pointer"
                    >
                      Enregistrer l'échange
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: NOTES CONFIDENTIELLES */}
          {activeSubTab === 'notes' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-lg text-xs text-amber-200 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Zone Ultra-Confidentielle :</strong> Ces notes d'analyse sont strictement chiffrées avec votre
                  clé maîtresse. Elles ne seront <strong>JAMAIS incluses</strong> dans les exports partagés
                  à des tiers, sauf si vous cochez expressément la case correspondante lors de la génération.
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Notes privées d'investissement & avis des associés
                </label>
                <textarea
                  rows={8}
                  value={editingStartup.confidentialNotes}
                  onChange={(e) => setEditingStartup({ ...editingStartup, confidentialNotes: e.target.value })}
                  placeholder="Points de négociation, réserves fondateurs, retours de références clients officieuses..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 leading-relaxed font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    await saveStartup(editingStartup);
                    setSaveSuccessMsg(true);
                    setTimeout(() => setSaveSuccessMsg(false), 2000);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les notes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
