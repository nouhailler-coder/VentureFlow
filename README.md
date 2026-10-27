# VentureFlow — Architecture Local-First & Confidentialité Financière Renforcée

**Version 2.0 — Spécification et Implémentation de Référence**

VentureFlow est une Progressive Web App (PWA) conçue pour les fonds d'investissement venture capital, business angels, family offices et analystes financiers. Elle combine un CRM d'opportunités, un atelier d'évaluation et de modélisation financière, un pipeline d'investissement en 9 étapes, une grille d'audit de due diligence et un centre de partage sélectif en lecture seule.

L'application repose sur un principe d'**architecture local-first stricte** : aucune donnée financière métier n'est transmise en clair à un tiers, et aucun serveur centralisé ne conserve les dossiers déchiffrés ou les clés cryptographiques.

---

## 1. Principes Structurants

1. **Confidentialité absolue au repos :** Chiffrement systématique côté client via Web Crypto API (AES-256-GCM, IV de 96 bits unique par enregistrement, dérivation de clé PBKDF2-SHA-256 à 250 000 itérations).
2. **Identification forte sans compte distant :** Déverrouillage local sécurisé via passkeys (WebAuthn / biométrie Touch ID, Face ID, Windows Hello) avec secours par phrase secrète à forte entropie.
3. **Absence de synchronisation cloud des données métier :** Pas de dépendance à Firebase, Firestore, Supabase ou une base de données PostgreSQL distante pour conserver les dossiers.
4. **Partage sélectif en lecture seule :** Deux modes de transmission exclusifs (Export chiffré autonome et Partage direct P2P entre navigateurs) garantissant qu'aucune note privée n'est transmise sans validation explicite.
5. **Fonctionnement hors ligne intégral :** Service Worker PWA avec mise en cache des actifs applicatifs, permettant la consultation, la saisie et les calculs sans connexion Internet.

---

## 2. Fonctionnalités Métier

- **CRM & Deal Flow :** Répertoire complet des opportunités d'investissement, fondateurs, thèses d'investissement, montants cibles et valorisations demandées.
- **Pipeline en 9 Étapes :** À qualifier, Premier contact, Analyse préliminaire, Rencontre, Due diligence, Négociation, Décision, Investi, Refusé/Abandonné (avec documentation obligatoire des motifs de rejet).
- **Scoring Multi-Critères :** Grille des 12 critères d'analyse (Équipe, Marché, Produit/IP, Traction, ARR, Marges, Burn rate, Runway, Concurrence, Risques, Exécution, Thèse de fonds) avec pondérations paramétrables et score composite sur 100.
- **Analyse Financière & P&L :** États historiques et prévisionnels sur 5 ans (Revenus/ARR, COGS, Marge brute, Opex, EBITDA, Trésorerie disponible, Burn rate mensuel et Runway en mois).
- **Atelier de Valorisation Multi-Méthodes :** 
  - Multiples de Revenus / ARR comparables
  - Multiples d'EBITDA
  - Flux de trésorerie actualisés (DCF avec WACC et valeur terminale)
  - Méthode VC (First Chicago)
  - Simulateur de tour de table, dilution fondateurs et pool ESOP
  - Synthèse et corridor de valorisation (Min / Médiane / Max).
- **Due Diligence Exhaustive :** 10 catégories d'audit réglementaire, financier, technique et RGPD, avec stockage chiffré des pièces jointes en Data Room locale.
- **Suivi de Portefeuille :** Participations réalisées, multiples bruts MOIC, scénarios de rendement et jalons de gouvernance.

---

## 3. Centre de Partage : Deux Modes Distincts

### Mode A — Export Chiffré Autonome
Production d'un rapport HTML ou d'un paquet `.ventureflow` chiffré côté client avec un secret convenu séparément. Le rapport HTML embarque son propre visualiseur Web Crypto statique et peut être ouvert hors-ligne dans n'importe quel navigateur moderne sans connexion serveur.

### Mode B — Partage Direct entre Navigateurs
Connexion directe éphémère (P2P WebRTC DataChannel) avec transmission de clé hors-bande, session en lecture seule et effacement mémoire à la fermeture de session.

---

## 4. Démarrage & Installation

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement local
npm run dev

# Compilation de production PWA
npm run build
```

---

## 5. Structure du Répertoire

- `src/crypto/` : Moteur cryptographique AES-256-GCM, PBKDF2, HMAC et service WebAuthn.
- `src/storage/` : Moteur IndexedDB local et inspecteur de non-divulgation.
- `src/context/` : Gestion du cycle de vie du coffre, clés de session et mutations chiffrées.
- `src/components/` : Interface utilisateur SaaS VC, tableau de bord, kanban, atelier de valorisation et centre de partage.
- `docs/` : Documentation formelle d'architecture, cryptographie, modèle de menace et tests.
