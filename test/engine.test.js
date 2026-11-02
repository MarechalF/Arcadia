'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');

const { renderMarkdown, parseFrontMatter, sanitizeHtml } = require('../engine/markdown');
const { esc, slugify, safeJoin, hashPassword, verifyPassword, sign, safeEqual } = require('../engine/utils');
const { Site } = require('../engine/site');
const { build } = require('../engine/build');
const { createServer } = require('../engine/server');

const ROOT = path.join(__dirname, '..');

test('esc échappe le HTML', () => {
  assert.strictEqual(esc('<script>"x"</script>'), '&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
});

test('slugify', () => {
  assert.strictEqual(slugify('Économie verte 2025 !'), 'economie-verte-2025');
});

test('safeJoin bloque le path traversal', () => {
  const root = '/srv/site';
  assert.strictEqual(safeJoin(root, 'assets/a.css'), '/srv/site/assets/a.css');
  assert.throws(() => safeJoin(root, '../../etc/passwd'));
});

test('markdown : titres, listes, gras, code, liens', () => {
  const html = renderMarkdown('# Titre\n\nTexte **gras** et *italique*.\n\n- un\n- deux\n\n```js\ncode()\n```\n\n[lien](https://exemple.fr)');
  assert.match(html, /<h1>Titre<\/h1>/);
  assert.match(html, /<strong>gras<\/strong>/);
  assert.match(html, /<em>italique<\/em>/);
  assert.match(html, /<ul><li>un<\/li><li>deux<\/li><\/ul>/);
  assert.match(html, /<pre><code>code\(\)<\/code><\/pre>/);
  assert.match(html, /<a href="https:\/\/exemple\.fr">lien<\/a>/);
});

test('markdown : sanitisation anti-XSS', () => {
  const evil = '<script>alert(1)</script>\n\n[lien](javascript:alert(2))\n\n<img src="x" onerror="alert(3)">';
  const html = renderMarkdown(evil);
  assert.ok(!html.includes('<script'));
  assert.ok(!html.includes('javascript:'));
  assert.ok(!html.includes('onerror'));
  assert.strictEqual(sanitizeHtml('<a href="javascript:alert(1)">x</a>'), '<a href="#">x</a>');
});

test('front matter', () => {
  const { meta, body } = parseFrontMatter('---\ntitle: "Test"\ntags: [a, b]\npublished: false\n---\n\nCorps');
  assert.strictEqual(meta.title, 'Test');
  assert.deepStrictEqual(meta.tags, ['a', 'b']);
  assert.strictEqual(meta.published, 'false');
  assert.strictEqual(body.trim(), 'Corps');
});

test('mots de passe : hash + vérification', () => {
  const stored = hashPassword('secret123');
  assert.ok(verifyPassword('secret123', stored));
  assert.ok(!verifyPassword('autre', stored));
});

test('signatures : sign/safeEqual', () => {
  const s = sign('valeur', 'cle');
  assert.ok(safeEqual(s, sign('valeur', 'cle')));
  assert.ok(!safeEqual(s, sign('valeur', 'autre-cle')));
});

test('Site : chargement des articles du site d\'exemple', () => {
  const site = new Site(ROOT);
  const articles = site.loadArticles();
  assert.ok(articles.length >= 10);
  assert.ok(articles[0].html.includes('<p>'));
  const cats = site.categories().map(c => c.name);
  assert.ok(cats.includes('Sport'));
  assert.ok(site.search('canicule').length >= 1);
  assert.ok(site.getArticle('economie-verte-2025'));
});

test('Site : rendu des pages', () => {
  const site = new Site(ROOT);
  assert.match(site.pageHome(), /Derniers articles/);
  assert.match(site.pageCategory('Sport'), /Football féminin/);
  assert.match(site.pageArticle('economie-verte-2025'), /énergies renouvelables/);
  assert.match(site.pageSearch('climat'), /résultat/);
  assert.match(site.rss(), /<rss version="2.0"/);
  assert.match(site.sitemap(), /<urlset/);
});

function get(port, p, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: p, headers }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ code: res.statusCode, headers: res.headers, body: d }));
    }).on('error', reject);
  });
}

