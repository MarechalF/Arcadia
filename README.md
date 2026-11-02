# Arcadia — moteur de site statique sécurisé

Arcadia transforme des fichiers **Markdown** en un **site statique complet**, prêt à être publié publiquement. Zéro dépendance : Node.js ≥ 20 suffit.

```
┌──────────────┐   node cli.js dev    ┌─────────────────────┐
│ site/content │ ──(live reload)────▶ │ serveur local       │ ── /admin protégé (login+CSRF)
│  *.md        │                      │ 127.0.0.1:3000      │
└──────────────┘   node cli.js build  └─────────────────────┘
       │                                  │
       └──────────────▶ dist/ ◀───────────┘   site 100 % statique
                        (HTML + RSS + sitemap + robots.txt)
```

## Démarrage rapide

```bash
git clone <ce dépôt> && cd Arcadia
npm run dev        # développement : http://127.0.0.1:3000
```

Le mot de passe de l'espace rédaction est généré au premier lancement (ou fixé via `ADMIN_PASSWORD=... npm run dev`). Il est stocké hashé (scrypt) dans `.admin.json` — **jamais commité** (voir `.gitignore`).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de dev avec live reload (SSE) + espace rédaction `/admin` |
| `npm run build` | Génère `dist/` : toutes les pages HTML, RSS, sitemap, robots, index de recherche |
| `npm run serve` | Sert `dist/` en local (test de prod) |
| `npm run new -- "Mon titre"` | Crée un brouillon Markdown dans `site/content/articles/` |
| `npm test` | Tests du moteur (`node --test`) |

## Rédiger du contenu

Un article est un fichier Markdown avec front matter :

```markdown
---
title: "Mon article"
slug: mon-article
category: Technologie
author: Prénom Nom
date: 2026-01-15T10:00:00+01:00
excerpt: "Le chapô affiché sur les cartes."
tags: [ia, société]
image: /assets/cover-default.svg
published: true        # false = brouillon, invisible publiquement
---

Corps en **Markdown** : titres, listes, `code`, [liens](https://…), blocs de code…
```

## Rendre le site public (déploiement)

Le site public est **entièrement statique** : aucun serveur applicatif à exposer, donc surface d'attaque minimale.

```bash
npm run build        # produit dist/
```

Hébergement gratuit recommandé (aucun serveur à gérer) :

1. **GitHub Pages** — poussez `dist/` sur la branche `gh-pages` (Settings → Pages), ou utilisez GitHub Actions avec `peaceiris/actions-gh-pages`.
2. **Netlify** — `netlify deploy --prod --dir=dist` (CLI gratuite), ou reliez le dépôt : build command `npm run build`, publish directory `dist`.
3. **Vercel** — `vercel --prod` détecte automatiquement ; réglez le output sur `dist/`.

Mettez à jour `url` dans `site.config.json` avec votre domaine public : il sert aux liens canoniques, au RSS et au sitemap.

### Domaine personnalisé + HTTPS

- Sur Netlify/Vercel/GitHub Pages : ajoutez votre domaine dans les réglages, le **HTTPS est automatique** (certificat Let's Encrypt).
- Le cookie de session de `/admin` porte déjà les attributs `Secure`, `HttpOnly`, `SameSite=Strict`.

## Sécurité intégrée

| Mesure | Détail |
|---|---|
| Site public statique | aucun code exécuté côté serveur en production |
| En-têtes de sécurité | CSP stricte, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| Sanitisation du Markdown | suppression de `<script>`, `on*`, `javascript:` avant rendu |
| Authentification `/admin` | mot de passe hashé (scrypt), sessions signées (HMAC), cookie `HttpOnly/SameSite/ Secure`, TTL 8 h |
| CSRF | jeton signé requis sur login, publication, suppression |
| Rate limiting | 120 req/min/IP globales, 10 tentatives/min sur le login |
| Anti path-traversal | `safeJoin` bloque toute sortie de racine (assets, templates) |
| Secrets hors git | `.admin.json`, `.sessions.json`, `dist/` dans `.gitignore` |

⚠️ Le mode `dev` écoute sur `127.0.0.1` uniquement — ne l'exposez jamais publiquement. La rédaction se fait en local, puis on publie via `build` + déploiement.

## Structure

```
Arcadia/
├── cli.js                  # CLI : dev / build / serve / new / init
├── engine/
│   ├── site.js             # moteur : chargement, rendu des pages, RSS, sitemap
│   ├── markdown.js         # parser Markdown + sanitisation XSS
│   ├── server.js           # serveur dev (live reload, admin) + serveur statique
│   ├── security.js         # en-têtes, sessions, CSRF, rate limiting, auth
│   ├── build.js            # génération du site statique dist/
│   └── utils.js            # utilitaires (slug, hash, HMAC, chemins sûrs…)
├── site.config.json        # nom, url, pagination…
├── site/
│   ├── content/articles/   # vos articles (.md)
│   ├── content/pages/      # pages statiques (a-propos.md → /a-propos)
│   ├── templates/          # layout + partiels (syntaxe {{var}})
│   └── assets/             # CSS, images, JS servis tels quels
├── test/                   # tests node --test
└── dist/                   # site généré (gitignoré)
```

## Créer un nouveau site from scratch

```bash
node cli.js init mon-site
# copier engine/ + cli.js dans mon-site/, éditer site.config.json, puis :
cd mon-site && node cli.js dev
```
