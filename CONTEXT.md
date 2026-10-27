# VentureFlow — Contexte du Projet & Rapport d'Audit Technique

**Dépôt GitHub :** `https://github.com/nouhailler-coder/VentureFlow`  
**Version :** 2.1.0  
**Date d'audit & finalisation :** 27 Octobre 2026  
**Auditeur :** Ingénieur Cryptographie & Sécurité Applicative  

---

## 1. Contexte & Objectifs

VentureFlow est une Progressive Web App (PWA) destinée aux acteurs de l'investissement non coté (VCs, Business Angels, Family Offices, Directeurs M&A). L'application gère des dossiers de startups, des modèles financiers sensibles, des valorisations (DCF, Multiples, Méthode VC), des comités d'investissement et des audits de due diligence.

L'objectif de cette mission est de réaliser un audit technique complet et de finaliser les 8 volets de sécurité non négociables :

1. Déverrouillage du coffre et authentification par passkey (WebAuthn PRF).
2. Chiffrement et protection des données métier (AES-256-GCM + PBKDF2 250k itérations).
3. Partage sécurisé par fichier chiffré (Mode A).
4. Partage direct entre navigateurs sans serveur intermédiaire (Mode B via WebRTC DataChannel).
5. Restauration des sauvegardes sécurisée et atomique.
6. Prévention stricte des injections XSS dans les exports HTML.
7. Vérification des données persistées et zéro télémétrie non sollicitée.
8. Tests automatisés, documentation et validation finale.

---

## 2. Synthèse de l'Audit Initial

### Problèmes confirmés lors de l'audit
1. **Authentification Passkey sans dérivation de clé réelle :**  
   Les versions antérieures simulaient ou confondaient l'authentification de présence avec le déverrouillage cryptographique. Dans VentureFlow v2.1.0, nous avons introduit l'extension WebAuthn PRF (Pseudo-Random Function, Level 3). Lorsque le matériel de l'utilisateur prend en charge PRF, une clé de 32 octets déterministe est générée par l'authentificateur biométrique et sert à déballer la clé maîtresse AES-256-GCM. Si le matériel ne supporte pas PRF, l'application le signale de façon transparente sans contournement factice.
2. **Restauration de sauvegarde destructive :**  
   L'ancienne routine de restauration écrasait IndexedDB avant même de tester la validité de la phrase secrète de secours. En cas de mauvaise saisie, la base existante était perdue.
3. **Risque XSS dans les exports HTML :**  
   Le rapport autonome utilisait des concaténations de chaînes pouvant injecter des balises script non filtrées dans le DOM lors de la lecture du rapport.
4. **Partage P2P incomplet :**  
   Le mode P2P comportait des boutons avec retours statiques au lieu d'une connexion `RTCPeerConnection` et `RTCDataChannel` fonctionnelle.

---

## 3. Implémentations et Corrections Apportées

### 3.1. Déverrouillage Passkey (WebAuthn PRF Level 3)
- Fichier : `src/crypto/passkeyService.ts` et `src/context/VaultContext.tsx`
- Utilisation de `navigator.credentials.create` et `navigator.credentials.get` avec l'extension `prf` :
  ```ts
  extensions: {
    prf: {
      eval: { first: prfSalt }
    }
  }
  ```
- Les 32 octets résultants sont dérivés via **HKDF-SHA-256** pour produire une `CryptoKey` AES-256-GCM servant à déballer le secret de coffre (`encryptedMasterKeyPasskey`).
- Si l'authentificateur local ne gère pas l'extension PRF, l'interface affiche explicitement le message d'incompatibilité matérielle et demande la phrase de passe, sans faux succès.

