// Histoire (v7.1) : la matière Histoire, rangée par périodes (BACKLOG lignes 270 et 275).
// Choix de l'utilisateur du 12/11/2026 : 7 périodes, 51 jeux, 4 niveaux, et chaque niveau n'a QUE son
// propre contenu (Expert = seulement du contenu expert). Livraison par période : l'Antiquité d'abord (12
// jeux, regroupés en 6 en v8.4), puis la Préhistoire (v7.6, 5 jeux), le Moyen Âge (v7.7, 8 jeux, regroupés en 3 en v8.5), la Renaissance (v7.8, 6 jeux), les Temps modernes (v7.9, 4 jeux), la Révolution et le XIXe siècle (v7.10, 9 jeux) et le XXe siècle (v7.11, 7 jeux).
// Format des séries : voir js/savoirs.js. « A|B » = A s'affiche, B est aussi accepté en question ouverte.
(function (racine) {
  'use strict';
  var S = typeof module !== 'undefined' && module.exports ? require('./savoirs.js') : racine.Savoirs;

  // ---------- Chiffres romains (jeu a10) : contenu calculé ----------
  function romain(n) {
    var V = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']], r = '';
    V.forEach(function (x) { while (n >= x[0]) { r += x[1]; n -= x[0]; } });
    return r;
  }
  function paresRomains(liste) { return liste.map(function (n) { return [romain(n), String(n)]; }); }
  function de(a, b) { var t = []; for (var i = a; i <= b; i++) t.push(i); return t; }
  var ROMAINS = {
    facile: paresRomains(de(1, 12)),                       // les heures d'une horloge
    moyen: paresRomains(de(13, 50)),
    difficile: paresRomains([51, 55, 58, 64, 69, 74, 77, 83, 88, 91, 94, 99, 100, 104, 109, 140, 149, 190, 199, 240,
      267, 290, 314, 349, 388, 399, 400, 444, 490, 499, 500]),
    // Expert : de grands nombres et des années (476, 800, 1492, 1789…).
    expert: paresRomains([476, 800, 987, 999, 1066, 1214, 1453, 1492, 1515, 1598, 1643, 1715, 1789, 1848, 1889,
      1914, 1944, 1969, 1989, 2002, 2026, 2444, 3888, 3999])
  };

  var JEUX = [
    // ---------- Préhistoire (v7.6 ; v8.3 : 2 jeux regroupés, choix de l'utilisateur du 13/11/2026, BACKLOG ligne 326) ----------
    // Nos ancêtres et les périodes = anciens jeux « Nos ancêtres » + « Paléolithique ou Néolithique ? » ;
    // Art, outils et mégalithes = anciens « Grottes ornées » + « Outils et inventions » + « Mégalithes ». Dates « environ », les plus admises.
    { id: 'p01', matiere: 'histoire', famille: 'pre', nom: 'Nos ancêtres et les périodes', court: 'Ancêtres', icone: '🧬', series: [
      { k: 'ordre', consigne: 'Range nos ancêtres du plus ancien au plus récent.', niveaux: {
        facile: [['Lucy, l’australopithèque', -3200000, 'il y a environ 3,2 millions d’années'],
          ['L’homme de Néandertal', -100000, 'il y a environ 100 000 ans'], ['Nous, Homo sapiens, aujourd’hui', 0, 'aujourd’hui']],
        moyen: [['Toumaï, retrouvé au Tchad', -7000000, 'il y a environ 7 millions d’années'], ['Homo habilis, l’homme habile', -2400000, 'il y a environ 2,4 millions d’années'],
          ['Homo erectus, l’homme debout', -1900000, 'il y a environ 1,9 million d’années'], ['Les premiers Homo sapiens, en Afrique', -300000, 'il y a environ 300 000 ans']],
        difficile: [['Les australopithèques', -3500000, 'il y a environ 3,5 millions d’années'], ['L’homme de Tautavel', -450000, 'il y a environ 450 000 ans'],
          ['Ötzi, l’homme des glaces', -5300, 'il y a environ 5 300 ans'], ['Les hommes de Cro-Magnon', -28000, 'il y a environ 28 000 ans'],
          ['Les peintres de la grotte Chauvet', -36000, 'il y a environ 36 000 ans']],
        expert: [['Les premiers outils de pierre taillée', -3300000, 'il y a environ 3,3 millions d’années'], ['Homo erectus quitte l’Afrique', -1800000, 'il y a environ 1,8 million d’années'],
          ['Les hommes maîtrisent le feu en Europe', -400000, 'il y a environ 400 000 ans'], ['Disparition des derniers Néandertaliens', -40000, 'il y a environ 40 000 ans'],
          ['Les peintres de Lascaux', -19000, 'il y a environ 18 000 à 20 000 ans'], ['Débuts de l’agriculture au Proche-Orient', -11000, 'il y a environ 11 000 ans']]
      } },
      { k: 'paires', gauche: 'Ancêtre', droite: 'Où on l’a trouvé', consigneR: 'Relie chaque ancêtre au pays où on l’a trouvé.',
        q: 'Dans quel pays a-t-on trouvé {a} ?', ouverte: false, niveaux: {
          facile: [['Toumaï', 'Au Tchad'], ['Lucy', 'En Éthiopie'], ['L’homme de Tautavel', 'En France'], ['Ötzi, l’homme des glaces', 'Dans les Alpes, en Italie']],
          moyen: [['L’homme de Pékin', 'En Chine'], ['L’homme de Néandertal, en 1856', 'En Allemagne'], ['Le premier Cro-Magnon', 'En France, en Dordogne'], ['Les plus vieux Homo sapiens', 'Au Maroc']],
          difficile: [['L’homme de Kabwe', 'En Zambie'], ['L’homme de Flores', 'Sur l’île de Flores, en Indonésie'],
            ['L’enfant de Taung', 'En Afrique du Sud'], ['Turkana Boy', 'Au Kenya']],
          expert: [['Homo naledi', 'En Afrique du Sud, grotte Rising Star'], ['L’homme de Denisova', 'En Russie, dans l’Altaï'], ['Orrorin', 'Au Kenya, collines de Tugen'],
            ['La Ferrassie 1, un Néandertal', 'En Dordogne'], ['Le crâne de Petralona', 'En Grèce'], ['Le crâne de Steinheim', 'En Allemagne, près de Stuttgart']]
        } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve l’ancêtre.', niveaux: {
        facile: [{ r: 'Lucy', i: ['Je suis une ancêtre très ancienne.', 'J’ai vécu il y a environ 3,2 millions d’années.', 'On a retrouvé mon squelette en 1974.', 'Je vivais en Éthiopie.', 'Mon nom vient d’une chanson des Beatles.'] },
          { r: 'Ötzi', i: ['J’ai vécu à la fin de la préhistoire.', 'Je portais des habits de cuir et une hache en cuivre.', 'Je suis mort il y a environ 5 300 ans.', 'Des randonneurs m’ont trouvé en 1991.', 'J’étais conservé dans un glacier des Alpes.'] }],
        moyen: [{ r: 'L’homme de Tautavel', i: ['J’ai vécu il y a environ 450 000 ans.', 'Je chassais le cheval, le renne et le bison.', 'J’habitais une grotte : la Caune de l’Arago.', 'Je vivais dans les Pyrénées-Orientales.', 'Je suis l’un des plus anciens habitants connus de France.'] }],
        difficile: [{ r: 'L’homme de Néandertal', i: ['J’ai vécu en Europe et en Asie.', 'J’étais trapu et j’avais un gros nez.', 'J’enterrais parfois mes morts.', 'J’ai disparu il y a environ 40 000 ans.', 'On m’a nommé d’après une vallée d’Allemagne.'] }],
        expert: [{ r: 'Toumaï', i: ['Je suis l’un des plus anciens ancêtres connus.', 'J’ai environ 7 millions d’années.', 'Une équipe franco-tchadienne m’a trouvé en 2001.', 'Mon nom veut dire « espoir de vie » en langue goran.', 'On a trouvé mon crâne au Tchad.'] }]
      } },
      { k: 'classer', niveaux: {
        facile: [{ q: 'Range : Paléolithique (pierre taillée) ou Néolithique (pierre polie) ?', colonnes: ['Paléolithique', 'Néolithique'],
          items: [['Chasser le mammouth', 0], ['Cueillir des fruits sauvages', 0], ['Peindre dans les grottes', 0], ['Changer souvent de camp', 0],
            ['Cultiver le blé', 1], ['Élever des moutons', 1], ['Vivre dans un village', 1], ['Fabriquer des pots en terre', 1]] }],
        moyen: [{ q: 'Range ces outils et ces modes de vie : Paléolithique ou Néolithique ?', colonnes: ['Paléolithique', 'Néolithique'],
          items: [['Le biface', 0], ['Le propulseur', 0], ['Être nomade', 0], ['Le harpon en bois de renne', 0], ['Les huttes en os de mammouth', 0],
            ['La hache en pierre polie', 1], ['Être sédentaire', 1], ['La faucille', 1], ['La meule pour moudre le grain', 1], ['Les champs de lentilles et de pois', 1]] }],
        difficile: [{ q: 'Range ces lieux et ces trouvailles : Paléolithique ou Néolithique ?', colonnes: ['Paléolithique', 'Néolithique'],
          items: [['La grotte de Lascaux', 0], ['La grotte Chauvet', 0], ['La Dame de Brassempouy', 0], ['L’homme de Tautavel', 0], ['Les aiguilles à chas en os', 0],
            ['Les menhirs de Carnac', 1], ['Les dolmens', 1], ['Le tissage de la laine et du lin', 1], ['Les greniers à grain', 1], ['Les premiers villages de maisons en bois', 1]] }],
        expert: [{ q: 'Range ces cultures et ces sites : Paléolithique ou Néolithique ?', colonnes: ['Paléolithique', 'Néolithique'],
          items: [['Le Magdalénien', 0], ['L’Aurignacien', 0], ['Le Moustérien', 0], ['Le Solutréen', 0], ['Les feuilles de laurier en silex', 0],
            ['Le Rubané', 1], ['Le Chasséen', 1], ['Le Cardial', 1], ['Le site de Çatal Höyük', 1], ['Le cairn de Barnenez', 1]] }]
      } },
      { k: 'ordre', consigne: 'Range ces périodes de la plus ancienne à la plus récente.', sens: ['la plus ancienne', 'la plus récente'], niveaux: {
        difficile: [['Le Paléolithique', 1, '1re'], ['Le Mésolithique', 2, '2e'], ['Le Néolithique', 3, '3e'], ['L’âge du bronze', 4, '4e'], ['L’âge du fer', 5, '5e']]
      } },
      { k: 'vf', niveaux: {
        facile: [['Au Paléolithique, les hommes taillaient la pierre.', true, ''],
          ['Au Paléolithique, les hommes cultivaient des champs de blé.', false, 'Ils chassaient, pêchaient et cueillaient : l’agriculture arrive au Néolithique.'],
          ['Les hommes préhistoriques ont vu des dinosaures.', false, 'Les dinosaures ont disparu il y a 66 millions d’années, bien avant les premiers hommes.']],
        moyen: [['Au Néolithique, les hommes deviennent sédentaires : ils vivent au même endroit.', true, ''],
          ['Le mot « Néolithique » veut dire « âge de la pierre nouvelle ».', true, ''],
          ['Les hommes préhistoriques vivaient tous dans des grottes.', false, 'Ils vivaient surtout sous des abris de roche, dans des tentes ou des huttes ; les grottes servaient souvent de sanctuaires.']],
        difficile: [['L’agriculture est née au Proche-Orient avant d’arriver en France.', true, ''],
          ['Le Mésolithique se situe entre le Paléolithique et le Néolithique.', true, ''],
          ['Le chat a été le premier animal domestiqué.', false, 'C’est le chien, apprivoisé dès le Paléolithique.']],
        expert: [['L’invention de l’écriture marque la fin de la préhistoire.', true, 'Vers 3300 av. J.-C., en Mésopotamie.'],
          ['Le Néolithique commence partout dans le monde à la même date.', false, 'Il commence au Proche-Orient bien avant l’Europe de l’Ouest.']]
      } },
      { k: 'qcm', niveaux: {
        facile: [
          ["Comment appelle-t-on la très longue période avant l’invention de l’écriture ?", "La Préhistoire", ["L’Antiquité", "Le Moyen Âge", "Les Temps modernes"]],
          ["Sur quel continent sont apparus les premiers humains ?", "L’Afrique", ["L’Europe", "L’Asie", "L’Amérique"]],
          ["Quel grand animal à longs poils et à grandes défenses vivait pendant la préhistoire ?", "Le mammouth", ["L’éléphant d’Afrique", "Le tyrannosaure", "Le rhinocéros blanc"]],
          ["Comment s’appelle l’ancêtre célèbre retrouvé en Éthiopie en 1974 ?", "Lucy", ["Toumaï", "Ötzi", "Cro-Magnon"]],
          ["Au Paléolithique, les hommes se nourrissent en chassant, en pêchant et en…", "cueillant des plantes sauvages", ["cultivant du blé", "élevant des vaches", "achetant au marché"]],
          ["Que veut dire « Paléolithique » ?", "L’âge de la pierre ancienne", ["L’âge de la pierre nouvelle", "L’âge du bronze", "L’âge du fer"]],
          ["Au Néolithique, les hommes commencent à…", "cultiver la terre", ["chasser le gibier", "tailler la pierre", "faire du feu"]],
          ["Quel animal a été apprivoisé en premier par les hommes ?", "Le chien", ["Le chat", "Le cheval", "La poule"]],
          ["Qu’est-ce qu’un peuple nomade ?", "Un peuple qui se déplace souvent", ["Un peuple qui reste au même endroit", "Un peuple qui vit sur l’eau", "Un peuple qui vit dans un château"]],
          ["Qu’est-ce qu’un peuple sédentaire ?", "Un peuple qui reste au même endroit", ["Un peuple qui se déplace souvent", "Un peuple qui vit dans les arbres", "Un peuple de marins"]],
          ["Comment appelle-t-on la personne qui fouille le sol pour retrouver des traces du passé ?", "Un archéologue", ["Un astronome", "Un architecte", "Un météorologue"]],
          ["Comment appelle-t-on les très longues périodes de grand froid de la préhistoire ?", "Les glaciations", ["Les canicules", "Les moussons", "Les éclipses"]],
          ["Quelle invention marque la fin de la préhistoire ?", "L’écriture", ["La roue", "Le feu", "L’agriculture"]],
          ["À quelle espèce humaine appartenons-nous ?", "Homo sapiens", ["Homo erectus", "Homo habilis", "Les australopithèques"]],
          ["Que permet la maîtrise du feu ?", "Cuire les aliments et se chauffer", ["Écrire des livres", "Fabriquer du plastique", "Cultiver le blé"]]],
        moyen: [
          ["Que veut dire « Homo sapiens » ?", "L’homme sage", ["L’homme debout", "L’homme habile", "L’homme ancien"]],
          ["Que veut dire « Homo erectus » ?", "L’homme debout", ["L’homme sage", "L’homme habile", "L’homme du Sud"]],
          ["Que veut dire « Homo habilis » ?", "L’homme habile", ["L’homme debout", "L’homme sage", "L’homme des glaces"]],
          ["Dans quelle région du monde l’agriculture est-elle née, il y a environ 11 000 ans ?", "Au Proche-Orient (le Croissant fertile)", ["En Gaule", "En Amazonie", "En Sibérie"]],
          ["Quelles céréales a-t-on d’abord cultivées au Proche-Orient ?", "Le blé et l’orge", ["Le maïs et la pomme de terre", "Le riz et le millet", "Le cacao et le café"]],
          ["Quelle céréale a-t-on d’abord cultivée en Chine ?", "Le riz", ["Le blé", "Le maïs", "La pomme de terre"]],
          ["Quelle plante a-t-on d’abord cultivée en Amérique ?", "Le maïs", ["Le blé", "Le riz", "L’orge"]],
          ["Quels animaux élevait-on au Néolithique ?", "Des moutons, des chèvres, des bœufs et des porcs", ["Des lions et des tigres", "Des chevaux de course", "Des perroquets"]],
          ["Qu’est-ce qu’un fossile ?", "Un reste d’être vivant conservé dans la roche", ["Un outil en pierre", "Une peinture de grotte", "Une pierre précieuse"]],
          ["Avec quelle méthode les savants datent-ils souvent les os et le charbon de bois ?", "Le carbone 14", ["La règle graduée", "La balance", "Le thermomètre"]],
          ["De quel animal sauvage descend le chien ?", "Du loup", ["Du renard", "Du chacal du désert", "De l’ours"]],
          ["Pourquoi les chasseurs du Paléolithique se déplaçaient-ils souvent ?", "Pour suivre les troupeaux d’animaux", ["Pour fuir les dinosaures", "Pour vendre leur blé", "Pour visiter des villes"]],
          ["Comment appelle-t-on les Homo sapiens qui vivaient en Europe à la fin du Paléolithique ?", "Les hommes de Cro-Magnon", ["Les Néandertaliens", "Les hommes de Tautavel", "Les australopithèques"]],
          ["Quel métal a donné son nom à la période qui suit le Néolithique ?", "Le bronze", ["L’or", "L’argent", "L’aluminium"]]],
        difficile: [
          ["Quels humains ont vécu en même temps en Europe il y a 45 000 ans ?", "Les Néandertaliens et les Homo sapiens", ["Lucy et Toumaï", "Homo habilis et Ötzi", "Toumaï et Cro-Magnon"]],
          ["Que veut dire « australopithèque » ?", "Singe du Sud", ["Homme debout", "Homme sage", "Homme habile"]],
          ["Où se trouve la Caune de l’Arago, grotte de l’homme de Tautavel ?", "Dans les Pyrénées-Orientales", ["En Dordogne", "En Ardèche", "En Bretagne"]],
          ["Quelle vallée de Dordogne est très riche en sites préhistoriques ?", "La vallée de la Vézère", ["La vallée de la Loire", "La vallée du Rhône", "La vallée de la Seine"]],
          ["Quel village de Dordogne est surnommé « la capitale mondiale de la préhistoire » ?", "Les Eyzies", ["Sarlat", "Montignac", "Brantôme"]],
          ["Dans quel pays se trouve le grand village néolithique de Çatal Höyük ?", "En Turquie", ["En Égypte", "En Grèce", "En Irak"]],
          ["Combien de temps environ a duré le Paléolithique ?", "Plus de 3 millions d’années", ["Environ 1 000 ans", "Environ 10 000 ans", "Environ 100 ans"]],
          ["Vers quand le Néolithique commence-t-il dans le sud de la France ?", "Vers 6000 av. J.-C.", ["Vers 500 av. J.-C.", "Vers 50 000 av. J.-C.", "Vers l’an 1000"]],
          ["Vers quand l’écriture apparaît-elle en Mésopotamie ?", "Vers 3300 av. J.-C.", ["Vers 33 000 av. J.-C.", "Vers 300 apr. J.-C.", "Vers 1300 apr. J.-C."]],
          ["Quel ancêtre a été le premier à quitter l’Afrique ?", "Homo erectus", ["Lucy", "Toumaï", "Homo sapiens"]]],
        expert: [
          ["Quelle espèce humaine a été découverte grâce à un os de doigt, dans une grotte de Sibérie ?", "L’homme de Denisova", ["Homo naledi", "L’homme de Flores", "Homo antecessor"]],
          ["Quelle petite espèce humaine, surnommée « le hobbit », vivait sur une île d’Indonésie ?", "Homo floresiensis", ["Homo naledi", "Homo antecessor", "Homo ergaster"]],
          ["Quel site d’Espagne a livré les fossiles d’Homo antecessor ?", "Atapuerca", ["Altamira", "Tautavel", "Olduvai"]],
          ["Dans quelles gorges de Tanzanie a-t-on trouvé beaucoup de fossiles d’Homo habilis ?", "Les gorges d’Olduvai", ["La vallée de la Vézère", "Le désert du Djourab", "Les gorges du Verdon"]],
          ["Quelle culture du Paléolithique porte le nom de l’abri de la Madeleine, en Dordogne ?", "Le Magdalénien", ["L’Aurignacien", "Le Solutréen", "Le Moustérien"]],
          ["D’où vient le nom de l’Aurignacien ?", "D’Aurignac, en Haute-Garonne", ["D’Aurillac, dans le Cantal", "D’Orange, dans le Vaucluse", "D’Aurignac, en Belgique"]],
          ["D’où vient le nom du Solutréen ?", "De la roche de Solutré, en Saône-et-Loire", ["De Soleure, en Suisse", "De Salers, dans le Cantal", "De Saumur, en Maine-et-Loire"]],
          ["D’où vient le nom du Moustérien, la culture de Néandertal ?", "Du site du Moustier, en Dordogne", ["De Moustiers, en Provence", "De Montier, en Champagne", "Du mont Moustier, dans les Alpes"]],
          ["Quelle culture des premiers agriculteurs d’Europe centrale décorait ses poteries de rubans ?", "Le Rubané", ["Le Cardial", "Le Chasséen", "Le Campaniforme"]],
          ["D’où vient le nom de la culture du Cardial, au bord de la Méditerranée ?", "D’un coquillage, la coque, utilisé pour décorer les poteries", ["D’une montagne", "D’un roi", "D’une plante"]],
          ["Quel site de Turquie est considéré comme l’un des plus anciens sanctuaires monumentaux connus ?", "Göbekli Tepe", ["Çatal Höyük", "Stonehenge", "Karnak"]],
          ["Comment appelle-t-on le passage de la chasse-cueillette à l’agriculture et à l’élevage ?", "La révolution néolithique", ["La révolution industrielle", "La guerre de Troie", "L’âge d’or"]]]
      } },
      { k: 'vf', niveaux: {
        facile: [
          ["Lucy était une australopithèque.", true, ""],
          ["Les premiers humains sont apparus en Amérique.", false, "Les premiers humains sont apparus en Afrique."],
          ["Le mammouth avait une épaisse fourrure contre le froid.", true, ""],
          ["Au Néolithique, les hommes élèvent des animaux.", true, ""],
          ["L’écriture a été inventée au début de la préhistoire.", false, "Son invention marque la fin de la préhistoire."]],
        moyen: [
          ["Homo sapiens est apparu en Afrique.", true, ""],
          ["Les hommes de Cro-Magnon étaient des Homo sapiens, comme nous.", true, ""],
          ["Le chien descend du loup.", true, ""],
          ["L’agriculture est arrivée en France avant le Proche-Orient.", false, "Elle est née au Proche-Orient, puis s’est répandue jusqu’en France."]],
        difficile: [
          ["L’homme de Tautavel est plus ancien que Lucy.", false, "Lucy a environ 3,2 millions d’années, l’homme de Tautavel environ 450 000 ans."],
          ["Les Néandertaliens enterraient parfois leurs morts.", true, ""],
          ["Les Homo sapiens d’aujourd’hui (hors d’Afrique) portent un peu de gènes de Néandertal.", true, "Les deux espèces se sont rencontrées et ont eu des enfants."],
          ["Les mammouths ont disparu avant l’apparition des premiers hommes.", false, "Les hommes ont chassé les mammouths pendant des dizaines de milliers d’années."]],
        expert: [
          ["Homo naledi a été découvert en Afrique du Sud.", true, ""],
          ["L’homme de Flores mesurait environ 2 mètres.", false, "Il mesurait environ 1 mètre."],
          ["Le chien a été domestiqué avant l’invention de l’agriculture.", true, ""],
          ["Le Solutréen est célèbre pour ses très fines pointes de silex en « feuille de laurier ».", true, ""]]
      } }
    ] },
    { id: 'p03', matiere: 'histoire', famille: 'pre', nom: 'Art, outils et mégalithes', court: 'Art, outils', icone: '🎨', series: [
      { k: 'paires', gauche: 'Grotte', droite: 'Où elle se trouve', consigneR: 'Relie chaque grotte ornée à l’endroit où elle se trouve.',
        q: 'Où se trouve la grotte {a} ?', qi: 'Quelle grotte ornée se trouve {b} ?', ouverte: false, niveaux: {
          facile: [['de Niaux', 'En Ariège'], ['de Lascaux', 'En Dordogne'], ['Chauvet', 'En Ardèche'], ['Cosquer', 'Près de Marseille, sous la mer']],
          moyen: [['de Rouffignac', 'En Dordogne, la grotte aux cent mammouths'], ['de Pech-Merle', 'Dans le Lot'], ['d’Altamira', 'En Espagne'], ['de Gargas', 'Dans les Hautes-Pyrénées']],
          difficile: [['de Font-de-Gaume', 'Aux Eyzies, en Dordogne'], ['d’Arcy-sur-Cure', 'Dans l’Yonne'],
            ['de Cussac', 'En Dordogne, avec des tombes'], ['du Mas-d’Azil', 'En Ariège, une rivière la traverse']],
          expert: [['des Combarelles', 'Aux Eyzies, pleine de gravures'], ['de Lascaux IV', 'À Montignac : la copie qui se visite'], ['de Chauvet 2', 'À Vallon-Pont-d’Arc : la copie qui se visite'],
            ['d’Ekain', 'Au Pays basque espagnol'], ['de Foz Côa', 'Au Portugal, gravures en plein air'], ['de Coliboaia', 'En Roumanie']]
        } },
      { k: 'qcm', niveaux: {
        facile: [['Qui a découvert la grotte de Lascaux en 1940 ?', 'Des adolescents', ['Des archéologues', 'Des pompiers', 'Un roi']],
          ['Quel animal voit-on le plus souvent sur les parois des grottes ?', 'Le cheval', ['Le chat', 'Le dinosaure', 'La poule']],
          ['Comment appelle-t-on l’art peint sur les parois des grottes ?', 'L’art pariétal', ['La bande dessinée', 'La mosaïque', 'Le vitrail']]],
        moyen: [['Avec quoi les hommes préhistoriques s’éclairaient-ils dans les grottes ?', 'Des lampes à graisse et des torches', ['Des bougies de cire', 'Des lampes à huile d’olive', 'Des lanternes en verre']],
          ['D’où venaient le rouge et le jaune des peintures ?', 'De l’ocre, une terre colorée', ['Du sang de mammouth', 'Des fraises', 'Des coquelicots']],
          ['Quelle grotte a une entrée sous la mer ?', 'La grotte Cosquer', ['La grotte de Lascaux', 'La grotte Chauvet', 'La grotte de Niaux']]],
        difficile: [['Comment fait-on une « main négative » ?', 'En soufflant de la couleur autour de sa main posée sur la paroi', ['En trempant sa main dans la peinture', 'En gravant le contour avec un silex', 'En collant une feuille', 'En dessinant au charbon de bois']],
          ['Pourquoi Lascaux est-elle fermée au public depuis 1963 ?', 'Pour protéger les peintures', ['Elle s’est effondrée', 'Elle a été inondée', 'Elle a été vendue', 'Une ourse y vit']],
          ['Quels animaux rares voit-on dans la grotte Cosquer ?', 'Des pingouins', ['Des girafes', 'Des éléphants d’Afrique', 'Des tigres', 'Des chameaux']]],
        expert: [['Quel grand animal du Paléolithique est peint dans la salle des Taureaux de Lascaux ?', 'L’aurochs', ['Le bison d’Amérique', 'Le buffle', 'Le zébu', 'Le yack', 'Le taureau de Camargue']],
          ['Quelle grotte est célèbre pour ses chevaux ponctués, couverts de points ?', 'Pech-Merle', ['Niaux', 'Chauvet', 'Cosquer', 'Gargas', 'Rouffignac']],
          ['Quel plongeur a découvert une grotte sous-marine près de Marseille en 1985 ?', 'Henri Cosquer', ['Jacques-Yves Cousteau', 'Jean-Marie Chauvet', 'Norbert Casteret', 'Marcel Ravidat', 'Émile Cartailhac']]]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve la grotte.', niveaux: {
        facile: [{ r: 'Lascaux', i: ['Je suis une grotte ornée.', 'On m’appelle « la chapelle Sixtine de la préhistoire ».', 'Des adolescents m’ont découverte en 1940.', 'Mes peintures montrent des aurochs, des chevaux et des cerfs.', 'Je suis en Dordogne, près de Montignac.'] },
          { r: 'Chauvet', i: ['Je suis une grotte ornée.', 'Trois spéléologues m’ont découverte en 1994.', 'Mes peintures ont environ 36 000 ans.', 'On y voit des lions et des rhinocéros.', 'Je suis en Ardèche, près du pont d’Arc.'] }],
        moyen: [{ r: 'Cosquer', i: ['Je suis une grotte ornée.', 'J’ai été découverte par un plongeur.', 'La mer a monté depuis la préhistoire.', 'On y voit des mains et des pingouins.', 'Mon entrée est sous la mer, près de Marseille.'] }],
        difficile: [{ r: 'Altamira', i: ['Je suis une grotte ornée.', 'J’ai été découverte au XIXe siècle.', 'Une petite fille a vu mes peintures la première.', 'Mon plafond est couvert de bisons rouges et noirs.', 'Je suis en Espagne, en Cantabrie.'] }],
        expert: [{ r: 'Rouffignac', i: ['Je suis une grotte ornée.', 'Je suis très longue : on m’explore en petit train.', 'Des ours ont creusé des nids dans mon sol.', 'On m’appelle la grotte aux cent mammouths.', 'Je suis en Dordogne, dans le Périgord noir.'] }]
      } },
      { k: 'paires', gauche: 'Outil', droite: 'À quoi il sert', consigneR: 'Relie chaque outil à ce qu’il permet de faire.',
        q: 'À quoi sert {a} ?', qi: 'Quel outil sert à : {b} ?', niveaux: {
          facile: [['Le biface', 'Couper et racler'], ['L’aiguille en os', 'Coudre des vêtements'], ['Le harpon', 'Pêcher des poissons'], ['La lampe à graisse', 'S’éclairer dans la grotte']],
          moyen: [['Le propulseur', 'Lancer la sagaie plus loin'], ['La meule', 'Moudre le grain'], ['La faucille', 'Couper les épis de blé'], ['La hache polie', 'Abattre des arbres']],
          difficile: [['Le grattoir', 'Nettoyer les peaux'], ['Le burin', 'Graver l’os et la pierre'], ['Le percuteur', 'Frapper le silex pour le tailler'],
            ['L’arc', 'Tirer des flèches'], ['Le métier à tisser', 'Fabriquer du tissu']],
          expert: [['Le galet aménagé', 'Couper la viande, l’un des tout premiers outils'], ['Le perçoir', 'Faire des trous dans les perles'], ['La pointe de Levallois', 'Armer une lance'],
            ['L’hameçon en os', 'Pêcher à la ligne'], ['L’herminette', 'Creuser le bois'], ['Le polissoir', 'Polir les haches']]
        } },
      { k: 'qcm', niveaux: {
        facile: [['Quelle pierre les hommes préhistoriques taillaient-ils le plus ?', 'Le silex', ['Le marbre', 'Le diamant', 'Le granit']],
          ['Quelle grande découverte permet de cuire, se chauffer et se protéger ?', 'Le feu', ['La roue', 'L’électricité', 'La poudre']]],
        moyen: [['Comment faisait-on du feu ?', 'En frappant un silex contre une pierre de pyrite', ['Avec des allumettes', 'En frottant deux silex dans l’eau', 'Avec une loupe en verre']],
          ['En quoi étaient faits les premiers pots ?', 'En argile cuite', ['En fer', 'En verre', 'En plastique']]],
        difficile: [['Quel métal les hommes ont-ils travaillé en premier, avant le bronze ?', 'Le cuivre', ['Le fer', 'L’acier', 'L’aluminium', 'Le zinc']],
          ['Le bronze est un mélange de cuivre et de…', 'D’étain', ['De fer', 'D’or', 'De plomb', 'D’argent']]],
        expert: [['Quel ancêtre aurait fabriqué les premiers bifaces ?', 'Homo erectus', ['Lucy', 'Toumaï', 'Homo sapiens', 'L’homme de Cro-Magnon', 'Ötzi']],
          ['Qu’est-ce que l’obsidienne, échangée au Néolithique ?', 'Un verre volcanique très coupant', ['Un métal', 'Un coquillage', 'Une graine', 'Une teinture', 'Un os de baleine']]]
      } },
      { k: 'paires', gauche: 'Mot', droite: 'Ce que c’est', consigneR: 'Relie chaque mot à ce qu’il désigne.', q: 'Qu’est-ce qu’{a} ?', qi: 'Comment s’appelle : {b} ?', niveaux: {
        facile: [['un tumulus', 'Une butte de terre sur une tombe'], ['un menhir', 'Une grande pierre dressée'], ['un dolmen', 'Une table de pierre, une tombe'], ['un alignement', 'Des rangées de menhirs']],
        moyen: [['un cairn', 'Un tas de pierres sur des tombes'], ['un cromlech', 'Un cercle de menhirs'], ['une allée couverte', 'Un long couloir de pierres'], ['un mégalithe', 'Un monument en grosses pierres']],
        difficile: [['un orthostate', 'Une pierre dressée d’un mur de dolmen'], ['une table de couverture', 'La grande dalle posée sur un dolmen'],
          ['un tertre', 'Une petite colline de terre'], ['un monolithe', 'Un monument d’un seul bloc']],
        expert: [['un menhir christianisé', 'Un menhir surmonté d’une croix'], ['une stèle', 'Une pierre plate gravée'], ['une statue-menhir', 'Un menhir sculpté en personnage'],
          ['une sépulture collective', 'Une tombe pour plusieurs morts'], ['un ciste', 'Un petit coffre de pierre pour un mort'], ['un péristalithe', 'Un cercle de pierres autour d’un tumulus']]
      } },
      { k: 'paires', gauche: 'Site', droite: 'Où il se trouve', consigneR: 'Relie chaque site mégalithique à l’endroit où il se trouve.', q: 'Où se trouve {a} ?', ouverte: false, niveaux: {
        facile: [['Newgrange', 'En Irlande'], ['Les alignements de Carnac', 'En Bretagne'], ['Stonehenge', 'En Angleterre'], ['Les statues de l’île de Pâques', 'Dans l’océan Pacifique']],
        moyen: [['Le cercle de Callanish', 'En Écosse'], ['Le grand menhir brisé de Locmariaquer', 'Dans le Morbihan'], ['Le cairn de Barnenez', 'Dans le Finistère'], ['La Roche-aux-Fées', 'En Ille-et-Vilaine']],
        difficile: [['Le cairn de Gavrinis', 'Sur une île du golfe du Morbihan'], ['Le grand dolmen de Bagneux', 'À Saumur'], ['Le menhir de Champ-Dolent', 'À Dol-de-Bretagne'],
          ['Le temple de Göbekli Tepe', 'En Turquie']],
        expert: [['Les statues-menhirs de Filitosa', 'En Corse'], ['Le cromlech d’Avebury', 'En Angleterre, près de Stonehenge'], ['Le dolmen de la Frébouchère', 'En Vendée'],
          ['Les alignements de Lagatjar', 'Dans la presqu’île de Crozon'], ['Le dolmen de Menga', 'En Espagne, en Andalousie'], ['Le menhir de Kerloas', 'Dans le Finistère']]
      } },
      { k: 'vf', niveaux: {
        facile: [['Les menhirs ont été dressés par les Gaulois.', false, 'Ils ont été dressés au Néolithique, des milliers d’années avant les Gaulois.'],
          ['À Carnac, il y a des milliers de menhirs.', true, '']],
        moyen: [['« Menhir » vient du breton : « men » (pierre) et « hir » (longue).', true, ''],
          ['Les dolmens étaient d’abord des maisons.', false, 'C’étaient des tombes collectives, souvent recouvertes de terre.']],
        difficile: [['Le grand menhir brisé de Locmariaquer mesurait environ 20 mètres.', true, ''],
          ['Les mégalithes ont été construits avec des grues en métal.', false, 'Les hommes du Néolithique utilisaient des rondins, des cordes, des leviers et beaucoup de bras.']],
        expert: [['Stonehenge est aligné avec le lever du soleil au solstice d’été.', true, ''],
          ['Les statues de l’île de Pâques datent du Néolithique européen.', false, 'Les moaï ont été sculptés bien plus tard, par les Polynésiens de l’île.']]
      } },
      { k: 'qcm', niveaux: {
        facile: [
          ["Dans quelle région de France trouve-t-on le plus de menhirs ?", "La Bretagne", ["L’Alsace", "La Provence", "La Corse"]],
          ["Avec quoi les hommes préhistoriques s’habillaient-ils ?", "Des peaux de bêtes", ["Du coton", "Du plastique", "De la soie"]],
          ["Quel animal à bois, très chassé au Paléolithique, vivait alors en France ?", "Le renne", ["Le lion", "Le chat", "Le kangourou"]],
          ["Quelles couleurs trouve-t-on surtout dans les peintures des grottes ?", "Le rouge, le jaune et le noir", ["Le bleu et le vert", "Le rose et le violet", "Le blanc et l’or"]],
          ["Avec quoi faisait-on le noir des peintures ?", "Du charbon de bois ou de l’oxyde de manganèse", ["Du café", "Du goudron", "De l’encre de stylo"]],
          ["Que dessinait-on surtout sur les parois des grottes ?", "Des animaux", ["Des maisons", "Des bateaux", "Des châteaux"]],
          ["Comment s’appelle une habitation légère faite de branches et de peaux ?", "Une hutte", ["Un château", "Un immeuble", "Un moulin"]],
          ["Comment s’appelle une lance légère qu’on lance à la main ?", "Une sagaie", ["Un boomerang", "Une épée", "Une catapulte"]],
          ["Que fabriquait-on en argile au Néolithique ?", "Des poteries", ["Des vitres", "Des pièces de monnaie", "Des haches tranchantes"]],
          ["Qu’est-ce que la cueillette ?", "Ramasser des fruits, des baies et des racines sauvages", ["Chasser les animaux", "Pêcher dans les rivières", "Cultiver un champ"]],
          ["Comment appelle-t-on une petite statuette de femme du Paléolithique ?", "Une Vénus", ["Une Joconde", "Une Marianne", "Une sirène"]],
          ["Sur quoi les hommes du Paléolithique gravaient-ils des dessins ?", "Sur l’os, le bois de renne et la pierre", ["Sur du papier", "Sur du verre", "Sur du plastique"]],
          ["Quel grand animal hibernait dans les grottes ?", "L’ours des cavernes", ["Le lion", "Le cheval", "Le renne"]]],
        moyen: [
          ["Quelle grotte ornée a été découverte en 1994, en Ardèche ?", "La grotte Chauvet", ["La grotte de Lascaux", "La grotte Cosquer", "La grotte de Niaux"]],
          ["Combien d’adolescents ont découvert la grotte de Lascaux en 1940 ?", "Quatre", ["Deux", "Dix", "Un seul"]],
          ["Combien y a-t-il environ de menhirs dans les alignements de Carnac ?", "Environ 3 000", ["Environ 30", "Environ 300", "Environ 30 000"]],
          ["Comment rendait-on une hache bien lisse au Néolithique ?", "En la frottant longtemps sur une pierre dure, avec du sable et de l’eau", ["En la chauffant au feu", "En la peignant", "En la trempant dans du métal"]],
          ["Avec quoi fabriquait-on les aiguilles du Paléolithique ?", "De l’os", ["Du fer", "Du verre", "Du plastique"]],
          ["Que gardait-on dans les greniers au Néolithique ?", "Les récoltes de grain", ["Les morts", "Les outils de chasse", "Les peintures"]],
          ["Dans quel département a-t-on trouvé la Dame de Brassempouy ?", "Dans les Landes", ["En Dordogne", "En Ariège", "Dans le Finistère"]],
          ["Dans quel pays a-t-on trouvé la Vénus de Willendorf ?", "En Autriche", ["En France", "En Italie", "En Russie"]],
          ["Qu’est-ce qu’un abri sous roche ?", "Un creux au pied d’une falaise qui protège de la pluie", ["Une maison en pierre taillée", "Un tunnel creusé", "Une tombe sous un dolmen"]],
          ["Pourquoi a-t-on fait une copie de la grotte de Lascaux ?", "Pour que le public la visite sans abîmer les vraies peintures", ["Parce que la vraie a été détruite", "Pour la vendre", "Pour un film"]]],
        difficile: [
          ["Comment s’appelle la grande salle de Lascaux aux immenses taureaux ?", "La salle des Taureaux", ["Le Puits", "L’Abside", "Le Salon noir"]],
          ["Dans quelle partie de Lascaux voit-on un homme à tête d’oiseau face à un bison ?", "Le Puits", ["La salle des Taureaux", "Le Diverticule axial", "Le Passage"]],
          ["Quel grand fauve, rare ailleurs, est peint en nombre dans la grotte Chauvet ?", "Le lion des cavernes", ["Le tigre", "Le guépard", "Le léopard des neiges"]],
          ["Quelle grotte de l’Ariège possède un célèbre « Salon noir » ?", "La grotte de Niaux", ["La grotte de Lascaux", "La grotte Chauvet", "La grotte Cosquer"]],
          ["Dans quel département se trouvent les alignements de Carnac ?", "Le Morbihan", ["Le Finistère", "Les Côtes-d’Armor", "L’Ille-et-Vilaine"]],
          ["Combien mesure environ le menhir de Kerloas, le plus haut encore debout en France ?", "Environ 9,5 mètres", ["Environ 2 mètres", "Environ 30 mètres", "Environ 50 centimètres"]],
          ["Qu’a-t-on d’abord fabriqué avec le cuivre ?", "Des bijoux et de petits outils", ["Des voitures", "Des canons", "Des rails"]],
          ["Vers quand et où la roue est-elle apparue ?", "Vers 3500 av. J.-C., en Mésopotamie", ["Vers 35 000 av. J.-C., en Gaule", "Vers 500 apr. J.-C., à Rome", "Vers 1500, en Amérique"]],
          ["Comment appelle-t-on les villages préhistoriques sur pilotis au bord des lacs des Alpes ?", "Les palafittes", ["Les dolmens", "Les cromlechs", "Les oppidums"]],
          ["Quel animal commence-t-on à monter et à atteler à la fin de la préhistoire ?", "Le cheval", ["Le chat", "Le renne", "Le mammouth"]]],
        expert: [
          ["Combien de tatouages a-t-on comptés sur le corps d’Ötzi ?", "61", ["3", "12", "200"]],
          ["Quelle arme, rare à son époque, Ötzi portait-il ?", "Une hache en cuivre", ["Une épée en fer", "Un bouclier en bronze", "Une arbalète"]],
          ["Comment appelle-t-on les points, traits et grilles peints à côté des animaux dans les grottes ?", "Des signes", ["Des lettres", "Des chiffres", "Des cartes"]],
          ["Quel grand tumulus de Carnac est l’un des plus grands d’Europe ?", "Le tumulus Saint-Michel", ["Le cairn de Gavrinis", "Le tumulus de Bougon", "Newgrange"]],
          ["Quel jour le soleil éclaire-t-il le couloir de la tombe de Newgrange, en Irlande ?", "Au solstice d’hiver", ["Au solstice d’été", "À l’équinoxe de printemps", "Jamais"]],
          ["D’où viennent les « pierres bleues » de Stonehenge ?", "Du pays de Galles", ["D’Écosse", "De Bretagne", "D’Irlande"]],
          ["Qui a découvert la grotte Chauvet ?", "Jean-Marie Chauvet et deux amis spéléologues", ["Marcel Ravidat et ses amis", "Henri Cosquer", "Norbert Casteret"]],
          ["Quel animal laineux à corne est peint plusieurs fois dans la grotte Chauvet ?", "Le rhinocéros laineux", ["L’élan", "Le bœuf musqué", "Le chamois"]],
          ["Comment s’appelle la technique de taille qui prépare un bloc pour en détacher un éclat de forme choisie ?", "La méthode Levallois", ["Le polissage", "Le moulage", "La percussion au marteau d’acier"]],
          ["Dans quel musée voit-on la Dame de Brassempouy ?", "Le musée d’Archéologie nationale, à Saint-Germain-en-Laye", ["Le musée du Louvre", "Le musée de la Préhistoire de Tautavel", "Le musée d’Orsay"]]]
      } },
      { k: 'vf', niveaux: {
        facile: [
          ["Les hommes préhistoriques soufflaient parfois la couleur pour peindre.", true, ""],
          ["Les menhirs pèsent souvent plusieurs tonnes.", true, ""],
          ["Au Néolithique, beaucoup de maisons sont en bois et en terre.", true, ""],
          ["Les hommes préhistoriques peignaient avec de la peinture achetée en tube.", false, "Ils fabriquaient leurs couleurs avec des terres, du charbon et des minéraux."]],
        moyen: [
          ["La grotte Chauvet est plus ancienne que Lascaux.", true, "Ses peintures ont environ 36 000 ans, celles de Lascaux environ 20 000 ans."],
          ["On peut visiter la vraie grotte de Lascaux.", false, "Elle est fermée pour protéger les peintures : on visite une copie, Lascaux IV."],
          ["Beaucoup de dolmens étaient d’abord recouverts d’une butte de terre ou de pierres.", true, ""],
          ["La Dame de Brassempouy est un petit visage sculpté dans l’ivoire.", true, ""]],
        difficile: [
          ["La grotte Cosquer est en partie sous l’eau.", true, ""],
          ["Les peintures de la grotte Chauvet ont environ 3 000 ans.", false, "Elles ont environ 36 000 ans."],
          ["Ötzi avait des tatouages sur le corps.", true, ""],
          ["Les palafittes sont des maisons construites sur des pilotis.", true, ""]],
        expert: [
          ["Les pierres de Stonehenge ont été apportées de loin.", true, "Les pierres bleues viennent du pays de Galles, à plus de 200 km."],
          ["Newgrange est plus ancien que les grandes pyramides d’Égypte.", true, "Il date d’environ 3200 av. J.-C., la grande pyramide d’environ 2560 av. J.-C."],
          ["La grotte Cosquer a été découverte par un spéléologue à pied, par une entrée dans la forêt.", false, "Henri Cosquer l’a découverte en plongée : l’entrée est sous la mer."]]
      } }
    ] },

    // ---------- Antiquité (v7.1 ; v8.4 : 12 jeux regroupés en 6, choix de l'utilisateur du 13/11/2026, BACKLOG lignes 327 et 334) ----------
    // Dieux et mythes = anciens « Dieux grecs et romains » + « Dieux égyptiens » + « Héros et mythes » ;
    // L'Égypte des pharaons = « Pharaons » + « Écritures anciennes » ; Rome et la Gaule = « Rome » + « La Gaule » ;
    // Monuments et merveilles = « Monuments antiques » + « Les 7 merveilles » ; Vie antique et Jeux olympiques = « Vie quotidienne » + « Jeux olympiques antiques ».
    // Les paires « description → nom » sont rangées [description, nom] : la question porte sur {a}, la réponse est le nom.
    { id: 'a01', matiere: 'histoire', famille: 'ant', nom: 'Dieux et mythes', court: 'Mythes', icone: '⚡', series: [
      { k: 'paires', gauche: 'Dieu grec', droite: 'Nom romain', consigneR: 'Relie chaque dieu grec à son nom romain.',
        q: 'Quel est le nom romain de {a} ?', qi: 'Quel est le nom grec de {b} ?', niveaux: {
          facile: [['Zeus', 'Jupiter'], ['Poséidon|Poseidon', 'Neptune'], ['Arès|Ares', 'Mars'], ['Aphrodite', 'Vénus|Venus'], ['Hermès|Hermes', 'Mercure']],
          moyen: [['Athéna|Athena', 'Minerve'], ['Héra|Hera', 'Junon'], ['Artémis|Artemis', 'Diane'], ['Hadès|Hades', 'Pluton'],
            ['Dionysos', 'Bacchus'], ['Héphaïstos|Hephaistos', 'Vulcain']],
          difficile: [['Déméter|Demeter', 'Cérès|Ceres'], ['Hestia', 'Vesta'], ['Cronos|Kronos', 'Saturne'], ['Éros|Eros', 'Cupidon|Amour'],
            ['Ouranos', 'Uranus|Caelus'], ['Pan', 'Faunus|Faune'], ['Gaïa|Gaia', 'Tellus|Terra']],
          expert: [['Perséphone|Persephone', 'Proserpine'], ['Hélios|Helios', 'Sol'], ['Séléné|Selene', 'Luna'], ['Éos|Eos', 'Aurore|Aurora'],
            ['Tyché|Tyche', 'Fortuna|Fortune'], ['Asclépios|Asclepios', 'Esculape'], ['Niké|Nike', 'Victoria']]
        } },
      { k: 'paires', gauche: 'Description', droite: 'Dieu égyptien', consigneR: 'Relie chaque description au dieu égyptien.',
        q: 'Chez les Égyptiens, qui est {a} ?', niveaux: {
          facile: [['le dieu du Soleil', 'Râ|Ra|Rê'], ['le dieu à tête de chacal, gardien des tombes', 'Anubis'], ['le roi des morts', 'Osiris'],
            ['le dieu à tête de faucon', 'Horus'], ['la grande magicienne, épouse d’Osiris', 'Isis']],
          moyen: [['le dieu de l’écriture, à tête d’ibis', 'Thot'], ['la déesse chatte', 'Bastet'], ['le dieu crocodile', 'Sobek'],
            ['la déesse vache, de la joie et de la musique', 'Hathor'], ['le dieu du désordre et du désert', 'Seth']],
          difficile: [['le roi des dieux, adoré à Thèbes', 'Amon'], ['le dieu des artisans, à Memphis', 'Ptah'], ['le potier à tête de bélier', 'Khnoum'],
            ['la déesse de la justice, une plume sur la tête', 'Maât|Maat'], ['la déesse lionne', 'Sekhmet'], ['la déesse du ciel', 'Nout']],
          expert: [['le créateur du monde, à Héliopolis', 'Atoum'], ['le dieu de la crue du Nil', 'Hâpy|Hapy'], ['la déesse hippopotame qui protège les naissances', 'Taouret|Thouéris'],
            ['le nain qui protège les maisons', 'Bès|Bes'], ['le scarabée, soleil du matin', 'Khépri|Khepri'], ['le disque solaire adoré par Akhenaton', 'Aton'],
            ['la dévoreuse des cœurs des méchants', 'Ammit|Ammout']]
        } },
      { k: 'paires', gauche: 'Exploit', droite: 'Personnage', consigneR: 'Relie chaque histoire à son personnage.',
        q: 'Qui {a} ?', niveaux: {
          facile: [['a tué le Minotaure dans le labyrinthe', 'Thésée|Thesee'], ['a coupé la tête de Méduse', 'Persée|Persee'],
            ['a réalisé douze travaux', 'Hercule|Héraclès|Heracles'], ['a eu l’idée du cheval de Troie', 'Ulysse'],
            ['a volé trop près du Soleil avec des ailes de cire', 'Icare']],
          moyen: [['est parti chercher la Toison d’or', 'Jason'], ['ne pouvait être blessé qu’au talon', 'Achille'],
            ['a ouvert la jarre qui a libéré les malheurs du monde', 'Pandore'], ['est descendu aux Enfers chercher Eurydice', 'Orphée|Orphee'],
            ['a fondé Rome, selon la légende', 'Romulus'], ['a volé le feu des dieux pour le donner aux hommes', 'Prométhée|Promethee']],
          difficile: [['a tué la Chimère, monté sur Pégase', 'Bellérophon|Bellerophon'], ['a résolu l’énigme du Sphinx', 'Œdipe|Oedipe'],
            ['était une chasseuse plus rapide que tous à la course', 'Atalante'], ['a fui Troie en flammes jusqu’en Italie', 'Énée|Enee'],
            ['était le plus grand héros troyen, tué par Achille', 'Hector'], ['a enlevé Hélène, ce qui a déclenché la guerre de Troie', 'Pâris|Paris']],
          expert: [['changeait en or tout ce qu’il touchait', 'Midas'], ['est tombé amoureux de son reflet', 'Narcisse'],
            ['pousse sans fin un rocher qui retombe', 'Sisyphe'], ['ne peut jamais attraper l’eau ni les fruits placés devant lui', 'Tantale'],
            ['a construit le labyrinthe de Crète', 'Dédale|Dedale'], ['a été changée en araignée par Athéna', 'Arachné|Arachne'],
            ['a tué le sanglier de Calydon', 'Méléagre|Meleagre']]
        } },
      { k: 'qcm', niveaux: {
        facile: [
          ['Qui est le roi des dieux grecs ?', 'Zeus', ['Poséidon', 'Hermès', 'Arès']],
          ['Quel dieu grec règne sur la mer ?', 'Poséidon', ['Zeus', 'Arès', 'Hermès']],
          ['Où vivent les dieux grecs ?', 'Sur le mont Olympe', ['Sur l’Etna', 'Sur le Vésuve', 'Sur le mont Blanc']],
          ['Quelle arme lance Zeus quand il est en colère ?', 'La foudre', ['Un trident', 'Un arc', 'Une épée']],
          ['Quel objet à trois pointes tient Poséidon ?', 'Un trident', ['Une lance', 'Une massue', 'Un arc']],
          ['Quel monstre à tête de taureau vivait dans le labyrinthe ?', 'Le Minotaure', ['Le Cyclope', 'Pégase', 'Le Sphinx']],
          ['Quel monstre aux cheveux de serpents change en pierre ceux qui la regardent ?', 'Méduse', ['Le Minotaure', 'Le Cyclope', 'Pégase']],
          ['Qu’est-ce qu’un cyclope ?', 'Un géant avec un seul œil', ['Un cheval ailé', 'Un serpent à neuf têtes', 'Un homme à tête de taureau']],
          ['Comment s’appelle le cheval ailé de la mythologie grecque ?', 'Pégase', ['Bucéphale', 'Cerbère', 'Argos']],
          ['Quel animal géant en bois les Grecs ont-ils utilisé pour entrer dans Troie ?', 'Un cheval', ['Un taureau', 'Un éléphant', 'Un lion']],
          ['Quel héros grec est célèbre pour sa très grande force ?', 'Hercule', ['Ulysse', 'Icare', 'Pâris']],
          ['Quel est le chien à trois têtes qui garde les Enfers ?', 'Cerbère', ['Pégase', 'Argos', 'Le Minotaure']],
          ['Qui est la déesse grecque de l’amour et de la beauté ?', 'Aphrodite', ['Athéna', 'Héra', 'Artémis']],
          ['De quelle île Ulysse est-il le roi ?', 'Ithaque', ['La Crète', 'Rhodes', 'La Sicile']],
          ['Quel dieu est le messager des dieux grecs, avec des sandales ailées ?', 'Hermès', ['Arès', 'Hadès', 'Apollon']]],
        moyen: [
          ['Quelle déesse est sortie tout armée de la tête de Zeus ?', 'Athéna', ['Héra', 'Artémis', 'Aphrodite', 'Déméter']],
          ['Quel dieu forge les armes des dieux ?', 'Héphaïstos', ['Arès', 'Hermès', 'Apollon', 'Dionysos']],
          ['Quel dieu règne sur le monde des morts ?', 'Hadès', ['Zeus', 'Poséidon', 'Apollon', 'Dionysos']],
          ['Qui est l’épouse de Zeus ?', 'Héra', ['Athéna', 'Aphrodite', 'Artémis']],
          ['Quel dieu grec est le dieu du vin et de la fête ?', 'Dionysos', ['Apollon', 'Hermès', 'Héphaïstos']],
          ['Quel dieu grec est le dieu de la guerre ?', 'Arès', ['Apollon', 'Hermès', 'Hadès']],
          ['Quelle déesse chasseresse est la sœur jumelle d’Apollon ?', 'Artémis', ['Athéna', 'Héra', 'Déméter']],
          ['Quel oiseau accompagne la déesse Athéna ?', 'La chouette', ['L’aigle', 'Le paon', 'La colombe']],
          ['Quel arbre Athéna a-t-elle offert aux Athéniens ?', 'L’olivier', ['Le chêne', 'Le laurier', 'Le figuier']],
          ['Qui a aidé Thésée à sortir du labyrinthe grâce à un fil ?', 'Ariane', ['Médée', 'Pénélope', 'Hélène']],
          ['Quelle épouse a attendu Ulysse pendant vingt ans ?', 'Pénélope', ['Hélène', 'Ariane', 'Médée']],
          ['Quel poète grec a raconté la guerre de Troie et le voyage d’Ulysse ?', 'Homère', ['Ésope', 'Platon', 'Virgile']],
          ['Comment s’appelle le récit du long voyage de retour d’Ulysse ?', 'L’Odyssée', ['L’Iliade', 'L’Énéide', 'Les Métamorphoses']],
          ['Quel cyclope Ulysse a-t-il aveuglé ?', 'Polyphème', ['Cerbère', 'Argos', 'Atlas']],
          ['Selon la légende, quels jumeaux ont été nourris par une louve ?', 'Romulus et Rémus', ['Castor et Pollux', 'Apollon et Artémis', 'Thésée et Ariane']],
          ['Quel dieu égyptien a une tête de faucon ?', 'Horus', ['Anubis', 'Thot', 'Sobek']]],
        difficile: [
          ['Quel dieu romain a donné son nom au mois de mars ?', 'Mars', ['Jupiter', 'Mercure', 'Neptune', 'Vulcain', 'Janus']],
          ['Quel dieu romain à deux visages a donné son nom à janvier ?', 'Janus', ['Jupiter', 'Mars', 'Saturne', 'Pluton', 'Vulcain']],
          ['Quel dieu a le même nom chez les Grecs et chez les Romains ?', 'Apollon', ['Zeus', 'Arès', 'Hermès', 'Hadès', 'Dionysos']],
          ['Quel jour de la semaine porte le nom du dieu Mercure ?', 'Le mercredi', ['Le mardi', 'Le jeudi', 'Le vendredi']],
          ['Quel serpent à plusieurs têtes Héraclès a-t-il combattu ?', 'L’hydre de Lerne', ['Le python de Delphes', 'Le dragon de Colchide', 'La Chimère']],
          ['Quelle guerre l’Iliade raconte-t-elle ?', 'La guerre de Troie', ['La guerre du Péloponnèse', 'Les guerres médiques', 'La guerre des Gaules']],
          ['Quel poète latin a raconté le voyage d’Énée dans l’Énéide ?', 'Virgile', ['Homère', 'Ovide', 'Cicéron']],
          ['Comment s’appelle le bateau de Jason ?', 'L’Argo', ['Le Nautilus', 'L’Odyssée', 'Le Pégase']],
          ['Quel dieu égyptien a tué son frère Osiris ?', 'Seth', ['Horus', 'Anubis', 'Thot']],
          ['Qui est le fils d’Osiris et d’Isis, qui venge son père ?', 'Horus', ['Seth', 'Thot', 'Sobek']],
          ['Au jugement des morts égyptien, on pèse le cœur du mort face à…', 'une plume', ['une pierre', 'une pièce d’or', 'un scarabée']],
          ['Sur quel fleuve des Enfers le passeur Charon fait-il traverser les morts ?', 'Le Styx', ['Le Nil', 'Le Tibre', 'L’Euphrate']],
          ['Quelle magicienne a aidé Jason à prendre la Toison d’or ?', 'Médée', ['Circé', 'Ariane', 'Pandore']],
          ['Quelle magicienne a changé les compagnons d’Ulysse en cochons ?', 'Circé', ['Médée', 'Calypso', 'Pénélope']],
          ['Quelles créatures chantaient pour attirer les marins vers les rochers ?', 'Les sirènes', ['Les Muses', 'Les nymphes', 'Les Amazones']]],
        expert: [
          ['Qui est la mère de Zeus ?', 'Rhéa', ['Héra', 'Gaïa', 'Déméter', 'Thétis', 'Léto', 'Métis']],
          ['Quel Titan porte le ciel sur ses épaules ?', 'Atlas', ['Cronos', 'Prométhée', 'Hypérion', 'Océan', 'Ouranos', 'Japet']],
          ['Comment s’appelle la boisson des dieux grecs ?', 'Le nectar', ['L’ambroisie', 'L’hydromel', 'La cervoise', 'Le garum']],
          ['Combien y a-t-il de Muses ?', '9', ['3', '7', '12']],
          ['Quelle Muse veille sur l’histoire ?', 'Clio', ['Calliope', 'Uranie', 'Thalie']],
          ['Quelle nymphe a retenu Ulysse sept ans sur son île ?', 'Calypso', ['Circé', 'Nausicaa', 'Écho']],
          ['Quel monstre à la fois lion, chèvre et serpent Bellérophon a-t-il tué ?', 'La Chimère', ['L’hydre', 'Le Sphinx', 'Typhon']],
          ['Quel roi de Crète a fait construire le labyrinthe ?', 'Minos', ['Égée', 'Priam', 'Agamemnon']],
          ['Qui est le roi de Troie pendant la guerre ?', 'Priam', ['Agamemnon', 'Ménélas', 'Minos']],
          ['Quel roi grec commandait l’armée grecque devant Troie ?', 'Agamemnon', ['Priam', 'Ménélas', 'Ulysse']],
          ['Quelle ville égyptienne était le grand centre du culte d’Amon ?', 'Thèbes', ['Alexandrie', 'Memphis', 'Le Caire']],
          ['Quelle déesse romaine protégeait le foyer, avec ses prêtresses les vestales ?', 'Vesta', ['Junon', 'Minerve', 'Diane']],
          ['Quel jour de la semaine porte le nom de Jupiter ?', 'Le jeudi', ['Le lundi', 'Le mardi', 'Le samedi']],
          ['Quel héros a été plongé bébé dans le Styx par sa mère Thétis ?', 'Achille', ['Hector', 'Ulysse', 'Énée']],
          ['Quelle prêtresse d’Apollon rendait les oracles à Delphes ?', 'La Pythie', ['La Sibylle', 'Cassandre', 'Médée']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Zeus est le roi des dieux grecs.', true, ''], ['Les dieux grecs vivent sur le mont Olympe.', true, ''],
          ['Le Minotaure est mi-homme, mi-taureau.', true, ''], ['Anubis a une tête de chacal.', true, ''],
          ['Poséidon est le dieu du Soleil.', false, 'Poséidon est le dieu de la mer ; le Soleil, c’est Hélios.'],
          ['Pégase est un dragon à trois têtes.', false, 'Pégase est un cheval ailé.']],
        moyen: [['Athéna est la déesse de la sagesse.', true, ''], ['Hadès règne sur le monde des morts.', true, ''],
          ['Achille ne pouvait être blessé qu’au talon.', true, ''],
          ['Ulysse est rentré chez lui quelques jours après la guerre de Troie.', false, 'Son voyage de retour a duré dix ans.'],
          ['Les Égyptiens adoraient un seul dieu.', false, 'Ils adoraient de nombreux dieux ; seul Akhenaton a imposé un temps le culte d’Aton.']],
        difficile: [['Le mot « panique » vient du dieu Pan.', true, ''], ['Osiris a été tué par son frère Seth.', true, ''],
          ['Les Romains ont repris beaucoup de dieux grecs en changeant leur nom.', true, ''],
          ['Apollon s’appelle Mars chez les Romains.', false, 'Apollon garde le même nom chez les Romains.'],
          ['L’Iliade raconte le voyage de retour d’Ulysse.', false, 'L’Iliade raconte la guerre de Troie ; le retour d’Ulysse, c’est l’Odyssée.']],
        expert: [['Le mot « atlas » vient du Titan Atlas.', true, ''], ['Cronos avalait ses enfants à leur naissance.', true, ''],
          ['Zeus a été caché en Crète pour échapper à son père.', true, ''],
          ['Les Muses sont les filles d’Apollon.', false, 'Elles sont les filles de Zeus et de Mnémosyne.'],
          ['Thot est le dieu égyptien de la guerre.', false, 'Thot est le dieu de l’écriture et du savoir.']]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le dieu égyptien.', niveaux: {
        facile: [{ r: 'Anubis', i: ['Je suis un dieu égyptien.', 'Je veille sur les tombes.', 'J’aide à préparer les momies.', 'Je suis noir comme la terre du Nil.', 'J’ai une tête de chacal.'] },
          { r: 'Râ', i: ['Je suis un dieu égyptien très important.', 'Je traverse le ciel dans une barque.', 'La nuit, je voyage sous la terre.', 'Je porte un disque sur la tête.', 'Je suis le dieu du Soleil.'] }],
        moyen: [{ r: 'Thot', i: ['Je suis un dieu égyptien.', 'Je suis le dieu du savoir et de la Lune.', 'Les scribes me prient.', 'J’ai une tête d’ibis, un oiseau au long bec.', 'J’ai inventé l’écriture, selon les Égyptiens.'] },
          { r: 'Bastet', i: ['Je suis une déesse égyptienne.', 'Je protège les maisons et les familles.', 'On m’adorait à Bubastis.', 'On a momifié beaucoup d’animaux en mon honneur.', 'Je suis une déesse chatte.'] }],
        difficile: [{ r: 'Maât', i: ['Je suis une déesse égyptienne.', 'Je suis l’ordre du monde.', 'Au jugement des morts, on pèse le cœur face à moi.', 'Je suis la vérité et la justice.', 'Je porte une plume d’autruche sur la tête.'] }],
        expert: [{ r: 'Khépri', i: ['Je suis un dieu égyptien.', 'Je suis une forme du Soleil.', 'On porte mon image comme porte-bonheur.', 'Je suis le soleil du matin.', 'Je suis un scarabée qui pousse le Soleil comme une boule.'] }]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le héros.', niveaux: {
        facile: [{ r: 'Thésée', i: ['Je suis un héros grec.', 'Mon père, Égée, était roi d’Athènes.', 'Ariane m’a donné une pelote de fil.', 'Je suis entré dans le labyrinthe de Crète.', 'J’ai tué le Minotaure.'] },
          { r: 'Ulysse', i: ['Je suis un héros grec.', 'Je suis roi d’Ithaque.', 'Ma femme Pénélope m’a attendu vingt ans.', 'J’ai trompé le cyclope Polyphème.', 'J’ai eu l’idée du cheval de Troie.'] }],
        moyen: [{ r: 'Jason', i: ['Je suis un héros grec.', 'Mon oncle m’a pris mon trône.', 'Mon bateau s’appelait l’Argo.', 'Médée m’a aidé grâce à sa magie.', 'J’ai rapporté la Toison d’or.'] }],
        difficile: [{ r: 'Œdipe', i: ['Je suis un héros grec.', 'Je suis devenu roi de Thèbes.', 'Bébé, j’ai été abandonné dans la montagne.', 'Un monstre posait une énigme sur un animal à 4, 2 puis 3 pattes.', 'J’ai trouvé la réponse à l’énigme du Sphinx : l’homme.'] }],
        expert: [{ r: 'Sisyphe', i: ['Je suis un roi de la mythologie grecque.', 'J’ai fondé la ville de Corinthe.', 'J’ai enchaîné la Mort pour ne pas mourir.', 'Les dieux m’ont puni aux Enfers.', 'Je pousse un rocher en haut d’une colline, et il retombe toujours.'] }]
      } }
    ] },
    { id: 'a03', matiere: 'histoire', famille: 'ant', nom: 'L’Égypte des pharaons', court: 'Égypte', icone: '🔺', series: [
      { k: 'paires', gauche: 'Ce qui l’a rendu célèbre', droite: 'Pharaon', consigneR: 'Relie chaque fait au pharaon.',
        q: 'Qui {a} ?', niveaux: {
          facile: [['a fait bâtir la plus grande pyramide de Gizeh', 'Khéops|Kheops'], ['avait un tombeau plein d’or, découvert en 1922', 'Toutânkhamon|Toutankhamon'],
            ['a régné 66 ans et fait creuser Abou Simbel', 'Ramsès II|Ramses II|Ramsès'], ['a été la dernière reine d’Égypte, alliée de César', 'Cléopâtre|Cleopatre']],
          moyen: [['a fait adorer un seul dieu, Aton', 'Akhenaton'], ['était une femme devenue pharaon', 'Hatchepsout'], ['a uni la Haute et la Basse-Égypte', 'Narmer'],
            ['a fait bâtir la première pyramide, à degrés', 'Djéser|Djeser'], ['aurait fait sculpter le grand Sphinx de Gizeh', 'Khéphren|Khephren']],
          difficile: [['a été un grand conquérant, jusqu’à l’Euphrate', 'Thoutmôsis III|Thoutmosis III'], ['a fait bâtir la plus petite des trois pyramides de Gizeh', 'Mykérinos|Mykerinos'],
            ['a fait bâtir la pyramide rhomboïdale et la pyramide rouge', 'Snéfrou|Snefrou'], ['était le père de Ramsès II', 'Séthi Ier|Sethi Ier|Séthi'],
            ['a chassé les Hyksôs d’Égypte', 'Ahmôsis|Ahmosis'], ['avait un temple gardé par les colosses de Memnon', 'Amenhotep III']],
          expert: [['a réunifié l’Égypte au début du Moyen Empire', 'Mentouhotep II'], ['a conquis la Nubie au Moyen Empire', 'Sésostris III|Sesostris III'],
            ['a repoussé les Peuples de la mer', 'Ramsès III|Ramses III'], ['était un général d’Alexandre le Grand devenu roi d’Égypte', 'Ptolémée Ier|Ptolemee Ier'],
            ['a été le dernier pharaon né en Égypte', 'Nectanébo II|Nectanebo II'], ['est monté sur le trône enfant et a régné plusieurs dizaines d’années', 'Pépi II|Pepi II']]
        } },
      { k: 'paires', gauche: 'Écriture', droite: 'Peuple', consigneR: 'Relie chaque écriture au peuple qui l’utilisait.',
        q: 'Quel peuple utilisait cette écriture : {a} ?', ouverte: false, niveaux: {
          facile: [['Les hiéroglyphes', 'Les Égyptiens'], ['Le cunéiforme', 'Les Mésopotamiens'], ['L’alphabet grec', 'Les Grecs'], ['L’alphabet latin', 'Les Romains']],
          difficile: [['Les runes', 'Les peuples germaniques'], ['Les caractères chinois', 'Les Chinois'], ['L’alphabet phénicien', 'Les Phéniciens'],
            ['Les glyphes mayas', 'Les Mayas'], ['L’alphabet hébreu', 'Les Hébreux'], ['L’alphabet étrusque', 'Les Étrusques']]
        } },
      { k: 'qcm', niveaux: {
        facile: [
          ['Quel grand fleuve traverse l’Égypte ?', 'Le Nil', ['Le Tibre', 'L’Amazone', 'La Seine']],
          ['Comment s’appellent les rois de l’Égypte ancienne ?', 'Les pharaons', ['Les empereurs', 'Les consuls', 'Les tsars']],
          ['Qu’est-ce qu’une momie ?', 'Un corps conservé et entouré de bandelettes', ['Un temple', 'Un bijou en or', 'Une écriture']],
          ['Quelle est l’écriture des Égyptiens, faite de petits dessins ?', 'Les hiéroglyphes', ['L’alphabet latin', 'Le braille', 'Les runes']],
          ['Sur quoi les Égyptiens écrivaient-ils ?', 'Le papyrus', ['Le papier', 'Le plastique', 'L’ardoise']],
          ['Quelle est la capitale actuelle de l’Égypte ?', 'Le Caire', ['Alexandrie', 'Louxor', 'Assouan']],
          ['À quoi servaient les pyramides de Gizeh ?', 'De tombeau au pharaon', ['D’observatoire des étoiles', 'De caserne pour les soldats', 'De grenier à blé']],
          ['Quel animal mi-lion mi-homme garde les pyramides de Gizeh ?', 'Le Sphinx', ['Le Minotaure', 'Le griffon', 'Le centaure']],
          ['Quel pharaon a été retrouvé avec un célèbre masque en or ?', 'Toutânkhamon', ['Khéops', 'Narmer', 'Djéser']],
          ['Qui a découvert le tombeau de Toutânkhamon en 1922 ?', 'Howard Carter', ['Champollion', 'Napoléon', 'Christophe Colomb']],
          ['Quel animal était souvent momifié en l’honneur de la déesse Bastet ?', 'Le chat', ['Le chien', 'Le cheval', 'Le lion']],
          ['Grâce à quoi les champs d’Égypte étaient-ils fertiles ?', 'La crue du Nil', ['La neige', 'Les pluies tropicales', 'Les engrais chimiques']],
          ['Comment appelle-t-on celui dont le métier est d’écrire, en Égypte ?', 'Le scribe', ['Le prêtre', 'Le vizir', 'Le pharaon']],
          ['Sur quel continent se trouve l’Égypte ?', 'L’Afrique', ['L’Europe', 'L’Amérique', 'L’Océanie']]],
        moyen: [
          ['Quelle pierre a permis de comprendre les hiéroglyphes ?', 'La pierre de Rosette', ['La pierre philosophale', 'Le menhir de Carnac', 'La pierre de Lune', 'Le code d’Hammurabi']],
          ['Qui a déchiffré les hiéroglyphes ?', 'Jean-François Champollion', ['Howard Carter', 'Napoléon Bonaparte', 'Louis Pasteur']],
          ['Sur quoi écrivait-on le cunéiforme ?', 'Des tablettes d’argile', ['Du papyrus', 'Du papier', 'Des feuilles de palmier', 'Des tablettes de cire']],
          ['Où l’écriture est-elle apparue en premier, vers 3300 av. J.-C. ?', 'En Mésopotamie', ['En Grèce', 'À Rome', 'En Gaule', 'En Chine']],
          ['Dans quelle vallée sont creusés les tombeaux des pharaons du Nouvel Empire ?', 'La Vallée des Rois', ['La vallée de la Loire', 'La vallée du Jourdain', 'La vallée du Rhône']],
          ['Près de quelle ville actuelle se trouvent les pyramides de Gizeh ?', 'Le Caire', ['Louxor', 'Assouan', 'Alexandrie']],
          ['Que retirait-on du corps pendant la momification ?', 'Les organes, placés dans des vases', ['Les os', 'La peau', 'Les cheveux']],
          ['Comment appelle-t-on les vases où l’on gardait les organes de la momie ?', 'Les vases canopes', ['Les amphores', 'Les jarres à huile', 'Les urnes grecques']],
          ['Avec quel sel séchait-on le corps pendant la momification ?', 'Le natron', ['Le sel de mer', 'Le sucre', 'Le poivre']],
          ['Quelle reine, épouse d’Akhenaton, est célèbre pour son buste ?', 'Néfertiti', ['Cléopâtre', 'Hatchepsout', 'Isis']],
          ['Qui aidait le pharaon à gouverner, comme un Premier ministre ?', 'Le vizir', ['Le consul', 'Le druide', 'Le sénateur']],
          ['Avec quel général romain Cléopâtre s’est-elle alliée contre Octave ?', 'Marc Antoine', ['Jules César', 'Pompée', 'Brutus']],
          ['Quel conquérant macédonien a fondé Alexandrie ?', 'Alexandre le Grand', ['Jules César', 'Ramsès II', 'Darius']],
          ['Quel temple Ramsès II a-t-il fait creuser dans la falaise, au sud de l’Égypte ?', 'Abou Simbel', ['Karnak', 'Le Parthénon', 'Philae']],
          ['Avec quoi les grandes pyramides ont-elles été construites ?', 'De gros blocs de pierre', ['Des briques de verre', 'Du béton armé', 'Du bois de chêne']]],
        difficile: [
          ['En quelle année Champollion annonce-t-il qu’il a compris les hiéroglyphes ?', '1822', ['1799', '1789', '1850', '1901', '1715']],
          ['Avec quoi écrivait-on sur l’argile en Mésopotamie ?', 'Un roseau taillé, le calame', ['Une plume d’oie', 'Un pinceau', 'Un stylo', 'Un burin en fer', 'Un morceau de charbon']],
          ['Quelle était la hauteur d’origine de la pyramide de Khéops ?', 'Environ 146 mètres', ['Environ 46 mètres', 'Environ 300 mètres', 'Environ 1 000 mètres']],
          ['Comment appelle-t-on la grande période des pyramides ?', 'L’Ancien Empire', ['Le Nouvel Empire', 'Le Moyen Empire', 'L’époque ptolémaïque']],
          ['À quelle période ont régné Ramsès II et Toutânkhamon ?', 'Le Nouvel Empire', ['L’Ancien Empire', 'Le Moyen Empire', 'L’époque romaine']],
          ['En hiéroglyphes, qu’est-ce qu’un cartouche ?', 'Un ovale qui entoure le nom d’un roi', ['Une arme de soldat', 'Un bateau du Nil', 'Un panier à blé']],
          ['Dans quelle ville se trouvait la plus grande bibliothèque de l’Antiquité ?', 'Alexandrie', ['Memphis', 'Thèbes', 'Gizeh']],
          ['Comment s’appelait la capitale de l’Ancien Empire, près du Caire ?', 'Memphis', ['Thèbes', 'Amarna', 'Alexandrie']],
          ['Quelle ville Akhenaton a-t-il fondée pour en faire sa capitale ?', 'Amarna|Akhetaton', ['Memphis', 'Thèbes', 'Alexandrie']],
          ['Quel grand temple de Thèbes était consacré à Amon ?', 'Karnak', ['Abou Simbel', 'Philae', 'Edfou']],
          ['Quels étrangers ont régné sur le nord de l’Égypte juste avant le Nouvel Empire ?', 'Les Hyksôs', ['Les Romains', 'Les Vikings', 'Les Gaulois']],
          ['Contre quel peuple Ramsès II a-t-il livré la bataille de Qadesh ?', 'Les Hittites', ['Les Romains', 'Les Perses', 'Les Grecs']],
          ['Qui a mené l’expédition d’Égypte où l’on a trouvé la pierre de Rosette ?', 'Napoléon Bonaparte', ['Louis XIV', 'Jules César', 'Charlemagne']],
          ['Comment s’appelle le recueil de formules magiques placé dans les tombes pour guider le mort ?', 'Le Livre des morts', ['L’Iliade', 'Le code d’Hammurabi', 'L’Énéide']]],
        expert: [
          ['Quelles sont les trois écritures de la pierre de Rosette ?', 'Hiéroglyphes, démotique et grec', ['Hiéroglyphes, latin et grec', 'Cunéiforme, grec et latin', 'Hiéroglyphes, hébreu et grec', 'Démotique, latin et phénicien']],
          ['Qui a déchiffré le linéaire B en 1952 ?', 'Michael Ventris', ['Jean-François Champollion', 'Howard Carter', 'Heinrich Schliemann', 'Arthur Evans']],
          ['Comment s’appelle l’écriture plus rapide des scribes égyptiens, tirée des hiéroglyphes ?', 'Le hiératique', ['Le cunéiforme', 'Le linéaire A', 'L’araméen', 'Le sanskrit']],
          ['Combien de lettres compte l’alphabet grec ?', '24', ['22', '26', '20', '30']],
          ['Dans quel musée se trouve la pierre de Rosette ?', 'Le British Museum, à Londres', ['Le Louvre, à Paris', 'Le musée du Caire', 'Le Metropolitan Museum, à New York']],
          ['Dans quel musée se trouve le buste de Néfertiti ?', 'Le Neues Museum, à Berlin', ['Le Louvre, à Paris', 'Le British Museum, à Londres', 'Le musée du Caire']],
          ['Qui a financé les fouilles d’Howard Carter dans la Vallée des Rois ?', 'Lord Carnarvon', ['Lord Byron', 'Lord Nelson', 'Lord Kelvin']],
          ['Quel architecte a construit la pyramide à degrés de Djéser ?', 'Imhotep', ['Senenmout', 'Hémiounou', 'Amenhotep']],
          ['Quelle langue des chrétiens d’Égypte est la dernière forme de l’égyptien ancien ?', 'Le copte', ['L’araméen', 'Le latin', 'Le phénicien']],
          ['Quelle dynastie d’origine grecque a régné sur l’Égypte après Alexandre ?', 'Les Ptolémées|Les Lagides', ['Les Séleucides', 'Les Antigonides', 'Les Achéménides']],
          ['Quel temple a été découpé et remonté plus haut dans les années 1960, pour échapper au lac Nasser ?', 'Abou Simbel', ['Karnak', 'Louxor', 'Edfou']],
          ['Quel barrage a créé le lac Nasser ?', 'Le haut barrage d’Assouan', ['Le barrage des Trois-Gorges', 'Le barrage Hoover', 'Le barrage de Serre-Ponçon']],
          ['Comment s’appelait la capitale de Ramsès II, dans le delta du Nil ?', 'Pi-Ramsès', ['Amarna', 'Memphis', 'Thèbes']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Les Égyptiens momifiaient leurs morts.', true, ''], ['Les pyramides de Gizeh sont des tombeaux.', true, ''], ['Le Nil traverse l’Égypte.', true, ''],
          ['Les Égyptiens écrivaient sur du papier comme le nôtre.', false, 'Ils écrivaient sur du papyrus, fait avec une plante du Nil.'],
          ['Les pyramides ont été construites par les Romains.', false, 'Elles ont été construites par les Égyptiens, bien avant Rome.']],
        moyen: [['Une femme, Hatchepsout, a été pharaon.', true, ''],
          ['Les hiéroglyphes peuvent se lire de droite à gauche.', true, 'Ils se lisent aussi de gauche à droite ou de haut en bas : les personnages regardent vers le début de la ligne.'],
          ['Toutânkhamon est mort très vieux.', false, 'Il est mort vers 19 ans.'],
          ['Cléopâtre a vécu à l’époque des premières pyramides.', false, 'Environ 2 500 ans séparent la pyramide de Khéops de Cléopâtre : elle a vécu plus près de nous que de Khéops.']],
        difficile: [['La pierre de Rosette a été trouvée pendant l’expédition de Bonaparte en Égypte.', true, 'En 1799.'], ['Le grand Sphinx de Gizeh a perdu son nez.', true, ''],
          ['Ramsès II a régné moins de dix ans.', false, 'Il a régné environ 66 ans.'],
          ['Akhenaton a fait adorer Amon plus que tous les autres dieux.', false, 'Il a imposé le culte d’Aton, le disque solaire.']],
        expert: [['La pyramide de Khéops est restée la construction la plus haute du monde pendant près de 4 000 ans.', true, 'Jusqu’à la cathédrale de Lincoln, en Angleterre, au XIVe siècle.'],
          ['Cléopâtre VII parlait égyptien, contrairement aux rois ptolémées avant elle.', true, 'C’est ce que raconte l’historien Plutarque.'],
          ['Le cunéiforme est une écriture égyptienne.', false, 'Le cunéiforme vient de Mésopotamie.'],
          ['Champollion était déjà allé en Égypte quand il a déchiffré les hiéroglyphes.', false, 'Il les a déchiffrés en 1822 et n’est allé en Égypte qu’en 1828.']]
      } },
      { k: 'classer', niveaux: {
        facile: [{ q: 'Range : Égypte ancienne ou Rome antique ?', colonnes: ['Égypte', 'Rome'],
          items: [['Les pyramides', 0], ['Le pharaon', 0], ['Les momies', 0], ['Les hiéroglyphes', 0], ['Le Colisée', 1], ['L’empereur', 1], ['Les gladiateurs', 1], ['La toge', 1]] }],
        moyen: [{ q: 'Range : Égypte ou Mésopotamie ?', colonnes: ['Égypte', 'Mésopotamie'],
          items: [['Les hiéroglyphes', 0], ['Le papyrus', 0], ['Le Nil', 0], ['Les pyramides', 0], ['Le pharaon', 0],
            ['Le cunéiforme', 1], ['Les tablettes d’argile', 1], ['Le Tigre et l’Euphrate', 1], ['Les ziggourats', 1], ['Babylone', 1]] }],
        difficile: [{ q: 'Range ces pharaons : Ancien Empire ou Nouvel Empire ?', colonnes: ['Ancien Empire', 'Nouvel Empire'],
          items: [['Khéops', 0], ['Khéphren', 0], ['Mykérinos', 0], ['Djéser', 0], ['Snéfrou', 0],
            ['Ramsès II', 1], ['Toutânkhamon', 1], ['Akhenaton', 1], ['Hatchepsout', 1], ['Thoutmôsis III', 1]] }],
        expert: [{ q: 'Range ces villes : Haute-Égypte (le sud) ou Basse-Égypte (le nord et le delta) ?', colonnes: ['Haute-Égypte', 'Basse-Égypte'],
          items: [['Thèbes', 0], ['Abydos', 0], ['Assouan', 0], ['Edfou', 0], ['Memphis', 1], ['Alexandrie', 1], ['Saïs', 1], ['Tanis', 1], ['Bubastis', 1]] }]
      } },
      { k: 'ordre', consigne: 'Range ces événements de l’Égypte du plus ancien au plus récent.', q: 'Quand : {a} ?', niveaux: {
        facile: [['Construction de la pyramide de Khéops', -2560, 'vers 2560 av. J.-C.'], ['Règne de Toutânkhamon', -1330, 'vers 1330 av. J.-C.'],
          ['Mort de Cléopâtre', -30, '30 av. J.-C.'], ['Découverte du tombeau de Toutânkhamon', 1922, '1922']],
        moyen: [['Premiers hiéroglyphes', -3200, 'vers 3200 av. J.-C.'], ['Pyramide à degrés de Djéser', -2650, 'vers 2650 av. J.-C.'],
          ['Début du règne de Ramsès II', -1279, '1279 av. J.-C.'], ['Alexandre le Grand fonde Alexandrie', -331, '331 av. J.-C.'],
          ['Champollion déchiffre les hiéroglyphes', 1822, '1822']],
        difficile: [['Début de l’Ancien Empire', -2700, 'vers 2700 av. J.-C.'], ['Début du Moyen Empire', -2050, 'vers 2050 av. J.-C.'],
          ['Début du Nouvel Empire', -1550, 'vers 1550 av. J.-C.'], ['L’Égypte devient une province romaine', -30, '30 av. J.-C.'],
          ['Découverte de la pierre de Rosette', 1799, '1799']],
        expert: [['Narmer unifie l’Égypte', -3100, 'vers 3100 av. J.-C.'], ['Règne d’Akhenaton', -1350, 'vers 1350 av. J.-C.'],
          ['Bataille de Qadesh', -1274, 'vers 1274 av. J.-C.'], ['Les Perses conquièrent l’Égypte', -525, '525 av. J.-C.'],
          ['Ptolémée Ier devient roi d’Égypte', -305, '305 av. J.-C.'], ['Abou Simbel est déplacé', 1964, 'de 1964 à 1968']]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le pharaon.', niveaux: {
        facile: [{ r: 'Toutânkhamon', i: ['J’ai régné sur l’Égypte.', 'Je suis devenu pharaon vers 9 ans.', 'Je suis mort jeune, vers 19 ans.', 'Howard Carter a trouvé mon tombeau en 1922.', 'Mon masque funéraire en or est très célèbre.'] },
          { r: 'Khéops', i: ['J’ai régné sur l’Égypte il y a plus de 4 500 ans.', 'Mon père s’appelait Snéfrou.', 'Mon tombeau est à Gizeh, près du Caire.', 'C’est la seule des 7 merveilles du monde encore debout.', 'J’ai fait construire la plus grande des pyramides.'] }],
        moyen: [{ r: 'Hatchepsout', i: ['J’ai régné sur l’Égypte.', 'Mon temple est à Deir el-Bahari.', 'J’ai envoyé une expédition au pays de Pount.', 'On me représente parfois avec une fausse barbe.', 'Je suis une femme devenue pharaon.'] },
          { r: 'Akhenaton', i: ['J’ai régné sur l’Égypte.', 'Mon épouse s’appelait Néfertiti.', 'J’ai fondé une nouvelle capitale, Amarna.', 'J’ai changé de nom en l’honneur de mon dieu.', 'J’ai fait adorer un seul dieu, le disque solaire Aton.'] }],
        difficile: [{ r: 'Thoutmôsis III', i: ['J’ai régné sur l’Égypte.', 'J’ai d’abord partagé le pouvoir avec Hatchepsout.', 'J’ai mené plus de quinze campagnes militaires.', 'J’ai gagné la bataille de Megiddo.', 'On m’appelle parfois le « Napoléon égyptien ».'] }],
        expert: [{ r: 'Ramsès III', i: ['J’ai régné sur l’Égypte.', 'Mon temple est à Médinet Habou.', 'Je suis le dernier grand pharaon du Nouvel Empire.', 'Un complot a été organisé contre moi dans mon palais.', 'J’ai repoussé les Peuples de la mer.'] }]
      } }
    ] },
    { id: 'a05', matiere: 'histoire', famille: 'ant', nom: 'Rome et la Gaule', court: 'Rome, Gaule', icone: '🏛️', series: [
      { k: 'paires', gauche: 'Nom antique', droite: 'Ville actuelle', consigneR: 'Relie chaque nom antique à la ville d’aujourd’hui.',
        q: 'Quelle ville s’appelait {a} dans l’Antiquité ?', qi: 'Comment s’appelait {b} dans l’Antiquité ?', niveaux: {
          facile: [['Lutèce|Lutece', 'Paris'], ['Lugdunum', 'Lyon'], ['Massalia|Massilia', 'Marseille'], ['Burdigala', 'Bordeaux'], ['Nemausus', 'Nîmes|Nimes']],
          moyen: [['Tolosa', 'Toulouse'], ['Arelate', 'Arles'], ['Nicaea|Nikaia', 'Nice'], ['Narbo Martius|Narbo', 'Narbonne'],
            ['Argentoratum', 'Strasbourg'], ['Cenabum|Genabum', 'Orléans|Orleans']],
          difficile: [['Rotomagus', 'Rouen'], ['Caesarodunum', 'Tours'], ['Limonum', 'Poitiers'], ['Vesontio', 'Besançon|Besancon'],
            ['Durocortorum', 'Reims'], ['Gesoriacum', 'Boulogne-sur-Mer|Boulogne'], ['Condate', 'Rennes']],
          expert: [['Augustonemetum', 'Clermont-Ferrand'], ['Samarobriva', 'Amiens'], ['Antipolis', 'Antibes'], ['Forum Julii', 'Fréjus|Frejus'],
            ['Aquae Sextiae', 'Aix-en-Provence|Aix'], ['Avaricum', 'Bourges'], ['Divona', 'Cahors']]
        } },
      { k: 'paires', gauche: 'Ce qu’il a fait', droite: 'Personnage', consigneR: 'Relie chaque fait à son personnage.',
        q: 'Qui {a} ?', niveaux: {
          facile: [['a conquis la Gaule', 'Jules César|César'], ['a été le premier empereur romain', 'Auguste|Octave'],
            ['était le chef gaulois vaincu à Alésia', 'Vercingétorix|Vercingetorix'], ['a traversé les Alpes avec des éléphants', 'Hannibal'],
            ['a été nourri par une louve avec son frère jumeau, selon la légende', 'Romulus']],
          moyen: [['a été accusé d’avoir incendié Rome en 64', 'Néron|Neron'], ['a été le premier empereur chrétien', 'Constantin'],
            ['a fait bâtir un mur au nord de la Bretagne romaine', 'Hadrien'], ['a mené une grande révolte d’esclaves', 'Spartacus'],
            ['a gouverné l’Empire quand il était le plus grand', 'Trajan'], ['a été le dernier empereur romain d’Occident', 'Romulus Augustule']],
          difficile: [['a fait commencer le Colisée', 'Vespasien'], ['a été l’empereur philosophe, auteur des Pensées', 'Marc Aurèle|Marc Aurele'],
            ['a donné la citoyenneté romaine à tous les hommes libres de l’Empire', 'Caracalla'], ['était le roi des Huns, battu en 451', 'Attila'],
            ['a battu Hannibal à Zama', 'Scipion l’Africain|Scipion'], ['a déposé le dernier empereur d’Occident en 476', 'Odoacre']],
          expert: [['a été le dernier roi de Rome, chassé en 509 av. J.-C.', 'Tarquin le Superbe|Tarquin'], ['était le chef gaulois qui a pris Rome vers 390 av. J.-C.', 'Brennus'],
            ['a fait du christianisme la religion officielle de l’Empire', 'Théodose|Theodose'], ['a partagé le pouvoir entre quatre empereurs, la tétrarchie', 'Dioclétien|Diocletien'],
            ['était le roi de Numidie vaincu par Marius', 'Jugurtha'], ['était le roi d’Épire aux victoires trop coûteuses', 'Pyrrhus']]
        } },
      { k: 'qcm', niveaux: {
        facile: [
          ['Quel chef gaulois a résisté à Jules César ?', 'Vercingétorix', ['Astérix', 'Clovis', 'Charlemagne']],
          ['Dans quelle ville Vercingétorix se rend-il à César en 52 av. J.-C. ?', 'Alésia', ['Lutèce', 'Rome', 'Gergovie']],
          ['Comment s’appellent les prêtres gaulois ?', 'Les druides', ['Les pharaons', 'Les moines', 'Les vestales']],
          ['Dans quel pays actuel se trouve Rome ?', 'L’Italie', ['La Grèce', 'L’Espagne', 'L’Égypte']],
          ['Comment s’appelle le soldat de l’armée romaine ?', 'Le légionnaire', ['Le chevalier', 'Le samouraï', 'Le mousquetaire']],
          ['Comment s’appelle le chef de l’Empire romain ?', 'L’empereur', ['Le pharaon', 'Le roi de France', 'Le président']],
          ['Quelle langue parlaient les Romains ?', 'Le latin', ['Le grec', 'L’italien', 'Le gaulois']],
          ['Comment s’appelait la France à l’époque de Jules César ?', 'La Gaule', ['La Bretagne', 'La Germanie', 'L’Ibérie']],
          ['Quelle ville a été ensevelie par le Vésuve en 79 ?', 'Pompéi', ['Rome', 'Naples', 'Venise']],
          ['Où les Romains regardaient-ils les combats de gladiateurs ?', 'Dans un amphithéâtre', ['Dans une église', 'Dans un château fort', 'Dans une pyramide']],
          ['Quel fleuve traverse Rome ?', 'Le Tibre', ['Le Nil', 'La Seine', 'Le Rhône']],
          ['Sur combien de collines Rome a-t-elle été bâtie, selon la tradition ?', '7', ['3', '12', '100']],
          ['Quel était le métier de la plupart des Gaulois ?', 'Paysan', ['Marin', 'Soldat romain', 'Marchand d’épices']],
          ['Quelle plante sacrée les druides coupaient-ils dans les arbres ?', 'Le gui', ['La rose', 'Le blé', 'Le maïs']]],
        moyen: [
          ['Quelle victoire Vercingétorix remporte-t-il contre César ?', 'Gergovie', ['Alésia', 'Bibracte', 'Lutèce', 'Avaricum']],
          ['Comment s’appelle le grand village fortifié des Gaulois ?', 'L’oppidum', ['Le castrum', 'Le forum', 'La villa', 'Le donjon']],
          ['De quelle ville venait Hannibal ?', 'Carthage', ['Athènes', 'Sparte', 'Alexandrie']],
          ['Comment appelle-t-on les guerres entre Rome et Carthage ?', 'Les guerres puniques', ['Les guerres médiques', 'La guerre de Cent Ans', 'La guerre des Gaules']],
          ['Quel volcan a détruit Pompéi ?', 'Le Vésuve', ['L’Etna', 'Le Stromboli', 'Le Kilimandjaro']],
          ['Que veut dire « SPQR », inscrit partout à Rome ?', 'Le Sénat et le peuple romain', ['Sauvons Pompéi, quittons Rome', 'Soldats prêts, quittons Rome', 'Sénat, prêtres, questeurs, rois']],
          ['Comment les Romains appelaient-ils la Méditerranée ?', 'Mare Nostrum, « notre mer »', ['Mare Magnum, « la grande mer »', 'Oceanus, « l’océan »', 'Mare Rubrum, « la mer Rouge »']],
          ['Comment appelle-t-on le mélange des cultures gauloise et romaine ?', 'La civilisation gallo-romaine', ['La Renaissance', 'La féodalité', 'La préhistoire']],
          ['Quelles routes les Romains ont-ils construites dans tout l’Empire ?', 'Les voies romaines', ['Les autoroutes', 'Les chemins de fer', 'Les canaux']],
          ['Quelle phrase célèbre César a-t-il dite après une victoire rapide ?', '« Je suis venu, j’ai vu, j’ai vaincu »', ['« Après moi, le déluge »', '« Paris vaut bien une messe »', '« L’État, c’est moi »']],
          ['Quel fleuve César a-t-il franchi en 49 av. J.-C. en disant « Le sort en est jeté » ?', 'Le Rubicon', ['Le Rhin', 'Le Tibre', 'Le Rhône']],
          ['Comment s’appelait le sud de la Gaule, conquis par Rome avant César ?', 'La Narbonnaise', ['L’Aquitaine', 'La Belgique', 'L’Armorique']],
          ['Comment s’appelait la Bretagne actuelle à l’époque gauloise ?', 'L’Armorique', ['La Narbonnaise', 'L’Aquitaine', 'La Belgique']],
          ['Quel mois porte le nom de Jules César ?', 'Juillet', ['Juin', 'Janvier', 'Août']]],
        difficile: [
          ['De quel peuple Vercingétorix était-il le chef ?', 'Les Arvernes', ['Les Éduens', 'Les Parisii', 'Les Belges', 'Les Helvètes', 'Les Vénètes']],
          ['Comment César a-t-il appelé son livre sur la conquête ?', 'La Guerre des Gaules', ['L’Énéide', 'L’Odyssée', 'Les Métamorphoses', 'Les Vies parallèles']],
          ['Qu’arrive-t-il à Vercingétorix après Alésia ?', 'Il est emmené à Rome puis exécuté', ['Il devient sénateur', 'Il s’enfuit en Bretagne', 'Il devient roi de Gaule', 'Il est libéré']],
          ['Où Hannibal a-t-il été vaincu en 202 av. J.-C. ?', 'À Zama', ['À Cannes', 'À Alésia', 'À Actium']],
          ['Quel empereur est le premier à être né en Gaule, à Lyon ?', 'Claude', ['Néron', 'Trajan', 'Hadrien']],
          ['Combien de consuls dirigeaient la République romaine chaque année ?', '2', ['1', '3', '10']],
          ['À Rome, comment appelle-t-on un chef qui a tous les pouvoirs pendant six mois en cas de danger ?', 'Un dictateur', ['Un consul', 'Un tribun', 'Un censeur']],
          ['Selon César, quels sont les trois peuples de la Gaule ?', 'Les Belges, les Celtes et les Aquitains', ['Les Francs, les Goths et les Huns', 'Les Grecs, les Romains et les Étrusques', 'Les Bretons, les Normands et les Basques']],
          ['Quel peuple voisin a donné ses derniers rois à Rome ?', 'Les Étrusques', ['Les Grecs', 'Les Gaulois', 'Les Carthaginois']],
          ['Sur quelle colline de Rome les empereurs avaient-ils leur palais ?', 'Le Palatin', ['Le Capitole', 'L’Aventin', 'Le Vatican']],
          ['Quel peuple germanique a donné son nom à la France ?', 'Les Francs', ['Les Wisigoths', 'Les Vandales', 'Les Burgondes']],
          ['Quelle ville était la capitale des Gaules à l’époque romaine ?', 'Lyon', ['Paris', 'Marseille', 'Nîmes']],
          ['Qui a fondé Marseille, vers 600 av. J.-C. ?', 'Des Grecs venus de Phocée', ['Des Romains', 'Des Phéniciens de Tyr', 'Des Gaulois arvernes']],
          ['Quel mois porte le nom de l’empereur Auguste ?', 'Août', ['Juillet', 'Avril', 'Mai']],
          ['Comment s’appelle la formation où les légionnaires se protègent avec leurs boucliers, même au-dessus de la tête ?', 'La tortue', ['Le hérisson', 'La phalange', 'Le carré']]],
        expert: [
          ['Quel peuple gaulois a donné son nom à Paris ?', 'Les Parisii', ['Les Arvernes', 'Les Éduens', 'Les Sénons', 'Les Carnutes']],
          ['Selon Pline, avec quoi les druides coupaient-ils le gui ?', 'Une serpe d’or', ['Une épée de fer', 'Une hache de bronze', 'Un couteau de silex']],
          ['Quel peuple gaulois avait son oppidum à Bibracte ?', 'Les Éduens', ['Les Arvernes', 'Les Parisii', 'Les Bituriges', 'Les Vénètes']],
          ['Quel mot français vient du Palatin, la colline des empereurs ?', 'Palais', ['Palette', 'Palissade', 'Palier']],
          ['Quel calendrier Jules César a-t-il créé, avec une année de 365 jours et un quart ?', 'Le calendrier julien', ['Le calendrier grégorien', 'Le calendrier républicain', 'Le calendrier lunaire']],
          ['Combien de soldats comptait environ une légion romaine ?', 'Environ 5 000', ['Environ 50', 'Environ 500', 'Environ 50 000']],
          ['Sur quelle colline de Rome se trouvait le grand temple de Jupiter ?', 'Le Capitole', ['Le Palatin', 'L’Aventin', 'Le Janicule']],
          ['Quel futur empereur a été proclamé à Lutèce en 360 ?', 'Julien', ['Constantin', 'Néron', 'Trajan']],
          ['Quel Romain a fondé Lugdunum en 43 av. J.-C. ?', 'Munatius Plancus', ['Jules César', 'Agrippa', 'Marc Antoine']],
          ['Comment s’appelaient les prêtresses qui gardaient le feu sacré de Rome ?', 'Les vestales', ['Les sibylles', 'Les druidesses', 'Les bacchantes']],
          ['Quelle bataille de 216 av. J.-C. a été la plus grande victoire d’Hannibal ?', 'Cannes', ['Zama', 'Alésia', 'Actium']],
          ['Quel général romain a vaincu les Cimbres et les Teutons ?', 'Marius', ['Sylla', 'Pompée', 'Crassus']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Vercingétorix était un chef gaulois.', true, ''], ['Les Romains parlaient latin.', true, ''],
          ['Les Gaulois vivaient surtout à la campagne, dans des fermes et des villages.', true, ''],
          ['Jules César a été empereur de Rome.', false, 'Jules César a été général et dictateur, mais jamais empereur : le premier empereur est Auguste.'],
          ['La Gaule a été conquise par les Grecs.', false, 'Elle a été conquise par les Romains de Jules César.']],
        moyen: [['Le latin est l’ancêtre du français.', true, ''], ['Les Gaulois portaient des braies, une sorte de pantalon.', true, ''],
          ['Les Romains ont construit des routes pavées dans toute la Gaule.', true, ''],
          ['Vercingétorix a gagné la bataille d’Alésia.', false, 'Il a gagné à Gergovie mais perdu à Alésia.'],
          ['Les gladiateurs combattaient au Sénat.', false, 'Ils combattaient dans l’arène des amphithéâtres.']],
        difficile: [['Rome a d’abord été gouvernée par des rois.', true, 'Sept rois, selon la tradition, avant la République en 509 av. J.-C.'],
          ['Carthage se trouvait dans l’actuelle Tunisie.', true, ''],
          ['L’Empire romain d’Orient a disparu en même temps que celui d’Occident.', false, 'L’Empire d’Orient (byzantin) a duré jusqu’en 1453.'],
          ['Dès Auguste, tous les habitants libres de l’Empire étaient citoyens romains.', false, 'Il a fallu attendre l’édit de Caracalla, en 212.']],
        expert: [['Marseille est plus ancienne que la conquête de la Gaule par César.', true, 'Elle a été fondée par des Grecs vers 600 av. J.-C.'],
          ['La Narbonnaise a été conquise par Rome avant le reste de la Gaule.', true, ''],
          ['Dans la Guerre des Gaules, César parle de lui en disant « je ».', false, 'Il parle de lui à la troisième personne, en disant « César ».'],
          ['Hannibal a fini par prendre Rome.', false, 'Il n’a jamais attaqué Rome elle-même et a été vaincu à Zama.']]
      } },
      { k: 'classer', niveaux: {
        facile: [{ q: 'Range : les Gaulois ou les Romains ?', colonnes: ['Gaulois', 'Romains'],
          items: [['Les druides', 0], ['Vercingétorix', 0], ['L’oppidum', 0], ['Les braies', 0], ['Le gui', 0],
            ['Le légionnaire', 1], ['La toge', 1], ['L’empereur', 1], ['Le Colisée', 1], ['Le latin', 1]] }],
        moyen: [{ q: 'Range : République romaine ou Empire romain ?', colonnes: ['République', 'Empire'],
          items: [['Les deux consuls', 0], ['Les guerres puniques', 0], ['Spartacus', 0], ['Jules César', 0], ['La destruction de Carthage', 0],
            ['Auguste', 1], ['Néron', 1], ['Trajan', 1], ['Le Colisée', 1], ['Constantin', 1]] }]
      } },
      { k: 'ordre', consigne: 'Range ces événements de Rome du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Fondation de Rome, selon la légende', -753, '753 av. J.-C.'], ['Jules César bat Vercingétorix à Alésia', -52, '52 av. J.-C.'],
          ['Auguste devient le premier empereur', -27, '27 av. J.-C.'], ['Fin de l’Empire romain d’Occident', 476, '476']],
        moyen: [['Rome devient une République', -509, '509 av. J.-C.'], ['Jules César est assassiné', -44, '44 av. J.-C.'],
          ['Le Vésuve ensevelit Pompéi', 79, '79'], ['L’empereur Constantin autorise les chrétiens (édit de Milan)', 313, '313'],
          ['Rome est pillée par les Wisigoths', 410, '410']],
        difficile: [['Hannibal traverse les Alpes avec ses éléphants', -218, '218 av. J.-C.'], ['Rome détruit Carthage', -146, '146 av. J.-C.'],
          ['Révolte des esclaves menée par Spartacus', -73, '73 av. J.-C.'], ['Inauguration du Colisée', 80, '80'],
          ['L’Empire est à son plus grand, sous Trajan', 117, '117'], ['L’Empire est partagé entre Occident et Orient', 395, '395']],
        expert: [['Bataille de Cannes, grande victoire d’Hannibal', -216, '216 av. J.-C.'], ['Bataille d’Actium : Octave bat Antoine et Cléopâtre', -31, '31 av. J.-C.'],
          ['Début du mur d’Hadrien en Bretagne', 122, '122'], ['Édit de Caracalla : tous les hommes libres deviennent citoyens', 212, '212'],
          ['Constantinople devient la nouvelle capitale', 330, '330'], ['Attila est battu aux champs Catalauniques', 451, '451'],
          ['Le sac de Rome par les Vandales', 455, '455']]
      } }
    ] },
    { id: 'a07', matiere: 'histoire', famille: 'ant', nom: 'Monuments et merveilles', court: 'Monuments', icone: '🏟️', series: [
      { k: 'paires', gauche: 'Monument', droite: 'Lieu', consigneR: 'Relie chaque monument à son lieu.',
        q: 'Où se trouve ce monument : {a} ?', ouverte: false, niveaux: {
          facile: [['Le Colisée', 'Rome'], ['Le Parthénon', 'Athènes'], ['Les pyramides de Gizeh', 'L’Égypte'], ['Le pont du Gard', 'Le sud de la France']],
          moyen: [['La Maison carrée', 'Nîmes'], ['Pompéi', 'Près de Naples'], ['Le mur d’Hadrien', 'Le nord de l’Angleterre'],
            ['Les temples d’Abou Simbel', 'Le sud de l’Égypte'], ['Pétra, la ville taillée dans la roche', 'La Jordanie'], ['Le théâtre antique d’Orange', 'Le Vaucluse']]
        } },
      { k: 'paires', gauche: 'Site', droite: 'Pays actuel', consigneR: 'Relie chaque site antique à son pays actuel.',
        q: 'Dans quel pays actuel se trouve ce site : {a} ?', ouverte: false, niveaux: {
          difficile: [['Le temple de Karnak', 'L’Égypte'], ['Le théâtre d’Épidaure', 'La Grèce'], ['Leptis Magna', 'La Libye'], ['Persépolis', 'L’Iran'],
            ['Palmyre', 'La Syrie'], ['Éphèse', 'La Turquie'], ['Carthage', 'La Tunisie']],
          expert: [['Volubilis', 'Le Maroc'], ['Timgad', 'L’Algérie'], ['Baalbek', 'Le Liban'], ['La Porta Nigra de Trèves', 'L’Allemagne'],
            ['Le théâtre romain de Mérida', 'L’Espagne'], ['Jerash', 'La Jordanie'], ['L’amphithéâtre d’El Jem', 'La Tunisie']]
        } },
      { k: 'paires', gauche: 'Merveille', droite: 'Ville', consigneR: 'Relie chaque merveille du monde à sa ville.',
        q: 'Où se trouvait cette merveille : {a} ?', ouverte: false, niveaux: {
          moyen: [['Le Colosse', 'Rhodes'], ['Le phare', 'Alexandrie'], ['Les jardins suspendus', 'Babylone'], ['La statue de Zeus', 'Olympie'],
            ['Le temple d’Artémis', 'Éphèse'], ['Le Mausolée', 'Halicarnasse'], ['La grande pyramide', 'Gizeh']]
        } },
      { k: 'qcm', niveaux: {
        facile: [
          ['Laquelle des 7 merveilles du monde antique existe encore ?', 'La pyramide de Khéops', ['Le phare d’Alexandrie', 'Le Colosse de Rhodes', 'Les jardins de Babylone']],
          ['Combien y avait-il de merveilles du monde antique ?', '7', ['3', '10', '12']],
          ['Dans quel pays se trouve la pyramide de Khéops ?', 'L’Égypte', ['La Grèce', 'L’Italie', 'Le Mexique']],
          ['Dans quelle ville se trouve le Colisée ?', 'Rome', ['Athènes', 'Paris', 'Le Caire']],
          ['À quoi servait le Colisée ?', 'Aux combats de gladiateurs', ['À prier les dieux', 'À loger l’empereur', 'À stocker le blé']],
          ['À quoi servait le pont du Gard ?', 'À faire passer de l’eau : c’est un aqueduc', ['À faire passer des trains', 'À défendre une ville', 'À traverser la mer']],
          ['Sur quelle colline d’Athènes se trouve le Parthénon ?', 'L’Acropole', ['Le Capitole', 'Le Palatin', 'L’Olympe']],
          ['À quelle déesse le Parthénon était-il consacré ?', 'Athéna', ['Aphrodite', 'Héra', 'Artémis']],
          ['Quel monument de Paris date de l’époque de Lutèce ?', 'Les arènes de Lutèce', ['La tour Eiffel', 'Notre-Dame', 'L’Arc de triomphe de l’Étoile']],
          ['Comment appelle-t-on les rangées de sièges d’un théâtre ou d’un amphithéâtre ?', 'Les gradins', ['Les créneaux', 'Les colonnes', 'Les vitraux']],
          ['Quelle forme a un amphithéâtre romain ?', 'Une forme ovale', ['Un carré', 'Un triangle', 'Une étoile']],
          ['Quel monument en forme d’arc célébrait les victoires romaines ?', 'L’arc de triomphe', ['La pyramide', 'Le menhir', 'Le phare']],
          ['Quelle ville a pour symbole l’Acropole ?', 'Athènes', ['Sparte', 'Rome', 'Le Caire']],
          ['Dans quel pays se trouve Pompéi ?', 'L’Italie', ['La Grèce', 'L’Espagne', 'La France']],
          ['Que regardait-on dans un théâtre grec ?', 'Des pièces de théâtre', ['Des combats de gladiateurs', 'Des courses de chars', 'Des matchs de football']]],
        moyen: [
          ['Quelle merveille était un géant de bronze à l’entrée d’un port ?', 'Le Colosse de Rhodes', ['Le phare d’Alexandrie', 'La statue de Zeus', 'Le Mausolée d’Halicarnasse', 'Le temple d’Artémis']],
          ['Combien de spectateurs le Colisée pouvait-il accueillir ?', 'Environ 50 000', ['Environ 500', 'Environ 5 000', 'Environ 1 million']],
          ['Quel temple de Rome possède une grande coupole percée d’un trou au sommet ?', 'Le Panthéon', ['Le Colisée', 'Le Circus Maximus', 'Le forum']],
          ['Dans quel grand cirque de Rome avaient lieu les courses de chars ?', 'Le Circus Maximus', ['Le Colisée', 'Le Panthéon', 'Le Capitole']],
          ['Quel style de colonne grecque est le plus simple ?', 'Le dorique', ['Le corinthien', 'Le gothique', 'Le roman']],
          ['À quoi servait un aqueduc ?', 'À amener l’eau dans les villes', ['À défendre les frontières', 'À faire tourner les moulins', 'À garder les céréales']],
          ['Dans quelle ville de France le grand mur d’un théâtre romain est-il encore debout ?', 'Orange', ['Lille', 'Brest', 'Strasbourg']],
          ['Quel mur a été bâti pour protéger la Bretagne romaine des peuples du nord ?', 'Le mur d’Hadrien', ['La Grande Muraille', 'Le mur de Berlin', 'Le mur des Lamentations']],
          ['De quelle couleur est la pierre de Pétra ?', 'Rose', ['Blanche', 'Noire', 'Verte']],
          ['Quel peuple a construit le Parthénon ?', 'Les Grecs', ['Les Romains', 'Les Égyptiens', 'Les Perses']],
          ['De quoi était fait le Colosse de Rhodes ?', 'De bronze', ['D’or massif', 'De bois', 'De verre']],
          ['Qu’est-ce qu’une nécropole ?', 'Une ville des morts, un grand cimetière', ['Une place de marché', 'Un grand port', 'Un palais royal']]],
        difficile: [
          ['Quelle merveille était le tombeau d’un roi de Carie ?', 'Le Mausolée d’Halicarnasse', ['Le temple d’Artémis', 'Le phare d’Alexandrie', 'Le Colosse de Rhodes', 'La statue de Zeus']],
          ['Quel sculpteur a créé la statue de Zeus à Olympie ?', 'Phidias', ['Praxitèle', 'Michel-Ange', 'Myron', 'Polyclète']],
          ['L’île de Pharos a donné un mot à la langue française. Lequel ?', 'Phare', ['Pharmacie', 'Pharaon', 'Fard', 'Farine']],
          ['Sous quel empereur le Panthéon de Rome a-t-il été reconstruit, tel qu’on le voit aujourd’hui ?', 'Hadrien', ['Néron', 'Auguste', 'Caligula']],
          ['Quel est le vrai nom du Colisée ?', 'L’amphithéâtre Flavien', ['Le cirque Maxime', 'Le forum de Trajan', 'Le théâtre de Marcellus']],
          ['Quelle colonne de Rome raconte en images les guerres contre les Daces ?', 'La colonne Trajane', ['La colonne Vendôme', 'La colonne de Juillet', 'La colonne Morris']],
          ['Dans quelle grande ville de Mésopotamie se trouvait la porte d’Ishtar ?', 'Babylone', ['Ninive', 'Ur', 'Thèbes']],
          ['Quel style de colonne a un chapiteau décoré de feuilles d’acanthe ?', 'Le corinthien', ['Le dorique', 'L’ionique', 'Le toscan']],
          ['Quel style de colonne a un chapiteau à volutes, en forme de spirales ?', 'L’ionique', ['Le dorique', 'Le corinthien', 'Le toscan']],
          ['Quelle ville a été ensevelie par le Vésuve en même temps que Pompéi ?', 'Herculanum', ['Ostie', 'Carthage', 'Troie']],
          ['Dans quel sanctuaire grec se trouvait l’oracle d’Apollon ?', 'Delphes', ['Olympie', 'Sparte', 'Corinthe']],
          ['Quel est le grand port de Rome, dont on visite les ruines ?', 'Ostie', ['Herculanum', 'Pompéi', 'Brindisi']]],
        expert: [
          ['Qui a incendié le temple d’Artémis en 356 av. J.-C. pour devenir célèbre ?', 'Érostrate', ['Alexandre le Grand', 'Néron', 'Darius', 'Xerxès', 'Périclès']],
          ['Quelle ville turque se trouve aujourd’hui à la place d’Halicarnasse ?', 'Bodrum', ['Istanbul', 'Izmir', 'Antalya', 'Ankara']],
          ['Quel dieu représentait le Colosse de Rhodes ?', 'Hélios, le Soleil', ['Zeus', 'Poséidon', 'Apollon', 'Arès']],
          ['Qui a fait achever le Mausolée du roi Mausole ?', 'Son épouse Artémise', ['Son fils', 'Alexandre le Grand', 'Le roi de Perse', 'Les Athéniens']],
          ['Comment s’appelle le trou au sommet de la coupole du Panthéon de Rome ?', 'L’oculus', ['L’atrium', 'Le pronaos', 'L’abside']],
          ['Où se trouve aujourd’hui la porte d’Ishtar de Babylone ?', 'Au musée de Pergame, à Berlin', ['Au Louvre, à Paris', 'Au British Museum, à Londres', 'Au musée du Caire']],
          ['Où se trouvent beaucoup de sculptures du Parthénon, les « marbres d’Elgin » ?', 'Au British Museum, à Londres', ['Au Louvre, à Paris', 'Au Vatican', 'Au Metropolitan Museum, à New York']],
          ['Quel temple de l’Acropole a des statues de femmes à la place des colonnes ?', 'L’Érechthéion', ['Le Parthénon', 'Le temple d’Athéna Niké', 'Les Propylées']],
          ['Comment s’appellent ces statues de femmes qui servent de colonnes ?', 'Les caryatides', ['Les atlantes', 'Les sirènes', 'Les vestales']],
          ['Quel grand temple d’Athènes, consacré à Zeus, a été achevé par Hadrien ?', 'L’Olympiéion', ['L’Érechthéion', 'Le Parthénon', 'Le temple d’Héphaïstos']],
          ['Quel pont romain franchit le Tage, en Espagne ?', 'Le pont d’Alcántara', ['Le pont du Gard', 'Le pont Saint-Bénézet', 'Le pont Valentré']],
          ['Quelle était, selon les auteurs antiques, la hauteur du Colosse de Rhodes ?', 'Environ 30 mètres', ['Environ 3 mètres', 'Environ 300 mètres', 'Environ 1 kilomètre']],
          ['Selon la légende, quel roi de Babylone a fait créer les jardins suspendus pour son épouse ?', 'Nabuchodonosor II', ['Hammurabi', 'Darius Ier', 'Sargon']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['La pyramide de Khéops est la plus ancienne des 7 merveilles.', true, ''], ['Le Colisée se trouve à Rome.', true, ''],
          ['Le pont du Gard est un aqueduc romain.', true, ''], ['Le Parthénon est un temple grec.', true, ''],
          ['La tour Eiffel fait partie des 7 merveilles du monde antique.', false, 'Elle date de 1889 : bien après l’Antiquité.'],
          ['Le Colisée a été construit au Moyen Âge.', false, 'Il a été inauguré en 80, sous l’Empire romain.']],
        moyen: [['Le Colosse de Rhodes a été renversé par un tremblement de terre.', true, ''], ['On peut encore se promener dans les rues de Pompéi.', true, ''],
          ['Le Panthéon de Rome a toujours son toit d’origine.', true, 'Sa coupole en béton a près de 1 900 ans.'],
          ['Les jardins suspendus de Babylone ont été retrouvés intacts.', false, 'On n’a jamais trouvé de traces sûres de ces jardins.']],
        difficile: [['Le phare d’Alexandrie a été détruit par des tremblements de terre.', true, ''], ['Le Colisée doit peut-être son nom à une statue colossale de Néron, tout près.', true, ''],
          ['La statue de Zeus à Olympie était en marbre blanc.', false, 'Elle était faite d’or et d’ivoire, sur une structure en bois.'],
          ['Le Parthénon a toujours été un temple, jusqu’à aujourd’hui.', false, 'Il a été aussi une église, puis une mosquée, et a été très abîmé par une explosion en 1687.']],
        expert: [['Le mot « mausolée » vient du roi Mausole.', true, ''],
          ['Les statues grecques étaient souvent peintes de couleurs vives.', true, 'Des traces de peinture le montrent : le blanc du marbre vient du temps.'],
          ['Le temple d’Artémis n’a jamais été reconstruit.', false, 'Il a été reconstruit après l’incendie de 356 av. J.-C.'],
          ['Le Colosse de Rhodes avait une jambe sur chaque rive du port.', false, 'C’est une légende : une statue si grande au-dessus de l’eau aurait été impossible à construire.']]
      } },
      { k: 'classer', niveaux: {
        facile: [{ q: 'Range : monument grec ou monument romain ?', colonnes: ['Grec', 'Romain'],
          items: [['Le Parthénon', 0], ['L’Acropole d’Athènes', 0], ['Le sanctuaire de Delphes', 0], ['Le théâtre d’Épidaure', 0], ['Le Colisée', 1], ['Le pont du Gard', 1], ['Les arènes de Nîmes', 1], ['La Maison carrée', 1]] }],
        moyen: [{ q: 'Range ces monuments : en Égypte ou en Grèce ?', colonnes: ['Égypte', 'Grèce'],
          items: [['Les pyramides de Gizeh', 0], ['Le Sphinx', 0], ['Abou Simbel', 0], ['Le temple de Karnak', 0], ['Le phare d’Alexandrie', 0],
            ['Le Parthénon', 1], ['Le théâtre d’Épidaure', 1], ['Le sanctuaire de Delphes', 1], ['Le stade d’Olympie', 1], ['Le temple de Poséidon au cap Sounion', 1]] }],
        difficile: [{ q: 'Range ces sites romains : en France ou ailleurs dans l’Empire ?', colonnes: ['En France', 'Ailleurs'],
          items: [['Le pont du Gard', 0], ['La Maison carrée', 0], ['Le théâtre d’Orange', 0], ['Les arènes d’Arles', 0], ['Le site de Glanum', 0],
            ['Leptis Magna', 1], ['Le mur d’Hadrien', 1], ['Pompéi', 1], ['Éphèse', 1], ['L’amphithéâtre d’El Jem', 1]] }],
        expert: [{ q: 'Range ces merveilles : dans le monde grec ou en Égypte et Mésopotamie ?', colonnes: ['Monde grec', 'Égypte et Mésopotamie'],
          items: [['La statue de Zeus', 0], ['Le Colosse de Rhodes', 0], ['Le temple d’Artémis', 0], ['Le Mausolée d’Halicarnasse', 0],
            ['La pyramide de Khéops', 1], ['Le phare d’Alexandrie', 1], ['Les jardins suspendus', 1]] }]
      } },
      { k: 'ordre', consigne: 'Range ces monuments du plus ancien au plus récent.', q: 'Quand a été construit ce monument : {a} ?', niveaux: {
        facile: [['La pyramide de Khéops', -2560, 'vers 2560 av. J.-C.'], ['Le Parthénon', -438, 'achevé en 438 av. J.-C.'],
          ['Le Colisée', 80, 'inauguré en 80'], ['La tour Eiffel', 1889, '1889']],
        moyen: [['Stonehenge (grandes pierres)', -2500, 'vers 2500 av. J.-C.'], ['Le temple d’Abou Simbel', -1260, 'vers 1260 av. J.-C.'],
          ['Le phare d’Alexandrie', -280, 'vers 280 av. J.-C.'], ['Le pont du Gard', 50, 'vers 50'], ['Le Panthéon de Rome actuel', 125, 'vers 125']],
        difficile: [['La porte d’Ishtar', -575, 'vers 575 av. J.-C.'], ['Le Mausolée d’Halicarnasse', -350, 'vers 350 av. J.-C.'],
          ['Le Colosse de Rhodes', -280, 'achevé vers 280 av. J.-C.'], ['Le mur d’Hadrien', 122, 'commencé en 122'], ['Sainte-Sophie de Constantinople', 537, '537']],
        expert: [['La ziggourat d’Ur', -2100, 'vers 2100 av. J.-C.'], ['Persépolis', -518, 'fondée vers 518 av. J.-C.'],
          ['Le théâtre d’Épidaure', -340, 'vers 340 av. J.-C.'], ['La colonne Trajane', 113, '113'], ['Le pont d’Alcántara', 104, 'vers 104']]
      } }
    ] },
    { id: 'a10', matiere: 'histoire', famille: 'ant', nom: 'Chiffres romains', court: 'I, V, X…', icone: 'Ⅻ', series: [
      { k: 'paires', gauche: 'Chiffres romains', droite: 'Nombre', formats: ['Q', 'O'],
        q: 'Combien vaut {a} ?', qi: 'Comment écrit-on {b} en chiffres romains ?', niveaux: ROMAINS }
    ] },
    { id: 'a11', matiere: 'histoire', famille: 'ant', nom: 'Vie antique et Jeux olympiques', court: 'Vie antique', icone: '🏺', series: [
      { k: 'paires', gauche: 'Définition', droite: 'Mot', consigneR: 'Relie chaque définition à son mot.',
        q: 'Comment appelle-t-on {a} ?', niveaux: {
          facile: [['les bains publics des Romains', 'Les thermes|Thermes'], ['la grande place au centre d’une ville romaine', 'Le forum|Forum'],
            ['l’homme qui combat dans l’arène', 'Le gladiateur|Gladiateur'], ['le vêtement du citoyen romain', 'La toge|Toge'],
            ['le bâtiment où l’on regarde les combats de gladiateurs', 'L’amphithéâtre|Amphitheatre']],
          moyen: [['l’assemblée des anciens qui conseille Rome', 'Le sénat|Senat'], ['le pouvoir du peuple, inventé à Athènes', 'La démocratie|Democratie'],
            ['le canal qui amène l’eau dans les villes', 'L’aqueduc|Aqueduc'], ['le soldat de l’armée romaine', 'Le légionnaire|Legionnaire'],
            ['la grande maison à la campagne', 'La villa|Villa'], ['la personne qui appartient à un maître', 'L’esclave|Esclave']],
          difficile: [['un membre d’une riche et ancienne famille de Rome', 'Le patricien|Patricien'], ['un homme du peuple, à Rome', 'Le plébéien|Plebeien'],
            ['la place publique d’une cité grecque', 'L’agora|Agora'], ['la maison d’une riche famille, en ville', 'La domus|Domus'],
            ['l’immeuble où vivent les Romains pauvres', 'L’insula|Insula'], ['l’un des deux chefs élus pour un an à Rome', 'Le consul|Consul'],
            ['une ville et ses terres, qui se gouvernent seules, en Grèce', 'La cité|Cite']],
          expert: [['le fantassin grec, avec bouclier rond et lance', 'L’hoplite|Hoplite'], ['le vote d’Athènes pour exiler un citoyen', 'L’ostracisme|Ostracisme'],
            ['le magistrat qui défend les plébéiens, à Rome', 'Le tribun de la plèbe|Tribun'], ['la longue tunique des femmes grecques', 'Le péplos|Peplos'],
            ['la salle à manger romaine, où l’on mange couché', 'Le triclinium|Triclinium'], ['la pièce d’entrée d’une maison romaine, avec un bassin', 'L’atrium|Atrium'],
            ['le chauffage par le sol des thermes', 'L’hypocauste|Hypocauste']]
        } },
      { k: 'qcm', niveaux: {
        facile: [
          ['Que recevait le vainqueur d’une épreuve aux Jeux olympiques antiques ?', 'Une couronne d’olivier', ['Une médaille d’or', 'Une coupe', 'Un cheval']],
          ['Où avaient lieu les Jeux olympiques antiques ?', 'À Olympie', ['À Rome', 'À Paris', 'Au Caire']],
          ['Dans quel pays se trouve Olympie ?', 'La Grèce', ['L’Italie', 'L’Égypte', 'L’Espagne']],
          ['Que mangeaient surtout les Romains pauvres ?', 'Des bouillies de céréales et du pain', ['Des frites', 'Du chocolat', 'Des pommes de terre']],
          ['Avec quoi les Romains s’éclairaient-ils le soir ?', 'Des lampes à huile', ['Des ampoules', 'Des lampes de poche', 'Des néons']],
          ['Sur quoi les élèves romains écrivaient-ils à l’école ?', 'Des tablettes de cire', ['Des cahiers', 'Des ordinateurs', 'Des tableaux blancs']],
          ['Quelle boisson les Grecs et les Romains buvaient-ils souvent mélangée à de l’eau ?', 'Le vin', ['Le café', 'Le thé', 'Le soda']],
          ['Quel spectacle les Romains aimaient-ils voir au cirque ?', 'Les courses de chars', ['Les matchs de football', 'Les films', 'Les concerts de rock']],
          ['Dans quelle ville grecque est née la démocratie ?', 'Athènes', ['Sparte', 'Rome', 'Troie']],
          ['Quelle cité grecque était célèbre pour ses soldats très entraînés ?', 'Sparte', ['Athènes', 'Corinthe', 'Olympie']],
          ['Avec quoi payait-on chez les Grecs et les Romains ?', 'Des pièces de monnaie', ['Des billets', 'Des cartes bancaires', 'Des chèques']],
          ['Comment les Romains voyageaient-ils sur de longues distances ?', 'À pied, à cheval ou en char', ['En train', 'En voiture', 'En avion']],
          ['Quelle course faisait-on aux Jeux, sur la longueur du stade ?', 'Une course à pied', ['Une course à vélo', 'Une course en voiture', 'Une course à ski']],
          ['Quel animal tirait les chars de course ?', 'Le cheval', ['Le bœuf', 'L’éléphant', 'Le chameau']],
          ['Qui allait à l’école, à Rome ?', 'Surtout les enfants des familles riches', ['Tous les enfants, gratuitement', 'Seulement les filles', 'Personne']]],
        moyen: [
          ['En quelle année ont eu lieu les premiers Jeux olympiques, selon la tradition ?', '776 av. J.-C.', ['1896', '476', '44 av. J.-C.']],
          ['Quelle épreuve consistait à lancer un objet rond et plat ?', 'Le disque', ['Le javelot', 'Le saut', 'La lutte']],
          ['Comment s’appelle l’épreuve qui réunissait cinq épreuves en une ?', 'Le pentathlon', ['Le marathon', 'Le pancrace', 'Le triathlon']],
          ['Qu’est-ce qu’un affranchi ?', 'Un ancien esclave devenu libre', ['Un soldat romain', 'Un prêtre gaulois', 'Un sénateur']],
          ['Quelle sauce de poisson les Romains adoraient-ils ?', 'Le garum', ['Le ketchup', 'La mayonnaise', 'Le pesto']],
          ['Avec quoi écrivait-on sur une tablette de cire ?', 'Un stylet', ['Un stylo à bille', 'Une craie', 'Un feutre']],
          ['À quel jeu d’adresse les enfants grecs et romains jouaient-ils avec de petits os ?', 'Les osselets', ['Les échecs', 'Les cartes', 'Les dominos']],
          ['Quel instrument à cordes, une petite harpe, jouait-on en Grèce ?', 'La lyre', ['Le piano', 'La guitare électrique', 'Le violon']],
          ['Dans une cité grecque comme Athènes, qui pouvait voter ?', 'Seulement les citoyens, des hommes', ['Tout le monde', 'Les femmes et les esclaves', 'Seulement le roi']],
          ['Quel roi de Sparte a combattu aux Thermopyles avec 300 Spartiates ?', 'Léonidas', ['Périclès', 'Agamemnon', 'Darius']],
          ['Contre quel peuple les Grecs ont-ils mené les guerres médiques ?', 'Les Perses', ['Les Romains', 'Les Égyptiens', 'Les Gaulois']],
          ['Quel savant grec aurait crié « Eurêka ! » dans son bain ?', 'Archimède', ['Pythagore', 'Euclide', 'Thalès']],
          ['Quel conteur grec a écrit des fables avec des animaux ?', 'Ésope', ['Homère', 'Sophocle', 'Platon']],
          ['Quel Grec a donné son nom à un théorème sur le triangle rectangle ?', 'Pythagore', ['Thalès', 'Euclide', 'Archimède']]],
        difficile: [
          ['Quelle était la course la plus ancienne des Jeux ?', 'Le stade, environ 192 mètres', ['Le marathon', 'Le 10 000 mètres', 'Le relais', 'La course de haies']],
          ['Comment s’appelait un char tiré par quatre chevaux ?', 'Un quadrige', ['Un bige', 'Un tricycle', 'Un carrosse']],
          ['Selon la tradition, quel empereur a mis fin aux Jeux olympiques antiques ?', 'Théodose Ier', ['Néron', 'Auguste', 'Constantin']],
          ['À partir de quel âge les garçons de Sparte étaient-ils entraînés par la cité ?', '7 ans', ['15 ans', '2 ans', '20 ans']],
          ['En Grèce, qui était le « pédagogue », au départ ?', 'L’esclave qui accompagnait l’enfant à l’école', ['Le directeur de l’école', 'Un médecin', 'Un juge']],
          ['Quel homme politique a dirigé Athènes à son âge d’or, au Ve siècle av. J.-C. ?', 'Périclès', ['Alexandre le Grand', 'Léonidas', 'Solon']],
          ['Quel philosophe grec a été condamné à boire la ciguë ?', 'Socrate', ['Platon', 'Aristote', 'Pythagore']],
          ['Qui a été le professeur d’Alexandre le Grand ?', 'Aristote', ['Socrate', 'Platon', 'Homère']],
          ['Quel médecin grec a donné son nom au serment des médecins ?', 'Hippocrate', ['Galien', 'Aristote', 'Archimède']],
          ['Comment s’appelle le chef de famille romain, qui a tous les pouvoirs sur les siens ?', 'Le pater familias', ['Le consul', 'Le préfet', 'Le tribun']],
          ['Quelle fête romaine de décembre permettait aux esclaves de se croire libres quelques jours ?', 'Les Saturnales', ['Les Lupercales', 'Les Floralies', 'Les Panathénées']],
          ['Que faisait-on avec l’huile d’olive aux thermes ?', 'On s’en frottait le corps avant de la racler', ['On la buvait', 'On allumait le feu avec', 'On la versait dans le bassin']],
          ['Quel historien grec est appelé « le père de l’histoire » ?', 'Hérodote', ['Homère', 'Thucydide', 'Plutarque']],
          ['Quelle cité grecque a gagné la bataille de Marathon contre les Perses, en 490 av. J.-C. ?', 'Athènes', ['Sparte', 'Corinthe', 'Thèbes']]],
        expert: [
          ['Qui a recréé les Jeux olympiques modernes ?', 'Pierre de Coubertin', ['Jules Ferry', 'Victor Hugo', 'Jules Verne', 'Louis Pasteur']],
          ['Quelle Spartiate a été la première femme à gagner aux Jeux, avec ses chevaux ?', 'Cynisca|Kyniska', ['Hélène', 'Cléopâtre', 'Sappho', 'Artémise']],
          ['Quel empereur romain a gagné la course de chars aux Jeux, alors qu’il était tombé de son char ?', 'Néron', ['Auguste', 'Trajan', 'Hadrien']],
          ['Avec quel outil, une sorte de racloir, les Romains se nettoyaient-ils la peau ?', 'Le strigile', ['La fibule', 'Le stylet', 'Le calame']],
          ['Comment s’appelle l’épingle qui attachait les vêtements ?', 'La fibule', ['Le strigile', 'La bulla', 'Le torque']],
          ['Que portait un enfant romain libre autour du cou pour le protéger ?', 'La bulla', ['La fibule', 'Le torque', 'Le scarabée']],
          ['Qui étaient les hilotes, à Sparte ?', 'Des paysans asservis qui cultivaient la terre', ['Les deux rois', 'Les athlètes des Jeux', 'Des prêtres d’Apollon']],
          ['Sur quelle colline d’Athènes les citoyens se réunissaient-ils pour voter ?', 'La Pnyx', ['L’Acropole', 'L’Olympe', 'Le Palatin']],
          ['Sur quoi les Athéniens écrivaient-ils le nom de l’homme à exiler ?', 'Un morceau de poterie, l’ostracon', ['Une tablette de cire', 'Un papyrus', 'Une feuille d’or']],
          ['Combien de membres comptait le Conseil d’Athènes (la Boulè) à l’époque de Clisthène ?', '500', ['50', '100', '5 000']],
          ['Quel législateur athénien a supprimé l’esclavage pour dettes ?', 'Solon', ['Dracon', 'Clisthène', 'Périclès']],
          ['Quel adjectif vient du législateur Dracon, aux lois très sévères ?', 'Draconien', ['Dragon', 'Drastique', 'Dramatique']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Les Jeux olympiques antiques avaient lieu à Olympie, en Grèce.', true, ''],
          ['Les Jeux olympiques étaient organisés en l’honneur de Zeus.', true, ''],
          ['Les athlètes venaient de toutes les cités grecques.', true, ''],
          ['Les vainqueurs recevaient une médaille d’or.', false, 'Ils recevaient une couronne d’olivier.'],
          ['Les Romains mangeaient des pommes de terre.', false, 'La pomme de terre vient d’Amérique : les Romains ne la connaissaient pas.']],
        moyen: [['Les Jeux avaient lieu tous les 4 ans.', true, ''],
          ['Pendant les Jeux, une trêve sacrée arrêtait les guerres entre cités.', true, ''],
          ['Les femmes mariées pouvaient participer aux Jeux.', false, 'Elles n’avaient même pas le droit de les regarder.'],
          ['Les Jeux olympiques antiques avaient des épreuves de ski.', false, 'Il n’y avait pas de sports d’hiver : course, sauts, lancers, lutte, boxe, chars…'],
          ['À Rome, les esclaves pouvaient parfois être libérés par leur maître.', true, 'Ils devenaient alors des affranchis.']],
        difficile: [['Les athlètes concouraient nus.', true, ''],
          ['Le pancrace mélangeait la lutte et la boxe.', true, ''],
          ['Les Jeux olympiques antiques ont duré plus de mille ans.', true, 'De 776 av. J.-C. à la fin du IVe siècle, selon la tradition.'],
          ['Le marathon faisait partie des Jeux antiques.', false, 'Le marathon a été créé pour les Jeux modernes de 1896.'],
          ['À Athènes, les femmes votaient à l’assemblée.', false, 'Seuls les citoyens, des hommes, votaient.']],
        expert: [['Les juges des Jeux s’appelaient les hellanodices.', true, ''],
          ['Les Héraia étaient des jeux réservés aux jeunes filles, en l’honneur d’Héra.', true, ''],
          ['Une olympiade est la période de quatre ans entre deux Jeux.', true, ''],
          ['Le pentathlon antique comprenait la natation.', false, 'Il comprenait la course, le saut en longueur, le disque, le javelot et la lutte.'],
          ['Sparte avait un seul roi.', false, 'Sparte avait deux rois en même temps.']]
      } },
      { k: 'classer', niveaux: {
        facile: [{ q: 'Range : Grèce antique ou Rome antique ?', colonnes: ['Grèce', 'Rome'],
          items: [['Athènes', 0], ['Sparte', 0], ['Les Jeux olympiques', 0], ['L’agora', 0], ['L’Acropole', 0],
            ['Le Colisée', 1], ['Les légionnaires', 1], ['Le latin', 1], ['Le forum', 1], ['Les gladiateurs', 1]] }],
        moyen: [{ q: 'Range : Athènes ou Sparte ?', colonnes: ['Athènes', 'Sparte'],
          items: [['La démocratie', 0], ['Périclès', 0], ['Le Parthénon', 0], ['Le port du Pirée', 0], ['Socrate', 0],
            ['Léonidas', 1], ['Deux rois en même temps', 1], ['L’entraînement militaire dès l’enfance', 1], ['Les hilotes', 1], ['Les 300 des Thermopyles', 1]] }],
        difficile: [{ q: 'Range ces mots : Grèce ou Rome ?', colonnes: ['Grèce', 'Rome'],
          items: [['L’agora', 0], ['L’hoplite', 0], ['La cité', 0], ['Le stratège', 0], ['L’ostracisme', 0],
            ['Le consul', 1], ['La domus', 1], ['L’insula', 1], ['Le légionnaire', 1], ['Le patricien', 1]] }],
        expert: [{ q: 'Range ces épreuves : aux Jeux olympiques antiques ou seulement aux Jeux modernes ?', colonnes: ['Jeux antiques', 'Seulement modernes'],
          items: [['Le stade', 0], ['Le pancrace', 0], ['Le pentathlon', 0], ['La course en armes', 0], ['La course de chars', 0], ['Le pugilat (la boxe)', 0],
            ['Le marathon', 1], ['La natation', 1], ['Le saut à la perche', 1], ['Le cyclisme', 1], ['Le volley-ball', 1]] }]
      } }
    ] },
    // ---------- Moyen Âge (v7.7 ; v8.5 : 8 jeux regroupés en 3, choix de l'utilisateur du 13/11/2026, BACKLOG lignes 328 et 334) ----------
    // Rois, batailles et frise = anciens « Rois de France » + « Jeanne d’Arc et la guerre de Cent Ans » + « Frise du Moyen Âge » ;
    // Châteaux, chevaliers et paysans = « Le château fort » + « Chevaliers » + « Seigneurs et paysans » ;
    // Églises, croisades et Vikings = « Roman ou gothique ? » + « Les Vikings » (+ moines et croisades, nouveaux).
    // Les paires « description → nom » sont rangées [description, nom] : la question porte sur {a}, la réponse est le nom.
    { id: 'm01', matiere: 'histoire', famille: 'mag', nom: 'Rois, batailles et frise', court: 'Rois, frise', icone: '👑', series: [
      { k: 'paires', gauche: 'Ce qu’il a fait', droite: 'Personnage', consigneR: 'Relie chaque fait au personnage.',
        q: 'Qui {a} ?', niveaux: {
          facile: [['a été baptisé à Reims par l’évêque Remi', 'Clovis'], ['a été couronné empereur à Rome en l’an 800', 'Charlemagne'],
            ['rendait la justice sous un chêne, à Vincennes', 'Saint Louis|Louis IX'], ['a été sacré à Reims grâce à Jeanne d’Arc', 'Charles VII'],
            ['a été élu roi en 987, premier des Capétiens', 'Hugues Capet']],
          moyen: [['a gagné la bataille de Bouvines en 1214', 'Philippe Auguste|Philippe II'], ['a été le premier roi carolingien', 'Pépin le Bref|Pepin le Bref'],
            ['a arrêté une armée arabe près de Poitiers en 732', 'Charles Martel'], ['a fait arrêter les Templiers en 1307', 'Philippe le Bel|Philippe IV'],
            ['a conquis l’Angleterre en 1066', 'Guillaume le Conquérant|Guillaume'], ['est mort à Tunis pendant une croisade', 'Saint Louis|Louis IX']],
          difficile: [['était roi des Francs, conseillé par saint Éloi', 'Dagobert|Dagobert Ier'], ['a reçu l’ouest de l’empire au traité de Verdun, en 843', 'Charles le Chauve'],
            ['était surnommé « l’universelle aragne »', 'Louis XI'], ['a été fait prisonnier à la bataille de Poitiers, en 1356', 'Jean le Bon|Jean II'],
            ['avait pour connétable Bertrand Du Guesclin', 'Charles V|Charles V le Sage'], ['était roi d’Angleterre, surnommé Cœur de Lion', 'Richard Cœur de Lion|Richard']],
          expert: [['était le fils et le successeur d’Hugues Capet', 'Robert le Pieux|Robert II'], ['était surnommé le Gros et conseillé par l’abbé Suger', 'Louis VI|Louis VI le Gros'],
            ['a été le premier mari d’Aliénor d’Aquitaine', 'Louis VII'], ['était surnommé le Fou, et aussi le Bien-Aimé', 'Charles VI'],
            ['a été le premier roi de la famille des Valois', 'Philippe VI|Philippe VI de Valois'], ['a été le dernier roi carolingien, mort en 987', 'Louis V']]
        } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le personnage du Moyen Âge.', niveaux: {
        facile: [{ r: 'Charlemagne', i: ['Je suis le fils de Pépin le Bref.', 'J’ai combattu les Saxons et les Lombards.', 'Ma ville préférée était Aix-la-Chapelle.', 'On dit, à tort, que j’ai inventé l’école.', 'J’ai été couronné empereur à Rome en l’an 800.'] },
          { r: 'Clovis', i: ['Je suis roi des Francs.', 'Mon père s’appelait Childéric.', 'On raconte l’histoire de mon vase brisé à Soissons.', 'Ma femme, Clotilde, était chrétienne.', 'J’ai été baptisé à Reims par l’évêque Remi.'] },
          { r: 'Jeanne d’Arc', i: ['Je suis née à Domrémy.', 'Je disais entendre des voix.', 'J’ai délivré Orléans en 1429.', 'J’ai fait sacrer Charles VII à Reims.', 'J’ai combattu les Anglais pendant la guerre de Cent Ans.'] }],
        moyen: [{ r: 'Saint Louis', i: ['Je suis roi de France au XIIIe siècle.', 'Ma mère, Blanche de Castille, a gouverné pendant mon enfance.', 'J’ai fait construire la Sainte-Chapelle à Paris.', 'Je suis mort à Tunis pendant une croisade.', 'On dit que je rendais la justice sous un chêne à Vincennes.'] },
          { r: 'Guillaume le Conquérant', i: ['Je suis né en Normandie.', 'Je descends du chef viking Rollon.', 'La tapisserie de Bayeux raconte mon histoire.', 'J’ai gagné la bataille d’Hastings.', 'Je suis devenu roi d’Angleterre en 1066.'] }],
        difficile: [{ r: 'Philippe Auguste', i: ['Je suis un roi capétien.', 'J’ai beaucoup agrandi le domaine royal.', 'J’ai fait entourer Paris d’un rempart et construire le premier Louvre.', 'Je suis parti en croisade avec Richard Cœur de Lion.', 'J’ai gagné la bataille de Bouvines en 1214.'] },
          { r: 'Du Guesclin', i: ['Je suis un chevalier breton.', 'On disait que j’étais très laid.', 'J’ai combattu les Anglais pendant la guerre de Cent Ans.', 'J’ai emmené les Grandes Compagnies se battre en Espagne.', 'Le roi Charles V m’a fait connétable de France.'] }],
        expert: [{ r: 'Hugues Capet', i: ['J’étais duc des Francs.', 'Mon surnom viendrait d’une cape d’abbé.', 'Les grands seigneurs m’ont élu roi.', 'Je suis devenu roi en 987.', 'Ma dynastie porte mon nom : les Capétiens.'] },
          { r: 'Aliénor d’Aquitaine', i: ['Je suis duchesse d’Aquitaine.', 'J’ai d’abord épousé le roi de France Louis VII.', 'Puis j’ai épousé Henri II Plantagenêt.', 'Je suis la mère de Richard Cœur de Lion.', 'J’ai été reine de France, puis reine d’Angleterre.'] }]
      } },
      { k: 'ordre', consigne: 'Range ces événements du Moyen Âge du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Fin de l’Empire romain d’Occident', 476, '476'], ['Charlemagne est couronné empereur', 800, '800'], ['Début de la guerre de Cent Ans', 1337, '1337'],
          ['Jeanne d’Arc délivre Orléans', 1429, '1429'], ['Jeanne d’Arc est brûlée à Rouen', 1431, '1431'], ['Fin de la guerre de Cent Ans', 1453, '1453'],
          ['Christophe Colomb arrive en Amérique', 1492, '1492']],
        moyen: [['Charles Martel arrête les Arabes près de Poitiers', 732, '732'], ['Hugues Capet devient roi', 987, '987'], ['Guillaume le Conquérant gagne à Hastings', 1066, '1066'],
          ['Départ de la première croisade', 1096, '1096'], ['Bataille de Crécy', 1346, '1346'], ['Bataille de Poitiers, le roi Jean le Bon est pris', 1356, '1356'],
          ['Bataille d’Azincourt', 1415, '1415']],
        difficile: [['Traité de Verdun : l’empire de Charlemagne est partagé', 843, '843'], ['Rollon reçoit la Normandie', 911, '911'], ['Début de la construction de Notre-Dame de Paris', 1163, '1163'],
          ['Bataille de Bouvines', 1214, '1214'], ['La peste noire arrive à Marseille', 1347, '1347'], ['Naissance de Jeanne d’Arc à Domrémy', 1412, '1412'],
          ['Traité de Troyes : le roi d’Angleterre héritier de la France', 1420, '1420'], ['Jeanne d’Arc est capturée à Compiègne', 1430, '1430']],
        expert: [['Le pape Urbain II appelle à la croisade à Clermont', 1095, '1095'], ['Les croisés prennent Jérusalem', 1099, '1099'], ['Début de la croisade contre les Albigeois', 1209, '1209'],
          ['Mort de Saint Louis à Tunis', 1270, '1270'], ['Arrestation des Templiers', 1307, '1307'], ['La Grande Jacquerie, révolte des paysans', 1358, '1358'],
          ['Traité de Brétigny', 1360, '1360'], ['Charles VII reprend Paris', 1436, '1436'], ['Bataille de Formigny', 1450, '1450']]
      } },
      { k: 'qcm', niveaux: {
        facile: [
          ['Contre quel pays la France se bat-elle pendant la guerre de Cent Ans ?', 'L’Angleterre', ['L’Espagne', 'L’Italie', 'L’Allemagne']],
          ['Quelle ville Jeanne d’Arc a-t-elle délivrée en 1429 ?', 'Orléans', ['Marseille', 'Lyon', 'Bordeaux']],
          ['Dans quelle ville les rois de France étaient-ils sacrés ?', 'Reims', ['Paris', 'Lyon', 'Bordeaux']],
          ['Qui a été couronné empereur en l’an 800 ?', 'Charlemagne', ['Clovis', 'Saint Louis', 'Hugues Capet']],
          ['Quel roi des Francs a été baptisé à Reims ?', 'Clovis', ['Charlemagne', 'Saint Louis', 'Charles VII']],
          ['Comment appelle-t-on la période entre l’Antiquité et les Temps modernes ?', 'Le Moyen Âge', ['La Préhistoire', 'La Renaissance', 'L’Âge de pierre']],
          ['Combien de temps le Moyen Âge a-t-il duré, environ ?', 'Environ 1 000 ans', ['Environ 100 ans', 'Environ 50 ans', 'Environ 10 000 ans']],
          ['Quelle jeune fille a combattu les Anglais au XVe siècle ?', 'Jeanne d’Arc', ['Aliénor d’Aquitaine', 'Blanche de Castille', 'Marie-Antoinette']],
          ['Qui gouvernait le royaume de France au Moyen Âge ?', 'Le roi', ['Le président', 'Le maire', 'Le Premier ministre']],
          ['Quel roi très croyant a été déclaré saint ?', 'Saint Louis', ['Charlemagne', 'Clovis', 'Philippe le Bel']],
          ['Quelle cérémonie, dans une cathédrale, fait d’un prince un roi ?', 'Le sacre', ['Le baptême', 'Le mariage', 'L’adoubement']],
          ['Avec quelle arme les Anglais ont-ils gagné à Azincourt ?', 'L’arc', ['Le fusil', 'Le canon', 'La fronde']],
          ['En quelle année fait-on commencer le Moyen Âge ?', '476', ['800', '1000', '1492']],
          ['Quelle grande maladie a tué beaucoup d’Européens au XIVe siècle ?', 'La peste noire', ['La grippe', 'La varicelle', 'Le rhume']],
          ['Comment Jeanne d’Arc est-elle morte ?', 'Sur un bûcher, à Rouen', ['Au combat, à Orléans', 'De vieillesse, à Domrémy', 'Noyée dans la Loire']]],
        moyen: [
          ['Quel roi a gagné la bataille de Bouvines en 1214 ?', 'Philippe Auguste', ['Saint Louis', 'Philippe le Bel', 'Louis XI']],
          ['Qui est le premier roi de la dynastie des Capétiens ?', 'Hugues Capet', ['Pépin le Bref', 'Clovis', 'Louis VI']],
          ['Comment s’appelle la dynastie de Clovis ?', 'Les Mérovingiens', ['Les Carolingiens', 'Les Capétiens', 'Les Valois']],
          ['Comment s’appelle la dynastie de Charlemagne ?', 'Les Carolingiens', ['Les Mérovingiens', 'Les Capétiens', 'Les Bourbons']],
          ['Quelle était la ville préférée de Charlemagne ?', 'Aix-la-Chapelle', ['Paris', 'Reims', 'Rome']],
          ['Combien de temps a vraiment duré la guerre de Cent Ans ?', '116 ans', ['100 ans', '99 ans', '50 ans']],
          ['Quel roi Jeanne d’Arc a-t-elle fait sacrer à Reims ?', 'Charles VII', ['Charles VI', 'Louis XI', 'Philippe VI']],
          ['Dans quelle ville Jeanne d’Arc a-t-elle été brûlée en 1431 ?', 'Rouen', ['Orléans', 'Reims', 'Paris']],
          ['Dans quel village Jeanne d’Arc est-elle née ?', 'Domrémy', ['Vaucouleurs', 'Chinon', 'Orléans']],
          ['Où Jeanne d’Arc a-t-elle rencontré Charles VII ?', 'À Chinon', ['À Reims', 'À Rouen', 'À Paris']],
          ['Quel duc de Normandie a conquis l’Angleterre en 1066 ?', 'Guillaume le Conquérant', ['Richard Cœur de Lion', 'Rollon', 'Henri II']],
          ['Quelle bataille Charles Martel a-t-il gagnée en 732 ?', 'La bataille de Poitiers', ['La bataille de Bouvines', 'La bataille d’Hastings', 'La bataille d’Azincourt']],
          ['Quelle ville les Anglais ont-ils gardée en France à la fin de la guerre de Cent Ans ?', 'Calais', ['Bordeaux', 'Rouen', 'Cherbourg']],
          ['Quelle bataille de 1415 a été une grande défaite française ?', 'Azincourt', ['Bouvines', 'Castillon', 'Formigny']],
          ['Quel roi de France est mort pendant une croisade, à Tunis ?', 'Saint Louis', ['Philippe Auguste', 'Louis VII', 'Charles VII']],
          ['Quelle mère de Saint Louis a gouverné pendant son enfance ?', 'Blanche de Castille', ['Aliénor d’Aquitaine', 'Isabeau de Bavière', 'Anne de Bretagne']]],
        difficile: [
          ['Quel traité a partagé l’empire de Charlemagne entre ses petits-fils, en 843 ?', 'Le traité de Verdun', ['Le traité de Troyes', 'Le traité de Brétigny', 'Le traité de Paris']],
          ['Quel roi a fait arrêter les Templiers ?', 'Philippe le Bel', ['Philippe Auguste', 'Saint Louis', 'Louis XI']],
          ['Quel traité de 1420 faisait du roi d’Angleterre l’héritier du royaume de France ?', 'Le traité de Troyes', ['Le traité de Verdun', 'Le traité de Brétigny', 'Le traité d’Arras']],
          ['Qui a livré Jeanne d’Arc aux Anglais ?', 'Les Bourguignons', ['Les Armagnacs', 'Les Bretons', 'Les Écossais']],
          ['Où Jeanne d’Arc a-t-elle été capturée en 1430 ?', 'À Compiègne', ['À Orléans', 'À Reims', 'À Chinon']],
          ['Quel roi d’Angleterre a gagné la bataille d’Azincourt ?', 'Henri V', ['Édouard III', 'Richard II', 'Henri II']],
          ['Quel roi d’Angleterre a gagné la bataille de Crécy en 1346 ?', 'Édouard III', ['Henri V', 'Richard Cœur de Lion', 'Guillaume le Conquérant']],
          ['Quelle bataille de 1453 met fin à la guerre de Cent Ans ?', 'Castillon', ['Formigny', 'Azincourt', 'Crécy']],
          ['Quel roi de France a été fait prisonnier par les Anglais à Poitiers, en 1356 ?', 'Jean le Bon', ['Charles V', 'Philippe VI', 'Charles VI']],
          ['Quel roi était surnommé « l’universelle aragne », c’est-à-dire l’araignée ?', 'Louis XI', ['Charles VII', 'Philippe le Bel', 'Louis VII']],
          ['Quel roi, atteint de folie, régnait au moment d’Azincourt ?', 'Charles VI', ['Charles V', 'Charles VII', 'Jean le Bon']],
          ['Quel conseiller du roi Dagobert, orfèvre, est devenu un saint ?', 'Saint Éloi', ['Saint Remi', 'Saint Denis', 'Saint Martin']],
          ['Quel évêque a baptisé Clovis ?', 'Remi', ['Martin', 'Denis', 'Éloi']],
          ['Qui appelle-t-on les « rois fainéants » ?', 'Les derniers rois mérovingiens', ['Les premiers rois capétiens', 'Les derniers rois carolingiens', 'Les rois Valois']],
          ['Quelle reine a épousé le roi de France, puis le roi d’Angleterre ?', 'Aliénor d’Aquitaine', ['Blanche de Castille', 'Isabeau de Bavière', 'Anne de Bretagne']]],
        expert: [
          ['Quel abbé de Saint-Denis a conseillé les rois Louis VI et Louis VII ?', 'Suger', ['Pierre Cauchon', 'Bernard de Clairvaux', 'Remi']],
          ['Quel évêque a présidé le procès de Jeanne d’Arc ?', 'Pierre Cauchon', ['Suger', 'Remi', 'Bernard de Clairvaux']],
          ['Quelle famille de rois remplace les Capétiens directs en 1328 ?', 'Les Valois', ['Les Bourbons', 'Les Carolingiens', 'Les Plantagenêts']],
          ['Quel roi d’Angleterre réclamait la couronne de France en 1337 ?', 'Édouard III', ['Henri V', 'Richard II', 'Henri II']],
          ['Quelle révolte de paysans éclate en 1358 ?', 'La Grande Jacquerie', ['La Fronde', 'La révolte des Croquants', 'La révolte des Ciompi']],
          ['Quel traité de 1360 donne une grande partie de l’ouest de la France aux Anglais ?', 'Le traité de Brétigny', ['Le traité de Troyes', 'Le traité de Verdun', 'Le traité d’Arras']],
          ['Quel prévôt des marchands de Paris s’est révolté contre le dauphin en 1358 ?', 'Étienne Marcel', ['Jacques Cœur', 'Pierre Cauchon', 'Nicolas Flamel']],
          ['Quel riche marchand de Bourges a été l’argentier de Charles VII ?', 'Jacques Cœur', ['Étienne Marcel', 'Suger', 'Nicolas Flamel']],
          ['Comment s’appelaient les partisans de Charles VII, ennemis des Bourguignons ?', 'Les Armagnacs', ['Les Ligueurs', 'Les Frondeurs', 'Les Guelfes']],
          ['En quelle année Jeanne d’Arc a-t-elle été déclarée sainte ?', '1920', ['1456', '1789', '1870']],
          ['Quel est le dernier roi carolingien, mort en 987 ?', 'Louis V', ['Charles le Simple', 'Lothaire', 'Louis IV']],
          ['Quel roi a reçu le surnom de « Sage » ?', 'Charles V', ['Charles VI', 'Jean le Bon', 'Louis XI']],
          ['Quel texte de 1215 limite le pouvoir du roi d’Angleterre ?', 'La Grande Charte', ['Le traité de Troyes', 'La Bulle d’or', 'Les Capitulaires']],
          ['Quelle bataille de 1302 voit des milices flamandes battre la chevalerie française ?', 'Courtrai', ['Bouvines', 'Crécy', 'Formigny']],
          ['Quel roi d’Angleterre est le fils d’Aliénor d’Aquitaine et d’Henri II ?', 'Richard Cœur de Lion', ['Édouard III', 'Henri V', 'Guillaume le Conquérant']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Jeanne d’Arc disait entendre des voix.', true, ''], ['Charlemagne a été couronné empereur en l’an 800.', true, ''],
          ['Les rois de France étaient sacrés à Reims.', true, ''],
          ['La guerre de Cent Ans a duré exactement 100 ans.', false, 'Elle a duré 116 ans, de 1337 à 1453, avec de longues trêves.'],
          ['Jeanne d’Arc combattait les Espagnols.', false, 'Elle combattait les Anglais et leurs alliés bourguignons.'],
          ['Clovis a été le dernier roi de France.', false, 'Clovis a été l’un des premiers rois des Francs, vers l’an 500.']],
        moyen: [['Hugues Capet est devenu roi en 987.', true, ''], ['Jeanne d’Arc a fait sacrer Charles VII à Reims.', true, ''],
          ['Guillaume le Conquérant a conquis l’Angleterre en 1066.', true, ''], ['Saint Louis est mort pendant une croisade.', true, ''],
          ['À la fin de la guerre de Cent Ans, les Anglais ont gardé Bordeaux.', false, 'Ils ont perdu Bordeaux en 1453 ; ils n’ont gardé que Calais.'],
          ['Charlemagne était le petit-fils de Clovis.', false, 'Charlemagne est né plus de 200 ans après la mort de Clovis ; son père était Pépin le Bref.']],
        difficile: [['À Azincourt, les archers anglais ont battu la chevalerie française.', true, ''],
          ['Le traité de Verdun a partagé l’empire de Charlemagne en trois.', true, ''], ['Jeanne d’Arc a été capturée à Compiègne.', true, ''],
          ['Charles VI était surnommé le Sage.', false, 'Charles VI était surnommé le Fou ; le Sage, c’est son père, Charles V.'],
          ['Philippe le Bel a protégé les Templiers.', false, 'Il les a fait arrêter en 1307.']],
        expert: [['Jeanne d’Arc a été déclarée sainte en 1920.', true, ''], ['Aliénor d’Aquitaine a été reine de France, puis reine d’Angleterre.', true, ''],
          ['Philippe VI est le premier roi Valois.', true, ''],
          ['Louis XI a été fait prisonnier à Poitiers en 1356.', false, 'C’est Jean le Bon qui a été fait prisonnier à Poitiers.'],
          ['La Grande Jacquerie était une révolte de seigneurs.', false, 'C’était une révolte de paysans, en 1358.'],
          ['Le traité de Troyes a mis fin à la guerre de Cent Ans.', false, 'En 1420, il faisait du roi d’Angleterre l’héritier de la France ; la guerre a fini en 1453.']]
      } }
    ] },
    { id: 'm02', matiere: 'histoire', famille: 'mag', nom: 'Châteaux, chevaliers et paysans', court: 'Châteaux', icone: '🏰', series: [
      { k: 'paires', gauche: 'Partie du château', droite: 'Ce que c’est', consigneR: 'Relie chaque partie du château fort à ce qu’elle est.', q: 'Qu’est-ce que {a} ?', qi: 'Comment s’appelle : {b} ?', niveaux: {
        facile: [['le donjon', 'La plus haute tour, dernier refuge'], ['le pont-levis', 'Un pont qu’on relève'], ['les douves', 'Un fossé rempli d’eau'], ['les créneaux', 'Les découpes en haut des murs'],
          ['le rempart', 'Le grand mur qui entoure le château']],
        moyen: [['la herse', 'Une grille qui descend pour fermer la porte'], ['le chemin de ronde', 'Le passage en haut des remparts'], ['la meurtrière', 'Une fente étroite pour tirer à l’arc'],
          ['la basse-cour', 'La cour où vivent les gens et les animaux']],
        difficile: [['les mâchicoulis', 'Des trous au sol d’un balcon de pierre pour jeter des projectiles'], ['le hourd', 'Une galerie en bois en haut des murs'], ['la barbacane', 'Un ouvrage avancé qui protège l’entrée'],
          ['la courtine', 'Le mur entre deux tours'], ['la motte', 'La butte de terre des premiers châteaux']],
        expert: [['le merlon', 'La partie pleine entre deux créneaux'], ['l’échauguette', 'Une petite tour accrochée en haut d’un mur'], ['la poterne', 'Une petite porte discrète'],
          ['le châtelet', 'Le bâtiment fortifié qui garde l’entrée'], ['la bretèche', 'Un petit balcon fermé au-dessus d’une porte'], ['l’assommoir', 'Un trou dans la voûte de l’entrée pour frapper les assaillants']]
      } },
      { k: 'paires', gauche: 'Mot', droite: 'Ce qu’il veut dire', consigneR: 'Relie chaque mot de la chevalerie à son sens.', q: 'Que veut dire « {a} » ?', qi: 'Quel mot veut dire : {b} ?', niveaux: {
        facile: [['adoubement', 'La cérémonie pour devenir chevalier'], ['tournoi', 'Un combat pour s’entraîner et montrer sa force'], ['armure', 'Le costume de métal qui protège'], ['écu', 'Le bouclier du chevalier']],
        moyen: [['page', 'Un jeune garçon qui commence à servir un seigneur'], ['écuyer', 'Celui qui aide le chevalier et porte ses armes'], ['joute', 'Un duel à cheval, avec une lance'], ['destrier', 'Le cheval de combat']],
        difficile: [['cotte de mailles', 'Une chemise faite d’anneaux de fer'], ['heaume', 'Le casque qui couvre toute la tête'], ['blason', 'Les dessins et couleurs qui font reconnaître un chevalier'],
          ['ost', 'L’armée que le vassal doit au seigneur'], ['croisade', 'Une expédition militaire vers Jérusalem']],
        expert: [['palefroi', 'Le cheval de voyage'], ['colée', 'Le coup donné au futur chevalier pendant l’adoubement'], ['éperons', 'Des pointes aux talons pour diriger le cheval'],
          ['lice', 'Le terrain clos des tournois'], ['Templiers', 'Des moines-soldats'], ['courtoisie', 'Les belles manières du chevalier envers les dames']]
      } },
      { k: 'paires', gauche: 'Mot', droite: 'Ce qu’il veut dire', consigneR: 'Relie chaque mot de la seigneurie à son sens.', q: 'Que veut dire « {a} » ?', qi: 'Quel mot veut dire : {b} ?', niveaux: {
        facile: [['seigneur', 'Le maître du château et des terres'], ['serf', 'Un paysan qui n’est pas libre'], ['corvée', 'Le travail gratuit dû au seigneur'], ['paysan', 'Celui qui cultive la terre']],
        moyen: [['fief', 'La terre donnée à un vassal'], ['vassal', 'Celui qui jure fidélité à un seigneur'], ['dîme', 'L’impôt payé à l’Église'], ['moulin banal', 'Le moulin du seigneur, payant']],
        difficile: [['suzerain', 'Le seigneur à qui le vassal jure fidélité'], ['hommage', 'La cérémonie où le vassal jure fidélité'], ['taille', 'Un impôt payé au seigneur'],
          ['jachère', 'Une terre laissée au repos'], ['vilain', 'Un paysan libre']],
        expert: [['ban', 'Le pouvoir du seigneur de commander et de juger'], ['cens', 'La redevance payée pour une terre'], ['tenure', 'La terre confiée à un paysan'],
          ['réserve', 'Les terres que le seigneur garde pour lui'], ['assolement triennal', 'La rotation des cultures sur trois ans'], ['mainmorte', 'Le droit du seigneur sur l’héritage du serf']]
      } },
      { k: 'classer', niveaux: {
        facile: [{ q: 'Les trois ordres : ceux qui prient ou ceux qui combattent ?', colonnes: ['Ceux qui prient', 'Ceux qui combattent'],
          items: [['Un moine', 0], ['Un évêque', 0], ['Un curé', 0], ['Un abbé', 0], ['Un chevalier', 1], ['Un seigneur', 1], ['Un duc', 1], ['Un comte', 1]] }],
        moyen: [{ q: 'Les trois ordres : ceux qui combattent ou ceux qui travaillent ?', colonnes: ['Ceux qui combattent', 'Ceux qui travaillent'],
          items: [['Un écuyer', 0], ['Un baron', 0], ['Un marquis', 0], ['Un connétable', 0], ['Un paysan', 1], ['Un serf', 1], ['Un forgeron', 1], ['Un meunier', 1], ['Un artisan', 1]] }],
        difficile: [{ q: 'Les trois ordres : ceux qui prient ou ceux qui travaillent ?', colonnes: ['Ceux qui prient', 'Ceux qui travaillent'],
          items: [['Une abbesse', 0], ['Un chanoine', 0], ['Le pape', 0], ['Un prieur', 0], ['Un berger', 1], ['Un tisserand', 1], ['Un bûcheron', 1], ['Un charpentier', 1]] }],
        expert: [{ q: 'Qui reçoit ce paiement : le seigneur ou l’Église ?', colonnes: ['Le seigneur', 'L’Église'],
          items: [['La corvée', 0], ['La taille', 0], ['Les banalités', 0], ['Le cens', 0], ['La dîme', 1], ['Le denier de saint Pierre', 1], ['Les offrandes de la messe', 1]] }]
      } },
      { k: 'qcm', niveaux: {
        facile: [
          ['En quoi étaient construits les premiers châteaux forts, vers l’an 1000 ?', 'En bois', ['En béton', 'En verre', 'En plastique']],
          ['Qui habitait le château fort ?', 'Le seigneur et sa famille', ['Le pape', 'Les moines', 'Les marchands']],
          ['Quel animal accompagne toujours le chevalier ?', 'Le cheval', ['Le chien', 'L’âne', 'Le bœuf']],
          ['Que porte le chevalier pour se protéger au combat ?', 'Une armure', ['Une toge', 'Un tablier', 'Une cape de laine']],
          ['Quelle arme le chevalier tient-il pour charger à cheval ?', 'Une lance', ['Un fusil', 'Un boomerang', 'Un harpon']],
          ['Qui cultive la terre au Moyen Âge ?', 'Les paysans', ['Les chevaliers', 'Les seigneurs', 'Les évêques']],
          ['Comment s’appelle le fossé rempli d’eau autour du château ?', 'Les douves', ['Le donjon', 'Les créneaux', 'La herse']],
          ['Comment s’appelle la plus haute tour du château fort ?', 'Le donjon', ['Le pont-levis', 'La douve', 'Le moulin']],
          ['Comment s’appelle le combat d’entraînement entre chevaliers, devant un public ?', 'Un tournoi', ['Une croisade', 'Un siège', 'Un sacre']],
          ['Quel pont peut-on relever pour fermer le château ?', 'Le pont-levis', ['Le pont-neuf', 'Le pont suspendu', 'Le viaduc']],
          ['Quel outil les paysans utilisaient-ils pour couper le blé ?', 'La faucille', ['La pelle', 'Le marteau', 'La scie']],
          ['Que peignait-on sur le bouclier d’un chevalier pour le reconnaître ?', 'Ses armoiries', ['Son portrait', 'Une carte', 'Son âge']]],
        moyen: [
          ['Quelle machine lançait de grosses pierres contre les murs ?', 'Le trébuchet', ['Le bélier', 'La tour de siège', 'L’arbalète']],
          ['Comment appelle-t-on l’attaque d’un château qu’on encercle longtemps ?', 'Un siège', ['Un tournoi', 'Une croisade', 'Un adoubement']],
          ['Qui adoubait le futur chevalier ?', 'Un seigneur ou un chevalier', ['Le pape', 'Un paysan', 'Un marchand']],
          ['Dans quel ordre devient-on chevalier ?', 'Page, écuyer, chevalier', ['Écuyer, page, chevalier', 'Chevalier, page, écuyer', 'Page, chevalier, écuyer']],
          ['Quel impôt les paysans payaient-ils à l’Église ?', 'La dîme', ['La taille', 'La gabelle', 'Le cens']],
          ['Comment s’appelle le travail gratuit dû au seigneur ?', 'La corvée', ['La dîme', 'La taille', 'Le cens']],
          ['Comment s’appelle la terre donnée par un seigneur à son vassal ?', 'Un fief', ['Une dîme', 'Une corvée', 'Une jachère']],
          ['Comment appelait-on un paysan qui n’était pas libre ?', 'Un serf', ['Un vassal', 'Un écuyer', 'Un chevalier']],
          ['Quelle grosse poutre servait à enfoncer la porte d’un château ?', 'Le bélier', ['Le trébuchet', 'La herse', 'Le hourd']],
          ['Quelle grille de fer descend pour fermer l’entrée du château ?', 'La herse', ['Le pont-levis', 'Le créneau', 'La douve']],
          ['En quoi les châteaux forts sont-ils bâtis à partir des XIe et XIIe siècles ?', 'En pierre', ['En bois', 'En paille', 'En verre']],
          ['Que doit le vassal à son seigneur ?', 'Sa fidélité et son aide à la guerre', ['Rien du tout', 'La moitié de son château', 'Un cheval chaque année']],
          ['Quelle arme tire des carreaux ?', 'L’arbalète', ['L’arc', 'La fronde', 'Le trébuchet']]],
        difficile: [
          ['Quel château de Richard Cœur de Lion domine la Seine, aux Andelys ?', 'Château-Gaillard', ['Carcassonne', 'Chinon', 'Pierrefonds']],
          ['Quelle cité fortifiée, avec deux rangs de remparts, se trouve dans l’Aude ?', 'Carcassonne', ['Aigues-Mortes', 'Provins', 'Saint-Malo']],
          ['Quel chevalier breton est devenu connétable de France sous Charles V ?', 'Bertrand Du Guesclin', ['Bayard', 'Godefroy de Bouillon', 'Roland']],
          ['Où Roland, neveu de Charlemagne, est-il mort en 778 ?', 'À Roncevaux', ['À Poitiers', 'À Alésia', 'À Azincourt']],
          ['Comment s’appelle l’ordre de ceux qui prient ?', 'Le clergé', ['La noblesse', 'Le tiers état', 'La bourgeoisie']],
          ['Comment appelle-t-on la cérémonie où le vassal jure fidélité ?', 'L’hommage', ['L’adoubement', 'Le sacre', 'Le baptême']],
          ['Comment appelle-t-on une terre laissée au repos pendant un an ?', 'La jachère', ['Le fief', 'La tenure', 'La réserve']],
          ['Comment appelle-t-on les taxes pour utiliser le moulin, le four et le pressoir du seigneur ?', 'Les banalités', ['Les corvées', 'Les dîmes', 'Les tailles']],
          ['Quel casque couvre toute la tête du chevalier ?', 'Le heaume', ['La couronne', 'Le chaperon', 'Le képi']],
          ['Qu’est-ce qu’une cotte de mailles ?', 'Une chemise faite d’anneaux de fer', ['Un manteau de laine', 'Une armure de cuir', 'Un bouclier rond']],
          ['Comment s’appelle le terrain clos où se déroulent les tournois ?', 'La lice', ['Le donjon', 'La chapelle', 'Les douves']],
          ['Comment s’appelle l’assemblée des trois ordres réunie par le roi ?', 'Les états généraux', ['Le Sénat', 'Le conseil municipal', 'L’Assemblée nationale']]],
        expert: [
          ['Quel architecte a restauré Carcassonne et Pierrefonds au XIXe siècle ?', 'Viollet-le-Duc', ['Vauban', 'Haussmann', 'Gustave Eiffel']],
          ['Quel roi a fait construire le Louvre, d’abord une forteresse ?', 'Philippe Auguste', ['Saint Louis', 'Charlemagne', 'François Ier']],
          ['Quel ordre de chevaliers-moines Philippe le Bel a-t-il fait arrêter en 1307 ?', 'Les Templiers', ['Les Hospitaliers', 'Les Chevaliers teutoniques', 'Les Cisterciens']],
          ['Quel poème raconte la mort de Roland ?', 'La Chanson de Roland', ['Le Roman de Renart', 'Tristan et Iseut', 'Perceval']],
          ['Quel chevalier était surnommé « sans peur et sans reproche » ?', 'Bayard', ['Du Guesclin', 'Roland', 'Lancelot']],
          ['Quel écrivain du XIIe siècle a raconté les aventures de Lancelot et de Perceval ?', 'Chrétien de Troyes', ['Rabelais', 'François Villon', 'Rutebeuf']],
          ['Quelle part de la récolte la dîme représentait-elle, en principe ?', 'Un dixième', ['La moitié', 'Un quart', 'Toute la récolte']],
          ['Comment appelle-t-on la rotation des cultures sur trois ans ?', 'L’assolement triennal', ['La jachère', 'La transhumance', 'L’essartage']],
          ['Comment appelle-t-on le défrichement des forêts pour créer des champs ?', 'L’essartage', ['L’assolement', 'La transhumance', 'Le bocage']],
          ['Quel ordre religieux et militaire, né à Jérusalem, soignait les pèlerins ?', 'Les Hospitaliers', ['Les Templiers', 'Les Bénédictins', 'Les Franciscains']],
          ['Comment s’appelle la tour de bois roulante qu’on poussait contre les remparts ?', 'Le beffroi', ['Le mangonneau', 'Le bélier', 'La baliste']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Le donjon est la plus haute tour du château.', true, ''], ['Au Moyen Âge, les paysans étaient les plus nombreux.', true, ''],
          ['Le chevalier combattait à cheval.', true, ''],
          ['Les premiers châteaux forts étaient en béton.', false, 'Ils étaient en bois, puis on les a bâtis en pierre.'],
          ['Les serfs pouvaient quitter la terre du seigneur quand ils voulaient.', false, 'Le serf était attaché à la terre de son seigneur.']],
        moyen: [['Pour devenir chevalier, on était d’abord page, puis écuyer.', true, ''], ['Les paysans devaient des corvées au seigneur.', true, ''],
          ['Les tournois servaient à s’entraîner au combat.', true, ''],
          ['La herse est un pont que l’on relève.', false, 'La herse est une grille ; le pont qu’on relève, c’est le pont-levis.'],
          ['Le serf était un paysan libre.', false, 'Le serf n’était pas libre ; le paysan libre s’appelait le vilain.']],
        difficile: [['La dîme était un impôt payé à l’Église.', true, ''], ['Les mâchicoulis servaient à jeter des projectiles sur les assaillants.', true, ''],
          ['Les trois ordres sont ceux qui prient, ceux qui combattent et ceux qui travaillent.', true, ''],
          ['Le suzerain jure fidélité à son vassal.', false, 'C’est le vassal qui jure fidélité à son suzerain.'],
          ['Le heaume protégeait les jambes du chevalier.', false, 'Le heaume est le casque qui couvre toute la tête.']],
        expert: [['La colée est un coup donné au futur chevalier pendant l’adoubement.', true, ''], ['Les Templiers ont été arrêtés sur ordre de Philippe le Bel.', true, ''],
          ['L’assolement triennal fait tourner les cultures sur trois ans.', true, ''],
          ['Le palefroi était le cheval de combat du chevalier.', false, 'Le palefroi était le cheval de voyage ; le cheval de combat, c’est le destrier.'],
          ['Viollet-le-Duc a construit Carcassonne au Moyen Âge.', false, 'Il l’a restaurée au XIXe siècle.']]
      } }
    ] },
    { id: 'm07', matiere: 'histoire', famille: 'mag', nom: 'Églises, croisades et Vikings', court: 'Églises', icone: '⛪', series: [
      { k: 'classer', niveaux: {
        facile: [{ q: 'Range ces caractéristiques : art roman ou art gothique ?', colonnes: ['Roman', 'Gothique'],
          items: [['Des murs très épais', 0], ['De petites fenêtres', 0], ['Des arcs ronds', 0], ['Une église plutôt sombre', 0],
            ['De grands vitraux', 1], ['Des arcs en pointe', 1], ['Une église très haute et lumineuse', 1], ['Des arcs-boutants à l’extérieur', 1]] }],
        moyen: [{ q: 'Range ces églises célèbres : romanes ou gothiques ?', colonnes: ['Roman', 'Gothique'],
          items: [['Saint-Sernin de Toulouse', 0], ['L’abbatiale Sainte-Foy de Conques', 0], ['Notre-Dame-la-Grande de Poitiers', 0], ['L’abbatiale de Saint-Savin', 0],
            ['Notre-Dame de Paris', 1], ['La cathédrale de Chartres', 1], ['La cathédrale d’Amiens', 1], ['La Sainte-Chapelle', 1], ['La cathédrale de Reims', 1]] }],
        difficile: [{ q: 'Range ces abbayes et cathédrales : romanes ou gothiques ?', colonnes: ['Roman', 'Gothique'],
          items: [['L’abbaye de Fontenay', 0], ['Le cloître de Moissac', 0], ['Saint-Philibert de Tournus', 0], ['La basilique de Paray-le-Monial', 0],
            ['La cathédrale de Strasbourg', 1], ['La cathédrale de Beauvais', 1], ['La cathédrale de Bourges', 1], ['La cathédrale de Rouen', 1]] }],
        expert: [{ q: 'Range ces mots d’architecture : roman ou gothique ?', colonnes: ['Roman', 'Gothique'],
          items: [['La voûte en berceau', 0], ['La voûte d’arêtes', 0], ['L’arc en plein cintre', 0], ['Le style de Cluny', 0],
            ['La croisée d’ogives', 1], ['La rosace', 1], ['Le style flamboyant', 1], ['Le style rayonnant', 1]] }]
      } },
      { k: 'paires', gauche: 'Monument', droite: 'Où il se trouve', consigneR: 'Relie chaque monument du Moyen Âge à l’endroit où il se trouve.', q: 'Où se trouve {a} ?', ouverte: false, niveaux: {
        facile: [['Le Mont-Saint-Michel', 'En Normandie'], ['La cité de Carcassonne', 'En Occitanie'], ['Le palais des Papes', 'À Avignon'], ['La cathédrale Notre-Dame', 'À Paris']],
        moyen: [['La cathédrale du sacre des rois', 'À Reims'], ['La Sainte-Chapelle', 'Sur l’île de la Cité, à Paris'], ['Les remparts d’Aigues-Mortes', 'Dans le Gard'],
          ['La cité médiévale de Provins', 'En Seine-et-Marne']],
        difficile: [['L’abbaye de Cluny', 'En Bourgogne'], ['La basilique de Vézelay', 'Dans l’Yonne'], ['L’abbatiale de Conques', 'En Aveyron'],
          ['La cathédrale d’Albi, en brique', 'Dans le Tarn'], ['Le château de Chinon', 'En Indre-et-Loire']],
        expert: [['Le cloître de Moissac', 'Dans le Tarn-et-Garonne'], ['La basilique Saint-Sernin', 'À Toulouse'], ['Le donjon de Vincennes', 'Dans le Val-de-Marne'],
          ['Château-Gaillard', 'Aux Andelys, dans l’Eure'], ['L’abbaye de Fontenay', 'En Côte-d’Or'], ['La cathédrale de Beauvais', 'Dans l’Oise']]
      } },
      { k: 'paires', gauche: 'Mot', droite: 'Ce que c’est', consigneR: 'Relie chaque mot du monde viking à ce qu’il désigne.', q: 'Qu’est-ce que {a} ?', qi: 'Comment s’appelle : {b} ?', niveaux: {
        facile: [['le drakkar', 'Le bateau de guerre des Vikings'], ['la Scandinavie', 'La région d’où viennent les Vikings'], ['Odin', 'Le dieu principal des Vikings'],
          ['les Normands', 'Les Vikings installés en France']],
        moyen: [['Thor', 'Le dieu du tonnerre, avec son marteau'], ['les runes', 'L’alphabet des Vikings'], ['le Valhalla', 'Le palais des guerriers morts au combat'], ['une saga', 'Un long récit d’exploits']],
        difficile: [['un jarl', 'Un chef viking'], ['le thing', 'L’assemblée des hommes libres'], ['le knarr', 'Le bateau de commerce viking'],
          ['les Varègues', 'Les Vikings partis vers l’est'], ['le Vinland', 'La terre d’Amérique atteinte par les Vikings']],
        expert: [['les Valkyries', 'Les guerrières qui choisissent les morts au combat'], ['le Ragnarök', 'La fin du monde des dieux'], ['Yggdrasil', 'L’arbre géant qui relie les mondes'],
          ['Loki', 'Le dieu rusé qui joue des tours'], ['Frigg', 'L’épouse d’Odin'], ['le danegeld', 'La rançon payée aux Vikings']]
      } },
      { k: 'qcm', niveaux: {
        facile: [
          ['D’où venaient les Vikings ?', 'Du nord de l’Europe', ['D’Afrique', 'D’Amérique', 'D’Asie']],
          ['Comment s’appelle le bateau de guerre des Vikings ?', 'Le drakkar', ['La caravelle', 'La galère', 'Le paquebot']],
          ['Quelle région de France doit son nom aux « hommes du Nord » ?', 'La Normandie', ['La Bretagne', 'La Provence', 'L’Alsace']],
          ['Qui vit dans un monastère ?', 'Des moines', ['Des chevaliers', 'Des paysans', 'Des rois']],
          ['Comment s’appelle la grande église où se trouve l’évêque ?', 'La cathédrale', ['La chapelle', 'Le château', 'La mairie']],
          ['Que voit-on aux fenêtres des églises gothiques ?', 'Des vitraux colorés', ['Des volets en bois', 'Des rideaux', 'Des grilles de fer']],
          ['Quel monument de Normandie est bâti sur un rocher entouré par la mer ?', 'Le Mont-Saint-Michel', ['La cité de Carcassonne', 'Notre-Dame de Paris', 'Le palais des Papes']],
          ['Vers quelle ville partaient les croisés ?', 'Jérusalem', ['Rome', 'Paris', 'Londres']],
          ['Quel dieu viking porte un marteau ?', 'Thor', ['Odin', 'Zeus', 'Loki']],
          ['Qui est le chef de l’Église catholique ?', 'Le pape', ['Le roi', 'L’empereur', 'Le seigneur']],
          ['Qu’y a-t-il dans le clocher d’une église ?', 'Des cloches', ['Des vitraux', 'L’autel', 'Des tombeaux']],
          ['Comment les moines copiaient-ils les livres ?', 'À la main, avec une plume', ['Avec une imprimante', 'Avec un ordinateur', 'Avec une machine à écrire']],
          ['Comment s’appelle la tour où sont accrochées les cloches ?', 'Le clocher', ['Le donjon', 'La nef', 'Le cloître']],
          ['Quelle tête sculptait-on souvent à l’avant des bateaux vikings ?', 'Une tête de dragon', ['Une tête de lion', 'Une tête d’aigle', 'Une tête de cheval']]],
        moyen: [
          ['Quel chef viking a reçu la Normandie en 911 ?', 'Rollon', ['Erik le Rouge', 'Ragnar', 'Leif Erikson']],
          ['Comment s’appelle l’alphabet des Vikings ?', 'Les runes', ['Les hiéroglyphes', 'Les chiffres romains', 'L’alphabet cyrillique']],
          ['Quel est le dieu principal des Vikings ?', 'Odin', ['Thor', 'Loki', 'Zeus']],
          ['Quelle ville les Vikings ont-ils assiégée en 885 ?', 'Paris', ['Rome', 'Marseille', 'Lyon']],
          ['Comment appelle-t-on les livres décorés à la main par les moines ?', 'Des manuscrits enluminés', ['Des journaux', 'Des bandes dessinées', 'Des livres imprimés']],
          ['Comment s’appelle une expédition militaire vers Jérusalem ?', 'Une croisade', ['Un tournoi', 'Un siège', 'Une jacquerie']],
          ['Quel style d’église a des arcs ronds et des murs épais ?', 'Le style roman', ['Le style gothique', 'Le style baroque', 'Le style classique']],
          ['Quel style d’église a des arcs en pointe et de grands vitraux ?', 'Le style gothique', ['Le style roman', 'Le style baroque', 'Le style classique']],
          ['Vers quelle ville d’Espagne marchaient de nombreux pèlerins ?', 'Saint-Jacques-de-Compostelle', ['Madrid', 'Séville', 'Barcelone']],
          ['Dans quelle ville les papes ont-ils vécu au XIVe siècle ?', 'Avignon', ['Reims', 'Lyon', 'Paris']],
          ['Comment appelle-t-on les Vikings installés en Normandie ?', 'Les Normands', ['Les Bretons', 'Les Francs', 'Les Gaulois']],
          ['Que raconte la tapisserie de Bayeux ?', 'La conquête de l’Angleterre par Guillaume', ['La vie de Jeanne d’Arc', 'Les croisades', 'La vie de Charlemagne']],
          ['Quelle cathédrale de Paris a brûlé en 2019 ?', 'Notre-Dame de Paris', ['Le Sacré-Cœur', 'La Sainte-Chapelle', 'Saint-Sulpice']]],
        difficile: [
          ['Quel Viking a atteint l’Amérique vers l’an 1000 ?', 'Leif Erikson', ['Rollon', 'Ragnar', 'Harald à la Dent bleue']],
          ['Quel pape a appelé à la première croisade, en 1095 ?', 'Urbain II', ['Grégoire VII', 'Innocent III', 'Léon III']],
          ['Quel pape a couronné Charlemagne ?', 'Léon III', ['Urbain II', 'Grégoire Ier', 'Innocent III']],
          ['En quelle année les croisés prennent-ils Jérusalem ?', '1099', ['1066', '1187', '1291']],
          ['Quel sultan a repris Jérusalem aux croisés en 1187 ?', 'Saladin', ['Soliman', 'Mehmed II', 'Haroun al-Rachid']],
          ['Quelle grande abbaye de Bourgogne était à la tête de centaines de monastères ?', 'Cluny', ['Fontenay', 'Vézelay', 'Conques']],
          ['Qu’est-ce qui soutient de l’extérieur les murs des églises gothiques ?', 'Les arcs-boutants', ['Les créneaux', 'Les mâchicoulis', 'Les douves']],
          ['Quels moines vivaient très simplement, comme saint Bernard ?', 'Les cisterciens', ['Les templiers', 'Les jésuites', 'Les dominicains']],
          ['Quelle règle suivent les moines bénédictins ?', 'La règle de saint Benoît', ['La règle de saint Bernard', 'La règle de saint Louis', 'La règle de saint Martin']],
          ['Comment s’appelle le bateau de commerce des Vikings ?', 'Le knarr', ['Le drakkar', 'La caravelle', 'La galère']],
          ['Comment s’appelle le palais des guerriers vikings morts au combat ?', 'Le Valhalla', ['L’Olympe', 'Les Champs Élysées', 'Le Tartare']],
          ['Quelle ville d’Irlande a été fondée par les Vikings ?', 'Dublin', ['Londres', 'Édimbourg', 'Oslo']]],
        expert: [
          ['Quel monastère anglais, pillé en 793, marque le début de l’âge des Vikings ?', 'Lindisfarne', ['Canterbury', 'Iona', 'York']],
          ['Quel descendant de Rollon a conquis l’Angleterre en 1066 ?', 'Guillaume le Conquérant', ['Richard Cœur de Lion', 'Harold', 'Canut le Grand']],
          ['Quel roi viking a donné son surnom à la technologie sans fil Bluetooth ?', 'Harald à la Dent bleue', ['Erik le Rouge', 'Ragnar Lodbrok', 'Canut le Grand']],
          ['Quel Viking a fondé la première colonie du Groenland ?', 'Erik le Rouge', ['Leif Erikson', 'Rollon', 'Harald à la Dent bleue']],
          ['Quelle croisade a pris et pillé Constantinople en 1204 ?', 'La quatrième', ['La première', 'La deuxième', 'La septième']],
          ['Contre qui le pape a-t-il lancé une croisade dans le sud de la France en 1209 ?', 'Les cathares', ['Les protestants', 'Les Templiers', 'Les Normands']],
          ['Quel abbé a fait reconstruire la basilique de Saint-Denis, l’une des premières églises gothiques ?', 'Suger', ['Bernard de Clairvaux', 'Pierre Cauchon', 'Remi']],
          ['Comment s’appelle la grande fenêtre ronde des cathédrales gothiques ?', 'La rosace', ['L’ogive', 'Le tympan', 'Le chevet']],
          ['Comment s’appelle la sculpture en demi-cercle au-dessus du portail d’une église ?', 'Le tympan', ['La rosace', 'Le transept', 'La nef']],
          ['Comment s’appelle la partie de l’église qui forme les bras de la croix ?', 'Le transept', ['La nef', 'Le chœur', 'Le clocher']],
          ['Quelle dernière ville des croisés tombe en 1291 ?', 'Saint-Jean-d’Acre', ['Jérusalem', 'Antioche', 'Édesse']],
          ['Comment s’appelle la rançon payée aux Vikings par les rois anglais ?', 'Le danegeld', ['La dîme', 'La taille', 'Le cens']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Les casques des Vikings avaient des cornes.', false, 'C’est une invention du XIXe siècle : leurs casques n’avaient pas de cornes.'],
          ['Les Vikings étaient aussi des marchands et des paysans.', true, ''], ['Les églises gothiques ont de grands vitraux.', true, ''],
          ['Les moines vivent dans un monastère.', true, ''],
          ['Les églises romanes sont très hautes et très lumineuses.', false, 'Ce sont les églises gothiques ; les églises romanes ont des murs épais et de petites fenêtres.']],
        moyen: [['Les Vikings ont assiégé Paris.', true, 'En 845, puis en 885-886.'], ['Les croisés voulaient prendre Jérusalem.', true, ''],
          ['Les Vikings écrivaient avec des runes.', true, ''],
          ['Le Mont-Saint-Michel se trouve en Bretagne.', false, 'Il se trouve en Normandie, tout près de la Bretagne.'],
          ['Le palais des Papes se trouve à Rome.', false, 'Le célèbre palais des Papes est à Avignon, où les papes ont vécu au XIVe siècle.']],
        difficile: [['Les Vikings ont fondé la ville de Dublin.', true, ''], ['Leif Erikson a atteint l’Amérique avant Christophe Colomb.', true, ''],
          ['La première croisade est partie en 1096.', true, ''],
          ['Les arcs-boutants sont typiques de l’art roman.', false, 'Ils sont typiques de l’art gothique.'],
          ['Saladin a aidé les croisés à garder Jérusalem.', false, 'Saladin a repris Jérusalem aux croisés en 1187.']],
        expert: [['La tapisserie de Bayeux raconte la conquête de l’Angleterre par les Normands.', true, ''],
          ['La basilique de Saint-Denis est l’un des premiers monuments gothiques.', true, ''], ['Les Varègues sont des Vikings partis vers l’est.', true, ''],
          ['La tapisserie de Bayeux est une peinture.', false, 'C’est une broderie de laine sur une toile de lin.'],
          ['Les croisés ont gardé Jérusalem jusqu’à la fin du Moyen Âge.', false, 'Saladin l’a reprise en 1187.']]
      } }
    ] },
    // ---------- Renaissance (v7.8, BACKLOG ligne 295 : 6 jeux, hypothèse à valider) ----------
    { id: 'r01', matiere: 'histoire', famille: 'ren', nom: 'Artistes et œuvres', court: 'Artistes', icone: '🖼️', series: [
      { k: 'paires', gauche: 'Artiste', droite: 'Œuvre', consigneR: 'Relie chaque artiste à son œuvre.', q: 'Quelle œuvre a faite {a} ?', qi: 'Qui a fait : {b} ?', ouverte: false, niveaux: {
        facile: [['Léonard de Vinci', 'La Joconde'], ['Michel-Ange', 'Le plafond de la chapelle Sixtine'], ['Botticelli', 'La Naissance de Vénus']],
        moyen: [['Raphaël', 'L’École d’Athènes'], ['Michel-Ange', 'La statue de David, en marbre'], ['Léonard de Vinci', 'La Cène'], ['Albrecht Dürer', 'Le Jeune Lièvre']],
        difficile: [['Titien', 'La Vénus d’Urbin'], ['Jérôme Bosch', 'Le Jardin des délices'], ['Bruegel l’Ancien', 'La Tour de Babel'],
          ['Jan van Eyck', 'Les Époux Arnolfini'], ['Brunelleschi', 'La coupole de la cathédrale de Florence']],
        expert: [['Donatello', 'Le David en bronze'], ['Hans Holbein le Jeune', 'Les Ambassadeurs'], ['Mantegna', 'La Chambre des Époux, à Mantoue'],
          ['Piero della Francesca', 'La Flagellation du Christ'], ['Giorgione', 'La Tempête'], ['Jean Clouet', 'Le portrait de François Ier']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Dans quel pays la Renaissance a-t-elle commencé ?', 'En Italie', ['En Chine', 'Au Japon']]],
        moyen: [['Dans quel musée peut-on voir La Joconde ?', 'Au Louvre', ['Au musée d’Orsay', 'Au Prado', 'Au British Museum']],
          ['Quel roi de France a invité Léonard de Vinci ?', 'François Ier', ['Louis XIV', 'Henri IV', 'Charlemagne']]],
        difficile: [['Quelle famille de banquiers protégeait les artistes à Florence ?', 'Les Médicis', ['Les Borgia', 'Les Bourbons', 'Les Habsbourg', 'Les Valois']],
          ['Où se trouve la chapelle Sixtine ?', 'Au Vatican', ['À Florence', 'À Venise', 'À Milan', 'À Paris']]],
        expert: [['Dans quelle ville Léonard de Vinci est-il mort en 1519 ?', 'Amboise', ['Florence', 'Milan', 'Rome', 'Vinci', 'Paris']],
          ['Sur quoi La Joconde est-elle peinte ?', 'Sur un panneau de bois', ['Sur une toile', 'Sur un mur', 'Sur du papier', 'Sur du cuivre', 'Sur du verre']]]
      } }
    ] },
    { id: 'r02', matiere: 'histoire', famille: 'ren', nom: 'Grandes découvertes', court: 'Découvertes', icone: '🧭', series: [
      { k: 'paires', gauche: 'Explorateur', droite: 'Son voyage', consigneR: 'Relie chaque explorateur à son voyage.', q: 'Qu’a fait {a} ?', qi: 'Quel explorateur : {b} ?', ouverte: false, niveaux: {
        facile: [['Christophe Colomb', 'Arrive en Amérique en 1492'], ['Magellan', 'Lance le premier tour du monde'], ['Vasco de Gama', 'Ouvre la route des Indes par l’Afrique'],
          ['Jacques Cartier', 'Explore le Canada']],
        moyen: [['Amerigo Vespucci', 'A donné son nom à l’Amérique'], ['Bartolomeu Dias', 'Passe le cap de Bonne-Espérance'], ['Hernán Cortés', 'Conquiert l’empire aztèque'],
          ['Francisco Pizarro', 'Conquiert l’empire inca']],
        difficile: [['Pedro Álvares Cabral', 'Arrive au Brésil en 1500'], ['Juan Sebastián Elcano', 'Termine le tour du monde après la mort de Magellan'],
          ['Giovanni da Verrazzano', 'Explore la baie de New York pour François Ier'], ['Vasco Núñez de Balboa', 'Voit l’océan Pacifique depuis l’Amérique'],
          ['Jean Cabot', 'Atteint Terre-Neuve pour l’Angleterre']],
        expert: [['Henri le Navigateur', 'Prince portugais qui lance les explorations'], ['Francisco de Orellana', 'Descend l’Amazone'], ['Hernando de Soto', 'Atteint le Mississippi'],
          ['Juan Ponce de León', 'Aborde la Floride'], ['Diogo Cão', 'Atteint l’embouchure du fleuve Congo'], ['Pedro de Valdivia', 'Fonde Santiago du Chili']]
      } },
      { k: 'ordre', consigne: 'Range ces voyages du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Christophe Colomb arrive en Amérique', 1492, '1492'], ['Vasco de Gama arrive en Inde', 1498, '1498'], ['Fin du premier tour du monde', 1522, '1522']],
        moyen: [['Bartolomeu Dias passe le cap de Bonne-Espérance', 1488, '1488'], ['Cabral arrive au Brésil', 1500, '1500'], ['Cortés arrive au Mexique', 1519, '1519'],
          ['Jacques Cartier arrive au Canada', 1534, '1534']],
        difficile: [['Diogo Cão atteint le fleuve Congo', 1482, '1482'], ['Balboa voit l’océan Pacifique', 1513, '1513'], ['Cortés prend Tenochtitlan', 1521, '1521'],
          ['Pizarro capture l’empereur inca Atahualpa', 1532, '1532'], ['Jacques Cartier remonte le Saint-Laurent', 1535, '1535']],
        expert: [['Les Portugais prennent Ceuta', 1415, '1415'], ['Traité de Tordesillas', 1494, '1494'], ['Verrazzano entre dans la baie de New York', 1524, '1524'],
          ['Pizarro fonde Lima', 1535, '1535'], ['Orellana descend l’Amazone', 1542, '1542'], ['Fondation de Saint-Augustin, en Floride', 1565, '1565']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Quel bateau léger et rapide a servi aux grandes découvertes ?', 'La caravelle', ['Le drakkar', 'Le paquebot']]],
        moyen: [['Quel pays a payé le voyage de Christophe Colomb ?', 'L’Espagne', ['Le Portugal', 'La France', 'L’Angleterre']]],
        difficile: [['Quel traité de 1494 partage le monde entre l’Espagne et le Portugal ?', 'Le traité de Tordesillas', ['Le traité de Verdun', 'Le traité de Westphalie', 'Le traité de Paris', 'Le traité de Versailles']]],
        expert: [['Quel instrument mesurait la hauteur des astres pour se repérer en mer ?', 'L’astrolabe', ['Le télescope', 'Le baromètre', 'Le thermomètre', 'Le sablier', 'Le gouvernail']]]
      } }
    ] },
    { id: 'r04', matiere: 'histoire', famille: 'ren', nom: 'Châteaux de la Loire', court: 'Châteaux', icone: '🏯', series: [
      { k: 'paires', gauche: 'Château', droite: 'Ce qui le rend célèbre', consigneR: 'Relie chaque château à ce qui le rend célèbre.', q: 'Qu’est-ce qui rend {a} célèbre ?', qi: 'Quel château : {b} ?', ouverte: false, niveaux: {
        facile: [['Chambord', 'Le plus grand château de la Loire'], ['Chenonceau', 'Il est construit au-dessus du Cher'], ['Amboise', 'Léonard de Vinci y est enterré']],
        moyen: [['Blois', 'Son grand escalier à vis de François Ier'], ['Azay-le-Rideau', 'Il se reflète dans l’Indre'], ['le Clos Lucé', 'La dernière maison de Léonard de Vinci'],
          ['Villandry', 'Ses jardins et son grand potager']],
        difficile: [['Chaumont-sur-Loire', 'Donné à Diane de Poitiers en échange de Chenonceau'], ['Cheverny', 'Il a inspiré le Moulinsart de Tintin'],
          ['Ussé', 'Il aurait inspiré La Belle au bois dormant'], ['Langeais', 'Charles VIII y épouse Anne de Bretagne'], ['Chinon', 'Jeanne d’Arc y rencontre Charles VII']],
        expert: [['Chambord', 'Son escalier à double révolution'], ['Chenonceau', 'On l’appelle le château des Dames'], ['Blois', 'Le duc de Guise y est assassiné en 1588'],
          ['Amboise', 'Une conjuration protestante y échoue en 1560'], ['Loches', 'Ludovic Sforza y meurt prisonnier'], ['Saumur', 'Il est peint dans les Très Riches Heures du duc de Berry']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Quel fleuve passe près de ces châteaux ?', 'La Loire', ['La Seine', 'Le Rhône']]],
        moyen: [['Quel roi a fait construire Chambord ?', 'François Ier', ['Louis XIV', 'Henri IV', 'Charlemagne']]],
        difficile: [['Quel animal, emblème de François Ier, est sculpté à Chambord et à Blois ?', 'La salamandre', ['Le lion', 'L’aigle', 'Le porc-épic', 'Le dauphin']]],
        expert: [['Quelle favorite d’Henri II a reçu Chenonceau ?', 'Diane de Poitiers', ['Catherine de Médicis', 'Gabrielle d’Estrées', 'Marie Stuart', 'Anne de Bretagne', 'Marguerite de Valois']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Le château de Chambord a plus de 400 pièces.', true, '']],
        moyen: [['Léonard de Vinci a passé ses dernières années à Amboise.', true, '']],
        difficile: [['Le Val de Loire est inscrit au patrimoine mondial de l’Unesco.', true, '']],
        expert: [['Le château de Chenonceau enjambe la Loire.', false, 'Il enjambe le Cher, une rivière qui se jette dans la Loire.']]
      } }
    ] },
    { id: 'r05', matiere: 'histoire', famille: 'ren', nom: 'Rois de la Renaissance', court: 'Rois', icone: '👑', series: [
      { k: 'paires', gauche: 'Personnage', droite: 'Ce qui le rend célèbre', consigneR: 'Relie chaque roi ou reine à ce qui le rend célèbre.', q: 'Qu’est-ce qui rend {a} célèbre ?', qi: 'Qui est-ce : {b} ?', ouverte: false, niveaux: {
        facile: [['François Ier', 'Vainqueur à Marignan en 1515'], ['Henri IV', 'Signe l’édit de Nantes en 1598'], ['Catherine de Médicis', 'Reine venue de Florence']],
        moyen: [['Charles VIII', 'Lance les guerres d’Italie en 1494'], ['Henri II', 'Meurt blessé dans un tournoi en 1559'], ['Charles IX', 'Roi pendant le massacre de la Saint-Barthélemy'],
          ['Louis XII', 'Surnommé le Père du peuple']],
        difficile: [['François II', 'Époux de Marie Stuart'], ['Henri III', 'Dernier roi Valois, assassiné en 1589'], ['Anne de Bretagne', 'Deux fois reine de France'],
          ['Marguerite de Valois', 'La reine Margot, première épouse d’Henri IV'], ['Diane de Poitiers', 'Favorite d’Henri II']],
        expert: [['Claude de France', 'Épouse de François Ier ; une prune porte son nom'], ['Louise de Savoie', 'Mère de François Ier, régente du royaume'], ['Charles Quint', 'Empereur, grand rival de François Ier'],
          ['Henri VIII', 'Roi d’Angleterre reçu au camp du Drap d’or'], ['Gabrielle d’Estrées', 'Favorite d’Henri IV'], ['Ravaillac', 'Assassin d’Henri IV en 1610']]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le roi ou la reine.', niveaux: {
        facile: [{ r: 'François Ier', i: ['Je suis roi de France au XVIe siècle.', 'J’aime les arts et j’ai invité Léonard de Vinci en France.', 'J’ai fait construire le château de Chambord.', 'Mon emblème est une salamandre.', 'J’ai gagné la bataille de Marignan en 1515.'] },
          { r: 'Henri IV', i: ['Je suis né à Pau, en Béarn.', 'J’ai d’abord été roi de Navarre.', 'J’étais protestant, puis je suis devenu catholique.', 'On dit que je voulais la poule au pot chaque dimanche pour les paysans.', 'J’ai signé l’édit de Nantes en 1598.'] }],
        moyen: [{ r: 'Catherine de Médicis', i: ['Je suis née à Florence.', 'J’ai épousé le roi Henri II.', 'Trois de mes fils sont devenus rois de France.', 'J’ai fait construire le palais des Tuileries.', 'On m’accuse d’avoir voulu le massacre de la Saint-Barthélemy.'] }],
        difficile: [{ r: 'Henri II', i: ['Je suis le fils de François Ier.', 'J’ai épousé Catherine de Médicis.', 'Ma favorite s’appelait Diane de Poitiers.', 'Mon armée a repris Calais aux Anglais en 1558.', 'Je suis mort blessé à l’œil dans un tournoi en 1559.'] }],
        expert: [{ r: 'Anne de Bretagne', i: ['Je suis duchesse de Bretagne.', 'J’ai épousé Charles VIII à Langeais.', 'Après sa mort, j’ai épousé Louis XII.', 'J’ai été deux fois reine de France.', 'Ma fille Claude a épousé François Ier.'] }]
      } }
    ] },
    { id: 'r06', matiere: 'histoire', famille: 'ren', nom: 'Réforme et guerres de Religion', court: 'Réforme', icone: '✝️', series: [
      { k: 'ordre', consigne: 'Range ces événements du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Luther publie ses 95 thèses', 1517, '1517'], ['Massacre de la Saint-Barthélemy', 1572, '1572'], ['Édit de Nantes', 1598, '1598']],
        moyen: [['Affaire des Placards contre la messe', 1534, '1534'], ['Massacre de Wassy, début des guerres de Religion', 1562, '1562'], ['Mort de Calvin à Genève', 1564, '1564'],
          ['Henri IV devient catholique', 1593, '1593']],
        difficile: [['Le pape excommunie Luther', 1521, '1521'], ['Calvin s’installe pour de bon à Genève', 1541, '1541'], ['Début du concile de Trente', 1545, '1545'],
          ['Conjuration d’Amboise', 1560, '1560'], ['Assassinat du duc de Guise à Blois', 1588, '1588']],
        expert: [['Luther refuse de se rétracter à la diète de Worms', 1521, '1521'], ['Paix d’Augsbourg', 1555, '1555'], ['Colloque de Poissy', 1561, '1561'],
          ['Paix de Saint-Germain', 1570, '1570'], ['Naissance de la Sainte Ligue catholique', 1576, '1576'], ['Assassinat d’Henri III', 1589, '1589']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Comment appelle-t-on les chrétiens qui suivent Luther ou Calvin ?', 'Les protestants', ['Les catholiques', 'Les orthodoxes']]],
        moyen: [['Quel moine allemand a lancé la Réforme ?', 'Martin Luther', ['Érasme', 'Savonarole', 'Thomas More']]],
        difficile: [['Quel roi a signé l’édit de Nantes ?', 'Henri IV', ['Henri III', 'Charles IX', 'François Ier', 'Louis XIII']],
          ['Dans quelle ville Calvin a-t-il organisé l’Église protestante ?', 'Genève', ['Wittenberg', 'Rome', 'Lyon', 'Avignon']]],
        expert: [['Quel jour a commencé le massacre de la Saint-Barthélemy, en 1572 ?', 'Le 24 août', ['Le 14 juillet', 'Le 1er novembre', 'Le 25 décembre', 'Le 11 novembre', 'Le 15 août']],
          ['Quel mariage avait réuni les nobles protestants à Paris en août 1572 ?', 'Henri de Navarre et Marguerite de Valois', ['Henri II et Catherine de Médicis', 'François II et Marie Stuart',
            'Louis XII et Anne de Bretagne', 'François Ier et Claude de France', 'Charles VIII et Anne de Bretagne']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Les protestants et les catholiques sont tous des chrétiens.', true, '']],
        moyen: [['L’édit de Nantes autorise le culte protestant, avec des limites.', true, '']],
        difficile: [['Luther a traduit la Bible en allemand.', true, ''],
          ['L’édit de Nantes a été signé par Louis XIV.', false, 'Henri IV l’a signé en 1598 ; Louis XIV l’a révoqué en 1685.']],
        expert: [['L’imprimerie a aidé les idées de la Réforme à se répandre.', true, '']]
      } }
    ] },
    { id: 'r07', matiere: 'histoire', famille: 'ren', nom: 'Frise de la Renaissance', court: 'Frise', icone: '📏', series: [
      { k: 'ordre', consigne: 'Range ces événements de la Renaissance du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Gutenberg imprime sa Bible', 1455, 'vers 1455'], ['Christophe Colomb arrive en Amérique', 1492, '1492'], ['Bataille de Marignan', 1515, '1515'],
          ['Édit de Nantes', 1598, '1598']],
        moyen: [['Charles VIII part conquérir l’Italie', 1494, '1494'], ['Léonard de Vinci s’installe en France', 1516, '1516'], ['Luther publie ses 95 thèses', 1517, '1517'],
          ['Mort de Léonard de Vinci', 1519, '1519'], ['Jacques Cartier arrive au Canada', 1534, '1534']],
        difficile: [['Laurent de Médicis gouverne Florence', 1469, '1469'], ['Léonard de Vinci commence La Joconde', 1503, 'vers 1503'], ['Michel-Ange finit le plafond de la chapelle Sixtine', 1512, '1512'],
          ['Début de la construction de Chambord', 1519, '1519'], ['Ordonnance de Villers-Cotterêts : le français dans les actes officiels', 1539, '1539']],
        expert: [['Les Ottomans prennent Constantinople', 1453, '1453'], ['Copernic publie que la Terre tourne autour du Soleil', 1543, '1543'], ['Ronsard publie Les Amours', 1552, '1552'],
          ['Mort d’Henri II dans un tournoi', 1559, '1559'], ['Massacre de la Saint-Barthélemy', 1572, '1572'], ['Montaigne publie les Essais', 1580, '1580']]
      } }
    ] },
    // ---------- Temps modernes (v7.9, BACKLOG ligne 295 : 4 jeux, hypothèse à valider) ----------
    { id: 't01', matiere: 'histoire', famille: 'mod', nom: 'Louis XIV et Versailles', court: 'Louis XIV', icone: '☀️', series: [
      { k: 'paires', gauche: 'Personnage', droite: 'Son rôle', consigneR: 'Relie chaque personnage à son rôle.', q: 'Quel est le rôle de {a} ?', qi: 'Qui est-ce : {b} ?', ouverte: false, niveaux: {
        facile: [['Louis XIV', 'Le Roi-Soleil'], ['Colbert', 'Ministre des finances de Louis XIV'], ['André Le Nôtre', 'Dessine les jardins de Versailles']],
        moyen: [['Mazarin', 'Ministre pendant l’enfance de Louis XIV'], ['Richelieu', 'Ministre de Louis XIII'], ['Vauban', 'Construit des forteresses aux frontières'],
          ['Lully', 'Compose la musique de la cour']],
        difficile: [['Fouquet', 'Arrêté en 1661, après une fête à Vaux-le-Vicomte'], ['Louvois', 'Ministre de la Guerre de Louis XIV'], ['Charles Le Brun', 'Peint le plafond de la galerie des Glaces'],
          ['Jules Hardouin-Mansart', 'Architecte de la galerie des Glaces'], ['Anne d’Autriche', 'Mère de Louis XIV, régente du royaume']],
        expert: [['Marie-Thérèse d’Autriche', 'Épouse Louis XIV en 1660'], ['Madame de Montespan', 'Favorite, mère de sept enfants du roi'], ['Saint-Simon', 'Raconte la vie de la cour dans ses Mémoires'],
          ['Louis Le Vau', 'Premier architecte des agrandissements de Versailles'], ['Pierre-Paul Riquet', 'Fait creuser le canal du Midi'], ['Le Grand Dauphin', 'Fils de Louis XIV, mort avant lui']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Quel surnom donne-t-on à Louis XIV ?', 'Le Roi-Soleil', ['Le Bien-Aimé', 'Le Bon Roi']],
          ['Dans quel château Louis XIV installe-t-il sa cour ?', 'Versailles', ['Chambord', 'Chenonceau']]],
        moyen: [['Combien de temps a duré le règne de Louis XIV ?', '72 ans', ['12 ans', '40 ans', '100 ans']],
          ['Quelle salle de Versailles est couverte de miroirs ?', 'La galerie des Glaces', ['La salle du Trône', 'La chapelle royale', 'L’Orangerie']]],
        difficile: [['Qui a dessiné les jardins de Versailles ?', 'André Le Nôtre', ['Louis Le Vau', 'Jules Hardouin-Mansart', 'Charles Le Brun', 'Vauban']],
          ['Quel ministre gouverne pendant l’enfance de Louis XIV ?', 'Mazarin', ['Richelieu', 'Colbert', 'Fouquet', 'Sully']]],
        expert: [['En quelle année la cour s’installe-t-elle à Versailles ?', '1682', ['1643', '1661', '1685', '1700', '1715']],
          ['Quelle révolte des nobles et du parlement de Paris a marqué l’enfance de Louis XIV ?', 'La Fronde', ['La Jacquerie', 'La Ligue', 'Les camisards', 'La conjuration d’Amboise', 'La guerre des Paysans']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Louis XIV est devenu roi à 4 ans.', true, '']],
        moyen: [['La galerie des Glaces se trouve au Louvre.', false, 'Elle se trouve au château de Versailles.']],
        difficile: [['Louis XIV a révoqué l’édit de Nantes en 1685.', true, '']],
        expert: [['Louis XV était le fils de Louis XIV.', false, 'Louis XV était son arrière-petit-fils.']]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le personnage.', niveaux: {
        facile: [{ r: 'Louis XIV', i: ['Je suis roi de France au XVIIe siècle.', 'Je suis devenu roi à 4 ans.', 'J’ai installé ma cour à Versailles.', 'J’ai régné 72 ans, plus que tous les autres rois de France.', 'On m’appelle le Roi-Soleil.'] }],
        moyen: [{ r: 'Colbert', i: ['Je suis un ministre de Louis XIV.', 'Je suis né à Reims, fils d’un marchand de draps.', 'J’ai développé les manufactures, comme celle des Gobelins.', 'J’ai fait construire une grande marine royale.', 'Je m’occupais des finances du royaume après l’arrestation de Fouquet.'] }],
        difficile: [{ r: 'André Le Nôtre', i: ['Je travaille pour Louis XIV.', 'Mon père était déjà jardinier aux Tuileries.', 'J’ai dessiné les jardins de Vaux-le-Vicomte.', 'J’ai fait creuser le Grand Canal de Versailles.', 'On m’appelle le père du jardin à la française.'] }],
        expert: [{ r: 'Madame de Maintenon', i: ['Je suis née dans la prison de Niort.', 'Mon grand-père était le poète Agrippa d’Aubigné.', 'J’ai d’abord épousé le poète Scarron.', 'J’ai élevé les enfants du roi et de Madame de Montespan.', 'J’ai épousé Louis XIV en secret.'] }]
      } }
    ] },
    { id: 't04', matiere: 'histoire', famille: 'mod', nom: 'Écrivains classiques', court: 'Écrivains', icone: '🎭', series: [
      { k: 'paires', gauche: 'Auteur', droite: 'Œuvre', consigneR: 'Relie chaque auteur à son œuvre.', q: 'Quelle œuvre a écrite {a} ?', qi: 'Qui a écrit : {b} ?', ouverte: false, niveaux: {
        facile: [['Molière', 'Le Malade imaginaire'], ['Jean de La Fontaine', 'Le Corbeau et le Renard'], ['Charles Perrault', 'Le Petit Chaperon rouge']],
        moyen: [['Pierre Corneille', 'Le Cid'], ['Jean Racine', 'Phèdre'], ['Molière', 'Le Bourgeois gentilhomme'], ['Charles Perrault', 'Le Chat botté']],
        difficile: [['Madame de La Fayette', 'La Princesse de Clèves'], ['Boileau', 'L’Art poétique'], ['Madame de Sévigné', 'Les Lettres à sa fille'],
          ['Blaise Pascal', 'Les Pensées'], ['René Descartes', 'Le Discours de la méthode']],
        expert: [['La Bruyère', 'Les Caractères'], ['Fénelon', 'Les Aventures de Télémaque'], ['Bossuet', 'Les Oraisons funèbres'],
          ['La Rochefoucauld', 'Les Maximes'], ['Scarron', 'Le Roman comique'], ['Cyrano de Bergerac', 'Les États et Empires de la Lune']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Qui a écrit Le Corbeau et le Renard ?', 'Jean de La Fontaine', ['Molière', 'Victor Hugo']]],
        moyen: [['Quel était le vrai nom de Molière ?', 'Jean-Baptiste Poquelin', ['François-Marie Arouet', 'Jean Racine', 'Charles Perrault']]],
        difficile: [['Quelle académie, créée par Richelieu en 1635, veille sur la langue française ?', 'L’Académie française', ['L’Académie des sciences', 'La Sorbonne', 'Le Collège de France', 'L’Académie Goncourt']]],
        expert: [['Quelle règle du théâtre classique demande une seule action, en un seul lieu, en une seule journée ?', 'La règle des trois unités', ['La règle de trois', 'La bienséance', 'La vraisemblance', 'L’alexandrin', 'La catharsis']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Dans les Fables de La Fontaine, les personnages sont souvent des animaux.', true, '']],
        moyen: [['Charles Perrault a écrit La Belle au bois dormant.', true, '']],
        difficile: [['Molière est mort sur scène.', false, 'Il a eu un malaise sur scène en jouant Le Malade imaginaire, puis il est mort chez lui quelques heures après.']],
        expert: [['Le Cid de Corneille a déclenché une grande querelle en 1637.', true, '']]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve l’écrivain.', niveaux: {
        facile: [{ r: 'Molière', i: ['Je suis un auteur de théâtre du XVIIe siècle.', 'Je suis aussi comédien et chef de troupe.', 'J’aime faire rire en me moquant des défauts des gens.', 'J’ai écrit L’Avare et Le Bourgeois gentilhomme.', 'Mon vrai nom est Jean-Baptiste Poquelin.'] }],
        moyen: [{ r: 'Jean de La Fontaine', i: ['Je suis né à Château-Thierry.', 'Fouquet m’a protégé avant son arrestation.', 'Je m’inspire souvent du Grec Ésope.', 'Mes personnages sont souvent des animaux.', 'J’ai écrit La Cigale et la Fourmi.'] }],
        difficile: [{ r: 'Jean Racine', i: ['Je suis né à La Ferté-Milon.', 'J’ai été élevé par les religieux de Port-Royal.', 'J’écris des tragédies en alexandrins.', 'Je suis devenu historiographe de Louis XIV.', 'J’ai écrit Andromaque et Phèdre.'] }],
        expert: [{ r: 'Madame de Sévigné', i: ['Je suis une marquise du XVIIe siècle.', 'Je suis née à Paris, place Royale, aujourd’hui place des Vosges.', 'Ma fille est partie vivre en Provence.', 'Je lui ai écrit des centaines de lettres.', 'Mes lettres racontent la vie de la cour de Louis XIV.'] }]
      } }
    ] },
    { id: 't05', matiere: 'histoire', famille: 'mod', nom: 'Les Lumières', court: 'Lumières', icone: '💡', series: [
      { k: 'paires', gauche: 'Personnage', droite: 'Ce qui le rend célèbre', consigneR: 'Relie chaque personnage à ce qui le rend célèbre.', q: 'Qu’est-ce qui rend {a} célèbre ?', qi: 'Qui est-ce : {b} ?', ouverte: false, niveaux: {
        facile: [['Voltaire', 'Écrit Candide'], ['Jean-Jacques Rousseau', 'Écrit Du contrat social'], ['Diderot', 'Dirige l’Encyclopédie']],
        moyen: [['Montesquieu', 'Veut séparer les trois pouvoirs'], ['D’Alembert', 'Dirige l’Encyclopédie avec Diderot'], ['Beaumarchais', 'Écrit Le Mariage de Figaro'],
          ['Buffon', 'Écrit une grande Histoire naturelle']],
        difficile: [['Condorcet', 'Défend l’école pour tous, filles comprises'], ['Émilie du Châtelet', 'Traduit Newton en français'], ['Marivaux', 'Écrit Le Jeu de l’amour et du hasard'],
          ['Lavoisier', 'Fonde la chimie moderne'], ['Kant', 'Écrit : « Ose savoir ! »']],
        expert: [['Madame Geoffrin', 'Reçoit les philosophes dans son salon'], ['Jean Calas', 'Protestant condamné à tort, défendu par Voltaire'], ['Frédéric II de Prusse', 'Roi qui accueille Voltaire à sa cour'],
          ['Catherine II de Russie', 'Impératrice qui achète la bibliothèque de Diderot'], ['Malesherbes', 'Protège l’Encyclopédie de la censure'], ['L’abbé Prévost', 'Écrit Manon Lescaut']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Avec quoi les philosophes des Lumières veulent-ils éclairer les gens ?', 'La raison', ['La magie', 'La force']]],
        moyen: [['Quel grand ouvrage, dirigé par Diderot, rassemble les connaissances de son temps ?', 'L’Encyclopédie', ['Le Dictionnaire de l’Académie', 'Les Fables', 'Les Essais']]],
        difficile: [['Quel était le vrai nom de Voltaire ?', 'François-Marie Arouet', ['Jean-Baptiste Poquelin', 'Charles de Secondat', 'Denis Diderot', 'Jean de La Fontaine']]],
        expert: [['Où les philosophes se retrouvaient-ils pour discuter, chez de riches hôtesses ?', 'Dans les salons', ['Dans les monastères', 'À la cour de Versailles', 'Dans les universités', 'Dans les tribunaux', 'Aux états généraux']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Les philosophes des Lumières critiquent l’injustice.', true, '']],
        moyen: [['Voltaire a été enfermé à la Bastille.', true, '']],
        difficile: [['Jean-Jacques Rousseau est né à Genève.', true, '']],
        expert: [['L’Encyclopédie a été publiée en un seul volume.', false, 'Elle compte 17 volumes de texte et 11 volumes de planches, publiés de 1751 à 1772.']]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le philosophe.', niveaux: {
        facile: [{ r: 'Voltaire', i: ['Je suis un philosophe des Lumières.', 'J’ai été enfermé deux fois à la Bastille.', 'J’ai vécu longtemps à Ferney, près de la Suisse.', 'J’ai défendu Jean Calas, condamné à tort.', 'J’ai écrit Candide.'] }],
        moyen: [{ r: 'Jean-Jacques Rousseau', i: ['Je suis né à Genève en 1712.', 'J’ai écrit sur l’éducation des enfants dans Émile.', 'J’aime la nature et les longues promenades.', 'Je pense que l’homme naît bon.', 'J’ai écrit Du contrat social.'] }],
        difficile: [{ r: 'Montesquieu', i: ['Je suis né au château de La Brède, près de Bordeaux.', 'J’ai été magistrat au parlement de Bordeaux.', 'J’ai fait parler deux Persans qui découvrent la France.', 'Pour moi, le pouvoir doit arrêter le pouvoir.', 'J’ai écrit De l’esprit des lois.'] }],
        expert: [{ r: 'Diderot', i: ['Je suis né à Langres.', 'Mon père était coutelier.', 'J’ai été enfermé au donjon de Vincennes en 1749.', 'Catherine II de Russie a acheté ma bibliothèque.', 'J’ai dirigé l’Encyclopédie avec d’Alembert.'] }]
      } }
    ] },
    { id: 't09', matiere: 'histoire', famille: 'mod', nom: 'Frise des Temps modernes', court: 'Frise', icone: '📏', series: [
      { k: 'ordre', consigne: 'Range ces événements des Temps modernes du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Assassinat d’Henri IV', 1610, '1610'], ['Louis XIV devient roi', 1643, '1643'], ['Mort de Louis XIV', 1715, '1715'], ['Prise de la Bastille', 1789, '1789']],
        moyen: [['Richelieu crée l’Académie française', 1635, '1635'], ['La cour s’installe à Versailles', 1682, '1682'], ['Révocation de l’édit de Nantes', 1685, '1685'],
          ['Louis XVI devient roi', 1774, '1774'], ['Premier vol en montgolfière avec des passagers', 1783, '1783']],
        difficile: [['Champlain fonde Québec', 1608, '1608'], ['Début de la Fronde', 1648, '1648'], ['Mort de Mazarin : Louis XIV gouverne seul', 1661, '1661'],
          ['Mort de Molière', 1673, '1673'], ['Premier volume de l’Encyclopédie', 1751, '1751']],
        expert: [['Corneille fait jouer Le Cid', 1637, '1637'], ['Traité des Pyrénées', 1659, '1659'], ['Newton publie sa loi de la gravitation', 1687, '1687'],
          ['Début de la guerre de Sept Ans', 1756, '1756'], ['Traité de Paris : la France perd le Canada', 1763, '1763'], ['Déclaration d’indépendance des États-Unis', 1776, '1776']]
      } }
    ] },
    // ---------- Révolution et XIXe siècle (v7.10, BACKLOG ligne 295 : 9 jeux, hypothèse à valider) ----------
    { id: 'x01', matiere: 'histoire', famille: 'xix', nom: 'La Révolution française', court: 'Révolution', icone: '🏰', series: [
      { k: 'ordre', consigne: 'Range ces événements de la Révolution du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Prise de la Bastille', 1789, '1789'], ['Proclamation de la République', 1792, '1792'], ['Exécution de Louis XVI', 1793, '1793'],
          ['Bonaparte prend le pouvoir', 1799, '1799']],
        moyen: [['Le roi en fuite est arrêté à Varennes', 1791, '1791'], ['Exécution de Marie-Antoinette', 1793, '1793'], ['Chute de Robespierre', 1794, '1794'],
          ['Début du Directoire', 1795, '1795'], ['Bonaparte part en Égypte', 1798, '1798']],
        difficile: [['Serment du Jeu de paume', 1789, '1789'], ['Fête de la Fédération', 1790, '1790'], ['Victoire de Valmy', 1792, '1792'],
          ['Loi des suspects : début de la Terreur', 1793, '1793'], ['Coup d’État du 18 Brumaire', 1799, '1799']],
        expert: [['Abolition des privilèges, la nuit du 4 août', 1789, '1789'], ['Constitution civile du clergé', 1790, '1790'], ['Première Constitution écrite de la France', 1791, '1791'],
          ['La France déclare la guerre à l’Autriche', 1792, '1792'], ['Première abolition de l’esclavage', 1794, '1794'], ['Loi qui crée le mètre et le gramme', 1795, '1795']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Quelle prison le peuple de Paris prend-il le 14 juillet 1789 ?', 'La Bastille', ['Le Louvre', 'Versailles']],
          ['Quel roi est exécuté en 1793 ?', 'Louis XVI', ['Louis XIV', 'Henri IV']]],
        moyen: [['Où le roi est-il arrêté pendant sa fuite, en 1791 ?', 'À Varennes', ['À Versailles', 'À Reims', 'À Marseille']],
          ['Quel texte de 1789 dit que les hommes naissent libres et égaux en droits ?', 'La Déclaration des droits de l’homme', ['Le Code civil', 'L’édit de Nantes', 'La Marseillaise']]],
        difficile: [['Comment appelle-t-on la période de 1793-1794 où beaucoup d’opposants sont guillotinés ?', 'La Terreur', ['La Fronde', 'La Restauration', 'Le Directoire', 'La Commune']],
          ['Quel révolutionnaire est surnommé « l’Incorruptible » ?', 'Robespierre', ['Danton', 'Marat', 'Mirabeau', 'La Fayette']]],
        expert: [['Quels sont les trois ordres réunis aux états généraux de 1789 ?', 'Clergé, noblesse, tiers état', ['Roi, reine, peuple', 'Paysans, ouvriers, bourgeois', 'Députés, sénateurs, ministres', 'Nobles, chevaliers, moines', 'Paris, provinces, colonies']],
          ['Qui a écrit la Déclaration des droits de la femme et de la citoyenne, en 1791 ?', 'Olympe de Gouges', ['Madame Roland', 'Charlotte Corday', 'Marie-Antoinette', 'Madame de Staël', 'Théroigne de Méricourt']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Le 14 juillet 1789, le peuple de Paris prend la Bastille.', true, '']],
        moyen: [['Marie-Antoinette était la femme de Louis XVI.', true, '']],
        difficile: [['La République a été proclamée en 1789.', false, 'Elle a été proclamée en septembre 1792.']],
        expert: [['Pendant la Révolution, la France adopte le mètre pour mesurer les longueurs.', true, '']]
      } }
    ] },
    { id: 'x02', matiere: 'histoire', famille: 'xix', nom: 'Symboles de la République', court: 'Symboles', icone: '🇫🇷', series: [
      { k: 'paires', gauche: 'Symbole ou lieu', droite: 'Ce que c’est', consigneR: 'Relie chaque symbole ou lieu à ce qu’il est.', q: 'Qu’est-ce que {a} ?', qi: 'Qu’est-ce qui est : {b} ?', ouverte: false, niveaux: {
        facile: [['Marianne', 'Une femme qui représente la République'], ['Le drapeau', 'Bleu, blanc, rouge'], ['La Marseillaise', 'L’hymne national']],
        moyen: [['La devise', 'Liberté, Égalité, Fraternité'], ['Le 14 juillet', 'La fête nationale'], ['Le bonnet phrygien', 'Le bonnet rouge de Marianne'],
          ['Le coq', 'Un animal qui représente souvent la France']],
        difficile: [['L’Élysée', 'Le palais du président de la République'], ['Le palais Bourbon', 'Là où siège l’Assemblée nationale'], ['Le palais du Luxembourg', 'Là où siège le Sénat'],
          ['Matignon', 'L’hôtel du Premier ministre'], ['Le Panthéon', 'Là où reposent de grands personnages']],
        expert: [['Le faisceau de licteur', 'Symbole de l’autorité, venu de la Rome antique'], ['La Semeuse', 'Femme qui sème, sur des pièces et des timbres'], ['Le sceau de la République', 'Montre la Liberté assise'],
          ['Rouget de Lisle', 'Compose La Marseillaise en 1792'], ['L’article 2 de la Constitution', 'Cite le drapeau, l’hymne et la devise'], ['La loi du 6 juillet 1880', 'Fait du 14 juillet la fête nationale']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Quelles sont les couleurs du drapeau français ?', 'Bleu, blanc, rouge', ['Bleu, blanc, vert', 'Rouge, jaune, noir']]],
        moyen: [['Qui a composé La Marseillaise ?', 'Rouget de Lisle', ['Victor Hugo', 'Napoléon', 'Louis XVI']]],
        difficile: [['Dans quelle ville La Marseillaise a-t-elle été composée, en 1792 ?', 'Strasbourg', ['Marseille', 'Paris', 'Lyon', 'Bordeaux']]],
        expert: [['Depuis quelle année le 14 juillet est-il la fête nationale ?', '1880', ['1789', '1792', '1848', '1871', '1945']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['La devise de la République est « Liberté, Égalité, Fraternité ».', true, '']],
        moyen: [['La Marseillaise a été écrite à Marseille.', false, 'Elle a été écrite à Strasbourg en 1792 ; des soldats venus de Marseille l’ont chantée en arrivant à Paris.']],
        difficile: [['La fête du 14 juillet rappelle aussi la fête de la Fédération de 1790.', true, '']],
        expert: [['Le drapeau tricolore est cité dans la Constitution de 1958.', true, '']]
      } }
    ] },
    { id: 'x03', matiere: 'histoire', famille: 'xix', nom: 'Napoléon', court: 'Napoléon', icone: '🎖️', series: [
      { k: 'ordre', consigne: 'Range ces événements de la vie de Napoléon du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Naissance de Napoléon en Corse', 1769, '1769'], ['Napoléon est sacré empereur', 1804, '1804'], ['Bataille d’Austerlitz', 1805, '1805'],
          ['Bataille de Waterloo', 1815, '1815']],
        moyen: [['Bonaparte devient Premier consul', 1799, '1799'], ['Le Code civil est publié', 1804, '1804'], ['Campagne de Russie', 1812, '1812'],
          ['Premier exil, sur l’île d’Elbe', 1814, '1814'], ['Mort à Sainte-Hélène', 1821, '1821']],
        difficile: [['Bonaparte reprend Toulon aux Anglais', 1793, '1793'], ['Victoire d’Arcole, en Italie', 1796, '1796'], ['Expédition d’Égypte', 1798, '1798'],
          ['Création de la Légion d’honneur', 1802, '1802'], ['Mariage avec Marie-Louise d’Autriche', 1810, '1810']],
        expert: [['Bonaparte sort de l’École militaire de Paris', 1785, '1785'], ['Victoire de Marengo', 1800, '1800'], ['Concordat avec le pape', 1801, '1801'],
          ['Victoire d’Iéna', 1806, '1806'], ['Défaite de Leipzig', 1813, '1813'], ['Ses cendres sont ramenées aux Invalides', 1840, '1840']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Sur quelle île Napoléon est-il né ?', 'La Corse', ['La Sicile', 'La Réunion']]],
        moyen: [['Quelle bataille Napoléon a-t-il perdue en 1815 ?', 'Waterloo', ['Austerlitz', 'Iéna', 'Wagram']]],
        difficile: [['Quel recueil de lois, voulu par Napoléon, est publié en 1804 ?', 'Le Code civil', ['La Déclaration des droits de l’homme', 'Le Concordat', 'La Constitution de 1958', 'L’Encyclopédie']]],
        expert: [['Quelle décoration Napoléon crée-t-il en 1802 ?', 'La Légion d’honneur', ['La croix de guerre', 'L’ordre du Saint-Esprit', 'La médaille militaire', 'L’ordre national du Mérite', 'La croix de Saint-Louis']]]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le personnage.', niveaux: {
        facile: [{ r: 'Napoléon Bonaparte', i: ['Je suis né en Corse en 1769.', 'Je suis un général de la Révolution.', 'Je me suis fait sacrer empereur en 1804.', 'J’ai gagné la bataille d’Austerlitz.', 'J’ai perdu à Waterloo et je suis mort à Sainte-Hélène.'] }],
        moyen: [{ r: 'Joséphine de Beauharnais', i: ['Je suis née en Martinique.', 'Mon premier mari a été guillotiné pendant la Terreur.', 'J’ai épousé Bonaparte en 1796.', 'J’ai été sacrée impératrice en 1804.', 'Napoléon a divorcé de moi car nous n’avions pas d’enfant ensemble.'] }],
        difficile: [{ r: 'Le roi de Rome', i: ['Je suis né en 1811, au palais des Tuileries.', 'Ma mère est Marie-Louise d’Autriche.', 'J’ai reçu mon titre de roi dès ma naissance.', 'J’ai grandi à Vienne, chez mon grand-père l’empereur d’Autriche.', 'Je suis le fils de Napoléon.'] }],
        expert: [{ r: 'Le maréchal Ney', i: ['Je suis né à Sarrelouis en 1769.', 'Mon père était tonnelier.', 'Napoléon m’a fait maréchal d’Empire en 1804.', 'On m’a appelé « le brave des braves » pendant la retraite de Russie.', 'J’ai été fusillé à Paris en 1815.'] }]
      } }
    ] },
    { id: 'x04', matiere: 'histoire', famille: 'xix', nom: 'Les régimes politiques', court: 'Régimes', icone: '📏', series: [
      { k: 'ordre', consigne: 'Range ces régimes et gouvernements du plus ancien au plus récent.', q: 'En quelle année commence : {a} ?', niveaux: {
        facile: [['Le règne de Louis XVI', 1774, '1774'], ['La Ire République', 1792, '1792'], ['Le Premier Empire', 1804, '1804'], ['La IIIe République', 1870, '1870']],
        moyen: [['Le Consulat', 1799, '1799'], ['La Restauration', 1814, '1814'], ['La IIe République', 1848, '1848'], ['Le Second Empire', 1852, '1852']],
        difficile: [['La monarchie constitutionnelle', 1791, '1791'], ['Le Directoire', 1795, '1795'], ['Les Cent-Jours', 1815, '1815'],
          ['La monarchie de Juillet', 1830, '1830'], ['La Commune de Paris', 1871, '1871']],
        expert: [['La Convention', 1792, '1792'], ['Le Consulat à vie', 1802, '1802'], ['Le règne de Charles X', 1824, '1824'],
          ['Le gouvernement de la Défense nationale', 1870, '1870'], ['La IVe République', 1946, '1946'], ['La Ve République', 1958, '1958']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Qui dirige le Premier Empire ?', 'Napoléon Ier', ['Louis XVI', 'Charles de Gaulle']]],
        moyen: [['Qui dirige le Second Empire ?', 'Napoléon III', ['Napoléon Ier', 'Louis-Philippe', 'Charles X']]],
        difficile: [['Quel roi règne pendant la monarchie de Juillet ?', 'Louis-Philippe', ['Louis XVIII', 'Charles X', 'Louis XVI', 'Napoléon III']]],
        expert: [['Qui est élu en 1848 premier président de la République, par tous les hommes ?', 'Louis-Napoléon Bonaparte', ['Adolphe Thiers', 'Lamartine', 'Jules Grévy', 'Mac Mahon', 'Gambetta']]]
      } }
    ] },
    { id: 'x05', matiere: 'histoire', famille: 'xix', nom: 'Inventions de la révolution industrielle', court: 'Inventions', icone: '🚂', series: [
      { k: 'paires', gauche: 'Invention', droite: 'Inventeur', consigneR: 'Relie chaque invention à son inventeur.', q: 'Qui a inventé : {a} ?', qi: 'Qu’a inventé {b} ?', ouverte: false, niveaux: {
        facile: [['Le téléphone', 'Graham Bell'], ['L’ampoule électrique', 'Thomas Edison'], ['Le cinématographe', 'Les frères Lumière']],
        moyen: [['Le vaccin contre la rage', 'Louis Pasteur'], ['La photographie', 'Nicéphore Niépce'], ['L’écriture pour les aveugles', 'Louis Braille'],
          ['La machine à vapeur améliorée', 'James Watt']],
        difficile: [['Le phonographe', 'Thomas Edison'], ['Le télégraphe et son code', 'Samuel Morse'], ['La dynamite', 'Alfred Nobel'],
          ['Le moteur diesel', 'Rudolf Diesel'], ['La pasteurisation', 'Louis Pasteur']],
        expert: [['Le métier à tisser à cartes perforées', 'Joseph-Marie Jacquard'], ['Le pneu démontable', 'Les frères Michelin'], ['La radio sans fil', 'Guglielmo Marconi'],
          ['La machine à coudre', 'Barthélemy Thimonnier'], ['La pile électrique', 'Alessandro Volta'], ['Le stéthoscope', 'René Laennec']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Quelle machine fait avancer les premiers trains ?', 'La machine à vapeur', ['Le moteur électrique', 'Le moulin à vent']]],
        moyen: [['Quel savant a mis au point le vaccin contre la rage en 1885 ?', 'Louis Pasteur', ['Marie Curie', 'Thomas Edison', 'Louis Braille']]],
        difficile: [['Quels frères ont présenté la première séance de cinéma payante, en 1895 ?', 'Les frères Lumière', ['Les frères Montgolfier', 'Les frères Wright', 'Les frères Michelin', 'Les frères Grimm']]],
        expert: [['Quel combustible fait tourner les machines à vapeur des usines du XIXe siècle ?', 'Le charbon', ['Le pétrole', 'Le gaz naturel', 'L’uranium', 'L’huile d’olive', 'L’alcool']]]
      } },
      { k: 'ordre', consigne: 'Range ces inventions de la plus ancienne à la plus récente.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Première locomotive à vapeur sur des rails', 1804, '1804'], ['Première photographie', 1826, 'vers 1826'], ['Invention du téléphone', 1876, '1876'],
          ['Première séance de cinéma', 1895, '1895']],
        moyen: [['Louis Braille publie son écriture pour les aveugles', 1829, '1829'], ['Morse envoie un message par télégraphe', 1844, '1844'],
          ['Edison met au point son ampoule', 1879, '1879'], ['Pasteur vaccine un enfant contre la rage', 1885, '1885']],
        difficile: [['Laennec invente le stéthoscope', 1816, '1816'], ['La Rocket de Stephenson gagne un concours de locomotives', 1829, '1829'], ['Daguerre présente le daguerréotype', 1839, '1839'],
          ['Nobel invente la dynamite', 1867, '1867'], ['Marconi envoie un message radio à travers la Manche', 1899, '1899']],
        expert: [['Volta invente la pile électrique', 1800, '1800'], ['Jacquard présente son métier à tisser', 1801, '1801'], ['Thimonnier dépose le brevet de la machine à coudre', 1830, '1830'],
          ['Première Exposition universelle, à Londres', 1851, '1851'], ['Clément Ader fait décoller l’Éole', 1890, '1890'], ['Les frères Michelin déposent le brevet du pneu démontable', 1891, '1891']]
      } }
    ] },
    { id: 'x06', matiere: 'histoire', famille: 'xix', nom: 'Écrivains du XIXe siècle', court: 'Écrivains', icone: '📚', series: [
      { k: 'paires', gauche: 'Écrivain', droite: 'Livre', consigneR: 'Relie chaque écrivain à son livre.', q: 'Quel livre a écrit {a} ?', qi: 'Qui a écrit : {b} ?', ouverte: false, niveaux: {
        facile: [['Victor Hugo', 'Les Misérables'], ['Jules Verne', 'Le Tour du monde en quatre-vingts jours'], ['Alexandre Dumas', 'Les Trois Mousquetaires']],
        moyen: [['Émile Zola', 'Germinal'], ['Hector Malot', 'Sans famille'], ['La comtesse de Ségur', 'Les Malheurs de Sophie'], ['Alphonse Daudet', 'Les Lettres de mon moulin']],
        difficile: [['Gustave Flaubert', 'Madame Bovary'], ['Honoré de Balzac', 'Le Père Goriot'], ['Stendhal', 'Le Rouge et le Noir'],
          ['George Sand', 'La Petite Fadette'], ['Charles Baudelaire', 'Les Fleurs du mal']],
        expert: [['Guy de Maupassant', 'Le Horla'], ['Arthur Rimbaud', 'Le Bateau ivre'], ['Alfred de Musset', 'Lorenzaccio'],
          ['Prosper Mérimée', 'Colomba'], ['Edmond Rostand', 'Cyrano de Bergerac'], ['Paul Verlaine', 'Poèmes saturniens']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Qui a écrit Vingt Mille Lieues sous les mers ?', 'Jules Verne', ['Victor Hugo', 'Molière']]],
        moyen: [['Quel écrivain a raconté l’histoire de Jean Valjean et de Cosette ?', 'Victor Hugo', ['Émile Zola', 'Jules Verne', 'Alexandre Dumas']]],
        difficile: [['Quel écrivain a publié « J’accuse… ! » pour défendre le capitaine Dreyfus ?', 'Émile Zola', ['Victor Hugo', 'Gustave Flaubert', 'Jules Verne', 'Alphonse Daudet']]],
        expert: [['Sous quel nom d’homme Aurore Dupin a-t-elle publié ses romans ?', 'George Sand', ['Stendhal', 'Colette', 'Gérard de Nerval', 'Pierre Loti', 'Anatole France']]]
      } }
    ] },
    { id: 'x07', matiere: 'histoire', famille: 'xix', nom: 'Peintres impressionnistes', court: 'Peintres', icone: '🎨', series: [
      { k: 'paires', gauche: 'Peintre', droite: 'Tableau', consigneR: 'Relie chaque peintre à son tableau.', q: 'Quel tableau a peint {a} ?', qi: 'Qui a peint : {b} ?', ouverte: false, niveaux: {
        facile: [['Claude Monet', 'Impression, soleil levant'], ['Vincent van Gogh', 'Les Tournesols'], ['Auguste Renoir', 'Bal du moulin de la Galette']],
        moyen: [['Edgar Degas', 'La Classe de danse'], ['Édouard Manet', 'Le Déjeuner sur l’herbe'], ['Paul Cézanne', 'Les Joueurs de cartes'],
          ['Georges Seurat', 'Un dimanche à la Grande Jatte']],
        difficile: [['Berthe Morisot', 'Le Berceau'], ['Camille Pissarro', 'Boulevard Montmartre, effet de nuit'], ['Gustave Caillebotte', 'Les Raboteurs de parquet'],
          ['Alfred Sisley', 'L’Inondation à Port-Marly'], ['Paul Gauguin', 'La Vision après le sermon']],
        expert: [['Frédéric Bazille', 'Réunion de famille'], ['Claude Monet', 'Les Nymphéas'], ['Henri de Toulouse-Lautrec', 'Au Moulin Rouge'],
          ['Edgar Degas', 'L’Absinthe'], ['Mary Cassatt', 'Le Thé'], ['Camille Pissarro', 'Les Toits rouges']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Quel tableau de Monet a donné son nom aux impressionnistes ?', 'Impression, soleil levant', ['La Joconde', 'Les Tournesols']]],
        moyen: [['Quel peintre aimait peindre les danseuses de l’Opéra ?', 'Edgar Degas', ['Claude Monet', 'Vincent van Gogh', 'Paul Cézanne']]],
        difficile: [['Où les impressionnistes aiment-ils peindre ?', 'En plein air', ['Dans les églises', 'Seulement dans leur atelier', 'Dans des grottes', 'Dans les châteaux']]],
        expert: [['Dans quel village Claude Monet a-t-il peint son jardin et ses nymphéas ?', 'Giverny', ['Barbizon', 'Auvers-sur-Oise', 'Argenteuil', 'Arles', 'Pont-Aven']]]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le peintre.', niveaux: {
        facile: [{ r: 'Claude Monet', i: ['Je suis un peintre français.', 'J’ai grandi au Havre.', 'J’aime peindre en plein air.', 'Un de mes tableaux a donné son nom à l’impressionnisme.', 'J’ai peint les nymphéas de mon jardin de Giverny.'] }],
        moyen: [{ r: 'Vincent van Gogh', i: ['Je suis né aux Pays-Bas.', 'Mon frère Theo m’a toujours aidé.', 'J’ai peint à Arles, dans le sud de la France.', 'Je me suis coupé l’oreille.', 'J’ai peint Les Tournesols et La Nuit étoilée.'] }],
        difficile: [{ r: 'Edgar Degas', i: ['Je suis né à Paris en 1834.', 'J’ai exposé avec les impressionnistes.', 'Je peins aussi les courses de chevaux.', 'J’ai sculpté une Petite Danseuse de quatorze ans.', 'J’aime peindre les danseuses de l’Opéra.'] }],
        expert: [{ r: 'Berthe Morisot', i: ['Je suis une femme peintre.', 'J’ai exposé dès la première exposition des impressionnistes, en 1874.', 'Édouard Manet a fait plusieurs portraits de moi.', 'J’ai épousé Eugène Manet, son frère.', 'J’ai peint Le Berceau.'] }]
      } }
    ] },
    { id: 'x08', matiere: 'histoire', famille: 'xix', nom: 'Monuments du XIXe siècle', court: 'Monuments', icone: '🗼', series: [
      { k: 'paires', gauche: 'Monument', droite: 'Architecte ou constructeur', consigneR: 'Relie chaque monument à celui qui l’a dessiné ou construit.', q: 'Qui a dessiné ou construit {a} ?', qi: 'Quel monument doit-on à {b} ?', ouverte: false, niveaux: {
        facile: [['La tour Eiffel', 'Gustave Eiffel'], ['L’Opéra Garnier', 'Charles Garnier'], ['La statue de la Liberté', 'Auguste Bartholdi']],
        moyen: [['L’Arc de triomphe de l’Étoile', 'Jean-François Chalgrin'], ['Le Lion de Belfort', 'Auguste Bartholdi'], ['La basilique du Sacré-Cœur', 'Paul Abadie'],
          ['Les grands boulevards de Paris', 'Le baron Haussmann']],
        difficile: [['Le viaduc de Garabit', 'Gustave Eiffel'], ['Les Halles de Paris', 'Victor Baltard'], ['Notre-Dame de la Garde', 'Henri-Jacques Espérandieu'],
          ['La restauration de la cité de Carcassonne', 'Viollet-le-Duc'], ['Le Palais idéal', 'Le facteur Cheval']],
        expert: [['La bibliothèque Sainte-Geneviève', 'Henri Labrouste'], ['La gare d’Orsay', 'Victor Laloux'], ['La fontaine Saint-Michel', 'Gabriel Davioud'],
          ['L’église de la Madeleine', 'Pierre-Alexandre Vignon'], ['Le Petit Palais', 'Charles Girault'], ['Le palais Longchamp, à Marseille', 'Henri-Jacques Espérandieu']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Pour quelle grande fête la tour Eiffel a-t-elle été construite, en 1889 ?', 'L’Exposition universelle', ['Les Jeux olympiques', 'Le sacre de Napoléon']]],
        moyen: [['Quel pays a offert la statue de la Liberté aux États-Unis ?', 'La France', ['L’Angleterre', 'L’Espagne', 'L’Italie']]],
        difficile: [['Quel empereur a commandé l’Arc de triomphe de l’Étoile ?', 'Napoléon Ier', ['Napoléon III', 'Louis XIV', 'Charlemagne', 'Louis-Philippe']]],
        expert: [['Sous quel empereur l’Opéra Garnier a-t-il été commandé ?', 'Napoléon III', ['Napoléon Ier', 'Louis-Philippe', 'Charles X', 'Louis XVIII', 'Henri IV']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['La tour Eiffel a été construite pour l’Exposition universelle de 1889.', true, '']],
        moyen: [['La tour Eiffel devait être démontée au bout de 20 ans.', true, '']],
        difficile: [['La statue de la Liberté a été construite en Amérique.', false, 'Elle a été construite à Paris, puis démontée et envoyée en bateau à New York en 1885.']],
        expert: [['Napoléon a vu l’Arc de triomphe de l’Étoile terminé.', false, 'Il a été inauguré en 1836, quinze ans après sa mort.']]
      } }
    ] },
    { id: 'x09', matiere: 'histoire', famille: 'xix', nom: 'Grandes lois', court: 'Lois', icone: '⚖️', series: [
      { k: 'qcm', niveaux: {
        facile: [['Grâce aux lois de Jules Ferry, comment devient l’école ?', 'Gratuite et obligatoire', ['Payante', 'Interdite aux filles']]],
        moyen: [['Qui a fait abolir l’esclavage dans les colonies françaises, en 1848 ?', 'Victor Schœlcher', ['Jules Ferry', 'Napoléon', 'Victor Hugo']]],
        difficile: [['En 1848, qui obtient le droit de voter ?', 'Tous les hommes de 21 ans et plus', ['Toutes les femmes', 'Seulement les riches', 'Seulement les nobles', 'Les enfants']]],
        expert: [['Quelle loi de 1884 permet aux ouvriers de créer des syndicats ?', 'La loi Waldeck-Rousseau', ['La loi Le Chapelier', 'La loi Falloux', 'La loi Guizot', 'La loi Naquet', 'La loi Ferry']]]
      } },
      { k: 'ordre', consigne: 'Range ces lois du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Déclaration des droits de l’homme', 1789, '1789'], ['Abolition de l’esclavage par Schœlcher', 1848, '1848'], ['L’école devient gratuite', 1881, '1881'],
          ['L’école devient obligatoire et laïque', 1882, '1882']],
        moyen: [['Première abolition de l’esclavage', 1794, '1794'], ['Le Code civil', 1804, '1804'], ['Suffrage universel masculin', 1848, '1848'], ['Droit de grève', 1864, '1864']],
        difficile: [['Loi Guizot : une école de garçons dans chaque commune', 1833, '1833'], ['Loi interdisant le travail à l’usine avant 8 ans', 1841, '1841'],
          ['Loi Falloux sur l’enseignement', 1850, '1850'], ['Loi sur la liberté de la presse', 1881, '1881'], ['Droit de créer des syndicats', 1884, '1884']],
        expert: [['Loi Le Chapelier : les corporations sont interdites', 1791, '1791'], ['Bonaparte rétablit l’esclavage', 1802, '1802'], ['Loi Duruy : des écoles de filles dans les communes de 500 habitants', 1867, '1867'],
          ['Loi Camille Sée : des lycées pour les filles', 1880, '1880'], ['Loi Naquet : retour du divorce', 1884, '1884'], ['Loi sur les accidents du travail', 1898, '1898']]
      } },
      { k: 'vf', niveaux: {
        facile: [['Avec Jules Ferry, l’école publique devient gratuite.', true, '']],
        moyen: [['En 1848, les femmes obtiennent le droit de vote.', false, 'En 1848, seuls les hommes votent ; les femmes votent pour la première fois en 1945.']],
        difficile: [['L’esclavage a été aboli une première fois en 1794, puis rétabli par Bonaparte en 1802.', true, '']],
        expert: [['Le Code civil de 1804 donnait les mêmes droits aux femmes qu’aux hommes.', false, 'Il plaçait la femme mariée sous l’autorité de son mari.']]
      } }
    ] },
    // ---------- XXe siècle (v7.11, BACKLOG ligne 295 : 7 jeux, hypothèse à valider) ----------
    // Non retenus pour l'instant : Première et Seconde Guerre mondiale (sujets sensibles : attendent un choix de l'utilisateur),
    // Le mur de Berlin, Objets d'hier.
    { id: 'z03', matiere: 'histoire', famille: 'xx', nom: 'Conquête spatiale', court: 'Espace', icone: '🚀', series: [
      { k: 'paires', gauche: 'Personnage ou engin', droite: 'Exploit', consigneR: 'Relie chaque personnage ou engin à son exploit.', q: 'Quel exploit est lié à {a} ?', qi: 'Qui ou quoi : {b} ?', ouverte: false, niveaux: {
        facile: [['Youri Gagarine', 'Premier homme dans l’espace'], ['Neil Armstrong', 'Premier homme à marcher sur la Lune'], ['Thomas Pesquet', 'Astronaute français de la Station spatiale internationale']],
        moyen: [['Spoutnik 1', 'Premier satellite artificiel'], ['Laïka', 'Premier animal en orbite autour de la Terre'], ['Valentina Terechkova', 'Première femme dans l’espace'],
          ['Buzz Aldrin', 'Deuxième homme à marcher sur la Lune']],
        difficile: [['Apollo 11', 'Mission du premier pas sur la Lune'], ['Jean-Loup Chrétien', 'Premier Français dans l’espace'], ['Claudie Haigneré', 'Première Française dans l’espace'],
          ['Alexeï Leonov', 'Première sortie dans l’espace'], ['Ariane 1', 'Première fusée européenne, lancée de Kourou']],
        expert: [['Michael Collins', 'Reste en orbite autour de la Lune pendant Apollo 11'], ['Hubble', 'Télescope lancé dans l’espace en 1990'], ['Mir', 'Station spatiale russe, de 1986 à 2001'],
          ['Apollo 13', 'Mission vers la Lune sauvée après une explosion'], ['Sally Ride', 'Première Américaine dans l’espace'], ['Sojourner', 'Premier robot à rouler sur Mars']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['En quelle année l’homme a-t-il marché sur la Lune pour la première fois ?', '1969', ['1945', '1999']]],
        moyen: [['De quel pays venait Youri Gagarine ?', 'L’Union soviétique', ['Les États-Unis', 'La France', 'La Chine']]],
        difficile: [['D’où partent les fusées européennes Ariane ?', 'De Kourou, en Guyane', ['De Toulouse', 'De Cap Canaveral', 'De Baïkonour', 'De l’île de La Réunion']]],
        expert: [['Comment s’appelait le module qui s’est posé sur la Lune pendant Apollo 11 ?', 'Eagle', ['Columbia', 'Spoutnik', 'Saturn', 'Vostok', 'Discovery']]]
      } },
      { k: 'ordre', consigne: 'Range ces étapes de la conquête spatiale de la plus ancienne à la plus récente.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Lancement de Spoutnik 1', 1957, '1957'], ['Gagarine part dans l’espace', 1961, '1961'], ['Premier pas sur la Lune', 1969, '1969'],
          ['Premier morceau de la Station spatiale internationale', 1998, '1998']],
        moyen: [['Terechkova, première femme dans l’espace', 1963, '1963'], ['Leonov sort dans l’espace', 1965, '1965'], ['Apollo 13 revient sur Terre', 1970, '1970'],
          ['Jean-Loup Chrétien part dans l’espace', 1982, '1982'], ['Lancement du télescope Hubble', 1990, '1990']],
        difficile: [['Laïka part dans l’espace', 1957, '1957'], ['Première fusée Ariane', 1979, '1979'], ['Premier vol d’une navette spatiale', 1981, '1981'],
          ['Lancement de la station Mir', 1986, '1986'], ['Claudie Haigneré part dans l’espace', 1996, '1996']],
        expert: [['Création de la NASA', 1958, '1958'], ['Création du CNES, l’agence spatiale française', 1961, '1961'], ['Derniers hommes sur la Lune (Apollo 17)', 1972, '1972'],
          ['Création de l’Agence spatiale européenne', 1975, '1975'], ['Sally Ride part dans l’espace', 1983, '1983'], ['Le robot Sojourner roule sur Mars', 1997, '1997']]
      } }
    ] },
    { id: 'z04', matiere: 'histoire', famille: 'xx', nom: 'Inventions du XXe siècle', court: 'Inventions', icone: '✈️', series: [
      { k: 'paires', gauche: 'Invention ou découverte', droite: 'Inventeur', consigneR: 'Relie chaque invention ou découverte à son auteur.', q: 'Qui est à l’origine de : {a} ?', qi: 'Qu’a inventé ou découvert {b} ?', ouverte: false, niveaux: {
        facile: [['L’avion à moteur', 'Les frères Wright'], ['La pénicilline', 'Alexander Fleming'], ['Le World Wide Web', 'Tim Berners-Lee']],
        moyen: [['La théorie de la relativité', 'Albert Einstein'], ['La télévision', 'John Logie Baird'], ['Le téléphone portable', 'Martin Cooper'],
          ['Le scaphandre autonome', 'Jacques-Yves Cousteau']],
        difficile: [['La carte à puce', 'Roland Moreno'], ['Le transistor', 'Bardeen, Brattain et Shockley'], ['Le stylo à bille', 'László Bíró'],
          ['L’éclairage au néon', 'Georges Claude'], ['Le vaccin contre la polio', 'Jonas Salk']],
        expert: [['Le laser', 'Theodore Maiman'], ['La fermeture Éclair moderne', 'Gideon Sundback'], ['Le Velcro', 'Georges de Mestral'],
          ['Le Rubik’s Cube', 'Ernő Rubik'], ['Le four à micro-ondes', 'Percy Spencer'], ['L’insuline pour soigner le diabète', 'Banting et Best']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Qu’ont fait voler les frères Wright en 1903 ?', 'Le premier avion à moteur', ['La première fusée', 'La première montgolfière']]],
        moyen: [['Qui a découvert la pénicilline, le premier antibiotique ?', 'Alexander Fleming', ['Louis Pasteur', 'Marie Curie', 'Albert Einstein']]],
        difficile: [['Quel Français a été le premier à traverser la Manche en avion, en 1909 ?', 'Louis Blériot', ['Clément Ader', 'Roland Garros', 'Antoine de Saint-Exupéry', 'Jean Mermoz']]],
        expert: [['Avant Internet, quel petit terminal français permettait de consulter l’annuaire ?', 'Le Minitel', ['Le télégraphe', 'Le baladeur', 'Le fax', 'Le télex', 'La radio']]]
      } },
      { k: 'ordre', consigne: 'Range ces inventions de la plus ancienne à la plus récente.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Premier vol des frères Wright', 1903, '1903'], ['Fleming découvre la pénicilline', 1928, '1928'], ['Premier appel avec un téléphone portable', 1973, '1973'],
          ['Premier site web', 1991, '1991']],
        moyen: [['Blériot traverse la Manche en avion', 1909, '1909'], ['Baird montre sa télévision', 1926, '1926'], ['Cousteau met au point le scaphandre autonome', 1943, '1943'],
          ['Premier laser', 1960, '1960'], ['Moreno invente la carte à puce', 1974, '1974']],
        difficile: [['Georges Claude présente l’éclairage au néon', 1910, '1910'], ['Découverte de l’insuline', 1921, '1921'], ['Invention du transistor', 1947, '1947'],
          ['Le vaccin de Salk contre la polio est autorisé', 1955, '1955'], ['Invention du Rubik’s Cube', 1974, '1974']],
        expert: [['Sundback met au point la fermeture Éclair', 1913, '1913'], ['Bíró dépose le brevet du stylo à bille', 1938, '1938'], ['Spencer dépose le brevet du four à micro-ondes', 1945, '1945'],
          ['Mestral dépose le brevet du Velcro', 1951, '1951'], ['Premiers disques compacts (CD) en vente', 1982, '1982'], ['Premier SMS envoyé', 1992, '1992']]
      } }
    ] },
    { id: 'z05', matiere: 'histoire', famille: 'xx', nom: 'Présidents de la Ve République', court: 'Présidents', icone: '🏛️', series: [
      { k: 'ordre', consigne: 'Range ces présidents du premier au plus récent.', q: 'En quelle année {a} devient-il président ?', niveaux: {
        facile: [['Charles de Gaulle', 1959, '1959'], ['François Mitterrand', 1981, '1981'], ['Jacques Chirac', 1995, '1995'], ['Emmanuel Macron', 2017, '2017']],
        moyen: [['Georges Pompidou', 1969, '1969'], ['Valéry Giscard d’Estaing', 1974, '1974'], ['Nicolas Sarkozy', 2007, '2007'], ['François Hollande', 2012, '2012']]
      } },
      { k: 'ordre', consigne: 'Range ces événements de la Ve République du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        difficile: [['Naissance de la Ve République', 1958, '1958'], ['Première élection du président par tous les Français', 1965, '1965'], ['Mai 68', 1968, '1968'],
          ['Première cohabitation', 1986, '1986'], ['Référendum : le mandat passe de 7 à 5 ans', 2000, '2000']],
        expert: [['Référendum : le président sera élu par tous les Français', 1962, '1962'], ['Démission de Charles de Gaulle', 1969, '1969'], ['Mort de Georges Pompidou', 1974, '1974'],
          ['Abolition de la peine de mort', 1981, '1981'], ['Référendum sur le traité de Maastricht', 1992, '1992'], ['Premier président élu pour 5 ans', 2002, '2002']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Qui a été le premier président de la Ve République ?', 'Charles de Gaulle', ['François Mitterrand', 'Napoléon']]],
        moyen: [['Combien d’années dure aujourd’hui le mandat du président ?', '5 ans', ['7 ans', '4 ans', '10 ans']]],
        difficile: [['Sous quel président la peine de mort a-t-elle été abolie, en 1981 ?', 'François Mitterrand', ['Valéry Giscard d’Estaing', 'Jacques Chirac', 'Georges Pompidou', 'Charles de Gaulle']]],
        expert: [['Quel président est mort pendant son mandat, en 1974 ?', 'Georges Pompidou', ['Charles de Gaulle', 'Félix Faure', 'Valéry Giscard d’Estaing', 'Alain Poher', 'Paul Doumer']]]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le président.', niveaux: {
        facile: [{ r: 'Charles de Gaulle', i: ['Je suis né à Lille en 1890.', 'J’étais général.', 'Le 18 juin 1940, j’ai parlé aux Français à la radio, depuis Londres.', 'J’ai fondé la Ve République en 1958.', 'Le grand aéroport de Roissy, près de Paris, porte mon nom.'] }],
        moyen: [{ r: 'Jacques Chirac', i: ['J’ai été maire de Paris pendant 18 ans.', 'J’ai été deux fois Premier ministre.', 'J’ai été élu président en 1995.', 'Pendant mon mandat, la durée du mandat de président est passée de 7 à 5 ans.', 'J’ai été réélu en 2002.'] }],
        difficile: [{ r: 'Valéry Giscard d’Estaing', i: ['Je suis né à Coblence, en Allemagne, en 1926.', 'J’ai été ministre des Finances.', 'Je suis devenu président à 48 ans, en 1974.', 'Pendant mon mandat, la majorité est passée de 21 à 18 ans.', 'J’ai été battu par François Mitterrand en 1981.'] }],
        expert: [{ r: 'Georges Pompidou', i: ['Je suis né dans le Cantal en 1911.', 'J’ai été professeur de lettres, puis banquier.', 'J’ai été Premier ministre du général de Gaulle pendant six ans.', 'Un grand centre d’art de Paris porte mon nom.', 'Je suis mort pendant mon mandat de président, en 1974.'] }]
      } }
    ] },
    { id: 'z06', matiere: 'histoire', famille: 'xx', nom: 'Femmes qui ont marqué l’histoire', court: 'Femmes', icone: '👩‍🔬', series: [
      { k: 'qcm', niveaux: {
        facile: [['Quelle savante a reçu deux prix Nobel ?', 'Marie Curie', ['Simone Veil', 'Jeanne d’Arc']]],
        moyen: [['En quelle année les Françaises ont-elles voté pour la première fois ?', '1945', ['1789', '1918', '1968']]],
        difficile: [['Qui a été la première présidente du Parlement européen élu par les citoyens, en 1979 ?', 'Simone Veil', ['Marie Curie', 'Édith Cresson', 'Simone de Beauvoir', 'Louise Weiss']]],
        expert: [['Qui a été la première femme Première ministre en France, en 1991 ?', 'Édith Cresson', ['Simone Veil', 'Ségolène Royal', 'Élisabeth Borne', 'Michèle Alliot-Marie', 'Christine Lagarde']]]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve cette femme.', niveaux: {
        facile: [{ r: 'Marie Curie', i: ['Je suis née à Varsovie, en Pologne, en 1867.', 'Je suis venue étudier les sciences à Paris.', 'Avec mon mari Pierre, j’ai découvert le radium.', 'J’ai été la première femme à recevoir un prix Nobel.', 'J’ai reçu deux prix Nobel, en physique et en chimie.'] }],
        moyen: [{ r: 'Simone Veil', i: ['Je suis née à Nice en 1927.', 'J’ai été magistrate.', 'Ministre de la Santé, j’ai fait voter en 1975 une loi importante pour les droits des femmes.', 'J’ai été la première présidente du Parlement européen élu par les citoyens.', 'Je repose au Panthéon depuis 2018.'] }],
        difficile: [{ r: 'Joséphine Baker', i: ['Je suis née aux États-Unis, à Saint-Louis, en 1906.', 'Je suis devenue une grande vedette du music-hall à Paris.', 'Pendant la Seconde Guerre mondiale, j’ai aidé la Résistance.', 'J’ai adopté douze enfants, ma « tribu arc-en-ciel ».', 'Je suis entrée au Panthéon en 2021.'] }],
        expert: [{ r: 'Irène Joliot-Curie', i: ['Je suis née à Paris en 1897.', 'Pendant la Première Guerre mondiale, j’ai aidé à faire des radiographies des blessés.', 'Avec mon mari Frédéric, j’ai découvert la radioactivité artificielle.', 'J’ai reçu le prix Nobel de chimie en 1935.', 'Ma mère, Marie Curie, avait reçu deux prix Nobel.'] }]
      } },
      { k: 'vf', niveaux: {
        facile: [['Marie Curie a reçu deux prix Nobel.', true, '']],
        moyen: [['Les Françaises ont pu voter dès la Révolution de 1789.', false, 'Elles ont obtenu le droit de vote en 1944 et ont voté pour la première fois en 1945.']],
        difficile: [['Simone Veil repose au Panthéon.', true, '']],
        expert: [['Marie Curie est la première femme entrée au Panthéon pour ses propres mérites, en 1995.', true, '']]
      } }
    ] },
    { id: 'z07', matiere: 'histoire', famille: 'xx', nom: 'Construction européenne', court: 'Europe', icone: '🇪🇺', series: [
      { k: 'qcm', niveaux: {
        facile: [['Quelle monnaie utilise-t-on en France depuis 2002 ?', 'L’euro', ['Le franc', 'Le dollar']]],
        moyen: [['Combien d’étoiles y a-t-il sur le drapeau européen ?', '12', ['15', '27', '6']]],
        difficile: [['Quelle ville française est le siège officiel du Parlement européen ?', 'Strasbourg', ['Paris', 'Lyon', 'Lille', 'Marseille']]],
        expert: [['Quel morceau de Beethoven est devenu l’hymne européen ?', 'L’Ode à la joie', ['La Marseillaise', 'Le Boléro', 'Les Quatre Saisons', 'La Lettre à Élise', 'Le Beau Danube bleu']]]
      } },
      { k: 'ordre', consigne: 'Range ces étapes de la construction européenne de la plus ancienne à la plus récente.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Traité de Rome', 1957, '1957'], ['Premières élections européennes', 1979, '1979'], ['Traité de Maastricht', 1992, '1992'], ['Pièces et billets en euros', 2002, '2002']],
        moyen: [['Déclaration de Robert Schuman', 1950, '1950'], ['Six pays mettent en commun le charbon et l’acier', 1951, '1951'], ['Le Royaume-Uni entre dans la Communauté', 1973, '1973'],
          ['Accord de Schengen', 1985, '1985'], ['L’Espagne et le Portugal entrent dans la Communauté', 1986, '1986']],
        difficile: [['Le drapeau aux 12 étoiles est adopté', 1955, '1955'], ['Naissance de la politique agricole commune', 1962, '1962'], ['La Grèce entre dans la Communauté', 1981, '1981'],
          ['L’euro naît pour les banques', 1999, '1999'], ['Dix nouveaux pays entrent dans l’Union', 2004, '2004']],
        expert: [['Création du Conseil de l’Europe', 1949, '1949'], ['Traité de l’Élysée entre la France et l’Allemagne', 1963, '1963'], ['Fin des droits de douane entre les Six', 1968, '1968'],
          ['Signature de l’Acte unique européen', 1986, '1986'], ['L’Autriche, la Finlande et la Suède entrent dans l’Union', 1995, '1995'], ['Signature du traité de Lisbonne', 2007, '2007']]
      } },
      { k: 'vf', niveaux: {
        facile: [['Le drapeau européen est bleu avec des étoiles jaunes.', true, '']],
        moyen: [['Les pièces et les billets en euros sont arrivés en 2002.', true, '']],
        difficile: [['La France fait partie des six pays qui ont fondé la construction européenne.', true, '']],
        expert: [['Le drapeau européen gagne une étoile quand un pays entre dans l’Union.', false, 'Il a toujours 12 étoiles : ce nombre est un symbole de perfection et d’unité.']]
      } }
    ] },
    { id: 'z08', matiere: 'histoire', famille: 'xx', nom: 'Grandes figures du monde', court: 'Figures', icone: '✊', series: [
      { k: 'paires', gauche: 'Personnage', droite: 'Ce qu’il ou elle a fait', consigneR: 'Relie chaque personnage à ce qu’il ou elle a fait.', q: 'Qu’a fait {a} ?', qi: 'Qui : {b} ?', ouverte: false, niveaux: {
        facile: [['Nelson Mandela', 'Président de l’Afrique du Sud après la fin de l’apartheid'], ['Martin Luther King', '« I have a dream » (« Je fais un rêve »)'],
          ['Gandhi', 'Mène l’Inde à l’indépendance sans violence']],
        moyen: [['Rosa Parks', 'Refuse de céder sa place dans un bus, en 1955'], ['Mère Teresa', 'Aide les plus pauvres à Calcutta'], ['Albert Schweitzer', 'Fonde un hôpital à Lambaréné, au Gabon'],
          ['L’abbé Pierre', 'Fonde Emmaüs']],
        difficile: [['Coluche', 'Crée les Restos du cœur'], ['Desmond Tutu', 'Archevêque sud-africain qui combat l’apartheid'], ['Lech Wałęsa', 'Dirige le syndicat Solidarność, en Pologne'],
          ['Wangari Maathai', 'Fait planter des millions d’arbres au Kenya'], ['Mikhaïl Gorbatchev', 'Dernier dirigeant de l’URSS']],
        expert: [['René Cassin', 'Rédige la Déclaration universelle des droits de l’homme'], ['Eleanor Roosevelt', 'Préside la commission des droits de l’homme de l’ONU'],
          ['Le dalaï-lama', 'Chef spirituel tibétain, prix Nobel de la paix 1989'], ['Andreï Sakharov', 'Physicien soviétique qui défend les droits de l’homme'],
          ['Rigoberta Menchú', 'Défend les peuples indigènes du Guatemala'], ['Václav Havel', 'Écrivain devenu président de la Tchécoslovaquie']]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le personnage.', niveaux: {
        facile: [{ r: 'Nelson Mandela', i: ['Je suis né en Afrique du Sud en 1918.', 'J’étais avocat.', 'J’ai combattu l’apartheid, qui séparait les Noirs et les Blancs.', 'Je suis resté 27 ans en prison.', 'En 1994, je suis devenu président de mon pays.'] }],
        moyen: [{ r: 'Martin Luther King', i: ['Je suis né à Atlanta, aux États-Unis, en 1929.', 'J’étais pasteur.', 'J’ai lutté sans violence pour les droits des Noirs américains.', 'J’ai reçu le prix Nobel de la paix en 1964.', 'En 1963, j’ai dit : « I have a dream » (« Je fais un rêve »).'] }],
        difficile: [{ r: 'Gandhi', i: ['Je suis né en Inde en 1869.', 'J’ai été avocat en Afrique du Sud.', 'En 1930, j’ai marché jusqu’à la mer pour récolter du sel.', 'On m’appelle « Mahatma », la grande âme.', 'J’ai mené l’Inde vers l’indépendance sans violence.'] }],
        expert: [{ r: 'Rosa Parks', i: ['Je suis née en Alabama en 1913.', 'J’étais couturière.', 'Le 1er décembre 1955, j’ai été arrêtée à Montgomery.', 'Mon arrestation a lancé un boycott des bus pendant 381 jours.', 'J’avais refusé de céder ma place à un passager blanc dans un bus.'] }]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Comment Gandhi se battait-il ?', 'Sans violence', ['Avec une armée', 'Avec des épées']]],
        moyen: [['De quel pays Nelson Mandela a-t-il été président ?', 'L’Afrique du Sud', ['Le Kenya', 'Les États-Unis', 'L’Inde']]],
        difficile: [['Dans quelle ville Rosa Parks a-t-elle refusé de céder sa place ?', 'Montgomery', ['New York', 'Atlanta', 'Chicago', 'Washington']]],
        expert: [['Avec qui Nelson Mandela a-t-il partagé le prix Nobel de la paix en 1993 ?', 'Frederik de Klerk', ['Desmond Tutu', 'Thabo Mbeki', 'Jacob Zuma', 'Steve Biko', 'Kofi Annan']]]
      } }
    ] },
    { id: 'z11', matiere: 'histoire', famille: 'xx', nom: 'Frise du XXe siècle', court: 'Frise', icone: '📏', series: [
      { k: 'ordre', consigne: 'Range ces événements du XXe siècle du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Premier vol des frères Wright', 1903, '1903'], ['Armistice du 11 novembre', 1918, '1918'], ['Premier pas sur la Lune', 1969, '1969'], ['Chute du mur de Berlin', 1989, '1989']],
        moyen: [['Blériot traverse la Manche en avion', 1909, '1909'], ['Premiers congés payés en France', 1936, '1936'], ['Fin de la Seconde Guerre mondiale en Europe', 1945, '1945'],
          ['Traité de Rome', 1957, '1957'], ['Gagarine part dans l’espace', 1961, '1961']],
        difficile: [['Loi de séparation des Églises et de l’État', 1905, '1905'], ['Début de la Première Guerre mondiale', 1914, '1914'], ['Les Françaises obtiennent le droit de vote', 1944, '1944'],
          ['Naissance de la Ve République', 1958, '1958'], ['La majorité passe à 18 ans', 1974, '1974']],
        expert: [['Naufrage du Titanic', 1912, '1912'], ['Krach de Wall Street', 1929, '1929'], ['Indépendance de l’Inde', 1947, '1947'],
          ['Déclaration universelle des droits de l’homme', 1948, '1948'], ['Mai 68', 1968, '1968'], ['Nelson Mandela sort de prison', 1990, '1990']]
      } }
    ] }
  ];

  // Paires dont on ne pose la question que dans un sens (« Quel dieu : … ? ») : a et b inversés pour le moteur.
  JEUX.forEach(function (j) {
    j.series.forEach(function (s) {
      if (!s.inverseSeul) return;
      Object.keys(s.niveaux).forEach(function (n) { s.niveaux[n] = s.niveaux[n].map(function (p) { return [p[1], p[0]]; }); });
      var g = s.gauche; s.gauche = s.droite; s.droite = g;
      s.q = s.q.replace('{b}', '{a}');
    });
  });

  // Les 7 périodes (choix de l'utilisateur), dans l'ordre : ce sont les familles de l'écran des jeux.
  // Une période sans jeu n'est pas affichée.
  var FAMILLES = [
    { id: 'pre', nom: 'Préhistoire', icone: '🦣' },
    { id: 'ant', nom: 'Antiquité', icone: '🏺' },
    { id: 'mag', nom: 'Moyen Âge', icone: '🏰' },
    { id: 'ren', nom: 'Renaissance', icone: '🎨' },
    { id: 'mod', nom: 'Temps modernes', icone: '👑' },
    { id: 'xix', nom: 'Révolution et XIXe siècle', icone: '🇫🇷' },
    { id: 'xx', nom: 'XXe siècle', icone: '✈️' }
  ];
  FAMILLES.forEach(function (f) { S.PERIODES.push(f); });

  S.ajouter(JEUX);
  var api = { JEUX: JEUX, FAMILLES: FAMILLES, romain: romain };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Histoire = api;
})(this);
