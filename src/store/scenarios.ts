import type { Scenario } from "@/types";

export const SCENARIO_LFI_ID = "lfi-2026";

export const scenarioLfi: Scenario = {
  id: SCENARIO_LFI_ID,
  nom: "LFI 2026",
  dateCreation: new Date().toISOString(),
  overrides: {},
  notes: {},
};

export type ActionScenario =
  | { type: "creer"; nom: string; base: string }
  | { type: "renommer"; id: string; nom: string }
  | { type: "supprimer"; id: string }
  | { type: "activer"; id: string }
  | { type: "setMontant"; cle: string; montant: number }
  | { type: "setNote"; cle: string; note: string }
  | { type: "basculerMesure"; mesureId: string }
  | { type: "viderOverrides"; id: string }
  | { type: "reinitialiser" };

export interface EtatScenarios {
  scenarios: Scenario[];
  scenarioActifId: string;
}

export function reduireScenarios(etat: EtatScenarios, action: ActionScenario): EtatScenarios {
  switch (action.type) {
    case "creer": {
      const base = etat.scenarios.find((s) => s.id === action.base) ?? scenarioLfi;
      const nouveau: Scenario = {
        id: `scenario-${Date.now().toString(36)}`,
        nom: action.nom,
        dateCreation: new Date().toISOString(),
        overrides: { ...base.overrides },
        notes: { ...base.notes },
        mesures: [...(base.mesures ?? [])],
      };
      return { scenarios: [...etat.scenarios, nouveau], scenarioActifId: nouveau.id };
    }
    case "renommer":
      return {
        ...etat,
        scenarios: etat.scenarios.map((s) => (s.id === action.id ? { ...s, nom: action.nom } : s)),
      };
    case "supprimer": {
      if (action.id === SCENARIO_LFI_ID) return etat;
      const scenarios = etat.scenarios.filter((s) => s.id !== action.id);
      const actifExiste = scenarios.some((s) => s.id === etat.scenarioActifId);
      return { scenarios, scenarioActifId: actifExiste ? etat.scenarioActifId : SCENARIO_LFI_ID };
    }
    case "activer":
      return etat.scenarios.some((s) => s.id === action.id)
        ? { ...etat, scenarioActifId: action.id }
        : etat;
    case "setMontant":
      return {
        ...etat,
        scenarios: etat.scenarios.map((s) =>
          s.id === etat.scenarioActifId
            ? { ...s, overrides: { ...s.overrides, [action.cle]: action.montant } }
            : s,
        ),
      };
    case "setNote":
      return {
        ...etat,
        scenarios: etat.scenarios.map((s) =>
          s.id === etat.scenarioActifId
            ? { ...s, notes: { ...s.notes, [action.cle]: action.note } }
            : s,
        ),
      };
    case "basculerMesure": {
      const avecMesures = (s: Scenario) => s.mesures ?? [];
      return {
        ...etat,
        scenarios: etat.scenarios.map((s) => {
          if (s.id !== etat.scenarioActifId) return s;
          const actuelles = avecMesures(s);
          const nouvelles = actuelles.includes(action.mesureId)
            ? actuelles.filter((m) => m !== action.mesureId)
            : [...actuelles, action.mesureId];
          return { ...s, mesures: nouvelles };
        }),
      };
    }
    case "viderOverrides":
      return {
        ...etat,
        scenarios: etat.scenarios.map((s) =>
          s.id === action.id ? { ...s, overrides: {}, notes: {}, mesures: [] } : s
        ),
      };
    case "reinitialiser":
      return { scenarios: [scenarioLfi], scenarioActifId: SCENARIO_LFI_ID };
    default: {
      const inconnu: never = action;
      return inconnu;
    }
  }
}
