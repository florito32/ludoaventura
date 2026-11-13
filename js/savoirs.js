// Géographie et Histoire (v7.0, choix de l'utilisateur du 12/11/2026, BACKLOG lignes 253 à 263).
// Moteur sans interface : les jeux (js/geographie.js, js/histoire.js) donnent des « séries » de contenu,
// rangées par niveau (Facile, Moyen, Difficile, Expert : chaque niveau n'a QUE son propre contenu).
// À chaque carte, le moteur tire un jeu parmi ceux choisis par le joueur, une série, puis un format :
//   R relier (gauche ↔ droite)   Q choix multiples   O question ouverte   F remettre dans l'ordre
//   V vrai ou faux   K classer en 2 colonnes   I qui suis-je ? (5 indices)   C toucher sur la carte
// v8.0 : deux modes, Quiz (4 choix) et Normal (tout sauf le QCM) ; toujours 4 choix, toujours 4 paires ;
// questions ouvertes à partir de Difficile.
// Utilisable dans la page (window.Savoirs) et dans les tests Node.
(function (racine) {
  'use strict';

  var NIVEAUX = [
    { id: 'facile', nom: 'Facile' }, { id: 'moyen', nom: 'Moyen' },
    { id: 'difficile', nom: 'Difficile' }, { id: 'expert', nom: 'Expert' }
  ];
  // v8.0 (demande du 13/11/2026) : toujours 4 choix (une seule bonne réponse) et toujours 4 paires à relier.
  var TAILLE = { facile: 4, moyen: 4, difficile: 4, expert: 4 };          // paires, réponses proposées, éléments à ranger
  var TAILLE_CLASSER = { facile: 4, moyen: 5, difficile: 6, expert: 8 };  // éléments à classer
  // Deux modes (choix de l'utilisateur du 13/11/2026) : « quiz » = seulement des questions à 4 choix ;
  // « normal » = tout sauf le QCM (relier, question ouverte, ordre, vrai ou faux, classer, qui suis-je ?, carte).
  var MODES = [{ id: 'quiz', nom: 'Quiz' }, { id: 'normal', nom: 'Normal' }];
  // Formats d'une série de paires en mode normal (question ouverte à partir de Difficile).
  var FORMATS_PAIRES = { facile: ['R'], moyen: ['R'], difficile: ['R', 'O'], expert: ['R', 'O'] };
  var NOMS_FORMATS = {
    R: 'Relier', Q: 'Quiz', O: 'Question ouverte', F: 'Remettre dans l’ordre',
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
  // reglage = { jeux: ['g04', …], niveau: 'facile', mode: 'quiz' | 'normal' } ; matiere = 'geographie' ou 'histoire'.
  // Renvoie une carte (objet simple, sauvegardable en JSON) : { type: 'savoir', jeu, format, … }.
  function generer(reglage, matiere) {
    var niveau = reglage.niveau || 'facile', mode = modeDe(reglage);
    var choisis = (reglage.jeux || []).map(trouver).filter(function (j) { return j && (!matiere || j.matiere === matiere); });
    if (!choisis.length) choisis = jeuxDe(matiere || 'geographie');
    var tirages = mode === 'quiz' ? QUIZ : NORMAL;
    for (var essai = 0; essai < 60; essai++) {
      var jeu = auHasard(choisis);
      var series = jeu.series.filter(function (s) { return utilisable(s, niveau, mode); });
      if (!series.length) continue;
      var s = auHasard(series);
      var c = tirages[s.k](s, niveau, jeu);
      if (!c) continue;
      c.type = 'savoir';
      c.jeu = jeu.id;
      c.matiere = jeu.matiere;
      c.niveau = niveau;
      c.mode = mode;
      c.packNom = jeu.nom + ' · ' + NOMS_FORMATS[c.format];
      return c;
    }
    return null;
  }
  // Cartes de géographie (js/cartes-geo.js) : dans la page (window.CartesGeo) ou dans les tests Node.
  function cartesGeo() {
    if (racine && racine.CartesGeo) return racine.CartesGeo;
    return typeof module !== 'undefined' && module.exports ? require('./cartes-geo.js') : null;
  }
  function modeDe(r) { return r && r.mode === 'quiz' ? 'quiz' : 'normal'; }

  function contenu(s, niveau) { return (s.niveaux && s.niveaux[niveau]) || []; }
  // Une série peut-elle donner une carte à ce niveau, dans ce mode (normal par défaut) ?
  function utilisable(s, niveau, mode) {
    var t = contenu(s, niveau), quiz = mode === 'quiz';
    if (quiz && s.quiz === false) return false; // série réservée au mode Normal
    if (s.k === 'carte') {
      var CG = cartesGeo();
      return !!CG && CG.zonesDu(s.carte, niveau).length >= (quiz ? 4 : 1);
    }
    if (s.k === 'paires') return pairesDistinctes(t, 4, true).length >= 4;
    if (s.k === 'ordre') return t.length >= 4;
    if (s.k === 'indices') return t.length > 0 && autresReponses(s, t[0]).length >= 3;
    if (!quiz) return t.length > 0;
    if (s.k === 'qcm') return t.some(function (x) { return x[2].length >= 3; });
    if (s.k === 'vf') {
      var v = t.filter(function (x) { return x[1]; }).length, f = t.length - v;
      return (v >= 1 && f >= 3) || (v >= 3 && f >= 1);
    }
    if (s.k === 'classer') return t.some(function (g) { return classerQuiz(g, 0) || classerQuiz(g, 1); });
    return false;
  }
  function classerQuiz(g, k) {
    return g.items.some(function (x) { return x[1] === k; }) && g.items.filter(function (x) { return x[1] !== k; }).length >= 3;
  }
  function autresReponses(s, x) {
    var tous = [];
    Object.keys(s.niveaux).forEach(function (nv) { s.niveaux[nv].forEach(function (y) { if (y.r !== x.r) tous.push(y.r); }); });
    return tous.filter(function (r, k) { return tous.indexOf(r) === k; });
  }

  // Paires sans doublon à gauche ni à droite (deux fleuves qui se jettent dans la même mer ne vont pas ensemble).
  // sosies (facultatif) : [[a, a'], …] éléments de gauche qui se ressemblent trop (drapeaux) : jamais ensemble.
  function pairesDistinctes(t, n, sansHasard, sosies) {
    var vuA = {}, vuB = {}, res = [];
    (sansHasard ? t : melanger(t)).forEach(function (p) {
      var a = normaliser(affiche(p[0])), b = normaliser(affiche(p[1]));
      var proche = (sosies || []).some(function (s) {
        var i = s.indexOf(p[0]);
        return i >= 0 && res.some(function (q) { return q[0] === s[1 - i]; });
      });
      if (res.length < n && !vuA[a] && !vuB[b] && !proche) { vuA[a] = vuB[b] = true; res.push(p); }
    });
    return res;
  }

  // Une paire tirée pour une question : dans un sens (q : on donne a, on cherche b) ou dans l'autre (qi).
  function sens(s) { return !!s.qi && !s.image && hasard() < 0.5; }

  // ---------- Mode normal : tout sauf le QCM ----------
  var NORMAL = {
    // Série de paires : { k: 'paires', gauche, droite, q (demande b), qi (demande a, facultatif),
    //   ouverte: false pour ne jamais poser de question ouverte, image: 'drapeau' (a = code du pays) }
    paires: function (s, niveau) {
      var formats = FORMATS_PAIRES[niveau].filter(function (f) { return f !== 'O' || s.ouverte !== false; });
      var format = auHasard(formats);
      var choix = pairesDistinctes(contenu(s, niveau), 4, false, s.sosies);
      if (choix.length < 4) return null;
      if (format === 'R') {
        return {
          format: 'R', consigne: s.consigneR || ('Relie chaque ' + s.gauche.toLowerCase() + ' à son ' + s.droite.toLowerCase() + '.'),
          gauche: choix.map(function (p) { return affiche(p[0]); }), droite: melanger(choix.map(function (p) { return affiche(p[1]); })),
          bonnes: choix.map(function (p) { return affiche(p[1]); }), image: s.image || null, liens: choix.map(function () { return null; }), choisi: 0
        };
      }
      // qiOuverte: false → la question ouverte ne se pose que dans le sens q (on n'écrit pas un nom de monument).
      var p = choix[0], inverse = s.qiOuverte !== false && sens(s);
      return {
        format: 'O', consigne: remplir(inverse ? s.qi : s.q, p[0], p[1]), image: inverse ? null : s.image || null, sujet: inverse ? affiche(p[1]) : p[0],
        attendu: inverse ? p[0] : p[1], bonne: affiche(inverse ? p[0] : p[1])
      };
    },
    // Série à ranger : { k: 'ordre', consigne, sens: ['le plus ancien', 'le plus récent'], q: 'En quelle année … {a} ?',
    //   niveaux: [[texte, valeur pour ranger, valeur affichée]] } → remettre 4 éléments dans l'ordre.
    ordre: function (s, niveau) {
      var items = ordreItems(s, niveau);
      if (items.length < 4) return null;
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
    // Questions à choix : niveaux = [[question, bonne réponse, [fausses]]] ; en mode normal → vrai ou faux
    // (« Quel est le plus grand océan ? » puis une réponse proposée, vraie ou fausse).
    qcm: function (s, niveau) {
      var x = auHasard(contenu(s, niveau));
      var vrai = hasard() < 0.5, montre = vrai ? x[1] : auHasard(x[2]);
      return {
        format: 'V', consigne: 'Vrai ou faux ?', question: x[0], affirmation: affiche(montre),
        bonne: vrai ? 'Vrai' : 'Faux', explication: vrai ? '' : 'La bonne réponse : ' + affiche(x[1]) + '.'
      };
    },
    // Qui suis-je ? : niveaux = [{ r: réponse, i: [5 indices] }] ; 3 autres réponses de la même série pour choisir.
    indices: function (s, niveau) {
      var x = auHasard(contenu(s, niveau)), autres = melanger(autresReponses(s, x)).slice(0, 3);
      return { format: 'I', consigne: s.consigne || 'Qui suis-je ?', indices: x.i.slice(0, 5), vus: 1, options: melanger([x.r].concat(autres)), bonne: x.r };
    },
    // Toucher sur la carte : { k: 'carte', carte: 'france' | 'europe' | 'monde' } (js/cartes-geo.js).
    carte: function (s, niveau) {
      var CG = cartesGeo(); return CG ? CG.tirer(s.carte, niveau, hasard, 'normal') : null;
    }
  };

  function ordreItems(s, niveau) {
    var vus = {};
    return melanger(contenu(s, niveau)).filter(function (x) { if (vus[x[1]]) return false; vus[x[1]] = true; return true; }).slice(0, 4);
  }
  function majuscule(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function quiz(consigne, bonne, fausses, extra) {
    var c = { format: 'Q', consigne: consigne, options: melanger([bonne].concat(fausses.slice(0, 3))), bonne: bonne };
    Object.keys(extra || {}).forEach(function (k) { c[k] = extra[k]; });
    return c;
  }

  // ---------- Mode quiz : toujours une question à 4 choix, une seule bonne réponse ----------
  var QUIZ = {
    paires: function (s, niveau) {
      var choix = pairesDistinctes(contenu(s, niveau), 4, false, s.sosies);
      if (choix.length < 4) return null;
      var p = choix[0], inverse = sens(s);
      var bonne = affiche(inverse ? p[0] : p[1]);
      var fausses = choix.slice(1).map(function (x) { return affiche(inverse ? x[0] : x[1]); });
      return quiz(remplir(inverse ? s.qi : s.q, p[0], p[1]), bonne, fausses,
        { image: inverse ? null : s.image || null, sujet: inverse ? affiche(p[1]) : p[0] });
    },
    // « En quelle année … ? » (si la série le permet), sinon « Trouve le plus ancien / le plus haut. ».
    ordre: function (s, niveau) {
      var items = ordreItems(s, niveau);
      if (items.length < 4) return null;
      if (s.q && hasard() < 0.5) {
        return quiz(remplir(s.q, items[0][0]), String(items[0][2]), items.slice(1).map(function (x) { return String(x[2]); }));
      }
      var bout = hasard() < 0.5 ? 0 : 1, sensT = s.sens || ['le plus ancien', 'le plus récent'];
      var tri = items.slice().sort(function (x, y) { return x[1] - y[1]; });
      var bon = bout ? tri[tri.length - 1] : tri[0];
      return quiz('Trouve ' + sensT[bout] + '.', bon[0], items.filter(function (x) { return x !== bon; }).map(function (x) { return x[0]; }));
    },
    // Classer → « Lequel va avec : … ? » (1 de la colonne, 3 de l'autre).
    classer: function (s, niveau) {
      var groupes = [];
      contenu(s, niveau).forEach(function (g) { [0, 1].forEach(function (k) { if (classerQuiz(g, k)) groupes.push([g, k]); }); });
      if (!groupes.length) return null;
      var gk = auHasard(groupes), g = gk[0], k = gk[1];
      var bon = auHasard(g.items.filter(function (x) { return x[1] === k; }));
      var fausses = melanger(g.items.filter(function (x) { return x[1] !== k; })).map(function (x) { return x[0]; });
      return quiz('Lequel va avec : « ' + g.colonnes[k] + ' » ?', bon[0], fausses, { question: majuscule(g.q.replace(/^Range[^:]*:\s*/, '')) });
    },
    // Vrai ou faux → « Laquelle de ces phrases est vraie (ou fausse) ? ».
    vf: function (s, niveau) {
      var t = contenu(s, niveau), v = melanger(t.filter(function (x) { return x[1]; })), f = melanger(t.filter(function (x) { return !x[1]; }));
      var chercheVraie = v.length >= 1 && f.length >= 3 && (v.length < 3 || f.length < 1 || hasard() < 0.6);
      if (chercheVraie) return quiz('Laquelle de ces phrases est vraie ?', v[0][0], f.map(function (x) { return x[0]; }), { longues: true });
      if (v.length >= 3 && f.length >= 1) return quiz('Laquelle de ces phrases est fausse ?', f[0][0], v.map(function (x) { return x[0]; }), { longues: true });
      return null;
    },
    qcm: function (s, niveau) {
      var t = contenu(s, niveau).filter(function (x) { return x[2].length >= 3; });
      if (!t.length) return null;
      var x = auHasard(t);
      return quiz(x[0], affiche(x[1]), melanger(x[2]).map(affiche));
    },
    // Qui suis-je ? → 3 indices d'un coup, 4 réponses au choix.
    indices: function (s, niveau) {
      var x = auHasard(contenu(s, niveau)), autres = melanger(autresReponses(s, x));
      if (autres.length < 3) return null;
      return quiz(s.consigne || 'Qui suis-je ?', x.r, autres, { indicesQuiz: x.i.slice(0, 3) });
    },
    // Carte : la zone est en vert, 4 noms au choix (choix de l'utilisateur du 13/11/2026).
    carte: function (s, niveau) {
      var CG = cartesGeo(); return CG ? CG.tirer(s.carte, niveau, hasard, 'quiz') : null;
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
    NIVEAUX: NIVEAUX, MODES: MODES, TAILLE: TAILLE, modeDe: modeDe, NOMS_FORMATS: NOMS_FORMATS, JEUX: JEUX, PERIODES: PERIODES,
    ajouter: ajouter, trouver: trouver, jeuxDe: jeuxDe, generer: generer, juste: juste, pointsIndices: pointsIndices,
    normaliser: normaliser, ouverteJuste: ouverteJuste, affiche: affiche, utilisable: utilisable,
    regler: function (f) { hasard = f || Math.random; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Savoirs = api;
})(this);
