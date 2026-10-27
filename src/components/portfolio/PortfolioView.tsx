import React, { useState } from 'react';
import {
  TrendingUp,
  Briefcase,
  PieChart,
  Calendar,
  Plus,
  Save,
  Check,
  Building,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { InvestmentPortfolio } from '../../types';

export const PortfolioView: React.FC = () => {
  const { startups, portfolio, saveInvestmentPortfolio } = useVault();

  const investedStartups = startups.filter(
    (s) => s.pipelineStage === 'investi' || portfolio[s.id]
  );

  const [selectedStartupId, setSelectedStartupId] = useState<string>(
    investedStartups[0]?.id || ''
  );

  const currentInvestment = portfolio[selectedStartupId];
  const currentStartup = startups.find((s) => s.id === selectedStartupId);

  // Form state
  const [investedAmount, setInvestedAmount] = useState<number>(
    currentInvestment?.investedAmount || 1000000
  );
  const [entryValuation, setEntryValuation] = useState<number>(
    currentInvestment?.entryValuation || 10000000
  );
  const [currentValuation, setCurrentValuation] = useState<number>(
    currentInvestment?.currentValuation || 15000000
  );
  const [ownershipPercentage, setOwnershipPercentage] = useState<number>(
    currentInvestment?.ownershipPercentage || 10.0
  );
  const [boardSeat, setBoardSeat] = useState<boolean>(
    currentInvestment?.boardSeat || false
  );
  const [notes, setNotes] = useState<string>(currentInvestment?.notes || '');

  // Periodic update state
  const [newUpdateSummary, setNewUpdateSummary] = useState('');
  const [newUpdateKpi, setNewUpdateKpi] = useState('');

  // Calculations
  const calculatedMoic =
    investedAmount > 0
      ? ((currentValuation * (ownershipPercentage / 100)) / investedAmount).toFixed(2)
      : '1.00';

  const formatEuro = (val: number | undefined) => {
    if (!val) return '—';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartupId) return;

    const inv: InvestmentPortfolio = {
      startupId: selectedStartupId,
      investedAmount,
      investmentDate: currentInvestment?.investmentDate || new Date().toISOString().slice(0, 10),
      roundType: currentInvestment?.roundType || 'Série A',
      entryValuation,
      ownershipPercentage,
      currentValuation,
      moic: parseFloat(calculatedMoic),
      irrEstimate: currentInvestment?.irrEstimate || 25.0,
      boardSeat,
      notes,
      updates: currentInvestment?.updates || [],
    };

    await saveInvestmentPortfolio(inv);
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateSummary || !selectedStartupId) return;

    const currentUpdates = currentInvestment?.updates || [];
    const updatedInv: InvestmentPortfolio = {
      ...(currentInvestment || {
        startupId: selectedStartupId,
        investedAmount,
        investmentDate: new Date().toISOString().slice(0, 10),
        roundType: 'Série A',
        entryValuation,
        ownershipPercentage,
        currentValuation,
        moic: parseFloat(calculatedMoic),
        irrEstimate: 20.0,
        boardSeat,
        notes,
        updates: [],
      }),
      updates: [
        {
          date: new Date().toISOString().slice(0, 10),
          summary: newUpdateSummary,
          kpi: newUpdateKpi,
        },
        ...currentUpdates,
      ],
    };

    await saveInvestmentPortfolio(updatedInv);
    setNewUpdateSummary('');
    setNewUpdateKpi('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Suivi du Portefeuille d'Investissement</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivi des participations, multiples MOIC, actualisations trimestrielles et gouvernance
          </p>
        </div>

        {investedStartups.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Participation :</label>
            <select
              value={selectedStartupId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedStartupId(id);
                const inv = portfolio[id];
                if (inv) {
                  setInvestedAmount(inv.investedAmount);
                  setEntryValuation(inv.entryValuation);
                  setCurrentValuation(inv.currentValuation);
                  setOwnershipPercentage(inv.ownershipPercentage);
                  setBoardSeat(inv.boardSeat);
                  setNotes(inv.notes);
                }
              }}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white cursor-pointer"
            >
              {investedStartups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {investedStartups.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-white mb-1">Aucun investissement actif</h2>
          <p className="max-w-md mx-auto text-slate-500">
            Déplacez une startup vers l'étape "8. Investissement réalisé" dans le Pipeline pour l'intégrer au portefeuille.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols: Investment Metrics & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase">Montant Investi</span>
                <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">
                  {formatEuro(investedAmount)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Détention : <strong className="text-slate-300">{ownershipPercentage}%</strong>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase">Valeur Latente Actuelle</span>
                <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
                  {formatEuro(currentValuation * (ownershipPercentage / 100))}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Valo société : {formatEuro(currentValuation)}
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase">Multiple MOIC Brut</span>
                <div className="text-xl font-bold text-cyan-400 font-mono tabular-nums mt-1">
                  {calculatedMoic}x
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Plus-value : {formatEuro(currentValuation * (ownershipPercentage / 100) - investedAmount)}
                </div>
              </div>
            </div>

            {/* Edit Terms form */}
            <form onSubmit={handleSavePortfolio} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-slate-100">
                  Paramètres de la Participation ({currentStartup?.name})
                </h2>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les paramètres</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Montant investi initialement (€)</label>
                  <input
                    type="number"
                    value={investedAmount}
                    onChange={(e) => setInvestedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Pourcentage de détention (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ownershipPercentage}
                    onChange={(e) => setOwnershipPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Valorisation d'entrée (€)</label>
                  <input
                    type="number"
                    value={entryValuation}
                    onChange={(e) => setEntryValuation(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Valorisation actuelle ré-estimée (€)</label>
                  <input
                    type="number"
                    value={currentValuation}
                    onChange={(e) => setCurrentValuation(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="boardSeatCheckbox"
                  checked={boardSeat}
                  onChange={(e) => setBoardSeat(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
                <label htmlFor="boardSeatCheckbox" className="text-xs text-slate-300 cursor-pointer">
                  Siège d'administrateur ou censeur au Board of Directors
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notes de gouvernance & points de suivi stratégique
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes sur la gouvernance, droits d'information..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>
            </form>
          </div>

          {/* Right Col: Periodic Updates & Board minutes */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mises à Jour Périodiques & Jalons
              </h3>

              <div className="space-y-3">
                {currentInvestment?.updates?.length ? (
                  currentInvestment.updates.map((upd, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{upd.date}</span>
                        {upd.kpi && <span className="text-emerald-400 font-semibold">{upd.kpi}</span>}
                      </div>
                      <p className="text-slate-200 leading-relaxed">{upd.summary}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic py-2">
                    Aucun compte-rendu périodique enregistré.
                  </div>
                )}
              </div>

              {/* Add update form */}
              <form onSubmit={handleAddUpdate} className="space-y-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="KPI clé (ex: ARR +40%)"
                  value={newUpdateKpi}
                  onChange={(e) => setNewUpdateKpi(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
                <textarea
                  rows={2}
                  placeholder="Compte-rendu du trimestre..."
                  value={newUpdateSummary}
                  onChange={(e) => setNewUpdateSummary(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors cursor-pointer"
                >
                  Ajouter un jalon trimestriel
                </button>
              </form>
            </div>

            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-[11px] text-slate-400 leading-relaxed">
              <strong>Note de réserve légale :</strong> Les multiples et scénarios de rendement présentés sont des
              simulations analytiques internes au fonds et ne constituent pas une valorisation certifiée ou garantie.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
