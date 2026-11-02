// Génère les 10 portraits d'aventuriers (img/aventuriers/*.svg).
// Personnages originaux dessinés en vectoriel : contour brun épais et couleurs vives,
// pour rester proches du style des illustrations du plateau.
// Lancer : node outils/aventuriers.js
'use strict';
const fs = require('fs');
const path = require('path');

const ENCRE = '#1d1510';
// Contour commun (épaisseur au choix : un attribut ne doit jamais être répété, sinon le SVG est invalide).
const trait = (e = 4) => `stroke="${ENCRE}" stroke-width="${e}" stroke-linejoin="round" stroke-linecap="round"`;
const T = trait();

// ---------- Pièces du portrait (viewBox 0 0 200 220) ----------
const fond = (c) => `<rect width="200" height="220" rx="24" fill="${c}"/>
  <circle cx="160" cy="40" r="46" fill="#fff" opacity=".18"/>`;

const cheveuxArriere = {
  long: (c) => `<path d="M54 96 C46 150 54 182 72 190 L128 190 C146 182 154 150 146 96 Z" fill="${c}" ${T}/>`,
  tresses: (c) => `<path d="M58 100 C54 140 60 160 66 168 L134 168 C140 160 146 140 142 100 Z" fill="${c}" ${T}/>
    <path d="M60 140 c-8 14 4 22 -2 34 c8 6 4 14 -2 22" fill="none" stroke="${c}" stroke-width="12"/>
    <path d="M140 140 c8 14 -4 22 2 34 c-8 6 -4 14 2 22" fill="none" stroke="${c}" stroke-width="12"/>
    <circle cx="56" cy="198" r="6" fill="#e3262a" ${T}/><circle cx="144" cy="198" r="6" fill="#e3262a" ${T}/>`,
  boucles: (c) => [[58, 80], [56, 108], [62, 134], [142, 80], [144, 108], [138, 134], [70, 58], [130, 58], [100, 50], [84, 52], [116, 52]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="${c}" ${T}/>`).join(''),
  aucun: () => ''
};

const cheveuxDessus = {
  court: (c) => `<path d="M60 100 C56 62 84 52 102 54 C128 54 148 70 140 100 C134 84 118 76 100 78 C84 78 68 86 60 100 Z" fill="${c}" ${T}/>`,
  meche: (c) => `<path d="M60 102 C54 60 92 46 112 56 C134 62 148 80 140 104 C130 80 104 92 88 80 C80 90 70 92 60 102 Z" fill="${c}" ${T}/>`,
  boucles: (c) => [[72, 72], [90, 64], [110, 64], [128, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="${c}" ${T}/>`).join(''),
  aucun: () => ''
};