function post(port, p, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(data).toString();
    const req = http.request({ host: '127.0.0.1', port, path: p, method: 'POST', headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body), ...headers
    } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ code: res.statusCode, headers: res.headers, body: d }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

test('serveur dev : routes publiques + sécurité', async (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arcadia-test-'));
  fs.cpSync(path.join(ROOT, 'site'), path.join(tmp, 'site'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'site.config.json'), path.join(tmp, 'site.config.json'));
  process.env.ADMIN_PASSWORD = 'test-password-123';
  const server = createServer(tmp, { liveReload: false, secret: 'secret-test' });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  t.after(() => server.close());

  const home = await get(port, '/');
  assert.strictEqual(home.code, 200);
  assert.match(home.headers['content-security-policy'], /default-src 'self'/);
  assert.strictEqual(home.headers['x-frame-options'], 'DENY');

  assert.strictEqual((await get(port, '/article/economie-verte-2025')).code, 200);
  assert.strictEqual((await get(port, '/categorie/Sport')).code, 200);
  assert.strictEqual((await get(port, '/recherche?q=climat')).code, 200);
  assert.strictEqual((await get(port, '/rss.xml')).code, 200);
  assert.strictEqual((await get(port, '/sitemap.xml')).code, 200);
  assert.strictEqual((await get(port, '/robots.txt')).code, 200);
  assert.strictEqual((await get(port, '/assets/style.css')).code, 200);
  assert.strictEqual((await get(port, '/article/inconnu')).code, 404);
  assert.strictEqual((await get(port, '/assets/../../site.config.json')).code, 404);

  const adminAnon = await get(port, '/admin');
  assert.strictEqual(adminAnon.code, 303);
  assert.match(adminAnon.headers.location, /\/admin\/login/);

  const badLogin = await post(port, '/admin/login', { user: 'admin', password: 'mauvais', csrf: 'x', next: '/admin' });
  assert.match(badLogin.body, /Identifiants incorrects/);

  const login = await post(port, '/admin/login', { user: 'admin', password: 'test-password-123', csrf: 'whatever', next: '/admin' });
  assert.strictEqual(login.code, 303);
  const setCookie = login.headers['set-cookie'][0];
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  const cookie = setCookie.split(';')[0];

  const adminOk = await get(port, '/admin', { Cookie: cookie });
  assert.strictEqual(adminOk.code, 200);
  assert.match(adminOk.body, /Espace rédaction/);

  const publishNoCsrf = await post(port, '/admin/publish', { title: 'Test', content: 'x', category: 'Test', author: 'Moi' }, { Cookie: cookie });
  assert.strictEqual(publishNoCsrf.code, 403);

  const csrfToken = adminOk.body.match(/name="csrf" value="([^"]+)"/)[1];
  const publish = await post(port, '/admin/publish', {
    title: 'Article test moteur', category: 'Technologie', author: 'Testeur',
    excerpt: 'Résumé', tags: 'test', content: 'Corps de test.\n\nDeuxième paragraphe.', csrf: csrfToken
  }, { Cookie: cookie });
  assert.strictEqual(publish.code, 303);
  const home2 = await get(port, '/');
  assert.match(home2.body, /Article test moteur/);

  fs.rmSync(tmp, { recursive: true, force: true });
});

test('build statique génère dist/ complet', (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arcadia-build-'));
  fs.cpSync(path.join(ROOT, 'site'), path.join(tmp, 'site'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'site.config.json'), path.join(tmp, 'site.config.json'));
  const out = path.join(tmp, 'dist');
  build(tmp, out);
  assert.ok(fs.existsSync(path.join(out, 'index.html')));
  assert.ok(fs.existsSync(path.join(out, 'article/economie-verte-2025/index.html')));
  assert.ok(fs.existsSync(path.join(out, 'rss.xml')));
  assert.ok(fs.existsSync(path.join(out, 'sitemap.xml')));
  assert.ok(fs.existsSync(path.join(out, 'robots.txt')));
  assert.ok(fs.existsSync(path.join(out, 'search-index.json')));
  assert.ok(fs.existsSync(path.join(out, 'assets/style.css')));
  assert.ok(fs.existsSync(path.join(out, '404.html')));
  fs.rmSync(tmp, { recursive: true, force: true });
});
