import { describe, expect, it } from "vitest";
import { parserCsvExecution, rapprocher } from "@/lib/execution";
import { reduireScenarios, scenarioLfi, type EtatScenarios } from "@/store/scenarios";

function etatAvec(mesures: string[]): EtatScenarios {
  return {
    scenarios: [{ ...scenarioLfi, mesures }],
    scenarioActifId: scenarioLfi.id,
  };
}

describe("Mesures de réforme dans le scénario (réducteur)", () => {
  it("basculerMesure ajoute puis retire une mesure du scénario actif", () => {
    let etat = etatAvec([]);
    etat = reduireScenarios(etat, { type: "basculerMesure", mesureId: "mes-ir-45" });
    expect(etat.scenarios[0]?.mesures).toEqual(["mes-ir-45"]);
    etat = reduireScenarios(etat, { type: "basculerMesure", mesureId: "mes-ondam-objectif" });
    expect(etat.scenarios[0]?.mesures).toEqual(["mes-ir-45", "mes-ondam-objectif"]);
    etat = reduireScenarios(etat, { type: "basculerMesure", mesureId: "mes-ir-45" });
    expect(etat.scenarios[0]?.mesures).toEqual(["mes-ondam-objectif"]);
  });

  it("viderOverrides efface aussi les mesures", () => {
    let etat = etatAvec(["mes-ir-45"]);
    etat = reduireScenarios(etat, { type: "viderOverrides", id: scenarioLfi.id });
    expect(etat.scenarios[0]?.mesures).toEqual([]);
  });

  it("creer duplique les mesures du scénario de base", () => {
    const etat = etatAvec(["mes-ir-45"]);
    const nouveau = reduireScenarios(etat, { type: "creer", nom: "Copie", base: scenarioLfi.id });
    const cree = nouveau.scenarios.find((s) => s.nom === "Copie");
    expect(cree?.mesures).toEqual(["mes-ir-45"]);
  });
});

describe("Parsing CSV d'exécution", () => {
  it("parse un CSV avec en-tête et séparateur « ; » (montants en M€ convertis)", () => {
    const csv = "mission;programme;montant (M€)\nEnseignement scolaire;Second degré;33000\nDéfense;Equipement;16000";
    const lignes = parserCsvExecution(csv, "2025");
    expect(lignes.length).toBe(2);
    expect(lignes[0]?.nom).toContain("Second degré");
    expect(lignes[0]?.montantExecute).toBe(33);
    expect(lignes[1]?.montantExecute).toBe(16);
  });

  it("parse un CSV sans en-tête, séparateur « , », montants en Md€", () => {
    const csv = "Santé,274\nRetraites,292";
    const lignes = parserCsvExecution(csv, "2025");
    expect(lignes.length).toBe(2);
    expect(lignes[0]?.montantExecute).toBe(274);
  });

  it("ignore les lignes invalides", () => {
    const csv = "mission;montant\n;;; \nSanté;274\nLigne sans montant";
    const lignes = parserCsvExecution(csv, "2025");
    expect(lignes.length).toBe(1);
  });

  it("rapproche les exécutions des entités par similarité de nom", () => {
    const executions = parserCsvExecution("programme;montant (Md€)\nPolice nationale;12\nInexistant;999", "2025");
    const rapprochements = rapprocher(
      [
        { id: "prog-police", nom: "Police nationale", montant: 13 },
        { id: "prog-gendarmerie", nom: "Gendarmerie nationale", montant: 8 },
      ],
      executions,
    );
    expect(rapprochements.length).toBe(1);
    expect(rapprochements[0]?.entiteId).toBe("prog-police");
    expect(rapprochements[0]?.taux).toBeCloseTo(12 / 13);
  });
});
