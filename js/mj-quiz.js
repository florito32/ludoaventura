// Mini-jeu « Quiz » (v10.51, demande du 24/11/2026, backlog ligne 520).
// Histoire et Géographie seulement pour l'instant. Le joueur choisit la matière, la sous-matière (période d'Histoire ou famille de
// Géographie) et un niveau de 1 à 10 (niveau N = niveaux de progression (N-1)×10+1 à N×10 de js/progression-savoirs.js, comme
// « Personnaliser »). Pas de plateau, pas de préparation d'aventure : seulement des questions à 4 réponses, une seule bonne.
//  - niveaux 1 à 5 : 10 questions ; niveaux 6 à 10 : 15 questions (choix de l'utilisateur) ; score sur 10 ou sur 15 ;
//  - 15 secondes pour répondre ; pas de réponse = mauvaise réponse ;
//  - la bonne réponse passe en vert ; une mauvaise réponse passe en rouge et la bonne en vert ; pause de 3 secondes, puis la page se
//    tourne et la question suivante arrive toute seule ;
//  - fin de partie : score, enregistré dans Supabase (table quiz_parties, fonction enregistrer_quiz, outils/supabase/20261124_quiz_scores.sql)
//    par matière, sous-matière et niveau ; si le joueur fait mieux que la moitié des autres joueurs du même quiz, une phrase de félicitations.
// Le mode Mini-jeux (js/minijeux.js) lance ce module : window.MJQuiz.monter(hote, { profil, fini(gagne, ligneHtml) }) → { detruire() }.
(function (racine) {
  'use strict';

  var DUREE = 15;          // secondes pour répondre
  var PAUSE = 3000;        // millisecondes entre la réponse et la question suivante
  var TOURNE = 700;        // durée de l'animation « page qui se tourne » (ms)
  var DELAI_BASE = 4000;   // au plus 4 s d'attente de la base à la fin de la partie

  // Matières proposées (Histoire et Géographie seulement pour l'instant).
  function matieres() {
    var H = racine.Histoire, G = racine.Geographie;
    return [
      { id: 'histoire', nom: 'Histoire', sous: H ? H.FAMILLES : [] },
      { id: 'geographie', nom: 'Géographie', sous: G ? G.FAMILLES : [] }
    ];
  }

  function nbQuestions(niveau) { return niveau <= 5 ? 10 : 15; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function melanger(l) { var a = l.slice(), j, t; for (var i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------- Tirage des questions (logique, sans interface) ----------
  // n cartes à 4 choix, toutes différentes, dans la sous-matière et la bande de 10 niveaux de progression du niveau choisi.
  // Bande trop pauvre : on l'élargit peu à peu (5, 10, 25, 50, 100 niveaux de chaque côté) jusqu'à avoir assez de questions.
  function signature(c) {
    return [c.jeu, c.consigne, c.sujet || '', c.verte ? JSON.stringify(c.verte) : '', (c.indicesQuiz || []).join('/'), c.bonne].join('|');
  }
  function tirer(S, matiere, sous, niveau, n) {
    var jeux = S.JEUX.filter(function (j) { return j.matiere === matiere && j.famille === sous; }).map(function (j) { return j.id; });
    var bas = (niveau - 1) * 10 + 1, haut = niveau * 10, vus = {}, liste = [];
    [0, 5, 10, 25, 50, 100].forEach(function (large) {
      if (liste.length >= n) return;
      var fenetre = { bas: Math.max(1, bas - large), haut: Math.min(100, haut + large) }, rates = 0;
      for (var essai = 0; essai < 400 && liste.length < n && rates < 40; essai++) {
        var c = S.generer({ jeux: jeux, mode: 'quiz', fenetre: fenetre }, matiere);
        if (!c || c.format !== 'Q' || !c.options || c.options.length !== 4 || c.options.indexOf(c.bonne) < 0) { rates++; continue; }
        var k = signature(c);
        if (vus[k]) { rates++; continue; }
        vus[k] = true; rates = 0; liste.push(c);
      }
    });
    return melanger(liste).slice(0, n);
  }

  // ---------- Phrase de comparaison ----------
  // pct = part (0 à 100) des autres joueurs du même quiz (matière, sous-matière, niveau) dont le meilleur score est plus bas.
  // Affichée seulement à partir de 50 % (« s'il fait mieux que 50 % des joueurs »).
  function phrase(pct) {
    return typeof pct === 'number' && pct >= 50 ? 'Félicitations, tu fais mieux que ' + pct + ' % des joueurs !' : '';
  }

  var api = { DUREE: DUREE, PAUSE: PAUSE, nbQuestions: nbQuestions, tirer: tirer, phrase: phrase };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  racine.MJQuiz = api;

  // ---------- Interface ----------
  var dernier = { matiere: 'histoire', sous: {}, niveau: 1 }; // choix gardés pour « Rejouer » (sous-matière retenue par matière)

  function monter(hote, opts) {
    opts = opts || {};
    var S = racine.Savoirs, SC = racine.SavoirsCarte;
    // Tests : window.AVENTURA_QUIZ_PAUSE (ms) et window.AVENTURA_QUIZ_DUREE (s) raccourcissent la pause et le chronomètre.
    var pause = Number(racine.AVENTURA_QUIZ_PAUSE) >= 0 && racine.AVENTURA_QUIZ_PAUSE !== undefined ? Number(racine.AVENTURA_QUIZ_PAUSE) : PAUSE;
    var duree = Number(racine.AVENTURA_QUIZ_DUREE) > 0 ? Number(racine.AVENTURA_QUIZ_DUREE) : DUREE;
    var minuterie = null, chrono = null, vivant = true;
    var partie = null; // { matiere, sous, niveau, cartes, k, score, fin (échéance), verrou }
    var reduit = racine.matchMedia && racine.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function nomMatiere(id) { return matieres().filter(function (m) { return m.id === id; })[0]; }
    function nomSous(m, id) { var s = (m ? m.sous : []).filter(function (x) { return x.id === id; })[0]; return s ? s.nom : id; }

    // ----- Choix de la matière, de la sous-matière et du niveau -----
    function choix() {
      var ms = matieres(), m = nomMatiere(dernier.matiere) || ms[0];
      var sous = dernier.sous[m.id] || (m.sous[0] && m.sous[0].id);
      var h = '<section class="quiz quiz-choix"><fieldset class="defi-choix"><legend>Matière</legend><div class="packs">';
      ms.forEach(function (x) {
        h += '<label class="pack"><input type="radio" name="quiz-matiere" value="' + x.id + '"' + (x.id === m.id ? ' checked' : '') + '><span>' + esc(x.nom) + '</span></label>';
      });
      h += '</div></fieldset><fieldset class="defi-choix"><legend>' + (m.id === 'histoire' ? 'Période' : 'Famille de jeux') + '</legend><div class="packs">';
      m.sous.forEach(function (x) {
        h += '<label class="pack"><input type="radio" name="quiz-sous" value="' + x.id + '"' + (x.id === sous ? ' checked' : '') + '><span>' + esc(x.nom) + '</span></label>';
      });
      h += '</div></fieldset><fieldset class="defi-choix"><legend>Niveau (1 à 10)</legend><div class="packs quiz-niveaux">';
      for (var n = 1; n <= 10; n++) {
        h += '<label class="pack"><input type="radio" name="quiz-niveau" value="' + n + '"' + (n === dernier.niveau ? ' checked' : '') + '><span>' + n + '</span></label>';
      }
      h += '</div></fieldset><p class="quiz-info" id="quiz-info" role="status"></p>' +
        '<button type="button" class="btn btn-principal" id="quiz-lancer">Lancer le quiz</button></section>';
      hote.innerHTML = h;
      info();
    }
    function info() {
      var e = hote.querySelector('#quiz-info');
      if (e) e.textContent = nbQuestions(dernier.niveau) + ' questions · ' + DUREE + ' secondes par question · une seule bonne réponse sur 4';
    }
    function lireChoix() {
      var f = function (nom) { var x = hote.querySelector('input[name="' + nom + '"]:checked'); return x ? x.value : null; };
      var m = nomMatiere(f('quiz-matiere')) || matieres()[0];
      dernier.matiere = m.id;
      dernier.sous[m.id] = f('quiz-sous') || (m.sous[0] && m.sous[0].id);
      dernier.niveau = Number(f('quiz-niveau')) || 1;
    }
    hote.addEventListener('change', function (e) {
      if (partie || !e.target.name || e.target.name.indexOf('quiz-') !== 0) return;
      var avant = dernier.matiere;
      lireChoix();
      if (e.target.name === 'quiz-matiere' && avant !== dernier.matiere) { choix(); var r = hote.querySelector('input[name="quiz-matiere"]:checked'); if (r) r.focus({ preventScroll: true }); return; }
      info();
    });
    hote.addEventListener('click', function (e) {
      if (partie || !e.target.closest('#quiz-lancer')) return;
      lireChoix();
      demarrer();
    });

    // ----- Une partie -----
    function demarrer() {
      var m = nomMatiere(dernier.matiere), sous = dernier.sous[m.id], n = nbQuestions(dernier.niveau);
      var cartes = S ? tirer(S, m.id, sous, dernier.niveau, n) : [];
      if (cartes.length < n) { // ne devrait pas arriver : assez de questions dans chaque sous-matière
        hote.querySelector('#quiz-info').textContent = 'Pas assez de questions pour ce quiz : choisis une autre période ou un autre niveau.';
        return;
      }
      partie = { matiere: m.id, sous: sous, niveau: dernier.niveau, cartes: cartes, k: 0, score: 0, fin: 0, verrou: false };
      hote.innerHTML = '<section class="quiz quiz-jeu"><div class="quiz-entete"><span class="quiz-num" id="quiz-num"></span>' +
        '<span class="quiz-chrono" id="quiz-chrono" aria-hidden="true"></span></div>' +
        '<div class="quiz-barre" aria-hidden="true"><i id="quiz-barre"></i></div>' +
        '<div class="quiz-pages" id="quiz-pages"></div>' +
        '<p class="quiz-annonce" id="quiz-annonce" role="status" aria-live="assertive"></p></section>';
      question(false);
    }
    function pageHtml(c, k) {
      var h = '<article class="quiz-page" aria-label="Question ' + (k + 1) + '"><h3 class="quiz-question">' + esc(c.consigne) + '</h3>' +
        (SC && SC.sujet ? '<div class="carte-savoir quiz-sujet">' + SC.sujet(c) + '</div>' : '') +
        '<div class="savoir-options quiz-options' + (c.longues ? ' longues' : '') + '" role="group" aria-label="Réponses proposées">';
      c.options.forEach(function (o, i) { h += '<button type="button" class="btn-option" data-i="' + i + '">' + esc(o) + '</button>'; });
      return h + '</div></article>';
    }
    // Affiche la question k ; tourne = la page d'avant se tourne pour la découvrir.
    function question(tourne) {
      if (!vivant || !partie) return;
      var pages = hote.querySelector('#quiz-pages'), ancienne = pages.querySelector('.quiz-page');
      var c = partie.cartes[partie.k];
      pages.insertAdjacentHTML('afterbegin', pageHtml(c, partie.k)); // la nouvelle page est dessous
      var nouvelle = pages.querySelector('.quiz-page');
      var geo = nouvelle.querySelector('.carte-geo'); // carte du quiz de Géographie : zoom (boutons + et −, pincement) comme sur le plateau
      if (geo && SC && SC.zoomer) SC.zoomer(geo);
      hote.querySelector('#quiz-num').textContent = 'Question ' + (partie.k + 1) + ' / ' + partie.cartes.length;
      hote.querySelector('#quiz-annonce').textContent = '';
      partie.verrou = false;
      var oter = function () { if (ancienne && ancienne.parentNode) ancienne.parentNode.removeChild(ancienne); lancerChrono(); };
      if (ancienne && tourne && !reduit) {
        ancienne.classList.add('sortante');
        ancienne.setAttribute('aria-hidden', 'true');
        minuterie = setTimeout(oter, TOURNE);
      } else oter();
      var b = nouvelle.querySelector('.btn-option'); if (b) b.focus({ preventScroll: true });
    }
    function lancerChrono() {
      arreterChrono();
      partie.fin = Date.now() + duree * 1000;
      majChrono();
      chrono = setInterval(majChrono, 100);
    }
    function arreterChrono() { if (chrono) { clearInterval(chrono); chrono = null; } }
    function majChrono() {
      if (!partie || !vivant) return;
      var reste = Math.max(0, partie.fin - Date.now());
      var t = hote.querySelector('#quiz-chrono'), b = hote.querySelector('#quiz-barre');
      if (t) t.textContent = Math.ceil(reste / 1000) + ' s';
      if (b) { b.style.width = (100 * reste / (duree * 1000)) + '%'; b.classList.toggle('urgent', reste <= 5000); }
      if (reste <= 0) repondre(-1); // pas de réponse = mauvaise réponse
    }
    // i : numéro de la réponse touchée, -1 = temps écoulé.
    function repondre(i) {
      if (!partie || partie.verrou || !vivant) return;
      partie.verrou = true;
      arreterChrono();
      var c = partie.cartes[partie.k], bonne = i >= 0 && c.options[i] === c.bonne;
      if (bonne) partie.score++;
      var page = hote.querySelector('.quiz-page');
      page.querySelectorAll('.btn-option').forEach(function (b, j) {
        b.disabled = true;
        if (c.options[j] === c.bonne) b.classList.add('bonne');            // la bonne réponse : verte
        else if (j === i) b.classList.add('fausse');                        // la réponse fausse touchée : rouge
      });
      hote.querySelector('#quiz-annonce').textContent = bonne ? 'Bonne réponse !' : (i < 0 ? 'Temps écoulé. ' : 'Mauvaise réponse. ') + (bonne ? '' : 'La bonne réponse était : ' + c.bonne + '.');
      minuterie = setTimeout(suite, pause);
    }
    function suite() {
      if (!vivant || !partie) return;
      partie.k++;
      if (partie.k < partie.cartes.length) question(true); else terminer();
    }
    hote.addEventListener('click', function (e) {
      var b = e.target.closest('.quiz-options .btn-option');
      if (b && partie && !b.disabled) repondre(Number(b.dataset.i));
    });

    // ----- Fin de partie : score, enregistrement, comparaison -----
    function terminer() {
      arreterChrono();
      var p = partie, total = p.cartes.length;
      hote.innerHTML = '<p class="quiz-attente" role="status">Calcul de ton score…</p>';
      var C = racine.Compte, envoi = null;
      if (C && C.rpc) {
        envoi = Promise.race([
          C.rpc('enregistrer_quiz', { p_matiere: p.matiere, p_sous_matiere: p.sous, p_niveau: p.niveau, p_score: p.score, p_joueur: opts.profil || '' }),
          new Promise(function (ok) { setTimeout(function () { ok(null); }, DELAI_BASE); })
        ]).catch(function () { return null; });
      } else envoi = Promise.resolve(null);
      envoi.then(function (r) {
        if (!vivant) return;
        var m = nomMatiere(p.matiere);
        var ligne = '<span class="quiz-contexte">' + esc(m.nom) + ' › ' + esc(nomSous(m, p.sous)) + ' › niveau ' + p.niveau + '</span><br>' +
          'Ton score : <strong class="quiz-score">' + p.score + ' / ' + total + '</strong>';
        var f = phrase(r && typeof r.pourcentage === 'number' ? r.pourcentage : null);
        if (f) ligne += '<br><strong class="quiz-felicitations">' + esc(f) + '</strong>';
        partie = null;
        if (opts.fini) opts.fini(p.score * 2 >= total, ligne);
      });
    }

    racine.MJQuiz.courant = function () { return partie; }; // tests : la partie en cours (cartes, k, score)
    choix();
    return {
      detruire: function () {
        vivant = false; partie = null;
        arreterChrono();
        if (minuterie) { clearTimeout(minuterie); minuterie = null; }
      }
    };
  }

  racine.MJQuiz = { monter: monter, DUREE: DUREE, PAUSE: PAUSE, nbQuestions: nbQuestions, tirer: tirer, phrase: phrase };
})(typeof window !== 'undefined' ? window : globalThis);
