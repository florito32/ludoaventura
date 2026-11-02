// Génère les illustrations des 10 aventures (img/aventures/<id>.svg), 640 × 400.
// Style inspiré des illustrations du jeu (aventurier, décor de la boîte) :
//  - contour d'encre irrégulier (filtre « encre » : léger tremblé du trait),
//  - groupes de petites hachures dans les ombres,
//  - couleur « peinte » : ombres et lumières douces sans contour, grain de papier,
//  - palette naturelle (bleu ciel doux, verts gris, bruns, rouge brique, sarcelle).
// Dessins originaux. Lancer : node outils/aventures.js
'use strict';
const fs = require('fs');
const path = require('path');

const ENCRE = '#2a1c14';

// Hasard reproductible (les hachures sont identiques à chaque génération).
function hasard(graine) {
  let a = graine >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
let rnd = hasard(1);

// Contour d'encre (un seul stroke-width par balise, sinon le SVG est invalide).
const T = (w = 3) => `stroke="${ENCRE}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const forme = (d, fill, w = 3) => `<path d="${d}" fill="${fill}" ${T(w)}/>`;
// Teinte peinte (ombre ou lumière) sans contour, bords adoucis.
const teinte = (d, fill, op = 0.35) => `<path d="${d}" fill="${fill}" opacity="${op}" filter="url(#doux)"/>`;
const trait = (d, w = 1.6, op = 0.9) => `<path d="${d}" fill="none" ${T(w)} opacity="${op}"/>`;

// Groupe de hachures : n traits parallèles de longueur l, angle a (degrés), espacement e.
function hach(x, y, { n = 5, l = 14, a = 70, e = 4.5, w = 1.4, op = 0.8 } = {}) {
  n = Math.round(n * 1.4); e *= 0.85; // densité proche des illustrations du jeu
  const r = (a * Math.PI) / 180, dx = Math.cos(r), dy = Math.sin(r);
  const px = -dy, py = dx; // perpendiculaire : direction d'empilement
  let d = '';
  for (let i = 0; i < n; i++) {
    const ll = l * (0.65 + rnd() * 0.5);
    const ox = x + px * e * i + (rnd() - 0.5) * 2, oy = y + py * e * i + (rnd() - 0.5) * 2;
    d += `M${ox.toFixed(1)} ${oy.toFixed(1)}l${(dx * ll).toFixed(1)} ${(dy * ll).toFixed(1)}`;
  }
  return trait(d, w, op);
}
// Plusieurs groupes de hachures répartis sur une liste de points.
const hachs = (points, opts) => points.map(([x, y, o]) => hach(x, y, { ...opts, ...(o || {}) })).join('');

// Touffes d'herbe au premier plan.
function herbes(x0, x1, y, { pas = 18, h = 16, c = ENCRE } = {}) {
  let d = '';
  for (let x = x0; x < x1; x += pas * (0.6 + rnd() * 0.8)) {
    const hh = h * (0.6 + rnd() * 0.7);
    d += `M${x.toFixed(1)} ${y}q${(-3 + rnd() * 2).toFixed(1)} ${(-hh / 2).toFixed(1)} ${(-5 + rnd() * 3).toFixed(1)} ${(-hh).toFixed(1)}M${(x + 3).toFixed(1)} ${y}q${(2 + rnd() * 2).toFixed(1)} ${(-hh / 2).toFixed(1)} ${(4 + rnd() * 3).toFixed(1)} ${(-hh * 0.8).toFixed(1)}`;
  }
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>`;
}

