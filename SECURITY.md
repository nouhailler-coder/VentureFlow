# VentureFlow — Politique de Sécurité & Modèle de Confiance

**Version :** 2.1.0  
**Statut :** Conforme à l'audit cryptographique et aux exigences de protection des données

---

## 1. Périmètre & Données Traitées

VentureFlow stocke des données d'investissement confidentielles :
- Thèses d'investissement, évaluations préliminaires et analyses financières.
- Données comptables (Chiffre d'affaires, ARR, marges brutes, trésorerie, burn rate, runway).
- Modélisations de valorisation (DCF, Multiples de valorisation, First Chicago VC Method).
- Tables de capitalisation (Cap Tables), dilution des fondateurs et pools d'options ESOP/BSPCE.
- Grilles d'audit de Due Diligence (réglementaire, brevets, passifs fiscaux et sociaux).
- Notes confidentielles de comités d'investissement et réserves d'associés.

---

## 2. Principes Fondamentaux de Sécurité

### 2.1. Architecture 100% Local-First
- **Aucune synchronisation cloud non chiffrée :** L'application ne transfère aucune donnée financière vers des serveurs centraux, services SaaS tiers ou bases distantes.
- **Déchiffrement éphémère en mémoire vive :** Les données ne sont déchiffrées que pendant la session active de l'utilisateur.
- **Destruction de session :** Lors du verrouillage du coffre, de la déconnexion, d'une inactivité prolongée ou du passage en arrière-plan, la clé maîtresse est effacée de la mémoire vive et les états applicatifs sont réinitialisés.

### 2.2. Primitives Cryptographiques Standardisées (W3C Web Crypto)
- **Chiffrement symétrique :** AES-GCM 256 bits avec vecteur d'initialisation (IV) aléatoire de 96 bits unique pour chaque document.
- **Dérivation de clé (Passphrase) :** PBKDF2 avec fonction de hachage SHA-256 et 250 000 itérations, renforcé par un sel aléatoire de 16 octets.
- **Authentification forte & Biométrie (Passkeys) :** Extension WebAuthn PRF (Level 3) dérivée via HKDF-SHA-256. Aucune simulation n'est tolérée : si le matériel de l'utilisateur ne dispose pas du support PRF, le coffre signale explicitement cette absence et s'appuie sur la phrase de passe maîtresse.
- **Intégrité des données :** Détection d'altération native via le tag d'authentification GCM de 128 bits et contrôles HMAC-SHA-256.

### 2.3. Partage Sélectif & Prévention des Fuites
- **Exclusion automatique des données confidentielles :** Les notes privées des comités et les avertissements d'associés sont filtrés et exclus par défaut des paquets partagés.
- **Export HTML autonome blindé :**
  - Politique de sécurité du contenu (CSP) ultra-stricte : `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none';`
  - Échappement complet de tous les caractères spéciaux HTML.
  - Manipulation sécurisée du DOM via l'API standard (`document.createElement`, `textContent`) sans injection de chaînes HTML brutes.
- **Partage Direct P2P (WebRTC DataChannel) :** Connexion directe poste-à-poste entre deux navigateurs sans passer par un serveur intermédiaire.

### 2.4. Restauration de Sauvegarde Sécurisée
- Validation stricte du schéma JSON avant toute tentative d'importation.
- Test de déverrouillage de la clé maîtresse avec la phrase secrète renseignée **avant** toute modification de la base locale IndexedDB.
- Mécanisme de retour arrière (rollback) mémoire en cas d'incident pendant la restauration.

---

## 3. Limite de Sécurité Fondamentale Documentée

> **Avertissement de sécurité transparent :**  
> VentureFlow s'exécute dans l'environnement de navigateur de l'utilisateur final. Lorsqu'elle est distribuée via un hébergement web statique standard (ex. GitHub Pages, serveurs HTTP classiques) :
> - Si l'infrastructure d'hébergement ou le réseau de distribution (CDN) était compromis, un attaquant pourrait altérer le code JavaScript délivré au client.
> - Une fois le coffre déverrouillé par l'utilisateur (via biométrie ou phrase secrète), un script malveillant injecté en amont pourrait avoir accès aux données en mémoire vive de la page.
>
> **Conséquence :** Le chiffrement local garantit la confidentialité au repos et protège contre les fuites non autorisées vers des tiers, mais ne peut pas se substituer à la sécurité du système d'exploitation ou à la confiance accordée au canal de distribution web.

### Mesures recommandées
1. Installer VentureFlow en tant qu'application autonome PWA pour bénéficier du cache applicatif vérifié.
2. Déployer l'application avec des en-têtes HTTP de sécurité stricts (HSTS, CSP, Subresource Integrity).
3. Effectuer des sauvegardes chiffrées régulières sur support amovible déconnecté.

---

## 4. Vérification & Tests de Sécurité

La suite de tests automatisée valide l'ensemble des mécanismes de sécurité :

```bash
npm test
```

Pour lancer les auto-tests cryptographiques interactifs au sein de l'application :
1. Déverrouillez le coffre.
2. Rendez-vous dans **Gouvernance & Sécurité** -> **Coffre & Chiffrement**.
3. Lancez les **Auto-Tests Cryptographiques** pour observer la validation en temps réel des vecteurs de test AES-GCM, PBKDF2, altération de tag et HMAC.

---

## 5. Signalement de Vulnérabilités

Tout chercheur en sécurité identifiant une faiblesse cryptographique ou un risque d'injection est invité à soumettre un rapport technique détaillé à :
`security@ventureflow.local`
