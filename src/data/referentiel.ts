// Source : budget.gouv.fr / Sénat, PLF 2026 et PLFSS 2026 — millésime : octobre 2025.
// Ordres de grandeur indicatifs en milliards d'euros (montants stockés en Md€).
// Le référentiel est immuable : toute modification utilisateur vit dans un scénario.
import type { Referentiel } from "../types";

export const referentiel: Referentiel = {
  millésime: "LFI/LFSS 2026 (PLF déposé octobre 2025)",
  source: "budget.gouv.fr, Sénat (PLF 2026, PLFSS 2026) — ordres de grandeur",
  missions: [
    {
      id: "mission-enseignement",
      nom: "Enseignement scolaire",
      description: "Éducation nationale : premier et second degrés, public et privé sous contrat.",
      programmes: [
        {
          id: "prog-second-degre",
          nom: "Second degré public",
          lignes: [
            { id: "l-ens-coll-ped", nom: "Collèges — pédagogie", montant: 8, titre: "titre-2" },
            { id: "l-ens-coll-fonct", nom: "Collèges — fonctionnement", montant: 6, titre: "titre-3" },
            { id: "l-ens-lycee-ped", nom: "Lycées — pédagogie", montant: 12, titre: "titre-2" },
            { id: "l-ens-lycee-fonct", nom: "Lycées — fonctionnement", montant: 7, titre: "titre-3" },
          ],
        },
        {
          id: "prog-premier-degre",
          nom: "Premier degré public",
          lignes: [
            { id: "l-ens-ecoles-ens", nom: "Écoles — enseignants", montant: 16, titre: "titre-2" },
            { id: "l-ens-ecoles-fonct", nom: "Écoles — fonctionnement", montant: 6, titre: "titre-3" },
          ],
        },
        {
          id: "prog-prive-sous-contrat",
          nom: "Enseignement privé sous contrat",
          lignes: [
            { id: "l-ens-prive-1er", nom: "Privé sous contrat — premier degré", montant: 3, titre: "titre-6" },
            { id: "l-ens-prive-2nd", nom: "Privé sous contrat — second degré", montant: 5, titre: "titre-6" }
          ],
        },
        {
          id: "prog-vie-eleve",
          nom: "Vie de l'élève",
          lignes: [
            { id: "l-ens-vie-resto", nom: "Restauration scolaire", montant: 2, titre: "titre-3" },
            { id: "l-ens-vie-sante", nom: "Santé et accompagnement à l'école", montant: 1, titre: "titre-3" }
          ],
        },
      ],
    },
    {
      id: "mission-pensions",
      nom: "Pensions (compte spécial)",
      description: "Pensions civiles et militaires de l'État, retraites ouvrières et des mines.",
      rigide: true,
      programmes: [
        {
          id: "prog-pensions-civiles",
          nom: "Pensions civiles",
          lignes: [
            { id: "l-pen-civ-fonct", nom: "Pensions des fonctionnaires civils", montant: 46, titre: "titre-2" },
            { id: "l-pen-civ-divers", nom: "Allocations veuves, orphelins et divers", montant: 7, titre: "titre-2" },
          ],
        },
        {
          id: "prog-pensions-militaires",
          nom: "Pensions militaires",
          lignes: [
            { id: "l-pen-mil-combattants", nom: "Pensions des militaires", montant: 9, titre: "titre-2" },
            { id: "l-pen-mil-invalides", nom: "Invalidités et allocations militaires", montant: 3, titre: "titre-2" },
          ],
        },
        {
          id: "prog-retraites-ouvriers-mines",
          nom: "Retraites ouvrières et des mines",
          lignes: [
            { id: "l-pen-ouvriers", nom: "Retraites ouvrières de l'État", montant: 4, titre: "titre-2" },
            { id: "l-pen-mines", nom: "Retraites des mines", montant: 4, titre: "titre-2" },
          ],
        },
        {
          id: "prog-service-retraites",
          nom: "Service des retraites de l'État",
          lignes: [
            { id: "l-pen-service-gestion", nom: "Gestion des retraites", montant: 3, titre: "titre-2" },
            { id: "l-pen-service-capitalisation", nom: "Contribution à la capitalisation", montant: 2, titre: "titre-2" },
          ],
        },
      ],
    },
    {
      id: "mission-defense",
      nom: "Défense",
      description: "Préparation et emploi des forces, équipement, soutien, prospective.",
      programmes: [
        {
          id: "prog-def-forces",
          nom: "Préparation et emploi des forces",
          lignes: [
            { id: "l-def-terre-perso", nom: "Forces terrestres — personnel", montant: 8, titre: "titre-2" },
            { id: "l-def-terre-ops", nom: "Forces terrestres — opérations", montant: 4, titre: "titre-3" },
            { id: "l-def-air-mer", nom: "Forces aériennes et maritimes", montant: 12, titre: "titre-2" },
          ],
        },
        {
          id: "prog-def-equipement",
          nom: "Equipement des forces",
          lignes: [
            { id: "l-def-equip-arm", nom: "Programmes d'armement (DGA)", montant: 10, titre: "titre-7" },
            { id: "l-def-equip-maint", nom: "Maintenance et soutien industriel", montant: 6, titre: "titre-7" },
          ],
        },
        {
          id: "prog-def-soutien",
          nom: "Soutien des forces",
          lignes: [
            { id: "l-def-soutien-perso", nom: "Soutien des personnels", montant: 6, titre: "titre-2" },
            { id: "l-def-soutien-log", nom: "Logistique et infrastructures", montant: 4, titre: "titre-3" },
          ],
        },
        {
          id: "prog-def-environnement",
          nom: "Environnement et prospective",
          lignes: [
            { id: "l-def-renseignement", nom: "Renseignement", montant: 3, titre: "titre-3" },
            { id: "l-def-cyber", nom: "Cyberdéfense et prospective", montant: 5, titre: "titre-7" },
          ],
        },
      ],
    },
    {
      id: "mission-dette",
      nom: "Engagements financiers — dette",
      description: "Charge de la dette de l'État et engagements liés à l'épargne.",
      rigide: true,
      programmes: [
        {
          id: "prog-charge-dette",
          nom: "Charge de la dette",
          lignes: [
            { id: "l-dette-charge-neg", nom: "Intérêts de la dette négociable", montant: 50, titre: "titre-1" },
            { id: "l-dette-charge-autres", nom: "Autres charges financières", montant: 5, titre: "titre-1" },
          ],
        },
        {
          id: "prog-epargne-logement",
          nom: "Epargne logement",
          lignes: [
            { id: "l-dette-epargne-a", nom: "Primes épargne logement", montant: 2, titre: "titre-1" },
            { id: "l-dette-epargne-b", nom: "Fonds de réserve épargne logement", montant: 3, titre: "titre-1" },
          ],
        },
      ],
    },
    {
      id: "mission-travail-emploi",
      nom: "Travail et emploi",
      description: "Politiques de l'emploi, insertion, formation professionnelle.",
      programmes: [
        {
          id: "prog-emploi-insertion",
          nom: "Insertion et emploi",
          lignes: [
            { id: "l-trav-insertion-dem", nom: "Insertion des demandeurs d'emploi", montant: 9, titre: "titre-6" },
            { id: "l-trav-formation", nom: "Formation professionnelle", montant: 6, titre: "titre-6" },
            { id: "l-trav-appui-entreprises", nom: "Appui aux entreprises", montant: 6, titre: "titre-6" },
            { id: "l-trav-appui-territorial", nom: "Appui aux mutations territoriales", montant: 4, titre: "titre-6" }
          ],
        },
        {
          id: "prog-travail-relations",
          nom: "Travail et relations sociales",
          lignes: [
            { id: "l-trav-inspection", nom: "Inspection du travail", montant: 4, titre: "titre-2" },
            { id: "l-trav-dialogue", nom: "Dialogue social et conseil", montant: 6, titre: "titre-3" },
          ],
        },
      ],
    },
    {
      id: "mission-recherche",
      nom: "Recherche et enseignement supérieur",
      description: "Universités, recherche publique, agences nationales.",
      programmes: [
        {
          id: "prog-enseignement-superieur",
          nom: "Enseignement supérieur",
          lignes: [
            { id: "l-res-univ-serv", nom: "Universités", montant: 12, titre: "titre-2" },
            { id: "l-res-univ-postbac", nom: "Formations post-bac hors universités", montant: 4, titre: "titre-2" },
            { id: "l-res-bourses", nom: "Bourses étudiantes", montant: 4, titre: "titre-6" },
            { id: "l-res-campus", nom: "Vie de campus", montant: 2, titre: "titre-7" },
          ],
        },
        {
          id: "prog-recherche",
          nom: "Recherche scientifique",
          lignes: [
            { id: "l-res-cnrs-public", nom: "CNRS, INSERM, INRIA", montant: 5, titre: "titre-6" },
            { id: "l-res-instituts", nom: "Instituts de recherche (CEA, IFREMER…)", montant: 3, titre: "titre-6" },
            { id: "l-res-innovation", nom: "Innovation et industrie", montant: 4, titre: "titre-6" },
          ],
        },
      ],
    },
    {
      id: "mission-securites",
      nom: "Sécurités",
      description: "Police nationale, gendarmerie, sécurité civile, sécurité routière.",
      rigide: true,
      programmes: [
        {
          id: "prog-police",
          nom: "Police nationale",
          lignes: [{ id: "l-sec-police-perso", nom: "Police nationale — personnel", montant: 9, titre: "titre-2" },
            { id: "l-sec-police-moyens", nom: "Police nationale — moyens et opérations", montant: 4, titre: "titre-3" }],
        },
        {
          id: "prog-gendarmerie",
          nom: "Gendarmerie nationale",
          lignes: [
            { id: "l-sec-gend-perso", nom: "Gendarmerie — personnel", montant: 6, titre: "titre-2" },
            { id: "l-sec-gend-moyens", nom: "Gendarmerie — moyens", montant: 2, titre: "titre-3" },
          ],
        },
        {
          id: "prog-securite-civile",
          nom: "Sécurité civile et routière",
          lignes: [{ id: "l-sec-civile", nom: "Sécurité civile, routière (3 Md€)", montant: 3, titre: "titre-3" }],
        },
      ],
    },
    {
      id: "mission-solidarite",
      nom: "Solidarité",
      description: "Hébergement, insertion, minima sociaux gérés par l'État, handicap.",
      programmes: [
        {
          id: "prog-solidarite-insertion",
          nom: "Insertion et hébergement",
          lignes: [
            { id: "l-sol-rsa", nom: "RSA (compensation État)", montant: 4, titre: "titre-6" },
            { id: "l-sol-minima", nom: "Autres minima sociaux", montant: 3, titre: "titre-6" },
            { id: "l-sol-urgence", nom: "Hébergement d'urgence", montant: 3, titre: "titre-6" },
          ],
        },
        {
          id: "prog-handicap",
          nom: "Handicap",
          lignes: [
            { id: "l-sol-handicap-prestations", nom: "Prestations de compensation", montant: 8, titre: "titre-6" },
            { id: "l-sol-handicap-etablissements", nom: "Etablissements et accessibilité", montant: 4, titre: "titre-6" },
          ],
        },
      ],
    },
    {
      id: "mission-ecologie-mobilites",
      nom: "Écologie et mobilités",
      description: "Transition écologique, infrastructures de transport, énergies.",
      programmes: [
        {
          id: "prog-ecologie-transition",
          nom: "Transition écologique",
          lignes: [
            { id: "l-eco-energie", nom: "Transition énergétique", montant: 5, titre: "titre-7" },
            { id: "l-eco-forets", nom: "Forêts et biodiversité", montant: 4, titre: "titre-7" },
          ],
        },
        {
          id: "prog-infrastructures",
          nom: "Infrastructures de transport",
          lignes: [
            { id: "l-eco-rail-infra", nom: "Infrastructures ferroviaires", montant: 3, titre: "titre-7" },
            { id: "l-eco-rail-services", nom: "Services et sécurité ferroviaires", montant: 2, titre: "titre-7" },
            { id: "l-eco-routes", nom: "Routes et navigations", montant: 3, titre: "titre-7" },
          ],
        },
      ],
    },
    {
      id: "mission-justice",
      nom: "Justice",
      description: "Justice judiciaire, administration pénitentiaire, protection judiciaire.",
      programmes: [
        {
          id: "prog-justice-judiciaire",
          nom: "Justice judiciaire",
          lignes: [
            { id: "l-jus-jud-perso", nom: "Justice judiciaire — personnel", montant: 4, titre: "titre-2" },
            { id: "l-jus-jud-moyens", nom: "Justice judiciaire — moyens", montant: 4, titre: "titre-3" },
          ],
        },
        {
          id: "prog-penitentiaire",
          nom: "Administration pénitentiaire",
          lignes: [
            { id: "l-jus-penit-detention", nom: "Détention", montant: 2, titre: "titre-3" },
            { id: "l-jus-penit-insertion", nom: "Insertion des détenus", montant: 2, titre: "titre-3" },
          ],
        },
      ],
    },
    {
      id: "mission-immigration",
      nom: "Immigration et asile",
      description: "Asile, immigration, accueil des demandeurs d'asile.",
      programmes: [
        {
          id: "prog-immigration-asile",
          nom: "Immigration et asile",
          lignes: [
            { id: "l-im-asile-instruction", nom: "Instruction des demandes d'asile", montant: 2, titre: "titre-6" },
            { id: "l-im-asile-hebergement", nom: "Hébergement des demandeurs", montant: 2, titre: "titre-6" },
            { id: "l-im-controle", nom: "Contrôle des flux migratoires", montant: 3, titre: "titre-6" },
          ],
        },
      ],
    },
    {
      id: "mission-autres-comptes-speciaux",
      nom: "Autres comptes spéciaux",
      description:
        "Comptes d'affectation spéciale et comptes de commerce :hors périmètre du budget général.",
      programmes: [
        {
          id: "prog-cas-prelevements",
          nom: "Comptes d'affectation spéciale",
          lignes: [
            { id: "l-cas-prelevements", nom: "Affectations spéciales et prélèvements", montant: 22, titre: "titre-6" },
            { id: "l-cas-commerce-gestion", nom: "Gestion des comptes de commerce", montant: 5, titre: "titre-6" },
            { id: "l-cas-commerce-appui", nom: "Appui aux politiques publiques", montant: 3, titre: "titre-6" }
          ],
        },
      ],
    },
    {
      id: "mission-autres-missions",
      nom: "Autres missions",
      description:
        "Agriculture, relations avec les collectivités, économie, intérieur, outre-mer, santé, action extérieure, culture et divers.",
      programmes: [
        {
          id: "prog-agriculture",
          nom: "Agriculture et alimentation",
          lignes: [
            { id: "l-aut-agri-enseignement", nom: "Enseignement agricole", montant: 4, titre: "titre-2" },
            { id: "l-aut-agri-economie", nom: "Économie agricole et pêche", montant: 5, titre: "titre-6" },
          ],
        },
        {
          id: "prog-relations-collectivites",
          nom: "Relations avec les collectivités territoriales",
          lignes: [
            { id: "l-aut-coll-concours", nom: "Concours financiers aux collectivités", montant: 8, titre: "titre-6" },
            { id: "l-aut-coll-reformes", nom: "Réformes et expertise territoriale", montant: 4, titre: "titre-6" },
          ],
        },
        {
          id: "prog-economie-finances",
          nom: "Économie et finances",
          lignes: [
            { id: "l-aut-eco-entreprises", nom: "Soutien aux entreprises", montant: 3, titre: "titre-3" },
            { id: "l-aut-eco-tourisme-industrie", nom: "Industrie et services", montant: 2, titre: "titre-3" },
            { id: "l-aut-admin-dgfip", nom: "DGFiP", montant: 3, titre: "titre-2" },
            { id: "l-aut-admin-douanes", nom: "Douanes", montant: 2, titre: "titre-2" }
          ],
        },
        {
          id: "prog-interieur",
          nom: "Intérieur (hors sécurités)",
          lignes: [
            { id: "l-aut-int-terr", nom: "Territoires et élections", montant: 5, titre: "titre-2" },
            { id: "l-aut-int-cultes", nom: "Cultes", montant: 5, titre: "titre-2" },
          ],
        },
        {
          id: "prog-outre-mer",
          nom: "Outre-mer",
          lignes: [
            { id: "l-aut-outremer-continuite", nom: "Outre-mer — continuité territoriale", montant: 3, titre: "titre-7" },
            { id: "l-aut-outremer-adaptation", nom: "Outre-mer — adaptation des politiques", montant: 4, titre: "titre-7" },
          ],
        },
        {
          id: "prog-sante-admin",
          nom: "Santé (administration)",
          lignes: [
            { id: "l-aut-sante-admin", nom: "Administration sanitaire", montant: 3, titre: "titre-2" },
            { id: "l-aut-sante-secu", nom: "Sécurité sanitaire", montant: 2, titre: "titre-2" },
          ],
        },
        {
          id: "prog-action-exterieure",
          nom: "Action extérieure de l'État",
          lignes: [
            { id: "l-aut-ext-ambassades", nom: "Réseau diplomatique", montant: 2, titre: "titre-3" },
            { id: "l-aut-ext-cooperation", nom: "Coopération culturelle", montant: 2, titre: "titre-3" },
          ],
        },
        {
          id: "prog-culture",
          nom: "Culture",
          lignes: [
            { id: "l-aut-culture-patrimoine", nom: "Patrimoine", montant: 2, titre: "titre-6" },
            { id: "l-aut-culture-creation", nom: "Création artistique", montant: 2, titre: "titre-6" },
          ],
        },
        {
          id: "prog-divers",
          nom: "Divers",
          lignes: [
            { id: "l-aut-sport", nom: "Sport, jeunesse et éducation populaire", montant: 3, titre: "titre-6" },
            { id: "l-aut-tourisme", nom: "Tourisme et divers", montant: 6, titre: "titre-3" },
          ],
        },
      ],
    },
  ],
  recettes: [
    {
      id: "rec-tva",
      nom: "TVA",
      categorie: "fiscale",
      detail: "Perçue par la DGFiP pour le budget de l'État ; impôt indirect sur la consommation.",
      montant: 285,
    },
    {
      id: "rec-ir",
      nom: "Impôt sur le revenu",
      categorie: "fiscale",
      detail: "Prélèvement à la source par la DGFiP, affecté au budget général de l'État.",
      montant: 105,
    },
    {
      id: "rec-is",
      nom: "Impôt sur les sociétés",
      categorie: "fiscale",
      detail: "Bénéfices des sociétés ; la part CVAE va aux collectivités, l'IS reste à l'État.",
      montant: 80,
    },
    {
      id: "rec-ticpe",
      nom: "TICPE",
      categorie: "fiscale",
      detail: "Taxe intérieure sur la consommation de produits énergétiques (carburants, chauffage).",
      montant: 35,
    },
    {
      id: "rec-tabac-alcools",
      nom: "Droits sur tabacs et alcools",
      categorie: "fiscale",
      detail: "Droits d'accises perçus par la DGFiP (douanes).",
      montant: 16,
    },
    {
      id: "rec-dmto",
      nom: "Droits de mutation à titre onéreux",
      categorie: "fiscale",
      detail: " Droits d'enregistrement sur les ventes immobilières (DGFiP).",
      montant: 9,
    },
    {
      id: "rec-autres-impots",
      nom: "Autres impôts et taxes",
      categorie: "fiscale",
      detail: "Fiscalité locale transférée, taxes diverses, autres impôts recouvrés par l'État.",
      montant: 30,
    },
    {
      id: "rec-dividendes",
      nom: "Dividendes de l'État",
      categorie: "non_fiscale",
      detail: "Participation de l'État aux résultats des sociétés qu'il détient (APE, EDF…).",
      montant: 8,
    },
    {
      id: "rec-amendes",
      nom: "Amendes et sanctions",
      categorie: "non_fiscale",
      detail: "Amendes pénales, fiscales et de police, recouvrées par la DGFiP.",
      montant: 6,
    },
    {
      id: "rec-ventes-biens-services",
      nom: "Ventes de biens et services",
      categorie: "non_fiscale",
      detail: "Produits des administrations (domaine de l'État, prestations).",
      montant: 16,
    },
    {
      id: "rec-psr-collectivites",
      nom: "Prélèvements sur recettes au profit des collectivités",
      categorie: "transfert",
      detail: "Prélèvement sur recettes (PSR) : l'État reverse une part de ses recettes aux collectivités (négatif).",
      montant: -55,
    },
    {
      id: "rec-contribution-ue",
      nom: "Contribution au budget de l'UE",
      categorie: "transfert",
      detail: "Contribution française au budget européen, prélevée sur les recettes de l'État (négatif).",
      montant: -30,
    },
  ],
  securiteSociale: {
    recettes: [
      { id: "ss-rec-cotisations", nom: "Cotisations sociales", detail: "Cotisations patronales et salariales des régimes de base.", montant: 395 },
      { id: "ss-rec-csg", nom: "CSG", detail: "Contribution sociale généralisée, affectée aux régimes.", montant: 138 },
      { id: "ss-rec-crds", nom: "CRDS", detail: "Contribution au remboursement de la dette sociale.", montant: 6 },
      { id: "ss-rec-impots-affectes", nom: "Impôts et taxes affectés", detail: "Taxes affectées aux régimes (tabac, alcools…).", montant: 45 },
      { id: "ss-rec-transferts-etat", nom: "Transferts de l'État", detail: "Contribution de l'État à la Sécu, inscrite au budget de l'État.", montant: 55 },
      { id: "ss-rec-autres", nom: "Autres recettes", detail: "Taxes diverses, produits financiers, subventions.", montant: 26 },
    ],
    depenses: [
      { id: "ss-dep-ondam", nom: "Maladie (ONDAM)", detail: "Objectif national de dépenses d'assurance maladie.", montant: 274 },
      { id: "ss-dep-retraites", nom: "Retraites de base", detail: "Pensions des régimes de base (CNAV, MSA…).", montant: 292 },
      { id: "ss-dep-famille", detail: "Prestations familiales et petite enfance (CNAF).", nom: "Famille", montant: 58 },
      { id: "ss-dep-autonomie", nom: "Autonomie (APA/PCH)", detail: "Prise en charge de la perte d'autonomie (CNSA).", montant: 42 },
      { id: "ss-dep-at-mp", nom: "Accidents du travail", detail: "Branches accidents du travail / maladies professionnelles.", montant: 13 },
      { id: "ss-dep-gestion", nom: "Gestion des régimes", detail: "Frais de gestion des organismes (CNAM, CNAV…).", montant: 5 },
    ],
  },
  collectivites: {
    recettes: [
      { id: "col-rec-fisc-directe", nom: "Fiscalité directe locale", detail: "Taxe foncière, taxe d'habitation résiduelle, CFE, taxe d'enlèvement des ordures ménagères.", montant: 128 },
      { id: "col-rec-fisc-transferee", nom: "Fiscalité transférée", detail: "Part de fiscalité d'État transférée aux collectivités (notamment suite à la suppression de la taxe d'habitation).", montant: 40 },
      { id: "col-rec-dotations", nom: "Dotations de l'État", detail: "DGF, DSR, DSU et autres dotations budgétaires.", montant: 74 },
      { id: "col-rec-fctva", nom: "FCTVA", detail: "Fonds de compensation de la TVA : remboursement de la TVA payée par les collectivités sur leurs investissements.", montant: 12 },
      { id: "col-rec-emprunts", nom: "Emprunts", detail: "Nouvelle dette contractée par les collectivités pour financer l'investissement.", montant: 66 },
    ],
    depenses: [
      { id: "col-dep-personnel", nom: "Personnel", detail: "Rémunérations des agents territoriaux.", montant: 106 },
      { id: "col-dep-action-sociale", nom: "Action sociale", detail: "RSA, APA, aide sociale à l'enfance, personnes âgées.", montant: 72 },
      { id: "col-dep-transports", nom: "Transports", detail: "Transports publics urbains et scolaires, mobilités.", montant: 40 },
      { id: "col-dep-investissement-dette", nom: "Investissement et dette", detail: "Dépenses d'équipement brut et remboursement de dette.", montant: 70 },
      { id: "col-dep-fonctionnement", nom: "Fonctionnement", detail: "Achats, subventions de fonctionnement, charges diverses.", montant: 32 },
    ],
  },
  operateurs: [
    {
      id: "op-cdc",
      nom: "Caisse des dépôts et consignations (CDC)",
      role: "Épargne populaire, financement du logement social et de la transition, fonds de pension public (ERFP).",
      enjeu: "Bilan ≈ 1 388 Md€",
      montantIndicatif: 1388,
      avertissement: "Stocks gérés pour des tiers : ce ne sont pas des dépenses annuelles.",
      circuit: {
        role: "La CDC est la « banque d'intérêt général » : elle collecte des fonds qui lui sont confiés par la loi et les place ou les prête dans l'intérêt général. Elle ne vit pas du budget de l'État : elle vit des revenus de ses placements. 100 % des dividendes qu'elle verse vont à l'État, mais ses fonds de bilan appartiennent à ses déposants.",
        fonds: [
          "Livret A (~450 Md€) : épargne des particuliers collectée par les banques et centralisée à la CDC. Les banques collectent, la CDC centralise et gère. Le livret A est exonéré d'impôt — c'est un avantage fiscal (~2 Md€/an de « dépense fiscale ») en échange de la ressource.",
          "Fonds d'épargne (≈ 520 Md€) : l'ensemble Livret A + LDDS + LEP, utilisé pour financer le logement social (~80 à 100 Md€ de prêts aux bailleurs sociaux), les PME via Bpifrance (retrocession) et les organismes publics.",
          "Retraite et prévoyance : l'ERFP (Établissement de retraite du fonds de réserve des pensionnés de France, ex-FRR) et la CNRACL (régime de retraite des agents publics territoriaux) sont gérés par la CDC. La dette sociale de la CADES (~200 Md€) est logée à la CDC et remboursée par la CRDS.",
          "Consignations et dépôts publics : dépôts de garantie des consommateurs (loyers, assurances), réglements des tribunaux, fonds des notaires, avocats, administrateurs. L'État y consigne aussi les fonds des services publics (justice, péages, participations).",
          "Filiales : CNP Assurances (assurance), Transverse (transitions), Ideciclic/CDC Bâtiment (ingénierie construction), Egis (infrastructures).",
        ],
        etapes: [
          "1. Collecte — Les particuliers déposent sur un livret A dans n'importe quelle banque. La banque doit reverser ces fonds à la CDC (centralisation obligatoire). Les élus locaux, notaires, tribunaux y déposent aussi les fonds qu'ils détiennent pour le compte de tiers.",
          "2. Centralisation — La CDC regroupe ces dépôts dans son fonds d'épargne. Elle paie aux épargnants un intérêt fixé par l'État (taux du livret A, ~3 % en 2024-2025, revu par le gouvernent sur proposition de la Banque de France).",
          "3. Placement — Pour payer ces intérêts et servir l'intérêt général, la CDC prête et investit : prêts au logement social (à taux préférentiel), aux PME, aux hôpitaux, aux universités, aux collectivités. Elle gère aussi l'épargne retraite des agents publics.",
          "4. Gestion d'intérêt général — Par mandat de l'État, elle finance des politiques publiques : rénovation énergétique, transition écologique, infrastructures, en partenariat avec Bpifrance et l'ADEME.",
          "5. Redistribution — Les bénéfices de la CDC (≈ 2 Md€/an) reviennent intégralement à l'État sous forme de dividende, en plus des intérêts versés aux épargnants et des prêts consentis aux politiques publiques.",
        ],
      },
    },
    {
      id: "op-aft",
      nom: "Agence France Trésor (AFT)",
      role: "Gestion de la dette de l'État et du treasury : émissions obligataires, gestion du compte unique du Trésor.",
      enjeu: "≈ 2 400 Md€ gérés",
      montantIndicatif: 2400,
      avertissement: "Encours de dette négociable géré pour le compte de l'État : pas une dépense annuelle.",
    },
    {
      id: "op-bpifrance",
      nom: "Bpifrance",
      role: "Investissement public, garanties et prêts aux PME/ETI, soutien à l'innovation et l'export.",
      enjeu: "≈ 50 Md€ d'engagements",
      montantIndicatif: 50,
      avertissement: "Engagements sur plusieurs années et garanties : à ne pas additionner aux dépenses annuelles.",
    },
    {
      id: "op-ademe",
      nom: "ADEME",
      role: "Transition écologique : subventions et ingénierie (rénovation énergétique, mobilités, circularité).",
      enjeu: "≈ 1 Md€ de budget annuel",
      montantIndicatif: 1,
      avertissement: "Budget d'intervention annuel, subventions tirées du programme Écologie.",
    },
    {
      id: "op-anr",
      nom: "Agence nationale de la recherche (ANR)",
      role: "Financement de la recherche académique et partenariale via appels à projets.",
      enjeu: "≈ 1 Md€ de budget annuel",
      montantIndicatif: 1,
      avertissement: "Subventions comptabilisées dans la mission Recherche.",
    },
  ],
  historique: [
    {
      id: "hist-depenses-etat",
      nom: "Dépenses de l'État (LFI, Md€)",
      points: [
        { annee: 2015, valeur: 384 }, { annee: 2016, valeur: 390 },
        { annee: 2017, valeur: 394 }, { annee: 2018, valeur: 403 },
        { annee: 2019, valeur: 412 }, { annee: 2020, valeur: 474 },
        { annee: 2021, valeur: 447 }, { annee: 2022, valeur: 448 },
        { annee: 2023, valeur: 455 }, { annee: 2024, valeur: 460 },
        { annee: 2025, valeur: 468 }, { annee: 2026, valeur: 466 },
      ],
    },
    {
      id: "hist-recettes-etat",
      nom: "Recettes nettes de l'État (LFI, Md€)",
      points: [
        { annee: 2015, valeur: 372 }, { annee: 2016, valeur: 377 },
        { annee: 2017, valeur: 386 }, { annee: 2018, valeur: 392 },
        { annee: 2019, valeur: 399 }, { annee: 2020, valeur: 364 },
        { annee: 2021, valeur: 406 }, { annee: 2022, valeur: 433 },
        { annee: 2023, valeur: 431 }, { annee: 2024, valeur: 434 },
        { annee: 2025, valeur: 437 }, { annee: 2026, valeur: 440 },
      ],
    },
    {
      id: "hist-dette",
      nom: "Dette publique (% du PIB)",
      points: [
        { annee: 2015, valeur: 95.4 }, { annee: 2016, valeur: 97.9 },
        { annee: 2017, valeur: 98.4 }, { annee: 2018, valeur: 98.1 },
        { annee: 2019, valeur: 97.6 }, { annee: 2020, valeur: 114.8 },
        { annee: 2021, valeur: 112.9 }, { annee: 2022, valeur: 111.7 },
        { annee: 2023, valeur: 109.9 }, { annee: 2024, valeur: 113.0 },
        { annee: 2025, valeur: 115.8 }, { annee: 2026, valeur: 115.9 },
      ],
    },
    {
      id: "hist-deficit",
      nom: "Déficit public (% du PIB)",
      points: [
        { annee: 2015, valeur: -3.6 }, { annee: 2016, valeur: -3.5 },
        { annee: 2017, valeur: -2.9 }, { annee: 2018, valeur: -2.3 },
        { annee: 2019, valeur: -2.2 }, { annee: 2020, valeur: -9.0 },
        { annee: 2021, valeur: -6.6 }, { annee: 2022, valeur: -4.7 },
        { annee: 2023, valeur: -5.5 }, { annee: 2024, valeur: -5.8 },
        { annee: 2025, valeur: -4.7 }, { annee: 2026, valeur: -4.7 },
      ],
    },
  ],
  aides: [
    { id: "aide-apl", nom: "APL (aide personnalisée au logement)", beneficiaire: "menages", financeur: "État (Action logement)", montant: 11, detail: "Aide au loyer des ménages modestes. Point clé : elle est versée au bailleur (propriétaire) et non au locataire, ce qui réduit l'effet réel sur les loyers (les bailleurs ajustent leurs loyers à l'aide disponible)." },
    { id: "aide-rsa", nom: "RSA (revenu de solidarité active)", beneficiaire: "menages", financeur: "Départements (avec concours État)", montant: 15, detail: "Minima social versé par les conseils départementaux. Le financement est partagé : le département paie, l'État compense en partie — d'où un bras de fer permanent sur la compensation réelle." },
    { id: "aide-ppa", nom: "Prime d'activité", beneficiaire: "menages", financeur: "État (CASF)", montant: 14, detail: "Complément de revenu pour les travailleurs modestes. Versée par les CAF, financée par l'État, elle augmente avec le salaire jusqu'à un plafond — un « mécanisme d'incitation au travail »." },
    { id: "aide-famille-apf", nom: "Allocations familiales", beneficiaire: "menages", financeur: "Sécurité sociale (CNAF)", montant: 20, detail: "Versées dès le 2e enfant (universalité) mais soumises à condition de revenus depuis 2015 — un compromis pédagogique entre « aide universelle » et « aide ciblée »." },
    { id: "aide-ars", nom: "Allocation de rentrée scolaire (ARS)", beneficiaire: "menages", financeur: "Sécurité sociale (CNAF)", montant: 3, detail: "Aide ponctuelle annuelle par enfant scolarisé de 6 à 18 ans, versée fin août. Conditionnée aux revenus (plafond CAF)." },
    { id: "aide-apa", nom: "APA (allocation personnalisée d'autonomie)", beneficiaire: "menages", financeur: "Départements", montant: 6, detail: "Aide à l'autonomie des personnes âgées dépendantes. Pilotée par les départements, cofinancée par la CNSA (fonds national) — le point de tension du « pacte de solidarité » entre générations." },
    { id: "aide-pch", nom: "PCH (prestation de compensation du handicap)", beneficiaire: "menages", financeur: "Départements (via CNSA)", montant: 4, detail: "Aide humaine, technique ou d'aménagement du logement pour les personnes handicapées. Gérée par les MDPH (maisons départementales des personnes handicapées)." },
    { id: "aide-bourse-lycee", nom: "Bourses lycée et collège", beneficiaire: "menages", financeur: "État (Éducation nationale)", montant: 3, detail: "Aides à la scolarité des familles modestes. Bourses de collège (sur critères sociaux) et bourses de lycée (au mérite + critères sociaux)." },
    { id: "aide-bourse-etudiant", nom: "Bourses étudiants (CROUS)", beneficiaire: "menages", financeur: "État (Enseignement supérieur)", montant: 4, detail: "Bourses sur critères sociaux versées par les CROUS. Conditionnées aux revenus des parents — souvent citées comme exemple de redistribution verticale efficace." },
    { id: "aide-chomage", nom: "Allocation chômage (ARE)", beneficiaire: "menages", financeur: "UNÉDIC (cotisations employeurs)", montant: 42, detail: "Versée par France Travail (ex-Pôle emploi), financée par les cotisations des employeurs (assurance chômage) — pas par l'impôt. Le déficit de l'UNÉDIC est couvert par l'État en dernier recours." },
    { id: "aide-créa-entreprise", nom: "Aides à la création/reprise d'entreprise", beneficiaire: "entreprises", financeur: "État (Bpifrance, ADI)", montant: 2, detail: "Prêts d'honneur, aides régionales, NACRE, dispositifs Bpifrance. Souvent un levier plutôt qu'un don : prêts à taux zéro ou garanties." },
    { id: "aide-recherche-credit-impot", nom: "Crédit d'impôt recherche (CIR)", beneficiaire: "entreprises", financeur: "État (dépense fiscale)", montant: 8, detail: "Réduction d'impôt sur les sociétés pour les dépenses de R&D. C'est une « dépense fiscale » : l'État renonce à des recettes au lieu de verser un chèque. Bénéficiaires concentrés sur les grands groupes." },
    { id: "aide-cii", nom: "Crédit d'impôt innovation (CII)", beneficiaire: "entreprises", financeur: "État (dépense fiscale)", montant: 2, detail: "Version PME du CIR, ciblée sur l'innovation produit et procédé. Récent (2023), pour compenser la fin du CICE." },
    { id: "aide-tpe-pme", nom: "Aides aux TPE/PME et indépendants", beneficiaire: "entreprises", financeur: "État (Bpifrance, DGE)", montant: 3, detail: "Garanties, prêts participatifs, aides directes (Fonds de solidarité, FRR). Guichet principal : Bpifrance, en partenariat avec les régions." },
    { id: "aide-transition-écologique", nom: "Aides transition écologique (rénovation, mobilité)", beneficiaire: "menages", financeur: "État (ADEME, Anah, CEE)", montant: 7, detail: "MaPrimeRénov', CEE (certificats d'économie d'énergie — payés par les consommateurs via leur facture d'énergie, pas par l'impôt), bonus écologique. Point pédagogique : les CEE sont un financement « invisible » car répercuté sur les factures." },
    { id: "aide-agriculture", nom: "Aides à l'agriculture (PAC + national)", beneficiaire: "entreprises", financeur: "UE (FEADER) + État", montant: 12, detail: "Premier pilier de la PAC (payé par l'Union européenne via le FEADER) et aides nationales. Les « aides directes » vont majoritairement aux grandes cultures — souvent débattu." },
    { id: "aide-lda", nom: "Prêts et financements logement social", beneficiaire: "autres", financeur: "CDC (fonds d'épargne)", montant: 9, detail: "Prêts à taux préférentiel de la CDC aux bailleurs sociaux. Ce ne sont pas des dons : la CDC prête l'épargne du livret A, les bailleurs remboursent avec les loyers." },
    { id: "aide-subventions-opérateurs", nom: "Subventions aux opérateurs publics", beneficiaire: "operateurs", financeur: "État (titre 6)", montant: 30, detail: "Versements aux opérateurs (ADEME, ANR, France Travail…) pour financer leurs missions. C'est le canal par lequel l'État délègue ses politiques publiques — le « budget caché » du titre 6." },
    { id: "aide-subventions-collectivités", nom: "Dotations aux collectivités", beneficiaire: "collectivites", financeur: "État (PSR)", montant: 55, detail: "Prélèvements sur recettes : l'État reverse directement une part de ses recettes fiscales aux communes, départements, régions (DGF). C'est la principale ressource propre des communes." },
    { id: "aide-subventions-associations", nom: "Subventions aux associations", beneficiaire: "associations", financeur: "État + collectivités", montant: 8, detail: "Aides au sport, à la culture, à la solidarité, à l'éducation populaire. Versées à la ligne (par ministère ou par collectivité), souvent débattues pour leur ciblage." },
  ],
  mesures: [
    {
      id: "mes-ir-45",
      nom: "Créer une tranche IR à 49 % au-delà de 400 000 €/an",
      categorie: "fiscalite",
      impactSolde: 3,
      overrides: { "rec-ir": 108 },
      detail: "Tranche supplémentaire de 4 points au-delà d'un seuil élevé. Chiffrage d'ordre de grandeur : ~0,3 % des foyers concernés pour ~2 à 4 Md€ selon le seuil exact (source : rapports Sénat/IPP sur la tranche à 45 %).",
      contreArguments: [
        "Effet d'évitement accru (optimisation, flat-tax sur les revenus du capital comme porte de sortie)",
        "Concurrence fiscale européenne : comparaison avec la flat tax voisinale",
        "Assiette étroite : rendement sensible à la définition du seuil",
      ],
      effetPib5ansPct: -0.1,
    },
    {
      id: "mes-taux-intermediaire",
      nom: "Basculer 20 Md€ de TVA du taux réduit 5,5 % vers 10 %",
      categorie: "fiscalite",
      impactSolde: 4,
      overrides: { "rec-tva": 289 },
      detail: "L'écart de 4,5 points entre les taux réduit et intermédiaire appliqué à une assiette de ~450 Md€ ; 20 Md€ de bascule rapportent ~0,9 Md€, mais l'effet net est plus élevé si on bascule davantage (source : PLF, enjeu de l'éco-taxe).",
      contreArguments: [
        "TVA = impôt régressif : pèse proportionnellement plus sur les ménages modestes (achats incompressibles)",
        "Effet inflationniste immédiat (~0,3 pt d'inflation selon les bascules)",
        "Indexation des prestations en réponse : coût de retour partiel pour la Sécu",
      ],
      effetPib5ansPct: -0.2,
    },
    {
      id: "mes-niche-quotient",
      nom: "Plafonner le quotient conjugal à 2 000 € d'avantage",
      categorie: "fiscalite",
      impactSolde: 1,
      overrides: { "rec-autres-impots": 31 },
      detail: "Le quotient conjugal coûte ~6 Md€/an de recettes renoncées en faveur des couples à un seul revenu élevé. Un plafonnement serré en récupère ~1 Md€ (source : rapports CGEDD/Sénat sur les dépenses fiscales).",
      contreArguments: [
        "Frappe les familles mono-actives — désincitation au second revenu",
        "Complexité de calcul et effets de seuils (trap effects)",
        "Rendement modeste au regard du coût politique",
      ],
    },
    {
      id: "mes-suppression-cir",
      nom: "Réformer le CIR : plafonnement à 50 % pour les grands groupes",
      categorie: "fiscalite",
      impactSolde: 3,
      overrides: {},
      detail: "Le CIR coûte ~8 Md€/an, très concentré sur les grands groupes (le quart des bénéficiaires = la moitié du montant). Un plafonnement ciblé récupère ~3 Md€ sans toucher les PME (source : France Stratégie, Cour des comptes).",
      contreArguments: [
        "Risque de délocalisation de la R&D des grands groupes",
        "Assiette déjà instable : dernière réforme en 2023, encore mal évaluée",
        "Effet signal négatif pour l'attractivité",
      ],
      effetPib5ansPct: -0.2,
    },
    {
      id: "mes-taxe-financiere",
      nom: "Taxe sur les transactions financières élargie",
      categorie: "fiscalite",
      impactSolde: 2,
      overrides: {},
      detail: "La TTF française actuelle rapporte ~1 Md€ (assiette étroite, actions françaises). Un élargissement aux titres de créance et aux transactions intragroupe rapporterait ~2 Md€ supplémentaires (source : annexes « voies et moyens » du PLF).",
      contreArguments: [
        "Délocalisation des transactions (London, Amsterdam) — efficacité prouvée limitée",
        "Nécessite une coordination européenne pour éviter l'évitement",
        "Coût de conformité pour les acteurs domestiques",
      ],
    },
    {
      id: "mes-gel-point-indice",
      nom: "Gel du point d'indice pendant 3 ans (fonction publique)",
      categorie: "depenses",
      impactSolde: 9,
      overrides: {},
      detail: "1 point d'indice ≈ 4,9 Md€/an. Un gel (inflation ~2 %/an) économise ~4,9 × 3 = ~15 Md€ sur 3 ans, soit ~5 Md€/an en moyenne, plus l'effet de glissement (GVT) non distribué ~4 Md€/an supplémentaires (source : rapports Parlement sur la masse salariale).",
      contreArguments: [
        "Perte de pouvoir d'achat des agents publics (~2,2 M agents touchés)",
        "Dégrisement réel vs nominal : économie réelle amputée par l'inflation",
        "Risque de conflit social et de démotivation (effet sur la qualité du service)",
      ],
      effetPib5ansPct: -0.3,
      coutTransition: { montant: -2, dureeAnnees: 1 },
    },
    {
      id: "mes-reduction-operateurs",
      nom: "Réduire de 10 % les subventions aux opérateurs",
      categorie: "depenses",
      impactSolde: 3,
      overrides: {},
      detail: "Les subventions titre 6 ≈ 30 Md€/an. Une réduction de 10 % ciblée sur les opérateurs en bon bilan financier économise ~3 Md€/an (source : rapport sur la dépense publique).",
      contreArguments: [
        "Baisse de l'activité réelle : bourses CROUS, subventions ADEME, ANR…",
        "Effet mécanique sur l'emploi dans les opérateurs",
        "Risque de sur-sollicitation des guichets alternatifs",
      ],
      effetPib5ansPct: -0.1,
    },
    {
      id: "mes-desindexation-retraites",
      nom: "Désindexation partielle des retraites > 2 500 €/mois",
      categorie: "securite-sociale",
      impactSolde: 4,
      overrides: {},
      detail: "La désindexation (ou indexation limitée à l'inflation − 0,5 pt) des pensions moyennes et élevées économise ~2 à 4 Md€/an selon le périmètre (source : COR, mesures Sénat 2024-2025).",
      contreArguments: [
        "Atteinte à la promesse du maintien du pouvoir d'achat",
        "Poids politique élevé (mobilisation de 2023)",
        "Assiette des retraites moyennes différente selon les régimes",
      ],
      effetPib5ansPct: -0.1,
    },
    {
      id: "mes-ondam-objectif",
      nom: "ONDAM : objectif de progression limité à +2 %/an",
      categorie: "securite-sociale",
      impactSolde: 5,
      overrides: { "ss-dep-ondam": 270 },
      detail: "L'ONDAM progresse en moyenne de +3 à +4 %/an. Un objectif à +2 % (hors Ségur structurel) économise ~2 à 5 Md€/an en rythme de croisière (source : rapports Cour des comptes sur la maîtrise de l'ONDAM).",
      contreArguments: [
        "Risque de déremboursements et de restes à charge si mal conçu",
        "Effet délégué aux médecins : conflit avec les professionnels de santé",
        "Sous-dimensionnement du système de santé (délais de rendez-vous)",
      ],
      effetPib5ansPct: -0.2,
    },
    {
      id: "mes-apl-bailleurs",
      nom: "APL rénovées : versement direct au locataire",
      categorie: "aide",
      impactSolde: 1,
      overrides: {},
      detail: "Basculer l'APL du bailleur vers le locataire réduit l'effet d'aubaine (les bailleurs ajustent leurs loyers à l'aide). Économie estimée ~1 à 1,5 Md€/an à périmètre constant (source : évaluation France Stratégie).",
      contreArguments: [
        "Risque d'impayés de loyer pour les bailleurs sociaux et privés",
        "Effet micro-économique incertain sur les loyers réels",
        "Complexité de mise en œuvre (formation des CAF)",
      ],
    },
    {
      id: "mes-plan-investissement",
      nom: "Plan d'investissement public +20 Md€/an (transition, rail, hôpital)",
      categorie: "investissement",
      impactSolde: -20,
      overrides: { "l-eco-energie": 12, "l-eco-rail-infra": 8 },
      detail: "Investissement public direct (État + opérateurs) : rendement macroéconomique élevé à long terme (multiplicateur ~1,3 à horizon 5 ans selon OCDE), mais coût budgétaire immédiat.",
      contreArguments: [
        "Coût immédiat sur le solde public : ~20 Md€/an",
        "Capacité d'absorption réelle des projets (retards, surcoûts)",
        "Rentabilité incertaine si les projets sont mal choisis",
      ],
      effetPib5ansPct: 0.8,
      coutTransition: { montant: -20, dureeAnnees: 5 },
    },
  ],
  depensesFiscales: [
    { id: "df-quotient-conjugal", nom: "Quotient conjugal", montant: 6, beneficiaire: "Couples mono-actifs", detail: "Avantage fiscal lié à la déclaration commune des revenus du couple." },
    { id: "df-tva-reduite", nom: "TVA à taux réduit (5,5 %)", montant: 45, beneficiaire: "Tous les ménages (alimentation, énergie)", detail: "Écart entre le taux réduit et le taux normal : la plus grosse dépense fiscale française." },
    { id: "df-cir", nom: "Crédit d'impôt recherche (CIR)", montant: 8, beneficiaire: "Entreprises (grands groupes surtout)", detail: "Réduction d'IS de 30 % des dépenses de R&D." },
    { id: "df-pensions-retraite", nom: "Déductions forfaitaires des pensions", montant: 4, beneficiaire: "Retraités", detail: "Abattement de 10 % sur les pensions pour les retraités non imposables ou peu imposés." },
    { id: "df-heures-sup", nom: "Exonération des heures supplémentaires", montant: 5, beneficiaire: "Salariés (secteurs concernés)", detail: "Non-imposition des heures sup : incitation au travail mais coûteuse et régressive." },
    { id: "df-livret-a", nom: "Exonération du livret A", montant: 2, beneficiaire: "Épargnants (banques collectrices)", detail: "Exonération d'impôt et de prélèvements sociaux sur les intérêts — en échange de la ressource pour le logement social via la CDC." },
    { id: "df-assurance-vie", nom: "Fiscalité de l'assurance-vie", montant: 3, beneficiaire: "Épargnants aisés", detail: "Abattement et taux réduits sur les rachats : outil de transmission patrimoniale." },
    { id: "df-micro-foncier", nom: "Dispositifs fonciers (Pinel, Malraux…)", montant: 2, beneficiaire: "Investisseurs immobiliers", detail: "Réductions d'impôt pour investissement locatif : efficacité débattue." },
    { id: "df-ue-tabac", nom: "Avantages fiscaux des DOM (tabac, carburant)", montant: 2, beneficiaire: "Résidents des outre-mer", detail: "Tabac à prix réduit dans les DOM et autres dispositifs de continuité territoriale." },
    { id: "df-groupe-familles", nom: "Demi-parts et majorations fiscales familiales", montant: 3, beneficiaire: "Familles", detail: "Effet du quotient familial sur l'IR au-delà du plafonnement." },
    { id: "df-isf-ifi", nom: "Exonérations liées à l'IFI", montant: 1, beneficiaire: "Patrimoines élevés (bois, forêts, œuvres d'art)", detail: "Exonérations ciblées pour patrimoines spécifiques." },
    { id: "df-niches-film", nom: "Sofica et dispositifs cinéma", montant: 1, beneficiaire: "Investisseurs dans l'audiovisuel", detail: "Réduction d'impôt pour investissements dans la production cinématographique." },
  ],
  macro: {
    pib: 2990,
    dettePct: 115.9,
    deficitPct: 4.7,
    detteReference2025Pct: 115.8,
  },
};
