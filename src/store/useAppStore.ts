import { create } from "zustand";
import { persist } from "zustand/middleware";
import { referentiel } from "@/data/referentiel";
import { SCENARIO_LFI_ID, reduireScenarios, scenarioLfi, type ActionScenario, type EtatScenarios } from "./scenarios";
import type { Scenario } from "@/types";

const CLE_STOCKAGE = "flux-publics-scenarios-v1";

interface AppStore {
  scenarios: Scenario[];
  scenarioActifId: string;
  dispatcher: (action: ActionScenario) => void;
  scenarioActif: () => Scenario;
  reimporter: (scenarios: Scenario[], actifId: string) => void;
}

const etatInitial: EtatScenarios = { scenarios: [scenarioLfi], scenarioActifId: SCENARIO_LFI_ID };

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...etatInitial,
      dispatcher: (action) => set((etat) => reduireScenarios({ scenarios: etat.scenarios, scenarioActifId: etat.scenarioActifId }, action)),
      scenarioActif: () => {
        const etat = get();
        return etat.scenarios.find((s) => s.id === etat.scenarioActifId) ?? scenarioLfi;
      },
      reimporter: (scenarios, actifId) =>
        set({ scenarios, scenarioActifId: actifId ?? SCENARIO_LFI_ID }),
    }),
    {
      name: CLE_STOCKAGE,
      partialize: (etat) => ({ scenarios: etat.scenarios, scenarioActifId: etat.scenarioActifId }),
    },
  ),
);

export { SCENARIO_LFI_ID, scenarioLfi };
export { referentiel };
