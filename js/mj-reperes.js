// Mini-jeu « Chasse aux lettres » (v10.54, demande du 25/11/2026, backlog lignes 532 à 541).
// Entraîne le repérage visuel des lettres qui se ressemblent (b/d/p/q, m/n/w…). Un écran de préparation (profil, record, lettre à
// chercher ou « au hasard », majuscule / minuscule / mélange, imprimerie / cursive), puis une partie d'une minute : en haut, la
// lettre demandée, le chronomètre et le nombre de lettres trouvées ; en dessous, des lettres immobiles (13) dont environ un tiers sont
// la lettre demandée. Toucher une lettre (bonne ou mauvaise) la fait disparaître et une nouvelle apparaît ailleurs ; toutes les
// 2 secondes, une lettre non demandée disparaît aussi et une autre apparaît (demandée ou non). Pas de limite d'erreurs.
// Pas de limite de quantité (choix de l'utilisateur, 25/11/2026) : des lettres demandées apparaissent jusqu'à la fin de la minute.
// Choix de l'utilisateur (page de test A/B du 25/11/2026) : réglages « A », avec 13 lettres, bandeau vert, lettres noires sans fond
// à 70 %, cursive « traditionnelle », erreurs non affichées. Record : un seul par profil (toutes lettres confondues), gardé dans Supabase
// (outils/supabase/20261125_reperes_records.sql : enregistrer_reperes, record_reperes) et recopié sur l'appareil, qui sert seul hors connexion.
// Le mode Mini-jeux (js/minijeux.js) lance ce module : window.MJReperes.monter(hote, { profil, fini(gagne, ligneHtml) }) → { detruire() }.
(function (racine) {
  'use strict';

  var NB = 13;          // lettres à l'écran
  var DELAI = 2;        // une lettre non demandée change toutes les 2 secondes
  var DUREE = 60;       // secondes
  var PART = 33;        // part (%) de lettres demandées à l'écran
  var TAILLE = 0.7;     // taille des lettres par rapport à leur emplacement
  var COMPTE = 3;       // décompte avant le départ (secondes, non compté dans la minute)
  var DELAI_BASE = 4000; // au plus 4 s d'attente de la base (record à l'écran de préparation, enregistrement à la fin)
  var CLE_RECORDS = 'ludoaventura-mj-reperes-records-v1';

  var ALPHA = 'abcdefghijklmnopqrstuvwxyz'.split('');
  // Lettres qui se ressemblent, en minuscules et en majuscules ; réunies par lettre de base (en minuscule).
  var SOS_MIN = { b: 'dpqhl', d: 'bqpag', p: 'qbdg', q: 'pdbg', m: 'nwhr', n: 'muhr', u: 'nvy', v: 'uwy', w: 'mvu', a: 'oedg', o: 'ace', c: 'eoa', e: 'coa', f: 'tlj', t: 'fli', i: 'jlt', j: 'igy', l: 'itbh', h: 'nbkm', k: 'hxl', g: 'qyjp', y: 'gvu', r: 'nvt', s: 'zce', z: 'sx', x: 'kzy' };
  var SOS_MAJ = { B: 'DPRE', D: 'BOQP', P: 'RBFD', Q: 'OGC', M: 'NWHV', N: 'MHZW', W: 'MVNU', V: 'UWYA', U: 'VYWO', H: 'NMAK', E: 'FBLP', F: 'EPTL', A: 'HVRK', O: 'QCDG', C: 'GOUS', G: 'COQS', I: 'LJT', J: 'IUL', K: 'XHRY', L: 'IETJ', R: 'PBKA', S: 'ZCG', T: 'IFLY', X: 'KYZV', Y: 'VXTU', Z: 'NSXL' };
  var CLASSIQUES = 'bdpqmnuwvh'.split(''); // les plus confondues : le « hasard » les préfère (7 fois sur 10)

  function alea(n) { return Math.floor(Math.random() * n); }
  function tirer(t) { return t[alea(t.length)]; }
  function melanger(t) { for (var i = t.length - 1; i > 0; i--) { var j = alea(i + 1), x = t[i]; t[i] = t[j]; t[j] = x; } return t; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Les « sosies » d'une lettre (minuscules, sans elle-même) : ceux de sa forme minuscule et de sa forme majuscule.
  function sosies(base) {
    var u = {}, s = (SOS_MIN[base] || '') + (SOS_MAJ[base.toUpperCase()] || '').toLowerCase();
    for (var i = 0; i < s.length; i++) if (s[i] !== base) u[s[i]] = 1;
    return Object.keys(u);
  }
  // Lettre au hasard : plutôt une des plus confondues.
  function lettreHasard() { return Math.random() < 0.7 ? tirer(CLASSIQUES) : tirer(ALPHA); }
  // « M », « m » ou « M m » selon le choix de casse (maj, min, mix).
  function libelle(lettre, casse) { return casse === 'maj' ? lettre.toUpperCase() : casse === 'min' ? lettre : lettre.toUpperCase() + ' ' + lettre; }

  // Une lettre à afficher. Demandée : la lettre de base. Sinon un « sosie » 2 fois sur 3, une autre lettre au hasard le reste du temps.
  // Casse : majuscule, minuscule, ou l'une ou l'autre au hasard (mélange).
  function nouvelle(base, casse, cible) {
    var l;
    if (cible) l = base;
    else if (Math.random() < 0.67) l = tirer(sosies(base));
    else { do { l = tirer(ALPHA); } while (l === base); }
    var maj = casse === 'maj' ? true : casse === 'min' ? false : Math.random() < 0.5;
    return { l: maj ? l.toUpperCase() : l, cible: !!cible };
  }

  // Disposition : des emplacements fixes en grille (un peu décalés au hasard), plus nombreux que les lettres pour qu'une lettre qui
  // apparaît « ailleurs » prenne un emplacement libre. Rend { c, r, cases:[{cx, cy}] } (centres en fractions de la largeur / hauteur).
  function disposition(nb, W, H) {
    var S = nb + Math.max(4, Math.round(nb * 0.35)), best = null, c, r, m;
    for (c = 2; c <= 8; c++) { r = Math.ceil(S / c); m = Math.min(W / c, H / r); if (!best || m > best.m) best = { c: c, r: r, m: m }; }
    var cells = [], x, y;
    for (y = 0; y < best.r; y++) for (x = 0; x < best.c; x++) cells.push({ cx: (x + 0.5) / best.c, cy: (y + 0.5) / best.r });
    return { c: best.c, r: best.r, cases: melanger(cells).slice(0, S) };
  }

  // ---------- Records (un par profil, sur l'appareil) ----------
  function charger() { try { var v = JSON.parse(localStorage.getItem(CLE_RECORDS)); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  function record(profil) { return Number(charger()[profil || 'invite']) || 0; }
  function garderRecord(profil, n) { var r = charger(); r[profil || 'invite'] = n; try { localStorage.setItem(CLE_RECORDS, JSON.stringify(r)); } catch (e) { /* stockage bloqué : sans importance */ } }

  var api = { NB: NB, DELAI: DELAI, DUREE: DUREE, PART: PART, ALPHA: ALPHA, sosies: sosies, nouvelle: nouvelle, disposition: disposition, libelle: libelle, record: record, garderRecord: garderRecord, courant: function () { return actif; } };
  var actif = null; // partie en cours (pour les tests)
  var dernier = { lettre: null, casse: 'maj', style: 'imp' }; // choix gardés pour « Rejouer » (lettre null = au hasard)

  function monter(hote, opts) {
    opts = opts || {};
    // Tests : window.AVENTURA_REPERES = { duree (s), delai (s), compte (s) } raccourcit la partie.
    var cfg = racine.AVENTURA_REPERES || {};
    var duree = cfg.duree > 0 ? cfg.duree : DUREE, delai = cfg.delai > 0 ? cfg.delai : DELAI, compte = cfg.compte >= 0 ? cfg.compte : COMPTE;
    var profil = opts.profil || 'invite', vivant = true, jeu = null, timer = null, depart = null;
    var reduit = racine.matchMedia && racine.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Préparation ----------
    function etiquette(l) { return dernier.casse === 'maj' ? l.toUpperCase() : dernier.casse === 'min' ? l : l.toUpperCase() + l; }
    function texteRecord() { var r = record(profil); return r ? 'Record : <strong>' + r + ' lettre' + (r > 1 ? 's' : '') + '</strong>' : 'Record : <strong>à battre !</strong>'; }
    function prep() {
      var h = '<div class="rep rep-prep"><p class="rep-record">🏅 ' + texteRecord() + '</p><div class="rep-corps"><div class="rep-col-lettres">' +
        '<p class="rep-q" id="rep-q">Quelle lettre cherches-tu ?</p><div class="rep-touches" role="group" aria-labelledby="rep-q">';
      ALPHA.forEach(function (l) { h += '<button type="button" class="rep-touche" data-l="' + l + '" aria-pressed="false"></button>'; });
      h += '<button type="button" class="rep-touche rep-hasard" data-l="?" aria-pressed="false">🎲 Au hasard</button></div></div>' +
        '<div class="rep-col-options"><div class="rep-seg" role="group" aria-label="Majuscule ou minuscule">' +
        '<button type="button" data-casse="maj" aria-pressed="false">A majuscule</button><button type="button" data-casse="min" aria-pressed="false">a minuscule</button><button type="button" data-casse="mix" aria-pressed="false">Aa mélange</button></div>' +
        '<div class="rep-seg" role="group" aria-label="Style d\'écriture"><button type="button" data-style="imp" aria-pressed="false">Imprimerie</button>' +
        '<button type="button" class="rep-cursive" data-style="cur" aria-pressed="false">Cursive</button></div>' +
        '<button type="button" class="btn btn-principal rep-jouer" data-jouer="1">Jouer ! (' + duree + ' s)</button></div></div></div>';
      hote.innerHTML = h;
      majPrep();
      chargerRecord();
    }
    // Le record du profil est lu dans Supabase (si le joueur est connecté, invité compris) ; le plus haut de la base et de l'appareil est gardé.
    function chargerRecord() {
      var C = racine.Compte; if (!C || !C.rpc) return;
      Promise.race([C.rpc('record_reperes', { p_joueur: opts.profil || '' }), new Promise(function (ok) { setTimeout(function () { ok(null); }, DELAI_BASE); })]).then(function (n) {
        if (!vivant || typeof n !== 'number' || n < 0) return;
        if (n > record(profil)) garderRecord(profil, n);
        var el = hote.querySelector('.rep-record'); if (el) el.innerHTML = '🏅 ' + texteRecord();
      }).catch(function () { /* hors connexion : le record de l'appareil suffit */ });
    }
    function majPrep() {
      var d = dernier, police = d.style === 'cur' ? 'rep-police-cur' : 'rep-police-imp';
      Array.prototype.forEach.call(hote.querySelectorAll('.rep-touche'), function (b) {
        var l = b.getAttribute('data-l');
        if (l !== '?') { b.textContent = etiquette(l); b.className = 'rep-touche ' + police; }
        b.setAttribute('aria-pressed', String(l === '?' ? d.lettre === null : d.lettre === l));
      });
      Array.prototype.forEach.call(hote.querySelectorAll('[data-casse]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-casse') === d.casse)); });
      Array.prototype.forEach.call(hote.querySelectorAll('[data-style]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-style') === d.style)); });
    }

    // ---------- Partie ----------
    function fmt(sec) { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }
    function lancer() {
      var base = dernier.lettre === null ? lettreHasard() : dernier.lettre;
      jeu = { base: base, casse: dernier.casse, style: dernier.style, bons: 0, mauvais: 0, apparues: 0, slots: [], fini: false, debut: 0, prochain: 0 };
      actif = jeu;
      var police = jeu.style === 'cur' ? 'rep-police-cur' : 'rep-police-imp';
      hote.innerHTML = '<div class="rep rep-jeu"><div class="rep-hud"><div class="rep-cible"><small>Trouve<br>les</small><span class="rep-lettre-cible ' + police + '">' + esc(libelle(base, jeu.casse)) + '</span></div>' +
        '<div class="rep-temps" role="timer" aria-live="off"><span class="rep-chrono">' + fmt(duree) + '</span><div class="rep-barre" aria-hidden="true"><span></span></div></div>' +
        '<div class="rep-compte"><span class="rep-bons" aria-label="Lettres trouvées">✓ 0</span></div></div>' +
        '<div class="rep-aire ' + (jeu.style === 'cur' ? 'rep-cursive-aire ' : '') + police + '" role="group" aria-label="Lettres à toucher"></div>' +
        '<p class="visually-hidden" role="status" id="rep-statut"></p></div>';
      jeu.aire = hote.querySelector('.rep-aire'); jeu.chrono = hote.querySelector('.rep-chrono'); jeu.barre = hote.querySelector('.rep-barre span'); jeu.bonsEl = hote.querySelector('.rep-bons');
      ajusterHauteur();
      bati();
      var statut = hote.querySelector('#rep-statut'); if (statut) statut.textContent = 'Trouve les ' + libelle(base, jeu.casse) + '.';
      if (compte > 0) { // un court décompte laisse l'enfant regarder la lettre demandée
        var d = document.createElement('div'); d.className = 'rep-depart'; d.textContent = String(compte); jeu.aire.appendChild(d);
        var n = compte;
        depart = setInterval(function () { n--; if (n > 0) { d.textContent = String(n); return; } clearInterval(depart); depart = null; if (d.parentNode) d.parentNode.removeChild(d); commencer(); }, cfg.compteMs > 0 ? cfg.compteMs : 700);
      } else commencer();
    }
    // La zone de jeu prend la place restante de l'écran (au moins 240 px de haut).
    function ajusterHauteur() {
      if (!jeu || !jeu.aire) return;
      var top = jeu.aire.getBoundingClientRect().top, h = Math.max(240, Math.floor(racine.innerHeight - top - 14));
      jeu.aire.style.height = h + 'px';
    }
    function bati() {
      var aire = jeu.aire, W = aire.clientWidth || 300, H = aire.clientHeight || 300, disp = disposition(NB, W, H);
      jeu.c = disp.c; jeu.r = disp.r;
      disp.cases.forEach(function (cl) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'rep-let rep-vide';
        aire.appendChild(b);
        var slot = { el: b, cx: cl.cx, cy: cl.cy, jx: Math.random() - 0.5, jy: Math.random() - 0.5, occ: false, data: null };
        b.addEventListener('click', function () { toucher(slot); });
        jeu.slots.push(slot);
      });
      redim();
    }
    function redim() {
      if (!jeu || !jeu.slots.length) return;
      ajusterHauteur();
      var W = jeu.aire.clientWidth, H = jeu.aire.clientHeight; if (!W || !H) return;
      var cell = Math.min(W / jeu.c, H / jeu.r);
      var L = Math.min(Math.max(44, cell * 0.84 * TAILLE), cell * 0.9); // 70 % de l'emplacement, jamais moins de 44 px (zone de toucher)
      jeu.aire.style.setProperty('--L', L.toFixed(1) + 'px');
      jeu.slots.forEach(function (sl) {
        var ex = Math.max(0, W / jeu.c - L) * 0.8 / W, ey = Math.max(0, H / jeu.r - L) * 0.8 / H; // place libre autour de la lettre
        sl.el.style.setProperty('--x', (sl.cx + sl.jx * ex).toFixed(4)); sl.el.style.setProperty('--y', (sl.cy + sl.jy * ey).toFixed(4));
      });
    }
    function cibles() { return jeu.slots.filter(function (s) { return s.occ && s.data.cible; }).length; }
    // La nouvelle lettre est-elle demandée ? On garde à peu près le même nombre de lettres demandées à l'écran, tant que le plafond
    // de la partie n'est pas atteint.
    function veutCible() {
      var vis = cibles(), voulu = Math.round(NB * PART / 100);
      if (vis < Math.max(2, voulu - 1)) return true;
      if (vis > voulu) return false;
      return Math.random() < PART / 100;
    }
    function poser(slot, cible) {
      slot.data = nouvelle(jeu.base, jeu.casse, cible); slot.occ = true;
      if (cible) jeu.apparues++;
      slot.el.textContent = slot.data.l; slot.el.setAttribute('aria-label', 'Lettre ' + slot.data.l);
      slot.el.className = 'rep-let';
      if (!reduit) { void slot.el.offsetWidth; slot.el.className = 'rep-let rep-entre'; }
    }
    function vides(sauf) { return jeu.slots.filter(function (s) { return !s.occ && s !== sauf; }); }
    function retirer(slot) { slot.occ = false; slot.el.className = 'rep-let rep-vide'; }
    function commencer() {
      if (!vivant || !jeu) return;
      var voulu = Math.round(NB * PART / 100), libres = melanger(jeu.slots.slice()), i;
      for (i = 0; i < NB; i++) poser(libres[i], i < voulu);
      jeu.debut = performance.now(); jeu.prochain = jeu.debut + delai * 1000;
      timer = setInterval(tic, 100);
    }
    function toucher(slot) {
      if (!jeu || jeu.fini || !slot.occ) return;
      var bon = slot.data.cible;
      if (bon) jeu.bons++; else jeu.mauvais++;
      retour(slot, bon);
      retirer(slot);
      // Une nouvelle lettre apparaît ailleurs, jamais à la place de celle qu'on vient de toucher.
      var ou = vides(slot); if (ou.length) poser(tirer(ou), veutCible());
      majHud((duree * 1000 - (performance.now() - jeu.debut)) / 1000);
    }
    // ✓ +1 (vert) ou ✗ (rouge) qui monte au-dessus de la lettre touchée ; le signe s'ajoute à la couleur.
    function retour(slot, bon) {
      var p = document.createElement('div'); p.className = 'rep-fb ' + (bon ? 'rep-fb-bon' : 'rep-fb-mauvais'); p.textContent = bon ? '✓ +1' : '✗';
      p.style.left = (parseFloat(slot.el.style.getPropertyValue('--x')) * 100) + '%'; p.style.top = (parseFloat(slot.el.style.getPropertyValue('--y')) * 100) + '%';
      jeu.aire.appendChild(p); setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 700);
    }
    function majHud(restant) {
      if (!jeu) return;
      jeu.chrono.textContent = fmt(restant); jeu.barre.style.width = Math.max(0, restant / duree * 100) + '%'; jeu.bonsEl.textContent = '✓ ' + jeu.bons;
    }
    // Toutes les 2 secondes : une lettre non demandée disparaît, une autre apparaît ailleurs (parfois une lettre demandée).
    function tic() {
      if (!jeu || jeu.fini) return;
      var now = performance.now(), restant = duree - (now - jeu.debut) / 1000;
      if (now >= jeu.prochain) {
        jeu.prochain += delai * 1000;
        var non = jeu.slots.filter(function (s) { return s.occ && !s.data.cible; });
        if (non.length) { var vieux = tirer(non); retirer(vieux); var ou = vides(vieux); if (ou.length) poser(tirer(ou), veutCible()); }
      }
      majHud(restant);
      if (restant <= 0) finir();
    }
    function finir() {
      if (!jeu || jeu.fini) return;
      jeu.fini = true; clearInterval(timer); timer = null;
      var j = jeu, n = j.bons, m = j.mauvais, avantLocal = record(profil);
      garderRecord(profil, Math.max(avantLocal, n)); // l'appareil garde déjà le record, même si la base ne répond pas
      hote.innerHTML = '<p class="rep-attente" role="status">Calcul de ton score…</p>';
      var C = racine.Compte, envoi;
      if (C && C.rpc) {
        envoi = Promise.race([
          C.rpc('enregistrer_reperes', { p_score: n, p_erreurs: m, p_lettre: j.base, p_casse: j.casse, p_style: j.style, p_joueur: opts.profil || '' }),
          new Promise(function (ok) { setTimeout(function () { ok(null); }, DELAI_BASE); })
        ]).catch(function () { return null; });
      } else envoi = Promise.resolve(null);
      envoi.then(function (r) {
        if (!vivant) return;
        var avant = Math.max(avantLocal, r && typeof r.record_avant === 'number' ? r.record_avant : 0), nouveau = n > avant;
        garderRecord(profil, Math.max(avant, n));
        var ligne = '<strong>' + n + '</strong> lettre' + (n > 1 ? 's' : '') + ' « ' + esc(libelle(j.base, j.casse)) + ' » trouvée' + (n > 1 ? 's' : '') +
          '<br>' + m + ' erreur' + (m > 1 ? 's' : '') + '<br>' + (nouveau ? '<strong>🏅 Nouveau record !</strong>' : 'Ton record : <strong>' + avant + '</strong>');
        jeu = null; actif = null;
        if (opts.fini) opts.fini(true, ligne);
      });
    }

    // ---------- Branchements ----------
    function clic(e) {
      var b;
      if ((b = e.target.closest('[data-l]'))) { dernier.lettre = b.getAttribute('data-l') === '?' ? null : b.getAttribute('data-l'); majPrep(); return; }
      if ((b = e.target.closest('[data-casse]'))) { dernier.casse = b.getAttribute('data-casse'); majPrep(); return; }
      if ((b = e.target.closest('[data-style]'))) { dernier.style = b.getAttribute('data-style'); majPrep(); return; }
      if (e.target.closest('[data-jouer]')) lancer();
    }
    hote.addEventListener('click', clic);
    racine.addEventListener('resize', redim);
    prep();

    return {
      detruire: function () {
        vivant = false; actif = null;
        if (timer) clearInterval(timer);
        if (depart) clearInterval(depart);
        hote.removeEventListener('click', clic); racine.removeEventListener('resize', redim);
      }
    };
  }

  api.monter = monter;
  racine.MJReperes = api;
})(window);
