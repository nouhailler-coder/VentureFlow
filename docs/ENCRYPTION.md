# Modèle Cryptographique & Gestion des Clés — VentureFlow

## 1. Primitives Cryptographiques

VentureFlow exploite l'implémentation native W3C Web Crypto API (`window.crypto.subtle`).

| Fonction | Algorithme | Paramètres | Usage |
| :--- | :--- | :--- | :--- |
| **Chiffrement au repos** | AES-GCM | 256 bits, IV 96 bits | Chiffrement de chaque objet métier et pièce jointe |
| **Dérivation de clé** | PBKDF2 | SHA-256, 250 000 itérations, Salt 128 bits | Transformation de la phrase secrète en clé d'enveloppement |
| **Enveloppement de clé** | AES-GCM Wrap | Clé AES 256 bits | Protection de la clé maîtresse (DEK) |
| **Contrôle d'intégrité** | HMAC-SHA-256 | Clé dérivée | Vérification des archives de sauvegarde et exports |
| **Aléas cryptographiques** | `crypto.getRandomValues` | Générateur CSPRNG système | Sels, IVs et identifiants de session |

---

## 2. Non-Réutilisation des Nonces (IVs)

L'algorithme AES-GCM requiert impérativement qu'un couple `(clé, IV)` ne soit jamais réutilisé. Dans VentureFlow :
- Chaque opération de chiffrement appelle `generateRandomBytes(12)` pour produire un nouvel IV cryptographiquement indépendant.
- L'IV est concaténé ou stocké de manière adjacente au ciphertext pour permettre le déchiffrement futur sans réutilisation.

---

## 3. Renouvellement de Clé & Rotation

L'utilisateur peut changer sa phrase secrète à tout moment dans le panneau **Sécurité & Coffre** :
1. La phrase actuelle est vérifiée en déballant la clé maîtresse existante.
2. Un nouveau sel aléatoire est généré.
3. Une nouvelle clé d'enveloppement est dérivée.
4. La même clé maîtresse est ré-enveloppée avec le nouveau sel, sans nécessiter de ré-encoder l'ensemble des enregistrements IndexedDB.
