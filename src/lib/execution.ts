import type { LigneExecution } from "@/types";

export interface LigneComparee {
  entiteId: string;
  nom: string;
  lfi: number;
  execute: number;
  /** Consommation : execute / lfi. > 1 = dépassement. */
  taux: number;
}

/** Parse un CSV d'exécution (Chorus/data.gouv.fr) vers des lignes d'exécution.
 * Formats acceptés (séparateur « ; » ou « , ») :
 *   mission;programme;montant        (agrégat par programme, en M€ ou Md€)
 *   mission;programme;ligne;montant
 * Le montant est converti en Md€ si l'en-tête contient « M€ » ou si la valeur > 10 000.
 */
export function parserCsvExecution(contenu: string, periode: string): LigneExecution[] {
  const lignes = contenu
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lignes.length === 0) return [];

  const separateur = lignes[0]?.includes(";") ? ";" : ",";
  const entetes = (lignes[0] ?? "").split(separateur).map((h) => h.toLowerCase().trim());
  const colonneMontant = entetes.findIndex((h) => h.includes("montant") || h.includes("€"));
  const enMilliards = entetes.some((h) => h.includes("md") || h.includes("milliard"));

  const debut = entetes.length > 1 && colonneMontant >= 0 ? 1 : 0;
  const resultat: LigneExecution[] = [];

  for (const ligne of lignes.slice(debut)) {
    const cellules = ligne.split(separateur).map((c) => c.trim());
    if (cellules.length < 2) continue;

    let montantTexte: string | undefined;
    if (colonneMontant >= 0) {
      montantTexte = cellules[colonneMontant];
    } else {
      montantTexte = cellules.find((c) => /^-?[\d\s.,]+$/.test(c));
    }
    if (!montantTexte) continue;

    const nombre = Number.parseFloat(montantTexte.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(nombre)) continue;

    const texteNom = cellules.filter((c) => c !== montantTexte).join(" — ");
    if (texteNom.length === 0) continue;

    let montant = nombre;
    if (!enMilliards && Math.abs(nombre) > 10000) {
      montant = nombre / 1000;
    }

    resultat.push({
      id: `exec-${resultat.length}`,
      nom: texteNom,
      montantExecute: montant,
      periode,
    });
  }

  return resultat;
}

/** Rapproche les lignes d'exécution des entités du référentiel par similarité de nom. */
export function rapprocher(nomsReferentiel: Array<{ id: string; nom: string; montant: number }>, executions: LigneExecution[]): LigneComparee[] {
  const comparaisons: LigneComparee[] = [];
  for (const entite of nomsReferentiel) {
    const correspondance = executions.find((e) =>
      e.nom.toLowerCase().includes(entite.nom.toLowerCase()) ||
      entite.nom.toLowerCase().includes(e.nom.toLowerCase()),
    );
    if (correspondance && entite.montant !== 0) {
      comparaisons.push({
        entiteId: entite.id,
        nom: entite.nom,
        lfi: entite.montant,
        execute: correspondance.montantExecute,
        taux: correspondance.montantExecute / entite.montant,
      });
    }
  }
  return comparaisons.sort((a, b) => b.taux - a.taux);
}
