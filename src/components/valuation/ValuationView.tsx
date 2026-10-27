import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Save,
  Check,
  TrendingUp,
  Percent,
  Sliders,
  Layers,
  ArrowRight,
  Info,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { ValuationEstimate, ValuationMethod } from '../../types';

export const ValuationView: React.FC = () => {
  const { startups, financials, valuations, saveValuation, deleteValuation } = useVault();

  // Selected startup
  const [selectedStartupId, setSelectedStartupId] = useState<string>(
    startups[0]?.id || ''
  );

  const currentStartup = startups.find((s) => s.id === selectedStartupId);
  const currentFinancials = financials[selectedStartupId];
  const currentValuations = valuations[selectedStartupId] || [];

  // Active Method Tab
  type MethodTab = 'multiples_revenue' | 'multiples_ebitda' | 'dcf' | 'vc_method' | 'dilution_scenario' | 'synthese';
  const [activeTab, setActiveTab] = useState<MethodTab>('multiples_revenue');

  // METHOD 1: Multiples de Revenus / ARR
  const baseArr = currentFinancials?.annualData[1]?.arr || currentFinancials?.annualData[0]?.revenue || 1500000;
  const [revenueMultipleLow, setRevenueMultipleLow] = useState<number>(7.0);
  const [revenueMultipleMedian, setRevenueMultipleMedian] = useState<number>(9.0);
  const [revenueMultipleHigh, setRevenueMultipleHigh] = useState<number>(12.0);
  const [revenueBenchmarkNotes, setRevenueBenchmarkNotes] = useState('Comparables B2B SaaS DeepTech Européens Série A 2025-2026');

  const multipleValuationMin = baseArr * revenueMultipleLow;
  const multipleValuationMedian = baseArr * revenueMultipleMedian;
  const multipleValuationHigh = baseArr * revenueMultipleHigh;

  // METHOD 2: Multiples d'EBITDA
  const baseEbitda = 800000;
  const [ebitdaMultipleMedian, setEbitdaMultipleMedian] = useState<number>(14.0);

  // METHOD 3: DCF
  const [dcfWacc, setDcfWacc] = useState<number>(20.0); // 20% discount rate
  const [dcfTerminalGrowth, setDcfTerminalGrowth] = useState<number>(3.5); // 3.5% terminal growth
  const [dcfCashFlows, setDcfCashFlows] = useState<number[]>([
    -600000, -200000, 1200000, 2800000, 4500000,
  ]);

  const dcfCalculated = useMemo(() => {
    const r = dcfWacc / 100;
    const g = dcfTerminalGrowth / 100;
    let npv = 0;
    for (let t = 1; t <= dcfCashFlows.length; t++) {
      npv += dcfCashFlows[t - 1] / Math.pow(1 + r, t);
    }
    // Terminal value at year 5
    const finalCF = dcfCashFlows[dcfCashFlows.length - 1];
    const terminalValue = (finalCF * (1 + g)) / (r - g);
    const discountedTerminalValue = terminalValue / Math.pow(1 + r, dcfCashFlows.length);
    const enterpriseValue = npv + discountedTerminalValue;
    return Math.max(0, enterpriseValue);
  }, [dcfWacc, dcfTerminalGrowth, dcfCashFlows]);

  // METHOD 4: VC Method (First Chicago)
  const [vcExitHorizon, setVcExitHorizon] = useState<number>(5);
  const [vcExitValuation, setVcExitValuation] = useState<number>(100000000);
  const [vcTargetROI, setVcTargetROI] = useState<number>(7.0); // 7x multiple
  const [vcFutureDilution, setVcFutureDilution] = useState<number>(25.0); // 25% dilution in later rounds
  const targetRaise = currentStartup?.targetAmount || 3000000;

  const vcPostMoney = useMemo(() => {
    // Post = (Exit Valuation / ROI) * (1 - futureDilution)
    return (vcExitValuation / vcTargetROI) * (1 - vcFutureDilution / 100);
  }, [vcExitHorizon, vcExitValuation, vcTargetROI, vcFutureDilution]);
  const vcPreMoney = Math.max(0, vcPostMoney - targetRaise);

  // METHOD 5: Dilution & Financing Scenarios
  const [scenarioPreMoney, setScenarioPreMoney] = useState<number>(15000000);
  const [scenarioInvestment, setScenarioInvestment] = useState<number>(3000000);
  const [scenarioOptionPool, setScenarioOptionPool] = useState<number>(10.0); // 10% ESOP post

  const scenarioPostMoney = scenarioPreMoney + scenarioInvestment;
  const investorEquity = (scenarioInvestment / scenarioPostMoney) * 100;
  const foundersEquity = 100 - investorEquity - scenarioOptionPool;

  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSaveMethod = async (method: ValuationMethod, label: string, pre: number, post: number, low: number, high: number, assumptions: any) => {
    if (!currentStartup) return;

    const val: ValuationEstimate = {
      id: `val_${Date.now()}`,
      startupId: currentStartup.id,
      method,
      methodLabel: label,
      calculatedPreMoney: Math.round(pre),
      calculatedPostMoney: Math.round(post),
      targetRaise: currentStartup.targetAmount,
      lowEstimate: Math.round(low),
      highEstimate: Math.round(high),
      assumptions,
      evaluationDate: new Date().toISOString().slice(0, 10),
      limitations: 'Calculé localement selon les hypothèses fournies. Ne constitue pas une garantie d\'évaluation légale.',
    };

    await saveValuation(val);
    setSaveFeedback(`Modèle "${label}" chiffré et sauvegardé au dossier`);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Atelier de Valorisation Multi-Méthodes</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            6 méthodes de valorisation standard (Multiples, DCF, Méthode VC, Dilution) sans télémétrie externe
          </p>
        </div>

        {/* Startup selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Startup évaluée :</label>
          <select
            value={selectedStartupId}
            onChange={(e) => setSelectedStartupId(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            {startups.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.stage})
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveFeedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* Method navigation tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs border-b border-slate-800">
        {[
          { id: 'multiples_revenue', label: '1. Multiples de Revenus / ARR' },
          { id: 'vc_method', label: '2. Méthode VC (First Chicago)' },
          { id: 'dcf', label: '3. Flux Actualisés (DCF)' },
          { id: 'dilution_scenario', label: '4. Financement & Dilution' },
          { id: 'synthese', label: '5. Synthèse & Corridor de Valorisation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MethodTab)}
            className={`px-3 py-2 rounded-t-lg font-medium whitespace-nowrap cursor-pointer transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-emerald-500 text-white bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* METHOD 1: MULTIPLES DE REVENUS */}
      {activeTab === 'multiples_revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-100">
                Paramètres des Multiples d'ARR
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Assiette ARR de référence : <strong className="text-white">{formatEuro(baseArr)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <label className="block text-[11px] text-slate-400 mb-1">Multiple Prudent (Bas)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={revenueMultipleLow}
                    onChange={(e) => setRevenueMultipleLow(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono tabular-nums"
                  />
                  <span className="text-xs text-slate-400">x</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-emerald-800/50 rounded-lg">
                <label className="block text-[11px] text-emerald-400 font-medium mb-1">Multiple Central (Base)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={revenueMultipleMedian}
                    onChange={(e) => setRevenueMultipleMedian(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-emerald-300 font-bold font-mono tabular-nums"
                  />
                  <span className="text-xs text-slate-400">x</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <label className="block text-[11px] text-slate-400 mb-1">Multiple Optimiste (Haut)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={revenueMultipleHigh}
                    onChange={(e) => setRevenueMultipleHigh(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono tabular-nums"
                  />
                  <span className="text-xs text-slate-400">x</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Benchmark sectoriel & justification du multiple
              </label>
              <textarea
                rows={2}
                value={revenueBenchmarkNotes}
                onChange={(e) => setRevenueBenchmarkNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() =>
                  handleSaveMethod(
                    'multiples_revenue',
                    'Multiples de Revenus / ARR',
                    multipleValuationMedian,
                    multipleValuationMedian + (currentStartup?.targetAmount || 0),
                    multipleValuationMin,
                    multipleValuationHigh,
                    { baseArr, revenueMultipleMedian, revenueBenchmarkNotes }
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer cette évaluation au coffre</span>
              </button>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Résultat Valorisation Multiples
            </h3>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase">Pre-Money Centrale Estimée</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
                {formatEuro(multipleValuationMedian)}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Post-Money : <span className="text-white font-mono">{formatEuro(multipleValuationMedian + targetRaise)}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-950/60 rounded border border-slate-800/60">
                <span className="text-slate-400">Fourchette Basse ({revenueMultipleLow}x) :</span>
                <span className="font-mono text-slate-200">{formatEuro(multipleValuationMin)}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950/60 rounded border border-slate-800/60">
                <span className="text-slate-400">Fourchette Haute ({revenueMultipleHigh}x) :</span>
                <span className="font-mono text-slate-200">{formatEuro(multipleValuationHigh)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 2: VC METHOD */}
      {activeTab === 'vc_method' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-5">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-100">
                Modèle de Rendement Cible VC (First Chicago)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rétro-calcul de la valorisation d'entrée à partir de la valorisation de sortie attendue et du multiple de retour visé
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Horizon de sortie (Années)
                </label>
                <input
                  type="number"
                  value={vcExitHorizon}
                  onChange={(e) => setVcExitHorizon(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Valorisation estimée à la sortie (€)
                </label>
                <input
                  type="number"
                  step="1000000"
                  value={vcExitValuation}
                  onChange={(e) => setVcExitValuation(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Multiple de retour brut visé (MOIC)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={vcTargetROI}
                    onChange={(e) => setVcTargetROI(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                  />
                  <span className="text-xs text-slate-400">x</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dilution anticipée tours futurs (%)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="1"
                    value={vcFutureDilution}
                    onChange={(e) => setVcFutureDilution(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() =>
                  handleSaveMethod(
                    'vc_method',
                    'Méthode VC (First Chicago)',
                    vcPreMoney,
                    vcPostMoney,
                    vcPreMoney * 0.85,
                    vcPreMoney * 1.15,
                    { vcExitHorizon, vcExitValuation, vcTargetROI, vcFutureDilution }
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer l'estimation VC</span>
              </button>
            </div>
          </div>

          {/* VC Result */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Valorisation Maximale Tolérable
            </h3>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase">Pre-Money Recommandée</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
                {formatEuro(vcPreMoney)}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Post-Money : <span className="text-white font-mono">{formatEuro(vcPostMoney)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded border border-slate-800/60 text-xs text-slate-300 space-y-1">
              <div>Pour générer <strong>{vcTargetROI}x</strong> de retour sur {vcExitHorizon} ans avec {vcFutureDilution}% de dilution future, le ticket actuel de {formatEuro(targetRaise)} doit être investi à une valorisation pré-money maximale de {formatEuro(vcPreMoney)}.</div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 3: DCF */}
      {activeTab === 'dcf' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-5">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-100">
                Flux de Trésorerie Disponibles Actualisés (DCF)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Projection des Free Cash Flows sur 5 ans avec taux d'actualisation WACC adapté au risque venture
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Taux d'actualisation WACC (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={dcfWacc}
                  onChange={(e) => setDcfWacc(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Taux de croissance à l'infini g (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={dcfTerminalGrowth}
                  onChange={(e) => setDcfTerminalGrowth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Free Cash Flows prévus (€ / an)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {dcfCashFlows.map((cf, idx) => (
                  <div key={idx} className="p-2 bg-slate-950 border border-slate-800 rounded">
                    <div className="text-[10px] text-slate-400">Année {idx + 1}</div>
                    <input
                      type="number"
                      step="100000"
                      value={cf}
                      onChange={(e) => {
                        const copy = [...dcfCashFlows];
                        copy[idx] = parseFloat(e.target.value) || 0;
                        setDcfCashFlows(copy);
                      }}
                      className="w-full mt-1 bg-transparent text-xs text-white font-mono tabular-nums focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() =>
                  handleSaveMethod(
                    'dcf',
                    'Flux Actualisés (DCF)',
                    dcfCalculated,
                    dcfCalculated + targetRaise,
                    dcfCalculated * 0.8,
                    dcfCalculated * 1.2,
                    { dcfWacc, dcfTerminalGrowth, dcfCashFlows }
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer l'estimation DCF</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Valeur d'Entreprise DCF
            </h3>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase">Valeur DCF Calculée</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
                {formatEuro(dcfCalculated)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                Sensible au WACC ({dcfWacc}%) et à la valeur terminale.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 4: DILUTION & FINANCING */}
      {activeTab === 'dilution_scenario' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-5">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-100">
                Simulateur de Tour de Table & Cap Table Post-Financement
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calcul précis de la dilution des fondateurs, de la part des nouveaux investisseurs et du pool ESOP
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Valorisation Pré-Money (€)
                </label>
                <input
                  type="number"
                  step="500000"
                  value={scenarioPreMoney}
                  onChange={(e) => setScenarioPreMoney(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Montant levé (€)
                </label>
                <input
                  type="number"
                  step="250000"
                  value={scenarioInvestment}
                  onChange={(e) => setScenarioInvestment(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pool d'options ESOP post-round (%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={scenarioOptionPool}
                  onChange={(e) => setScenarioOptionPool(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Visual Cap Table bar */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-medium text-slate-300">Répartition du capital post-closing :</div>
              <div className="h-6 w-full rounded-lg overflow-hidden flex font-mono text-[11px] font-bold text-slate-950">
                <div
                  style={{ width: `${foundersEquity}%` }}
                  className="bg-emerald-400 flex items-center justify-center truncate px-1"
                  title={`Fondateurs & Historiques: ${foundersEquity.toFixed(1)}%`}
                >
                  Fondateurs {foundersEquity.toFixed(1)}%
                </div>
                <div
                  style={{ width: `${investorEquity}%` }}
                  className="bg-cyan-400 flex items-center justify-center truncate px-1"
                  title={`Nouveaux Investisseurs: ${investorEquity.toFixed(1)}%`}
                >
                  Nouveaux {investorEquity.toFixed(1)}%
                </div>
                <div
                  style={{ width: `${scenarioOptionPool}%` }}
                  className="bg-amber-400 flex items-center justify-center truncate px-1"
                  title={`Pool ESOP: ${scenarioOptionPool.toFixed(1)}%`}
                >
                  ESOP {scenarioOptionPool.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Synthèse du Tour
            </h3>

            <div className="space-y-3 font-mono tabular-nums text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400 font-sans">Pré-Money :</span>
                <span className="text-white font-bold">{formatEuro(scenarioPreMoney)}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400 font-sans">Levée :</span>
                <span className="text-emerald-400 font-bold">{formatEuro(scenarioInvestment)}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400 font-sans">Post-Money :</span>
                <span className="text-white font-bold">{formatEuro(scenarioPostMoney)}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400 font-sans">Dilution Fondateurs :</span>
                <span className="text-rose-400 font-bold">{(100 - foundersEquity).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 5: SYNTHESE & CORRIDOR */}
      {activeTab === 'synthese' && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Corridor de Valorisation & Estimations Enregistrées
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Historique des valorisations calculées et scellées dans le coffre pour {currentStartup?.name}
              </p>
            </div>
          </div>

          {currentValuations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
              Aucune valorisation enregistrée dans ce dossier. Utilisez les onglets ci-dessus pour simuler et sauvegarder des méthodes.
            </div>
          ) : (
            <div className="space-y-3">
              {currentValuations.map((v) => (
                <div
                  key={v.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <div className="font-semibold text-sm text-white">{v.methodLabel}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Fourchette : <span className="font-mono tabular-nums text-slate-300">{formatEuro(v.lowEstimate)}</span> à{' '}
                      <span className="font-mono tabular-nums text-slate-300">{formatEuro(v.highEstimate)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Évalué le {v.evaluationDate} · {v.limitations}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                        {formatEuro(v.calculatedPreMoney)}
                      </div>
                      <div className="text-[11px] text-slate-400">Pre-Money Centrale</div>
                    </div>

                    <button
                      onClick={async () => {
                        if (confirm('Supprimer cette valorisation du dossier ?')) {
                          await deleteValuation(v.id, selectedStartupId);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
