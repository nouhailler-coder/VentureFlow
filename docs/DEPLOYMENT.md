# Déploiement & Hébergement Statique Sécurisé

## 1. Déploiement Statique Recommandé

VentureFlow est une application statique compilée (HTML, JS, CSS) qui ne requiert aucun serveur d'exécution backend en production :
- **Plateformes cibles :** Cloudflare Pages, Netlify, Vercel, GitHub Pages, serveurs Nginx/Caddy durcis.
- **Commande de build :** `npm run build`
- **Dossier de sortie :** `dist/`

---

## 2. En-têtes HTTP de Sécurité Recommandés (Content Security Policy)

Pour protéger l'exécution locale contre les injections de scripts tiers, configurer les en-têtes suivants sur le serveur d'hébergement :

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: publickey-credentials-get=(self)
```

---

## 3. Configuration PWA & Service Worker

Le fichier `vite.config.ts` configure `vite-plugin-pwa` pour :
- Pré-mettre en cache tous les scripts, feuilles de style, icônes et polices Google Fonts nécessaires au fonctionnement hors-ligne ;
- Déclarer le manifeste Web App (`id: '/'`, `display: 'standalone'`, icônes 192px, 512px et maskable) ;
- Permettre l'installation native sur macOS, Windows, Linux, iOS et Android.
