export interface ParametresTrajectoire {
  /** Croissance nominale du PIB, en % annuel. */
  croissanceNominalePct: number;
  /** Taux d'intérêt moyen de la dette, en % annuel. */
  tauxInteretPct: number;
  /** Horizon de projection, en années (1 à 15). */
  horizon: number;
}

export interface PointTrajectoire {
  annee: number;
  dettePctPib: number;
  solde: number;
  pib: number;
  detteMd: number;
}

export interface ResultatTrajectoire {
  points: PointTrajectoire[];
  diagnostic: "soutenable" | "boule_de_neige" | "stagnation";
  message: string;
}

export function simulerTrajectoire(
  detteInitialePct: number,
  pibInitial: number,
  soldeScenario: number,
  params: ParametresTrajectoire,
): ResultatTrajectoire {
  const g = params.croissanceNominalePct / 100;
  const points: PointTrajectoire[] = [];
  let dettePct = detteInitialePct;
  let pib = pibInitial;
  const anneeDebut = 2026;
  for (let i = 1; i <= Math.max(1, Math.min(15, Math.round(params.horizon))); i += 1) {
    pib = pib * (1 + g);
    const deficit = -soldeScenario;
    const detteMd = (dettePct / 100) * pib + deficit;
    dettePct = (detteMd / pib) * 100;
    points.push({ annee: anneeDebut + i, dettePctPib: dettePct, solde: soldeScenario, pib, detteMd });
  }
  const croissanceVive = params.croissanceNominalePct > params.tauxInteretPct;
  let diagnostic: ResultatTrajectoire["diagnostic"];
  let message: string;
  if (soldeScenario >= 0 && croissanceVive) {
    diagnostic = "soutenable";
    message =
      "Solde positif ou nul et croissance nominale supérieure au taux d'intérêt moyen : la dette recule mécaniquement en % du PIB.";
  } else if (!croissanceVive) {
    diagnostic = "boule_de_neige";
    message =
      "Croissance nominale inférieure au taux d'intérêt moyen : effet boule de neige, la charge d'intérêts croît plus vite que le PIB.";
  } else {
    diagnostic = "stagnation";
    message =
      "Le solde reste déficitaire : la dette progresse chaque année de l'équivalent du déficit du scénario.";
  }
  return { points, diagnostic, message };
}
