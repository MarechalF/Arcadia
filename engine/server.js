'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Site } = require('./site');
const { SecurityHeaders, RateLimiter, AdminAuth, Csrf } = require('./security');
const { esc, slugify, safeJoin, formatDate } = require('./utils');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};

function parseBody(req, limit = 1e6) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > limit) { reject(new Error('Payload trop volumineux')); req.destroy(); }
    });
    req.on('end', () => {
      const out = {};
      for (const [k, v] of new URLSearchParams(data)) out[k] = v;
      resolve(out);
    });
    req.on('error', reject);
  });
}

function createServer(siteRoot, { liveReload = false, secret } = {}) {
  const site = new Site(siteRoot);
  const sec = secret || crypto.randomBytes(32).toString('hex');
  const auth = new AdminAuth(siteRoot, sec);
  const csrf = new Csrf(sec);
  const limiter = new RateLimiter({ windowMs: 60000, max: 120 });
  const postLimiter = new RateLimiter({ windowMs: 60000, max: 10 });
  const sseClients = new Set();

  const broadcast = () => {
    for (const res of sseClients) res.write('data: reload\n\n');
  };
  if (liveReload) {
    for (const dir of [site.contentDir, site.templatesDir, site.assetsDir, siteRoot]) {
      try {
        fs.watch(dir, { recursive: true }, () => { site.reload(); broadcast(); });
      } catch { /* watch non supporté */ }
    }
  }

  const send = (res, status, body, type = 'text/html; charset=utf-8', headers = {}) => {
    SecurityHeaders.middleware(res);
    res.writeHead(status, { 'Content-Type': type, ...headers });
    res.end(body);
  };

  const sendRedirect = (res, location, headers = {}) => {
    SecurityHeaders.middleware(res);
    res.writeHead(303, { Location: location, ...headers });
    res.end();
  };

  const requireAdmin = (req, res) => {
    if (auth.isLoggedIn(req)) return true;
    sendRedirect(res, '/admin/login?next=' + encodeURIComponent(req.url));
    return false;
  };

  const loginPage = (error = '', next = '/admin') => site.layout({
    title: 'Connexion rédaction',
    description: 'Espace rédaction sécurisé.',
    body: `
<h1 class="page-title">Connexion — espace rédaction</h1>
${error ? `<p class="notice error">${esc(error)}</p>` : ''}
<form class="form" action="/admin/login" method="post">
  <input type="hidden" name="next" value="${esc(next)}">
  <input type="hidden" name="csrf" value="${esc(csrf.issue('login'))}">
  <label>Identifiant
    <input type="text" name="user" autocomplete="username" required>
  </label>
  <label>Mot de passe
    <input type="password" name="password" autocomplete="current-password" required>
  </label>
  <button type="submit">Se connecter</button>
</form>`
  });

  const adminPage = (req, notice = '') => {
    const articles = site.loadArticles({ includeDrafts: true });
    const rows = articles.map(a => `<tr>
    <td><a href="/article/${esc(a.slug)}">${esc(a.title)}</a>${a.draft ? ' <em>(brouillon)</em>' : ''}</td>
    <td>${esc(a.category)}</td>
    <td>${esc(a.author)}</td>
    <td>${formatDate(a.date)}</td>
    <td><form method="post" action="/admin/delete" style="display:inline">
      <input type="hidden" name="csrf" value="${esc(csrf.issue(sessionId(req)))}">
      <input type="hidden" name="slug" value="${esc(a.slug)}">
      <button type="submit" class="btn-danger" onclick="return confirm('Supprimer cet article ?')">Supprimer</button>
    </form></td>
  </tr>`).join('');
    return site.layout({
      title: 'Espace rédaction',
      description: 'Publier et gérer les articles.',
      body: `
<h1 class="page-title">Espace rédaction</h1>
${notice ? `<p class="notice success">${esc(notice)}</p>` : ''}
<p><a href="/admin/logout">Se déconnecter</a></p>
<h2 class="section-title">Publier un article</h2>
<form class="form" action="/admin/publish" method="post">
  <input type="hidden" name="csrf" value="${esc(csrf.issue(sessionId(req)))}">
  <label>Titre
    <input type="text" name="title" required maxlength="200">
  </label>
  <div class="form-row">
    <label>Catégorie
      <input type="text" name="category" list="cats" required maxlength="60">
      <datalist id="cats">${site.categories().map(c => `<option value="${esc(c.name)}">`).join('')}</datalist>
    </label>
    <label>Auteur
      <input type="text" name="author" required maxlength="100">
    </label>
  </div>
  <label>Résumé (chapô)
    <textarea name="excerpt" rows="2" required maxlength="400"></textarea>
  </label>
  <label>Étiquettes (séparées par des virgules)
    <input type="text" name="tags" maxlength="200">
  </label>
  <label>Image (URL ou chemin dans /assets/)
    <input type="text" name="image" maxlength="300" placeholder="/assets/mon-image.svg">
  </label>
  <label>Brouillon (non publié)
    <input type="checkbox" name="draft" value="1">
  </label>
  <label>Contenu (Markdown)
    <textarea name="content" rows="12" required maxlength="50000"></textarea>
  </label>
  <button type="submit">Enregistrer l'article</button>
</form>
<h2 class="section-title">Articles (${articles.length})</h2>
<table class="table">
  <thead><tr><th>Titre</th><th>Rubrique</th><th>Auteur</th><th>Date</th><th></th></tr></thead>
  <tbody>${rows}</tbody>
</table>`
    });
  };

  const sessionId = (req) => {
    const cookie = req.headers.cookie || '';
    const m = cookie.match(/arcadia_session=([^;]+)/);
    return m ? m[1].split('.')[0] : 'anon';
  };

  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(u.pathname);
    const ip = req.socket.remoteAddress || 'inconnu';

    try {
      const rl = limiter.check('g:' + ip);
      if (!rl.allowed) {
        return send(res, 429, '<h1>Trop de requêtes</h1><p>Réessayez dans ' + rl.retryAfter + ' s.</p>');
      }

      if (liveReload && pathname === '/__livereload') {
        SecurityHeaders.middleware(res);
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
        res.write('data: connected\n\n');
        sseClients.add(res);
        req.on('close', () => sseClients.delete(res));
        return;
      }

      if (pathname.startsWith('/assets/')) {
        const file = safeJoin(site.assetsDir, pathname.replace('/assets/', ''));
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
        const ext = path.extname(file).toLowerCase();
        SecurityHeaders.middleware(res);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=86400' });
        return fs.createReadStream(file).pipe(res);
      }

      if (req.method === 'GET' && pathname === '/') {
        return send(res, 200, site.pageHome(Number(u.searchParams.get('page')) || 1));
      }
      if (req.method === 'GET' && pathname === '/rss.xml') return send(res, 200, site.rss(), 'application/rss+xml; charset=utf-8');
      if (req.method === 'GET' && pathname === '/sitemap.xml') return send(res, 200, site.sitemap(), 'application/xml; charset=utf-8');
      if (req.method === 'GET' && pathname === '/robots.txt') {
        return send(res, 200, `User-agent: *\nAllow: /\nSitemap: ${site.relUrl('/sitemap.xml')}\n`, 'text/plain; charset=utf-8');
      }
      if (req.method === 'GET' && pathname === '/search-index.json') {
        return send(res, 200, site.searchIndex(), 'application/json; charset=utf-8', { 'Cache-Control': 'public, max-age=300' });
      }
      if (req.method === 'GET' && pathname === '/recherche') {
        return send(res, 200, site.pageSearch(u.searchParams.get('q') || '', Number(u.searchParams.get('page')) || 1));
      }

      const catMatch = pathname.match(/^\/categorie\/([^/]+)$/);
      if (req.method === 'GET' && catMatch) {
        if (!site.categories().some(c => c.name === catMatch[1])) return send(res, 404, page404());
        return send(res, 200, site.pageCategory(catMatch[1], Number(u.searchParams.get('page')) || 1));
      }

      const artMatch = pathname.match(/^\/article\/([^/]+)$/);
      if (req.method === 'GET' && artMatch) {
        const html = site.pageArticle(artMatch[1]);
        return html ? send(res, 200, html) : send(res, 404, page404());
      }

      const staticMatch = pathname.match(/^\/([a-z0-9-]+)$/);
      if (req.method === 'GET' && staticMatch) {
        const html = site.pageStatic(staticMatch[1]);
        if (html) return send(res, 200, html);
      }

      if (pathname.startsWith('/admin')) {
        if (req.method === 'GET' && pathname === '/admin/login') {
          if (auth.isLoggedIn(req)) return sendRedirect(res, u.searchParams.get('next') || '/admin');
          return send(res, 200, loginPage('', u.searchParams.get('next') || '/admin'));
        }
        if (req.method === 'POST' && pathname === '/admin/login') {
          const prl = postLimiter.check('login:' + ip);
          if (!prl.allowed) return send(res, 429, '<h1>Trop de tentatives</h1>');
          const body = await parseBody(req);
          if (!auth.verifyLogin(body.user, body.password)) {
            return send(res, 200, loginPage('Identifiants incorrects.', body.next || '/admin'));
          }
          const session = auth.sessions.create(body.user || 'admin');
          return sendRedirect(res, body.next && body.next.startsWith('/admin') ? body.next : '/admin', {
            'Set-Cookie': auth.sessionCookie(session)
          });
        }
        if (req.method === 'GET' && pathname === '/admin/logout') {
          const cookie = req.headers.cookie || '';
          const m = cookie.match(/arcadia_session=([^;]+)/);
          if (m) auth.sessions.destroy(m[1]);
          return sendRedirect(res, '/', { 'Set-Cookie': 'arcadia_session=; Path=/; HttpOnly; Max-Age=0' });
        }
        if (!requireAdmin(req, res)) return;
        if (req.method === 'POST' && pathname === '/admin/publish') {
          const body = await parseBody(req);
          if (!csrf.verify(sessionId(req), body.csrf)) return send(res, 403, '<h1>Jeton CSRF invalide</h1>');
          const title = (body.title || '').trim();
          const content = (body.content || '').trim();
          if (!title || !content) return send(res, 200, adminPage(req, ''));
          const slug = slugify(title) + '-' + crypto.randomBytes(3).toString('hex');
          const fm = [
            '---',
            `title: ${JSON.stringify(title)}`,
            `slug: ${slug}`,
            `category: ${JSON.stringify((body.category || '').trim() || 'Général')}`,
            `author: ${JSON.stringify((body.author || '').trim() || 'Rédaction')}`,
            `date: ${new Date().toISOString()}`,
            `excerpt: ${JSON.stringify((body.excerpt || '').trim())}`,
            `tags: [${(body.tags || '').split(',').map(t => JSON.stringify(t.trim().toLowerCase())).filter(t => t !== '""').join(', ')}]`,
            `image: ${JSON.stringify((body.image || '').trim() || '/assets/cover-default.svg')}`,
            ...(body.draft ? ['published: false'] : []),
            '---',
            '',
            content,
            ''
          ].join('\n');
          fs.writeFileSync(path.join(site.articlesDir, slug + '.md'), fm, 'utf8');
          site.reload();
          if (liveReload) broadcast();
          return sendRedirect(res, '/admin?ok=publié');
        }
        if (req.method === 'POST' && pathname === '/admin/delete') {
          const body = await parseBody(req);
          if (!csrf.verify(sessionId(req), body.csrf)) return send(res, 403, '<h1>Jeton CSRF invalide</h1>');
          const a = site.loadArticles({ includeDrafts: true }).find(x => x.slug === body.slug);
          if (a) {
            fs.unlinkSync(path.join(site.articlesDir, a.sourceFile));
            site.reload();
            if (liveReload) broadcast();
          }
          return sendRedirect(res, '/admin?ok=supprimé');
        }
        if (req.method === 'GET' && pathname === '/admin') {
          const ok = u.searchParams.get('ok');
          return send(res, 200, adminPage(req, ok ? 'Action effectuée : ' + ok : ''));
        }
        return send(res, 404, page404());
      }

      return send(res, 404, page404());
    } catch (err) {
      console.error(err);
      return send(res, 500, '<h1>Erreur interne</h1>');
    }
  });

  function page404() {
    return site.layout({
      title: 'Page introuvable',
      description: 'Erreur 404.',
      body: '<h1 class="page-title">Page introuvable</h1><p class="empty">La page demandée n\'existe pas. <a href="/">Retour à l\'accueil</a></p>'
    });
  }

  return server;
}

function serveStatic(distDir, port, host = '127.0.0.1') {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(u.pathname);
    let file = safeJoin(distDir, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const asHtml = safeJoin(distDir, pathname.replace(/\/$/, '') + '/index.html');
      if (fs.existsSync(asHtml)) file = asHtml;
      else if (fs.existsSync(safeJoin(distDir, pathname + '.html'))) file = safeJoin(distDir, pathname + '.html');
      else {
        SecurityHeaders.middleware(res);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<h1>404</h1>');
      }
    }
    const ext = path.extname(file).toLowerCase();
    SecurityHeaders.middleware(res);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
    });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(port, host, () => {
      console.log(`Site statique servi sur http://${host}:${port} (${distDir})`);
      resolve(server);
    });
  });
}

module.exports = { createServer, serveStatic };
