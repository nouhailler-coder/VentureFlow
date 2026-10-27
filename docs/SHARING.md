# Spécification du Partage Sélectif & Limites de Révocation

## 1. Mode A — Export Chiffré Autonome

L'export autonome génère un document HTML unique intégrant :
- Le paquet de données sélectionné, chiffré en AES-256-GCM ;
- Le script de dérivation PBKDF2 et déchiffrement Web Crypto natif ;
- L'interface d'affichage responsive et en lecture seule.

### Procédure de Transmission Sécurisée
1. L'émetteur configure le périmètre (en excluant les notes privées).
2. L'émetteur télécharge le fichier `.html` généré.
3. Le fichier est transmis au destinataire (ex: pièce jointe email ou transfert direct).
4. La phrase secrète de déchiffrement est transmise par un canal distinct et sécurisé (ex: messagerie chiffrée de bout en bout Signal ou appel téléphonique).

---

## 2. Mode B — Partage Direct P2P entre Navigateurs

Le mode B s'appuie sur le canal de données WebRTC (DataChannel) :
- Établissement direct sans passer par un serveur applicatif.
- Les données envoyées sont éphémères et ne sont persistées dans aucune base de données du destinataire.
- La fermeture de la session coupe immédiatement le canal réseau.

---

## 3. Limites Fondamentales de Révocation (Section 5.4)

Il est techniquement et cryptographiquement impossible de garantir la destruction rétroactive de données déjà reçues :
- **Capture d'écran & Copie :** Un destinataire légitimement autorisé à déchiffrer un rapport peut effectuer une capture d'écran, photographier son écran ou enregistrer la mémoire de son navigateur.
- **Absence de révocation rétroactive :** La fin d'une session de partage direct ferme le canal, mais ne peut pas effacer la mémoire de l'appareil distant.
- **Principe d'honnêteté :** VentureFlow ne formule aucune fausse promesse d'auto-destruction rétroactive garantie.
