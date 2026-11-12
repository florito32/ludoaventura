// Géographie et Histoire (v7.0, choix de l'utilisateur du 12/11/2026, BACKLOG lignes 253 à 263).
// Moteur sans interface : les jeux (js/geographie.js, js/histoire.js) donnent des « séries » de contenu,
// rangées par niveau (Facile, Moyen, Difficile, Expert : chaque niveau n'a QUE son propre contenu).
// À chaque carte, le moteur tire un jeu parmi ceux choisis par le joueur, une série, puis un format :
//   R relier (gauche ↔ droite)   Q choix multiples   O question ouverte   F remettre dans l'ordre
//   V vrai ou faux   K classer en 2 colonnes   I qui suis-je ? (5 indices)   C toucher sur la carte
// Règle commune des niveaux (choix de l'utilisateur) : Facile 3 réponses ou paires, Moyen 4, Difficile 5,
// Expert 6 ; questions ouvertes à partir de Difficile.
// Utilisable dans la page (window.Savoirs) et dans les tests Node.
(function (racine) {
  'use strict';

  var NIVEAUX = [
    { id: 'facile', nom: 'Facile' }, { id: 'moyen', nom: 'Moyen' },
    { id: 'difficile', nom: 'Difficile' }, { id: 'expert', nom: 'Expert' }
  ];
  var TAILLE = { facile: 3, moyen: 4, difficile: 5, expert: 6 };          // paires, réponses proposées, éléments à ranger
  var TAILLE_CLASSER = { facile: 4, moyen: 5, difficile: 6, expert: 8 };  // éléments à classer
  // Formats d'une série de paires selon le niveau (question ouverte à partir de Difficile).
  var FORMATS_PAIRES = { facile: ['R', 'Q'], moyen: ['R', 'Q'], difficile: ['R', 'Q', 'O'], expert: ['R', 'O'] };
  var NOMS_FORMATS = {
    R: 'Relier', Q: 'Choix multiples', O: 'Question ouverte', F: 'Remettre dans l’ordre',
    V: 'Vrai ou faux', K: 'Classer', I: 'Qui suis-je ?', C: 'Toucher sur la carte'
  };

  var JEUX = [];       // tous les jeux, ajoutés par js/geographie.js et js/histoire.js (ajouter)
  var PERIODES = [];   // périodes d'histoire, dans l'ordre (js/histoire.js)

  function ajouter(liste) { liste.forEach(function (j) { JEUX.push(j); }); }
  function trouver(id) { return JEUX.filter(function (j) { return j.id === id; })[0] || null; }
  function jeuxDe(matiere) { return JEUX.filter(function (j) { return j.matiere === matiere; }); }

  // ---------- Hasard (remplaçable par les tests) ----------
  var hasard = Math.random;
  function auHasard(t) { return t[Math.floor(hasard() * t.length)]; }
  function melanger(t) {
    t = t.slice();
    for (var i = t.length - 1; i > 0; i--) { var k = Math.floor(hasard() * (i + 1)); var x = t[i]; t[i] = t[k]; t[k] = x; }
    return t;
  }

  // ---------- Textes ----------
  // « Bordeaux|Bordeau » : la première écriture s'affiche, les autres sont aussi acceptées en question ouverte.
  function affiche(x) { return String(x).split('|')[0]; }
  // Comparaison tolérante (choix de l'utilisateur pour les questions ouvertes) : sans accents, majuscules,
  // tirets, apostrophes, espaces ni articles du début (« le », « la », « les », « l' »).
  function normaliser(t) {
    return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
      .replace(/^\s*(le|la|les|l'|l’|the)\s*/, '')
      .replace(/^(saint|sainte)\b/g, 'st').replace(/\b(saint|sainte)\b/g, 'st')
      .replace(/[^a-z0-9]/g, '');
  }
  function ouverteJuste(texte, attendu) {
    var n = normaliser(texte);
    if (!n) return false;
    return String(attendu).split('|').some(function (a) { return normaliser(a) === n; });
  }
  function remplir(modele, a, b) { return modele.replace(/\{a\}/g, affiche(a)).replace(/\{b\}/g, affiche(b)); }

  // ---------- Tirage d'une carte ----------
  // reglage = { jeux: ['g04', …], niveau: 'facile' } ; matiere = 'geographie' ou 'histoire'.
  // Renvoie une carte (objet simple, sauvegardable en JSON) : { type: 'savoir', jeu, format, … }.
  function generer(reglage, matiere) {
    var niveau = reglage.niveau || 'facile';
    var choisis = (reglage.jeux || []).map(trouver).filter(function (j) { return j && (!matiere || j.matiere === matiere); });
    if (!choisis.length) choisis = jeuxDe(matiere || 'geographie');
    for (var essai = 0; essai < 50; essai++) {
      var jeu = auHasard(choisis);
      var series = jeu.series.filter(function (s) { return utilisable(s, niveau); });
      if (!series.length) continue;
      var s = auHasard(series);
      var c = TIRAGES[s.k](s, niveau, jeu);
      if (!c) continue;
      c.type = 'savoir';
      c.jeu = jeu.id;
      c.matiere = jeu.matiere;
      c.niveau = niveau;
      c.packNom = jeu.nom + ' · ' + NOMS_FORMATS[c.format];
      return c;
    }
    return null;
  }

  function contenu(s, niveau) { return (s.niveaux && s.niveaux[niveau]) || []; }
  function utilisable(s, niveau) {
    var t = contenu(s, niveau);
    if (s.k === 'carte') return !!(s.niveaux && s.niveaux[niveau]);
    if (s.k === 'classer' || s.k === 'indices' || s.k === 'qcm' || s.k === 'vf') return t.length > 0;
    return t.length >= 3;
  }

  // Paires sans doublon à gauche ni à droite (deux fleuves qui se jettent dans la même mer ne vont pas ensemble).
  function pairesDistinctes(t, n) {
    var vuA = {}, vuB = {}, res = [];
    melanger(t).forEach(function (p) {
      var a = normaliser(affiche(p[0])), b = normaliser(affiche(p[1]));
      if (res.length < n && !vuA[a] && !vuB[b]) { vuA[a] = vuB[b] = true; res.push(p); }
    });
    return res;
  }

  var TIRAGES = {
    // Série de paires : { k: 'paires', gauche, droite, q (demande b), qi (demande a, facultatif),
    //   ouverte: false pour ne jamais poser de question ouverte, image: 'drapeau' (a = code du pays) }
    paires: function (s, niveau) {
      var t = contenu(s, niveau), n = TAILLE[niveau];
      var formats = FORMATS_PAIRES[niveau].filter(function (f) { return f !== 'O' || s.ouverte !== false; });
      if (s.formats) formats = formats.filter(function (f) { return s.formats.indexOf(f) >= 0; });
      if (!formats.length) formats = ['Q'];
      var format = auHasard(formats);
      var choix = pairesDistinctes(t, format === 'R' ? n : Math.max(n, 3));
      if (choix.length < 3) return null;
      if (format === 'R') {
        return {
          format: 'R', consigne: s.consigneR || ('Relie chaque ' + s.gauche.toLowerCase() + ' à son ' + s.droite.toLowerCase() + '.'),
          gauche: choix.map(function (p) { return affiche(p[0]); }), droite: melanger(choix.map(function (p) { return affiche(p[1]); })),
          bonnes: choix.map(function (p) { return affiche(p[1]); }), image: s.image || null, liens: choix.map(function () { return null; }), choisi: 0
        };
      }
      // Choix multiples ou question ouverte : une paire, dans un sens ou dans l'autre.
      var p = choix[0], inverse = !!s.qi && !s.image && hasard() < 0.4;
      if (format === 'O') {
        return {
          format: 'O', consigne: remplir(inverse ? s.qi : s.q, p[0], p[1]), image: inverse ? null : s.image || null, sujet: inverse ? affiche(p[1]) : p[0],
          attendu: inverse ? p[0] : p[1], bonne: affiche(inverse ? p[0] : p[1])
        };
      }
      var autres = choix.slice(1, n).map(function (x) { return affiche(inverse ? x[0] : x[1]); });
      var bonne = affiche(inverse ? p[0] : p[1]);
      return {
        format: 'Q', consigne: remplir(inverse ? s.qi : s.q, p[0], p[1]), image: inverse ? null : s.image || null, sujet: inverse ? affiche(p[1]) : p[0],
        options: melanger([bonne].concat(autres)), bonne: bonne
      };
    },
    // Série à ranger : { k: 'ordre', consigne, sens: 'plus ancien → plus récent', q: 'En quelle année … {a} ?',
    //   niveaux: [[texte, valeur pour ranger, valeur affichée]] } → F (ranger) ou Q (« en quelle année ? »).
    ordre: function (s, niveau) {
      var t = contenu(s, niveau), n = TAILLE[niveau];
      var format = s.q && hasard() < 0.35 ? 'Q' : 'F';
      // Pas deux éléments à la même place.
      var vus = {}, items = melanger(t).filter(function (x) { if (vus[x[1]]) return false; vus[x[1]] = true; return true; }).slice(0, Math.max(3, n));
      if (items.length < 3) return null;
      if (format === 'Q') {
        var p = items[0];
        return { format: 'Q', consigne: remplir(s.q, p[0]), options: melanger(items.slice(0, n).map(function (x) { return String(x[2]); })), bonne: String(p[2]) };
      }
      var ordre = items.slice().sort(function (x, y) { return x[1] - y[1]; });
      return {
        format: 'F', consigne: s.consigne, sens: s.sens || ['le plus ancien', 'le plus récent'],
        elements: items.map(function (x) { return x[0]; }), bonnes: ordre.map(function (x) { return x[0]; }),
        valeurs: ordre.map(function (x) { return String(x[2]); }), places: items.map(function () { return null; })
      };
    },
    // Série à classer : niveaux = [{ q, colonnes: [A, B], items: [[texte, 0 ou 1]] }].
    classer: function (s, niveau) {
      var g = auHasard(contenu(s, niveau)), n = TAILLE_CLASSER[niveau];
      var a = melanger(g.items.filter(function (x) { return x[1] === 0; })), b = melanger(g.items.filter(function (x) { return x[1] === 1; }));
      if (!a.length || !b.length) return null;
      var na = Math.max(1, Math.min(a.length, Math.round(n / 2) + (hasard() < 0.5 ? 0 : -1)));
      var items = a.slice(0, na).concat(b.slice(0, n - na));
      if (items.length < 3) return null;
      items = melanger(items);
      return {
        format: 'K', consigne: g.q, colonnes: g.colonnes,
        elements: items.map(function (x) { return x[0]; }), bonnes: items.map(function (x) { return x[1]; }),
        rangs: items.map(function () { return null; })
      };
    },
    // Vrai ou faux : niveaux = [[affirmation, vrai ?, explication]].
    vf: function (s, niveau) {
      var x = auHasard(contenu(s, niveau));
      return { format: 'V', consigne: 'Vrai ou faux ?', affirmation: x[0], bonne: x[1] ? 'Vrai' : 'Faux', explication: x[2] || '' };
    },
    // Questions à choix : niveaux = [[question, bonne réponse, [fausses]]] ; donne aussi des vrai ou faux.
    qcm: function (s, niveau) {
      var x = auHasard(contenu(s, niveau)), n = TAILLE[niveau];
      if (s.vf !== false && hasard() < 0.3) {
        var vrai = hasard() < 0.5, montre = vrai ? x[1] : auHasard(x[2]);
        // « Quel est le plus grand océan ? » puis la réponse proposée, vraie ou fausse.
        return {
          format: 'V', consigne: 'Vrai ou faux ?', question: x[0], affirmation: affiche(montre),
          bonne: vrai ? 'Vrai' : 'Faux', explication: vrai ? '' : 'La bonne réponse : ' + affiche(x[1]) + '.'
        };
      }
      var fausses = melanger(x[2]).slice(0, n - 1).map(affiche);
      return { format: 'Q', consigne: x[0], options: melanger([affiche(x[1])].concat(fausses)), bonne: affiche(x[1]) };
    },
    // Qui suis-je ? : niveaux = [{ r: réponse, i: [5 indices] }] ; 3 autres réponses de la même série pour choisir.
    indices: function (s, niveau) {
      var t = contenu(s, niveau), x = auHasard(t);
      var tous = [];
      Object.keys(s.niveaux).forEach(function (nv) { s.niveaux[nv].forEach(function (y) { if (y.r !== x.r) tous.push(y.r); }); });
      var autres = melanger(tous.filter(function (r, k) { return tous.indexOf(r) === k; })).slice(0, 3);
      return { format: 'I', consigne: s.consigne || 'Qui suis-je ?', indices: x.i.slice(0, 5), vus: 1, options: melanger([x.r].concat(autres)), bonne: x.r };
    },
    // Toucher sur la carte : la carte et les zones viennent de js/cartes-geo.js (window.CartesGeo).
    carte: function (s, niveau) {
      var CG = racine.CartesGeo;
      if (!CG) return null;
      var d = CG.tirer(s.niveaux[niveau], hasard);
      if (!d) return null;
      return { format: 'C', consigne: d.consigne, carte: d.carte, zones: d.zones, bonne: d.bonne, bonneNom: d.bonneNom, touche: null };
    }
  };

  // ---------- Correction ----------
  // Renvoie vrai si la réponse de la carte est juste (la carte garde la réponse du joueur).
  function juste(c) {
    if (c.format === 'R') return c.liens.every(function (d, i) { return d === c.bonnes[i]; });
    if (c.format === 'F') return c.places.every(function (k, i) { return k !== null && c.elements[k] === c.bonnes[i]; });
    if (c.format === 'K') return c.rangs.every(function (r, i) { return r === c.bonnes[i]; });
    if (c.format === 'O') return ouverteJuste(c.reponseDonnee || '', c.attendu);
    if (c.format === 'C') return c.touche === c.bonne;
    return c.reponseDonnee === c.bonne; // Q, V, I
  }
  // Qui suis-je ? (choix de l'utilisateur) : pas de dé ; trouvé à l'indice n → 7 − n points (6 au premier,
  // 2 au cinquième) ; mauvaise réponse → 1 point (hypothèse à valider).
  function pointsIndices(c) { return c.reponseDonnee === c.bonne ? 7 - c.vus : 1; }

  var api = {
    NIVEAUX: NIVEAUX, TAILLE: TAILLE, NOMS_FORMATS: NOMS_FORMATS, JEUX: JEUX, PERIODES: PERIODES,
    ajouter: ajouter, trouver: trouver, jeuxDe: jeuxDe, generer: generer, juste: juste, pointsIndices: pointsIndices,
    normaliser: normaliser, ouverteJuste: ouverteJuste, affiche: affiche, utilisable: utilisable,
    regler: function (f) { hasard = f || Math.random; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Savoirs = api;
})(this);
