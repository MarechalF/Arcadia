# La Gazette du Quotidien

Site internet journalistique complet et fonctionnel, fonctionnant en local avec
**Node.js uniquement (aucune dépendance à installer)**.

## Lancer le site

```bash
cd site-journal
npm start          # ou : node server.js
```

Puis ouvrir <http://127.0.0.1:3000> dans un navigateur.

Le port se change avec la variable d'environnement `PORT` :

```bash
PORT=8080 node server.js
```

## Fonctionnalités

| Fonctionnalité | Où |
|---|---|
| Page d'accueil éditoriale (à la une + derniers articles) | `/` |
| Rubriques (9 catégories) | `/categorie/Économie`, etc. |
| Fiche article complète (chapô, corps, tags, à lire aussi) | `/article/<slug>` |
| Recherche plein texte (titre, texte, auteur, tags) | `/recherche?q=climat` |
| Flux RSS 2.0 | `/rss.xml` |
| Sitemap XML | `/sitemap.xml` |
| Formulaire de contact (messages stockés dans `data/messages/`) | `/contact` |
| Espace rédaction : publier un article depuis le navigateur | `/admin` |
| Page « À propos » | `/a-propos` |
| Design responsive, images SVG générées localement | `/css/style.css`, `/img/` |

## Structure

```
site-journal/
├── server.js            # Serveur HTTP + toutes les routes (Node pur)
├── package.json
├── data/
│   ├── articles.json    # Base d'articles (modifiée via /admin)
│   └── messages/        # Messages reçus via le formulaire de contact
└── public/
    ├── css/style.css
    └── img/*.svg        # Logo + illustrations
```

## Publier un article

Aller sur `/admin`, remplir le formulaire (titre, rubrique, auteur, chapô,
étiquettes, contenu — un paragraphe par ligne) et cliquer sur **Publier**.
L'article est immédiatement en ligne et ajouté au flux RSS.

## Notes

- Les articles de démonstration couvrent 9 rubriques.
- Aucune donnée ne quitte la machine : le serveur écoute uniquement sur
  `127.0.0.1` (loopback).
