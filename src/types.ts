export type Sens = "recette" | "depense";
export type Branche = "Etat" | "SecuriteSociale" | "Collectivites";

/** Titres budgétaires de l'État : structure réelle de la dépense. */
export type TitreBudgetaire =
  | "titre-1" // Dette et engagements financiers
  | "titre-2" // Personnel (masse salariale)
  | "titre-3" // Fonctionnement
  | "titre-6" // Subventions aux opérateurs
  | "titre-7" // Investissements et engagements
  | "hors-titres"; // Recettes, Sécu, collectivités

export interface LigneBudjetaire {
  id: string;
  nom: string;
  /** Montant en milliards d'euros (Md€ affichés). */
  montant: number;
  /** Titre budgétaire : dette, personnel, fonctionnement, subventions, investissement. */
  titre?: TitreBudgetaire;
}

export interface Programme {
  id: string;
  nom: string;
  lignes: LigneBudjetaire[];
}

export interface Mission {
  id: string;
  nom: string;
  description: string;
  /** Dette, pensions : non ajustable rapidement. */
  rigide?: boolean;
  programmes: Programme[];
}

export type CategorieRecette = "fiscale" | "non_fiscale" | "transfert";

export interface Recette {
  id: string;
  nom: string;
  categorie: CategorieRecette;
  /** Circuit : qui perçoit, où va l'argent. */
  detail: string;
  montant: number;
}

export interface Scenario {
  id: string;
  nom: string;
  dateCreation: string;
  /** Clé = id de n'importe quelle entité modifiée. */
  overrides: Record<string, number>;
  notes: Record<string, string>;
}

export interface PosteBranche {
  id: string;
  nom: string;
  /** Circuit / commentaire pédagogique. */
  detail?: string;
  montant: number;
}

export interface BrancheData {
  recettes: PosteBranche[];
  depenses: PosteBranche[];
}

/** Aide ou subvention : flux de transfert vers un bénéficiaire final. */
export interface AideSubvention {
  id: string;
  nom: string;
  /** Bénéficiaire : ménages, entreprises, collectivités, associations… */
  beneficiaire: "menages" | "entreprises" | "collectivites" | "associations" | "operateurs" | "autres";
  /** Mission ou branche porteuse du financement. */
  financeur: string;
  /** Md€ par an — les aides sociales sont versées par la Sécu ou l'État selon le cas. */
  montant: number;
  detail: string;
}

/** Volet pédagogique : le fonctionnement d'un opérateur, étape par étape. */
export interface CircuitOperateur {
  etapes: string[];
  fonds: string[];
  role: string;
}

export interface OperateurPublic {
  id: string;
  nom: string;
  role: string;
  /** Ordre de grandeur géré (bilan ou encours, pas une dépense annuelle). */
  enjeu: string;
  montantIndicatif: number;
  avertissement: string;
  /** Circuit détaillé : d'où vient l'argent, par où il passe, qui le reçoit. */
  circuit?: CircuitOperateur;
}

export interface IndicateursMacro {
  pib: number;
  dettePct: number;
  deficitPct: number;
  detteReference2025Pct: number;
}

/** Un point de l'historique d'un agrégat (millésime, valeur). */
export interface PointHistorique {
  annee: number;
  valeur: number;
}

export interface SerieHistorique {
  id: string;
  nom: string;
  /** Données réelles jusqu'au dernier millésime, prévision ensuite. */
  points: PointHistorique[];
}

export interface Referentiel {
  millésime: string;
  source: string;
  /** Séries pluriannuelles (LFI passées + prévisions) pour les trajectoires. */
  historique: SerieHistorique[];
  missions: Mission[];
  recettes: Recette[];
  securiteSociale: BrancheData;
  collectivites: BrancheData;
  operateurs: OperateurPublic[];
  /** Aides et subventions vers les bénéficiaires finaux (ordres de grandeur Md€/an). */
  aides: AideSubvention[];
  macro: IndicateursMacro;
}

export type EntiteId =
  | Recette["id"]
  | Mission["id"]
  | Programme["id"]
  | LigneBudjetaire["id"]
  | PosteBranche["id"];
