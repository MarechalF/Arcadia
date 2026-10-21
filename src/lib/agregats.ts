import { referentiel } from "@/data/referentiel";
import type { Branche, BrancheData, Mission, Programme, Referentiel, Scenario, Sens, TitreBudgetaire } from "@/types";

/** Somme des lignes d'un programme, appliquant les overrides du scénario. */
export function sommeLignes(programme: Programme, scenario: Scenario): number {
  return programme.lignes.reduce(
    (acc, ligne) => acc + valeur(ligne, scenario),
    0,
  );
}

/** Somme des programmes d'une mission (via sommeLignes pour garantir l'invariant). */
export function sommeProgrammes(mission: Mission, scenario: Scenario): number {
  return mission.programmes.reduce(
    (acc, programme) => acc + sommeLignes(programme, scenario),
    0,
  );
}

/** Somme des lignes d'un poste de branche (Sécu / collectivités). */
export function sommePostes(postes: BrancheData, sens: Sens, scenario: Scenario): number {
  return postes[sens === "recette" ? "recettes" : "depenses"].reduce(
    (acc, poste) => acc + valeur(poste, scenario),
    0,
  );
}

/** Résolution centrale : override ?? référentiel. */
export function valeur<T extends { id: string; montant: number }>(entite: T, scenario: Scenario): number {
  const override = scenario.overrides[entite.id];
  return override === undefined ? entite.montant : override;
}

export interface LigneGrandeLivre {
  id: string;
  nom: string;
  branche: Branche;
  sens: Sens;
  categorie: string;
  circuit: string;
  montantReferentiel: number;
  montant: number;
}

/** Aplatit tout le référentiel en écritures du grand livre (~120 lignes), une seule fois par scénario. */
export function aplatirGrandLivre(ref: Referentiel, scenario: Scenario): LigneGrandeLivre[] {
  const lignes: LigneGrandeLivre[] = [];
  for (const recette of ref.recettes) {
    lignes.push({
      id: recette.id,
      nom: recette.nom,
      branche: "Etat",
      sens: "recette",
      categorie: recette.categorie,
      circuit: recette.detail,
      montantReferentiel: recette.montant,
      montant: valeur(recette, scenario),
    });
  }
  for (const mission of ref.missions) {
    for (const programme of mission.programmes) {
      for (const ligne of programme.lignes) {
        lignes.push({
          id: ligne.id,
          nom: `${ligne.nom} (${mission.nom} / ${programme.nom})`,
          branche: "Etat",
          sens: "depense",
          categorie: `mission:${mission.id}`,
          circuit: `${mission.nom} → ${programme.nom} → ${ligne.nom}`,
          montantReferentiel: ligne.montant,
          montant: valeur(ligne, scenario),
        });
      }
    }
  }
  const branches: { data: BrancheData; branche: Branche }[] = [
    { data: ref.securiteSociale, branche: "SecuriteSociale" },
    { data: ref.collectivites, branche: "Collectivites" },
  ];
  for (const { data, branche } of branches) {
    for (const sens of ["recette", "depense"] as const) {
      for (const poste of data[sens === "recette" ? "recettes" : "depenses"]) {
        lignes.push({
          id: poste.id,
          nom: poste.nom,
          branche,
          sens,
          categorie: sens === "recette" ? "poste_securite_recette" : "poste_securite_depense",
          circuit: poste.detail ?? "",
          montantReferentiel: poste.montant,
          montant: valeur(poste, scenario),
        });
      }
    }
  }
  return lignes;
}

export interface SoldeBranche {
  recettes: number;
  depenses: number;
  solde: number;
}

export function soldeBranche(recettes: number, depenses: number): SoldeBranche {
  return { recettes, depenses, solde: recettes - depenses };
}

export interface Agregats {
  etat: SoldeBranche;
  secu: SoldeBranche;
  collectivites: SoldeBranche;
  totalRecettes: number;
  totalDepenses: number;
  soldePublic: number;
}

export function calculerAgregats(ref: Referentiel, scenario: Scenario): Agregats {
  const etatRecettes = ref.recettes.reduce((a, r) => a + valeur(r, scenario), 0);
  const etatDepenses = ref.missions.reduce((a, m) => a + sommeProgrammes(m, scenario), 0);
  const etat = soldeBranche(etatRecettes, etatDepenses);
  const secu = soldeBranche(
    sommePostes(ref.securiteSociale, "recette", scenario),
    sommePostes(ref.securiteSociale, "depense", scenario),
  );
  const collectivites = soldeBranche(
    sommePostes(ref.collectivites, "recette", scenario),
    sommePostes(ref.collectivites, "depense", scenario),
  );
  const totalRecettes = etat.recettes + secu.recettes + collectivites.recettes;
  const totalDepenses = etat.depenses + secu.depenses + collectivites.depenses;
  return {
    etat,
    secu,
    collectivites,
    totalRecettes,
    totalDepenses,
    soldePublic: totalRecettes - totalDepenses,
  };
}

