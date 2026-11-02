// Génère les illustrations des aventures (img/aventures/<id>.svg), 640 × 400.
// Dessins originaux, même style que le plateau : contours bruns épais, couleurs vives, peu de détails.
// (Préhistoire, dessinée à la main, est dans img/aventures/prehistoire.svg.)
// Lancer : node outils/aventures.js
'use strict';
const fs = require('fs');
const path = require('path');

const E = '#1d1510';
// Contour : un seul attribut stroke-width par élément (sinon le SVG est invalide).
const t = (w = 5) => `stroke="${E}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const ciel = (id, haut, bas) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${haut}"/><stop offset="1" stop-color="${bas}"/></linearGradient>`;
const soleil = (x, y, r, c = '#ffd23f') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${t(4)}/>`;
const nuage = (x, y, s = 1) => `<path d="M${x} ${y} c${-4 * s} ${-22 * s} ${30 * s} ${-28 * s} ${38 * s} ${-12 * s} c${10 * s} ${-18 * s} ${44 * s} ${-12 * s} ${40 * s} ${10 * s} c${18 * s} ${0} ${22 * s} ${22 * s} ${2 * s} ${22 * s} h${-72 * s} c${-18 * s} ${0} ${-20 * s} ${-20 * s} ${-8 * s} ${-20 * s} z" fill="#fff" ${t(4)}/>`;

const SCENES = {
  // Drakkar sur la mer, voile rayée, boucliers.
  viking: `<defs>${ciel('c', '#8fc8ea', '#d8eef8')}</defs>
    <rect width="640" height="400" fill="url(#c)"/>
    ${nuage(70, 90)}${nuage(470, 70, .8)}
    <path d="M0 200 L90 120 L170 190 L260 110 L360 200 Z" fill="#9aa9b4" ${t(4)}/>
    <rect y="230" width="640" height="170" fill="#2e6fb5"/>
    <path d="M0 230 H640" ${t(5)}/>
    <path d="M140 150 V300" ${t(7)}/>
    <path d="M140 150 L250 160 L240 270 L140 262 Z" fill="#fff" ${t(5)}/>
    <path d="M168 153 L160 264 M196 156 L190 266 M224 158 L214 268" stroke="#e3262a" stroke-width="16"/>
    <path d="M140 150 L250 160 L240 270 L140 262 Z" fill="none" ${t(5)}/>
    <path d="M70 290 C160 330 380 330 470 288 C500 270 512 240 500 214 C520 230 530 262 516 288 C480 350 140 360 60 300 C40 290 30 260 48 240 C52 262 60 280 70 290 Z" fill="#a0522d" ${t(5)}/>
    <path d="M500 214 C490 190 510 172 530 178 C548 184 546 204 532 206 C522 208 516 200 520 192" fill="#a0522d" ${t(5)}/>
    <circle cx="530" cy="186" r="3" fill="${E}"/>
    ${[130, 190, 250, 310, 370, 430].map((x, i) => `<circle cx="${x}" cy="300" r="20" fill="${['#ffd23f', '#e3262a', '#2e55c9'][i % 3]}" ${t(4)}/><circle cx="${x}" cy="300" r="5" fill="${E}"/>`).join('')}
    <path d="M30 360 q30 -12 60 0 t60 0 M420 372 q30 -12 60 0 t60 0 M250 384 q30 -12 60 0" fill="none" stroke="#bfe3f5" stroke-width="5" stroke-linecap="round"/>`,

  // Château fort sur sa colline, bannières.
  chevalier: `<defs>${ciel('c', '#7cc0ea', '#cfeaf8')}</defs>
    <rect width="640" height="400" fill="url(#c)"/>
    ${nuage(470, 80)}${soleil(90, 80, 36)}
    <path d="M0 330 C150 250 480 250 640 320 V400 H0 Z" fill="#7cb342" ${t(5)}/>
    <g fill="#c9c2b4">
      <rect x="230" y="170" width="180" height="120" ${t(5)}/>
      <rect x="190" y="130" width="70" height="160" ${t(5)}/>
      <rect x="380" y="130" width="70" height="160" ${t(5)}/>
      <path d="M190 130 v-18 h14 v18 h14 v-18 h14 v18 h14 v-18 h14 v18 M380 130 v-18 h14 v18 h14 v-18 h14 v18 h14 v-18 h14 v18 M230 170 v-16 h18 v16 h18 v-16 h18 v16 h18 v-16 h18 v16 h18 v-16 h18 v16 h18 v-16 h18 v16" ${t(5)}/>
    </g>
    <path d="M290 290 V230 C290 200 350 200 350 230 V290 Z" fill="#6b3f1d" ${t(5)}/>
    <path d="M305 290 V232 M320 290 V222 M335 290 V232" ${t(3)}/>
    <rect x="212" y="170" width="16" height="26" rx="8" fill="${E}"/><rect x="412" y="170" width="16" height="26" rx="8" fill="${E}"/>
    <path d="M225 112 V60" ${t(5)}/><path d="M225 62 L270 74 L225 88 Z" fill="#e3262a" ${t(4)}/>
    <path d="M415 112 V60" ${t(5)}/><path d="M415 62 L460 74 L415 88 Z" fill="#2e55c9" ${t(4)}/>
    <path d="M90 360 L170 290 M170 360 L90 290" stroke="#d9dde2" stroke-width="12" stroke-linecap="round"/>
    <path d="M90 360 L170 290 M170 360 L90 290" fill="none" ${t(3)}/>
    <path d="M100 330 l12 12 M160 330 l-12 12" stroke="#8a5a2b" stroke-width="10"/>`,

  // Pyramide maya à degrés dans la jungle.
  mayas: `<defs>${ciel('c', '#4fa3e0', '#bfe3f5')}</defs>
    <rect width="640" height="400" fill="url(#c)"/>
    ${soleil(530, 80, 40)}${nuage(80, 90, .9)}
    <path d="M0 300 C60 250 120 280 160 250 C200 280 250 250 300 270 V400 H0 Z" fill="#2f8a4e" ${t(5)}/>
    <path d="M340 270 C400 240 460 280 520 250 C570 270 600 250 640 260 V400 H340 Z" fill="#2f8a4e" ${t(5)}/>
    <g fill="#d8cfb8">
      <path d="M150 340 H490 L460 300 H180 Z" ${t(5)}/>
      <path d="M180 300 H460 L432 262 H208 Z" ${t(5)}/>
      <path d="M208 262 H432 L404 224 H236 Z" ${t(5)}/>
      <path d="M236 224 H404 L378 188 H262 Z" ${t(5)}/>
      <rect x="282" y="140" width="76" height="48" ${t(5)}/>
    </g>
    <path d="M300 340 H340 L330 188 H310 Z" fill="#b9ae93" ${t(4)}/>
    <path d="M304 314 H336 M306 290 H334 M308 266 H332 M309 242 H331 M310 218 H330" ${t(3)}/>
    <rect x="308" y="156" width="24" height="32" fill="${E}"/>
    <path d="M0 400 V350 C80 330 160 360 240 350 C320 340 420 370 640 345 V400 Z" fill="#4caf50" ${t(5)}/>`,

  // Savane au coucher du soleil : acacia et gazelles.
  savane: `<defs>${ciel('c', '#ff8a3d', '#ffd166')}</defs>
    <rect width="640" height="400" fill="url(#c)"/>
    ${soleil(320, 250, 90, '#ffe600')}
    <path d="M0 290 C160 270 480 270 640 290 V400 H0 Z" fill="#d9a441" ${t(5)}/>
    <path d="M140 290 C150 230 140 200 120 180 M140 240 C160 210 190 200 210 196" fill="none" stroke="${E}" stroke-width="12" stroke-linecap="round"/>
    <path d="M40 178 C70 140 220 136 260 176 C230 196 90 198 40 178 Z" fill="#3f6b2a" ${t(5)}/>
    ${[[410, 300], [500, 312], [580, 296]].map(([x, y]) => `<g transform="translate(${x} ${y})" fill="#b5651d" ${t(4)}>
      <path d="M-30 0 C-30 -18 20 -20 24 -4 L34 -24 L40 -22 L34 2 C30 10 -26 10 -30 0 Z"/>
      <path d="M-24 6 V30 M-12 6 V30 M12 6 V30 M24 4 V30" fill="none"/>
      <path d="M34 -24 l-6 -20 M40 -22 l2 -20" fill="none"/></g>`).join('')}
    <path d="M0 360 C200 340 440 380 640 350" fill="none" stroke="#b07e2a" stroke-width="6"/>`,

  // Pyramides d'Égypte, dunes et dromadaire.
  egypte: `<defs>${ciel('c', '#6ab8ea', '#d5effa')}</defs>
    <rect width="640" height="400" fill="url(#c)"/>
    ${soleil(540, 80, 40)}
    <path d="M60 300 L200 120 L340 300 Z" fill="#e8c06a" ${t(5)}/>
    <path d="M200 120 L250 300 L340 300 Z" fill="#c99a3e" ${t(5)}/>
    <path d="M300 300 L400 170 L500 300 Z" fill="#e8c06a" ${t(5)}/>
    <path d="M400 170 L436 300 L500 300 Z" fill="#c99a3e" ${t(5)}/>
    <path d="M0 300 C120 280 240 310 360 290 C460 274 560 300 640 288 V400 H0 Z" fill="#f2d48a" ${t(5)}/>
    <g transform="translate(470 320)" fill="#b97a3c" ${t(4)}>
      <path d="M-50 0 C-50 -30 -20 -40 -6 -24 C6 -44 30 -40 34 -20 L56 -34 C66 -40 74 -30 66 -24 L50 -10 C46 6 -46 10 -50 0 Z"/>
      <path d="M-40 4 V44 M-24 6 V44 M24 6 V44 M38 2 V44" fill="none"/>
    </g>
    <path d="M30 360 c40 -10 80 10 120 0 M380 380 c40 -10 80 10 120 0" fill="none" stroke="#d9b25e" stroke-width="5" stroke-linecap="round"/>`,

  // Grande Muraille sur les collines vertes.
  chine: `<defs>${ciel('c', '#8fc8ea', '#e2f2fa')}</defs>
    <rect width="640" height="400" fill="url(#c)"/>
    ${nuage(80, 80)}${nuage(430, 60, .8)}
    <path d="M0 230 C80 160 160 200 240 160 C330 120 420 190 520 150 C580 130 620 160 640 170 V400 H0 Z" fill="#6aa84f" ${t(5)}/>
    <path d="M0 300 C120 250 220 300 320 260 C420 220 520 280 640 250 V400 H0 Z" fill="#3f7a46" ${t(5)}/>
    <path d="M-10 330 C80 300 140 250 220 240 C300 230 340 200 420 190 C480 182 540 150 650 140" fill="none" stroke="${E}" stroke-width="34" stroke-linecap="round"/>
    <path d="M-10 330 C80 300 140 250 220 240 C300 230 340 200 420 190 C480 182 540 150 650 140" fill="none" stroke="#c9b18a" stroke-width="24" stroke-linecap="round"/>
    <path d="M-10 330 C80 300 140 250 220 240 C300 230 340 200 420 190 C480 182 540 150 650 140" fill="none" stroke="${E}" stroke-width="6" stroke-dasharray="10 12" transform="translate(0 -14)"/>
    ${[[200, 238], [430, 186]].map(([x, y]) => `<g fill="#c9b18a" ${t(5)}>
      <rect x="${x - 26}" y="${y - 62}" width="52" height="56"/>
      <path d="M${x - 34} ${y - 62} L${x} ${y - 92} L${x + 34} ${y - 62} Z" fill="#e3262a"/>
      <rect x="${x - 8}" y="${y - 44}" width="16" height="20" fill="${E}"/></g>`).join('')}`,

  // Far West : mesas rouges, cactus et soleil.
  'far-west': `<defs>${ciel('c', '#4fa3e0', '#cde9f7')}</defs>
    <rect width="640" height="400" fill="url(#c)"/>
    ${soleil(100, 80, 38)}
    <path d="M300 280 V170 H360 V150 H420 V170 H470 V280 Z" fill="#c4572a" ${t(5)}/>
    <path d="M60 280 V200 H180 V280 Z" fill="#b14a22" ${t(5)}/>
    <path d="M500 280 V210 H520 V180 H560 V210 H600 V280 Z" fill="#b14a22" ${t(5)}/>
    <path d="M300 200 H470 M60 225 H180" ${t(3)} opacity=".5"/>
    <path d="M0 270 C200 260 440 260 640 270 V400 H0 Z" fill="#e0894a" ${t(5)}/>
    <g fill="#2f8a4e" ${t(5)}>
      <rect x="200" y="210" width="34" height="140" rx="17"/>
      <path d="M200 280 H170 C158 280 154 270 154 260 V230 C154 218 172 218 172 230 V262 H200 Z"/>
      <path d="M234 260 H262 V220 C262 208 280 208 280 220 V258 C280 272 270 276 262 276 H234 Z"/>
    </g>
    <path d="M200 350 H234" ${t(5)}/>
    <path d="M420 350 c20 -16 40 -16 60 0 M80 370 c16 -10 32 -10 48 0" fill="none" stroke="#b5651d" stroke-width="5" stroke-linecap="round"/>`,

  // Druides : cercle de pierres levées au crépuscule.
  druides: `<defs>${ciel('c', '#ff7a4d', '#ffd08a')}</defs>
    <rect width="640" height="400" fill="url(#c)"/>
    <circle cx="520" cy="80" r="34" fill="#fff6d0" ${t(4)}/>
    <path d="M0 270 C200 250 440 250 640 270 V400 H0 Z" fill="#5f9e3a" ${t(5)}/>
    <g fill="#9a9a90" ${t(5)}>
      <rect x="110" y="170" width="54" height="110" rx="6"/>
      <rect x="210" y="160" width="58" height="120" rx="6"/>
      <rect x="320" y="160" width="58" height="120" rx="6"/>
      <rect x="430" y="170" width="54" height="110" rx="6"/>
      <rect x="196" y="136" width="196" height="30" rx="6"/>
      <rect x="96" y="150" width="82" height="26" rx="6"/>
      <rect x="418" y="150" width="82" height="26" rx="6"/>
    </g>
    <path d="M230 190 v40 M340 200 v40 M130 200 v30 M450 196 v30" stroke="#7d7d76" stroke-width="5" stroke-linecap="round"/>
    <path d="M40 330 C60 310 90 310 100 330 M540 340 C560 320 590 320 600 340" fill="none" stroke="#3f7a46" stroke-width="6" stroke-linecap="round"/>`,

  // Incas : montagne pointue, terrasses en escalier et lama.
  incas: `<defs>${ciel('c', '#8fc8ea', '#e2f2fa')}</defs>
    <rect width="640" height="400" fill="url(#c)"/>
    ${nuage(60, 80, .9)}
    <path d="M300 300 L430 60 L470 90 L560 300 Z" fill="#4f7d4a" ${t(5)}/>
    <path d="M430 60 L470 90 L452 130 L420 110 Z" fill="#6aa84f" ${t(4)}/>
    <path d="M0 300 C80 250 200 250 320 280 V400 H0 Z" fill="#6aa84f" ${t(5)}/>
    ${[0, 1, 2, 3].map((k) => `<path d="M${40 + k * 30} ${300 + k * 22} H${560 - k * 10} V${322 + k * 22} H${40 + k * 30} Z" fill="${k % 2 ? '#7cb342' : '#8bc34a'}" ${t(4)}/>`).join('')}
    <g fill="#c9c2b4" ${t(4)}>
      <rect x="140" y="250" width="60" height="44"/><path d="M134 250 L170 226 L206 250 Z" fill="#8a5a2b"/>
      <rect x="230" y="262" width="50" height="34"/><path d="M224 262 L255 242 L286 262 Z" fill="#8a5a2b"/>
    </g>
    <g transform="translate(470 330)" fill="#fff6e6" ${t(4)}>
      <path d="M-40 0 C-40 -20 20 -22 26 -6 L28 -46 C28 -56 44 -56 44 -46 L42 0 C40 14 -36 14 -40 0 Z"/>
      <path d="M-30 8 V36 M-14 10 V36 M16 10 V36 M32 6 V36" fill="none"/>
      <path d="M30 -54 l-2 -12 M40 -54 l4 -12" fill="none"/>
    </g>`
};

const dossier = path.join(__dirname, '..', 'img', 'aventures');
for (const [id, corps] of Object.entries(SCENES)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
  <!-- Aventure « ${id} » : illustration originale (générée par outils/aventures.js). -->
  ${corps}
</svg>
`;
  fs.writeFileSync(path.join(dossier, id + '.svg'), svg);
  console.log('img/aventures/' + id + '.svg');
}
