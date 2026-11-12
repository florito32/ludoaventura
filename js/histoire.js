// Histoire (v7.1) : la matière Histoire, rangée par périodes (BACKLOG lignes 270 et 275).
// Choix de l'utilisateur du 12/11/2026 : 7 périodes, 51 jeux, 4 niveaux, et chaque niveau n'a QUE son
// propre contenu (Expert = seulement du contenu expert). Livraison par période : l'Antiquité d'abord (ses
// 12 jeux sont tous retenus), puis la Préhistoire (v7.6, 5 jeux) ; les autres périodes viendront ensuite.
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
    // ---------- Préhistoire (v7.6, BACKLOG ligne 295 : 5 jeux, hypothèse à valider) ----------
    { id: 'p01', matiere: 'histoire', famille: 'pre', nom: 'Nos ancêtres', court: 'Ancêtres', icone: '🧬', series: [
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
          facile: [['Lucy', 'En Éthiopie'], ['L’homme de Tautavel', 'En France'], ['Ötzi, l’homme des glaces', 'Dans les Alpes, en Italie']],
          moyen: [['Toumaï', 'Au Tchad'], ['L’homme de Néandertal, en 1856', 'En Allemagne'], ['Le premier Cro-Magnon', 'En France, en Dordogne'], ['Les plus vieux Homo sapiens', 'Au Maroc']],
          difficile: [['L’homme de Kabwe', 'En Zambie'], ['L’homme de Pékin', 'En Chine'], ['L’homme de Flores', 'Sur l’île de Flores, en Indonésie'],
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
      } }
    ] },
    { id: 'p02', matiere: 'histoire', famille: 'pre', nom: 'Paléolithique ou Néolithique ?', court: 'Paléo, Néo', icone: '🌾', series: [
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
      } }
    ] },
    { id: 'p03', matiere: 'histoire', famille: 'pre', nom: 'Grottes ornées', court: 'Grottes', icone: '🎨', series: [
      { k: 'paires', gauche: 'Grotte', droite: 'Où elle se trouve', consigneR: 'Relie chaque grotte ornée à l’endroit où elle se trouve.',
        q: 'Où se trouve la grotte {a} ?', qi: 'Quelle grotte ornée se trouve {b} ?', ouverte: false, niveaux: {
          facile: [['de Lascaux', 'En Dordogne'], ['Chauvet', 'En Ardèche'], ['Cosquer', 'Près de Marseille, sous la mer']],
          moyen: [['de Niaux', 'En Ariège'], ['de Pech-Merle', 'Dans le Lot'], ['d’Altamira', 'En Espagne'], ['de Gargas', 'Dans les Hautes-Pyrénées']],
          difficile: [['de Rouffignac', 'En Dordogne, la grotte aux cent mammouths'], ['de Font-de-Gaume', 'Aux Eyzies, en Dordogne'], ['d’Arcy-sur-Cure', 'Dans l’Yonne'],
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
      } }
    ] },
    { id: 'p04', matiere: 'histoire', famille: 'pre', nom: 'Outils et inventions', court: 'Outils', icone: '🪓', series: [
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
        facile: [['Quelle pierre les hommes préhistoriques taillaient-ils le plus ?', 'Le silex', ['Le marbre', 'Le diamant']],
          ['Quelle grande découverte permet de cuire, se chauffer et se protéger ?', 'Le feu', ['La roue', 'L’électricité']]],
        moyen: [['Comment faisait-on du feu ?', 'En frappant un silex contre une pierre de pyrite', ['Avec des allumettes', 'En frottant deux silex dans l’eau', 'Avec une loupe en verre']],
          ['En quoi étaient faits les premiers pots ?', 'En argile cuite', ['En fer', 'En verre', 'En plastique']]],
        difficile: [['Quel métal les hommes ont-ils travaillé en premier, avant le bronze ?', 'Le cuivre', ['Le fer', 'L’acier', 'L’aluminium', 'Le zinc']],
          ['Le bronze est un mélange de cuivre et de…', 'D’étain', ['De fer', 'D’or', 'De plomb', 'D’argent']]],
        expert: [['Quel ancêtre aurait fabriqué les premiers bifaces ?', 'Homo erectus', ['Lucy', 'Toumaï', 'Homo sapiens', 'L’homme de Cro-Magnon', 'Ötzi']],
          ['Qu’est-ce que l’obsidienne, échangée au Néolithique ?', 'Un verre volcanique très coupant', ['Un métal', 'Un coquillage', 'Une graine', 'Une teinture', 'Un os de baleine']]]
      } }
    ] },
    { id: 'p07', matiere: 'histoire', famille: 'pre', nom: 'Mégalithes', court: 'Mégalithes', icone: '🗿', series: [
      { k: 'paires', gauche: 'Mot', droite: 'Ce que c’est', consigneR: 'Relie chaque mot à ce qu’il désigne.', q: 'Qu’est-ce qu’{a} ?', qi: 'Comment s’appelle : {b} ?', niveaux: {
        facile: [['un menhir', 'Une grande pierre dressée'], ['un dolmen', 'Une table de pierre, une tombe'], ['un alignement', 'Des rangées de menhirs']],
        moyen: [['un cromlech', 'Un cercle de menhirs'], ['un tumulus', 'Une butte de terre sur une tombe'], ['une allée couverte', 'Un long couloir de pierres'], ['un mégalithe', 'Un monument en grosses pierres']],
        difficile: [['un cairn', 'Un tas de pierres sur des tombes'], ['un orthostate', 'Une pierre dressée d’un mur de dolmen'], ['une table de couverture', 'La grande dalle posée sur un dolmen'],
          ['un tertre', 'Une petite colline de terre'], ['un monolithe', 'Un monument d’un seul bloc']],
        expert: [['un menhir christianisé', 'Un menhir surmonté d’une croix'], ['une stèle', 'Une pierre plate gravée'], ['une statue-menhir', 'Un menhir sculpté en personnage'],
          ['une sépulture collective', 'Une tombe pour plusieurs morts'], ['un ciste', 'Un petit coffre de pierre pour un mort'], ['un péristalithe', 'Un cercle de pierres autour d’un tumulus']]
      } },
      { k: 'paires', gauche: 'Site', droite: 'Où il se trouve', consigneR: 'Relie chaque site mégalithique à l’endroit où il se trouve.', q: 'Où se trouve {a} ?', ouverte: false, niveaux: {
        facile: [['Les alignements de Carnac', 'En Bretagne'], ['Stonehenge', 'En Angleterre'], ['Les statues de l’île de Pâques', 'Dans l’océan Pacifique']],
        moyen: [['Le grand menhir brisé de Locmariaquer', 'Dans le Morbihan'], ['Le cairn de Barnenez', 'Dans le Finistère'], ['Newgrange', 'En Irlande'], ['La Roche-aux-Fées', 'En Ille-et-Vilaine']],
        difficile: [['Le cairn de Gavrinis', 'Sur une île du golfe du Morbihan'], ['Le grand dolmen de Bagneux', 'À Saumur'], ['Le menhir de Champ-Dolent', 'À Dol-de-Bretagne'],
          ['Le cercle de Callanish', 'En Écosse'], ['Le temple de Göbekli Tepe', 'En Turquie']],
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
      } }
    ] },

    // ---------- Antiquité ----------
    { id: 'a01', matiere: 'histoire', famille: 'ant', nom: 'Dieux grecs et romains', court: 'Dieux grecs', icone: '⚡', series: [
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
      { k: 'qcm', niveaux: {
        facile: [['Qui est le roi des dieux grecs ?', 'Zeus', ['Poséidon', 'Hermès', 'Arès']],
          ['Quel dieu grec règne sur la mer ?', 'Poséidon', ['Zeus', 'Arès', 'Hermès']],
          ['Où vivent les dieux grecs ?', 'Sur le mont Olympe', ['Sur l’Etna', 'Sur le Vésuve', 'Sur le mont Blanc']]],
        moyen: [['Quelle déesse est sortie tout armée de la tête de Zeus ?', 'Athéna', ['Héra', 'Artémis', 'Aphrodite', 'Déméter']],
          ['Quel dieu forge les armes des dieux ?', 'Héphaïstos', ['Arès', 'Hermès', 'Apollon', 'Dionysos']],
          ['Quel dieu règne sur le monde des morts ?', 'Hadès', ['Zeus', 'Poséidon', 'Apollon', 'Dionysos']]],
        difficile: [['Quel dieu romain a donné son nom au mois de mars ?', 'Mars', ['Jupiter', 'Mercure', 'Neptune', 'Vulcain', 'Janus']],
          ['Quel dieu romain à deux visages a donné son nom à janvier ?', 'Janus', ['Jupiter', 'Mars', 'Saturne', 'Pluton', 'Vulcain']],
          ['Quel dieu a le même nom chez les Grecs et chez les Romains ?', 'Apollon', ['Zeus', 'Arès', 'Hermès', 'Hadès', 'Dionysos']]],
        expert: [['Qui est la mère de Zeus ?', 'Rhéa', ['Héra', 'Gaïa', 'Déméter', 'Thétis', 'Léto', 'Métis']],
          ['Quel Titan porte le ciel sur ses épaules ?', 'Atlas', ['Cronos', 'Prométhée', 'Hypérion', 'Océan', 'Ouranos', 'Japet']],
          ['Comment s’appelle la boisson des dieux grecs ?', 'Le nectar', ['L’ambroisie', 'L’hydromel', 'La cervoise', 'Le vin de Chios', 'Le garum']]]
      } }
    ] },
    { id: 'a02', matiere: 'histoire', famille: 'ant', nom: 'Dieux égyptiens', court: 'Dieux du Nil', icone: '🐍', series: [
      { k: 'paires', gauche: 'Dieu', droite: 'Ce qu’il représente', consigneR: 'Relie chaque description au dieu égyptien.',
        q: 'Quel dieu égyptien : {b} ?', inverseSeul: true, niveaux: {
          facile: [['Râ|Ra|Rê', 'Le Soleil'], ['Anubis', 'La momification, à tête de chacal'], ['Osiris', 'Le roi des morts'],
            ['Horus', 'Le dieu à tête de faucon'], ['Isis', 'La grande magicienne, épouse d’Osiris']],
          moyen: [['Thot', 'L’écriture, à tête d’ibis'], ['Bastet', 'La déesse chatte'], ['Sobek', 'Le dieu crocodile'],
            ['Hathor', 'La déesse vache, de la joie et de la musique'], ['Seth', 'Le désordre et le désert']],
          difficile: [['Amon', 'Le roi des dieux, adoré à Thèbes'], ['Ptah', 'Le dieu des artisans, à Memphis'], ['Khnoum', 'Le potier à tête de bélier'],
            ['Maât|Maat', 'La justice, une plume sur la tête'], ['Sekhmet', 'La déesse lionne'], ['Nout', 'La déesse du ciel']],
          expert: [['Atoum', 'Le créateur du monde, à Héliopolis'], ['Hâpy|Hapy', 'La crue du Nil'], ['Taouret|Thouéris', 'La déesse hippopotame qui protège les naissances'],
            ['Bès|Bes', 'Le nain qui protège les maisons'], ['Khépri|Khepri', 'Le scarabée, soleil du matin'], ['Aton', 'Le disque solaire adoré par Akhenaton'],
            ['Ammit|Ammout', 'La dévoreuse des cœurs des méchants']]
        } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le dieu égyptien.', niveaux: {
        facile: [{ r: 'Anubis', i: ['Je suis un dieu égyptien.', 'Je veille sur les tombes.', 'J’aide à préparer les momies.', 'Je suis noir comme la terre du Nil.', 'J’ai une tête de chacal.'] },
          { r: 'Râ', i: ['Je suis un dieu égyptien très important.', 'Je traverse le ciel dans une barque.', 'La nuit, je voyage sous la terre.', 'Je porte un disque sur la tête.', 'Je suis le dieu du Soleil.'] }],
        moyen: [{ r: 'Thot', i: ['Je suis un dieu égyptien.', 'Je suis le dieu du savoir et de la Lune.', 'Les scribes me prient.', 'J’ai une tête d’ibis, un oiseau au long bec.', 'J’ai inventé l’écriture, selon les Égyptiens.'] },
          { r: 'Bastet', i: ['Je suis une déesse égyptienne.', 'Je protège les maisons et les familles.', 'On m’adorait à Bubastis.', 'On a momifié beaucoup d’animaux en mon honneur.', 'Je suis une déesse chatte.'] }],
        difficile: [{ r: 'Maât', i: ['Je suis une déesse égyptienne.', 'Je suis l’ordre du monde.', 'Au jugement des morts, on pèse le cœur face à moi.', 'Je suis la vérité et la justice.', 'Je porte une plume d’autruche sur la tête.'] }],
        expert: [{ r: 'Khépri', i: ['Je suis un dieu égyptien.', 'Je suis une forme du Soleil.', 'On porte mon image comme porte-bonheur.', 'Je suis le soleil du matin.', 'Je suis un scarabée qui pousse le Soleil comme une boule.'] }]
      } }
    ] },
    { id: 'a03', matiere: 'histoire', famille: 'ant', nom: 'Pharaons', court: 'Pharaons', icone: '🔺', series: [
      { k: 'paires', gauche: 'Pharaon', droite: 'Ce qui l’a rendu célèbre', consigneR: 'Relie chaque fait au pharaon.',
        q: 'Quel pharaon : {b} ?', inverseSeul: true, niveaux: {
          facile: [['Khéops|Kheops', 'La plus grande pyramide de Gizeh'], ['Toutânkhamon|Toutankhamon', 'Son tombeau plein d’or est découvert en 1922'],
            ['Ramsès II|Ramses II|Ramsès', 'Il règne 66 ans et fait bâtir Abou Simbel'], ['Cléopâtre|Cleopatre', 'La dernière reine d’Égypte, alliée de César']],
          moyen: [['Akhenaton', 'Il fait adorer un seul dieu : Aton'], ['Hatchepsout', 'Une femme devenue pharaon'], ['Narmer', 'Il unit la Haute et la Basse-Égypte'],
            ['Djéser|Djeser', 'La première pyramide, à degrés'], ['Khéphren|Khephren', 'On lui attribue le grand Sphinx de Gizeh']],
          difficile: [['Thoutmôsis III|Thoutmosis III', 'Grand conquérant, jusqu’à l’Euphrate'], ['Mykérinos|Mykerinos', 'La plus petite des trois pyramides de Gizeh'],
            ['Snéfrou|Snefrou', 'La pyramide rhomboïdale et la pyramide rouge'], ['Séthi Ier|Sethi Ier|Séthi', 'Le père de Ramsès II'],
            ['Ahmôsis|Ahmosis', 'Il chasse les Hyksôs d’Égypte'], ['Amenhotep III', 'Les colosses de Memnon gardaient son temple']],
          expert: [['Mentouhotep II', 'Il réunifie l’Égypte : début du Moyen Empire'], ['Sésostris III|Sesostris III', 'Il conquiert la Nubie au Moyen Empire'],
            ['Ramsès III|Ramses III', 'Il repousse les Peuples de la mer'], ['Ptolémée Ier|Ptolemee Ier', 'Général d’Alexandre le Grand devenu pharaon'],
            ['Nectanébo II|Nectanebo II', 'Le dernier pharaon né en Égypte'], ['Pépi II|Pepi II', 'Monté sur le trône enfant, il règne plusieurs dizaines d’années']]
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
    { id: 'a04', matiere: 'histoire', famille: 'ant', nom: 'Héros et mythes', court: 'Héros', icone: '🦸', series: [
      { k: 'paires', gauche: 'Personnage', droite: 'Exploit', consigneR: 'Relie chaque histoire à son personnage.',
        q: 'Quel personnage : {b} ?', inverseSeul: true, niveaux: {
          facile: [['Thésée|Thesee', 'Il tue le Minotaure dans le labyrinthe'], ['Persée|Persee', 'Il coupe la tête de Méduse'],
            ['Hercule|Héraclès|Heracles', 'Il réalise douze travaux'], ['Ulysse', 'Il imagine le cheval de Troie'],
            ['Icare', 'Il vole trop près du Soleil avec des ailes de cire']],
          moyen: [['Jason', 'Il part chercher la Toison d’or'], ['Achille', 'Seul son talon peut être blessé'], ['Pandore', 'Elle ouvre la jarre qui libère les malheurs'],
            ['Orphée|Orphee', 'Il descend aux Enfers chercher Eurydice'], ['Romulus', 'Il fonde Rome'], ['Prométhée|Promethee', 'Il vole le feu des dieux pour les hommes']],
          difficile: [['Bellérophon|Bellerophon', 'Monté sur Pégase, il tue la Chimère'], ['Œdipe|Oedipe', 'Il résout l’énigme du Sphinx'],
            ['Atalante', 'Une chasseuse plus rapide que tous à la course'], ['Énée|Enee', 'Il fuit Troie en flammes et arrive en Italie'],
            ['Hector', 'Le plus grand héros troyen, tué par Achille'], ['Pâris|Paris', 'Il enlève Hélène, ce qui déclenche la guerre de Troie']],
          expert: [['Midas', 'Tout ce qu’il touche se change en or'], ['Narcisse', 'Il tombe amoureux de son reflet'], ['Sisyphe', 'Il pousse un rocher qui retombe sans fin'],
            ['Tantale', 'L’eau et les fruits s’éloignent quand il veut les prendre'], ['Dédale|Dedale', 'L’architecte qui construit le labyrinthe'],
            ['Arachné|Arachne', 'Changée en araignée par Athéna'], ['Méléagre|Meleagre', 'Il tue le sanglier de Calydon']]
        } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le héros.', niveaux: {
        facile: [{ r: 'Thésée', i: ['Je suis un héros grec.', 'Mon père, Égée, était roi d’Athènes.', 'Ariane m’a donné une pelote de fil.', 'Je suis entré dans le labyrinthe de Crète.', 'J’ai tué le Minotaure.'] },
          { r: 'Ulysse', i: ['Je suis un héros grec.', 'Je suis roi d’Ithaque.', 'Ma femme Pénélope m’a attendu vingt ans.', 'J’ai trompé le cyclope Polyphème.', 'J’ai eu l’idée du cheval de Troie.'] }],
        moyen: [{ r: 'Jason', i: ['Je suis un héros grec.', 'Mon oncle m’a pris mon trône.', 'Mon bateau s’appelait l’Argo.', 'Médée m’a aidé grâce à sa magie.', 'J’ai rapporté la Toison d’or.'] }],
        difficile: [{ r: 'Œdipe', i: ['Je suis un héros grec.', 'Je suis devenu roi de Thèbes.', 'Bébé, j’ai été abandonné dans la montagne.', 'Un monstre posait une énigme sur un animal à 4, 2 puis 3 pattes.', 'J’ai trouvé la réponse à l’énigme du Sphinx : l’homme.'] }],
        expert: [{ r: 'Sisyphe', i: ['Je suis un roi de la mythologie grecque.', 'J’ai fondé la ville de Corinthe.', 'J’ai enchaîné la Mort pour ne pas mourir.', 'Les dieux m’ont puni aux Enfers.', 'Je pousse un rocher en haut d’une colline, et il retombe toujours.'] }]
      } }
    ] },
    { id: 'a05', matiere: 'histoire', famille: 'ant', nom: 'Rome, de la fondation à la chute', court: 'Rome', icone: '🏛️', series: [
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
    { id: 'a06', matiere: 'histoire', famille: 'ant', nom: 'La Gaule', court: 'Gaule', icone: '🛡️', series: [
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
      { k: 'qcm', niveaux: {
        facile: [['Quel chef gaulois a résisté à Jules César ?', 'Vercingétorix', ['Astérix', 'Clovis', 'Charlemagne']],
          ['Dans quelle ville Vercingétorix se rend-il à César en 52 av. J.-C. ?', 'Alésia', ['Lutèce', 'Rome', 'Gergovie']],
          ['Comment s’appellent les prêtres gaulois ?', 'Les druides', ['Les pharaons', 'Les moines', 'Les vestales']]],
        moyen: [['Quelle victoire Vercingétorix remporte-t-il contre César ?', 'Gergovie', ['Alésia', 'Bibracte', 'Lutèce', 'Avaricum']],
          ['Quel général romain a conquis la Gaule ?', 'Jules César', ['Auguste', 'Néron', 'Hannibal', 'Trajan']],
          ['Comment s’appelle le grand village fortifié des Gaulois ?', 'L’oppidum', ['Le castrum', 'Le forum', 'La villa', 'Le donjon']]],
        difficile: [['De quel peuple Vercingétorix était-il le chef ?', 'Les Arvernes', ['Les Éduens', 'Les Parisii', 'Les Belges', 'Les Helvètes', 'Les Vénètes']],
          ['Comment César a-t-il appelé son livre sur la conquête ?', 'La Guerre des Gaules', ['L’Énéide', 'L’Odyssée', 'Les Métamorphoses', 'Les Vies parallèles', 'L’Iliade']],
          ['Qu’arrive-t-il à Vercingétorix après Alésia ?', 'Il est emmené à Rome puis exécuté', ['Il devient sénateur', 'Il s’enfuit en Bretagne', 'Il devient roi de Gaule', 'Il part en Égypte', 'Il est libéré']]],
        expert: [['Quel peuple gaulois a donné son nom à Paris ?', 'Les Parisii', ['Les Arvernes', 'Les Éduens', 'Les Sénons', 'Les Carnutes', 'Les Lingons']],
          ['Selon Pline, quelle plante les druides coupaient-ils avec une serpe d’or ?', 'Le gui', ['Le houx', 'Le lierre', 'Le chêne', 'Le laurier', 'La verveine']],
          ['Quel peuple gaulois avait son oppidum à Bibracte ?', 'Les Éduens', ['Les Arvernes', 'Les Parisii', 'Les Bituriges', 'Les Vénètes', 'Les Rèmes']]]
      } }
    ] },
    { id: 'a07', matiere: 'histoire', famille: 'ant', nom: 'Monuments antiques', court: 'Monuments', icone: '🏟️', series: [
      { k: 'paires', gauche: 'Monument', droite: 'Lieu', consigneR: 'Relie chaque monument à son lieu.',
        q: 'Où se trouve ce monument : {a} ?', ouverte: false, niveaux: {
          facile: [['Le Colisée', 'Rome'], ['Le Parthénon', 'Athènes'], ['Les pyramides de Gizeh', 'L’Égypte'], ['Le pont du Gard', 'Le sud de la France']],
          moyen: [['La Maison carrée', 'Nîmes'], ['Pompéi', 'Près de Naples'], ['Le mur d’Hadrien', 'Le nord de l’Angleterre'],
            ['Les temples d’Abou Simbel', 'Le sud de l’Égypte'], ['Pétra, la ville taillée dans la roche', 'La Jordanie']]
        } },
      { k: 'paires', gauche: 'Site', droite: 'Pays actuel', consigneR: 'Relie chaque site antique à son pays actuel.',
        q: 'Dans quel pays actuel se trouve ce site : {a} ?', ouverte: false, niveaux: {
          difficile: [['Le temple de Karnak', 'L’Égypte'], ['Le théâtre d’Épidaure', 'La Grèce'], ['Leptis Magna', 'La Libye'], ['Persépolis', 'L’Iran'],
            ['Palmyre', 'La Syrie'], ['Éphèse', 'La Turquie'], ['Carthage', 'La Tunisie']],
          expert: [['Volubilis', 'Le Maroc'], ['Timgad', 'L’Algérie'], ['Baalbek', 'Le Liban'], ['La Porta Nigra de Trèves', 'L’Allemagne'],
            ['Le théâtre romain de Mérida', 'L’Espagne'], ['Jerash', 'La Jordanie'], ['L’amphithéâtre d’El Jem', 'La Tunisie']]
        } }
    ] },
    { id: 'a08', matiere: 'histoire', famille: 'ant', nom: 'Les 7 merveilles du monde', court: '7 merveilles', icone: '🌟', series: [
      { k: 'qcm', niveaux: {
        facile: [['Laquelle des 7 merveilles du monde antique existe encore ?', 'La pyramide de Khéops', ['Le phare d’Alexandrie', 'Le Colosse de Rhodes', 'Les jardins de Babylone']],
          ['Combien y avait-il de merveilles du monde antique ?', '7', ['3', '10', '12']],
          ['Dans quel pays se trouve la pyramide de Khéops ?', 'L’Égypte', ['La Grèce', 'L’Italie', 'Le Mexique']]],
        moyen: [['Quelle merveille était un géant de bronze à l’entrée d’un port ?', 'Le Colosse de Rhodes', ['Le phare d’Alexandrie', 'La statue de Zeus', 'Le Mausolée d’Halicarnasse', 'Le temple d’Artémis']],
          ['Dans quelle ville se trouvaient les jardins suspendus, selon la légende ?', 'Babylone', ['Athènes', 'Rome', 'Alexandrie', 'Memphis']],
          ['Dans quelle ville se trouvait le célèbre phare de l’Antiquité ?', 'Alexandrie', ['Rhodes', 'Athènes', 'Carthage', 'Rome']],
          ['Où se trouvait la grande statue de Zeus ?', 'À Olympie', ['À Athènes', 'À Rome', 'À Sparte', 'À Delphes']]],
        difficile: [['Quelle merveille était le tombeau d’un roi de Carie ?', 'Le Mausolée d’Halicarnasse', ['Le temple d’Artémis', 'Le phare d’Alexandrie', 'Le Colosse de Rhodes', 'La statue de Zeus', 'Les jardins de Babylone']],
          ['Dans quelle ville se trouvait le temple d’Artémis ?', 'Éphèse', ['Athènes', 'Olympie', 'Rhodes', 'Alexandrie', 'Corinthe']],
          ['Quel sculpteur a créé la statue de Zeus à Olympie ?', 'Phidias', ['Praxitèle', 'Michel-Ange', 'Myron', 'Polyclète', 'Lysippe']],
          ['L’île de Pharos a donné un mot à la langue française. Lequel ?', 'Phare', ['Pharmacie', 'Pharaon', 'Fard', 'Farine', 'Fanal']]],
        expert: [['Qui a incendié le temple d’Artémis en 356 av. J.-C. pour devenir célèbre ?', 'Érostrate', ['Alexandre le Grand', 'Néron', 'Darius', 'Xerxès', 'Périclès', 'Hannibal']],
          ['Quelle ville turque se trouve aujourd’hui à la place d’Halicarnasse ?', 'Bodrum', ['Istanbul', 'Izmir', 'Antalya', 'Ankara', 'Troie', 'Éphèse']],
          ['Quel dieu représentait le Colosse de Rhodes ?', 'Hélios, le Soleil', ['Zeus', 'Poséidon', 'Apollon', 'Arès', 'Hermès', 'Héraclès']],
          ['Qui a fait bâtir le Mausolée pour le roi Mausole ?', 'Son épouse Artémise', ['Son fils', 'Alexandre le Grand', 'Le roi de Perse', 'Les Athéniens', 'Les Romains', 'Le pharaon']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['La pyramide de Khéops est la plus ancienne des 7 merveilles.', true, ''],
          ['La tour Eiffel fait partie des 7 merveilles du monde antique.', false, 'Elle date de 1889 : bien après l’Antiquité.']],
        moyen: [['Le Colosse de Rhodes a été renversé par un tremblement de terre.', true, ''],
          ['Les jardins suspendus de Babylone ont été retrouvés intacts.', false, 'On n’a jamais trouvé de traces sûres de ces jardins.']],
        difficile: [['Le phare d’Alexandrie a été détruit par des tremblements de terre.', true, ''],
          ['La statue de Zeus à Olympie était en marbre blanc.', false, 'Elle était faite d’or et d’ivoire, sur une structure en bois.']],
        expert: [['Le mot « mausolée » vient du roi Mausole.', true, ''],
          ['Le temple d’Artémis n’a jamais été reconstruit.', false, 'Il a été reconstruit après l’incendie de 356 av. J.-C.']]
      } }
    ] },
    { id: 'a09', matiere: 'histoire', famille: 'ant', nom: 'Écritures anciennes', court: 'Écritures', icone: '📜', series: [
      { k: 'paires', gauche: 'Écriture', droite: 'Peuple', consigneR: 'Relie chaque écriture au peuple qui l’utilisait.',
        q: 'Quel peuple utilisait cette écriture : {a} ?', ouverte: false, niveaux: {
          facile: [['Les hiéroglyphes', 'Les Égyptiens'], ['Le cunéiforme', 'Les Mésopotamiens'], ['L’alphabet grec', 'Les Grecs'], ['L’alphabet latin', 'Les Romains']],
          difficile: [['Les runes', 'Les peuples germaniques'], ['Les caractères chinois', 'Les Chinois'], ['L’alphabet phénicien', 'Les Phéniciens'],
            ['Les glyphes mayas', 'Les Mayas'], ['L’alphabet hébreu', 'Les Hébreux'], ['L’alphabet étrusque', 'Les Étrusques']]
        } },
      { k: 'qcm', niveaux: {
        moyen: [['Sur quoi les Égyptiens écrivaient-ils ?', 'Le papyrus', ['Le papier', 'Le parchemin', 'Le tissu', 'L’ardoise']],
          ['Sur quoi écrivait-on le cunéiforme ?', 'Des tablettes d’argile', ['Du papyrus', 'Du papier', 'Des feuilles de palmier', 'Des tablettes de cire']],
          ['Quelle pierre a permis de comprendre les hiéroglyphes ?', 'La pierre de Rosette', ['La pierre philosophale', 'Le menhir de Carnac', 'La pierre de Lune', 'Le code d’Hammurabi']],
          ['Comment appelle-t-on celui dont le métier est d’écrire, en Égypte ?', 'Le scribe', ['Le prêtre', 'Le vizir', 'Le pharaon', 'L’artisan']],
          ['Où l’écriture est-elle apparue en premier, vers 3300 av. J.-C. ?', 'En Mésopotamie', ['En Grèce', 'À Rome', 'En Gaule', 'En Chine']]],
        expert: [['Quelles sont les trois écritures de la pierre de Rosette ?', 'Hiéroglyphes, démotique et grec', ['Hiéroglyphes, latin et grec', 'Cunéiforme, grec et latin', 'Hiéroglyphes, hébreu et grec', 'Démotique, latin et phénicien', 'Hiératique, cunéiforme et grec']],
          ['Qui a déchiffré le linéaire B en 1952 ?', 'Michael Ventris', ['Jean-François Champollion', 'Howard Carter', 'Heinrich Schliemann', 'Arthur Evans', 'Henry Rawlinson']],
          ['Comment s’appelle l’écriture plus rapide des scribes égyptiens, tirée des hiéroglyphes ?', 'Le hiératique', ['Le cunéiforme', 'Le linéaire A', 'Le copte', 'L’araméen', 'Le sanskrit']],
          ['Combien de lettres compte l’alphabet grec ?', '24', ['22', '26', '20', '30', '33']],
          ['Dans quel musée se trouve la pierre de Rosette ?', 'Le British Museum, à Londres', ['Le Louvre, à Paris', 'Le musée du Caire', 'Le Metropolitan Museum, à New York', 'Le musée de l’Acropole', 'Le Vatican']]],
        difficile: [['En quelle année Champollion annonce-t-il qu’il a compris les hiéroglyphes ?', '1822', ['1799', '1789', '1850', '1901', '1715']],
          ['Avec quoi écrivait-on sur l’argile en Mésopotamie ?', 'Un roseau taillé, le calame', ['Une plume d’oie', 'Un pinceau', 'Un stylo', 'Un burin en fer', 'Un morceau de charbon']]]
      } }
    ] },
    { id: 'a10', matiere: 'histoire', famille: 'ant', nom: 'Chiffres romains', court: 'I, V, X…', icone: 'Ⅻ', series: [
      { k: 'paires', gauche: 'Chiffres romains', droite: 'Nombre', formats: ['Q', 'O'],
        q: 'Combien vaut {a} ?', qi: 'Comment écrit-on {b} en chiffres romains ?', niveaux: ROMAINS }
    ] },
    { id: 'a11', matiere: 'histoire', famille: 'ant', nom: 'Vie quotidienne', court: 'Vie antique', icone: '🏺', series: [
      { k: 'paires', gauche: 'Mot', droite: 'Définition', consigneR: 'Relie chaque définition à son mot.',
        q: 'Quel mot : {b} ?', inverseSeul: true, niveaux: {
          facile: [['Les thermes', 'Les bains publics'], ['Le forum', 'La grande place au centre de la ville romaine'], ['Le gladiateur', 'Il combat dans l’arène'],
            ['La toge', 'Le vêtement du citoyen romain'], ['L’amphithéâtre|Amphitheatre', 'On y regarde les combats de gladiateurs']],
          moyen: [['Le sénat', 'L’assemblée des anciens qui conseille Rome'], ['La démocratie', 'Le pouvoir du peuple, inventé à Athènes'],
            ['L’aqueduc|Aqueduc', 'Un canal qui amène l’eau dans les villes'], ['Le légionnaire', 'Le soldat de l’armée romaine'],
            ['La villa', 'Une grande maison à la campagne'], ['L’esclave|Esclave', 'Une personne qui appartient à un maître']],
          difficile: [['Le patricien', 'Membre d’une riche famille noble de Rome'], ['Le plébéien', 'Homme du peuple à Rome'], ['L’agora|Agora', 'La place publique d’une cité grecque'],
            ['La domus', 'La maison d’une riche famille, en ville'], ['L’insula|Insula', 'Un immeuble où vivent les Romains pauvres'],
            ['Le consul', 'L’un des deux chefs élus pour un an à Rome'], ['La cité', 'Une ville et ses terres, qui se gouvernent seules en Grèce']],
          expert: [['L’hoplite|Hoplite', 'Le fantassin grec, avec bouclier et lance'], ['L’ostracisme|Ostracisme', 'Un vote d’Athènes pour exiler un citoyen'],
            ['Le tribun de la plèbe', 'Il défend les plébéiens à Rome'], ['Le péplos|Peplos', 'La longue tunique des femmes grecques'],
            ['Le triclinium', 'La salle à manger, où l’on mange couché'], ['L’atrium|Atrium', 'La pièce d’entrée avec un bassin'],
            ['L’hypocauste|Hypocauste', 'Le chauffage par le sol des thermes']]
        } }
    ] },
    { id: 'a12', matiere: 'histoire', famille: 'ant', nom: 'Jeux olympiques antiques', court: 'Olympie', icone: '🥇', series: [
      { k: 'vf', niveaux: {
        facile: [['Les Jeux olympiques antiques avaient lieu à Olympie, en Grèce.', true, ''],
          ['Les Jeux olympiques étaient organisés en l’honneur de Zeus.', true, ''],
          ['Les vainqueurs recevaient une médaille d’or.', false, 'Ils recevaient une couronne d’olivier.']],
        moyen: [['Les Jeux avaient lieu tous les 4 ans.', true, ''],
          ['Les femmes mariées pouvaient participer aux Jeux.', false, 'Elles n’avaient même pas le droit de les regarder.'],
          ['Pendant les Jeux, une trêve sacrée arrêtait les guerres entre cités.', true, '']],
        difficile: [['Les athlètes concouraient nus.', true, ''],
          ['Le pancrace mélangeait la lutte et la boxe.', true, ''],
          ['Le marathon faisait partie des Jeux antiques.', false, 'Le marathon a été créé pour les Jeux modernes de 1896.']],
        expert: [['Les juges des Jeux s’appelaient les hellanodices.', true, ''],
          ['Les Héraia étaient des jeux réservés aux jeunes filles, en l’honneur d’Héra.', true, ''],
          ['Le pentathlon antique comprenait la natation.', false, 'Il comprenait la course, le saut en longueur, le disque, le javelot et la lutte.']]
      } },
      { k: 'qcm', vf: false, niveaux: {
        facile: [['Que recevait le vainqueur d’une épreuve ?', 'Une couronne d’olivier', ['Une médaille d’or', 'Une coupe', 'Un cheval']]],
        moyen: [['En quelle année ont eu lieu les premiers Jeux, selon la tradition ?', '776 av. J.-C.', ['1896', '476', '44 av. J.-C.', '1200 av. J.-C.']]],
        difficile: [['Quelle était la course la plus ancienne des Jeux ?', 'Le stade, environ 192 mètres', ['Le marathon', 'Le 10 000 mètres', 'Le relais', 'La course de haies', 'Le cross']]],
        expert: [['Qui a recréé les Jeux olympiques modernes ?', 'Pierre de Coubertin', ['Jules Ferry', 'Victor Hugo', 'Jules Verne', 'Louis Pasteur', 'Gustave Eiffel']],
          ['Quelle Spartiate a été la première femme à gagner aux Jeux, avec ses chevaux ?', 'Cynisca|Kyniska', ['Hélène', 'Cléopâtre', 'Sappho', 'Artémise', 'Pénélope']]]
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
