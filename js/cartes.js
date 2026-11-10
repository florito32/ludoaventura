// Cartes JEU d'Aventura — GÉNÉRÉ par outils/cartes.py depuis « carte francais.xlsx » (feuilles « pack »).
// Ne pas modifier à la main : corriger le fichier Excel puis relancer le script.
(function (racine) {
  'use strict';
  var PACKS = [
  {
    "id": "mots-simples",
    "nom": "Mots simples",
    "niveaux": {
      "1": [
        "LE",
        "UNE",
        "SA",
        "SON",
        "DES",
        "SES",
        "AU",
        "JE",
        "ELLE",
        "ILS",
        "Y",
        "QUI",
        "DONT",
        "ET",
        "OU",
        "ENSUITE",
        "DANS",
        "CHEZ",
        "APRÈS",
        "PAR",
        "OÙ",
        "ICI",
        "TÔT",
        "BIEN",
        "SI",
        "NOTRE",
        "NOS",
        "MAMAN",
        "SŒUR",
        "TONTON"
      ],
      "2": [
        "LA",
        "MA",
        "MON",
        "CE",
        "MES",
        "CES",
        "QUEL",
        "TU",
        "NOUS",
        "ELLES",
        "TOUT",
        "QUE",
        "OUI",
        "CAR",
        "ALORS",
        "DE",
        "SUR",
        "ENTRE",
        "AVEC",
        "POUR",
        "QUAND",
        "PRÈS",
        "TOUJOURS",
        "TROP",
        "PLUS",
        "VOTRE",
        "VOS",
        "PAPA",
        "COUSIN",
        "COUSINE"
      ],
      "3": [
        "UN",
        "TA",
        "TON",
        "LES",
        "TES",
        "DU",
        "QUELLE",
        "IL",
        "VOUS",
        "EN",
        "ON",
        "QUOI",
        "NON",
        "MAIS",
        "PUIS",
        "À",
        "SOUS",
        "AVANT",
        "SANS",
        "COMME",
        "COMMENT",
        "TARD",
        "ENCORE",
        "TRÈS",
        "MOINS",
        "LEUR",
        "LEURS",
        "FRÈRE",
        "TANTE",
        "MOI"
      ]
    }
  },
  {
    "id": "mots-compliques",
    "nom": "Mots compliqués",
    "niveaux": {
      "1": [
        "PLUSIEURS",
        "PEUT-ÊTRE",
        "AUTOUR",
        "DESSUS",
        "VERS",
        "DEPUIS",
        "SAUF",
        "PARCE QUE",
        "AILLEURS",
        "CÔTE À CÔTE",
        "AUJOURD'HUI",
        "AVANT-HIER",
        "DÉJÀ",
        "HIER",
        "EN RETARD",
        "MAINTENANT",
        "SOUVENT",
        "AUSSI",
        "DAVANTAGE",
        "ENSEMBLE",
        "BRUSQUEMENT",
        "FACILEMENT",
        "SAGEMENT",
        "NE... PAS"
      ],
      "2": [
        "D’ACCORD",
        "DONC",
        "DERRIÈRE",
        "DEVANT",
        "DURANT",
        "AFIN",
        "DÈS QUE",
        "PENDANT QUE",
        "DEDANS",
        "LOIN",
        "AUSSITÔT",
        "BIENTÔT",
        "DEMAIN",
        "SOUS",
        "ENFIN",
        "QUELQUEFOIS",
        "TOUT À COUP",
        "AUTANT",
        "PRESQUE",
        "MIEUX",
        "EXACTEMENT",
        "HEUREUSEMENT",
        "SEULEMENT",
        "NE… JAMAIS"
      ],
      "3": [
        "HÉLAS",
        "POURTANT",
        "DESSOUS",
        "PARMI",
        "PENDANT",
        "MALGRÉ",
        "LORSQUE",
        "POURQUOI",
        "DEHORS",
        "PARTOUT",
        "AUTREFOIS",
        "D'ABORD",
        "EN CE MOMENT",
        "EN AVANCE",
        "LONGTEMPS",
        "SOUDAIN",
        "ASSEZ",
        "BEAUCOUP",
        "DEBOUT",
        "SINON",
        "DOUCEMENT",
        "LENTEMENT",
        "NE… GUÈRE",
        "NE… PLUS"
      ]
    }
  },
  {
    "id": "temps",
    "nom": "Jours et mois",
    "niveaux": {
      "1": [
        "LUNDI",
        "JEUDI",
        "DIMANCHE",
        "MOIS",
        "MARS",
        "JUIN",
        "SEPTEMBRE",
        "DÉCEMBRE"
      ],
      "2": [
        "MARDI",
        "VENDREDI",
        "JOUR",
        "JANVIER",
        "AVRIL",
        "JUILLET",
        "OCTOBRE",
        "ANNÉE"
      ],
      "3": [
        "MERCREDI",
        "SAMEDI",
        "SEMAINE",
        "FÉVRIER",
        "MAI",
        "AOÛT",
        "NOVEMBRE",
        "SIÈCLE"
      ]
    }
  },
  {
    "id": "numerique",
    "nom": "Nombres",
    "niveaux": {
      "1": [
        "ZÉRO",
        "TROIS",
        "SIX",
        "NEUF",
        "DOUZE",
        "QUINZE",
        "DIX-HUIT",
        "TRENTE",
        "SOIXANTE",
        "QUATRE-VINGT-DIX",
        "MILLIER",
        "UNITÉ"
      ],
      "2": [
        "UN",
        "QUATRE",
        "SEPT",
        "DIX",
        "TREIZE",
        "SEIZE",
        "DIX-NEUF",
        "QUARANTE",
        "SOIXANTE-DIX",
        "CENT",
        "MILLION",
        "DIZAINE"
      ],
      "3": [
        "DEUX",
        "CINQ",
        "HUIT",
        "ONZE",
        "QUATORZE",
        "DIX-SEPT",
        "VINGT",
        "CINQUANTE",
        "QUATRE-VINGT",
        "MILLE",
        "MILLIARD",
        "CENTAINE"
      ]
    }
  },
  {
    "id": "lettres",
    "nom": "Lettres",
    "niveaux": {
      "1": [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z"
      ],
      "2": [
        "AVION",
        "BALLON",
        "CHAT",
        "DOMINO",
        "ÉLÉPHANT",
        "FLEUR",
        "GIRAFE",
        "HIBOU",
        "ÎLE",
        "JARDIN",
        "KIWI",
        "LION",
        "MAISON",
        "NUAGE",
        "OLIVE",
        "POMME",
        "QUILLE",
        "RENARD",
        "SOLEIL",
        "TIGRE",
        "UNIVERS",
        "VÉLO",
        "WAGON",
        "XYLOPHONE",
        "YAOURT",
        "ZÈBRE"
      ],
      "3": [
        "ABEILLE",
        "BATEAU",
        "CHOCOLAT",
        "DINOSAURE",
        "ÉTOILE",
        "FORÊT",
        "GÂTEAU",
        "HABIT",
        "IMAGE",
        "JOUET",
        "KOALA",
        "LUNE",
        "MOTO",
        "NEIGE",
        "ORANGE",
        "PAPILLON",
        "QUATRE",
        "ROBOT",
        "SERPENT",
        "TRAIN",
        "USINE",
        "VOITURE",
        "WAPITI",
        "XÉNON",
        "YOGA",
        "ZOO"
      ]
    }
  },
  {
    "id": "animaux",
    "nom": "Animaux",
    "niveaux": {
      "1": [
        "CHIEN",
        "LAPIN",
        "OURS",
        "LOUP",
        "COQ",
        "VACHE",
        "POULE",
        "CANARD"
      ],
      "2": [
        "CHEVAL",
        "MOUTON",
        "TORTUE",
        "SINGE",
        "OISEAU",
        "CHÈVRE",
        "COCHON",
        "BALEINE"
      ],
      "3": [
        "CROCODILE",
        "ÉCUREUIL",
        "HIPPOPOTAME",
        "KANGOUROU",
        "PINGOUIN",
        "HÉRISSON",
        "PANTHÈRE",
        "GUÊPE"
      ]
    }
  },
  {
    "id": "lieux",
    "nom": "Lieux et constructions",
    "niveaux": {
      "1": [
        "MAISON",
        "PONT",
        "MUR",
        "TOUR",
        "GARE",
        "PORT",
        "PARC",
        "RUE"
      ],
      "2": [
        "ÉCOLE",
        "CHÂTEAU",
        "CABANE",
        "GRENIER",
        "MAGASIN",
        "VILLAGE",
        "CHEMIN",
        "FERME"
      ],
      "3": [
        "HÔPITAL",
        "BIBLIOTHÈQUE",
        "IMMEUBLE",
        "ÉGLISE",
        "MUSÉE",
        "BOULANGERIE",
        "PHARE",
        "AÉROPORT"
      ]
    }
  },
  {
    "id": "pays",
    "nom": "Pays",
    "niveaux": {
      "1": [
        "FRANCE",
        "ITALIE",
        "CHINE",
        "JAPON",
        "INDE",
        "MAROC",
        "PÉROU",
        "CHILI"
      ],
      "2": [
        "ESPAGNE",
        "BELGIQUE",
        "SUISSE",
        "CANADA",
        "BRÉSIL",
        "ÉGYPTE",
        "GRÈCE",
        "KENYA"
      ],
      "3": [
        "ALLEMAGNE",
        "ANGLETERRE",
        "PORTUGAL",
        "AUSTRALIE",
        "MEXIQUE",
        "ARGENTINE",
        "SÉNÉGAL",
        "NORVÈGE"
      ]
    }
  },
  {
    "id": "villes",
    "nom": "Villes",
    "niveaux": {
      "1": [
        "PARIS",
        "LYON",
        "NICE",
        "LILLE",
        "NANTES",
        "ROME",
        "BREST",
        "PAU"
      ],
      "2": [
        "MARSEILLE",
        "BORDEAUX",
        "TOULOUSE",
        "RENNES",
        "LONDRES",
        "BERLIN",
        "MADRID",
        "TOKYO"
      ],
      "3": [
        "STRASBOURG",
        "MONTPELLIER",
        "GRENOBLE",
        "PERPIGNAN",
        "BRUXELLES",
        "GENÈVE",
        "LISBONNE",
        "AMSTERDAM"
      ]
    }
  },
  {
    "id": "nature",
    "nom": "Paysages et nature",
    "niveaux": {
      "1": [
        "LAC",
        "MER",
        "BOIS",
        "CIEL",
        "FLEUR",
        "ARBRE",
        "PRÉ",
        "SABLE"
      ],
      "2": [
        "FORÊT",
        "PLAGE",
        "RIVIÈRE",
        "COLLINE",
        "DÉSERT",
        "VOLCAN",
        "OCÉAN",
        "GROTTE"
      ],
      "3": [
        "MONTAGNE",
        "CASCADE",
        "FALAISE",
        "MARÉCAGE",
        "PRAIRIE",
        "GLACIER",
        "ROCHER",
        "VALLÉE"
      ]
    }
  },
  {
    "id": "meteo",
    "nom": "Météo et saisons",
    "niveaux": {
      "1": [
        "PLUIE",
        "VENT",
        "NEIGE",
        "ÉTÉ",
        "FROID",
        "CHAUD",
        "GEL",
        "SOLEIL"
      ],
      "2": [
        "NUAGE",
        "ORAGE",
        "HIVER",
        "AUTOMNE",
        "BROUILLARD",
        "TEMPÊTE",
        "ÉCLAIR",
        "CHALEUR"
      ],
      "3": [
        "PRINTEMPS",
        "ARC-EN-CIEL",
        "TONNERRE",
        "GRÊLE",
        "VERGLAS",
        "TEMPÉRATURE",
        "AVERSE",
        "ROSÉE"
      ]
    }
  },
  {
    "id": "corps",
    "nom": "Le corps",
    "niveaux": {
      "1": [
        "TÊTE",
        "MAIN",
        "PIED",
        "BRAS",
        "NEZ",
        "DOS",
        "COU",
        "DENT"
      ],
      "2": [
        "JAMBE",
        "OREILLE",
        "GENOU",
        "ÉPAULE",
        "CHEVEUX",
        "VENTRE",
        "BOUCHE",
        "DOIGT"
      ],
      "3": [
        "ESTOMAC",
        "POIGNET",
        "CHEVILLE",
        "PAUPIÈRE",
        "MOLLET",
        "POUMON",
        "SQUELETTE",
        "COUDE"
      ]
    }
  },
  {
    "id": "aliments",
    "nom": "Aliments",
    "niveaux": {
      "1": [
        "PAIN",
        "LAIT",
        "RIZ",
        "POIRE",
        "SOUPE",
        "MIEL",
        "JUS",
        "SEL"
      ],
      "2": [
        "FROMAGE",
        "CAROTTE",
        "CERISE",
        "BANANE",
        "TOMATE",
        "BEURRE",
        "SALADE",
        "POULET"
      ],
      "3": [
        "CHAMPIGNON",
        "CONCOMBRE",
        "AUBERGINE",
        "FRAMBOISE",
        "ÉPINARD",
        "CITROUILLE",
        "HARICOT",
        "ANANAS"
      ]
    }
  },
  {
    "id": "maison",
    "nom": "Dans la maison",
    "niveaux": {
      "1": [
        "LIT",
        "TABLE",
        "LAMPE",
        "PORTE",
        "TAPIS",
        "BOL",
        "VERRE",
        "FOUR"
      ],
      "2": [
        "CHAISE",
        "FENÊTRE",
        "ARMOIRE",
        "ESCALIER",
        "CUISINE",
        "PLACARD",
        "COUSSIN",
        "MIROIR"
      ],
      "3": [
        "RÉFRIGÉRATEUR",
        "BAIGNOIRE",
        "CHEMINÉE",
        "ÉTAGÈRE",
        "CASSEROLE",
        "OREILLER",
        "TIROIR",
        "ASPIRATEUR"
      ]
    }
  },
  {
    "id": "vetements",
    "nom": "Vêtements",
    "niveaux": {
      "1": [
        "PULL",
        "ROBE",
        "JUPE",
        "GANT",
        "BOTTE",
        "BONNET",
        "VESTE",
        "CAPE"
      ],
      "2": [
        "CHAPEAU",
        "MANTEAU",
        "PANTALON",
        "CHAUSSETTE",
        "ÉCHARPE",
        "CHEMISE",
        "CEINTURE",
        "PYJAMA"
      ],
      "3": [
        "BLOUSON",
        "IMPERMÉABLE",
        "SANDALE",
        "CASQUETTE",
        "SALOPETTE",
        "MAILLOT",
        "PANTOUFLE",
        "CHAUSSURE"
      ]
    }
  },
  {
    "id": "ecole",
    "nom": "L’école",
    "niveaux": {
      "1": [
        "LIVRE",
        "COLLE",
        "GOMME",
        "CRAIE",
        "CLASSE",
        "STYLO",
        "SAC",
        "AMI"
      ],
      "2": [
        "CAHIER",
        "CRAYON",
        "RÈGLE",
        "TROUSSE",
        "CARTABLE",
        "TABLEAU",
        "CISEAUX",
        "MAÎTRE"
      ],
      "3": [
        "RÉCRÉATION",
        "MAÎTRESSE",
        "DICTIONNAIRE",
        "COMPAS",
        "PINCEAU",
        "FEUTRE",
        "ÉQUERRE",
        "BUREAU"
      ]
    }
  },
  {
    "id": "metiers",
    "nom": "Métiers",
    "niveaux": {
      "1": [
        "CHEF",
        "JUGE",
        "PILOTE",
        "MAÇON",
        "FERMIER",
        "POMPIER",
        "PEINTRE",
        "FACTEUR"
      ],
      "2": [
        "BOULANGER",
        "MÉDECIN",
        "COIFFEUR",
        "JARDINIER",
        "INFIRMIER",
        "CUISINIER",
        "BOUCHER",
        "DENTISTE"
      ],
      "3": [
        "VÉTÉRINAIRE",
        "ARCHITECTE",
        "PHARMACIEN",
        "POLICIER",
        "CHIRURGIEN",
        "ASTRONAUTE",
        "MENUISIER",
        "ÉLECTRICIEN"
      ]
    }
  },
  {
    "id": "transports",
    "nom": "Transports",
    "niveaux": {
      "1": [
        "BUS",
        "TRAIN",
        "VÉLO",
        "LUGE",
        "TAXI",
        "TRAM",
        "AUTO",
        "MOTO"
      ],
      "2": [
        "VOITURE",
        "AVION",
        "BATEAU",
        "CAMION",
        "MÉTRO",
        "FUSÉE",
        "TRACTEUR",
        "BARQUE"
      ],
      "3": [
        "HÉLICOPTÈRE",
        "AMBULANCE",
        "MONTGOLFIÈRE",
        "TROTTINETTE",
        "SOUS-MARIN",
        "PAQUEBOT",
        "TÉLÉPHÉRIQUE",
        "AUTOBUS"
      ]
    }
  },
  {
    "id": "couleurs",
    "nom": "Couleurs et formes",
    "niveaux": {
      "1": [
        "ROUGE",
        "BLEU",
        "VERT",
        "NOIR",
        "GRIS",
        "ROSE",
        "ROND",
        "BLANC"
      ],
      "2": [
        "JAUNE",
        "VIOLET",
        "ORANGE",
        "MARRON",
        "CARRÉ",
        "CERCLE",
        "LIGNE",
        "POINT"
      ],
      "3": [
        "TRIANGLE",
        "RECTANGLE",
        "LOSANGE",
        "TURQUOISE",
        "BEIGE",
        "OVALE",
        "CYLINDRE",
        "DORÉ"
      ]
    }
  },
  {
    "id": "loisirs",
    "nom": "Sports et musique",
    "niveaux": {
      "1": [
        "JUDO",
        "SKI",
        "DANSE",
        "BALLE",
        "PIANO",
        "FLÛTE",
        "CHANT",
        "COURSE"
      ],
      "2": [
        "TENNIS",
        "FOOTBALL",
        "NATATION",
        "GUITARE",
        "TAMBOUR",
        "VIOLON",
        "TROMPETTE",
        "ESCRIME"
      ],
      "3": [
        "GYMNASTIQUE",
        "ÉQUITATION",
        "BASKET",
        "ESCALADE",
        "BATTERIE",
        "ACCORDÉON",
        "XYLOPHONE",
        "HARPE"
      ]
    }
  }
];
  // Pour chaque mot : syllabes écrites, positions des lettres muettes (null = question non posée), nombre de lettres,
  // genre (m / f, null = pas un nom), pluriel (null = question non posée), elision (on dit « l' » devant le mot).
  var INFOS = {"LE": {"syllabes": "LE", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "UNE": {"syllabes": "U-NE", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "SA": {"syllabes": "SA", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "SON": {"syllabes": "SON", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "DES": {"syllabes": "DES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "SES": {"syllabes": "SES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "AU": {"syllabes": "AU", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "JE": {"syllabes": "JE", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "ELLE": {"syllabes": "EL-LE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ILS": {"syllabes": "ILS", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "Y": {"syllabes": "Y", "muettes": [], "lettres": 1, "genre": null, "pluriel": null, "elision": null}, "QUI": {"syllabes": "QUI", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "DONT": {"syllabes": "DONT", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ET": {"syllabes": "ET", "muettes": [1], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "OU": {"syllabes": "OU", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "ENSUITE": {"syllabes": "EN-SUI-TE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "DANS": {"syllabes": "DANS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "CHEZ": {"syllabes": "CHEZ", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "APRÈS": {"syllabes": "A-PRÈS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "PAR": {"syllabes": "PAR", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "OÙ": {"syllabes": "OÙ", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "ICI": {"syllabes": "I-CI", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "TÔT": {"syllabes": "TÔT", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "BIEN": {"syllabes": "BIEN", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "SI": {"syllabes": "SI", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "NOTRE": {"syllabes": "NO-TRE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "NOS": {"syllabes": "NOS", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "MAMAN": {"syllabes": "MA-MAN", "muettes": [], "lettres": 5, "genre": "f", "pluriel": "MAMANS", "elision": false}, "SŒUR": {"syllabes": "SŒUR", "muettes": [], "lettres": null, "genre": "f", "pluriel": "SŒURS", "elision": false}, "TONTON": {"syllabes": "TON-TON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "TONTONS", "elision": false}, "LA": {"syllabes": "LA", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "MA": {"syllabes": "MA", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "MON": {"syllabes": "MON", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "CE": {"syllabes": "CE", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "MES": {"syllabes": "MES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "CES": {"syllabes": "CES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "QUEL": {"syllabes": "QUEL", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "TU": {"syllabes": "TU", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "NOUS": {"syllabes": "NOUS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ELLES": {"syllabes": "EL-LES", "muettes": [3, 4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "TOUT": {"syllabes": "TOUT", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "QUE": {"syllabes": "QUE", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "OUI": {"syllabes": "OUI", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "CAR": {"syllabes": "CAR", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "ALORS": {"syllabes": "A-LORS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "DE": {"syllabes": "DE", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "SUR": {"syllabes": "SUR", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "ENTRE": {"syllabes": "EN-TRE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "AVEC": {"syllabes": "A-VEC", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "POUR": {"syllabes": "POUR", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "QUAND": {"syllabes": "QUAND", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "PRÈS": {"syllabes": "PRÈS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "TOUJOURS": {"syllabes": "TOU-JOURS", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "TROP": {"syllabes": "TROP", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "PLUS": {"syllabes": "PLUS", "muettes": null, "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "VOTRE": {"syllabes": "VO-TRE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "VOS": {"syllabes": "VOS", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "PAPA": {"syllabes": "PA-PA", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "PAPAS", "elision": false}, "COUSIN": {"syllabes": "COU-SIN", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "COUSINS", "elision": false}, "COUSINE": {"syllabes": "COU-SI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "COUSINES", "elision": false}, "UN": {"syllabes": "UN", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "TA": {"syllabes": "TA", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "TON": {"syllabes": "TON", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "LES": {"syllabes": "LES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "TES": {"syllabes": "TES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "DU": {"syllabes": "DU", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "QUELLE": {"syllabes": "QUEL-LE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "IL": {"syllabes": "IL", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "VOUS": {"syllabes": "VOUS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "EN": {"syllabes": "EN", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "ON": {"syllabes": "ON", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "QUOI": {"syllabes": "QUOI", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "NON": {"syllabes": "NON", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "MAIS": {"syllabes": "MAIS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "PUIS": {"syllabes": "PUIS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "À": {"syllabes": "À", "muettes": [], "lettres": 1, "genre": null, "pluriel": null, "elision": null}, "SOUS": {"syllabes": "SOUS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "AVANT": {"syllabes": "A-VANT", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "SANS": {"syllabes": "SANS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "COMME": {"syllabes": "COM-ME", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "COMMENT": {"syllabes": "COM-MENT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "TARD": {"syllabes": "TARD", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ENCORE": {"syllabes": "EN-CO-RE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "TRÈS": {"syllabes": "TRÈS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "MOINS": {"syllabes": "MOINS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "LEUR": {"syllabes": "LEUR", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "LEURS": {"syllabes": "LEURS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "FRÈRE": {"syllabes": "FRÈ-RE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "FRÈRES", "elision": false}, "TANTE": {"syllabes": "TAN-TE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "TANTES", "elision": false}, "MOI": {"syllabes": "MOI", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "PLUSIEURS": {"syllabes": "PLU-SIEURS", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "PEUT-ÊTRE": {"syllabes": "PEUT-Ê-TRE", "muettes": [3, 8], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "AUTOUR": {"syllabes": "AU-TOUR", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "DESSUS": {"syllabes": "DES-SUS", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "VERS": {"syllabes": "VERS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DEPUIS": {"syllabes": "DE-PUIS", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SAUF": {"syllabes": "SAUF", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "PARCE QUE": {"syllabes": "PAR-CE QUE", "muettes": [4], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "AILLEURS": {"syllabes": "AIL-LEURS", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "CÔTE À CÔTE": {"syllabes": "CÔ-TE À CÔ-TE", "muettes": [3, 10], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "AUJOURD'HUI": {"syllabes": "AU-JOUR-D'HUI", "muettes": [8], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "AVANT-HIER": {"syllabes": "A-VANT-HIER", "muettes": [6], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "DÉJÀ": {"syllabes": "DÉ-JÀ", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "HIER": {"syllabes": "HIER", "muettes": [0], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "EN RETARD": {"syllabes": "EN RE-TARD", "muettes": [8], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "MAINTENANT": {"syllabes": "MAIN-TE-NANT", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "SOUVENT": {"syllabes": "SOU-VENT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "AUSSI": {"syllabes": "AUS-SI", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "DAVANTAGE": {"syllabes": "DA-VAN-TA-GE", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "ENSEMBLE": {"syllabes": "EN-SEM-BLE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "BRUSQUEMENT": {"syllabes": "BRUS-QUE-MENT", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "FACILEMENT": {"syllabes": "FA-CI-LE-MENT", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "SAGEMENT": {"syllabes": "SA-GE-MENT", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "NE... PAS": {"syllabes": "NE... PAS", "muettes": [8], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "D’ACCORD": {"syllabes": "D’AC-CORD", "muettes": [7], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "DONC": {"syllabes": "DONC", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DERRIÈRE": {"syllabes": "DER-RIÈ-RE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DEVANT": {"syllabes": "DE-VANT", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "DURANT": {"syllabes": "DU-RANT", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "AFIN": {"syllabes": "A-FIN", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DÈS QUE": {"syllabes": "DÈS QUE", "muettes": [2], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "PENDANT QUE": {"syllabes": "PEN-DANT QUE", "muettes": [6], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "DEDANS": {"syllabes": "DE-DANS", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "LOIN": {"syllabes": "LOIN", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "AUSSITÔT": {"syllabes": "AUS-SI-TÔT", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "BIENTÔT": {"syllabes": "BIEN-TÔT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "DEMAIN": {"syllabes": "DE-MAIN", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "ENFIN": {"syllabes": "EN-FIN", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "QUELQUEFOIS": {"syllabes": "QUEL-QUE-FOIS", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "TOUT À COUP": {"syllabes": "TOUT À COUP", "muettes": [3, 10], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "AUTANT": {"syllabes": "AU-TANT", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "PRESQUE": {"syllabes": "PRES-QUE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "MIEUX": {"syllabes": "MIEUX", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "EXACTEMENT": {"syllabes": "E-XAC-TE-MENT", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "HEUREUSEMENT": {"syllabes": "HEU-REU-SE-MENT", "muettes": [0, 11], "lettres": 12, "genre": null, "pluriel": null, "elision": null}, "SEULEMENT": {"syllabes": "SEU-LE-MENT", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "NE… JAMAIS": {"syllabes": "NE… JA-MAIS", "muettes": [9], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "HÉLAS": {"syllabes": "HÉ-LAS", "muettes": [0], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "POURTANT": {"syllabes": "POUR-TANT", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DESSOUS": {"syllabes": "DES-SOUS", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "PARMI": {"syllabes": "PAR-MI", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "PENDANT": {"syllabes": "PEN-DANT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "MALGRÉ": {"syllabes": "MAL-GRÉ", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "LORSQUE": {"syllabes": "LORS-QUE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "POURQUOI": {"syllabes": "POUR-QUOI", "muettes": [], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DEHORS": {"syllabes": "DE-HORS", "muettes": [2, 5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "PARTOUT": {"syllabes": "PAR-TOUT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "AUTREFOIS": {"syllabes": "AU-TRE-FOIS", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "D'ABORD": {"syllabes": "D'A-BORD", "muettes": [6], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "EN CE MOMENT": {"syllabes": "EN CE MO-MENT", "muettes": [11], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "EN AVANCE": {"syllabes": "EN A-VAN-CE", "muettes": [8], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "LONGTEMPS": {"syllabes": "LONG-TEMPS", "muettes": [3, 7, 8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "SOUDAIN": {"syllabes": "SOU-DAIN", "muettes": [], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "ASSEZ": {"syllabes": "AS-SEZ", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "BEAUCOUP": {"syllabes": "BEAU-COUP", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DEBOUT": {"syllabes": "DE-BOUT", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SINON": {"syllabes": "SI-NON", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "DOUCEMENT": {"syllabes": "DOU-CE-MENT", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "LENTEMENT": {"syllabes": "LEN-TE-MENT", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "NE… GUÈRE": {"syllabes": "NE… GUÈ-RE", "muettes": [8], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "NE… PLUS": {"syllabes": "NE… PLUS", "muettes": [7], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "LUNDI": {"syllabes": "LUN-DI", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "LUNDIS", "elision": false}, "JEUDI": {"syllabes": "JEU-DI", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "JEUDIS", "elision": false}, "DIMANCHE": {"syllabes": "DI-MAN-CHE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "DIMANCHES", "elision": false}, "MOIS": {"syllabes": "MOIS", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "MOIS", "elision": false}, "MARS": {"syllabes": "MARS", "muettes": [], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "JUIN": {"syllabes": "JUIN", "muettes": [], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "SEPTEMBRE": {"syllabes": "SEP-TEM-BRE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": null, "elision": false}, "DÉCEMBRE": {"syllabes": "DÉ-CEM-BRE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "MARDI": {"syllabes": "MAR-DI", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "MARDIS", "elision": false}, "VENDREDI": {"syllabes": "VEN-DRE-DI", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "VENDREDIS", "elision": false}, "JOUR": {"syllabes": "JOUR", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "JOURS", "elision": false}, "JANVIER": {"syllabes": "JAN-VIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "AVRIL": {"syllabes": "A-VRIL", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": true}, "JUILLET": {"syllabes": "JUIL-LET", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "OCTOBRE": {"syllabes": "OC-TO-BRE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": true}, "ANNÉE": {"syllabes": "AN-NÉE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "ANNÉES", "elision": true}, "MERCREDI": {"syllabes": "MER-CRE-DI", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "MERCREDIS", "elision": false}, "SAMEDI": {"syllabes": "SA-ME-DI", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "SAMEDIS", "elision": false}, "SEMAINE": {"syllabes": "SE-MAI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "SEMAINES", "elision": false}, "FÉVRIER": {"syllabes": "FÉ-VRIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "MAI": {"syllabes": "MAI", "muettes": [], "lettres": 3, "genre": "m", "pluriel": null, "elision": false}, "AOÛT": {"syllabes": "AOÛT", "muettes": null, "lettres": 4, "genre": "m", "pluriel": null, "elision": true}, "NOVEMBRE": {"syllabes": "NO-VEM-BRE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "SIÈCLE": {"syllabes": "SIÈ-CLE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "SIÈCLES", "elision": false}, "ZÉRO": {"syllabes": "ZÉ-RO", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "TROIS": {"syllabes": "TROIS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "SIX": {"syllabes": "SIX", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "NEUF": {"syllabes": "NEUF", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DOUZE": {"syllabes": "DOU-ZE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "QUINZE": {"syllabes": "QUIN-ZE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "DIX-HUIT": {"syllabes": "DIX-HUIT", "muettes": [4], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "TRENTE": {"syllabes": "TREN-TE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SOIXANTE": {"syllabes": "SOI-XAN-TE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "QUATRE-VINGT-DIX": {"syllabes": "QUA-TRE-VINGT-DIX", "muettes": [5, 10, 11], "lettres": 14, "genre": null, "pluriel": null, "elision": null}, "MILLIER": {"syllabes": "MIL-LIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "MILLIERS", "elision": false}, "UNITÉ": {"syllabes": "U-NI-TÉ", "muettes": [], "lettres": 5, "genre": "f", "pluriel": "UNITÉS", "elision": true}, "QUATRE": {"syllabes": "QUA-TRE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SEPT": {"syllabes": "SEPT", "muettes": [2], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DIX": {"syllabes": "DIX", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "TREIZE": {"syllabes": "TREI-ZE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SEIZE": {"syllabes": "SEI-ZE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "DIX-NEUF": {"syllabes": "DIX-NEUF", "muettes": [], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "QUARANTE": {"syllabes": "QUA-RAN-TE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "SOIXANTE-DIX": {"syllabes": "SOI-XAN-TE-DIX", "muettes": [7], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "CENT": {"syllabes": "CENT", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "MILLION": {"syllabes": "MIL-LION", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "MILLIONS", "elision": false}, "DIZAINE": {"syllabes": "DI-ZAI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "DIZAINES", "elision": false}, "DEUX": {"syllabes": "DEUX", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "CINQ": {"syllabes": "CINQ", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "HUIT": {"syllabes": "HUIT", "muettes": [0], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ONZE": {"syllabes": "ON-ZE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "QUATORZE": {"syllabes": "QUA-TOR-ZE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DIX-SEPT": {"syllabes": "DIX-SEPT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "VINGT": {"syllabes": "VINGT", "muettes": [3, 4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "CINQUANTE": {"syllabes": "CIN-QUAN-TE", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "QUATRE-VINGT": {"syllabes": "QUA-TRE-VINGT", "muettes": [5, 10, 11], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "MILLE": {"syllabes": "MIL-LE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "MILLIARD": {"syllabes": "MIL-LIARD", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "MILLIARDS", "elision": false}, "CENTAINE": {"syllabes": "CEN-TAI-NE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "CENTAINES", "elision": false}, "AVION": {"syllabes": "A-VION", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "AVIONS", "elision": true}, "BALLON": {"syllabes": "BAL-LON", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "CHAT": {"syllabes": "CHAT", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DOMINO": {"syllabes": "DO-MI-NO", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "ÉLÉPHANT": {"syllabes": "É-LÉ-PHANT", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "FLEUR": {"syllabes": "FLEUR", "muettes": [], "lettres": 5, "genre": "f", "pluriel": "FLEURS", "elision": false}, "GIRAFE": {"syllabes": "GI-RA-FE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "HIBOU": {"syllabes": "HI-BOU", "muettes": [0], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "ÎLE": {"syllabes": "Î-LE", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "JARDIN": {"syllabes": "JAR-DIN", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "KIWI": {"syllabes": "KI-WI", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "LION": {"syllabes": "LI-ON", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "MAISON": {"syllabes": "MAI-SON", "muettes": [], "lettres": 6, "genre": "f", "pluriel": "MAISONS", "elision": false}, "NUAGE": {"syllabes": "NU-A-GE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "NUAGES", "elision": false}, "OLIVE": {"syllabes": "O-LI-VE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "POMME": {"syllabes": "POM-ME", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "QUILLE": {"syllabes": "QUIL-LE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "RENARD": {"syllabes": "RE-NARD", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SOLEIL": {"syllabes": "SO-LEIL", "muettes": [], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "TIGRE": {"syllabes": "TI-GRE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "UNIVERS": {"syllabes": "U-NI-VERS", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "VÉLO": {"syllabes": "VÉ-LO", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "VÉLOS", "elision": false}, "WAGON": {"syllabes": "WA-GON", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "XYLOPHONE": {"syllabes": "XY-LO-PHO-NE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "XYLOPHONES", "elision": false}, "YAOURT": {"syllabes": "YA-OURT", "muettes": null, "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "ZÈBRE": {"syllabes": "ZÈ-BRE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "ABEILLE": {"syllabes": "A-BEIL-LE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "BATEAU": {"syllabes": "BA-TEAU", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "BATEAUX", "elision": false}, "CHOCOLAT": {"syllabes": "CHO-CO-LAT", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DINOSAURE": {"syllabes": "DI-NO-SAU-RE", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "ÉTOILE": {"syllabes": "É-TOI-LE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "FORÊT": {"syllabes": "FO-RÊT", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "FORÊTS", "elision": false}, "GÂTEAU": {"syllabes": "GÂ-TEAU", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "HABIT": {"syllabes": "HA-BIT", "muettes": [0, 4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "IMAGE": {"syllabes": "I-MA-GE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "JOUET": {"syllabes": "JOU-ET", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "KOALA": {"syllabes": "KO-A-LA", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "LUNE": {"syllabes": "LU-NE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "MOTO": {"syllabes": "MO-TO", "muettes": [], "lettres": 4, "genre": "f", "pluriel": "MOTOS", "elision": false}, "NEIGE": {"syllabes": "NEI-GE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "ORANGE": {"syllabes": "O-RAN-GE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "PAPILLON": {"syllabes": "PA-PIL-LON", "muettes": [], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "ROBOT": {"syllabes": "RO-BOT", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "SERPENT": {"syllabes": "SER-PENT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "TRAIN": {"syllabes": "TRAIN", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "TRAINS", "elision": false}, "USINE": {"syllabes": "U-SI-NE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "VOITURE": {"syllabes": "VOI-TU-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "VOITURES", "elision": false}, "WAPITI": {"syllabes": "WA-PI-TI", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "XÉNON": {"syllabes": "XÉ-NON", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "YOGA": {"syllabes": "YO-GA", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ZOO": {"syllabes": "ZOO", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "CHIEN": {"syllabes": "CHIEN", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "CHIENS", "elision": false}, "LAPIN": {"syllabes": "LA-PIN", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "LAPINS", "elision": false}, "OURS": {"syllabes": "OURS", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "OURS", "elision": true}, "LOUP": {"syllabes": "LOUP", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "LOUPS", "elision": false}, "COQ": {"syllabes": "COQ", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "COQS", "elision": false}, "VACHE": {"syllabes": "VA-CHE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "VACHES", "elision": false}, "POULE": {"syllabes": "POU-LE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "POULES", "elision": false}, "CANARD": {"syllabes": "CA-NARD", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "CANARDS", "elision": false}, "CHEVAL": {"syllabes": "CHE-VAL", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "CHEVAUX", "elision": false}, "MOUTON": {"syllabes": "MOU-TON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "MOUTONS", "elision": false}, "TORTUE": {"syllabes": "TOR-TUE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "TORTUES", "elision": false}, "SINGE": {"syllabes": "SIN-GE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "SINGES", "elision": false}, "OISEAU": {"syllabes": "OI-SEAU", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "OISEAUX", "elision": true}, "CHÈVRE": {"syllabes": "CHÈ-VRE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "CHÈVRES", "elision": false}, "COCHON": {"syllabes": "CO-CHON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "COCHONS", "elision": false}, "BALEINE": {"syllabes": "BA-LEI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "BALEINES", "elision": false}, "CROCODILE": {"syllabes": "CRO-CO-DI-LE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "CROCODILES", "elision": false}, "ÉCUREUIL": {"syllabes": "É-CU-REUIL", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "ÉCUREUILS", "elision": true}, "HIPPOPOTAME": {"syllabes": "HIP-PO-PO-TA-ME", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "HIPPOPOTAMES", "elision": true}, "KANGOUROU": {"syllabes": "KAN-GOU-ROU", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "KANGOUROUS", "elision": false}, "PINGOUIN": {"syllabes": "PIN-GOUIN", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "PINGOUINS", "elision": false}, "HÉRISSON": {"syllabes": "HÉ-RIS-SON", "muettes": [0], "lettres": 8, "genre": "m", "pluriel": "HÉRISSONS", "elision": false}, "PANTHÈRE": {"syllabes": "PAN-THÈ-RE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "PANTHÈRES", "elision": false}, "GUÊPE": {"syllabes": "GUÊ-PE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "GUÊPES", "elision": false}, "PONT": {"syllabes": "PONT", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "PONTS", "elision": false}, "MUR": {"syllabes": "MUR", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "MURS", "elision": false}, "TOUR": {"syllabes": "TOUR", "muettes": [], "lettres": 4, "genre": "f", "pluriel": "TOURS", "elision": false}, "GARE": {"syllabes": "GA-RE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "GARES", "elision": false}, "PORT": {"syllabes": "PORT", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "PORTS", "elision": false}, "PARC": {"syllabes": "PARC", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "PARCS", "elision": false}, "RUE": {"syllabes": "RUE", "muettes": [2], "lettres": 3, "genre": "f", "pluriel": "RUES", "elision": false}, "ÉCOLE": {"syllabes": "É-CO-LE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "ÉCOLES", "elision": true}, "CHÂTEAU": {"syllabes": "CHÂ-TEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "CHÂTEAUX", "elision": false}, "CABANE": {"syllabes": "CA-BA-NE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "CABANES", "elision": false}, "GRENIER": {"syllabes": "GRE-NIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "GRENIERS", "elision": false}, "MAGASIN": {"syllabes": "MA-GA-SIN", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "MAGASINS", "elision": false}, "VILLAGE": {"syllabes": "VIL-LA-GE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "VILLAGES", "elision": false}, "CHEMIN": {"syllabes": "CHE-MIN", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "CHEMINS", "elision": false}, "FERME": {"syllabes": "FER-ME", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "FERMES", "elision": false}, "HÔPITAL": {"syllabes": "HÔ-PI-TAL", "muettes": [0], "lettres": 7, "genre": "m", "pluriel": "HÔPITAUX", "elision": true}, "BIBLIOTHÈQUE": {"syllabes": "BI-BLI-O-THÈ-QUE", "muettes": [11], "lettres": 12, "genre": "f", "pluriel": "BIBLIOTHÈQUES", "elision": false}, "IMMEUBLE": {"syllabes": "IM-MEU-BLE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "IMMEUBLES", "elision": true}, "ÉGLISE": {"syllabes": "É-GLI-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "ÉGLISES", "elision": true}, "MUSÉE": {"syllabes": "MU-SÉE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "MUSÉES", "elision": false}, "BOULANGERIE": {"syllabes": "BOU-LAN-GE-RIE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": "BOULANGERIES", "elision": false}, "PHARE": {"syllabes": "PHA-RE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "PHARES", "elision": false}, "AÉROPORT": {"syllabes": "A-É-RO-PORT", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "AÉROPORTS", "elision": true}, "FRANCE": {"syllabes": "FRAN-CE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": null, "elision": false}, "ITALIE": {"syllabes": "I-TA-LIE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": null, "elision": true}, "CHINE": {"syllabes": "CHI-NE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "JAPON": {"syllabes": "JA-PON", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "INDE": {"syllabes": "IN-DE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": null, "elision": true}, "MAROC": {"syllabes": "MA-ROC", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "PÉROU": {"syllabes": "PÉ-ROU", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "CHILI": {"syllabes": "CHI-LI", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "ESPAGNE": {"syllabes": "ES-PA-GNE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": null, "elision": true}, "BELGIQUE": {"syllabes": "BEL-GI-QUE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": null, "elision": false}, "SUISSE": {"syllabes": "SUIS-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": null, "elision": false}, "CANADA": {"syllabes": "CA-NA-DA", "muettes": [], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "BRÉSIL": {"syllabes": "BRÉ-SIL", "muettes": [], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "ÉGYPTE": {"syllabes": "É-GYP-TE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": null, "elision": true}, "GRÈCE": {"syllabes": "GRÈ-CE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "KENYA": {"syllabes": "KE-NYA", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "ALLEMAGNE": {"syllabes": "AL-LE-MA-GNE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": null, "elision": true}, "ANGLETERRE": {"syllabes": "AN-GLE-TER-RE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": null, "elision": true}, "PORTUGAL": {"syllabes": "POR-TU-GAL", "muettes": [], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "AUSTRALIE": {"syllabes": "AUS-TRA-LIE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": null, "elision": true}, "MEXIQUE": {"syllabes": "ME-XI-QUE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "ARGENTINE": {"syllabes": "AR-GEN-TI-NE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": null, "elision": true}, "SÉNÉGAL": {"syllabes": "SÉ-NÉ-GAL", "muettes": [], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "NORVÈGE": {"syllabes": "NOR-VÈ-GE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": null, "elision": false}, "PARIS": {"syllabes": "PA-RIS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "LYON": {"syllabes": "LY-ON", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "NICE": {"syllabes": "NI-CE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "LILLE": {"syllabes": "LIL-LE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "NANTES": {"syllabes": "NAN-TES", "muettes": [4, 5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "ROME": {"syllabes": "RO-ME", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "BREST": {"syllabes": "BREST", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "PAU": {"syllabes": "PAU", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "MARSEILLE": {"syllabes": "MAR-SEIL-LE", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "BORDEAUX": {"syllabes": "BOR-DEAUX", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "TOULOUSE": {"syllabes": "TOU-LOU-SE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "RENNES": {"syllabes": "REN-NES", "muettes": [4, 5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "LONDRES": {"syllabes": "LON-DRES", "muettes": [5, 6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "BERLIN": {"syllabes": "BER-LIN", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "MADRID": {"syllabes": "MA-DRID", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "TOKYO": {"syllabes": "TO-KYO", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "STRASBOURG": {"syllabes": "STRAS-BOURG", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "MONTPELLIER": {"syllabes": "MONT-PEL-LIER", "muettes": [3, 10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "GRENOBLE": {"syllabes": "GRE-NO-BLE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "PERPIGNAN": {"syllabes": "PER-PI-GNAN", "muettes": [], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "BRUXELLES": {"syllabes": "BRU-XEL-LES", "muettes": [7, 8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "GENÈVE": {"syllabes": "GE-NÈ-VE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "LISBONNE": {"syllabes": "LIS-BON-NE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "AMSTERDAM": {"syllabes": "AMS-TER-DAM", "muettes": [], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "LAC": {"syllabes": "LAC", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "LACS", "elision": false}, "MER": {"syllabes": "MER", "muettes": [], "lettres": 3, "genre": "f", "pluriel": "MERS", "elision": false}, "BOIS": {"syllabes": "BOIS", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "BOIS", "elision": false}, "CIEL": {"syllabes": "CIEL", "muettes": [], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "ARBRE": {"syllabes": "AR-BRE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "ARBRES", "elision": true}, "PRÉ": {"syllabes": "PRÉ", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "PRÉS", "elision": false}, "SABLE": {"syllabes": "SA-BLE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "PLAGE": {"syllabes": "PLA-GE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "PLAGES", "elision": false}, "RIVIÈRE": {"syllabes": "RI-VIÈ-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "RIVIÈRES", "elision": false}, "COLLINE": {"syllabes": "COL-LI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "COLLINES", "elision": false}, "DÉSERT": {"syllabes": "DÉ-SERT", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "DÉSERTS", "elision": false}, "VOLCAN": {"syllabes": "VOL-CAN", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "VOLCANS", "elision": false}, "OCÉAN": {"syllabes": "O-CÉ-AN", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "OCÉANS", "elision": true}, "GROTTE": {"syllabes": "GROT-TE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "GROTTES", "elision": false}, "MONTAGNE": {"syllabes": "MON-TA-GNE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "MONTAGNES", "elision": false}, "CASCADE": {"syllabes": "CAS-CA-DE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "CASCADES", "elision": false}, "FALAISE": {"syllabes": "FA-LAI-SE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "FALAISES", "elision": false}, "MARÉCAGE": {"syllabes": "MA-RÉ-CA-GE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "MARÉCAGES", "elision": false}, "PRAIRIE": {"syllabes": "PRAI-RIE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "PRAIRIES", "elision": false}, "GLACIER": {"syllabes": "GLA-CIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "GLACIERS", "elision": false}, "ROCHER": {"syllabes": "RO-CHER", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "ROCHERS", "elision": false}, "VALLÉE": {"syllabes": "VAL-LÉE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "VALLÉES", "elision": false}, "PLUIE": {"syllabes": "PLUIE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "PLUIES", "elision": false}, "VENT": {"syllabes": "VENT", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "VENTS", "elision": false}, "ÉTÉ": {"syllabes": "É-TÉ", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "ÉTÉS", "elision": true}, "FROID": {"syllabes": "FROID", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "CHAUD": {"syllabes": "CHAUD", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "GEL": {"syllabes": "GEL", "muettes": [], "lettres": 3, "genre": "m", "pluriel": null, "elision": false}, "ORAGE": {"syllabes": "O-RA-GE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "ORAGES", "elision": true}, "HIVER": {"syllabes": "HI-VER", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "HIVERS", "elision": true}, "AUTOMNE": {"syllabes": "AU-TOM-NE", "muettes": [4, 6], "lettres": 7, "genre": "m", "pluriel": "AUTOMNES", "elision": true}, "BROUILLARD": {"syllabes": "BROUIL-LARD", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": null, "elision": false}, "TEMPÊTE": {"syllabes": "TEM-PÊ-TE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "TEMPÊTES", "elision": false}, "ÉCLAIR": {"syllabes": "É-CLAIR", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "ÉCLAIRS", "elision": true}, "CHALEUR": {"syllabes": "CHA-LEUR", "muettes": [], "lettres": 7, "genre": "f", "pluriel": null, "elision": false}, "PRINTEMPS": {"syllabes": "PRIN-TEMPS", "muettes": [7, 8], "lettres": 9, "genre": "m", "pluriel": "PRINTEMPS", "elision": false}, "ARC-EN-CIEL": {"syllabes": "ARC-EN-CIEL", "muettes": [], "lettres": 9, "genre": "m", "pluriel": null, "elision": true}, "TONNERRE": {"syllabes": "TON-NER-RE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "GRÊLE": {"syllabes": "GRÊ-LE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "VERGLAS": {"syllabes": "VER-GLAS", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "TEMPÉRATURE": {"syllabes": "TEM-PÉ-RA-TU-RE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": "TEMPÉRATURES", "elision": false}, "AVERSE": {"syllabes": "A-VER-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "AVERSES", "elision": true}, "ROSÉE": {"syllabes": "RO-SÉE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "TÊTE": {"syllabes": "TÊ-TE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "TÊTES", "elision": false}, "MAIN": {"syllabes": "MAIN", "muettes": [], "lettres": 4, "genre": "f", "pluriel": "MAINS", "elision": false}, "PIED": {"syllabes": "PIED", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "PIEDS", "elision": false}, "BRAS": {"syllabes": "BRAS", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "BRAS", "elision": false}, "NEZ": {"syllabes": "NEZ", "muettes": [2], "lettres": 3, "genre": "m", "pluriel": "NEZ", "elision": false}, "DOS": {"syllabes": "DOS", "muettes": [2], "lettres": 3, "genre": "m", "pluriel": "DOS", "elision": false}, "COU": {"syllabes": "COU", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "COUS", "elision": false}, "DENT": {"syllabes": "DENT", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "DENTS", "elision": false}, "JAMBE": {"syllabes": "JAM-BE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "JAMBES", "elision": false}, "OREILLE": {"syllabes": "O-REIL-LE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "OREILLES", "elision": true}, "GENOU": {"syllabes": "GE-NOU", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "GENOUX", "elision": false}, "ÉPAULE": {"syllabes": "É-PAU-LE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "ÉPAULES", "elision": true}, "CHEVEUX": {"syllabes": "CHE-VEUX", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "VENTRE": {"syllabes": "VEN-TRE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "VENTRES", "elision": false}, "BOUCHE": {"syllabes": "BOU-CHE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "BOUCHES", "elision": false}, "DOIGT": {"syllabes": "DOIGT", "muettes": [3, 4], "lettres": 5, "genre": "m", "pluriel": "DOIGTS", "elision": false}, "ESTOMAC": {"syllabes": "ES-TO-MAC", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "ESTOMACS", "elision": true}, "POIGNET": {"syllabes": "POI-GNET", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "POIGNETS", "elision": false}, "CHEVILLE": {"syllabes": "CHE-VIL-LE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "CHEVILLES", "elision": false}, "PAUPIÈRE": {"syllabes": "PAU-PIÈ-RE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "PAUPIÈRES", "elision": false}, "MOLLET": {"syllabes": "MOL-LET", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "MOLLETS", "elision": false}, "POUMON": {"syllabes": "POU-MON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "POUMONS", "elision": false}, "SQUELETTE": {"syllabes": "SQUE-LET-TE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "SQUELETTES", "elision": false}, "COUDE": {"syllabes": "COU-DE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "COUDES", "elision": false}, "PAIN": {"syllabes": "PAIN", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "PAINS", "elision": false}, "LAIT": {"syllabes": "LAIT", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "RIZ": {"syllabes": "RIZ", "muettes": [2], "lettres": 3, "genre": "m", "pluriel": null, "elision": false}, "POIRE": {"syllabes": "POI-RE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "POIRES", "elision": false}, "SOUPE": {"syllabes": "SOU-PE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "SOUPES", "elision": false}, "MIEL": {"syllabes": "MIEL", "muettes": [], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "JUS": {"syllabes": "JUS", "muettes": [2], "lettres": 3, "genre": "m", "pluriel": "JUS", "elision": false}, "SEL": {"syllabes": "SEL", "muettes": [], "lettres": 3, "genre": "m", "pluriel": null, "elision": false}, "FROMAGE": {"syllabes": "FRO-MA-GE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "FROMAGES", "elision": false}, "CAROTTE": {"syllabes": "CA-ROT-TE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "CAROTTES", "elision": false}, "CERISE": {"syllabes": "CE-RI-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "CERISES", "elision": false}, "BANANE": {"syllabes": "BA-NA-NE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "BANANES", "elision": false}, "TOMATE": {"syllabes": "TO-MA-TE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "TOMATES", "elision": false}, "BEURRE": {"syllabes": "BEUR-RE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "SALADE": {"syllabes": "SA-LA-DE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "SALADES", "elision": false}, "POULET": {"syllabes": "POU-LET", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "POULETS", "elision": false}, "CHAMPIGNON": {"syllabes": "CHAM-PI-GNON", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "CHAMPIGNONS", "elision": false}, "CONCOMBRE": {"syllabes": "CON-COM-BRE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "CONCOMBRES", "elision": false}, "AUBERGINE": {"syllabes": "AU-BER-GI-NE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "AUBERGINES", "elision": true}, "FRAMBOISE": {"syllabes": "FRAM-BOI-SE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "FRAMBOISES", "elision": false}, "ÉPINARD": {"syllabes": "É-PI-NARD", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": true}, "CITROUILLE": {"syllabes": "CI-TROUIL-LE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "CITROUILLES", "elision": false}, "HARICOT": {"syllabes": "HA-RI-COT", "muettes": [0, 6], "lettres": 7, "genre": "m", "pluriel": "HARICOTS", "elision": false}, "ANANAS": {"syllabes": "A-NA-NAS", "muettes": null, "lettres": 6, "genre": "m", "pluriel": "ANANAS", "elision": true}, "LIT": {"syllabes": "LIT", "muettes": [2], "lettres": 3, "genre": "m", "pluriel": "LITS", "elision": false}, "TABLE": {"syllabes": "TA-BLE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "TABLES", "elision": false}, "LAMPE": {"syllabes": "LAM-PE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "LAMPES", "elision": false}, "PORTE": {"syllabes": "POR-TE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "PORTES", "elision": false}, "TAPIS": {"syllabes": "TA-PIS", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "TAPIS", "elision": false}, "BOL": {"syllabes": "BOL", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "BOLS", "elision": false}, "VERRE": {"syllabes": "VER-RE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "VERRES", "elision": false}, "FOUR": {"syllabes": "FOUR", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "FOURS", "elision": false}, "CHAISE": {"syllabes": "CHAI-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "CHAISES", "elision": false}, "FENÊTRE": {"syllabes": "FE-NÊ-TRE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "FENÊTRES", "elision": false}, "ARMOIRE": {"syllabes": "AR-MOI-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "ARMOIRES", "elision": true}, "ESCALIER": {"syllabes": "ES-CA-LIER", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "ESCALIERS", "elision": true}, "CUISINE": {"syllabes": "CUI-SI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "CUISINES", "elision": false}, "PLACARD": {"syllabes": "PLA-CARD", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "PLACARDS", "elision": false}, "COUSSIN": {"syllabes": "COUS-SIN", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "COUSSINS", "elision": false}, "MIROIR": {"syllabes": "MI-ROIR", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "MIROIRS", "elision": false}, "RÉFRIGÉRATEUR": {"syllabes": "RÉ-FRI-GÉ-RA-TEUR", "muettes": [], "lettres": 13, "genre": "m", "pluriel": "RÉFRIGÉRATEURS", "elision": false}, "BAIGNOIRE": {"syllabes": "BAI-GNOI-RE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "BAIGNOIRES", "elision": false}, "CHEMINÉE": {"syllabes": "CHE-MI-NÉE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "CHEMINÉES", "elision": false}, "ÉTAGÈRE": {"syllabes": "É-TA-GÈ-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "ÉTAGÈRES", "elision": true}, "CASSEROLE": {"syllabes": "CAS-SE-RO-LE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "CASSEROLES", "elision": false}, "OREILLER": {"syllabes": "O-REIL-LER", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "OREILLERS", "elision": true}, "TIROIR": {"syllabes": "TI-ROIR", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "TIROIRS", "elision": false}, "ASPIRATEUR": {"syllabes": "AS-PI-RA-TEUR", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "ASPIRATEURS", "elision": true}, "PULL": {"syllabes": "PULL", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "PULLS", "elision": false}, "ROBE": {"syllabes": "RO-BE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "ROBES", "elision": false}, "JUPE": {"syllabes": "JU-PE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "JUPES", "elision": false}, "GANT": {"syllabes": "GANT", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "GANTS", "elision": false}, "BOTTE": {"syllabes": "BOT-TE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "BOTTES", "elision": false}, "BONNET": {"syllabes": "BON-NET", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "BONNETS", "elision": false}, "VESTE": {"syllabes": "VES-TE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "VESTES", "elision": false}, "CAPE": {"syllabes": "CA-PE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "CAPES", "elision": false}, "CHAPEAU": {"syllabes": "CHA-PEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "CHAPEAUX", "elision": false}, "MANTEAU": {"syllabes": "MAN-TEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "MANTEAUX", "elision": false}, "PANTALON": {"syllabes": "PAN-TA-LON", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "PANTALONS", "elision": false}, "CHAUSSETTE": {"syllabes": "CHAUS-SET-TE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "CHAUSSETTES", "elision": false}, "ÉCHARPE": {"syllabes": "É-CHAR-PE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "ÉCHARPES", "elision": true}, "CHEMISE": {"syllabes": "CHE-MI-SE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "CHEMISES", "elision": false}, "CEINTURE": {"syllabes": "CEIN-TU-RE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "CEINTURES", "elision": false}, "PYJAMA": {"syllabes": "PY-JA-MA", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "PYJAMAS", "elision": false}, "BLOUSON": {"syllabes": "BLOU-SON", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "BLOUSONS", "elision": false}, "IMPERMÉABLE": {"syllabes": "IM-PER-MÉ-A-BLE", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "IMPERMÉABLES", "elision": true}, "SANDALE": {"syllabes": "SAN-DA-LE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "SANDALES", "elision": false}, "CASQUETTE": {"syllabes": "CAS-QUET-TE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "CASQUETTES", "elision": false}, "SALOPETTE": {"syllabes": "SA-LO-PET-TE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "SALOPETTES", "elision": false}, "MAILLOT": {"syllabes": "MAIL-LOT", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "MAILLOTS", "elision": false}, "PANTOUFLE": {"syllabes": "PAN-TOU-FLE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "PANTOUFLES", "elision": false}, "CHAUSSURE": {"syllabes": "CHAUS-SU-RE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "CHAUSSURES", "elision": false}, "LIVRE": {"syllabes": "LI-VRE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "LIVRES", "elision": false}, "COLLE": {"syllabes": "COL-LE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "COLLES", "elision": false}, "GOMME": {"syllabes": "GOM-ME", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "GOMMES", "elision": false}, "CRAIE": {"syllabes": "CRAIE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "CRAIES", "elision": false}, "CLASSE": {"syllabes": "CLAS-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "CLASSES", "elision": false}, "STYLO": {"syllabes": "STY-LO", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "STYLOS", "elision": false}, "SAC": {"syllabes": "SAC", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "SACS", "elision": false}, "AMI": {"syllabes": "A-MI", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "AMIS", "elision": true}, "CAHIER": {"syllabes": "CA-HIER", "muettes": [2, 5], "lettres": 6, "genre": "m", "pluriel": "CAHIERS", "elision": false}, "CRAYON": {"syllabes": "CRA-YON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "CRAYONS", "elision": false}, "RÈGLE": {"syllabes": "RÈ-GLE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "RÈGLES", "elision": false}, "TROUSSE": {"syllabes": "TROUS-SE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "TROUSSES", "elision": false}, "CARTABLE": {"syllabes": "CAR-TA-BLE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "CARTABLES", "elision": false}, "TABLEAU": {"syllabes": "TA-BLEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "TABLEAUX", "elision": false}, "CISEAUX": {"syllabes": "CI-SEAUX", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "MAÎTRE": {"syllabes": "MAÎ-TRE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "MAÎTRES", "elision": false}, "RÉCRÉATION": {"syllabes": "RÉ-CRÉ-A-TION", "muettes": [], "lettres": 10, "genre": "f", "pluriel": "RÉCRÉATIONS", "elision": false}, "MAÎTRESSE": {"syllabes": "MAÎ-TRES-SE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "MAÎTRESSES", "elision": false}, "DICTIONNAIRE": {"syllabes": "DIC-TION-NAI-RE", "muettes": [11], "lettres": 12, "genre": "m", "pluriel": "DICTIONNAIRES", "elision": false}, "COMPAS": {"syllabes": "COM-PAS", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "COMPAS", "elision": false}, "PINCEAU": {"syllabes": "PIN-CEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "PINCEAUX", "elision": false}, "FEUTRE": {"syllabes": "FEU-TRE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "FEUTRES", "elision": false}, "ÉQUERRE": {"syllabes": "É-QUER-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "ÉQUERRES", "elision": true}, "BUREAU": {"syllabes": "BU-REAU", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "BUREAUX", "elision": false}, "CHEF": {"syllabes": "CHEF", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "JUGE": {"syllabes": "JU-GE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "PILOTE": {"syllabes": "PI-LO-TE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "MAÇON": {"syllabes": "MA-ÇON", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "MAÇONS", "elision": false}, "FERMIER": {"syllabes": "FER-MIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "FERMIERS", "elision": false}, "POMPIER": {"syllabes": "POM-PIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "POMPIERS", "elision": false}, "PEINTRE": {"syllabes": "PEIN-TRE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "FACTEUR": {"syllabes": "FAC-TEUR", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "FACTEURS", "elision": false}, "BOULANGER": {"syllabes": "BOU-LAN-GER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "BOULANGERS", "elision": false}, "MÉDECIN": {"syllabes": "MÉ-DE-CIN", "muettes": [], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "COIFFEUR": {"syllabes": "COIF-FEUR", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "COIFFEURS", "elision": false}, "JARDINIER": {"syllabes": "JAR-DI-NIER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "JARDINIERS", "elision": false}, "INFIRMIER": {"syllabes": "IN-FIR-MIER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "INFIRMIERS", "elision": true}, "CUISINIER": {"syllabes": "CUI-SI-NIER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "CUISINIERS", "elision": false}, "BOUCHER": {"syllabes": "BOU-CHER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "BOUCHERS", "elision": false}, "DENTISTE": {"syllabes": "DEN-TIS-TE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "VÉTÉRINAIRE": {"syllabes": "VÉ-TÉ-RI-NAI-RE", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "ARCHITECTE": {"syllabes": "AR-CHI-TEC-TE", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "PHARMACIEN": {"syllabes": "PHAR-MA-CIEN", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "PHARMACIENS", "elision": false}, "POLICIER": {"syllabes": "PO-LI-CIER", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "POLICIERS", "elision": false}, "CHIRURGIEN": {"syllabes": "CHI-RUR-GIEN", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "CHIRURGIENS", "elision": false}, "ASTRONAUTE": {"syllabes": "AS-TRO-NAU-TE", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "MENUISIER": {"syllabes": "ME-NUI-SIER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "MENUISIERS", "elision": false}, "ÉLECTRICIEN": {"syllabes": "É-LEC-TRI-CIEN", "muettes": [], "lettres": 11, "genre": "m", "pluriel": "ÉLECTRICIENS", "elision": true}, "BUS": {"syllabes": "BUS", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "BUS", "elision": false}, "LUGE": {"syllabes": "LU-GE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "LUGES", "elision": false}, "TAXI": {"syllabes": "TA-XI", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "TAXIS", "elision": false}, "TRAM": {"syllabes": "TRAM", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "TRAMS", "elision": false}, "AUTO": {"syllabes": "AU-TO", "muettes": [], "lettres": 4, "genre": "f", "pluriel": "AUTOS", "elision": true}, "CAMION": {"syllabes": "CA-MION", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "CAMIONS", "elision": false}, "MÉTRO": {"syllabes": "MÉ-TRO", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "MÉTROS", "elision": false}, "FUSÉE": {"syllabes": "FU-SÉE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "FUSÉES", "elision": false}, "TRACTEUR": {"syllabes": "TRAC-TEUR", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "TRACTEURS", "elision": false}, "BARQUE": {"syllabes": "BAR-QUE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "BARQUES", "elision": false}, "HÉLICOPTÈRE": {"syllabes": "HÉ-LI-COP-TÈ-RE", "muettes": [0, 10], "lettres": 11, "genre": "m", "pluriel": "HÉLICOPTÈRES", "elision": true}, "AMBULANCE": {"syllabes": "AM-BU-LAN-CE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "AMBULANCES", "elision": true}, "MONTGOLFIÈRE": {"syllabes": "MONT-GOL-FIÈ-RE", "muettes": [3, 11], "lettres": 12, "genre": "f", "pluriel": "MONTGOLFIÈRES", "elision": false}, "TROTTINETTE": {"syllabes": "TROT-TI-NET-TE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": "TROTTINETTES", "elision": false}, "SOUS-MARIN": {"syllabes": "SOUS-MA-RIN", "muettes": [3], "lettres": 9, "genre": "m", "pluriel": "SOUS-MARINS", "elision": false}, "PAQUEBOT": {"syllabes": "PA-QUE-BOT", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "PAQUEBOTS", "elision": false}, "TÉLÉPHÉRIQUE": {"syllabes": "TÉ-LÉ-PHÉ-RI-QUE", "muettes": [11], "lettres": 12, "genre": "m", "pluriel": "TÉLÉPHÉRIQUES", "elision": false}, "AUTOBUS": {"syllabes": "AU-TO-BUS", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "AUTOBUS", "elision": true}, "ROUGE": {"syllabes": "ROU-GE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "BLEU": {"syllabes": "BLEU", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "VERT": {"syllabes": "VERT", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "NOIR": {"syllabes": "NOIR", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "GRIS": {"syllabes": "GRIS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ROSE": {"syllabes": "RO-SE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ROND": {"syllabes": "ROND", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "BLANC": {"syllabes": "BLANC", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "JAUNE": {"syllabes": "JAU-NE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "VIOLET": {"syllabes": "VI-O-LET", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "MARRON": {"syllabes": "MAR-RON", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "CARRÉ": {"syllabes": "CAR-RÉ", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "CARRÉS", "elision": false}, "CERCLE": {"syllabes": "CER-CLE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "CERCLES", "elision": false}, "LIGNE": {"syllabes": "LI-GNE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "LIGNES", "elision": false}, "POINT": {"syllabes": "POINT", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "POINTS", "elision": false}, "TRIANGLE": {"syllabes": "TRI-AN-GLE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "TRIANGLES", "elision": false}, "RECTANGLE": {"syllabes": "REC-TAN-GLE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "RECTANGLES", "elision": false}, "LOSANGE": {"syllabes": "LO-SAN-GE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "LOSANGES", "elision": false}, "TURQUOISE": {"syllabes": "TUR-QUOI-SE", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "BEIGE": {"syllabes": "BEI-GE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "OVALE": {"syllabes": "O-VA-LE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "CYLINDRE": {"syllabes": "CY-LIN-DRE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "CYLINDRES", "elision": false}, "DORÉ": {"syllabes": "DO-RÉ", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "JUDO": {"syllabes": "JU-DO", "muettes": [], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "SKI": {"syllabes": "SKI", "muettes": [], "lettres": 3, "genre": "m", "pluriel": null, "elision": false}, "DANSE": {"syllabes": "DAN-SE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "BALLE": {"syllabes": "BAL-LE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "BALLES", "elision": false}, "PIANO": {"syllabes": "PI-A-NO", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "PIANOS", "elision": false}, "FLÛTE": {"syllabes": "FLÛ-TE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "FLÛTES", "elision": false}, "CHANT": {"syllabes": "CHANT", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "COURSE": {"syllabes": "COUR-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "COURSES", "elision": false}, "TENNIS": {"syllabes": "TEN-NIS", "muettes": [], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "FOOTBALL": {"syllabes": "FOOT-BALL", "muettes": [], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "NATATION": {"syllabes": "NA-TA-TION", "muettes": [], "lettres": 8, "genre": "f", "pluriel": null, "elision": false}, "GUITARE": {"syllabes": "GUI-TA-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "GUITARES", "elision": false}, "TAMBOUR": {"syllabes": "TAM-BOUR", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "TAMBOURS", "elision": false}, "VIOLON": {"syllabes": "VI-O-LON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "VIOLONS", "elision": false}, "TROMPETTE": {"syllabes": "TROM-PET-TE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "TROMPETTES", "elision": false}, "ESCRIME": {"syllabes": "ES-CRI-ME", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": null, "elision": true}, "GYMNASTIQUE": {"syllabes": "GYM-NAS-TI-QUE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": null, "elision": false}, "ÉQUITATION": {"syllabes": "É-QUI-TA-TION", "muettes": [], "lettres": 10, "genre": "f", "pluriel": null, "elision": true}, "BASKET": {"syllabes": "BAS-KET", "muettes": [], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "ESCALADE": {"syllabes": "ES-CA-LA-DE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": null, "elision": true}, "BATTERIE": {"syllabes": "BAT-TE-RIE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "BATTERIES", "elision": false}, "ACCORDÉON": {"syllabes": "AC-COR-DÉ-ON", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "ACCORDÉONS", "elision": true}, "HARPE": {"syllabes": "HAR-PE", "muettes": [0, 4], "lettres": 5, "genre": "f", "pluriel": "HARPES", "elision": false}};
  // Thèmes proposés aux joueurs, rangés en familles (v6.39) ; les autres packs ne sont plus proposés.
  var FAMILLES = [
  {
    "id": "nature",
    "nom": "Nature et animaux",
    "icone": "🌿",
    "themes": [
      "animaux",
      "nature",
      "meteo"
    ]
  },
  {
    "id": "quotidien",
    "nom": "Tous les jours",
    "icone": "🏠",
    "themes": [
      "corps",
      "aliments",
      "maison",
      "vetements",
      "couleurs"
    ]
  },
  {
    "id": "ville",
    "nom": "En ville",
    "icone": "🏙️",
    "themes": [
      "lieux",
      "ecole",
      "metiers",
      "transports",
      "loisirs"
    ]
  },
  {
    "id": "monde",
    "nom": "Le monde, le temps, les nombres",
    "icone": "🌍",
    "themes": [
      "pays",
      "villes",
      "temps",
      "numerique"
    ]
  }
];
  if (typeof module !== 'undefined' && module.exports) module.exports = { PACKS: PACKS, INFOS: INFOS, FAMILLES: FAMILLES };
  else racine.Cartes = { PACKS: PACKS, INFOS: INFOS, FAMILLES: FAMILLES };
})(this);
