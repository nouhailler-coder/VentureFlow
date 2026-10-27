import React, { useState } from 'react';
import {
  Kanban,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Building,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { PIPELINE_STAGES, PipelineStageId, Startup } from '../../types';

interface PipelineViewProps {
  onOpenStartup: (id: string) => void;
  onNewStartup: () => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  onOpenStartup,
  onNewStartup,
}) => {
  const { startups, analyses, saveStartup } = useVault();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Refusal modal state
  const [refusalModalTarget, setRefusalModalTarget] = useState<Startup | null>(null);
  const [refusalReason, setRefusalReason] = useState('');

  const formatEuro = (val: number | undefined) => {
    if (!val) return '—';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleStageMove = async (
    startup: Startup,
    newStage: PipelineStageId
  ) => {
    if (newStage === 'refuse') {
      setRefusalModalTarget(startup);
      return;
    }

    const updated: Startup = {
      ...startup,
      pipelineStage: newStage,
    };
    await saveStartup(updated);
  };

  const confirmRefusal = async () => {
    if (!refusalModalTarget) return;
    const updated: Startup = {
      ...refusalModalTarget,
      pipelineStage: 'refuse',
      refusalReason: refusalReason || 'Non aligné avec les critères actuels du fonds',
      refusalDate: new Date().toISOString().slice(0, 10),
    };
    await saveStartup(updated);
    setRefusalModalTarget(null);
    setRefusalReason('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Pipeline d'Investissement</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Suivi des dossiers à travers les 9 étapes du cahier des charges
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
          </div>

          <button
            onClick={onNewStartup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Deal</span>
          </button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x">
          {PIPELINE_STAGES.map((stage, sIdx) => {
            const stageDeals = startups.filter((s) => s.pipelineStage === stage.id);
            const totalStageVolume = stageDeals.reduce((acc, s) => acc + s.targetAmount, 0);

            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col max-h-[75vh]"
              >
                {/* Column header */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 rounded-t-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{stage.label}</span>
                    <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between font-mono tabular-nums">
                    <span>Volume :</span>
                    <span className="text-slate-800 dark:text-slate-300 font-medium">{formatEuro(totalStageVolume)}</span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 dark:text-slate-600 border border-dashed border-slate-300 dark:border-slate-800/60 rounded-lg">
                      Aucun dossier
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const an = analyses[deal.id];
                      return (
                        <div
                          key={deal.id}
                          onClick={() => onOpenStartup(deal.id)}
                          className="p-3 bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs hover:border-emerald-500 dark:hover:border-slate-700 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                              {deal.name}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {deal.stage}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {deal.description}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                            <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                              {formatEuro(deal.targetAmount)}
                            </span>
                            {an && (
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                Score: <strong className="text-slate-900 dark:text-white">{an.compositeScore.toFixed(0)}</strong>
                              </span>
                            )}
                          </div>

                          {/* Quick stage move buttons */}
                          <div
                            className="flex items-center justify-between mt-2.5 pt-1.5 text-[10px] text-slate-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              disabled={sIdx === 0}
                              onClick={() => handleStageMove(deal, PIPELINE_STAGES[sIdx - 1].id)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Déplacer vers l'étape précédente"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>

                            <select
                              value={deal.pipelineStage}
                              onChange={(e) => handleStageMove(deal, e.target.value as PipelineStageId)}
                              className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                              {PIPELINE_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                            </select>

                            <button
                              disabled={sIdx === PIPELINE_STAGES.length - 1}
                              onClick={() => handleStageMove(deal, PIPELINE_STAGES[sIdx + 1].id)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Avancer à l'étape suivante"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-medium">Startup</th>
                  <th className="py-3 px-3 font-medium">Étape Actuelle</th>
                  <th className="py-3 px-3 font-medium">Secteur</th>
                  <th className="py-3 px-3 font-medium text-right">Montant Cible</th>
                  <th className="py-3 px-3 font-medium">Date Relance</th>
                  <th className="py-3 px-4 font-medium text-right">Changer Étape</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {startups.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => onOpenStartup(st.id)}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-semibold text-white group-hover:text-emerald-300">
                      {st.name}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {PIPELINE_STAGES.find((s) => s.id === st.pipelineStage)?.label}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{st.sector}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                      {formatEuro(st.targetAmount)}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {st.followUpDate || '—'}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={st.pipelineStage}
                        onChange={(e) => handleStageMove(st, e.target.value as PipelineStageId)}
                        className="text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 cursor-pointer"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refusal Reason Modal */}
      {refusalModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Motif de Refus / Abandon</span>
              </h3>
              <button
                onClick={() => setRefusalModalTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-300">
                Vous déplacez <strong>{refusalModalTarget.name}</strong> dans la catégorie
                <em> Refusé ou Abandonné</em>. Documentez le motif pour conserver l'historique d'apprentissage du fonds.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Motif du refus
                </label>
                <textarea
                  rows={3}
                  value={refusalReason}
                  onChange={(e) => setRefusalReason(e.target.value)}
                  placeholder="Ex : Valorisation trop élevée, CAC non prouvé, concurrence frontale avec une société du portefeuille..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefusalModalTarget(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmRefusal}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded transition-colors"
                >
                  Confirmer le classement en refusé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
