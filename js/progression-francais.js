// Difficulté « progression » du Français : un niveau de 1 à 100 pour Orthographe, Grammaire, Conjugaison et Phonèmes
// (demande de l'utilisateur du 23/11/2026). S'ajoute à Facile / Moyen / Difficile / Expert ; pas encore utilisé par
// le jeu (l'utilisateur dira plus tard à quoi il sert) : module NON chargé par index.html, seulement par les tests
// et les outils.
//
// Méthode commune : pour chaque matière, un SCORE BRUT par « carte possible » (mot + type de question, verbe + temps
// + personne, élément de grammaire, son + jeu + mot), puis un classement par rangs : on énumère toutes les cartes
// possibles, on les trie par score, et on les découpe en 100 tranches égales (à score égal, ordre alphabétique).
// Chaque niveau de 1 à 100 a donc à peu près autant de cartes (au plus proche quand le compte ne tombe pas juste).
//
// Hypothèses (à valider) :
//  - Rareté d'un mot ou d'un verbe : le dépôt n'a pas de liste de fréquence ; on utilise la série du fichier des mots
//    (1 à 5) et le niveau des verbes (Facile à Expert), qui ont été écrits « de plus en plus rares ou pièges »,
//    plus des critères d'écriture (longueur, lettres muettes, doubles lettres, accents, mots composés).
//  - Poids des temps, des jeux et des sons : jugement de Claude (tables ci-dessous), à ajuster.
// Module sans interface : utilisable dans la page (window.ProgressionFrancais) et dans les tests Node.
(function (racine) {
  'use strict';

  var charge = typeof module !== 'undefined' && module.exports;
  var Cartes = charge ? require('./cartes.js') : racine.Cartes;
  var Q = charge ? require('./questions.js') : racine.Questions;
  var Gram = charge ? require('./grammaire.js') : racine.Grammaire;
  var Conj = charge ? require('./conjugaison.js') : racine.Conjugaison;
  var Phon = charge ? require('./phonemes.js') : racine.Phonemes;

  // ---------- Classement par rangs ----------
  // Transforme une liste de { cle, score } en { cle: niveau 1 à 100 } : tranches égales. À score égal, l'ordre alphabétique
  // de la clé départage (résultat toujours identique), ce qui évite les niveaux vides.
  function classer(cartes) {
    var t = cartes.slice().sort(function (a, b) { return a.score - b.score || (a.cle < b.cle ? -1 : a.cle > b.cle ? 1 : 0); });
    var n = t.length, res = {};
    t.forEach(function (c, i) { res[c.cle] = Math.min(100, Math.floor(i * 100 / n) + 1); });
    return res;
  }
  // Nombre de cartes par niveau (1 à 100) d'une table { cle: niveau }.
  function repartition(table) {
    var r = []; for (var i = 0; i < 100; i++) r.push(0);
    Object.keys(table).forEach(function (c) { r[table[c] - 1]++; });
    return r;
  }

  // ======================================================================
  // ORTHOGRAPHE : mots des packs (js/cartes.js) × types de question (js/questions.js)
  // ======================================================================
  // Difficulté du type de question (0 = le plus facile) : compter < découper < écrire.
  var TYPE_ORTHO = { nombre: 0, syllabes: 2, voyelles: 3, consonnes: 3, 'nb-voyelles': 3, 'nb-consonnes': 3, genre: 4,
    'combien-lettre': 4, pluriel: 5, muettes: 6, manquante: 6, melange: 7, ecrire: 10 };
  var DOUBLES = /(.)\1/g;
  var ACCENTS = /[éèêëàâîïôûùçœ]/gi;

  // Série du mot (1 à 5) dans les fichiers : la plus facile où il apparaît.
  var SERIE = {};
  Cartes.PACKS.forEach(function (p) {
    Object.keys(p.niveaux).forEach(function (s) {
      p.niveaux[s].forEach(function (m) { if (!(m in SERIE) || Number(s) < SERIE[m]) SERIE[m] = Number(s); });
    });
  });
  // Score brut d'un mot (écriture) : plus il est long, piégeux ou issu d'une série avancée, plus il monte.
  function scoreMot(mot) {
    var info = Cartes.INFOS[mot] || {}, m = mot.toLowerCase();
    var s = 12 * ((SERIE[mot] || 1) - 1);
    s += 1.0 * (info.lettres || m.length);
    s += 2.5 * (info.muettes ? info.muettes.length : 0);
    s += 2.0 * ((m.match(DOUBLES) || []).length);
    s += 1.5 * ((m.match(ACCENTS) || []).length);
    s += 1.5 * (info.syllabes ? info.syllabes.split('-').length : 1);
    s += /[-' ]/.test(m) ? 3 : 0;
    s += info.pluriel && info.pluriel !== mot && info.pluriel !== mot + 'S' ? 3 : 0;   // pluriel irrégulier
    return s;
  }
  var _ortho = null;
  function ortho() {
    if (_ortho) return _ortho;
    var mots = Object.keys(Cartes.INFOS), cartes = [], motsScore = [];
    mots.forEach(function (mot) {
      var base = scoreMot(mot);
      motsScore.push({ cle: mot, score: base });
      Q.TYPES.forEach(function (t) {
        if (!(t.id in TYPE_ORTHO)) return;
        var ok = false;
        try { ok = typeof t.possible === 'function' ? t.possible(mot, Cartes.INFOS[mot]) : true; } catch (e) { ok = false; }
        if (ok) cartes.push({ cle: mot + '|' + t.id, score: base + 3 * TYPE_ORTHO[t.id] });
      });
    });
    _ortho = { cartes: classer(cartes), mots: classer(motsScore) };
    return _ortho;
  }
  // Niveau (1 à 100) d'un mot seul, et d'une carte « mot + type de question ».
  function motOrtho(mot) { return ortho().mots[mot] || null; }
  function carteOrtho(mot, type) { return ortho().cartes[mot + '|' + type] || null; }

  // ======================================================================
  // CONJUGAISON : verbe × temps × personne
  // ======================================================================
  // Difficulté du temps (0 = présent) : jugement de Claude, du plus courant au plus rare.
  var TEMPS_CONJ = { 'indicatif.present': 0, 'indicatif.futur': 3, 'indicatif.imparfait': 4, 'indicatif.passe-compose': 6,
    'imperatif.present': 7, 'conditionnel.present': 8, 'indicatif.plus-que-parfait': 10, 'indicatif.futur-anterieur': 12,
    'conditionnel.passe': 13, 'indicatif.passe-simple': 14, 'subjonctif.present': 15, 'imperatif.passe': 16,
    'subjonctif.passe': 18, 'indicatif.passe-anterieur': 19, 'subjonctif.imparfait': 21, 'subjonctif.plus-que-parfait': 22 };
  var NIVEAU_VERBE = { facile: 0, moyen: 1, difficile: 2, expert: 3 };
  var GROUPE_VERBE = { 1: 0, 2: 4, 3: 8 };
  var PERSONNE = [0, 0.5, 0, 1, 1, 1.5];          // je, tu, il, nous, vous, ils
  function scoreConj(v, temps, personne) {
    return 8 * NIVEAU_VERBE[v.niveau] + GROUPE_VERBE[v.groupe] + 2.2 * TEMPS_CONJ[temps] + 2 * PERSONNE[personne] +
      0.15 * v.inf.length;
  }
  var _conj = null;
  function conj() {
    if (_conj) return _conj;
    var cartes = [];
    Conj.VERBES.forEach(function (v) {
      Object.keys(TEMPS_CONJ).forEach(function (t) {
        for (var p = 0; p < 6; p++) {
          // L'impératif n'a que 3 personnes (tu, nous, vous : indices 1, 3, 4).
          if (/^imperatif/.test(t) && [1, 3, 4].indexOf(p) < 0) continue;
          cartes.push({ cle: v.inf + '|' + t + '|' + p, score: scoreConj(v, t, p) });
        }
      });
    });
    _conj = classer(cartes);
    return _conj;
  }
  // Niveau (1 à 100) d'une carte : verbe à l'infinitif, temps (« indicatif.present »), personne (0 = je … 5 = ils).
  function carteConj(inf, temps, personne) { return conj()[inf + '|' + temps + '|' + personne] || null; }

  // ======================================================================
  // GRAMMAIRE : éléments des jeux (js/grammaire.js)
  // ======================================================================
  var RANG_NIVEAU = { facile: 0, moyen: 1, difficile: 2, expert: 3 };
  // Difficulté du jeu (0 = le plus facile) : relier, contraires, puis phrases, nature, erreurs, homophones.
  var JEU_GRAM = { relier: 0, contraires: 3, phrase: 5, nature: 8, erreur: 10, homophones: 12 };
  function motsDe(texte) { return String(texte).split(/\s+/).length; }
  var _gram = null;
  function gram() {
    if (_gram) return _gram;
    var cartes = [];
    Object.keys(RANG_NIVEAU).forEach(function (niv) {
      var base = 18 * RANG_NIVEAU[niv];
      (Gram.PHRASES[niv] || []).forEach(function (p, i) {
        cartes.push({ cle: 'phrase|' + niv + '|' + i, score: base + 2 * JEU_GRAM.phrase + 0.8 * motsDe(p) });
        cartes.push({ cle: 'nature|' + niv + '|' + i, score: base + 2 * JEU_GRAM.nature + 0.8 * motsDe(p) });
      });
      (Gram.CONTRAIRES[niv] || []).forEach(function (p, i) { cartes.push({ cle: 'contraires|' + niv + '|' + i, score: base + 2 * JEU_GRAM.contraires + 0.15 * String(p).length }); });
      (Gram.ERREURS[niv] || []).forEach(function (p, i) { cartes.push({ cle: 'erreur|' + niv + '|' + i, score: base + 2 * JEU_GRAM.erreur + 0.8 * motsDe(String(p).split('|')[0]) }); });
      (Gram.HOMOPHONES[niv] || []).forEach(function (p, i) { cartes.push({ cle: 'homophones|' + niv + '|' + i, score: base + 2 * JEU_GRAM.homophones + 0.8 * motsDe(String(p).split('|')[0]) }); });
      (Gram.RELIER[niv] || []).forEach(function (r, i) { cartes.push({ cle: 'relier|' + niv + '|' + i, score: base + 2 * JEU_GRAM.relier + 1.0 * (r.paires ? r.paires.length : 6) }); });
    });
    _gram = classer(cartes);
    return _gram;
  }
  // Niveau (1 à 100) d'un élément : jeu (phrase, nature, contraires, erreur, homophones, relier), niveau du jeu, rang dans la liste.
  function elementGram(jeu, niveau, index) { return gram()[jeu + '|' + niveau + '|' + index] || null; }

  // ======================================================================
  // PHONÈMES : son × jeu × mot (js/phonemes.js)
  // ======================================================================
  // Difficulté du jeu : compléter / quel son avant intrus, position, relier, puis trier (sons voisins).
  var JEU_PHON = { son: 0, completer: 3, relier: 5, intrus: 6, position: 8, trier: 11 };
  // Difficulté du son : nombre d'écritures possibles, sons délicats (voisins que beaucoup ne distinguent pas),
  // nasales et semi-voyelles. Les consonnes simples ([p], [b], [m]…) sont les plus faciles.
  function difficulteSon(id) {
    var s = 0, g = Phon.GRAPHIES[id] || [];
    s += 1.2 * g.length;
    if (Phon.DELICATS.some(function (d) { return d[0] === id || d[1] === id; })) s += 4;
    if (/~/.test(id)) s += 3;                                    // voyelles nasales
    if (Phon.SONS[id] && Phon.SONS[id].categorie === 'semi') s += 3;   // semi-voyelles
    if (id === 'N') s += 3;                                      // [ŋ], venu de l'anglais
    return s;
  }
  var _phon = null;
  function phon() {
    if (_phon) return _phon;
    var cartes = [];
    Phon.MOTS.forEach(function (l) {
      var m = l.split('|'), mot = m[0].split('.').join(''), sons = {};
      m[1].split(' ').forEach(function (x) { if (x !== '-') x.split('+').forEach(function (z) { sons[z] = true; }); });
      var longueur = mot.length;
      Object.keys(sons).forEach(function (id) {
        Object.keys(JEU_PHON).forEach(function (jeu) {
          cartes.push({ cle: jeu + '|' + id + '|' + mot, score: 3 * JEU_PHON[jeu] + 2 * difficulteSon(id) + 0.8 * longueur });
        });
      });
    });
    _phon = classer(cartes);
    return _phon;
  }
  // Niveau (1 à 100) d'une carte : jeu, son (code SAMPA), mot (écriture normale).
  function cartePhon(jeu, son, mot) { return phon()[jeu + '|' + son + '|' + mot] || null; }

  var api = {
    orthographe: { mot: motOrtho, carte: carteOrtho, scoreMot: scoreMot, TYPES: TYPE_ORTHO, table: function () { return ortho().cartes; } },
    conjugaison: { carte: carteConj, TEMPS: TEMPS_CONJ, table: conj },
    grammaire: { element: elementGram, JEUX: JEU_GRAM, table: gram },
    phonemes: { carte: cartePhon, JEUX: JEU_PHON, difficulteSon: difficulteSon, table: phon },
    classer: classer, repartition: repartition
  };
  if (charge) module.exports = api;
  else racine.ProgressionFrancais = api;
})(this);
