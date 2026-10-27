# Journal des Modifications (CHANGELOG)

Toutes les modifications notables apportées au projet **VentureFlow** sont consignées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/), et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [2.1.0] - 2026-10-27

### 🛡️ Sécurité & Cryptographie (Audit & Durcissement Majeur)
- **WebAuthn PRF (Pseudo-Random Function) Level 3 :**
  - Refonte complète de `src/crypto/passkeyService.ts` avec implémentation de l'extension `prf` pour l'authentification biométrique.
  - Dérivation de clé cryptographique via HKDF-SHA-256 à partir des 32 octets bruts du matériel d'authentification.
  - Suppression totale des faux déverrouillages biométriques ; affichage transparent si l'authentificateur local ne supporte pas l'extension PRF.
- **Restauration de Sauvegardes Atomique & Sécurisée :**
  - Validation préalable du schéma JSON de sauvegarde avant tout accès aux magasins de données.
  - Test de déverrouillage de la clé maîtresse avec la phrase secrète fournie *avant* d'altérer la base locale IndexedDB.
  - Sauvegarde en mémoire vive avec mécanisme de retour arrière (rollback) automatique en cas d'échec d'insertion.
- **Prévention Complète des Failles XSS dans les Exports HTML :**
  - Ajout d'une balise Content Security Policy (CSP) ultra-stricte dans le visualiseur autonome exporté.
  - Échappement systématique des entrées utilisateur via `escapeHtml()`.
  - Élimination des assignations `innerHTML` non protégées au profit de constructions DOM sécurisées (`textContent`, `createElement`).
- **Partage Direct Poste-à-Poste (P2P) WebRTC Réel (Mode B) :**
  - Création de `src/services/p2pShareService.ts` avec `RTCPeerConnection` et `RTCDataChannel`.
  - Prise en charge des échanges SDP (offre/réponse chiffrée) et secours par `BroadcastChannel` pour les tests inter-onglets.
  - Interface dédiée émetteur/récepteur dans `SharingCenterView.tsx`.
- **Suite de Tests Automatisés (Vitest) :**
  - 16 tests unitaires et d'intégration validant les composants cryptographiques, WebAuthn PRF, le partage sélectif et la validation des sauvegardes.

---

## [2.0.0] - 2026-10-27

### ✨ Nouvelles Fonctionnalités & Expérience Utilisateur
- **Menu Hamburger Catégorisé :**
  - Organisation hiérarchique des modules : Deal Flow & Startups, Évaluation Financière, Audit & Due Diligence, Gouvernance & Sécurité, Paramètres Système.
- **Paramètres Système & Mises à Jour en Arrière-Plan :**
  - Affichage de la date de sortie, de la date de dernière vérification et des numéros de révision.
  - Boutons « Vérifier les mises à jour » et « Forcer la mise à jour » avec notification Toast.
  - Service de vérification périodique automatique en arrière-plan via `SystemUpdateContext`.
- **Thème Clair & Thème Sombre :**
  - Support natif de la bascule Thème Clair / Thème Sombre via Tailwind CSS avec persistance des préférences utilisateur.
- **Onboarding Légal & Contextuel :**
  - Modal d'onboarding juridique explicitant la clause de non-responsabilité relative aux estimations et données financières saisies.
  - Infobulles contextuelles d'aide à la saisie sur les métriques clés (DCF, WACC, ARR, Burn rate).
- **Installation PWA Guidée :**
  - Bouton interactif « Installer l'application » dans l'en-tête et le menu.
  - Modal d'instructions pas-à-pas pour navigateurs mobiles (iOS Safari, Android Chrome) et desktop.
- **Actifs Visuels Enrichis :**
  - Intégration du logo officiel et des captures d'écran de prévisualisation dans la documentation et l'interface.

---

## [1.0.0] - 2026-10-20

### 🚀 Version Initiale
- CRM Startups et répertoire des fondateurs.
- Pipeline d'investissement Kanban en 9 étapes.
- Grille d'évaluation financière et modèles de valorisation (Multiples, DCF, Méthode VC).
- Module d'audit Due Diligence et Data Room locale chiffrée.
- Chiffrement initial au repos dans IndexedDB avec AES-256-GCM.