const chapeaux = {
  brousse: (c, b) => `<ellipse cx="100" cy="72" rx="68" ry="14" fill="${c}" ${T}/>
    <path d="M66 72 C64 38 136 38 134 72 Z" fill="${c}" ${T}/><path d="M67 62 H133 L134 70 H66 Z" fill="${b}" ${T}/>`,
  plume: (c, b) => `<path d="M128 64 C150 28 170 26 176 30 C166 40 152 58 132 68 Z" fill="${b}" ${T}/>
    <ellipse cx="100" cy="72" rx="66" ry="13" fill="${c}" ${T}/>
    <path d="M68 72 C66 40 134 40 132 72 Z" fill="${c}" ${T}/><path d="M68 62 H132 L133 70 H67 Z" fill="${ENCRE}"/>`,
  casque: (c) => `<path d="M56 94 C54 44 146 44 144 94 C132 86 68 86 56 94 Z" fill="${c}" ${T}/>
    <path d="M80 56 L84 86 M100 50 V84 M120 56 L116 86" fill="none" stroke="${ENCRE}" stroke-width="3" opacity=".5"/>
    <path d="M60 96 C62 124 70 136 80 140 M140 96 C138 124 130 136 120 140" fill="none" stroke="${ENCRE}" stroke-width="3"/>`,
  casquette: (c) => `<path d="M60 86 C58 46 140 46 140 86 Z" fill="${c}" ${T}/>
    <path d="M118 84 C150 80 166 86 168 92 C150 96 130 94 116 90 Z" fill="${c}" ${T}/>
    <circle cx="100" cy="50" r="5" fill="${ENCRE}"/>`,
  bandana: (c) => `<path d="M58 88 C58 48 142 48 142 88 C120 78 80 78 58 88 Z" fill="${c}" ${T}/>
    <path d="M140 80 l22 -8 l-6 16 l12 10 l-24 -2 Z" fill="${c}" ${T}/>
    <circle cx="82" cy="66" r="3" fill="#fff"/><circle cx="104" cy="60" r="3" fill="#fff"/><circle cx="124" cy="68" r="3" fill="#fff"/>`,
  feuilles: (c) => [[64, 74, -50], [78, 60, -30], [100, 54, 0], [122, 60, 30], [136, 74, 50]]
    .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="16" transform="rotate(${r} ${x} ${y})" fill="${c}" ${T}/>`).join('')
    + `<circle cx="100" cy="66" r="6" fill="#ffe600" ${T}/>`,
  peche: (c) => `<path d="M70 76 C70 44 130 44 130 76 Z" fill="${c}" ${T}/>
    <path d="M50 86 Q100 60 150 86 L154 94 Q100 74 46 94 Z" fill="${c}" ${T}/>
    <path d="M118 52 l14 -10 l2 8" fill="none" stroke="#e3262a" stroke-width="4"/>`,
  bandeau: (c) => `<path d="M58 78 C80 66 120 66 142 78 L142 90 C120 80 80 80 58 90 Z" fill="${c}" ${T}/>
    <path d="M58 84 l-14 6 l4 14 M58 86 l-10 18" fill="none" stroke="${c}" stroke-width="7"/>`,
  turban: (c, b) => `<path d="M56 92 C48 40 152 40 144 92 C128 80 72 80 56 92 Z" fill="${c}" ${T}/>
    <path d="M62 74 C84 58 120 56 140 70 M66 60 C86 46 116 46 134 58" fill="none" stroke="${b}" stroke-width="7"/>
    <path d="M62 74 C84 58 120 56 140 70 M66 60 C86 46 116 46 134 58" fill="none" stroke="${ENCRE}" stroke-width="2"/>`,
  aucun: () => ''
};

const visage = (peau, joues) => `
  <rect x="88" y="136" width="24" height="36" rx="8" fill="${peau}" ${T}/>
  <circle cx="60" cy="106" r="10" fill="${peau}" ${T}/><circle cx="140" cy="106" r="10" fill="${peau}" ${T}/>
  <ellipse cx="100" cy="102" rx="40" ry="46" fill="${peau}" ${T}/>
  <circle cx="78" cy="120" r="8" fill="${joues}" opacity=".45"/><circle cx="122" cy="120" r="8" fill="${joues}" opacity=".45"/>
  <circle cx="84" cy="104" r="5" fill="${ENCRE}"/><circle cx="116" cy="104" r="5" fill="${ENCRE}"/>
  <circle cx="85.6" cy="102.4" r="1.6" fill="#fff"/><circle cx="117.6" cy="102.4" r="1.6" fill="#fff"/>
  <path d="M76 92 q8 -6 16 -1 M108 91 q8 -5 16 1" fill="none" stroke="${ENCRE}" stroke-width="4" stroke-linecap="round"/>
  <path d="M101 108 q-6 9 1 12" fill="none" stroke="${ENCRE}" stroke-width="3" stroke-linecap="round"/>
  <path d="M86 127 Q100 140 114 127 Q100 133 86 127 Z" fill="#7a2a1a" ${T}/>`;

const corps = (haut, col) => `
  <path d="M18 220 C20 182 50 166 100 166 C150 166 180 182 182 220 Z" fill="${haut}" ${T}/>
  <path d="M84 166 L100 190 L116 166" fill="none" stroke="${col}" stroke-width="7"/>
  <path d="M84 166 L100 190 L116 166" fill="none" stroke="${ENCRE}" stroke-width="3"/>`;

const accessoires = {
  bretelles: () => `<path d="M52 176 L66 220 M148 176 L134 220" stroke="#8a4a1c" stroke-width="12" fill="none"/>
    <path d="M52 176 L66 220 M148 176 L134 220" stroke="${ENCRE}" stroke-width="2" fill="none" opacity=".6"/>`,
  lunettes: () => `<circle cx="84" cy="104" r="12" fill="#fff" fill-opacity=".25" ${trait(3.5)}/>
    <circle cx="116" cy="104" r="12" fill="#fff" fill-opacity=".25" ${trait(3.5)}/>
    <path d="M96 104 h8" stroke="${ENCRE}" stroke-width="3.5"/>`,
  barbe: (c) => `<path d="M62 108 C62 168 138 168 138 108 C130 132 116 122 100 124 C84 122 70 132 62 108 Z" fill="${c}" ${T}/>
    <path d="M88 130 Q100 138 112 130" fill="none" stroke="${ENCRE}" stroke-width="3"/>`,
  appareil: () => `<path d="M70 168 L112 196 M130 168 L132 190" stroke="${ENCRE}" stroke-width="3" fill="none"/>
    <rect x="106" y="186" width="44" height="28" rx="6" fill="#3b3b3b" ${T}/>
    <circle cx="128" cy="200" r="9" fill="#9fd6df" ${T}/><rect x="112" y="181" width="12" height="7" rx="2" fill="#3b3b3b" ${T}/>`,
  foulard: (c) => `<path d="M80 164 C90 176 110 176 120 164 L124 172 C112 186 88 186 76 172 Z" fill="${c}" ${T}/>
    <path d="M110 178 l10 26 l10 -6 Z" fill="${c}" ${T}/>`,
  boucles: () => `<circle cx="58" cy="122" r="6" fill="#ffd23f" ${trait(3)}/><circle cx="142" cy="122" r="6" fill="#ffd23f" ${trait(3)}/>`,
  boussole: () => `<path d="M76 168 L100 196 L124 168" fill="none" stroke="#8a4a1c" stroke-width="3"/>
    <circle cx="100" cy="202" r="12" fill="#ffd23f" ${T}/><path d="M100 194 l4 8 l-4 8 l-4 -8 Z" fill="#e3262a"/>`
};

function portrait(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="200" height="220" role="img" aria-label="${p.nom}">
  <!-- ${p.nom} — aventurier d'Aventura (portrait original, généré par outils/aventuriers.js) -->
  ${fond(p.fond)}
  ${cheveuxArriere[p.arriere || 'aucun'](p.cheveux)}
  ${corps(p.haut, p.col || '#fff')}
  ${(p.acc || []).filter((a) => a === 'bretelles').map((a) => accessoires[a]()).join('')}
  ${visage(p.peau, p.joues || '#e86a5a')}
  ${(p.acc || []).includes('barbe') ? accessoires.barbe(p.cheveux) : ''}
  ${cheveuxDessus[p.dessus || 'aucun'](p.cheveux)}
  ${chapeaux[p.chapeau || 'aucun'](p.chapeauCouleur, p.chapeauDetail)}
  ${(p.acc || []).filter((a) => !['bretelles', 'barbe'].includes(a)).map((a) => accessoires[a](p.accCouleur)).join('')}
</svg>
`;
}

