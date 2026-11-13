// Géographie (v7.0, refonte v8.0 du 13/11/2026 : modes Quiz / Normal, 4 choix, cartes France / Europe / Monde) : les 12 jeux choisis par l'utilisateur le 12/11/2026 (BACKLOG ligne 258).
// Chaque niveau n'a que son propre contenu (demande de l'utilisateur : Expert = seulement du contenu expert).
// Format des séries : voir js/savoirs.js. « A|B » = A s'affiche, B est aussi accepté en question ouverte.
(function (racine) {
  'use strict';
  var S = typeof module !== 'undefined' && module.exports ? require('./savoirs.js') : racine.Savoirs;

  // ---------- Départements ----------
  // [numéro, nom, préfecture, région, population]. Préfectures : Insee (code officiel géographique).
  // Population : Insee, populations de référence 2022 (Mayotte : recensement exhaustif du 1er janvier 2026),
  // copie dans outils/donnees/population-departements.csv.
  var D = [
    ['01', 'Ain', 'Bourg-en-Bresse', 'ARA', 671289], ['02', 'Aisne', 'Laon', 'HDF', 525558],
    ['03', 'Allier', 'Moulins', 'ARA', 334715], ['04', 'Alpes-de-Haute-Provence', 'Digne-les-Bains', 'PACA', 167179],
    ['05', 'Hautes-Alpes', 'Gap', 'PACA', 141677], ['06', 'Alpes-Maritimes', 'Nice', 'PACA', 1114579],
    ['07', 'Ardèche', 'Privas', 'ARA', 333229], ['08', 'Ardennes', 'Charleville-Mézières', 'GE', 267204],
    ['09', 'Ariège', 'Foix', 'OCC', 155339], ['10', 'Aube', 'Troyes', 'GE', 311076],
    ['11', 'Aude', 'Carcassonne', 'OCC', 377773], ['12', 'Aveyron', 'Rodez', 'OCC', 279736],
    ['13', 'Bouches-du-Rhône', 'Marseille', 'PACA', 2069811], ['14', 'Calvados', 'Caen', 'NOR', 704605],
    ['15', 'Cantal', 'Aurillac', 'ARA', 144399], ['16', 'Charente', 'Angoulême', 'NA', 351603],
    ['17', 'Charente-Maritime', 'La Rochelle', 'NA', 668160], ['18', 'Cher', 'Bourges', 'CVL', 299496],
    ['19', 'Corrèze', 'Tulle', 'NA', 240120], ['21', 'Côte-d’Or|Cote d\'Or', 'Dijon', 'BFC', 537577],
    ['22', 'Côtes-d’Armor|Cotes d\'Armor', 'Saint-Brieuc', 'BRE', 609598], ['23', 'Creuse', 'Guéret', 'NA', 115529],
    ['24', 'Dordogne', 'Périgueux', 'NA', 416325], ['25', 'Doubs', 'Besançon', 'BFC', 548662],
    ['26', 'Drôme', 'Valence', 'ARA', 521432], ['27', 'Eure', 'Évreux', 'NOR', 601305],
    ['28', 'Eure-et-Loir', 'Chartres', 'CVL', 432950], ['29', 'Finistère', 'Quimper', 'BRE', 927912],
    ['30', 'Gard', 'Nîmes', 'OCC', 764010], ['31', 'Haute-Garonne', 'Toulouse', 'OCC', 1456261],
    ['32', 'Gers', 'Auch', 'OCC', 192649], ['33', 'Gironde', 'Bordeaux', 'NA', 1674980],
    ['34', 'Hérault', 'Montpellier', 'OCC', 1217331], ['35', 'Ille-et-Vilaine', 'Rennes', 'BRE', 1109232],
    ['36', 'Indre', 'Châteauroux', 'CVL', 216809], ['37', 'Indre-et-Loire', 'Tours', 'CVL', 616326],
    ['38', 'Isère', 'Grenoble', 'ARA', 1291380], ['39', 'Jura', 'Lons-le-Saunier', 'BFC', 258405],
    ['40', 'Landes', 'Mont-de-Marsan', 'NA', 428427], ['41', 'Loir-et-Cher', 'Blois', 'CVL', 328953],
    ['42', 'Loire', 'Saint-Étienne', 'ARA', 772041], ['43', 'Haute-Loire', 'Le Puy-en-Velay', 'ARA', 228161],
    ['44', 'Loire-Atlantique', 'Nantes', 'PDL', 1473156], ['45', 'Loiret', 'Orléans', 'CVL', 687063],
    ['46', 'Lot', 'Cahors', 'OCC', 175620], ['47', 'Lot-et-Garonne', 'Agen', 'NA', 332226],
    ['48', 'Lozère', 'Mende', 'OCC', 76503], ['49', 'Maine-et-Loire', 'Angers', 'PDL', 828151],
    ['50', 'Manche', 'Saint-Lô', 'NOR', 496815], ['51', 'Marne', 'Châlons-en-Champagne', 'GE', 564107],
    ['52', 'Haute-Marne', 'Chaumont', 'GE', 169865], ['53', 'Mayenne', 'Laval', 'PDL', 305437],
    ['54', 'Meurthe-et-Moselle', 'Nancy', 'GE', 732898], ['55', 'Meuse', 'Bar-le-Duc', 'GE', 180745],
    ['56', 'Morbihan', 'Vannes', 'BRE', 776103], ['57', 'Moselle', 'Metz', 'GE', 1050721],
    ['58', 'Nièvre', 'Nevers', 'BFC', 202299], ['59', 'Nord', 'Lille', 'HDF', 2616909],
    ['60', 'Oise', 'Beauvais', 'HDF', 830725], ['61', 'Orne', 'Alençon', 'NOR', 276144],
    ['62', 'Pas-de-Calais', 'Arras', 'HDF', 1460184], ['63', 'Puy-de-Dôme', 'Clermont-Ferrand', 'ARA', 664385],
    ['64', 'Pyrénées-Atlantiques', 'Pau', 'NA', 699473], ['65', 'Hautes-Pyrénées', 'Tarbes', 'OCC', 231453],
    ['66', 'Pyrénées-Orientales', 'Perpignan', 'OCC', 492964], ['67', 'Bas-Rhin', 'Strasbourg', 'GE', 1156963],
    ['68', 'Haut-Rhin', 'Colmar', 'GE', 767800], ['69', 'Rhône', 'Lyon', 'ARA', 1907982],
    ['70', 'Haute-Saône', 'Vesoul', 'BFC', 233920], ['71', 'Saône-et-Loire', 'Mâcon', 'BFC', 549136],
    ['72', 'Sarthe', 'Le Mans', 'PDL', 566129], ['73', 'Savoie', 'Chambéry', 'ARA', 445288],
    ['74', 'Haute-Savoie', 'Annecy', 'ARA', 849583], ['75', 'Paris', 'Paris', 'IDF', 2113705],
    ['76', 'Seine-Maritime', 'Rouen', 'NOR', 1260205], ['77', 'Seine-et-Marne', 'Melun', 'IDF', 1452399],
    ['78', 'Yvelines', 'Versailles', 'IDF', 1470778], ['79', 'Deux-Sèvres', 'Niort', 'NA', 375415],
    ['80', 'Somme', 'Amiens', 'HDF', 565540], ['81', 'Tarn', 'Albi', 'OCC', 396168],
    ['82', 'Tarn-et-Garonne', 'Montauban', 'OCC', 264924], ['83', 'Var', 'Toulon', 'PACA', 1108364],
    ['84', 'Vaucluse', 'Avignon', 'PACA', 568702], ['85', 'Vendée', 'La Roche-sur-Yon', 'PDL', 706343],
    ['86', 'Vienne', 'Poitiers', 'NA', 438688], ['87', 'Haute-Vienne', 'Limoges', 'NA', 372438],
    ['88', 'Vosges', 'Épinal', 'GE', 358700], ['89', 'Yonne', 'Auxerre', 'BFC', 333896],
    ['90', 'Territoire de Belfort', 'Belfort', 'BFC', 140082], ['91', 'Essonne', 'Évry-Courcouronnes|Évry', 'IDF', 1324546],
    ['92', 'Hauts-de-Seine', 'Nanterre', 'IDF', 1647435], ['93', 'Seine-Saint-Denis', 'Bobigny', 'IDF', 1681725],
    ['94', 'Val-de-Marne', 'Créteil', 'IDF', 1419531], ['95', 'Val-d’Oise|Val d\'Oise', 'Cergy|Pontoise|Cergy-Pontoise', 'IDF', 1270845],
    ['2A', 'Corse-du-Sud', 'Ajaccio', 'COR', 166045], ['2B', 'Haute-Corse', 'Bastia', 'COR', 185231],
    ['971', 'Guadeloupe', 'Basse-Terre', 'GUA', 383569], ['972', 'Martinique', 'Fort-de-France', 'MAR', 361019],
    ['973', 'Guyane', 'Cayenne', 'GUY', 288382], ['974', 'La Réunion|Réunion', 'Saint-Denis', 'REU', 881348],
    ['976', 'Mayotte', 'Mamoudzou', 'MAY', 323153]
  ];
  // Niveaux (choix de l'utilisateur du 13/11/2026) : les départements rangés par population, les 25 plus peuplés
  // en Facile, les 25 suivants en Moyen, puis en Difficile, et les 26 derniers en Expert.
  var NIVEAUX_D = ['facile', 'moyen', 'difficile', 'expert'];
  var RANG = D.slice().sort(function (a, b) { return b[4] - a[4]; });
  function niveauDe(d) { return NIVEAUX_D[Math.min(3, Math.floor(RANG.indexOf(d) / 25))]; }
  function parNiveau(choix) {
    var r = { facile: [], moyen: [], difficile: [], expert: [] };
    D.forEach(function (d) { r[niveauDe(d)].push(choix(d)); });
    return r;
  }

  var REGIONS = {
    ARA: 'Auvergne-Rhône-Alpes', BFC: 'Bourgogne-Franche-Comté', BRE: 'Bretagne', CVL: 'Centre-Val de Loire',
    COR: 'Corse', GE: 'Grand Est', HDF: 'Hauts-de-France', IDF: 'Île-de-France|Ile de France', NOR: 'Normandie',
    NA: 'Nouvelle-Aquitaine', OCC: 'Occitanie', PDL: 'Pays de la Loire', PACA: 'Provence-Alpes-Côte d’Azur|PACA',
    GUA: 'Guadeloupe', MAR: 'Martinique', GUY: 'Guyane', REU: 'La Réunion', MAY: 'Mayotte'
  };

  // ---------- Pays (noms en français, code des drapeaux flag-icons) ----------
  var PAYS = {
    fr: 'France', it: 'Italie', de: 'Allemagne', es: 'Espagne', gb: 'Royaume-Uni', us: 'États-Unis|Etats-Unis|USA',
    jp: 'Japon', ca: 'Canada', br: 'Brésil', ch: 'Suisse', be: 'Belgique', nl: 'Pays-Bas|Hollande', pt: 'Portugal',
    gr: 'Grèce', se: 'Suède', no: 'Norvège', dk: 'Danemark', fi: 'Finlande', ie: 'Irlande', pl: 'Pologne',
    at: 'Autriche', ua: 'Ukraine', cn: 'Chine', in: 'Inde', mx: 'Mexique', ar: 'Argentine', za: 'Afrique du Sud',
    kr: 'Corée du Sud', au: 'Australie', eg: 'Égypte', ma: 'Maroc', tr: 'Turquie', sn: 'Sénégal', dz: 'Algérie',
    td: 'Tchad', ro: 'Roumanie', mc: 'Monaco', id: 'Indonésie', ci: 'Côte d’Ivoire|Cote d\'Ivoire',
    lu: 'Luxembourg', sk: 'Slovaquie', si: 'Slovénie', co: 'Colombie', ec: 'Équateur|Equateur', nz: 'Nouvelle-Zélande', is: 'Islande'
  };
  var DRAPEAUX = {
    facile: ['fr', 'it', 'de', 'es', 'gb', 'us', 'jp', 'ca', 'br', 'ch'],
    moyen: ['be', 'nl', 'pt', 'gr', 'se', 'no', 'dk', 'fi', 'ie', 'pl', 'at', 'ua'],
    difficile: ['cn', 'in', 'mx', 'ar', 'za', 'kr', 'au', 'eg', 'ma', 'tr', 'sn', 'dz'],
    // Drapeaux qui se ressemblent (Tchad / Roumanie, Monaco / Indonésie, Colombie / Équateur…).
    expert: ['td', 'ro', 'mc', 'id', 'ci', 'lu', 'sk', 'si', 'co', 'ec', 'nz', 'is']
  };
  function drapeaux() {
    var r = {};
    Object.keys(DRAPEAUX).forEach(function (n) { r[n] = DRAPEAUX[n].map(function (c) { return [c, PAYS[c]]; }); });
    return r;
  }

  var JEUX = [
    // ---------- France ----------
    // v8.0 (demande du 13/11/2026) : numéros et préfectures réunis en un seul jeu ; on demande le numéro,
    // le nom ou la préfecture ; 25 départements par niveau (population).
    { id: 'g01', matiere: 'geographie', famille: 'france', nom: 'Départements', court: 'Départ.', icone: '🔢', series: [
      { k: 'paires', gauche: 'Numéro', droite: 'Département', consigneR: 'Relie chaque numéro à son département.',
        q: 'Quel département porte le numéro {a} ?', qi: 'Quel est le numéro de ce département : {b} ?',
        niveaux: parNiveau(function (d) { return [d[0], d[1]]; }) },
      { k: 'paires', gauche: 'Département', droite: 'Préfecture', consigneR: 'Relie chaque département à sa préfecture.',
        q: 'Quelle est la préfecture de ce département : {a} ?', qi: '{b} est la préfecture de quel département ?',
        niveaux: parNiveau(function (d) { return [d[1], d[2]]; }) },
      { k: 'paires', gauche: 'Numéro', droite: 'Préfecture', consigneR: 'Relie chaque numéro de département à sa préfecture.',
        q: 'Quelle est la préfecture du département numéro {a} ?', qi: '{b} est la préfecture du département numéro… ?',
        niveaux: parNiveau(function (d) { return [d[0], d[2]]; }) }
    ] },
    { id: 'g03', matiere: 'geographie', famille: 'france', nom: 'Régions', court: 'Régions', icone: '🗺️', series: [
      // Département ↔ région : les 25 départements du niveau (population), dans les deux sens.
      { k: 'paires', gauche: 'Département', droite: 'Région', consigneR: 'Relie chaque département à sa région.',
        q: 'Dans quelle région se trouve ce département : {a} ?', qi: 'Lequel de ces départements se trouve en région {b} ?',
        niveaux: parNiveau(function (d) { return [d[1], REGIONS[d[3]]]; }) },
      { k: 'paires', gauche: 'Région', droite: 'Chef-lieu', consigneR: 'Relie chaque région à son chef-lieu.',
        q: 'Quel est le chef-lieu de la région {a} ?', qi: '{b} est le chef-lieu de quelle région ?',
        niveaux: {
          facile: [['Île-de-France', 'Paris'], ['Bretagne', 'Rennes'], ['Occitanie', 'Toulouse'], ['Provence-Alpes-Côte d’Azur', 'Marseille'],
            ['Nouvelle-Aquitaine', 'Bordeaux'], ['Hauts-de-France', 'Lille'], ['Auvergne-Rhône-Alpes', 'Lyon'], ['Grand Est', 'Strasbourg'], ['Pays de la Loire', 'Nantes']],
          moyen: [['Bourgogne-Franche-Comté', 'Dijon'], ['Centre-Val de Loire', 'Orléans'], ['Corse', 'Ajaccio'], ['Normandie', 'Rouen']],
          difficile: [['Guadeloupe', 'Basse-Terre'], ['Martinique', 'Fort-de-France'], ['Guyane', 'Cayenne'], ['La Réunion', 'Saint-Denis'],
            ['Mayotte', 'Mamoudzou']]
        } }
    ] },
    // Cartes (v8.0, demande du 13/11/2026) : France (départements), Europe, Monde. Niveaux : départements par
    // population, pays par superficie (js/cartes-geo.js). Normal : toucher la zone nommée ; Quiz : la zone est en vert.
    { id: 'g10', matiere: 'geographie', famille: 'cartes', nom: 'Carte de France', court: 'France', icone: '🇫🇷', series: [{ k: 'carte', carte: 'france' }] },
    { id: 'g18', matiere: 'geographie', famille: 'cartes', nom: 'Carte d’Europe', court: 'Europe', icone: '🇪🇺', series: [{ k: 'carte', carte: 'europe' }] },
    { id: 'g19', matiere: 'geographie', famille: 'cartes', nom: 'Carte du monde', court: 'Monde', icone: '🌍', series: [{ k: 'carte', carte: 'monde' }] },

    // ---------- Monde ----------
    { id: 'g04', matiere: 'geographie', famille: 'monde', nom: 'Pays et capitales', court: 'Capitales', icone: '🏙️', series: [
      { k: 'paires', gauche: 'Pays', droite: 'Capitale', consigneR: 'Relie chaque pays à sa capitale.',
        q: 'Quelle est la capitale de ce pays : {a} ?', qi: '{b} est la capitale de quel pays ?',
        niveaux: {
          facile: [['Italie', 'Rome'], ['Espagne', 'Madrid'], ['Allemagne', 'Berlin'], ['Royaume-Uni', 'Londres|London'],
            ['Belgique', 'Bruxelles'], ['Portugal', 'Lisbonne'], ['Grèce', 'Athènes'], ['Irlande', 'Dublin']],
          moyen: [['Autriche', 'Vienne'], ['Pologne', 'Varsovie'], ['Suède', 'Stockholm'], ['Norvège', 'Oslo'],
            ['Danemark', 'Copenhague'], ['Finlande', 'Helsinki'], ['Russie', 'Moscou'], ['Hongrie', 'Budapest'],
            ['Tchéquie', 'Prague'], ['Pays-Bas', 'Amsterdam'], ['Roumanie', 'Bucarest'], ['Ukraine', 'Kiev|Kyiv|Kiyv']],
          difficile: [['Japon', 'Tokyo'], ['Chine', 'Pékin|Beijing'], ['Inde', 'New Delhi|Delhi'], ['États-Unis', 'Washington'],
            ['Argentine', 'Buenos Aires'], ['Égypte', 'Le Caire|Caire'], ['Maroc', 'Rabat'], ['Mexique', 'Mexico'],
            ['Algérie', 'Alger'], ['Sénégal', 'Dakar'], ['Corée du Sud', 'Séoul'], ['Pérou', 'Lima']],
          // Capitales pièges : ce n'est pas la ville la plus connue du pays.
          expert: [['Australie', 'Canberra'], ['Canada', 'Ottawa'], ['Turquie', 'Ankara'], ['Suisse', 'Berne'],
            ['Nouvelle-Zélande', 'Wellington'], ['Nigeria', 'Abuja'], ['Brésil', 'Brasília|Brasilia'], ['Pakistan', 'Islamabad'],
            ['Kazakhstan', 'Astana'], ['Côte d’Ivoire', 'Yamoussoukro'], ['Viêt Nam', 'Hanoï|Hanoi']]
        } }
    ] },
    { id: 'g05', matiere: 'geographie', famille: 'monde', nom: 'Drapeaux', court: 'Drapeaux', icone: '🚩', series: [
      { k: 'paires', gauche: 'Drapeau', droite: 'Pays', image: 'drapeau', consigneR: 'Relie chaque drapeau à son pays.',
        q: 'De quel pays est ce drapeau ?', niveaux: drapeaux() }
    ] },
    { id: 'g07', matiere: 'geographie', famille: 'monde', nom: 'Pays voisins', court: 'Voisins', icone: '🧭', series: [
      { k: 'classer', niveaux: {
        facile: [{ q: 'Range ces pays : ont-ils une frontière avec la France métropolitaine ?', colonnes: ['Voisin de la France', 'Pas voisin'],
          items: [['Belgique', 0], ['Luxembourg', 0], ['Allemagne', 0], ['Suisse', 0], ['Italie', 0], ['Espagne', 0], ['Andorre', 0], ['Monaco', 0],
            ['Portugal', 1], ['Pays-Bas', 1], ['Autriche', 1], ['Pologne', 1], ['Danemark', 1], ['Irlande', 1], ['Grèce', 1], ['Tchéquie', 1]] }],
        moyen: [
          { q: 'Range ces pays : ont-ils une frontière avec l’Allemagne ?', colonnes: ['Voisin de l’Allemagne', 'Pas voisin'],
            items: [['Danemark', 0], ['Pologne', 0], ['Tchéquie', 0], ['Autriche', 0], ['Suisse', 0], ['Luxembourg', 0], ['Belgique', 0], ['Pays-Bas', 0],
              ['Italie', 1], ['Hongrie', 1], ['Slovaquie', 1], ['Suède', 1], ['Espagne', 1], ['Norvège', 1]] },
          { q: 'Range ces pays : ont-ils une frontière avec l’Italie ?', colonnes: ['Voisin de l’Italie', 'Pas voisin'],
            items: [['France', 0], ['Suisse', 0], ['Autriche', 0], ['Slovénie', 0], ['Saint-Marin', 0], ['Vatican', 0],
              ['Croatie', 1], ['Allemagne', 1], ['Hongrie', 1], ['Espagne', 1], ['Grèce', 1]] },
          { q: 'Range ces pays : ont-ils une frontière avec la Suisse ?', colonnes: ['Voisin de la Suisse', 'Pas voisin'],
            items: [['France', 0], ['Allemagne', 0], ['Autriche', 0], ['Liechtenstein', 0], ['Italie', 0],
              ['Belgique', 1], ['Luxembourg', 1], ['Slovénie', 1], ['Tchéquie', 1], ['Espagne', 1]] }
        ],
        difficile: [
          { q: 'Range ces pays : ont-ils une frontière avec le Brésil ?', colonnes: ['Voisin du Brésil', 'Pas voisin'],
            items: [['Argentine', 0], ['Uruguay', 0], ['Paraguay', 0], ['Bolivie', 0], ['Pérou', 0], ['Colombie', 0], ['Venezuela', 0], ['Guyana', 0], ['Suriname', 0],
              ['Chili', 1], ['Équateur', 1], ['Mexique', 1], ['Cuba', 1]] },
          { q: 'Range ces pays : ont-ils une frontière avec l’Algérie ?', colonnes: ['Voisin de l’Algérie', 'Pas voisin'],
            items: [['Maroc', 0], ['Tunisie', 0], ['Libye', 0], ['Niger', 0], ['Mali', 0], ['Mauritanie', 0],
              ['Égypte', 1], ['Sénégal', 1], ['Tchad', 1], ['Burkina Faso', 1], ['Espagne', 1]] },
          { q: 'Range ces pays : ont-ils une frontière avec les États-Unis ?', colonnes: ['Voisin des États-Unis', 'Pas voisin'],
            items: [['Canada', 0], ['Mexique', 0], ['Cuba', 1], ['Guatemala', 1], ['Groenland (Danemark)', 1], ['Russie', 1]] }
        ],
        expert: [
          { q: 'Range ces pays : ont-ils une frontière avec la Chine ?', colonnes: ['Voisin de la Chine', 'Pas voisin'],
            items: [['Russie', 0], ['Mongolie', 0], ['Kazakhstan', 0], ['Kirghizistan', 0], ['Tadjikistan', 0], ['Afghanistan', 0], ['Pakistan', 0],
              ['Inde', 0], ['Népal', 0], ['Bhoutan', 0], ['Myanmar', 0], ['Laos', 0], ['Viêt Nam', 0], ['Corée du Nord', 0],
              ['Japon', 1], ['Corée du Sud', 1], ['Thaïlande', 1], ['Cambodge', 1], ['Iran', 1], ['Ouzbékistan', 1], ['Bangladesh', 1]] }
        ]
      } },
      { k: 'qcm', vf: false, niveaux: {
        expert: [
          ['Combien de pays ont une frontière terrestre avec le Brésil (en comptant la France, par la Guyane) ?', '10', ['8', '9', '11', '12', '7']],
          ['Combien de pays ont une frontière terrestre avec la Chine ?', '14', ['10', '12', '13', '15', '16']],
          ['Combien de pays ont une frontière terrestre avec l’Allemagne ?', '9', ['6', '7', '8', '10', '11']],
          ['Combien de pays ont une frontière terrestre avec la Suisse ?', '5', ['3', '4', '6', '7', '8']],
          ['Combien de pays ont une frontière terrestre avec l’Italie ?', '6', ['3', '4', '5', '7', '8']],
          ['Combien de pays ont une frontière terrestre avec le Canada ?', '1', ['0', '2', '3', '4', '5']]
        ]
      } }
    ] },
    { id: 'g11', matiere: 'geographie', famille: 'monde', nom: 'Monuments du monde', court: 'Monuments', icone: '🗼', series: [
      { k: 'paires', gauche: 'Monument', droite: 'Ville', consigneR: 'Relie chaque monument à sa ville.',
        q: 'Dans quelle ville se trouve ce monument : {a} ?', niveaux: {
          facile: [['La tour Eiffel', 'Paris'], ['Le Colisée', 'Rome'], ['La statue de la Liberté', 'New York'],
            ['Big Ben', 'Londres'], ['La Sagrada Família', 'Barcelone'], ['La tour penchée', 'Pise']]
        } },
      { k: 'paires', gauche: 'Monument', droite: 'Pays', consigneR: 'Relie chaque monument à son pays.',
        q: 'Dans quel pays se trouve ce monument : {a} ?', niveaux: {
          moyen: [['Le Taj Mahal', 'Inde'], ['La Grande Muraille', 'Chine'], ['Les pyramides de Gizeh', 'Égypte'],
            ['Le Christ rédempteur de Rio', 'Brésil'], ['L’opéra de Sydney', 'Australie'], ['La porte de Brandebourg', 'Allemagne'],
            ['L’Acropole', 'Grèce']],
          difficile: [['Le Machu Picchu', 'Pérou'], ['Pétra', 'Jordanie'], ['Angkor Vat', 'Cambodge'], ['L’Alhambra', 'Espagne'],
            ['Le Kremlin', 'Russie'], ['Burj Khalifa', 'Émirats arabes unis|Emirats arabes unis|EAU'], ['Chichén Itzá', 'Mexique']],
          expert: [['Borobudur', 'Indonésie'], ['Sainte-Sophie', 'Turquie'], ['L’Atomium', 'Belgique'], ['Le château de Neuschwanstein', 'Allemagne'],
            ['Les moaï de l’île de Pâques', 'Chili'], ['La mosquée Hassan II', 'Maroc'], ['Le pont Charles', 'Tchéquie|Republique tcheque']]
        } }
    ] },

    // ---------- Nature ----------
    { id: 'g06', matiere: 'geographie', famille: 'nature', nom: 'Fleuves', court: 'Fleuves', icone: '🌊', series: [
      { k: 'paires', gauche: 'Fleuve', droite: 'Ville', consigneR: 'Relie chaque fleuve à une ville qu’il traverse.',
        q: 'Quelle ville le fleuve {a} traverse-t-il ?', ouverte: false, niveaux: {
          facile: [['La Seine', 'Paris'], ['La Loire', 'Nantes'], ['La Garonne', 'Toulouse'], ['Le Rhône', 'Lyon'], ['Le Rhin', 'Strasbourg']],
          moyen: [['La Tamise', 'Londres'], ['Le Tibre', 'Rome'], ['Le Tage', 'Lisbonne'], ['Le Danube', 'Budapest'], ['La Neva', 'Saint-Pétersbourg']]
        } },
      { k: 'paires', gauche: 'Fleuve', droite: 'Mer', consigneR: 'Relie chaque fleuve à la mer (ou l’océan) où il se jette.',
        q: 'Où se jette le fleuve : {a} ?', niveaux: {
          moyen: [['Le Danube', 'La mer Noire'], ['La Volga', 'La mer Caspienne'], ['Le Pô', 'La mer Adriatique'],
            ['La Vistule', 'La mer Baltique'], ['Le Rhin', 'La mer du Nord'], ['La Seine', 'La Manche'], ['Le Rhône', 'La mer Méditerranée']],
          difficile: [['Le Nil', 'La mer Méditerranée'], ['L’Amazone', 'L’océan Atlantique'], ['Le Mississippi', 'Le golfe du Mexique'],
            ['Le Gange', 'Le golfe du Bengale'], ['Le Yangzi Jiang', 'La mer de Chine orientale'], ['Le Saint-Laurent', 'Le golfe du Saint-Laurent']]
        } },
      { k: 'paires', gauche: 'Fleuve', droite: 'Source', consigneR: 'Relie chaque fleuve à l’endroit où il prend sa source.',
        q: 'Où le fleuve {a} prend-il sa source ?', ouverte: false, niveaux: {
          expert: [['La Loire', 'Au mont Gerbier-de-Jonc'], ['La Seine', 'Sur le plateau de Langres'], ['Le Rhône', 'Au glacier du Rhône, en Suisse'],
            ['Le Danube', 'Dans la Forêt-Noire, en Allemagne'], ['La Garonne', 'Dans le val d’Aran, en Espagne'], ['Le Rhin', 'Dans les Alpes suisses']]
        } },
      { k: 'classer', niveaux: {
        expert: [
          { q: 'Le Danube traverse ou longe 10 pays. Range ces pays.', colonnes: ['Le Danube y passe', 'Il n’y passe pas'],
            items: [['Allemagne', 0], ['Autriche', 0], ['Slovaquie', 0], ['Hongrie', 0], ['Croatie', 0], ['Serbie', 0], ['Roumanie', 0], ['Bulgarie', 0],
              ['Pologne', 1], ['Italie', 1], ['France', 1], ['Tchéquie', 1], ['Grèce', 1]] },
          { q: 'Range ces pays : le Rhin y passe-t-il ?', colonnes: ['Le Rhin y passe', 'Il n’y passe pas'],
            items: [['Suisse', 0], ['Allemagne', 0], ['France', 0], ['Pays-Bas', 0], ['Liechtenstein', 0],
              ['Belgique', 1], ['Luxembourg', 1], ['Italie', 1], ['Espagne', 1]] }
        ]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Quel est le plus long fleuve de France ?', 'La Loire', ['La Seine', 'Le Rhône', 'La Garonne', 'Le Rhin', 'La Dordogne']],
          ['Quel fleuve traverse Paris ?', 'La Seine', ['La Loire', 'Le Rhône', 'La Garonne', 'La Marne', 'Le Rhin']]],
        difficile: [['Quel est le plus long fleuve d’Afrique ?', 'Le Nil', ['Le Congo', 'Le Niger', 'Le Zambèze', 'Le Sénégal', 'L’Orange']],
          ['Quel est le plus long fleuve d’Europe ?', 'La Volga', ['Le Danube', 'Le Rhin', 'La Loire', 'Le Dniepr', 'L’Elbe']]]
      } }
    ] },
    { id: 'g09', matiere: 'geographie', famille: 'nature', nom: 'Montagnes et sommets', court: 'Montagnes', icone: '⛰️', series: [
      { k: 'paires', gauche: 'Massif', droite: 'Indice', consigneR: 'Relie chaque massif de France à ce qui le décrit.',
        q: 'Quel massif : {b} ?', ouverte: false, niveaux: {
          facile: [['Les Alpes', 'Le mont Blanc, plus haut sommet de France'], ['Les Pyrénées', 'La frontière avec l’Espagne'],
            ['Le Massif central', 'Les anciens volcans d’Auvergne'], ['Les Vosges', 'Entre la Lorraine et l’Alsace'],
            ['Le Jura', 'La frontière avec la Suisse, au nord des Alpes']]
        }, inverseSeul: true },
      { k: 'paires', gauche: 'Sommet', droite: 'Massif', consigneR: 'Relie chaque sommet de France à son massif.',
        q: 'Dans quel massif se trouve ce sommet : {a} ?', ouverte: false, niveaux: {
          moyen: [['Le mont Blanc', 'Les Alpes'], ['Le Vignemale', 'Les Pyrénées'], ['Le puy de Sancy', 'Le Massif central'],
            ['Le Grand Ballon', 'Les Vosges'], ['Le crêt de la Neige', 'Le Jura'], ['Le monte Cinto', 'La Corse']]
        } },
      { k: 'paires', gauche: 'Sommet', droite: 'Pays', consigneR: 'Relie chaque sommet à son pays.',
        q: 'Dans quel pays se trouve ce sommet : {a} ?', niveaux: {
          difficile: [['Le Kilimandjaro', 'Tanzanie'], ['L’Aconcagua', 'Argentine'], ['Le mont Fuji', 'Japon'], ['Le Denali', 'États-Unis'],
            ['L’Etna', 'Italie'], ['Le Teide', 'Espagne'], ['Le mont Olympe', 'Grèce']]
        } },
      { k: 'ordre', consigne: 'Range ces sommets du plus bas au plus haut.', sens: ['le plus bas', 'le plus haut'], niveaux: {
        expert: [['L’Everest', 8849, '8 849 m'], ['Le K2', 8611, '8 611 m'], ['L’Aconcagua', 6961, '6 961 m'], ['Le Denali', 6190, '6 190 m'],
          ['Le Kilimandjaro', 5895, '5 895 m'], ['L’Elbrouz', 5642, '5 642 m'], ['Le mont Blanc', 4806, 'environ 4 806 m']]
      } },
      { k: 'qcm', niveaux: {
        expert: [['Quel est le deuxième plus haut sommet du monde ?', 'Le K2', ['Le mont Blanc', 'Le Kilimandjaro', 'L’Aconcagua', 'Le Denali', 'Le Cervin']],
          ['Dans quelle chaîne de montagnes se trouve l’Aconcagua ?', 'Les Andes', ['L’Himalaya', 'Les Rocheuses', 'L’Atlas', 'Le Caucase', 'L’Oural']],
          ['Quelle chaîne de montagnes sert souvent de limite entre l’Europe et l’Asie ?', 'L’Oural', ['Les Alpes', 'Les Carpates', 'L’Atlas', 'Les Andes', 'L’Himalaya']]]
      } }
    ] },
    { id: 'g13', matiere: 'geographie', famille: 'nature', nom: 'Records de la Terre', court: 'Records', icone: '🏆', series: [
      { k: 'qcm', niveaux: {
        facile: [['Quel est le plus grand océan du monde ?', 'Le Pacifique', ['L’Atlantique', 'L’océan Indien', 'L’océan Arctique']],
          ['Quel est le plus haut sommet du monde ?', 'L’Everest', ['Le mont Blanc', 'Le Kilimandjaro', 'Le mont Fuji']],
          ['Quel est le plus grand pays du monde ?', 'La Russie', ['Le Canada', 'La Chine', 'Les États-Unis', 'Le Brésil']],
          ['Quel est le plus grand continent ?', 'L’Asie', ['L’Afrique', 'L’Europe', 'L’Amérique']],
          ['Quelle est la plus haute montagne de France ?', 'Le mont Blanc', ['Le Vignemale', 'Le puy de Dôme', 'Le mont Ventoux']]],
        moyen: [['Quel est le plus grand désert chaud du monde ?', 'Le Sahara', ['Le désert de Gobi', 'Le désert d’Atacama', 'Le Kalahari', 'Le désert d’Arabie']],
          ['Quelle est la plus grande île du monde ?', 'Le Groenland', ['Madagascar', 'La Grande-Bretagne', 'L’Islande', 'Bornéo']],
          ['Quel est le plus petit pays du monde ?', 'Le Vatican', ['Monaco', 'Le Luxembourg', 'Andorre', 'Saint-Marin']],
          ['Quel est le pays le plus peuplé du monde ?', 'L’Inde', ['La Russie', 'Les États-Unis', 'Le Brésil', 'L’Indonésie']],
          ['Quel est le plus long fleuve d’Europe ?', 'La Volga', ['Le Danube', 'Le Rhin', 'La Loire', 'Le Dniepr']]],
        difficile: [['Quelle est la plus grande forêt tropicale du monde ?', 'L’Amazonie', ['La forêt du Congo', 'La forêt de Bornéo', 'La forêt de Sumatra', 'La forêt de Nouvelle-Guinée']],
          ['Où se trouve l’endroit le plus profond des océans ?', 'La fosse des Mariannes', ['La fosse de Porto Rico', 'Le golfe du Mexique', 'La mer Méditerranée', 'La mer Rouge']],
          ['Quel est le plus grand pays d’Afrique ?', 'L’Algérie', ['L’Égypte', 'Le Nigeria', 'L’Afrique du Sud', 'Le Soudan']],
          ['Quel est le plus grand pays d’Amérique du Sud ?', 'Le Brésil', ['L’Argentine', 'Le Pérou', 'La Colombie', 'Le Chili']],
          ['Quelle est la plus haute chute d’eau du monde ?', 'Le Salto Ángel (Venezuela)', ['Les chutes du Niagara', 'Les chutes Victoria', 'Les chutes d’Iguazú', 'La cascade de Gavarnie']]],
        expert: [['Quel est le lac le plus profond du monde ?', 'Le lac Baïkal', ['Le lac Tanganyika', 'Le lac Supérieur', 'Le lac Victoria', 'Le lac Léman', 'La mer Caspienne']],
          ['Quel est le point le plus bas des terres émergées ?', 'Les rives de la mer Morte', ['La vallée de la Mort', 'Le désert d’Atacama', 'Les Pays-Bas', 'Le lac Assal']],
          ['Quel est le désert le plus sec du monde (hors pôles) ?', 'Le désert d’Atacama', ['Le Sahara', 'Le désert de Gobi', 'Le Kalahari', 'Le désert de Namib']],
          ['Quel est le plus haut sommet d’Afrique ?', 'Le Kilimandjaro', ['Le mont Kenya', 'Le Toubkal', 'Le mont Cameroun', 'Le Ras Dashen']],
          ['Quel est le plus haut sommet d’Amérique du Sud ?', 'L’Aconcagua', ['Le Chimborazo', 'Le Huascarán', 'Le Cotopaxi', 'Le Fitz Roy']],
          ['Quel est le plus long fleuve d’Asie ?', 'Le Yangzi Jiang', ['Le Gange', 'Le Mékong', 'L’Indus', 'Le fleuve Jaune']]]
      } },
      { k: 'ordre', consigne: 'Range ces océans du plus petit au plus grand.', sens: ['le plus petit', 'le plus grand'], niveaux: {
        difficile: [['L’océan Pacifique', 5, '1er'], ['L’océan Atlantique', 4, '2e'], ['L’océan Indien', 3, '3e'], ['L’océan Austral', 2, '4e'], ['L’océan Arctique', 1, '5e']]
      } },
      { k: 'ordre', consigne: 'Range ces continents du plus petit au plus grand.', sens: ['le plus petit', 'le plus grand'], niveaux: {
        expert: [['L’Asie', 7, '1er'], ['L’Afrique', 6, '2e'], ['L’Amérique du Nord', 5, '3e'], ['L’Amérique du Sud', 4, '4e'],
          ['L’Antarctique', 3, '5e'], ['L’Europe', 2, '6e'], ['L’Océanie', 1, '7e']]
      } }
    ] },
    { id: 'g17', matiere: 'geographie', famille: 'nature', nom: 'Climats et paysages', court: 'Climats', icone: '🌦️', series: [
      { k: 'paires', gauche: 'Paysage', droite: 'Description', consigneR: 'Relie chaque paysage à sa description.',
        q: 'Quel paysage : {b} ?', ouverte: false, inverseSeul: true, niveaux: {
          facile: [['Le désert', 'Très sec, très chaud le jour'], ['La banquise', 'De la glace sur la mer, très froid'],
            ['La forêt équatoriale', 'Chaud et humide toute l’année'], ['La savane', 'De hautes herbes, une saison sèche et une saison des pluies'],
            ['La haute montagne', 'Plus on monte, plus il fait froid'], ['La toundra', 'Un sol gelé et de petites plantes']]
        } },
      { k: 'paires', gauche: 'Animal', droite: 'Milieu', consigneR: 'Relie chaque animal au milieu où il vit.',
        q: 'Où vit cet animal : {a} ?', ouverte: false, niveaux: {
          moyen: [['L’ours polaire', 'La banquise'], ['Le dromadaire', 'Le désert'], ['Le lion', 'La savane'],
            ['L’orang-outan', 'La forêt équatoriale'], ['Le chamois', 'La montagne'], ['Le renne', 'La toundra']]
        } },
      { k: 'paires', gauche: 'Lieu', droite: 'Paysage', consigneR: 'Relie chaque lieu à son paysage.',
        q: 'Quel paysage trouve-t-on ici : {a} ?', ouverte: false, niveaux: {
          difficile: [['Le Sahara', 'Un désert chaud'], ['L’Amazonie', 'Une forêt équatoriale'], ['L’Antarctique', 'Un désert de glace'],
            ['Le Serengeti', 'Une savane'], ['La Sibérie du Nord', 'La toundra'], ['Le Groenland', 'Une calotte de glace']]
        } },
      { k: 'paires', gauche: 'Ville', droite: 'Climat', consigneR: 'Relie chaque ville de France à son climat.',
        q: 'Quel est le climat de cette ville : {a} ?', ouverte: false, niveaux: {
          expert: [['Brest', 'Océanique'], ['Paris', 'Océanique dégradé'], ['Strasbourg', 'Semi-continental'],
            ['Marseille', 'Méditerranéen'], ['Chamonix', 'Montagnard']]
        } },
      { k: 'vf', niveaux: {
        moyen: [['Dans la forêt équatoriale, il pleut presque tous les jours.', true, ''],
          ['Dans le désert, il fait toujours chaud, même la nuit.', false, 'La nuit, il peut faire très froid dans le désert.']],
        difficile: [['La toundra se trouve près de l’équateur.', false, 'La toundra se trouve près des pôles, là où le sol reste gelé.'],
          ['Le climat méditerranéen a des étés chauds et secs.', true, '']]
      } }
    ] }
  ];

  // Paires dont on ne pose la question que dans un sens (« Quel massif : … ? ») : a et b inversés pour le moteur.
  JEUX.forEach(function (j) {
    j.series.forEach(function (s) {
      if (!s.inverseSeul) return;
      Object.keys(s.niveaux).forEach(function (n) { s.niveaux[n] = s.niveaux[n].map(function (p) { return [p[1], p[0]]; }); });
      var g = s.gauche; s.gauche = s.droite; s.droite = g;
      s.q = s.q.replace('{b}', '{a}');
      // Relier : les descriptions à gauche, les noms à droite.
    });
  });

  // Familles de l'écran de réglage (icône, nom, jeux dans l'ordre).
  var FAMILLES = [
    { id: 'cartes', nom: 'Cartes', icone: '📍' },
    { id: 'france', nom: 'France', icone: '🇫🇷' },
    { id: 'monde', nom: 'Monde', icone: '🌍' },
    { id: 'nature', nom: 'Nature', icone: '🏔️' }
  ];

  S.ajouter(JEUX);
  var api = { JEUX: JEUX, FAMILLES: FAMILLES, PAYS: PAYS, DEPARTEMENTS: D, REGIONS: REGIONS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Geographie = api;
})(this);
