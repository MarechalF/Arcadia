'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const MESSAGES_DIR = path.join(DATA_DIR, 'messages');

const SITE_NAME = 'La Gazette du Quotidien';
const SITE_TAGLINE = 'L\'actualité claire, vérifiée et indépendante';
const SITE_URL = process.env.SITE_URL || `http://${HOST}:${PORT}`;

const CATEGORIES = ['Politique', 'Économie', 'Société', 'Culture', 'Sport', 'Science', 'Technologie', 'Santé', 'Voyage'];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadArticles() {
  try {
    return JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveArticle(article) {
  const articles = loadArticles();
  const idx = articles.findIndex(a => a.slug === article.slug);
  if (idx >= 0) articles[idx] = article; else articles.unshift(article);
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf8');
}

function slugify(str) {
  return String(str)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'article-' + Date.now();
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
  } catch (e) {
    return iso;
  }
}

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
  } catch (e) {
    return iso;
  }
}

function rfc822(iso) {
  return new Date(iso).toUTCString();
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1e6) { reject(new Error('Body too large')); req.destroy(); }
    });
    req.on('end', () => {
      const params = new URLSearchParams(data);
      const out = {};
      for (const [k, v] of params) out[k] = v;
      resolve(out);
    });
    req.on('error', reject);
  });
}

