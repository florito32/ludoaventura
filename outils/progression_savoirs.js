// Génère js/progression-savoirs.js : la difficulté « progression » (1 à 100) de chaque question d'Histoire et de
// Géographie (demande de l'utilisateur du 23/11/2026).
//
// Méthode : pour chaque période (Histoire) ou chaque famille (Géographie), on range TOUTES les questions
// (séries qcm / vf / paires / ordre / indices / classer + zones des cartes) selon, dans l'ordre :
//   1. leur niveau actuel (facile < moyen < difficile < expert) ;
//   2. la note de difficulté de 1 à 9 que Claude a donnée à la main à chaque question (outils/donnees/progression/
//      notes-Bxx.txt, repérées par ids-Bxx.json) ; les séries calculées (pays voisins, départements, régions, cartes…)
//      n'ont pas de note à la main : note neutre 5, elles gardent l'ordre des données ;
//   3. leur position dans les données (jeu, série, rang), pour que le résultat soit toujours identique.
// Puis on découpe cette liste en 100 tranches égales (au plus proche quand le compte ne tombe pas juste) : niveau 1 à 100.
//
// Usage : node outils/progression_savoirs.js   (réécrit js/progression-savoirs.js)
const fs = require('fs');
const path = require('path');
const R = path.join(__dirname, '..', 'js') + '/';
const D = path.join(__dirname, 'donnees', 'progression') + '/';
const S = require(R + 'savoirs.js');
require(R + 'geographie.js');
require(R + 'histoire.js');
['pre', 'mag', 'ren', 'mod', 'ant', 'xix', 'xx'].forEach((f) => require(R + 'histoire-' + f + '.js'));
const CG = require(R + 'cartes-geo.js');
const NIV = ['facile', 'moyen', 'difficile', 'expert'];
const AUTO = new Set(['g01', 'g03', 'g04', 'g05', 'g07', 'g10', 'g18', 'g19']);

// ---- Notes à la main : { 'jeu|serie|niveau|rang': 1..9 }
const notes = {};
fs.readdirSync(D).filter((f) => /^ids-B\d+\.json$/.test(f)).forEach((f) => {
  const b = f.slice(4, 7);
  const ids = JSON.parse(fs.readFileSync(D + f, 'utf8'));
  const txt = fs.readFileSync(D + 'notes-' + b + '.txt', 'utf8').split('\n').filter((l) => l.trim() && l[0] !== '#');
  let vus = 0;
  const poser = (num, d) => {
    const id = ids[num - 1];
    if (!id) throw new Error('numéro hors lot dans notes-' + b + ' : ' + num);
    notes[id.join('|')] = d;
    vus++;
  };
  txt.forEach((l) => {
    if (/^\d+=\d/.test(l)) { // format « n=d n=d … »
      l.trim().split(/\s+/).forEach((t) => {
        const m = t.match(/^(\d+)=([1-9])$/);
        if (!m) throw new Error('jeton illisible dans notes-' + b + ' : ' + t);
        poser(Number(m[1]), Number(m[2]));
      });
      return;
    }
    const m = l.match(/^(\d+)-(\d+):\s*(.*)$/); // format « a-b: chiffres » (premiers lots)
    if (!m) throw new Error('ligne illisible dans notes-' + b + ' : ' + l);
    const a = Number(m[1]), z = Number(m[2]), c = m[3].replace(/\s+/g, '');
    if (c.length !== z - a + 1 || /[^1-9]/.test(c)) throw new Error('plage invalide dans notes-' + b + ' : ' + a + '-' + z);
    for (let i = a; i <= z; i++) poser(i, Number(c[i - a]));
  });
  if (vus !== ids.length) throw new Error('lot ' + b + ' : ' + vus + ' notes pour ' + ids.length + ' questions');
});

// ---- Énumération de toutes les questions, par groupe (période ou famille)
const groupes = {}; // 'histoire/pre' → [{ cle, niv, note, ordre }]
const jeuGroupe = {};
let ordre = 0;
S.JEUX.forEach((j) => {
  const g = j.matiere + '/' + j.famille;
  jeuGroupe[j.id] = g;
  const liste = groupes[g] = groupes[g] || [];
  j.series.forEach((s, si) => {
    NIV.forEach((n, ni) => {
      const nb = s.k === 'carte' ? CG.zonesDu(s.carte, n).length : ((s.niveaux && s.niveaux[n]) || []).length;
      for (let i = 0; i < nb; i++) {
        const cle = j.id + '|' + si + '|' + n + '|' + i;
        let note = notes[cle];
        if (note === undefined) {
          if (!AUTO.has(j.id)) throw new Error('question sans note : ' + cle);
          note = 5;
        }
        liste.push({ jeu: j.id, si, n, i, ni, note, ordre: ordre++ });
      }
    });
  });
});

// ---- Classement et découpage en 100 tranches
const data = {}; // 'jeu.serie.niveau' → [niveau 1..100 de chaque question, dans l'ordre des données]
const repartition = {};
Object.keys(groupes).sort().forEach((g) => {
  const l = groupes[g].slice().sort((a, b) => a.ni - b.ni || a.note - b.note || a.ordre - b.ordre);
  const n = l.length;
  if (n < 100) throw new Error(g + ' : seulement ' + n + ' questions, impossible de remplir 100 niveaux');
  const rep = new Array(100).fill(0);
  l.forEach((q, rang) => {
    const niveau = Math.min(100, Math.floor(rang * 100 / n) + 1);
    rep[niveau - 1]++;
    const k = q.jeu + '.' + q.si + '.' + q.n;
    (data[k] = data[k] || [])[q.i] = niveau;
  });
  repartition[g] = rep;
  console.log(g, n + ' questions, ' + Math.min.apply(null, rep) + ' à ' + Math.max.apply(null, rep) + ' par niveau');
});

const sortie = `// Difficulté « progression » (1 à 100) des questions d'Histoire et de Géographie — FICHIER GÉNÉRÉ par
// outils/progression_savoirs.js : ne pas modifier à la main. Pas encore utilisé par le jeu (l'utilisateur dira plus tard
// à quoi il sert) : NON chargé par index.html, seulement par les tests et les outils.
// Méthode : voir outils/progression_savoirs.js (niveau actuel, puis note de 1 à 9 jugée à la main, puis 100 tranches égales
// par période d'Histoire ou par famille de Géographie).
(function (racine) {
  'use strict';
  // 'jeu.serie.niveau' → niveau de progression de chaque question, dans l'ordre du fichier de données
  // (pour une carte : dans l'ordre des zones à toucher de ce niveau).
  var DATA = ${JSON.stringify(data)};
  // jeu → groupe (période d'Histoire ou famille de Géographie) dans lequel les 100 niveaux sont répartis
  var JEU_GROUPE = ${JSON.stringify(jeuGroupe)};
  // groupe → nombre de questions de chacun des 100 niveaux
  var REPARTITION = ${JSON.stringify(repartition)};
  // Niveau de progression (1 à 100) de la question de rang i d'une série (jeu, numéro de série, niveau du jeu), ou null.
  function niveau(jeu, serie, niv, i) {
    var t = DATA[jeu + '.' + serie + '.' + niv];
    return t && t[i] ? t[i] : null;
  }
  var api = { DATA: DATA, JEU_GROUPE: JEU_GROUPE, REPARTITION: REPARTITION, niveau: niveau };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.ProgressionSavoirs = api;
})(this);
`;
fs.writeFileSync(R + 'progression-savoirs.js', sortie);
console.log('js/progression-savoirs.js écrit (' + Math.round(sortie.length / 1024) + ' Ko)');
