// Difficulté « progression » des calculs (Mathématiques) : un niveau de 1 à 100 pour chaque calcul
// (demande de l'utilisateur du 23/11/2026). Ce niveau s'ajoute à Facile / Moyen / Difficile / Expert ;
// il n'est pas encore utilisé par le jeu (l'utilisateur dira plus tard à quoi il sert) : ce module est donc
// volontairement NON chargé par index.html, seulement par les tests et les outils.
//
// Logique « diffuse » (choix de l'utilisateur) : la difficulté n'est pas rangée par blocs (d'abord toutes les
// additions, puis toutes les soustractions…) mais calculée à partir de tout ce qui rend un calcul dur :
//  - l'opération : + plus facile que − , plus facile que × , plus facile que ÷ ;
//  - la taille des nombres (les petits sont plus faciles que les grands) ;
//  - le nombre de signes (un signe est plus simple que plusieurs) ;
//  - les retenues et les emprunts (+ et −), les priorités mélangées (× ou ÷ avec + ou −),
//    et un résultat à virgule (division).
// Ainsi 1 × 2 est très facile, 7 × 8 est un peu plus dur, et une soustraction à trois chiffres avec emprunts
// peut être plus dure qu'une multiplication de petites tables : les opérations se chevauchent.
//
// Le score brut est ensuite transformé en niveau 1 à 100 par SEUILS : 99 seuils calculés par
// outils/progression_calcul.js sur un grand échantillon de calculs de tous les niveaux du jeu, pour que chacun
// des 100 niveaux compte à peu près autant de calculs (fichier js/progression-calcul-seuils.js, généré).
// Module sans interface : utilisable dans la page (window.ProgressionCalcul) et dans les tests Node.
(function (racine) {
  'use strict';

  var K = typeof module !== 'undefined' && module.exports ? require('./calcul.js') : racine.Calcul;

  // Poids de chaque opération : + < − < × < ÷ (demande de l'utilisateur).
  var POIDS = { plus: 1, moins: 2, fois: 3, divise: 4 };

  // Taille d'un nombre : log10(n + 1) (1 → 0,3 ; 9 → 1 ; 99 → 2 ; 999 → 3 ; 9999 → 4).
  function taille(n) { return Math.log(Math.abs(n) + 1) / Math.LN10; }

  // Nombre de retenues d'une addition (chiffre par chiffre, de droite à gauche).
  function retenues(a, b) {
    var r = 0, c = 0;
    while (a > 0 || b > 0) {
      var s = (a % 10) + (b % 10) + c;
      c = s >= 10 ? 1 : 0; r += c; a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return r;
  }
  // Nombre d'emprunts d'une soustraction a − b (a ≥ b).
  function emprunts(a, b) {
    var r = 0, c = 0;
    while (a > 0 || b > 0) {
      var s = (a % 10) - (b % 10) - c;
      c = s < 0 ? 1 : 0; r += c; a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return r;
  }
  function entier(x) { return Math.abs(x - Math.round(x)) < 1e-9; }

  // Difficulté d'une opération entre deux valeurs (a op b) : poids de l'opération × taille des deux nombres, plus ce
  // qui est propre à l'opération (retenues, emprunts, produit des tailles). À nombres égaux : + < − < × < ÷.
  function coutOperation(op, a, b) {
    var la = taille(a), lb = taille(b), base = POIDS[op] * (1 + la + lb), ent = entier(a) && entier(b);
    if (op === 'plus') return base + 0.5 * (ent ? retenues(Math.round(a), Math.round(b)) : 1);
    if (op === 'moins') return base + 0.8 * (ent ? emprunts(Math.round(a), Math.round(b)) : 1);
    // × ou ÷ par 1 : presque rien à calculer (1 × 2, 7 ÷ 1).
    var triv = (b === 1 || (op === 'fois' && a === 1)) ? 0.5 : 1;
    if (op === 'fois') return triv * (base + 1.0 * la * lb);
    return triv * (base + 1.2 * la * lb); // divise
  }

  // Score brut d'un calcul (priorités habituelles : × et ÷ d'abord, de gauche à droite, puis + et −).
  // Renvoie null si le calcul est refusé par le jeu (résultat négatif, plus d'une décimale).
  function score(nombres, ops) {
    var termes = [nombres[0]], liens = [], total = 0, i;
    var mixte = false, decimal = false;
    for (i = 0; i < ops.length; i++) {
      var b = nombres[i + 1];
      if (ops[i] === 'fois' || ops[i] === 'divise') {
        var a = termes[termes.length - 1];
        total += coutOperation(ops[i], a, b);
        termes[termes.length - 1] = ops[i] === 'fois' ? a * b : a / b;
        if (!entier(termes[termes.length - 1])) decimal = true;
      } else { liens.push(ops[i]); termes.push(b); }
    }
    var courant = termes[0];
    for (i = 0; i < liens.length; i++) {
      total += coutOperation(liens[i], courant, termes[i + 1]);
      courant = liens[i] === 'plus' ? courant + termes[i + 1] : courant - termes[i + 1];
    }
    if (courant < -1e-9) return null;
    for (i = 0; i < ops.length; i++) if (ops[i] === 'fois' || ops[i] === 'divise') mixte = mixte || liens.length > 0;
    if (mixte) total += 1.5;               // priorités à respecter
    if (decimal || !entier(courant)) total += 1.5; // résultat ou étape à virgule
    // Plusieurs signes : l'enfant doit garder des résultats en tête (un peu plus que la simple somme).
    total += 0.8 * Math.max(0, ops.length - 1) * (ops.length);
    return total;
  }

  var SEUILS = [];
  try { SEUILS = (typeof module !== 'undefined' && module.exports ? require('./progression-calcul-seuils.js') : racine.ProgressionCalculSeuils) || []; } catch (e) { SEUILS = []; }

  // Niveau de 1 à 100 pour un score brut : 1 + nombre de seuils atteints.
  function niveauDuScore(s, seuils) {
    seuils = seuils || SEUILS;
    var n = 0;
    while (n < seuils.length && s >= seuils[n]) n++;
    return Math.min(100, n + 1);
  }
  // Niveau de 1 à 100 d'un calcul { nombres, operations } (null si le calcul est refusé par le jeu).
  function niveau(nombres, ops) {
    if (nombres && nombres.nombres) { ops = nombres.operations; nombres = nombres.nombres; }
    var s = score(nombres, ops);
    return s === null ? null : niveauDuScore(s);
  }

  // Réglages « tout permis » d'un niveau du jeu (utilisés pour échantillonner tous les calculs possibles).
  function reglagesTout(niv) {
    var r = { niveau: niv, signes: ['plus', 'moins', 'fois', 'divise'], nbSignes: K.choixSignes(niv) };
    K.groupes(niv).forEach(function (g) { r[g.id] = g.valeurs.slice(); });
    return r;
  }
  // Tire un calcul au niveau de progression demandé (1 à 100) : on essaie des calculs de tous les niveaux du jeu
  // jusqu'à tomber sur ce niveau ; sinon le plus proche essayé.
  function generer(n, hasard, essais) {
    hasard = hasard || Math.random; essais = essais || 20000;
    var niveaux = K.NIVEAUX.map(function (x) { return x.id; }), meilleur = null, ecart = 1e9;
    for (var i = 0; i < essais; i++) {
      var c = K.generer(reglagesTout(niveaux[Math.floor(hasard() * niveaux.length)]), hasard);
      var v = niveau(c);
      if (v === null) continue;
      if (v === n) { c.prog = v; return c; }
      if (Math.abs(v - n) < ecart) { ecart = Math.abs(v - n); meilleur = c; meilleur.prog = v; }
    }
    return meilleur;
  }

  var api = { POIDS: POIDS, score: score, niveau: niveau, niveauDuScore: niveauDuScore, reglagesTout: reglagesTout, generer: generer,
    SEUILS: SEUILS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.ProgressionCalcul = api;
})(this);
