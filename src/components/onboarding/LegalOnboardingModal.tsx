import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  FileText,
  AlertTriangle,
  Scale,
  Lock,
  ChevronRight,
  Info,
} from 'lucide-react';

interface LegalOnboardingModalProps {
  isOpen: boolean;
  onAccept: () => void;
  isRevisit?: boolean;
}

export const LegalOnboardingModal: React.FC<LegalOnboardingModalProps> = ({
  isOpen,
  onAccept,
  isRevisit = false,
}) => {
  const [acceptedCheckbox, setAcceptedCheckbox] = useState(isRevisit);
  const [activeSection, setActiveSection] = useState<'presentation' | 'disclaimer' | 'confidentiality'>('disclaimer');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!acceptedCheckbox && !isRevisit) return;
    localStorage.setItem('ventureflow_legal_onboarding_accepted', 'true');
    localStorage.setItem('ventureflow_legal_onboarding_date', new Date().toISOString());
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh] overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bienvenue sur VentureFlow
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mentions Légales & Clause Exonératoire de Responsabilité
              </p>
            </div>
          </div>
          {isRevisit && (
            <button
              onClick={onAccept}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-950/30 text-xs">
          <button
            onClick={() => setActiveSection('presentation')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeSection === 'presentation'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            1. Présentation de l'outil
          </button>
          <button
            onClick={() => setActiveSection('disclaimer')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeSection === 'disclaimer'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            2. Clause de Non-Responsabilité
          </button>
          <button
            onClick={() => setActiveSection('confidentiality')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeSection === 'confidentiality'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            3. Souveraineté & Chiffrement
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {activeSection === 'presentation' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-500" />
                <span>Outil d'Analyse & CRM d'Investissement Local-First</span>
              </h3>
              <p>
                VentureFlow est une application progressive (PWA) conçue pour aider les investisseurs, business angels et analystes financiers à structurer leurs dossiers d'investissement, simuler des valorisations (DCF, Multiples, VC Method), suivre un pipeline de dealflow et mener des audits de due diligence.
              </p>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1 text-emerald-900 dark:text-emerald-200">
                <div className="font-semibold text-xs">Architecture 100% Client-Side :</div>
                <p className="text-[11px] leading-relaxed">
                  L'application s'exécute exclusivement dans votre navigateur. Aucune donnée n'est envoyée à des serveurs tiers ou bases distantes. Vos dossiers sont chiffrés au repos dans votre base IndexedDB locale.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'disclaimer' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-xs uppercase tracking-wide">
                    Exonération Totale de Responsabilité
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    L'auteur, le développeur et l'éditeur de l'application déclinent formellement toute responsabilité quant aux données saisies dans l'application, à leur utilisation, à l'exactitude des calculs et aux décisions d'investissement prises.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                  Conditions Générales d'Utilisation & Limites Légales :
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-[11px] bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <li>
                    <strong>Non-responsabilité des données fournies :</strong> L'utilisateur est seul et exclusivement responsable des données financières, noms de sociétés, prévisions et notes qu'il saisit ou importe dans l'application.
                  </li>
                  <li>
                    <strong>Absence de conseil financier :</strong> Les modèles de valorisation, multiples de marché, scores composites et simulations de dilution sont fournis à titre purement indicatif et analytique. Ils ne constituent en aucun cas un conseil en investissement, une recommandation d'achat ou de vente de titres, ni un audit financier certifié.
                  </li>
                  <li>
                    <strong>Absence de garantie de résultat ou de gain :</strong> Les performances passées ou simulées ne préjugent pas des résultats futurs. Tout investissement en capital comporte des risques élevés de perte intégrale du capital investi et d'illiquidité.
                  </li>
                  <li>
                    <strong>Responsabilité des sauvegardes :</strong> Fonctionnant en mode local-first et sans compte centralisé, la conservation de la phrase secrète maîtresse et l'exportation régulière de sauvegardes relèvent de la seule responsabilité de l'utilisateur. En cas d'oubli de la phrase secrète ou de perte de l'appareil, aucune récupération n'est possible par l'éditeur.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeSection === 'confidentiality' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Confidentialité et Zéro Transmission Tiers</span>
              </h3>
              <p>
                Conformément à la spécification v2.0, l'ensemble des données financières (valorisations, revenus, burn rate, notes confidentielles) est scellé via l'algorithme W3C Web Crypto <strong>AES-256-GCM</strong>.
              </p>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <li>Aucun serveur cloud ne possède vos clés de déchiffrement.</li>
                <li>Aucune donnée métier n'est transmise à des régies publicitaires ou services d'IA sans consentement préalable explicite.</li>
                <li>Les exports partagés en lecture seule excluent automatiquement les notes privées par défaut.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer with Acceptance Checkbox */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptedCheckbox}
              onChange={(e) => setAcceptedCheckbox(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              J'ai lu et j'accepte expressément les mentions légales et la clause de non-responsabilité stipulant que l'éditeur n'est en aucun cas responsable des données saisies, de leur exactitude ou des décisions d'investissement.
            </span>
          </label>

          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              VentureFlow v2.1.0 · Version stable
            </div>

            <button
              onClick={handleConfirm}
              disabled={!acceptedCheckbox && !isRevisit}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>{isRevisit ? 'Fermer les mentions légales' : 'Accepter et Accéder à VentureFlow'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
