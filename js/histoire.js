// Histoire (v7.1) : la matière Histoire, rangée par périodes (BACKLOG lignes 270 et 275).
// Choix de l'utilisateur du 12/11/2026 : 7 périodes, 51 jeux, 4 niveaux, et chaque niveau n'a QUE son
// propre contenu (Expert = seulement du contenu expert). Livraison par période : l'Antiquité d'abord (ses
// 12 jeux sont tous retenus) ; les jeux des autres périodes viendront ensuite.
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
