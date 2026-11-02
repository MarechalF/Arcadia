'use strict';

const fs = require('fs');
const path = require('path');
const { Site } = require('./site');
const { safeJoin } = require('./utils');

function write(out, rel, content) {
  const file = safeJoin(out, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

function build(siteRoot, outDir) {
  const site = new Site(siteRoot);
  const out = path.resolve(outDir || path.join(siteRoot, 'dist'));
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const perPage = site.config.perPage || 6;
  const articles = site.loadArticles();
  const rest = articles.slice(1);
  const homePages = Math.max(1, Math.ceil(rest.length / perPage));

  write(out, 'index.html', site.pageHome(1));
  for (let p = 2; p <= homePages; p++) {
    write(out, `page/${p}/index.html`, site.pageHome(p));
  }

  for (const cat of site.categories()) {
    const count = articles.filter(a => a.category === cat.name).length;
    const pages = Math.max(1, Math.ceil(count / (site.config.perPage || 9)));
    for (let p = 1; p <= pages; p++) {
      const rel = p === 1 ? `categorie/${encodeURIComponent(cat.name)}/index.html` : `categorie/${encodeURIComponent(cat.name)}/page/${p}/index.html`;
      write(out, rel, site.pageCategory(cat.name, p));
    }
  }

  for (const a of articles) {
    write(out, `article/${a.slug}/index.html`, site.pageArticle(a.slug));
  }

  const q = '';
  write(out, 'recherche/index.html', site.pageSearch(q));

  const pagesDir = path.join(site.contentDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    for (const f of fs.readdirSync(pagesDir).filter(f => f.endsWith('.md'))) {
      const slug = path.basename(f, '.md');
      const html = site.pageStatic(slug);
      if (html) write(out, `${slug}/index.html`, html);
    }
  }

  write(out, 'rss.xml', site.rss());
  write(out, 'sitemap.xml', site.sitemap());
  write(out, 'robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.relUrl('/sitemap.xml')}\n`);
  write(out, 'search-index.json', site.searchIndex());

  copyDir(site.assetsDir, path.join(out, 'assets'));

  const notFound = site.layout({
    title: 'Page introuvable',
    description: 'Erreur 404.',
    body: '<h1 class="page-title">Page introuvable</h1><p class="empty">La page demandée n\'existe pas. <a href="/">Retour à l\'accueil</a></p>'
  });
  write(out, '404.html', notFound);

  console.log(`Build terminé : ${out}`);
  console.log(`- ${articles.length} article(s), ${site.categories().length} rubrique(s), ${homePages} page(s) d'accueil`);
  return out;
}

module.exports = { build };
