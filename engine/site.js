'use strict';

const fs = require('fs');
const path = require('path');
const { esc, slugify, safeJoin, readJson, formatDate, formatDateTime } = require('./utils');
const { renderMarkdown, parseFrontMatter } = require('./markdown');

class Site {
  constructor(root) {
    this.root = path.resolve(root);
    this.config = readJson(path.join(this.root, 'site.config.json'));
    this.contentDir = path.join(this.root, this.config.contentDir || 'site/content');
    this.templatesDir = path.join(this.root, this.config.templatesDir || 'site/templates');
    this.assetsDir = path.join(this.root, this.config.assetsDir || 'site/assets');
    this.articlesDir = path.join(this.contentDir, 'articles');
    this.url = (this.config.url || 'http://127.0.0.1:3000').replace(/\/$/, '');
    this._articles = null;
  }

  relUrl(p = '/') {
    return this.url + (p.startsWith('/') ? p : '/' + p);
  }

  loadArticles({ includeDrafts = false } = {}) {
    if (this._articles) return this._articles;
    const articles = [];
    if (fs.existsSync(this.articlesDir)) {
      for (const file of fs.readdirSync(this.articlesDir).filter(f => f.endsWith('.md'))) {
        const raw = fs.readFileSync(path.join(this.articlesDir, file), 'utf8');
        const { meta, body } = parseFrontMatter(raw);
        const slug = meta.slug || slugify(path.basename(file, '.md'));
        const published = meta.published !== false;
        if (!published && !includeDrafts) continue;
        articles.push({
          slug,
          title: meta.title || slug,
          category: meta.category || 'Général',
          author: meta.author || 'Rédaction',
          date: meta.date || new Date().toISOString(),
          excerpt: meta.excerpt || '',
          tags: Array.isArray(meta.tags) ? meta.tags : [],
          image: meta.image || '/assets/cover-default.svg',
          draft: !published,
          html: renderMarkdown(body),
          plain: body.replace(/[#>*`\-[\]()!]/g, ' ').replace(/\s+/g, ' ').toLowerCase(),
          sourceFile: file
        });
      }
    }
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    this._articles = articles;
    return articles;
  }

  reload() { this._articles = null; }

  getArticle(slug) {
    return this.loadArticles().find(a => a.slug === slug) || null;
  }

  categories() {
    const counts = {};
    for (const a of this.loadArticles()) counts[a.category] = (counts[a.category] || 0) + 1;
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'));
  }

  search(q) {
    const needle = String(q || '').trim().toLowerCase();
    if (!needle) return [];
    return this.loadArticles().filter(a =>
      a.title.toLowerCase().includes(needle) ||
      a.excerpt.toLowerCase().includes(needle) ||
      a.plain.includes(needle) ||
      a.author.toLowerCase().includes(needle) ||
      a.tags.some(t => t.toLowerCase().includes(needle)));
  }

  renderTemplate(name, vars = {}) {
    const file = safeJoin(this.templatesDir, name + '.html');
    let tpl = fs.readFileSync(file, 'utf8');
    const ctx = { site: this.config, url: this.url, ...vars };
    tpl = tpl.replace(/\{\{\s*include\s+"([^"]+)"\s*\}\}/g, (m, inc) => this.renderTemplate(inc, vars));
    tpl = tpl.replace(/\{\{\s*(\w+(?:\.\w+)*)\s*\}\}/g, (m, key) => {
      const val = key.split('.').reduce((o, k) => (o == null ? '' : o[k]), ctx);
      return val == null ? '' : String(val);
    });
    return tpl;
  }

  layout({ title, description, body, extraHead = '' }) {
    return this.renderTemplate('layout', {
      title: title ? `${title} — ${this.config.name}` : this.config.name,
      description: description || this.config.description,
      head: extraHead,
      body
    });
  }

  articleCard(a, { showCategory = true } = {}) {
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

  pageHome(page = 1) {
    const perPage = this.config.perPage || 6;
    const articles = this.loadArticles();
    const featured = articles[0];
    const rest = articles.slice(1);
    const totalPages = Math.max(1, Math.ceil(rest.length / perPage));
    page = Math.min(Math.max(1, page), totalPages);
    const slice = rest.slice((page - 1) * perPage, page * perPage);

    let body = '';
    if (featured && page === 1) {
      body += `<section class="hero">
  <div class="hero-featured">
    <a class="chip chip-lg" href="/categorie/${encodeURIComponent(featured.category)}">${esc(featured.category)}</a>
    <h1><a href="/article/${esc(featured.slug)}">${esc(featured.title)}</a></h1>
    <p class="hero-excerpt">${esc(featured.excerpt)}</p>
    <p class="card-meta">Par <strong>${esc(featured.author)}</strong> — ${formatDateTime(featured.date)}</p>
  </div>
  <aside class="hero-side">
    <h2 class="side-title">À la une</h2>
    <ol class="top-list">
      ${articles.slice(0, 5).map(a => `<li><a href="/article/${esc(a.slug)}">${esc(a.title)}</a><span>${esc(a.category)}</span></li>`).join('')}
    </ol>
  </aside>
</section>`;
    }
    body += `<section><h2 class="section-title">Derniers articles</h2>
  <div class="grid">${slice.map(a => this.articleCard(a)).join('') || '<p class="empty">Aucun article pour le moment.</p>'}</div>
  ${this.pagination(page, totalPages, '/')}
</section>`;
    return this.layout({ title: '', description: this.config.description, body });
  }

  pagination(page, totalPages, base) {
    if (totalPages <= 1) return '';
    const sep = base.includes('?') ? '&' : '?';
    let links = '';
    if (page > 1) links += `<a class="page-link" href="${base}${base === '/' && page === 2 ? '' : sep + 'page=' + (page - 1)}">← Précédent</a>`;
    links += `<span class="page-num">Page ${page} / ${totalPages}</span>`;
    if (page < totalPages) links += `<a class="page-link" href="${base}${sep}page=${page + 1}">Suivant →</a>`;
    return `<nav class="pagination">${links}</nav>`;
  }

  pageCategory(cat, page = 1) {
    const perPage = this.config.perPage || 9;
    const all = this.loadArticles().filter(a => a.category === cat);
    const totalPages = Math.max(1, Math.ceil(all.length / perPage));
    page = Math.min(Math.max(1, page), totalPages);
    const slice = all.slice((page - 1) * perPage, page * perPage);
    const body = `
<nav class="breadcrumb"><a href="/">Accueil</a> › ${esc(cat)}</nav>
<h1 class="page-title">${esc(cat)}</h1>
${slice.length
  ? `<div class="grid">${slice.map(a => this.articleCard(a, { showCategory: false })).join('')}</div>${this.pagination(page, totalPages, '/categorie/' + encodeURIComponent(cat))}`
  : '<p class="empty">Aucun article dans cette rubrique pour le moment.</p>'}`;
    return this.layout({ title: cat, description: `Rubrique ${cat} — ${this.config.name}.`, body });
  }

  pageArticle(slug) {
    const a = this.getArticle(slug);
    if (!a) return null;
    const related = this.loadArticles()
      .filter(x => x.slug !== a.slug && (x.category === a.category || a.tags.some(t => x.tags.includes(t))))
      .slice(0, 3);
    const tags = a.tags.map(t => `<a class="tag" href="/recherche?q=${encodeURIComponent(t)}">#${esc(t)}</a>`).join(' ');
    const body = `
<nav class="breadcrumb"><a href="/">Accueil</a> › <a href="/categorie/${encodeURIComponent(a.category)}">${esc(a.category)}</a> › ${esc(a.title)}</nav>
<article class="article-full">
  <a class="chip chip-lg" href="/categorie/${encodeURIComponent(a.category)}">${esc(a.category)}</a>
  <h1 class="article-title">${esc(a.title)}</h1>
  <p class="article-meta">Par <strong>${esc(a.author)}</strong> — publié le ${formatDateTime(a.date)}</p>
  <img class="article-img" src="${esc(a.image)}" alt="">
  <div class="article-body">
    ${a.excerpt ? `<p class="lead">${esc(a.excerpt)}</p>` : ''}
    ${a.html}
  </div>
  ${tags ? `<p class="article-tags">${tags}</p>` : ''}
</article>
${related.length ? `<section><h2 class="section-title">À lire aussi</h2><div class="grid">${related.map(x => this.articleCard(x)).join('')}</div></section>` : ''}`;
    return this.layout({
      title: a.title,
      description: a.excerpt,
      body,
      extraHead: `<meta property="og:title" content="${esc(a.title)}">
<meta property="og:description" content="${esc(a.excerpt)}">
<meta property="og:type" content="article">
<link rel="canonical" href="${this.relUrl('/article/' + a.slug)}">`
    });
  }

  pageSearch(q, page = 1) {
    const perPage = this.config.perPage || 9;
    const results = this.search(q);
    const totalPages = Math.max(1, Math.ceil(results.length / perPage));
    page = Math.min(Math.max(1, page), totalPages);
    const slice = results.slice((page - 1) * perPage, page * perPage);
    const body = `
<h1 class="page-title">Recherche</h1>
<form class="search-form" action="/recherche" method="get">
  <input type="search" name="q" value="${esc(q || '')}" placeholder="Rechercher un article, un auteur, un sujet…" aria-label="Recherche">
  <button type="submit">Rechercher</button>
</form>
${q ? `<p class="search-info">${results.length} résultat(s) pour « ${esc(q)} »</p>` : '<p class="search-info">Saisissez un mot-clé pour rechercher dans tous les articles.</p>'}
${slice.length ? `<div class="grid">${slice.map(a => this.articleCard(a)).join('')}</div>${this.pagination(page, totalPages, '/recherche?q=' + encodeURIComponent(q))}` : (q ? '<p class="empty">Aucun article ne correspond à votre recherche.</p>' : '')}`;
    return this.layout({ title: q ? `Recherche : ${q}` : 'Recherche', description: 'Recherchez parmi tous les articles.', body });
  }

  pageStatic(slug) {
    const file = path.join(this.contentDir, 'pages', slug + '.md');
    if (!fs.existsSync(file)) return null;
    const { meta, body } = parseFrontMatter(fs.readFileSync(file, 'utf8'));
    const title = meta.title || slug;
    const content = `
<nav class="breadcrumb"><a href="/">Accueil</a> › ${esc(title)}</nav>
<h1 class="page-title">${esc(title)}</h1>
<div class="article-body">${renderMarkdown(body)}</div>`;
    return this.layout({ title, description: meta.excerpt || title, body: content });
  }

  rss() {
    const articles = this.loadArticles().slice(0, 20);
    const items = articles.map(a => `  <item>
    <title>${esc(a.title)}</title>
    <link>${this.relUrl('/article/' + a.slug)}</link>
    <guid isPermaLink="true">${this.relUrl('/article/' + a.slug)}</guid>
    <pubDate>${new Date(a.date).toUTCString()}</pubDate>
    <category>${esc(a.category)}</category>
    <description>${esc(a.excerpt)}</description>
  </item>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(this.config.name)}</title>
  <link>${this.relUrl('/')}</link>
  <atom:link href="${this.relUrl('/rss.xml')}" rel="self" type="application/rss+xml"/>
  <description>${esc(this.config.description)}</description>
  <language>fr</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;
  }

  sitemap() {
    const articles = this.loadArticles();
    const urls = [
      `<url><loc>${this.relUrl('/')}</loc></url>`,
      ...this.categories().map(c => `<url><loc>${this.relUrl('/categorie/' + encodeURIComponent(c.name))}</loc></url>`),
      `<url><loc>${this.relUrl('/recherche')}</loc></url>`,
      ...articles.map(a => `<url><loc>${this.relUrl('/article/' + a.slug)}</loc><lastmod>${new Date(a.date).toISOString().slice(0, 10)}</lastmod></url>`)
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
  }

  searchIndex() {
    return JSON.stringify(this.loadArticles().map(a => ({
      slug: a.slug, title: a.title, category: a.category,
      author: a.author, date: a.date, excerpt: a.excerpt, tags: a.tags, text: a.plain.slice(0, 4000)
    })));
  }
}

module.exports = { Site };
