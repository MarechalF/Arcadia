// ============================================================================
// js/articles.js — LA UNE + FIL D'ARTICLES de « L'Avenir »
// ----------------------------------------------------------------------------
// Règle d'or : aucun article n'est écrit en dur ici. Tout vient du tableau
// `articles` défini dans data/articles.js (chargé avant ce script).
// La une = l'article marqué "une": true ; le fil = tous les autres,
// filtrable par onglets de catégories générés automatiquement depuis les
// données (aucune catégorie écrite en dur).
// ============================================================================

// IIFE : chaque module a son propre scope, pour éviter les collisions de variables globales entre scripts
(() => {
const { el, fmtDate } = window.Commun;

// --- 1. LA UNE ---------------------------------------------------------------
// find : récupère le premier (et unique) article marqué "une": true
function afficherUne() {
  const une = articles.find((a) => a.une);
  if (!une) return;
  const index = articles.indexOf(une);
  el('une').innerHTML = `
    <figure>
      <img src="${une.image}" alt="Illustration de l'article à la une">
      <!-- <figure> : bloc image + légende éventuelle ; alt décrit l'image pour les lecteurs d'écran -->
    </figure>
    <p class="categorie">${une.categorie}</p>
    <h2><a href="article.html?id=${index}">${une.titre}</a></h2>
    <!-- lien vers la page article (phase 5) avec l'identifiant passé dans l'URL -->
    <p class="chapo">${une.chapo}</p>
    <p class="meta">${une.signature} — ${fmtDate(une.date)} à ${une.heure}</p>`;
}

// --- 2. LE FIL D'ARTICLES ----------------------------------------------------
// Carte d'article du fil : image, catégorie, titre (lien), extrait, métadonnées
function carteArticle(a, index) {
  const carte = document.createElement('article');
  carte.innerHTML = `
    <a href="article.html?id=${index}"><img src="${a.image}" alt=""></a>
    <p class="categorie">${a.categorie}</p>
    <h3><a href="article.html?id=${index}">${a.titre}</a></h3>
    <p class="chapo">${a.chapo}</p>
    <p class="meta">${fmtDate(a.date)} à ${a.heure}</p>`;
  return carte;
}

// Onglets de catégories : construits depuis les données, jamais en dur.
// "Tous" + une entrée par catégorie distincte trouvée dans le tableau.
function afficherOnglets() {
  const categories = [...new Set(articles.map((a) => a.categorie))];
  // Set = collection sans doublons ; new Set(tableau) dédoublonne ; [...] reconvertit en tableau
  const onglets = el('onglets');
  onglets.innerHTML = '';
  ['Tous', ...categories].forEach((cat) => {
    const bouton = document.createElement('button');
    bouton.textContent = cat;
    bouton.setAttribute('role', 'tab');
    if (cat === 'Tous') bouton.classList.add('actif');
    bouton.addEventListener('click', () => {
      onglets.querySelectorAll('button').forEach((b) => b.classList.remove('actif'));
      bouton.classList.add('actif');
      afficherFil(cat);
    });
    onglets.appendChild(bouton);
  });
}

// Fil : affiche les articles (hors une) filtrés par catégorie
function afficherFil(categorie = 'Tous') {
  const grille = el('grille-articles');
  grille.innerHTML = '';
  articles.forEach((a, index) => {
    if (a.une) return; // la une n'apparaît pas dans le fil
    if (categorie !== 'Tous' && a.categorie !== categorie) return;
    grille.appendChild(carteArticle(a, index));
  });
}

afficherUne();
afficherOnglets();
afficherFil();
})();
