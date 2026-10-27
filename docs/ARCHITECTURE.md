# Architecture Technique — VentureFlow v2.0

## 1. Vue d'Ensemble des Composants

L'application VentureFlow est structurée autour d'un socle applicatif réactif sans backend métier :

```
+-------------------------------------------------------------------------+
|                       NAVIGATEUR DE L'UTILISATEUR                       |
|                                                                         |
|  +--------------------+   +---------------------+   +----------------+  |
|  |  React UI / Hooks  |   | VaultContext (State)|   | WebAuthn /     |  |
|  |  - Dashboard       |---| - MasterKey (RAM)   |---| Passkeys (OS)  |  |
|  |  - Pipeline CRM    |   | - AutoLock Timer    |   +----------------+  |
|  |  - Valuation / DD  |   | - Inactivity Purge  |                       |
|  +--------------------+   +---------------------+                       |
|            |                         |                                  |
|            v                         v                                  |
|  +--------------------+   +---------------------+                       |
|  | ShareService       |   | VaultCrypto         |                       |
|  | - Mode A HTML Gen  |   | - AES-256-GCM       |                       |
|  | - Mode B P2P WebRTC|   | - PBKDF2-SHA-256    |                       |
|  +--------------------+   +---------------------+                       |
|                                      |                                  |
|                                      v                                  |
|                           +---------------------+                       |
|                           | Storage / IndexedDB |                       |
|                           | - vault_meta        |                       |
|                           | - vault_records (enc|                       |
|                           +---------------------+                       |
+-------------------------------------------------------------------------+
                                       |
                   AUCUNE DONNÉE MÉTIER EN CLAIR TRANSMISE
                                       v
+-------------------------------------------------------------------------+
|                  FOURNISSEURS ET RÉSEAU EXTERNES                        |
|   - Hébergement statique (fichiers HTML/JS/CSS mis en cache PWA)        |
|   - Serveur de signalisation STUN/TURN (métadonnées techniques seules)  |
+-------------------------------------------------------------------------+
```

---

## 2. Flux de Données

1. **Création du coffre :** 
   - Génération d'un sel cryptographique aléatoire de 16 octets.
   - Dérivation d'une clé d'enveloppement depuis la phrase secrète (PBKDF2, SHA-256, 250 000 itérations).
   - Génération d'une clé maîtresse AES-256-GCM (`DataEncryptionKey`).
   - Scellage de la clé maîtresse sous forme d'un bloc chiffré stocké dans `vault_meta`.
2. **Écriture d'une donnée métier :**
   - L'entité (Startup, Analyse, Modèle financier, Pièce jointe) est sérialisée en JSON.
   - Génération d'un IV aléatoire de 12 octets.
   - Chiffrement AES-GCM 256 bits avec le tag d'authentification de 128 bits.
   - Persistance du blob chiffré dans l'objectStore `vault_records` d'IndexedDB.
3. **Verrouillage :**
   - Suppression immédiate de la référence en mémoire `masterKeyRef.current = null`.
   - Remise à zéro des tableaux React (`startups = []`, `analyses = {}`, etc.).
   - Arrêt des timers d'inactivité.
