// ============================================================================
// js/article.js — PAGE ARTICLE (article.html?id=…)
// ----------------------------------------------------------------------------
// Lecture des paramètres d'URL : article.html?id=2 ouvre l'article n°2 du
// tableau `articles` (défini dans data/articles.js, chargé avant ce script).
// URLSearchParams(location.search) parse la query string ; si l'id est absent
// ou invalide, on affiche un message avec un lien retour.
// ============================================================================

(() => {
  const { el, fmtDate } = window.Commun;

  const params = new URLSearchParams(location.search); // "?id=2" -> params.get("id") === "2"
  const id = Number(params.get('id'));
  const a = Number.isInteger(id) ? articles[id] : undefined;

  if (!a) {
    el('article').innerHTML = '<h1>Article introuvable</h1><p>Cet article n\'existe pas (ou plus).</p>';
    return;
  }

  document.title = a.titre + ' — L\'Avenir';

  // Rendu de l'article : catégorie, titre, chapô, signature/date/heure,
  // image, puis le corps (tableau "corps" -> un <p> par paragraphe)
  el('article').innerHTML = `
    <p class="categorie">${a.categorie}</p>
    <h1>${a.titre}</h1>
    <p class="chapo">${a.chapo}</p>
    <p class="meta">${a.signature} — publié le ${fmtDate(a.date)} à ${a.heure}</p>
    <figure><img src="${a.image}" alt=""></figure>
    ${(a.corps || []).map((par) => `<p>${par}</p>`).join('')}
  `;

  // Articles liés : même catégorie, hors article courant, 3 maximum
  const lies = articles
    .map((x, i) => ({ x, i }))
    .filter((o) => o.x.categorie === a.categorie && o.i !== id)
    .slice(0, 3);
  const grille = el('grille-lies');
  lies.forEach(({ x, i }) => {
    const carte = document.createElement('article');
    carte.innerHTML = `
      <a href="article.html?id=${i}"><img src="${x.image}" alt=""></a>
      <p class="categorie">${x.categorie}</p>
      <h3><a href="article.html?id=${i}">${x.titre}</a></h3>
      <p class="meta">${fmtDate(x.date)} à ${x.heure}</p>`;
    grille.appendChild(carte);
  });
})();