function layout({ title, description, content, extraHead = '' }) {
  const catLinks = CATEGORIES.map(c =>
    `<a href="/categorie/${encodeURIComponent(c)}">${esc(c)}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ${esc(SITE_NAME)}</title>
<meta name="description" content="${esc(description)}">
<link rel="stylesheet" href="/css/style.css">
<link rel="alternate" type="application/rss+xml" title="${esc(SITE_NAME)}" href="/rss.xml">
${extraHead}
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/">
      <img src="/img/logo.svg" alt="" class="logo">
      <span><span class="brand-name">${esc(SITE_NAME)}</span><span class="brand-tag">${esc(SITE_TAGLINE)}</span></span>
    </a>
    <nav class="main-nav" aria-label="Navigation principale">
      <a href="/">Accueil</a>
      ${catLinks}
      <a href="/recherche">Recherche</a>
      <a href="/contact">Contact</a>
    </nav>
  </div>
</header>
<main class="container">
${content}
</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <div>
      <strong>${esc(SITE_NAME)}</strong><br>
      ${esc(SITE_TAGLINE)}
    </div>
    <div class="footer-links">
      <a href="/rss.xml">Flux RSS</a>
      <a href="/sitemap.xml">Sitemap</a>
      <a href="/a-propos">À propos</a>
      <a href="/contact">Contact</a>
      <a href="/admin">Espace rédaction</a>
    </div>
    <div class="footer-copy">© ${new Date().getFullYear()} ${esc(SITE_NAME)} — Démo locale</div>
  </div>
</footer>
</body>
</html>`;
}

function articleCard(a, { showCategory = true } = {}) {
  return `<article class="card">
  <a class="card-img" href="/article/${esc(a.slug)}"><img src="${esc(a.image)}" alt="" loading="lazy"></a>
  <div class="card-body">
    ${showCategory ? `<a class="chip" href="/categorie/${encodeURIComponent(a.category)}">${esc(a.category)}</a>` : ''}
    <h2 class="card-title"><a href="/article/${esc(a.slug)}">${esc(a.title)}</a></h2>
    <p class="card-excerpt">${esc(a.excerpt)}</p>
    <p class="card-meta">Par <strong>${esc(a.author)}</strong> — ${formatDate(a.date)}</p>
  </div>
</article>`;
}

function pageHome() {
  const articles = loadArticles().sort((a, b) => new Date(b.date) - new Date(a.date));
  const featured = articles[0];
  const rest = articles.slice(1, 7);
  const latest = articles.slice(0, 5);

  const content = `
<section class="hero">
  <div class="hero-featured">
    <a class="chip chip-lg" href="/categorie/${encodeURIComponent(featured.category)}">${esc(featured.category)}</a>
    <h1><a href="/article/${esc(featured.slug)}">${esc(featured.title)}</a></h1>
    <p class="hero-excerpt">${esc(featured.excerpt)}</p>
    <p class="card-meta">Par <strong>${esc(featured.author)}</strong> — ${formatDateTime(featured.date)}</p>
  </div>
  <aside class="hero-side">
    <h2 class="side-title">À la une</h2>
    <ol class="top-list">
      ${latest.map(a => `<li><a href="/article/${esc(a.slug)}">${esc(a.title)}</a><span>${esc(a.category)}</span></li>`).join('')}
    </ol>
  </aside>
</section>
<section>
  <h2 class="section-title">Derniers articles</h2>
  <div class="grid">
    ${rest.map(a => articleCard(a)).join('')}
  </div>
</section>`;

  return layout({
    title: 'Accueil',
    description: `${SITE_NAME} — ${SITE_TAGLINE}. Toute l'actualité politique, économique, culturelle, sportive et scientifique.`,
    content
  });
}

function pageCategory(cat) {
  const articles = loadArticles()
    .filter(a => a.category === cat)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const content = `
<nav class="breadcrumb"><a href="/">Accueil</a> › ${esc(cat)}</nav>
<h1 class="page-title">${esc(cat)}</h1>
${articles.length === 0
  ? '<p class="empty">Aucun article dans cette rubrique pour le moment.</p>'
  : `<div class="grid">${articles.map(a => articleCard(a, { showCategory: false })).join('')}</div>`}`;
  return layout({
    title: cat,
    description: `Tous les articles de la rubrique ${cat} — ${SITE_NAME}.`,
    content
  });
}

function pageArticle(slug) {
  const a = loadArticles().find(x => x.slug === slug);
  if (!a) return null;
  const related = loadArticles()
    .filter(x => x.slug !== a.slug && (x.category === a.category || (a.tags || []).some(t => (x.tags || []).includes(t))))
    .slice(0, 3);
  const paragraphs = (a.content || []).map(p => `<p>${esc(p)}</p>`).join('\n');
  const tags = (a.tags || []).map(t => `<a class="tag" href="/recherche?q=${encodeURIComponent(t)}">#${esc(t)}</a>`).join(' ');
  const content = `
<nav class="breadcrumb"><a href="/">Accueil</a> › <a href="/categorie/${encodeURIComponent(a.category)}">${esc(a.category)}</a> › ${esc(a.title)}</nav>
<article class="article-full">
  <a class="chip chip-lg" href="/categorie/${encodeURIComponent(a.category)}">${esc(a.category)}</a>
  <h1 class="article-title">${esc(a.title)}</h1>
  <p class="article-meta">Par <strong>${esc(a.author)}</strong> — publié le ${formatDateTime(a.date)}</p>
  <img class="article-img" src="${esc(a.image)}" alt="">
  <div class="article-body">
    <p class="lead">${esc(a.excerpt)}</p>
    ${paragraphs}
  </div>
  ${tags ? `<p class="article-tags">${tags}</p>` : ''}
</article>
${related.length ? `<section><h2 class="section-title">À lire aussi</h2><div class="grid">${related.map(x => articleCard(x)).join('')}</div></section>` : ''}`;
  return layout({
    title: a.title,
    description: a.excerpt,
    content,
    extraHead: `<meta property="og:title" content="${esc(a.title)}"><meta property="og:description" content="${esc(a.excerpt)}"><link rel="canonical" href="${SITE_URL}/article/${esc(a.slug)}">`
  });
}

function pageSearch(query) {
  const q = (query || '').trim().toLowerCase();
  const all = loadArticles();
  const results = q
    ? all.filter(a =>
        [a.title, a.excerpt, a.author, a.category, ...(a.tags || []), ...(a.content || [])]
          .join(' ').toLowerCase().includes(q))
    : all;
  const content = `
<h1 class="page-title">Recherche</h1>
<form class="search-form" action="/recherche" method="get">
  <input type="search" name="q" value="${esc(query || '')}" placeholder="Rechercher un article, un auteur, un sujet…" aria-label="Recherche">
  <button type="submit">Rechercher</button>
</form>
${q ? `<p class="search-info">${results.length} résultat(s) pour « ${esc(query)} »</p>` : '<p class="search-info">Saisissez un mot-clé pour rechercher dans tous les articles.</p>'}
${results.length ? `<div class="grid">${results.map(a => articleCard(a)).join('')}</div>` : (q ? '<p class="empty">Aucun article ne correspond à votre recherche.</p>' : '')}`;
  return layout({
    title: q ? `Recherche : ${query}` : 'Recherche',
    description: 'Recherchez parmi tous les articles publiés.',
    content
  });
}

function pageContact() {
  const content = `
<h1 class="page-title">Contact</h1>
<p>Une information à nous transmettre, une question, une proposition d'article ? Écrivez-nous via ce formulaire, ou directement à <a href="mailto:redaction@gazette-demo.local">redaction@gazette-demo.local</a>.</p>
<form class="form" action="/contact" method="post">
  <label>Nom complet
    <input type="text" name="name" required maxlength="100">
  </label>
  <label>Adresse e-mail
    <input type="email" name="email" required maxlength="200">
  </label>
  <label>Sujet
    <input type="text" name="subject" required maxlength="150">
  </label>
  <label>Message
    <textarea name="message" rows="6" required maxlength="5000"></textarea>
  </label>
  <button type="submit">Envoyer le message</button>
</form>`;
  return layout({
    title: 'Contact',
    description: 'Contactez la rédaction de ' + SITE_NAME + '.',
    content
  });
}

function handleContactPost(body) {
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const subject = (body.subject || '').trim();
  const message = (body.message || '').trim();
  if (!name || !email || !subject || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false };
  }
  const id = crypto.randomBytes(8).toString('hex');
  const record = { id, name, email, subject, message, date: new Date().toISOString() };
  fs.writeFileSync(path.join(MESSAGES_DIR, id + '.json'), JSON.stringify(record, null, 2), 'utf8');
  return { ok: true };
}

