// Mini-jeu « Aventure des multiplications » (v10.44, demande du 24/11/2026) : jeu de plateforme 2D repris du dépôt
// florito32/minijeux (multiplication/aventure), dessiné avec la charte d'Aventura (décor de jour, contours bruns,
// caisses parchemin). Le personnage court et saute ; on casse les caisses en les frappant par en dessous. Un tiers des caisses
// porte une multiplication égale au « nombre à trouver ». Le drapeau s'ouvre quand toutes les bonnes caisses sont cassées.
// Partie gagnée (drapeau) ou perdue (0 cœur) : le mode Mini-jeux (js/minijeux.js) donne les étoiles d'Aventura.
(function () {
  'use strict';

  /* ---------- Réglages ---------- */
  var W = 400, H = 240;            // taille logique de l'écran de jeu (mise à l'échelle ensuite)
  var GROUND = 200;                // hauteur du sol
  var GRAVITY = 1500, JUMP_V = 540, RUN_MAX = 170;
  var ACCEL_GROUND = 1400, ACCEL_AIR = 900, FRICTION = 1600;
  var COEURS = 3, BOX_W = 52, BOX_H = 30, NB_CAISSES = 12; // 12 caisses → 4 bonnes (1 sur 3)
  var CLE_TABLES = 'ludoaventura-mj-aventure-tables-v1';
  var WORLD_W = 2600;
  var GROUNDS = [[0, 900], [980, 1720], [1800, 2600]];        // deux trous à sauter
  var BLOCKS = [{ x: 560, y: 160, w: 100, h: 40 }, { x: 1300, y: 160, w: 110, h: 40 }, { x: 2060, y: 160, w: 100, h: 40 }]; // marches
  var SLOTS = [   // emplacements des caisses : « base » = surface sur laquelle se tient le joueur en dessous
    { x: 200, base: GROUND }, { x: 340, base: GROUND }, { x: 584, base: 160 }, { x: 770, base: GROUND },
    { x: 1060, base: GROUND }, { x: 1180, base: GROUND }, { x: 1329, base: 160 }, { x: 1510, base: GROUND },
    { x: 1640, base: GROUND }, { x: 1900, base: GROUND }, { x: 2084, base: 160 }, { x: 2270, base: GROUND }
  ];
  var FLAG_X = 2480;
  // Charte Aventura (css/site.css) : encre brune pour les contours, parchemin, rouge / jaune / bleu, vert prairie.
  var ENC = '#3b2a1e', PARCHEMIN = '#f6eedb', LW = 2.25;
  var POLICE = '"Rockwell", "Roboto Slab", Georgia, serif';

  function charger() {
    try { var s = JSON.parse(localStorage.getItem(CLE_TABLES)); if (Array.isArray(s)) return s.filter(function (n) { return n >= 1 && n <= 10; }); } catch (e) { /* stockage bloqué */ }
    return [];
  }
  function garder(t) { try { localStorage.setItem(CLE_TABLES, JSON.stringify(t)); } catch (e) { /* sans importance */ } }
  function melanger(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // Toutes les multiplications possibles avec les tables choisies (table de 7 : 7×1…7×10 et 1×7…10×7).
  function paires(tbls) {
    var l = [];
    for (var a = 1; a <= 10; a++) for (var b = 1; b <= 10; b++) if (tbls.indexOf(a) >= 0 || tbls.indexOf(b) >= 0) l.push([a, b]);
    return l;
  }
  // Nouveau nombre à trouver : on préfère ceux qui s'obtiennent de plusieurs façons (caisses plus variées).
  function choisirCible(tbls, avant) {
    var nb = {};
    paires(tbls).forEach(function (pr) { var p = pr[0] * pr[1]; nb[p] = (nb[p] || 0) + 1; });
    var tous = Object.keys(nb).map(Number);
    var varies = tous.filter(function (p) { return nb[p] >= 2 && p !== avant; });
    var pool = varies.length ? varies : tous.filter(function (p) { return p !== avant; });
    if (!pool.length) pool = tous;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  // Exactement 1 caisse sur 3 donne le nombre cible.
  function fabriquerCaisses(but, nombre, tbls) {
    var nBonnes = Math.round(nombre / 3), nFausses = nombre - nBonnes, bonnes = [], proches = [], loin = [];
    paires(tbls).forEach(function (pr) {
      var p = pr[0] * pr[1];
      if (p === but) bonnes.push(pr); else if (Math.abs(p - but) <= 15) proches.push(pr); else loin.push(pr);
    });
    melanger(bonnes); melanger(proches); melanger(loin);
    var tirage = [], i;
    for (i = 0; i < nBonnes; i++) tirage.push({ paire: bonnes[i % bonnes.length], correct: true });
    var fausses = proches.concat(loin);
    for (i = 0; i < nFausses; i++) tirage.push({ paire: fausses[i % fausses.length], correct: false });
    melanger(tirage);
    return SLOTS.slice(0, nombre).map(function (s, k) {
      return { a: tirage[k].paire[0], b: tirage[k].paire[1], correct: tirage[k].correct, broken: false, x: s.x, y: s.base - 30 - 24 - BOX_H, w: BOX_W, h: BOX_H };
    });
  }

  // hote : l'élément qui reçoit le jeu ; opts.fini(gagne, ligneHtml) est appelé une seule fois, à la fin d'une partie.
  function monter(hote, opts) {
    var h = '<section class="mj-jeu mj-aventure">' +
      '<div data-ecran="choix">' +
        '<h3>Choisis tes tables</h3>' +
        '<p class="mj-regle">Cours et saute, puis casse par en dessous les caisses dont la multiplication donne le nombre à trouver. Quand tu les as toutes, rejoins le drapeau. Tu as 3 cœurs : une mauvaise caisse ou une chute en coûte un.</p>' +
        '<div class="mj-puces" role="group" aria-label="Tables de multiplication">';
    for (var n = 1; n <= 10; n++) h += '<button type="button" class="mj-puce" data-table="' + n + '" aria-pressed="false">' + n + '</button>';
    h += '</div><button type="button" class="mj-lien" data-toutes>Toutes</button>' +
        '<p class="petit" data-aide role="status"></p>' +
        '<button type="button" class="btn btn-principal" data-jouer disabled>Jouer</button>' +
      '</div>' +
      '<div data-ecran="jeu" hidden>' +
        '<div class="mj-hud"><p class="mj-coeurs" data-coeurs></p><p>Caisses : <strong data-trouvees>0</strong> / <strong data-a-trouver>4</strong></p></div>' +
        '<canvas class="mj-canvas" data-canvas width="400" height="240" tabindex="0" role="img" ' +
          'aria-label="Le niveau : un petit personnage court et saute sous des caisses marquées d’une multiplication.">Ce jeu a besoin d’un navigateur récent.</canvas>' +
        '<p class="mj-cible">Nombre à trouver : <strong data-cible>?</strong></p>' +
        '<div class="mj-manette">' +
          '<div class="mj-manette-dir"><button type="button" class="btn btn-secondaire" data-pad="left" aria-label="Aller à gauche">◀</button>' +
          '<button type="button" class="btn btn-secondaire" data-pad="right" aria-label="Aller à droite">▶</button></div>' +
          '<button type="button" class="btn btn-principal" data-pad="jump">Sauter</button></div>' +
        '<p class="petit mj-clavier">Clavier : ← → pour courir, Espace ou ↑ pour sauter.</p>' +
        '<p class="visually-hidden" data-live aria-live="polite"></p>' +
        '<button type="button" class="mj-lien" data-arreter>Arrêter la partie</button>' +
      '</div></section>';
    hote.innerHTML = h;

    function $(s) { return hote.querySelector(s); }
    var ecrans = { choix: $('[data-ecran="choix"]'), jeu: $('[data-ecran="jeu"]') };
    var canvas = $('[data-canvas]'), ctx = canvas.getContext('2d');
    var puces = Array.prototype.slice.call(hote.querySelectorAll('[data-table]'));
    var btnJouer = $('[data-jouer]'), btnToutes = $('[data-toutes]'), aide = $('[data-aide]');

    /* ---------- État ---------- */
    var tables = charger(), statut = 'choix';   // choix | playing | won | lost
    var caisses = [], joueur, camX = 0, coeurs = COEURS, trouvees = 0, aTrouver = 0, cible = 0;
    var particules = [], flottants = [], astuce = 0, dernierSur = { x: 60, y: GROUND - 30 };
    var entree = { left: false, right: false, jump: false }, tampon = 0, coyote = 0;
    var actif = true, raf = 0, dernier = 0, attente = [], fini = false, observateur = null;

    function annoncer(t) { $('[data-live]').textContent = t; }
    function apres(fn, ms) { var t = setTimeout(fn, ms); attente.push(t); }
    function majHud() {
      var s = ''; for (var i = 0; i < COEURS; i++) s += '<span' + (i >= coeurs ? ' class="perdu"' : '') + '>♥</span>';
      var c = $('[data-coeurs]'); c.innerHTML = s; c.setAttribute('aria-label', 'Vies : ' + coeurs + ' sur ' + COEURS);
      $('[data-trouvees]').textContent = trouvees; $('[data-a-trouver]').textContent = aTrouver;
    }
    function nouveauNiveau() {
      // Sans table choisie (aperçu derrière l'écran de choix), on prépare un niveau avec toutes les tables.
      var tbls = tables.length ? tables : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      cible = choisirCible(tbls, cible);
      caisses = fabriquerCaisses(cible, NB_CAISSES, tbls);
      aTrouver = caisses.filter(function (b) { return b.correct; }).length;
      trouvees = 0; coeurs = COEURS;
      joueur = { x: 60, y: GROUND - 30, w: 20, h: 30, vx: 0, vy: 0, onGround: true, face: 1, anim: 0, hurt: 0 };
      dernierSur = { x: 60, y: GROUND - 30 };
      camX = 0; particules = []; flottants = [];
      $('[data-cible]').textContent = cible;
      majHud();
    }

    /* ---------- Choix des tables ---------- */
    function majPuces() {
      puces.forEach(function (p) { p.setAttribute('aria-pressed', tables.indexOf(+p.dataset.table) >= 0 ? 'true' : 'false'); });
      btnJouer.disabled = !tables.length;
      btnToutes.textContent = tables.length === 10 ? 'Aucune' : 'Toutes';
      aide.textContent = tables.length ? '' : 'Touche une ou plusieurs tables pour jouer.';
    }
    puces.forEach(function (p) {
      p.addEventListener('click', function () {
        var k = +p.dataset.table, i = tables.indexOf(k);
        if (tables.length === 10) tables = [k]; else if (i >= 0) tables.splice(i, 1); else tables.push(k);
        tables.sort(function (a, b) { return a - b; });
        garder(tables); majPuces();
      });
    });
    btnToutes.addEventListener('click', function () { tables = tables.length === 10 ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; garder(tables); majPuces(); });

    function montrer(nom) { Object.keys(ecrans).forEach(function (k) { ecrans[k].hidden = k !== nom; }); }
    function redimensionner() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
    }

    function jouer() {
      if (!tables.length) return;
      fini = false; nouveauNiveau(); statut = 'playing';
      montrer('jeu'); redimensionner(); canvas.focus({ preventScroll: true });
      annoncer('Casse les caisses qui font ' + cible + '.');
    }
    function terminer(gagne) {
      statut = gagne ? 'won' : 'lost';
      entree.left = entree.right = entree.jump = false;
      annoncer(gagne ? 'Niveau réussi !' : 'Plus de cœurs.');
      apres(function () {
        if (fini) return; fini = true;
        opts.fini(gagne, gagne ? 'Tu as trouvé les ' + aTrouver + ' caisses qui font ' + cible + '.' : 'Il te manquait ' + (aTrouver - trouvees) + (aTrouver - trouvees > 1 ? ' caisses' : ' caisse') + ' à trouver.');
      }, 900);
    }
    function perdreCoeur() { coeurs--; joueur.hurt = 1; majHud(); if (coeurs <= 0) terminer(false); }

    /* ---------- Physique et collisions ---------- */
    function solides() {
      var l = GROUNDS.map(function (g) { return { x: g[0], y: GROUND, w: g[1] - g[0], h: 200 }; }).concat(BLOCKS);
      caisses.forEach(function (b) { if (!b.broken) l.push({ x: b.x, y: b.y, w: b.w, h: b.h, box: b }); });
      return l;
    }
    function chevauche(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
    function frapper(b) {
      b.broken = true;
      var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      for (var i = 0; i < 10; i++) particules.push({ x: cx, y: cy, vx: (Math.random() - .5) * 260, vy: -Math.random() * 300 - 60, vie: 0.9, couleur: b.correct ? '#ffe600' : '#d8c7a0', t: 3 + Math.random() * 4 });
      var calc = b.a + ' × ' + b.b + ' = ' + (b.a * b.b);
      if (b.correct) {
        trouvees++; flottants.push({ x: cx, y: b.y, texte: '✓ ' + calc, couleur: '#1f7a3a', t: 1.4 });
        annoncer('Bravo ! ' + calc + '. Caisses trouvées : ' + trouvees + ' sur ' + aTrouver + '.'); majHud();
      } else {
        flottants.push({ x: cx, y: b.y, texte: '✗ ' + calc, couleur: '#a8161b', t: 1.4 });
        annoncer('Raté : ' + calc + ', pas ' + cible + '. Tu perds un cœur.'); perdreCoeur();
      }
    }

    function pas(dt) {
      var p = joueur, dir = (entree.right ? 1 : 0) - (entree.left ? 1 : 0), acc = p.onGround ? ACCEL_GROUND : ACCEL_AIR;
      if (dir) { p.vx += dir * acc * dt; p.vx = Math.max(-RUN_MAX, Math.min(RUN_MAX, p.vx)); p.face = dir; }
      else if (p.onGround) { var f = FRICTION * dt; p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f; }
      // Saut : petite tolérance avant / après le sol pour que le saut « réponde » toujours.
      coyote = p.onGround ? 0.08 : Math.max(0, coyote - dt);
      tampon = Math.max(0, tampon - dt);
      if (tampon > 0 && coyote > 0) { p.vy = -JUMP_V; tampon = 0; coyote = 0; p.onGround = false; }
      if (!entree.jump && p.vy < -220) p.vy = -220;  // relâcher tôt = saut plus court
      p.vy = Math.min(p.vy + GRAVITY * dt, 900);

      var liste = solides();
      p.x += p.vx * dt; p.x = Math.max(0, Math.min(WORLD_W - p.w, p.x));
      liste.forEach(function (s) { if (!chevauche(p, s)) return; if (p.vx > 0) p.x = s.x - p.w; else if (p.vx < 0) p.x = s.x + s.w; p.vx = 0; });
      p.y += p.vy * dt; p.onGround = false;
      var tetes = [];
      liste.forEach(function (s) {
        if (!chevauche(p, s)) return;
        if (p.vy > 0) { p.y = s.y - p.h; p.vy = 0; p.onGround = true; }
        else if (p.vy < 0) { if (s.box) tetes.push(s); else { p.y = s.y + s.h; p.vy = 0; } }
      });
      if (tetes.length) {
        // On casse la caisse la plus au-dessus de la tête (plus grand recouvrement).
        tetes.sort(function (a, b) { return (Math.min(p.x + p.w, b.x + b.w) - Math.max(p.x, b.x)) - (Math.min(p.x + p.w, a.x + a.w) - Math.max(p.x, a.x)); });
        p.y = tetes[0].y + tetes[0].h; p.vy = 60;
        frapper(tetes[0].box);
        if (statut !== 'playing') return;
      }
      if (p.onGround) dernierSur = { x: p.x, y: p.y };
      p.anim += Math.abs(p.vx) * dt; p.hurt = Math.max(0, p.hurt - dt);
      // Chute dans un trou : un cœur en moins, retour au dernier endroit sûr.
      if (p.y > H + 40) {
        annoncer('Tu es tombé ! Tu perds un cœur.'); perdreCoeur();
        p.x = Math.max(0, dernierSur.x - 40 * p.face); p.y = dernierSur.y - 40; p.vx = 0; p.vy = 0;
        if (statut !== 'playing') return;
      }
      // Drapeau : il ne s'ouvre que si toutes les bonnes caisses sont cassées.
      if (p.x + p.w >= FLAG_X) {
        if (trouvees >= aTrouver) { terminer(true); return; }
        astuce -= dt;
        if (astuce <= 0) {
          var reste = aTrouver - trouvees, msg = 'Encore ' + reste + (reste > 1 ? ' caisses' : ' caisse') + ' à trouver !';
          flottants.push({ x: FLAG_X, y: GROUND - 140, texte: msg, couleur: '#1c3473', t: 2 }); annoncer(msg); astuce = 2.5;
        }
      } else astuce = 0;
      camX = Math.max(0, Math.min(WORLD_W - W, p.x - W * 0.4));
    }
    function effets(dt) {
      particules.forEach(function (q) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += GRAVITY * dt; q.vie -= dt; });
      particules = particules.filter(function (q) { return q.vie > 0; });
      flottants.forEach(function (f) { f.t -= dt; f.y -= 22 * dt; });
      flottants = flottants.filter(function (f) { return f.t > 0; });
    }

    /* ---------- Dessin ---------- */
    function rect(x, y, w, hh, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r);
      ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function trait(lw) { ctx.lineWidth = lw || LW; ctx.strokeStyle = ENC; ctx.lineJoin = 'round'; ctx.stroke(); }
    function fond() {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#8fc8ea'); g.addColorStop(GROUND / H, '#e6f4fb'); g.addColorStop(1, '#e6f4fb');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffe600'; ctx.beginPath(); ctx.arc(335, 46, 20, 0, 7); ctx.fill(); trait();
      ctx.fillStyle = '#ffffff';
      for (var i = 0; i < 8; i++) {
        var x = ((i * 330 - camX * 0.3) % 1200 + 1200) % 1200 - 100, y = 30 + (i % 3) * 22;
        [[0, 0, 26, 10], [18, -6, 18, 10], [-16, -2, 14, 8]].forEach(function (e) { ctx.beginPath(); ctx.ellipse(x + e[0], y + e[1], e[2], e[3], 0, 0, Math.PI * 2); ctx.fill(); });
      }
      // Collines : deux plans qui défilent à des vitesses différentes (parallaxe).
      [['#3f7a46', 0.12, 50, 70], ['#2f9e5b', 0.25, 34, 55]].forEach(function (c) {
        ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(0, GROUND);
        for (var px = 0; px <= W; px += 6) ctx.lineTo(px, GROUND + 6 - c[2] - 18 * Math.sin((px + camX * c[1]) / c[3]));
        ctx.lineTo(W, GROUND); ctx.closePath(); ctx.fill(); trait(1.6);
      });
    }
    function monde() {
      GROUNDS.forEach(function (gr) {
        var x = gr[0], w = gr[1] - gr[0];
        ctx.fillStyle = '#9b6233'; ctx.fillRect(x, GROUND, w, H - GROUND);
        ctx.fillStyle = '#7d4d27';
        for (var dx = x + 10; dx < x + w - 6; dx += 26) ctx.fillRect(dx, GROUND + 22 + (dx % 3) * 5, 5, 4);
        ctx.fillStyle = '#2f9e5b'; ctx.fillRect(x, GROUND, w, 11);
        ctx.beginPath(); ctx.moveTo(x, GROUND); ctx.lineTo(x + w, GROUND); trait();
        ctx.beginPath(); ctx.moveTo(x, GROUND + 11); ctx.lineTo(x + w, GROUND + 11); trait(1.4);
      });
      BLOCKS.forEach(function (b) {   // marches en briques
        ctx.fillStyle = '#c4572f'; ctx.fillRect(b.x, b.y, b.w, b.h);
        for (var row = 0; row < b.h / 10; row++) {
          ctx.beginPath(); ctx.moveTo(b.x, b.y + row * 10); ctx.lineTo(b.x + b.w, b.y + row * 10);
          for (var cx = b.x + (row % 2 ? 10 : 0); cx < b.x + b.w; cx += 20) { ctx.moveTo(cx, b.y + row * 10); ctx.lineTo(cx, b.y + row * 10 + 10); }
          trait(1.3);
        }
        ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); trait();
      });
      // Drapeau : gris tant que toutes les bonnes caisses ne sont pas cassées
      var ouvert = trouvees >= aTrouver;
      ctx.fillStyle = ENC; ctx.fillRect(FLAG_X, GROUND - 120, 5, 120);
      ctx.fillStyle = '#ffe600'; ctx.beginPath(); ctx.arc(FLAG_X + 2.5, GROUND - 122, 6, 0, 7); ctx.fill(); trait(1.6);
      ctx.fillStyle = ouvert ? '#2f9e5b' : '#c9c2b0';
      ctx.beginPath(); ctx.moveTo(FLAG_X + 5, GROUND - 116); ctx.lineTo(FLAG_X + 45, GROUND - 104); ctx.lineTo(FLAG_X + 5, GROUND - 92); ctx.closePath(); ctx.fill(); trait(1.8);
      ctx.fillStyle = ouvert ? '#ffffff' : ENC; ctx.font = '800 12px ' + POLICE; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(ouvert ? '✓' : (aTrouver - trouvees), FLAG_X + 18, GROUND - 100);
    }
    function dessinerCaisse(b) {
      ctx.fillStyle = PARCHEMIN; rect(b.x, b.y, b.w, b.h, 5); ctx.fill(); trait();
      var txt = b.a + '×' + b.b, taille = 15;
      ctx.fillStyle = ENC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      do { ctx.font = '800 ' + taille + 'px ' + POLICE; taille--; } while (ctx.measureText(txt).width > b.w - 10 && taille > 8);
      ctx.fillText(txt, b.x + b.w / 2, b.y + b.h / 2 + 1); ctx.textBaseline = 'alphabetic';
    }
    // Le personnage : petit aventurier à chapeau rouge, vêtement vert, contours bruns.
    function dessinerJoueur() {
      var p = joueur;
      if (p.hurt > 0 && Math.floor(p.hurt * 12) % 2) return;   // clignote quand il est touché
      var cx = p.x + p.w / 2, f = p.face, jambe = p.onGround && Math.abs(p.vx) > 5 ? Math.sin(p.anim / 6) * 3 : 0;
      ctx.fillStyle = '#1d2433'; ctx.fillRect(cx - 7 + jambe, p.y + p.h - 6, 6, 6); ctx.fillRect(cx + 1 - jambe, p.y + p.h - 6, 6, 6);
      ctx.fillStyle = '#2f9e5b'; rect(p.x - 1, p.y + 10, p.w + 2, p.h - 15, 6); ctx.fill(); trait(1.8);
      ctx.fillStyle = '#f1c9a0'; ctx.beginPath(); ctx.arc(cx, p.y + 7, 8, 0, 7); ctx.fill(); trait(1.8);
      ctx.fillStyle = '#e3262a'; ctx.beginPath(); ctx.ellipse(cx, p.y + 2, 10, 5, 0, Math.PI, 0); ctx.fill(); trait(1.6);
      ctx.fillStyle = ENC; ctx.fillRect(cx + f * 3 - 1, p.y + 6, 2, 3);
    }
    function dessiner() {
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      fond(); ctx.save(); ctx.translate(-Math.round(camX), 0);
      monde(); caisses.forEach(function (b) { if (!b.broken) dessinerCaisse(b); });
      particules.forEach(function (q) { ctx.fillStyle = q.couleur; ctx.fillRect(q.x, q.y, q.t, q.t); });
      dessinerJoueur();
      ctx.textAlign = 'center'; ctx.font = '800 13px ' + POLICE; ctx.lineWidth = 3; ctx.lineJoin = 'round';
      flottants.forEach(function (f) { ctx.globalAlpha = Math.min(1, f.t * 2); ctx.strokeStyle = '#ffffff'; ctx.strokeText(f.texte, f.x, f.y); ctx.fillStyle = f.couleur; ctx.fillText(f.texte, f.x, f.y); });
      ctx.globalAlpha = 1; ctx.restore();
    }

    /* ---------- Boucle de jeu ---------- */
    function image(t) {
      if (!actif) return;
      var dt = Math.min(0.05, (t - dernier) / 1000 || 0); dernier = t;
      if (statut === 'playing') { var k = Math.ceil(dt / (1 / 120)); for (var i = 0; i < k && statut === 'playing'; i++) pas(dt / k); }
      if (statut !== 'choix') { effets(dt); dessiner(); }
      raf = requestAnimationFrame(image);
    }

    /* ---------- Commandes ---------- */
    var TOUCHES = { ArrowLeft: 'left', KeyA: 'left', KeyQ: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', Space: 'jump', KeyW: 'jump', KeyZ: 'jump' };
    function appuyer(action, bas) { if (action === 'jump' && bas && !entree.jump) tampon = 0.12; entree[action] = bas; }
    function surBas(e) { var a = TOUCHES[e.code]; if (!a || statut !== 'playing') return; e.preventDefault(); if (!e.repeat) appuyer(a, true); }
    function surHaut(e) { var a = TOUCHES[e.code]; if (a) appuyer(a, false); }
    function surFlou() { entree.left = entree.right = entree.jump = false; }
    window.addEventListener('keydown', surBas); window.addEventListener('keyup', surHaut); window.addEventListener('blur', surFlou);
    Array.prototype.forEach.call(hote.querySelectorAll('[data-pad]'), function (btn) {
      var action = btn.getAttribute('data-pad');
      function bas(e) { e.preventDefault(); if (btn.setPointerCapture) btn.setPointerCapture(e.pointerId); appuyer(action, true); btn.classList.add('appuye'); }
      function haut() { appuyer(action, false); btn.classList.remove('appuye'); }
      btn.addEventListener('pointerdown', bas); btn.addEventListener('pointerup', haut);
      btn.addEventListener('pointercancel', haut); btn.addEventListener('lostpointercapture', haut);
      btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    });
    btnJouer.addEventListener('click', jouer);
    $('[data-arreter]').addEventListener('click', function () {
      statut = 'choix'; entree.left = entree.right = entree.jump = false; attente.forEach(clearTimeout); attente = [];
      montrer('choix'); majPuces(); btnJouer.focus({ preventScroll: true });
    });
    if ('ResizeObserver' in window) { observateur = new ResizeObserver(redimensionner); observateur.observe(canvas); }
    window.addEventListener('resize', redimensionner);

    majPuces(); montrer('choix');
    nouveauNiveau(); $('[data-cible]').textContent = '?'; // le nombre est révélé au lancement de la partie
    raf = requestAnimationFrame(image);

    // Accès pour les tests automatiques.
    window.__mjAventure = {
      etat: function () {
        return { statut: statut, cible: cible, tables: tables.slice(), coeurs: coeurs, trouvees: trouvees, aTrouver: aTrouver,
          joueur: { x: joueur.x, y: joueur.y, onGround: joueur.onGround },
          caisses: caisses.map(function (b) { return { a: b.a, b: b.b, correct: b.correct, broken: b.broken }; }) };
      },
      placerSous: function (i) { var b = caisses[i]; joueur.x = b.x + b.w / 2 - joueur.w / 2; joueur.y = b.y + b.h + 2; joueur.vx = 0; joueur.vy = 0; },
      placerAuDrapeau: function () { joueur.x = FLAG_X - 40; joueur.y = GROUND - 30; joueur.vx = 0; joueur.vy = 0; }
    };
    return {
      detruire: function () {
        actif = false; fini = true; cancelAnimationFrame(raf); attente.forEach(clearTimeout); attente = [];
        window.removeEventListener('keydown', surBas); window.removeEventListener('keyup', surHaut);
        window.removeEventListener('blur', surFlou); window.removeEventListener('resize', redimensionner);
        if (observateur) observateur.disconnect();
        if (window.__mjAventure) delete window.__mjAventure;
      }
    };
  }

  window.MJAventure = { monter: monter };
})();
