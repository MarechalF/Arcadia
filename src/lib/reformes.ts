import { referentiel } from "@/data/referentiel";
import type { MesureReforme, Scenario } from "@/types";
import { calculerAgregats } from "./agregats";
import { simulerTrajectoire, type ResultatTrajectoire } from "./trajectoire";

export interface EvaluationReforme {
  /** Mesures sélectionnées. */
  mesures: MesureReforme[];
  /** Somme des impacts sur le solde, en Md€/an. */
  impactTotal: number;
  /** Effet agrégé sur le PIB à 5 ans, en % (indicatif). */
  effetPib5ansPct: number;
  /** Coût de transition par année pendant la durée. */
  coutTransition: { montant: number; dureeAnnees: number } | null;
  /** Agrégats recalculés avec les overrides combinés. */
  agregatsRecalcules: ReturnType<typeof calculerAgregats>;
  /** Trajectoire de dette à 10 ans pilotée par le nouveau solde. */
  trajectoire: ResultatTrajectoire;
  /** Effet de second tour : indexation des prestations après choc inflation. */
  effetSecondTour: { enonce: string; amplitude: number } | null;
}

/** Calcule l'effet PIB et les coûts de transition pour un ensemble de mesures. */
export function evaluerReforme(mesures: MesureReforme[], scenario: Scenario): EvaluationReforme {
  const impactTotal = mesures.reduce((a, m) => a + m.impactSolde, 0);
  const effetPib5ansPct = mesures.reduce((a, m) => a + (m.effetPib5ansPct ?? 0), 0);

  const coutTransition = mesures.reduce<{ montant: number; dureeAnnees: number } | null>((acc, m) => {
    if (!m.coutTransition) return acc;
    if (!acc) return { ...m.coutTransition };
    return {
      montant: acc.montant + m.coutTransition.montant,
      dureeAnnees: Math.max(acc.dureeAnnees, m.coutTransition.dureeAnnees),
    };
  }, null);

  // Agrégats recalculés : appliquer les overrides des mesures en plus de ceux du scénario.
  const overridesCombines: Record<string, number> = { ...scenario.overrides };
  for (const m of mesures) {
    for (const [cle, montant] of Object.entries(m.overrides)) {
      overridesCombines[cle] = montant;
    }
  }
  const scenarioReforme: Scenario = { ...scenario, id: `${scenario.id}-reforme`, overrides: overridesCombines };
  const agregatsRecalcules = calculerAgregats(referentiel, scenarioReforme);

  const soldeAvecReforme = agregatsRecalcules.soldePublic;
  const soldeSansReforme = calculerAgregats(referentiel, scenario).soldePublic;
  const correctionReforme = impactTotal - (soldeAvecReforme - soldeSansReforme);

  // Si les overrides ne suffisent pas à refléter l'impact (mesures "hors référentiel"),
  // on ajuste le solde explicitement pour que le pilotage de dette soit cohérent.
  const soldePilote = soldeAvecReforme + correctionReforme;
  const trajectoire = simulerTrajectoire(
    referentiel.macro.dettePct,
    referentiel.macro.pib,
    soldePilote,
    { croissanceNominalePct: 3, tauxInteretPct: 2.5, horizon: 10 },
  );

  let effetSecondTour: EvaluationReforme["effetSecondTour"] = null;
  const mesuresInflationnistes = mesures.filter((m) => m.id === "mes-taux-intermediaire");
  if (mesuresInflationnistes.length > 0) {
    const chocInflationPct = 0.3;
    const prestationsIndexees = 138 + 58 + 42;
    const amplitude = (prestationsIndexees * chocInflationPct) / 100;
    effetSecondTour = {
      enonce: `Bascule TVA → ~+${chocInflationPct} pt d'inflation la première année → indexation des prestations indexées (CSG, famille, autonomie ≈ ${prestationsIndexees} Md€) → coût de retour ≈ ${amplitude.toFixed(1)} Md€ la première année.`,
      amplitude,
    };
  }

  return { mesures, impactTotal, effetPib5ansPct, coutTransition, agregatsRecalcules, trajectoire, effetSecondTour };
}

/** Écart restant pour atteindre une cible de solde (en % du PIB). */
export function ecartObjectif(soldeActuel: number, ciblePctPib: number): { cibleMdE: number; ecartMdE: number } {
  const cibleMdE = (ciblePctPib / 100) * referentiel.macro.pib;
  return { cibleMdE, ecartMdE: cibleMdE - soldeActuel };
}

export function mesuresParCategorie(categorie: MesureReforme["categorie"]): MesureReforme[] {
  return referentiel.mesures.filter((m) => m.categorie === categorie);
}
