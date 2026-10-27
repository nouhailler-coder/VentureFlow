# VentureFlow — Politique de Sécurité & Modèle de Confiance

**Version 2.0**

## 1. Principes de Sécurité et Frontières de Confiance

VentureFlow traite des informations financières confidentielles de premier ordre : valorisations de startups, tables de capitalisation, marges brutes, runway, notes privées de comités d'investissement et documents d'audit.

### Zone de Confiance (Le Navigateur de l'Utilisateur)
- Déchiffrement des données métier en mémoire vive de session.
- Exécution des modèles de valorisation et calculs d'intégrité.
- Dérivation et protection de la clé maîtresse AES-256-GCM.
- Génération des rapports sélectifs en lecture seule.

### Zone Non Fiable (Fournisseurs Externes & Réseau)
- Hébergement statique de l'application (Cloudflare Pages, Netlify, serveurs web).
- Éventuels serveurs de signalisation STUN/TURN pour le WebRTC.
- Fournisseurs de polices ou CDNs externes.

**Règle absolue :** Aucun composant de la zone non fiable ne reçoit de données métier en clair ou de clés cryptographiques.

---

## 2. Limite Fondamentale Documentée (Section 2.3 du Cahier des Charges)

Un hébergement web statique distribue le code JavaScript exécuté par le navigateur de l'utilisateur. En conséquence :
- Si la chaîne de distribution ou le fournisseur d'hébergement venait à être compromis, du code malveillant pourrait théoriquement être injecté pour intercepter les données déchiffrées en mémoire après déverrouillage du coffre.
- Le chiffrement au repos dans IndexedDB protège contre les accès physiques ou d'autres applications sur le disque, mais ne peut pas se prémunir d'un hôte d'exécution corrompu ou d'un appareil infecté par un logiciel espion.
- VentureFlow ne prétend pas offrir une garantie absolue contre un navigateur ou un système d'exploitation compromis.

---

## 3. Pratiques de Sécurité Implémentées

- **Web Crypto API Standard :** Utilisation exclusive de primitives cryptographiques certifiées W3C (AES-GCM, PBKDF2-SHA-256, HMAC-SHA-256). Aucun algorithme maison n'est utilisé.
- **Zéro Clé en Clair :** La clé de déchiffrement des données (DEK) n'est jamais stockée en clair dans IndexedDB, `localStorage`, `sessionStorage` ou les cookies. Elle est scellée avec une clé de coffre dérivée d'une phrase secrète à 250 000 itérations.
- **Purge Mémoire au Verrouillage :** Lors du verrouillage manuel, après expiration du délai d'inactivité (5 à 60 min) ou lors du basculement d'onglet (`visibilityState === 'hidden'`), la référence vers la clé maîtresse en mémoire est détruite et les états applicatifs sont vidés.
- **Exclusion Systématique des Notes Privées :** Lors d'un export de rapport partagé, les notes confidentielles et réserves d'associés sont exclues par défaut.

---

## 4. Signalement de Vulnérabilités

Pour tout signalement relatif à la sécurité cryptographique ou à l'isolation des données :
- Envoyer un rapport détaillé à : `security@ventureflow.local`
- Veuillez inclure les vecteurs de reproduction et les traces de console.
