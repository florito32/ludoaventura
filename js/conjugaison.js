// Cartes de conjugaison (Français → Conjugaison), demande de l'utilisateur du 03/11/2026.
// Le joueur choisit à la préparation :
//  - les temps, rangés par mode (indicatif, conditionnel, subjonctif, impératif), au moins un ;
//  - les groupes de verbes (1er, 2e, 3e), au moins un ;
//  - le niveau : Facile, Moyen, Difficile, Expert. Le niveau rend les verbes plus rares
//    (choix de l'utilisateur) : chaque verbe est rangé dans un des 4 niveaux.
// À chaque carte : un pronom, un verbe à l'infinitif et un temps ; le joueur écrit la forme conjuguée.
// Les formes sont calculées ici (radicaux + terminaisons) et vérifiées par tests/conjugaison.spec.js.
// Orthographe : l'orthographe traditionnelle est affichée ; les variantes admises par les
// rectifications de 1990 sont aussi acceptées (préfèrerai, connait, plait…).
// Module sans interface : utilisable dans la page (window.Conjugaison) et dans les tests Node.
(function (racine) {
  'use strict';

  // ---------- Temps, rangés par mode ----------
  // aux : pour un temps composé, le temps simple de l'auxiliaire (avoir ou être) + participe passé.
  var MODES = [
    { id: 'indicatif', nom: 'Indicatif', temps: [
      { id: 'ind-present', nom: 'Présent' },
      { id: 'ind-imparfait', nom: 'Imparfait' },
      { id: 'ind-passe-simple', nom: 'Passé simple' },
      { id: 'ind-futur', nom: 'Futur simple' },
      { id: 'ind-passe-compose', nom: 'Passé composé', aux: 'ind-present' },
      { id: 'ind-plus-que-parfait', nom: 'Plus-que-parfait', aux: 'ind-imparfait' },
      { id: 'ind-passe-anterieur', nom: 'Passé antérieur', aux: 'ind-passe-simple' },
      { id: 'ind-futur-anterieur', nom: 'Futur antérieur', aux: 'ind-futur' }
    ] },
    { id: 'conditionnel', nom: 'Conditionnel', temps: [
      { id: 'cond-present', nom: 'Présent' },
      { id: 'cond-passe', nom: 'Passé', aux: 'cond-present' }
    ] },
    { id: 'subjonctif', nom: 'Subjonctif', temps: [
      { id: 'subj-present', nom: 'Présent' },
      { id: 'subj-imparfait', nom: 'Imparfait' },
      { id: 'subj-passe', nom: 'Passé', aux: 'subj-present' },
      { id: 'subj-plus-que-parfait', nom: 'Plus-que-parfait', aux: 'subj-imparfait' }
    ] },
    { id: 'imperatif', nom: 'Impératif', temps: [
      { id: 'imp-present', nom: 'Présent' }
    ] }
  ];
  var TEMPS = [];
  MODES.forEach(function (m) { m.temps.forEach(function (t) { t.mode = m.id; t.modeNom = m.nom; TEMPS.push(t); }); });
  function temps(id) { for (var i = 0; i < TEMPS.length; i++) if (TEMPS[i].id === id) return TEMPS[i]; return null; }

  var GROUPES = [
    { id: 1, nom: '1er groupe', exemple: 'chanter' },
    { id: 2, nom: '2e groupe', exemple: 'finir' },
    { id: 3, nom: '3e groupe', exemple: 'prendre' }
  ];
  var NIVEAUX = [
    { id: 'facile', nom: 'Facile', rang: 1 },
    { id: 'moyen', nom: 'Moyen', rang: 2 },
    { id: 'difficile', nom: 'Difficile', rang: 3 },
    { id: 'expert', nom: 'Expert', rang: 4 }
  ];
  function niveau(id) { for (var i = 0; i < NIVEAUX.length; i++) if (NIVEAUX[i].id === id) return NIVEAUX[i]; return NIVEAUX[0]; }

  // Pronoms : p = personne (0 je … 5 ils/elles), f = féminin, pl = pluriel (accord avec être).
  var PRONOMS = [
    { id: 'je', p: 0 }, { id: 'tu', p: 1 }, { id: 'il', p: 2 }, { id: 'elle', p: 2, f: true },
    { id: 'nous', p: 3, pl: true }, { id: 'vous', p: 4, pl: true }, { id: 'ils', p: 5, pl: true }, { id: 'elles', p: 5, f: true, pl: true }
  ];
  // Impératif : seulement tu, nous, vous (pas de pronom sujet écrit).
  var PRONOMS_IMP = ['tu', 'nous', 'vous'];

  // ---------- Verbes ----------
  // n = niveau (1 Facile … 4 Expert : du plus courant au plus rare), etre = auxiliaire être.
  // 1er groupe, t = particularité d'écriture :
  //   cer (ç devant a, o), ger (ge devant a, o), e (e → è : lever), ea (é → è : préférer),
  //   ll / tt (consonne doublée : appeler, jeter), yer (y → i : nettoyer), envoyer.
  var PREMIER = [
    ['chanter', 1], ['parler', 1], ['jouer', 1], ['aimer', 1], ['regarder', 1], ['danser', 1], ['marcher', 1],
    ['donner', 1], ['écouter', 1], ['trouver', 1], ['arriver', 1, '', 1], ['tomber', 1, '', 1], ['rester', 1, '', 1], ['entrer', 1, '', 1],
    ['manger', 2, 'ger'], ['commencer', 2, 'cer'], ['nager', 2, 'ger'], ['lancer', 2, 'cer'], ['acheter', 2, 'e'], ['lever', 2, 'e'],
    ['appeler', 2, 'll'], ['jeter', 2, 'tt'], ['préférer', 2, 'ea'], ['oublier', 2], ['crier', 2], ['monter', 2, '', 1], ['rentrer', 2, '', 1],
    ['ranger', 3, 'ger'], ['placer', 3, 'cer'], ['geler', 3, 'e'], ['peser', 3, 'e'], ['épeler', 3, 'll'], ['répéter', 3, 'ea'],
    ['espérer', 3, 'ea'], ['nettoyer', 3, 'yer'], ['employer', 3, 'yer'], ['étudier', 3], ['créer', 3], ['envoyer', 3, 'envoyer'], ['retourner', 3, '', 1],
    ['harceler', 4, 'e'], ['modeler', 4, 'e'], ['rapiécer', 4, 'cer ea'], ['assiéger', 4, 'ger ea'], ['essuyer', 4, 'yer'], ['tutoyer', 4, 'yer'],
    ['ennuyer', 4, 'yer'], ['étinceler', 4, 'll'], ['feuilleter', 4, 'tt'], ['abréger', 4, 'ger ea'], ['considérer', 4, 'ea'], ['déléguer', 4, 'ea']
  ];
  var DEUXIEME = [
    ['finir', 1], ['choisir', 1], ['grandir', 1], ['remplir', 1], ['rougir', 1],
    ['réussir', 2], ['obéir', 2], ['punir', 2], ['salir', 2], ['bâtir', 2], ['applaudir', 2],
    ['nourrir', 3], ['réfléchir', 3], ['saisir', 3], ['ralentir', 3], ['établir', 3], ['réagir', 3],
    ['haïr', 4], ['accomplir', 4], ['franchir', 4], ['fléchir', 4], ['envahir', 4], ['assouvir', 4]
  ];
  // 3e groupe : formes de base données à la main.
  //  p : présent de l'indicatif (6 formes) ; i : radical de l'imparfait (sinon « nous » du présent sans -ons) ;
  //  ps : radical + type du passé simple (a, i, u, in) ; f : radical du futur et du conditionnel ;
  //  s : radicaux du subjonctif présent [je, tu, il, ils | nous, vous] ; pp : participe passé ;
  //  imp : impératif (tu, nous, vous) s'il n'est pas tiré du présent, null s'il n'est pas proposé ;
  //  subj : subjonctif présent complet s'il est irrégulier.
  var TROISIEME = [
    { v: 'être', n: 1, p: 'suis es est sommes êtes sont', i: 'ét', ps: 'fu', f: 'ser', subj: 'sois sois soit soyons soyez soient', imp: 'sois soyons soyez', pp: 'été' },
    { v: 'avoir', n: 1, p: 'ai as a avons avez ont', ps: 'eu', f: 'aur', subj: 'aie aies ait ayons ayez aient', imp: 'aie ayons ayez', pp: 'eu' },
    { v: 'aller', n: 1, etre: 1, p: 'vais vas va allons allez vont', ps: 'all a', f: 'ir', s: 'aill all', imp: 'va allons allez', pp: 'allé' },
    { v: 'faire', n: 1, p: 'fais fais fait faisons faites font', ps: 'f i', f: 'fer', s: 'fass fass', pp: 'fait' },
    { v: 'dire', n: 1, p: 'dis dis dit disons dites disent', ps: 'd i', f: 'dir', pp: 'dit' },
    { v: 'voir', n: 1, p: 'vois vois voit voyons voyez voient', ps: 'v i', f: 'verr', s: 'voi voy', pp: 'vu' },
    { v: 'venir', n: 1, etre: 1, p: 'viens viens vient venons venez viennent', ps: 'v in', f: 'viendr', s: 'vienn ven', pp: 'venu' },
    { v: 'prendre', n: 1, p: 'prends prends prend prenons prenez prennent', ps: 'pr i', f: 'prendr', s: 'prenn pren', pp: 'pris' },
    { v: 'pouvoir', n: 1, p: 'peux|puis peux peut pouvons pouvez peuvent', ps: 'p u', f: 'pourr', s: 'puiss puiss', imp: null, pp: 'pu' },
    { v: 'vouloir', n: 1, p: 'veux veux veut voulons voulez veulent', ps: 'voul u', f: 'voudr', s: 'veuill voul', imp: 'veuille|veux veuillons|voulons veuillez|voulez', pp: 'voulu' },
    { v: 'répondre', n: 1, p: 'réponds réponds répond répondons répondez répondent', ps: 'répond i', f: 'répondr', pp: 'répondu' },
    { v: 'partir', n: 2, etre: 1, p: 'pars pars part partons partez partent', ps: 'part i', f: 'partir', pp: 'parti' },
    { v: 'sortir', n: 2, etre: 1, p: 'sors sors sort sortons sortez sortent', ps: 'sort i', f: 'sortir', pp: 'sorti' },
    { v: 'mettre', n: 2, p: 'mets mets met mettons mettez mettent', ps: 'm i', f: 'mettr', pp: 'mis' },
    { v: 'savoir', n: 2, p: 'sais sais sait savons savez savent', ps: 's u', f: 'saur', s: 'sach sach', imp: 'sache sachons sachez', pp: 'su' },
    { v: 'lire', n: 2, p: 'lis lis lit lisons lisez lisent', ps: 'l u', f: 'lir', pp: 'lu' },
    { v: 'écrire', n: 2, p: 'écris écris écrit écrivons écrivez écrivent', ps: 'écriv i', f: 'écrir', pp: 'écrit' },
    { v: 'boire', n: 2, p: 'bois bois boit buvons buvez boivent', ps: 'b u', f: 'boir', s: 'boiv buv', pp: 'bu' },
    { v: 'dormir', n: 2, p: 'dors dors dort dormons dormez dorment', ps: 'dorm i', f: 'dormir', pp: 'dormi' },
    { v: 'courir', n: 2, p: 'cours cours court courons courez courent', ps: 'cour u', f: 'courr', pp: 'couru' },
    { v: 'devoir', n: 2, p: 'dois dois doit devons devez doivent', ps: 'd u', f: 'devr', s: 'doiv dev', imp: null, pp: 'dû' },
    { v: 'descendre', n: 2, etre: 1, p: 'descends descends descend descendons descendez descendent', ps: 'descend i', f: 'descendr', pp: 'descendu' },
    { v: 'entendre', n: 2, p: 'entends entends entend entendons entendez entendent', ps: 'entend i', f: 'entendr', pp: 'entendu' },
    { v: 'perdre', n: 2, p: 'perds perds perd perdons perdez perdent', ps: 'perd i', f: 'perdr', pp: 'perdu' },
    { v: 'tenir', n: 3, p: 'tiens tiens tient tenons tenez tiennent', ps: 't in', f: 'tiendr', s: 'tienn ten', pp: 'tenu' },
    { v: 'recevoir', n: 3, p: 'reçois reçois reçoit recevons recevez reçoivent', ps: 'reç u', f: 'recevr', s: 'reçoiv recev', pp: 'reçu' },
    { v: 'connaître', n: 3, p: 'connais connais connaît connaissons connaissez connaissent', ps: 'conn u', f: 'connaîtr', pp: 'connu' },
    { v: 'croire', n: 3, p: 'crois crois croit croyons croyez croient', ps: 'cr u', f: 'croir', s: 'croi croy', pp: 'cru' },
    { v: 'vivre', n: 3, p: 'vis vis vit vivons vivez vivent', ps: 'véc u', f: 'vivr', pp: 'vécu' },
    { v: 'mourir', n: 3, etre: 1, p: 'meurs meurs meurt mourons mourez meurent', ps: 'mour u', f: 'mourr', s: 'meur mour', pp: 'mort' },
    { v: 'naître', n: 3, etre: 1, p: 'nais nais naît naissons naissez naissent', ps: 'naqu i', f: 'naîtr', pp: 'né' },
    { v: 'ouvrir', n: 3, p: 'ouvre ouvres ouvre ouvrons ouvrez ouvrent', ps: 'ouvr i', f: 'ouvrir', pp: 'ouvert' },
    { v: 'offrir', n: 3, p: 'offre offres offre offrons offrez offrent', ps: 'offr i', f: 'offrir', pp: 'offert' },
    { v: 'peindre', n: 3, p: 'peins peins peint peignons peignez peignent', ps: 'peign i', f: 'peindr', pp: 'peint' },
    { v: 'battre', n: 3, p: 'bats bats bat battons battez battent', ps: 'batt i', f: 'battr', pp: 'battu' },
    { v: 'suivre', n: 3, p: 'suis suis suit suivons suivez suivent', ps: 'suiv i', f: 'suivr', pp: 'suivi' },
    { v: 'rire', n: 3, p: 'ris ris rit rions riez rient', i: 'ri', ps: 'r i', f: 'rir', s: 'ri ri', pp: 'ri' },
    { v: 'résoudre', n: 4, p: 'résous résous résout résolvons résolvez résolvent', ps: 'résol u', f: 'résoudr', pp: 'résolu' },
    { v: 'coudre', n: 4, p: 'couds couds coud cousons cousez cousent', ps: 'cous i', f: 'coudr', pp: 'cousu' },
    { v: 'vaincre', n: 4, p: 'vaincs vaincs vainc vainquons vainquez vainquent', ps: 'vainqu i', f: 'vaincr', pp: 'vaincu' },
    { v: 'acquérir', n: 4, p: 'acquiers acquiers acquiert acquérons acquérez acquièrent', ps: 'acqu i', f: 'acquerr', s: 'acquièr acquér', pp: 'acquis' },
    { v: 'conclure', n: 4, p: 'conclus conclus conclut concluons concluez concluent', i: 'conclu', ps: 'concl u', f: 'conclur', s: 'conclu conclu', pp: 'conclu' },
    { v: 'cueillir', n: 4, p: 'cueille cueilles cueille cueillons cueillez cueillent', ps: 'cueill i', f: 'cueiller', pp: 'cueilli' },
    { v: 'plaire', n: 4, p: 'plais plais plaît plaisons plaisez plaisent', ps: 'pl u', f: 'plair', pp: 'plu' },
    { v: 'craindre', n: 4, p: 'crains crains craint craignons craignez craignent', ps: 'craign i', f: 'craindr', pp: 'craint' },
    { v: 'joindre', n: 4, p: 'joins joins joint joignons joignez joignent', ps: 'joign i', f: 'joindr', pp: 'joint' },
    { v: 'valoir', n: 4, p: 'vaux vaux vaut valons valez valent', ps: 'val u', f: 'vaudr', s: 'vaill val', imp: null, pp: 'valu' },
    { v: 'fuir', n: 4, p: 'fuis fuis fuit fuyons fuyez fuient', ps: 'fu i', f: 'fuir', s: 'fui fuy', pp: 'fui' },
    { v: 'bouillir', n: 4, p: 'bous bous bout bouillons bouillez bouillent', ps: 'bouill i', f: 'bouillir', pp: 'bouilli' }
  ];

  // ---------- Construction des formes de base ----------
  var TERM_PS = {
    a: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'],
    i: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
    u: ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'],
    'in': ['ins', 'ins', 'int', 'înmes', 'întes', 'inrent']
  };

  // Verbe du 1er groupe → formes de base. b = radical (chant), t = particularités.
  function premier(inf, t) {
    var b = inf.slice(0, -2), has = function (x) { return (' ' + t + ' ').indexOf(' ' + x + ' ') >= 0; };
    var doux = b; // radical devant a et o (commenç, mange)
    if (has('cer')) doux = b.slice(0, -1) + 'ç';
    if (has('ger')) doux = b + 'e';
    var fort = b; // radical devant un e muet (je lève, j'appelle, je nettoie)
    if (has('e')) fort = b.replace(/e([^aeiouyéèêë]+)$/, 'è$1');
    if (has('ea')) fort = b.replace(/é([^aeiouyéèêë]+u?)$/, 'è$1'); // préfèr, délègu
    if (has('ll') || has('tt')) fort = b + b.slice(-1);
    if (has('yer') || has('envoyer')) fort = b.slice(0, -1) + 'i';
    var fut = (has('e') || has('ll') || has('tt') || has('yer')) ? fort + 'er' : inf;
    if (has('envoyer')) fut = 'enverr'; // enverrai
    var futVar = has('ea') ? fort + 'er' : null; // préfèrerai (rectifications de 1990)
    var p = [fort + 'e', fort + 'es', fort + 'e', doux + 'ons', b + 'ez', fort + 'ent'];
    return { p: p, i: doux, iNousVous: b, ps: { r: doux, rDernier: b, type: 'a' }, f: fut, fVar: futVar,
      s: [fort, b], pp: b + 'é' };
  }

  // Verbe du 2e groupe (finir, haïr).
  function deuxieme(inf) {
    var b = inf.slice(0, -2);
    if (inf === 'haïr') {
      return { p: ['hais', 'hais', 'hait', 'haïssons', 'haïssez', 'haïssent'], i: 'haïss', f: 'haïr', s: ['haïss', 'haïss'], pp: 'haï',
        psListe: ['haïs', 'haïs', 'haït', 'haïmes', 'haïtes', 'haïrent'],
        siListe: ['haïsse', 'haïsses', 'haït', 'haïssions', 'haïssiez', 'haïssent'] };
    }
    return { p: [b + 'is', b + 'is', b + 'it', b + 'issons', b + 'issez', b + 'issent'], i: b + 'iss',
      ps: { r: b, type: 'i' }, f: inf, s: [b + 'iss', b + 'iss'], pp: b + 'i' };
  }

  function troisieme(d) {
    var p = d.p.split(' ');
    var nous = p[3].split('|')[0];
    var i = d.i || nous.slice(0, -3);
    var ils = p[5].split('|')[0];
    var ps = d.ps.split(' ');
    var s = d.s ? d.s.split(' ') : [ils.slice(0, -3), i];
    return { p: p, i: i, ps: { r: ps.length > 1 ? ps[0] : ps[0].slice(0, -1), type: ps.length > 1 ? ps[1] : ps[0].slice(-1) },
      f: d.f, s: s, pp: d.pp, subj: d.subj ? d.subj.split(' ') : null, imp: d.imp === undefined ? undefined : (d.imp ? d.imp.split(' ') : null) };
  }

  // Liste complète des verbes : { inf, groupe, niveau, etre, base }.
  var VERBES = [];
  PREMIER.forEach(function (x) { VERBES.push({ inf: x[0], groupe: 1, niveau: x[1], etre: !!x[3], base: premier(x[0], x[2] || '') }); });
  DEUXIEME.forEach(function (x) { VERBES.push({ inf: x[0], groupe: 2, niveau: x[1], etre: false, base: deuxieme(x[0]) }); });
  TROISIEME.forEach(function (d) { VERBES.push({ inf: d.v, groupe: 3, niveau: d.n, etre: !!d.etre, base: troisieme(d) }); });
  function verbe(inf) { for (var i = 0; i < VERBES.length; i++) if (VERBES[i].inf === inf) return VERBES[i]; return null; }

  // ---------- Temps simples ----------
  // Chaque forme peut avoir des variantes acceptées, séparées par « | » (la première est affichée).
  function avecVariantes(liste, fn) { return liste.split('|').map(fn).join('|'); }
  var CIRC = { a: 'â', i: 'î', u: 'û', e: 'ê', o: 'ô' };

  function passeSimple(b) {
    if (b.psListe) return b.psListe.slice();
    var t = TERM_PS[b.ps.type];
    return t.map(function (e, k) { return (k === 5 && b.ps.rDernier ? b.ps.rDernier : b.ps.r) + e; });
  }

  function simple(v, id) {
    var b = v.base, P = b.p, k;
    if (id === 'ind-present') return P.slice();
    if (id === 'ind-imparfait') {
      var term = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
      return term.map(function (e, k2) { return ((k2 === 3 || k2 === 4) && b.iNousVous ? b.iNousVous : b.i) + e; });
    }
    if (id === 'ind-passe-simple') return passeSimple(b);
    if (id === 'ind-futur' || id === 'cond-present') {
      var tf = id === 'ind-futur' ? ['ai', 'as', 'a', 'ons', 'ez', 'ont'] : ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
      return tf.map(function (e) { return b.f + e + (b.fVar ? '|' + b.fVar + e : ''); });
    }
    if (id === 'subj-present') {
      if (b.subj) return b.subj.slice();
      var ts = ['e', 'es', 'e', 'ions', 'iez', 'ent'];
      return ts.map(function (e, k3) { return ((k3 === 3 || k3 === 4) ? b.s[1] : b.s[0]) + e; });
    }
    if (id === 'subj-imparfait') {
      if (b.siListe) return b.siListe.slice();
      var tu = passeSimple(b)[1], r = tu.slice(0, -1); // chanta, fini, vin
      var il = r.replace(/([aiueo])([^aiueo]*)$/, function (m, voy, fin) { return CIRC[voy] + fin; }) + 't';
      return [tu + 'se', tu + 'ses', il, tu + 'sions', tu + 'siez', tu + 'sent'];
    }
    if (id === 'imp-present') {
      if (b.imp === null) return null;
      if (b.imp) return b.imp.slice();
      var t2 = P[1].split('|')[0];
      // -es → -e (chante, ouvre, cueille) ; vas → va.
      if (/es$/.test(t2) || t2 === 'vas') t2 = t2.slice(0, -1);
      return [t2, P[3], P[4]];
    }
    return null;
  }

  // ---------- Temps composés ----------
  var AVOIR = null, ETRE = null;
  function participe(v, pr) {
    var pp = v.base.pp;
    if (!v.etre) return pp;
    // Accord avec le sujet (auxiliaire être). je, tu : masculin ou féminin ; nous, vous : masculin ou féminin pluriel.
    var pl = function (x) { return /[sx]$/.test(x) ? x : x + 's'; };
    var masc = pr.pl ? pl(pp) : pp, fem = pr.pl ? pp + 'es' : pp + 'e';
    if (pr.id === 'je' || pr.id === 'tu' || pr.id === 'nous' || pr.id === 'vous') return masc + '|' + fem;
    return pr.f ? fem : masc;
  }

  // Formes du verbe v au temps t pour le pronom pr (chaîne « forme|variante… »), ou null si non proposé.
  function forme(v, tId, pr) {
    var t = temps(tId);
    if (t.aux) {
      var aux = simple(v.etre ? ETRE : AVOIR, t.aux)[pr.p].split('|')[0];
      return participe(v, pr).split('|').map(function (pp) { return aux + ' ' + pp; }).join('|');
    }
    var liste = simple(v, tId);
    if (!liste) return null;
    if (t.mode === 'imperatif') return liste[PRONOMS_IMP.indexOf(pr.id)];
    return liste[pr.p];
  }

  // ---------- Écriture avec le pronom ----------
  function voyelle(mot) { return /^[aeiouyàâéèêëîïôûh]/i.test(mot) && !/^ha[ïi]/.test(mot); } // h muet, sauf haïr (h aspiré)
  function avecPronom(pronom, f, mode) {
    var sujet = pronom;
    if (pronom === 'je' && voyelle(f)) sujet = 'j’';
    var s = mode === 'imperatif' ? f : (sujet === 'j’' ? sujet + f : sujet + ' ' + f);
    if (mode === 'subjonctif') s = (/^[ie]/.test(sujet) && sujet !== 'je' ? 'qu’' : 'que ') + s;
    return s;
  }

  // ---------- Correction ----------
  // Réponse tapée → forme comparable : minuscules, apostrophe droite, espaces simples,
  // sans « que » ni pronom sujet au début (le joueur peut écrire « chante » ou « que je chante »).
  function normaliser(t) {
    return String(t || '').toLocaleLowerCase('fr-FR').replace(/[\u2019\u2018`´]/g, '\'').replace(/\s+/g, ' ').trim()
      .replace(/^qu'\s*/, '').replace(/^que\s+/, '')
      .replace(/^j'\s*/, '').replace(/^(je|tu|il|elle|on|nous|vous|ils|elles)\s+/, '').trim();
  }
  // Variantes acceptées : celles données, et l'orthographe rectifiée de 1990 (connait, plait, nait).
  function variantes(f) {
    var l = f.split('|'), out = [];
    l.forEach(function (x) { out.push(x); if (/aît/.test(x)) out.push(x.replace(/aît/g, 'ait')); });
    return out;
  }
  function juste(texte, carte) {
    var n = normaliser(texte);
    return variantes(carte.forme).some(function (x) { return normaliser(x) === n; });
  }

  // ---------- Tableau complet (aide « ? ») ----------
  function tableau(v, tId) {
    var t = temps(tId), lignes = [];
    var prs = t.mode === 'imperatif' ? PRONOMS_IMP.map(function (id) { return PRONOMS.filter(function (p) { return p.id === id; })[0]; })
      // Avec l'auxiliaire être, il / elle et ils / elles s'écrivent différemment (allé, allée) : 8 lignes.
      : PRONOMS.filter(function (p) { return (v.etre && t.aux) || (p.id !== 'elle' && p.id !== 'elles'); });
    prs.forEach(function (pr) {
      var f = forme(v, tId, pr);
      if (f == null) return;
      var aff = f.split('|')[0];
      // Accord avec être pour je, tu, nous, vous : « allé(e) », « allé(e)s ».
      if (v.etre && t.aux && f.split('|').length === 2) aff = aff.replace(/(s?)$/, '(e)$1');
      var texte = avecPronom(pr.id, aff, t.mode);
      if (!(v.etre && t.aux) && (pr.id === 'il' || pr.id === 'ils')) texte = texte.replace(/\b(ils?) /, '$1/elle' + (pr.id === 'ils' ? 's ' : ' '));
      lignes.push(t.mode === 'imperatif' ? '(' + pr.id + ') ' + texte : texte);
    });
    return lignes;
  }

  // ---------- Tirage d'une carte ----------
  // reglages = { temps: [...ids], groupes: [1, 2, 3], niveau: 'facile' }.
  // Verbes du niveau choisi (s'il n'y en a aucun dans les groupes cochés, ceux du niveau le plus proche).
  function verbesPossibles(reglages) {
    var groupes = reglages.groupes && reglages.groupes.length ? reglages.groupes.map(Number) : [1];
    var rang = niveau(reglages.niveau).rang;
    for (var ecart = 0; ecart < 4; ecart++) {
      var l = VERBES.filter(function (v) { return groupes.indexOf(v.groupe) >= 0 && Math.abs(v.niveau - rang) === ecart; });
      if (l.length) return l;
    }
    return VERBES.filter(function (v) { return v.groupe === 1; });
  }

  function generer(reglages, hasard) {
    hasard = hasard || Math.random;
    function tirer(t) { return t[Math.floor(hasard() * t.length)]; }
    var tps = reglages.temps && reglages.temps.length ? reglages.temps : ['ind-present'];
    var verbes = verbesPossibles(reglages);
    for (var essai = 0; essai < 200; essai++) {
      var v = tirer(verbes), t = temps(tirer(tps));
      var idImp = tirer(PRONOMS_IMP);
      var pr = t.mode === 'imperatif' ? PRONOMS.filter(function (p) { return p.id === idImp; })[0] : tirer(PRONOMS);
      var f = forme(v, t.id, pr);
      if (f == null) continue; // pas d'impératif pour pouvoir, devoir, valoir
      return carte(v, t, pr, f);
    }
    var ch = verbe('chanter');
    return carte(ch, temps('ind-present'), PRONOMS[0], forme(ch, 'ind-present', PRONOMS[0]));
  }

  function carte(v, t, pr, f) {
    var aff = f.split('|')[0];
    return {
      verbe: v.inf, groupe: v.groupe, temps: t.id, pronom: pr.id,
      tempsNom: t.modeNom + ' ' + t.nom.toLowerCase(),
      forme: f, // forme attendue et variantes acceptées
      solution: avecPronom(pr.id, aff, t.mode),
      oral: 'Conjugue le verbe ' + v.inf + (t.mode === 'conditionnel' || t.mode === 'subjonctif' ? ' au ' : ' à l\u2019') + t.modeNom.toLowerCase() + ' ' + t.nom.toLowerCase() + ', avec ' + pr.id + '.'
    };
  }

  AVOIR = verbe('avoir'); ETRE = verbe('être');

  var api = { MODES: MODES, TEMPS: TEMPS, GROUPES: GROUPES, NIVEAUX: NIVEAUX, PRONOMS: PRONOMS, VERBES: VERBES,
    temps: temps, niveau: niveau, verbe: verbe, simple: simple,
    forme: function (inf, tId, pronom) { var p = PRONOMS.filter(function (x) { return x.id === pronom; })[0]; return forme(verbe(inf), tId, p); },
    tableau: function (inf, tId) { return tableau(verbe(inf), tId); },
    generer: generer, juste: juste, normaliser: normaliser, avecPronom: avecPronom, verbesPossibles: verbesPossibles };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Conjugaison = api;
})(this);
