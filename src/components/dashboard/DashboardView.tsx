import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Building,
  Target,
  ArrowRight,
  Plus,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Euro,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { PIPELINE_STAGES, PipelineStageId } from '../../types';
import { ActiveTab } from '../layout/Header';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenStartup: (startupId: string) => void;
  onNewStartup: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenStartup,
  onNewStartup,
}) => {
  const { startups, analyses, financials, portfolio, tasks, interactions } = useVault();

  // Metrics calculations
  const activePipelineDeals = startups.filter(
    (s) => s.pipelineStage !== 'refuse' && s.pipelineStage !== 'investi'
  );

  const totalInvested = Object.values(portfolio).reduce((acc, p) => acc + p.investedAmount, 0);
  const totalPortfolioValue = Object.values(portfolio).reduce((acc, p) => {
    return acc + (p.currentValuation * (p.ownershipPercentage / 100));
  }, 0);

  const scoredAnalyses = Object.values(analyses);
  const avgCompositeScore =
    scoredAnalyses.length > 0
      ? (scoredAnalyses.reduce((acc, a) => acc + a.compositeScore, 0) / scoredAnalyses.length).toFixed(1)
      : '—';

  // Runway alerts: companies with less than 6 months of runway in current period
  const runwayAlerts = Object.values(financials).filter((m) => {
    const latestActualOrForecast = m.annualData[1] || m.annualData[0];
    return latestActualOrForecast && latestActualOrForecast.runwayMonths > 0 && latestActualOrForecast.runwayMonths <= 6;
  });

  // Stage distribution counts
  const stageCounts: Record<PipelineStageId, number> = {
    qualifier: 0,
    premier_contact: 0,
    analyse_preliminaire: 0,
    rencontre: 0,
    due_diligence: 0,
    negociation: 0,
    decision: 0,
    investi: 0,
    refuse: 0,
  };

  startups.forEach((s) => {
    if (stageCounts[s.pipelineStage] !== undefined) {
      stageCounts[s.pipelineStage]++;
    }
  });

  // Currency formatter
  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Tableau de Bord Exécutif</h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Coffre Chiffré AES-256-GCM Actif</span>
            <span aria-hidden="true">·</span>
            <span>{startups.length} dossiers persistés</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Zéro synchronisation cloud</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewStartup}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Dossier</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (High density, tabular figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pipeline Actif</span>
            <Building className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {activePipelineDeals.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dossiers en cours de qualification ou négociation
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Capital Investi</span>
            <Euro className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {formatEuro(totalInvested)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Valeur latente estimée : <span className="text-emerald-400 tabular-nums">{formatEuro(totalPortfolioValue)}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Score Moyen Analyses</span>
            <Target className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {avgCompositeScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Calculé sur {scoredAnalyses.length} grilles multi-critères
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Alertes Trésorerie</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {runwayAlerts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {runwayAlerts.length > 0
              ? 'Dossiers avec runway inférieur à 6 mois'
              : 'Aucun dossier critique détecté'}
          </div>
        </div>
      </div>

      {/* 9-Stage Pipeline Funnel Strip */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Entonnoir du Pipeline d'Investissement</h2>
            <p className="text-xs text-slate-400 mt-0.5">Répartition dynamique des 9 étapes prévues au cahier des charges</p>
          </div>
          <button
            onClick={() => setActiveTab('pipeline')}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Ouvrir Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {PIPELINE_STAGES.map((stg) => {
            const count = stageCounts[stg.id] || 0;
            return (
              <div
                key={stg.id}
                onClick={() => setActiveTab('pipeline')}
                className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="text-[11px] text-slate-400 truncate" title={stg.label}>
                  {stg.label}
                </div>
                <div className="text-lg font-bold text-slate-100 tabular-nums mt-1">
                  {count}
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1 rounded-full"
                    style={{
                      width: `${Math.min(100, (count / Math.max(1, startups.length)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split section: Active deals table + Pending tasks / Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Opportunities Table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Opportunités Récentes en Pipeline</h2>
            <button
              onClick={() => setActiveTab('startups')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Toutes les startups</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-medium">Startup</th>
                  <th className="pb-2.5 font-medium">Secteur & Stade</th>
                  <th className="pb-2.5 font-medium">Étape Actuelle</th>
                  <th className="pb-2.5 font-medium text-right">Cible Levée</th>
                  <th className="pb-2.5 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {startups.slice(0, 6).map((st) => {
                  const stageObj = PIPELINE_STAGES.find((s) => s.id === st.pipelineStage);
                  const an = analyses[st.id];

                  return (
                    <tr
                      key={st.id}
                      onClick={() => onOpenStartup(st.id)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 pr-3 font-semibold text-white group-hover:text-emerald-300">
                        {st.name}
                        <div className="text-[11px] font-normal text-slate-400">
                          {st.city}, {st.country}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        <div>{st.sector}</div>
                        <div className="text-[11px] text-slate-400">{st.stage}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs text-slate-300">
                          {stageObj?.label || st.pipelineStage}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-200">
                        {formatEuro(st.targetAmount)}
                      </td>
                      <td className="py-3 pl-2 text-right font-mono tabular-nums">
                        {an ? (
                          <span
                            className={
                              an.compositeScore >= 75
                                ? 'text-emerald-400 font-semibold'
                                : an.compositeScore >= 50
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }
                          >
                            {an.compositeScore.toFixed(0)}/100
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Relances & Tâches Due Diligence */}
        <div className="space-y-6">
          {/* Tasks & Follow-ups */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">Tâches & Relances</h2>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {tasks.filter((t) => !t.completed).length} en attente
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 5).map((tsk) => {
                const st = startups.find((s) => s.id === tsk.startupId);
                return (
                  <div
                    key={tsk.id}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs flex items-start gap-2.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-200 truncate">{tsk.title}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="text-emerald-400 font-semibold">{st?.name}</span>
                        <span aria-hidden="true">·</span>
                        <span>Échéance : {tsk.dueDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy reminder callout */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantie de Confidentialité VentureFlow</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Toutes les notes confidentielles, montants et documents de due diligence restent
              strictement chiffrés sur cette machine. Même lors d'un export sélectif, les notes
              privées sont exclues par défaut.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
