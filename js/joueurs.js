// Joueurs d'un compte et leurs niveaux (demande de l'utilisateur du 23/11/2026, backlog lignes 438 à 449).
// Un compte fait jouer plusieurs joueurs (pas de limite). Chaque joueur a un nom, un personnage et des niveaux.
// Règles (choix de l'utilisateur) :
//  - chaque sous-matière est notée de 0 à 100, et tout joueur démarre à 0 partout ;
//  - la matière est la MOYENNE de ses sous-matières, aussi sur 100 ;
//  - le niveau se lit par tranches de 10 : 0 à 9 → niveau 1, 10 à 19 → niveau 2… 100 → niveau 10 (le maximum) ;
//  - une réussite ajoute +1 point à la sous-matière jouée (vérifié le 23/11 : « +1 point sur 100 »).
// Les joueurs sont rangés dans la progression du compte (champ « joueurs » de js/etoiles.js), donc sauvegardés sur
// Supabase avec elle (table progression) et fusionnés à la connexion (js/compte.js) : mêmes joueurs sur tous les appareils.
// Module sans interface : utilisable dans la page (window.Joueurs) et dans les tests Node.
(function (racine) {
  'use strict';

  // Matières avec jauge, et leurs sous-matières. Histoire : une période ; Géographie : une famille de jeux.
  var MATIERES = [
    { id: 'francais', nom: 'Français', subs: [
      { id: 'orthographe', nom: 'Orthographe' }, { id: 'conjugaison', nom: 'Conjugaison' },
      { id: 'grammaire', nom: 'Grammaire' }, { id: 'phonemes', nom: 'Phonèmes' }] },
    { id: 'maths', nom: 'Maths', subs: [{ id: 'calcul', nom: 'Calcul mental' }, { id: 'probleme', nom: 'Problèmes' }] },
    { id: 'histoire', nom: 'Histoire', subs: [
      { id: 'pre', nom: 'Préhistoire' }, { id: 'ant', nom: 'Antiquité' }, { id: 'mag', nom: 'Moyen Âge' },
      { id: 'ren', nom: 'Renaissance' }, { id: 'mod', nom: 'Temps modernes' }, { id: 'xix', nom: 'XIXe siècle' }, { id: 'xx', nom: 'XXe siècle' }] },
    { id: 'geographie', nom: 'Géographie', subs: [
      { id: 'cartes', nom: 'Cartes' }, { id: 'france', nom: 'France' }, { id: 'monde', nom: 'Monde' }, { id: 'nature', nom: 'Nature' }] }
  ];
  var NOM_MAX = 20;
  var PERSO_DEFAUT = 'lea';
  var ID_PREMIER = 'j-1'; // identifiant fixe du 1er joueur : deux appareils qui le créent chacun de leur côté n'en font qu'un à la fusion

  function cle(matiere, sous) { return matiere + '.' + sous; }
  function toutesLesCles() {
    var r = [];
    MATIERES.forEach(function (m) { m.subs.forEach(function (s) { r.push(cle(m.id, s.id)); }); });
    return r;
  }
  function matiere(id) { for (var i = 0; i < MATIERES.length; i++) if (MATIERES[i].id === id) return MATIERES[i]; return null; }
  function borne(n) { n = Math.round(Number(n)); return isFinite(n) ? Math.max(0, Math.min(100, n)) : 0; }

  // ---------- Niveaux ----------
  function score(j, matiereId, sousId) { return borne(j && j.niv && j.niv[cle(matiereId, sousId)]); }
  // Moyenne des sous-matières, sur 100 (non arrondie : 41,5 reste 41,5).
  function scoreMatiere(j, matiereId) {
    var m = matiere(matiereId), t = 0;
    m.subs.forEach(function (s) { t += score(j, matiereId, s.id); });
    return t / m.subs.length;
  }
  // 0 à 9 → 1, 10 à 19 → 2 … 90 à 100 → 10.
  function niveauDe(s) { return Math.min(10, Math.floor(Math.max(0, s) / 10) + 1); }
  function niveauMatiere(j, matiereId) { return niveauDe(scoreMatiere(j, matiereId)); }
  function scoreGlobal(j) { var t = 0; MATIERES.forEach(function (m) { t += scoreMatiere(j, m.id); }); return t / MATIERES.length; }
  function niveauGlobal(j) { return niveauDe(scoreGlobal(j)); }

  // ---------- Création et modification ----------
  function maintenantISO(d) { return (d || new Date()).toISOString(); }
  function nouvelId() { return 'j' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function lister(etat) { return etat && Array.isArray(etat.joueurs) ? etat.joueurs : []; }
  function sansAccent(t) { return String(t).normalize ? String(t).normalize('NFD').replace(/[̀-ͯ]/g, '') : String(t); }

  // Renvoie '' si le nom convient, sinon la raison : 'vide', 'long', 'interdit', 'pris'.
  // Un nom est unique dans le compte (majuscules et accents ignorés) : on ne confond pas deux joueurs.
  function verifierNom(nom, liste, idIgnore) {
    var n = String(nom == null ? '' : nom).replace(/\s+/g, ' ').trim();
    if (!n) return 'vide';
    if (n.length > NOM_MAX) return 'long';
    if (/[<>&"]/.test(n)) return 'interdit';
    var cleNom = sansAccent(n).toLowerCase();
    for (var i = 0; i < (liste || []).length; i++) {
      if (liste[i].id !== idIgnore && sansAccent(liste[i].nom).toLowerCase() === cleNom) return 'pris';
    }
    return '';
  }
  function nettoyerNom(nom) { return String(nom).replace(/\s+/g, ' ').trim(); }
  var MESSAGES = {
    vide: 'Écris un nom pour ce joueur.',
    long: 'Ce nom est trop long (' + NOM_MAX + ' caractères au plus).',
    interdit: 'Ce nom contient un signe qui n’est pas permis (< > & ").',
    pris: 'Un autre joueur de ce compte porte déjà ce nom.'
  };

  // Ajoute un joueur à l'état (progression du compte). Renvoie { joueur } ou { erreur }.
  function creer(etat, nom, perso, maintenant, id) {
    var liste = etat.joueurs = lister(etat), erreur = verifierNom(nom, liste);
    if (erreur) return { erreur: erreur };
    var quand = maintenantISO(maintenant);
    var j = { id: id || nouvelId(), nom: nettoyerNom(nom), perso: perso || PERSO_DEFAUT, cree: quand, maj: quand, niv: {} };
    liste.push(j);
    return { joueur: j };
  }
  // Garantit au moins un joueur : « Joueur 1 », qui reçoit la progression déjà acquise sur le compte.
  function assurerPremier(etat, maintenant) {
    if (lister(etat).length) return false;
    creer(etat, 'Joueur 1', PERSO_DEFAUT, maintenant, ID_PREMIER);
    return true;
  }
  function trouver(etat, id) { var l = lister(etat); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function renommer(etat, id, nom, maintenant) {
    var j = trouver(etat, id); if (!j) return { erreur: 'inconnu' };
    var erreur = verifierNom(nom, lister(etat), id); if (erreur) return { erreur: erreur };
    j.nom = nettoyerNom(nom); j.maj = maintenantISO(maintenant);
    return { joueur: j };
  }
  function changerPerso(etat, id, perso, maintenant) {
    var j = trouver(etat, id); if (!j || !perso) return { erreur: 'inconnu' };
    j.perso = perso; j.maj = maintenantISO(maintenant);
    return { joueur: j };
  }
  // +n point(s) à une sous-matière (100 au plus). Renvoie le nouveau score, ou -1 si la sous-matière n'existe pas.
  function ajouterPoints(etat, id, matiereId, sousId, n, maintenant) {
    var j = trouver(etat, id), m = matiere(matiereId);
    if (!j || !m || !m.subs.some(function (s) { return s.id === sousId; })) return -1;
    j.niv = j.niv || {};
    j.niv[cle(matiereId, sousId)] = borne(score(j, matiereId, sousId) + (n === undefined ? 1 : n));
    j.maj = maintenantISO(maintenant);
    return j.niv[cle(matiereId, sousId)];
  }

  // ---------- Fusion (compte ↔ appareil) ----------
  // Même joueur (même id) : nom et personnage les plus récents, niveaux = le plus haut des deux (on ne perd jamais un
  // niveau gagné). Joueurs présents d'un seul côté : gardés. Les noms identiques de deux joueurs différents (créés chacun
  // sur un appareil) sont départagés par « (2) ».
  function fusionner(a, b) {
    var res = [], parId = {};
    function copie(j) { return JSON.parse(JSON.stringify(j)); }
    (Array.isArray(a) ? a : []).concat(Array.isArray(b) ? b : []).forEach(function (j) {
      if (!j || typeof j.id !== 'string') return;
      var x = parId[j.id];
      if (!x) { x = parId[j.id] = copie(j); x.niv = x.niv && typeof x.niv === 'object' ? x.niv : {}; res.push(x); return; }
      if (String(j.maj || '') > String(x.maj || '')) { x.nom = j.nom; x.perso = j.perso; }
      x.maj = String(j.maj || '') > String(x.maj || '') ? j.maj : x.maj;
      x.cree = String(j.cree || '') && String(j.cree) < String(x.cree || '9') ? j.cree : x.cree;
      Object.keys(j.niv || {}).forEach(function (k) { x.niv[k] = Math.max(borne(x.niv[k]), borne(j.niv[k])); });
    });
    var vus = {};
    res.forEach(function (j) {
      var n = j.nom, k = 2;
      while (vus[sansAccent(n).toLowerCase()]) n = j.nom + ' (' + (k++) + ')';
      j.nom = n; vus[sansAccent(n).toLowerCase()] = true;
    });
    return res;
  }

  // ---------- Progression propre à chaque joueur (v10.31, demande du 23/11/2026) ----------
  // Étoiles, pierres précieuses, coffres, défis et série de jours sont ceux de CHAQUE joueur (joueur.prog, même forme que
  // la progression du compte d'avant). Les champs total, gemmes et parJour de la racine du compte restent la SOMME des
  // joueurs : la base de données s'en sert pour les classements, et les anciennes versions du jeu les lisent encore.
  var CHAMPS_PROG = ['total', 'journal', 'parJour', 'coffresJour', 'coffresNiveau', 'coffresMega', 'visites', 'defis', 'parties', 'gemmes', 'simplesDepuis', 'defisEnCours', 'defisQuittes'];
  function progVide() {
    return { v: 1, total: 0, journal: [], parJour: {}, coffresJour: {}, coffresNiveau: {}, coffresMega: {}, visites: [], defis: {}, parties: [], gemmes: 0, simplesDepuis: 1, defisEnCours: {}, defisQuittes: {} };
  }
  // Complète une progression de joueur (champs manquants) ; la crée si besoin.
  function progDe(joueur) {
    var p = joueur.prog && typeof joueur.prog === 'object' ? joueur.prog : (joueur.prog = progVide()), v = progVide();
    for (var k in v) if (p[k] === undefined || p[k] === null) p[k] = v[k];
    return p;
  }
  // Première fois : la progression déjà acquise sur le compte (étoiles, coffres, pierres…) revient au premier joueur
  // (« Joueur 1 », j-1) ; la racine ne garde ensuite que les totaux. Renvoie true si quelque chose a changé.
  function migrer(etat) {
    var l = lister(etat);
    if (!l.length) return false;
    var cible = trouver(etat, ID_PREMIER) || l[0];
    if (cible.prog) return false;
    var p = progVide();
    CHAMPS_PROG.forEach(function (k) { if (etat[k] !== undefined && etat[k] !== null) p[k] = JSON.parse(JSON.stringify(etat[k])); });
    cible.prog = p;
    etat.journal = []; etat.coffresJour = {}; etat.coffresNiveau = {}; etat.coffresMega = {}; etat.visites = []; etat.defis = {};
    etat.parties = []; etat.defisEnCours = {}; etat.defisQuittes = {};
    agreger(etat);
    return true;
  }
  // Racine = somme des joueurs (total, pierres, étoiles par jour).
  function agreger(etat) {
    var l = lister(etat).filter(function (j) { return j.prog; });
    if (!l.length) return etat;
    var total = 0, gemmes = 0, parJour = {};
    l.forEach(function (j) {
      total += Number(j.prog.total) || 0; gemmes += Number(j.prog.gemmes) || 0;
      Object.keys(j.prog.parJour || {}).forEach(function (d) { parJour[d] = (parJour[d] || 0) + (Number(j.prog.parJour[d]) || 0); });
    });
    etat.total = total; etat.gemmes = gemmes; etat.parJour = parJour;
    return etat;
  }

  // ---------- Accès au compte de la page (navigateur seulement) ----------
  // Les joueurs sont rangés dans la progression du compte (window.Recompenses.compte). « Joueur 1 » est créé sur place s'il
  // manque, et écrit sans lancer d'envoi au compte (identifiant fixe : deux appareils le créent de la même façon).
  function compteDeLaPage() { return racine.Recompenses && racine.Recompenses.compte; }
  function duCompte() {
    var c = compteDeLaPage();
    if (!c) return [];
    var change = assurerPremier(c.etat);
    if (migrer(c.etat)) change = true;
    if (change) {
      try { racine.localStorage.setItem(racine.Etoiles.CLE, JSON.stringify(c.etat)); } catch (e) { /* stockage plein ou interdit : le joueur reste en mémoire */ }
    }
    return lister(c.etat);
  }
  // Enregistre un changement fait sur les joueurs (écriture + envoi au compte).
  function enregistrer() { var c = compteDeLaPage(); if (c) c.ecrire(); }

  var api = {
    MATIERES: MATIERES, NOM_MAX: NOM_MAX, PERSO_DEFAUT: PERSO_DEFAUT, ID_PREMIER: ID_PREMIER, MESSAGES: MESSAGES,
    cle: cle, toutesLesCles: toutesLesCles, matiere: matiere,
    score: score, scoreMatiere: scoreMatiere, niveauDe: niveauDe, niveauMatiere: niveauMatiere, scoreGlobal: scoreGlobal, niveauGlobal: niveauGlobal,
    lister: lister, trouver: trouver, verifierNom: verifierNom, creer: creer, assurerPremier: assurerPremier,
    renommer: renommer, changerPerso: changerPerso, ajouterPoints: ajouterPoints, fusionner: fusionner,
    CHAMPS_PROG: CHAMPS_PROG, progVide: progVide, progDe: progDe, migrer: migrer, agreger: agreger,
    duCompte: duCompte, enregistrer: enregistrer, compteDeLaPage: compteDeLaPage
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Joueurs = api;
})(this);
