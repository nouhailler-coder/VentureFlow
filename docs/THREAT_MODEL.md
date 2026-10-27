# Modèle de Menace (Threat Model) — VentureFlow

## 1. Acteurs Malveillants & Scénarios d'Attaque

### Scénario A : Vol physique de l'ordinateur portable ou extraction du profil de navigateur
- **Menace :** L'attaquant copie le dossier de données IndexedDB.
- **Défense :** Toutes les données métier sont scellées en AES-256-GCM. En l'absence de la phrase secrète maîtresse (ou de la validation biométrique de la passkey matérielle), le coût de calcul par force brute avec 250 000 itérations PBKDF2 rend l'attaque computationnellement infaisable.

### Scénario B : Attaque de l'hébergeur statique ou de la chaîne de distribution
- **Menace :** Un attaquant compromet Cloudflare Pages ou Netlify et injecte un script JS malveillant dans l'application.
- **Défense :** Modèle de menace assumé et documenté : le navigateur exécute le code distribué par l'hôte. Des politiques de sécurité de contenu (CSP) strictes, le verrouillage des dépendances `package-lock.json` et la signature des builds réduisent le risque. Si l'hôte est compromis, un utilisateur exécutant l'application déverrouillée peut voir sa session interceptée.

### Scénario C : Falsification d'une archive de sauvegarde
- **Menace :** L'attaquant altère un fichier de sauvegarde ou un rapport chiffré pour injecter du code ou modifier une valorisation.
- **Défense :** AES-GCM fournit une intégrité cryptographique stricte via son tag d'authentification de 128 bits. Toute altération d'un seul bit lève immédiatement une exception d'authentification et bloque le déchiffrement.