function pageContactDone(ok) {
  const content = `
<h1 class="page-title">Message envoyé</h1>
${ok
  ? '<p class="notice success">Merci ! Votre message a bien été transmis à la rédaction. Nous vous répondrons dans les meilleurs délais.</p>'
  : '<p class="notice error">Une erreur est survenue : vérifiez que tous les champs sont remplis et que l\'adresse e-mail est valide.</p>'}
<p><a href="/">Retour à l'accueil</a></p>`;
  return layout({ title: 'Message envoyé', description: 'Confirmation d\'envoi du formulaire de contact.', content });
}

function pageAbout() {
  const content = `
<h1 class="page-title">À propos</h1>
<div class="article-body">
<p><strong>${esc(SITE_NAME)}</strong> est un journal en ligne de démonstration : ${esc(SITE_TAGLINE)}.</p>
<p>Ce site a été conçu comme une base complète et fonctionnelle pour un média : page d'accueil éditoriale, rubriques, fiches articles, recherche, flux RSS, sitemap XML, formulaire de contact et un espace rédaction permettant de publier de nouveaux articles directement depuis le navigateur.</p>
<p>Toutes les données sont stockées localement, dans le dossier <code>data/</code> du projet — aucun service externe n'est requis.</p>
</div>`;
  return layout({ title: 'À propos', description: 'À propos de ' + SITE_NAME + '.', content });
}

function pageAdmin() {
  const articles = loadArticles().sort((a, b) => new Date(b.date) - new Date(a.date));
  const options = CATEGORIES.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  const rows = articles.map(a => `<tr>
    <td><a href="/article/${esc(a.slug)}">${esc(a.title)}</a></td>
    <td>${esc(a.category)}</td>
    <td>${esc(a.author)}</td>
    <td>${formatDate(a.date)}</td>
  </tr>`).join('');
  const content = `
<h1 class="page-title">Espace rédaction</h1>
<p>Publiez un nouvel article. Il apparaîtra immédiatement sur le site et dans le flux RSS.</p>
<form class="form" action="/admin" method="post">
  <label>Titre
    <input type="text" name="title" required maxlength="200">
  </label>
  <div class="form-row">
    <label>Catégorie
      <select name="category" required>${options}</select>
    </label>
    <label>Auteur
      <input type="text" name="author" required maxlength="100" placeholder="Prénom Nom">
    </label>
  </div>
  <label>Résumé (chapô)
    <textarea name="excerpt" rows="2" required maxlength="400"></textarea>
  </label>
  <label>Étiquettes (séparées par des virgules)
    <input type="text" name="tags" maxlength="200" placeholder="écologie, ville, société">
  </label>
  <label>Contenu (un paragraphe par ligne)
    <textarea name="content" rows="10" required maxlength="20000"></textarea>
  </label>
  <button type="submit">Publier l'article</button>
</form>
<h2 class="section-title">Articles publiés (${articles.length})</h2>
<table class="table">
  <thead><tr><th>Titre</th><th>Rubrique</th><th>Auteur</th><th>Date</th></tr></thead>
  <tbody>${rows}</tbody>
</table>`;
  return layout({ title: 'Espace rédaction', description: 'Publier un article — espace rédaction.', content });
}

