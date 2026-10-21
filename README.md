# Flux Publics

Tableau de bord d'exploration, d'audit et de simulation des finances publiques françaises (État, Sécurité sociale, collectivités territoriales) à partir des ordres de grandeur de la LFI 2026 et de la LFSS 2026. Disponible comme application web et comme **application de bureau** (Electron : Windows, macOS, Linux).

> ⚠️ Les données intégrées sont des **ordres de grandeur indicatifs**. Le périmètre « temps réel » n'existe pas : l'exécution budgétaire est publiée mensuellement (Chorus, data.gouv.fr). Le millésime est affiché dans le bandeau de chaque page.

## Installation et mise à jour — la façon la plus simple (Windows)

Le projet contient deux fichiers à **double-cliquer** :

- **`installer-mettre-a-jour.bat`** : télécharge la dernière version du code, construit l'installateur Windows et ouvre le dossier `release/`. Double-clique ensuite sur `Flux Publics Setup X.X.X.exe` pour installer l'application comme un logiciel normal (raccourci bureau + menu Démarrer).
- **`lancer-flux-publics.bat`** : lance l'application si elle est déjà construite (sinon bascule en mode développeur).

Une fois l'application **installée via l'installateur**, la mise à jour est **100 % automatique** (intégrée via `electron-updater`) :
- au démarrage, l'application vérifie les nouvelles versions sur GitHub Releases ;
- si une mise à jour existe, elle se télécharge toute seule et propose « Redémarrer maintenant » ;
- tes scénarios (localStorage) sont conservés entre les mises à jour.

Aucune ligne de commande à taper, jamais. Pour les développeurs, les commandes restent disponibles ci-dessous.

## Commandes développeur

```bash
npm i                  # dépendances
npm run dev            # application web (http://localhost:5173)
npm run electron:dev   # application de bureau en mode développement
npm test               # tests d'invariants arithmétiques (Vitest)
npm run typecheck      # TypeScript strict
npm run build          # build web de production (dist/)
npm run electron:build # build + installateur dans release/ + publication GitHub Release
```

L'installateur produit dans `release/` :
- **Windows** : installateur NSIS (`.exe`) — raccourci bureau + menu Démarrer
- **Linux** : AppImage auto-updatable
- **macOS** : `.dmg`


## Structure

```
electron/
  main.cjs             # Processus principal Electron (fenêtre, file://, sandbox)
  preload.cjs          # Pont contextBridge minimal
src/
  data/referentiel.ts  # Référentiel immuable LFI/LFSS 2026 + historique 2015-2026 + titres budgétaires
  types.ts             # Sens, Branche, TitreBudgetaire, Mission, Recette, Scenario, SerieHistorique…
  store/
    scenarios.ts       # Réducteur pur + union discriminée des actions
    useAppStore.ts     # Store Zustand unique, persisté localStorage
  lib/                 # Calculs purs
    agregats.ts        # valeur(), sommeLignes/Programmes, agrégats, ventilation par titres, Sankey
    trajectoire.ts     # Projection de dette
    format.ts          # Intl.NumberFormat("fr-FR")
    csv.ts             # Export CSV du grand livre
    agregats.test.ts   # 16 tests : invariants, totaux LFI exacts, titres, historique
  hooks.ts             # useAgregats, useTrajectoire, useGrandLivre (mémoïsés)
  components/          # Layout, BarreScenarios, MontantInput, primitives UI
  pages/               # 13 pages (voir navigation)
```

## Pages

1. **Vue d'ensemble** — KPI (recettes, dépenses, solde, dette/habitant), camembert des 3 branches, top 10 des missions.
2. **Recettes de l'État** — édition ligne par ligne, circuits DGFiP, repère « fiscal ≈ 88 % des recettes nettes ».
3. **Dépenses & missions** — 13 missions, badge « rigide », Δ vs LFI, drill-down mission → programmes → lignes, notes.
4. **Sécurité sociale** / 5. **Collectivités** — recettes/dépenses éditables, soldes par branche, mise en garde LFSS.
6. **Opérateurs** — CDC, AFT, Bpifrance, ADEME… avec avertissement stocks ≠ dépenses annuelles.
7. **Grand livre** — ~120 écritures aplaties : recherche plein texte, filtres, groupement, tri, édition, écart vs référentiel, notes, export CSV.
8. **Comparateur** — LFI vs scénario : barres côte à côte, écarts par mission, tableau de deltas.
9. **Projection de dette** — trajectoire % PIB pilotée par le solde, diagnostics « soutenable / boule de neige ».
10. **Flux (Sankey)** — diagramme de flux recettes → branches → dépenses avec seuil de lisibilité réglable.
11. **Titres budgétaires** — ventilation titre 1 (dette) / 2 (personnel) / 3 (fonctionnement) / 6 (subventions) / 7 (investissement), indicateur de rigidité (% titres 1+2).
12. **Historique 2015-2026** — séries pluriannuelles (dépenses, recettes, dette % PIB, déficit % PIB), repère « fin des données réelles », recettes vs dépenses composées.
13. **Aides & subventions** — 19 dispositifs documentés (RSA, APL, CIR, allocation chômage, dotations…), filtres par bénéficiaire, recherche, camembert par bénéficiaire, et volet pédagogique détaillé sur la CDC : circuit de l'argent étape par étape et fonds gérés (livret A, fonds d'épargne, ERFP, consignations).

## Architecture des scénarios

Le référentiel est **immuable**. Toute modification vit dans un `Scenario` (overrides `Record<string, number>`) ; `valeur(id) = override ?? référentiel` ; les agrégats sont des fonctions pures dérivées du scénario actif, jamais dupliquées dans l'état. Le scénario « LFI 2026 » est verrouillé. Persistance localStorage (`flux-publics-scenarios-v1`), export JSON.

## Remplacer le référentiel par des données réelles

`src/data/referentiel.ts` exporte un objet `Referentiel` unique :
1. Récupérer l'exécution Chorus (data.gouv.fr, « dépenses par mission/programme ») ou les PLF (budget.gouv.fr, Sénat).
2. Agréger vers la forme `Referentiel` (montants Md€, `titre` par ligne, `historique` pour les séries).
3. Mettre à jour `millésime`/`source` — affichés dans le bandeau.

`npm test` vérifie : somme des lignes = total programme = total mission, chaque mission totalise exactement son montant LFI, ventilation par titres = total des missions, séries historiques monotones en année, unicité des ids. Un référentiel mal agrégé est détecté immédiatement.

## Choix documentés

- **Montants en Md€** partout (l'échelle des ordres de grandeur fournis).
- **Titres** : les pensions sont comptées titre 2 (transferts liés au personnel) ; affectation par ligne via des règles lisibles dans le référentiel.
- **Sankey** : flux simplifiés — toutes les recettes de l'État passent par le nœud « État » ; le transfert État → Sécu utilise le poste LFSS « Transferts de l'État » ; les flux < seuil sont masqués pour la lisibilité.
- **Historique** : données réelles jusqu'à 2024, prévisions 2025-2026 ; ordres de grandeur consolidés (les chiffres officiels sont dans chaque LFI).
- **Desktop** : `HashRouter` + chemins relatifs pour `file://` ; pas d'auto-update intégré (à ajouter via `electron-updater` si distribution).