// ---------- Personnage debout qui marche (pion du plateau) ----------
// Planche de 3 images côte à côte (viewBox 0 0 300 160, 100 × 160 chacune) :
// 0 = au repos, 1 = jambe gauche levée, 2 = jambe droite levée.
// Le plateau affiche l'image 0, puis alterne 1 et 2 pendant la marche (css/site.css → .pion.marche).
// La tête reprend celle du portrait (même dessin), réduite ; le corps est dessiné ici.
const B = trait(3);
const TETE = 'translate(10 -8) scale(.4)'; // menton du portrait (y 148) → y 51 dans l'image

// Bras : trait épais à la couleur du haut, cerné d'encre, main ronde. h = [x, y] de la main.
const bras = (epaule, main, haut, peau) => `
    <path d="M${epaule[0]} ${epaule[1]} L${main[0]} ${main[1]}" stroke="${ENCRE}" stroke-width="13" stroke-linecap="round"/>
    <path d="M${epaule[0]} ${epaule[1]} L${main[0]} ${main[1]}" stroke="${haut}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="${main[0]}" cy="${main[1] + 3}" r="5" fill="${peau}" ${B}/>`;

// Jambe : du bassin (x, 100) jusqu'au pied ; levee = genou plié (jambe plus courte, pied relevé).
const jambe = (x, bas, levee, sens) => {
  const pied = levee ? 134 : 142;
  return `
    <path d="M${x - 6} 98 H${x + 6} L${x + 6 + (levee ? sens * 2 : 0)} ${pied} H${x - 6 + (levee ? sens * 2 : 0)} Z" fill="${bas}" ${B}/>
    <ellipse cx="${x + (levee ? sens * 2 : 0) + sens * 2}" cy="${pied + 4}" rx="9" ry="5" fill="#4a2e1a" ${B}/>`;
};

