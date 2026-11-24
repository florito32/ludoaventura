// Évaluation de départ d'une matière (v10.49, demande de l'utilisateur du 24/11/2026, backlog lignes 512 à 517).
// Bouton « Évaluer » en face de chaque matière du profil d'un joueur : 10 questions tirées au hasard dans les exercices de la
// matière, sans plateau. Le niveau (1 à 100, l'échelle de js/progression-*.js) de chaque question dépend des réponses :
//  - questions 1 à 3 : une facile (niveau 15), une moyenne (50), une difficile (85) ;
//  - question 4 : le milieu entre le plus haut niveau réussi sans faute en partant du bas (0 si la 1re est ratée) et le premier
//    niveau raté (100 si les trois sont réussies) ; ex. ✓ ✓ ✗ → entre 50 et 85 → 68 ;
//  - questions 5 à 10 : « pas décroissant » (choix de l'utilisateur) : réussie → on monte, ratée → on descend, de 15, 10, 7, 5, 3 puis 2 niveaux ;
//  - progression trouvée = niveau de la 10e question, +1 si elle est réussie, −1 sinon (1 à 100). Elle est donnée au profil
//    pour toutes les sous-matières de la matière (« même niveau partout », choix de l'utilisateur) : celles qui sont plus basses
//    montent toutes seules, celles qui sont plus hautes demandent au joueur s'il garde son niveau ou prend le nouveau.
// Module sans interface : dans la page (window.Evaluation) et dans les tests Node.
(function (racine) {
  'use strict';

  var NB_QUESTIONS = 10;
  var DEPART = [15, 50, 85];            // facile, moyen, difficile
  var PAS = [15, 10, 7, 5, 3, 2, 1];    // après les questions 4, 5, 6, 7, 8, 9 ; le dernier sert au résultat (après la 10e)

  function borne(n) { return Math.max(1, Math.min(100, Math.round(n))); }

  // État d'une évaluation : niveaux[k] = niveau demandé à la question k+1 ; resultats[k] = vrai si elle est réussie.
  function nouvelle() { return { niveaux: [], resultats: [] }; }

  // Niveau de la prochaine question (sans la poser).
  function niveauSuivant(e) {
    var i = e.niveaux.length;
    if (i < DEPART.length) return DEPART[i];
    if (i === DEPART.length) {
      // Milieu entre le dernier niveau réussi (sans faute depuis le bas) et le premier niveau raté.
      var haut = 0, bas = 100;
      for (var k = 0; k < DEPART.length; k++) {
        if (e.resultats[k]) haut = DEPART[k];
        else { bas = DEPART[k]; break; }
      }
      return borne((haut + bas) / 2);
    }
    return borne(e.niveaux[i - 1] + (e.resultats[i - 1] ? PAS[i - 4] : -PAS[i - 4]));
  }
  // Pose la question suivante : renvoie son niveau (et le garde).
  function poser(e) { var n = niveauSuivant(e); e.niveaux.push(n); return n; }
  // Note la réponse à la question posée.
  function repondre(e, juste) { e.resultats[e.niveaux.length - 1] = !!juste; }
  function numero(e) { return e.niveaux.length; } // numéro (1 à 10) de la question posée
  function terminee(e) { return e.niveaux.length >= NB_QUESTIONS && e.resultats.length >= NB_QUESTIONS; }
  function reussies(e) { return e.resultats.filter(Boolean).length; }
  // Progression trouvée (1 à 100) : niveau de la dernière question, un cran plus haut si réussie, plus bas sinon.
  function progression(e) {
    var n = e.niveaux.length - 1;
    return borne(e.niveaux[n] + (e.resultats[n] ? PAS[PAS.length - 1] : -PAS[PAS.length - 1]));
  }

  // Ce que devient chaque sous-matière : actuels = { idSousMatiere: score actuel (0 à 100) }, subs = [{ id, nom }].
  //  'monte' : le niveau actuel est plus bas, il passe tout de suite à la progression trouvée ;
  //  'demande' : le niveau actuel est plus haut, le joueur choisit (garder ou prendre le nouveau) ;
  //  'egal' : rien à changer.
  function plan(actuels, subs, trouve) {
    return subs.map(function (s) {
      var a = Math.max(0, Math.min(100, Math.round(Number(actuels[s.id]) || 0)));
      return { id: s.id, nom: s.nom, actuel: a, propose: trouve, action: a < trouve ? 'monte' : a > trouve ? 'demande' : 'egal' };
    });
  }

  var api = { NB_QUESTIONS: NB_QUESTIONS, DEPART: DEPART, PAS: PAS, nouvelle: nouvelle, niveauSuivant: niveauSuivant, poser: poser, repondre: repondre,
    numero: numero, terminee: terminee, reussies: reussies, progression: progression, plan: plan };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Evaluation = api;
})(this);
