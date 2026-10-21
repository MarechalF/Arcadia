import { describe, expect, it } from "vitest";
import { referentiel } from "@/data/referentiel";
import { scenarioLfi } from "@/store/scenarios";
import {
  aplatirGrandLivre,
  calculerAgregats,
  sommeLignes,
  sommePostes,
  sommeProgrammes,
  valeur,
} from "@/lib/agregats";
import { simulerTrajectoire } from "@/lib/trajectoire";
import { ventilerParTitre } from "@/lib/agregats";
import type { Scenario } from "@/types";

function scenarioAvec(overrides: Record<string, number>): Scenario {
  return { ...scenarioLfi, id: "test", overrides };
}

describe("Invariants arithmétiques du référentiel", () => {
  it("somme des lignes = total du programme", () => {
    for (const mission of referentiel.missions) {
      for (const programme of mission.programmes) {
        const sommeLignesBrute = programme.lignes.reduce((a, l) => a + l.montant, 0);
        expect(sommeLignes(programme, scenarioLfi)).toBe(sommeLignesBrute);
      }
    }
  });

  it("somme des programmes = total mission cohérent (chaque mission a des montants positifs)", () => {
    for (const mission of referentiel.missions) {
      const total = sommeProgrammes(mission, scenarioLfi);
      expect(total).toBeGreaterThan(0);
      for (const programme of mission.programmes) {
        expect(sommeLignes(programme, scenarioLfi)).toBeGreaterThan(0);
      }
    }
  });

  it("le total des missions de l'État est strictement positif", () => {
    const agregats = calculerAgregats(referentiel, scenarioLfi);
    expect(agregats.etat.depenses).toBeGreaterThan(300);
    expect(agregats.etat.recettes).toBeGreaterThan(400);
  });

  it("la Sécu et les collectivités ont des recettes et dépenses positives", () => {
    expect(sommePostes(referentiel.securiteSociale, "recette", scenarioLfi)).toBeGreaterThan(0);
    expect(sommePostes(referentiel.securiteSociale, "depense", scenarioLfi)).toBeGreaterThan(0);
    expect(sommePostes(referentiel.collectivites, "recette", scenarioLfi)).toBeGreaterThan(0);
    expect(sommePostes(referentiel.collectivites, "depense", scenarioLfi)).toBeGreaterThan(0);
  });

  it("les overrides ne touchent jamais le référentiel (valeur = override ?? référentiel)", () => {
    const scenario = scenarioAvec({ "rec-tva": 400 });
    const recetteTva = referentiel.recettes.find((r) => r.id === "rec-tva");
    if (!recetteTva) throw new Error("rec-tva manquante");
    expect(valeur(recetteTva, scenario)).toBe(400);
    expect(valeur(recetteTva, scenarioLfi)).toBe(285);
    expect(recetteTva.montant).toBe(285);
  });

  it("le grand livre aplati couvre toutes les entités et l'override s'y propage", () => {
    const scenario = scenarioAvec({ "l-ens-lycee-ped": 17 });
    const livre = aplatirGrandLivre(referentiel, scenario);
    const attendu =
      referentiel.recettes.length +
      referentiel.missions.reduce((a, m) => a + m.programmes.reduce((b, p) => b + p.lignes.length, 0), 0) +
      referentiel.securiteSociale.recettes.length +
      referentiel.securiteSociale.depenses.length +
      referentiel.collectivites.recettes.length +
      referentiel.collectivites.depenses.length;
    expect(livre.length).toBe(attendu);
    expect(livre.length).toBeGreaterThanOrEqual(100);
    const ligne = livre.find((l) => l.id === "l-ens-lycee-ped");
    expect(ligne?.montant).toBe(17);
    expect(ligne?.montantReferentiel).toBe(12);
  });

  it("deux entités ne partagent jamais le même id dans le grand livre", () => {
    const livre = aplatirGrandLivre(referentiel, scenarioLfi);
    const ids = new Set(livre.map((l) => l.id));
    expect(ids.size).toBe(livre.length);
  });
});

describe("Agrégats dérivés", () => {
  it("recalcul un solde modifié par un override", () => {
    const base = calculerAgregats(referentiel, scenarioLfi);
    const modifie = calculerAgregats(referentiel, scenarioAvec({ "rec-tva": 385 }));
    expect(modifie.totalRecettes - base.totalRecettes).toBe(100);
    expect(modifie.soldePublic - base.soldePublic).toBe(100);
  });
});