function silhouette(p, image) {
  const bas = p.bas || '#5a4a3a';
  const peau = p.peau;
  const acc = p.acc || [];
  // Bras qui se balancent à l'opposé des jambes.
  const mainG = image === 1 ? [26, 86] : image === 2 ? [30, 98] : [27, 94];
  const mainD = image === 2 ? [74, 86] : image === 1 ? [70, 98] : [73, 94];
  const tete = [cheveuxArriere[p.arriere || 'aucun'](p.cheveux)];
  const devant = [
    visage(peau, p.joues || '#e86a5a'),
    acc.includes('barbe') ? accessoires.barbe(p.cheveux) : '',
    cheveuxDessus[p.dessus || 'aucun'](p.cheveux),
    chapeaux[p.chapeau || 'aucun'](p.chapeauCouleur, p.chapeauDetail),
    acc.filter((a) => ['lunettes', 'boucles'].includes(a)).map((a) => accessoires[a](p.accCouleur)).join('')
  ];
  const torse = `
    <path d="M30 66 Q50 56 70 66 L67 104 H33 Z" fill="${p.haut}" ${B}/>
    <path d="M44 61 L50 70 L56 61" fill="none" stroke="${p.col || '#fff'}" stroke-width="4"/>`;
  const surTorse = [];
  if (acc.includes('bretelles')) surTorse.push(`<path d="M38 64 L40 102 M62 64 L60 102" stroke="#8a4a1c" stroke-width="4" fill="none"/>`);
  if (acc.includes('foulard')) surTorse.push(`<path d="M41 60 Q50 68 59 60 L60 65 Q50 74 40 65 Z" fill="${p.accCouleur}" ${B}/><path d="M54 66 l4 12 l5 -3 Z" fill="${p.accCouleur}" ${B}/>`);
  if (acc.includes('boussole')) surTorse.push(`<path d="M42 62 L50 80 L58 62" fill="none" stroke="#8a4a1c" stroke-width="2"/><circle cx="50" cy="84" r="6" fill="#ffd23f" ${B}/><path d="M50 80 l2 4 l-2 4 l-2 -4 Z" fill="#e3262a"/>`);
  if (acc.includes('appareil')) surTorse.push(`<path d="M36 64 L52 82 M64 64 L62 80" stroke="${ENCRE}" stroke-width="2" fill="none"/><rect x="46" y="78" width="20" height="13" rx="3" fill="#3b3b3b" ${B}/><circle cx="56" cy="84.5" r="4" fill="#9fd6df" stroke="${ENCRE}" stroke-width="2"/>`);
  const ceinture = `<path d="M33 98 H67 V104 H33 Z" fill="${bas}" ${B}/>`;
  return `<g transform="translate(${image * 100} 0)">
    <g transform="${TETE}">${tete.join('')}</g>
    ${jambe(43, bas, image === 1, -1)}${jambe(57, bas, image === 2, 1)}
    ${torse}${ceinture}${surTorse.join('')}
    ${bras([33, 70], mainG, p.haut, peau)}${bras([67, 70], mainD, p.haut, peau)}
    <g transform="${TETE}">${devant.join('')}</g>
  </g>`;
}

