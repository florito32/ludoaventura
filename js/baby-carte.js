// Affichage et gestes des cartes « Baby jeux » (v9.1) dans la carte piochée.
// Contenu des cartes : js/baby.js. Ce fichier est appelé par js/grammaire-carte.js (carte.module === 'baby'),
// qui garde les gestes communs : boutons de réponse (.gram-bouton) et « Relier » (mêmes colonnes et traits).
// Ici : l'image de la question (dé, doigts, objets, suite…), l'arène où les jetons se baladent (attrape, bulles),
// remettre dans l'ordre, ranger dans deux paniers et la fabrique à mots.
// L'état de la carte (jetons trouvés, erreurs, lettres posées) est gardé dans la carte : il survit à un rechargement.
(function (racine) {
  'use strict';

  function echapper(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function B() { return racine.Baby; }

  // ---------- Dessins ----------
  // Points d'un dé classique (positions sur une grille 3 × 3).
  var POINTS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function unDe(n) {
    var p = POINTS[n].map(function (k) {
      return '<circle cx="' + (14 + (k % 3) * 16) + '" cy="' + (14 + Math.floor(k / 3) * 16) + '" r="5.5"/>';
    }).join('');
    return '<svg class="baby-de" viewBox="0 0 60 60" aria-hidden="true" focusable="false"><rect x="2" y="2" width="56" height="56" rx="11"/><g>' + p + '</g></svg>';
  }
  // Un dé jusqu'à 6, deux dés au-delà (6 + le reste).
  function des(n) {
    var lu = n + ' point' + (n > 1 ? 's' : '');
    return '<span class="baby-des" role="img" aria-label="' + lu + '">' + (n <= 6 ? unDe(n) : unDe(6) + unDe(n - 6)) + '</span>';
  }
  // Une main avec n doigts levés (0 à 5) : le pouce d'abord, puis l'index, le majeur…
  function uneMain(n) {
    var doigts = [
      { x: 6, y: 52, l: 24, a: -50 }, { x: 20, y: 40, l: 34, a: -8 }, { x: 34, y: 38, l: 38, a: 0 },
      { x: 48, y: 40, l: 34, a: 6 }, { x: 60, y: 46, l: 26, a: 14 }
    ];
    var h = doigts.map(function (d, i) {
      var leve = i < n, l = leve ? d.l : 10;
      return '<rect x="' + (d.x) + '" y="' + (d.y - l) + '" width="12" height="' + (l + 8) + '" rx="6" transform="rotate(' + d.a + ' ' + (d.x + 6) + ' ' + d.y + ')"' +
        (leve ? '' : ' class="plie"') + '/>';
    }).join('');
    return '<svg class="baby-main" viewBox="-6 -2 84 98" aria-hidden="true" focusable="false">' + h + '<rect x="14" y="40" width="54" height="50" rx="16"/></svg>';
  }
  function mains(n) {
    return '<span class="baby-mains" role="img" aria-label="' + n + ' doigt' + (n > 1 ? 's' : '') + ' levé' + (n > 1 ? 's' : '') + '">' +
      (n <= 5 ? uneMain(n) : uneMain(5) + uneMain(n - 5)) + '</span>';
  }
  function objets(e, n, cl) {
    var t = '';
    for (var i = 0; i < n; i++) t += '<span aria-hidden="true">' + e + '</span>';
    return '<span class="baby-objets' + (cl ? ' ' + cl : '') + '" role="img" aria-label="' + n + ' objet' + (n > 1 ? 's' : '') + '">' + t + '</span>';
  }
  // Suite avec un trou (« La lettre / Le chiffre qui manque ») ; après la réponse, le trou montre la bonne.
  function suite(c, fait) {
    return '<p class="baby-suite">' + c.suite.map(function (x) {
      if (x !== null) return '<span class="baby-case">' + echapper(x) + '</span>';
      return fait ? '<span class="baby-case trou rempli ' + (c.juste ? 'juste' : 'fausse') + '">' + echapper(c.bonne) + '</span>'
        : '<span class="baby-case trou" aria-label="case vide">?</span>';
    }).join('') + '</p>';
  }

  // ---------- Contenu de la carte ----------
  // o : outils de js/grammaire-carte.js { boutons(c, liste, fait, nom, html, lu), relier(c, fait, etiquette, texte) }.
  function html(c, fait, o) {
    var h = '<div class="baby baby-' + c.meca + '" data-jeu="' + c.jeu + '">';
    switch (c.meca) {
      case 'choix': h += choix(c, fait, o); break;
      case 'attrape': case 'bulles': h += arene(c, fait); break;
      case 'ordre': h += ordre(c, fait); break;
      case 'trier': h += trier(c, fait); break;
      case 'relier':
        h += o.relier(c, fait, c.jeu === 'relier-des' ? function (n) { return des(n); } : null,
          c.jeu === 'relier-des' ? function (n) { return 'dé à ' + n + ' point' + (n > 1 ? 's' : ''); } : null);
        break;
      case 'fabrique': h += fabrique(c, fait); break;
    }
    return h + '</div>';
  }

  function choix(c, fait, o) {
    var h = '', gros = function (v) { return '<span class="baby-gros">' + echapper(v) + '</span>'; };
    switch (c.jeu) {
      case 'lettre-manque': case 'chiffre-manque':
        // v10.8 : la suite (à plat, non cliquable) est séparée des réponses (boutons en relief) par une ligne pointillée et une invite.
        h += suite(c, fait);
        if (!fait) h += '<p class="baby-invite"><span aria-hidden="true">👇</span> Touche ta réponse</p>';
        break;
      case 'entends-lettre': case 'entends-chiffre': case 'syllabes':
        h += '<p class="baby-oreille" aria-hidden="true">👂</p>'; break;
      case 'premiere-lettre':
        h += '<p class="baby-image" role="img" aria-label="' + echapper(c.mot) + '">' + c.image + '</p>';
        if (fait) h += '<p class="baby-motimage"><strong>' + echapper(c.bonne) + '</strong>' + echapper(c.mot.slice(1)) + '</p>';
        break;
      case 'compter': h += objets(c.objet, c.nombre); break;
      case 'doigts': h += mains(c.nombre); break;
      case 'encore-un':
        h += '<p class="baby-encore">' + objets(c.objet, c.avant) + '<span class="baby-plus" aria-hidden="true">+</span>' + objets(c.objet, 1, 'arrive') + '</p>';
        break;
      case 'plus':
        return h + o.boutons(c, c.choix, fait, null, function (v) { var n = c.paniers[v === 'g' ? 0 : 1]; return '<span class="baby-panier">' + objets(c.objet, n) + '</span>'; },
          function (v) { return 'Panier de ' + (v === 'g' ? 'gauche' : 'droite') + ', ' + c.paniers[v === 'g' ? 0 : 1] + ' objets'; });
    }
    return h + o.boutons(c, c.choix, fait, null, gros);
  }

  // Arène : les jetons se baladent (animation CSS, coupée si l'appareil demande moins d'animations).
  function arene(c, fait) {
    var h = '';
    if (c.jeu === 'attrape-lettre') h += '<p class="baby-modele" aria-label="Lettre à trouver : ' + echapper(c.modele) + '">' + echapper(c.modele) + '</p>';
    else if (c.jeu === 'attrape-chiffre') h += '<p class="baby-modele">' + des(c.points) + '</p>';
    else if (c.jeu === 'son-ecritures') h += '<p class="baby-modele baby-son"><span aria-hidden="true">👂</span> « ' + echapper(c.son) + ' » <small>comme dans ' + echapper(c.exemple) + '</small></p>';
    var bulles = c.meca === 'bulles';
    var aTrouver = bulles ? c.jetons.length : c.jetons.filter(function (j) { return j.bon; }).length;
    var trouves = bulles ? c.suivant : c.jetons.filter(function (j) { return j.bon && j.pris; }).length;
    h += '<div class="baby-arene' + (bulles ? ' bulles' : '') + '" role="group" aria-label="' + (bulles ? 'Bulles à éclater' : 'Jetons qui se baladent') + '">';
    c.jetons.forEach(function (j, i) {
      var cl = 'baby-jeton';
      if (j.pris) cl += j.bon ? ' trouve' : ' rate';
      if ((j.t === '6' || j.t === '9') && !bulles) cl += ' souligne'; // 6 et 9 penchés : soulignés pour ne pas les confondre
      // Place dans l'arène, de 0 à 1 (les bords gardent la place d'un demi-jeton et de sa balade).
      var px = Math.min(1, Math.max(0, (j.x - 10) / 80)).toFixed(3), py = Math.min(1, Math.max(0, (j.y - 12) / 76)).toFixed(3);
      var st = '--x:' + px + ';--y:' + py + ';--rot:' + (bulles ? 0 : j.rot) + 'deg;--dx:' + j.dx + 'px;--dy:' + j.dy + 'px;--dur:' + j.dur + 's';
      if (bulles && j.pris) return; // bulle éclatée
      h += '<button type="button" class="' + cl + '" data-j="' + i + '" style="' + st + '"' + (fait || j.pris ? ' disabled' : '') + '>' + echapper(j.t) + '</button>';
    });
    h += '</div><p class="baby-compte" aria-live="polite">' + (bulles ? 'Éclatées' : 'Trouvés') + ' : ' + trouves + ' / ' + aTrouver +
      (c.erreurs ? ' · ' + c.erreurs + ' erreur' + (c.erreurs > 1 ? 's' : '') : '') + '</p>';
    return h;
  }

  function ordre(c, fait) {
    var h = '';
    if (!fait) {
      h += '<div class="baby-rangee" role="group" aria-label="À ranger">' + c.elements.map(function (x, i) {
        return c.placees.indexOf(i) >= 0 ? '<span class="baby-tuile vide" aria-hidden="true">' + echapper(x) + '</span>'
          : '<button type="button" class="baby-tuile" data-o="' + i + '">' + echapper(x) + '</button>';
      }).join('') + '</div>';
    }
    var place = c.placees.map(function (i, k) {
      var x = c.elements[i];
      if (fait) return '<span class="baby-tuile posee ' + (x === c.bon[k] ? 'juste' : 'fausse') + '">' + echapper(x) + '</span>';
      return '<button type="button" class="baby-tuile posee" data-p="' + k + '" aria-label="' + echapper(x) + ', position ' + (k + 1) + ', toucher pour le retirer">' + echapper(x) + '</button>';
    }).join('');
    var reste = c.elements.length - c.placees.length;
    for (var k = 0; k < reste; k++) place += '<span class="baby-tuile attente" aria-hidden="true"></span>';
    return h + '<div class="baby-rangee baby-ligne" role="group" aria-label="Ta suite">' + place + '</div>';
  }

  function trier(c, fait) {
    var h = '';
    if (!fait) {
      h += '<div class="baby-rangee" role="group" aria-label="Lettres à ranger">' + c.elements.map(function (x, i) {
        if (c.rangs[i] !== null) return '';
        return '<button type="button" class="baby-tuile' + (c.pris === i ? ' choisi' : '') + '" data-t="' + i + '" aria-pressed="' + String(c.pris === i) + '">' + echapper(x) + '</button>';
      }).join('') + '</div>';
    }
    h += '<div class="baby-paniers">' + c.colonnes.map(function (nom, k) {
      var dedans = c.elements.map(function (x, i) {
        if (c.rangs[i] !== k) return '';
        if (fait) return '<span class="baby-tuile petite ' + (c.bonnes[i] === k ? 'juste' : 'fausse') + '">' + echapper(x) + '</span>';
        return '<button type="button" class="baby-tuile petite" data-t="' + i + '" aria-label="' + echapper(x) + ', dans le panier ' + nom + ', toucher pour la reprendre">' + echapper(x) + '</button>';
      }).join('');
      return '<div class="baby-panier-col"><button type="button" class="baby-panier-tete" data-col="' + k + '"' + (fait || c.pris == null ? ' disabled' : '') + '>' +
        '<span aria-hidden="true">🧺</span> ' + nom + '</button><div class="baby-panier-dedans">' + dedans + '</div></div>';
    }).join('') + '</div>';
    if (!fait) h += '<p class="baby-aide" aria-hidden="true">' + (c.pris != null ? 'Touche le bon panier.' : 'Touche une lettre, puis son panier.') + '</p>';
    return h;
  }

  // Fabrique à mots : le mot en haut, voyelles à gauche, consonnes à droite, une rangée de sons dessous.
  function fabrique(c, fait) {
    var mot = (c.pieces || []).map(function (p) { return '<span class="baby-piece' + (p.length > 1 ? ' son' : '') + '">' + echapper(p) + '</span>'; }).join('');
    var h = '<p class="baby-mot" aria-live="polite" aria-label="Ton mot : ' + echapper((c.pieces || []).join('') || 'vide') + '">' + (mot || '<span class="baby-mot-vide">…</span>') + '</p>';
    if (fait) return h;
    function touche(t, cl) { return '<button type="button" class="baby-touche ' + cl + '" data-a="' + echapper(t) + '">' + echapper(t) + '</button>'; }
    h += '<div class="baby-fabrique-cols">' +
      '<div class="baby-fab-col" role="group" aria-label="Voyelles"><p class="baby-fab-titre">Voyelles</p><div class="baby-touches">' + c.voyelles.map(function (t) { return touche(t, 'voy'); }).join('') + '</div></div>' +
      '<div class="baby-fab-col" role="group" aria-label="Consonnes"><p class="baby-fab-titre">Consonnes</p><div class="baby-touches">' + c.consonnes.map(function (t) { return touche(t, 'cons'); }).join('') + '</div></div></div>' +
      '<div class="baby-fab-col sons" role="group" aria-label="Sons"><p class="baby-fab-titre">Sons</p><div class="baby-touches">' + c.sons.map(function (t) { return touche(t, 'son'); }).join('') + '</div></div>';
    var vide = !(c.pieces || []).length;
    h += '<div class="baby-fab-actions">' +
      '<button type="button" class="btn btn-secondaire baby-effacer"' + (vide ? ' disabled' : '') + '><span aria-hidden="true">⌫</span> Effacer</button>' +
      '<button type="button" class="btn btn-bleu baby-lire"' + (vide ? ' disabled' : '') + '><span aria-hidden="true">🔊</span> Lire</button>' +
      '<button type="button" class="btn btn-principal baby-fini"' + (c.lu && !vide ? '' : ' disabled') + '>J’ai fini</button></div>';
    return h;
  }

  // ---------- Gestes ----------
  // o : { afficher(), repondre(reponse, texte), sauver(), focus(sel), attendre(fn) } ; renvoie true si le geste est traité ici.
  function toucher(c, e, o) {
    var b;
    if (c.meca === 'attrape' || c.meca === 'bulles') {
      if (!(b = e.target.closest('.baby-jeton'))) return false;
      var j = c.jetons[Number(b.dataset.j)];
      if (!j || j.pris) return true;
      if (c.meca === 'bulles') {
        if (j.t === c.bon[c.suivant]) { j.pris = true; j.bon = true; c.suivant++; }
        else { c.erreurs++; secouer(b); o.sauver(); return true; }
      } else {
        j.pris = true;
        if (!j.bon) c.erreurs++;
      }
      o.afficher(); o.sauver();
      var fini = c.meca === 'bulles' ? c.suivant === c.bon.length : c.jetons.every(function (x) { return !x.bon || x.pris; });
      if (fini) o.attendre(function () { o.repondre(c.erreurs, c.erreurs + ' erreur' + (c.erreurs > 1 ? 's' : '')); });
      return true;
    }
    if (c.meca === 'ordre') {
      if ((b = e.target.closest('.baby-tuile[data-o]'))) {
        c.placees.push(Number(b.dataset.o));
        o.afficher(); o.sauver();
        if (c.placees.length === c.elements.length) {
          o.attendre(function () { var rep = c.placees.map(function (i) { return c.elements[i]; }); o.repondre(rep, rep.join(', ')); });
        } else o.focus('.baby-tuile[data-o]');
        return true;
      }
      if ((b = e.target.closest('.baby-tuile[data-p]'))) { c.placees.splice(Number(b.dataset.p), 1); o.afficher(); o.focus('.baby-tuile[data-o]'); o.sauver(); return true; }
      return false;
    }
    if (c.meca === 'trier') {
      var col = e.target.closest('.baby-panier-tete');
      if ((b = e.target.closest('.baby-tuile[data-t]'))) {
        var i = Number(b.dataset.t);
        if (c.rangs[i] !== null) { c.rangs[i] = null; c.pris = i; } else c.pris = c.pris === i ? null : i;
        o.afficher(); o.focus(c.pris != null ? '.baby-panier-tete' : '.baby-tuile[data-t]'); o.sauver();
        return true;
      }
      if (col && c.pris != null) {
        c.rangs[c.pris] = Number(col.dataset.col); c.pris = null;
        o.afficher(); o.focus('.baby-tuile[data-t]'); o.sauver();
        if (c.rangs.every(function (r) { return r !== null; })) {
          o.attendre(function () {
            var n = c.rangs.filter(function (k, x) { return k === c.bonnes[x]; }).length;
            o.repondre(c.rangs.slice(), n + ' lettre' + (n > 1 ? 's' : '') + ' bien rangée' + (n > 1 ? 's' : '') + ' sur ' + c.rangs.length);
          });
        }
        return true;
      }
      return false;
    }
    if (c.meca === 'fabrique') {
      if ((b = e.target.closest('.baby-touche'))) {
        if (c.pieces.length < 10) { c.pieces.push(b.dataset.a); c.lu = false; }
        o.afficher(); o.focus('.baby-touche[data-a="' + b.dataset.a + '"]'); o.sauver();
        return true;
      }
      if (e.target.closest('.baby-effacer')) { c.pieces.pop(); c.lu = false; o.afficher(); o.focus(c.pieces.length ? '.baby-effacer' : '.baby-touche'); o.sauver(); return true; }
      if (e.target.closest('.baby-lire')) {
        if (racine.Voix) racine.Voix.lire(B().motLu(c));
        c.lu = true; o.afficher(); o.focus('.baby-fini'); o.sauver();
        return true;
      }
      if (e.target.closest('.baby-fini') && c.lu && c.pieces.length) { var m = c.pieces.join(''); o.repondre(m, m); return true; }
      return false;
    }
    return false;
  }
  // Mauvaise bulle : elle tremble (rien d'autre ne change).
  function secouer(b) {
    b.classList.remove('secoue');
    void b.offsetWidth; // relance l'animation
    b.classList.add('secoue');
  }

  racine.BabyCarte = { html: html, toucher: toucher, des: des, mains: mains };
})(this);
