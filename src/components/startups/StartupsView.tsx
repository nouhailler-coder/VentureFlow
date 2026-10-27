import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Building,
  Target,
  Filter,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { Startup, PIPELINE_STAGES, PipelineStageId } from '../../types';

interface StartupsViewProps {
  onOpenStartup: (id: string) => void;
  onNewStartup: () => void;
}

export const StartupsView: React.FC<StartupsViewProps> = ({
  onOpenStartup,
  onNewStartup,
}) => {
  const { startups, analyses, deleteStartup } = useVault();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // Sectors list
  const sectors = useMemo(() => {
    const set = new Set<string>();
    startups.forEach((s) => {
      if (s.sector) set.add(s.sector);
    });
    return Array.from(set);
  }, [startups]);

  // Filtered startups
  const filteredStartups = useMemo(() => {
    return startups.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStage = selectedStage === 'all' || s.pipelineStage === selectedStage;
      const matchSector = selectedSector === 'all' || s.sector === selectedSector;

      return matchSearch && matchStage && matchSector;
    });
  }, [startups, searchTerm, selectedStage, selectedSector]);

  const formatEuro = (val: number | undefined) => {
    if (!val) return '—';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-5">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Répertoire des Startups (CRM)</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {filteredStartups.length} startup{filteredStartups.length > 1 ? 's' : ''} indexée{filteredStartups.length > 1 ? 's' : ''} sous chiffrement AES-256 local
          </p>
        </div>

        <button
          onClick={onNewStartup}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter une Startup</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville, technologie, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Toutes les étapes (9)</option>
            {PIPELINE_STAGES.map((stg) => (
              <option key={stg.id} value={stg.id}>
                {stg.label}
              </option>
            ))}
          </select>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Tous les secteurs</option>
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Startups Table / Data Grid */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-medium">Société & Localisation</th>
                <th className="py-3 px-3 font-medium">Secteur d'activité</th>
                <th className="py-3 px-3 font-medium">Stade & Étape Pipeline</th>
                <th className="py-3 px-3 font-medium text-right">Recherche Levée</th>
                <th className="py-3 px-3 font-medium text-right">Valo Demandée</th>
                <th className="py-3 px-3 font-medium text-right">Score VC</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredStartups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Aucune opportunité ne correspond aux critères de filtre.
                  </td>
                </tr>
              ) : (
                filteredStartups.map((st) => {
                  const stageObj = PIPELINE_STAGES.find((s) => s.id === st.pipelineStage);
                  const an = analyses[st.id];

                  return (
                    <tr
                      key={st.id}
                      onClick={() => onOpenStartup(st.id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                          {st.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {st.city}, {st.country} {st.foundedYear ? `· Créée en ${st.foundedYear}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <div>{st.sector}</div>
                        {st.tags && st.tags.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {st.tags.slice(0, 2).join(' · ')}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{st.stage}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {stageObj?.label || st.pipelineStage}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                        {formatEuro(st.targetAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {formatEuro(st.valuationAsked)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        {an ? (
                          <span
                            className={
                              an.compositeScore >= 75
                                ? 'text-emerald-400 font-bold'
                                : an.compositeScore >= 50
                                ? 'text-amber-400 font-semibold'
                                : 'text-slate-400'
                            }
                          >
                            {an.compositeScore.toFixed(0)}/100
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onOpenStartup(st.id)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Ouvrir le dossier"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Confirmer la suppression du dossier "${st.name}" ?`)) {
                                await deleteStartup(st.id);
                              }
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            title="Supprimer du coffre"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
