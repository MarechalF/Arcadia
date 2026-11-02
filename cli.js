'use strict';

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { createServer, serveStatic } = require('./engine/server');
const { build } = require('./engine/build');
const { slugify } = require('./engine/utils');

const ROOT = __dirname;

function usage() {
  console.log(`Arcadia — moteur de site statique

Usage :
  node cli.js dev [--port N]        Serveur de développement (live reload) sur 127.0.0.1
  node cli.js build [--out DIR]     Génère le site statique dans dist/
  node cli.js serve [--port N]      Sert le dossier dist/ en local
  node cli.js new "Titre"          Crée un brouillon d'article Markdown
  node cli.js init                  Initialise un nouveau site vierge dans ./mon-site
`);
}

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const opt = (name, def) => {
    const i = args.indexOf('--' + name);
    return i >= 0 ? args[i + 1] : def;
  };

  switch (cmd) {
    case 'dev': {
      const port = Number(opt('port', process.env.PORT || 3000));
      const server = createServer(ROOT, { liveReload: true });
      server.listen(port, '127.0.0.1', () => {
        console.log(`Mode développement : http://127.0.0.1:${port} (live reload actif)`);
        console.log('Espace rédaction : http://127.0.0.1:' + port + '/admin');
      });
      break;
    }
    case 'build': {
      build(ROOT, opt('out', path.join(ROOT, 'dist')));
      break;
    }
    case 'serve': {
      const port = Number(opt('port', 8080));
      const dist = path.join(ROOT, 'dist');
      if (!fs.existsSync(dist)) {
        console.error('dist/ introuvable — lancez d\'abord : node cli.js build');
        process.exit(1);
      }
      await serveStatic(dist, port, '127.0.0.1');
      break;
    }
    case 'new': {
      const title = args[0] || await ask('Titre de l\'article : ');
      if (!title) { console.error('Titre requis.'); process.exit(1); }
      const slug = slugify(title);
      const file = path.join(ROOT, 'site/content/articles', slug + '.md');
      const fm = `---\ntitle: ${JSON.stringify(title)}\nslug: ${slug}\ncategory: Général\nauthor: ${process.env.USER || 'Rédaction'}\ndate: ${new Date().toISOString()}\nexcerpt: ""\ntags: []\npublished: false\n---\n\nÉcris ton article ici, en Markdown.\n`;
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, fm, 'utf8');
      console.log('Brouillon créé : ' + path.relative(ROOT, file));
      break;
    }
    case 'init': {
      const name = args[0] || 'mon-site';
      const dir = path.join(process.cwd(), name);
      if (fs.existsSync(dir)) { console.error('Le dossier existe déjà.'); process.exit(1); }
      for (const d of ['site/content/articles', 'site/content/pages', 'site/templates/partials', 'site/assets']) fs.mkdirSync(path.join(dir, d), { recursive: true });
      fs.writeFileSync(path.join(dir, 'site.config.json'), JSON.stringify({
        name, description: 'Mon site Arcadia', url: 'http://127.0.0.1:3000', perPage: 6
      }, null, 2));
      console.log('Site initialisé dans ' + dir + ' — copiez-y le dossier engine/ et cli.js, puis : node cli.js dev');
      break;
    }
    default:
      usage();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
