// Calcule les 99 seuils qui transforment le score brut d'un calcul en niveau de progression 1 à 100
// (js/progression-calcul.js). Usage : node outils/progression_calcul.js
// Échantillon : 40 000 calculs de chacun des 4 niveaux du jeu (tous signes, tous nombres, tous nombres de signes),
// avec un hasard à graine fixe : le résultat est toujours le même. Écrit js/progression-calcul-seuils.js.
const fs = require('fs');
const path = require('path');
const K = require('../js/calcul.js');
const P = require('../js/progression-calcul.js');

let graine = 123456789;
function hasard() { graine = (graine * 1664525 + 1013904223) % 4294967296; return graine / 4294967296; }

const scores = [];
for (const niv of K.NIVEAUX) {
  const reglages = P.reglagesTout(niv.id);
  for (let i = 0; i < 40000; i++) {
    const c = K.generer(reglages, hasard);
    const s = P.score(c.nombres, c.operations);
    if (s !== null) scores.push(s);
  }
}
scores.sort((a, b) => a - b);
const seuils = [];
for (let k = 1; k < 100; k++) seuils.push(Math.round(scores[Math.floor(scores.length * k / 100)] * 1000) / 1000);
const texte = '// Seuils du niveau de progression des calculs (1 à 100) — GÉNÉRÉ par outils/progression_calcul.js : ne pas modifier à la main.\n' +
  '// ' + scores.length + ' calculs échantillonnés ; niveau = 1 + nombre de seuils atteints par le score brut.\n' +
  '(function (racine) {\n  \'use strict\';\n  var SEUILS = ' + JSON.stringify(seuils) + ';\n' +
  '  if (typeof module !== \'undefined\' && module.exports) module.exports = SEUILS;\n  else racine.ProgressionCalculSeuils = SEUILS;\n})(this);\n';
fs.writeFileSync(path.join(__dirname, '../js/progression-calcul-seuils.js'), texte);
console.log(scores.length, 'calculs ; seuils min/max', seuils[0], seuils[98]);
