// Grammaire (demande de l'utilisateur du 12/11/2026, backlog lignes 248 à 258).
// Troisième matière du français, à côté de l'orthographe et de la conjugaison. Plusieurs petits jeux ;
// le joueur choisit un niveau (Facile, Moyen, Difficile, Expert) et coche les jeux voulus ; chaque carte
// en tire un au hasard, dont le contenu suit le niveau (choix de l'utilisateur).
//  - phrase      : remettre les mots d'une phrase dans l'ordre (bulles à toucher) ;
//  - contraires  : un mot, trouver son contraire parmi 3 choix ;
//  - erreur      : une phrase en bulles, toucher le mot faux (verbe mal conjugué, mauvais accord,
//                  mot mal écrit, mot en trop) ;
//  - relier      : deux colonnes de mots à relier deux par deux (une ligne de couleur par paire) ;
//  - nature      : un mot en couleur dans une phrase : nom, verbe, adjectif… ;
//  - homophones  : une phrase à trou, choisir a / à, et / est, son / sont… ;
//  - pluriel, genre : « Au pluriel » et « Le ou la ? », venus de l'orthographe (js/questions.js),
//                  joués sur les mots du niveau (js/plateau.js s'en occupe).
// Module sans interface (utilisable dans la page et dans les tests Node) ; l'affichage est dans js/grammaire-carte.js.
(function (racine) {
  'use strict';

  var NIVEAUX = [{ id: 'facile', nom: 'Facile' }, { id: 'moyen', nom: 'Moyen' }, { id: 'difficile', nom: 'Difficile' }, { id: 'expert', nom: 'Expert' }];

  // Les jeux, dans l'ordre de l'écran des réglages. court : texte du bouton sur téléphone carré.
  var JEUX = [
    { id: 'phrase', nom: 'Remettre la phrase', court: 'Phrase' },
    { id: 'contraires', nom: 'Les contraires', court: 'Contraires' },
    { id: 'erreur', nom: 'Trouve l’erreur', court: 'Erreur' },
    { id: 'relier', nom: 'Relier les paires', court: 'Relier' },
    { id: 'nature', nom: 'Nature du mot', court: 'Nature' },
    { id: 'homophones', nom: 'Homophones', court: 'Homophones' },
    { id: 'pluriel', nom: 'Au pluriel', court: 'Pluriel', mot: true },
    { id: 'genre', nom: 'Le ou la ?', court: 'Le ou la ?', mot: true }
  ];
  function jeu(id) { for (var i = 0; i < JEUX.length; i++) if (JEUX[i].id === id) return JEUX[i]; return null; }

  // Phrase d'aide sous le niveau, à l'écran de la matière.
  var AIDES = {
    facile: 'Facile : phrases courtes (« le petit chat boit du lait »), contraires simples, a / à, et / est ; nom, verbe ou adjectif.',
    moyen: 'Moyen : phrases plus longues, pluriels en -aux, son / sont, on / ont, ou / où ; les déterminants en plus.',
    difficile: 'Difficile : compléments, mais / car / donc, ces / ses, c’est / s’est, la / là / l’a ; pronoms et adverbes en plus.',
    expert: 'Expert : longues phrases avec « qui » ou « que », mots rares, accords pièges, quel / qu’elle, quand / quant ; toutes les natures.'
  };

  // ---------- Natures des mots ----------
  // Lettres utilisées dans les phrases : N nom, V verbe, A adjectif, D déterminant, P pronom, Av adverbe,
  // Pr préposition, C conjonction ; « - » = mot jamais demandé (contraction, mot élidé, auxiliaire…).
  var NATURES = { N: 'Nom', V: 'Verbe', A: 'Adjectif', D: 'Déterminant', P: 'Pronom', Av: 'Adverbe', Pr: 'Préposition', C: 'Conjonction' };
  // Natures proposées à chaque niveau (toutes affichées en boutons).
  var NATURES_NIVEAU = {
    facile: ['N', 'V', 'A'],
    moyen: ['N', 'V', 'A', 'D'],
    difficile: ['N', 'V', 'A', 'D', 'P', 'Av'],
    expert: ['N', 'V', 'A', 'D', 'P', 'Av', 'Pr', 'C']
  };

  // ---------- Phrases (jeux « Remettre la phrase » et « Nature du mot ») ----------
  // Un mot par bulle, « mot/NATURE », en minuscules sauf les noms propres ; le dernier signe (. ! ?) reste fixe.
  // Une virgule reste collée au mot qui la précède (elle aide à placer les morceaux de la phrase).
  // « || » : autres ordres acceptés (même phrase, mots sans nature).
  // Chaque phrase a au moins un sujet, un verbe, un complément et un adjectif (demande de l'utilisateur).
  var PHRASES = {
    facile: [
      'le/D petit/A chat/N boit/V du/D lait/N .',
      'ma/D sœur/N mange/V une/D pomme/N rouge/A .',
      'le/D gros/A chien/N dort/V sur/Pr le/D tapis/N .',
      'Léo/N lit/V un/D livre/N amusant/A .',
      'la/D vieille/A dame/N arrose/V ses/D fleurs/N .',
      'mon/D frère/N porte/V un/D pull/N bleu/A .',
      'les/D oiseaux/N chantent/V dans/Pr le/D grand/A arbre/N .',
      'papa/N prépare/V une/D soupe/N chaude/A .',
      'la/D petite/A fille/N joue/V avec/Pr un/D ballon/N .',
      'Zoé/N dessine/V une/D maison/N jaune/A .',
      'le/D bébé/N boit/V un/D biberon/N tiède/A .',
      'nous/P mangeons/V une/D tarte/N sucrée/A .',
      'le/D jeune/A garçon/N promène/V son/D chien/N .',
      'la/D maîtresse/N écrit/V une/D phrase/N drôle/A .',
      'mon/D chat/N noir/A attrape/V une/D souris/N .'
    ],
    moyen: [
      'le/D chat/N noir/A attrape/V une/D souris/N grise/A dans/Pr la/D cuisine/N .',
      'mon/D grand/A frère/N range/V ses/D affaires/N dans/Pr son/D cartable/N .',
      'les/D enfants/N construisent/V un/D grand/A château/N de/Pr sable/N sur/Pr la/D plage/N .',
      'le/D boulanger/N prépare/V des/D croissants/N chauds/A pour/Pr ses/D clients/N .',
      'Inès/N cueille/V des/D fraises/N rouges/A dans/Pr le/D jardin/N .',
      'le/D pêcheur/N attrape/V un/D gros/A poisson/N dans/Pr la/D rivière/N .',
      'nous/P regardons/V un/D film/N drôle/A avec/Pr nos/D cousins/N .',
      'le/D facteur/N apporte/V un/D paquet/N rouge/A à/Pr ma/D mère/N .',
      'les/D élèves/N écoutent/V la/D nouvelle/A maîtresse/N dans/Pr la/D classe/N .',
      'mon/D oncle/N répare/V la/D vieille/A voiture/N de/Pr mamie/N .',
      'le/D cuisinier/N coupe/V les/D carottes/N orange/A avec/Pr un/D couteau/N .',
      'Malo/N lance/V la/D balle/N jaune/A à/Pr son/D chien/N .',
      'la/D voisine/N promène/V son/D petit/A chien/N blanc/A dans/Pr le/D parc/N .',
      'ma/D cousine/N porte/V une/D jolie/A robe/N verte/A pour/Pr la/D fête/N .',
      'les/D vaches/N mangent/V l’herbe/- verte/A du/- pré/N .'
    ],
    difficile: [
      'le/D jardinier/N arrose/V les/D jeunes/A plantes/N car/C il/P fait/V très/Av chaud/- .',
      'ma/D grand-mère/N tricote/V une/D écharpe/N rouge/A pour/Pr mon/D petit/A frère/N .',
      'il/P pleut,/V mais/C nous/P jouons/V dehors/Av avec/Pr nos/D amis/N fidèles/A .',
      'Léa/N offre/V un/D joli/A bouquet/N à/Pr sa/D maman/N et/C elle/P sourit/V .',
      'les/D pompiers/N éteignent/V le/D feu/N dangereux/A avec/Pr leurs/D longues/A lances/N .',
      'Tom/N cherche/V son/D cahier/N bleu,/A mais/C il/P ne/- le/P trouve/V pas/Av .',
      'nous/P écrivons/V une/D longue/A lettre/N à/Pr nos/D amis/N anglais/A .',
      'le/D petit/A chat/N miaule,/V car/C il/P a/V faim/N .',
      'mon/D père/N lave/V la/D voiture/N sale/A et/C il/P la/P range/V dans/Pr le/D garage/N .',
      'le/D professeur/N explique/V la/D leçon/N difficile/A à/Pr ses/D élèves/N attentifs/A .',
      'la/D petite/A souris/N grise/A se/P cache/V sous/Pr le/D vieux/A buffet/N .',
      'Sam/N donne/V des/D graines/N fraîches/A aux/- oiseaux,/N donc/C ils/P reviennent/V chaque/D matin/N .',
      'le/D chevalier/N courageux/A affronte/V le/D terrible/A dragon/N car/C il/P veut/V sauver/V la/D princesse/N .' +
        ' || le courageux chevalier affronte le terrible dragon car il veut sauver la princesse',
      'Nour/N prend/V toujours/Av son/D gros/A parapluie,/N car/C il/P pleut/V souvent/Av .',
      'ma/D tante/N prépare/V un/D gâteau/N énorme/A et/C nous/P le/P mangeons/V ensemble/Av .' +
        ' || ma tante prépare un énorme gâteau et nous le mangeons ensemble'
    ],
    expert: [
      'le/D vieux/A marin/N raconte/V une/D histoire/N étonnante/A que/P personne/P ne/- croit/V vraiment/Av .' +
        ' || le vieux marin raconte une étonnante histoire que personne ne croit vraiment',
      'les/D randonneurs/N fatigués/A atteignent/V enfin/Av le/D sommet/N enneigé/A de/Pr la/D montagne/N .',
      'la/D bibliothécaire/N range/V soigneusement/Av les/D livres/N anciens/A que/P les/D lecteurs/N ont/- empruntés/- .',
      'mon/D cousin/N qui/P habite/V à/Pr Marseille/N nous/P envoie/V souvent/Av des/D photos/N magnifiques/A .',
      'l’archéologue/- découvre/V une/D statue/N mystérieuse/A sous/Pr le/D sable/N brûlant/A du/- désert/N .' +
        ' || l\u2019archéologue découvre une mystérieuse statue sous le sable brûlant du désert',
      'bien/- qu’il/- soit/V fatigué,/A le/D coureur/N termine/V courageusement/Av sa/D course/N .',
      'les/D scientifiques/N observent/V une/D comète/N lumineuse/A qui/P traverse/V lentement/Av le/D ciel/N .',
      'le/D chef/N prépare/V un/D repas/N délicieux,/A mais/C ses/D invités/N habituels/A arrivent/V en/Pr retard/N .',
      'Awa/N photographie/V les/D éléphants/N gigantesques/A qui/P se/P baignent/V dans/Pr le/D fleuve/N .' +
        ' || Awa photographie les gigantesques éléphants qui se baignent dans le fleuve',
      'le/D jeune/A violoniste/N joue/V une/D mélodie/N émouvante/A devant/Pr un/D public/N silencieux/A .' +
        ' || le jeune violoniste joue une émouvante mélodie devant un public silencieux',
      'quand/C l’orage/- éclate,/V les/D promeneurs/N prudents/A se/P réfugient/V sous/Pr un/D abri/N .',
      'le/D détective/N astucieux/A examine/V chaque/D indice/N que/P le/D voleur/N a/- laissé/- .',
      'les/D apprentis/N pâtissiers/- décorent/V habilement/Av un/D gâteau/N gigantesque/A pour/Pr le/D mariage/N .' +
        ' || les apprentis pâtissiers décorent habilement un gigantesque gâteau pour le mariage',
      'Kenji/N dessine/V une/D carte/N précise/A de/Pr l’île/- que/P son/D équipe/N explore/V .',
      'la/D tempête/N violente/A a/- arraché/- les/D vieux/A arbres,/N donc/C la/D route/N est/V fermée/A .' +
        ' || la violente tempête a arraché les vieux arbres, donc la route est fermée'
    ]
  };

  // ---------- Contraires : « mot:contraire:piège,piège » ----------
  // Les pièges des niveaux élevés ressemblent au mot (synonymes, mots voisins).
  var CONTRAIRES = {
    facile: [
      'grand:petit:gros,haut', 'chaud:froid:brûlant,rouge', 'jour:nuit:matin,soleil', 'ouvert:fermé:ouvrir,grand',
      'plein:vide:rempli,lourd', 'rapide:lent:vite,fort', 'haut:bas:grand,loin', 'beau:laid:joli,gentil',
      'jeune:vieux:petit,neuf', 'monter:descendre:grimper,sauter', 'gagner:perdre:jouer,trouver', 'entrer:sortir:rentrer,venir',
      'dur:mou:solide,lourd', 'propre:sale:lavé,neuf', 'lourd:léger:gros,fort', 'content:triste:heureux,gentil',
      'devant:derrière:avant,près', 'toujours:jamais:souvent,encore', 'facile:difficile:simple,rapide', 'allumer:éteindre:briller,ouvrir'
    ],
    moyen: [
      'ancien:moderne:vieux,antique', 'courageux:peureux:brave,fort', 'large:étroit:long,grand', 'rire:pleurer:sourire,crier',
      'accepter:refuser:prendre,donner', 'souvent:rarement:toujours,fréquemment', 'sec:mouillé:dur,aride', 'calme:agité:tranquille,doux',
      'poli:impoli:gentil,sage', 'possible:impossible:probable,facile', 'avancer:reculer:marcher,courir', 'remplir:vider:verser,mettre',
      'attacher:détacher:nouer,coller', 'honnête:malhonnête:sincère,gentil', 'mince:épais:fin,maigre', 'riche:pauvre:fortuné,heureux',
      'avant:après:devant,pendant', 'sucré:salé:doux,acide', 'lever:baisser:monter,porter', 'oublier:se souvenir:perdre,penser'
    ],
    difficile: [
      'généreux:avare:gentil,riche', 'prudent:imprudent:attentif,sage', 'fragile:solide:cassant,léger', 'victoire:défaite:succès,combat',
      'paresseux:travailleur:fatigué,lent', 'optimiste:pessimiste:joyeux,réaliste', 'permettre:interdire:autoriser,obliger', 'augmenter:diminuer:agrandir,multiplier',
      'public:privé:commun,ouvert', 'naturel:artificiel:normal,simple', 'admirer:mépriser:aimer,regarder', 'modeste:orgueilleux:simple,timide',
      'absent:présent:parti,loin', 'punir:récompenser:gronder,aider', 'intérieur:extérieur:dedans,milieu', 'ordinaire:extraordinaire:normal,banal',
      'construire:détruire:bâtir,réparer', 'majeur:mineur:grand,adulte', 'précis:vague:exact,clair', 'croissant:décroissant:montant,rond'
    ],
    expert: [
      'éphémère:durable:passager,fragile', 'prodigue:économe:généreux,riche', 'concis:prolixe:bref,précis', 'lucide:confus:clair,brillant',
      'apogée:déclin:sommet,début', 'indulgent:sévère:tolérant,gentil', 'abondance:pénurie:richesse,surplus', 'consentir:refuser:accepter,permettre',
      'docile:rebelle:obéissant,calme', 'méfiance:confiance:doute,prudence', 'hostile:bienveillant:agressif,méchant', 'superflu:indispensable:inutile,excessif',
      'altruiste:égoïste:généreux,solidaire', 'loquace:taciturne:bavard,timide', 'exhaustif:partiel:complet,total', 'convexe:concave:bombé,arrondi',
      'acquitter:condamner:libérer,juger', 'ascension:descente:montée,escalade', 'clarté:obscurité:lumière,brillance', 'prolonger:écourter:allonger,continuer'
    ]
  };

  // ---------- Trouve l'erreur : « phrase avec *mot faux*|correction|genre » ----------
  // Genre de l'erreur : c = verbe mal conjugué, a = mauvais accord, o = mot mal écrit ou mauvais mot,
  // i = mot en trop (correction vide : on le supprime). Minuscule au début : la majuscule est remise à l'affichage.
  var GENRES_ERREUR = {
    c: 'le verbe est mal conjugué',
    a: 'le mot est mal accordé',
    o: 'le mot est mal écrit',
    i: 'ce mot n’a rien à faire là, il faut le supprimer'
  };
  var ERREURS = {
    facile: [
      'les chats *dort* sur le canapé.|dorment|c', 'ma sœur a deux *chat* noirs.|chats|a', 'le chien *table* aboie dans le jardin.||i',
      'je *mangent* une pomme rouge.|mange|c', 'papa conduit une *voitur* bleue.|voiture|o', 'nous *joue* au ballon dans la cour.|jouons|c',
      'les *fleur* du jardin sont jolies.|fleurs|a', 'le petit *le* lapin mange une carotte.||i', 'il fait très *froi* ce matin.|froid|o',
      'tu *chante* une belle chanson.|chantes|c', 'la vache mange de l’herbe *chaise* verte.||i', 'mes amis *est* gentils.|sont|c',
      'le *soleille* brille dans le ciel.|soleil|o', 'j’ai trois *pomme* dans mon panier.|pommes|a', 'le bébé dort *nuage* dans son lit.||i'
    ],
    moyen: [
      'les enfants *jouait* dans le jardin hier.|jouaient|c', 'ma tante a acheté des chaussures *noir*.|noires|a',
      'nous *finissez* nos devoirs avant le goûter.|finissons|c', 'les *chevals* galopent dans la prairie.|chevaux|a',
      'le boulanger prépare du pain *crayon* chaud chaque matin.||i', 'mon frère *et* malade depuis lundi.|est|o',
      'les oiseaux *construis* leur nid au printemps.|construisent|c', 'la petite fille porte une robe *blanc*.|blanche|a',
      'demain, nous *allions* à la piscine.|irons|c', 'il a mis son manteau, car il *fesait* froid.|faisait|o',
      'les élèves écoutent *la* la maîtresse en silence.||i', 'vous *faisez* un beau dessin.|faites|c',
      'mes cousines sont *arrivé* ce matin.|arrivées|a', 'le chat a attrapé une *sourie* grise.|souris|o',
      'les *bijous* de ma grand-mère brillent.|bijoux|a'
    ],
    difficile: [
      'les fleurs que j’ai *cueilli* sont fanées.|cueillies|a', 'si j’*aurais* le temps, je viendrais te voir.|avais|c',
      'elles se sont *lavés* avant de partir.|lavées|a', 'le chien *aboient* quand le facteur arrive.|aboie|c',
      'les voisins *on* repeint leur maison.|ont|o', 'il faut que tu *viens* avec nous.|viennes|c',
      'ces tartes sont *délicieuse*.|délicieuses|a', 'le magicien a sorti un lapin *très* de son chapeau.||i',
      'je m’*apelle* Léo.|appelle|o', 'hier, les pompiers *éteindrent* le feu rapidement.|éteignirent|c',
      'ma mère *ma* offert un livre.|m’a|o', 'les *travails* de la maison sont finis.|travaux|a',
      'je vous *remercis* pour ce cadeau.|remercie|c', 'il est *partit* sans dire au revoir.|parti|o',
      'le train *ou* nous sommes montés était bondé.|où|o'
    ],
    expert: [
      'les décisions qu’elle a *pris* nous ont surpris.|prises|a', 'bien qu’il *est* fatigué, il continue à travailler.|soit|c',
      'quoi qu’il *fait*, il réussit toujours.|fasse|c', 'ils se sont *succédés* au pouvoir pendant dix ans.|succédé|a',
      'nous avons mangé des *chou-fleurs* au dîner.|choux-fleurs|a', 'le *dilemne* était impossible à résoudre.|dilemme|o',
      'il a *résout* le problème en cinq minutes.|résolu|c', 'les robes *marrons* lui vont bien.|marron|a',
      'je *résouds* ce problème difficile.|résous|c', '*malgré* qu’il pleuve, nous sortirons.|bien|o',
      'il s’est rappelé *de* son enfance.||i', 'l’avion atterrit à l’*aréoport* ce soir.|aéroport|o',
      'les deux sœurs se sont *parlées* au téléphone.|parlé|a', 'ce remède pallie *à* la douleur.||i',
      'il faut que nous *soyions* patients.|soyons|c'
    ]
  };

  // ---------- Homophones : « phrase avec _|bonne réponse » ----------
  // Les choix sont ceux du groupe de la bonne réponse (le premier des groupes du niveau qui la contient).
  var GROUPES_HOMOPHONES = {
    facile: [['a', 'à'], ['et', 'est']],
    moyen: [['son', 'sont'], ['on', 'ont'], ['ou', 'où']],
    difficile: [['ces', 'ses'], ['ce', 'se'], ['c’est', 's’est'], ['la', 'là', 'l’a']],
    expert: [['quel', 'quelle', 'qu’elle'], ['quand', 'quant', 'qu’en'], ['peu', 'peut', 'peux'], ['leur', 'leurs'], ['sans', 's’en', 'cent']]
  };
  var HOMOPHONES = {
    facile: [
      'Léo _ un vélo rouge.|a', 'Nous allons _ la piscine.|à', 'Le chat _ le chien jouent ensemble.|et', 'Ma maison _ très grande.|est',
      'Papa _ faim ce soir.|a', 'Je vais _ l’école avec mon frère.|à', 'Il mange une pomme _ une poire.|et', 'Le ciel _ bleu aujourd’hui.|est',
      'Elle _ perdu son crayon.|a', 'Tom joue _ la balle avec Zoé.|à', 'Le lapin _ blanc et noir.|est', 'J’ai un chien _ deux chats.|et',
      'Mamie habite _ Paris.|à', 'Mon frère _ six ans.|a'
    ],
    moyen: [
      'Les enfants _ dans la cour.|sont', 'Léa range _ cartable.|son', 'Demain, _ ira au cinéma.|on', 'Mes amis _ gagné le match.|ont',
      'Tu veux du lait _ du jus ?|ou', 'Je ne sais pas _ est mon livre.|où', 'Les oiseaux _ partis vers le sud.|sont', 'Il a perdu _ écharpe.|son',
      'Ce matin, _ a vu un renard.|on', 'Ils _ froid aux mains.|ont', 'La maison _ j’habite est petite.|où', 'Tu préfères le rouge _ le bleu ?|ou',
      'Mes parents _ très gentils.|sont', 'Les élèves _ fini leur travail.|ont'
    ],
    difficile: [
      'Léo a rangé _ jouets dans sa chambre.|ses', 'Regarde _ beaux nuages dans le ciel !|ces', 'Le chat _ cache sous le lit.|se',
      'Je trouve que _ gâteau est délicieux.|ce', 'Il _ blessé en tombant de vélo.|s’est', 'Regarde, _ mon frère qui arrive !|c’est',
      'Pose ton sac _, près de la porte.|là', 'Sa sœur _ invité à son anniversaire.|l’a', 'Il a pris _ clé dans sa poche.|la',
      'Ma tante adore _ deux chats.|ses', 'Elle _ endormie devant la télévision.|s’est', 'Nous irons voir _ film demain.|ce',
      'Les enfants _ lavent les mains.|se', 'Ce livre, mon père _ lu deux fois.|l’a'
    ],
    expert: [
      'Je me demande _ heure il est.|quelle', 'Il faut _ parte avant la nuit.|qu’elle', 'Dis-moi _ livre tu préfères.|quel',
      'Préviens-moi _ tu seras prêt.|quand', 'Mon frère part ; _ à moi, je reste ici.|quant', 'Je me demande ce _ pense ton père.|qu’en',
      'Il mange très _ le soir.|peu', 'Elle _ venir demain si elle veut.|peut', 'Je _ t’aider si tu veux.|peux',
      'Les enfants ont donné _ dessins à la maîtresse.|leurs', 'Je _ ai prêté mon vélo.|leur', 'Il est parti _ dire au revoir.|sans',
      'Elle a reçu _ cartes de vœux.|cent', 'La souris a vu le fromage et elle _ est approchée.|s’en'
    ]
  };

  // ---------- Relier les paires : listes « gauche:droite » ----------
  // Chaque carte prend une liste au hasard, puis 6 (Facile), 7 (Moyen) ou 8 paires (Difficile, Expert),
  // ou moins si la liste est plus courte. Une seule bonne réponse à droite pour chaque mot de gauche.
  var NB_PAIRES = { facile: 6, moyen: 7, difficile: 8, expert: 8 };
  var CONSIGNES_RELIER = {
    contraires: 'Relie chaque mot à son contraire.',
    genre: 'Relie chaque masculin à son féminin.',
    pluriel: 'Relie chaque singulier à son pluriel.',
    pronoms: 'Relie chaque pronom à son verbe.',
    adjectifs: 'Relie chaque nom à son adjectif.'
  };
  var RELIER = {
    facile: [
      { sorte: 'genre', paires: ['le roi:la reine', 'le garçon:la fille', 'le père:la mère', 'l’oncle:la tante', 'le frère:la sœur',
        'le coq:la poule', 'le taureau:la vache', 'le cheval:la jument'] },
      { sorte: 'pronoms', titre: 'verbe être au présent', paires: ['je:suis', 'tu:es', 'il:est', 'nous:sommes', 'vous:êtes', 'ils:sont'] }
    ],
    moyen: [
      { sorte: 'pluriel', paires: ['un cheval:des chevaux', 'un journal:des journaux', 'un jeu:des jeux', 'un gâteau:des gâteaux', 'un bijou:des bijoux',
        'un genou:des genoux', 'un oiseau:des oiseaux', 'un animal:des animaux', 'un hibou:des hiboux', 'un château:des châteaux'] },
      { sorte: 'pronoms', titre: 'verbe avoir au présent', paires: ['j’:ai', 'tu:as', 'il:a', 'nous:avons', 'vous:avez', 'ils:ont'] },
      { sorte: 'pronoms', titre: 'verbe aller au présent', paires: ['je:vais', 'tu:vas', 'il:va', 'nous:allons', 'vous:allez', 'ils:vont'] }
    ],
    difficile: [
      { sorte: 'genre', paires: ['acteur:actrice', 'loup:louve', 'héros:héroïne', 'neveu:nièce', 'lion:lionne', 'dieu:déesse', 'sorcier:sorcière',
        'canard:cane', 'compagnon:compagne', 'empereur:impératrice', 'prince:princesse'] },
      { sorte: 'pluriel', paires: ['un œil:des yeux', 'un ciel:des cieux', 'un travail:des travaux', 'un festival:des festivals', 'un pneu:des pneus',
        'un bal:des bals', 'un vitrail:des vitraux', 'un corail:des coraux', 'un landau:des landaus', 'un carnaval:des carnavals'] },
      { sorte: 'pronoms', titre: 'verbe faire au futur', paires: ['je:ferai', 'tu:feras', 'il:fera', 'nous:ferons', 'vous:ferez', 'ils:feront'] }
    ],
    expert: [
      { sorte: 'genre', paires: ['parrain:marraine', 'serviteur:servante', 'duc:duchesse', 'tsar:tsarine', 'jars:oie', 'bouc:chèvre',
        'sanglier:laie', 'cerf:biche', 'verrat:truie', 'lièvre:hase', 'mulet:mule'] },
      { sorte: 'adjectifs', paires: ['soleil:solaire', 'ville:urbain', 'eau:aquatique', 'nuit:nocturne', 'campagne:rural', 'été:estival',
        'hiver:hivernal', 'lune:lunaire', 'cheval:équestre', 'ciel:céleste', 'père:paternel', 'œil:oculaire'] }
    ]
  };
  // Les contraires du niveau servent aussi au jeu « Relier » (Facile à Expert).
  Object.keys(RELIER).forEach(function (n) {
    RELIER[n].unshift({ sorte: 'contraires', paires: CONTRAIRES[n].map(function (l) { var p = l.split(':'); return p[0] + ':' + p[1]; }) });
  });

  // ---------- Outils ----------
  function tirer(t, r) { return t[Math.floor(r() * t.length)]; }
  function melanger(t, r) {
    t = t.slice();
    for (var i = t.length - 1; i > 0; i--) { var k = Math.floor(r() * (i + 1)), x = t[i]; t[i] = t[k]; t[k] = x; }
    return t;
  }
  function majuscule(s) { return s.charAt(0).toLocaleUpperCase('fr-FR') + s.slice(1); }
  function niveauValide(n) { return NATURES_NIVEAU[n] ? n : 'facile'; }
  // Texte d'une phrase à partir de ses mots : majuscule au début, pas d'espace avant le point final.
  function texte(mots, fin) { return majuscule(mots.join(' ').replace(/ ,/g, ',')) + (fin || ''); }

  // Une phrase « mot/N mot/V . » → { mots, natures, fin, alts }.
  function lirePhrase(ligne) {
    var morceaux = ligne.split(' || ');
    var jetons = morceaux[0].trim().split(/\s+/);
    var fin = /^[.!?]$/.test(jetons[jetons.length - 1]) ? jetons.pop() : '';
    var mots = [], natures = [];
    jetons.forEach(function (j) {
      var k = j.lastIndexOf('/');
      var mot = j.slice(0, k), nat = j.slice(k + 1);
      // « ,/- » : virgule seule, collée au mot d'avant.
      if (mot === ',' && mots.length) { mots[mots.length - 1] += ','; return; }
      mots.push(mot); natures.push(nat);
    });
    return { mots: mots, natures: natures, fin: fin, alts: morceaux.slice(1).map(function (a) { return a.trim(); }) };
  }

  // Une phrase « avec *faute* » → { mots, fin, faute, correction, genre }.
  function lireErreur(ligne) {
    var p = ligne.split('|');
    var phrase = p[0], fin = '';
    var m = phrase.match(/[.!?]$/);
    if (m) { fin = m[0]; phrase = phrase.slice(0, -1); }
    var mots = phrase.split(/\s+/), faute = -1;
    mots = mots.map(function (w, i) {
      var e = w.match(/^(.*)\*(.+)\*(.*)$/);
      if (!e) return w;
      faute = i;
      // Un mot élidé devant la faute (« j'*aurais* ») reste dans la même bulle.
      return e[1] + e[2] + e[3];
    });
    var e2 = p[0].match(/(\S*)\*(.+?)\*(\S*)/);
    return { mots: mots, fin: fin, faute: faute, fautif: e2[2], avant: e2[1], apres: e2[3], correction: p[1], genre: p[2] };
  }

  // Groupe d'homophones de la bonne réponse, parmi ceux du niveau.
  function groupeDe(niveau, bonne) {
    var g = GROUPES_HOMOPHONES[niveau];
    for (var i = 0; i < g.length; i++) if (g[i].indexOf(bonne) >= 0) return g[i];
    return null;
  }

  // ---------- Fabrication d'une carte ----------
  // jeuId : un des JEUX (sauf pluriel et genre, joués sur les mots d'orthographe par js/plateau.js) ;
  // niveau ; r : hasard (Math.random par défaut) ; eviter : clés de cartes déjà vues récemment.
  // Renvoie un objet simple (sauvegardable tel quel) : { jeu, niveau, cle, consigne, oral, … }.
  function generer(jeuId, niveau, r, eviter) {
    r = r || Math.random;
    niveau = niveauValide(niveau);
    eviter = eviter || [];
    var c = null;
    for (var essai = 0; essai < 12; essai++) {
      c = fabriquer(jeuId, niveau, r);
      if (eviter.indexOf(c.cle) < 0) break;
    }
    c.jeu = jeuId; c.niveau = niveau;
    return c;
  }

  function fabriquer(jeuId, niveau, r) {
    var i, ph;
    if (jeuId === 'phrase') {
      i = Math.floor(r() * PHRASES[niveau].length);
      ph = lirePhrase(PHRASES[niveau][i]);
      var ordre = ph.mots.map(function (m, k) { return k; }), essai = 0;
      // Les bulles ne doivent pas être déjà dans le bon ordre.
      do { ordre = melanger(ordre, r); } while (ordre.every(function (k, n) { return ph.mots[k] === ph.mots[n]; }) && ++essai < 20);
      return { cle: 'phrase|' + niveau + '|' + i, consigne: 'Remets les mots dans l’ordre pour faire une phrase :',
        oral: 'Remets les mots dans l’ordre pour faire une phrase.',
        mots: ph.mots, ordre: ordre, fin: ph.fin, alts: ph.alts };
    }
    if (jeuId === 'contraires') {
      i = Math.floor(r() * CONTRAIRES[niveau].length);
      var l = CONTRAIRES[niveau][i].split(':');
      return { cle: 'contraires|' + niveau + '|' + i, consigne: 'Quel est le contraire de :', mot: l[0], bonne: l[1],
        choix: melanger([l[1]].concat(l[2].split(',')), r), oral: 'Quel est le contraire de : ' + l[0] + ' ?' };
    }
    if (jeuId === 'erreur') {
      i = Math.floor(r() * ERREURS[niveau].length);
      var e = lireErreur(ERREURS[niveau][i]);
      e.mots[0] = majuscule(e.mots[0]);
      return { cle: 'erreur|' + niveau + '|' + i, consigne: 'Touche le mot qui est faux :', mots: e.mots, fin: e.fin, faute: e.faute,
        fautif: e.fautif, avant: e.avant, apres: e.apres, correction: e.correction, genre: e.genre,
        oral: 'Touche le mot qui est faux. ' + texte(e.mots, e.fin) };
    }
    if (jeuId === 'nature') {
      var natures = NATURES_NIVEAU[niveau], k, n;
      // Une phrase du niveau qui a au moins un mot d'une nature proposée ; le mot est tiré au hasard,
      // en variant les natures (une nature d'abord, puis un mot de cette nature).
      for (var t = 0; t < 30; t++) {
        i = Math.floor(r() * PHRASES[niveau].length);
        ph = lirePhrase(PHRASES[niveau][i]);
        n = tirer(natures, r);
        var possibles = [];
        ph.natures.forEach(function (x, m) { if (x === n) possibles.push(m); });
        if (possibles.length) { k = tirer(possibles, r); break; }
      }
      var mots = ph.mots.slice();
      mots[0] = /^[A-ZÀ-Ÿ]/.test(mots[0]) ? mots[0] : majuscule(mots[0]);
      var vu = mots[k].replace(/,$/, '');
      return { cle: 'nature|' + niveau + '|' + i + '|' + k, consigne: 'Quelle est la nature du mot en couleur ?', mots: mots, fin: ph.fin,
        cible: k, bonne: n, choix: natures.slice(),
        oral: 'Quelle est la nature du mot « ' + vu.toLocaleLowerCase('fr-FR') + ' » dans la phrase : ' + texte(ph.mots, ph.fin) };
    }
    if (jeuId === 'homophones') {
      i = Math.floor(r() * HOMOPHONES[niveau].length);
      var h = HOMOPHONES[niveau][i].split('|');
      var g = groupeDe(niveau, h[1]);
      return { cle: 'homophones|' + niveau + '|' + i, consigne: 'Quel mot complète la phrase ?', phrase: h[0], bonne: h[1], choix: g.slice(),
        oral: 'Quel mot complète la phrase ? Choisis entre : ' + g.join(', ') + '.' };
    }
    if (jeuId === 'relier') {
      i = Math.floor(r() * RELIER[niveau].length);
      var liste = RELIER[niveau][i];
      var paires = melanger(liste.paires, r).slice(0, NB_PAIRES[niveau]).map(function (p) { return p.split(':'); });
      var gauche = paires.map(function (p) { return p[0]; });
      var droite = melanger(paires.map(function (p) { return p[1]; }), r);
      var consigne = CONSIGNES_RELIER[liste.sorte] + (liste.titre ? ' (' + liste.titre + ')' : '');
      return { cle: 'relier|' + niveau + '|' + i + '|' + gauche.join(','), consigne: consigne, gauche: gauche, droite: droite,
        // bonnes[g] = position à droite du mot qui va avec le mot g de gauche.
        bonnes: paires.map(function (p) { return droite.indexOf(p[1]); }), oral: consigne };
    }
    throw new Error('Jeu de grammaire inconnu : ' + jeuId);
  }

  // ---------- Correction ----------
  // Remettre la phrase : la phrase écrite (mots séparés par des espaces) ; le reste : la réponse choisie
  // (texte du bouton, position du mot touché, ou liens de « Relier » : liens[g] = position à droite).
  function sansMajuscule(s) { return s.toLocaleLowerCase('fr-FR').replace(/\s+/g, ' ').trim(); }
  function juste(c, reponse) {
    if (c.jeu === 'phrase') {
      var ok = [c.mots.join(' ')].concat(c.alts || []).map(sansMajuscule);
      return ok.indexOf(sansMajuscule(reponse)) >= 0;
    }
    if (c.jeu === 'erreur') return Number(reponse) === c.faute;
    if (c.jeu === 'relier') return c.bonnes.every(function (d, g) { return reponse[g] === d; });
    return reponse === c.bonne;
  }
  // Nombre de paires justes (Relier).
  function pairesJustes(c, liens) { return c.bonnes.filter(function (d, g) { return liens[g] === d; }).length; }

  // Phrase corrigée de « Trouve l'erreur » (mot faux remplacé ou supprimé).
  function phraseCorrigee(c) {
    var m = c.mots.slice();
    if (c.correction) m[c.faute] = (c.avant || '') + c.correction + (c.apres || '');
    else m.splice(c.faute, 1);
    if (c.faute === 0) m[0] = majuscule(m[0]);
    return texte(m, c.fin);
  }

  // Correction écrite sous la carte : ce qu'il fallait répondre.
  function solution(c) {
    if (c.jeu === 'phrase') return texte(c.mots, c.fin);
    if (c.jeu === 'contraires') return 'Le contraire de « ' + c.mot + ' » est « ' + c.bonne + ' ».';
    if (c.jeu === 'nature') return '« ' + c.mots[c.cible].replace(/,$/, '') + ' » est ' + (c.bonne === 'Pr' || c.bonne === 'C' ? 'une ' : 'un ') + NATURES[c.bonne].toLowerCase() + '.';
    if (c.jeu === 'homophones') return c.phrase.replace('_', c.bonne);
    if (c.jeu === 'erreur') {
      var faux = c.mots[c.faute];
      return '« ' + faux.replace(/,$/, '') + ' » : ' + GENRES_ERREUR[c.genre] +
        (c.correction ? ' (« ' + (c.avant || '') + c.correction + (c.apres || '') + ' »)' : '') + '. ' + phraseCorrigee(c);
    }
    if (c.jeu === 'relier') return c.gauche.map(function (g, k) { return g + ' → ' + c.droite[c.bonnes[k]]; }).join(' · ');
    return '';
  }

  var api = {
    NIVEAUX: NIVEAUX, JEUX: JEUX, AIDES: AIDES, NATURES: NATURES, NATURES_NIVEAU: NATURES_NIVEAU, NB_PAIRES: NB_PAIRES,
    PHRASES: PHRASES, CONTRAIRES: CONTRAIRES, ERREURS: ERREURS, HOMOPHONES: HOMOPHONES, GROUPES_HOMOPHONES: GROUPES_HOMOPHONES, RELIER: RELIER,
    GENRES_ERREUR: GENRES_ERREUR,
    jeu: jeu, generer: generer, juste: juste, pairesJustes: pairesJustes, solution: solution, phraseCorrigee: phraseCorrigee,
    lirePhrase: lirePhrase, lireErreur: lireErreur, texte: texte, niveauValide: niveauValide
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Grammaire = api;
})(this);
