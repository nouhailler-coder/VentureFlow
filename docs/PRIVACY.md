# Données Stockées, Données Transmises & Confidentialité

## 1. Données Stockées Localement

Toutes les entités suivantes sont enregistrées exclusivement dans l'IndexedDB du navigateur sous forme chiffrée AES-256-GCM :
- Noms des startups, descriptions, sites web, contacts et fondateurs ;
- Montants recherchés, valorisations pré/post-money, tables de capitalisation ;
- Notes confidentielles d'associés et avis des comités d'investissement ;
- P&L détaillés, métriques ARR, marges brutes, trésorerie et burn rate ;
- Grilles de scoring pondérées et analyses qualitatives ;
- Pièces jointes et documents de due diligence.

### Métadonnées Techniques Autorisées Non Chiffrées
Seules les métadonnées techniques indispensables au bon fonctionnement du stockage sont stockées hors chiffrement :
- `saltBase64` (sel PBKDF2 non confidentiel) ;
- `ivBase64` (vecteur d'initialisation aléatoire) ;
- `iterations` (nombre d'itérations, fixé à 250 000) ;
- `passkeyCredentialId` (identifiant opaque de la passkey WebAuthn) ;
- `recordType` (identifiant générique de table : `startup`, `analysis`, `valuation`, `document`).

Aucun montant, nom de société, note ou adresse email n'apparaît dans les clés d'indexation.

---

## 2. Données Transmises sur le Réseau

- **Par défaut :** Zéro octet de données métier ou financières n'est transmis sur le réseau.
- **En mode Partage Direct :** Seul le paquet de données expressément sélectionné par l'utilisateur est transmis de manière chiffrée de bout en bout au pair WebRTC.
- **Télémétrie & Logs :** Aucune télémétrie commerciale, aucun tracker publicitaire et aucun outil de suivi n'est intégré à l'application.