// Nuages peints (taches blanches floues, sans contour, comme le ciel de la boîte).
const nuages = (liste) => liste.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".55" filter="url(#flou)"/>`).join('');

// Chaîne de montagnes gris-vert, hachures sous les sommets (comme le décor de la boîte).
function montagnes(points, base, { c = '#b9c4b4' } = {}) {
  const d = `M${points[0][0]} ${base}` + points.map(([x, y]) => `L${x} ${y}`).join('') + `L${points[points.length - 1][0]} ${base}Z`;
  let h = '';
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    if (points[i - 1][1] > y && points[i + 1][1] > y) {
      // Versant à l'ombre : plusieurs groupes de hachures qui descendent la pente (comme sur la boîte).
      const [nx, ny] = points[i + 1];
      for (let k = 0; k < 3; k++) {
        const t = 0.12 + k * 0.25;
        h += hach(x + (nx - x) * t + 2, y + (ny - y) * t + 6, { n: 5 + Math.floor(rnd() * 4), l: 16 + rnd() * 14, a: 100, e: 3.6 });
      }
    }
  }
  return forme(d, c, 2.4) + h;
}

const defs = (id, haut, bas) => `<defs>
    <linearGradient id="ciel-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${haut}"/><stop offset="1" stop-color="${bas}"/></linearGradient>
    <filter id="encre" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="b"/>
      <feDisplacementMap in="SourceGraphic" in2="b" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="doux" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="flou" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="papier" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="9"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .45  0 0 0 -1.1 .9"/>
    </filter>
    <filter id="taches" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="2"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .1  0 0 0 -1.6 .9"/>
    </filter>
  </defs>`;

// Grain de papier et variations de peinture posés sur toute l'image.
const finitions = `<rect width="640" height="400" filter="url(#taches)" opacity=".18" style="mix-blend-mode:multiply"/>
  <rect width="640" height="400" filter="url(#papier)" opacity=".2" style="mix-blend-mode:multiply"/>`;

// ---------------------------------------------------------------------------
const SCENES = {

  // VIKING : drakkar dans un fjord, voile rayée, boucliers, reflets.
  viking: () => `${defs('v', '#8fc3e6', '#d6ecf6')}
  <rect width="640" height="400" fill="url(#ciel-v)"/>
  ${nuages([[120, 70, 90, 18], [470, 50, 110, 16], [330, 100, 70, 10]])}
  <g filter="url(#encre)">
    ${montagnes([[-10, 210], [40, 120], [90, 150], [150, 90], [210, 160], [250, 205]], 240)}
    ${montagnes([[380, 210], [430, 130], [470, 160], [530, 80], [590, 140], [650, 110], [650, 215]], 240, { c: '#a9b7a6' })}
    ${forme('M0 232 H640 V400 H0 Z', '#3f7fae', 2.4)}
    ${teinte('M0 236 H640 V270 H0 Z', '#bfe0f2', 0.45)}
    ${teinte('M0 330 H640 V400 H0 Z', '#1d4f7a', 0.4)}
    ${hachs([[40, 262], [300, 252], [520, 268], [90, 360], [560, 372], [380, 386]], { n: 3, l: 30, a: 0, e: 5, w: 1.3, op: 0.6 })}
    ${forme('M300 70 L306 70 L308 296 L298 296 Z', '#7a4b22', 2.4)}
    ${trait('M303 74 L150 268 M303 74 L470 266', 1.4, 0.8)}
    ${forme('M215 96 Q303 82 392 96 Q400 170 384 250 Q303 262 224 250 Q206 170 215 96 Z', '#efe6cf', 3)}
    ${[0, 1, 2, 3].map((k) => `<path d="M${236 + k * 44} 92 Q${232 + k * 44} 170 ${244 + k * 44} 254 L${266 + k * 44} 256 Q${256 + k * 44} 170 ${258 + k * 44} 90 Z" fill="#b8332a"/>`).join('')}
    ${forme('M215 96 Q303 82 392 96 Q400 170 384 250 Q303 262 224 250 Q206 170 215 96 Z', 'none', 3)}
    ${teinte('M300 96 Q340 170 330 252 L384 250 Q400 170 392 96 Z', '#6b4a2a', 0.25)}
    ${hachs([[360, 120], [372, 190], [230, 210]], { n: 5, l: 26, a: 95, e: 4 })}
    ${forme('M60 286 C140 330 420 336 520 284 C540 272 552 250 546 226 C560 238 570 266 558 292 C520 352 150 366 70 314 C46 300 36 268 50 244 C52 266 54 280 60 286 Z', '#8a5530', 3)}
    ${trait('M70 300 C160 336 420 340 528 296 M74 312 C170 346 410 350 536 306', 1.6)}
    ${teinte('M70 314 C150 366 520 352 558 292 L540 300 C480 340 160 350 74 304 Z', '#2a1408', 0.45)}
    ${forme('M546 226 C536 196 552 168 578 170 C600 172 606 194 592 204 L600 214 L586 214 C578 214 572 206 574 198', '#8a5530', 3)}
    <circle cx="586" cy="186" r="3.4" fill="${ENCRE}"/>
    ${trait('M584 176 l8 -10 M572 178 l2 -12', 2)}
    ${forme('M50 244 C40 220 46 200 62 196 C56 212 58 228 64 240', '#8a5530', 3)}
    ${[120, 175, 230, 285, 340, 395, 450].map((x, i) => `<g>${forme(`M${x - 22} 292 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 Z`, ['#d9a62e', '#b8332a', '#2f5d8a', '#efe6cf'][i % 4], 2.6)}
      <path d="M${x - 22} 292 h44 M${x} 270 v44" stroke="${ENCRE}" stroke-width="1.6" opacity=".55"/>
      <circle cx="${x}" cy="292" r="6" fill="#9aa0a6" ${T(2)}/>${teinte(`M${x - 4} 296 a20 20 0 0 0 26 -10 a22 22 0 0 1 -18 26 Z`, '#000', 0.25)}</g>`).join('')}
    ${teinte('M90 340 C180 370 420 372 520 336 L510 360 C400 390 180 392 100 362 Z', '#5a3a20', 0.35)}
  </g>
  ${finitions}`,

  // CHEVALIER : château fort sur sa colline, bannières, épée plantée et bouclier.
  chevalier: () => `${defs('c', '#86bfe6', '#dcf0f8')}
  <rect width="640" height="400" fill="url(#ciel-c)"/>
  ${nuages([[480, 70, 110, 20], [120, 60, 80, 14]])}
  <g filter="url(#encre)">
    ${montagnes([[-10, 230], [60, 170], [120, 200], [190, 150], [250, 210], [330, 190], [420, 230]], 260, { c: '#b4c0b0' })}
    ${forme('M0 300 C120 230 300 190 420 210 C520 226 600 260 640 280 V400 H0 Z', '#7fa64a', 2.6)}
    ${teinte('M0 330 C140 280 320 260 640 300 V400 H0 Z', '#4e7a2e', 0.35)}
    ${forme('M300 220 H470 V292 H300 Z', '#cfc6b2', 3)}
    ${forme('M280 150 H330 V292 H280 Z', '#d8d0bc', 3)}
    ${forme('M440 150 H490 V292 H440 Z', '#d8d0bc', 3)}
    ${forme('M362 120 H410 V230 H362 Z', '#d8d0bc', 3)}
    ${forme('M274 150 L305 92 L336 150 Z', '#a8432e', 3)}
    ${forme('M434 150 L465 92 L496 150 Z', '#a8432e', 3)}
    ${forme('M356 120 L386 70 L416 120 Z', '#a8432e', 3)}
    ${hachs([[316, 104], [476, 104], [396, 82]], { n: 4, l: 30, a: 110, e: 4 })}
    ${forme('M300 220 v-12 h14 v12 h14 v-12 h14 v12 h14 v-12 h14 v12 h14 v-12 h14 v12 h14 v-12 h14 v12 h14 v-12 h14 v12 h14 v-12 h12 v12', 'none', 2.6)}
    ${teinte('M440 150 H490 V292 H440 Z', '#5a4a3a', 0.35)}${teinte('M300 250 H470 V292 H300 Z', '#5a4a3a', 0.2)}
    ${forme('M362 292 V256 C362 236 408 236 408 256 V292 Z', '#5b3a1e', 3)}
    ${trait('M374 292 V250 M385 292 V244 M396 292 V250', 1.5)}
    ${[[296, 186], [456, 186], [378, 150], [378, 182]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="22" rx="8" fill="${ENCRE}"/>`).join('')}
    ${[[284, 170], [320, 240], [444, 210], [470, 260], [338, 270], [420, 236]].map(([x, y]) => trait(`M${x} ${y} h14 M${x + 6} ${y + 8} h14`, 1.3, 0.6)).join('')}
    ${forme('M305 92 V60', 'none', 2.6)}${forme('M305 62 C320 56 330 70 346 64 L346 82 C330 88 320 74 305 80 Z', '#2f5d8a', 2.4)}
    ${forme('M465 92 V60', 'none', 2.6)}${forme('M465 62 C480 56 490 70 506 64 L506 82 C490 88 480 74 465 80 Z', '#b8332a', 2.4)}
    ${forme('M385 292 C380 320 330 340 300 400 H360 C380 350 410 320 405 292 Z', '#d9c39a', 2.2)}
    ${forme('M120 220 L132 220 L130 352 L122 352 Z', '#c9d0d6', 2.6)}
    ${teinte('M126 222 L132 222 L130 350 L126 350 Z', '#5a6670', 0.4)}
    ${forme('M100 228 H152 V238 H100 Z', '#7a4b22', 2.6)}${forme('M120 196 H132 V228 H120 Z', '#5b3a1e', 2.4)}<circle cx="126" cy="192" r="7" fill="#d9a62e" ${T(2.4)}/>
    ${forme('M150 300 C150 272 210 266 230 280 C232 330 210 360 190 372 C170 360 150 330 150 300 Z', '#2f5d8a', 3)}
    ${forme('M190 280 V368 M156 312 H228', 'none', 3)}
    ${teinte('M192 282 C212 278 228 284 230 290 C230 330 212 356 194 368 Z', '#0e2238', 0.35)}
    ${herbes(0, 640, 400, { pas: 14, h: 22 })}
  </g>
  ${finitions}`,

  // MAYAS : pyramide à degrés dans la jungle, grandes feuilles au premier plan.
  mayas: () => `${defs('m', '#6fb2e0', '#d6edf7')}
  <rect width="640" height="400" fill="url(#ciel-m)"/>
  ${nuages([[150, 70, 100, 16], [500, 90, 80, 12]])}
  <g filter="url(#encre)">
    <circle cx="540" cy="70" r="30" fill="#f2cf5b" ${T(2.4)}/>
    ${forme('M0 260 C40 230 80 250 120 228 C170 246 210 226 250 244 C300 228 350 250 400 232 C450 248 520 226 640 244 V400 H0 Z', '#3f7a46', 2.6)}
    ${teinte('M0 280 C150 262 450 262 640 280 V400 H0 Z', '#1f4a2a', 0.3)}
    ${[0, 1, 2, 3, 4].map((k) => { const y = 330 - k * 38, w = 300 - k * 50; return forme(`M${320 - w / 2} ${y} H${320 + w / 2} L${320 + w / 2 - 22} ${y - 38} H${320 - w / 2 + 22} Z`, '#d6cbb0', 3); }).join('')}
    ${forme('M284 140 H356 V178 H284 Z', '#d6cbb0', 3)}${forme('M276 140 H364 L352 120 H288 Z', '#c4b796', 3)}
    <rect x="308" y="150" width="24" height="28" fill="${ENCRE}"/>
    ${forme('M296 330 H344 L334 178 H306 Z', '#bfb08e', 2.6)}
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => trait(`M${300 + k * 0.9} ${320 - k * 14} H${340 - k * 0.9}`, 1.4, 0.8)).join('')}
    ${teinte('M344 330 H470 L448 292 H436 L414 254 H402 L380 216 H368 L356 178 L334 178 Z', '#5a4a30', 0.3)}
    ${hachs([[420, 300], [400, 262], [380, 224], [360, 188], [190, 304], [212, 266]], { n: 5, l: 14, a: 75, e: 4 })}
    ${[[200, 316], [250, 316], [390, 316], [436, 316], [230, 278], [410, 278], [270, 240]].map(([x, y]) => trait(`M${x} ${y} h16 M${x + 8} ${y + 8} h16`, 1.2, 0.5)).join('')}
    ${[[30, 400, -30, '#3e7d3a'], [90, 410, -10, '#4f9446'], [560, 410, 25, '#3e7d3a'], [620, 400, 40, '#4f9446'], [160, 420, 5, '#2f6a32']].map(([x, y, r, c]) => `<g transform="rotate(${r} ${x} ${y})">
      ${forme(`M${x} ${y} C${x - 50} ${y - 60} ${x - 30} ${y - 150} ${x} ${y - 190} C${x + 30} ${y - 150} ${x + 50} ${y - 60} ${x} ${y} Z`, c, 2.8)}
      ${trait(`M${x} ${y} L${x} ${y - 186} M${x} ${y - 40} l-26 -24 M${x} ${y - 80} l-24 -22 M${x} ${y - 120} l-18 -18 M${x} ${y - 40} l26 -24 M${x} ${y - 80} l24 -22 M${x} ${y - 120} l18 -18`, 1.4, 0.75)}
      ${teinte(`M${x} ${y} C${x + 50} ${y - 60} ${x + 30} ${y - 150} ${x} ${y - 190} Z`, '#0f2a12', 0.3)}</g>`).join('')}
  </g>
  ${finitions}`,

  // SAVANE : coucher de soleil, acacia, montagne au loin, gazelles et hautes herbes.
  savane: () => `${defs('s', '#e9844a', '#f6d38a')}
  <rect width="640" height="400" fill="url(#ciel-s)"/>
  ${nuages([[160, 80, 120, 10], [470, 60, 90, 8]])}
  <g filter="url(#encre)">
    <circle cx="380" cy="230" r="70" fill="#f7e27a" opacity=".95" ${T(2.4)}/>
    ${forme('M380 250 L460 170 L500 190 L560 150 L640 230 V260 H380 Z', '#b98a6a', 2.4)}
    ${forme('M520 166 L540 158 L560 150 L572 162 L548 170 Z', '#f3efe6', 2)}
    ${hachs([[470, 196], [540, 176], [600, 200]], { n: 5, l: 16, a: 100, e: 4 })}
    ${forme('M0 260 C160 246 480 246 640 258 V400 H0 Z', '#c99a44', 2.6)}
    ${teinte('M0 300 C200 290 440 300 640 290 V400 H0 Z', '#8a5a24', 0.3)}
    ${forme('M150 300 C156 250 150 216 132 190 L140 186 C156 206 164 230 166 252 C178 228 196 212 222 202 L226 210 C200 222 184 240 176 266 C174 280 172 292 172 300 Z', '#4a2e1a', 2.4)}
    ${forme('M40 186 C60 150 140 140 200 150 C240 140 290 156 300 180 C260 196 200 194 160 192 C110 198 60 198 40 186 Z', '#5d7a32', 2.8)}
    ${teinte('M40 186 C80 196 200 200 300 180 L290 188 C220 206 90 206 46 192 Z', '#20300f', 0.45)}
    ${hachs([[80, 176], [140, 182], [200, 180], [250, 176]], { n: 4, l: 10, a: 100, e: 4 })}
    ${[[420, 316, 1], [500, 330, 1.1], [560, 306, 0.9]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})">
      ${forme('M-34 0 C-36 -18 14 -24 24 -8 L30 -30 C32 -36 40 -36 42 -28 L38 -6 C36 8 -30 12 -34 0 Z', '#c27a3a', 2.4)}
      ${teinte('M-30 2 C-10 8 20 8 34 0 L30 6 C10 14 -20 14 -30 8 Z', '#fff', 0.7)}
      ${trait('M-28 6 V34 M-16 8 V34 M16 8 V34 M28 4 V34', 2.4, 1)}
      ${trait('M34 -32 C32 -46 28 -52 22 -56 M40 -32 C40 -46 44 -52 48 -58', 2.2, 1)}
      ${trait('M-20 -10 h30', 1.6, 0.8)}<circle cx="38" cy="-24" r="2" fill="${ENCRE}"/></g>`).join('')}
    ${herbes(0, 640, 400, { pas: 10, h: 40, c: '#5a3a14' })}
    ${herbes(0, 640, 372, { pas: 16, h: 28, c: '#7a5220' })}
  </g>
  ${finitions}`,

  // ÉGYPTE : pyramides de blocs, palmiers, dunes ridées et dromadaire harnaché.
  egypte: () => `${defs('e', '#79bbe6', '#e4f2f8')}
  <rect width="640" height="400" fill="url(#ciel-e)"/>
  ${nuages([[460, 70, 100, 12]])}
  <g filter="url(#encre)">
    <circle cx="110" cy="74" r="32" fill="#f4d566" ${T(2.4)}/>
    ${forme('M120 270 L270 100 L420 270 Z', '#e2bf72', 3)}
    ${forme('M270 100 L320 270 L420 270 Z', '#c49a4a', 3)}
    ${forme('M360 270 L460 160 L560 270 Z', '#e2bf72', 3)}${forme('M460 160 L494 270 L560 270 Z', '#c49a4a', 3)}
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const y = 250 - k * 20; const half = (y - 100) * 150 / 170; return trait(`M${270 - half + 4} ${y} H${270 + half * 0.3}`, 1.2, 0.55); }).join('')}
    ${hachs([[320, 150], [340, 200], [370, 240], [480, 200], [510, 240]], { n: 6, l: 16, a: 70, e: 4 })}
    ${forme('M0 268 C120 254 220 280 330 262 C440 246 540 272 640 258 V400 H0 Z', '#ecd08e', 2.6)}
    ${teinte('M0 330 C200 300 400 340 640 310 V400 H0 Z', '#b98a40', 0.35)}
    ${hachs([[60, 300], [180, 330], [420, 320], [560, 300]], { n: 3, l: 40, a: 8, e: 6, op: 0.5 })}
    ${[[560, 300], [600, 290]].map(([x, y]) => `<g>${forme(`M${x - 4} ${y} C${x - 8} ${y - 60} ${x + 2} ${y - 100} ${x + 10} ${y - 130} L${x + 18} ${y - 128} C${x + 10} ${y - 100} ${x + 2} ${y - 60} ${x + 6} ${y} Z`, '#7a5530', 2.2)}
      ${[[-50, 10], [-30, -20], [20, -22], [46, 6], [0, -40]].map(([dx, dy]) => forme(`M${x + 14} ${y - 130} Q${x + 14 + dx / 2} ${y - 150 + dy} ${x + 14 + dx} ${y - 120 + dy / 2} Q${x + 14 + dx / 2} ${y - 136 + dy} ${x + 14} ${y - 130} Z`, '#4f8a3a', 2.2)).join('')}</g>`).join('')}
    <g transform="translate(250 330)">
      ${forme('M-70 0 C-74 -34 -40 -50 -20 -34 C-6 -60 26 -56 34 -30 L58 -48 C70 -58 84 -46 76 -36 L58 -14 C52 6 -64 14 -70 0 Z', '#b9783e', 3)}
      ${forme('M-40 -38 C-28 -50 -6 -48 4 -40 L-2 -20 L-38 -20 Z', '#a8332a', 2.4)}${trait('M-38 -30 h40 M-34 -24 l4 8 M-20 -24 l4 8 M-6 -24 l4 8', 1.4, 0.8)}
      ${teinte('M-66 4 C-30 12 30 10 54 -6 L52 4 C20 18 -40 18 -66 10 Z', '#3a200a', 0.4)}
      ${trait('M-58 6 V58 M-42 8 V58 M30 6 V58 M44 0 V58', 3, 1)}<circle cx="72" cy="-44" r="2.4" fill="${ENCRE}"/>
    </g>
  </g>
  ${finitions}`,

  // CHINE : Grande Muraille en briques, tours à toits recourbés, monts brumeux, pin.
  chine: () => `${defs('h', '#9cc9e4', '#eef6f8')}
  <rect width="640" height="400" fill="url(#ciel-h)"/>
  ${nuages([[300, 150, 200, 18], [100, 200, 120, 12]])}
  <g filter="url(#encre)">
    ${montagnes([[-10, 210], [70, 120], [140, 170], [220, 100], [300, 180], [380, 130], [470, 190], [550, 110], [650, 170]], 260, { c: '#a9bfa4' })}
    ${forme('M0 260 C80 210 160 250 240 220 C330 190 420 240 520 210 C580 196 620 214 640 220 V400 H0 Z', '#5f9a52', 2.6)}
    ${forme('M0 320 C120 280 220 320 320 290 C420 260 520 310 640 286 V400 H0 Z', '#3f7a46', 2.6)}
    ${hachs([[60, 236], [190, 234], [300, 210], [450, 230], [80, 304], [260, 310], [470, 300]], { n: 5, l: 12, a: 80, e: 4 })}
    ${forme('M-10 360 C60 340 120 300 190 280 C260 262 300 250 360 236 C420 222 470 200 560 190 L650 180 L650 200 L560 212 C480 222 430 244 370 258 C310 272 270 284 200 302 C130 322 70 360 -10 384 Z', '#cdb68c', 3)}
    ${trait('M-10 372 C60 352 120 312 190 292 C260 274 300 262 364 248 C424 234 474 212 560 202 L650 192', 1.4, 0.7)}
    ${Array.from({ length: 26 }, (_, k) => { const t = k / 25, x = -10 + t * 660, y = 360 - t * 180 + Math.sin(t * 3) * 6; return `<rect x="${x.toFixed(0)}" y="${(y - 14).toFixed(0)}" width="12" height="14" fill="#cdb68c" ${T(2)}/>`; }).join('')}
    ${teinte('M-10 384 C70 360 130 322 200 302 C270 284 310 272 370 258 L370 268 C300 290 200 320 -10 396 Z', '#5a4428', 0.4)}
    ${[[190, 280], [430, 220]].map(([x, y]) => `<g>${forme(`M${x - 28} ${y} V${y - 56} H${x + 28} V${y} Z`, '#d6c29a', 3)}
      ${forme(`M${x - 46} ${y - 52} C${x - 30} ${y - 58} ${x - 20} ${y - 74} ${x} ${y - 84} C${x + 20} ${y - 74} ${x + 30} ${y - 58} ${x + 46} ${y - 52} C${x + 30} ${y - 54} ${x - 30} ${y - 54} ${x - 46} ${y - 52} Z`, '#a8332a', 2.6)}
      ${hach(x - 10, y - 74, { n: 4, l: 14, a: 30, e: 4 })}<rect x="${x - 8}" y="${y - 40}" width="16" height="22" rx="7" fill="${ENCRE}"/></g>`).join('')}
    ${forme('M580 400 C584 340 578 300 590 260 L600 262 C594 300 598 340 596 400 Z', '#5b3a1e', 2.4)}
    ${[[560, 280, 70], [570, 240, 56], [584, 206, 40]].map(([x, y, w]) => forme(`M${x - w / 2} ${y} C${x - w / 4} ${y - 20} ${x + w / 2} ${y - 26} ${x + w} ${y} C${x + w / 2} ${y + 8} ${x} ${y + 8} ${x - w / 2} ${y} Z`, '#2f5a32', 2.4)).join('')}
  </g>
  ${finitions}`,

  // FAR WEST : mesas striées, grand cactus, crâne et roue de chariot.
  'far-west': () => `${defs('f', '#6aaee0', '#e8f1f2')}
  <rect width="640" height="400" fill="url(#ciel-f)"/>
  ${nuages([[180, 60, 120, 12], [520, 90, 90, 10]])}
  <g filter="url(#encre)">
    <circle cx="560" cy="64" r="30" fill="#f4d566" ${T(2.4)}/>
    ${forme('M280 270 L300 160 H340 L350 140 H420 L430 160 H460 L480 270 Z', '#c0623a', 3)}
    ${forme('M40 270 L56 200 H170 L186 270 Z', '#b0532e', 3)}
    ${forme('M500 270 L512 210 H530 L536 180 H570 L576 210 H600 L612 270 Z', '#b0532e', 3)}
    ${[[300, 190], [330, 214], [440, 200], [60, 226], [520, 230], [560, 214]].map(([x, y]) => trait(`M${x} ${y} h${(30 + rnd() * 30).toFixed(0)} M${x + 6} ${y + 12} h${(24 + rnd() * 30).toFixed(0)}`, 1.3, 0.6)).join('')}
    ${hachs([[440, 170], [452, 210], [160, 210], [586, 216]], { n: 6, l: 20, a: 100, e: 4 })}
    ${teinte('M430 160 H460 L480 270 H440 Z', '#4a1a0a', 0.35)}
    ${forme('M0 266 C180 256 460 256 640 266 V400 H0 Z', '#dc9454', 2.6)}
    ${teinte('M0 330 C200 312 440 330 640 316 V400 H0 Z', '#9a5a2a', 0.3)}
    ${forme('M206 360 V200 C206 182 240 182 240 200 V360 Z', '#4f8a46', 3)}
    ${forme('M206 290 H178 C162 290 158 278 158 266 V232 C158 218 178 218 178 232 V270 H206 Z', '#4f8a46', 3)}
    ${forme('M240 262 H264 V226 C264 212 284 212 284 226 V262 C284 278 274 282 264 282 H240 Z', '#4f8a46', 3)}
    ${trait('M216 204 V356 M224 196 V356 M232 204 V356 M168 236 V280 M274 230 V270', 1.2, 0.6)}
    ${teinte('M226 196 C236 190 240 196 240 204 V358 H228 Z', '#163a14', 0.35)}
    ${hachs([[244, 220], [244, 280], [180, 240]], { n: 3, l: 8, a: 0, e: 6, w: 1 })}
    <g transform="translate(400 350)">
      ${forme('M-18 -18 C-18 -30 18 -30 18 -18 L14 6 C8 16 -8 16 -14 6 Z', '#f1e8d4', 2.6)}
      ${forme('M-18 -20 C-34 -24 -46 -36 -46 -48 C-38 -38 -28 -32 -16 -30 Z M18 -20 C34 -24 46 -36 46 -48 C38 -38 28 -32 16 -30 Z', '#f1e8d4', 2.4)}
      <circle cx="-8" cy="-12" r="4.5" fill="${ENCRE}"/><circle cx="8" cy="-12" r="4.5" fill="${ENCRE}"/>${trait('M-4 6 v4 M4 6 v4', 2)}
    </g>
    <g transform="translate(540 360)">
      <circle r="34" fill="none" stroke="#7a4b22" stroke-width="8"/><circle r="34" fill="none" ${T(2.4)}/><circle r="7" fill="#7a4b22" ${T(2.4)}/>
      ${[0, 45, 90, 135].map((a) => `<path d="M${(-30 * Math.cos(a * Math.PI / 180)).toFixed(1)} ${(-30 * Math.sin(a * Math.PI / 180)).toFixed(1)} L${(30 * Math.cos(a * Math.PI / 180)).toFixed(1)} ${(30 * Math.sin(a * Math.PI / 180)).toFixed(1)}" stroke="#7a4b22" stroke-width="5"/>`).join('')}
    </g>
    ${herbes(0, 640, 400, { pas: 26, h: 18, c: '#7a4a1a' })}
  </g>
  ${finitions}`,

  // DRUIDES : cercle de pierres levées au crépuscule, chêne, gui et serpe d'or.
  druides: () => `${defs('d', '#e97a52', '#f5cf8e')}
  <rect width="640" height="400" fill="url(#ciel-d)"/>
  ${nuages([[200, 70, 140, 10], [480, 110, 110, 8]])}
  <g filter="url(#encre)">
    <circle cx="520" cy="80" r="28" fill="#fbf1c8" ${T(2.4)}/>
    ${montagnes([[-10, 250], [80, 200], [160, 230], [260, 190], [360, 236], [460, 200], [560, 240], [650, 210]], 270, { c: '#8f8a8c' })}
    ${forme('M0 262 C200 244 440 244 640 262 V400 H0 Z', '#6f9a3e', 2.6)}
    ${teinte('M0 320 C200 300 440 320 640 304 V400 H0 Z', '#2f4f1a', 0.35)}
    ${[[150, 176, 52, 104], [228, 160, 58, 120], [330, 160, 58, 120], [430, 176, 52, 104]].map(([x, y, w, h]) => `<g>
      ${forme(`M${x} ${y + h} L${x + 3} ${y + 6} Q${x + w / 2} ${y - 4} ${x + w - 3} ${y + 6} L${x + w} ${y + h} Z`, '#9d9a92', 3)}
      ${teinte(`M${x + w * 0.6} ${y + 8} L${x + w - 3} ${y + 8} L${x + w} ${y + h} L${x + w * 0.6} ${y + h} Z`, '#3a3630', 0.4)}
      ${hach(x + w * 0.66, y + 20, { n: 4, l: 30, a: 95, e: 4 })}${trait(`M${x + 12} ${y + 40} l8 14 l-4 12 M${x + 20} ${y + 80} l10 6`, 1.4, 0.7)}</g>`).join('')}
    ${forme('M216 136 H404 V164 H216 Z', '#a7a49c', 3)}${teinte('M216 152 H404 V164 H216 Z', '#3a3630', 0.4)}
    ${forme('M136 150 H216 V176 H136 Z', '#a7a49c', 3)}${forme('M418 150 H498 V176 H418 Z', '#a7a49c', 3)}
    ${hachs([[250, 140], [330, 140], [150, 154], [440, 154]], { n: 4, l: 12, a: 80, e: 4 })}
    ${forme('M40 330 C46 290 40 250 30 220 L44 218 C54 246 58 280 62 300 C70 280 84 266 100 258 L104 266 C88 278 76 300 72 330 Z', '#5b3a1e', 2.4)}
    ${[[10, 200, 60], [50, 180, 70], [80, 210, 50]].map(([x, y, r]) => forme(`M${x - r / 2} ${y} a${r / 2} ${r / 2.6} 0 1 1 ${r} 0 a${r / 2} ${r / 2.6} 0 1 1 ${-r} 0 Z`, '#3f6a2a', 2.4)).join('')}
    <g transform="translate(560 340)">
      ${forme('M-40 30 C-30 -10 10 -30 40 -20 C20 -14 0 0 -10 20 Z', '#d9a62e', 2.6)}${forme('M-44 28 L-60 46 L-52 52 L-38 34 Z', '#7a4b22', 2.4)}
      ${[[-20, -40], [0, -48], [16, -36], [-4, -30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#f3efe0" ${T(1.8)}/>`).join('')}
      ${trait('M-30 -20 L-4 -40 L20 -24 M-4 -40 V-56', 2, 0.9)}
    </g>
    ${herbes(0, 640, 400, { pas: 12, h: 22 })}
  </g>
  ${finitions}`,

  // INCAS : pic hachuré, terrasses en pierre, maisons au toit de chaume, lama et condor.
  incas: () => `${defs('i', '#8bc0e2', '#e8f2f6')}
  <rect width="640" height="400" fill="url(#ciel-i)"/>
  ${nuages([[120, 80, 110, 16], [400, 120, 140, 14]])}
  <g filter="url(#encre)">
    ${trait('M120 60 q14 -10 26 0 q12 -10 26 0', 2.4, 1)}
    ${montagnes([[-10, 220], [60, 160], [120, 190], [170, 140], [230, 200]], 260, { c: '#a9b7a6' })}
    ${forme('M330 270 C360 200 390 120 420 60 C430 50 444 52 450 64 C470 130 500 200 560 270 Z', '#6f8a5a', 3)}
    ${teinte('M436 60 C470 130 500 200 560 270 L470 270 C460 200 450 120 436 60 Z', '#203018', 0.35)}
    ${hachs([[440, 90], [454, 140], [470, 190], [490, 230], [380, 170], [400, 120]], { n: 6, l: 22, a: 100, e: 4 })}
    ${forme('M0 268 C100 240 220 240 340 262 C420 250 520 250 640 266 V400 H0 Z', '#7fa64a', 2.6)}
    ${[0, 1, 2, 3].map((k) => `<g>${forme(`M${30 + k * 26} ${290 + k * 26} H${600 - k * 14} V${308 + k * 26} H${30 + k * 26} Z`, k % 2 ? '#8db857' : '#9bc463', 2.6)}
      ${trait(`M${30 + k * 26} ${300 + k * 26} H${600 - k * 14}`, 1.2, 0.5)}
      ${Array.from({ length: 12 }, (_, i) => trait(`M${50 + k * 26 + i * 46} ${302 + k * 26} v6`, 1.2, 0.5)).join('')}</g>`).join('')}
    ${[[150, 286, 60], [230, 280, 54], [300, 288, 48]].map(([x, y, w]) => `<g>${forme(`M${x} ${y} V${y - 34} H${x + w} V${y} Z`, '#c9c0ac', 2.6)}
      ${forme(`M${x - 8} ${y - 34} L${x + w / 2} ${y - 62} L${x + w + 8} ${y - 34} Z`, '#c49a4a', 2.6)}
      ${hach(x + w / 2 - 6, y - 56, { n: 6, l: 18, a: 120, e: 4 })}<rect x="${x + w / 2 - 6}" y="${y - 22}" width="12" height="22" fill="${ENCRE}"/>
      ${trait(`M${x + 6} ${y - 12} h14 M${x + w - 22} ${y - 26} h14`, 1.2, 0.6)}</g>`).join('')}
    <g transform="translate(500 350)">
      ${forme('M-44 0 C-46 -22 18 -26 26 -8 L28 -54 C28 -66 46 -66 46 -54 L44 0 C42 16 -40 16 -44 0 Z', '#f3ead8', 3)}
      ${forme('M-30 -12 C-20 -20 6 -20 16 -12 L12 0 L-28 0 Z', '#b8332a', 2.2)}${trait('M-26 -6 h36', 1.6, 0.8)}
      ${teinte('M-40 6 C-10 14 20 14 40 4 L40 12 C10 22 -20 22 -40 14 Z', '#5a4a30', 0.35)}
      ${trait('M-34 10 V44 M-20 12 V44 M18 12 V44 M32 8 V44', 3, 1)}${trait('M30 -64 l-2 -12 M42 -64 l4 -12', 2.4, 1)}<circle cx="40" cy="-52" r="2.4" fill="${ENCRE}"/>
      ${hachs([[-30, -14], [0, -14]], { n: 3, l: 8, a: 70, e: 4 })}
    </g>
  </g>
  ${finitions}`,

  // PRÉHISTOIRE : feu au fond d'une caverne, peintures rupestres, silex et lance.
  prehistoire: () => `${defs('p', '#2a1a12', '#5a3420')}
  <defs><radialGradient id="lueur" cx="50%" cy="68%" r="62%"><stop offset="0" stop-color="#f6b25a"/><stop offset=".4" stop-color="#a45a2a"/><stop offset="1" stop-color="#2a1a12"/></radialGradient></defs>
  <rect width="640" height="400" fill="url(#lueur)"/>
  <g filter="url(#encre)">
    ${forme('M0 0 H640 V170 C600 110 540 70 450 80 C390 40 260 36 200 76 C120 66 50 110 0 176 Z', '#3a2418', 3)}
    ${hachs([[80, 120], [160, 80], [300, 50], [430, 60], [540, 90], [600, 130]], { n: 6, l: 16, a: 110, e: 4, op: 0.7 })}
    <g fill="#d9824a" stroke="#d9824a" opacity=".9">
      <path d="M110 190 c10 -22 54 -24 70 -6 c8 -4 16 0 16 8 c-6 4 -10 4 -14 2 c-4 10 -14 14 -26 14 l-2 16 h-6 l0 -14 c-12 0 -22 -2 -28 -6 l-4 18 h-6 l2 -22 c-6 -2 -6 -6 -2 -10 z" stroke-width="1"/>
      <path d="M500 170 c4 -10 10 -10 12 0 l2 -12 c0 -6 6 -6 6 0 l0 12 l4 -14 c2 -6 8 -4 6 2 l-4 14 l8 -8 c4 -4 8 0 4 4 l-14 18 c-6 8 -22 8 -26 -4 z" stroke-width="1"/>
      <path d="M420 210 l0 -20 l6 0 l0 20 m-12 -14 l18 0 m-12 14 l-6 14 m12 -14 l6 14 M450 214 l40 -24" fill="none" stroke-width="4" stroke-linecap="round"/>
    </g>
    ${forme('M0 400 V300 C80 280 160 296 220 316 H420 C480 296 560 280 640 300 V400 Z', '#4a2e1e', 3)}
    ${hachs([[40, 320], [120, 330], [520, 320], [590, 330]], { n: 5, l: 12, a: 70, e: 4, op: 0.6 })}
    ${forme('M246 304 L392 284 L398 300 L252 320 Z', '#7a4b22', 2.6)}${forme('M248 284 L394 304 L388 320 L242 300 Z', '#8a5a2b', 2.6)}
    ${[[236, 326, 26], [404, 326, 26], [320, 338, 30]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.55}" fill="#8b8b83" ${T(2.6)}/>${hach(x - 4, y - 8, { n: 3, l: 8, a: 70, e: 4 })}`).join('')}
    ${forme('M320 120 C352 170 384 194 374 250 C366 292 274 292 266 252 C258 212 298 200 294 168 C312 190 318 206 316 226 C330 198 332 164 320 120 Z', '#e8562a', 3)}
    ${forme('M322 190 C344 222 354 242 346 266 C338 288 302 288 296 266 C292 246 310 232 322 190 Z', '#f6c44a', 2.4)}
    ${forme('M322 240 C332 254 334 266 330 276 C324 286 312 284 310 274 C308 262 316 256 322 240 Z', '#fff2b0', 2)}
    ${forme('M80 364 l28 -38 l36 8 l12 32 l-32 18 Z', '#b7b9b2', 2.6)}${hach(100, 346, { n: 3, l: 10, a: 60, e: 4 })}
    ${forme('M520 370 l20 -42 l38 0 l10 34 l-38 22 Z', '#a8aaa2', 2.6)}${hach(546, 340, { n: 3, l: 10, a: 60, e: 4 })}
    ${forme('M440 400 L600 230 L606 236 L448 400 Z', '#7a4b22', 2.2)}${forme('M600 230 L610 206 L618 228 L606 240 Z', '#9aa0a0', 2.2)}
    <g fill="#ffe27a"><circle cx="190" cy="300" r="3"/><circle cx="210" cy="270" r="2.4"/><circle cx="452" cy="290" r="3"/><circle cx="430" cy="262" r="2"/></g>
  </g>
  ${finitions}`
};

const dossier = path.join(__dirname, '..', 'img', 'aventures');
for (const [id, scene] of Object.entries(SCENES)) {
  rnd = hasard(id.length * 97 + id.charCodeAt(0)); // hachures propres à chaque scène, stables d'une génération à l'autre
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
  <!-- Aventure « ${id} » : illustration originale (générée par outils/aventures.js). -->
  ${scene()}
</svg>
`;
  fs.writeFileSync(path.join(dossier, id + '.svg'), svg);
  console.log('img/aventures/' + id + '.svg', Math.round(svg.length / 1024) + ' Ko');
}
