// Difficulté « progression » des calculs (Mathématiques) : un niveau de 1 à 100 pour chaque calcul.
// Ce niveau sert à « Suivre ma progression » (v10.39) : le joueur reçoit des calculs dont le niveau est celui de son profil
// dans la sous-matière, à 2 niveaux près (fenêtre de 5 niveaux, js/progression-fenetre.js).
//
// Échelle d'apprentissage (demande du 24/11/2026, règle 3) : on range les calculs comme un enfant les apprend.
//  1. À taille égale : addition < soustraction < multiplication < division.
//  2. Pour une même opération : deux petits nombres (unités) < dizaines < centaines < milliers.
//  3. Exception voulue : une addition de centaines est plus difficile qu'une multiplication de deux petits nombres
//     (745 + 356 > 7 × 8) : on retient sur trois colonnes, alors que les tables s'apprennent par cœur.
//  4. Une retenue ou un emprunt ajoute de la difficulté ; × 1 et ÷ 1 sont presque gratuits.
//  5. Un signe < plusieurs signes ; les priorités mélangées et un résultat à virgule ajoutent de la difficulté.
// Le score brut (somme des difficultés des opérations) est ensuite transformé en niveau 1 à 100 par SEUILS : 99 seuils
// calculés par outils/progression_calcul.js sur un grand échantillon de calculs de tous les niveaux du jeu, pour que
// chacun des 100 niveaux compte à peu près autant de calculs (fichier js/progression-calcul-seuils.js, généré).
// Module sans interface : utilisable dans la page (window.ProgressionCalcul) et dans les tests Node.
(function (racine) {
  'use strict';

  var K = typeof module !== 'undefined' && module.exports ? require('./calcul.js') : racine.Calcul;

  // Poids de chaque opération : + < − < × < ÷ (sert aux tests et à l'ordre des signes).
  var POIDS = { plus: 1, moins: 2, fois: 3, divise: 4 };

  // Difficulté d'une addition / soustraction seule selon le nombre de chiffres d du plus grand nombre (1 à 4) :
  // 3 + 4 · 23 + 45 · 234 + 178 · 2345 + 1789.
  var PLUS = [1.0, 2.6, 4.6, 6.2];
  var MOINS = [1.6, 3.2, 5.4, 7.0];
  // Nombre de chiffres de la partie entière (10 compte comme un nombre de table : 1 chiffre).
  function chiffres(n) { n = Math.floor(Math.abs(n) + 1e-9); return n <= 10 ? 1 : String(n).length; }
  function palier(tab, d) { return tab[Math.min(tab.length, Math.max(1, d)) - 1]; }

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

  // Difficulté d'une opération entre deux valeurs (a op b). d = chiffres du plus grand nombre, p = du plus petit.
  //  + et − : palier de d, plus 0,4 par retenue (0,5 par emprunt) ;
  //  × : 4 (deux petits nombres) + 2,2 par chiffre en plus du plus grand + 1,6 par chiffre en plus du plus petit ;
  //  ÷ : 5 (petit ÷ petit) + 2,4 par chiffre en plus du dividende + 1 par chiffre en plus du diviseur.
  function coutOperation(op, a, b) {
    var da = chiffres(a), db = chiffres(b), d = Math.max(da, db), p = Math.min(da, db), ent = entier(a) && entier(b);
    if (op === 'plus') return palier(PLUS, d) + 0.4 * (ent ? retenues(Math.round(a), Math.round(b)) : 1);
    if (op === 'moins') return palier(MOINS, d) + 0.5 * (ent ? emprunts(Math.round(a), Math.round(b)) : 1);
    if (op === 'fois') return (a === 1 || b === 1) ? 1.5 : 4.0 + 2.2 * (d - 1) + 1.6 * (p - 1);
    return b === 1 ? 2.5 : 5.0 + 2.4 * (da - 1) + 1.0 * (db - 1); // divise
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
    // Départage les calculs de même palier : à palier égal, de plus petits nombres sont plus faciles (7 × 8 > 2 × 3).
    for (i = 0; i < nombres.length; i++) total += 0.4 * Math.log(Math.abs(nombres[i]) + 1) / Math.LN10;
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
  // Tire un calcul dont le niveau de progression est entre bas et haut (1 à 100, fenêtre de « Suivre ma progression »).
  // On essaie des calculs de tous les niveaux du jeu jusqu'à tomber dans la fenêtre ; sinon le plus proche essayé.
  function genererDans(bas, haut, hasard, essais) {
    hasard = hasard || Math.random; essais = essais || 20000;
    var niveaux = K.NIVEAUX.map(function (x) { return x.id; }), meilleur = null, ecart = 1e9, milieu = (bas + haut) / 2;
    for (var i = 0; i < essais; i++) {
      var c = K.generer(reglagesTout(niveaux[Math.floor(hasard() * niveaux.length)]), hasard);
      var v = niveau(c);
      if (v === null) continue;
      if (v >= bas && v <= haut) { c.prog = v; return c; }
      if (Math.abs(v - milieu) < ecart) { ecart = Math.abs(v - milieu); meilleur = c; meilleur.prog = v; }
    }
    return meilleur;
  }
  // Tire un calcul au niveau de progression demandé (1 à 100).
  function generer(n, hasard, essais) { return genererDans(n, n, hasard, essais); }

  var api = { POIDS: POIDS, score: score, niveau: niveau, niveauDuScore: niveauDuScore, reglagesTout: reglagesTout, generer: generer, genererDans: genererDans,
    SEUILS: SEUILS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.ProgressionCalcul = api;
})(this);