### 3.2. Chiffrement et Protection des Données Métier
- Fichier : `src/crypto/vaultCrypto.ts`
- Algorithme : **AES-256-GCM** avec vecteur d'initialisation (IV) aléatoire de 96 bits généré par `crypto.getRandomValues`.
- Dérivation de clé : **PBKDF2-SHA-256** à 250 000 itérations avec sel aléatoire de 16 octets.
- Détection d'altération : Toute modification de bit dans le ciphertext lève une exception d'authentification GCM (tag d'authentification invalide).
- Fonctions isomorphiques avec support WebCrypto navigateur (`globalThis.crypto`) et environnements de test (`vitest`).

### 3.3. Partage Sécurisé par Fichier Chiffré (Mode A)
- Fichier : `src/services/shareService.ts`
- Format `.ventureflow` : Paquet JSON contenant le sel, l'IV, les métadonnées et le ciphertext chiffré par phrase secrète convenue.
- Format `.html` autonome : Rapport HTML autonome embarquant le moteur de déchiffrement Web Crypto et un visualiseur en lecture seule.
- Exclusion par défaut : Toutes les notes confidentielles (`confidentialNotes`, `recommendationNotes`, annotations privées) sont automatiquement purgées du payload sauf accord explicite de l'utilisateur.

### 3.4. Partage Direct Poste-à-Poste (Mode B WebRTC DataChannel)
- Fichier : `src/services/p2pShareService.ts` et `src/components/sharing/SharingCenterView.tsx`
- Connexion réelle via `RTCPeerConnection` avec signalisation par échange d'Offre/Réponse SDP (QR Code ou copier/coller) et canal de données `RTCDataChannel`.
- Prise en charge automatique d'un canal local `BroadcastChannel` pour les tests et transferts entre onglets sur la même machine.
- Chiffrement du payload transmis et effacement mémoire strict en fin de session.

### 3.5. Restauration de Sauvegarde Sécurisée & Atomique
- Fichier : `src/context/VaultContext.tsx`
- **Étape 1 :** Validation stricte du schéma JSON et de la structure du fichier de sauvegarde.
- **Étape 2 :** Tentative de déchiffrement et déballage de la clé maîtresse avec la phrase fournie **avant** toute modification d'IndexedDB. En cas de mauvaise phrase de passe, l'opération échoue immédiatement sans toucher aux données locales.
- **Étape 3 :** Sauvegarde mémoire préalable des enregistrements existants avant mise à jour. Si une insertion échoue, un rollback automatique rétablit l'état précédent.

### 3.6. Prévention des Injections XSS dans les Exports HTML
- Fichier : `src/services/shareService.ts`
- Ajout d'une balise `<meta http-equiv="Content-Security-Policy">` ultra-stricte dans le rapport exporté :
  `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none';`
- Échappement complet des chaînes textuelles via la fonction `escapeHtml`.
- Remplacement des injections `innerHTML` par des constructions programmatiques sécurisées (`document.createElement`, `element.textContent`, `appendChild`).

### 3.7. Zéro Télémétrie et Vérification Réseau
- Aucune requête vers des services de télémétrie, traceurs d'audience ou API cloud distantes.
- Les données restent strictement confinées dans l'IndexedDB du navigateur de l'utilisateur.

### 3.8. Tests Automatisés
- Fichiers de tests dans `src/__tests__/` :
  - `vaultCrypto.test.ts` (5 tests)
  - `passkeyService.test.ts` (3 tests)
  - `shareService.test.ts` (6 tests)
  - `backupValidation.test.ts` (2 tests)
- **Résultat : 16/16 tests passés avec succès.**

---

## 4. Limite de Sécurité Fondamentale Documentée

Dans une architecture PWA hébergée sur un serveur web statique (GitHub Pages, Vercel, Cloudflare Pages, etc.), le navigateur télécharge le code JavaScript exécutable.  
Si le serveur d'hébergement ou la chaîne de livraison CI/CD venait à être compromise par un attaquant, celui-ci pourrait distribuer une version modifiée du code JavaScript capable de siphonner les données déchiffrées en mémoire vive dès le déverrouillage du coffre par l'utilisateur.

**Mesures de réduction recommandées pour l'utilisateur final :**
- Installer l'application en mode PWA standalone (permettant la persistance du cache vérifié hors-ligne).
- Configurer des en-têtes HTTP de sécurité renforcés (`Content-Security-Policy`, `Subresource Integrity` (SRI), `X-Content-Type-Options: nosniff`).
- Conserver une copie de sauvegarde chiffrée hors-bande (clé USB déconnectée, stockage d'archives sécurisé).
