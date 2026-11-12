// Phonèmes (demande de l'utilisateur du 12/11/2026, backlog lignes 279 à 291).
// Quatrième matière du français, à côté de l'orthographe, de la conjugaison et de la grammaire. Pas de niveau
// (choix de l'utilisateur) : le joueur choisit des catégories (Consonnes, Voyelles, Semi-voyelles), les sons
// de ces catégories, puis ses petits jeux ; chaque carte tire un jeu et un de ses sons au hasard.
// Le français compte 36 phonèmes : 16 voyelles, 17 consonnes et 3 semi-voyelles (Office québécois de la
// langue française, Vitrine linguistique, « Les symboles de l'alphabet phonétique international »).
//  - completer : un mot à trou, choisir l'écriture du son (chap… : eau, au ou o ?) ;
//  - son       : un mot entier, les lettres d'un son en couleur, choisir ce son parmi 3 ;
//  - intrus    : 4 mots, 3 ont le son, toucher celui qui ne l'a pas ;
//  - position  : le son est-il au début, au milieu ou à la fin du mot ? ;
//  - relier    : deux colonnes, un son ↔ une écriture (comme « Relier les paires » de la grammaire) ;
//  - trier     : deux sons proches ([s] / [z]…), ranger 6 mots dans la bonne colonne.
// Module sans interface (utilisable dans la page et dans les tests Node) ; l'affichage est dans js/grammaire-carte.js.
(function (racine) {
  'use strict';

  // ---------- Les 36 sons ----------
  // Code interne = SAMPA (alphabet phonétique en lettres simples) ; api = symbole affiché entre crochets ;
  // mot = mot d'exemple (il commence par le son quand c'est possible ; sinon il le contient : [ə], [ɲ], [ŋ], [ø]).
  var CATEGORIES = [
    { id: 'consonnes', nom: 'Consonnes', court: 'Cons.', sons: [
      { id: 'p', api: 'p', mot: 'pomme' }, { id: 'b', api: 'b', mot: 'bateau' }, { id: 't', api: 't', mot: 'table' },
      { id: 'd', api: 'd', mot: 'domino' }, { id: 'k', api: 'k', mot: 'canard' }, { id: 'g', api: 'g', mot: 'gâteau' },
      { id: 'f', api: 'f', mot: 'fusée' }, { id: 'v', api: 'v', mot: 'vélo' }, { id: 's', api: 's', mot: 'soleil' },
      { id: 'z', api: 'z', mot: 'zèbre' }, { id: 'S', api: 'ʃ', mot: 'chat' }, { id: 'Z', api: 'ʒ', mot: 'jardin' },
      { id: 'm', api: 'm', mot: 'moto' }, { id: 'n', api: 'n', mot: 'nid' }, { id: 'J', api: 'ɲ', mot: 'agneau' },
      { id: 'N', api: 'ŋ', mot: 'parking' }, { id: 'l', api: 'l', mot: 'lune' }, { id: 'R', api: 'ʁ', mot: 'robot' }
    ] },
    { id: 'voyelles', nom: 'Voyelles', court: 'Voy.', sons: [
      { id: 'i', api: 'i', mot: 'île' }, { id: 'e', api: 'e', mot: 'école' }, { id: 'E', api: 'ɛ', mot: 'elle' },
      { id: 'a', api: 'a', mot: 'avion' }, { id: 'A', api: 'ɑ', mot: 'âne' }, { id: 'O', api: 'ɔ', mot: 'orange' },
      { id: 'o', api: 'o', mot: 'auto' }, { id: 'u', api: 'u', mot: 'ours' }, { id: 'y', api: 'y', mot: 'usine' },
      { id: '2', api: 'ø', mot: 'deux' }, { id: '9', api: 'œ', mot: 'œuf' }, { id: '@', api: 'ə', mot: 'cheval' },
      { id: 'e~', api: 'ɛ̃', mot: 'insecte' }, { id: 'a~', api: 'ɑ̃', mot: 'enfant' }, { id: 'o~', api: 'ɔ̃', mot: 'oncle' },
      { id: '9~', api: 'œ̃', mot: 'un' }
    ] },
    { id: 'semi', nom: 'Semi-voyelles', court: 'Semi-v.', sons: [
      { id: 'j', api: 'j', mot: 'yaourt' }, { id: 'w', api: 'w', mot: 'oui' }, { id: 'H', api: 'ɥ', mot: 'huit' }
    ] }
  ];
  // Remarque : 18 consonnes ci-dessus, dont [ŋ] (parking), venu de l'anglais ; la liste de l'OQLF en compte 17
  // sans lui. Il est gardé, comme dans beaucoup de tableaux de classe (hypothèse à valider, backlog ligne 280).
  var SONS = {};
  CATEGORIES.forEach(function (c) { c.sons.forEach(function (s) { s.categorie = c.id; SONS[s.id] = s; }); });
  // (Ordre des catégories : Object.keys mettrait d'abord les codes en chiffres, « 2 » et « 9 ».)
  var TOUS_SONS = [].concat.apply([], CATEGORIES.map(function (c) { return c.sons.map(function (s) { return s.id; }); }));

  // Écritures de chaque son (jeux « Complète le mot » et « Relier son ↔ écriture »).
  var GRAPHIES = {
    p: ['p', 'pp'], b: ['b', 'bb'], t: ['t', 'tt', 'th'], d: ['d', 'dd'], k: ['c', 'k', 'qu', 'ck'], g: ['g', 'gu'],
    f: ['f', 'ff', 'ph'], v: ['v', 'w'], s: ['s', 'ss', 'c', 'ç', 'sc'], z: ['z', 's'], S: ['ch', 'sh'], Z: ['j', 'g', 'ge'],
    m: ['m', 'mm'], n: ['n', 'nn'], J: ['gn'], N: ['ng'], l: ['l', 'll'], R: ['r', 'rr'],
    i: ['i', 'y', 'î'], e: ['é', 'er', 'ez'], E: ['è', 'ê', 'ai', 'ei', 'et'], a: ['a', 'à'], A: ['â'], O: ['o'],
    o: ['o', 'au', 'eau', 'ô'], u: ['ou', 'où', 'oû'], y: ['u', 'û'], 2: ['eu', 'œu'], 9: ['eu', 'œu', 'œ'], '@': ['e'],
    'e~': ['in', 'im', 'ain', 'ein'], 'a~': ['an', 'am', 'en', 'em'], 'o~': ['on', 'om'], '9~': ['un', 'um'],
    j: ['y', 'i', 'ill', 'il'], w: ['ou', 'w'], H: ['u']
  };
  // Sons proches (pièges des choix, paires de « Trier les mots »), le plus proche d'abord.
  var VOISINS = {
    p: ['b', 't'], b: ['p', 'd'], t: ['d', 'p'], d: ['t', 'b'], k: ['g', 't'], g: ['k', 'Z'], f: ['v', 's'], v: ['f', 'b'],
    s: ['z', 'S'], z: ['s', 'Z'], S: ['Z', 's'], Z: ['S', 'z'], m: ['n', 'b'], n: ['m', 'J'], J: ['n', 'N'], N: ['J', 'n'],
    l: ['R', 'n'], R: ['l', 'g'],
    i: ['y', 'e'], e: ['E', 'i'], E: ['e', 'a'], a: ['A', 'E'], A: ['a', 'O'], O: ['o', 'u'], o: ['O', 'u'], u: ['y', 'o'],
    y: ['u', 'i'], 2: ['9', '@'], 9: ['2', '@'], '@': ['2', 'e'], 'e~': ['a~', '9~'], 'a~': ['o~', 'e~'], 'o~': ['a~', 'o'],
    '9~': ['e~', 'a~'], j: ['i', 'H'], w: ['u', 'H'], H: ['w', 'y']
  };

  // Paires que beaucoup de Français ne distinguent pas (selon la région : [o]/[ɔ] de « pomme » et « pôle »,
  // [e]/[ɛ], [a]/[ɑ], [ø]/[œ], [ɛ̃]/[œ̃] de « brin » et « brun ») : elles ne se piègent jamais l'une l'autre
  // (ni l'intrus, ni les choix de « Quel son ? », ni les colonnes de « Trier les mots »), pour ne pas
  // compter faux une prononciation régionale.
  var DELICATS = [['O', 'o'], ['e', 'E'], ['a', 'A'], ['2', '9'], ['e~', '9~']];
  function delicat(x, y) { return DELICATS.some(function (d) { return (d[0] === x && d[1] === y) || (d[0] === y && d[1] === x); }); }
  // Voisins utilisables comme pièges du son id.
  function voisinsSurs(id) { return VOISINS[id].filter(function (v) { return !delicat(id, v); }); }

  // ---------- Les mots, découpés en sons ----------
  // « écritures séparées par des points | sons séparés par des espaces » : un son par morceau d'écriture ;
  // « - » = lettre muette ; « w+a » = deux sons pour un même morceau (oi). Codes SAMPA, voir SONS.
  var MOTS = [
    'p.o.mm.e|p O m -', 'p.i.r.a.t.e|p i R a t -', 'l.a.p.in|l a p e~', 's.ou.p.e|s u p -', 'p.i.ed|p j e',
    'p.u.ll|p y l', 'n.a.pp.e|n a p -', 'p.ou.l.e|p u l -', 'p.an.t.a.l.on|p a~ t a l o~', 'é.p.é.e|e p e -',
    'b.a.t.eau|b a t o', 'b.a.n.a.n.e|b a n a n -', 'r.o.b.e|R O b -', 'a.r.b.r.e|a R b R -', 'b.u.ll.e|b y l -',
    'a.b.e.ill.e|a b E j -', 'b.ou.ch.e|b u S -', 't.am.b.ou.r|t a~ b u R', 'b.a.ll.on|b a l o~', 't.a.b.l.e|t a b l -',
    't.a.p.i.s|t a p i -', 'p.a.tt.e|p a t -', 't.u.l.i.p.e|t y l i p -', 'm.o.t.o|m o t o', 'th.é|t e',
    'c.a.r.o.tt.e|k a R O t -', 't.i.g.r.e|t i g R -', 't.o.m.a.t.e|t O m a t -', 'd.en.t|d a~ -', 'r.a.d.i.s|R a d i -',
    's.a.l.a.d.e|s a l a d -', 'd.o.m.i.n.o|d O m i n o', 'd.ou.ch.e|d u S -', 'l.un.d.i|l 9~ d i', 'c.a.n.a.r.d|k a n a R -',
    'k.o.a.l.a|k O a l a', 'r.e.qu.in|R @ k e~', 's.a.c|s a k', 'k.i.w.i|k i w i', 'é.c.o.l.e|e k O l -',
    'c.u.b.e|k y b -', 'm.a.s.qu.e|m a s k -', 'g.â.t.eau|g A t o', 'g.a.r.e|g a R -', 'b.a.gu.e|b a g -',
    'gu.i.t.a.r.e|g i t a R -', 'l.é.g.u.m.e|l e g y m -', 'g.o.mm.e|g O m -', 'f.i.gu.e|f i g -', 'd.r.a.g.on|d R a g o~',
    'f.u.s.é.e|f y z e -', 'ph.a.r.e|f a R -', 'g.i.r.a.f.e|Z i R a f -', 'c.a.f.é|k a f e', 'n.eu.f|n 9 f',
    'œu.f|9 f', 'ph.o.t.o|f o t o', 'f.ou.r.m.i|f u R m i', 'ch.i.ff.r.e|S i f R -', 'f.eu.ill.e|f 9 j -',
    'v.é.l.o|v e l o', 'l.a.v.a.b.o|l a v a b o', 'w.a.g.on|v a g o~', 'ch.e.v.a.l|S @ v a l', 'v.a.l.i.s.e|v a l i z -',
    'o.l.i.v.e|O l i v -', 'ch.e.v.eu.x|S @ v 2 -', 'l.i.v.r.e|l i v R -', 's.o.l.e.il|s O l E j', 'p.oi.ss.on|p w+a s o~',
    'c.i.t.r.on|s i t R o~', 'l.e.ç.on|l @ s o~', 'p.i.sc.i.n.e|p i s i n -', 's.i.r.o.p|s i R o -', 't.a.ss.e|t a s -',
    'g.l.a.c.e|g l a s -', 'g.a.r.ç.on|g a R s o~', 's.ou.r.i.s|s u R i -', 's.a.p.in|s a p e~', 'z.è.b.r.e|z E b R -',
    'r.o.s.e|R o z -', 'm.ai.s.on|m E z o~', 'oi.s.eau|w+a z o', 'z.é.r.o|z e R o', 'ch.e.m.i.s.e|S @ m i z -',
    'c.e.r.i.s.e|s @ R i z -', 'f.r.ai.s.e|f R E z -', 'l.é.z.a.r.d|l e z a R -', 'd.ou.z.e|d u z -', 'p.oi.s.on|p w+a z o~',
    'ch.a.t|S a -', 'v.a.ch.e|v a S -', 'm.ou.ch.e|m u S -', 'sh.o.r.t|S O R t', 'n.i.ch.e|n i S -',
    'ch.i.en|S j e~', 'm.a.ch.i.n.e|m a S i n -', 'c.o.ch.on|k O S o~', 'j.a.r.d.in|Z a R d e~', 'j.u.p.e|Z y p -',
    'o.r.an.ge|O R a~ Z', 'p.i.ge.on|p i Z o~', 'n.ei.ge|n E Z', 'j.au.n.e|Z o n -', 'p.l.a.ge|p l a Z',
    'b.i.j.ou|b i Z u', 'g.e.n.ou|Z @ n u', 'j.eu.d.i|Z 2 d i', 'c.a.ge|k a Z', 'm.ou.t.on|m u t o~',
    'f.r.o.m.a.ge|f R O m a Z', 'l.am.p.e|l a~ p -', 'p.l.u.m.e|p l y m -', 'a.m.i|a m i', 'm.a.r.t.eau|m a R t o',
    'n.i.d|n i -', 'l.u.n.e|l y n -', 'n.u.a.ge|n H a Z', 'n.u.i.t|n H i -', 'n.ez|n e',
    'r.ei.n.e|R E n -', 't.o.nn.eau|t O n o', 'a.gn.eau|a J o', 'm.on.t.a.gn.e|m o~ t a J -', 'a.r.ai.gn.é.e|a R E J e -',
    'ch.am.p.i.gn.on|S a~ p i J o~', 'p.ei.gn.e|p E J -', 'l.i.gn.e|l i J -', 'c.y.gn.e|s i J -', 'p.a.r.k.i.ng|p a R k i N',
    'c.am.p.i.ng|k a~ p i N', 'p.u.dd.i.ng|p u d i N', 'sh.o.pp.i.ng|S O p i N', 'b.ow.l.i.ng|b u l i N', 'l.i.t|l i -',
    'b.o.l|b O l', 'l.i.on|l j o~', 'r.o.b.o.t|R O b o -', 'r.a.t|R a -', 'f.l.eu.r|f l 9 R',
    't.ou.r|t u R', 'v.e.rr.e|v E R -', 'î.l.e|i l -', 's.t.y.l.o|s t i l o', 'm.a.r.d.i|m a R d i',
    'r.i.z|R i -', 'c.l.é|k l e', 'r.o.ch.er|R O S e', 'p.a.n.i.er|p a n j e', 'e.ll.e|E l -',
    't.ê.t.e|t E t -', 'l.ai.t|l E -', 'f.o.r.ê.t|f O R E -', 'j.ou.et|Z w E', 'm.e.r|m E R',
    'p.ou.l.et|p u l E', 'l.e.tt.r.e|l E t R -', 'a.v.i.on|a v j o~', 'â.n.e|A n -', 'p.â.t.e|p A t -',
    'ch.â.t.eau|S A t o', 'b.â.t.on|b A t o~', 'p.o.r.t.e|p O R t -', 'au.t.o|o t o', 'ch.a.p.eau|S a p o',
    'd.o.s|d o -', 'ou.r.s|u R s', 'l.ou.p|l u -', 'u.s.i.n.e|y z i n -',
    'm.u.r|m y R', 'd.eu.x|d 2 -', 'b.l.eu|b l 2', 'f.eu|f 2', 'j.eu|Z 2',
    'h.eu.r.eu.x|- 9 R 2 -', 'p.eu.r|p 9 R', 's.œu.r|s 9 R', 'c.œu.r|k 9 R', 'b.eu.rr.e|b 9 R -',
    'f.e.n.ê.t.r.e|f @ n E t R -', 'p.e.t.i.t|p @ t i -', 'r.e.n.a.r.d|R @ n a R -', 'in.s.e.c.t.e|e~ s E k t -', 'm.ain|m e~',
    't.r.ain|t R e~', 'p.ein.t.u.r.e|p e~ t y R -', 't.im.b.r.e|t e~ b R -', 'd.au.ph.in|d o f e~', 'en.f.an.t|a~ f a~ -',
    'm.a.m.an|m a m a~', 's.e.r.p.en.t|s E R p a~ -', 'j.am.b.e|Z a~ b -', 'é.l.é.ph.an.t|e l e f a~ -', 'on.c.l.e|o~ k l -',
    'p.om.p.i.er|p o~ p j e', 'un|9~', 'b.r.un|b R 9~', 'p.a.r.f.um|p a R f 9~', 'ch.a.c.un|S a k 9~',
    'au.c.un|o k 9~', 'y.eu.x|j 2 -', 'y.a.ou.r.t|j a u R t', 'p.a.p.i.ll.on|p a p i j o~', 't.r.a.v.a.il|t R a v a j',
    'ou.i|w i', 'ou.e.s.t|w E s t', 'm.ou.e.tt.e|m w E t -', 'p.in.g.ou.in|p e~ g w e~', 'f.ou.et|f w E',
    'é.t.oi.l.e|e t w+a l -', 'm.i.r.oi.r|m i R w+a R', 'r.oi|R w+a', 'h.u.i.t|- H i t', 'p.l.u.i.e|p l H i -',
    'f.r.u.i.t|f R H i -', 'c.u.i.s.i.n.e|k H i z i n -'
  ];
  // Mots qui existent vraiment et qu'un mauvais choix de « Complète le mot » écrirait (poisson → poison…) :
  // ces choix ne sont jamais proposés, pour qu'il n'y ait qu'une seule bonne réponse.
  var VRAIS_MOTS = ['né', 'té', 'dé', 'mûr', 'lyon', 'tète', 'forait', 'rêne', 'poison', 'poisson', 'rosse', 'linge', 'peine',
    'fige', 'comme', 'baron', 'pur', 'erre', 'touche', 'drain', 'boule', 'boulet', 'boisson', 'beigne', 'veuille', 'ferre',
    'ongle', 'gage', 'nain', 'fourni', 'miche', 'rune', 'rit', 'rampe', 'loi', 'lobe', 'calotte', 'gale', 'tomme', 'dos',
    'pâte', 'patte', 'thé', 'pin', 'vin', 'fin', 'faim', 'sein', 'cou', 'coût', 'mot', 'sot', 'seau', 'saut', 'mère', 'vert',
    'vers', 'ver', 'tante', 'tente', 'champ', 'chant', 'conte', 'compte', 'sang', 'cent', 'sans', 'temps', 'tant', 'maire',
    'lion', 'chêne', 'chaîne', 'reine', 'raine', 'ombre', 'ambre', 'tâche', 'tache', 'mal', 'malle', 'bal', 'balle',
    'sel', 'selle', 'cane', 'canne', 'date', 'datte', 'chasse', 'châsse', 'pécher', 'pêcher', 'mur', 'sur', 'sûr', 'du', 'dû',
    'jeune', 'jeûne', 'cote', 'côte', 'cotte', 'notre', 'nôtre', 'roder', 'rôder', 'pole', 'pôle', 'rot', 'rôt', 'ou', 'où'];

  // Lecture d'un mot : { mot, morceaux: [{ g, sons: [] }], sons: [tous les sons prononcés, dans l'ordre] }.
  function lireMot(l) {
    var p = l.split('|'), gs = p[0].split('.'), ss = p[1].split(' ');
    if (gs.length !== ss.length) throw new Error('Mot mal découpé : ' + l);
    var morceaux = gs.map(function (g, k) { return { g: g, sons: ss[k] === '-' ? [] : ss[k].split('+') }; });
    return { mot: gs.join(''), morceaux: morceaux, sons: [].concat.apply([], morceaux.map(function (m) { return m.sons; })) };
  }
  var LUS = MOTS.map(lireMot);
  var PAR_MOT = {};
  LUS.forEach(function (m) { PAR_MOT[m.mot] = m; });

  // Mot d'exemple d'un son, découpé pour mettre en gras les lettres du son : { avant, son, apres, debut }.
  // debut = vrai quand le mot commence par le son (lettres muettes du début mises à part : h de huit).
  function exemple(id) {
    var s = SONS[id], m = PAR_MOT[s.mot];
    if (!m) return { avant: '', son: '', apres: s.mot, debut: false };
    var k = -1;
    m.morceaux.forEach(function (x, i) { if (k < 0 && x.sons.length === 1 && x.sons[0] === id) k = i; });
    if (k < 0) return { avant: '', son: '', apres: s.mot, debut: false };
    var g = function (a, b) { return m.morceaux.slice(a, b).map(function (x) { return x.g; }).join(''); };
    return { avant: g(0, k), son: m.morceaux[k].g, apres: g(k + 1), debut: m.sons[0] === id };
  }
  // Le son dit par la voix (la synthèse vocale ne sait pas lire l'alphabet phonétique) :
  // « le son du début de pomme », ou « le son "gn" de agneau » quand le mot ne commence pas par lui.
  function sonOral(id) {
    var e = exemple(id), mot = SONS[id].mot;
    return e.debut ? 'le son du début de « ' + mot + ' »' : 'le son « ' + e.son + ' » de « ' + mot + ' »';
  }

  // ---------- Les jeux ----------
  var JEUX = [
    { id: 'completer', nom: 'Complète le mot', court: 'Compléter' },
    { id: 'son', nom: 'Quel son ?', court: 'Quel son ?' },
    { id: 'intrus', nom: 'L’intrus', court: 'Intrus' },
    { id: 'position', nom: 'Où est le son ?', court: 'Où ?' },
    { id: 'relier', nom: 'Relier son ↔ écriture', court: 'Relier' },
    { id: 'trier', nom: 'Trier les mots', court: 'Trier' }
  ];
  function jeu(id) { for (var i = 0; i < JEUX.length; i++) if (JEUX[i].id === id) return JEUX[i]; return null; }
  var POSITIONS = [{ id: 'debut', nom: 'Au début' }, { id: 'milieu', nom: 'Au milieu' }, { id: 'fin', nom: 'À la fin' }];

  // ---------- Outils ----------
  function melanger(t, r) {
    t = t.slice();
    for (var i = t.length - 1; i > 0; i--) { var k = Math.floor(r() * (i + 1)), x = t[i]; t[i] = t[k]; t[k] = x; }
    return t;
  }
  function tirer(t, r) { return t[Math.floor(r() * t.length)]; }
  function crochets(id) { return '[' + SONS[id].api + ']'; }
  function contient(m, id) { return m.sons.indexOf(id) >= 0; }
  function compte(m, id) { return m.sons.filter(function (s) { return s === id; }).length; }
  // Morceaux d'un seul son égal à id (ceux qu'on peut colorier ou cacher).
  function morceauxDe(m, id) {
    var t = [];
    m.morceaux.forEach(function (x, k) { if (x.sons.length === 1 && x.sons[0] === id) t.push(k); });
    return t;
  }
  // Sons gardés : ceux du joueur s'il en a, sinon tous.
  function sonsValides(liste) {
    var t = (liste || []).filter(function (s) { return SONS[s]; });
    return t.length ? t : TOUS_SONS.slice();
  }
  // Mot affiché, avec le morceau k remplacé (trou ou autre écriture).
  function avec(m, k, g) { return m.morceaux.map(function (x, i) { return i === k ? g : x.g; }).join(''); }

  // Écritures proposées pour cacher le morceau k du mot m (la bonne et 2 autres), ou null si impossible.
  // D'abord les autres écritures du même son, puis celles des sons proches ; jamais une écriture qui ferait
  // un vrai mot, ni une consonne doublée en début de mot.
  function ecrituresPour(m, k, r) {
    var x = m.morceaux[k], id = x.sons[0], bonne = x.g;
    if (!GRAPHIES[id] || GRAPHIES[id].indexOf(bonne.toLowerCase()) < 0) return null;
    function ok(g) {
      if (g === bonne) return false;
      if (k === 0 && /^(.)\1/.test(g)) return false;
      return VRAIS_MOTS.indexOf(avec(m, k, g)) < 0;
    }
    var memes = melanger(GRAPHIES[id].filter(ok), r), autres = [];
    VOISINS[id].forEach(function (v) { melanger(GRAPHIES[v], r).forEach(function (g) { if (ok(g) && memes.indexOf(g) < 0 && autres.indexOf(g) < 0) autres.push(g); }); });
    var pieges = memes.concat(autres).slice(0, 2);
    if (pieges.length < 2) return null;
    return melanger([bonne].concat(pieges), r);
  }

  // ---------- Fabrication d'une carte ----------
  // generer(jeuId, sons, r, vus) : une carte du jeu, sur un des sons donnés (au hasard), ou null si ce jeu ne peut
  // rien faire avec ces sons. vus = clés des dernières cartes (évitées si possible).
  function generer(jeuId, sons, r, vus) {
    r = r || Math.random; vus = vus || [];
    var liste = melanger(sonsValides(sons), r), meilleure = null;
    for (var i = 0; i < liste.length; i++) {
      for (var essai = 0; essai < 6; essai++) {
        var c = fabriquer(jeuId, liste[i], sonsValides(sons), r);
        if (!c) break;
        c.jeu = jeuId; c.module = 'phonemes';
        if (vus.indexOf(c.cle) < 0) return c;
        meilleure = meilleure || c;
      }
    }
    return meilleure;
  }

  function fabriquer(jeuId, id, choisis, r) {
    var s = SONS[id], cs = crochets(id);
    if (jeuId === 'completer') {
      var possibles = [];
      LUS.forEach(function (m) { morceauxDe(m, id).forEach(function (k) { if (m.sons.length > 1 || m.morceaux.length > 1) possibles.push([m, k]); }); });
      possibles = melanger(possibles, r);
      for (var p = 0; p < possibles.length; p++) {
        var m = possibles[p][0], k = possibles[p][1], choix = ecrituresPour(m, k, r);
        if (!choix) continue;
        return { cle: 'completer|' + m.mot + '|' + k, son: id, mot: m.mot, k: k,
          avant: m.morceaux.slice(0, k).map(function (x) { return x.g; }).join(''),
          apres: m.morceaux.slice(k + 1).map(function (x) { return x.g; }).join(''),
          bonne: m.morceaux[k].g, choix: choix,
          consigne: 'Complète le mot avec la bonne écriture du son ' + cs + ' :',
          oral: 'Complète le mot ' + m.mot + ' avec la bonne écriture du ' + sonOral(id).slice(3) + '. Choisis entre : ' + choix.join(', ') + '.' };
      }
      return null;
    }
    if (jeuId === 'son') {
      var mots = LUS.filter(function (m) { return morceauxDe(m, id).length; });
      if (!mots.length) return null;
      var mo = tirer(mots, r), kk = tirer(morceauxDe(mo, id), r);
      // Pièges : le son le plus proche, puis un autre son proche ou de la même catégorie (jamais un son du mot coloré).
      var pieges = [];
      VOISINS[id].concat(melanger(CATEGORIES.filter(function (c) { return c.id === s.categorie; })[0].sons.map(function (x) { return x.id; }), r))
        .forEach(function (v) { if (v !== id && !delicat(id, v) && pieges.length < 2 && pieges.indexOf(v) < 0) pieges.push(v); });
      var choixSons = melanger([id].concat(pieges), r);
      return { cle: 'son|' + mo.mot + '|' + kk, son: id, mot: mo.mot, k: kk, morceaux: mo.morceaux.map(function (x) { return x.g; }),
        bonne: id, choix: choixSons,
        consigne: 'Quel son font les lettres en couleur ?',
        oral: 'Dans le mot ' + mo.mot + ', quel son font les lettres ' + mo.morceaux[kk].g.split('').join(' ') + ' ? Est-ce ' +
          choixSons.map(function (v) { return sonOral(v); }).join(', ou ') + ' ?' };
    }
    if (jeuId === 'intrus') {
      var avecSon = melanger(LUS.filter(function (m) { return contient(m, id); }), r);
      if (avecSon.length < 3) return null;
      // L'intrus a de préférence un son proche (rose pour [s]) : c'est le vrai piège.
      var sans = LUS.filter(function (m) { return !contient(m, id); });
      var sur = voisinsSurs(id)[0];
      var proches = sur ? sans.filter(function (m) { return contient(m, sur); }) : [];
      var intrus = tirer(proches.length ? proches : sans, r);
      var quatre = melanger(avecSon.slice(0, 3).concat([intrus]), r).map(function (m) { return m.mot; });
      return { cle: 'intrus|' + id + '|' + quatre.slice().sort().join(','), son: id, mots: quatre, bonne: intrus.mot, choix: quatre,
        consigne: 'Quel mot n’a pas le son ' + cs + ' ?',
        oral: 'Quel mot n’a pas ' + sonOral(id) + ' ? ' + quatre.join(', ') + '.' };
    }
    if (jeuId === 'position') {
      // Mots où l'on entend le son une seule fois (sinon « où » n'a pas de sens), au moins 3 sons.
      var bons = LUS.filter(function (m) { return compte(m, id) === 1 && m.sons.length >= 3; });
      if (!bons.length) return null;
      // Pour varier les réponses, une place d'abord, puis un mot où le son est à cette place.
      var parPlace = { debut: [], milieu: [], fin: [] };
      bons.forEach(function (m) { parPlace[placeDe(m, id)].push(m); });
      var places = POSITIONS.map(function (x) { return x.id; }).filter(function (x) { return parPlace[x].length; });
      var pl = tirer(places, r), mp = tirer(parPlace[pl], r);
      return { cle: 'position|' + id + '|' + mp.mot, son: id, mot: mp.mot, bonne: pl, choix: POSITIONS.map(function (x) { return x.id; }),
        consigne: 'Où entends-tu le son ' + cs + ' ?',
        oral: 'Dans le mot ' + mp.mot + ', où entends-tu ' + sonOral(id) + ' ? Au début, au milieu ou à la fin ?' };
    }
    if (jeuId === 'relier') {
      // 6 sons au plus : ceux du joueur d'abord (celui-ci en premier), puis d'autres de mêmes catégories.
      var cats = [];
      choisis.forEach(function (x) { if (cats.indexOf(SONS[x].categorie) < 0) cats.push(SONS[x].categorie); });
      var autresSons = melanger(TOUS_SONS.filter(function (x) { return cats.indexOf(SONS[x].categorie) >= 0 && choisis.indexOf(x) < 0; }), r);
      // Puis, s'il en manque (semi-voyelles seules : 3 sons), des sons des autres catégories.
      var horsCat = melanger(TOUS_SONS.filter(function (x) { return cats.indexOf(SONS[x].categorie) < 0; }), r);
      var candidats = [id].concat(melanger(choisis.filter(function (x) { return x !== id; }), r), autresSons, horsCat);
      var paires = [];
      candidats.forEach(function (x) {
        if (paires.length >= 6) return;
        // Une écriture de ce son que n'a aucun autre son de la carte (dans les deux sens).
        var pris = paires.map(function (q) { return q[0]; });
        var gs = melanger(GRAPHIES[x], r).filter(function (g) {
          return pris.every(function (y) { return GRAPHIES[y].indexOf(g) < 0; }) &&
            paires.every(function (q) { return GRAPHIES[x].indexOf(q[1]) < 0; });
        });
        if (gs.length) paires.push([x, gs[0]]);
      });
      if (paires.length < 4) return null;
      paires = melanger(paires, r);
      var gauche = paires.map(function (q) { return q[0]; });
      var droite = melanger(paires.map(function (q) { return q[1]; }), r);
      return { cle: 'relier|' + gauche.slice().sort().join(','), son: id, gauche: gauche, droite: droite,
        bonnes: paires.map(function (q) { return droite.indexOf(q[1]); }),
        consigne: 'Relie chaque son à une de ses écritures :', oral: 'Relie chaque son à une de ses écritures.' };
    }
    if (jeuId === 'trier') {
      // Le son et son voisin le plus proche qui a assez de mots (3 de chaque côté, sans l'autre son).
      var voisins = voisinsSurs(id);
      for (var v = 0; v < voisins.length; v++) {
        var autre = voisins[v];
        var a1 = LUS.filter(function (m) { return contient(m, id) && !contient(m, autre); });
        var a2 = LUS.filter(function (m) { return contient(m, autre) && !contient(m, id); });
        if (a1.length < 3 || a2.length < 3) continue;
        var cols = melanger([id, autre], r);
        var ms = melanger(melanger(a1, r).slice(0, 3).concat(melanger(a2, r).slice(0, 3)), r);
        return { cle: 'trier|' + cols.slice().sort().join(',') + '|' + ms.map(function (m) { return m.mot; }).sort().join(','), son: id,
          colonnes: cols, mots: ms.map(function (m) { return m.mot; }),
          bonnes: ms.map(function (m) { return contient(m, cols[0]) ? 0 : 1; }),
          consigne: 'Range chaque mot sous le son que tu entends :',
          oral: 'Range chaque mot dans la bonne colonne : ' + sonOral(cols[0]) + ', ou ' + sonOral(cols[1]) + '. ' + ms.map(function (m) { return m.mot; }).join(', ') + '.' };
      }
      return null;
    }
    throw new Error('Jeu de phonèmes inconnu : ' + jeuId);
  }

  function nomPosition(p) { return { debut: 'Au début', milieu: 'Au milieu', fin: 'À la fin' }[p] || p; }

  // Place du son (entendu une fois) parmi les sons prononcés du mot.
  function placeDe(m, id) {
    var i = m.sons.indexOf(id);
    return i === 0 ? 'debut' : i === m.sons.length - 1 ? 'fin' : 'milieu';
  }

  // ---------- Correction ----------
  // Réponse : texte choisi (completer, son, intrus, position), liens (relier : liens[g] = position à droite),
  // colonnes (trier : rangs[i] = colonne du mot i).
  function juste(c, reponse) {
    if (c.jeu === 'relier' || c.jeu === 'trier') return Array.isArray(reponse) && c.bonnes.every(function (d, g) { return reponse[g] === d; });
    return reponse === c.bonne;
  }
  function pairesJustes(c, liens) { return c.bonnes.filter(function (d, g) { return liens[g] === d; }).length; }

  // Correction écrite sous la carte : ce qu'il fallait répondre.
  function solution(c) {
    var cs = crochets(c.son);
    if (c.jeu === 'completer') return '« ' + c.mot + ' » s’écrit avec « ' + c.bonne + ' ».';
    if (c.jeu === 'son') return 'Dans « ' + c.mot + ' », « ' + c.morceaux[c.k] + ' » fait le son ' + cs + ' (comme dans « ' + SONS[c.son].mot + ' »).';
    if (c.jeu === 'intrus') {
      var m = PAR_MOT[c.bonne], v = voisinsSurs(c.son).filter(function (x) { return contient(m, x); })[0];
      return '« ' + c.bonne + ' » n’a pas le son ' + cs + (v ? ' : on y entend ' + crochets(v) : '') + '.';
    }
    if (c.jeu === 'position') return 'Dans « ' + c.mot + ' », le son ' + cs + ' est ' + { debut: 'au début', milieu: 'au milieu', fin: 'à la fin' }[c.bonne] + '.';
    if (c.jeu === 'relier') return c.gauche.map(function (g, k) { return crochets(g) + ' → ' + c.droite[c.bonnes[k]]; }).join(' · ');
    if (c.jeu === 'trier') return c.colonnes.map(function (s, k) {
      return crochets(s) + ' : ' + c.mots.filter(function (m, i) { return c.bonnes[i] === k; }).join(', ');
    }).join(' · ');
    return '';
  }

  var api = {
    CATEGORIES: CATEGORIES, SONS: SONS, TOUS_SONS: TOUS_SONS, GRAPHIES: GRAPHIES, VOISINS: VOISINS, MOTS: MOTS, VRAIS_MOTS: VRAIS_MOTS,
    JEUX: JEUX, POSITIONS: POSITIONS, DELICATS: DELICATS, delicat: delicat,
    jeu: jeu, lireMot: lireMot, exemple: exemple, sonOral: sonOral, nomPosition: nomPosition, mot: function (m) { return PAR_MOT[m] || null; }, crochets: crochets, placeDe: placeDe,
    generer: generer, juste: juste, pairesJustes: pairesJustes, solution: solution, ecrituresPour: ecrituresPour
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Phonemes = api;
})(this);
