// Lecture à voix haute des cartes (synthèse vocale du navigateur, Web Speech API), sans aucune dépendance.
// v9.5 (demande du 17/11/2026) : un seul point d'entrée, Voix.lire(texte), utilisé par tous les boutons « Écouter »
// (maths, problèmes, français, histoire, géographie, Baby jeux). Avant d'être dit, le texte passe par preparer() :
//  - écritures que les voix lisent mal (× ÷ °C %, « av. J.-C. », siècles et rois en chiffres romains, 50 000…) ;
//  - micro-pauses (« : » devient « … », les mots entre « » sont détachés par des virgules) ;
//  - découpage en phrases, chacune avec son intonation (question un peu plus haute, nombres un peu plus lents).
//    Découper évite aussi la coupure des longues lectures de Chrome (environ 15 s) et le bug des voix Google
//    sous Windows qui s'arrêtent après la première phrase.
// La meilleure voix française de l'appareil est choisie une seule fois (puis gardée en mémoire) : fr-FR d'abord,
// en privilégiant les voix « Natural / Neural » (Microsoft), « Premium / Enhanced » (Apple), puis Google ;
// repli : n'importe quelle voix française, sinon la voix par défaut avec la langue fr-FR demandée.
(function (racine) {
  'use strict';

  var synthese = racine.speechSynthesis;
  var LETTRE = 'A-Za-zÀ-ÖØ-öø-ÿŒœ'; // pour les limites de mots (\b ne connaît pas les accents)

  function disponible() {
    return !!(synthese && racine.SpeechSynthesisUtterance);
  }

  // ---------- Choix de la voix ----------

  // Note d'une voix : 0 = pas française (écartée). Le reste départage les voix françaises.
  function noteVoix(v) {
    var lang = String(v.lang || '').replace('_', '-'), nom = String(v.name || '');
    if (!/^fr\b/i.test(lang)) return 0;
    var n = /^fr-FR$/i.test(lang) ? 100 : 40; // France d'abord, puis Canada, Belgique, Suisse…
    if (/natural|neural|naturelle/i.test(nom)) n += 60;   // Microsoft « Denise Online (Natural) »…
    else if (/premium/i.test(nom)) n += 55;                // Apple, qualité la plus haute
    else if (/enhanced|améliorée?/i.test(nom)) n += 50;    // Apple « Thomas (Enhanced) », « Amélie (améliorée) »
    else if (/google/i.test(nom)) n += 45;                 // Chrome « Google français »
    else if (/microsoft/i.test(nom)) n += 10;              // voix Microsoft classiques (Hortense, Julie, Paul)
    if (/compact|espeak/i.test(nom)) n -= 20;              // voix de dépannage, très robotiques
    if (v.default) n += 2;                                 // à égalité : la voix choisie par le système
    return n;
  }

  var voixRetenue; // undefined = pas encore cherchée ; null = aucune voix française
  function meilleureVoix() {
    if (voixRetenue !== undefined) return voixRetenue;
    var liste = synthese && synthese.getVoices ? synthese.getVoices() : [];
    var meilleure = null, note = 0;
    for (var i = 0; i < liste.length; i++) {
      var n = noteVoix(liste[i]);
      if (n > note) { note = n; meilleure = liste[i]; }
    }
    // Liste encore vide (Chrome la charge après la page) : on ne mémorise rien, on réessaiera.
    if (liste.length) voixRetenue = meilleure;
    return meilleure;
  }

  if (disponible()) {
    // La liste des voix arrive parfois après le chargement (événement « voiceschanged ») : on oublie le choix.
    var oublier = function () { voixRetenue = undefined; };
    if (synthese.addEventListener) synthese.addEventListener('voiceschanged', oublier);
    else synthese.onvoiceschanged = oublier;
    try { synthese.getVoices(); } catch (e) { /* demande anticipée : la voix sera prête au premier clic */ }
  }

  // ---------- Préparation du texte (ponctuation et prononciation) ----------

  var ORDINAUX = ['', 'premier', 'deuxième', 'troisième', 'quatrième', 'cinquième', 'sixième', 'septième', 'huitième',
    'neuvième', 'dixième', 'onzième', 'douzième', 'treizième', 'quatorzième', 'quinzième', 'seizième', 'dix-septième',
    'dix-huitième', 'dix-neuvième', 'vingtième', 'vingt et unième'];

  // Chiffres romains I à XXXIX (siècles, rois) → nombre ; 0 si ce n'en est pas un.
  function romain(r) {
    var m = /^(X{0,3})(IX|IV|V?I{0,3})$/.exec(r);
    if (!r || !m) return 0;
    var u = { '': 0, I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9 };
    return m[1].length * 10 + u[m[2]];
  }

  // Corrige ce que les voix lisent mal, sans rien changer au sens.
  function prononcer(t) {
    var fin = '(?![' + LETTRE + '’\'])';
    return t
      .replace(/[   ]/g, ' ')                        // espaces insécables → espaces
      .replace(/(\d) (?=\d{3}(?!\d))/g, '$1')                       // 50 000 → 50000 (sinon « cinquante… zéro zéro zéro »)
      .replace(/\bav\. J\.-C\./g, 'avant Jésus-Christ')
      .replace(/\bapr\. J\.-C\./g, 'après Jésus-Christ')
      .replace(/\bJ\.-C\./g, 'Jésus-Christ')
      .replace(/(^|[\s(])[−-](?=\d)/g, '$1moins ')                  // −89 → moins 89
      .replace(/ ?°C\b/g, ' degrés')
      .replace(/ ?%/g, ' pour cent')
      .replace(/km²/g, 'kilomètres carrés').replace(/m²/g, 'mètres carrés')
      .replace(/(\d) ?× ?(?=\d)/g, '$1 fois ')
      .replace(/(\d) ?÷ ?(?=\d)/g, '$1 divisé par ')
      .replace(/(\d) ?\+ ?(?=\d)/g, '$1 plus ')
      .replace(/(\d) ?− ?(?=\d)/g, '$1 moins ')
      .replace(/(\d) ?= ?\?/g, '$1 égale combien ?')
      .replace(/(\d) ?= ?(?=\d)/g, '$1 égale ')
      // Ier / Ire : premier, première (François Ier, Ire République).
      .replace(new RegExp('(^|[^' + LETTRE + '])Ier' + fin, 'g'), '$1premier')
      .replace(new RegExp('(^|[^' + LETTRE + '])Ire' + fin, 'g'), '$1première')
      // XIXe siècle, Ve République… → dix-neuvième siècle, cinquième République.
      .replace(new RegExp('(^|[^' + LETTRE + '])([IVX]+)e (?=siècles?|millénaire|République|Empire|Reich|dynastie|croisade|arrondissement)', 'g'),
        function (tout, avant, r) { var n = romain(r); return n && ORDINAUX[n] ? avant + ORDINAUX[n] + ' ' : tout; })
      // Louis XIV, Napoléon III → Louis 14, Napoléon 3 (les voix disent « quatorze », « trois »).
      .replace(new RegExp('([A-ZÉ][' + LETTRE + '-]+) ([IVX]{1,6})' + fin, 'g'),
        function (tout, nom, r) { var n = romain(r); return n ? nom + ' ' + n : tout; })
      // Mots entre guillemets : détachés par de courtes pauses (« la nature du mot, chat, dans la phrase »).
      .replace(/\s*«\s*/g, ', ').replace(/\s*»/g, ',')
      // Deux-points : une pause plus marquée avant ce qui suit ; en fin de phrase, un point.
      .replace(/\s*:\s*$/g, '.')
      .replace(/\s*:\s+/g, '… ')
      // Ménage : espaces et ponctuation en double.
      .replace(/\s+/g, ' ')
      .replace(/^[\s,]+/, '')
      .replace(/,\s*(?=[,.!?…])/g, '')
      .replace(/…\s*,/g, '…')
      .replace(/\s+([,.!?…])/g, '$1')
      .replace(/([!?])\s*\./g, '$1')
      .trim();
  }

  // Découpe une phrase trop longue (plus de 180 signes) à la virgule la plus proche du milieu.
  function couper(phrase) {
    if (phrase.length <= 180) return [phrase];
    var milieu = phrase.length / 2, best = -1;
    for (var i = phrase.indexOf(', '); i >= 0; i = phrase.indexOf(', ', i + 1)) {
      if (best < 0 || Math.abs(i - milieu) < Math.abs(best - milieu)) best = i;
    }
    if (best < 0) return [phrase];
    return couper(phrase.slice(0, best + 1)).concat(couper(phrase.slice(best + 2)));
  }

  // Texte brut → morceaux à dire, chacun avec son intonation : [{ texte, hauteur (pitch), vitesse (rate) }].
  function preparer(texte) {
    var t = prononcer(String(texte == null ? '' : texte));
    if (!t) return [];
    if (!/[.!?…]$/.test(t)) t += '.'; // une fin de phrase : la voix baisse le ton au lieu de rester en suspens
    var phrases = t.match(/[^.!?]+(?:[.!?]+|$)/g) || [t];
    var morceaux = [];
    phrases.forEach(function (p) {
      p = p.trim();
      if (!p || /^[.!?…,]+$/.test(p)) return;
      couper(p).forEach(function (m) { morceaux.push(m); });
    });
    return morceaux.map(function (m, i) {
      var question = /\?$/.test(m);
      return {
        texte: m,
        // Légère variation d'une phrase à l'autre (évite la lecture monotone) ; une question monte un peu.
        hauteur: question ? 1.08 : (i % 2 ? 1.03 : 1),
        // Un peu plus lent que la normale pour les enfants, et encore un peu plus quand il y a des nombres.
        vitesse: /\d/.test(m) ? 0.85 : 0.92
      };
    });
  }

  // ---------- Lecture ----------

  var enCours = []; // garde les phrases en mémoire pendant la lecture (sinon Chrome peut les perdre en route)

  // Lit le texte tout de suite (arrête une lecture déjà en cours). Renvoie false si l'appareil ne sait pas lire.
  function lire(texte) {
    if (!disponible()) return false;
    Voix.dernier = String(texte == null ? '' : texte); // texte demandé, avant préparation (utile aux tests)
    var morceaux = preparer(texte);
    synthese.cancel();
    if (synthese.paused && synthese.resume) synthese.resume(); // Chrome reste parfois bloqué en pause
    var voix = meilleureVoix();
    enCours = morceaux.map(function (m) {
      var u = new racine.SpeechSynthesisUtterance(m.texte);
      u.lang = voix && /^fr-FR$/i.test(String(voix.lang).replace('_', '-')) ? voix.lang : 'fr-FR';
      if (voix) u.voice = voix;
      u.rate = m.vitesse;
      u.pitch = m.hauteur;
      synthese.speak(u); // toutes les phrases sont mises en file d'un coup : pas d'attente entre elles
      return u;
    });
    return morceaux.length > 0;
  }

  // Arrête la lecture.
  function taire() {
    if (disponible()) synthese.cancel();
    enCours = [];
  }

  // Texte à prononcer pour une carte : la question tirée, puis le mot en minuscules
  // (en majuscules, certaines voix l'épellent comme un sigle). Les lettres seules ne sont pas dites.
  function texteCarte(carte) {
    if (carte.lettre) return 'Quelle est cette lettre ?';
    if (carte.type === 'grammaire') return carte.oral; // v6.54 : texte préparé par js/grammaire.js (sans donner la réponse)
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

  var Voix = {
    disponible: disponible, lire: lire, taire: taire, preparer: preparer, meilleureVoix: meilleureVoix, noteVoix: noteVoix,
    texteCarte: texteCarte, phraseExemple: phraseExemple, dernier: ''
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Voix; // tests Node
  else racine.Voix = Voix;
})(typeof window !== 'undefined' ? window : this || {});
