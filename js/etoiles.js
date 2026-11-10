// Étoiles, niveaux et coffres (demande de l'utilisateur du 10/11/2026, backlog lignes 164 à 173).
// Choix de l'utilisateur :
//  - toute aventure GAGNÉE rapporte en étoiles ce que l'équipe a récolté (1 tronc coupé, 1 pierre taillée… = 1 ⭐) ;
//    une partie perdue ne rapporte rien ;
//  - défi du jour gagné : étoiles de la partie doublées, une seule fois par jour et par défi (solo, équipe) ;
//  - coffre du jour : 5 à 20 ⭐, un par jour (date du téléphone) ;
//  - niveaux : niveau 2 à 30 ⭐, puis chaque niveau demande 10 ⭐ de plus (30, 40, 50…) ;
//  - coffre d'argent aux niveaux 5, 15, 25… (30 à 60 ⭐), coffre d'or aux niveaux 10, 20, 30… (80 à 150 ⭐) ;
//  - coffre simple (v6.46, demande du 10/11/2026) : 10 à 25 ⭐ à chaque autre niveau (2, 3, 4, 6…) ; le gros coffre
//    le remplace aux niveaux 5, 10, 15… Les niveaux atteints avant la v6.46 ne donnent pas de coffre simple ;
//  - pierres précieuses (v6.46) : 1 chance sur 3 d'en gagner une par partie gagnée (aventure, partie rapide, défi) ;
//    chaque coffre ouvert en donne : coffre du jour et coffre simple 1, argent 2, or 3, méga coffre 5 ;
//  - défi quitté (v6.47, demande du 10/11/2026) : un défi du jour arrêté avant la fin (retour à l'accueil, autre
//    partie, redémarrage, jeu fermé) ne rapporte plus rien ce jour-là (ni étoiles, ni pierres), même s'il est
//    retenté et gagné ensuite. On peut toujours y jouer. Une partie perdue jusqu'au bout se retente avec récompense ;
//  - méga coffre (v6.38, demande du 10/11/2026) : 100 à 200 ⭐ chaque fois que le joueur vient 5 jours d'affilée
//    (5e, 10e, 15e… jour de suite ; un jour manqué remet la série à 0). Il reste à ouvrir tant qu'il ne l'est pas.
// Tout est gardé sur l'appareil (localStorage : reste après fermeture du navigateur, contrairement à la partie
// en cours qui est dans sessionStorage). Les données sont rangées dans un seul objet versionné (« v ») pour
// pouvoir être envoyées plus tard à un compte en ligne.
// Module sans interface : utilisable dans la page (window.Etoiles) et dans les tests Node.
(function (racine) {
  'use strict';

  var CLE = 'ludoaventura-etoiles';
  var COFFRES = {
    jour: { nom: 'Coffre du jour', min: 5, max: 20 },
    simple: { nom: 'Coffre simple', min: 10, max: 25 },
    argent: { nom: 'Coffre d’argent', min: 30, max: 60 },
    or: { nom: 'Coffre d’or', min: 80, max: 150 },
    mega: { nom: 'Méga coffre', min: 100, max: 200 }
  };
  var SERIE_MEGA = 5; // jours d'affilée pour un méga coffre
  // Pierres précieuses (v6.46) : dans chaque coffre, et 1 chance sur 3 par partie gagnée.
  var GEMMES = { jour: 1, simple: 1, argent: 2, or: 3, mega: 5 };
  var CHANCE_GEMME = 1 / 3;
  var JOURNAL_MAX = 200; // dernières entrées gardées (gains)
  var JOURS_GARDES = 60; // jours gardés dans le total par jour

  // ---------- Niveaux ----------
  // Étoiles qu'il faut pour PASSER du niveau L au niveau L + 1 : 30, 40, 50…
  function pas(L) { return 30 + 10 * (L - 1); }
  // Total d'étoiles qu'il faut pour ATTEINDRE le niveau L (niveau 1 = 0 ⭐, niveau 2 = 30, niveau 3 = 70…).
  function seuil(L) { return L <= 1 ? 0 : 30 * (L - 1) + 5 * (L - 1) * (L - 2); }
  // Niveau atteint avec ce total, et où on en est vers le suivant.
  function niveau(total) {
    var L = 1;
    while (seuil(L + 1) <= total) L++;
    return { niveau: L, debut: seuil(L), fin: seuil(L + 1), dans: total - seuil(L), besoin: pas(L), reste: seuil(L + 1) - total };
  }
  // Coffre gagné en atteignant le niveau L : or tous les 10, argent tous les 5, sinon un coffre simple (v6.46).
  function coffreDuNiveau(L) { return L % 10 === 0 ? 'or' : L % 5 === 0 ? 'argent' : L >= 2 ? 'simple' : null; }
  // Prochain niveau (> L) qui donne un coffre (v6.46 : toujours le suivant).
  function prochainCoffre(L) { var n = L + 1; while (!coffreDuNiveau(n)) n++; return n; }
  // Prochain niveau (> L) qui donne un gros coffre (argent ou or).
  function prochainGrosCoffre(L) { var n = L + 1; while (n % 5) n++; return n; }

  // ---------- Dates ----------
  function deux(n) { return (n < 10 ? '0' : '') + n; }
  // Jour local du téléphone, « 2026-11-10 » (le coffre du jour change à minuit, heure de l'appareil).
  function jour(d) { d = d || new Date(); return d.getFullYear() + '-' + deux(d.getMonth() + 1) + '-' + deux(d.getDate()); }
  function joursAvant(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() - n, 12); return x; }

  // ---------- Stockage ----------
  function vide() {
    // visites : jours où le jeu a été ouvert ; coffresMega : { jour où la série a atteint 5, 10… : étoiles (null = pas encore ouvert) }.
    // gemmes : pierres précieuses (v6.46) ; simplesDepuis : niveau au passage à la v6.46 (les coffres simples
    // commencent au niveau suivant, pour ne pas en offrir des dizaines d'un coup aux joueurs déjà avancés).
    return { v: 1, total: 0, journal: [], parJour: {}, coffresJour: {}, coffresNiveau: {}, coffresMega: {}, visites: [], defis: {}, parties: [], gemmes: 0, simplesDepuis: null,
      // defisEnCours : { solo: { jour, id } } défi commencé et pas encore fini ; defisQuittes : { jour: { solo: true } } (v6.47).
      defisEnCours: {}, defisQuittes: {} };
  }
  // stockage : objet avec getItem / setItem (localStorage dans la page, une imitation dans les tests).
  function Compte(stockage, maintenant) {
    this.stockage = stockage || null;
    this.maintenant = maintenant || function () { return new Date(); };
    this.etat = this.lire();
  }
  Compte.prototype.lire = function () {
    var d = null;
    try { d = JSON.parse(this.stockage && this.stockage.getItem(CLE) || 'null'); } catch (e) { d = null; }
    var e = vide();
    if (d && d.v === 1) for (var k in e) if (d[k] !== undefined) e[k] = d[k];
    if (e.simplesDepuis === null) e.simplesDepuis = niveau(e.total).niveau;
    return e;
  };
  Compte.prototype.ecrire = function () {
    try { if (this.stockage) this.stockage.setItem(CLE, JSON.stringify(this.etat)); } catch (e) { /* stockage plein ou interdit : les étoiles restent en mémoire */ }
  };
  Compte.prototype.aujourdhui = function () { return jour(this.maintenant()); };
  Compte.prototype.niveau = function () { return niveau(this.etat.total); };

  // Ajoute n pierres précieuses (v6.46).
  Compte.prototype.gagnerGemmes = function (n) {
    this.etat.gemmes = (this.etat.gemmes || 0) + Math.max(0, Math.round(n));
    this.ecrire();
    return n;
  };

  // Ajoute n étoiles. type : 'partie', 'defi-solo', 'defi-equipe', 'coffre-jour', 'coffre-simple', 'coffre-argent', 'coffre-or'.
  // Renvoie { n, avant, apres, coffres: [niveaux qui donnent un nouveau coffre] }.
  Compte.prototype.gagner = function (n, type, texte) {
    var e = this.etat, j = this.aujourdhui();
    n = Math.max(0, Math.round(n));
    var avant = niveau(e.total).niveau;
    e.total += n;
    var apres = niveau(e.total).niveau;
    e.parJour[j] = (e.parJour[j] || 0) + n;
    e.journal.unshift({ quand: this.maintenant().toISOString(), jour: j, type: type, n: n, texte: texte || '' });
    if (e.journal.length > JOURNAL_MAX) e.journal.length = JOURNAL_MAX;
    // Ménage : on ne garde que les derniers jours dans les totaux par jour.
    var limite = jour(joursAvant(this.maintenant(), JOURS_GARDES));
    Object.keys(e.parJour).forEach(function (k) { if (k < limite) delete e.parJour[k]; });
    var coffres = [];
    for (var L = avant + 1; L <= apres; L++) {
      var t = coffreDuNiveau(L);
      if (t && !(t === 'simple' && L <= e.simplesDepuis)) coffres.push(L);
    }
    this.ecrire();
    return { n: n, avant: avant, apres: apres, coffres: coffres };
  };

  // ---------- Série de jours d'affilée et méga coffre ----------
  // Jours où le joueur est venu : visites notées, plus (pour les joueurs d'avant la v6.38) les jours où il a
  // ouvert le coffre du jour ou gagné des étoiles.
  Compte.prototype.joursVenus = function () {
    var e = this.etat, vus = {};
    e.visites.concat(Object.keys(e.coffresJour), Object.keys(e.parJour)).forEach(function (j) { vus[j] = true; });
    return vus;
  };
  // Nombre de jours d'affilée jusqu'à aujourd'hui (aujourd'hui compris s'il est venu ; sinon jusqu'à hier).
  Compte.prototype.serie = function () {
    var vus = this.joursVenus(), m = this.maintenant(), k = vus[jour(m)] ? 0 : 1, n = 0;
    while (vus[jour(joursAvant(m, k + n))]) n++;
    return n;
  };
  // Note la venue du jour (ouverture du jeu, retour sur l'application). Si la série atteint 5, 10, 15… jours,
  // un méga coffre est gagné (gardé jusqu'à son ouverture). Renvoie true si un méga coffre vient d'être gagné.
  Compte.prototype.visite = function () {
    var e = this.etat, j = this.aujourdhui(), neuf = false;
    if (e.visites.indexOf(j) < 0) {
      e.visites.push(j);
      e.visites.sort();
      if (e.visites.length > JOURS_GARDES) e.visites = e.visites.slice(-JOURS_GARDES);
    }
    var s = this.serie();
    if (s >= SERIE_MEGA && s % SERIE_MEGA === 0 && !(j in e.coffresMega)) { e.coffresMega[j] = null; neuf = true; }
    this.ecrire();
    return neuf;
  };
  // Où en est le joueur vers le prochain méga coffre : { serie, dans (0 à 4 jours faits du cycle), reste }.
  Compte.prototype.versMega = function () {
    var s = this.serie(), dans = s % SERIE_MEGA;
    return { serie: s, dans: dans, besoin: SERIE_MEGA, reste: SERIE_MEGA - dans };
  };

  // Coffres qu'on peut ouvrir maintenant : celui du jour (s'il n'est pas ouvert), les méga coffres gagnés
  // et ceux des niveaux atteints.
  Compte.prototype.coffresAOuvrir = function () {
    var e = this.etat, liste = [];
    if (e.coffresJour[this.aujourdhui()] === undefined) liste.push({ type: 'jour', cle: this.aujourdhui() });
    Object.keys(e.coffresMega).sort().forEach(function (j) { if (e.coffresMega[j] === null) liste.push({ type: 'mega', cle: j }); });
    var L = niveau(e.total).niveau;
    for (var k = 2; k <= L; k++) {
      var t = coffreDuNiveau(k);
      if (t === 'simple' && k <= e.simplesDepuis) continue;
      if (e.coffresNiveau[k] === undefined) liste.push({ type: t, niveau: k, cle: String(k) });
    }
    return liste;
  };
  Compte.prototype.coffreDuJourOuvert = function () { return this.etat.coffresJour[this.aujourdhui()]; };

  // Ouvre un coffre (un élément de coffresAOuvrir). hasard : fonction qui renvoie un nombre dans [0, 1).
  // Renvoie le gain (voir gagner) avec le type de coffre, ou null si ce coffre n'est pas (ou plus) à ouvrir.
  Compte.prototype.ouvrir = function (coffre, hasard) {
    var e = this.etat;
    var dispo = this.coffresAOuvrir().filter(function (c) { return c.type === coffre.type && c.cle === coffre.cle; })[0];
    if (!dispo) return null;
    var def = COFFRES[coffre.type];
    var n = def.min + Math.floor((hasard || Math.random)() * (def.max - def.min + 1));
    if (coffre.type === 'jour') e.coffresJour[coffre.cle] = n;
    else if (coffre.type === 'mega') e.coffresMega[coffre.cle] = n;
    else e.coffresNiveau[coffre.cle] = n;
    var g = this.gagner(n, 'coffre-' + coffre.type, def.nom + (coffre.niveau ? ' (niveau ' + coffre.niveau + ')' : ''));
    g.coffre = coffre.type;
    g.gemmes = this.gagnerGemmes(GEMMES[coffre.type] || 0);
    return g;
  };

  // ---------- Parties et défis ----------
  // Récompense d'une partie terminée. id : identifiant unique de la partie (une partie ne rapporte qu'une fois,
  // même si la page est rechargée sur l'écran de fin). defi : 'solo', 'equipe' ou null.
  // Renvoie null si la partie a déjà été récompensée ; sinon { base, bonus, defiDejaFait, gain, gemmes }.
  // hasard : fonction dans [0, 1) pour la pierre précieuse (1 chance sur 3, v6.46).
  Compte.prototype.recompenserPartie = function (id, unites, gagnee, defi, texte, hasard) {
    var e = this.etat;
    if (e.parties.indexOf(id) >= 0) return null;
    e.parties.unshift(id);
    if (e.parties.length > 50) e.parties.length = 50;
    // Défi fini (gagné ou perdu) : il n'est plus en cours. Quitté plus tôt aujourd'hui : aucune récompense (v6.47).
    if (defi && e.defisEnCours[defi] && e.defisEnCours[defi].id === id) delete e.defisEnCours[defi];
    if (defi && this.defiQuitte(defi)) { this.ecrire(); return { base: 0, bonus: 0, gain: null, gemmes: 0, quitte: true }; }
    if (!gagnee) { this.ecrire(); return { base: 0, bonus: 0, gain: null, gemmes: 0 }; }
    var j = this.aujourdhui();
    var base = unites, bonus = 0, dejaFait = false;
    if (defi) {
      e.defis[j] = e.defis[j] || {};
      if (e.defis[j][defi] === undefined) { bonus = unites; e.defis[j][defi] = base + bonus; }
      else dejaFait = true;
    }
    var type = defi && !dejaFait ? 'defi-' + defi : 'partie';
    var gain = this.gagner(base + bonus, type, texte);
    var gemmes = (hasard || Math.random)() < CHANCE_GEMME ? this.gagnerGemmes(1) : 0;
    return { base: base, bonus: bonus, defiDejaFait: dejaFait, gain: gain, gemmes: gemmes };
  };
  // ---------- Défi quitté (v6.47) ----------
  // Un défi commence (id : identifiant de la partie). Si un autre défi du même type était encore en cours
  // aujourd'hui, il a été quitté avant la fin.
  Compte.prototype.commencerDefi = function (defi, id) {
    var e = this.etat, j = this.aujourdhui(), c = e.defisEnCours[defi];
    if (c && c.jour === j && c.id !== id) this.marquerQuitte(defi);
    e.defisEnCours[defi] = { jour: j, id: id };
    this.ecrire();
  };
  // Le défi en cours (s'il y en a un) a été quitté : plus de récompense pour ce défi aujourd'hui.
  Compte.prototype.marquerQuitte = function (defi) {
    var e = this.etat, j = this.aujourdhui(), c = e.defisEnCours[defi];
    delete e.defisEnCours[defi];
    if (c && c.jour !== j) { this.ecrire(); return; } // défi d'un autre jour : rien à bloquer aujourd'hui
    e.defisQuittes[j] = e.defisQuittes[j] || {};
    e.defisQuittes[j][defi] = true;
    // Ménage : seulement aujourd'hui.
    Object.keys(e.defisQuittes).forEach(function (k) { if (k !== j) delete e.defisQuittes[k]; });
    this.ecrire();
  };
  // Défis en cours qui ne sont pas la partie affichée (type, id) : quittés (jeu fermé, retour à l'accueil…).
  Compte.prototype.verifierDefis = function (defi, id) {
    var e = this.etat, self = this;
    Object.keys(e.defisEnCours).forEach(function (t) {
      if (t === defi && e.defisEnCours[t].id === id) return;
      self.marquerQuitte(t);
    });
  };
  // Vrai si ce défi a été quitté aujourd'hui.
  Compte.prototype.defiQuitte = function (defi) { var q = this.etat.defisQuittes[this.aujourdhui()]; return !!(q && q[defi]); };
  // Défi encore à faire aujourd'hui : ni réussi, ni quitté.
  Compte.prototype.defiAFaire = function (defi) { return this.defiDuJour(defi) === undefined && !this.defiQuitte(defi); };

  // Étoiles gagnées avec ce défi aujourd'hui (undefined s'il n'est pas encore réussi).
  Compte.prototype.defiDuJour = function (defi) { var d = this.etat.defis[this.aujourdhui()]; return d ? d[defi] : undefined; };

  // Étoiles gagnées les n derniers jours (du plus ancien à aujourd'hui) : [{ jour, n }].
  Compte.prototype.derniersJours = function (n) {
    var t = [], m = this.maintenant();
    for (var k = n - 1; k >= 0; k--) { var j = jour(joursAvant(m, k)); t.push({ jour: j, n: this.etat.parJour[j] || 0 }); }
    return t;
  };

  var api = {
    CLE: CLE, COFFRES: COFFRES, SERIE_MEGA: SERIE_MEGA, GEMMES: GEMMES, CHANCE_GEMME: CHANCE_GEMME, Compte: Compte,
    seuil: seuil, pas: pas, niveau: niveau, coffreDuNiveau: coffreDuNiveau, prochainCoffre: prochainCoffre, prochainGrosCoffre: prochainGrosCoffre, jour: jour
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Etoiles = api;
})(this);
