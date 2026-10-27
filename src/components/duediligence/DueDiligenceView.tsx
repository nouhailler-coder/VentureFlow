import React, { useState } from 'react';
import {
  FileCheck2,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Paperclip,
  Upload,
  Plus,
  Filter,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { DueDiligenceItem, DueDiligenceCategory } from '../../types';

export const DueDiligenceView: React.FC = () => {
  const { startups, dueDiligence, attachments, saveDueDiligenceItem, addAttachment } = useVault();

  const [selectedStartupId, setSelectedStartupId] = useState<string>(
    startups[0]?.id || ''
  );

  const currentStartup = startups.find((s) => s.id === selectedStartupId);
  const currentItems = dueDiligence[selectedStartupId] || [];
  const currentAttachments = attachments.filter((a) => a.startupId === selectedStartupId);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<DueDiligenceCategory>('corporate_capital');
  const [newRisk, setNewRisk] = useState<'faible' | 'moyen' | 'eleve'>('faible');

  const categories: { id: DueDiligenceCategory; label: string }[] = [
    { id: 'corporate_capital', label: '1. Société & Actionnariat' },
    { id: 'equipe_rh', label: '2. Équipe & Ressources Humaines' },
    { id: 'finances_audit', label: '3. Finances & Comptabilité' },
    { id: 'produit_tech', label: '4. Produit & Architecture Tech' },
    { id: 'propriete_intellectuelle', label: '5. Propriété Intellectuelle (IP)' },
    { id: 'marche_clients', label: '6. Marché & Clients' },
    { id: 'contrats_fournisseurs', label: '7. Contrats Clients & Fournisseurs' },
    { id: 'juridique_reglementaire', label: '8. Risques Juridiques & Réglementaires' },
    { id: 'cybersecurite_rgpd', label: '9. Cybersécurité & RGPD' },
    { id: 'esg_gouvernance', label: '10. Environnement & ESG' },
  ];

  const filteredItems = currentItems.filter((item) => {
    const matchCat = filterCategory === 'all' || item.category === filterCategory;
    const matchStat = filterStatus === 'all' || item.status === filterStatus;
    return matchCat && matchStat;
  });

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !selectedStartupId) return;

    const catObj = categories.find((c) => c.id === newCategory);
    const item: DueDiligenceItem = {
      id: `dd_${Date.now()}`,
      startupId: selectedStartupId,
      category: newCategory,
      categoryLabel: catObj?.label || newCategory,
      title: newTitle,
      description: newDescription,
      status: 'non_demarre',
      riskLevel: newRisk,
      findings: '',
    };

    await saveDueDiligenceItem(item);
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStartupId) return;
    await addAttachment(selectedStartupId, file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Audit & Due Diligence</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Grille de contrôle exhaustive en 10 catégories avec chiffrement client des pièces jointes
          </p>
        </div>

        {/* Startup selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 whitespace-nowrap">Dossier :</label>
          <select
            value={selectedStartupId}
            onChange={(e) => setSelectedStartupId(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white cursor-pointer"
          >
            {startups.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.stage})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Point d'Audit</span>
          </button>
        </div>
      </div>

      {/* Filters & KPI strip */}
      <div className="flex flex-col md:flex-row gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300 cursor-pointer"
        >
          <option value="all">Toutes les 10 catégories d'audit</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300 cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="valide">Validé</option>
          <option value="en_cours">En cours</option>
          <option value="bloquant">Bloquant (Deal breaker)</option>
          <option value="non_demarre">Non démarré</option>
        </select>
      </div>

      {/* Checklist items list */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
            Aucun point d'audit enregistré pour cette sélection.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 bg-slate-900/80 border rounded-xl space-y-3 transition-colors ${
                item.status === 'bloquant'
                  ? 'border-rose-900/80 bg-rose-950/20'
                  : item.status === 'valide'
                  ? 'border-emerald-900/60 bg-emerald-950/10'
                  : 'border-slate-800/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.status === 'valide' && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {item.status === 'bloquant' && <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />}
                  {item.status === 'en_cours' && <Clock className="w-4 h-4 text-amber-400 shrink-0" />}
                  {item.status === 'non_demarre' && <div className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />}
                  <span className="font-semibold text-xs text-white">{item.title}</span>
                  <span className="text-[11px] text-slate-500">· {item.categoryLabel}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status select */}
                  <select
                    value={item.status}
                    onChange={async (e) => {
                      const updated: DueDiligenceItem = {
                        ...item,
                        status: e.target.value as any,
                        verifiedAt: e.target.value === 'valide' ? new Date().toISOString().slice(0, 10) : item.verifiedAt,
                      };
                      await saveDueDiligenceItem(updated);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-semibold border cursor-pointer ${
                      item.status === 'valide'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : item.status === 'bloquant'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : item.status === 'en_cours'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <option value="non_demarre">Non démarré</option>
                    <option value="en_cours">En cours</option>
                    <option value="valide">Validé</option>
                    <option value="bloquant">Bloquant</option>
                  </select>

                  {/* Risk select */}
                  <select
                    value={item.riskLevel}
                    onChange={async (e) => {
                      const updated: DueDiligenceItem = {
                        ...item,
                        riskLevel: e.target.value as any,
                      };
                      await saveDueDiligenceItem(updated);
                    }}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 cursor-pointer"
                  >
                    <option value="faible">Risque Faible</option>
                    <option value="moyen">Risque Moyen</option>
                    <option value="eleve">Risque Élevé</option>
                  </select>
                </div>
              </div>

              {item.description && (
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              )}

              {/* Findings textarea */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Constats de l'audit & observations de l'équipe
                </label>
                <textarea
                  rows={2}
                  value={item.findings}
                  onChange={async (e) => {
                    const updated = { ...item, findings: e.target.value };
                    await saveDueDiligenceItem(updated);
                  }}
                  placeholder="Notes d'audit..."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200"
                />
              </div>

              {item.verifiedAt && (
                <div className="text-[10px] text-slate-500 font-mono">
                  Dernière validation : {item.verifiedAt}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Encrypted Data Room Section */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-emerald-400" />
              <span>Pièces Jointes & Documents Scellés (Data Room Locale)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chiffrés côté client avant écriture dans IndexedDB. Aucun serveur ne peut lire le contenu des documents.
            </p>
          </div>

          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Chiffrer & Ajouter un fichier</span>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {currentAttachments.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-3">
            Aucun document attaché à ce dossier pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentAttachments.map((att) => (
              <div
                key={att.id}
                className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1"
              >
                <div className="font-medium text-white truncate">{att.filename}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {(att.fileSize / 1024).toFixed(1)} KB · Scellé AES-256
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  {att.uploadedAt.slice(0, 10)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                Nouveau Point de Due Diligence
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Catégorie</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DueDiligenceCategory)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Intitulé du point d'audit</label>
                <input
                  type="text"
                  placeholder="Ex : Examen de la convention de données hospitalières"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Objectif</label>
                <textarea
                  rows={2}
                  placeholder="Éléments à vérifier..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Niveau de risque initial</label>
                <select
                  value={newRisk}
                  onChange={(e) => setNewRisk(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                >
                  <option value="faible">Faible</option>
                  <option value="moyen">Moyen</option>
                  <option value="eleve">Élevé</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded transition-colors"
                >
                  Ajouter à la checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
