# Procédures de Tests — Fonctionnels, Cryptographiques & Sécurité

## 1. Tests Cryptographiques Intégrés

VentureFlow embarque une suite de tests automatisés accessible directement depuis l'interface (**Sécurité & Coffre**) :
1. **Test AES-GCM 256 bits Round-Trip :** Chiffrement d'une charge utile arbitraire, validation du déchiffrement et vérification de conformité des données.
2. **Test PBKDF2 & Enveloppement de clé :** Dérivation d'une clé d'enveloppement à 250 000 itérations, scellage d'une clé DEK aléatoire, déballage et vérification opérationnelle.
3. **Test de Détection de Falsification :** Altération d'un bit dans le ciphertext pour vérifier que le tag d'authentification GCM rejette immédiatement le paquet sans révéler d'information sensible.
4. **Test d'Intégrité HMAC-SHA-256 :** Vérification de la signature HMAC sur les archives exportées.

---

## 2. Tests de Non-Divulgation & Fuite Mémoire

L'inspecteur de non-divulgation intégré analyse :
- L'objectStore IndexedDB `vault_records` pour s'assurer qu'aucun champ métier n'apparaît en clair dans les clés ou valeurs.
- Le `localStorage` et le `sessionStorage` pour certifier l'absence de toute donnée confidentielle (valorisations, noms, notes).

---

## 3. Tests Fonctionnels Métier

- Création, modification et suppression de startups dans le CRM ;
- Déplacement de dossiers dans les 9 étapes du Pipeline avec saisie du motif de rejet ;
- Calculs dynamiques du score composite des 12 critères d'analyse ;
- Modélisation financière (Runway, Burn rate, Marge brute) ;
- Calculs de valorisation multi-méthodes (Multiples, DCF, Méthode VC, Dilution) ;
- Export HTML autonome et vérification du déchiffrement hors ligne ;
- Sauvegarde et restauration complète du coffre.
