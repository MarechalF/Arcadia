---
title: À propos
excerpt: À propos de ce site et du moteur Arcadia.
---

**La Gazette du Quotidien** est un journal en ligne propulsé par **Arcadia**, un moteur de site statique :

- le contenu est rédigé en **Markdown** dans `site/content/` ;
- les pages sont **générées à l'avance** en HTML pur (`node cli.js build`) ;
- le site public ne fait tourner **aucun code côté serveur**, ce qui le rend rapide, peu coûteux à héberger et résistant aux attaques courantes.

En développement, `node cli.js dev` lance un serveur local avec **rechargement automatique** et un **espace rédaction protégé par mot de passe** (`/admin`).
