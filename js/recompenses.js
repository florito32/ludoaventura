// Étoiles, coffres et progression à l'écran (v6.36, demande du 10/11/2026, backlog lignes 164 à 173).
// v10.30 (demande du 23/11/2026, backlog lignes 447, 453, 454) : étoiles, pierres, niveaux et coffres sont propres à chaque
// joueur du compte (js/etoiles.js → pourJoueur). L'accueil ne montre plus aucun nombre : tout se voit dans la carte du
// joueur (Mon compte), qui ouvre « Mes coffres » (v10.36) et ses coffres. « Joueur affiché » = celui de la carte.
// La logique (niveaux, coffres, sauvegarde sur l'appareil) est dans js/etoiles.js ; ici :
//  - la barre du haut de l'accueil : étoiles + niveau (→ « Mes étoiles »), défi du jour, coffre (→ ouvrir, sinon
//    « Ma progression ») ; les raccourcis « Mes étoiles » et « Progrès » faisaient doublon (retirés en v6.38) ;
//  - la série de jours d'affilée et le méga coffre (v6.38) ;
//  - l'écran « Mes coffres » (v10.36 : ancien « Mes étoiles » + « Ma progression ») ;
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
  var J = window.Joueurs;
  // ---------- Joueur affiché (v10.30) ----------
  // Le joueur dont on montre les étoiles et les coffres : choisi sur sa carte (Mon compte), gardé dans l'onglet ; sinon le 1er.
  var CLE_VU = 'ludoaventura-joueur-vu';
  function joueurs() { return J ? J.lister(compte.etat) : []; }
  function idVu() {
    var l = joueurs(), id = null;
    try { id = sessionStorage.getItem(CLE_VU); } catch (e) { id = null; }
    if (!l.some(function (j) { return j.id === id; })) id = l[0] ? l[0].id : null;
    return id;
  }
  function choisirVu(id) { try { sessionStorage.setItem(CLE_VU, id); } catch (e) { /* onglet sans stockage : le 1er joueur */ } }
  // Compte du joueur affiché (à redemander à chaque fois : la progression est relue après une synchronisation).
  function vue() { var id = idVu(); return (id && compte.pourJoueur(id)) || compte; }
  function nomDe(id) { var j = J && J.trouver(compte.etat, id); return j ? j.nom : ''; }
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
  // v10.30 (ligne 453) : rien de chiffré sur l'accueil (ni étoiles, ni pierres, ni coffres, ni défis restants).
  // Il ne reste que le bouton « Défi du jour » ; son texte pour les lecteurs d'écran ne donne plus de nombre.
  function majAccueil() {
    var badge = $('defi-badge');
    if (badge) badge.hidden = true;
  }

  // ---------- Fenêtre d'ouverture d'un coffre ----------
  var file = [], actuel = null, ouvertDepuis = null, ouvertPour = null;
  function ouvrirCoffres(liste) {
    ouvertPour = idVu();
    if (vol) finirGain(); // un envol en cours est terminé d'un coup avant d'ouvrir
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
    var pour = joueurs().length > 1 && ouvertPour ? 'Coffre de ' + nomDe(ouvertPour) + '. ' : ''; // v10.30 : le coffre d'un joueur
    $('coffre-gain').textContent = pour + (c.type === 'jour' ? 'Touche le coffre pour l’ouvrir !'
      : c.type === 'mega' ? 'Bravo, tu es venu ' + E.SERIE_MEGA + ' jours d’affilée ! Touche le coffre pour l’ouvrir.'
      : 'Bravo pour ce niveau ! Touche le coffre pour l’ouvrir.');
    $('btn-coffre-ouvrir').hidden = false;
    $('btn-coffre-suivant').hidden = true;
    $('btn-coffre-fermer').hidden = true;
  }
  function ouvrirActuel() {
    if (!actuel || actuel.ouvert) return;
    actuel.ouvert = true;
    var v = vue();
    var g = v.ouvrir(actuel.coffre);
    // v10.30 : plus d'envol vers l'accueil après un coffre (l'accueil ne montre plus de compteur) ; les étoiles
    // sortent du coffre dans la fenêtre. Ouvrir un coffre compte comme une venue du joueur (série de jours).
    if (g) v.visite();
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
    demarrerGain(); // v10.3 : sur l'accueil, les étoiles de tous les coffres ouverts s'envolent vers le compteur
    if (ouvertDepuis && document.contains(ouvertDepuis) && !ouvertDepuis.closest('[hidden]')) ouvertDepuis.focus();
    else if (ouvertPour) { // la carte du joueur a été redessinée : on revient sur son bouton « Mes coffres »
      var b = document.querySelector('.joueur-carte[data-id="' + ouvertPour + '"] [data-act="voir-coffres"]');
      if (b) b.focus();
    }
  });

  // En-tête de l'écran « Mes coffres » (v10.30, v10.36) : le joueur dont on parle.
  function enTeteJoueur() {
    var id = idVu(), j = J && J.trouver(compte.etat, id), p = j && window.Aventuriers && window.Aventuriers.trouver(j.perso);
    if (!j) return '';
    return '<p class="tresor-de">' + (p ? '<img src="' + p.image + '" alt="" width="40" height="40">' : '') + '<span>Joueur : <strong id="tresor-nom">' + esc(j.nom) + '</strong></span></p>';
  }

  // ---------- Écran « Mes coffres » (v10.36) : étoiles et niveau, coffres des prochains niveaux, coffre du jour, défis, méga coffre ----------
  function pageCoffres() {
    var v = vue(), nv = v.niveau(), e = v.etat, h = '';
    h += enTeteJoueur();
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
    var enAttente = v.coffresAOuvrir().filter(function (c) { return c.niveau; });
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
    // v10.36 : la journée (coffre du jour, défis) et le méga coffre sont sur la même page (ancien écran « Ma progression »).
    var auj = v.aujourdhui(), aujN = e.parJour[auj] || 0;
    var coffreJour = v.coffreDuJourOuvert();
    var defisActifs = !!window.Defis;
    var taches = [{
      ico: ico('i-coffre', 'coffre-jour'), nom: 'Coffre du jour',
      fait: coffreJour !== undefined, gain: coffreJour,
      action: '<button type="button" class="btn-petit" data-ouvrir="jour:' + auj + '">Ouvrir</button>'
    }];
    if (defisActifs) {
      ['solo', 'equipe'].forEach(function (t) {
        var g = v.defiDuJour(t);
        taches.push({ ico: ico('i-defi'), nom: t === 'solo' ? 'Défi solo' : 'Défi en équipe', fait: g !== undefined, gain: g,
          quitte: g === undefined && v.defiQuitte(t),
          action: '<button type="button" class="btn-petit" data-defi="' + t + '">Jouer</button>' });
      });
    }
    var faits = taches.filter(function (t) { return t.fait; }).length;
    h += '<section class="carte-page"><h3>Aujourd’hui</h3>' +
      '<p class="gros-total">' + ico('i-etoile') + ' <strong id="progression-jour">+' + aujN + '</strong> ' + (aujN > 1 ? 'étoiles gagnées' : 'étoile gagnée') + '</p>' +
      '<p class="petit">' + faits + ' sur ' + taches.length + ' terminé' + (faits > 1 ? 's' : '') + '</p><ul class="taches-jour">';
    taches.forEach(function (t) {
      h += '<li class="' + (t.fait ? 'fait' : '') + '">' + t.ico + '<span class="t-nom">' + t.nom + '</span>' +
        (t.fait ? '<span class="etat fait"><span aria-hidden="true">✔</span> +' + t.gain + ' ⭐</span>' : t.quitte ? '<span class="etat quitte">Quitté</span>' : t.action) + '</li>';
    });
    h += '</ul></section>';

    // Série de jours d'affilée vers le méga coffre (v6.38 ; remplace les 7 derniers jours, retirés à la demande de l'utilisateur).
    var vm = v.versMega(), megas = v.coffresAOuvrir().filter(function (c) { return c.type === 'mega'; });
    var cycle = vm.dans === 0 && vm.serie > 0 && e.coffresMega[auj] !== undefined ? vm.besoin : vm.dans;
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
    h += '<p class="petit">Un jour sans jouer et la série repart de zéro.</p></section>';

    $('coffres-corps').innerHTML = h;
  }

  // Boutons « Ouvrir » de l'écran (coffre précis) et « Jouer » (défi).
  function surClicPage(ev) {
    var b = ev.target.closest('[data-ouvrir]');
    if (b) {
      var x = b.dataset.ouvrir.split(':');
      var c = vue().coffresAOuvrir().filter(function (k) { return k.type === x[0] && k.cle === x[1]; })[0];
      if (c) ouvrirCoffres([c]);
      return;
    }
    var d = ev.target.closest('[data-defi]');
    if (d && window.Defis) window.Defis.ouvrir(d.dataset.defi);
  }
  $('coffres-corps').addEventListener('click', surClicPage);
  // « Comment gagner des étoiles ? » (v6.42) : fenêtre ouverte à la demande (ici, et par le « ? » de la carte du joueur).
  function ouvrirCommentGagner() { if (!$('comment-gagner').open) $('comment-gagner').showModal(); }
  $('coffres-corps').addEventListener('click', function (ev) {
    if (ev.target.closest('#btn-comment-gagner')) ouvrirCommentGagner();
  });
  $('btn-comment-ok').addEventListener('click', function () { $('comment-gagner').close(); });
  $('comment-gagner').addEventListener('click', function (ev) { if (ev.target === $('comment-gagner')) $('comment-gagner').close(); }); // toucher le fond ferme

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
    // v10.30 : défis réussis ou quittés propres à chaque joueur. Avec un seul joueur dans le compte, on montre les siens ;
    // à plusieurs, on ne sait pas encore qui jouera (« Qui joue ? » après « Valider ») : pas d'état.
    var seul = joueurs().length <= 1, v = seul ? vue() : null;
    var statut = function (t) { return seul ? v.defiDuJour(t) : undefined; };
    var quitte = function (t) { return seul && v.defiQuitte(t); };
    var h = '<section class="carte-page"><fieldset class="defi-types"><legend class="visually-hidden">Quel défi ?</legend>';
    ['solo', 'equipe'].forEach(function (t) {
      var g = statut(t);
      h += '<label class="defi-type"><input type="radio" name="defi-type" value="' + t + '"' + (choixDefi.type === t ? ' checked' : '') + '>' +
        '<span>' + ico('i-defi') + '<strong>' + (t === 'solo' ? 'Défi solo' : 'Défi en équipe') + '</strong>' +
        '<small class="' + (g !== undefined ? 'fait' : quitte(t) ? 'quitte' : '') + '">' + (g !== undefined ? '✔ Réussi · +' + g + ' ⭐' : quitte(t) ? 'Quitté aujourd’hui' : seul ? 'À faire' : 'Une fois par jour et par joueur') + '</small></span></label>';
    });
    h += '</fieldset>';
    h += radios('defi-matiere', 'Matière', [['maths', 'Maths'], ['francais', 'Français']], choixDefi.matiere);
    h += radios('defi-niveau', 'Niveau', D.NIVEAUX.map(function (n) { return [n.id, n.nom]; }), choixDefi.niveau);
    if (choixDefi.type === 'equipe') h += radios('defi-joueurs', 'Joueurs', [[2, '2'], [3, '3'], [4, '4']], choixDefi.joueurs);
    var g = statut(choixDefi.type);
    h += '<div class="defi-valider" aria-live="polite">' +
      (g === undefined && quitte(choixDefi.type) ? '<p class="defi-recompense quitte">Tu as quitté ce défi avant la fin aujourd’hui : tu peux y rejouer, mais il ne rapporte plus rien jusqu’à demain.</p>'
        : g !== undefined ? '<p class="defi-recompense fait">✔ Défi déjà réussi aujourd’hui (+' + g + ' ⭐). Tu peux rejouer : étoiles normales.</p>'
        : '<p class="defi-recompense">' + ico('i-etoile') + '<span>L’aventure reste une surprise. Gagne-la : tes étoiles sont <strong>doublées</strong> !' + (seul ? '' : ' (une fois par jour pour chaque joueur)') + '</span></p>') +
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
  // v10.30 : plus de boutons des étoiles ni du coffre sur l'accueil (ligne 453) ; on y va depuis la carte du joueur.
  document.querySelectorAll('[data-retour-accueil]').forEach(function (b) {
    b.addEventListener('click', function () { aller('ecran-accueil'); });
  });
  // « Mes coffres » revient à « Mon compte », d'où on l'ouvre (v10.30).
  document.querySelectorAll('[data-retour-compte]').forEach(function (b) {
    b.addEventListener('click', function () { aller('ecran-compte'); });
  });
  // Le bouton « Défi du jour » n'apparaît que lorsque les défis existent (js/defis.js).
  $('btn-defi').hidden = !window.Defis;
  $('btn-defi').addEventListener('click', function () { aller('ecran-defi'); });

  // Écran affiché (js/plateau.js → afficher) : on remplit l'écran des étoiles ou de la progression.
  function majTout() {
    majAccueil();
    var ecran = window.Aventura && window.Aventura.partie.ecran;
    if (ecran === 'ecran-coffres') pageCoffres();
    if (ecran === 'ecran-defi' && window.Defis) pageDefi();
    if (ecran === 'ecran-compte' && window.JoueursEcran && !$('coffre').open) window.JoueursEcran.rendre(); // trésor des cartes
  }
  document.addEventListener('aventura-ecran', majTout);
  // Retour sur l'application (autre jour, autre onglet) : coffre du jour et compteurs à jour.
  // On note aussi la venue du jour (série de jours d'affilée → méga coffre).
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { compte.etat = compte.lire(); compte.visite(); majTout(); } });
  window.addEventListener('storage', function (ev) { if (ev.key === E.CLE) { compte.etat = compte.lire(); majTout(); } });

  // ---------- Fin de partie ----------
  // Appelé par js/plateau.js à l'affichage du résultat. info = { regles, aventure, gagnee, defi, joueurs }.
  // joueurs (v10.30) : [{ profil, nom, unites }] : chacun reçoit les étoiles qu'il a récoltées (ligne 454), doublées pour un
  // défi du jour pas encore réussi par lui aujourd'hui. Sans profil connu (partie d'avant la v10.29) : le 1er joueur du compte.
  // La partie ne rapporte qu'une fois (identifiant regles.id) ; après un rechargement, on réaffiche le même résultat.
  // Total des étoiles d'une récompense (pour l'envol de l'accueil, js/plateau.js → accueilApresFin).
  function gainTotal(rc) {
    if (!rc) return 0;
    if (!rc.joueurs) return rc.quitte ? 0 : (rc.base || 0) + (rc.bonus || 0); // récompense d'avant la v10.30
    return rc.joueurs.reduce(function (t, x) { return t + (x.quitte ? 0 : (x.base || 0) + (x.bonus || 0)); }, 0);
  }
  function finDePartie(info) {
    var r = info.regles, av = info.aventure, box = $('fin-etoiles');
    if (!r.id) r.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    var texte = (info.defi ? (info.defi === 'solo' ? 'Défi solo' : 'Défi en équipe') + ' réussi · ' : 'Aventure réussie · ') + av.nom;
    var premier = joueurs()[0], gains = (info.joueurs && info.joueurs.length ? info.joueurs : [{ profil: null, unites: r.points }]).map(function (g) {
      return { joueur: g.profil && J && J.trouver(compte.etat, g.profil) ? g.profil : premier && premier.id, unites: g.unites };
    }).filter(function (g) { return g.joueur; });
    var res = compte.recompenserJoueurs(r.id, gains, info.gagnee, info.defi, texte);
    if (res) {
      r.recompense = { joueurs: res.map(function (x) {
        return { id: x.joueur, nom: nomDe(x.joueur), base: x.base, bonus: x.bonus, deja: !!x.defiDejaFait, avant: x.gain ? x.gain.avant : 0, apres: x.gain ? x.gain.apres : 0, gemmes: x.gemmes || 0, quitte: !!x.quitte };
      }) };
    }
    var rc = r.recompense || { joueurs: [] };
    if (!rc.joueurs) rc = { joueurs: [{ id: premier && premier.id, nom: '', base: rc.base || 0, bonus: rc.bonus || 0, deja: !!rc.deja, avant: rc.avant || 0, apres: rc.apres || 0, gemmes: rc.gemmes || 0, quitte: !!rc.quitte }] };
    var L = rc.joueurs, seul = L.length < 2, h = '';
    var tousQuitte = L.length > 0 && L.every(function (x) { return x.quitte; });
    if (tousQuitte) {
      // Défi quitté plus tôt aujourd'hui (v6.47) : pas de récompense, même gagné.
      h += '<p class="fin-quitte">' + (seul ? 'Tu as quitté ce défi avant la fin aujourd’hui : pas d’étoiles ni de pierres pour lui avant demain.' : 'Vous avez quitté ce défi avant la fin aujourd’hui : pas d’étoiles ni de pierres pour lui avant demain.') + '</p>';
    } else if (info.gagnee && seul) {
      var x = L[0] || { base: 0, bonus: 0 };
      h += '<p class="fin-gain">' + ico('i-etoile', 'ico-gain') + '<strong>+' + etoiles(x.base + x.bonus) + '</strong></p>';
      if (x.bonus) h += '<p class="fin-bonus">' + ico('i-defi') + ' Défi du jour réussi : étoiles doublées !</p>';
      else if (x.deja) h += '<p class="petit">Défi déjà réussi aujourd’hui : étoiles normales.</p>';
      else h += '<p class="petit">Une étoile pour chaque ' + av.objet.un + ' (' + av.objet.titre.toLowerCase() + ' : ' + r.points + ').</p>';
      if (x.gemmes) h += '<p class="fin-gemmes">' + ico('i-gemme') + ' <strong>+' + gemmes(x.gemmes) + ' !</strong></p>';
      if (x.apres > x.avant) h += '<p class="fin-niveau">Niveau ' + x.apres + ' atteint !</p>';
    } else if (info.gagnee) {
      // À plusieurs (v10.30) : une ligne par joueur, avec ce qu'il a lui-même récolté.
      h += '<p class="fin-gain">' + ico('i-etoile', 'ico-gain') + '<strong>+' + etoiles(gainTotal(rc)) + '</strong></p>' +
        '<p class="petit">Chacun reçoit les étoiles de ce qu’il a lui-même récolté.</p>';
      if (L.some(function (y) { return y.bonus; })) h += '<p class="fin-bonus">' + ico('i-defi') + ' Défi du jour réussi : étoiles doublées !</p>';
      h += '<ul class="fin-gains-joueurs">' + L.map(function (y) {
        return '<li><span class="fg-nom">' + esc(y.nom) + '</span>' +
          (y.quitte ? '<span class="petit">défi quitté : rien</span>' : '<span class="fg-etoiles">' + ico('i-etoile') + ' +' + (y.base + y.bonus) + '</span>' +
            (y.gemmes ? '<span class="fg-gemmes">' + ico('i-gemme') + ' +' + y.gemmes + '</span>' : '') +
            (y.apres > y.avant ? '<span class="fg-niveau">Niveau ' + y.apres + ' !</span>' : '') +
            (y.deja && !y.bonus ? '<span class="petit">défi déjà réussi</span>' : '')) + '</li>';
      }).join('') + '</ul>';
    } else {
      h += '<p class="petit">' + (info.defi ? 'Défi manqué : ' + (seul ? 'tu peux' : 'vous pouvez') + ' réessayer autant de fois que ' + (seul ? 'tu veux' : 'vous voulez') + ' !' : 'Gagne' + (seul ? '' : 'z') + ' l’aventure pour gagner des étoiles.') + '</p>';
    }
    // Coffres de niveau ou méga coffres à ouvrir : ils s'ouvrent hors de la partie, dans la carte du joueur (v10.30).
    var avecCoffre = L.filter(function (y) { var v = y.id && compte.pourJoueur(y.id); return v && v.coffresAOuvrir().some(function (c) { return c.type !== 'jour'; }); });
    if (avecCoffre.length) {
      h += '<p class="fin-coffre-note">' + ico('i-coffre', 'coffre-simple') + '<span>' + (seul ? 'Un coffre t’attend' : 'Un coffre attend ' + avecCoffre.map(function (y) { return esc(y.nom); }).join(', ')) + ' dans <strong>Mon compte</strong>.</span></p>';
    }
    box.innerHTML = h;
    box.hidden = false;
    majAccueil();
  }

  // ---------- Envol des étoiles gagnées vers le compteur de l'accueil (v9.8, demande du 17/11/2026) ----------
  // v10.30 : l'accueil n'a plus de compteur ; les étoiles volent vers le bouton « Mon compte » (hypothèse à valider).
  // Après « Retour à l'accueil » sur l'écran de fin (js/plateau.js → accueilApresFin), « ⭐ +19 étoiles » reste au
  // centre de l'écran (sans encadré) ; de là, une étoile par étoile gagnée vole jusqu'au compteur du haut, qui
  // grandit à chaque arrivée. Durée : 1 seconde pour 10 étoiles, 3 secondes au plus (choix de l'utilisateur).
  // Mouvement réduit demandé par l'appareil : pas d'étoiles volantes, le nombre grandit pendant la même durée.
  var vol = null; // envol en cours : { n, vu, arrivees, minuteurs, etiquette }
  var retenu = 0; // étoiles déjà gagnées (déjà dans le compte) qui attendent d'être envolées vers le compteur de l'accueil
  var CLE_GAIN = 'ludoaventura-gain-accueil';
  var DUREE_GAIN_MAX = 3000; // ms
  // v10.3 : ce qui attend est gardé dans l'onglet (sessionStorage) : js/plateau.js y ajoute le gain d'une partie avant de
  // recharger l'accueil, et un coffre ouvert ailleurs que sur l'accueil (fin de partie, « Mes coffres ») attend d'y arriver.
  function retenir(n) {
    retenu = n > 0 ? n : 0;
    try { if (retenu) sessionStorage.setItem(CLE_GAIN, JSON.stringify({ n: retenu })); else sessionStorage.removeItem(CLE_GAIN); } catch (e) { /* rien */ }
  }
  // Lance l'envol si des étoiles attendent et que l'accueil est affiché (sinon elles attendent : voir l'écouteur plus bas).
  function demarrerGain() {
    if (vol || !retenu) return;
    if (!window.Aventura || (window.Aventura.partie.ecran || 'ecran-accueil') !== 'ecran-accueil') return; // écran vide = accueil (comme js/plateau.js)
    var n = Math.floor(retenu);
    if (n < 1 || n > compte.etat.total) { retenir(0); majAccueil(); return; }
    retenir(0);
    vol = { n: n, arrivees: 0, minuteurs: [], etiquette: null };
    majAccueil();
    // Petite pause : l'accueil (ou la fenêtre qui se ferme) doit être affiché et mis en page.
    vol.minuteurs.push(setTimeout(animerGain, 250));
  }
  (function () {
    var g = null;
    try { g = JSON.parse(sessionStorage.getItem(CLE_GAIN) || 'null'); } catch (e) { g = null; }
    var n = g && Math.floor(Number(g.n));
    if (!n || n < 1 || n > compte.etat.total) { retenir(0); return; }
    retenu = n;
    // js/plateau.js est chargé après ce fichier : on attend la fin du chargement.
    if (document.readyState === 'complete') demarrerGain(); else window.addEventListener('load', demarrerGain, { once: true });
  })();

  function finirGain() {
    if (!vol) return;
    vol.minuteurs.forEach(clearTimeout);
    document.querySelectorAll('.etoile-volante').forEach(function (x) { x.remove(); });
    var et = vol.etiquette;
    vol = null;
    majAccueil();
    if (et) { et.classList.add('part'); setTimeout(function () { et.remove(); }, reduit ? 0 : 500); }
  }
  function animerGain() {
    if (!vol) return;
    // v10.30 : plus de compteur sur l'accueil (ligne 453) : les étoiles filent vers le bouton du compte, où on les retrouve
    // dans la carte de chaque joueur.
    var accueil = $('ecran-accueil'), cible = document.querySelector('#btn-compte .ico');
    if (!accueil || accueil.hidden || !cible) { finirGain(); return; }
    var n = vol.n;
    // « ⭐ +19 étoiles » au centre de l'écran, comme sur l'écran de fin, sans l'encadré.
    var et = document.createElement('p');
    et.className = 'gain-accueil';
    et.setAttribute('role', 'status');
    et.innerHTML = ico('i-etoile', 'ico-gain') + '<strong>+' + etoiles(n) + '</strong>';
    document.body.appendChild(et);
    vol.etiquette = et;
    // 1 s pour 10 étoiles, 3 s au plus (demande du 17/11/2026, 13 h 34 : 20 s pour 200 étoiles, c'était trop long).
    var D = Math.min(DUREE_GAIN_MAX, typeof window.AVENTURA_DUREE_GAIN === 'number' ? window.AVENTURA_DUREE_GAIN * n : n * 100);
    // Au plus une étoile volante toutes les 100 ms (30 en 3 s) : au-delà, chacune apporte plusieurs étoiles au compteur.
    var nv = Math.max(1, Math.min(n, Math.round(D / 100)));
    var vole = reduit ? 0 : Math.min(700, D * 0.6); // durée du vol d'une étoile
    var ecart = nv > 1 ? (D - vole) / (nv - 1) : 0; // la dernière étoile arrive au bout de D
    var a = et.querySelector('.ico').getBoundingClientRect(), b = cible.getBoundingClientRect();
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    var total = $('btn-compte');
    // Étoile volante k : elle apporte sa part des n étoiles (1 en général, plusieurs pour un gros gain).
    function arrivee() {
      if (!vol) return;
      vol.arrivees++;
      total.classList.remove('recoit'); void total.offsetWidth; total.classList.add('recoit');
      if (vol.arrivees >= nv) finirGain();
    }
    for (var i = 0; i < nv; i++) {
      vol.minuteurs.push(setTimeout(function () {
        if (!vol) return;
        if (reduit || !document.body.animate) { arrivee(); return; }
        var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('class', 'ico etoile-volante');
        s.setAttribute('aria-hidden', 'true');
        s.innerHTML = '<use href="#i-etoile"/>';
        s.style.left = a.left + 'px'; s.style.top = a.top + 'px';
        s.style.width = a.width + 'px'; s.style.height = a.height + 'px';
        document.body.appendChild(s);
        // Petite courbe : l'étoile monte un peu sur le côté avant de filer vers le compteur.
        var cote = (Math.random() - 0.5) * 120;
        var anim = s.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: 'translate(' + (dx * 0.35 + cote) + 'px,' + (dy * 0.35 - 30) + 'px) scale(0.9)', opacity: 1, offset: 0.4 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + (b.width / a.width) + ')', opacity: 1 }
        ], { duration: vole, easing: 'ease-in' });
        anim.onfinish = function () { s.remove(); arrivee(); };
      }, i * ecart));
    }
  }
  // On quitte l'accueil pendant l'envol : tout est compté d'un coup.
  document.addEventListener('aventura-ecran', function (e) {
    if (e.detail === 'ecran-accueil') demarrerGain(); // des étoiles attendaient d'arriver à l'accueil (coffre ouvert ailleurs)
    else if (vol) finirGain();
  });

  compte.visite(); // venue du jour (série de jours d'affilée, méga coffre)
  majAccueil();
  // ---------- Depuis la carte d'un joueur (Mon compte, js/joueurs-ecran.js) ----------
  // Résumé du trésor d'un joueur : { total, gemmes, niveau, coffres (à ouvrir) }.
  function resume(pid) {
    var v = compte.pourJoueur(pid);
    if (!v) return null;
    return { total: v.etat.total, gemmes: v.etat.gemmes || 0, niveau: v.niveau().niveau, coffres: v.coffresAOuvrir().length };
  }
  function voir(pid, ecran) { choisirVu(pid); aller(ecran || 'ecran-coffres'); }
  function ouvrirCoffresDe(pid) {
    choisirVu(pid);
    var l = vue().coffresAOuvrir();
    if (l.length) ouvrirCoffres(l);
  }

  window.Recompenses = { compte: compte, finDePartie: finDePartie, majTout: majTout, ouvrirCoffres: ouvrirCoffres, gainTotal: gainTotal,
    resume: resume, voir: voir, aideEtoiles: ouvrirCommentGagner, ouvrirCoffresDe: ouvrirCoffresDe, vue: vue, idVu: idVu };
})();
