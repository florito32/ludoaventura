// Mini-jeu « Course aux étoiles » (v10.44, demande du 24/11/2026) : repris du dépôt florito32/minijeux (multiplication/etoiles),
// avec la charte d'Aventura (parchemin, contours et ombres brunes, boutons en relief).
// Règles : le joueur choisit ses tables (1 à 10), puis trouve 50 bonnes réponses (une multiplication, 3 réponses possibles).
// Étoiles de bronze, d'argent et d'or à 10, 25 et 50. 3 vies : une erreur en coûte une, on en regagne une à 10 et à 25.
// Fin de partie (50 réussies ou 0 vie) : le mode Mini-jeux (js/minijeux.js) donne les étoiles d'Aventura. « Arrêter la partie » : rien.
// Le classement par nom du jeu d'origine n'est pas repris : Aventura a ses pseudos ; seul le meilleur temps de l'appareil est gardé.
(function () {
  'use strict';

  var BUT = 50;
  var ETOILES = [
    { at: 10, label: 'Étoile de bronze', couleur: '#c9833a' },
    { at: 25, label: 'Étoile d’argent', couleur: '#b8c0cc' },
    { at: 50, label: 'Étoile d’or', couleur: '#f2b705' }
  ];
  var VIES = 3;
  var VIE_A = [10, 25];            // paliers qui rendent une vie (3 au maximum)
  var CLE_TABLES = 'ludoaventura-mj-etoiles-tables-v1';
  var CLE_RECORD = 'ludoaventura-mj-etoiles-records-v1';
  var STAR = '12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6';

  function charger(cle, defaut) {
    try { var v = JSON.parse(localStorage.getItem(cle)); return v == null ? defaut : v; } catch (e) { return defaut; }
  }
  function garder(cle, v) { try { localStorage.setItem(cle, JSON.stringify(v)); } catch (e) { /* stockage bloqué : sans importance */ } }
  function alea(n) { return Math.floor(Math.random() * n); }
  function melanger(a) { for (var i = a.length - 1; i > 0; i--) { var j = alea(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // Temps lisible : 1:23.4 (minutes:secondes.dixièmes)
  function fmt(ms) {
    var d = Math.floor(ms / 100), s = Math.floor(d / 10), m = Math.floor(s / 60);
    return m + ':' + String(s % 60).padStart(2, '0') + '.' + (d % 10);
  }
  function etoileSvg(couleur, gagnee) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="' + STAR + '" fill="' + (gagnee ? couleur : '#d8d2c4') +
      '" stroke="#3b2a1e" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  }
  function nomTables(l) {
    return l.length === 10 ? 'toutes les tables' : (l.length > 1 ? 'tables de ' : 'table de ') + l.join(', ').replace(/, (\d+)$/, ' et $1');
  }

  // hote : l'élément qui reçoit le jeu ; opts.fini(gagne, ligneHtml) est appelé une seule fois, à la fin d'une partie.
  function monter(hote, opts) {
    var tables = charger(CLE_TABLES, []).filter(function (n) { return n >= 1 && n <= 10; });
    var score = 0, vies = VIES, question = null, verrou = false, enCours = false, fini = false;
    var debut = 0, ecoule = 0, minuteur = 0, delaiErreur = 900, attente = [];

    var h = '<section class="mj-jeu mj-etoiles">' +
      '<div data-ecran="choix">' +
        '<h3>Choisis tes tables</h3>' +
        '<p class="mj-regle">Trouve 50 bonnes réponses le plus vite possible : étoile de bronze à 10, d’argent à 25, d’or à 50. Tu as 3 vies : une erreur en coûte une, et tu en regagnes une à 10 et à 25.</p>' +
        '<div class="mj-puces" role="group" aria-label="Tables de multiplication">';
    for (var n = 1; n <= 10; n++) h += '<button type="button" class="mj-puce" data-table="' + n + '" aria-pressed="false">' + n + '</button>';
    h += '</div><button type="button" class="mj-lien" data-toutes>Toutes</button>' +
        '<p class="petit" data-aide role="status"></p>' +
        '<button type="button" class="btn btn-principal" data-demarrer disabled>Démarrer</button>' +
        '<p class="petit" data-record></p>' +
      '</div>' +
      '<div data-ecran="jeu" hidden>' +
        '<div class="mj-hud"><p>Bonnes réponses : <strong data-score>0</strong> / ' + BUT + '</p>' +
          '<p class="mj-coeurs" data-coeurs></p><p><span aria-hidden="true">⏱</span> <time data-minuteur>0:00.0</time></p></div>' +
        '<ul class="mj-etoiles-liste" data-etoiles aria-label="Étoiles"></ul>' +
        '<div class="mj-barre" aria-hidden="true"><span data-barre></span></div>' +
        '<div class="mj-question"><p class="mj-calcul" data-calcul aria-live="polite"></p><span class="mj-egal" aria-hidden="true">=</span>' +
          '<div class="mj-reponses" data-reponses role="group" aria-label="Réponses possibles"></div></div>' +
        '<p class="mj-retour" data-retour role="status"></p>' +
        '<button type="button" class="mj-lien" data-arreter>Arrêter la partie</button>' +
      '</div></section>';
    hote.innerHTML = h;

    function $(s) { return hote.querySelector(s); }
    var ecrans = { choix: $('[data-ecran="choix"]'), jeu: $('[data-ecran="jeu"]') };
    var puces = Array.prototype.slice.call(hote.querySelectorAll('[data-table]'));
    var btnDemarrer = $('[data-demarrer]'), btnToutes = $('[data-toutes]'), aide = $('[data-aide]');
    var elReponses = $('[data-reponses]'), elRetour = $('[data-retour]');

    function montrer(nom) { Object.keys(ecrans).forEach(function (k) { ecrans[k].hidden = k !== nom; }); }
    function apres(fn, ms) { var t = setTimeout(fn, ms); attente.push(t); }

    /* ---------- Choix des tables ---------- */
    function majPuces() {
      puces.forEach(function (p) { p.setAttribute('aria-pressed', tables.indexOf(+p.dataset.table) >= 0 ? 'true' : 'false'); });
      btnDemarrer.disabled = !tables.length;
      btnToutes.textContent = tables.length === 10 ? 'Aucune' : 'Toutes';
      aide.textContent = tables.length ? 'Tu seras interrogé sur ' + nomTables(tables) + '.' : 'Touche une ou plusieurs tables.';
      var rec = tables.length && charger(CLE_RECORD, {})[tables.length];
      $('[data-record]').textContent = rec ? 'Ton meilleur temps avec ' + tables.length + (tables.length > 1 ? ' tables : ' : ' table : ') + fmt(rec) : '';
    }
    puces.forEach(function (p) {
      p.addEventListener('click', function () {
        var n = +p.dataset.table, i = tables.indexOf(n);
        if (i >= 0) tables.splice(i, 1); else tables.push(n);
        tables.sort(function (a, b) { return a - b; });
        garder(CLE_TABLES, tables); majPuces();
      });
    });
    btnToutes.addEventListener('click', function () {
      tables = tables.length === 10 ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      garder(CLE_TABLES, tables); majPuces();
    });

    /* ---------- Une question ---------- */
    function nouvelleQuestion() {
      var a, b, t;
      do {
        t = tables[alea(tables.length)];
        var k = 1 + alea(10);
        if (alea(2)) { a = t; b = k; } else { a = k; b = t; }
      } while (question && a === question.a && b === question.b && tables.length * 10 > 1);
      var bonne = a * b, pieges = [], reserve = [(a + 1) * b, (a - 1) * b, a * (b + 1), a * (b - 1), bonne + 1, bonne - 1, bonne + 2, bonne - 2, bonne + 10, bonne - 10];
      melanger(reserve).forEach(function (v) { if (pieges.length < 2 && v > 0 && v !== bonne && pieges.indexOf(v) < 0) pieges.push(v); });
      question = { a: a, b: b, bonne: bonne, choix: melanger([bonne].concat(pieges)) };
      $('[data-calcul]').textContent = a + ' × ' + b;
      elReponses.innerHTML = '';
      question.choix.forEach(function (v) {
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'mj-reponse'; btn.textContent = v;
        btn.addEventListener('click', function () { repondre(btn, v); });
        elReponses.appendChild(btn);
      });
      verrou = false;
    }

    function repondre(btn, valeur) {
      if (verrou || !enCours) return;
      verrou = true;
      if (valeur === question.bonne) {
        score++;
        if (score >= BUT) arreterMinuteur(); // le chronomètre s'arrête au clic sur la 50e bonne réponse
        btn.classList.add('bonne');
        elRetour.textContent = '';
        majScore(true);
        if (VIE_A.indexOf(score) >= 0 && vies < VIES) { vies++; majCoeurs(); elRetour.textContent = (elRetour.textContent ? elRetour.textContent + ' ' : '') + '+1 vie ♥'; }
        if (score >= BUT) { apres(gagner, 600); return; }
        apres(nouvelleQuestion, 250);
      } else {
        btn.classList.add('mauvaise');
        Array.prototype.forEach.call(elReponses.children, function (b) { if (+b.textContent === question.bonne) b.classList.add('bonne'); });
        elRetour.textContent = 'Non : ' + question.a + ' × ' + question.b + ' = ' + question.bonne;
        vies--; majCoeurs();
        if (vies <= 0) { arreterMinuteur(); apres(perdre, delaiErreur); return; }
        apres(function () { elRetour.textContent = ''; nouvelleQuestion(); }, delaiErreur);
      }
    }

    function majScore(vientDeMarquer) {
      $('[data-score]').textContent = score;
      $('[data-barre]').style.width = (score / BUT * 100) + '%';
      var s = '';
      ETOILES.forEach(function (e) {
        var gagnee = score >= e.at;
        s += '<li class="mj-etoile' + (gagnee ? ' gagnee' : '') + '">' + etoileSvg(e.couleur, gagnee) + '<span>' + e.at + '</span>' +
          '<span class="visually-hidden">' + e.label + (gagnee ? ' : gagnée' : ' : pas encore') + '</span></li>';
        if (vientDeMarquer && score === e.at && e.at < BUT) elRetour.textContent = e.label + ' gagnée !';
      });
      $('[data-etoiles]').innerHTML = s;
    }
    function majCoeurs() {
      var s = ''; for (var i = 0; i < VIES; i++) s += '<span' + (i >= vies ? ' class="perdu"' : '') + '>♥</span>';
      var c = $('[data-coeurs]'); c.innerHTML = s; c.setAttribute('aria-label', vies + (vies > 1 ? ' vies' : ' vie') + ' sur ' + VIES);
    }

    /* ---------- Chronomètre ---------- */
    function tic() { $('[data-minuteur]').textContent = fmt(performance.now() - debut); }
    function lancerMinuteur() { debut = performance.now(); enCours = true; tic(); minuteur = setInterval(tic, 100); }
    function arreterMinuteur() {
      ecoule = Math.round(performance.now() - debut); enCours = false; clearInterval(minuteur);
      $('[data-minuteur]').textContent = fmt(ecoule);
    }

    /* ---------- Déroulé ---------- */
    function demarrer() {
      if (!tables.length) return;
      score = 0; vies = VIES; question = null; ecoule = 0; fini = false;
      elRetour.textContent = '';
      majScore(false); majCoeurs(); montrer('jeu'); nouvelleQuestion(); lancerMinuteur();
      var p = elReponses.querySelector('button'); if (p) p.focus({ preventScroll: true });
    }
    function gagner() {
      if (fini) return; fini = true;
      var records = charger(CLE_RECORD, {}), cle = tables.length, ancien = records[cle], nouveau = !ancien || ecoule < ancien;
      if (nouveau) { records[cle] = ecoule; garder(CLE_RECORD, records); }
      opts.fini(true, 'Ton temps : <strong>' + fmt(ecoule) + '</strong> (' + nomTables(tables) + ')' + (nouveau ? ' — nouveau record !' : ''));
    }
    function perdre() {
      if (fini || ecrans.jeu.hidden) return; fini = true;
      var gagnees = ETOILES.filter(function (e) { return score >= e.at; }).length;
      opts.fini(false, 'Plus de vies ! Bonnes réponses : ' + score + ' / ' + BUT + '. ' + (gagnees ? gagnees + (gagnees > 1 ? ' étoiles obtenues.' : ' étoile obtenue.') : 'Aucune étoile cette fois.'));
    }
    btnDemarrer.addEventListener('click', demarrer);
    $('[data-arreter]').addEventListener('click', function () {
      enCours = false; clearInterval(minuteur); attente.forEach(clearTimeout); attente = [];
      montrer('choix'); majPuces(); btnDemarrer.focus({ preventScroll: true });
    });

    majPuces();
    montrer('choix');

    // Accès pour les tests automatiques.
    window.__mjEtoiles = {
      etat: function () { return { score: score, vies: vies, enCours: enCours, tables: tables.slice(), question: question && { a: question.a, b: question.b, bonne: question.bonne, choix: question.choix.slice() } }; },
      delaiErreur: function (ms) { delaiErreur = ms; }
    };
    return {
      detruire: function () {
        enCours = false; clearInterval(minuteur); attente.forEach(clearTimeout); attente = []; fini = true;
        if (window.__mjEtoiles) delete window.__mjEtoiles;
      }
    };
  }

  window.MJEtoiles = { monter: monter };
})();
