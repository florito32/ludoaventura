// Lecture à voix haute des cartes (synthèse vocale du navigateur, Web Speech API).
// Voix française choisie si l'appareil en propose une ; sinon la langue fr-FR est demandée.
(function (racine) {
  'use strict';

  var synthese = racine.speechSynthesis;

  function disponible() {
    return !!(synthese && racine.SpeechSynthesisUtterance);
  }

  function voixFrancaise() {
    var voix = synthese.getVoices ? synthese.getVoices() : [];
    for (var i = 0; i < voix.length; i++) if (/^fr[-_]FR/i.test(voix[i].lang)) return voix[i];
    for (var k = 0; k < voix.length; k++) if (/^fr/i.test(voix[k].lang)) return voix[k];
    return null;
  }

  // Lit le texte (arrête une lecture déjà en cours).
  function lire(texte) {
    if (!disponible()) return false;
    synthese.cancel();
    var u = new racine.SpeechSynthesisUtterance(texte);
    u.lang = 'fr-FR';
    u.rate = 0.85; // un peu plus lent : dictée pour enfants
    var v = voixFrancaise();
    if (v) u.voice = v;
    synthese.speak(u);
    return true;
  }

  // Texte à prononcer pour une carte : la question tirée, puis le mot en minuscules
  // (en majuscules, certaines voix l'épellent comme un sigle). Les lettres seules ne sont pas dites.
  function texteCarte(carte) {
    if (carte.lettre) return 'Quelle est cette lettre ?';
    if (carte.type === 'calcul' || carte.type === 'conjugaison') return carte.oral; // « Combien font 3 plus 4 multiplié par 2 ? »
    var mot = carte.mot.replace(/(\.\.\.|…)/g, ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase('fr-FR');
    var q = carte.question, Q = racine.Questions;
    var consigne = q ? (Q ? Q.consigne(q, carte.mot, null, carte.params) : q.consigne) : 'Épelle le mot :';
    // Mot mélangé (v6.17) : dire le mot donnerait la réponse, on ne lit que la consigne.
    if (q && q.voixSansMot) return consigne;
    // Dictée (v6.31) : le mot, une phrase d'exemple, puis le mot encore (« Écris le mot : cheval. Le cheval galope… Cheval. »).
    var phrase = q && q.dictee && racine.Phrases ? racine.Phrases[carte.mot] : null;
    if (phrase) return consigne + ' ' + mot + '. ' + phrase + ' ' + mot.charAt(0).toLocaleUpperCase('fr-FR') + mot.slice(1) + '.';
    return consigne + ' ' + mot + '.';
  }

  // Phrase d'exemple d'une carte d'orthographe (v6.40, demande du 10/11/2026), proposée après « Écouter ».
  // Pas de phrase quand elle donnerait la réponse : Mot mélangé (le mot), Le ou la ? (l'article devant le mot),
  // Au pluriel si la phrase contient déjà le pluriel ; ni pour la dictée, qui la lit déjà.
  function phraseExemple(carte) {
    var q = carte && carte.question, P = racine.Phrases;
    if (!q || !P || carte.lettre || q.voixSansMot || q.dictee || q.id === 'genre') return null;
    var phrase = P[carte.mot];
    if (!phrase) return null;
    var info = racine.Cartes && racine.Cartes.INFOS[carte.mot];
    if (q.id === 'pluriel' && info && info.pluriel && phrase.toLocaleUpperCase('fr-FR').indexOf(info.pluriel) >= 0) return null;
    return phrase;
  }

  racine.Voix = { disponible: disponible, lire: lire, texteCarte: texteCarte, phraseExemple: phraseExemple };
})(this);