export function part(total: number, totalGroupe: number): number {
  if (totalGroupe === 0) return 0;
  return (total / totalGroupe) * 100;
}

export interface VentilationTitre {
  titre: TitreBudgetaire;
  nom: string;
  total: number;
}

const NOMS_TITRES: Record<TitreBudgetaire, string> = {
  "titre-1": "Dette et engagements financiers",
  "titre-2": "Personnel (masse salariale)",
  "titre-3": "Fonctionnement",
  "titre-6": "Subventions aux opérateurs",
  "titre-7": "Investissements et engagements",
  "hors-titres": "Hors titres (recettes)",
};

/** Ventile les dépenses de l'État par titre budgétaire, sous scénario. */
export function ventilerParTitre(ref: Referentiel, scenario: Scenario): VentilationTitre[] {
  const acc = new Map<TitreBudgetaire, number>();
  for (const mission of ref.missions) {
    for (const programme of mission.programmes) {
      for (const ligne of programme.lignes) {
        const titre: TitreBudgetaire = ligne.titre ?? "titre-3";
        acc.set(titre, (acc.get(titre) ?? 0) + valeur(ligne, scenario));
      }
    }
  }
  return ([...acc.entries()] as [TitreBudgetaire, number][])
    .map(([titre, total]) => ({ titre, nom: NOMS_TITRES[titre], total }))
    .sort((a, b) => b.total - a.total);
}

/** Part de dépenses « ajustables » (fonctionnement + subventions + investissement) vs rigides (dette + personnel). */
export function indicateurRigidite(ventilation: VentilationTitre[]): { rigide: number; ajustable: number; partRigidePct: number } {
  const rigide = ventilation
    .filter((t) => t.titre === "titre-1" || t.titre === "titre-2")
    .reduce((a, t) => a + t.total, 0);
  const ajustable = ventilation
    .filter((t) => t.titre === "titre-3" || t.titre === "titre-6" || t.titre === "titre-7")
    .reduce((a, t) => a + t.total, 0);
  const total = rigide + ajustable;
  return { rigide, ajustable, partRigidePct: total === 0 ? 0 : (rigide / total) * 100 };
}

/** Nœuds et liens pour le diagramme de Sankey : recettes → branches → dépenses. */
export interface FluxSankey {
  noms: string[];
  liens: Array<{ source: number; cible: number; valeur: number }>;
}

export function construireSankey(ref: Referentiel, scenario: Scenario, seuilMdE = 10): FluxSankey {
  const agregats = calculerAgregats(ref, scenario);
  const noms: string[] = [];
  const index = (nom: string): number => {
    const i = noms.indexOf(nom);
    if (i >= 0) return i;
    noms.push(nom);
    return noms.length - 1;
  };

  for (const r of referentiel.recettes) index(r.nom);
  index("État");
  index("Sécurité sociale");
  index("Collectivités");
  for (const m of ref.missions) index(m.nom);
  for (const p of ref.securiteSociale.depenses) index(p.nom);
  for (const p of ref.collectivites.depenses) index(p.nom);

  const liens: FluxSankey["liens"] = [];
  for (const r of ref.recettes) {
    const montant = valeur(r, scenario);
    if (montant > 0) liens.push({ source: index(r.nom), cible: index("État"), valeur: montant });
  }
  const posteTransferts = ref.securiteSociale.recettes.find((p) => p.id === "ss-rec-transferts-etat");
  if (posteTransferts) {
    liens.push({ source: index("État"), cible: index("Sécurité sociale"), valeur: valeur(posteTransferts, scenario) });
  }
  void agregats;
  for (const mission of ref.missions) {
    const total = sommeProgrammes(mission, scenario);
    if (total >= seuilMdE) liens.push({ source: index("État"), cible: index(mission.nom), valeur: total });
  }
  for (const p of ref.securiteSociale.depenses) {
    const montant = valeur(p, scenario);
    if (montant >= seuilMdE) liens.push({ source: index("Sécurité sociale"), cible: index(p.nom), valeur: montant });
  }
  for (const p of ref.collectivites.depenses) {
    const montant = valeur(p, scenario);
    if (montant >= seuilMdE) liens.push({ source: index("Collectivités"), cible: index(p.nom), valeur: montant });
  }
  return { noms, liens: liens.filter((l) => l.valeur > 0) };
}
