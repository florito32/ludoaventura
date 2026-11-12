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
    else if (c.format === 'C') html = carteGeo(c, fait);
    box.innerHTML = html;
    box.hidden = !html; // question ouverte : rien ici, la case de réponse commune suffit
    brancher(c, box, rappels, fait);
    if (c.format === 'C' && box.querySelector('.carte-geo')) zoomCarte(box.querySelector('.carte-geo'));
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

  // Toucher sur la carte (v7.1) : la carte SVG de js/cartes-geo.js ; chaque zone se touche.
  // Les zones assez grandes (« cibles ») se prennent aussi au clavier ; les petites restent touchables (réponse fausse).
  function carteGeo(c, fait) {
    var carte = racine.CartesGeo && racine.CartesGeo.CARTES[c.carte];
    if (!carte) return '<p>Carte indisponible.</p>';
    var zones = carte.zones.map(function (z) {
      var cl = 'zone' + (z.cible ? ' cible' : '');
      if (fait && z.id === c.bonne) cl += ' bonne';
      else if (fait && z.id === c.touche) cl += ' fausse';
      var acces = z.cible && !fait ? ' role="button" tabindex="0" aria-label="' + esc(z.nom) + '"' : ' aria-hidden="true"';
      return '<path class="' + cl + '" data-zone="' + z.id + '" d="' + z.d + '"' + acces + '></path>';
    }).join('');
    // v7.2 : boutons de zoom (la carte seule grossit, pas la page) ; on peut aussi pincer à deux doigts ou tourner la molette.
    var zoom = '<div class="carte-zoom" role="group" aria-label="Zoom de la carte">' +
      '<button type="button" class="btn-zoom" data-zoom="plus" aria-label="Zoomer sur la carte"><span aria-hidden="true">+</span></button>' +
      '<button type="button" class="btn-zoom" data-zoom="moins" aria-label="Dézoomer la carte" disabled><span aria-hidden="true">−</span></button>' +
      '<button type="button" class="btn-zoom" data-zoom="tout" aria-label="Revoir toute la carte" hidden><span aria-hidden="true">⤢</span></button></div>';
    return '<div class="carte-geo"><svg viewBox="' + carte.vb + '" role="group" aria-label="Carte : ' + esc(carte.titre) + '">' + zones + '</svg>' + zoom + '</div>';
  }

  // ---------- Zoom de la carte à toucher (v7.2) ----------
  // On change le viewBox du SVG : seule la carte grossit, la page garde sa taille (touch-action: none sur la carte,
  // donc le navigateur ne zoome pas la page quand on pince dessus). Pincer à deux doigts ou la molette : zoom autour
  // des doigts / du pointeur ; un doigt glissé : déplace la carte zoomée. Un toucher sans glisser choisit une zone.
  var ZOOM_MAX = 8, SEUIL = 8; // seuil en pixels : au-delà, c'est un glissé (pas un toucher)
  function zoomCarte(geo) {
    var svg = geo.querySelector('svg');
    if (!svg) return;
    var v0 = svg.getAttribute('viewBox').split(/\s+/).map(Number);
    var v = v0.slice();
    var doigts = {}, depart = null, bouge = false, ecart = 0, milieu = null;

    function appliquer() {
      var w = Math.min(v0[2], Math.max(v0[2] / ZOOM_MAX, v[2]));
      var h = w * v0[3] / v0[2];
      v[2] = w; v[3] = h;
      v[0] = Math.min(v0[0] + v0[2] - w, Math.max(v0[0], v[0]));
      v[1] = Math.min(v0[1] + v0[3] - h, Math.max(v0[1], v[1]));
      svg.setAttribute('viewBox', v.map(function (n) { return Math.round(n * 100) / 100; }).join(' '));
      var zoome = w < v0[2] - 0.01;
      geo.classList.toggle('zoomee', zoome);
      geo.querySelector('[data-zoom="moins"]').disabled = !zoome;
      geo.querySelector('[data-zoom="plus"]').disabled = w <= v0[2] / ZOOM_MAX + 0.01;
      geo.querySelector('[data-zoom="tout"]').hidden = !zoome;
    }
    // Point de l'écran → point de la carte (tient compte des bandes vides de preserveAspectRatio).
    function versCarte(x, y) {
      var m = svg.getScreenCTM();
      if (!m) return { x: v[0] + v[2] / 2, y: v[1] + v[3] / 2 };
      var p = svg.createSVGPoint(); p.x = x; p.y = y;
      return p.matrixTransform(m.inverse());
    }
    // Zoom d'un facteur f autour du point (x, y) de l'écran : ce point reste sous le doigt.
    function zoomer(f, x, y) {
      var c = versCarte(x, y);
      var w = Math.min(v0[2], Math.max(v0[2] / ZOOM_MAX, v[2] / f)), k = w / v[2];
      v[0] = c.x - (c.x - v[0]) * k; v[1] = c.y - (c.y - v[1]) * k;
      v[2] = w; v[3] *= k;
      appliquer();
    }
    function deplacer(dx, dy) {
      var m = svg.getScreenCTM(), a = m ? m.a : 1;
      v[0] -= dx / a; v[1] -= dy / a;
      appliquer();
    }
    function centreEcran() { var r = svg.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }

    geo.querySelector('.carte-zoom').addEventListener('click', function (e) {
      var b = e.target.closest('[data-zoom]');
      if (!b) return;
      e.stopPropagation(); // ce n'est pas un toucher de zone
      var c = centreEcran();
      if (b.dataset.zoom === 'plus') zoomer(2, c[0], c[1]);
      else if (b.dataset.zoom === 'moins') zoomer(0.5, c[0], c[1]);
      else { v = v0.slice(); appliquer(); }
    });
    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoomer(e.deltaY < 0 ? 1.25 : 0.8, e.clientX, e.clientY);
    }, { passive: false });

    function liste() { return Object.keys(doigts).map(function (k) { return doigts[k]; }); }
    function mesure() {
      var d = liste();
      if (d.length < 2) return;
      ecart = Math.hypot(d[0].x - d[1].x, d[0].y - d[1].y);
      milieu = { x: (d[0].x + d[1].x) / 2, y: (d[0].y + d[1].y) / 2 };
    }
    svg.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!liste().length) { bouge = false; depart = { x: e.clientX, y: e.clientY }; }
      doigts[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (liste().length >= 2) { bouge = true; mesure(); }
    });
    svg.addEventListener('pointermove', function (e) {
      var d = doigts[e.pointerId];
      if (!d) return;
      var n = liste().length;
      if (n >= 2) {
        d.x = e.clientX; d.y = e.clientY;
        var avant = ecart, m0 = milieu;
        mesure();
        if (avant > 0) zoomer(ecart / avant, m0.x, m0.y);
        deplacer(milieu.x - m0.x, milieu.y - m0.y);
        return;
      }
      if (!bouge && depart && Math.hypot(e.clientX - depart.x, e.clientY - depart.y) > SEUIL) {
        bouge = true;
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
      }
      if (bouge && geo.classList.contains('zoomee')) deplacer(e.clientX - d.x, e.clientY - d.y);
      d.x = e.clientX; d.y = e.clientY;
    });
    function lever(e) {
      delete doigts[e.pointerId];
      mesure();
    }
    svg.addEventListener('pointerup', lever);
    svg.addEventListener('pointercancel', lever);
    // Après un glissé ou un pincement, le « clic » final n'est pas un choix de zone.
    geo.addEventListener('click', function (e) {
      if (bouge && !e.target.closest('.carte-zoom')) { e.stopPropagation(); e.preventDefault(); }
      if (!liste().length) bouge = false;
    }, true);
    appliquer();
  }

  function brancher(c, box, rappels, fait) {
    box.onkeydown = null;
    if (fait) { box.onclick = null; return; }
    if (c.format === 'C') {
      var choisir = function (e) {
        var z = e.target.closest && e.target.closest('[data-zone]');
        if (!z) return;
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        c.touche = z.getAttribute('data-zone');
        c.reponseDonnee = c.touche;
        rappels.repondu();
      };
      box.onclick = choisir;
      box.onkeydown = choisir;
      return;
    }
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
    if (c.format === 'C') {
      if (ok) return 'Bravo, c’est bien ' + c.bonneNom + ' !';
      var carte = racine.CartesGeo && racine.CartesGeo.CARTES[c.carte];
      var t = carte && carte.zones.filter(function (z) { return z.id === c.touche; })[0];
      return 'Ce n’est pas ça' + (t && t.nom ? ' : tu as touché ' + t.nom : '') + '. ' + c.bonneNom + ' est en vert sur la carte.';
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
