// Défis du jour (demande de l'utilisateur du 10/11/2026, backlog lignes 166 à 168).
// Chaque jour, un défi solo et un défi en équipe. Le joueur choisit seulement la matière (Maths ou Français),
// le niveau (Facile, Moyen, Difficile, Expert) et, en équipe, le nombre de joueurs (2, 3 ou 4) ;
// le jeu choisit tout le reste : aventure, aventuriers, réglages des cartes.
// Le tirage dépend seulement de la date et des choix : le même jour, tout le monde a le même défi
// (hypothèse à valider), et rouvrir le jeu redonne le même défi.
//  - Aventure : prise parmi celles de la difficulté du niveau (Facile → aventure facile, Moyen → moyenne,
//    Difficile et Expert → difficile), ce qui fixe l'objectif (js/aventures.js).
//  - Français : le jour décide Orthographe ou Conjugaison (un jour sur deux environ, au hasard de la date).
//  - Orthographe : le niveau choisit les mots (niveaux 1, 2, 3 du fichier des cartes) et les questions.
// Module sans interface : utilisable dans la page (window.Defis) et dans les tests Node.
(function (racine) {
  'use strict';

  var A = typeof module !== 'undefined' && module.exports ? require('./aventures.js') : racine.Aventures;
  var P = typeof module !== 'undefined' && module.exports ? require('./aventuriers.js') : racine.Aventuriers;

  var NIVEAUX = [{ id: 'facile', nom: 'Facile' }, { id: 'moyen', nom: 'Moyen' }, { id: 'difficile', nom: 'Difficile' }, { id: 'expert', nom: 'Expert' }];
  var DIFFICULTE_AVENTURE = { facile: 'facile', moyen: 'moyen', difficile: 'difficile', expert: 'difficile' };
  // Packs d'orthographe proposés aux défis (le pack « Lettres » n'est plus joué depuis le 03/11/2026).
  var PACKS = ['mots-simples', 'mots-compliques', 'temps', 'numerique', 'animaux', 'lieux', 'pays', 'villes', 'nature', 'meteo',
    'corps', 'aliments', 'maison', 'vetements', 'ecole', 'metiers', 'transports', 'couleurs', 'loisirs'];

  // Réglages possibles selon le niveau.
  var MATHS = {
    facile: { signes: [1, 2], nbSignes: [1], groupes: { nombres: 3 } },
    moyen: { signes: [2, 2], nbSignes: [1, 2], groupes: { nombres: 3, dizaines: 2 } },
    difficile: { signes: [2, 3], nbSignes: [2, 3], groupes: { nombres: 3, dizaines: 2, centaines: 2 } },
    expert: { signes: [3, 4], nbSignes: [3, 4], groupes: { nombres: 2, dizaines: 2, centaines: 2, milliers: 1 } }
  };
  var VALEURS = {
    nombres: [2, 3, 4, 5, 6, 7, 8, 9, 10], // tables de 2 à 10 au niveau Facile, unités ailleurs
    dizaines: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    centaines: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    milliers: [1000]
  };
  var CONJ = {
    facile: { temps: ['indicatif.present', 'indicatif.futur', 'indicatif.imparfait'], combien: 1, groupes: [1] },
    moyen: { temps: ['indicatif.present', 'indicatif.futur', 'indicatif.imparfait', 'indicatif.passe-compose'], combien: 2, groupes: [1, 2] },
    difficile: { temps: ['indicatif.passe-simple', 'indicatif.plus-que-parfait', 'indicatif.futur-anterieur', 'conditionnel.present', 'subjonctif.present', 'imperatif.present'], combien: 2, groupes: [1, 2, 3] },
    expert: { temps: ['indicatif.passe-simple', 'indicatif.passe-anterieur', 'indicatif.futur-anterieur', 'conditionnel.passe', 'subjonctif.present', 'subjonctif.imparfait', 'subjonctif.passe', 'imperatif.passe'], combien: 3, groupes: [1, 2, 3] }
  };
  var ORTHO = {
    facile: { mots: [1], types: ['nombre', 'voyelles', 'consonnes', 'syllabes', 'nb-voyelles', 'nb-consonnes'], combien: 3 },
    moyen: { mots: [2], types: ['syllabes', 'combien-lettre', 'manquante', 'melange', 'genre', 'muettes', 'nb-consonnes'], combien: 3 },
    difficile: { mots: [2, 3], types: ['ecrire', 'melange', 'manquante', 'pluriel', 'muettes', 'genre', 'epeler'], combien: 3 },
    expert: { mots: [3], types: ['ecrire', 'melange', 'pluriel', 'muettes', 'epeler', 'manquante'], combien: 3 }
  };

  // ---------- Hasard tiré de la date ----------
  // Graine : empreinte (FNV-1a) d'un texte ; générateur : mulberry32. Même texte → même suite de nombres.
  function graine(texte) {
    var h = 2166136261;
    for (var i = 0; i < texte.length; i++) { h ^= texte.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function hasard(texte) {
    var a = graine(texte);
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function melanger(t, r) {
    t = t.slice();
    for (var i = t.length - 1; i > 0; i--) { var k = Math.floor(r() * (i + 1)), x = t[i]; t[i] = t[k]; t[k] = x; }
    return t;
  }
  function prendre(t, n, r) { return melanger(t, r).slice(0, n); }
  function entre(min, max, r) { return min + Math.floor(r() * (max - min + 1)); }
  function trier(t) { return t.slice().sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; }); }
  function trierN(t) { return t.slice().sort(function (a, b) { return a - b; }); }

  // ---------- Le défi ----------
  // choix = { type: 'solo' | 'equipe', matiere: 'maths' | 'francais', niveau, joueurs (équipe : 2 à 4) } ;
  // jour = « 2026-11-10 » ; options.typesDisponibles = questions d'orthographe jouables sur l'appareil
  // (« Épeler à l'oral » demande la reconnaissance vocale).
  function generer(jour, choix, options) {
    options = options || {};
    var type = choix.type === 'equipe' ? 'equipe' : 'solo';
    var nb = type === 'solo' ? 1 : Math.min(4, Math.max(2, choix.joueurs || 2));
    var niveau = NIVEAUX.some(function (n) { return n.id === choix.niveau; }) ? choix.niveau : 'facile';
    var base = jour + '|' + type;

    // Aventure (selon la difficulté) et aventuriers (selon le jour seulement).
    var aventures = A.LISTE.filter(function (a) { return a.difficulte === DIFFICULTE_AVENTURE[niveau]; });
    var aventure = aventures[Math.floor(hasard(base + '|aventure|' + niveau)() * aventures.length)];
    var aventuriers = prendre(P.LISTE.map(function (p) { return p.id; }), nb, hasard(base + '|aventuriers'));

    // Français : orthographe ou conjugaison, selon le jour.
    var matiere = choix.matiere === 'maths' ? 'maths' : (hasard(base + '|francais')() < 0.5 ? 'orthographe' : 'conjugaison');
    var r = hasard(base + '|' + matiere + '|' + niveau);
    var d = { jour: jour, type: type, niveau: niveau, matiere: matiere, choixMatiere: choix.matiere === 'maths' ? 'maths' : 'francais',
      aventure: aventure.id, aventuriers: aventuriers, joueurs: nb };

    if (matiere === 'maths') {
      var m = MATHS[niveau];
      var signes = trier(prendre(['plus', 'moins', 'fois', 'divise'], entre(m.signes[0], m.signes[1], r), r));
      var reglages = { niveau: niveau, signes: signes, nbSignes: m.nbSignes.slice(), nombres: [], dizaines: [], centaines: [], milliers: [] };
      Object.keys(m.groupes).forEach(function (g) { reglages[g] = trierN(prendre(VALEURS[g], m.groupes[g], r)); });
      d.maths = reglages;
    } else if (matiere === 'conjugaison') {
      var c = CONJ[niveau];
      var temps = prendre(c.temps, c.combien, r);
      var modes = [];
      temps.forEach(function (t) { var md = t.split('.')[0]; if (modes.indexOf(md) < 0) modes.push(md); });
      d.conj = { modes: modes, temps: temps, groupes: c.groupes.slice(), niveau: niveau };
    } else {
      var o = ORTHO[niveau];
      var dispo = options.typesDisponibles;
      var types = o.types.filter(function (t) { return !dispo || dispo.indexOf(t) >= 0; });
      d.packs = trier(prendre(PACKS, 3, r));
      d.types = prendre(types, o.combien, r);
      d.mots = o.mots.slice();
    }
    return d;
  }

  var api = { NIVEAUX: NIVEAUX, PACKS: PACKS, ORTHO: ORTHO, generer: generer, hasard: hasard };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Defis = api;
})(this);