describe("Trajectoire de dette", () => {
  it("dette augmente avec un déficit et une croissance nulle", () => {
    const resultat = simulerTrajectoire(100, 2990, -100, {
      croissanceNominalePct: 0,
      tauxInteretPct: 0,
      horizon: 3,
    });
    expect(resultat.points.length).toBe(3);
    expect(resultat.points[0]?.dettePctPib).toBeGreaterThan(100);
    expect(resultat.diagnostic).toBe("boule_de_neige");
  });

  it("dette soutenable si solde positif et croissance > taux", () => {
    const resultat = simulerTrajectoire(115.9, 2990, 10, {
      croissanceNominalePct: 4,
      tauxInteretPct: 2,
      horizon: 5,
    });
    expect(resultat.diagnostic).toBe("soutenable");
    const dernier = resultat.points[resultat.points.length - 1];
    expect(dernier?.dettePctPib).toBeLessThan(115.9);
  });

  it("l'horizon est borné entre 1 et 15", () => {
    const r1 = simulerTrajectoire(100, 2990, 0, { croissanceNominalePct: 2, tauxInteretPct: 2, horizon: 0.5 });
    const r2 = simulerTrajectoire(100, 2990, 0, { croissanceNominalePct: 2, tauxInteretPct: 2, horizon: 30 });
    expect(r1.points.length).toBe(1);
    expect(r2.points.length).toBe(15);
  });
});

const TOTAUX_MISSIONS_LFI: Record<string, number> = {
  "mission-enseignement": 66,
  "mission-pensions": 78,
  "mission-defense": 58,
  "mission-dette": 60,
  "mission-travail-emploi": 35,
  "mission-recherche": 34,
  "mission-securites": 24,
  "mission-solidarite": 22,
  "mission-ecologie-mobilites": 17,
  "mission-justice": 12,
  "mission-immigration": 7,
  "mission-autres-comptes-speciaux": 30,
  "mission-autres-missions": 70,
};

describe("Conformité au référentiel LFI 2026", () => {
  it("chaque mission totalise exactement son montant LFI", () => {
    for (const mission of referentiel.missions) {
      const attendu = TOTAUX_MISSIONS_LFI[mission.id];
      if (attendu === undefined) throw new Error(`Mission inconnue: ${mission.id}`);
      expect(sommeProgrammes(mission, scenarioLfi)).toBe(attendu);
    }
  });

  it("les recettes de l'État totalisent les montants LFI", () => {
    const total = referentiel.recettes.reduce((a, r) => a + r.montant, 0);
    expect(total).toBe(505);
    const fiscales = referentiel.recettes.filter((r) => r.categorie === "fiscale");
    expect(fiscales.reduce((a, r) => a + r.montant, 0)).toBe(560);
  });

  it("toutes les lignes budgétaires portent un titre valide", () => {
    const titresValides = ["titre-1", "titre-2", "titre-3", "titre-6", "titre-7"];
    for (const mission of referentiel.missions) {
      for (const programme of mission.programmes) {
        for (const ligne of programme.lignes) {
          if (ligne.titre !== undefined && !titresValides.includes(ligne.titre)) {
            throw new Error(`Titre invalide sur ${ligne.id}: ${ligne.titre}`);
          }
        }
      }
    }
  });

  it("la ventilation par titres recouvre le total des missions", () => {
    const parTitre = ventilerParTitre(referentiel, scenarioLfi);
    const totalVentile = parTitre.reduce((a, t) => a + t.total, 0);
    const totalMissions = referentiel.missions.reduce((a, m) => a + sommeProgrammes(m, scenarioLfi), 0);
    expect(totalVentile).toBe(totalMissions);
  });

  it("l'historique contient des séries complètes et monotones en année", () => {
    expect(referentiel.historique.length).toBeGreaterThanOrEqual(4);
    for (const serie of referentiel.historique) {
      expect(serie.points.length).toBeGreaterThanOrEqual(10);
      for (let i = 1; i < serie.points.length; i += 1) {
        expect(serie.points[i]?.annee).toBeGreaterThan(serie.points[i - 1]?.annee ?? 0);
      }
    }
  });
});

describe("Atelier de réformes", () => {
  it("chaque mesure a un impact, des contre-arguments et un chiffrage sourcé", () => {
    expect(referentiel.mesures.length).toBeGreaterThanOrEqual(10);
    for (const mesure of referentiel.mesures) {
      expect(typeof mesure.impactSolde).toBe("number");
      expect(mesure.detail.length).toBeGreaterThan(20);
      expect(mesure.contreArguments.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("les dépenses fiscales sont positives et documentées", () => {
    expect(referentiel.depensesFiscales.length).toBeGreaterThanOrEqual(10);
    for (const df of referentiel.depensesFiscales) {
      expect(df.montant).toBeGreaterThan(0);
      expect(df.beneficiaire.length).toBeGreaterThan(3);
    }
  });

  it("les ids des mesures et dépenses fiscales sont uniques", () => {
    const idsMesures = new Set(referentiel.mesures.map((m) => m.id));
    expect(idsMesures.size).toBe(referentiel.mesures.length);
    const idsDf = new Set(referentiel.depensesFiscales.map((d) => d.id));
    expect(idsDf.size).toBe(referentiel.depensesFiscales.length);
  });

  it("les overrides de mesures ciblent des entités existantes du référentiel", () => {
    const livre = aplatirGrandLivre(referentiel, scenarioLfi);
    const idsConnus = new Set(livre.map((l) => l.id));
    for (const mesure of referentiel.mesures) {
      for (const cle of Object.keys(mesure.overrides)) {
        expect(idsConnus.has(cle)).toBe(true);
      }
    }
  });
});
