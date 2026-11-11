// ============================================================================
// js/commun.js — UTILITAIRES COMMUNS (chargement JSON, dates, bandeau, thème)
// Exposé sous window.Commun pour être réutilisé par tous les modules.
// ============================================================================

window.Commun = {

  // el : raccourci pour document.getElementById
  el(id) {
    return document.getElementById(id);
  },

  // loadJSON : charge un fichier JSON et le parse en objet JavaScript.
  // fetch(url) envoie la requête ; si le statut HTTP n'est pas OK (404...),
  // on lève une erreur explicite ; reponse.json() transforme le texte en objet.
  async loadJSON(url) {
    const reponse = await fetch(url);
    if (!reponse.ok) throw new Error(url + ' -> HTTP ' + reponse.status);
    return await reponse.json();
  },

  // fmtDate : formate une date ISO ("2026-11-02") en date française
  // ("2 novembre 2026"). Le "T00:00:00" force l'heure locale (évite le décalage de jour).
  fmtDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
};

// --- Bandeau « Édition du [date du jour] » + thème sombre/clair --------------
// Le thème par défaut vient de la préférence système (prefers-color-scheme) ;
// le bouton permet de basculer, et le choix est mémorisé dans localStorage.
// Le thème s'applique en posant data-theme="sombre|clair" sur <html> :
// les variables CSS de :root et de html[data-theme="sombre"] font le reste.
function appliquerTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const bouton = document.getElementById('theme-toggle');
  if (bouton) bouton.textContent = theme === 'sombre' ? 'Mode clair' : 'Mode sombre';
  try { localStorage.setItem('theme', theme); } catch (e) { /* navigation privée : on ignore */ }
}

document.addEventListener('DOMContentLoaded', () => {
  // Bandeau : date du jour, comme le cartouche d'un quotidien
  const bandeau = document.getElementById('bandeau-edition');
  if (bandeau) {
    bandeau.textContent = 'Édition du ' + new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // Thème : choix mémorisé > préférence système > clair
  let enregistre = null;
  try { enregistre = localStorage.getItem('theme'); } catch (e) { /* idem */ }
  const prefereSombre = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  appliquerTheme(enregistre || (prefereSombre ? 'sombre' : 'clair'));

  const bouton = document.getElementById('theme-toggle');
  if (bouton) {
    bouton.addEventListener('click', () => {
      const actuel = document.documentElement.dataset.theme === 'sombre' ? 'clair' : 'sombre';
      appliquerTheme(actuel);
    });
  }
});
