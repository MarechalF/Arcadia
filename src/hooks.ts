import { useMemo } from "react";
import { referentiel } from "@/data/referentiel";
import { useAppStore } from "@/store/useAppStore";
import { aplatirGrandLivre, calculerAgregats, sommeLignes, sommeProgrammes, type LigneGrandeLivre } from "@/lib/agregats";
import { simulerTrajectoire, type ParametresTrajectoire, type ResultatTrajectoire } from "@/lib/trajectoire";
import type { Mission, Scenario } from "@/types";

/** Scénario actif courant. */
export function useScenarioActif(): Scenario {
  const scenarios = useAppStore((s) => s.scenarios);
  const id = useAppStore((s) => s.scenarioActifId);
  return useMemo(
    () => scenarios.find((s) => s.id === id) ?? scenarios[0] ?? { id: "lfi-2026", nom: "LFI 2026", dateCreation: "", overrides: {}, notes: {} },
    [scenarios, id],
  );
}

/** Agrégats dérivés du scénario actif (mémoïsés). */
export function useAgregats() {
  const scenario = useScenarioActif();
  return useMemo(() => calculerAgregats(referentiel, scenario), [scenario]);
}

/** Grand livre aplati (calculé une fois par scénario). */
export function useGrandLivre(): LigneGrandeLivre[] {
  const scenario = useScenarioActif();
  return useMemo(() => aplatirGrandLivre(referentiel, scenario), [scenario]);
}

/** Total d'une mission sous scénario. */
export function useTotalMission(mission: Mission): number {
  const scenario = useScenarioActif();
  return useMemo(() => sommeProgrammes(mission, scenario), [mission, scenario]);
}

/** Total d'un programme sous scénario. */
export function useTotalProgramme(missionId: string, programmeId: string): number {
  const scenario = useScenarioActif();
  return useMemo(() => {
    const mission = referentiel.missions.find((m) => m.id === missionId);
    const programme = mission?.programmes.find((p) => p.id === programmeId);
    return programme ? sommeLignes(programme, scenario) : 0;
  }, [missionId, programmeId, scenario]);
}

/** Trajectoire de dette pilotée par le solde du scénario actif. */
export function useTrajectoire(params: ParametresTrajectoire): ResultatTrajectoire {
  const agregats = useAgregats();
  return useMemo(
    () =>
      simulerTrajectoire(
        referentiel.macro.dettePct,
        referentiel.macro.pib,
        agregats.soldePublic,
        params,
      ),
    [agregats.soldePublic, params],
  );
}
