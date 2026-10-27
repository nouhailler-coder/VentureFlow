# Modèle de Données Logique & Règles de Stockage

## 1. Entités Définies

Conformément à la section 8 du cahier des charges, les entités suivantes composent le modèle logique :

- `Startup` : Fiche d'opportunité d'investissement (nom, secteur, stade, pays, ville, site web, fondateurs, montant recherché, valorisation demandée, étape de pipeline, notes confidentielles, tags).
- `Contact` : Répertoire de contacts associés aux fondateurs (nom, rôle, email, téléphone, notes).
- `Interaction` : Journal des appels, réunions, pitchs et synthèses d'échanges.
- `PipelineStage` : Configuration des 9 étapes du pipeline d'investissement.
- `Task` : Tâches d'audit et échéances de relance.
- `StartupAnalysis` : Grille d'évaluation multi-critères (12 critères pondérés, score composite sur 100, forces, faiblesses, risques réglementaires, recommandation du comité).
- `FinancialModel` : P&L historique et prévisionnel sur 5 ans (Revenus/ARR, COGS, Marge brute, Opex R&D/S&M/G&A, EBITDA, Cash balance, Burn rate mensuel, Runway en mois).
- `ValuationEstimate` : Modèles de valorisation (Multiples ARR, Multiples EBITDA, DCF, Méthode VC, Dilution tour de table, corridor min/médiane/max).
- `DueDiligenceItem` : Points de contrôle dans 10 catégories d'audit, statuts (`valide`, `en_cours`, `bloquant`, `non_demarre`) et niveaux de risque.
- `EncryptedAttachment` : Documents et pièces jointes chiffrés client-side avec métadonnées techniques.
- `InvestmentPortfolio` : Suivi des participations conclues (montant investi, valo d'entrée, valo actuelle, pourcentage de détention, MOIC, TRI et jalons de gouvernance).
- `VaultMetadata` : Métadonnées du coffre (sel PBKDF2, IV, itérations, master key enveloppée, passkey ID).

Toutes ces entités sont sérialisées et scellées dans IndexedDB avant toute écriture sur le disque de l'utilisateur.
