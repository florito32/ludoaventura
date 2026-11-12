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
      ],
      "4": [
        "TRIMESTRE",
        "CALENDRIER",
        "DÉCENNIE",
        "LENDEMAIN",
        "MINUIT",
        "QUINZAINE",
        "ANNIVERSAIRE",
        "WEEK-END"
      ],
      "5": [
        "MILLÉNAIRE",
        "HEBDOMADAIRE",
        "SEMESTRE",
        "AVANT-VEILLE",
        "CRÉPUSCULE",
        "ÉPHÉMÉRIDE",
        "BISSEXTILE",
        "QUOTIDIEN"
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
      ],
      "4": [
        "VINGT-ET-UN",
        "SOIXANTE-ET-ONZE",
        "QUATRE-VINGTS",
        "DEUX-CENTS",
        "TRENTE-SIX",
        "CINQUANTE-HUIT",
        "QUATRE-VINGT-UN",
        "SOIXANTE-SEIZE"
      ],
      "5": [
        "QUATRE-VINGT-DIX-SEPT",
        "SOIXANTE-DIX-NEUF",
        "TROIS-CENT-QUATRE-VINGTS",
        "DEUX-MILLE-CENT",
        "CINQ-CENT-VINGT",
        "VINGTIÈME",
        "CENTIÈME",
        "MILLIONIÈME"
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
      ],
      "4": [
        "RHINOCÉROS",
        "CHIMPANZÉ",
        "DAUPHIN",
        "ESCARGOT",
        "GRENOUILLE",
        "SAUTERELLE",
        "CHAUVE-SOURIS",
        "PHOQUE"
      ],
      "5": [
        "ORNITHORYNQUE",
        "HIPPOCAMPE",
        "PHACOCHÈRE",
        "CAMÉLÉON",
        "CHEVREUIL",
        "PTÉRODACTYLE",
        "COCCINELLE",
        "ÉPERVIER"
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
      ],
      "4": [
        "CATHÉDRALE",
        "GYMNASE",
        "CHAPELLE",
        "FORTERESSE",
        "LABORATOIRE",
        "PHARMACIE",
        "MAIRIE",
        "CIMETIÈRE"
      ],
      "5": [
        "AMPHITHÉÂTRE",
        "BASILIQUE",
        "MONASTÈRE",
        "OBSERVATOIRE",
        "AQUEDUC",
        "CITADELLE",
        "HYPERMARCHÉ",
        "GRATTE-CIEL"
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
      ],
      "4": [
        "AUTRICHE",
        "IRLANDE",
        "POLOGNE",
        "TURQUIE",
        "HONGRIE",
        "SUÈDE",
        "ÉTHIOPIE",
        "COLOMBIE"
      ],
      "5": [
        "AFGHANISTAN",
        "KAZAKHSTAN",
        "PHILIPPINES",
        "MOZAMBIQUE",
        "AZERBAÏDJAN",
        "LIECHTENSTEIN",
        "MADAGASCAR",
        "NOUVELLE-ZÉLANDE"
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
      ],
      "4": [
        "CHAMONIX",
        "CHERBOURG",
        "BESANÇON",
        "VERSAILLES",
        "LIMOGES",
        "ORLÉANS",
        "BAYONNE",
        "CARCASSONNE"
      ],
      "5": [
        "BIARRITZ",
        "SAINT-ÉTIENNE",
        "AIX-EN-PROVENCE",
        "REIMS",
        "COPENHAGUE",
        "ÉDIMBOURG",
        "PHILADELPHIE",
        "SAINT-PÉTERSBOURG"
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
      ],
      "4": [
        "MARAIS",
        "PRESQU'ÎLE",
        "ARCHIPEL",
        "LAGUNE",
        "CRATÈRE",
        "SOMMET",
        "RUISSEAU",
        "OASIS"
      ],
      "5": [
        "STALACTITE",
        "STALAGMITE",
        "ATOLL",
        "FJORD",
        "GEYSER",
        "ESTUAIRE",
        "MANGROVE",
        "ÉCOSYSTÈME"
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
      ],
      "4": [
        "BOURRASQUE",
        "CANICULE",
        "SÉCHERESSE",
        "HUMIDITÉ",
        "BRUINE",
        "GIBOULÉE",
        "ÉCLAIRCIE",
        "THERMOMÈTRE"
      ],
      "5": [
        "TYPHON",
        "CYCLONE",
        "BLIZZARD",
        "MOUSSON",
        "ANTICYCLONE",
        "ÉQUINOXE",
        "SOLSTICE",
        "BAROMÈTRE"
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
      ],
      "4": [
        "CERVEAU",
        "NOMBRIL",
        "MÂCHOIRE",
        "NARINE",
        "CLAVICULE",
        "GENCIVE",
        "ARTÈRE",
        "THORAX"
      ],
      "5": [
        "PHALANGE",
        "TRACHÉE",
        "PANCRÉAS",
        "OMOPLATE",
        "LARYNX",
        "PHARYNX",
        "TYMPAN",
        "DIAPHRAGME"
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
      ],
      "4": [
        "CONFITURE",
        "CORNICHON",
        "CHOU-FLEUR",
        "BROCOLI",
        "COURGETTE",
        "POIREAU",
        "PAMPLEMOUSSE",
        "MYRTILLE"
      ],
      "5": [
        "ARTICHAUT",
        "RHUBARBE",
        "ÉCHALOTE",
        "CÉLERI",
        "MOZZARELLA",
        "FENOUIL",
        "GROSEILLE",
        "PISTACHE"
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
      ],
      "4": [
        "CANAPÉ",
        "FAUTEUIL",
        "VAISSELLE",
        "COUVERTURE",
        "GRILLE-PAIN",
        "LAVABO",
        "PLAFOND",
        "RIDEAU"
      ],
      "5": [
        "THERMOSTAT",
        "ABAT-JOUR",
        "ESCABEAU",
        "BOUILLOIRE",
        "VESTIBULE",
        "PERSIENNE",
        "TABOURET",
        "CHAUFFE-EAU"
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
      ],
      "4": [
        "SURVÊTEMENT",
        "MOUFLE",
        "CRAVATE",
        "GILET",
        "BRETELLE",
        "COLLANT",
        "TABLIER",
        "ESPADRILLE"
      ],
      "5": [
        "MOCASSIN",
        "BERMUDA",
        "SOMBRERO",
        "CHÂLE",
        "PARDESSUS",
        "CACHE-NEZ",
        "DÉBARDEUR",
        "ESCARPIN"
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
      ],
      "4": [
        "CALCULATRICE",
        "CANTINE",
        "AGENDA",
        "SURLIGNEUR",
        "PUPITRE",
        "CLASSEUR",
        "BUVARD",
        "CONJUGAISON"
      ],
      "5": [
        "ORTHOGRAPHE",
        "GÉOGRAPHIE",
        "GRAMMAIRE",
        "ENCYCLOPÉDIE",
        "PHOTOCOPIE",
        "RAPPORTEUR",
        "ARITHMÉTIQUE",
        "TAILLE-CRAYON"
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
      ],
      "4": [
        "AGRICULTEUR",
        "CHAUFFEUR",
        "PLOMBIER",
        "HORLOGER",
        "PÂTISSIER",
        "BIJOUTIER",
        "PHOTOGRAPHE",
        "MÉCANICIEN"
      ],
      "5": [
        "PSYCHOLOGUE",
        "ORTHOPHONISTE",
        "KINÉSITHÉRAPEUTE",
        "OPHTALMOLOGUE",
        "ARCHÉOLOGUE",
        "CHORÉGRAPHE",
        "PALÉONTOLOGUE",
        "ANESTHÉSISTE"
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
      ],
      "4": [
        "CAMIONNETTE",
        "MOTONEIGE",
        "DIRIGEABLE",
        "VOILIER",
        "PÉNICHE",
        "LOCOMOTIVE",
        "CATAMARAN",
        "AÉROGLISSEUR"
      ],
      "5": [
        "HYDRAVION",
        "MONOCYCLE",
        "FUNICULAIRE",
        "TÉLÉCABINE",
        "DÉPANNEUSE",
        "BATHYSCAPHE",
        "TRANSATLANTIQUE",
        "CHASSE-NEIGE"
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
      ],
      "4": [
        "PENTAGONE",
        "HEXAGONE",
        "SPHÈRE",
        "PYRAMIDE",
        "POURPRE",
        "ÉCARLATE",
        "KAKI",
        "ARGENTÉ"
      ],
      "5": [
        "PARALLÉLOGRAMME",
        "PARALLÉLÉPIPÈDE",
        "TRAPÈZE",
        "POLYGONE",
        "ELLIPSE",
        "VERMILLON",
        "FUCHSIA",
        "CRAMOISI"
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
      ],
      "4": [
        "CLARINETTE",
        "SAXOPHONE",
        "VIOLONCELLE",
        "RANDONNÉE",
        "PLONGÉE",
        "PATINAGE",
        "ATHLÉTISME",
        "CYCLISME"
      ],
      "5": [
        "HAUTBOIS",
        "HARMONICA",
        "BADMINTON",
        "HANDBALL",
        "TRIATHLON",
        "CONTREBASSE",
        "SYNTHÉTISEUR",
        "RUGBY"
      ]
    }
  }
];
  // Pour chaque mot : syllabes écrites, positions des lettres muettes (null = question non posée), nombre de lettres,
  // genre (m / f, null = pas un nom), pluriel (null = question non posée), elision (on dit « l' » devant le mot).
  var INFOS = {"LE": {"syllabes": "LE", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "UNE": {"syllabes": "U-NE", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "SA": {"syllabes": "SA", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "SON": {"syllabes": "SON", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "DES": {"syllabes": "DES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "SES": {"syllabes": "SES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "AU": {"syllabes": "AU", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "JE": {"syllabes": "JE", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "ELLE": {"syllabes": "EL-LE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ILS": {"syllabes": "ILS", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "Y": {"syllabes": "Y", "muettes": [], "lettres": 1, "genre": null, "pluriel": null, "elision": null}, "QUI": {"syllabes": "QUI", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "DONT": {"syllabes": "DONT", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ET": {"syllabes": "ET", "muettes": [1], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "OU": {"syllabes": "OU", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "ENSUITE": {"syllabes": "EN-SUI-TE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "DANS": {"syllabes": "DANS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "CHEZ": {"syllabes": "CHEZ", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "APRÈS": {"syllabes": "A-PRÈS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "PAR": {"syllabes": "PAR", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "OÙ": {"syllabes": "OÙ", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "ICI": {"syllabes": "I-CI", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "TÔT": {"syllabes": "TÔT", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "BIEN": {"syllabes": "BIEN", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "SI": {"syllabes": "SI", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "NOTRE": {"syllabes": "NO-TRE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "NOS": {"syllabes": "NOS", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "MAMAN": {"syllabes": "MA-MAN", "muettes": [], "lettres": 5, "genre": "f", "pluriel": "MAMANS", "elision": false}, "SŒUR": {"syllabes": "SŒUR", "muettes": [], "lettres": null, "genre": "f", "pluriel": "SŒURS", "elision": false}, "TONTON": {"syllabes": "TON-TON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "TONTONS", "elision": false}, "LA": {"syllabes": "LA", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "MA": {"syllabes": "MA", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "MON": {"syllabes": "MON", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "CE": {"syllabes": "CE", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "MES": {"syllabes": "MES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "CES": {"syllabes": "CES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "QUEL": {"syllabes": "QUEL", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "TU": {"syllabes": "TU", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "NOUS": {"syllabes": "NOUS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ELLES": {"syllabes": "EL-LES", "muettes": [3, 4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "TOUT": {"syllabes": "TOUT", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "QUE": {"syllabes": "QUE", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "OUI": {"syllabes": "OUI", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "CAR": {"syllabes": "CAR", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "ALORS": {"syllabes": "A-LORS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "DE": {"syllabes": "DE", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "SUR": {"syllabes": "SUR", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "ENTRE": {"syllabes": "EN-TRE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "AVEC": {"syllabes": "A-VEC", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "POUR": {"syllabes": "POUR", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "QUAND": {"syllabes": "QUAND", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "PRÈS": {"syllabes": "PRÈS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "TOUJOURS": {"syllabes": "TOU-JOURS", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "TROP": {"syllabes": "TROP", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "PLUS": {"syllabes": "PLUS", "muettes": null, "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "VOTRE": {"syllabes": "VO-TRE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "VOS": {"syllabes": "VOS", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "PAPA": {"syllabes": "PA-PA", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "PAPAS", "elision": false}, "COUSIN": {"syllabes": "COU-SIN", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "COUSINS", "elision": false}, "COUSINE": {"syllabes": "COU-SI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "COUSINES", "elision": false}, "UN": {"syllabes": "UN", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "TA": {"syllabes": "TA", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "TON": {"syllabes": "TON", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "LES": {"syllabes": "LES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "TES": {"syllabes": "TES", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "DU": {"syllabes": "DU", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "QUELLE": {"syllabes": "QUEL-LE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "IL": {"syllabes": "IL", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "VOUS": {"syllabes": "VOUS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "EN": {"syllabes": "EN", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "ON": {"syllabes": "ON", "muettes": [], "lettres": 2, "genre": null, "pluriel": null, "elision": null}, "QUOI": {"syllabes": "QUOI", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "NON": {"syllabes": "NON", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "MAIS": {"syllabes": "MAIS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "PUIS": {"syllabes": "PUIS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "À": {"syllabes": "À", "muettes": [], "lettres": 1, "genre": null, "pluriel": null, "elision": null}, "SOUS": {"syllabes": "SOUS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "AVANT": {"syllabes": "A-VANT", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "SANS": {"syllabes": "SANS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "COMME": {"syllabes": "COM-ME", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "COMMENT": {"syllabes": "COM-MENT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "TARD": {"syllabes": "TARD", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ENCORE": {"syllabes": "EN-CO-RE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "TRÈS": {"syllabes": "TRÈS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "MOINS": {"syllabes": "MOINS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "LEUR": {"syllabes": "LEUR", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "LEURS": {"syllabes": "LEURS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "FRÈRE": {"syllabes": "FRÈ-RE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "FRÈRES", "elision": false}, "TANTE": {"syllabes": "TAN-TE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "TANTES", "elision": false}, "MOI": {"syllabes": "MOI", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "PLUSIEURS": {"syllabes": "PLU-SIEURS", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "PEUT-ÊTRE": {"syllabes": "PEUT-Ê-TRE", "muettes": [3, 8], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "AUTOUR": {"syllabes": "AU-TOUR", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "DESSUS": {"syllabes": "DES-SUS", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "VERS": {"syllabes": "VERS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DEPUIS": {"syllabes": "DE-PUIS", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SAUF": {"syllabes": "SAUF", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "PARCE QUE": {"syllabes": "PAR-CE QUE", "muettes": [4], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "AILLEURS": {"syllabes": "AIL-LEURS", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "CÔTE À CÔTE": {"syllabes": "CÔ-TE À CÔ-TE", "muettes": [3, 10], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "AUJOURD'HUI": {"syllabes": "AU-JOUR-D'HUI", "muettes": [8], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "AVANT-HIER": {"syllabes": "A-VANT-HIER", "muettes": [6], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "DÉJÀ": {"syllabes": "DÉ-JÀ", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "HIER": {"syllabes": "HIER", "muettes": [0], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "EN RETARD": {"syllabes": "EN RE-TARD", "muettes": [8], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "MAINTENANT": {"syllabes": "MAIN-TE-NANT", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "SOUVENT": {"syllabes": "SOU-VENT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "AUSSI": {"syllabes": "AUS-SI", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "DAVANTAGE": {"syllabes": "DA-VAN-TA-GE", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "ENSEMBLE": {"syllabes": "EN-SEM-BLE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "BRUSQUEMENT": {"syllabes": "BRUS-QUE-MENT", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "FACILEMENT": {"syllabes": "FA-CI-LE-MENT", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "SAGEMENT": {"syllabes": "SA-GE-MENT", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "NE... PAS": {"syllabes": "NE... PAS", "muettes": [8], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "D’ACCORD": {"syllabes": "D’AC-CORD", "muettes": [7], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "DONC": {"syllabes": "DONC", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DERRIÈRE": {"syllabes": "DER-RIÈ-RE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DEVANT": {"syllabes": "DE-VANT", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "DURANT": {"syllabes": "DU-RANT", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "AFIN": {"syllabes": "A-FIN", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DÈS QUE": {"syllabes": "DÈS QUE", "muettes": [2], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "PENDANT QUE": {"syllabes": "PEN-DANT QUE", "muettes": [6], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "DEDANS": {"syllabes": "DE-DANS", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "LOIN": {"syllabes": "LOIN", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "AUSSITÔT": {"syllabes": "AUS-SI-TÔT", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "BIENTÔT": {"syllabes": "BIEN-TÔT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "DEMAIN": {"syllabes": "DE-MAIN", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "ENFIN": {"syllabes": "EN-FIN", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "QUELQUEFOIS": {"syllabes": "QUEL-QUE-FOIS", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "TOUT À COUP": {"syllabes": "TOUT À COUP", "muettes": [3, 10], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "AUTANT": {"syllabes": "AU-TANT", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "PRESQUE": {"syllabes": "PRES-QUE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "MIEUX": {"syllabes": "MIEUX", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "EXACTEMENT": {"syllabes": "E-XAC-TE-MENT", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "HEUREUSEMENT": {"syllabes": "HEU-REU-SE-MENT", "muettes": [0, 11], "lettres": 12, "genre": null, "pluriel": null, "elision": null}, "SEULEMENT": {"syllabes": "SEU-LE-MENT", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "NE… JAMAIS": {"syllabes": "NE… JA-MAIS", "muettes": [9], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "HÉLAS": {"syllabes": "HÉ-LAS", "muettes": [0], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "POURTANT": {"syllabes": "POUR-TANT", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DESSOUS": {"syllabes": "DES-SOUS", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "PARMI": {"syllabes": "PAR-MI", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "PENDANT": {"syllabes": "PEN-DANT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "MALGRÉ": {"syllabes": "MAL-GRÉ", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "LORSQUE": {"syllabes": "LORS-QUE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "POURQUOI": {"syllabes": "POUR-QUOI", "muettes": [], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DEHORS": {"syllabes": "DE-HORS", "muettes": [2, 5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "PARTOUT": {"syllabes": "PAR-TOUT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "AUTREFOIS": {"syllabes": "AU-TRE-FOIS", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "D'ABORD": {"syllabes": "D'A-BORD", "muettes": [6], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "EN CE MOMENT": {"syllabes": "EN CE MO-MENT", "muettes": [11], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "EN AVANCE": {"syllabes": "EN A-VAN-CE", "muettes": [8], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "LONGTEMPS": {"syllabes": "LONG-TEMPS", "muettes": [3, 7, 8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "SOUDAIN": {"syllabes": "SOU-DAIN", "muettes": [], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "ASSEZ": {"syllabes": "AS-SEZ", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "BEAUCOUP": {"syllabes": "BEAU-COUP", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DEBOUT": {"syllabes": "DE-BOUT", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SINON": {"syllabes": "SI-NON", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "DOUCEMENT": {"syllabes": "DOU-CE-MENT", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "LENTEMENT": {"syllabes": "LEN-TE-MENT", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "NE… GUÈRE": {"syllabes": "NE… GUÈ-RE", "muettes": [8], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "NE… PLUS": {"syllabes": "NE… PLUS", "muettes": [7], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "LUNDI": {"syllabes": "LUN-DI", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "LUNDIS", "elision": false}, "JEUDI": {"syllabes": "JEU-DI", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "JEUDIS", "elision": false}, "DIMANCHE": {"syllabes": "DI-MAN-CHE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "DIMANCHES", "elision": false}, "MOIS": {"syllabes": "MOIS", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "MOIS", "elision": false}, "MARS": {"syllabes": "MARS", "muettes": [], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "JUIN": {"syllabes": "JUIN", "muettes": [], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "SEPTEMBRE": {"syllabes": "SEP-TEM-BRE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": null, "elision": false}, "DÉCEMBRE": {"syllabes": "DÉ-CEM-BRE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "MARDI": {"syllabes": "MAR-DI", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "MARDIS", "elision": false}, "VENDREDI": {"syllabes": "VEN-DRE-DI", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "VENDREDIS", "elision": false}, "JOUR": {"syllabes": "JOUR", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "JOURS", "elision": false}, "JANVIER": {"syllabes": "JAN-VIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "AVRIL": {"syllabes": "A-VRIL", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": true}, "JUILLET": {"syllabes": "JUIL-LET", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "OCTOBRE": {"syllabes": "OC-TO-BRE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": true}, "ANNÉE": {"syllabes": "AN-NÉE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "ANNÉES", "elision": true}, "MERCREDI": {"syllabes": "MER-CRE-DI", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "MERCREDIS", "elision": false}, "SAMEDI": {"syllabes": "SA-ME-DI", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "SAMEDIS", "elision": false}, "SEMAINE": {"syllabes": "SE-MAI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "SEMAINES", "elision": false}, "FÉVRIER": {"syllabes": "FÉ-VRIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "MAI": {"syllabes": "MAI", "muettes": [], "lettres": 3, "genre": "m", "pluriel": null, "elision": false}, "AOÛT": {"syllabes": "AOÛT", "muettes": null, "lettres": 4, "genre": "m", "pluriel": null, "elision": true}, "NOVEMBRE": {"syllabes": "NO-VEM-BRE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "SIÈCLE": {"syllabes": "SIÈ-CLE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "SIÈCLES", "elision": false}, "TRIMESTRE": {"syllabes": "TRI-MES-TRE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "TRIMESTRES", "elision": false}, "CALENDRIER": {"syllabes": "CA-LEN-DRIER", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": "CALENDRIERS", "elision": false}, "DÉCENNIE": {"syllabes": "DÉ-CEN-NIE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "DÉCENNIES", "elision": false}, "LENDEMAIN": {"syllabes": "LEN-DE-MAIN", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "LENDEMAINS", "elision": false}, "MINUIT": {"syllabes": "MI-NUIT", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "QUINZAINE": {"syllabes": "QUIN-ZAI-NE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "QUINZAINES", "elision": false}, "ANNIVERSAIRE": {"syllabes": "AN-NI-VER-SAI-RE", "muettes": [11], "lettres": 12, "genre": "m", "pluriel": "ANNIVERSAIRES", "elision": true}, "WEEK-END": {"syllabes": "WEEK-END", "muettes": null, "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "MILLÉNAIRE": {"syllabes": "MIL-LÉ-NAI-RE", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": "MILLÉNAIRES", "elision": false}, "HEBDOMADAIRE": {"syllabes": "HEB-DO-MA-DAI-RE", "muettes": [0, 11], "lettres": 12, "genre": "m", "pluriel": "HEBDOMADAIRES", "elision": true}, "SEMESTRE": {"syllabes": "SE-MES-TRE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "SEMESTRES", "elision": false}, "AVANT-VEILLE": {"syllabes": "A-VANT-VEIL-LE", "muettes": [4, 11], "lettres": 11, "genre": "f", "pluriel": null, "elision": true}, "CRÉPUSCULE": {"syllabes": "CRÉ-PUS-CU-LE", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": "CRÉPUSCULES", "elision": false}, "ÉPHÉMÉRIDE": {"syllabes": "É-PHÉ-MÉ-RI-DE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "ÉPHÉMÉRIDES", "elision": true}, "BISSEXTILE": {"syllabes": "BIS-SEX-TI-LE", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "QUOTIDIEN": {"syllabes": "QUO-TI-DIEN", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "QUOTIDIENS", "elision": false}, "ZÉRO": {"syllabes": "ZÉ-RO", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "TROIS": {"syllabes": "TROIS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "SIX": {"syllabes": "SIX", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "NEUF": {"syllabes": "NEUF", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DOUZE": {"syllabes": "DOU-ZE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "QUINZE": {"syllabes": "QUIN-ZE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "DIX-HUIT": {"syllabes": "DIX-HUIT", "muettes": [4], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "TRENTE": {"syllabes": "TREN-TE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SOIXANTE": {"syllabes": "SOI-XAN-TE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "QUATRE-VINGT-DIX": {"syllabes": "QUA-TRE-VINGT-DIX", "muettes": [5, 10, 11], "lettres": 14, "genre": null, "pluriel": null, "elision": null}, "MILLIER": {"syllabes": "MIL-LIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "MILLIERS", "elision": false}, "UNITÉ": {"syllabes": "U-NI-TÉ", "muettes": [], "lettres": 5, "genre": "f", "pluriel": "UNITÉS", "elision": true}, "QUATRE": {"syllabes": "QUA-TRE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SEPT": {"syllabes": "SEPT", "muettes": [2], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DIX": {"syllabes": "DIX", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "TREIZE": {"syllabes": "TREI-ZE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SEIZE": {"syllabes": "SEI-ZE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "DIX-NEUF": {"syllabes": "DIX-NEUF", "muettes": [], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "QUARANTE": {"syllabes": "QUA-RAN-TE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "SOIXANTE-DIX": {"syllabes": "SOI-XAN-TE-DIX", "muettes": [7], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "CENT": {"syllabes": "CENT", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "MILLION": {"syllabes": "MIL-LION", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "MILLIONS", "elision": false}, "DIZAINE": {"syllabes": "DI-ZAI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "DIZAINES", "elision": false}, "DEUX": {"syllabes": "DEUX", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "CINQ": {"syllabes": "CINQ", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "HUIT": {"syllabes": "HUIT", "muettes": [0], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ONZE": {"syllabes": "ON-ZE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "QUATORZE": {"syllabes": "QUA-TOR-ZE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DIX-SEPT": {"syllabes": "DIX-SEPT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "VINGT": {"syllabes": "VINGT", "muettes": [3, 4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "CINQUANTE": {"syllabes": "CIN-QUAN-TE", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "QUATRE-VINGT": {"syllabes": "QUA-TRE-VINGT", "muettes": [5, 10, 11], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "MILLE": {"syllabes": "MIL-LE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "MILLIARD": {"syllabes": "MIL-LIARD", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "MILLIARDS", "elision": false}, "CENTAINE": {"syllabes": "CEN-TAI-NE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "CENTAINES", "elision": false}, "VINGT-ET-UN": {"syllabes": "VINGT-ET-UN", "muettes": null, "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "SOIXANTE-ET-ONZE": {"syllabes": "SOI-XAN-TE-ET-ON-ZE", "muettes": null, "lettres": 14, "genre": null, "pluriel": null, "elision": null}, "QUATRE-VINGTS": {"syllabes": "QUA-TRE-VINGTS", "muettes": null, "lettres": 12, "genre": null, "pluriel": null, "elision": null}, "DEUX-CENTS": {"syllabes": "DEUX-CENTS", "muettes": null, "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "TRENTE-SIX": {"syllabes": "TREN-TE-SIX", "muettes": null, "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "CINQUANTE-HUIT": {"syllabes": "CIN-QUAN-TE-HUIT", "muettes": null, "lettres": 13, "genre": null, "pluriel": null, "elision": null}, "QUATRE-VINGT-UN": {"syllabes": "QUA-TRE-VINGT-UN", "muettes": null, "lettres": 13, "genre": null, "pluriel": null, "elision": null}, "SOIXANTE-SEIZE": {"syllabes": "SOI-XAN-TE-SEI-ZE", "muettes": null, "lettres": 13, "genre": null, "pluriel": null, "elision": null}, "QUATRE-VINGT-DIX-SEPT": {"syllabes": "QUA-TRE-VINGT-DIX-SEPT", "muettes": null, "lettres": 18, "genre": null, "pluriel": null, "elision": null}, "SOIXANTE-DIX-NEUF": {"syllabes": "SOI-XAN-TE-DIX-NEUF", "muettes": null, "lettres": 15, "genre": null, "pluriel": null, "elision": null}, "TROIS-CENT-QUATRE-VINGTS": {"syllabes": "TROIS-CENT-QUA-TRE-VINGTS", "muettes": null, "lettres": 21, "genre": null, "pluriel": null, "elision": null}, "DEUX-MILLE-CENT": {"syllabes": "DEUX-MIL-LE-CENT", "muettes": null, "lettres": 13, "genre": null, "pluriel": null, "elision": null}, "CINQ-CENT-VINGT": {"syllabes": "CINQ-CENT-VINGT", "muettes": null, "lettres": 13, "genre": null, "pluriel": null, "elision": null}, "VINGTIÈME": {"syllabes": "VING-TIÈ-ME", "muettes": [3, 8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "CENTIÈME": {"syllabes": "CEN-TIÈ-ME", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "MILLIONIÈME": {"syllabes": "MIL-LI-O-NIÈ-ME", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "AVION": {"syllabes": "A-VION", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "AVIONS", "elision": true}, "BALLON": {"syllabes": "BAL-LON", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "CHAT": {"syllabes": "CHAT", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "DOMINO": {"syllabes": "DO-MI-NO", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "ÉLÉPHANT": {"syllabes": "É-LÉ-PHANT", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "FLEUR": {"syllabes": "FLEUR", "muettes": [], "lettres": 5, "genre": "f", "pluriel": "FLEURS", "elision": false}, "GIRAFE": {"syllabes": "GI-RA-FE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "HIBOU": {"syllabes": "HI-BOU", "muettes": [0], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "ÎLE": {"syllabes": "Î-LE", "muettes": [2], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "JARDIN": {"syllabes": "JAR-DIN", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "KIWI": {"syllabes": "KI-WI", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "LION": {"syllabes": "LI-ON", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "MAISON": {"syllabes": "MAI-SON", "muettes": [], "lettres": 6, "genre": "f", "pluriel": "MAISONS", "elision": false}, "NUAGE": {"syllabes": "NU-A-GE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "NUAGES", "elision": false}, "OLIVE": {"syllabes": "O-LI-VE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "POMME": {"syllabes": "POM-ME", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "QUILLE": {"syllabes": "QUIL-LE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "RENARD": {"syllabes": "RE-NARD", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "SOLEIL": {"syllabes": "SO-LEIL", "muettes": [], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "TIGRE": {"syllabes": "TI-GRE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "UNIVERS": {"syllabes": "U-NI-VERS", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "VÉLO": {"syllabes": "VÉ-LO", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "VÉLOS", "elision": false}, "WAGON": {"syllabes": "WA-GON", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "XYLOPHONE": {"syllabes": "XY-LO-PHO-NE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "XYLOPHONES", "elision": false}, "YAOURT": {"syllabes": "YA-OURT", "muettes": null, "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "ZÈBRE": {"syllabes": "ZÈ-BRE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "ABEILLE": {"syllabes": "A-BEIL-LE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "BATEAU": {"syllabes": "BA-TEAU", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "BATEAUX", "elision": false}, "CHOCOLAT": {"syllabes": "CHO-CO-LAT", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "DINOSAURE": {"syllabes": "DI-NO-SAU-RE", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "ÉTOILE": {"syllabes": "É-TOI-LE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "FORÊT": {"syllabes": "FO-RÊT", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "FORÊTS", "elision": false}, "GÂTEAU": {"syllabes": "GÂ-TEAU", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "HABIT": {"syllabes": "HA-BIT", "muettes": [0, 4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "IMAGE": {"syllabes": "I-MA-GE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "JOUET": {"syllabes": "JOU-ET", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "KOALA": {"syllabes": "KO-A-LA", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "LUNE": {"syllabes": "LU-NE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "MOTO": {"syllabes": "MO-TO", "muettes": [], "lettres": 4, "genre": "f", "pluriel": "MOTOS", "elision": false}, "NEIGE": {"syllabes": "NEI-GE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "ORANGE": {"syllabes": "O-RAN-GE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "PAPILLON": {"syllabes": "PA-PIL-LON", "muettes": [], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "ROBOT": {"syllabes": "RO-BOT", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "SERPENT": {"syllabes": "SER-PENT", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "TRAIN": {"syllabes": "TRAIN", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "TRAINS", "elision": false}, "USINE": {"syllabes": "U-SI-NE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "VOITURE": {"syllabes": "VOI-TU-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "VOITURES", "elision": false}, "WAPITI": {"syllabes": "WA-PI-TI", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "XÉNON": {"syllabes": "XÉ-NON", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "YOGA": {"syllabes": "YO-GA", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ZOO": {"syllabes": "ZOO", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "CHIEN": {"syllabes": "CHIEN", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "CHIENS", "elision": false}, "LAPIN": {"syllabes": "LA-PIN", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "LAPINS", "elision": false}, "OURS": {"syllabes": "OURS", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "OURS", "elision": true}, "LOUP": {"syllabes": "LOUP", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "LOUPS", "elision": false}, "COQ": {"syllabes": "COQ", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "COQS", "elision": false}, "VACHE": {"syllabes": "VA-CHE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "VACHES", "elision": false}, "POULE": {"syllabes": "POU-LE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "POULES", "elision": false}, "CANARD": {"syllabes": "CA-NARD", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "CANARDS", "elision": false}, "CHEVAL": {"syllabes": "CHE-VAL", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "CHEVAUX", "elision": false}, "MOUTON": {"syllabes": "MOU-TON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "MOUTONS", "elision": false}, "TORTUE": {"syllabes": "TOR-TUE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "TORTUES", "elision": false}, "SINGE": {"syllabes": "SIN-GE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "SINGES", "elision": false}, "OISEAU": {"syllabes": "OI-SEAU", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "OISEAUX", "elision": true}, "CHÈVRE": {"syllabes": "CHÈ-VRE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "CHÈVRES", "elision": false}, "COCHON": {"syllabes": "CO-CHON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "COCHONS", "elision": false}, "BALEINE": {"syllabes": "BA-LEI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "BALEINES", "elision": false}, "CROCODILE": {"syllabes": "CRO-CO-DI-LE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "CROCODILES", "elision": false}, "ÉCUREUIL": {"syllabes": "É-CU-REUIL", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "ÉCUREUILS", "elision": true}, "HIPPOPOTAME": {"syllabes": "HIP-PO-PO-TA-ME", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "HIPPOPOTAMES", "elision": true}, "KANGOUROU": {"syllabes": "KAN-GOU-ROU", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "KANGOUROUS", "elision": false}, "PINGOUIN": {"syllabes": "PIN-GOUIN", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "PINGOUINS", "elision": false}, "HÉRISSON": {"syllabes": "HÉ-RIS-SON", "muettes": [0], "lettres": 8, "genre": "m", "pluriel": "HÉRISSONS", "elision": false}, "PANTHÈRE": {"syllabes": "PAN-THÈ-RE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "PANTHÈRES", "elision": false}, "GUÊPE": {"syllabes": "GUÊ-PE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "GUÊPES", "elision": false}, "RHINOCÉROS": {"syllabes": "RHI-NO-CÉ-ROS", "muettes": [1], "lettres": 10, "genre": "m", "pluriel": "RHINOCÉROS", "elision": false}, "CHIMPANZÉ": {"syllabes": "CHIM-PAN-ZÉ", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "CHIMPANZÉS", "elision": false}, "DAUPHIN": {"syllabes": "DAU-PHIN", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "DAUPHINS", "elision": false}, "ESCARGOT": {"syllabes": "ES-CAR-GOT", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "ESCARGOTS", "elision": true}, "GRENOUILLE": {"syllabes": "GRE-NOUIL-LE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "GRENOUILLES", "elision": false}, "SAUTERELLE": {"syllabes": "SAU-TE-REL-LE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "SAUTERELLES", "elision": false}, "CHAUVE-SOURIS": {"syllabes": "CHAU-VE-SOU-RIS", "muettes": [5, 12], "lettres": 12, "genre": "f", "pluriel": "CHAUVES-SOURIS", "elision": false}, "PHOQUE": {"syllabes": "PHO-QUE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "PHOQUES", "elision": false}, "ORNITHORYNQUE": {"syllabes": "OR-NI-THO-RYN-QUE", "muettes": [12], "lettres": 13, "genre": "m", "pluriel": "ORNITHORYNQUES", "elision": true}, "HIPPOCAMPE": {"syllabes": "HIP-PO-CAM-PE", "muettes": [0, 9], "lettres": 10, "genre": "m", "pluriel": "HIPPOCAMPES", "elision": true}, "PHACOCHÈRE": {"syllabes": "PHA-CO-CHÈ-RE", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": "PHACOCHÈRES", "elision": false}, "CAMÉLÉON": {"syllabes": "CA-MÉ-LÉ-ON", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "CAMÉLÉONS", "elision": false}, "CHEVREUIL": {"syllabes": "CHE-VREUIL", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "CHEVREUILS", "elision": false}, "PTÉRODACTYLE": {"syllabes": "PTÉ-RO-DAC-TY-LE", "muettes": [11], "lettres": 12, "genre": "m", "pluriel": "PTÉRODACTYLES", "elision": false}, "COCCINELLE": {"syllabes": "COC-CI-NEL-LE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "COCCINELLES", "elision": false}, "ÉPERVIER": {"syllabes": "É-PER-VIER", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "ÉPERVIERS", "elision": true}, "PONT": {"syllabes": "PONT", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "PONTS", "elision": false}, "MUR": {"syllabes": "MUR", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "MURS", "elision": false}, "TOUR": {"syllabes": "TOUR", "muettes": [], "lettres": 4, "genre": "f", "pluriel": "TOURS", "elision": false}, "GARE": {"syllabes": "GA-RE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "GARES", "elision": false}, "PORT": {"syllabes": "PORT", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "PORTS", "elision": false}, "PARC": {"syllabes": "PARC", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "PARCS", "elision": false}, "RUE": {"syllabes": "RUE", "muettes": [2], "lettres": 3, "genre": "f", "pluriel": "RUES", "elision": false}, "ÉCOLE": {"syllabes": "É-CO-LE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "ÉCOLES", "elision": true}, "CHÂTEAU": {"syllabes": "CHÂ-TEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "CHÂTEAUX", "elision": false}, "CABANE": {"syllabes": "CA-BA-NE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "CABANES", "elision": false}, "GRENIER": {"syllabes": "GRE-NIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "GRENIERS", "elision": false}, "MAGASIN": {"syllabes": "MA-GA-SIN", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "MAGASINS", "elision": false}, "VILLAGE": {"syllabes": "VIL-LA-GE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "VILLAGES", "elision": false}, "CHEMIN": {"syllabes": "CHE-MIN", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "CHEMINS", "elision": false}, "FERME": {"syllabes": "FER-ME", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "FERMES", "elision": false}, "HÔPITAL": {"syllabes": "HÔ-PI-TAL", "muettes": [0], "lettres": 7, "genre": "m", "pluriel": "HÔPITAUX", "elision": true}, "BIBLIOTHÈQUE": {"syllabes": "BI-BLI-O-THÈ-QUE", "muettes": [11], "lettres": 12, "genre": "f", "pluriel": "BIBLIOTHÈQUES", "elision": false}, "IMMEUBLE": {"syllabes": "IM-MEU-BLE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "IMMEUBLES", "elision": true}, "ÉGLISE": {"syllabes": "É-GLI-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "ÉGLISES", "elision": true}, "MUSÉE": {"syllabes": "MU-SÉE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "MUSÉES", "elision": false}, "BOULANGERIE": {"syllabes": "BOU-LAN-GE-RIE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": "BOULANGERIES", "elision": false}, "PHARE": {"syllabes": "PHA-RE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "PHARES", "elision": false}, "AÉROPORT": {"syllabes": "A-É-RO-PORT", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "AÉROPORTS", "elision": true}, "CATHÉDRALE": {"syllabes": "CA-THÉ-DRA-LE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "CATHÉDRALES", "elision": false}, "GYMNASE": {"syllabes": "GYM-NA-SE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "GYMNASES", "elision": false}, "CHAPELLE": {"syllabes": "CHA-PEL-LE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "CHAPELLES", "elision": false}, "FORTERESSE": {"syllabes": "FOR-TE-RES-SE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "FORTERESSES", "elision": false}, "LABORATOIRE": {"syllabes": "LA-BO-RA-TOI-RE", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "LABORATOIRES", "elision": false}, "PHARMACIE": {"syllabes": "PHAR-MA-CIE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "PHARMACIES", "elision": false}, "MAIRIE": {"syllabes": "MAI-RIE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "MAIRIES", "elision": false}, "CIMETIÈRE": {"syllabes": "CI-ME-TIÈ-RE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "CIMETIÈRES", "elision": false}, "AMPHITHÉÂTRE": {"syllabes": "AM-PHI-THÉ-Â-TRE", "muettes": [11], "lettres": 12, "genre": "m", "pluriel": "AMPHITHÉÂTRES", "elision": true}, "BASILIQUE": {"syllabes": "BA-SI-LI-QUE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "BASILIQUES", "elision": false}, "MONASTÈRE": {"syllabes": "MO-NAS-TÈ-RE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "MONASTÈRES", "elision": false}, "OBSERVATOIRE": {"syllabes": "OB-SER-VA-TOI-RE", "muettes": [11], "lettres": 12, "genre": "m", "pluriel": "OBSERVATOIRES", "elision": true}, "AQUEDUC": {"syllabes": "A-QUE-DUC", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "AQUEDUCS", "elision": true}, "CITADELLE": {"syllabes": "CI-TA-DEL-LE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "CITADELLES", "elision": false}, "HYPERMARCHÉ": {"syllabes": "HY-PER-MAR-CHÉ", "muettes": [0], "lettres": 11, "genre": "m", "pluriel": "HYPERMARCHÉS", "elision": true}, "GRATTE-CIEL": {"syllabes": "GRAT-TE-CIEL", "muettes": [5], "lettres": 10, "genre": "m", "pluriel": null, "elision": false}, "FRANCE": {"syllabes": "FRAN-CE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": null, "elision": false}, "ITALIE": {"syllabes": "I-TA-LIE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": null, "elision": true}, "CHINE": {"syllabes": "CHI-NE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "JAPON": {"syllabes": "JA-PON", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "INDE": {"syllabes": "IN-DE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": null, "elision": true}, "MAROC": {"syllabes": "MA-ROC", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "PÉROU": {"syllabes": "PÉ-ROU", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "CHILI": {"syllabes": "CHI-LI", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "ESPAGNE": {"syllabes": "ES-PA-GNE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": null, "elision": true}, "BELGIQUE": {"syllabes": "BEL-GI-QUE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": null, "elision": false}, "SUISSE": {"syllabes": "SUIS-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": null, "elision": false}, "CANADA": {"syllabes": "CA-NA-DA", "muettes": [], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "BRÉSIL": {"syllabes": "BRÉ-SIL", "muettes": [], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "ÉGYPTE": {"syllabes": "É-GYP-TE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": null, "elision": true}, "GRÈCE": {"syllabes": "GRÈ-CE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "KENYA": {"syllabes": "KE-NYA", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "ALLEMAGNE": {"syllabes": "AL-LE-MA-GNE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": null, "elision": true}, "ANGLETERRE": {"syllabes": "AN-GLE-TER-RE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": null, "elision": true}, "PORTUGAL": {"syllabes": "POR-TU-GAL", "muettes": [], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "AUSTRALIE": {"syllabes": "AUS-TRA-LIE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": null, "elision": true}, "MEXIQUE": {"syllabes": "ME-XI-QUE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "ARGENTINE": {"syllabes": "AR-GEN-TI-NE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": null, "elision": true}, "SÉNÉGAL": {"syllabes": "SÉ-NÉ-GAL", "muettes": [], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "NORVÈGE": {"syllabes": "NOR-VÈ-GE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": null, "elision": false}, "AUTRICHE": {"syllabes": "AU-TRI-CHE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": null, "elision": true}, "IRLANDE": {"syllabes": "IR-LAN-DE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": null, "elision": true}, "POLOGNE": {"syllabes": "PO-LO-GNE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": null, "elision": false}, "TURQUIE": {"syllabes": "TUR-QUIE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": null, "elision": false}, "HONGRIE": {"syllabes": "HON-GRIE", "muettes": [0, 6], "lettres": 7, "genre": "f", "pluriel": null, "elision": false}, "SUÈDE": {"syllabes": "SUÈ-DE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "ÉTHIOPIE": {"syllabes": "É-THI-O-PIE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": null, "elision": true}, "COLOMBIE": {"syllabes": "CO-LOM-BIE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": null, "elision": false}, "AFGHANISTAN": {"syllabes": "AF-GHA-NIS-TAN", "muettes": [3], "lettres": 11, "genre": "m", "pluriel": null, "elision": true}, "KAZAKHSTAN": {"syllabes": "KA-ZAKHS-TAN", "muettes": [5], "lettres": 10, "genre": "m", "pluriel": null, "elision": false}, "PHILIPPINES": {"syllabes": "PHI-LIP-PI-NES", "muettes": [9, 10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "MOZAMBIQUE": {"syllabes": "MO-ZAM-BI-QUE", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": null, "elision": false}, "AZERBAÏDJAN": {"syllabes": "A-ZER-BAÏ-DJAN", "muettes": [], "lettres": 11, "genre": "m", "pluriel": null, "elision": true}, "LIECHTENSTEIN": {"syllabes": "LIECH-TEN-STEIN", "muettes": null, "lettres": 13, "genre": "m", "pluriel": null, "elision": false}, "MADAGASCAR": {"syllabes": "MA-DA-GAS-CAR", "muettes": [], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "NOUVELLE-ZÉLANDE": {"syllabes": "NOU-VEL-LE-ZÉ-LAN-DE", "muettes": [7, 15], "lettres": 15, "genre": "f", "pluriel": null, "elision": false}, "PARIS": {"syllabes": "PA-RIS", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "LYON": {"syllabes": "LY-ON", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "NICE": {"syllabes": "NI-CE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "LILLE": {"syllabes": "LIL-LE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "NANTES": {"syllabes": "NAN-TES", "muettes": [4, 5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "ROME": {"syllabes": "RO-ME", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "BREST": {"syllabes": "BREST", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "PAU": {"syllabes": "PAU", "muettes": [], "lettres": 3, "genre": null, "pluriel": null, "elision": null}, "MARSEILLE": {"syllabes": "MAR-SEIL-LE", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "BORDEAUX": {"syllabes": "BOR-DEAUX", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "TOULOUSE": {"syllabes": "TOU-LOU-SE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "RENNES": {"syllabes": "REN-NES", "muettes": [4, 5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "LONDRES": {"syllabes": "LON-DRES", "muettes": [5, 6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "BERLIN": {"syllabes": "BER-LIN", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "MADRID": {"syllabes": "MA-DRID", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "TOKYO": {"syllabes": "TO-KYO", "muettes": [], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "STRASBOURG": {"syllabes": "STRAS-BOURG", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "MONTPELLIER": {"syllabes": "MONT-PEL-LIER", "muettes": [3, 10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "GRENOBLE": {"syllabes": "GRE-NO-BLE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "PERPIGNAN": {"syllabes": "PER-PI-GNAN", "muettes": [], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "BRUXELLES": {"syllabes": "BRU-XEL-LES", "muettes": [7, 8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "GENÈVE": {"syllabes": "GE-NÈ-VE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "LISBONNE": {"syllabes": "LIS-BON-NE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "AMSTERDAM": {"syllabes": "AMS-TER-DAM", "muettes": [], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "CHAMONIX": {"syllabes": "CHA-MO-NIX", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "CHERBOURG": {"syllabes": "CHER-BOURG", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "BESANÇON": {"syllabes": "BE-SAN-ÇON", "muettes": [], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "VERSAILLES": {"syllabes": "VER-SAIL-LES", "muettes": [8, 9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "LIMOGES": {"syllabes": "LI-MO-GES", "muettes": [5, 6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "ORLÉANS": {"syllabes": "OR-LÉ-ANS", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "BAYONNE": {"syllabes": "BA-YON-NE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "CARCASSONNE": {"syllabes": "CAR-CAS-SON-NE", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "BIARRITZ": {"syllabes": "BI-AR-RITZ", "muettes": [], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "SAINT-ÉTIENNE": {"syllabes": "SAINT-É-TIEN-NE", "muettes": [4, 12], "lettres": 12, "genre": null, "pluriel": null, "elision": null}, "AIX-EN-PROVENCE": {"syllabes": "AIX-EN-PRO-VEN-CE", "muettes": [14], "lettres": 13, "genre": null, "pluriel": null, "elision": null}, "REIMS": {"syllabes": "REIMS", "muettes": null, "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "COPENHAGUE": {"syllabes": "CO-PEN-HA-GUE", "muettes": [5, 9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "ÉDIMBOURG": {"syllabes": "É-DIM-BOURG", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "PHILADELPHIE": {"syllabes": "PHI-LA-DEL-PHIE", "muettes": [11], "lettres": 12, "genre": null, "pluriel": null, "elision": null}, "SAINT-PÉTERSBOURG": {"syllabes": "SAINT-PÉ-TERS-BOURG", "muettes": [4, 16], "lettres": 16, "genre": null, "pluriel": null, "elision": null}, "LAC": {"syllabes": "LAC", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "LACS", "elision": false}, "MER": {"syllabes": "MER", "muettes": [], "lettres": 3, "genre": "f", "pluriel": "MERS", "elision": false}, "BOIS": {"syllabes": "BOIS", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "BOIS", "elision": false}, "CIEL": {"syllabes": "CIEL", "muettes": [], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "ARBRE": {"syllabes": "AR-BRE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "ARBRES", "elision": true}, "PRÉ": {"syllabes": "PRÉ", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "PRÉS", "elision": false}, "SABLE": {"syllabes": "SA-BLE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "PLAGE": {"syllabes": "PLA-GE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "PLAGES", "elision": false}, "RIVIÈRE": {"syllabes": "RI-VIÈ-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "RIVIÈRES", "elision": false}, "COLLINE": {"syllabes": "COL-LI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "COLLINES", "elision": false}, "DÉSERT": {"syllabes": "DÉ-SERT", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "DÉSERTS", "elision": false}, "VOLCAN": {"syllabes": "VOL-CAN", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "VOLCANS", "elision": false}, "OCÉAN": {"syllabes": "O-CÉ-AN", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "OCÉANS", "elision": true}, "GROTTE": {"syllabes": "GROT-TE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "GROTTES", "elision": false}, "MONTAGNE": {"syllabes": "MON-TA-GNE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "MONTAGNES", "elision": false}, "CASCADE": {"syllabes": "CAS-CA-DE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "CASCADES", "elision": false}, "FALAISE": {"syllabes": "FA-LAI-SE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "FALAISES", "elision": false}, "MARÉCAGE": {"syllabes": "MA-RÉ-CA-GE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "MARÉCAGES", "elision": false}, "PRAIRIE": {"syllabes": "PRAI-RIE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "PRAIRIES", "elision": false}, "GLACIER": {"syllabes": "GLA-CIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "GLACIERS", "elision": false}, "ROCHER": {"syllabes": "RO-CHER", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "ROCHERS", "elision": false}, "VALLÉE": {"syllabes": "VAL-LÉE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "VALLÉES", "elision": false}, "MARAIS": {"syllabes": "MA-RAIS", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "MARAIS", "elision": false}, "PRESQU'ÎLE": {"syllabes": "PRES-QU'Î-LE", "muettes": [9], "lettres": 9, "genre": "f", "pluriel": "PRESQU'ÎLES", "elision": false}, "ARCHIPEL": {"syllabes": "AR-CHI-PEL", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "ARCHIPELS", "elision": true}, "LAGUNE": {"syllabes": "LA-GU-NE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "LAGUNES", "elision": false}, "CRATÈRE": {"syllabes": "CRA-TÈ-RE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "CRATÈRES", "elision": false}, "SOMMET": {"syllabes": "SOM-MET", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "SOMMETS", "elision": false}, "RUISSEAU": {"syllabes": "RUIS-SEAU", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "RUISSEAUX", "elision": false}, "OASIS": {"syllabes": "O-A-SIS", "muettes": [], "lettres": 5, "genre": "f", "pluriel": "OASIS", "elision": true}, "STALACTITE": {"syllabes": "STA-LAC-TI-TE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "STALACTITES", "elision": false}, "STALAGMITE": {"syllabes": "STA-LAG-MI-TE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "STALAGMITES", "elision": false}, "ATOLL": {"syllabes": "A-TOLL", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "ATOLLS", "elision": true}, "FJORD": {"syllabes": "FJORD", "muettes": null, "lettres": 5, "genre": "m", "pluriel": "FJORDS", "elision": false}, "GEYSER": {"syllabes": "GEY-SER", "muettes": null, "lettres": 6, "genre": "m", "pluriel": "GEYSERS", "elision": false}, "ESTUAIRE": {"syllabes": "ES-TU-AI-RE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "ESTUAIRES", "elision": true}, "MANGROVE": {"syllabes": "MAN-GRO-VE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "MANGROVES", "elision": false}, "ÉCOSYSTÈME": {"syllabes": "É-CO-SYS-TÈ-ME", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": "ÉCOSYSTÈMES", "elision": true}, "PLUIE": {"syllabes": "PLUIE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "PLUIES", "elision": false}, "VENT": {"syllabes": "VENT", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "VENTS", "elision": false}, "ÉTÉ": {"syllabes": "É-TÉ", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "ÉTÉS", "elision": true}, "FROID": {"syllabes": "FROID", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "CHAUD": {"syllabes": "CHAUD", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "GEL": {"syllabes": "GEL", "muettes": [], "lettres": 3, "genre": "m", "pluriel": null, "elision": false}, "ORAGE": {"syllabes": "O-RA-GE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "ORAGES", "elision": true}, "HIVER": {"syllabes": "HI-VER", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "HIVERS", "elision": true}, "AUTOMNE": {"syllabes": "AU-TOM-NE", "muettes": [4, 6], "lettres": 7, "genre": "m", "pluriel": "AUTOMNES", "elision": true}, "BROUILLARD": {"syllabes": "BROUIL-LARD", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": null, "elision": false}, "TEMPÊTE": {"syllabes": "TEM-PÊ-TE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "TEMPÊTES", "elision": false}, "ÉCLAIR": {"syllabes": "É-CLAIR", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "ÉCLAIRS", "elision": true}, "CHALEUR": {"syllabes": "CHA-LEUR", "muettes": [], "lettres": 7, "genre": "f", "pluriel": null, "elision": false}, "PRINTEMPS": {"syllabes": "PRIN-TEMPS", "muettes": [7, 8], "lettres": 9, "genre": "m", "pluriel": "PRINTEMPS", "elision": false}, "ARC-EN-CIEL": {"syllabes": "ARC-EN-CIEL", "muettes": [], "lettres": 9, "genre": "m", "pluriel": null, "elision": true}, "TONNERRE": {"syllabes": "TON-NER-RE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "GRÊLE": {"syllabes": "GRÊ-LE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "VERGLAS": {"syllabes": "VER-GLAS", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "TEMPÉRATURE": {"syllabes": "TEM-PÉ-RA-TU-RE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": "TEMPÉRATURES", "elision": false}, "AVERSE": {"syllabes": "A-VER-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "AVERSES", "elision": true}, "ROSÉE": {"syllabes": "RO-SÉE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "BOURRASQUE": {"syllabes": "BOUR-RAS-QUE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "BOURRASQUES", "elision": false}, "CANICULE": {"syllabes": "CA-NI-CU-LE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "CANICULES", "elision": false}, "SÉCHERESSE": {"syllabes": "SÉ-CHE-RES-SE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "SÉCHERESSES", "elision": false}, "HUMIDITÉ": {"syllabes": "HU-MI-DI-TÉ", "muettes": [0], "lettres": 8, "genre": "f", "pluriel": null, "elision": true}, "BRUINE": {"syllabes": "BRU-I-NE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": null, "elision": false}, "GIBOULÉE": {"syllabes": "GI-BOU-LÉE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "GIBOULÉES", "elision": false}, "ÉCLAIRCIE": {"syllabes": "É-CLAIR-CIE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "ÉCLAIRCIES", "elision": true}, "THERMOMÈTRE": {"syllabes": "THER-MO-MÈ-TRE", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "THERMOMÈTRES", "elision": false}, "TYPHON": {"syllabes": "TY-PHON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "TYPHONS", "elision": false}, "CYCLONE": {"syllabes": "CY-CLO-NE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "CYCLONES", "elision": false}, "BLIZZARD": {"syllabes": "BLIZ-ZARD", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "BLIZZARDS", "elision": false}, "MOUSSON": {"syllabes": "MOUS-SON", "muettes": [], "lettres": 7, "genre": "f", "pluriel": "MOUSSONS", "elision": false}, "ANTICYCLONE": {"syllabes": "AN-TI-CY-CLO-NE", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "ANTICYCLONES", "elision": true}, "ÉQUINOXE": {"syllabes": "É-QUI-NO-XE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "ÉQUINOXES", "elision": true}, "SOLSTICE": {"syllabes": "SOLS-TI-CE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "SOLSTICES", "elision": false}, "BAROMÈTRE": {"syllabes": "BA-RO-MÈ-TRE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "BAROMÈTRES", "elision": false}, "TÊTE": {"syllabes": "TÊ-TE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "TÊTES", "elision": false}, "MAIN": {"syllabes": "MAIN", "muettes": [], "lettres": 4, "genre": "f", "pluriel": "MAINS", "elision": false}, "PIED": {"syllabes": "PIED", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "PIEDS", "elision": false}, "BRAS": {"syllabes": "BRAS", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "BRAS", "elision": false}, "NEZ": {"syllabes": "NEZ", "muettes": [2], "lettres": 3, "genre": "m", "pluriel": "NEZ", "elision": false}, "DOS": {"syllabes": "DOS", "muettes": [2], "lettres": 3, "genre": "m", "pluriel": "DOS", "elision": false}, "COU": {"syllabes": "COU", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "COUS", "elision": false}, "DENT": {"syllabes": "DENT", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "DENTS", "elision": false}, "JAMBE": {"syllabes": "JAM-BE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "JAMBES", "elision": false}, "OREILLE": {"syllabes": "O-REIL-LE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "OREILLES", "elision": true}, "GENOU": {"syllabes": "GE-NOU", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "GENOUX", "elision": false}, "ÉPAULE": {"syllabes": "É-PAU-LE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "ÉPAULES", "elision": true}, "CHEVEUX": {"syllabes": "CHE-VEUX", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "VENTRE": {"syllabes": "VEN-TRE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "VENTRES", "elision": false}, "BOUCHE": {"syllabes": "BOU-CHE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "BOUCHES", "elision": false}, "DOIGT": {"syllabes": "DOIGT", "muettes": [3, 4], "lettres": 5, "genre": "m", "pluriel": "DOIGTS", "elision": false}, "ESTOMAC": {"syllabes": "ES-TO-MAC", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "ESTOMACS", "elision": true}, "POIGNET": {"syllabes": "POI-GNET", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "POIGNETS", "elision": false}, "CHEVILLE": {"syllabes": "CHE-VIL-LE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "CHEVILLES", "elision": false}, "PAUPIÈRE": {"syllabes": "PAU-PIÈ-RE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "PAUPIÈRES", "elision": false}, "MOLLET": {"syllabes": "MOL-LET", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "MOLLETS", "elision": false}, "POUMON": {"syllabes": "POU-MON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "POUMONS", "elision": false}, "SQUELETTE": {"syllabes": "SQUE-LET-TE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "SQUELETTES", "elision": false}, "COUDE": {"syllabes": "COU-DE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "COUDES", "elision": false}, "CERVEAU": {"syllabes": "CER-VEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "CERVEAUX", "elision": false}, "NOMBRIL": {"syllabes": "NOM-BRIL", "muettes": null, "lettres": 7, "genre": "m", "pluriel": "NOMBRILS", "elision": false}, "MÂCHOIRE": {"syllabes": "MÂ-CHOI-RE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "MÂCHOIRES", "elision": false}, "NARINE": {"syllabes": "NA-RI-NE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "NARINES", "elision": false}, "CLAVICULE": {"syllabes": "CLA-VI-CU-LE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "CLAVICULES", "elision": false}, "GENCIVE": {"syllabes": "GEN-CI-VE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "GENCIVES", "elision": false}, "ARTÈRE": {"syllabes": "AR-TÈ-RE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "ARTÈRES", "elision": true}, "THORAX": {"syllabes": "THO-RAX", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "THORAX", "elision": false}, "PHALANGE": {"syllabes": "PHA-LAN-GE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "PHALANGES", "elision": false}, "TRACHÉE": {"syllabes": "TRA-CHÉE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "TRACHÉES", "elision": false}, "PANCRÉAS": {"syllabes": "PAN-CRÉ-AS", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "PANCRÉAS", "elision": false}, "OMOPLATE": {"syllabes": "O-MO-PLA-TE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "OMOPLATES", "elision": true}, "LARYNX": {"syllabes": "LA-RYNX", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "LARYNX", "elision": false}, "PHARYNX": {"syllabes": "PHA-RYNX", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "PHARYNX", "elision": false}, "TYMPAN": {"syllabes": "TYM-PAN", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "TYMPANS", "elision": false}, "DIAPHRAGME": {"syllabes": "DI-A-PHRAG-ME", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": "DIAPHRAGMES", "elision": false}, "PAIN": {"syllabes": "PAIN", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "PAINS", "elision": false}, "LAIT": {"syllabes": "LAIT", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "RIZ": {"syllabes": "RIZ", "muettes": [2], "lettres": 3, "genre": "m", "pluriel": null, "elision": false}, "POIRE": {"syllabes": "POI-RE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "POIRES", "elision": false}, "SOUPE": {"syllabes": "SOU-PE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "SOUPES", "elision": false}, "MIEL": {"syllabes": "MIEL", "muettes": [], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "JUS": {"syllabes": "JUS", "muettes": [2], "lettres": 3, "genre": "m", "pluriel": "JUS", "elision": false}, "SEL": {"syllabes": "SEL", "muettes": [], "lettres": 3, "genre": "m", "pluriel": null, "elision": false}, "FROMAGE": {"syllabes": "FRO-MA-GE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "FROMAGES", "elision": false}, "CAROTTE": {"syllabes": "CA-ROT-TE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "CAROTTES", "elision": false}, "CERISE": {"syllabes": "CE-RI-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "CERISES", "elision": false}, "BANANE": {"syllabes": "BA-NA-NE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "BANANES", "elision": false}, "TOMATE": {"syllabes": "TO-MA-TE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "TOMATES", "elision": false}, "BEURRE": {"syllabes": "BEUR-RE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "SALADE": {"syllabes": "SA-LA-DE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "SALADES", "elision": false}, "POULET": {"syllabes": "POU-LET", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "POULETS", "elision": false}, "CHAMPIGNON": {"syllabes": "CHAM-PI-GNON", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "CHAMPIGNONS", "elision": false}, "CONCOMBRE": {"syllabes": "CON-COM-BRE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "CONCOMBRES", "elision": false}, "AUBERGINE": {"syllabes": "AU-BER-GI-NE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "AUBERGINES", "elision": true}, "FRAMBOISE": {"syllabes": "FRAM-BOI-SE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "FRAMBOISES", "elision": false}, "ÉPINARD": {"syllabes": "É-PI-NARD", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": true}, "CITROUILLE": {"syllabes": "CI-TROUIL-LE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "CITROUILLES", "elision": false}, "HARICOT": {"syllabes": "HA-RI-COT", "muettes": [0, 6], "lettres": 7, "genre": "m", "pluriel": "HARICOTS", "elision": false}, "ANANAS": {"syllabes": "A-NA-NAS", "muettes": null, "lettres": 6, "genre": "m", "pluriel": "ANANAS", "elision": true}, "CONFITURE": {"syllabes": "CON-FI-TU-RE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "CONFITURES", "elision": false}, "CORNICHON": {"syllabes": "COR-NI-CHON", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "CORNICHONS", "elision": false}, "CHOU-FLEUR": {"syllabes": "CHOU-FLEUR", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "CHOUX-FLEURS", "elision": false}, "BROCOLI": {"syllabes": "BRO-CO-LI", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "BROCOLIS", "elision": false}, "COURGETTE": {"syllabes": "COUR-GET-TE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "COURGETTES", "elision": false}, "POIREAU": {"syllabes": "POI-REAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "POIREAUX", "elision": false}, "PAMPLEMOUSSE": {"syllabes": "PAM-PLE-MOUS-SE", "muettes": [11], "lettres": 12, "genre": "m", "pluriel": "PAMPLEMOUSSES", "elision": false}, "MYRTILLE": {"syllabes": "MYR-TIL-LE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "MYRTILLES", "elision": false}, "ARTICHAUT": {"syllabes": "AR-TI-CHAUT", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "ARTICHAUTS", "elision": true}, "RHUBARBE": {"syllabes": "RHU-BAR-BE", "muettes": [1, 7], "lettres": 8, "genre": "f", "pluriel": null, "elision": false}, "ÉCHALOTE": {"syllabes": "É-CHA-LO-TE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "ÉCHALOTES", "elision": true}, "CÉLERI": {"syllabes": "CÉ-LE-RI", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "CÉLERIS", "elision": false}, "MOZZARELLA": {"syllabes": "MOZ-ZA-REL-LA", "muettes": [], "lettres": 10, "genre": "f", "pluriel": null, "elision": false}, "FENOUIL": {"syllabes": "FE-NOUIL", "muettes": [], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "GROSEILLE": {"syllabes": "GRO-SEIL-LE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "GROSEILLES", "elision": false}, "PISTACHE": {"syllabes": "PIS-TA-CHE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "PISTACHES", "elision": false}, "LIT": {"syllabes": "LIT", "muettes": [2], "lettres": 3, "genre": "m", "pluriel": "LITS", "elision": false}, "TABLE": {"syllabes": "TA-BLE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "TABLES", "elision": false}, "LAMPE": {"syllabes": "LAM-PE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "LAMPES", "elision": false}, "PORTE": {"syllabes": "POR-TE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "PORTES", "elision": false}, "TAPIS": {"syllabes": "TA-PIS", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "TAPIS", "elision": false}, "BOL": {"syllabes": "BOL", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "BOLS", "elision": false}, "VERRE": {"syllabes": "VER-RE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "VERRES", "elision": false}, "FOUR": {"syllabes": "FOUR", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "FOURS", "elision": false}, "CHAISE": {"syllabes": "CHAI-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "CHAISES", "elision": false}, "FENÊTRE": {"syllabes": "FE-NÊ-TRE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "FENÊTRES", "elision": false}, "ARMOIRE": {"syllabes": "AR-MOI-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "ARMOIRES", "elision": true}, "ESCALIER": {"syllabes": "ES-CA-LIER", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "ESCALIERS", "elision": true}, "CUISINE": {"syllabes": "CUI-SI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "CUISINES", "elision": false}, "PLACARD": {"syllabes": "PLA-CARD", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "PLACARDS", "elision": false}, "COUSSIN": {"syllabes": "COUS-SIN", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "COUSSINS", "elision": false}, "MIROIR": {"syllabes": "MI-ROIR", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "MIROIRS", "elision": false}, "RÉFRIGÉRATEUR": {"syllabes": "RÉ-FRI-GÉ-RA-TEUR", "muettes": [], "lettres": 13, "genre": "m", "pluriel": "RÉFRIGÉRATEURS", "elision": false}, "BAIGNOIRE": {"syllabes": "BAI-GNOI-RE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "BAIGNOIRES", "elision": false}, "CHEMINÉE": {"syllabes": "CHE-MI-NÉE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "CHEMINÉES", "elision": false}, "ÉTAGÈRE": {"syllabes": "É-TA-GÈ-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "ÉTAGÈRES", "elision": true}, "CASSEROLE": {"syllabes": "CAS-SE-RO-LE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "CASSEROLES", "elision": false}, "OREILLER": {"syllabes": "O-REIL-LER", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "OREILLERS", "elision": true}, "TIROIR": {"syllabes": "TI-ROIR", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "TIROIRS", "elision": false}, "ASPIRATEUR": {"syllabes": "AS-PI-RA-TEUR", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "ASPIRATEURS", "elision": true}, "CANAPÉ": {"syllabes": "CA-NA-PÉ", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "CANAPÉS", "elision": false}, "FAUTEUIL": {"syllabes": "FAU-TEUIL", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "FAUTEUILS", "elision": false}, "VAISSELLE": {"syllabes": "VAIS-SEL-LE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": null, "elision": false}, "COUVERTURE": {"syllabes": "COU-VER-TU-RE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "COUVERTURES", "elision": false}, "GRILLE-PAIN": {"syllabes": "GRIL-LE-PAIN", "muettes": [5], "lettres": 10, "genre": "m", "pluriel": null, "elision": false}, "LAVABO": {"syllabes": "LA-VA-BO", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "LAVABOS", "elision": false}, "PLAFOND": {"syllabes": "PLA-FOND", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "PLAFONDS", "elision": false}, "RIDEAU": {"syllabes": "RI-DEAU", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "RIDEAUX", "elision": false}, "THERMOSTAT": {"syllabes": "THER-MOS-TAT", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": "THERMOSTATS", "elision": false}, "ABAT-JOUR": {"syllabes": "A-BAT-JOUR", "muettes": [3], "lettres": 8, "genre": "m", "pluriel": null, "elision": true}, "ESCABEAU": {"syllabes": "ES-CA-BEAU", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "ESCABEAUX", "elision": true}, "BOUILLOIRE": {"syllabes": "BOUIL-LOI-RE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "BOUILLOIRES", "elision": false}, "VESTIBULE": {"syllabes": "VES-TI-BU-LE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "VESTIBULES", "elision": false}, "PERSIENNE": {"syllabes": "PER-SIEN-NE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "PERSIENNES", "elision": false}, "TABOURET": {"syllabes": "TA-BOU-RET", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "TABOURETS", "elision": false}, "CHAUFFE-EAU": {"syllabes": "CHAUF-FE-EAU", "muettes": [6], "lettres": 10, "genre": "m", "pluriel": null, "elision": false}, "PULL": {"syllabes": "PULL", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "PULLS", "elision": false}, "ROBE": {"syllabes": "RO-BE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "ROBES", "elision": false}, "JUPE": {"syllabes": "JU-PE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "JUPES", "elision": false}, "GANT": {"syllabes": "GANT", "muettes": [3], "lettres": 4, "genre": "m", "pluriel": "GANTS", "elision": false}, "BOTTE": {"syllabes": "BOT-TE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "BOTTES", "elision": false}, "BONNET": {"syllabes": "BON-NET", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "BONNETS", "elision": false}, "VESTE": {"syllabes": "VES-TE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "VESTES", "elision": false}, "CAPE": {"syllabes": "CA-PE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "CAPES", "elision": false}, "CHAPEAU": {"syllabes": "CHA-PEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "CHAPEAUX", "elision": false}, "MANTEAU": {"syllabes": "MAN-TEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "MANTEAUX", "elision": false}, "PANTALON": {"syllabes": "PAN-TA-LON", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "PANTALONS", "elision": false}, "CHAUSSETTE": {"syllabes": "CHAUS-SET-TE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "CHAUSSETTES", "elision": false}, "ÉCHARPE": {"syllabes": "É-CHAR-PE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "ÉCHARPES", "elision": true}, "CHEMISE": {"syllabes": "CHE-MI-SE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "CHEMISES", "elision": false}, "CEINTURE": {"syllabes": "CEIN-TU-RE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "CEINTURES", "elision": false}, "PYJAMA": {"syllabes": "PY-JA-MA", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "PYJAMAS", "elision": false}, "BLOUSON": {"syllabes": "BLOU-SON", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "BLOUSONS", "elision": false}, "IMPERMÉABLE": {"syllabes": "IM-PER-MÉ-A-BLE", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "IMPERMÉABLES", "elision": true}, "SANDALE": {"syllabes": "SAN-DA-LE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "SANDALES", "elision": false}, "CASQUETTE": {"syllabes": "CAS-QUET-TE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "CASQUETTES", "elision": false}, "SALOPETTE": {"syllabes": "SA-LO-PET-TE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "SALOPETTES", "elision": false}, "MAILLOT": {"syllabes": "MAIL-LOT", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "MAILLOTS", "elision": false}, "PANTOUFLE": {"syllabes": "PAN-TOU-FLE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "PANTOUFLES", "elision": false}, "CHAUSSURE": {"syllabes": "CHAUS-SU-RE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "CHAUSSURES", "elision": false}, "SURVÊTEMENT": {"syllabes": "SUR-VÊ-TE-MENT", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "SURVÊTEMENTS", "elision": false}, "MOUFLE": {"syllabes": "MOU-FLE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "MOUFLES", "elision": false}, "CRAVATE": {"syllabes": "CRA-VA-TE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "CRAVATES", "elision": false}, "GILET": {"syllabes": "GI-LET", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "GILETS", "elision": false}, "BRETELLE": {"syllabes": "BRE-TEL-LE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "BRETELLES", "elision": false}, "COLLANT": {"syllabes": "COL-LANT", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "COLLANTS", "elision": false}, "TABLIER": {"syllabes": "TA-BLIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "TABLIERS", "elision": false}, "ESPADRILLE": {"syllabes": "ES-PA-DRIL-LE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "ESPADRILLES", "elision": true}, "MOCASSIN": {"syllabes": "MO-CAS-SIN", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "MOCASSINS", "elision": false}, "BERMUDA": {"syllabes": "BER-MU-DA", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "BERMUDAS", "elision": false}, "SOMBRERO": {"syllabes": "SOM-BRE-RO", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "SOMBREROS", "elision": false}, "CHÂLE": {"syllabes": "CHÂ-LE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "CHÂLES", "elision": false}, "PARDESSUS": {"syllabes": "PAR-DES-SUS", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "PARDESSUS", "elision": false}, "CACHE-NEZ": {"syllabes": "CA-CHE-NEZ", "muettes": [4, 8], "lettres": 8, "genre": "m", "pluriel": "CACHE-NEZ", "elision": false}, "DÉBARDEUR": {"syllabes": "DÉ-BAR-DEUR", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "DÉBARDEURS", "elision": false}, "ESCARPIN": {"syllabes": "ES-CAR-PIN", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "ESCARPINS", "elision": true}, "LIVRE": {"syllabes": "LI-VRE", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "LIVRES", "elision": false}, "COLLE": {"syllabes": "COL-LE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "COLLES", "elision": false}, "GOMME": {"syllabes": "GOM-ME", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "GOMMES", "elision": false}, "CRAIE": {"syllabes": "CRAIE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "CRAIES", "elision": false}, "CLASSE": {"syllabes": "CLAS-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "CLASSES", "elision": false}, "STYLO": {"syllabes": "STY-LO", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "STYLOS", "elision": false}, "SAC": {"syllabes": "SAC", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "SACS", "elision": false}, "AMI": {"syllabes": "A-MI", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "AMIS", "elision": true}, "CAHIER": {"syllabes": "CA-HIER", "muettes": [2, 5], "lettres": 6, "genre": "m", "pluriel": "CAHIERS", "elision": false}, "CRAYON": {"syllabes": "CRA-YON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "CRAYONS", "elision": false}, "RÈGLE": {"syllabes": "RÈ-GLE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "RÈGLES", "elision": false}, "TROUSSE": {"syllabes": "TROUS-SE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "TROUSSES", "elision": false}, "CARTABLE": {"syllabes": "CAR-TA-BLE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "CARTABLES", "elision": false}, "TABLEAU": {"syllabes": "TA-BLEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "TABLEAUX", "elision": false}, "CISEAUX": {"syllabes": "CI-SEAUX", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": null, "elision": false}, "MAÎTRE": {"syllabes": "MAÎ-TRE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "MAÎTRES", "elision": false}, "RÉCRÉATION": {"syllabes": "RÉ-CRÉ-A-TION", "muettes": [], "lettres": 10, "genre": "f", "pluriel": "RÉCRÉATIONS", "elision": false}, "MAÎTRESSE": {"syllabes": "MAÎ-TRES-SE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "MAÎTRESSES", "elision": false}, "DICTIONNAIRE": {"syllabes": "DIC-TION-NAI-RE", "muettes": [11], "lettres": 12, "genre": "m", "pluriel": "DICTIONNAIRES", "elision": false}, "COMPAS": {"syllabes": "COM-PAS", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "COMPAS", "elision": false}, "PINCEAU": {"syllabes": "PIN-CEAU", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "PINCEAUX", "elision": false}, "FEUTRE": {"syllabes": "FEU-TRE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "FEUTRES", "elision": false}, "ÉQUERRE": {"syllabes": "É-QUER-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "ÉQUERRES", "elision": true}, "BUREAU": {"syllabes": "BU-REAU", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "BUREAUX", "elision": false}, "CALCULATRICE": {"syllabes": "CAL-CU-LA-TRI-CE", "muettes": [11], "lettres": 12, "genre": "f", "pluriel": "CALCULATRICES", "elision": false}, "CANTINE": {"syllabes": "CAN-TI-NE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "CANTINES", "elision": false}, "AGENDA": {"syllabes": "A-GEN-DA", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "AGENDAS", "elision": true}, "SURLIGNEUR": {"syllabes": "SUR-LI-GNEUR", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "SURLIGNEURS", "elision": false}, "PUPITRE": {"syllabes": "PU-PI-TRE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "PUPITRES", "elision": false}, "CLASSEUR": {"syllabes": "CLAS-SEUR", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "CLASSEURS", "elision": false}, "BUVARD": {"syllabes": "BU-VARD", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "BUVARDS", "elision": false}, "CONJUGAISON": {"syllabes": "CON-JU-GAI-SON", "muettes": [], "lettres": 11, "genre": "f", "pluriel": null, "elision": false}, "ORTHOGRAPHE": {"syllabes": "OR-THO-GRA-PHE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": null, "elision": true}, "GÉOGRAPHIE": {"syllabes": "GÉ-O-GRA-PHIE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": null, "elision": false}, "GRAMMAIRE": {"syllabes": "GRAM-MAI-RE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "GRAMMAIRES", "elision": false}, "ENCYCLOPÉDIE": {"syllabes": "EN-CY-CLO-PÉ-DIE", "muettes": [11], "lettres": 12, "genre": "f", "pluriel": "ENCYCLOPÉDIES", "elision": true}, "PHOTOCOPIE": {"syllabes": "PHO-TO-CO-PIE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "PHOTOCOPIES", "elision": false}, "RAPPORTEUR": {"syllabes": "RAP-POR-TEUR", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "RAPPORTEURS", "elision": false}, "ARITHMÉTIQUE": {"syllabes": "A-RITH-MÉ-TI-QUE", "muettes": [11], "lettres": 12, "genre": "f", "pluriel": null, "elision": true}, "TAILLE-CRAYON": {"syllabes": "TAIL-LE-CRAYON", "muettes": [5], "lettres": 12, "genre": "m", "pluriel": null, "elision": false}, "CHEF": {"syllabes": "CHEF", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "JUGE": {"syllabes": "JU-GE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "PILOTE": {"syllabes": "PI-LO-TE", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "MAÇON": {"syllabes": "MA-ÇON", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "MAÇONS", "elision": false}, "FERMIER": {"syllabes": "FER-MIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "FERMIERS", "elision": false}, "POMPIER": {"syllabes": "POM-PIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "POMPIERS", "elision": false}, "PEINTRE": {"syllabes": "PEIN-TRE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "FACTEUR": {"syllabes": "FAC-TEUR", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "FACTEURS", "elision": false}, "BOULANGER": {"syllabes": "BOU-LAN-GER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "BOULANGERS", "elision": false}, "MÉDECIN": {"syllabes": "MÉ-DE-CIN", "muettes": [], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "COIFFEUR": {"syllabes": "COIF-FEUR", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "COIFFEURS", "elision": false}, "JARDINIER": {"syllabes": "JAR-DI-NIER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "JARDINIERS", "elision": false}, "INFIRMIER": {"syllabes": "IN-FIR-MIER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "INFIRMIERS", "elision": true}, "CUISINIER": {"syllabes": "CUI-SI-NIER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "CUISINIERS", "elision": false}, "BOUCHER": {"syllabes": "BOU-CHER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "BOUCHERS", "elision": false}, "DENTISTE": {"syllabes": "DEN-TIS-TE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "VÉTÉRINAIRE": {"syllabes": "VÉ-TÉ-RI-NAI-RE", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "ARCHITECTE": {"syllabes": "AR-CHI-TEC-TE", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "PHARMACIEN": {"syllabes": "PHAR-MA-CIEN", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "PHARMACIENS", "elision": false}, "POLICIER": {"syllabes": "PO-LI-CIER", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "POLICIERS", "elision": false}, "CHIRURGIEN": {"syllabes": "CHI-RUR-GIEN", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "CHIRURGIENS", "elision": false}, "ASTRONAUTE": {"syllabes": "AS-TRO-NAU-TE", "muettes": [9], "lettres": 10, "genre": null, "pluriel": null, "elision": null}, "MENUISIER": {"syllabes": "ME-NUI-SIER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "MENUISIERS", "elision": false}, "ÉLECTRICIEN": {"syllabes": "É-LEC-TRI-CIEN", "muettes": [], "lettres": 11, "genre": "m", "pluriel": "ÉLECTRICIENS", "elision": true}, "AGRICULTEUR": {"syllabes": "A-GRI-CUL-TEUR", "muettes": [], "lettres": 11, "genre": "m", "pluriel": "AGRICULTEURS", "elision": true}, "CHAUFFEUR": {"syllabes": "CHAUF-FEUR", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "CHAUFFEURS", "elision": false}, "PLOMBIER": {"syllabes": "PLOM-BIER", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "PLOMBIERS", "elision": false}, "HORLOGER": {"syllabes": "HOR-LO-GER", "muettes": [0, 7], "lettres": 8, "genre": "m", "pluriel": "HORLOGERS", "elision": true}, "PÂTISSIER": {"syllabes": "PÂ-TIS-SIER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "PÂTISSIERS", "elision": false}, "BIJOUTIER": {"syllabes": "BI-JOU-TIER", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "BIJOUTIERS", "elision": false}, "PHOTOGRAPHE": {"syllabes": "PHO-TO-GRA-PHE", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "MÉCANICIEN": {"syllabes": "MÉ-CA-NI-CIEN", "muettes": [], "lettres": 10, "genre": "m", "pluriel": "MÉCANICIENS", "elision": false}, "PSYCHOLOGUE": {"syllabes": "PSY-CHO-LO-GUE", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "ORTHOPHONISTE": {"syllabes": "OR-THO-PHO-NIS-TE", "muettes": [12], "lettres": 13, "genre": null, "pluriel": null, "elision": null}, "KINÉSITHÉRAPEUTE": {"syllabes": "KI-NÉ-SI-THÉ-RA-PEU-TE", "muettes": [15], "lettres": 16, "genre": null, "pluriel": null, "elision": null}, "OPHTALMOLOGUE": {"syllabes": "OPH-TAL-MO-LO-GUE", "muettes": [12], "lettres": 13, "genre": null, "pluriel": null, "elision": null}, "ARCHÉOLOGUE": {"syllabes": "AR-CHÉ-O-LO-GUE", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "CHORÉGRAPHE": {"syllabes": "CHO-RÉ-GRA-PHE", "muettes": [10], "lettres": 11, "genre": null, "pluriel": null, "elision": null}, "PALÉONTOLOGUE": {"syllabes": "PA-LÉ-ON-TO-LO-GUE", "muettes": [12], "lettres": 13, "genre": null, "pluriel": null, "elision": null}, "ANESTHÉSISTE": {"syllabes": "A-NES-THÉ-SIS-TE", "muettes": [11], "lettres": 12, "genre": null, "pluriel": null, "elision": null}, "BUS": {"syllabes": "BUS", "muettes": [], "lettres": 3, "genre": "m", "pluriel": "BUS", "elision": false}, "LUGE": {"syllabes": "LU-GE", "muettes": [3], "lettres": 4, "genre": "f", "pluriel": "LUGES", "elision": false}, "TAXI": {"syllabes": "TA-XI", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "TAXIS", "elision": false}, "TRAM": {"syllabes": "TRAM", "muettes": [], "lettres": 4, "genre": "m", "pluriel": "TRAMS", "elision": false}, "AUTO": {"syllabes": "AU-TO", "muettes": [], "lettres": 4, "genre": "f", "pluriel": "AUTOS", "elision": true}, "CAMION": {"syllabes": "CA-MION", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "CAMIONS", "elision": false}, "MÉTRO": {"syllabes": "MÉ-TRO", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "MÉTROS", "elision": false}, "FUSÉE": {"syllabes": "FU-SÉE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "FUSÉES", "elision": false}, "TRACTEUR": {"syllabes": "TRAC-TEUR", "muettes": [], "lettres": 8, "genre": "m", "pluriel": "TRACTEURS", "elision": false}, "BARQUE": {"syllabes": "BAR-QUE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "BARQUES", "elision": false}, "HÉLICOPTÈRE": {"syllabes": "HÉ-LI-COP-TÈ-RE", "muettes": [0, 10], "lettres": 11, "genre": "m", "pluriel": "HÉLICOPTÈRES", "elision": true}, "AMBULANCE": {"syllabes": "AM-BU-LAN-CE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "AMBULANCES", "elision": true}, "MONTGOLFIÈRE": {"syllabes": "MONT-GOL-FIÈ-RE", "muettes": [3, 11], "lettres": 12, "genre": "f", "pluriel": "MONTGOLFIÈRES", "elision": false}, "TROTTINETTE": {"syllabes": "TROT-TI-NET-TE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": "TROTTINETTES", "elision": false}, "SOUS-MARIN": {"syllabes": "SOUS-MA-RIN", "muettes": [3], "lettres": 9, "genre": "m", "pluriel": "SOUS-MARINS", "elision": false}, "PAQUEBOT": {"syllabes": "PA-QUE-BOT", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "PAQUEBOTS", "elision": false}, "TÉLÉPHÉRIQUE": {"syllabes": "TÉ-LÉ-PHÉ-RI-QUE", "muettes": [11], "lettres": 12, "genre": "m", "pluriel": "TÉLÉPHÉRIQUES", "elision": false}, "AUTOBUS": {"syllabes": "AU-TO-BUS", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "AUTOBUS", "elision": true}, "CAMIONNETTE": {"syllabes": "CA-MION-NET-TE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": "CAMIONNETTES", "elision": false}, "MOTONEIGE": {"syllabes": "MO-TO-NEI-GE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "MOTONEIGES", "elision": false}, "DIRIGEABLE": {"syllabes": "DI-RI-GEA-BLE", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": "DIRIGEABLES", "elision": false}, "VOILIER": {"syllabes": "VOI-LIER", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "VOILIERS", "elision": false}, "PÉNICHE": {"syllabes": "PÉ-NI-CHE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "PÉNICHES", "elision": false}, "LOCOMOTIVE": {"syllabes": "LO-CO-MO-TI-VE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "LOCOMOTIVES", "elision": false}, "CATAMARAN": {"syllabes": "CA-TA-MA-RAN", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "CATAMARANS", "elision": false}, "AÉROGLISSEUR": {"syllabes": "A-É-RO-GLIS-SEUR", "muettes": [], "lettres": 12, "genre": "m", "pluriel": "AÉROGLISSEURS", "elision": true}, "HYDRAVION": {"syllabes": "HY-DRA-VION", "muettes": [0], "lettres": 9, "genre": "m", "pluriel": "HYDRAVIONS", "elision": true}, "MONOCYCLE": {"syllabes": "MO-NO-CY-CLE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "MONOCYCLES", "elision": false}, "FUNICULAIRE": {"syllabes": "FU-NI-CU-LAI-RE", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "FUNICULAIRES", "elision": false}, "TÉLÉCABINE": {"syllabes": "TÉ-LÉ-CA-BI-NE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "TÉLÉCABINES", "elision": false}, "DÉPANNEUSE": {"syllabes": "DÉ-PAN-NEU-SE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "DÉPANNEUSES", "elision": false}, "BATHYSCAPHE": {"syllabes": "BA-THYS-CA-PHE", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "BATHYSCAPHES", "elision": false}, "TRANSATLANTIQUE": {"syllabes": "TRAN-SAT-LAN-TI-QUE", "muettes": [14], "lettres": 15, "genre": "m", "pluriel": "TRANSATLANTIQUES", "elision": false}, "CHASSE-NEIGE": {"syllabes": "CHAS-SE-NEI-GE", "muettes": [5, 11], "lettres": 11, "genre": "m", "pluriel": null, "elision": false}, "ROUGE": {"syllabes": "ROU-GE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "BLEU": {"syllabes": "BLEU", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "VERT": {"syllabes": "VERT", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "NOIR": {"syllabes": "NOIR", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "GRIS": {"syllabes": "GRIS", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ROSE": {"syllabes": "RO-SE", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ROND": {"syllabes": "ROND", "muettes": [3], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "BLANC": {"syllabes": "BLANC", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "JAUNE": {"syllabes": "JAU-NE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "VIOLET": {"syllabes": "VI-O-LET", "muettes": [5], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "MARRON": {"syllabes": "MAR-RON", "muettes": [], "lettres": 6, "genre": null, "pluriel": null, "elision": null}, "CARRÉ": {"syllabes": "CAR-RÉ", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "CARRÉS", "elision": false}, "CERCLE": {"syllabes": "CER-CLE", "muettes": [5], "lettres": 6, "genre": "m", "pluriel": "CERCLES", "elision": false}, "LIGNE": {"syllabes": "LI-GNE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "LIGNES", "elision": false}, "POINT": {"syllabes": "POINT", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": "POINTS", "elision": false}, "TRIANGLE": {"syllabes": "TRI-AN-GLE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "TRIANGLES", "elision": false}, "RECTANGLE": {"syllabes": "REC-TAN-GLE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "RECTANGLES", "elision": false}, "LOSANGE": {"syllabes": "LO-SAN-GE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "LOSANGES", "elision": false}, "TURQUOISE": {"syllabes": "TUR-QUOI-SE", "muettes": [8], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "BEIGE": {"syllabes": "BEI-GE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "OVALE": {"syllabes": "O-VA-LE", "muettes": [4], "lettres": 5, "genre": null, "pluriel": null, "elision": null}, "CYLINDRE": {"syllabes": "CY-LIN-DRE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "CYLINDRES", "elision": false}, "DORÉ": {"syllabes": "DO-RÉ", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "PENTAGONE": {"syllabes": "PEN-TA-GO-NE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "PENTAGONES", "elision": false}, "HEXAGONE": {"syllabes": "HE-XA-GO-NE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "HEXAGONES", "elision": true}, "SPHÈRE": {"syllabes": "SPHÈ-RE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "SPHÈRES", "elision": false}, "PYRAMIDE": {"syllabes": "PY-RA-MI-DE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "PYRAMIDES", "elision": false}, "POURPRE": {"syllabes": "POUR-PRE", "muettes": [6], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "ÉCARLATE": {"syllabes": "É-CAR-LA-TE", "muettes": [7], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "KAKI": {"syllabes": "KA-KI", "muettes": [], "lettres": 4, "genre": null, "pluriel": null, "elision": null}, "ARGENTÉ": {"syllabes": "AR-GEN-TÉ", "muettes": [], "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "PARALLÉLOGRAMME": {"syllabes": "PA-RAL-LÉ-LO-GRAM-ME", "muettes": [14], "lettres": 15, "genre": "m", "pluriel": "PARALLÉLOGRAMMES", "elision": false}, "PARALLÉLÉPIPÈDE": {"syllabes": "PA-RAL-LÉ-LÉ-PI-PÈ-DE", "muettes": [14], "lettres": 15, "genre": "m", "pluriel": "PARALLÉLÉPIPÈDES", "elision": false}, "TRAPÈZE": {"syllabes": "TRA-PÈ-ZE", "muettes": [6], "lettres": 7, "genre": "m", "pluriel": "TRAPÈZES", "elision": false}, "POLYGONE": {"syllabes": "PO-LY-GO-NE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": "POLYGONES", "elision": false}, "ELLIPSE": {"syllabes": "EL-LIP-SE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "ELLIPSES", "elision": true}, "VERMILLON": {"syllabes": "VER-MIL-LON", "muettes": [], "lettres": 9, "genre": null, "pluriel": null, "elision": null}, "FUCHSIA": {"syllabes": "FUCH-SIA", "muettes": null, "lettres": 7, "genre": null, "pluriel": null, "elision": null}, "CRAMOISI": {"syllabes": "CRA-MOI-SI", "muettes": [], "lettres": 8, "genre": null, "pluriel": null, "elision": null}, "JUDO": {"syllabes": "JU-DO", "muettes": [], "lettres": 4, "genre": "m", "pluriel": null, "elision": false}, "SKI": {"syllabes": "SKI", "muettes": [], "lettres": 3, "genre": "m", "pluriel": null, "elision": false}, "DANSE": {"syllabes": "DAN-SE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": null, "elision": false}, "BALLE": {"syllabes": "BAL-LE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "BALLES", "elision": false}, "PIANO": {"syllabes": "PI-A-NO", "muettes": [], "lettres": 5, "genre": "m", "pluriel": "PIANOS", "elision": false}, "FLÛTE": {"syllabes": "FLÛ-TE", "muettes": [4], "lettres": 5, "genre": "f", "pluriel": "FLÛTES", "elision": false}, "CHANT": {"syllabes": "CHANT", "muettes": [4], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}, "COURSE": {"syllabes": "COUR-SE", "muettes": [5], "lettres": 6, "genre": "f", "pluriel": "COURSES", "elision": false}, "TENNIS": {"syllabes": "TEN-NIS", "muettes": [], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "FOOTBALL": {"syllabes": "FOOT-BALL", "muettes": [], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "NATATION": {"syllabes": "NA-TA-TION", "muettes": [], "lettres": 8, "genre": "f", "pluriel": null, "elision": false}, "GUITARE": {"syllabes": "GUI-TA-RE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": "GUITARES", "elision": false}, "TAMBOUR": {"syllabes": "TAM-BOUR", "muettes": [], "lettres": 7, "genre": "m", "pluriel": "TAMBOURS", "elision": false}, "VIOLON": {"syllabes": "VI-O-LON", "muettes": [], "lettres": 6, "genre": "m", "pluriel": "VIOLONS", "elision": false}, "TROMPETTE": {"syllabes": "TROM-PET-TE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "TROMPETTES", "elision": false}, "ESCRIME": {"syllabes": "ES-CRI-ME", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": null, "elision": true}, "GYMNASTIQUE": {"syllabes": "GYM-NAS-TI-QUE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": null, "elision": false}, "ÉQUITATION": {"syllabes": "É-QUI-TA-TION", "muettes": [], "lettres": 10, "genre": "f", "pluriel": null, "elision": true}, "BASKET": {"syllabes": "BAS-KET", "muettes": [], "lettres": 6, "genre": "m", "pluriel": null, "elision": false}, "ESCALADE": {"syllabes": "ES-CA-LA-DE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": null, "elision": true}, "BATTERIE": {"syllabes": "BAT-TE-RIE", "muettes": [7], "lettres": 8, "genre": "f", "pluriel": "BATTERIES", "elision": false}, "ACCORDÉON": {"syllabes": "AC-COR-DÉ-ON", "muettes": [], "lettres": 9, "genre": "m", "pluriel": "ACCORDÉONS", "elision": true}, "HARPE": {"syllabes": "HAR-PE", "muettes": [0, 4], "lettres": 5, "genre": "f", "pluriel": "HARPES", "elision": false}, "CLARINETTE": {"syllabes": "CLA-RI-NET-TE", "muettes": [9], "lettres": 10, "genre": "f", "pluriel": "CLARINETTES", "elision": false}, "SAXOPHONE": {"syllabes": "SA-XO-PHO-NE", "muettes": [8], "lettres": 9, "genre": "m", "pluriel": "SAXOPHONES", "elision": false}, "VIOLONCELLE": {"syllabes": "VI-O-LON-CEL-LE", "muettes": [10], "lettres": 11, "genre": "m", "pluriel": "VIOLONCELLES", "elision": false}, "RANDONNÉE": {"syllabes": "RAN-DON-NÉE", "muettes": [8], "lettres": 9, "genre": "f", "pluriel": "RANDONNÉES", "elision": false}, "PLONGÉE": {"syllabes": "PLON-GÉE", "muettes": [6], "lettres": 7, "genre": "f", "pluriel": null, "elision": false}, "PATINAGE": {"syllabes": "PA-TI-NA-GE", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "ATHLÉTISME": {"syllabes": "ATH-LÉ-TIS-ME", "muettes": [9], "lettres": 10, "genre": "m", "pluriel": null, "elision": true}, "CYCLISME": {"syllabes": "CY-CLIS-ME", "muettes": [7], "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "HAUTBOIS": {"syllabes": "HAUT-BOIS", "muettes": [0, 7], "lettres": 8, "genre": "m", "pluriel": "HAUTBOIS", "elision": false}, "HARMONICA": {"syllabes": "HAR-MO-NI-CA", "muettes": [0], "lettres": 9, "genre": "m", "pluriel": "HARMONICAS", "elision": true}, "BADMINTON": {"syllabes": "BAD-MIN-TON", "muettes": [], "lettres": 9, "genre": "m", "pluriel": null, "elision": false}, "HANDBALL": {"syllabes": "HAND-BALL", "muettes": null, "lettres": 8, "genre": "m", "pluriel": null, "elision": false}, "TRIATHLON": {"syllabes": "TRI-A-THLON", "muettes": [], "lettres": 9, "genre": "m", "pluriel": null, "elision": false}, "CONTREBASSE": {"syllabes": "CON-TRE-BAS-SE", "muettes": [10], "lettres": 11, "genre": "f", "pluriel": "CONTREBASSES", "elision": false}, "SYNTHÉTISEUR": {"syllabes": "SYN-THÉ-TI-SEUR", "muettes": [], "lettres": 12, "genre": "m", "pluriel": "SYNTHÉTISEURS", "elision": false}, "RUGBY": {"syllabes": "RUG-BY", "muettes": [], "lettres": 5, "genre": "m", "pluriel": null, "elision": false}};
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
