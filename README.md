<div align="center">

<img src="./public/images/logo.jpg" alt="VentureFlow Logo" width="120" style="border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); margin-bottom: 16px;" />

# 🛡️ VentureFlow — CRM & Valorisation Startups Local-First

**PWA d'analyse d'investissement, modélisation financière et coffre-fort cryptographique local**

[![Version](https://img.shields.io/badge/version-2.1.0--audit--hardened-emerald.svg?style=for-the-badge)](./CHANGELOG.md)
[![Security](https://img.shields.io/badge/chiffrement-AES--256--GCM%20%7C%20WebAuthn%20PRF-blue.svg?style=for-the-badge)](./SECURITY.md)
[![Privacy](https://img.shields.io/badge/données-100%25%20Local--First-purple.svg?style=for-the-badge)](./CONTEXT.md)
[![PWA](https://img.shields.io/badge/PWA-Hors--Ligne%20%26%20Installable-orange.svg?style=for-the-badge)](#-installation-pwa)
[![Tests](https://img.shields.io/badge/tests-16%2F16%20Passés%20(Vitest)-brightgreen.svg?style=for-the-badge)](#-tests-automatisés)

---

<p align="center">
  <b>Conçu pour les Business Angels, Fonds VC, Family Offices et Analystes Financiers exigeant une confidentialité absolue.</b><br/>
  <i>Zéro synchronisation cloud non chiffrée • Zéro fuite réseau • Chiffrement de niveau bancaire côté client</i>
</p>

<img src="./public/images/dashboard-preview.jpg" alt="VentureFlow Dashboard Preview" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); width: 100%; max-width: 900px; margin: 20px 0; box-shadow: 0 12px 36px rgba(0,0,0,0.4);" />

</div>

---

## 🌟 Points Forts & Garanties Fondamentales

- 🔒 **Coffre Chiffré Local (AES-256-GCM) :** Clé de déchiffrement des données (DEK) 256 bits scellée par dérivation de clé PBKDF2-SHA-256 (250 000 itérations) ou par extension WebAuthn PRF.
- 🔑 **Authentification Passkey Biométrique Réelle (WebAuthn Level 3 PRF) :** Déverrouillage matériel natif (Touch ID, Face ID, Windows Hello, clés FIDO2) avec dérivation cryptographique directe. Si le matériel ne supporte pas PRF, l'interface informe honnêtement l'utilisateur et privilégie la phrase de passe maîtresse.
- 📊 **CRM & Pipeline d'Investissement 9 Étapes :** Suivi fluide du dealflow de la qualification au closing ou refus motivé.
- 🧮 **Atelier de Valorisation Multi-Méthodes :** Multiples ARR/EBITDA, DCF actualisé (WACC & Valeur Terminale), Méthode Venture Capital (First Chicago), simulation de tour de table, dilution et pool BSPCE/ESOP.
- 📋 **Due Diligence Exhaustive :** 10 axes d'audit (financier, juridique, technique, RGPD, concurrence, etc.) avec Data Room locale chiffrée.
- 🛡️ **Partage Sécurisé & Protection Anti-XSS :**
  - **Mode A (Fichier autonome chiffré) :** Export `.ventureflow` ou rapport HTML autonome avec Content Security Policy stricte (`default-src 'none'`), échappement HTML rigoureux et visualiseur statique intégré.
  - **Mode B (P2P direct WebRTC) :** Échange poste-à-poste éphémère sans serveur intermédiaire, déchiffrement immédiat en mémoire vive.
- 💾 **Restauration de Sauvegardes Sécurisée :** Validation stricte du schéma, déverrouillage préalable de validation *avant* toute altération de la base, et rollback transactionnel en cas d'erreur.
- 📱 **PWA Installable & Hors-Ligne :** Bouton « Installer l'application » guidé (desktop & mobile), Service Worker avec mise en cache des actifs, vérification des mises à jour automatique en arrière-plan.
- 🌓 **Thème Sombre & Thème Clair :** Bascule instantanée respectant les préférences du système ou choix manuel de l'utilisateur.
- 🧭 **Menu Hamburger & Onboarding Contextuel :** Navigation par catégories fonctionnelles, infobulles contextuelles et mentions légales d'exonération de responsabilité des données.

---

## 🏗️ Architecture Cryptographique

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NAVIGATEUR (LOCAL ONLY)                         │
│                                                                        │
│   ┌────────────────────────┐             ┌─────────────────────────┐   │
│   │  Phrase de Passe       │             │   Biométrie Passkey     │   │
│   │  (Entropie forte)      │             │   (WebAuthn PRF L3)     │   │
│   └───────────┬────────────┘             └────────────┬────────────┘   │
│               │                                       │                │
│    PBKDF2-SHA-256 (250k)                         HKDF-SHA-256          │
│               ▼                                       ▼                │
│   ┌────────────────────────┐             ┌─────────────────────────┐   │
│   │ Wrapping Key Passphrase│             │   Wrapping Key Passkey  │   │
│   └───────────┬────────────┘             └────────────┬────────────┘   │
│               │                                       │                │
│               └─────────────► ┌──────────────────────┐◄────────────────┘   │
│                               │   Clé Maîtresse DEK  │                 │
│                               │   (AES-256-GCM)      │                 │
│                               └──────────┬───────────┘                 │
│                                          │                             │
│                  AES-256-GCM + IV 96 bits│unique par document          │
│                                          ▼                             │
│                               ┌──────────────────────┐                 │
│                               │ IndexedDB (Chiffrée) │                 │
│                               └──────────────────────┘                 │
└────────────────────────────────────────────────────────────────────────┘
```

> ⚠️ **Limite Fondamentale Documentée :**  
> Une application web distribuée statiquement (ou servie via HTTP) dépend de l'intégrité de la chaîne de distribution. Si le serveur d'hébergement ou un CDN venait à être compromis, du code JavaScript malveillant pourrait être injecté et lire la mémoire après déverrouillage. Le chiffrement local garantit la protection au repos et prévient toute fuite vers des tiers, mais ne peut remplacer la sécurité du système d'exploitation de l'hôte.

---

## 🚀 Installation & Utilisation

### Prérequis
- Node.js 18+ ou 20+
- Navigateur moderne avec support Web Crypto (Chrome 90+, Safari 16+, Firefox 90+, Edge 90+)

### Démarrage Rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/nouhailler-coder/VentureFlow.git
cd VentureFlow

# 2. Installer les dépendances
npm install

# 3. Lancer en mode développement
npm run dev

# 4. Lancer la suite de tests automatisés (100% verts)
npm test

# 5. Compiler pour la production
npm run build
```

---

## 📲 Installation PWA (Desktop & Mobile)

VentureFlow est une Progressive Web App certifiée :
1. Cliquez sur le bouton **« Installer l'application »** présent dans la barre supérieure ou dans le **Menu Hamburger**.
2. **Sur Chrome / Edge / Brave (Desktop) :** Cliquez sur « Installer » dans la boîte de dialogue système pour obtenir une fenêtre d'application native dédiée sans barre d'URL.
3. **Sur Safari iOS (iPhone / iPad) :** Touchez l'icône de partage, puis faites défiler jusqu'à **« Sur l'écran d'accueil »**.
4. **Sur Android :** Touchez le menu du navigateur puis **« Ajouter à l'écran d'accueil »** ou **« Installer l'application »**.

---

## 🧪 Tests Automatisés

Le dépôt intègre une suite de tests unitaires et d'intégration validant les 8 exigences de sécurité du cahier des charges :

```bash
npm test
```

### Couverture des Tests :
- ✅ **`src/__tests__/vaultCrypto.test.ts`** : Chiffrement/déchiffrement AES-GCM 256 bits, dérivation PBKDF2 250k itérations, détection d'altération du tag d'authentification et intégrité HMAC-SHA-256.
- ✅ **`src/__tests__/passkeyService.test.ts`** : Détection des capacités WebAuthn, dérivation de clé HKDF-SHA-256 à partir de sorties PRF 32 octets et gestion des erreurs de longueur.
- ✅ **`src/__tests__/shareService.test.ts`** : Exclusion stricte des notes confidentielles par défaut, inclusion conditionnelle explicite, chiffrement/déchiffrement des paquets `.ventureflow`, rejet en cas de mot de passe erroné, prévention des injections XSS et respect de la CSP dans le rapport HTML autonome.
- ✅ **`src/__tests__/backupValidation.test.ts`** : Validation stricte du schéma JSON des sauvegardes et rejet immédiat des structures altérées ou incomplètes.

---

## 📂 Organisation du Code Source

```
├── public/                 # Actifs publics statiques, icônes PWA, logos et images
├── src/
│   ├── __tests__/          # Suites de tests automatisés Vitest
│   ├── components/         # Composants React de l'interface
│   │   ├── audit/          # Grille d'audit Due Diligence & Data Room
│   │   ├── crm/            # Fiches startups & CRM
│   │   ├── dashboard/      # Tableau de bord analytique
│   │   ├── pipeline/       # Kanban d'investissement 9 étapes
│   │   ├── portfolio/      # Suivi des participations & MOIC
│   │   ├── sharing/        # Centre de partage Mode A (Fichier) & Mode B (P2P WebRTC)
│   │   ├── valuation/      # Simulateurs de valorisation (DCF, Multiples, VC)
│   │   └── vault/          # Écrans de déverrouillage, passkeys et configuration coffre
│   ├── context/            # Contextes React (VaultContext, SystemUpdateContext, ThemeContext)
│   ├── crypto/             # Moteur Web Crypto AES-256-GCM, WebAuthn PRF, PBKDF2
│   ├── services/           # Services métier (P2P WebRTC, Share Export, Analyse financière)
│   ├── storage/            # Gestionnaire IndexedDB local sécurisé
│   └── types/              # Définitions TypeScript strictes
├── docs/                   # Spécifications détaillées d'architecture et de sécurité
├── CHANGELOG.md            # Historique des versions et correctifs
├── CONTEXT.md              # Synthèse d'architecture et conformité d'audit
└── SECURITY.md             # Politique de sécurité et limites documentées
```

---

## ⚖️ Mentions Légales & Responsabilité

VentureFlow est un outil logiciel d'aide à la décision financière et d'organisation documentaire. L'utilisateur assume l'entière responsabilité des hypothèses de valorisation, des taux d'actualisation saisis, des données d'analyse et de la sauvegarde de ses clés ou phrases secrètes. Aucune garantie de performance financière ou de conseil en investissement n'est fournie par les auteurs du logiciel.

---

<div align="center">
  <sub>Développé avec rigueur cryptographique • VentureFlow • Tous droits réservés</sub>
</div>
