// ============================================================================
// js/carte.js — « L'ÉTAT DU MONDE » de L'Avenir (spécification définitive)
// ----------------------------------------------------------------------------
// Principe éditorial : on ne note pas le monde, on constate, qualifie et source.
// - AUCUN score / note / indice : la couleur d'un pays = son statut, point final.
// - AUCUNE donnée en dur dans ce code : tout vient de data/monde.json,
//   data/evenements.json et data/pays.geo.json (frontières locales, repli CDN).
// - Règles de gouvernance : validation au chargement (maj + sources obligatoires,
//   warning console explicite sinon) ; maj > 30 jours = « données en cours de
//   vérification » ; pays absent du JSON = GRIS (pas traité), jamais bleu « paix ».
// ============================================================================

(() => {
const { el, loadJSON, fmtDate } = window.Commun;

let globe = null;
let monde = null;
let evenements = [];
let paysParId = {};             // code ISO -> objet pays
let statutsActifs = new Set();  // statuts cochés dans la légende
let hovered = null;             // polygone survolé
let centro = {};                // code ISO -> {lat, lng} (pour pointOfView)
let datesTimeline = [];         // dates des changements de statut, triées
let indexDate = 0;
let dateCourante = null;        // date affichée par la timeline (null = aujourd'hui)
let triTableau = { cle: 'statut', dir: -1 };
let recherchePays = '';

const ORDRE_STATUTS = ['guerre', 'conflit', 'tension', 'paix']; // du plus grave au plus stable

// --- Utilitaires -------------------------------------------------------------

function normId(f) {
  return f.id || (f.properties && (f.properties.ISO_A3 || f.properties.id)) || '';
}

function centroid(f) {
  const g = f.geometry;
  const ring = g.type === 'Polygon' ? g.coordinates[0] : g.coordinates[0][0];
  let sx = 0, sy = 0;
  for (const [lng, lat] of ring) { sx += lng; sy += lat; }
  return { lat: sy / ring.length, lng: sx / ring.length };
}

// éclaircit une couleur hex (mélange avec du blanc) : effet de survol lumineux
function lighten(hex, f = 0.45) {
  const n = parseInt(hex.slice(1), 16);
  const m = (c) => Math.round(c + (255 - c) * f);
  return `rgb(${m((n >> 16) & 255)},${m((n >> 8) & 255)},${m(n & 255)})`;
}

function couleurStatut(s) { const e = monde.legende[s]; return e ? e.couleur : '#666666'; }
function libelleStatut(s) { const e = monde.legende[s]; return e ? e.libelle : s; }

// historique trié par date (les dates ISO se comparent comme des chaînes)
function histTrie(p) { return [...(p.historique || [])].sort((a, b) => a.date.localeCompare(b.date)); }

// entrée d'historique à une date donnée : la dernière dont la date est <= date
function entreeADate(p, date) {
  const h = histTrie(p);
  if (!h.length) return null;
  let choisi = h[0];
  for (const e of h) { if (e.date <= date) choisi = e; else break; }
  return choisi;
}
function statutADate(p, date) { const e = entreeADate(p, date); return e ? e.statut : p.statut; }
function depuisADate(p, date) { const e = entreeADate(p, date); return e ? e.date : p.statutDepuis; }

// statut / date de changement affichés : à la date de la timeline si active, sinon maintenant
function statutAffiche(p) { return dateCourante ? statutADate(p, dateCourante) : p.statut; }
function depuisAffiche(p) { return dateCourante ? depuisADate(p, dateCourante) : p.statutDepuis; }

// maj périmée = plus de 30 jours (règle de gouvernance §6)
function estPerime(p) {
  return (Date.now() - new Date(p.maj + 'T00:00:00').getTime()) > 30 * 24 * 3600 * 1000;
}

// couleur d'un polygone : statut seul. Pays non traité = gris. Statut décoché = assombri.
function couleurPays(f) {
  const p = paysParId[normId(f)];
  if (!p) return '#3d4657'; // non traité par la rédaction : gris, PAS bleu paix
  const s = statutAffiche(p);
  if (!statutsActifs.has(s)) return '#1c2230';
  const base = couleurStatut(s);
  return (hovered && normId(hovered) === normId(f)) ? lighten(base) : base;
}

// --- Validation au chargement (gouvernance §6.5) -------------------------------
function validerMonde(m) {
  Object.entries(m.pays).forEach(([id, p]) => {
    if (!p.maj) console.warn(`[monde.json] ${id} : champ "maj" manquant (obligatoire)`);
    if (!p.sources || !p.sources.length) console.warn(`[monde.json] ${id} : champ "sources" manquant (obligatoire)`);
    if (p.statut && !m.legende[p.statut]) console.warn(`[monde.json] ${id} : statut "${p.statut}" absent de la légende`);
  });
}

// --- Compteurs du monde (5.2) : dénombrement par statut, recalculé à chaque date -
function afficherCompteurs() {
  const comptes = {};
  Object.values(monde.pays).forEach((p) => {
    const s = statutAffiche(p);
    comptes[s] = (comptes[s] || 0) + 1;
  });
  el('compteurs').textContent = ORDRE_STATUTS
    .filter((s) => comptes[s] > 0)
    .map((s) => `${comptes[s]} pays en ${libelleStatut(s).toLowerCase()}`)
    .join(' · ');
}

// --- Ticker (5.4 / P4) : plus récents d'abord, source affichée, clic = globe + fiche
function construireTicker() {
  const ul = el('ticker');
  const tries = [...evenements].sort((a, b) => b.date.localeCompare(a.date));
  const ajouter = () => tries.forEach((e) => {
    const p = paysParId[e.pays];
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<time>${fmtDate(e.date)}</time> <strong>${p ? p.nom : e.pays}</strong> : ${e.description} <span class="src">(${e.source})</span>`;
    b.addEventListener('click', () => {
      if (p) {
        afficherFiche(p);
        if (globe && centro[p.id]) globe.pointOfView({ lat: centro[p.id].lat, lng: centro[p.id].lng }, 1200);
      }
    });
    li.appendChild(b);
    ul.appendChild(li);
  });
  ajouter();
  ajouter(); // liste doublée : l'animation CSS translateX(-50%) boucle parfaitement
}

// --- Légende interactive + définitions publiques des statuts (le « i », §2) -------
function construireLegende() {
  const ul = el('legende');
  Object.entries(monde.legende).forEach(([statut, e]) => {
    statutsActifs.add(statut);
    const li = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    input.addEventListener('change', () => {
      if (input.checked) statutsActifs.add(statut); else statutsActifs.delete(statut);
      if (globe) globe.polygonCapColor(couleurPays);
      rafraichirTableau();
    });
    const pastille = document.createElement('span');
    pastille.className = 'pastille';
    pastille.style.background = e.couleur;
    label.appendChild(input);
    label.appendChild(pastille);
    label.appendChild(document.createTextNode(e.libelle));
    li.appendChild(label);
    ul.appendChild(li);
  });
  // le « i » : critères publics de chaque statut (texte de la section 2 de la spec)
  const div = el('definitions-contenu');
  ORDRE_STATUTS.forEach((s) => {
    const e = monde.legende[s];
    if (!e) return;
    const p = document.createElement('p');
    p.innerHTML = `<span class="pastille" style="background:${e.couleur}"></span> <strong>${e.libelle}</strong> — ${e.critere}`;
    div.appendChild(p);
  });
  const note = document.createElement('p');
  note.className = 'seuils';
  note.textContent = monde.seuils || '';
  div.appendChild(note);
}

// --- Fiche pays (5.3 / P3) --------------------------------------------------------
function afficherFiche(p) {
  const s = statutAffiche(p);
  const e = monde.legende[s];
  const couleur = e ? e.couleur : '#666666';
  const panneau = el('panneau-info');

  // faits chiffrés, en tableau, chacun avec sa source et sa date
  const lignesFaits = (p.faits || []).map((f) =>
    `<tr><td>${f.libelle}</td><td>${f.valeur}</td><td>${f.source}</td><td>${f.dateFait}</td></tr>`).join('');
  const faits = (p.faits && p.faits.length)
    ? `<table class="faits"><thead><tr><th>Indicateur</th><th>Valeur</th><th>Source</th><th>Date</th></tr></thead><tbody>${lignesFaits}</tbody></table>`
    : '<p>Aucun fait chiffré disponible.</p>';

  // derniers événements liés, du plus récent au plus ancien (via evenementsLies)
  const evLies = (p.evenementsLies || [])
    .map((id) => evenements.find((x) => x.id === id))
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));
  const evHtml = evLies.length
    ? evLies.map((ev) => `<li>${fmtDate(ev.date)} — ${ev.description} <span class="src">(${ev.source})</span></li>`).join('')
    : '<li>Aucun événement récent.</li>';

  panneau.innerHTML = `
    <h3>${p.nom}</h3>
    <p><span class="badge-statut" style="background:${couleur}">${libelleStatut(s)}</span>
       <span class="depuis">depuis ${fmtDate(depuisAffiche(p))}</span></p>
    <div class="fiche">
      <p><strong>Nature :</strong> ${p.nature}</p>
      <p><strong>Acteurs :</strong> ${p.acteurs}</p>
      ${faits}
      <h4>Derniers événements</h4>
      <ul class="evenements-liste">${evHtml}</ul>
      <p class="resume">${p.resume}</p>
      <p class="source">Sources : ${(p.sources || []).join(', ')}</p>
      <p class="maj${estPerime(p) ? ' avertissement' : ''}">Mise à jour : ${fmtDate(p.maj)}${estPerime(p) ? ' — données en cours de vérification (> 30 jours)' : ''}</p>
      <p><button id="copier-lien" type="button">Copier le lien de cette fiche</button></p>
    </div>`;

  // bouton « copier le lien » : partage via ancre #pays=ISO (API presse-papiers + repli)
  const bouton = el('copier-lien');
  bouton.addEventListener('click', async () => {
    const url = location.origin + location.pathname + '#pays=' + p.id;
    try { await navigator.clipboard.writeText(url); bouton.textContent = 'Lien copié !'; }
    catch (err) { bouton.textContent = url; }
  });
}

// --- Tableau des pays (5.5 / P5) ---------------------------------------------------
function rafraichirTableau() {
  const tbody = el('corps-tableau');
  tbody.innerHTML = '';
  let entrees = Object.entries(monde.pays).map(([id, p]) => ({ id, p, s: statutAffiche(p), depuis: depuisAffiche(p) }));
  if (recherchePays) entrees = entrees.filter((x) => x.p.nom.toLowerCase().includes(recherchePays));
  const cmp = {
    nom: (a, b) => a.p.nom.localeCompare(b.p.nom, 'fr'),
    statut: (a, b) => (ORDRE_STATUTS.indexOf(a.s) - ORDRE_STATUTS.indexOf(b.s)) || b.depuis.localeCompare(a.depuis),
    depuis: (a, b) => a.depuis.localeCompare(b.depuis),
    maj: (a, b) => a.p.maj.localeCompare(b.p.maj)
  }[triTableau.cle];
  entrees.sort((a, b) => cmp(a, b) * triTableau.dir);
  entrees.forEach(({ id, p, s, depuis }) => {
    const tr = document.createElement('tr');
    tr.tabIndex = 0; // navigation clavier : la ligne est focusable
    tr.innerHTML = `<td>${p.nom}</td>
      <td><span class="pastille" style="background:${couleurStatut(s)}"></span>${libelleStatut(s)}</td>
      <td>${p.nature}</td><td>${fmtDate(depuis)}</td><td>${fmtDate(p.maj)}</td>`;
    const activer = () => {
      afficherFiche(p);
      if (globe && centro[id]) globe.pointOfView({ lat: centro[id].lat, lng: centro[id].lng }, 1200);
    };
    tr.addEventListener('click', activer);
    tr.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); activer(); }
    });
    tbody.appendChild(tr);
  });
}

function construireTableau(contours) {
  contours.features.forEach((f) => { centro[normId(f)] = centroid(f); });
  rafraichirTableau();
  el('recherche-pays').addEventListener('input', (ev) => {
    recherchePays = ev.target.value.trim().toLowerCase();
    rafraichirTableau();
  });
  document.querySelectorAll('#tableau-pays th button').forEach((b) => {
    b.addEventListener('click', () => {
      const cle = b.dataset.tri;
      if (triTableau.cle === cle) triTableau.dir *= -1;
      else triTableau = { cle, dir: 1 };
      rafraichirTableau();
    });
  });
}

// --- Timeline (5.4 / P6) : on rejoue l'histoire des statuts ----------------------
function majAffichageDate() {
  el('date-curseur').textContent = fmtDate(dateCourante);
  el('periode-min').textContent = fmtDate(datesTimeline[0]);
  el('periode-max').textContent = fmtDate(datesTimeline[datesTimeline.length - 1]);
}

function construireTimeline() {
  datesTimeline = [...new Set(
    Object.values(monde.pays).flatMap((p) => (p.historique || []).map((e) => e.date))
  )].sort();
  if (datesTimeline.length < 2) return;
  indexDate = datesTimeline.length - 1;
  dateCourante = datesTimeline[indexDate];

  const curseur = el('curseur');
  curseur.max = datesTimeline.length - 1;
  curseur.value = indexDate;
  majAffichageDate();

  curseur.addEventListener('input', () => {
    indexDate = Number(curseur.value);
    dateCourante = datesTimeline[indexDate];
    majAffichageDate();
    if (globe) globe.polygonCapColor(couleurPays); // recolorie à la date choisie
    afficherCompteurs();                            // les compteurs suivent la date
    rafraichirTableau();                            // le tableau aussi
  });

  // lecture automatique, jusqu'à la fin de la période
  const bouton = el('lecture');
  let timer = null;
  bouton.addEventListener('click', () => {
    if (timer) { clearInterval(timer); timer = null; bouton.textContent = 'Lecture'; return; }
    bouton.textContent = 'Pause';
    timer = setInterval(() => {
      indexDate++;
      if (indexDate >= datesTimeline.length) {
        indexDate = datesTimeline.length - 1;
        clearInterval(timer); timer = null; bouton.textContent = 'Lecture';
      }
      curseur.value = indexDate;
      curseur.dispatchEvent(new Event('input'));
    }, 1200);
  });
}

// --- Message de secours -----------------------------------------------------------
function afficherSecours() {
  el('globe').hidden = true;
  el('legende-fieldset').hidden = true;
  el('globe-secours').hidden = false;
  // ticker, compteurs et tableau restent visibles : la donnée reste accessible
}

// --- Globe 3D (5.1 / P2) ------------------------------------------------------------
function construireGlobe(contours) {
  const conteneur = el('globe');
  globe = Globe()(conteneur)
    .width(conteneur.clientWidth || 800)
    .height(520)
    .backgroundColor('#000000')
    .polygonsData(contours.features)
    .polygonCapColor(couleurPays)        // couleur = statut, rien d'autre
    .polygonSideColor(() => 'rgba(0,0,0,0.25)')
    .polygonStrokeColor(() => '#000000')
    .polygonAltitude(() => 0.01)
    .onPolygonHover((f) => {
      hovered = f;
      if (globe) globe.polygonCapColor(couleurPays); // survol lumineux
      // infobulle : « Pays — Statut depuis [date] »
      const bulle = el('infobulle');
      const p = f && paysParId[normId(f)];
      if (p) {
        bulle.textContent = `${p.nom} — ${libelleStatut(statutAffiche(p))} depuis ${fmtDate(depuisAffiche(p))}`;
        bulle.hidden = false;
      } else bulle.hidden = true;
      conteneur.style.cursor = f ? 'pointer' : 'default';
    })
    .onPolygonClick((f) => {
      const p = f && paysParId[normId(f)];
      if (p) afficherFiche(p);
    });

  // l'infobulle suit le curseur
  const bulle = el('infobulle');
  conteneur.addEventListener('mousemove', (ev) => {
    const r = conteneur.getBoundingClientRect();
    bulle.style.left = (ev.clientX - r.left + 12) + 'px';
    bulle.style.top = (ev.clientY - r.top + 12) + 'px';
  });

  // rotation automatique lente, arrêtée dès l'interaction (événement "start" du drag)
  const controles = globe.controls();
  controles.autoRotate = true;
  controles.autoRotateSpeed = 0.6;
  controles.addEventListener('start', () => { controles.autoRotate = false; });

  // pulse discret des pays en guerre à la date affichée
  let phase = 0;
  setInterval(() => {
    phase ^= 1;
    if (!globe) return;
    globe.polygonAltitude((f) => {
      const p = paysParId[normId(f)];
      if (p && statutAffiche(p) === 'guerre') return 0.02 + phase * 0.025;
      return 0.01;
    });
  }, 900);
}

// --- Initialisation ------------------------------------------------------------------
async function init() {
  try {
    monde = await loadJSON('data/monde.json');
    validerMonde(monde);
    evenements = await loadJSON('data/evenements.json');
    Object.entries(monde.pays).forEach(([id, p]) => { paysParId[id] = { id, ...p }; });

    construireTicker();
    construireLegende();
    afficherCompteurs();

    // secours si le CDN Globe.gl n'a pas chargé : ticker + tableau restent utilisables
    if (typeof Globe === 'undefined') { afficherSecours(); construireTableau({ features: [] }); return; }

    // frontières en local d'abord ; repli CDN si le fichier local manque
    let contours;
    try { contours = await loadJSON('data/pays.geo.json'); }
    catch (e) { contours = await loadJSON('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'); }

    construireGlobe(contours);
    construireTableau(contours);
    construireTimeline();

    const maj = el('maj-globale');
    maj.textContent = monde.titre + ' — mise à jour globale : ' + fmtDate(monde.majGlobale);
    maj.hidden = false;

    // lien partagé #pays=ISO : ouvre directement la fiche
    const m = (location.hash || '').match(/pays=([A-Za-z]{3})/);
    if (m && paysParId[m[1].toUpperCase()]) {
      const p = paysParId[m[1].toUpperCase()];
      afficherFiche(p);
      if (centro[p.id]) globe.pointOfView({ lat: centro[p.id].lat, lng: centro[p.id].lng }, 1200);
    }
  } catch (err) {
    console.error(err);
    afficherSecours();
  }
}

init();
})();
