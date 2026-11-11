// ============================================================================
// data/articles.js — PANNEAU DE CONTRÔLE DES ARTICLES de « L'Avenir »
// ============================================================================
// Règle d'or : aucun article n'est écrit en dur dans le HTML ou le JS.
// Ce fichier définit le tableau `articles` ; js/articles.js (accueil) et
// js/article.js (page article) l'affichent.
// Champs : titre, categorie, date (ISO), heure, image, chapo, signature,
// "une": true pour l'article à la une (un seul), et "corps" = tableau des
// paragraphes de l'article complet (lu par article.html?id=…).
// Modifier ce fichier = modifier le site, sans toucher au code.
// ============================================================================

const articles = [
  {
    "titre": "Climat : un accord historique signé à Genève",
    "categorie": "Environnement",
    "date": "2026-11-02",
    "heure": "08:30",
    "image": "img/une.svg",
    "chapo": "Cent vingt délégations ont validé un traité contraignant visant à réduire les émissions de 50 % d'ici 2040. Un tournant, selon les négociateurs, après dix ans d'atermoiements.",
    "signature": "Rédaction L'Avenir",
    "une": true,
    "corps": [
      "C'est à 3 heures du matin, samedi, que la dernière virgule a été arrachée. Réunis à Genève depuis dix jours, les négociateurs de cent vingt pays ont finalement paraphé un traité qui engage les signataires à réduire de moitié leurs émissions de gaz à effet de serre d'ici 2040.",
      "Le texte prévoit un fonds de solidarité de 100 milliards de dollars par an pour les pays les plus vulnérables, abondé par les plus gros émetteurs historiques. Une première. « Nous passons des discours aux actes », a martelé la présidente de la conférence, avant une standing ovation rare dans ce type de sommet.",
      "Les ONG saluent une avancée mais jugent l'objectif insuffisant : le GIEC réclamait -55 % dès 2035. Reste maintenant à traduire l'accord en lois nationales. Le Parlement européen se réunit dès la semaine prochaine."
    ]
  },
  {
    "titre": "La banque centrale abaisse ses taux directeurs",
    "categorie": "Économie",
    "date": "2026-11-01",
    "heure": "18:45",
    "image": "img/article-economie.svg",
    "chapo": "Une décision saluée par les marchés, qui vise à soutenir l'investissement des entreprises et le pouvoir d'achat des ménages.",
    "signature": "Service Économie",
    "une": false,
    "corps": [
      "La banque centrale a abaissé mercredi son taux directeur de 0,25 point, à 2,75 %, une décision votée à l'unanimité par son comité de politique monétaire. Les marchés ont aussitôt salué le geste : l'indice principal a gagné 1,8 % à la clôture.",
      "L'institution justifie cette baisse par le ralentissement de l'inflation, désormais à 2,1 %, proche de sa cible. « Nous pouvons nous permettre d'assouplir sans relancer les prix », a expliqué la gouverneure.",
      "Les ménages endettés à taux variable bénéficieront d'une baisse moyenne de 35 euros par mois sur leur mensualité. Les emprunteurs à taux fixe, eux, devront attendre le renouvellement de leur crédit pour en profiter."
    ]
  },
  {
    "titre": "Ukraine : négociations reprises à Genève",
    "categorie": "Monde",
    "date": "2026-11-01",
    "heure": "12:10",
    "image": "img/article-monde.svg",
    "chapo": "Sous médiation de l'ONU, les délégations sont de retour à la table des négociations. Notre envoyé spécial fait le point.",
    "signature": "Envoyé spécial à Genève",
    "une": false,
    "corps": [
      "Les négociations ont repris lundi à Genève sous l'égide de l'ONU, après dix-huit mois d'interruption. Pour la première fois, les deux délégations ont accepté de s'asseoir à la même table sans condition préalable.",
      "Notre envoyé spécial, présent sur place, décrit des discussions « longues, serrées, mais réelles ». Un cessez-le-feu humanitaire de soixante-douze heures est à l'étude pour permettre l'évacuation de civils de deux villes encerclées.",
      "Les observateurs restent prudents : trois tentatives précédentes ont échoué. Mais, pour la première fois, un calendrier de travail a été adopté. Prochaine session jeudi."
    ]
  },
  {
    "titre": "Festival de Cannes : le palmarès couronne un premier film",
    "categorie": "Culture",
    "date": "2026-10-30",
    "heure": "21:05",
    "image": "img/article-culture.svg",
    "chapo": "Le jury a récompensé une œuvre audacieuse qui explore les fractures sociales dans une petite ville du sud de l'Italie.",
    "signature": "Service Culture",
    "une": false,
    "corps": [
      "Le palmarès du festival de Cannes a été dévoilé samedi soir. La Palme d'or revient à un premier film, « Les Oubliés de Positano », chronique d'une famille ouvrière du sud de l'Italie confrontée à la fermeture de son usine.",
      "Le jury, présidé par une réalisatrice scandinave, a salué « une œuvre d'une grande générosité, portée par des acteurs non professionnels ». Le film sortira en salles en janvier.",
      "Dans la catégorie interprétation, deux prix ex aequo ont été attribués. La surprise de la sélection officielle a été un documentaire consacré aux négociations climatiques de Genève."
    ]
  },
  {
    "titre": "Soudan : un cessez-le-feu négocié à Nairobi",
    "categorie": "Monde",
    "date": "2026-10-30",
    "heure": "09:20",
    "image": "img/article-monde.svg",
    "chapo": "Après six mois de guerre civile, les belligérants ont accepté un arrêt des combats, négocié dans la nuit à Nairobi.",
    "signature": "Service Monde",
    "une": false,
    "corps": [
      "Les deux généraux rivaux ont signé dans la nuit de vendredi à samedi un cessez-le-feu à Nairobi, sous médiation de l'Union africaine. Les combats doivent cesser dimanche à l'aube.",
      "Le texte prévoit l'ouverture de corridors humanitaires vers les zones assiégées. Les ONG sur place restent prudentes après l'échec de trois trêves précédentes.",
      "Notre correspondante à Nairobi revient sur les négociations de la dernière chance."
    ]
  }
];
