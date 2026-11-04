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
    "nom": "Temps",
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
    "nom": "Numérique",
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
  // Pour chaque mot : syllabes écrites, positions des lettres muettes (null = question non posée), nombre de lettres.
  var INFOS = {"LE": {"syllabes": "LE", "muettes": [], "lettres": 2}, "UNE": {"syllabes": "U-NE", "muettes": [2], "lettres": 3}, "SA": {"syllabes": "SA", "muettes": [], "lettres": 2}, "SON": {"syllabes": "SON", "muettes": [], "lettres": 3}, "DES": {"syllabes": "DES", "muettes": [2], "lettres": 3}, "SES": {"syllabes": "SES", "muettes": [2], "lettres": 3}, "AU": {"syllabes": "AU", "muettes": [], "lettres": 2}, "JE": {"syllabes": "JE", "muettes": [], "lettres": 2}, "ELLE": {"syllabes": "EL-LE", "muettes": [3], "lettres": 4}, "ILS": {"syllabes": "ILS", "muettes": [2], "lettres": 3}, "Y": {"syllabes": "Y", "muettes": [], "lettres": 1}, "QUI": {"syllabes": "QUI", "muettes": [], "lettres": 3}, "DONT": {"syllabes": "DONT", "muettes": [3], "lettres": 4}, "ET": {"syllabes": "ET", "muettes": [1], "lettres": 2}, "OU": {"syllabes": "OU", "muettes": [], "lettres": 2}, "ENSUITE": {"syllabes": "EN-SUI-TE", "muettes": [6], "lettres": 7}, "DANS": {"syllabes": "DANS", "muettes": [3], "lettres": 4}, "CHEZ": {"syllabes": "CHEZ", "muettes": [3], "lettres": 4}, "APRÈS": {"syllabes": "A-PRÈS", "muettes": [4], "lettres": 5}, "PAR": {"syllabes": "PAR", "muettes": [], "lettres": 3}, "OÙ": {"syllabes": "OÙ", "muettes": [], "lettres": 2}, "ICI": {"syllabes": "I-CI", "muettes": [], "lettres": 3}, "TÔT": {"syllabes": "TÔT", "muettes": [2], "lettres": 3}, "BIEN": {"syllabes": "BIEN", "muettes": [], "lettres": 4}, "SI": {"syllabes": "SI", "muettes": [], "lettres": 2}, "NOTRE": {"syllabes": "NO-TRE", "muettes": [4], "lettres": 5}, "NOS": {"syllabes": "NOS", "muettes": [2], "lettres": 3}, "MAMAN": {"syllabes": "MA-MAN", "muettes": [], "lettres": 5}, "SŒUR": {"syllabes": "SŒUR", "muettes": [], "lettres": null}, "TONTON": {"syllabes": "TON-TON", "muettes": [], "lettres": 6}, "LA": {"syllabes": "LA", "muettes": [], "lettres": 2}, "MA": {"syllabes": "MA", "muettes": [], "lettres": 2}, "MON": {"syllabes": "MON", "muettes": [], "lettres": 3}, "CE": {"syllabes": "CE", "muettes": [], "lettres": 2}, "MES": {"syllabes": "MES", "muettes": [2], "lettres": 3}, "CES": {"syllabes": "CES", "muettes": [2], "lettres": 3}, "QUEL": {"syllabes": "QUEL", "muettes": [], "lettres": 4}, "TU": {"syllabes": "TU", "muettes": [], "lettres": 2}, "NOUS": {"syllabes": "NOUS", "muettes": [3], "lettres": 4}, "ELLES": {"syllabes": "EL-LES", "muettes": [3, 4], "lettres": 5}, "TOUT": {"syllabes": "TOUT", "muettes": [3], "lettres": 4}, "QUE": {"syllabes": "QUE", "muettes": [], "lettres": 3}, "OUI": {"syllabes": "OUI", "muettes": [], "lettres": 3}, "CAR": {"syllabes": "CAR", "muettes": [], "lettres": 3}, "ALORS": {"syllabes": "A-LORS", "muettes": [4], "lettres": 5}, "DE": {"syllabes": "DE", "muettes": [], "lettres": 2}, "SUR": {"syllabes": "SUR", "muettes": [], "lettres": 3}, "ENTRE": {"syllabes": "EN-TRE", "muettes": [4], "lettres": 5}, "AVEC": {"syllabes": "A-VEC", "muettes": [], "lettres": 4}, "POUR": {"syllabes": "POUR", "muettes": [], "lettres": 4}, "QUAND": {"syllabes": "QUAND", "muettes": [4], "lettres": 5}, "PRÈS": {"syllabes": "PRÈS", "muettes": [3], "lettres": 4}, "TOUJOURS": {"syllabes": "TOU-JOURS", "muettes": [7], "lettres": 8}, "TROP": {"syllabes": "TROP", "muettes": [3], "lettres": 4}, "PLUS": {"syllabes": "PLUS", "muettes": null, "lettres": 4}, "VOTRE": {"syllabes": "VO-TRE", "muettes": [4], "lettres": 5}, "VOS": {"syllabes": "VOS", "muettes": [2], "lettres": 3}, "PAPA": {"syllabes": "PA-PA", "muettes": [], "lettres": 4}, "COUSIN": {"syllabes": "COU-SIN", "muettes": [], "lettres": 6}, "COUSINE": {"syllabes": "COU-SI-NE", "muettes": [6], "lettres": 7}, "UN": {"syllabes": "UN", "muettes": [], "lettres": 2}, "TA": {"syllabes": "TA", "muettes": [], "lettres": 2}, "TON": {"syllabes": "TON", "muettes": [], "lettres": 3}, "LES": {"syllabes": "LES", "muettes": [2], "lettres": 3}, "TES": {"syllabes": "TES", "muettes": [2], "lettres": 3}, "DU": {"syllabes": "DU", "muettes": [], "lettres": 2}, "QUELLE": {"syllabes": "QUEL-LE", "muettes": [5], "lettres": 6}, "IL": {"syllabes": "IL", "muettes": [], "lettres": 2}, "VOUS": {"syllabes": "VOUS", "muettes": [3], "lettres": 4}, "EN": {"syllabes": "EN", "muettes": [], "lettres": 2}, "ON": {"syllabes": "ON", "muettes": [], "lettres": 2}, "QUOI": {"syllabes": "QUOI", "muettes": [], "lettres": 4}, "NON": {"syllabes": "NON", "muettes": [], "lettres": 3}, "MAIS": {"syllabes": "MAIS", "muettes": [3], "lettres": 4}, "PUIS": {"syllabes": "PUIS", "muettes": [3], "lettres": 4}, "À": {"syllabes": "À", "muettes": [], "lettres": 1}, "SOUS": {"syllabes": "SOUS", "muettes": [3], "lettres": 4}, "AVANT": {"syllabes": "A-VANT", "muettes": [4], "lettres": 5}, "SANS": {"syllabes": "SANS", "muettes": [3], "lettres": 4}, "COMME": {"syllabes": "COM-ME", "muettes": [4], "lettres": 5}, "COMMENT": {"syllabes": "COM-MENT", "muettes": [6], "lettres": 7}, "TARD": {"syllabes": "TARD", "muettes": [3], "lettres": 4}, "ENCORE": {"syllabes": "EN-CO-RE", "muettes": [5], "lettres": 6}, "TRÈS": {"syllabes": "TRÈS", "muettes": [3], "lettres": 4}, "MOINS": {"syllabes": "MOINS", "muettes": [4], "lettres": 5}, "LEUR": {"syllabes": "LEUR", "muettes": [], "lettres": 4}, "LEURS": {"syllabes": "LEURS", "muettes": [4], "lettres": 5}, "FRÈRE": {"syllabes": "FRÈ-RE", "muettes": [4], "lettres": 5}, "TANTE": {"syllabes": "TAN-TE", "muettes": [4], "lettres": 5}, "MOI": {"syllabes": "MOI", "muettes": [], "lettres": 3}, "PLUSIEURS": {"syllabes": "PLU-SIEURS", "muettes": [8], "lettres": 9}, "PEUT-ÊTRE": {"syllabes": "PEUT-Ê-TRE", "muettes": [3, 8], "lettres": 8}, "AUTOUR": {"syllabes": "AU-TOUR", "muettes": [], "lettres": 6}, "DESSUS": {"syllabes": "DES-SUS", "muettes": [5], "lettres": 6}, "VERS": {"syllabes": "VERS", "muettes": [3], "lettres": 4}, "DEPUIS": {"syllabes": "DE-PUIS", "muettes": [5], "lettres": 6}, "SAUF": {"syllabes": "SAUF", "muettes": [], "lettres": 4}, "PARCE QUE": {"syllabes": "PAR-CE QUE", "muettes": [4], "lettres": 8}, "AILLEURS": {"syllabes": "AIL-LEURS", "muettes": [7], "lettres": 8}, "CÔTE À CÔTE": {"syllabes": "CÔ-TE À CÔ-TE", "muettes": [3, 10], "lettres": 9}, "AUJOURD'HUI": {"syllabes": "AU-JOUR-D'HUI", "muettes": [8], "lettres": 10}, "AVANT-HIER": {"syllabes": "A-VANT-HIER", "muettes": [6], "lettres": 9}, "DÉJÀ": {"syllabes": "DÉ-JÀ", "muettes": [], "lettres": 4}, "HIER": {"syllabes": "HIER", "muettes": [0], "lettres": 4}, "EN RETARD": {"syllabes": "EN RE-TARD", "muettes": [8], "lettres": 8}, "MAINTENANT": {"syllabes": "MAIN-TE-NANT", "muettes": [9], "lettres": 10}, "SOUVENT": {"syllabes": "SOU-VENT", "muettes": [6], "lettres": 7}, "AUSSI": {"syllabes": "AUS-SI", "muettes": [], "lettres": 5}, "DAVANTAGE": {"syllabes": "DA-VAN-TA-GE", "muettes": [8], "lettres": 9}, "ENSEMBLE": {"syllabes": "EN-SEM-BLE", "muettes": [7], "lettres": 8}, "BRUSQUEMENT": {"syllabes": "BRUS-QUE-MENT", "muettes": [10], "lettres": 11}, "FACILEMENT": {"syllabes": "FA-CI-LE-MENT", "muettes": [9], "lettres": 10}, "SAGEMENT": {"syllabes": "SA-GE-MENT", "muettes": [7], "lettres": 8}, "NE... PAS": {"syllabes": "NE... PAS", "muettes": [8], "lettres": 5}, "D’ACCORD": {"syllabes": "D’AC-CORD", "muettes": [7], "lettres": 7}, "DONC": {"syllabes": "DONC", "muettes": [], "lettres": 4}, "DERRIÈRE": {"syllabes": "DER-RIÈ-RE", "muettes": [7], "lettres": 8}, "DEVANT": {"syllabes": "DE-VANT", "muettes": [5], "lettres": 6}, "DURANT": {"syllabes": "DU-RANT", "muettes": [5], "lettres": 6}, "AFIN": {"syllabes": "A-FIN", "muettes": [], "lettres": 4}, "DÈS QUE": {"syllabes": "DÈS QUE", "muettes": [2], "lettres": 6}, "PENDANT QUE": {"syllabes": "PEN-DANT QUE", "muettes": [6], "lettres": 10}, "DEDANS": {"syllabes": "DE-DANS", "muettes": [5], "lettres": 6}, "LOIN": {"syllabes": "LOIN", "muettes": [], "lettres": 4}, "AUSSITÔT": {"syllabes": "AUS-SI-TÔT", "muettes": [7], "lettres": 8}, "BIENTÔT": {"syllabes": "BIEN-TÔT", "muettes": [6], "lettres": 7}, "DEMAIN": {"syllabes": "DE-MAIN", "muettes": [], "lettres": 6}, "ENFIN": {"syllabes": "EN-FIN", "muettes": [], "lettres": 5}, "QUELQUEFOIS": {"syllabes": "QUEL-QUE-FOIS", "muettes": [10], "lettres": 11}, "TOUT À COUP": {"syllabes": "TOUT À COUP", "muettes": [3, 10], "lettres": 9}, "AUTANT": {"syllabes": "AU-TANT", "muettes": [5], "lettres": 6}, "PRESQUE": {"syllabes": "PRES-QUE", "muettes": [6], "lettres": 7}, "MIEUX": {"syllabes": "MIEUX", "muettes": [4], "lettres": 5}, "EXACTEMENT": {"syllabes": "E-XAC-TE-MENT", "muettes": [9], "lettres": 10}, "HEUREUSEMENT": {"syllabes": "HEU-REU-SE-MENT", "muettes": [0, 11], "lettres": 12}, "SEULEMENT": {"syllabes": "SEU-LE-MENT", "muettes": [8], "lettres": 9}, "NE… JAMAIS": {"syllabes": "NE… JA-MAIS", "muettes": [9], "lettres": 8}, "HÉLAS": {"syllabes": "HÉ-LAS", "muettes": [0], "lettres": 5}, "POURTANT": {"syllabes": "POUR-TANT", "muettes": [7], "lettres": 8}, "DESSOUS": {"syllabes": "DES-SOUS", "muettes": [6], "lettres": 7}, "PARMI": {"syllabes": "PAR-MI", "muettes": [], "lettres": 5}, "PENDANT": {"syllabes": "PEN-DANT", "muettes": [6], "lettres": 7}, "MALGRÉ": {"syllabes": "MAL-GRÉ", "muettes": [], "lettres": 6}, "LORSQUE": {"syllabes": "LORS-QUE", "muettes": [6], "lettres": 7}, "POURQUOI": {"syllabes": "POUR-QUOI", "muettes": [], "lettres": 8}, "DEHORS": {"syllabes": "DE-HORS", "muettes": [2, 5], "lettres": 6}, "PARTOUT": {"syllabes": "PAR-TOUT", "muettes": [6], "lettres": 7}, "AUTREFOIS": {"syllabes": "AU-TRE-FOIS", "muettes": [8], "lettres": 9}, "D'ABORD": {"syllabes": "D'A-BORD", "muettes": [6], "lettres": 6}, "EN CE MOMENT": {"syllabes": "EN CE MO-MENT", "muettes": [11], "lettres": 10}, "EN AVANCE": {"syllabes": "EN A-VAN-CE", "muettes": [8], "lettres": 8}, "LONGTEMPS": {"syllabes": "LONG-TEMPS", "muettes": [3, 7, 8], "lettres": 9}, "SOUDAIN": {"syllabes": "SOU-DAIN", "muettes": [], "lettres": 7}, "ASSEZ": {"syllabes": "AS-SEZ", "muettes": [4], "lettres": 5}, "BEAUCOUP": {"syllabes": "BEAU-COUP", "muettes": [7], "lettres": 8}, "DEBOUT": {"syllabes": "DE-BOUT", "muettes": [5], "lettres": 6}, "SINON": {"syllabes": "SI-NON", "muettes": [], "lettres": 5}, "DOUCEMENT": {"syllabes": "DOU-CE-MENT", "muettes": [8], "lettres": 9}, "LENTEMENT": {"syllabes": "LEN-TE-MENT", "muettes": [8], "lettres": 9}, "NE… GUÈRE": {"syllabes": "NE… GUÈ-RE", "muettes": [8], "lettres": 7}, "NE… PLUS": {"syllabes": "NE… PLUS", "muettes": [7], "lettres": 6}, "LUNDI": {"syllabes": "LUN-DI", "muettes": [], "lettres": 5}, "JEUDI": {"syllabes": "JEU-DI", "muettes": [], "lettres": 5}, "DIMANCHE": {"syllabes": "DI-MAN-CHE", "muettes": [7], "lettres": 8}, "MOIS": {"syllabes": "MOIS", "muettes": [3], "lettres": 4}, "MARS": {"syllabes": "MARS", "muettes": [], "lettres": 4}, "JUIN": {"syllabes": "JUIN", "muettes": [], "lettres": 4}, "SEPTEMBRE": {"syllabes": "SEP-TEM-BRE", "muettes": [8], "lettres": 9}, "DÉCEMBRE": {"syllabes": "DÉ-CEM-BRE", "muettes": [7], "lettres": 8}, "MARDI": {"syllabes": "MAR-DI", "muettes": [], "lettres": 5}, "VENDREDI": {"syllabes": "VEN-DRE-DI", "muettes": [], "lettres": 8}, "JOUR": {"syllabes": "JOUR", "muettes": [], "lettres": 4}, "JANVIER": {"syllabes": "JAN-VIER", "muettes": [6], "lettres": 7}, "AVRIL": {"syllabes": "A-VRIL", "muettes": [], "lettres": 5}, "JUILLET": {"syllabes": "JUIL-LET", "muettes": [6], "lettres": 7}, "OCTOBRE": {"syllabes": "OC-TO-BRE", "muettes": [6], "lettres": 7}, "ANNÉE": {"syllabes": "AN-NÉE", "muettes": [4], "lettres": 5}, "MERCREDI": {"syllabes": "MER-CRE-DI", "muettes": [], "lettres": 8}, "SAMEDI": {"syllabes": "SA-ME-DI", "muettes": [], "lettres": 6}, "SEMAINE": {"syllabes": "SE-MAI-NE", "muettes": [6], "lettres": 7}, "FÉVRIER": {"syllabes": "FÉ-VRIER", "muettes": [6], "lettres": 7}, "MAI": {"syllabes": "MAI", "muettes": [], "lettres": 3}, "AOÛT": {"syllabes": "AOÛT", "muettes": null, "lettres": 4}, "NOVEMBRE": {"syllabes": "NO-VEM-BRE", "muettes": [7], "lettres": 8}, "SIÈCLE": {"syllabes": "SIÈ-CLE", "muettes": [5], "lettres": 6}, "ZÉRO": {"syllabes": "ZÉ-RO", "muettes": [], "lettres": 4}, "TROIS": {"syllabes": "TROIS", "muettes": [4], "lettres": 5}, "SIX": {"syllabes": "SIX", "muettes": [], "lettres": 3}, "NEUF": {"syllabes": "NEUF", "muettes": [], "lettres": 4}, "DOUZE": {"syllabes": "DOU-ZE", "muettes": [4], "lettres": 5}, "QUINZE": {"syllabes": "QUIN-ZE", "muettes": [5], "lettres": 6}, "DIX-HUIT": {"syllabes": "DIX-HUIT", "muettes": [4], "lettres": 7}, "TRENTE": {"syllabes": "TREN-TE", "muettes": [5], "lettres": 6}, "SOIXANTE": {"syllabes": "SOI-XAN-TE", "muettes": [7], "lettres": 8}, "QUATRE-VINGT-DIX": {"syllabes": "QUA-TRE-VINGT-DIX", "muettes": [5, 10, 11], "lettres": 14}, "MILLIER": {"syllabes": "MIL-LIER", "muettes": [6], "lettres": 7}, "UNITÉ": {"syllabes": "U-NI-TÉ", "muettes": [], "lettres": 5}, "QUATRE": {"syllabes": "QUA-TRE", "muettes": [5], "lettres": 6}, "SEPT": {"syllabes": "SEPT", "muettes": [2], "lettres": 4}, "DIX": {"syllabes": "DIX", "muettes": [], "lettres": 3}, "TREIZE": {"syllabes": "TREI-ZE", "muettes": [5], "lettres": 6}, "SEIZE": {"syllabes": "SEI-ZE", "muettes": [4], "lettres": 5}, "DIX-NEUF": {"syllabes": "DIX-NEUF", "muettes": [], "lettres": 7}, "QUARANTE": {"syllabes": "QUA-RAN-TE", "muettes": [7], "lettres": 8}, "SOIXANTE-DIX": {"syllabes": "SOI-XAN-TE-DIX", "muettes": [7], "lettres": 11}, "CENT": {"syllabes": "CENT", "muettes": [3], "lettres": 4}, "MILLION": {"syllabes": "MIL-LION", "muettes": [], "lettres": 7}, "DIZAINE": {"syllabes": "DI-ZAI-NE", "muettes": [6], "lettres": 7}, "DEUX": {"syllabes": "DEUX", "muettes": [3], "lettres": 4}, "CINQ": {"syllabes": "CINQ", "muettes": [], "lettres": 4}, "HUIT": {"syllabes": "HUIT", "muettes": [0], "lettres": 4}, "ONZE": {"syllabes": "ON-ZE", "muettes": [3], "lettres": 4}, "QUATORZE": {"syllabes": "QUA-TOR-ZE", "muettes": [7], "lettres": 8}, "DIX-SEPT": {"syllabes": "DIX-SEPT", "muettes": [6], "lettres": 7}, "VINGT": {"syllabes": "VINGT", "muettes": [3, 4], "lettres": 5}, "CINQUANTE": {"syllabes": "CIN-QUAN-TE", "muettes": [8], "lettres": 9}, "QUATRE-VINGT": {"syllabes": "QUA-TRE-VINGT", "muettes": [5, 10, 11], "lettres": 11}, "MILLE": {"syllabes": "MIL-LE", "muettes": [4], "lettres": 5}, "MILLIARD": {"syllabes": "MIL-LIARD", "muettes": [7], "lettres": 8}, "CENTAINE": {"syllabes": "CEN-TAI-NE", "muettes": [7], "lettres": 8}, "AVION": {"syllabes": "A-VION", "muettes": [], "lettres": 5}, "BALLON": {"syllabes": "BAL-LON", "muettes": [], "lettres": 6}, "CHAT": {"syllabes": "CHAT", "muettes": [3], "lettres": 4}, "DOMINO": {"syllabes": "DO-MI-NO", "muettes": [], "lettres": 6}, "ÉLÉPHANT": {"syllabes": "É-LÉ-PHANT", "muettes": [7], "lettres": 8}, "FLEUR": {"syllabes": "FLEUR", "muettes": [], "lettres": 5}, "GIRAFE": {"syllabes": "GI-RA-FE", "muettes": [5], "lettres": 6}, "HIBOU": {"syllabes": "HI-BOU", "muettes": [0], "lettres": 5}, "ÎLE": {"syllabes": "Î-LE", "muettes": [2], "lettres": 3}, "JARDIN": {"syllabes": "JAR-DIN", "muettes": [], "lettres": 6}, "KIWI": {"syllabes": "KI-WI", "muettes": [], "lettres": 4}, "LION": {"syllabes": "LI-ON", "muettes": [], "lettres": 4}, "MAISON": {"syllabes": "MAI-SON", "muettes": [], "lettres": 6}, "NUAGE": {"syllabes": "NU-A-GE", "muettes": [4], "lettres": 5}, "OLIVE": {"syllabes": "O-LI-VE", "muettes": [4], "lettres": 5}, "POMME": {"syllabes": "POM-ME", "muettes": [4], "lettres": 5}, "QUILLE": {"syllabes": "QUIL-LE", "muettes": [5], "lettres": 6}, "RENARD": {"syllabes": "RE-NARD", "muettes": [5], "lettres": 6}, "SOLEIL": {"syllabes": "SO-LEIL", "muettes": [], "lettres": 6}, "TIGRE": {"syllabes": "TI-GRE", "muettes": [4], "lettres": 5}, "UNIVERS": {"syllabes": "U-NI-VERS", "muettes": [6], "lettres": 7}, "VÉLO": {"syllabes": "VÉ-LO", "muettes": [], "lettres": 4}, "WAGON": {"syllabes": "WA-GON", "muettes": [], "lettres": 5}, "XYLOPHONE": {"syllabes": "XY-LO-PHO-NE", "muettes": [8], "lettres": 9}, "YAOURT": {"syllabes": "YA-OURT", "muettes": null, "lettres": 6}, "ZÈBRE": {"syllabes": "ZÈ-BRE", "muettes": [4], "lettres": 5}, "ABEILLE": {"syllabes": "A-BEIL-LE", "muettes": [6], "lettres": 7}, "BATEAU": {"syllabes": "BA-TEAU", "muettes": [], "lettres": 6}, "CHOCOLAT": {"syllabes": "CHO-CO-LAT", "muettes": [7], "lettres": 8}, "DINOSAURE": {"syllabes": "DI-NO-SAU-RE", "muettes": [8], "lettres": 9}, "ÉTOILE": {"syllabes": "É-TOI-LE", "muettes": [5], "lettres": 6}, "FORÊT": {"syllabes": "FO-RÊT", "muettes": [4], "lettres": 5}, "GÂTEAU": {"syllabes": "GÂ-TEAU", "muettes": [], "lettres": 6}, "HABIT": {"syllabes": "HA-BIT", "muettes": [0, 4], "lettres": 5}, "IMAGE": {"syllabes": "I-MA-GE", "muettes": [4], "lettres": 5}, "JOUET": {"syllabes": "JOU-ET", "muettes": [4], "lettres": 5}, "KOALA": {"syllabes": "KO-A-LA", "muettes": [], "lettres": 5}, "LUNE": {"syllabes": "LU-NE", "muettes": [3], "lettres": 4}, "MOTO": {"syllabes": "MO-TO", "muettes": [], "lettres": 4}, "NEIGE": {"syllabes": "NEI-GE", "muettes": [4], "lettres": 5}, "ORANGE": {"syllabes": "O-RAN-GE", "muettes": [5], "lettres": 6}, "PAPILLON": {"syllabes": "PA-PIL-LON", "muettes": [], "lettres": 8}, "ROBOT": {"syllabes": "RO-BOT", "muettes": [4], "lettres": 5}, "SERPENT": {"syllabes": "SER-PENT", "muettes": [6], "lettres": 7}, "TRAIN": {"syllabes": "TRAIN", "muettes": [], "lettres": 5}, "USINE": {"syllabes": "U-SI-NE", "muettes": [4], "lettres": 5}, "VOITURE": {"syllabes": "VOI-TU-RE", "muettes": [6], "lettres": 7}, "WAPITI": {"syllabes": "WA-PI-TI", "muettes": [], "lettres": 6}, "XÉNON": {"syllabes": "XÉ-NON", "muettes": [], "lettres": 5}, "YOGA": {"syllabes": "YO-GA", "muettes": [], "lettres": 4}, "ZOO": {"syllabes": "ZOO", "muettes": [], "lettres": 3}, "CHIEN": {"syllabes": "CHIEN", "muettes": [], "lettres": 5}, "LAPIN": {"syllabes": "LA-PIN", "muettes": [], "lettres": 5}, "OURS": {"syllabes": "OURS", "muettes": [], "lettres": 4}, "LOUP": {"syllabes": "LOUP", "muettes": [3], "lettres": 4}, "COQ": {"syllabes": "COQ", "muettes": [], "lettres": 3}, "VACHE": {"syllabes": "VA-CHE", "muettes": [4], "lettres": 5}, "POULE": {"syllabes": "POU-LE", "muettes": [4], "lettres": 5}, "CANARD": {"syllabes": "CA-NARD", "muettes": [5], "lettres": 6}, "CHEVAL": {"syllabes": "CHE-VAL", "muettes": [], "lettres": 6}, "MOUTON": {"syllabes": "MOU-TON", "muettes": [], "lettres": 6}, "TORTUE": {"syllabes": "TOR-TUE", "muettes": [5], "lettres": 6}, "SINGE": {"syllabes": "SIN-GE", "muettes": [4], "lettres": 5}, "OISEAU": {"syllabes": "OI-SEAU", "muettes": [], "lettres": 6}, "CHÈVRE": {"syllabes": "CHÈ-VRE", "muettes": [5], "lettres": 6}, "COCHON": {"syllabes": "CO-CHON", "muettes": [], "lettres": 6}, "BALEINE": {"syllabes": "BA-LEI-NE", "muettes": [6], "lettres": 7}, "CROCODILE": {"syllabes": "CRO-CO-DI-LE", "muettes": [8], "lettres": 9}, "ÉCUREUIL": {"syllabes": "É-CU-REUIL", "muettes": [], "lettres": 8}, "HIPPOPOTAME": {"syllabes": "HIP-PO-PO-TA-ME", "muettes": [10], "lettres": 11}, "KANGOUROU": {"syllabes": "KAN-GOU-ROU", "muettes": [], "lettres": 9}, "PINGOUIN": {"syllabes": "PIN-GOUIN", "muettes": [], "lettres": 8}, "HÉRISSON": {"syllabes": "HÉ-RIS-SON", "muettes": [0], "lettres": 8}, "PANTHÈRE": {"syllabes": "PAN-THÈ-RE", "muettes": [7], "lettres": 8}, "GUÊPE": {"syllabes": "GUÊ-PE", "muettes": [4], "lettres": 5}, "PONT": {"syllabes": "PONT", "muettes": [3], "lettres": 4}, "MUR": {"syllabes": "MUR", "muettes": [], "lettres": 3}, "TOUR": {"syllabes": "TOUR", "muettes": [], "lettres": 4}, "GARE": {"syllabes": "GA-RE", "muettes": [3], "lettres": 4}, "PORT": {"syllabes": "PORT", "muettes": [3], "lettres": 4}, "PARC": {"syllabes": "PARC", "muettes": [], "lettres": 4}, "RUE": {"syllabes": "RUE", "muettes": [2], "lettres": 3}, "ÉCOLE": {"syllabes": "É-CO-LE", "muettes": [4], "lettres": 5}, "CHÂTEAU": {"syllabes": "CHÂ-TEAU", "muettes": [], "lettres": 7}, "CABANE": {"syllabes": "CA-BA-NE", "muettes": [5], "lettres": 6}, "GRENIER": {"syllabes": "GRE-NIER", "muettes": [6], "lettres": 7}, "MAGASIN": {"syllabes": "MA-GA-SIN", "muettes": [], "lettres": 7}, "VILLAGE": {"syllabes": "VIL-LA-GE", "muettes": [6], "lettres": 7}, "CHEMIN": {"syllabes": "CHE-MIN", "muettes": [], "lettres": 6}, "FERME": {"syllabes": "FER-ME", "muettes": [4], "lettres": 5}, "HÔPITAL": {"syllabes": "HÔ-PI-TAL", "muettes": [0], "lettres": 7}, "BIBLIOTHÈQUE": {"syllabes": "BI-BLI-O-THÈ-QUE", "muettes": [11], "lettres": 12}, "IMMEUBLE": {"syllabes": "IM-MEU-BLE", "muettes": [7], "lettres": 8}, "ÉGLISE": {"syllabes": "É-GLI-SE", "muettes": [5], "lettres": 6}, "MUSÉE": {"syllabes": "MU-SÉE", "muettes": [4], "lettres": 5}, "BOULANGERIE": {"syllabes": "BOU-LAN-GE-RIE", "muettes": [10], "lettres": 11}, "PHARE": {"syllabes": "PHA-RE", "muettes": [4], "lettres": 5}, "AÉROPORT": {"syllabes": "A-É-RO-PORT", "muettes": [7], "lettres": 8}, "FRANCE": {"syllabes": "FRAN-CE", "muettes": [5], "lettres": 6}, "ITALIE": {"syllabes": "I-TA-LIE", "muettes": [5], "lettres": 6}, "CHINE": {"syllabes": "CHI-NE", "muettes": [4], "lettres": 5}, "JAPON": {"syllabes": "JA-PON", "muettes": [], "lettres": 5}, "INDE": {"syllabes": "IN-DE", "muettes": [3], "lettres": 4}, "MAROC": {"syllabes": "MA-ROC", "muettes": [], "lettres": 5}, "PÉROU": {"syllabes": "PÉ-ROU", "muettes": [], "lettres": 5}, "CHILI": {"syllabes": "CHI-LI", "muettes": [], "lettres": 5}, "ESPAGNE": {"syllabes": "ES-PA-GNE", "muettes": [6], "lettres": 7}, "BELGIQUE": {"syllabes": "BEL-GI-QUE", "muettes": [7], "lettres": 8}, "SUISSE": {"syllabes": "SUIS-SE", "muettes": [5], "lettres": 6}, "CANADA": {"syllabes": "CA-NA-DA", "muettes": [], "lettres": 6}, "BRÉSIL": {"syllabes": "BRÉ-SIL", "muettes": [], "lettres": 6}, "ÉGYPTE": {"syllabes": "É-GYP-TE", "muettes": [5], "lettres": 6}, "GRÈCE": {"syllabes": "GRÈ-CE", "muettes": [4], "lettres": 5}, "KENYA": {"syllabes": "KE-NYA", "muettes": [], "lettres": 5}, "ALLEMAGNE": {"syllabes": "AL-LE-MA-GNE", "muettes": [8], "lettres": 9}, "ANGLETERRE": {"syllabes": "AN-GLE-TER-RE", "muettes": [9], "lettres": 10}, "PORTUGAL": {"syllabes": "POR-TU-GAL", "muettes": [], "lettres": 8}, "AUSTRALIE": {"syllabes": "AUS-TRA-LIE", "muettes": [8], "lettres": 9}, "MEXIQUE": {"syllabes": "ME-XI-QUE", "muettes": [6], "lettres": 7}, "ARGENTINE": {"syllabes": "AR-GEN-TI-NE", "muettes": [8], "lettres": 9}, "SÉNÉGAL": {"syllabes": "SÉ-NÉ-GAL", "muettes": [], "lettres": 7}, "NORVÈGE": {"syllabes": "NOR-VÈ-GE", "muettes": [6], "lettres": 7}, "PARIS": {"syllabes": "PA-RIS", "muettes": [4], "lettres": 5}, "LYON": {"syllabes": "LY-ON", "muettes": [], "lettres": 4}, "NICE": {"syllabes": "NI-CE", "muettes": [3], "lettres": 4}, "LILLE": {"syllabes": "LIL-LE", "muettes": [4], "lettres": 5}, "NANTES": {"syllabes": "NAN-TES", "muettes": [4, 5], "lettres": 6}, "ROME": {"syllabes": "RO-ME", "muettes": [3], "lettres": 4}, "BREST": {"syllabes": "BREST", "muettes": [], "lettres": 5}, "PAU": {"syllabes": "PAU", "muettes": [], "lettres": 3}, "MARSEILLE": {"syllabes": "MAR-SEIL-LE", "muettes": [8], "lettres": 9}, "BORDEAUX": {"syllabes": "BOR-DEAUX", "muettes": [7], "lettres": 8}, "TOULOUSE": {"syllabes": "TOU-LOU-SE", "muettes": [7], "lettres": 8}, "RENNES": {"syllabes": "REN-NES", "muettes": [4, 5], "lettres": 6}, "LONDRES": {"syllabes": "LON-DRES", "muettes": [5, 6], "lettres": 7}, "BERLIN": {"syllabes": "BER-LIN", "muettes": [], "lettres": 6}, "MADRID": {"syllabes": "MA-DRID", "muettes": [], "lettres": 6}, "TOKYO": {"syllabes": "TO-KYO", "muettes": [], "lettres": 5}, "STRASBOURG": {"syllabes": "STRAS-BOURG", "muettes": [9], "lettres": 10}, "MONTPELLIER": {"syllabes": "MONT-PEL-LIER", "muettes": [3, 10], "lettres": 11}, "GRENOBLE": {"syllabes": "GRE-NO-BLE", "muettes": [7], "lettres": 8}, "PERPIGNAN": {"syllabes": "PER-PI-GNAN", "muettes": [], "lettres": 9}, "BRUXELLES": {"syllabes": "BRU-XEL-LES", "muettes": [7, 8], "lettres": 9}, "GENÈVE": {"syllabes": "GE-NÈ-VE", "muettes": [5], "lettres": 6}, "LISBONNE": {"syllabes": "LIS-BON-NE", "muettes": [7], "lettres": 8}, "AMSTERDAM": {"syllabes": "AMS-TER-DAM", "muettes": [], "lettres": 9}, "LAC": {"syllabes": "LAC", "muettes": [], "lettres": 3}, "MER": {"syllabes": "MER", "muettes": [], "lettres": 3}, "BOIS": {"syllabes": "BOIS", "muettes": [3], "lettres": 4}, "CIEL": {"syllabes": "CIEL", "muettes": [], "lettres": 4}, "ARBRE": {"syllabes": "AR-BRE", "muettes": [4], "lettres": 5}, "PRÉ": {"syllabes": "PRÉ", "muettes": [], "lettres": 3}, "SABLE": {"syllabes": "SA-BLE", "muettes": [4], "lettres": 5}, "PLAGE": {"syllabes": "PLA-GE", "muettes": [4], "lettres": 5}, "RIVIÈRE": {"syllabes": "RI-VIÈ-RE", "muettes": [6], "lettres": 7}, "COLLINE": {"syllabes": "COL-LI-NE", "muettes": [6], "lettres": 7}, "DÉSERT": {"syllabes": "DÉ-SERT", "muettes": [5], "lettres": 6}, "VOLCAN": {"syllabes": "VOL-CAN", "muettes": [], "lettres": 6}, "OCÉAN": {"syllabes": "O-CÉ-AN", "muettes": [], "lettres": 5}, "GROTTE": {"syllabes": "GROT-TE", "muettes": [5], "lettres": 6}, "MONTAGNE": {"syllabes": "MON-TA-GNE", "muettes": [7], "lettres": 8}, "CASCADE": {"syllabes": "CAS-CA-DE", "muettes": [6], "lettres": 7}, "FALAISE": {"syllabes": "FA-LAI-SE", "muettes": [6], "lettres": 7}, "MARÉCAGE": {"syllabes": "MA-RÉ-CA-GE", "muettes": [7], "lettres": 8}, "PRAIRIE": {"syllabes": "PRAI-RIE", "muettes": [6], "lettres": 7}, "GLACIER": {"syllabes": "GLA-CIER", "muettes": [6], "lettres": 7}, "ROCHER": {"syllabes": "RO-CHER", "muettes": [5], "lettres": 6}, "VALLÉE": {"syllabes": "VAL-LÉE", "muettes": [5], "lettres": 6}, "PLUIE": {"syllabes": "PLUIE", "muettes": [4], "lettres": 5}, "VENT": {"syllabes": "VENT", "muettes": [3], "lettres": 4}, "ÉTÉ": {"syllabes": "É-TÉ", "muettes": [], "lettres": 3}, "FROID": {"syllabes": "FROID", "muettes": [4], "lettres": 5}, "CHAUD": {"syllabes": "CHAUD", "muettes": [4], "lettres": 5}, "GEL": {"syllabes": "GEL", "muettes": [], "lettres": 3}, "ORAGE": {"syllabes": "O-RA-GE", "muettes": [4], "lettres": 5}, "HIVER": {"syllabes": "HI-VER", "muettes": [], "lettres": 5}, "AUTOMNE": {"syllabes": "AU-TOM-NE", "muettes": [4, 6], "lettres": 7}, "BROUILLARD": {"syllabes": "BROUIL-LARD", "muettes": [9], "lettres": 10}, "TEMPÊTE": {"syllabes": "TEM-PÊ-TE", "muettes": [6], "lettres": 7}, "ÉCLAIR": {"syllabes": "É-CLAIR", "muettes": [], "lettres": 6}, "CHALEUR": {"syllabes": "CHA-LEUR", "muettes": [], "lettres": 7}, "PRINTEMPS": {"syllabes": "PRIN-TEMPS", "muettes": [7, 8], "lettres": 9}, "ARC-EN-CIEL": {"syllabes": "ARC-EN-CIEL", "muettes": [], "lettres": 9}, "TONNERRE": {"syllabes": "TON-NER-RE", "muettes": [7], "lettres": 8}, "GRÊLE": {"syllabes": "GRÊ-LE", "muettes": [4], "lettres": 5}, "VERGLAS": {"syllabes": "VER-GLAS", "muettes": [6], "lettres": 7}, "TEMPÉRATURE": {"syllabes": "TEM-PÉ-RA-TU-RE", "muettes": [10], "lettres": 11}, "AVERSE": {"syllabes": "A-VER-SE", "muettes": [5], "lettres": 6}, "ROSÉE": {"syllabes": "RO-SÉE", "muettes": [4], "lettres": 5}, "TÊTE": {"syllabes": "TÊ-TE", "muettes": [3], "lettres": 4}, "MAIN": {"syllabes": "MAIN", "muettes": [], "lettres": 4}, "PIED": {"syllabes": "PIED", "muettes": [3], "lettres": 4}, "BRAS": {"syllabes": "BRAS", "muettes": [3], "lettres": 4}, "NEZ": {"syllabes": "NEZ", "muettes": [2], "lettres": 3}, "DOS": {"syllabes": "DOS", "muettes": [2], "lettres": 3}, "COU": {"syllabes": "COU", "muettes": [], "lettres": 3}, "DENT": {"syllabes": "DENT", "muettes": [3], "lettres": 4}, "JAMBE": {"syllabes": "JAM-BE", "muettes": [4], "lettres": 5}, "OREILLE": {"syllabes": "O-REIL-LE", "muettes": [6], "lettres": 7}, "GENOU": {"syllabes": "GE-NOU", "muettes": [], "lettres": 5}, "ÉPAULE": {"syllabes": "É-PAU-LE", "muettes": [5], "lettres": 6}, "CHEVEUX": {"syllabes": "CHE-VEUX", "muettes": [6], "lettres": 7}, "VENTRE": {"syllabes": "VEN-TRE", "muettes": [5], "lettres": 6}, "BOUCHE": {"syllabes": "BOU-CHE", "muettes": [5], "lettres": 6}, "DOIGT": {"syllabes": "DOIGT", "muettes": [3, 4], "lettres": 5}, "ESTOMAC": {"syllabes": "ES-TO-MAC", "muettes": [6], "lettres": 7}, "POIGNET": {"syllabes": "POI-GNET", "muettes": [6], "lettres": 7}, "CHEVILLE": {"syllabes": "CHE-VIL-LE", "muettes": [7], "lettres": 8}, "PAUPIÈRE": {"syllabes": "PAU-PIÈ-RE", "muettes": [7], "lettres": 8}, "MOLLET": {"syllabes": "MOL-LET", "muettes": [5], "lettres": 6}, "POUMON": {"syllabes": "POU-MON", "muettes": [], "lettres": 6}, "SQUELETTE": {"syllabes": "SQUE-LET-TE", "muettes": [8], "lettres": 9}, "COUDE": {"syllabes": "COU-DE", "muettes": [4], "lettres": 5}, "PAIN": {"syllabes": "PAIN", "muettes": [], "lettres": 4}, "LAIT": {"syllabes": "LAIT", "muettes": [3], "lettres": 4}, "RIZ": {"syllabes": "RIZ", "muettes": [2], "lettres": 3}, "POIRE": {"syllabes": "POI-RE", "muettes": [4], "lettres": 5}, "SOUPE": {"syllabes": "SOU-PE", "muettes": [4], "lettres": 5}, "MIEL": {"syllabes": "MIEL", "muettes": [], "lettres": 4}, "JUS": {"syllabes": "JUS", "muettes": [2], "lettres": 3}, "SEL": {"syllabes": "SEL", "muettes": [], "lettres": 3}, "FROMAGE": {"syllabes": "FRO-MA-GE", "muettes": [6], "lettres": 7}, "CAROTTE": {"syllabes": "CA-ROT-TE", "muettes": [6], "lettres": 7}, "CERISE": {"syllabes": "CE-RI-SE", "muettes": [5], "lettres": 6}, "BANANE": {"syllabes": "BA-NA-NE", "muettes": [5], "lettres": 6}, "TOMATE": {"syllabes": "TO-MA-TE", "muettes": [5], "lettres": 6}, "BEURRE": {"syllabes": "BEUR-RE", "muettes": [5], "lettres": 6}, "SALADE": {"syllabes": "SA-LA-DE", "muettes": [5], "lettres": 6}, "POULET": {"syllabes": "POU-LET", "muettes": [5], "lettres": 6}, "CHAMPIGNON": {"syllabes": "CHAM-PI-GNON", "muettes": [], "lettres": 10}, "CONCOMBRE": {"syllabes": "CON-COM-BRE", "muettes": [8], "lettres": 9}, "AUBERGINE": {"syllabes": "AU-BER-GI-NE", "muettes": [8], "lettres": 9}, "FRAMBOISE": {"syllabes": "FRAM-BOI-SE", "muettes": [8], "lettres": 9}, "ÉPINARD": {"syllabes": "É-PI-NARD", "muettes": [6], "lettres": 7}, "CITROUILLE": {"syllabes": "CI-TROUIL-LE", "muettes": [9], "lettres": 10}, "HARICOT": {"syllabes": "HA-RI-COT", "muettes": [0, 6], "lettres": 7}, "ANANAS": {"syllabes": "A-NA-NAS", "muettes": null, "lettres": 6}, "LIT": {"syllabes": "LIT", "muettes": [2], "lettres": 3}, "TABLE": {"syllabes": "TA-BLE", "muettes": [4], "lettres": 5}, "LAMPE": {"syllabes": "LAM-PE", "muettes": [4], "lettres": 5}, "PORTE": {"syllabes": "POR-TE", "muettes": [4], "lettres": 5}, "TAPIS": {"syllabes": "TA-PIS", "muettes": [4], "lettres": 5}, "BOL": {"syllabes": "BOL", "muettes": [], "lettres": 3}, "VERRE": {"syllabes": "VER-RE", "muettes": [4], "lettres": 5}, "FOUR": {"syllabes": "FOUR", "muettes": [], "lettres": 4}, "CHAISE": {"syllabes": "CHAI-SE", "muettes": [5], "lettres": 6}, "FENÊTRE": {"syllabes": "FE-NÊ-TRE", "muettes": [6], "lettres": 7}, "ARMOIRE": {"syllabes": "AR-MOI-RE", "muettes": [6], "lettres": 7}, "ESCALIER": {"syllabes": "ES-CA-LIER", "muettes": [7], "lettres": 8}, "CUISINE": {"syllabes": "CUI-SI-NE", "muettes": [6], "lettres": 7}, "PLACARD": {"syllabes": "PLA-CARD", "muettes": [6], "lettres": 7}, "COUSSIN": {"syllabes": "COUS-SIN", "muettes": [], "lettres": 7}, "MIROIR": {"syllabes": "MI-ROIR", "muettes": [], "lettres": 6}, "RÉFRIGÉRATEUR": {"syllabes": "RÉ-FRI-GÉ-RA-TEUR", "muettes": [], "lettres": 13}, "BAIGNOIRE": {"syllabes": "BAI-GNOI-RE", "muettes": [8], "lettres": 9}, "CHEMINÉE": {"syllabes": "CHE-MI-NÉE", "muettes": [7], "lettres": 8}, "ÉTAGÈRE": {"syllabes": "É-TA-GÈ-RE", "muettes": [6], "lettres": 7}, "CASSEROLE": {"syllabes": "CAS-SE-RO-LE", "muettes": [8], "lettres": 9}, "OREILLER": {"syllabes": "O-REIL-LER", "muettes": [7], "lettres": 8}, "TIROIR": {"syllabes": "TI-ROIR", "muettes": [], "lettres": 6}, "ASPIRATEUR": {"syllabes": "AS-PI-RA-TEUR", "muettes": [], "lettres": 10}, "PULL": {"syllabes": "PULL", "muettes": [], "lettres": 4}, "ROBE": {"syllabes": "RO-BE", "muettes": [3], "lettres": 4}, "JUPE": {"syllabes": "JU-PE", "muettes": [3], "lettres": 4}, "GANT": {"syllabes": "GANT", "muettes": [3], "lettres": 4}, "BOTTE": {"syllabes": "BOT-TE", "muettes": [4], "lettres": 5}, "BONNET": {"syllabes": "BON-NET", "muettes": [5], "lettres": 6}, "VESTE": {"syllabes": "VES-TE", "muettes": [4], "lettres": 5}, "CAPE": {"syllabes": "CA-PE", "muettes": [3], "lettres": 4}, "CHAPEAU": {"syllabes": "CHA-PEAU", "muettes": [], "lettres": 7}, "MANTEAU": {"syllabes": "MAN-TEAU", "muettes": [], "lettres": 7}, "PANTALON": {"syllabes": "PAN-TA-LON", "muettes": [], "lettres": 8}, "CHAUSSETTE": {"syllabes": "CHAUS-SET-TE", "muettes": [9], "lettres": 10}, "ÉCHARPE": {"syllabes": "É-CHAR-PE", "muettes": [6], "lettres": 7}, "CHEMISE": {"syllabes": "CHE-MI-SE", "muettes": [6], "lettres": 7}, "CEINTURE": {"syllabes": "CEIN-TU-RE", "muettes": [7], "lettres": 8}, "PYJAMA": {"syllabes": "PY-JA-MA", "muettes": [], "lettres": 6}, "BLOUSON": {"syllabes": "BLOU-SON", "muettes": [], "lettres": 7}, "IMPERMÉABLE": {"syllabes": "IM-PER-MÉ-A-BLE", "muettes": [10], "lettres": 11}, "SANDALE": {"syllabes": "SAN-DA-LE", "muettes": [6], "lettres": 7}, "CASQUETTE": {"syllabes": "CAS-QUET-TE", "muettes": [8], "lettres": 9}, "SALOPETTE": {"syllabes": "SA-LO-PET-TE", "muettes": [8], "lettres": 9}, "MAILLOT": {"syllabes": "MAIL-LOT", "muettes": [6], "lettres": 7}, "PANTOUFLE": {"syllabes": "PAN-TOU-FLE", "muettes": [8], "lettres": 9}, "CHAUSSURE": {"syllabes": "CHAUS-SU-RE", "muettes": [8], "lettres": 9}, "LIVRE": {"syllabes": "LI-VRE", "muettes": [4], "lettres": 5}, "COLLE": {"syllabes": "COL-LE", "muettes": [4], "lettres": 5}, "GOMME": {"syllabes": "GOM-ME", "muettes": [4], "lettres": 5}, "CRAIE": {"syllabes": "CRAIE", "muettes": [4], "lettres": 5}, "CLASSE": {"syllabes": "CLAS-SE", "muettes": [5], "lettres": 6}, "STYLO": {"syllabes": "STY-LO", "muettes": [], "lettres": 5}, "SAC": {"syllabes": "SAC", "muettes": [], "lettres": 3}, "AMI": {"syllabes": "A-MI", "muettes": [], "lettres": 3}, "CAHIER": {"syllabes": "CA-HIER", "muettes": [2, 5], "lettres": 6}, "CRAYON": {"syllabes": "CRA-YON", "muettes": [], "lettres": 6}, "RÈGLE": {"syllabes": "RÈ-GLE", "muettes": [4], "lettres": 5}, "TROUSSE": {"syllabes": "TROUS-SE", "muettes": [6], "lettres": 7}, "CARTABLE": {"syllabes": "CAR-TA-BLE", "muettes": [7], "lettres": 8}, "TABLEAU": {"syllabes": "TA-BLEAU", "muettes": [], "lettres": 7}, "CISEAUX": {"syllabes": "CI-SEAUX", "muettes": [6], "lettres": 7}, "MAÎTRE": {"syllabes": "MAÎ-TRE", "muettes": [5], "lettres": 6}, "RÉCRÉATION": {"syllabes": "RÉ-CRÉ-A-TION", "muettes": [], "lettres": 10}, "MAÎTRESSE": {"syllabes": "MAÎ-TRES-SE", "muettes": [8], "lettres": 9}, "DICTIONNAIRE": {"syllabes": "DIC-TION-NAI-RE", "muettes": [11], "lettres": 12}, "COMPAS": {"syllabes": "COM-PAS", "muettes": [5], "lettres": 6}, "PINCEAU": {"syllabes": "PIN-CEAU", "muettes": [], "lettres": 7}, "FEUTRE": {"syllabes": "FEU-TRE", "muettes": [5], "lettres": 6}, "ÉQUERRE": {"syllabes": "É-QUER-RE", "muettes": [6], "lettres": 7}, "BUREAU": {"syllabes": "BU-REAU", "muettes": [], "lettres": 6}, "CHEF": {"syllabes": "CHEF", "muettes": [], "lettres": 4}, "JUGE": {"syllabes": "JU-GE", "muettes": [3], "lettres": 4}, "PILOTE": {"syllabes": "PI-LO-TE", "muettes": [5], "lettres": 6}, "MAÇON": {"syllabes": "MA-ÇON", "muettes": [], "lettres": 5}, "FERMIER": {"syllabes": "FER-MIER", "muettes": [6], "lettres": 7}, "POMPIER": {"syllabes": "POM-PIER", "muettes": [6], "lettres": 7}, "PEINTRE": {"syllabes": "PEIN-TRE", "muettes": [6], "lettres": 7}, "FACTEUR": {"syllabes": "FAC-TEUR", "muettes": [], "lettres": 7}, "BOULANGER": {"syllabes": "BOU-LAN-GER", "muettes": [8], "lettres": 9}, "MÉDECIN": {"syllabes": "MÉ-DE-CIN", "muettes": [], "lettres": 7}, "COIFFEUR": {"syllabes": "COIF-FEUR", "muettes": [], "lettres": 8}, "JARDINIER": {"syllabes": "JAR-DI-NIER", "muettes": [8], "lettres": 9}, "INFIRMIER": {"syllabes": "IN-FIR-MIER", "muettes": [8], "lettres": 9}, "CUISINIER": {"syllabes": "CUI-SI-NIER", "muettes": [8], "lettres": 9}, "BOUCHER": {"syllabes": "BOU-CHER", "muettes": [6], "lettres": 7}, "DENTISTE": {"syllabes": "DEN-TIS-TE", "muettes": [7], "lettres": 8}, "VÉTÉRINAIRE": {"syllabes": "VÉ-TÉ-RI-NAI-RE", "muettes": [10], "lettres": 11}, "ARCHITECTE": {"syllabes": "AR-CHI-TEC-TE", "muettes": [9], "lettres": 10}, "PHARMACIEN": {"syllabes": "PHAR-MA-CIEN", "muettes": [], "lettres": 10}, "POLICIER": {"syllabes": "PO-LI-CIER", "muettes": [7], "lettres": 8}, "CHIRURGIEN": {"syllabes": "CHI-RUR-GIEN", "muettes": [], "lettres": 10}, "ASTRONAUTE": {"syllabes": "AS-TRO-NAU-TE", "muettes": [9], "lettres": 10}, "MENUISIER": {"syllabes": "ME-NUI-SIER", "muettes": [8], "lettres": 9}, "ÉLECTRICIEN": {"syllabes": "É-LEC-TRI-CIEN", "muettes": [], "lettres": 11}, "BUS": {"syllabes": "BUS", "muettes": [], "lettres": 3}, "LUGE": {"syllabes": "LU-GE", "muettes": [3], "lettres": 4}, "TAXI": {"syllabes": "TA-XI", "muettes": [], "lettres": 4}, "TRAM": {"syllabes": "TRAM", "muettes": [], "lettres": 4}, "AUTO": {"syllabes": "AU-TO", "muettes": [], "lettres": 4}, "CAMION": {"syllabes": "CA-MION", "muettes": [], "lettres": 6}, "MÉTRO": {"syllabes": "MÉ-TRO", "muettes": [], "lettres": 5}, "FUSÉE": {"syllabes": "FU-SÉE", "muettes": [4], "lettres": 5}, "TRACTEUR": {"syllabes": "TRAC-TEUR", "muettes": [], "lettres": 8}, "BARQUE": {"syllabes": "BAR-QUE", "muettes": [5], "lettres": 6}, "HÉLICOPTÈRE": {"syllabes": "HÉ-LI-COP-TÈ-RE", "muettes": [0, 10], "lettres": 11}, "AMBULANCE": {"syllabes": "AM-BU-LAN-CE", "muettes": [8], "lettres": 9}, "MONTGOLFIÈRE": {"syllabes": "MONT-GOL-FIÈ-RE", "muettes": [3, 11], "lettres": 12}, "TROTTINETTE": {"syllabes": "TROT-TI-NET-TE", "muettes": [10], "lettres": 11}, "SOUS-MARIN": {"syllabes": "SOUS-MA-RIN", "muettes": [3], "lettres": 9}, "PAQUEBOT": {"syllabes": "PA-QUE-BOT", "muettes": [7], "lettres": 8}, "TÉLÉPHÉRIQUE": {"syllabes": "TÉ-LÉ-PHÉ-RI-QUE", "muettes": [11], "lettres": 12}, "AUTOBUS": {"syllabes": "AU-TO-BUS", "muettes": [], "lettres": 7}, "ROUGE": {"syllabes": "ROU-GE", "muettes": [4], "lettres": 5}, "BLEU": {"syllabes": "BLEU", "muettes": [], "lettres": 4}, "VERT": {"syllabes": "VERT", "muettes": [3], "lettres": 4}, "NOIR": {"syllabes": "NOIR", "muettes": [], "lettres": 4}, "GRIS": {"syllabes": "GRIS", "muettes": [3], "lettres": 4}, "ROSE": {"syllabes": "RO-SE", "muettes": [3], "lettres": 4}, "ROND": {"syllabes": "ROND", "muettes": [3], "lettres": 4}, "BLANC": {"syllabes": "BLANC", "muettes": [4], "lettres": 5}, "JAUNE": {"syllabes": "JAU-NE", "muettes": [4], "lettres": 5}, "VIOLET": {"syllabes": "VI-O-LET", "muettes": [5], "lettres": 6}, "MARRON": {"syllabes": "MAR-RON", "muettes": [], "lettres": 6}, "CARRÉ": {"syllabes": "CAR-RÉ", "muettes": [], "lettres": 5}, "CERCLE": {"syllabes": "CER-CLE", "muettes": [5], "lettres": 6}, "LIGNE": {"syllabes": "LI-GNE", "muettes": [4], "lettres": 5}, "POINT": {"syllabes": "POINT", "muettes": [4], "lettres": 5}, "TRIANGLE": {"syllabes": "TRI-AN-GLE", "muettes": [7], "lettres": 8}, "RECTANGLE": {"syllabes": "REC-TAN-GLE", "muettes": [8], "lettres": 9}, "LOSANGE": {"syllabes": "LO-SAN-GE", "muettes": [6], "lettres": 7}, "TURQUOISE": {"syllabes": "TUR-QUOI-SE", "muettes": [8], "lettres": 9}, "BEIGE": {"syllabes": "BEI-GE", "muettes": [4], "lettres": 5}, "OVALE": {"syllabes": "O-VA-LE", "muettes": [4], "lettres": 5}, "CYLINDRE": {"syllabes": "CY-LIN-DRE", "muettes": [7], "lettres": 8}, "DORÉ": {"syllabes": "DO-RÉ", "muettes": [], "lettres": 4}, "JUDO": {"syllabes": "JU-DO", "muettes": [], "lettres": 4}, "SKI": {"syllabes": "SKI", "muettes": [], "lettres": 3}, "DANSE": {"syllabes": "DAN-SE", "muettes": [4], "lettres": 5}, "BALLE": {"syllabes": "BAL-LE", "muettes": [4], "lettres": 5}, "PIANO": {"syllabes": "PI-A-NO", "muettes": [], "lettres": 5}, "FLÛTE": {"syllabes": "FLÛ-TE", "muettes": [4], "lettres": 5}, "CHANT": {"syllabes": "CHANT", "muettes": [4], "lettres": 5}, "COURSE": {"syllabes": "COUR-SE", "muettes": [5], "lettres": 6}, "TENNIS": {"syllabes": "TEN-NIS", "muettes": [], "lettres": 6}, "FOOTBALL": {"syllabes": "FOOT-BALL", "muettes": [], "lettres": 8}, "NATATION": {"syllabes": "NA-TA-TION", "muettes": [], "lettres": 8}, "GUITARE": {"syllabes": "GUI-TA-RE", "muettes": [6], "lettres": 7}, "TAMBOUR": {"syllabes": "TAM-BOUR", "muettes": [], "lettres": 7}, "VIOLON": {"syllabes": "VI-O-LON", "muettes": [], "lettres": 6}, "TROMPETTE": {"syllabes": "TROM-PET-TE", "muettes": [8], "lettres": 9}, "ESCRIME": {"syllabes": "ES-CRI-ME", "muettes": [6], "lettres": 7}, "GYMNASTIQUE": {"syllabes": "GYM-NAS-TI-QUE", "muettes": [10], "lettres": 11}, "ÉQUITATION": {"syllabes": "É-QUI-TA-TION", "muettes": [], "lettres": 10}, "BASKET": {"syllabes": "BAS-KET", "muettes": [], "lettres": 6}, "ESCALADE": {"syllabes": "ES-CA-LA-DE", "muettes": [7], "lettres": 8}, "BATTERIE": {"syllabes": "BAT-TE-RIE", "muettes": [7], "lettres": 8}, "ACCORDÉON": {"syllabes": "AC-COR-DÉ-ON", "muettes": [], "lettres": 9}, "HARPE": {"syllabes": "HAR-PE", "muettes": [0, 4], "lettres": 5}};
  if (typeof module !== 'undefined' && module.exports) module.exports = { PACKS: PACKS, INFOS: INFOS };
  else racine.Cartes = { PACKS: PACKS, INFOS: INFOS };
})(this);
