'use strict';
/* Rechargement automatique en mode développement (SSE). Inerte en production statique. */
if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') {
  try {
    const es = new EventSource('/__livereload');
    es.onmessage = (e) => { if (e.data === 'reload') location.reload(); };
  } catch (e) { /* mode statique : rien à faire */ }
}
