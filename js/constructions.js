// Ce que l'équipe construit pendant l'aventure, étape par étape (affiché sous les points, sur le plateau).
// Chaque construction est un petit dessin (viewBox 200 × 120) découpé en étapes : à P points sur un objectif O,
// on montre floor(P / O × nombre d'étapes) étapes ; tout est construit quand l'objectif est atteint.
// Hypothèses pour les aventures sans histoire (à valider) : Égypte = pyramide, Chine = muraille,
// Far West = voie ferrée, Druides = cercle de pierres, Incas = temple en terrasses.
(function (racine) {
  'use strict';

  var E = '#2a1c14';
  var T = 'stroke="' + E + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  function p(d, fill) { return '<path d="' + d + '" fill="' + fill + '" ' + T + '/>'; }
  function r(x, y, w, h, fill) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '" ' + T + '/>'; }
  function c(x, y, rr, fill) { return '<circle cx="' + x + '" cy="' + y + '" r="' + rr + '" fill="' + fill + '" ' + T + '/>'; }
  function range(n) { var t = []; for (var i = 0; i < n; i++) t.push(i); return t; }

  // Chaque construction : décor (toujours visible) + liste d'étapes (morceaux de SVG), dans l'ordre de construction.
  var CONSTRUCTIONS = {
    // Drakkar : quille, bordages, proue, poupe, mât, voile, boucliers.
    viking: {
      nom: 'le drakkar',
      decor: '<path d="M0 100 H200 V120 H0 Z" fill="#3f7fae"/><path d="M10 108 h30 M80 112 h40 M150 106 h30" stroke="#bfe0f2" stroke-width="2"/>',
      etapes: [
        p('M30 92 C70 104 130 104 170 92 L168 96 C130 108 70 108 32 96 Z', '#7a4b22'),
        p('M26 84 C70 96 130 96 174 84 L170 92 C130 104 70 104 30 92 Z', '#8a5530'),
        p('M22 76 C70 88 130 88 178 76 L174 84 C130 96 70 96 26 84 Z', '#9a6238'),
        p('M178 76 C176 62 184 52 194 54 C198 60 194 66 188 64 L184 78 Z', '#8a5530') + '<circle cx="191" cy="58" r="1.4" fill="' + E + '"/>',
        p('M22 76 C18 66 20 58 26 56 L28 76 Z', '#8a5530'),
        r(98, 22, 5, 64, '#7a4b22'),
        p('M66 26 Q100 20 136 26 Q140 50 134 70 Q100 74 70 70 Q62 50 66 26 Z', '#efe6cf') +
          '<path d="M78 25 L80 71 M94 23 L95 72 M110 23 L109 72 M124 25 L122 71" stroke="#b8332a" stroke-width="7"/>' +
          p('M66 26 Q100 20 136 26 Q140 50 134 70 Q100 74 70 70 Q62 50 66 26 Z', 'none')
      ].concat(range(6).map(function (k) { return c(46 + k * 22, 82, 7, ['#d9a62e', '#b8332a', '#2f5d8a'][k % 3]); }))
    },
    // Épées forgées, accrochées une à une au râtelier.
    chevalier: {
      nom: 'les épées',
      decor: r(14, 30, 172, 8, '#7a4b22') + r(14, 98, 172, 8, '#7a4b22') + r(10, 26, 8, 84, '#5b3a1e') + r(182, 26, 8, 84, '#5b3a1e'),
      etapes: range(10).map(function (k) {
        var x = 30 + k * 15.5;
        return p('M' + (x - 2.5) + ' 44 L' + (x + 2.5) + ' 44 L' + (x + 2) + ' 96 L' + x + ' 100 L' + (x - 2) + ' 96 Z', '#c9d0d6') +
          r(x - 7, 40, 14, 4, '#d9a62e') + r(x - 1.5, 32, 3, 8, '#5b3a1e');
      })
    },
    // Grand feu : cercle de pierres, bûches, flammes de plus en plus hautes.
    prehistoire: {
      nom: 'le grand feu',
      decor: '<path d="M0 104 H200 V120 H0 Z" fill="#4a2e1e"/>',
      etapes: [
        c(60, 102, 9, '#8b8b83') + c(140, 102, 9, '#8b8b83'),
        c(80, 106, 9, '#9a9a90') + c(120, 106, 9, '#9a9a90') + c(100, 108, 9, '#8b8b83'),
        p('M62 98 L138 86 L140 94 L64 106 Z', '#7a4b22'),
        p('M62 86 L138 98 L136 106 L60 94 Z', '#8a5a2b'),
        p('M100 60 C112 72 122 80 118 92 C114 100 86 100 82 92 C78 80 90 74 100 60 Z', '#e8562a'),
        p('M100 36 C118 56 132 70 126 90 C120 102 80 102 74 90 C68 70 86 58 100 36 Z', '#e8562a') +
          p('M100 62 C110 74 116 82 112 92 C108 100 92 100 88 92 C84 82 92 76 100 62 Z', '#f6c44a'),
        p('M100 10 C124 40 146 60 136 92 C128 108 72 108 64 92 C54 62 80 42 100 10 Z', '#e8562a') +
          p('M100 44 C116 62 124 76 118 92 C112 104 88 104 82 92 C76 76 88 62 100 44 Z', '#f6c44a') +
          p('M100 74 C106 82 108 88 106 94 C102 100 96 100 94 94 C92 88 96 82 100 74 Z', '#fff2b0')
      ]
    },
    // Pyramide maya : 5 gradins, l'escalier, le temple au sommet.
    mayas: {
      nom: 'la pyramide',
      decor: '<path d="M0 104 H200 V120 H0 Z" fill="#3f7a46"/>',
      etapes: range(5).map(function (k) {
        var y = 104 - k * 15, w = 170 - k * 30;
        return p('M' + (100 - w / 2) + ' ' + y + ' H' + (100 + w / 2) + ' L' + (100 + w / 2 - 10) + ' ' + (y - 15) + ' H' + (100 - w / 2 + 10) + ' Z', '#d6cbb0');
      }).concat([
        p('M92 104 H108 L104 29 H96 Z', '#bfb08e') + '<path d="M93 96 h14 M94 86 h12 M94 76 h12 M95 66 h10 M95 56 h10 M96 46 h8 M96 36 h8" stroke="' + E + '" stroke-width="1.2"/>',
        r(86, 14, 28, 15, '#d6cbb0') + p('M82 14 H118 L112 6 H88 Z', '#c4b796') + '<rect x="96" y="18" width="8" height="11" fill="' + E + '"/>'
      ])
    },
    // Savane : les gazelles chassées pour nourrir la meute.
    savane: {
      nom: 'la réserve de gazelles',
      decor: '<path d="M0 104 H200 V120 H0 Z" fill="#c99a44"/>',
      etapes: range(10).map(function (k) {
        var x = 22 + (k % 5) * 38, y = k < 5 ? 58 : 98;
        return '<g transform="translate(' + x + ' ' + y + ') scale(.55)">' +
          p('M-30 0 C-32 -16 12 -20 20 -6 L26 -26 C28 -32 34 -32 36 -24 L32 -4 C30 8 -26 10 -30 0 Z', '#c27a3a') +
          '<path d="M-24 6 V28 M-12 8 V28 M12 8 V28 M24 4 V28 M28 -28 C26 -40 22 -44 18 -48 M34 -28 C34 -40 38 -44 42 -48" stroke="' + E + '" stroke-width="3" fill="none"/></g>';
      })
    },
    // Pyramide d'Égypte : rangées de blocs du bas vers le haut, puis la pointe dorée.
    egypte: {
      nom: 'la pyramide',
      decor: '<path d="M0 104 H200 V120 H0 Z" fill="#ecd08e"/>',
      etapes: range(6).map(function (k) {
        var y = 104 - k * 14, demi = 84 - k * 14;
        return p('M' + (100 - demi) + ' ' + y + ' H' + (100 + demi) + ' L' + (100 + demi - 14) + ' ' + (y - 14) + ' H' + (100 - demi + 14) + ' Z', k % 2 ? '#e2bf72' : '#d9b264');
      }).concat([p('M86 20 L100 4 L114 20 Z', '#f4d566')])
    },
    // Grande Muraille : tronçons de mur et tours de guet.
    chine: {
      nom: 'la muraille',
      decor: '<path d="M0 100 C60 90 140 92 200 84 V120 H0 Z" fill="#5f9a52"/>',
      etapes: range(8).map(function (k) {
        var x = 4 + k * 24, y = 92 - k * 2.4;
        var mur = r(x, y - 16, 24, 16, '#cdb68c') + r(x + 2, y - 22, 6, 6, '#cdb68c') + r(x + 14, y - 22, 6, 6, '#cdb68c');
        if (k === 2 || k === 6) mur += r(x + 2, y - 46, 20, 30, '#d6c29a') + p('M' + (x - 4) + ' ' + (y - 44) + ' Q' + (x + 12) + ' ' + (y - 62) + ' ' + (x + 28) + ' ' + (y - 44) + ' Z', '#a8332a');
        return mur;
      })
    },
    // Far West : la voie ferrée avance, traverse par traverse, jusqu'à l'arrivée du train.
    'far-west': {
      nom: 'la voie ferrée',
      decor: '<path d="M0 96 H200 V120 H0 Z" fill="#dc9454"/>',
      etapes: range(8).map(function (k) {
        var x = 6 + k * 24;
        return r(x, 98, 6, 14, '#7a4b22') + r(x + 12, 98, 6, 14, '#7a4b22') + r(x - 2, 100, 26, 3, '#7d7d76') + r(x - 2, 107, 26, 3, '#7d7d76');
      }).concat([
        r(120, 60, 50, 30, '#2f5d8a') + r(160, 42, 20, 48, '#2f5d8a') + p('M126 60 V44 H140 V60 Z', '#3b3b3b') + p('M122 44 h22 l-4 -8 h-14 Z', '#3b3b3b') +
          c(132, 92, 8, '#b8332a') + c(156, 92, 8, '#b8332a') + c(174, 94, 6, '#b8332a') + '<path d="M120 76 h-10 l-6 12 h16" fill="#d9a62e" stroke="' + E + '" stroke-width="2"/>'
      ])
    },
    // Druides : les pierres levées une à une, puis les linteaux.
    druides: {
      nom: 'le cercle de pierres',
      decor: '<path d="M0 104 H200 V120 H0 Z" fill="#6f9a3e"/>',
      etapes: range(6).map(function (k) {
        var x = 14 + k * 30;
        return p('M' + x + ' 104 L' + (x + 1) + ' 52 Q' + (x + 10) + ' 46 ' + (x + 19) + ' 52 L' + (x + 20) + ' 104 Z', '#9d9a92');
      }).concat([r(10, 40, 62, 12, '#a7a49c'), r(70, 40, 62, 12, '#a7a49c'), r(130, 40, 62, 12, '#a7a49c')])
    },
    // Incas : terrasses, maisons au toit de chaume, puis le temple.
    incas: {
      nom: 'le temple en terrasses',
      decor: '<path d="M0 108 H200 V120 H0 Z" fill="#7fa64a"/>',
      etapes: range(4).map(function (k) {
        return r(10 + k * 16, 96 - k * 12, 180 - k * 32, 12, k % 2 ? '#8db857' : '#9bc463');
      }).concat([
        r(40, 46, 24, 14, '#c9c0ac') + p('M36 46 L52 34 L68 46 Z', '#c49a4a'),
        r(136, 46, 24, 14, '#c9c0ac') + p('M132 46 L148 34 L164 46 Z', '#c49a4a'),
        r(84, 30, 32, 30, '#c9c0ac') + p('M78 30 L100 10 L122 30 Z', '#c49a4a') + '<rect x="96" y="44" width="8" height="16" fill="' + E + '"/>'
      ])
    }
  };

  // Nombre d'étapes à montrer pour P points sur un objectif O (toutes quand P ≥ O).
  function etapesVisibles(id, points, objectif) {
    var n = CONSTRUCTIONS[id].etapes.length;
    if (points >= objectif) return n;
    return Math.max(0, Math.min(n, Math.floor(points / objectif * n)));
  }

  // Dessin complet : chaque étape dans un groupe <g class="etape" data-n="k"> (masqué tant qu'il n'est pas construit).
  function svg(id) {
    var cst = CONSTRUCTIONS[id];
    return '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" focusable="false">' + cst.decor +
      cst.etapes.map(function (e, k) { return '<g class="etape" data-n="' + k + '">' + e + '</g>'; }).join('') + '</svg>';
  }

  var api = { CONSTRUCTIONS: CONSTRUCTIONS, etapesVisibles: etapesVisibles, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Constructions = api;
})(this);
