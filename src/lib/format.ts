const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const nombreEntier = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Formate un montant en milliards d'euros avec espace insécable. */
export function formatMdE(valeur: number): string {
  return `${nombre.format(valeur)}\u00A0Md€`;
}

/** Formate un pourcentage (ex. 115,9 %). */
export function formatPct(valeur: number): string {
  return `${nombre.format(valeur)}\u00A0%`;
}

/** Formate un nombre entier avec séparateurs français. */
export function formatNombre(valeur: number): string {
  return nombreEntier.format(valeur);
}

/** Formate un delta signé en Md€. */
export function formatDelta(valeur: number): string {
  const signe = valeur > 0 ? "+" : "";
  return `${signe}${nombre.format(valeur)}\u00A0Md€`;
}
