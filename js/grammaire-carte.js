// Affichage des cartes de grammaire dans la carte piochée (v6.54, demande du 12/11/2026).
// Le contenu des cartes vient de js/grammaire.js ; ici, seulement l'écran et les gestes :
//  - Contraires, Nature du mot, Homophones : des boutons de réponse, un seul toucher ;
//  - Remettre la phrase : les mots en bulles (en haut) à toucher dans l'ordre ; chacun va à la suite de
//    la phrase (en bas) ; toucher un mot placé le renvoie à sa place ; phrase complète → correction ;
//  - Trouve l'erreur : la phrase en bulles, on touche le mot faux ;
//  - Relier les paires : on touche un mot d'une colonne puis un de l'autre (dans n'importe quel sens) :
//    une ligne de couleur les relie, avec le même numéro des deux côtés ; toucher un mot relié défait le lien ;
//    toutes les paires reliées → correction.
// L'état d'une carte (mots placés, liens) est gardé dans la carte elle-même : il survit à un rechargement.
(function (racine) {
  'use strict';

  var G = racine.Grammaire;
  // Couleurs des liens (8 paires au plus), assez foncées pour un trait de 4 px sur fond blanc.
  var COULEURS = ['#1c3473', '#b03a2e', '#1e7b45', '#b9570f', '#6c3483', '#0f6e7d', '#8a6d0b', '#7b3f1d'];

  var boite = null, rappels = null, enCorrection = false, observateur = null;

  function echapper(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // rappels : { carte() → carte affichée, actif() → le joueur peut répondre, fini(reponse, texte), sauver() }.
  function brancher(element, r) {
    boite = element; rappels = r;
    boite.addEventListener('click', toucher);
    if (racine.ResizeObserver) {
      observateur = new ResizeObserver(function () { traits(); });
      observateur.observe(boite);
    }
    racine.addEventListener('resize', traits);
  }

  function actif() { return rappels.actif() && !enCorrection; }

  // ---------- Dessin ----------
  function afficher(c) {
    enCorrection = false;
    var fait = c.reponseDonnee != null;
    var h = '';
    boite.dataset.jeu = c.jeu;
    if (c.jeu === 'contraires') {
      h += '<p class="gram-mot">' + echapper(c.mot) + '</p>' + boutons(c, c.choix, fait);
    } else if (c.jeu === 'homophones') {
      var trou = fait ? '<span class="gram-trou rempli ' + (c.juste ? 'juste' : 'fausse') + '">' + echapper(c.reponse) + '</span>'
        : '<span class="gram-trou" aria-hidden="true"></span><span class="visually-hidden">(mot manquant)</span>';
      h += '<p class="gram-phrase">' + c.phrase.split('_').map(echapper).join(trou) + '</p>' + boutons(c, c.choix, fait);
    } else if (c.jeu === 'nature') {
      h += '<p class="gram-phrase gram-bulles-texte">' + c.mots.map(function (m, k) {
        return k === c.cible ? '<mark class="gram-cible">' + echapper(m.replace(/,$/, '')) + '</mark>' + (/,$/.test(m) ? ',' : '') : echapper(m);
      }).join(' ') + echapper(c.fin) + '</p>';
      h += boutons(c, c.choix, fait, function (n) { return G.NATURES[n]; });
    } else if (c.jeu === 'erreur') {
      h += '<div class="gram-bulles" role="group" aria-label="Mots de la phrase">' + c.mots.map(function (m, k) {
        var cl = 'gram-bulle';
        if (fait && k === c.faute) cl += ' bonne';
        if (fait && k === Number(c.reponse) && k !== c.faute) cl += ' fausse';
        return '<button type="button" class="' + cl + '" data-k="' + k + '"' + (fait ? ' disabled' : '') + '>' + echapper(m) + '</button>';
      }).join('') + '<span class="gram-fin">' + echapper(c.fin) + '</span></div>';
    } else if (c.jeu === 'phrase') {
      h += phrase(c, fait);
    } else if (c.jeu === 'relier') {
      h += relier(c, fait);
    }
    boite.innerHTML = h;
    traits();
  }

  // Boutons de réponse ; après la réponse : le bon en vert, le choix faux en rouge.
  function boutons(c, liste, fait, nom) {
    nom = nom || function (x) { return x; };
    return '<div class="gram-choix" role="group" aria-label="Réponses">' + liste.map(function (v) {
      var cl = 'gram-bouton';
      if (fait && v === c.bonne) cl += ' bonne';
      if (fait && v === c.reponse && v !== c.bonne) cl += ' fausse';
      return '<button type="button" class="' + cl + '" data-v="' + echapper(v) + '"' + (fait ? ' disabled' : '') + '>' + echapper(nom(v)) + '</button>';
    }).join('') + '</div>';
  }

  // Remettre la phrase : bulles mélangées (une place vide garde l'endroit d'un mot parti), puis la phrase en cours.
  function phrase(c, fait) {
    if (!Array.isArray(c.placees)) c.placees = [];
    var mots = c.ordre.map(function (k) { return c.mots[k]; });
    var h = '';
    if (!fait) {
      h += '<div class="gram-bulles" role="group" aria-label="Mots mélangés">' + mots.map(function (m, t) {
        return c.placees.indexOf(t) >= 0 ? '<span class="gram-bulle trou" aria-hidden="true">' + echapper(m) + '</span>'
          : '<button type="button" class="gram-bulle" data-t="' + t + '" aria-label="Placer le mot ' + echapper(m) + '">' + echapper(m) + '</button>';
      }).join('') + '</div>';
    }
    var place = c.placees.map(function (t, i) {
      return fait ? '<span class="gram-bulle posee">' + echapper(mots[t]) + '</span>'
        : '<button type="button" class="gram-bulle posee" data-p="' + i + '" aria-label="Mot ' + echapper(mots[t]) + ', position ' + (i + 1) + ', toucher pour le retirer">' + echapper(mots[t]) + '</button>';
    }).join('');
    var reste = mots.length - c.placees.length;
    h += '<div class="gram-ligne' + (fait ? (c.juste ? ' juste' : ' fausse') : '') + '" role="group" aria-label="Ta phrase">' + place +
      (reste > 0 ? '<span class="gram-suivant"><span class="visually-hidden">Place du mot suivant</span></span>' : '') +
      '<span class="gram-fin">' + echapper(c.fin) + '</span></div>';
    if (!fait) h += '<button type="button" class="btn btn-secondaire btn-remettre gram-remettre"' + (c.placees.length ? '' : ' disabled') + '><span aria-hidden="true">↺</span> Tout remettre</button>';
    return h;
  }

  // Relier : deux colonnes et les traits entre elles (SVG). c.liens[g] = position à droite reliée au mot g.
  function relier(c, fait) {
    var n = c.gauche.length;
    if (!Array.isArray(c.liens) || c.liens.length !== n) c.liens = c.gauche.map(function () { return null; });
    var choisi = c.choisi || null;
    // Le lien est dit aux lecteurs d'écran par un texte caché après le mot (le nom du bouton commence par le texte visible, WCAG 2.5.3).
    function cache(t) { return t ? '<span class="visually-hidden">' + echapper(t) + '</span>' : ''; }
    function numero(g) { return '<span class="gram-num" style="--lien:' + COULEURS[g] + '" aria-hidden="true">' + (g + 1) + '</span>'; }
    var gauche = c.gauche.map(function (m, g) {
      var d = c.liens[g], cl = 'gram-mot-relier', lie = d !== null;
      if (lie) cl += ' lie';
      if (fait && lie) cl += d === c.bonnes[g] ? ' juste' : ' fausse';
      if (choisi && choisi.cote === 'g' && choisi.i === g) cl += ' choisi';
      return '<button type="button" class="' + cl + '" data-cote="g" data-i="' + g + '" style="--lien:' + (lie ? COULEURS[g] : 'transparent') + '"' +
        (fait ? ' disabled' : '') + ' aria-pressed="' + String(!!(choisi && choisi.cote === 'g' && choisi.i === g)) + '">' +
        '<span class="gram-texte">' + echapper(m) + '</span>' + cache(lie ? ', relié à ' + c.droite[d] : '') + (lie ? numero(g) : '') + '</button>';
    }).join('');
    var droite = c.droite.map(function (m, d) {
      var g = c.liens.indexOf(d), cl = 'gram-mot-relier', lie = g >= 0;
      if (lie) cl += ' lie';
      if (fait && lie) cl += d === c.bonnes[g] ? ' juste' : ' fausse';
      if (choisi && choisi.cote === 'd' && choisi.i === d) cl += ' choisi';
      return '<button type="button" class="' + cl + '" data-cote="d" data-i="' + d + '" style="--lien:' + (lie ? COULEURS[g] : 'transparent') + '"' +
        (fait ? ' disabled' : '') + ' aria-pressed="' + String(!!(choisi && choisi.cote === 'd' && choisi.i === d)) + '">' +
        (lie ? numero(g) : '') + '<span class="gram-texte">' + echapper(m) + '</span>' + cache(lie ? ', relié à ' + c.gauche[g] : '') + '</button>';
    }).join('');
    return '<div class="gram-relier' + (fait ? ' corrige' : '') + '" style="--n:' + n + '">' +
      '<div class="gram-col" role="group" aria-label="Colonne de gauche">' + gauche + '</div>' +
      '<svg class="gram-traits" aria-hidden="true" focusable="false"></svg>' +
      '<div class="gram-col" role="group" aria-label="Colonne de droite">' + droite + '</div></div>';
  }

  // Traits droits entre les mots reliés (recalculés quand la carte change de taille).
  function traits() {
    if (!boite || boite.hidden) return;
    var zone = boite.querySelector('.gram-relier'), svg = boite.querySelector('.gram-traits');
    var c = rappels && rappels.carte();
    if (!zone || !svg || !c || c.jeu !== 'relier') return;
    var z = zone.getBoundingClientRect();
    if (!z.width) return;
    svg.setAttribute('viewBox', '0 0 ' + z.width + ' ' + z.height);
    svg.setAttribute('width', z.width); svg.setAttribute('height', z.height);
    var fait = c.reponseDonnee != null, h = '';
    c.liens.forEach(function (d, g) {
      if (d === null) return;
      var a = zone.querySelector('[data-cote="g"][data-i="' + g + '"]'), b = zone.querySelector('[data-cote="d"][data-i="' + d + '"]');
      if (!a || !b) return;
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var x1 = ra.right - z.left, y1 = ra.top + ra.height / 2 - z.top, x2 = rb.left - z.left, y2 = rb.top + rb.height / 2 - z.top;
      var juste = d === c.bonnes[g];
      var couleur = fait ? (juste ? '#1e7b45' : '#b03a2e') : COULEURS[g];
      h += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + couleur + '" stroke-width="4" stroke-linecap="round"' +
        (fait && !juste ? ' stroke-dasharray="7 6"' : '') + '/>';
    });
    svg.innerHTML = h;
  }

  // ---------- Gestes ----------
  function toucher(e) {
    var c = rappels.carte();
    if (!c || c.type !== 'grammaire' || c.reponseDonnee != null || !actif()) return;
    var b;
    if ((b = e.target.closest('.gram-bouton'))) { repondre(c, b.dataset.v, c.jeu === 'nature' ? G.NATURES[b.dataset.v] : b.dataset.v); return; }
    if (c.jeu === 'erreur' && (b = e.target.closest('.gram-bulle'))) { var k = Number(b.dataset.k); repondre(c, k, c.mots[k]); return; }
    if (c.jeu === 'phrase') {
      if ((b = e.target.closest('.gram-bulle[data-t]'))) { poser(c, Number(b.dataset.t)); return; }
      if ((b = e.target.closest('.gram-bulle[data-p]'))) { retirer(c, Number(b.dataset.p)); return; }
      if (e.target.closest('.gram-remettre')) { c.placees = []; afficher(c); focus('.gram-bulle[data-t]'); rappels.sauver(); return; }
    }
    if (c.jeu === 'relier' && (b = e.target.closest('.gram-mot-relier'))) { relierMot(c, b.dataset.cote, Number(b.dataset.i)); }
  }
  function focus(sel) { var x = boite.querySelector(sel); if (x) x.focus({ preventScroll: true }); }

  function repondre(c, reponse, texte) {
    c.reponse = reponse;
    rappels.fini(reponse, texte);
  }

  function poser(c, t) {
    if (c.placees.indexOf(t) >= 0) return;
    c.placees.push(t);
    afficher(c);
    rappels.sauver();
    if (c.placees.length === c.mots.length) {
      // Phrase complète : correction automatique, le temps de voir le dernier mot posé.
      enCorrection = true;
      setTimeout(function () {
        enCorrection = false;
        if (rappels.carte() !== c || c.reponseDonnee != null) return;
        var p = c.placees.map(function (k) { return c.mots[c.ordre[k]]; }).join(' ');
        repondre(c, p, G.texte(p.split(' '), c.fin));
      }, 380);
    } else focus('.gram-bulle[data-t]');
  }
  function retirer(c, i) {
    c.placees.splice(i, 1);
    afficher(c);
    focus('.gram-bulle[data-t]');
    rappels.sauver();
  }

  function relierMot(c, cote, i) {
    var autre = cote === 'g' ? 'd' : 'g';
    // Mot déjà relié : on défait le lien et il devient le mot choisi.
    var g = cote === 'g' ? i : c.liens.indexOf(i);
    if (g >= 0 && c.liens[g] !== null) {
      c.liens[g] = null;
      c.choisi = { cote: cote, i: i };
    } else if (c.choisi && c.choisi.cote === autre) {
      var gg = cote === 'g' ? i : c.choisi.i, dd = cote === 'g' ? c.choisi.i : i;
      c.liens[gg] = dd;
      c.choisi = null;
    } else if (c.choisi && c.choisi.cote === cote && c.choisi.i === i) {
      c.choisi = null; // second toucher : le mot n'est plus choisi
    } else c.choisi = { cote: cote, i: i };
    afficher(c);
    focus('[data-cote="' + cote + '"][data-i="' + i + '"]');
    rappels.sauver();
    if (c.liens.every(function (d) { return d !== null; })) {
      enCorrection = true;
      setTimeout(function () {
        enCorrection = false;
        if (rappels.carte() !== c || c.reponseDonnee != null) return;
        var n = G.pairesJustes(c, c.liens);
        repondre(c, c.liens.slice(), n + ' paire' + (n > 1 ? 's' : '') + ' juste' + (n > 1 ? 's' : '') + ' sur ' + c.liens.length);
      }, 450);
    }
  }

  racine.GrammaireCarte = { brancher: brancher, afficher: afficher, traits: traits };
})(this);
