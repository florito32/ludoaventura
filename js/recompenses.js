// Étoiles, coffres et progression à l'écran (v6.36, demande du 10/11/2026, backlog lignes 164 à 173).
// La logique (niveaux, coffres, sauvegarde sur l'appareil) est dans js/etoiles.js ; ici :
//  - la barre du haut de l'accueil : étoiles + niveau (→ « Mes étoiles »), défi du jour, coffre (→ ouvrir, sinon
//    « Ma progression ») ; les raccourcis « Mes étoiles » et « Progrès » faisaient doublon (retirés en v6.38) ;
//  - la série de jours d'affilée et le méga coffre (v6.38) ;
//  - les écrans « Mes étoiles » et « Ma progression » ;
//  - la fenêtre d'ouverture d'un coffre ;
//  - les étoiles gagnées à la fin d'une partie (appelé par js/plateau.js → montrerFin).
// Dépend de js/etoiles.js ; chargé AVANT js/plateau.js (qui peut rouvrir l'écran de fin dès son chargement),
// il n'utilise window.Aventura (afficher, partie) qu'après coup.
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var E = window.Etoiles;
  function stockage() { try { return window.localStorage; } catch (e) { return null; } }
  var compte = new E.Compte(stockage());
  // Durée du tremblement avant que le coffre s'ouvre (ms). Les tests la mettent à 0 (window.AVENTURA_DUREE_COFFRE).
  var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUREE_COFFRE = typeof window.AVENTURA_DUREE_COFFRE === 'number' ? window.AVENTURA_DUREE_COFFRE : (reduit ? 0 : 700);

  // ---------- Petits outils d'écriture ----------
  function etoiles(n) { return n + ' étoile' + (n > 1 ? 's' : ''); }
  function ico(id, classe) { return '<svg class="ico ' + (classe || '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var NOMS_COFFRES = { jour: 'Coffre du jour', simple: 'Coffre simple', argent: 'Coffre d’argent', or: 'Coffre d’or', mega: 'Méga coffre' };
  function gemmes(n) { return n + ' pierre' + (n > 1 ? 's' : '') + ' précieuse' + (n > 1 ? 's' : ''); }
  function nomCoffre(c) { return NOMS_COFFRES[c.type] + (c.niveau ? ' · niveau ' + c.niveau : c.type === 'mega' ? ' · ' + E.SERIE_MEGA + ' jours d’affilée' : ''); }
  function jours(n) { return n + ' jour' + (n > 1 ? 's' : ''); }
  var JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  function dateDe(j) { var p = j.split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12); }
  // « Aujourd'hui », « Hier », sinon « lun. 3/11 ».
  function quand(j) {
    var auj = compte.aujourdhui();
    if (j === auj) return 'Aujourd’hui';
    var hier = new Date(dateDe(auj).getTime() - 864e5);
    if (j === E.jour(hier)) return 'Hier';
    var d = dateDe(j);
    return JOURS[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
  }
  function jauge(nv, etiquette) {
    var pc = Math.round(100 * nv.dans / nv.besoin);
    return '<div class="jauge jauge-etoiles" role="progressbar" aria-label="' + esc(etiquette) + '" aria-valuemin="0" aria-valuemax="' + nv.besoin +
      '" aria-valuenow="' + nv.dans + '" aria-valuetext="' + nv.dans + ' sur ' + nv.besoin + ' étoiles"><span style="width:' + pc + '%"></span></div>';
  }

  // ---------- Accueil ----------
  function majAccueil() {
    var nv = compte.niveau(), total = compte.etat.total;
    if (window.Defis) {
      var reste = ['solo', 'equipe'].filter(function (t) { return compte.defiDuJour(t) === undefined; }).length;
      $('defi-badge').textContent = reste;
      $('defi-badge').hidden = !reste;
      $('defi-aide').textContent = reste ? ' à faire' : ' : tous réussis';
    }
    $('accueil-total').textContent = total;
    $('accueil-gemmes').textContent = compte.etat.gemmes || 0; // pierres précieuses (v6.46)
    $('accueil-niveau').textContent = 'Niveau ' + nv.niveau;
    $('accueil-jauge').style.width = Math.round(100 * nv.dans / nv.besoin) + '%';
    // Texte lu par les lecteurs d'écran : ajouté au texte visible (pas d'aria-label, qui doit reprendre le texte visible, WCAG 2.5.3).
    $('accueil-etoiles-aide').textContent = ', encore ' + etoiles(nv.reste) + ' pour le niveau ' + (nv.niveau + 1) + ' : voir mes étoiles';
    var aOuvrir = compte.coffresAOuvrir(), b = $('btn-coffre-haut');
    var icone = $('accueil-coffre-ico');
    if (aOuvrir.length) {
      var jour = aOuvrir.filter(function (c) { return c.type === 'jour'; }).length;
      $('accueil-coffre-texte').textContent = aOuvrir.length > 1 ? 'Coffres à ouvrir' : jour ? 'Coffre du jour' : NOMS_COFFRES[aOuvrir[0].type];
      icone.setAttribute('class', 'ico coffre-' + aOuvrir[0].type);
      $('accueil-badge').textContent = aOuvrir.length;
      $('accueil-badge').hidden = false;
      b.classList.add('a-ouvrir');
      $('accueil-coffre-aide').textContent = (aOuvrir.length > 1 ? ' à ouvrir' : ' : à ouvrir') + ', toucher pour l’ouvrir';
    } else {
      var prochain = E.prochainCoffre(nv.niveau);
      $('accueil-coffre-texte').textContent = 'Niveau ' + prochain;
      icone.setAttribute('class', 'ico coffre-' + E.coffreDuNiveau(prochain));
      $('accueil-badge').hidden = true;
      b.classList.remove('a-ouvrir');
      $('accueil-coffre-aide').textContent = ' : prochain coffre (' + NOMS_COFFRES[E.coffreDuNiveau(prochain)].toLowerCase() + '), coffre du jour déjà ouvert. Voir ma progression';
    }
  }

  // ---------- Fenêtre d'ouverture d'un coffre ----------
  var file = [], actuel = null, ouvertDepuis = null;
  function ouvrirCoffres(liste) {
    file = liste.slice();
    ouvertDepuis = document.activeElement;
    montrerCoffre(file.shift());
    if (!$('coffre').open) $('coffre').showModal();
  }
  function montrerCoffre(c) {
    actuel = { coffre: c, ouvert: false };
    $('coffre-titre').textContent = nomCoffre(c);
    $('coffre-grand').setAttribute('class', 'coffre-grand coffre-' + c.type);
    $('coffre-scene').className = 'coffre-scene';
    $('coffre-scene').classList.remove('fini');
    $('coffre-volees').innerHTML = '';
    $('coffre-gain').textContent = c.type === 'jour' ? 'Touche le coffre pour l’ouvrir !'
      : c.type === 'mega' ? 'Bravo, tu es venu ' + E.SERIE_MEGA + ' jours d’affilée ! Touche le coffre pour l’ouvrir.'
      : 'Bravo pour ce niveau ! Touche le coffre pour l’ouvrir.';
    $('btn-coffre-ouvrir').hidden = false;
    $('btn-coffre-suivant').hidden = true;
    $('btn-coffre-fermer').hidden = true;
  }
  function ouvrirActuel() {
    if (!actuel || actuel.ouvert) return;
    actuel.ouvert = true;
    var g = compte.ouvrir(actuel.coffre);
    $('btn-coffre-ouvrir').hidden = true;
    $('coffre-scene').classList.add('tremble');
    setTimeout(function () {
      $('coffre-scene').classList.remove('tremble');
      $('coffre-scene').classList.add('ouvert');
      if (!g) { $('coffre-gain').textContent = 'Ce coffre est déjà ouvert.'; finOuverture(); return; }
      // Les étoiles s'envolent du coffre (décoratif).
      var vol = '';
      // Elles sortent de l'ouverture du coffre en éventail vers le haut (-70° à 70°).
      var nb = Math.min(14, 5 + Math.round(g.n / 12));
      for (var k = 0; k < nb; k++) {
        vol += '<span style="--a:' + (-70 + k * 140 / (nb - 1)).toFixed(0) + 'deg;--d:' + (k % 4) * 70 + 'ms">' + ico('i-etoile') + '</span>';
      }
      $('coffre-volees').innerHTML = vol;
      $('coffre-gain').innerHTML = '<strong>+' + etoiles(g.n) + ' !</strong>' +
        (g.gemmes ? '<span class="gain-gemmes">' + ico('i-gemme') + ' +' + gemmes(g.gemmes) + '</span>' : '') +
        (g.apres > g.avant ? '<span class="gain-niveau">Niveau ' + g.apres + ' atteint !</span>' : '');
      // Le coffre a fait passer un niveau qui donne un coffre : il s'ajoute à la suite.
      g.coffres.forEach(function (L) { file.push({ type: E.coffreDuNiveau(L), niveau: L, cle: String(L) }); });
      finOuverture();
    }, DUREE_COFFRE);
  }
  function finOuverture() {
    $('btn-coffre-suivant').hidden = !file.length;
    $('btn-coffre-fermer').hidden = !!file.length;
    ($('btn-coffre-suivant').hidden ? $('btn-coffre-fermer') : $('btn-coffre-suivant')).focus();
    majTout();
  }
  $('btn-coffre-ouvrir').addEventListener('click', ouvrirActuel);
  $('coffre-scene').addEventListener('click', ouvrirActuel);
  $('btn-coffre-suivant').addEventListener('click', function () { montrerCoffre(file.shift()); $('btn-coffre-ouvrir').focus(); });
  $('btn-coffre-fermer').addEventListener('click', function () { $('coffre').close(); });
  $('coffre').addEventListener('close', function () {
    file = []; actuel = null;
    majTout();
    if (ouvertDepuis && document.contains(ouvertDepuis) && !ouvertDepuis.closest('[hidden]')) ouvertDepuis.focus();
  });

  // ---------- Écran « Mes étoiles » ----------
  function pageEtoiles() {
    var nv = compte.niveau(), e = compte.etat, h = '';
    h += '<section class="carte-page resume-etoiles">' + ico('i-etoile', 'ico-geant') +
      '<p class="gros-total"><strong id="etoiles-total">' + e.total + '</strong> ' + (e.total > 1 ? 'étoiles' : 'étoile') + '</p>' +
      '<p class="total-gemmes">' + ico('i-gemme') + ' <strong id="etoiles-gemmes">' + (e.gemmes || 0) + '</strong> ' + ((e.gemmes || 0) > 1 ? 'pierres précieuses' : 'pierre précieuse') + '</p>' +
      '<p class="niveau-titre">Niveau ' + nv.niveau + '</p>' + jauge(nv, 'Vers le niveau ' + (nv.niveau + 1)) +
      '<p class="petit">Encore <strong>' + etoiles(nv.reste) + '</strong> pour le niveau ' + (nv.niveau + 1) + '</p>' +
      // v6.42 : l'explication s'ouvre dans une fenêtre au lieu d'allonger la page.
      '<button type="button" class="btn-comment" id="btn-comment-gagner" aria-haspopup="dialog" aria-controls="comment-gagner"><span class="rond" aria-hidden="true">?</span> Comment gagner des étoiles ?</button></section>';

    // Coffres de niveau : 4 paliers (v6.46 : un coffre simple à chaque niveau, un gros tous les 5).
    // Départ : le premier coffre atteint mais pas ouvert, sinon le dernier coffre ouvert, sinon le niveau suivant.
    function aCoffre(n) { var t = E.coffreDuNiveau(n); return !!t && !(t === 'simple' && n <= e.simplesDepuis); }
    var enAttente = compte.coffresAOuvrir().filter(function (c) { return c.niveau; });
    var L = nv.niveau + 1;
    if (enAttente.length) L = enAttente[0].niveau;
    else for (var a = nv.niveau; a >= 2; a--) if (aCoffre(a) && e.coffresNiveau[a] !== undefined) { L = a; break; }
    var paliers = [];
    for (; paliers.length < 4; L++) if (aCoffre(L)) paliers.push(L);
    var gros = E.prochainGrosCoffre(nv.niveau);
    h += '<section class="carte-page"><h3>Coffres de niveau</h3><ol class="chemin-coffres">';
    paliers.forEach(function (L) {
      var type = E.coffreDuNiveau(L), etat;
      if (e.coffresNiveau[L] !== undefined) etat = '<span class="etat fait">Ouvert · +' + e.coffresNiveau[L] + ' ⭐</span>';
      else if (L <= nv.niveau) etat = '<button type="button" class="btn-petit" data-ouvrir="' + type + ':' + L + '">Ouvrir</button>';
      else etat = '<span class="etat">Dans ' + etoiles(E.seuil(L) - e.total) + '</span>';
      h += '<li class="' + (L <= nv.niveau ? 'atteint' : '') + '">' + ico('i-coffre', 'coffre-' + type) +
        '<span class="palier"><strong>Niveau ' + L + '</strong><span>' + NOMS_COFFRES[type] + '</span></span>' + etat + '</li>';
    });
    if (paliers.indexOf(gros) < 0) {
      h += '</ol><p class="prochain">' + ico('i-coffre', 'coffre-' + E.coffreDuNiveau(gros)) + '<span>Prochain gros coffre : <strong>' +
        NOMS_COFFRES[E.coffreDuNiveau(gros)].toLowerCase() + '</strong> au niveau ' + gros + ', encore ' + etoiles(E.seuil(gros) - e.total) + '.</span></p><ol hidden>';
    }
    h += '</ol></section>';

    $('etoiles-corps').innerHTML = h;
  }

  // ---------- Écran « Ma progression » (la journée) ----------
  function pageProgression() {
    var e = compte.etat, auj = compte.aujourdhui(), aujN = e.parJour[auj] || 0, h = '';
    var coffreJour = compte.coffreDuJourOuvert();
    var defisActifs = !!window.Defis;
    var taches = [{
      ico: ico('i-coffre', 'coffre-jour'), nom: 'Coffre du jour',
      fait: coffreJour !== undefined, gain: coffreJour,
      action: '<button type="button" class="btn-petit" data-ouvrir="jour:' + auj + '">Ouvrir</button>'
    }];
    if (defisActifs) {
      ['solo', 'equipe'].forEach(function (t) {
        var g = compte.defiDuJour(t);
        taches.push({ ico: ico('i-defi'), nom: t === 'solo' ? 'Défi solo' : 'Défi en équipe', fait: g !== undefined, gain: g,
          action: '<button type="button" class="btn-petit" data-defi="' + t + '">Jouer</button>' });
      });
    }
    var faits = taches.filter(function (t) { return t.fait; }).length;
    h += '<section class="carte-page"><h3>Aujourd’hui</h3>' +
      '<p class="gros-total">' + ico('i-etoile') + ' <strong id="progression-jour">+' + aujN + '</strong> ' + (aujN > 1 ? 'étoiles gagnées' : 'étoile gagnée') + '</p>' +
      '<p class="petit">' + faits + ' sur ' + taches.length + ' terminé' + (faits > 1 ? 's' : '') + '</p><ul class="taches-jour">';
    taches.forEach(function (t) {
      h += '<li class="' + (t.fait ? 'fait' : '') + '">' + t.ico + '<span class="t-nom">' + t.nom + '</span>' +
        (t.fait ? '<span class="etat fait"><span aria-hidden="true">✔</span> +' + t.gain + ' ⭐</span>' : t.action) + '</li>';
    });
    h += '</ul></section>';

    // Série de jours d'affilée vers le méga coffre (v6.38 ; remplace les 7 derniers jours, retirés à la demande de l'utilisateur).
    var vm = compte.versMega(), megas = compte.coffresAOuvrir().filter(function (c) { return c.type === 'mega'; });
    var cycle = vm.dans === 0 && vm.serie > 0 && compte.etat.coffresMega[auj] !== undefined ? vm.besoin : vm.dans;
    h += '<section class="carte-page"><h3>Méga coffre</h3><p class="serie-mega">' + ico('i-coffre', 'coffre-mega') + '<span>' +
      (vm.serie ? 'Tu es venu <strong id="serie-jours">' + jours(vm.serie) + '</strong> d’affilée.' : 'Viens jouer plusieurs jours de suite !') + ' ' +
      (cycle === vm.besoin ? 'Méga coffre gagné aujourd’hui !' : 'Encore <strong>' + jours(vm.besoin - cycle) + '</strong> pour le méga coffre (100 à 200 étoiles).') +
      '</span></p><ol class="serie-cases" aria-label="' + cycle + ' jour' + (cycle > 1 ? 's' : '') + ' sur ' + vm.besoin + '">';
    for (var s5 = 1; s5 <= vm.besoin; s5++) {
      h += '<li class="' + (s5 <= cycle ? 'fait' : '') + (s5 === vm.besoin ? ' mega' : '') + '">' +
        (s5 === vm.besoin ? ico('i-coffre', 'coffre-mega') : '<span aria-hidden="true">' + (s5 <= cycle ? '✔' : s5) + '</span>') + '</li>';
    }
    h += '</ol>';
    if (megas.length) {
      h += '<ul class="taches-jour">';
      megas.forEach(function (c) {
        h += '<li>' + ico('i-coffre', 'coffre-mega') + '<span class="t-nom">Méga coffre</span>' +
          '<button type="button" class="btn-petit" data-ouvrir="mega:' + c.cle + '">Ouvrir</button></li>';
      });
      h += '</ul>';
    }
    h += '<p class="petit">Un jour sans venir et la série repart de zéro.</p></section>';

    // v6.44 : l'encadré « Coffres de niveau » est retiré (il est déjà dans « Mes étoiles », bouton de l'étoile).
    $('progression-corps').innerHTML = h;
  }

  // Boutons « Ouvrir » des écrans (coffre précis) et « Jouer » (défi).
  function surClicPage(ev) {
    var b = ev.target.closest('[data-ouvrir]');
    if (b) {
      var x = b.dataset.ouvrir.split(':');
      var c = compte.coffresAOuvrir().filter(function (k) { return k.type === x[0] && k.cle === x[1]; })[0];
      if (c) ouvrirCoffres([c]);
      return;
    }
    var d = ev.target.closest('[data-defi]');
    if (d && window.Defis) window.Defis.ouvrir(d.dataset.defi);
  }
  $('etoiles-corps').addEventListener('click', surClicPage);
  // « Comment gagner des étoiles ? » (v6.42) : fenêtre ouverte à la demande.
  $('etoiles-corps').addEventListener('click', function (ev) {
    if (ev.target.closest('#btn-comment-gagner')) $('comment-gagner').showModal();
  });
  $('btn-comment-ok').addEventListener('click', function () { $('comment-gagner').close(); });
  $('comment-gagner').addEventListener('click', function (ev) { if (ev.target === $('comment-gagner')) $('comment-gagner').close(); }); // toucher le fond ferme
  $('progression-corps').addEventListener('click', surClicPage);

  // ---------- Écran « Défi du jour » (v6.37) ----------
  // Le joueur choisit : solo ou en équipe, la matière, le niveau (et le nombre de joueurs en équipe) ;
  // js/defis.js tire tout le reste d'après la date. Les derniers choix sont gardés sur l'appareil.
  var D = window.Defis;
  var CLE_CHOIX = 'ludoaventura-defi-choix';
  var choixDefi = { type: 'solo', matiere: null, niveau: 'facile', joueurs: 2 };
  try { var cd = JSON.parse(localStorage.getItem(CLE_CHOIX) || 'null'); if (cd) for (var kc in choixDefi) if (cd[kc] !== undefined) choixDefi[kc] = cd[kc]; } catch (e) { /* */ }
  function garderChoix() { try { localStorage.setItem(CLE_CHOIX, JSON.stringify(choixDefi)); } catch (e) { /* */ } }
  function typesDisponibles() {
    return window.Questions.TYPES.map(function (t) { return t.id; });
  }
  function radios(nom, legende, liste, valeur) {
    return '<fieldset class="defi-choix"><legend>' + legende + '</legend><div class="packs">' + liste.map(function (o) {
      return '<label class="pack"><input type="radio" name="' + nom + '" value="' + o[0] + '"' + (String(valeur) === String(o[0]) ? ' checked' : '') + '><span>' + o[1] + '</span></label>';
    }).join('') + '</div></fieldset>';
  }
  // v6.40 (demande du 10/11/2026) : plus d'aperçu de l'aventure. Le joueur choisit la matière et le niveau
  // (et le nombre de joueurs en équipe), touche « Valider » et découvre l'aventure sur le plateau.
  function pageDefi() {
    var h = '<section class="carte-page"><fieldset class="defi-types"><legend class="visually-hidden">Quel défi ?</legend>';
    ['solo', 'equipe'].forEach(function (t) {
      var g = compte.defiDuJour(t);
      h += '<label class="defi-type"><input type="radio" name="defi-type" value="' + t + '"' + (choixDefi.type === t ? ' checked' : '') + '>' +
        '<span>' + ico('i-defi') + '<strong>' + (t === 'solo' ? 'Défi solo' : 'Défi en équipe') + '</strong>' +
        '<small class="' + (g !== undefined ? 'fait' : '') + '">' + (g !== undefined ? '✔ Réussi · +' + g + ' ⭐' : 'À faire') + '</small></span></label>';
    });
    h += '</fieldset>';
    h += radios('defi-matiere', 'Matière', [['maths', 'Maths'], ['francais', 'Français']], choixDefi.matiere);
    h += radios('defi-niveau', 'Niveau', D.NIVEAUX.map(function (n) { return [n.id, n.nom]; }), choixDefi.niveau);
    if (choixDefi.type === 'equipe') h += radios('defi-joueurs', 'Joueurs', [[2, '2'], [3, '3'], [4, '4']], choixDefi.joueurs);
    var g = compte.defiDuJour(choixDefi.type);
    h += '<div class="defi-valider" aria-live="polite">' +
      (g !== undefined ? '<p class="defi-recompense fait">✔ Défi déjà réussi aujourd’hui (+' + g + ' ⭐). Tu peux rejouer : étoiles normales.</p>'
        : '<p class="defi-recompense">' + ico('i-etoile') + '<span>L’aventure reste une surprise. Gagne-la : tes étoiles sont <strong>doublées</strong> !</span></p>') +
      (choixDefi.matiere ? '' : '<p class="petit" id="defi-manque">Choisis la matière pour valider.</p>') +
      '<button type="button" class="btn btn-principal" id="btn-lancer-defi"' + (choixDefi.matiere ? '' : ' disabled aria-describedby="defi-manque"') + '>Valider</button>' +
      '</div></section>';
    $('defi-corps').innerHTML = h;
  }
  if (D) {
    $('defi-corps').addEventListener('change', function (e) {
      var n = e.target.name;
      if (n === 'defi-type') choixDefi.type = e.target.value;
      if (n === 'defi-matiere') choixDefi.matiere = e.target.value;
      if (n === 'defi-niveau') choixDefi.niveau = e.target.value;
      if (n === 'defi-joueurs') choixDefi.joueurs = Number(e.target.value);
      garderChoix();
      pageDefi();
      var el = $('defi-corps').querySelector('input[name="' + n + '"][value="' + e.target.value + '"]');
      if (el) el.focus({ preventScroll: true });
    });
    $('defi-corps').addEventListener('click', function (e) {
      // Le défi n'est tiré qu'au moment de valider (même tirage pour tous le même jour, js/defis.js).
      if (e.target.closest('#btn-lancer-defi') && choixDefi.matiere) {
        window.Aventura.lancerDefi(D.generer(compte.aujourdhui(), choixDefi, { typesDisponibles: typesDisponibles() }));
      }
    });
    D.ouvrir = function (type) { if (type) { choixDefi.type = type; garderChoix(); } aller('ecran-defi'); };
  }

  // ---------- Navigation ----------
  function aller(id) { window.Aventura.afficher(id); }
  $('btn-etoiles-haut').addEventListener('click', function () { aller('ecran-etoiles'); });
  $('btn-coffre-haut').addEventListener('click', function () {
    var l = compte.coffresAOuvrir();
    if (l.length) ouvrirCoffres(l); else aller('ecran-progression');
  });
  document.querySelectorAll('[data-retour-accueil]').forEach(function (b) {
    b.addEventListener('click', function () { aller('ecran-accueil'); });
  });
  // Le bouton « Défi du jour » n'apparaît que lorsque les défis existent (js/defis.js).
  $('btn-defi').hidden = !window.Defis;
  $('btn-defi').addEventListener('click', function () { aller('ecran-defi'); });

  // Écran affiché (js/plateau.js → afficher) : on remplit l'écran des étoiles ou de la progression.
  function majTout() {
    majAccueil();
    var ecran = window.Aventura && window.Aventura.partie.ecran;
    if (ecran === 'ecran-etoiles') pageEtoiles();
    if (ecran === 'ecran-progression') pageProgression();
    if (ecran === 'ecran-defi' && window.Defis) pageDefi();
  }
  document.addEventListener('aventura-ecran', majTout);
  // Retour sur l'application (autre jour, autre onglet) : coffre du jour et compteurs à jour.
  // On note aussi la venue du jour (série de jours d'affilée → méga coffre).
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { compte.etat = compte.lire(); compte.visite(); majTout(); } });
  window.addEventListener('storage', function (ev) { if (ev.key === E.CLE) { compte.etat = compte.lire(); majTout(); } });

  // ---------- Fin de partie ----------
  // Appelé par js/plateau.js à l'affichage du résultat. info = { regles, aventure, gagnee, defi }.
  // La partie ne rapporte qu'une fois (identifiant regles.id) ; après un rechargement, on réaffiche le même résultat.
  function finDePartie(info) {
    var r = info.regles, av = info.aventure, box = $('fin-etoiles');
    if (!r.id) r.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    var texte = (info.defi ? (info.defi === 'solo' ? 'Défi solo' : 'Défi en équipe') + ' réussi · ' : 'Aventure réussie · ') + av.nom;
    var res = compte.recompenserPartie(r.id, r.points, info.gagnee, info.defi, texte);
    if (res) r.recompense = { base: res.base, bonus: res.bonus, deja: !!res.defiDejaFait, avant: res.gain ? res.gain.avant : 0, apres: res.gain ? res.gain.apres : 0, gemmes: res.gemmes || 0 };
    var rc = r.recompense || { base: 0, bonus: 0 };
    var h = '';
    if (info.gagnee) {
      h += '<p class="fin-gain">' + ico('i-etoile', 'ico-gain') + '<strong>+' + etoiles(rc.base + rc.bonus) + '</strong></p>';
      if (rc.bonus) h += '<p class="fin-bonus">' + ico('i-defi') + ' Défi du jour réussi : étoiles doublées !</p>';
      else if (rc.deja) h += '<p class="petit">Défi déjà réussi aujourd’hui : étoiles normales.</p>';
      else h += '<p class="petit">Une étoile pour chaque ' + av.objet.un + ' (' + av.objet.titre.toLowerCase() + ' : ' + r.points + ').</p>';
      if (rc.gemmes) h += '<p class="fin-gemmes">' + ico('i-gemme') + ' <strong>+' + gemmes(rc.gemmes) + ' !</strong></p>';
      if (rc.apres > rc.avant) h += '<p class="fin-niveau">Niveau ' + rc.apres + ' atteint !</p>';
    } else {
      h += '<p class="petit">' + (info.defi ? 'Défi manqué : tu peux réessayer autant de fois que tu veux !' : 'Gagne l’aventure pour gagner des étoiles.') + '</p>';
    }
    var aOuvrir = compte.coffresAOuvrir().filter(function (c) { return c.type !== 'jour'; });
    if (aOuvrir.length) h += '<button type="button" class="btn btn-secondaire btn-fin-coffre" id="btn-fin-coffre">' + ico('i-coffre', 'coffre-' + aOuvrir[0].type) + ' Ouvrir ' + (aOuvrir.length > 1 ? 'les coffres' : 'le ' + NOMS_COFFRES[aOuvrir[0].type].toLowerCase()) + '</button>';
    box.innerHTML = h;
    box.hidden = false;
    var bc = $('btn-fin-coffre');
    if (bc) bc.addEventListener('click', function () { ouvrirCoffres(compte.coffresAOuvrir().filter(function (c) { return c.type !== 'jour'; })); });
    majAccueil();
  }

  compte.visite(); // venue du jour (série de jours d'affilée, méga coffre)
  majAccueil();
  window.Recompenses = { compte: compte, finDePartie: finDePartie, majTout: majTout, ouvrirCoffres: ouvrirCoffres };
})();
