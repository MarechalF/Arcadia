import type { LigneGrandeLivre } from "./agregats";

/** Échappe une valeur CSV simple (guillemets doubles). */
function echapper(valeur: string | number): string {
  const texte = String(valeur);
  if (/[";\n]/.test(texte)) {
    return `"${texte.replaceAll('"', '""')}"`;
  }
  return texte;
}

/** Exporte le grand livre filtré en CSV (séparateur « ; », encodage texte brut). */
export function exporterCsv(lignes: LigneGrandeLivre[], nomFichier: string): void {
  const entetes = ["id", "branche", "sens", "categorie", "nom", "circuit", "montant (Md€)", "référentiel (Md€)", "écart (Md€)"];
  const corps = lignes.map((l) =>
    [
      l.id,
      l.branche,
      l.sens,
      l.categorie,
      l.nom,
      l.circuit,
      l.montant,
      l.montantReferentiel,
      l.montant - l.montantReferentiel,
    ]
      .map(echapper)
      .join(";"),
  );
  const csv = [entetes.join(";"), ...corps].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  lien.click();
  URL.revokeObjectURL(url);
}