function handleAdminPost(body) {
  const title = (body.title || '').trim();
  const content = (body.content || '').trim();
  if (!title || !content || !body.category) return { ok: false, slug: null };
  const article = {
    slug: slugify(title) + '-' + crypto.randomBytes(3).toString('hex'),
    title,
    category: body.category,
    author: (body.author || 'Rédaction').trim() || 'Rédaction',
    date: new Date().toISOString(),
    excerpt: (body.excerpt || '').trim() || content.split('\n')[0].slice(0, 300),
    tags: (body.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    image: '/img/default.svg',
    content: content.split('\n').map(l => l.trim()).filter(Boolean)
  };
  saveArticle(article);
  return { ok: true, slug: article.slug };
}

function pageAdminDone(result) {
  const content = result.ok
    ? `<h1 class="page-title">Article publié</h1>
       <p class="notice success">Votre article est en ligne.</p>
       <p><a href="/article/${esc(result.slug)}">Voir l'article</a> — <a href="/admin">Publier un autre article</a></p>`
    : `<h1 class="page-title">Publication impossible</h1>
       <p class="notice error">Vérifiez le titre, la catégorie et le contenu.</p>
       <p><a href="/admin">Retour au formulaire</a></p>`;
  return layout({ title: 'Publication', description: 'Résultat de la publication.', content });
}

function page404() {
  const content = `
<h1 class="page-title">Page introuvable</h1>
<p class="empty">La page demandée n'existe pas. <a href="/">Retour à l'accueil</a></p>`;
  return layout({ title: 'Page introuvable', description: 'Erreur 404.', content });
}

function rssFeed() {
  const articles = loadArticles().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
  const items = articles.map(a => `  <item>
    <title>${esc(a.title)}</title>
    <link>${SITE_URL}/article/${esc(a.slug)}</link>
    <guid>${SITE_URL}/article/${esc(a.slug)}</guid>
    <pubDate>${rfc822(a.date)}</pubDate>
    <category>${esc(a.category)}</category>
    <description>${esc(a.excerpt)}</description>
  </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${esc(SITE_NAME)}</title>
  <link>${SITE_URL}/</link>
  <description>${esc(SITE_TAGLINE)}</description>
  <language>fr</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;
}

function sitemap() {
  const articles = loadArticles();
  const urls = [
    `<url><loc>${SITE_URL}/</loc></url>`,
    ...CATEGORIES.map(c => `<url><loc>${SITE_URL}/categorie/${encodeURIComponent(c)}</loc></url>`),
    `<url><loc>${SITE_URL}/recherche</loc></url>`,
    `<url><loc>${SITE_URL}/contact</loc></url>`,
    `<url><loc>${SITE_URL}/a-propos</loc></url>`,
    ...articles.map(a => `<url><loc>${SITE_URL}/article/${esc(a.slug)}</loc><lastmod>${new Date(a.date).toISOString().slice(0, 10)}</lastmod></url>`)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);

  const send = (status, body, type = 'text/html; charset=utf-8') => {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(body);
  };

  try {
    if (pathname.startsWith('/css/') || pathname.startsWith('/img/')) {
      const file = path.normalize(path.join(ROOT, 'public', pathname));
      if (!file.startsWith(path.join(ROOT, 'public')) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        return send(404, 'Not found', 'text/plain; charset=utf-8');
      }
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=3600' });
      return fs.createReadStream(file).pipe(res);
    }

    if (req.method === 'GET' && pathname === '/') return send(200, pageHome());
    if (req.method === 'GET' && pathname === '/rss.xml') return send(200, rssFeed(), 'application/rss+xml; charset=utf-8');
    if (req.method === 'GET' && pathname === '/sitemap.xml') return send(200, sitemap(), 'application/xml; charset=utf-8');
    if (req.method === 'GET' && pathname === '/recherche') return send(200, pageSearch(url.searchParams.get('q') || ''));
    if (req.method === 'GET' && pathname === '/contact') {
      const envoye = url.searchParams.get('envoye');
      if (envoye !== null) return send(200, pageContactDone(envoye === '1'));
      return send(200, pageContact());
    }
    if (req.method === 'POST' && pathname === '/contact') {
      const ok = handleContactPost(await parseBody(req)).ok;
      res.writeHead(303, { Location: '/contact?envoye=' + (ok ? '1' : '0') });
      return res.end();
    }
    if (req.method === 'GET' && pathname === '/a-propos') return send(200, pageAbout());
    if (req.method === 'GET' && pathname === '/admin') {
      const publie = url.searchParams.get('publie');
      if (publie) return send(200, pageAdminDone(publie !== 'erreur' ? { ok: true, slug: publie } : { ok: false }));
      return send(200, pageAdmin());
    }
    if (req.method === 'POST' && pathname === '/admin') {
      const result = handleAdminPost(await parseBody(req));
      res.writeHead(303, { Location: '/admin?publie=' + (result.ok ? result.slug : 'erreur') });
      return res.end();
    }
    if (req.method === 'GET' && pathname === '/admin-done') {
      return send(404, page404());
    }

    const catMatch = pathname.match(/^\/categorie\/([^/]+)$/);
    if (req.method === 'GET' && catMatch) {
      const cat = catMatch[1];
      if (!CATEGORIES.includes(cat)) return send(404, page404());
      return send(200, pageCategory(cat));
    }

    const artMatch = pathname.match(/^\/article\/([^/]+)$/);
    if (req.method === 'GET' && artMatch) {
      const html = pageArticle(artMatch[1]);
      return html ? send(200, html) : send(404, page404());
    }

    return send(404, page404());
  } catch (err) {
    console.error(err);
    return send(500, '<h1>Erreur interne</h1>', 'text/html; charset=utf-8');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`${SITE_NAME} démarré sur http://${HOST}:${PORT}`);
});
