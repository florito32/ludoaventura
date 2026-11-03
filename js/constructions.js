// Ce que l'équipe construit pendant l'aventure, étape par étape (affiché sous les points, sur le plateau).
// Chaque construction est un petit dessin (viewBox 200 × 120) découpé en étapes : à P points sur un objectif O,
// on montre floor(P / O × nombre d'étapes) étapes ; tout est construit quand l'objectif est atteint.
// v5.5 : graphisme redessiné dans le style des images des histoires (décor peint de chaque aventure,
// contour à l'encre, ombres, reflets et hachures). La progression (étapes et leur nombre) est inchangée.
// Hypothèses pour les aventures sans histoire (à valider) : Égypte = pyramide, Chine = muraille,
// Far West = voie ferrée, Druides = cercle de pierres, Incas = temple en terrasses.
(function (racine) {
  'use strict';

  var E = '#2b1d14'; // encre
  var T = 'stroke="' + E + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
  function p(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '" ' + T + (extra || '') + '/>'; }
  function r(x, y, w, h, fill, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + fill + '" ' + T + '/>'; }
  function c(x, y, rr, fill) { return '<circle cx="' + x + '" cy="' + y + '" r="' + rr + '" fill="' + fill + '" ' + T + '/>'; }
  // Traits sans remplissage (hachures, détails), couleur et épaisseur au choix.
  function trait(d, coul, ep, op) { return '<path d="' + d + '" fill="none" stroke="' + (coul || E) + '" stroke-width="' + (ep || 1) + '" stroke-linecap="round"' + (op ? ' opacity="' + op + '"' : '') + '/>'; }
  // Forme sans contour (ombre, lumière, décor lointain).
  function aplat(d, fill, op) { return '<path d="' + d + '" fill="' + fill + '"' + (op ? ' opacity="' + op + '"' : '') + '/>'; }
  function range(n) { var t = []; for (var i = 0; i < n; i++) t.push(i); return t; }
  // Ciel en dégradé (identifiant propre à chaque aventure).
  function ciel(id, haut, bas) {
    return '<defs><linearGradient id="ciel-' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + haut + '"/>' +
      '<stop offset="1" stop-color="' + bas + '"/></linearGradient></defs><rect width="200" height="120" fill="url(#ciel-' + id + ')"/>';
  }
  function nuage(x, y, s) {
    return aplat('M' + x + ' ' + y + ' q' + 6 * s + ' -' + 5 * s + ' ' + 12 * s + ' 0 q' + 6 * s + ' -' + 6 * s + ' ' + 14 * s + ' 0 q' + 6 * s + ' 0 ' + 6 * s + ' ' + 3 * s + ' h-' + 32 * s + ' z', '#ffffff', '.75');
  }
  // Montagnes lointaines (grises, sommets enneigés, hachures du style des histoires).
  function montagnes(base, coul) {
    return p('M0 ' + base + ' L18 ' + (base - 30) + ' L30 ' + (base - 18) + ' L50 ' + (base - 40) + ' L72 ' + (base - 14) + ' L96 ' + (base - 34) + ' L118 ' + (base - 10) +
      ' L146 ' + (base - 42) + ' L170 ' + (base - 16) + ' L188 ' + (base - 32) + ' L200 ' + (base - 22) + ' V' + base + ' Z', coul) +
      aplat('M50 ' + (base - 40) + ' L44 ' + (base - 30) + ' L50 ' + (base - 33) + ' L55 ' + (base - 29) + ' Z M146 ' + (base - 42) + ' L139 ' + (base - 31) + ' L146 ' + (base - 35) + ' L152 ' + (base - 31) + ' Z M18 ' + (base - 30) + ' L13 ' + (base - 23) + ' L19 ' + (base - 25) + ' Z', '#f4f6f8') +
      trait('M54 ' + (base - 26) + ' l5 8 M60 ' + (base - 22) + ' l4 7 M150 ' + (base - 28) + ' l5 9 M156 ' + (base - 24) + ' l4 7 M100 ' + (base - 22) + ' l4 7', E, .8, '.5');
  }
  function herbe(y, coul, n) {
    return range(n).map(function (k) { var x = 4 + k * (192 / (n - 1)); return trait('M' + x + ' ' + y + ' l-2 -5 M' + (x + 2) + ' ' + y + ' l1 -6 M' + (x + 4) + ' ' + y + ' l3 -4', coul, 1.1); }).join('');
  }

  // Chaque construction : décor (toujours visible) + liste d'étapes (morceaux de SVG), dans l'ordre de construction.
  var CONSTRUCTIONS = {
    // Drakkar : quille, bordages, proue, poupe, mât, voile, boucliers (fjord, comme l'image Viking).
    viking: {
      nom: 'le drakkar',
      decor: ciel('viking', '#8fc3e6', '#dcefff') + nuage(20, 18, 1.1) + nuage(132, 12, .9) + montagnes(78, '#9aa3a8') +
        p('M0 74 H200 V120 H0 Z', '#4f8fbd') + aplat('M0 74 H200 V80 H0 Z', '#7fb3d6') +
        trait('M8 90 h24 M50 98 h30 M120 104 h34 M164 92 h26 M30 110 h20 M90 114 h24', '#d4ecfa', 1.4),
      etapes: [
        // quille
        p('M30 94 C70 106 130 106 170 94 L167 99 C130 110 70 110 33 99 Z', '#6b3d1c') + trait('M44 101 C80 108 120 108 156 101', '#3d2210', .8, '.6'),
        // bordage du bas
        p('M26 86 C70 98 130 98 174 86 L170 94 C130 106 70 106 30 94 Z', '#8a5530') + trait('M34 92 C76 102 124 102 166 92', '#4a2a14', .9, '.7'),
        // bordage du haut
        p('M22 78 C70 90 130 90 178 78 L174 86 C130 98 70 98 26 86 Z', '#a0683a') + trait('M30 83 C74 94 126 94 170 83', '#5b3418', .9, '.7') +
          aplat('M40 81 C80 90 120 90 160 81 L160 82.5 C120 91.5 80 91.5 40 82.5 Z', '#d29a62', '.7'),
        // proue en tête de dragon
        p('M178 78 C178 62 184 50 194 50 C199 54 197 62 191 61 L186 66 L184 80 Z', '#8a5530') + c(192, 55, 1.4, E) +
          trait('M186 58 l-3 -4 M188 64 l-3 2', E, 1),
        // poupe enroulée
        p('M22 78 C14 70 14 58 22 54 C28 54 28 60 24 62 L28 78 Z', '#8a5530'),
        // mât
        r(97.5, 18, 5, 70, '#6b3d1c') + trait('M99 24 v58', '#a0683a', 1, '.8'),
        // voile rayée rouge et blanc
        p('M64 24 Q100 18 138 24 Q143 48 136 70 Q100 75 68 70 Q60 48 64 24 Z', '#f2e9d2') +
          '<path d="M77 23 L79 71 M93 21 L94 73 M109 21 L108 73 M125 23 L123 71" stroke="#b8332a" stroke-width="8"/>' +
          trait('M70 34 Q100 30 132 34 M70 52 Q100 48 134 52', '#7a1f18', .8, '.45') +
          p('M64 24 Q100 18 138 24 Q143 48 136 70 Q100 75 68 70 Q60 48 64 24 Z', 'none')
      ].concat(range(6).map(function (k) {
        var x = 46 + k * 22, coul = ['#d9a62e', '#b8332a', '#2f5d8a', '#f2e9d2', '#b8332a', '#2f6e4a'][k];
        return c(x, 84, 7.5, coul) + trait('M' + (x - 7) + ' 84 h14 M' + x + ' 77 v14', E, .9, '.55') + c(x, 84, 2.2, '#c9c0ac');
      }))
    },
    // Épées forgées, accrochées une à une au râtelier (paysage de château, comme l'image Chevalier).
    chevalier: {
      nom: 'les épées',
      decor: ciel('chevalier', '#8cc4ea', '#e2f2ff') + nuage(150, 14, 1) + montagnes(84, '#a3a7a4') +
        p('M0 92 C50 82 120 86 200 80 V120 H0 Z', '#6aa84f') + herbe(112, '#3f7a2e', 12) +
        // râtelier en bois (veinures)
        r(12, 28, 176, 8, '#8a5530', 2) + r(12, 98, 176, 8, '#8a5530', 2) + r(8, 22, 9, 90, '#6b3d1c', 2) + r(183, 22, 9, 90, '#6b3d1c', 2) +
        trait('M20 32 h40 M80 31 h50 M140 33 h40 M22 102 h50 M100 101 h70', '#4a2a14', .8, '.6'),
      etapes: range(10).map(function (k) {
        var x = 30 + k * 15.5;
        return p('M' + (x - 2.8) + ' 46 L' + (x + 2.8) + ' 46 L' + (x + 2.2) + ' 95 L' + x + ' 101 L' + (x - 2.2) + ' 95 Z', '#cfd6dc') +
          trait('M' + (x - .6) + ' 48 V94', '#ffffff', .9, '.9') + trait('M' + (x + 1.2) + ' 48 V94', '#7d8790', .7, '.8') +
          r(x - 7.5, 42, 15, 4, '#d9a62e', 1.5) + r(x - 1.7, 33, 3.4, 9, '#6b3d1c', 1) + c(x, 31.5, 2.4, '#d9a62e');
      })
    },
    // Grand feu : cercle de pierres, bûches, flammes de plus en plus hautes (grotte ornée, comme l'image Préhistoire).
    prehistoire: {
      nom: 'le grand feu',
      decor: ciel('prehistoire', '#3d2416', '#7a4a28') +
        // stalactites et parois
        p('M0 0 H200 V10 L190 26 L182 12 L168 30 L158 10 L140 22 L128 8 L110 24 L96 8 L80 28 L66 10 L50 22 L36 8 L20 26 L10 10 L0 18 Z', '#5a3520') +
        // peinture rupestre (mammouth et cerf à l'ocre)
        trait('M150 40 c4 -8 18 -8 22 0 c2 4 0 10 -2 12 M154 48 v8 M168 48 v8 M150 40 c-4 2 -6 8 -4 14', '#c0592b', 1.6, '.8') +
        trait('M24 46 c6 -4 14 -4 18 0 M28 46 v8 M38 46 v8 M42 46 l4 -6 M44 42 l3 -3 M46 44 l4 -2', '#c0592b', 1.4, '.8') +
        p('M0 104 C40 98 160 98 200 104 V120 H0 Z', '#4a2e1e') + trait('M20 112 h20 M150 110 h24', '#2b1a10', 1, '.6'),
      etapes: [
        c(60, 102, 9, '#8b8b83') + c(140, 102, 9, '#8b8b83') + trait('M55 99 a6 6 0 0 1 8 -3 M135 99 a6 6 0 0 1 8 -3', '#c9c9c0', 1, '.8'),
        c(80, 106, 9, '#9a9a90') + c(120, 106, 9, '#9a9a90') + c(100, 108, 9, '#8b8b83') + trait('M95 105 a6 6 0 0 1 8 -3', '#c9c9c0', 1, '.8'),
        p('M62 98 L138 86 L140 94 L64 106 Z', '#7a4b22') + trait('M70 100 L134 90', '#4a2a14', .8, '.7') + c(139, 90, 3.5, '#c99a6a'),
        p('M62 86 L138 98 L136 106 L60 94 Z', '#8a5a2b') + trait('M66 92 L132 102', '#4a2a14', .8, '.7') + c(61, 90, 3.5, '#c99a6a'),
        aplat('M100 50 C126 70 132 104 100 104 C68 104 74 70 100 50 Z', '#ffb347', '.25') +
          p('M100 60 C112 72 122 80 118 92 C114 100 86 100 82 92 C78 80 90 74 100 60 Z', '#e8562a'),
        aplat('M100 26 C140 56 146 108 100 108 C54 108 60 56 100 26 Z', '#ffb347', '.25') +
          p('M100 36 C118 56 132 70 126 90 C120 102 80 102 74 90 C68 70 86 58 100 36 Z', '#e8562a') +
          p('M100 62 C110 74 116 82 112 92 C108 100 92 100 88 92 C84 82 92 76 100 62 Z', '#f6c44a'),
        aplat('M100 2 C156 40 160 110 100 110 C40 110 44 40 100 2 Z', '#ffb347', '.25') +
          p('M100 10 C124 40 146 60 136 92 C128 108 72 108 64 92 C54 62 80 42 100 10 Z', '#e8562a') +
          p('M100 44 C116 62 124 76 118 92 C112 104 88 104 82 92 C76 76 88 62 100 44 Z', '#f6c44a') +
          p('M100 74 C106 82 108 88 106 94 C102 100 96 100 94 94 C92 88 96 82 100 74 Z', '#fff2b0') +
          c(70, 30, 1.4, '#ffd27a') + c(132, 24, 1.2, '#ffd27a') + c(118, 12, 1, '#ffd27a')
      ]
    },
    // Pyramide maya : 5 gradins, l'escalier, le temple au sommet (jungle, soleil rouge, comme l'image Mayas).
    mayas: {
      nom: 'la pyramide',
      decor: ciel('mayas', '#9fd0e8', '#e8f4ec') + c(170, 18, 10, '#d9734a') +
        p('M0 104 C20 92 36 96 50 100 C66 90 84 98 96 104 V120 H0 Z', '#3f7a46') +
        p('M104 104 C120 94 140 96 152 100 C168 90 186 94 200 98 V120 H104 Z', '#3f7a46') + p('M0 108 H200 V120 H0 Z', '#2f6638') +
        trait('M8 104 l4 -8 l4 8 M30 102 l3 -7 l3 7 M170 102 l4 -8 l4 8 M186 100 l3 -7 l3 7', '#2a5a2e', 1.2),
      etapes: range(5).map(function (k) {
        var y = 106 - k * 15, w = 170 - k * 30, g = 100 - w / 2, d = 100 + w / 2;
        return p('M' + g + ' ' + y + ' H' + d + ' L' + (d - 10) + ' ' + (y - 15) + ' H' + (g + 10) + ' Z', '#d8ccb0') +
          aplat('M' + (d - 22) + ' ' + y + ' H' + d + ' L' + (d - 10) + ' ' + (y - 15) + ' H' + (d - 26) + ' Z', '#a99a78', '.6') +
          trait('M' + (g + 8) + ' ' + (y - 7) + ' H' + (d - 8), E, .8, '.5') +
          trait(range(Math.max(2, Math.round(w / 18))).map(function (i) { var x = g + 14 + i * 18; return 'M' + x + ' ' + (y - 13) + ' v5'; }).join(' '), E, .7, '.45');
      }).concat([
        p('M91 106 H109 L104 31 H96 Z', '#c4b796') + trait('M92 98 h16 M93 88 h14 M93 78 h14 M94 68 h12 M95 58 h10 M95 48 h10 M96 38 h8', E, 1.1),
        r(85, 15, 30, 16, '#d8ccb0') + p('M81 15 H119 L113 6 H87 Z', '#c4b796') + '<rect x="96" y="20" width="8" height="11" fill="' + E + '"/>' +
          trait('M88 11 h24', E, .8, '.5')
      ])
    },
    // Savane : les gazelles chassées pour nourrir la meute (coucher de soleil, acacia, comme l'image Savane).
    savane: {
      nom: 'la réserve de gazelles',
      decor: ciel('savane', '#e8783e', '#f6c27a') + c(150, 52, 13, '#f8d878') +
        p('M90 66 L120 46 L140 58 L162 44 L200 62 V70 H90 Z', '#8d6a8e') +
        // acacia
        p('M30 70 L34 46 L28 38 L33 37 L38 44 L42 34 L46 35 L42 48 L40 70 Z', '#4a3020') +
        p('M6 34 C14 22 60 20 70 32 C62 38 16 40 6 34 Z', '#4f7a34') +
        p('M0 66 H200 V120 H0 Z', '#d6a64e') + aplat('M0 66 H200 V72 H0 Z', '#e8c070') +
        trait('M6 80 l2 -6 M20 90 l2 -6 M120 84 l2 -6 M176 94 l2 -6 M60 114 l2 -6 M150 116 l2 -6 M96 110 l2 -6', '#9a6e28', 1.1),
      etapes: range(10).map(function (k) {
        var x = 22 + (k % 5) * 38, y = k < 5 ? 66 : 104;
        return '<g transform="translate(' + x + ' ' + y + ') scale(.5)">' +
          // pattes
          trait('M-22 4 V30 M-12 6 V30 M12 6 V30 M22 4 V30', E, 3.4) +
          // corps fauve, ventre blanc, bande sombre
          p('M-30 0 C-32 -18 14 -22 22 -6 L28 -24 C30 -32 38 -32 38 -24 L34 -2 C30 10 -26 12 -30 0 Z', '#c98a4a') +
          aplat('M-26 2 C-10 8 14 8 28 2 C24 8 -18 10 -26 2 Z', '#f4ead8') +
          trait('M-26 -2 C-8 2 12 2 26 -4', '#5a3418', 2.4, '.8') +
          // cornes en lyre, œil, queue
          trait('M30 -28 C26 -42 22 -46 18 -50 M36 -28 C36 -42 40 -46 44 -50', E, 2.6) + c(33, -22, 1.4, E) +
          trait('M-30 -4 l-6 6', E, 2.2) + '</g>';
      })
    },
    // Pyramide d'Égypte : rangées de blocs du bas vers le haut, puis la pointe dorée (désert et palmiers, comme l'image Égypte).
    egypte: {
      nom: 'la pyramide',
      decor: ciel('egypte', '#a8d4ee', '#f4ead0') + nuage(28, 16, .9) +
        p('M0 100 C40 92 80 96 120 100 C150 94 180 92 200 96 V120 H0 Z', '#ecd08e') +
        trait('M10 108 c8 -3 16 -3 24 0 M150 110 c8 -3 16 -3 24 0', '#c9a45a', 1.1) +
        // palmier
        p('M182 104 C180 90 184 76 186 66 L189 66 C188 78 186 92 186 104 Z', '#8a5530') +
        p('M187 66 C178 58 168 60 162 66 C172 62 180 64 187 68 Z M187 66 C196 56 200 58 200 62 C196 60 192 62 188 68 Z M187 66 C186 56 180 52 176 52 C182 56 186 60 187 68 Z', '#4f8a3a'),
      etapes: range(6).map(function (k) {
        var y = 106 - k * 14, demi = 84 - k * 14, g = 100 - demi, d = 100 + demi;
        return p('M' + g + ' ' + y + ' H' + d + ' L' + (d - 14) + ' ' + (y - 14) + ' H' + (g + 14) + ' Z', k % 2 ? '#e6c47a' : '#dcb466') +
          aplat('M100 ' + y + ' H' + d + ' L' + (d - 14) + ' ' + (y - 14) + ' H100 Z', '#b98d44', '.45') +
          trait(range(Math.max(1, Math.round((2 * demi - 28) / 14))).map(function (i) { var x = g + 16 + i * 14; return 'M' + x + ' ' + (y - 13) + ' v12'; }).join(' '), E, .7, '.45');
      }).concat([p('M86 22 L100 6 L114 22 Z', '#f4d566') + aplat('M100 6 L114 22 H100 Z', '#d9a62e', '.7') + trait('M95 14 l3 -3', '#fff8d0', 1.2)])
    },
    // Grande Muraille : tronçons de mur et tours de guet (montagnes en pain de sucre, comme l'image Chine).
    chine: {
      nom: 'la muraille',
      decor: ciel('chine', '#a6d6ea', '#e6f4ea') +
        p('M0 70 C6 40 16 40 22 70 C28 44 36 36 44 70 C52 42 60 46 66 70 Z', '#7fae8a') +
        p('M120 70 C126 38 138 36 144 70 C152 46 160 40 168 70 C176 44 188 42 200 70 Z', '#7fae8a') +
        trait('M10 60 l3 -10 M34 58 l3 -12 M130 58 l3 -12 M156 60 l3 -10 M186 60 l3 -10', E, .8, '.4') +
        p('M0 104 C60 92 140 94 200 84 V120 H0 Z', '#5f9a52') +
        trait('M0 112 C50 104 120 104 200 96 M0 118 C60 110 130 110 200 104', '#3f7a3a', 1.2, '.8'),
      etapes: range(8).map(function (k) {
        var x = 4 + k * 24, y = 94 - k * 2.4;
        var mur = r(x, y - 16, 24, 16, '#cdb68c') + trait('M' + x + ' ' + (y - 8) + ' h24 M' + (x + 8) + ' ' + (y - 16) + ' v8 M' + (x + 16) + ' ' + (y - 8) + ' v8', E, .7, '.55') +
          r(x + 2, y - 22, 6, 6, '#cdb68c') + r(x + 14, y - 22, 6, 6, '#cdb68c') + aplat('M' + x + ' ' + (y - 3) + ' h24 v3 h-24 z', '#9a845c', '.6');
        if (k === 2 || k === 6) {
          mur += r(x + 2, y - 46, 20, 30, '#d6c29a') + '<rect x="' + (x + 9) + '" y="' + (y - 36) + '" width="6" height="8" fill="' + E + '"/>' +
            p('M' + (x - 5) + ' ' + (y - 44) + ' Q' + (x + 12) + ' ' + (y - 50) + ' ' + (x + 29) + ' ' + (y - 44) + ' L' + (x + 24) + ' ' + (y - 50) + ' Q' + (x + 12) + ' ' + (y - 62) + ' ' + x + ' ' + (y - 50) + ' Z', '#b8332a') +
            trait('M' + (x + 12) + ' ' + (y - 60) + ' v-5', E, 1.4);
        }
        return mur;
      })
    },
    // Far West : la voie ferrée avance, traverse par traverse, jusqu'à l'arrivée du train (mesas rouges, comme l'image Far West).
    'far-west': {
      nom: 'la voie ferrée',
      decor: ciel('far-west', '#86bfe6', '#f0dcc0') + nuage(130, 16, 1) +
        p('M8 74 V54 L14 50 H44 L50 54 V74 Z', '#b8583a') + p('M120 74 V46 L128 42 H160 L166 46 V74 Z', '#b8583a') +
        trait('M14 58 v14 M26 56 v16 M40 58 v14 M128 50 v22 M142 48 v24 M156 50 v22', '#7a3220', .9, '.6') +
        p('M0 74 H200 V120 H0 Z', '#dc9454') + aplat('M0 74 H200 V80 H0 Z', '#e8b07a') +
        // cactus
        p('M184 92 V70 C184 66 190 66 190 70 V92 Z M184 82 H178 V74 C178 71 182 71 182 74 V78 H184 Z', '#4f8a3a'),
      etapes: range(8).map(function (k) {
        var x = 6 + k * 24;
        return r(x, 98, 6, 14, '#7a4b22', 1) + r(x + 12, 98, 6, 14, '#7a4b22', 1) + r(x - 2, 100, 26, 3, '#8d8d86') + r(x - 2, 107, 26, 3, '#8d8d86') +
          trait('M' + (x - 1) + ' 100.8 h24 M' + (x - 1) + ' 107.8 h24', '#d8d8d0', .7);
      }).concat([
        // locomotive à vapeur
        r(118, 60, 52, 30, '#2f5d8a', 3) + aplat('M118 62 h52 v4 h-52 z', '#5e8fbd', '.8') +
          r(160, 40, 22, 50, '#244a70', 2) + r(164, 46, 14, 12, '#f4e6b0') +
          p('M126 60 V42 H140 V60 Z', '#3b3b3b') + p('M121 42 h24 l-4 -8 h-16 Z', '#3b3b3b') +
          aplat('M128 32 c-6 -4 -2 -12 6 -10 c4 -6 14 -2 12 4 c6 0 6 8 0 8 z', '#f2f2f2', '.85') +
          c(132, 92, 8, '#b8332a') + c(156, 92, 8, '#b8332a') + c(176, 94, 6, '#b8332a') + c(132, 92, 2, E) + c(156, 92, 2, E) +
          trait('M132 92 h24', E, 1.6) + p('M118 76 h-10 l-6 12 h16 Z', '#d9a62e')
      ])
    },
    // Druides : les pierres levées une à une, puis les linteaux (coucher de soleil sur la plaine, comme l'image Druides).
    druides: {
      nom: 'le cercle de pierres',
      decor: ciel('druides', '#e07a4a', '#8a6aa0') + nuage(20, 22, 1) + nuage(140, 14, .9) +
        p('M0 96 C50 88 150 90 200 94 V120 H0 Z', '#6f9a3e') + herbe(116, '#4a7428', 14),
      etapes: range(6).map(function (k) {
        var x = 14 + k * 30;
        return p('M' + x + ' 104 L' + (x + 1) + ' 54 Q' + (x + 10) + ' 48 ' + (x + 19) + ' 54 L' + (x + 20) + ' 104 Z', '#a4a198') +
          aplat('M' + (x + 12) + ' 104 L' + (x + 13) + ' 54 Q' + (x + 16) + ' 51 ' + (x + 19) + ' 54 L' + (x + 20) + ' 104 Z', '#77746c', '.6') +
          trait('M' + (x + 5) + ' 64 l3 6 M' + (x + 4) + ' 80 l4 5 M' + (x + 7) + ' 92 l2 6', E, .8, '.55');
      }).concat([0, 1, 2].map(function (k) {
        var x = 10 + k * 60;
        return r(x, 42, 62, 12, '#aeaba2', 2) + aplat('M' + x + ' 50 h62 v4 h-62 z', '#7f7c74', '.6') + trait('M' + (x + 10) + ' 46 h14 M' + (x + 38) + ' 47 h12', E, .8, '.5');
      }))
    },
    // Incas : terrasses, maisons au toit de chaume, puis le temple (pic vert et montagnes, comme l'image Incas).
    incas: {
      nom: 'le temple en terrasses',
      decor: ciel('incas', '#9ccbe6', '#e4f2f0') + montagnes(64, '#a3abb0') +
        p('M150 72 C156 40 164 16 172 12 C182 18 192 44 200 60 V72 Z', '#4f8a4a') + trait('M164 30 l4 10 M172 24 l4 12 M180 34 l3 10', E, .8, '.45') +
        p('M0 108 H200 V120 H0 Z', '#7fa64a'),
      etapes: range(4).map(function (k) {
        var x = 10 + k * 16, y = 96 - k * 12, w = 180 - k * 32;
        return r(x, y, w, 12, k % 2 ? '#8db857' : '#9bc463') + aplat('M' + x + ' ' + (y + 8) + ' h' + w + ' v4 h-' + w + ' z', '#8a8676', '.8') +
          trait(range(Math.round(w / 12)).map(function (i) { return 'M' + (x + 6 + i * 12) + ' ' + (y + 8) + ' v4'; }).join(' '), E, .6, '.5');
      }).concat([
        r(40, 46, 24, 14, '#cfc6b2') + p('M36 46 L52 34 L68 46 Z', '#c49a4a') + trait('M42 42 l4 -4 M50 42 l3 -5 M58 42 l3 -4', '#8a6428', .9) + '<rect x="49" y="51" width="6" height="9" fill="' + E + '"/>',
        r(136, 46, 24, 14, '#cfc6b2') + p('M132 46 L148 34 L164 46 Z', '#c49a4a') + trait('M138 42 l4 -4 M146 42 l3 -5 M154 42 l3 -4', '#8a6428', .9) + '<rect x="145" y="51" width="6" height="9" fill="' + E + '"/>',
        r(84, 30, 32, 30, '#cfc6b2') + trait('M84 40 h32 M84 50 h32 M94 30 v10 M106 40 v10 M96 50 v10', E, .7, '.5') +
          p('M78 30 L100 10 L122 30 Z', '#c49a4a') + trait('M86 26 l6 -8 M98 24 l3 -10 M110 26 l4 -7', '#8a6428', .9) + '<rect x="96" y="46" width="8" height="14" fill="' + E + '"/>'
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
