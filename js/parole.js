// « Épeler à l'oral » (v6.28, demande du 09/11/2026) : le joueur dit les lettres à voix haute,
// la reconnaissance vocale du navigateur (Web Speech API, SpeechRecognition) les écrit, le jeu compare.
// Disponible dans Chrome, Edge, Samsung Internet et Safari ; pas dans Firefox, ni dans une application
// ajoutée à l'écran d'accueil d'un iPhone (https://caniuse.com/speech-recognition). Sans elle, la question
// « Épeler à l'oral » n'est pas proposée (choix de l'utilisateur).
// Chrome envoie le son à un service en ligne pour le reconnaître : il faut une connexion.
(function (racine) {
  'use strict';

  // Ce que la reconnaissance écrit quand on dit le nom d'une lettre (français) : « bé » → B, « elle » → L…
  // Les mots sont comparés sans accents ni majuscules (voir cle()).
  var NOMS = {
    A: ['a', 'ah', 'ha', 'as'],
    B: ['be', 'bee', 'bees', 'bai', 'baie', 'bey'],
    C: ['ce', 'ces', 'ses', 'c\'est', 's\'est', 'sait', 'sais', 'cee'],
    D: ['de', 'des', 'des', 'dee', 'dey'],
    E: ['e', 'eux', 'euh', 'heu', 'oeufs'],
    F: ['effe', 'ef', 'eff', 'efe'],
    G: ['ge', 'j\'ai', 'geai', 'jai'],
    H: ['hache', 'ache', 'ash'],
    I: ['i', 'hi', 'ie'],
    J: ['ji', 'gi', 'jit', 'gy'],
    K: ['ka', 'ca', 'cas', 'kas', 'qa'],
    L: ['elle', 'el', 'aile', 'ailes', 'elles', 'ell'],
    M: ['aime', 'emme', 'em', 'aimes', 'hem'],
    N: ['haine', 'aine', 'enne', 'ene', 'n\'est'],
    O: ['o', 'oh', 'eau', 'eaux', 'au', 'aux', 'ho', 'os'],
    P: ['pe', 'paix', 'pee', 'pet', 'pai'],
    Q: ['cu', 'cul', 'qu', 'ku', 'q'],
    R: ['air', 'erre', 'ere', 'here', 'aire', 'airs', 'err'],
    S: ['esse', 'es', 'ess', 'aisse'],
    T: ['te', 'the', 'tes', 'tee', 'taie', 'tet'],
    U: ['u', 'hu', 'eu', 'hue', 'eue'],
    V: ['ve', 'vee', 'vais', 'vet'],
    W: ['doublev', 'doubleve', 'double-ve'],
    X: ['ixe', 'ix', 'iks', 'icse'],
    Y: ['igrec', 'i-grec', 'igrecque', 'grec', 'grecque'],
    Z: ['zed', 'zede', 'zaide', 'zede', 'zette']
  };
  // Mots dits en épelant qui ne sont pas des lettres : on les ignore (« e accent aigu » = E).
  var IGNORES = ['accent', 'aigu', 'aigus', 'grave', 'graves', 'circonflexe', 'trema', 'cedille', 'majuscule', 'minuscule',
    'apostrophe', 'trait', 'd\'union', 'union', 'tiret', 'espace', 'lettre', 'la', 'le', 'un', 'et', 'puis', 'alors', 'ensuite', 'avec'];
  var INDEX = {};
  Object.keys(NOMS).forEach(function (l) { NOMS[l].forEach(function (m) { INDEX[cle(m)] = l; }); });

  // Mot sans accents, en minuscules, apostrophe droite.
  function cle(m) { return m.toLowerCase().replace(/[’`]/g, '\'').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe'); }

  // Lettres entendues dans le texte écrit par la reconnaissance vocale.
  // Rend { lettres: ['A','V',…], douteux: ['bonjour'] } : les mots qui ne sont ni une lettre ni un mot ignoré.
  // « deux L » ou « double L » = L L ; « double vé » = W ; « i grec » = Y ; « AVI » (sigle en majuscules) = A V I.
  // colle = true (v6.33) : un mot qui n'est pas un nom de lettre est découpé en lettres (« estomac » = E S T O M A C) :
  // la reconnaissance vocale de Google assemble souvent les lettres épelées en un mot (capture du 09/11/2026).
  function lettresEntendues(texte, colle) {
    var mots = String(texte || '').replace(/[.,;:!?()«»"]/g, ' ').split(/[\s-]+/).filter(Boolean);
    var lettres = [], douteux = [];
    for (var i = 0; i < mots.length; i++) {
      var brut = mots[i], m = cle(brut), suivant = mots[i + 1] ? cle(mots[i + 1]) : '';
      if (m === 'i' && /^grec/.test(suivant)) { lettres.push('Y'); i++; continue; }
      if (m === 'double' && (suivant === 'v' || INDEX[suivant] === 'V')) { lettres.push('W'); i++; continue; }
      if ((m === 'double' || m === 'deux' || m === '2') && suivant) {
        var l2 = lettre(mots[i + 1]);
        if (l2) { lettres.push(l2, l2); i++; continue; }
      }
      var l = lettre(brut);
      if (l) { lettres.push(l); continue; }
      if (IGNORES.indexOf(m) >= 0) continue;
      // Sigle en majuscules (« AVI ») : la reconnaissance a collé les lettres.
      if (/^[A-ZÀ-Ý]{2,}$/.test(brut) || (colle && /^[a-z]{2,}$/.test(cle(brut).replace(/'/g, '')))) {
        cle(brut).replace(/'/g, '').toUpperCase().split('').forEach(function (c) { lettres.push(c); }); continue;
      }
      douteux.push(brut);
    }
    return { lettres: lettres, douteux: douteux };
  }
  // Une lettre seule (« b », « B. », « é ») ou le nom d'une lettre (« bé », « elle »).
  function lettre(mot) {
    var m = cle(mot).replace(/\.$/, '');
    if (/^[a-z]$/.test(m)) return m.toUpperCase();
    return INDEX[m] || null;
  }

  // Lettres du mot à épeler, sans accents (é = E, œ = O E) : on ne demande pas de dire les accents.
  function lettresDuMot(mot) {
    return cle(mot).toUpperCase().replace(/[^A-Z]/g, '').split('');
  }

  // Vrai si l'une des propositions de la reconnaissance donne exactement les lettres du mot :
  // lettres dites une par une, ou lettres collées en un mot par la reconnaissance (« estomac », « est o mac »).
  // Choix de l'utilisateur (09/11/2026) : accepté sans contrôle, même si le joueur a dit le mot sans l'épeler.
  function juste(mot, propositions) {
    var att = lettresDuMot(mot).join('');
    return propositions.some(function (t) {
      return lettresEntendues(t).lettres.join('') === att || lettresEntendues(t, true).lettres.join('') === att ||
        cle(t).toUpperCase().replace(/[^A-Z]/g, '') === att; // « pomme de terre » écrit tel quel
    });
  }

  // ---------- Reconnaissance vocale du navigateur ----------
  function classe() { return racine.SpeechRecognition || racine.webkitSpeechRecognition || null; }
  function disponible() {
    if (!classe()) return false;
    // iPhone / iPad : la reconnaissance n'existe pas dans une application ajoutée à l'écran d'accueil (caniuse).
    if (racine.navigator && racine.navigator.standalone === true) return false;
    return true;
  }

  // Écoute le joueur. rappels : { texte(propositions, fini) à chaque morceau entendu, fin(), erreur(code) }.
  // Rend un objet { arreter() }. L'écoute s'arrête seule après un silence (le navigateur décide).
  function ecouter(rappels) {
    var R = classe(), rec = new R(), fini = false, morceaux = [];
    rec.lang = 'fr-FR';
    rec.continuous = true;      // on peut faire une pause entre deux lettres
    rec.interimResults = true;  // les lettres s'affichent pendant qu'on parle
    rec.maxAlternatives = 5;    // plusieurs propositions : on garde celle qui correspond au mot
    rec.onresult = function (e) {
      // Chaque résultat a ses propositions ; on assemble la meilleure de chaque morceau,
      // et pour le dernier morceau chacune de ses propositions.
      morceaux = [];
      for (var i = 0; i < e.results.length; i++) {
        var alt = [];
        for (var k = 0; k < e.results[i].length; k++) alt.push(e.results[i][k].transcript);
        morceaux.push(alt);
      }
      rappels.texte(propositions(morceaux), false);
    };
    rec.onerror = function (e) { if (!fini) { fini = true; rappels.erreur(e.error || 'inconnue'); } };
    rec.onend = function () { if (!fini) { fini = true; rappels.fin(propositions(morceaux)); } };
    try { rec.start(); } catch (err) { fini = true; setTimeout(function () { rappels.erreur('start'); }, 0); }
    return { arreter: function () { try { rec.stop(); } catch (err) { /* déjà arrêtée */ } } };
  }
  // Toutes les phrases possibles : la meilleure proposition de chaque morceau, puis les autres du dernier.
  function propositions(morceaux) {
    if (!morceaux.length) return [];
    var debut = morceaux.slice(0, -1).map(function (a) { return a[0]; }).join(' ');
    return morceaux[morceaux.length - 1].map(function (a) { return (debut + ' ' + a).trim(); });
  }

  var api = { lettresEntendues: lettresEntendues, lettresDuMot: lettresDuMot, juste: juste, disponible: disponible, ecouter: ecouter, ESSAIS: 3 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Parole = api;
})(this);
