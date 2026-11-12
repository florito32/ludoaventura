// Géographie et Histoire (v7.0) : affichage d'une carte « savoir » dans le Tour de jeu, selon son format
// (relier, choix multiples, ordre, vrai ou faux, classer, qui suis-je ?). La question ouverte utilise la
// case de réponse commune (#carte-saisie, voir js/plateau.js).
// SavoirsCarte.montrer(c, rappels) dessine la carte dans #carte-savoir à partir de son état (gardé dans c,
// donc rejoué tel quel après un rechargement). rappels = { change() : état modifié (sauvegarde),
// repondu() : le joueur a fini, à corriger, taille() : le contenu a changé de hauteur }.
(function (racine) {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var S = racine.Savoirs;

  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  // Drapeau (flag-icons, licence MIT) : le nom du pays n'est pas donné (ce serait la réponse).
  function drapeau(code, classe) {
    return '<img class="drapeau ' + (classe || '') + '" src="img/drapeaux/' + esc(code) + '.svg" alt="Drapeau à reconnaître" width="64" height="48">';
  }
  function texteGauche(c, x) { return c.image === 'drapeau' ? drapeau(x) : esc(x); }
  function corrigee(c) { return c.reponseDonnee != null; }

  var COULEURS = 6; // puce-liens des paires reliées (.lien-1 à .lien-6)

  function montrer(c, rappels) {
    var box = $('carte-savoir');
    box.hidden = false;
    box.className = 'carte-savoir format-' + c.format;
    var html = '';
    var fait = corrigee(c);
    if (c.format === 'R') html = relier(c, fait);
    else if (c.format === 'Q') html = sujet(c) + options(c, c.options, fait);
    else if (c.format === 'V') html = vraiFaux(c, fait);
    else if (c.format === 'F') html = ordre(c, fait);
    else if (c.format === 'K') html = classer(c, fait);
    else if (c.format === 'I') html = indices(c, fait);
    else if (c.format === 'O') html = sujet(c);
    box.innerHTML = html;
    box.hidden = !html; // question ouverte : rien ici, la case de réponse commune suffit
    brancher(c, box, rappels, fait);
    // Phrase de correction sous la carte (même endroit que pour le calcul et l'orthographe).
    var rep = $('carte-reponse');
    if (fait && c.format !== 'O') {
      rep.hidden = false;
      rep.className = 'carte-reponse ' + (c.juste ? 'juste' : 'fausse');
      rep.textContent = correction(c);
    } else if (c.format !== 'O') { rep.hidden = true; rep.className = 'carte-reponse'; }
  }

  // Ce qu'on demande (drapeau, monument…) au-dessus des réponses.
  function sujet(c) {
    if (c.image === 'drapeau' && c.sujet) return '<p class="savoir-sujet">' + drapeau(c.sujet, 'grand') + '</p>';
    return '';
  }

  function options(c, liste, fait, nom) {
    return '<div class="savoir-options" role="group" aria-label="' + (nom || 'Réponses proposées') + '">' + liste.map(function (o) {
      var cl = 'btn-option';
      if (fait && o === c.bonne) cl += ' bonne';
      else if (fait && o === c.reponseDonnee) cl += ' fausse';
      return '<button type="button" class="' + cl + '" data-option="' + esc(o) + '"' + (fait ? ' disabled' : '') + '>' + esc(o) + '</button>';
    }).join('') + '</div>';
  }

  function vraiFaux(c, fait) {
    var h = c.question ? '<p class="savoir-question">' + esc(c.question) + '</p><p class="savoir-affirmation">Réponse proposée : <strong>' + esc(c.affirmation) + '</strong></p>'
      : '<p class="savoir-affirmation"><strong>' + esc(c.affirmation) + '</strong></p>';
    return h + options(c, ['Vrai', 'Faux'], fait, 'Vrai ou faux');
  }

  // Relier : à gauche les éléments numérotés, à droite les réponses. Toucher un élément à gauche puis sa
  // réponse à droite les relie (même puce-lien de couleur). Toucher une paire reliée la défait.
  function relier(c, fait) {
    var sel = c.choisi == null ? -1 : c.choisi;
    var g = c.gauche.map(function (x, i) {
      var lien = c.liens[i], cl = 'relier-g' + (i === sel ? ' choisi' : '') + (lien != null ? ' relie lien-' + (i % COULEURS + 1) : '');
      if (fait) cl += lien === c.bonnes[i] ? ' bonne' : ' fausse';
      return '<button type="button" class="' + cl + '" data-g="' + i + '" aria-pressed="' + (i === sel) + '"' + (fait ? ' disabled' : '') + '>' +
        '<span class="puce-lien" aria-hidden="true">' + (i + 1) + '</span><span class="relier-texte">' + texteGauche(c, x) + '</span>' +
        (lien != null ? '<span class="visually-hidden"> relié à ' + esc(lien) + '</span>' : '') + '</button>';
    }).join('');
    var d = c.droite.map(function (x) {
      var i = c.liens.indexOf(x), cl = 'relier-d' + (i >= 0 ? ' relie lien-' + (i % COULEURS + 1) : '');
      return '<button type="button" class="' + cl + '" data-d="' + esc(x) + '"' + (fait ? ' disabled' : '') + '>' +
        (i >= 0 ? '<span class="puce-lien" aria-hidden="true">' + (i + 1) + '</span>' : '<span class="puce-lien vide" aria-hidden="true"></span>') +
        '<span class="relier-texte">' + esc(x) + '</span></button>';
    }).join('');
    var complet = c.liens.every(function (l) { return l != null; });
    return '<div class="relier' + (c.image ? ' avec-images' : '') + '"><div class="relier-col" role="group" aria-label="À relier">' + g +
      '</div><div class="relier-col" role="group" aria-label="Réponses">' + d + '</div></div>' +
      (fait ? '' : '<button type="button" class="btn btn-principal btn-savoir-ok" data-ok="1"' + (complet ? '' : ' disabled') + '>OK</button>');
  }

  // Remettre dans l'ordre : on touche les éléments dans l'ordre, ils vont dans la case suivante.
  function ordre(c, fait) {
    var places = c.places;
    var haut = c.elements.map(function (x, k) {
      var pris = places.indexOf(k) >= 0;
      return '<button type="button" class="ordre-el" data-k="' + k + '"' + (pris || fait ? ' disabled' : '') + (pris ? ' data-pris="1"' : '') + '>' + esc(x) + '</button>';
    }).join('');
    var bas = places.map(function (k, i) {
      var cl = 'ordre-case' + (k == null ? ' vide' : '');
      if (fait) cl += k != null && c.elements[k] === c.bonnes[i] ? ' bonne' : ' fausse';
      return '<li><button type="button" class="' + cl + '" data-i="' + i + '"' + (k == null || fait ? ' disabled' : '') + '>' +
        '<span class="ordre-num">' + (i + 1) + '</span><span class="ordre-texte">' + (k == null ? '' : esc(c.elements[k])) + '</span></button></li>';
    }).join('');
    var complet = places.every(function (k) { return k != null; });
    return '<div class="ordre-pioche" role="group" aria-label="Éléments à ranger">' + haut + '</div>' +
      '<p class="ordre-sens"><span>↓ ' + esc(c.sens[0]) + '</span></p><ol class="ordre-cases" aria-label="Ton ordre">' + bas + '</ol>' +
      '<p class="ordre-sens"><span>↑ ' + esc(c.sens[1]) + '</span></p>' +
      (fait ? '' : '<div class="savoir-actions"><button type="button" class="btn btn-secondaire" data-remettre="1"' + (places.some(function (k) { return k != null; }) ? '' : ' disabled') + '>↺ Tout remettre</button>' +
        '<button type="button" class="btn btn-principal btn-savoir-ok" data-ok="1"' + (complet ? '' : ' disabled') + '>OK</button></div>');
  }

  // Classer : chaque élément va dans la colonne A ou B (deux boutons par ligne).
  function classer(c, fait) {
    var lignes = c.elements.map(function (x, i) {
      var r = c.rangs[i];
      var cl = 'classer-ligne' + (fait ? (r === c.bonnes[i] ? ' bonne' : ' fausse') : '');
      return '<li class="' + cl + '"><span class="classer-texte">' + esc(x) + '</span><span class="classer-choix" role="group" aria-label="' + esc(x) + '">' +
        [0, 1].map(function (k) {
          return '<button type="button" class="btn-col col-' + k + '" data-i="' + i + '" data-col="' + k + '" aria-pressed="' + (r === k) + '"' + (fait ? ' disabled' : '') + '>' + esc(c.colonnes[k]) + '</button>';
        }).join('') + '</span></li>';
    }).join('');
    var complet = c.rangs.every(function (r) { return r != null; });
    return '<ul class="classer">' + lignes + '</ul>' +
      (fait ? '' : '<button type="button" class="btn btn-principal btn-savoir-ok" data-ok="1"' + (complet ? '' : ' disabled') + '>OK</button>');
  }

  // Qui suis-je ? : 5 indices dévoilés un à un ; on peut répondre à tout moment (6 points au 1er indice…).
  function indices(c, fait) {
    var vus = c.indices.slice(0, c.vus).map(function (t, k) { return '<li><span class="indice-num">Indice ' + (k + 1) + '</span> ' + esc(t) + '</li>'; }).join('');
    var pts = 7 - c.vus;
    var h = '<ol class="indices" aria-live="polite">' + vus + '</ol>';
    if (!fait) {
      h += '<p class="indices-points">Si tu trouves maintenant : <strong>' + pts + ' point' + (pts > 1 ? 's' : '') + '</strong></p>';
      if (c.vus < c.indices.length) h += '<button type="button" class="btn btn-secondaire btn-indice" data-indice="1">Indice suivant (' + (c.vus + 1) + ' sur ' + c.indices.length + ')</button>';
    }
    return h + options(c, c.options, fait, 'Qui suis-je ?');
  }

  function brancher(c, box, rappels, fait) {
    if (fait) return;
    box.onclick = function (e) {
      var b = e.target.closest('button');
      if (!b || b.disabled) return;
      if (b.dataset.option != null) { c.reponseDonnee = b.dataset.option; rappels.repondu(); return; }
      if (b.dataset.indice) { c.vus = Math.min(c.indices.length, c.vus + 1); rappels.change(); montrer(c, rappels); rappels.taille(); return; }
      if (b.dataset.ok) { c.reponseDonnee = 'ok'; rappels.repondu(); return; }
      if (c.format === 'R') {
        if (b.dataset.g != null) {
          var i = Number(b.dataset.g);
          if (c.liens[i] != null) c.liens[i] = null; c.choisi = i; // toucher un élément relié le détache et le choisit
        } else if (b.dataset.d != null) {
          var d = b.dataset.d, deja = c.liens.indexOf(d);
          if (c.choisi == null) {
            // Réponse touchée d'abord : on la relie au premier élément libre… seulement si un élément est choisi.
            if (deja >= 0) { c.liens[deja] = null; c.choisi = deja; }
          } else {
            if (deja >= 0) c.liens[deja] = null;
            c.liens[c.choisi] = d;
            // Élément suivant encore libre, pour enchaîner sans toucher la colonne de gauche.
            var libre = c.liens.indexOf(null);
            c.choisi = libre >= 0 ? libre : null;
          }
        }
      } else if (c.format === 'F') {
        if (b.dataset.k != null) { var vide = c.places.indexOf(null); if (vide >= 0) c.places[vide] = Number(b.dataset.k); }
        else if (b.dataset.i != null) c.places[Number(b.dataset.i)] = null;
        else if (b.dataset.remettre) c.places = c.places.map(function () { return null; });
      } else if (c.format === 'K' && b.dataset.col != null) {
        var n = Number(b.dataset.i), k = Number(b.dataset.col);
        c.rangs[n] = c.rangs[n] === k ? null : k;
      }
      rappels.change();
      montrer(c, rappels);
      // Le focus reste sur un bouton équivalent (clavier, lecteurs d'écran).
      var sel = b.dataset.g != null ? '[data-g="' + b.dataset.g + '"]' : b.dataset.col != null ? '[data-i="' + b.dataset.i + '"][data-col="' + b.dataset.col + '"]' : '.btn-savoir-ok:not([disabled])';
      var cible = box.querySelector(sel) || box.querySelector('button:not([disabled])');
      if (cible) cible.focus({ preventScroll: true });
    };
  }

  // Phrase écrite après la réponse.
  function correction(c) {
    var ok = c.juste;
    if (c.format === 'R') {
      if (ok) return 'Bravo, tout est bien relié !';
      return 'Pas tout à fait. La bonne réponse : ' + c.gauche.map(function (g, i) {
        return (c.image === 'drapeau' ? (i + 1) : g) + ' → ' + c.bonnes[i];
      }).join(' ; ') + '.';
    }
    if (c.format === 'F') return (ok ? 'Bravo, c’est le bon ordre ! ' : 'Ce n’est pas le bon ordre. ') +
      'Le bon ordre : ' + c.bonnes.map(function (b, i) { return b + (c.valeurs[i] ? ' (' + c.valeurs[i] + ')' : ''); }).join(', ') + '.';
    if (c.format === 'K') {
      if (ok) return 'Bravo, tout est bien rangé !';
      return 'Pas tout à fait. ' + c.colonnes[0] + ' : ' + c.elements.filter(function (x, i) { return c.bonnes[i] === 0; }).join(', ') +
        '. ' + c.colonnes[1] + ' : ' + c.elements.filter(function (x, i) { return c.bonnes[i] === 1; }).join(', ') + '.';
    }
    if (c.format === 'V') return (ok ? 'Bonne réponse ! ' : 'Ce n’est pas ça. ') + 'C’est ' + c.bonne.toLowerCase() + '. ' + (c.explication || '');
    if (c.format === 'I') {
      if (ok) { var p = 7 - c.vus; return 'Bravo, c’est ' + c.bonne + ' ! Trouvé au ' + (c.vus === 1 ? '1er' : c.vus + 'e') + ' indice : ' + p + ' point' + (p > 1 ? 's' : '') + '.'; }
      return 'Ce n’est pas ça : c’était ' + c.bonne + '. Tu gagnes quand même 1 point.';
    }
    return ok ? 'Bonne réponse ! ' + c.bonne : 'Ce n’est pas ça. La bonne réponse : ' + c.bonne + '.';
  }

  // Texte lu par « Écouter ».
  function texteOral(c) {
    var t = c.consigne || '';
    if (c.format === 'V') t = c.question ? c.question + ' Réponse proposée : ' + c.affirmation + '. Vrai ou faux ?' : c.affirmation + ' Vrai ou faux ?';
    if (c.format === 'Q' && c.image !== 'drapeau') t += ' ' + c.options.join(', ') + '.';
    if (c.format === 'I') t = 'Qui suis-je ? ' + c.indices.slice(0, c.vus).join(' ');
    return t;
  }

  racine.SavoirsCarte = { montrer: montrer, correction: correction, texteOral: texteOral };
})(this);
