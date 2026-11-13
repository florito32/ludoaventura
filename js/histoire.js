// Histoire (v7.1) : la matière Histoire, rangée par périodes (BACKLOG lignes 270 et 275).
// Choix de l'utilisateur du 12/11/2026 : 7 périodes, 51 jeux, 4 niveaux, et chaque niveau n'a QUE son
// propre contenu (Expert = seulement du contenu expert). Livraison par période : l'Antiquité d'abord (ses
// 12 jeux sont tous retenus), puis la Préhistoire (v7.6, 5 jeux), le Moyen Âge (v7.7, 8 jeux), la Renaissance (v7.8, 6 jeux) les Temps modernes (v7.9, 4 jeux) et la Révolution et le XIXe siècle (v7.10, 9 jeux) ; le XXe siècle viendra ensuite.
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
    ] },    // ---------- Moyen Âge (v7.7, BACKLOG ligne 295 : 8 jeux, hypothèse à valider) ----------
    { id: 'm01', matiere: 'histoire', famille: 'mag', nom: 'Rois de France', court: 'Rois', icone: '👑', series: [
      { k: 'paires', gauche: 'Roi', droite: 'Ce qu’il a fait', consigneR: 'Relie chaque roi à ce qui le rend célèbre.', q: 'Pourquoi {a} est-il célèbre ?', qi: 'Quel roi : {b} ?', ouverte: false, niveaux: {
        facile: [['Clovis', 'Roi des Francs baptisé à Reims'], ['Charlemagne', 'Couronné empereur en l’an 800'], ['Saint Louis', 'Rendait la justice sous un chêne']],
        moyen: [['Hugues Capet', 'Élu roi en 987, premier des Capétiens'], ['Philippe Auguste', 'Vainqueur à Bouvines en 1214'], ['Charles VII', 'Sacré à Reims grâce à Jeanne d’Arc'],
          ['Pépin le Bref', 'Premier roi carolingien']],
        difficile: [['Dagobert Ier', 'Roi mérovingien conseillé par saint Éloi'], ['Charles Martel', 'Chef franc vainqueur à Poitiers en 732'], ['Philippe le Bel', 'Fait arrêter les Templiers'],
          ['Louis XI', 'Surnommé « l’universelle aragne »'], ['Charles le Chauve', 'Reçoit l’ouest de l’empire au traité de Verdun']],
        expert: [['Robert le Pieux', 'Fils d’Hugues Capet'], ['Louis VI le Gros', 'Conseillé par l’abbé Suger'], ['Louis VII', 'Premier mari d’Aliénor d’Aquitaine'],
          ['Jean le Bon', 'Fait prisonnier à la bataille de Poitiers en 1356'], ['Charles V le Sage', 'Son connétable était Du Guesclin'], ['Charles VI', 'Surnommé le Fou, ou le Bien-Aimé']]
      } },
      { k: 'indices', consigne: 'Qui suis-je ? Trouve le roi.', niveaux: {
        facile: [{ r: 'Charlemagne', i: ['Je suis le fils de Pépin le Bref.', 'J’ai combattu les Saxons et les Lombards.', 'Ma ville préférée était Aix-la-Chapelle.', 'On dit, à tort, que j’ai inventé l’école.', 'J’ai été couronné empereur à Rome en l’an 800.'] },
          { r: 'Clovis', i: ['Je suis roi des Francs.', 'Mon père s’appelait Childéric.', 'On raconte l’histoire de mon vase brisé à Soissons.', 'Ma femme, Clotilde, était chrétienne.', 'J’ai été baptisé à Reims par l’évêque Remi.'] }],
        moyen: [{ r: 'Saint Louis', i: ['Je suis roi de France au XIIIe siècle.', 'Ma mère, Blanche de Castille, a gouverné pendant mon enfance.', 'J’ai fait construire la Sainte-Chapelle à Paris.', 'Je suis mort à Tunis pendant une croisade.', 'On dit que je rendais la justice sous un chêne à Vincennes.'] }],
        difficile: [{ r: 'Philippe Auguste', i: ['Je suis un roi capétien.', 'J’ai beaucoup agrandi le domaine royal.', 'J’ai fait entourer Paris d’un rempart et construire le premier Louvre.', 'Je suis parti en croisade avec Richard Cœur de Lion.', 'J’ai gagné la bataille de Bouvines en 1214.'] }],
        expert: [{ r: 'Hugues Capet', i: ['J’étais duc des Francs.', 'Mon surnom viendrait d’une cape d’abbé.', 'Les grands seigneurs m’ont élu roi.', 'Je suis devenu roi en 987.', 'Ma dynastie porte mon nom : les Capétiens.'] }]
      } }
    ] },
    { id: 'm02', matiere: 'histoire', famille: 'mag', nom: 'Le château fort', court: 'Château fort', icone: '🏰', series: [
      { k: 'paires', gauche: 'Partie du château', droite: 'Ce que c’est', consigneR: 'Relie chaque partie du château fort à ce qu’elle est.', q: 'Qu’est-ce que {a} ?', qi: 'Comment s’appelle : {b} ?', niveaux: {
        facile: [['le donjon', 'La plus haute tour, dernier refuge'], ['le pont-levis', 'Un pont qu’on relève'], ['les douves', 'Un fossé rempli d’eau'], ['les créneaux', 'Les découpes en haut des murs']],
        moyen: [['la herse', 'Une grille qui descend pour fermer la porte'], ['le chemin de ronde', 'Le passage en haut des remparts'], ['la meurtrière', 'Une fente étroite pour tirer à l’arc'],
          ['la basse-cour', 'La cour où vivent les gens et les animaux']],
        difficile: [['les mâchicoulis', 'Des trous au sol d’un balcon de pierre pour jeter des projectiles'], ['le hourd', 'Une galerie en bois en haut des murs'], ['la barbacane', 'Un ouvrage avancé qui protège l’entrée'],
          ['la courtine', 'Le mur entre deux tours'], ['la motte', 'La butte de terre des premiers châteaux']],
        expert: [['le merlon', 'La partie pleine entre deux créneaux'], ['l’échauguette', 'Une petite tour accrochée en haut d’un mur'], ['la poterne', 'Une petite porte discrète'],
          ['le châtelet', 'Le bâtiment fortifié qui garde l’entrée'], ['la bretèche', 'Un petit balcon fermé au-dessus d’une porte'], ['l’assommoir', 'Un trou dans la voûte de l’entrée pour frapper les assaillants']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['En quoi étaient construits les premiers châteaux forts, vers l’an 1000 ?', 'En bois', ['En béton', 'En verre']],
          ['Qui habitait le château fort ?', 'Le seigneur et sa famille', ['Le pape', 'Les moines']]],
        moyen: [['Quelle machine lançait de grosses pierres contre les murs ?', 'Le trébuchet', ['Le bélier', 'La tour de siège', 'L’arbalète']],
          ['Comment appelle-t-on l’attaque d’un château qu’on encercle longtemps ?', 'Un siège', ['Un tournoi', 'Une croisade', 'Un adoubement']]],
        difficile: [['Quel château de Richard Cœur de Lion domine la Seine, aux Andelys ?', 'Château-Gaillard', ['Carcassonne', 'Chinon', 'Pierrefonds', 'Vincennes']],
          ['Quelle cité fortifiée, avec deux rangs de remparts, se trouve dans l’Aude ?', 'Carcassonne', ['Aigues-Mortes', 'Provins', 'Avignon', 'Saint-Malo']]],
        expert: [['Quel architecte a restauré Carcassonne et Pierrefonds au XIXe siècle ?', 'Viollet-le-Duc', ['Vauban', 'Haussmann', 'Gustave Eiffel', 'Le Nôtre', 'Mansart']],
          ['Quel roi a fait construire le Louvre, d’abord une forteresse ?', 'Philippe Auguste', ['Saint Louis', 'Charlemagne', 'Louis XIV', 'François Ier', 'Clovis']]]
      } }
    ] },
    { id: 'm03', matiere: 'histoire', famille: 'mag', nom: 'Chevaliers', court: 'Chevaliers', icone: '⚔️', series: [
      { k: 'paires', gauche: 'Mot', droite: 'Ce qu’il veut dire', consigneR: 'Relie chaque mot de la chevalerie à son sens.', q: 'Que veut dire « {a} » ?', qi: 'Quel mot veut dire : {b} ?', niveaux: {
        facile: [['adoubement', 'La cérémonie pour devenir chevalier'], ['tournoi', 'Un combat pour s’entraîner et montrer sa force'], ['armure', 'Le costume de métal qui protège'], ['écu', 'Le bouclier du chevalier']],
        moyen: [['page', 'Un jeune garçon qui commence à servir un seigneur'], ['écuyer', 'Celui qui aide le chevalier et porte ses armes'], ['joute', 'Un duel à cheval, avec une lance'], ['destrier', 'Le cheval de combat']],
        difficile: [['cotte de mailles', 'Une chemise faite d’anneaux de fer'], ['heaume', 'Le casque qui couvre toute la tête'], ['blason', 'Les dessins et couleurs qui font reconnaître un chevalier'],
          ['ost', 'L’armée que le vassal doit au seigneur'], ['croisade', 'Une expédition militaire vers Jérusalem']],
        expert: [['palefroi', 'Le cheval de voyage'], ['colée', 'Le coup donné au futur chevalier pendant l’adoubement'], ['éperons', 'Des pointes aux talons pour diriger le cheval'],
          ['lice', 'Le terrain clos des tournois'], ['Templiers', 'Des moines-soldats'], ['courtoisie', 'Les belles manières du chevalier envers les dames']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Quel animal accompagne toujours le chevalier ?', 'Le cheval', ['Le chien', 'L’âne']]],
        moyen: [['Qui adoubait le futur chevalier ?', 'Un seigneur ou un chevalier', ['Le pape', 'Un paysan', 'Un marchand']]],
        difficile: [['Quel chevalier breton est devenu connétable de France sous Charles V ?', 'Bertrand Du Guesclin', ['Bayard', 'Godefroy de Bouillon', 'Roland', 'Lancelot']],
          ['Où Roland, neveu de Charlemagne, est-il mort en 778 ?', 'À Roncevaux', ['À Poitiers', 'À Alésia', 'À Bouvines', 'À Azincourt']]],
        expert: [['Quel ordre de chevaliers-moines Philippe le Bel a-t-il fait arrêter en 1307 ?', 'Les Templiers', ['Les Hospitaliers', 'Les Chevaliers teutoniques', 'Les Bénédictins', 'Les Cisterciens', 'Les Franciscains']],
          ['Quel poème raconte la mort de Roland ?', 'La Chanson de Roland', ['Le Roman de Renart', 'Tristan et Iseut', 'Perceval', 'Le Cid', 'Les Fabliaux']]]
      } }
    ] },
    { id: 'm05', matiere: 'histoire', famille: 'mag', nom: 'Jeanne d’Arc et la guerre de Cent Ans', court: 'Jeanne d’Arc', icone: '🗡️', series: [
      { k: 'ordre', consigne: 'Range ces événements de la guerre de Cent Ans du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Début de la guerre de Cent Ans', 1337, '1337'], ['Jeanne d’Arc délivre Orléans', 1429, '1429'], ['Jeanne d’Arc est brûlée à Rouen', 1431, '1431'], ['Fin de la guerre de Cent Ans', 1453, '1453']],
        moyen: [['Bataille de Crécy', 1346, '1346'], ['Bataille de Poitiers, le roi Jean le Bon est pris', 1356, '1356'], ['Bataille d’Azincourt', 1415, '1415'], ['Bataille de Castillon, la dernière', 1453, '1453']],
        difficile: [['La peste noire arrive en France', 1348, '1348'], ['Naissance de Jeanne d’Arc à Domrémy', 1412, '1412'], ['Traité de Troyes : le roi d’Angleterre héritier de la France', 1420, '1420'],
          ['Jeanne d’Arc rencontre Charles VII à Chinon', 1429, '1429'], ['Jeanne d’Arc est capturée à Compiègne', 1430, '1430']],
        expert: [['Les Anglais prennent Calais', 1347, '1347'], ['La Grande Jacquerie, révolte des paysans', 1358, '1358'], ['Traité de Brétigny', 1360, '1360'],
          ['Charles VII reprend Paris', 1436, '1436'], ['Bataille de Formigny', 1450, '1450'], ['Prise de Constantinople par les Ottomans', 1453, '1453']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['Contre qui la France se bat-elle pendant la guerre de Cent Ans ?', 'L’Angleterre', ['L’Espagne', 'L’Italie']]],
        moyen: [['Quelle ville Jeanne d’Arc a-t-elle délivrée en 1429 ?', 'Orléans', ['Paris', 'Reims', 'Rouen']],
          ['Combien de temps a vraiment duré la guerre de Cent Ans ?', '116 ans', ['100 ans', '99 ans', '50 ans']]],
        difficile: [['Dans quelle ville Jeanne d’Arc a-t-elle été brûlée en 1431 ?', 'Rouen', ['Orléans', 'Reims', 'Chinon', 'Compiègne']],
          ['Dans quel village Jeanne d’Arc est-elle née ?', 'Domrémy', ['Vaucouleurs', 'Chinon', 'Orléans', 'Rouen']]],
        expert: [['Qui a livré Jeanne d’Arc aux Anglais ?', 'Les Bourguignons', ['Les Armagnacs', 'Les Écossais', 'Les Bretons', 'Les Espagnols', 'Les Flamands']],
          ['Quel évêque a présidé le procès de Jeanne d’Arc ?', 'Pierre Cauchon', ['Remi', 'Suger', 'Thomas Becket', 'Bernard de Clairvaux', 'Fulbert']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Jeanne d’Arc disait entendre des voix qui lui parlaient.', true, ''],
          ['La guerre de Cent Ans a duré exactement 100 ans.', false, 'Elle a duré 116 ans, de 1337 à 1453, avec de longues trêves.']],
        moyen: [['Jeanne d’Arc a fait sacrer Charles VII à Reims.', true, ''],
          ['À la fin de la guerre, les Anglais ont gardé Bordeaux.', false, 'Ils ont perdu Bordeaux en 1453 ; ils n’ont gardé que Calais.']],
        difficile: [['À Azincourt, les archers anglais ont battu la chevalerie française.', true, '']],
        expert: [['Jeanne d’Arc a été déclarée sainte en 1920.', true, '']]
      } }
    ] },
    { id: 'm06', matiere: 'histoire', famille: 'mag', nom: 'Frise du Moyen Âge', court: 'Frise', icone: '📏', series: [
      { k: 'ordre', consigne: 'Range ces événements du Moyen Âge du plus ancien au plus récent.', q: 'En quelle année : {a} ?', niveaux: {
        facile: [['Fin de l’Empire romain d’Occident', 476, '476'], ['Charlemagne est couronné empereur', 800, '800'], ['Jeanne d’Arc délivre Orléans', 1429, '1429'],
          ['Christophe Colomb arrive en Amérique', 1492, '1492']],
        moyen: [['Charles Martel arrête les Arabes à Poitiers', 732, '732'], ['Hugues Capet devient roi', 987, '987'], ['Guillaume le Conquérant gagne à Hastings', 1066, '1066'],
          ['Départ de la première croisade', 1096, '1096'], ['Fin de la guerre de Cent Ans', 1453, '1453']],
        difficile: [['Traité de Verdun : l’empire de Charlemagne est partagé', 843, '843'], ['Rollon reçoit la Normandie', 911, '911'], ['Début de la construction de Notre-Dame de Paris', 1163, '1163'],
          ['Bataille de Bouvines', 1214, '1214'], ['La peste noire arrive en Europe', 1347, '1347']],
        expert: [['Le pape Urbain II appelle à la croisade à Clermont', 1095, '1095'], ['Les croisés prennent Jérusalem', 1099, '1099'], ['Début de la croisade contre les Albigeois', 1209, '1209'],
          ['Mort de Saint Louis à Tunis', 1270, '1270'], ['Arrestation des Templiers', 1307, '1307'], ['Les Ottomans prennent Constantinople', 1453, '1453']]
      } }
    ] },
    { id: 'm07', matiere: 'histoire', famille: 'mag', nom: 'Roman ou gothique ?', court: 'Églises', icone: '⛪', series: [
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
        facile: [['Le Mont-Saint-Michel', 'En Normandie'], ['La cité de Carcassonne', 'En Occitanie'], ['Le palais des Papes', 'À Avignon']],
        moyen: [['La cathédrale du sacre des rois', 'À Reims'], ['La Sainte-Chapelle', 'À Paris, sur l’île de la Cité'], ['Les remparts d’Aigues-Mortes', 'Dans le Gard'],
          ['La cité médiévale de Provins', 'En Seine-et-Marne']],
        difficile: [['L’abbaye de Cluny', 'En Bourgogne'], ['La basilique de Vézelay', 'Dans l’Yonne'], ['L’abbatiale de Conques', 'En Aveyron'],
          ['La cathédrale d’Albi, en brique', 'Dans le Tarn'], ['Le château de Chinon', 'En Indre-et-Loire']],
        expert: [['Le cloître de Moissac', 'Dans le Tarn-et-Garonne'], ['La basilique Saint-Sernin', 'À Toulouse'], ['Le donjon de Vincennes', 'Dans le Val-de-Marne'],
          ['Château-Gaillard', 'Aux Andelys, dans l’Eure'], ['L’abbaye de Fontenay', 'En Côte-d’Or'], ['La cathédrale de Beauvais', 'Dans l’Oise']]
      } }
    ] },
    { id: 'm08', matiere: 'histoire', famille: 'mag', nom: 'Les Vikings', court: 'Vikings', icone: '⛵', series: [
      { k: 'paires', gauche: 'Mot', droite: 'Ce que c’est', consigneR: 'Relie chaque mot du monde viking à ce qu’il désigne.', q: 'Qu’est-ce que {a} ?', qi: 'Comment s’appelle : {b} ?', niveaux: {
        facile: [['le drakkar', 'Le bateau de guerre des Vikings'], ['la Scandinavie', 'La région d’où viennent les Vikings'], ['Odin', 'Le dieu principal des Vikings']],
        moyen: [['Thor', 'Le dieu du tonnerre, avec son marteau'], ['les runes', 'L’alphabet des Vikings'], ['le Valhalla', 'Le palais des guerriers morts au combat'], ['une saga', 'Un long récit d’exploits']],
        difficile: [['un jarl', 'Un chef viking'], ['le thing', 'L’assemblée des hommes libres'], ['le knarr', 'Le bateau de commerce viking'],
          ['les Varègues', 'Les Vikings partis vers l’est'], ['le Vinland', 'La terre d’Amérique atteinte par les Vikings']],
        expert: [['les Valkyries', 'Les guerrières qui choisissent les morts au combat'], ['le Ragnarök', 'La fin du monde des dieux'], ['Yggdrasil', 'L’arbre géant qui relie les mondes'],
          ['Loki', 'Le dieu rusé qui joue des tours'], ['Frigg', 'L’épouse d’Odin'], ['le danegeld', 'La rançon payée aux Vikings']]
      } },
      { k: 'qcm', niveaux: {
        facile: [['D’où venaient les Vikings ?', 'Du nord de l’Europe', ['D’Afrique', 'D’Amérique']]],
        moyen: [['Quelle région de France doit son nom aux « hommes du Nord » ?', 'La Normandie', ['La Bretagne', 'La Picardie', 'La Provence']]],
        difficile: [['Quel chef viking a reçu la Normandie en 911 ?', 'Rollon', ['Erik le Rouge', 'Ragnar', 'Harald à la Dent bleue', 'Leif Erikson']],
          ['Quel Viking a atteint l’Amérique vers l’an 1000 ?', 'Leif Erikson', ['Rollon', 'Ragnar', 'Christophe Colomb', 'Harald à la Dent bleue']]],
        expert: [['Quel monastère anglais, pillé en 793, marque le début de l’âge des Vikings ?', 'Lindisfarne', ['Canterbury', 'Iona', 'Cluny', 'Westminster', 'York']],
          ['Quel descendant de Rollon a conquis l’Angleterre en 1066 ?', 'Guillaume le Conquérant', ['Richard Cœur de Lion', 'Harold', 'Henri II', 'Édouard le Confesseur', 'Canut le Grand']]]
      } },
      { k: 'vf', niveaux: {
        facile: [['Les casques des Vikings avaient des cornes.', false, 'C’est une invention du XIXe siècle : leurs casques n’avaient pas de cornes.'],
          ['Les Vikings étaient aussi des marchands et des paysans.', true, '']],
        moyen: [['Les Vikings ont assiégé Paris.', true, 'En 845, puis en 885-886.']],
        difficile: [['Les Vikings ont fondé la ville de Dublin.', true, '']],
        expert: [['La tapisserie de Bayeux raconte la conquête de l’Angleterre par les Normands.', true, '']]
      } }
    ] },
    { id: 'm09', matiere: 'histoire', famille: 'mag', nom: 'Seigneurs et paysans', court: 'Seigneurs', icone: '🌾', series: [
      { k: 'paires', gauche: 'Mot', droite: 'Ce qu’il veut dire', consigneR: 'Relie chaque mot à son sens.', q: 'Que veut dire « {a} » ?', qi: 'Quel mot veut dire : {b} ?', niveaux: {
        facile: [['seigneur', 'Le maître du château et des terres'], ['serf', 'Un paysan qui n’est pas libre'], ['corvée', 'Le travail gratuit dû au seigneur']],
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
