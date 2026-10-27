import React, { useState } from 'react';
import { X, Plus, Building, Save } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { Startup, PIPELINE_STAGES, PipelineStageId } from '../../types';

interface NewStartupModalProps {
  onClose: () => void;
  onCreated: (startupId: string) => void;
}

export const NewStartupModal: React.FC<NewStartupModalProps> = ({
  onClose,
  onCreated,
}) => {
  const { saveStartup } = useVault();

  const [name, setName] = useState('');
  const [sector, setSector] = useState('B2B SaaS / IA');
  const [stage, setStage] = useState<'Pre-seed' | 'Seed' | 'Série A' | 'Série B' | 'Growth'>('Seed');
  const [pipelineStage, setPipelineStage] = useState<PipelineStageId>('qualifier');
  const [country, setCountry] = useState('France');
  const [city, setCity] = useState('Paris');
  const [website, setWebsite] = useState('');
  const [foundedYear, setFoundedYear] = useState<number>(2025);
  const [targetAmount, setTargetAmount] = useState<number>(2000000);
  const [valuationAsked, setValuationAsked] = useState<number | undefined>(8000000);
  const [description, setDescription] = useState('');
  const [valueProposition, setValueProposition] = useState('');
  const [founderName, setFounderName] = useState('');
  const [founderRole, setFounderRole] = useState('CEO');
  const [founderEmail, setFounderEmail] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = `startup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newStartup: Startup = {
      id,
      name: name.trim(),
      sector,
      stage,
      country,
      city,
      website,
      foundedYear,
      description,
      valueProposition,
      founders: founderName
        ? [
            {
              name: founderName,
              role: founderRole,
              email: founderEmail,
            },
          ]
        : [],
      targetAmount,
      valuationAsked,
      currency: 'EUR',
      pipelineStage,
      confidentialNotes,
      tags: [sector, stage],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveStartup(newStartup);
    onCreated(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-xl flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">
              Nouveau Dossier d'Investissement
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Nom de la startup *</label>
              <input
                type="text"
                placeholder="Ex: Nexus Quantum..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Secteur d'activité</label>
              <input
                type="text"
                placeholder="Ex: Healthtech, Deeptech, Fintech..."
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Stade de levée</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white cursor-pointer"
              >
                <option value="Pre-seed">Pre-seed</option>
                <option value="Seed">Seed</option>
                <option value="Série A">Série A</option>
                <option value="Série B">Série B</option>
                <option value="Growth">Growth</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Étape initiale dans le Pipeline</label>
              <select
                value={pipelineStage}
                onChange={(e) => setPipelineStage(e.target.value as PipelineStageId)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white cursor-pointer"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Montant recherché (€)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Valorisation pré-money demandée (€)</label>
              <input
                type="number"
                value={valuationAsked || ''}
                onChange={(e) => setValuationAsked(parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Pays & Ville</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Pays"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Ville"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Site Web public</label>
              <input
                type="url"
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Description courte de l'opportunité</label>
            <textarea
              rows={2}
              placeholder="Activité principale, marché, clients cibles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white leading-relaxed"
            />
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase">Fondateur principal (Contact initial)</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nom complet"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
              />
              <input
                type="text"
                placeholder="Rôle (CEO...)"
                value={founderRole}
                onChange={(e) => setFounderRole(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
              />
              <input
                type="email"
                placeholder="Email direct"
                value={founderEmail}
                onChange={(e) => setFounderEmail(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Créer & Chiffrer dans le coffre</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