function debout(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 160" width="300" height="160" role="img" aria-label="${p.nom}">
  <!-- ${p.nom} debout (3 images : repos, pas gauche, pas droit), généré par outils/aventuriers.js -->
  ${[0, 1, 2].map((i) => silhouette(p, i)).join('\n  ')}
</svg>
`;
}

// ---------- Les 10 aventuriers ----------
const AVENTURIERS = require('../js/aventuriers.js').LISTE;
const DESSINS = {
  lea: { bas: '#c9a46a', fond: '#8fc8ea', peau: '#f2c9a0', cheveux: '#7a4b22', arriere: 'long', dessus: 'court', chapeau: 'brousse', chapeauCouleur: '#c9a46a', chapeauDetail: '#e3262a', haut: '#1f7a72', acc: ['bretelles'] },
  tom: { bas: '#5a4a3a', fond: '#b4ca58', peau: '#e8b48a', cheveux: '#e2b34a', dessus: 'meche', chapeau: 'casque', chapeauCouleur: '#ff7a1a', haut: '#2e55c9' },
  nour: { bas: '#c9a46a', fond: '#ffd166', peau: '#c68a5e', cheveux: '#2a1d17', arriere: 'long', chapeau: 'bandana', chapeauCouleur: '#e3262a', haut: '#1c3473', acc: ['boussole'] },
  malo: { bas: '#1c3473', fond: '#f7b267', peau: '#f6d2b0', cheveux: '#c4572a', dessus: 'court', chapeau: 'casquette', chapeauCouleur: '#ffe600', haut: '#2f9e5b', acc: ['lunettes'] },
  ines: { bas: '#5b3a1e', fond: '#9fd6df', peau: '#8d5a3b', cheveux: '#1f1410', arriere: 'tresses', dessus: 'court', chapeau: 'feuilles', chapeauCouleur: '#4caf50', haut: '#f08a24' },
  jo: { bas: '#3a5a7a', fond: '#c9e4a6', peau: '#f0c09a', cheveux: '#f2f2ee', chapeau: 'peche', chapeauCouleur: '#7d8a3a', haut: '#c0392b', acc: ['barbe', 'lunettes'] },
  kenji: { bas: '#2a2a2a', fond: '#f6e7a6', peau: '#f1cf9f', cheveux: '#1f1410', dessus: 'meche', chapeau: 'bandeau', chapeauCouleur: '#2e55c9', haut: '#8a5a2b', acc: ['foulard'], accCouleur: '#ffd23f' },
  zoe: { bas: '#2e55c9', fond: '#c7b3ec', peau: '#d9a27a', cheveux: '#5a3520', arriere: 'boucles', dessus: 'boucles', haut: '#ffd23f', acc: ['appareil'] },
  sam: { bas: '#6b4a2a', fond: '#ffb38a', peau: '#a8704a', cheveux: '#3b2a1e', dessus: 'court', chapeau: 'plume', chapeauCouleur: '#8a5a2b', chapeauDetail: '#e3262a', haut: '#a3a05a', acc: ['bretelles'] },
  awa: { bas: '#e3a23a', fond: '#8fd0b0', peau: '#6e4128', cheveux: '#1f1410', chapeau: 'turban', chapeauCouleur: '#ffb000', chapeauDetail: '#e3262a', haut: '#6b3fa0', acc: ['boucles'] }
};

const dossier = path.join(__dirname, '..', 'img', 'aventuriers');
fs.mkdirSync(dossier, { recursive: true });
for (const a of AVENTURIERS) {
  fs.writeFileSync(path.join(dossier, a.id + '.svg'), portrait({ nom: a.nom, ...DESSINS[a.id] }));
  fs.writeFileSync(path.join(dossier, a.id + '-debout.svg'), debout({ nom: a.nom, ...DESSINS[a.id] }));
  console.log('img/aventuriers/' + a.id + '.svg + ' + a.id + '-debout.svg');
}
