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
      role: "Épargne populaire, financement des logement social et de la transition, fonds de pension public (ERFP).",
      enjeu: "Bilan ≈ 1 388 Md€",
      montantIndicatif: 1388,
      avertissement: "Stocks gérés pour des tiers : ce ne sont pas des dépenses annuelles.",
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
  macro: {
    pib: 2990,
    dettePct: 115.9,
    deficitPct: 4.7,
    detteReference2025Pct: 115.8,
  },
};
