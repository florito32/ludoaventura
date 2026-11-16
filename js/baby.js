// Baby jeux (v8.11, demande de l'utilisateur du 16/11/2026, backlog lignes 355 à 362).
// Petits jeux pour les tout-petits, en deux catégories, Lettres et Chiffres (10 jeux chacune).
// Ils se jouent comme une partie rapide solo (choix de l'utilisateur) : chaque carte piochée sur le plateau
// est un baby jeu ; bonne réponse = dé FORT, sinon dé FAIBLE (on gagne toujours des points).
// Réglages (écran « Baby jeux », js/baby-ecran.js) :
//  - lettres travaillées (cases A à Z) et écriture : MAJUSCULES, minuscules ou les deux ;
//  - chiffres travaillés (cases 1 à 10) : toutes les questions portent sur ces chiffres, les mauvaises
//    réponses sont les autres chiffres (choix de l'utilisateur) ;
//  - les jeux cochés.
// Mécanismes (affichage et gestes dans js/baby-carte.js) :
//  - choix   : 3 boutons, un seul bon ;
//  - attrape : des jetons qui se baladent, toucher tous les bons ; juste si au plus 1 erreur (choix de l'utilisateur) ;
//  - bulles  : éclater les bulles dans l'ordre, du plus petit au plus grand ; même règle d'erreurs ;
//  - ordre   : toucher les éléments dans l'ordre, chacun va à la suite de la ligne ;
//  - trier   : ranger les lettres dans deux paniers (voyelles / consonnes) ;
//  - relier  : deux colonnes, comme « Relier les paires » de la grammaire (js/grammaire-carte.js) ;
//  - fabrique: fabriquer un mot (lettres et sons), la voix le lit ; toujours juste une fois le mot lu.
// Module sans interface (utilisable dans la page et dans les tests Node).
(function (racine) {
  'use strict';

  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  // Voyelles : a, e, i, o, u, y (comme les cartes d'orthographe, source citée dans js/questions.js).
  var VOYELLES = ['A', 'E', 'I', 'O', 'U', 'Y'];
  var CONSONNES = ALPHABET.filter(function (l) { return VOYELLES.indexOf(l) < 0; });
  var CHIFFRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var NOMS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];

  var CATEGORIES = [{ id: 'lettres', nom: 'Lettres', icone: '🔤' }, { id: 'chiffres', nom: 'Chiffres', icone: '🔢' }];
  var ECRITURES = [{ id: 'maj', nom: 'MAJUSCULES' }, { id: 'min', nom: 'minuscules' }, { id: 'deux', nom: 'Les deux' }];

  var JEUX = [
    { id: 'attrape-lettre', cat: 'lettres', nom: 'Attrape la lettre', icone: '🎯', meca: 'attrape' },
    { id: 'grandes-petites', cat: 'lettres', nom: 'Grandes et petites', icone: '🔗', meca: 'relier' },
    { id: 'alphabet', cat: 'lettres', nom: 'L’alphabet dans l’ordre', icone: '🔠', meca: 'ordre' },
    { id: 'lettre-manque', cat: 'lettres', nom: 'La lettre qui manque', icone: '❓', meca: 'choix' },
    { id: 'entends-lettre', cat: 'lettres', nom: 'J’entends la lettre', icone: '👂', meca: 'choix' },
    { id: 'premiere-lettre', cat: 'lettres', nom: 'La première lettre', icone: '🐱', meca: 'choix' },
    { id: 'voyelle-consonne', cat: 'lettres', nom: 'Voyelle ou consonne', icone: '🧺', meca: 'trier' },
    { id: 'fabrique', cat: 'lettres', nom: 'La fabrique à mots', icone: '🏭', meca: 'fabrique' },
    { id: 'syllabes', cat: 'lettres', nom: 'Les syllabes', icone: '🗣️', meca: 'choix' },
    { id: 'son-ecritures', cat: 'lettres', nom: 'Un son, des écritures', icone: '✏️', meca: 'attrape' },
    { id: 'attrape-chiffre', cat: 'chiffres', nom: 'Attrape le chiffre', icone: '🎲', meca: 'attrape' },
    { id: 'compter', cat: 'chiffres', nom: 'Compte les objets', icone: '🍎', meca: 'choix' },
    { id: 'ordre-chiffres', cat: 'chiffres', nom: 'Du plus petit au plus grand', icone: '📶', meca: 'ordre' },
    { id: 'chiffre-manque', cat: 'chiffres', nom: 'Le chiffre qui manque', icone: '❓', meca: 'choix' },
    { id: 'plus', cat: 'chiffres', nom: 'Où y en a-t-il le plus ?', icone: '⚖️', meca: 'choix' },
    { id: 'doigts', cat: 'chiffres', nom: 'Les doigts', icone: '✋', meca: 'choix' },
    { id: 'relier-des', cat: 'chiffres', nom: 'Relier dés et chiffres', icone: '🔗', meca: 'relier' },
    { id: 'bulles', cat: 'chiffres', nom: 'Les bulles', icone: '🫧', meca: 'bulles' },
    { id: 'entends-chiffre', cat: 'chiffres', nom: 'J’entends le chiffre', icone: '👂', meca: 'choix' },
    { id: 'encore-un', cat: 'chiffres', nom: 'Encore un !', icone: '➕', meca: 'choix' }
  ];
  var IDS = JEUX.map(function (j) { return j.id; });
  function jeu(id) { return JEUX.filter(function (j) { return j.id === id; })[0] || null; }

  // Mots pour « La première lettre » : une image (emoji) dont le mot commence par la lettre, prononcée comme
  // le nom de la lettre ou son son le plus courant. Pas de mot pour X (aucun emoji simple).
  var MOTS = {
    A: { mot: 'avion', e: '✈️' }, B: { mot: 'banane', e: '🍌' }, C: { mot: 'canard', e: '🦆' }, D: { mot: 'dauphin', e: '🐬' },
    E: { mot: 'escargot', e: '🐌' }, F: { mot: 'fraise', e: '🍓' }, G: { mot: 'gâteau', e: '🎂' }, H: { mot: 'hibou', e: '🦉' },
    I: { mot: 'igloo', e: '🛖' }, J: { mot: 'jongleur', e: '🤹' }, K: { mot: 'kiwi', e: '🥝' }, L: { mot: 'lapin', e: '🐰' },
    M: { mot: 'maison', e: '🏠' }, N: { mot: 'nuage', e: '☁️' }, O: { mot: 'orange', e: '🍊' }, P: { mot: 'pomme', e: '🍎' },
    Q: { mot: 'quilles', e: '🎳' }, R: { mot: 'robot', e: '🤖' }, S: { mot: 'soleil', e: '☀️' }, T: { mot: 'tortue', e: '🐢' },
    U: { mot: 'usine', e: '🏭' }, V: { mot: 'vache', e: '🐮' }, W: { mot: 'wagon', e: '🚃' }, Y: { mot: 'yoyo', e: '🪀' },
    Z: { mot: 'zèbre', e: '🦓' }
  };

  // Sons et leurs écritures (« Un son, des écritures » et la fabrique à mots). Seulement des sons de voyelles :
  // dits seuls, ils restent compréhensibles par la voix du navigateur. « in » : IN, AIN, EIN, IM et UN
  // (demande de l'utilisateur : « le son 1 écrit UN, AIN ou IN »).
  var SONS = [
    { son: 'in', ex: 'lapin', ecritures: ['IN', 'AIN', 'EIN', 'IM', 'UN'] },
    { son: 'an', ex: 'maman', ecritures: ['AN', 'EN', 'AM', 'EM'] },
    { son: 'o', ex: 'vélo', ecritures: ['O', 'AU', 'EAU'] },
    { son: 'è', ex: 'fraise', ecritures: ['È', 'AI', 'EI', 'Ê'] },
    { son: 'é', ex: 'bébé', ecritures: ['É', 'ER', 'EZ'] },
    { son: 'on', ex: 'ballon', ecritures: ['ON', 'OM'] }
  ];
  // Rangée de sons de la fabrique à mots : chaque bouton ajoute ces lettres d'un coup.
  var SONS_FABRIQUE = ['OU', 'ON', 'AN', 'IN', 'AIN', 'UN', 'OI', 'AU', 'EAU', 'É', 'È', 'CH', 'GN', 'PH'];

  // Objets à compter : emoji et nom au pluriel (pour la voix).
  var OBJETS = [
    { e: '🍎', n: 'pommes' }, { e: '⭐', n: 'étoiles' }, { e: '🐟', n: 'poissons' }, { e: '🦆', n: 'canards' },
    { e: '🎈', n: 'ballons' }, { e: '🐞', n: 'coccinelles' }, { e: '🌸', n: 'fleurs' }, { e: '🚗', n: 'voitures' }
  ];

  // Syllabes : consonnes qui se lisent bien suivies d'une voyelle (b-a ba…), voyelles simples.
  var CONS_SYLL = ['B', 'D', 'F', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V'];
  var VOY_SYLL = ['A', 'I', 'O', 'U'];

  // ---------- Outils ----------
  function tirer(t, r) { return t[Math.floor(r() * t.length)]; }
  function melanger(t, r) {
    t = t.slice();
    for (var i = t.length - 1; i > 0; i--) { var k = Math.floor(r() * (i + 1)), x = t[i]; t[i] = t[k]; t[k] = x; }
    return t;
  }
  function sauf(liste, exclus) { return liste.filter(function (x) { return exclus.indexOf(x) < 0; }); }
  // n éléments de « liste », complétés au besoin par d'autres pris dans « reserve ».
  function prendre(liste, n, r, reserve) {
    var t = melanger(liste, r).slice(0, n);
    if (t.length < n && reserve) t = t.concat(melanger(sauf(reserve, t), r).slice(0, n - t.length));
    return t;
  }
  // Mauvaises réponses : d'autres valeurs que la bonne (les chiffres non travaillés en priorité).
  function leurres(bonne, tous, travailles, n, r) {
    var hors = sauf(tous, travailles.concat([bonne]));
    var t = melanger(hors, r).slice(0, n);
    if (t.length < n) t = t.concat(melanger(sauf(tous, t.concat([bonne])), r).slice(0, n - t.length));
    return t;
  }
  // I majuscule et l minuscule se ressemblent beaucoup : jamais l'un comme mauvaise réponse de l'autre.
  function confus(x) { return x === 'I' ? ['L'] : x === 'L' ? ['I'] : []; }
  function leurresLettre(cible, r) { return leurres(cible, sauf(ALPHABET, confus(cible)), [], 2, r); }
  function choixDe(bonne, autres, r) { return melanger([bonne].concat(autres), r).map(String); }

  // Réglages valides (valeurs inconnues retirées, listes vides remplacées par tout).
  function reglagesValides(reg) {
    reg = reg || {};
    var l = (reg.lettres || []).filter(function (x) { return ALPHABET.indexOf(x) >= 0; });
    var c = (reg.chiffres || []).map(Number).filter(function (x) { return CHIFFRES.indexOf(x) >= 0; });
    var cats = (reg.categories || []).filter(function (x) { return x === 'lettres' || x === 'chiffres'; });
    var jeux = (reg.jeux || []).filter(function (x) { return IDS.indexOf(x) >= 0; });
    return {
      categories: cats.length ? cats : ['lettres', 'chiffres'],
      lettres: l.length ? l : ALPHABET.slice(),
      ecriture: ['maj', 'min', 'deux'].indexOf(reg.ecriture) >= 0 ? reg.ecriture : 'maj',
      chiffres: c.length ? c : CHIFFRES.slice(),
      jeux: jeux.length ? jeux : IDS.slice()
    };
  }
  function defaut() { return reglagesValides({}); }

  // Écriture d'une lettre selon le réglage (« Les deux » : au hasard).
  function forme(lettre, ecriture, r) {
    if (ecriture === 'min') return lettre.toLowerCase();
    if (ecriture === 'deux') return r() < 0.5 ? lettre : lettre.toLowerCase();
    return lettre;
  }
  // Une seule écriture pour toute la carte (lisibilité) : majuscules, minuscules, ou tirée pour la carte.
  function formeCarte(ecriture, r) { return ecriture === 'deux' ? (r() < 0.5 ? 'maj' : 'min') : ecriture; }
  function ecrire(t, f) { return f === 'min' ? t.toLowerCase() : t; }

  // Places des jetons dans l'arène : une grille 4 × 3 (12 places au plus), un peu de désordre dans chaque case,
  // une inclinaison (« pas forcément dans le bon sens, un peu penchés ») et un petit trajet de balade.
  function placer(n, r) {
    var cases = melanger([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], r).slice(0, n);
    return cases.map(function (k) {
      var col = k % 4, lig = Math.floor(k / 4);
      return {
        x: Math.round(12.5 + col * 25 + (r() - 0.5) * 8),
        y: Math.round(17 + lig * 33 + (r() - 0.5) * 10),
        rot: Math.round((r() - 0.5) * 50),
        dx: Math.round((r() - 0.5) * 36), dy: Math.round((r() - 0.5) * 24),
        dur: Math.round(30 + r() * 30) / 10
      };
    });
  }
  function jetons(bons, mauvais, r) {
    var t = melanger(bons.map(function (x) { return { t: x, bon: true }; }).concat(mauvais.map(function (x) { return { t: x, bon: false }; })), r);
    var p = placer(t.length, r);
    t.forEach(function (j, i) { for (var k in p[i]) j[k] = p[i][k]; j.pris = false; });
    return t;
  }

  // ---------- Génération ----------
  // Renvoie une carte, ou null si le jeu ne peut rien faire avec ces réglages (ex. « Encore un ! » avec seulement 1).
  function generer(id, reg, r) {
    r = r || Math.random;
    reg = reglagesValides(reg);
    var j = jeu(id);
    if (!j) return null;
    var L = reg.lettres, N = reg.chiffres, E = reg.ecriture;
    var c = { type: 'grammaire', module: 'baby', jeu: id, cat: j.cat, meca: j.meca, packNom: 'Baby jeux · ' + j.nom };
    var f, cible, n;
    switch (id) {
      case 'attrape-lettre': {
        cible = tirer(L, r);
        var bons = E === 'deux' ? [cible, cible, cible.toLowerCase(), cible.toLowerCase()] : [forme(cible, E, r), forme(cible, E, r), forme(cible, E, r)];
        var mauv = melanger(sauf(ALPHABET, [cible].concat(confus(cible))), r).slice(0, 11 - bons.length).map(function (x) { return forme(x, E, r); });
        c.modele = E === 'deux' ? cible + ' ' + cible.toLowerCase() : forme(cible, E, r);
        c.jetons = jetons(bons, mauv, r);
        c.consigne = 'Touche toutes les lettres ' + c.modele + '.';
        c.oral = 'Touche toutes les lettres ' + cible + '.';
        c.cle = id + cible;
        break;
      }
      case 'son-ecritures': {
        var g = tirer(SONS, r);
        f = formeCarte(E, r);
        var autresEcr = [];
        SONS.forEach(function (s) { if (s !== g) autresEcr = autresEcr.concat(s.ecritures); });
        c.son = g.son; c.exemple = g.ex;
        c.jetons = jetons(g.ecritures.map(function (x) { return ecrire(x, f); }), melanger(autresEcr, r).slice(0, 11 - g.ecritures.length).map(function (x) { return ecrire(x, f); }), r);
        c.consigne = 'Touche toutes les façons d’écrire le son « ' + g.son + ' », comme dans ' + g.ex + '.';
        c.oral = 'Touche toutes les façons d’écrire le son ' + g.son + ', comme dans ' + g.ex + '.';
        c.cle = id + g.son;
        break;
      }
      case 'grandes-petites': {
        var q = prendre(L, 4, r, ALPHABET);
        c.gauche = q.slice();
        c.droite = melanger(q, r).map(function (x) { return x.toLowerCase(); });
        c.bonnes = q.map(function (x) { return c.droite.indexOf(x.toLowerCase()); });
        c.consigne = 'Relie chaque grande lettre à sa petite lettre.';
        c.oral = c.consigne;
        c.cle = id + q.join('');
        break;
      }
      case 'alphabet': {
        f = formeCarte(E, r);
        var lettres = prendre(L, 4, r, ALPHABET);
        c.bon = lettres.slice().sort().map(function (x) { return ecrire(x, f); });
        c.elements = melanger(c.bon, r);
        c.consigne = 'Touche les lettres dans l’ordre de l’alphabet.';
        c.oral = 'Touche les lettres dans l’ordre de l’alphabet : a, b, c…';
        c.cle = id + c.bon.join('');
        break;
      }
      case 'lettre-manque': {
        f = formeCarte(E, r);
        cible = tirer(L, r);
        var i = ALPHABET.indexOf(cible);
        var p = Math.min(Math.max(0, i - Math.floor(r() * 4)), ALPHABET.length - 4); // début de la suite de 4 lettres
        c.suite = ALPHABET.slice(p, p + 4).map(function (x) { return x === cible ? null : ecrire(x, f); });
        c.bonne = ecrire(cible, f);
        c.choix = choixDe(c.bonne, leurresLettre(cible, r).map(function (x) { return ecrire(x, f); }), r);
        c.consigne = 'Quelle lettre manque ?';
        c.oral = 'Quelle lettre manque ?';
        c.cle = id + cible;
        break;
      }
      case 'entends-lettre': {
        f = formeCarte(E, r);
        cible = tirer(L, r);
        c.bonne = ecrire(cible, f);
        c.choix = choixDe(c.bonne, leurresLettre(cible, r).map(function (x) { return ecrire(x, f); }), r);
        c.consigne = 'Écoute (🔊) et touche la bonne lettre.';
        c.oral = 'Touche la lettre ' + cible + '.';
        c.cle = id + cible;
        break;
      }
      case 'premiere-lettre': {
        var possibles = L.filter(function (x) { return MOTS[x]; });
        if (!possibles.length) return null;
        f = formeCarte(E, r);
        cible = tirer(possibles, r);
        c.image = MOTS[cible].e; c.mot = MOTS[cible].mot;
        c.bonne = ecrire(cible, f);
        c.choix = choixDe(c.bonne, leurresLettre(cible, r).map(function (x) { return ecrire(x, f); }), r);
        c.consigne = 'Par quelle lettre commence ce mot ?';
        c.oral = 'Par quelle lettre commence le mot ' + c.mot + ' ?';
        c.cle = id + cible;
        break;
      }
      case 'voyelle-consonne': {
        f = formeCarte(E, r);
        var v = prendre(L.filter(function (x) { return VOYELLES.indexOf(x) >= 0; }), 3, r, VOYELLES);
        var k = prendre(L.filter(function (x) { return VOYELLES.indexOf(x) < 0; }), 3, r, CONSONNES);
        var six = melanger(v.concat(k), r);
        c.elements = six.map(function (x) { return ecrire(x, f); });
        c.colonnes = ['Voyelles', 'Consonnes'];
        c.bonnes = six.map(function (x) { return VOYELLES.indexOf(x) >= 0 ? 0 : 1; });
        c.consigne = 'Range chaque lettre dans son panier : voyelles ou consonnes.';
        c.oral = 'Range chaque lettre dans son panier : les voyelles, ou les consonnes.';
        c.cle = id + six.join('');
        break;
      }
      case 'fabrique': {
        f = formeCarte(E, r);
        c.forme = f;
        c.voyelles = VOYELLES.map(function (x) { return ecrire(x, f); });
        c.consonnes = CONSONNES.map(function (x) { return ecrire(x, f); });
        c.sons = SONS_FABRIQUE.map(function (x) { return ecrire(x, f); });
        c.pieces = [];
        c.lu = false;
        c.consigne = 'Fabrique un mot avec des lettres et des sons, puis touche « Lire ».';
        c.oral = 'Fabrique un mot avec des lettres et des sons, puis touche Lire.';
        c.cle = id + Math.floor(r() * 1e6);
        break;
      }
      case 'syllabes': {
        f = formeCarte(E, r);
        var cons = L.filter(function (x) { return CONS_SYLL.indexOf(x) >= 0; });
        if (!cons.length) cons = CONS_SYLL;
        var c1 = tirer(cons, r), v1 = tirer(VOY_SYLL, r);
        var v2 = tirer(sauf(VOY_SYLL, [v1]), r), c2 = tirer(sauf(CONS_SYLL, [c1]), r);
        c.bonne = ecrire(c1 + v1, f);
        c.choix = choixDe(c.bonne, [ecrire(c1 + v2, f), ecrire(c2 + v1, f)], r);
        c.consigne = 'Écoute (🔊) et touche la bonne syllabe.';
        c.oral = 'Touche la syllabe ' + (c1 + v1).toLowerCase() + '.';
        c.cle = id + c1 + v1;
        break;
      }
      case 'attrape-chiffre': {
        cible = tirer(N, r);
        c.points = cible;
        c.jetons = jetons([String(cible), String(cible), String(cible)], leurres(cible, CHIFFRES, [], 8, r).map(String), r);
        c.consigne = 'Compte les points, puis touche tous les chiffres pareils.';
        c.oral = 'Compte les points du dé, puis touche tous les chiffres pareils.';
        c.cle = id + cible;
        break;
      }
      case 'compter': {
        cible = tirer(N, r);
        var o = tirer(OBJETS, r);
        c.objet = o.e; c.nombre = cible;
        c.bonne = String(cible);
        c.choix = choixDe(c.bonne, leurres(cible, CHIFFRES, N, 2, r), r);
        c.consigne = 'Combien y en a-t-il ?';
        c.oral = 'Combien y a-t-il de ' + o.n + ' ?';
        c.cle = id + cible + o.e;
        break;
      }
      case 'ordre-chiffres': {
        var nb = prendre(N, 4, r, CHIFFRES);
        c.bon = nb.slice().sort(function (a, b) { return a - b; }).map(String);
        c.elements = melanger(c.bon, r);
        c.consigne = 'Touche les chiffres du plus petit au plus grand.';
        c.oral = c.consigne;
        c.cle = id + c.bon.join('-');
        break;
      }
      case 'chiffre-manque': {
        cible = tirer(N, r);
        var d = Math.min(Math.max(1, cible - Math.floor(r() * 4)), 7); // suite de 4 nombres entre 1 et 10
        c.suite = [d, d + 1, d + 2, d + 3].map(function (x) { return x === cible ? null : String(x); });
        c.bonne = String(cible);
        c.choix = choixDe(c.bonne, leurres(cible, CHIFFRES, N, 2, r), r);
        c.consigne = 'Quel chiffre manque ?';
        c.oral = c.consigne;
        c.cle = id + cible;
        break;
      }
      case 'plus': {
        cible = tirer(N, r);
        var autre = tirer(sauf(CHIFFRES, [cible]), r);
        var gauche = r() < 0.5;
        c.objet = tirer(OBJETS, r).e;
        c.paniers = gauche ? [cible, autre] : [autre, cible];
        c.bonne = c.paniers[0] > c.paniers[1] ? 'g' : 'd';
        c.choix = ['g', 'd'];
        c.consigne = 'Où y en a-t-il le plus ?';
        c.oral = c.consigne;
        c.cle = id + c.paniers.join('-');
        break;
      }
      case 'doigts': {
        cible = tirer(N, r);
        c.nombre = cible;
        c.bonne = String(cible);
        c.choix = choixDe(c.bonne, leurres(cible, CHIFFRES, N, 2, r), r);
        c.consigne = 'Combien de doigts sont levés ?';
        c.oral = c.consigne;
        c.cle = id + cible;
        break;
      }
      case 'relier-des': {
        var q4 = prendre(N, 4, r, CHIFFRES);
        c.gauche = q4.slice();
        c.droite = melanger(q4, r).map(String);
        c.bonnes = q4.map(function (x) { return c.droite.indexOf(String(x)); });
        c.consigne = 'Relie chaque dé à son chiffre.';
        c.oral = c.consigne;
        c.cle = id + q4.join('-');
        break;
      }
      case 'bulles': {
        var b = prendre(N, Math.min(5, Math.max(3, N.length)), r, CHIFFRES).sort(function (a, z) { return a - z; });
        c.bon = b.map(String);
        c.jetons = jetons(c.bon, [], r);
        c.suivant = 0;
        c.consigne = 'Éclate les bulles dans l’ordre : ' + c.bon.join(', ') + '.';
        c.oral = 'Éclate les bulles dans l’ordre, du plus petit au plus grand.';
        c.cle = id + c.bon.join('-');
        break;
      }
      case 'entends-chiffre': {
        cible = tirer(N, r);
        c.bonne = String(cible);
        c.choix = choixDe(c.bonne, leurres(cible, CHIFFRES, N, 2, r), r);
        c.consigne = 'Écoute (🔊) et touche le bon chiffre.';
        c.oral = 'Touche le ' + NOMS[cible] + '.';
        c.cle = id + cible;
        break;
      }
      case 'encore-un': {
        var ok = N.filter(function (x) { return x >= 2; });
        if (!ok.length) return null;
        cible = tirer(ok, r);
        c.objet = tirer(OBJETS, r).e;
        c.avant = cible - 1;
        c.bonne = String(cible);
        c.choix = choixDe(c.bonne, leurres(cible, CHIFFRES, N, 2, r), r);
        c.consigne = 'Il y en a ' + (cible - 1) + ', et encore un arrive ! Combien maintenant ?';
        c.oral = 'Il y en a ' + NOMS[cible - 1] + ', et encore un arrive ! Combien y en a-t-il maintenant ?';
        c.cle = id + cible;
        break;
      }
    }
    if (c.meca === 'attrape' || c.meca === 'bulles') c.erreurs = 0;
    if (c.meca === 'ordre') c.placees = [];
    if (c.meca === 'trier') c.rangs = c.elements.map(function () { return null; });
    return c;
  }

  // Carte suivante : une catégorie cochée, un de ses jeux cochés (pas le même que la carte d'avant si possible).
  function carte(reg, r, dernier) {
    r = r || Math.random;
    reg = reglagesValides(reg);
    var jeux = reg.jeux.filter(function (id) { return reg.categories.indexOf(jeu(id).cat) >= 0; });
    if (!jeux.length) jeux = IDS.filter(function (id) { return reg.categories.indexOf(jeu(id).cat) >= 0; });
    var cats = reg.categories.filter(function (k) { return jeux.some(function (id) { return jeu(id).cat === k; }); });
    var cat = tirer(cats, r);
    var duCat = jeux.filter(function (id) { return jeu(id).cat === cat; });
    var ordre = melanger(duCat.length > 1 ? sauf(duCat, [dernier]) : duCat, r).concat(melanger(jeux, r));
    for (var i = 0; i < ordre.length; i++) { var c = generer(ordre[i], reg, r); if (c) return c; }
    return generer('compter', reg, r); // filet de sécurité (ne devrait pas servir)
  }

  // ---------- Correction ----------
  function pairesJustes(c, liens) { return liens.filter(function (d, g) { return d === c.bonnes[g]; }).length; }
  function juste(c, rep) {
    switch (c.meca) {
      case 'choix': return String(rep) === String(c.bonne);
      case 'attrape': case 'bulles': return (c.erreurs || 0) <= 1;
      case 'ordre': return Array.isArray(rep) && rep.join('|') === c.bon.join('|');
      case 'trier': return Array.isArray(rep) && rep.every(function (k, i) { return k === c.bonnes[i]; });
      case 'relier': return Array.isArray(rep) && pairesJustes(c, rep) === c.bonnes.length;
      case 'fabrique': return true;
    }
    return false;
  }
  function erreursTexte(n) { return n === 0 ? 'sans aucune erreur' : n === 1 ? 'avec une seule erreur' : 'avec ' + n + ' erreurs'; }
  function solution(c) {
    switch (c.meca) {
      case 'choix':
        if (c.jeu === 'plus') return 'Il y en a le plus dans le panier ' + (c.bonne === 'g' ? 'de gauche' : 'de droite') + ' (' + Math.max(c.paniers[0], c.paniers[1]) + ').';
        if (c.jeu === 'premiere-lettre') return 'C’est ' + c.bonne + ', comme ' + c.mot + '.';
        return 'C’est ' + c.bonne + '.';
      case 'attrape': return 'Tout est trouvé, ' + erreursTexte(c.erreurs || 0) + '.';
      case 'bulles': return 'Toutes les bulles sont éclatées, ' + erreursTexte(c.erreurs || 0) + '.';
      case 'ordre': return 'Le bon ordre : ' + c.bon.join(', ') + '.';
      case 'trier':
        return 'Voyelles : ' + c.elements.filter(function (x, i) { return c.bonnes[i] === 0; }).join(', ') +
          ' · Consonnes : ' + c.elements.filter(function (x, i) { return c.bonnes[i] === 1; }).join(', ') + '.';
      case 'relier':
        return c.gauche.map(function (x, g) { return (c.jeu === 'relier-des' ? 'dé ' + x : x) + ' → ' + c.droite[c.bonnes[g]]; }).join(' · ') + '.';
      case 'fabrique': return 'Ton mot : ' + (c.pieces || []).join('') + '.';
    }
    return '';
  }
  // Mot de la fabrique, pour la voix : en minuscules (en majuscules, certaines voix l'épellent comme un sigle).
  function motLu(c) { return (c.pieces || []).join('').toLocaleLowerCase('fr-FR'); }

  var api = {
    ALPHABET: ALPHABET, VOYELLES: VOYELLES, CONSONNES: CONSONNES, CHIFFRES: CHIFFRES, NOMS: NOMS, CATEGORIES: CATEGORIES,
    ECRITURES: ECRITURES, JEUX: JEUX, IDS: IDS, MOTS: MOTS, SONS: SONS, SONS_FABRIQUE: SONS_FABRIQUE,
    jeu: jeu, reglagesValides: reglagesValides, defaut: defaut, generer: generer, carte: carte,
    juste: juste, solution: solution, pairesJustes: pairesJustes, motLu: motLu
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Baby = api;
})(this);
