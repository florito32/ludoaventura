// Partie rapide solo (v6.43 ; v6.45 : solo et niveau, demande de l'utilisateur du 10/11/2026, backlog lignes 207 à 215).
// On choisit les matières (Maths, Français ou les deux) et le niveau (Facile, Moyen, Difficile, Expert) ;
// le jeu tire au hasard l'aventure (de la difficulté du niveau) et l'aventurier, puis lance la partie.
// Le niveau fixe la difficulté des questions : mêmes réglages par niveau que le défi du jour (js/defis.js),
// tirés de nouveau à chaque carte (hypothèse à valider) :
//  - Maths : signes et nombres du niveau ;
//  - Français : orthographe, conjugaison ou grammaire (une chance sur trois, v6.55) ; orthographe : tous les thèmes,
//    mots et questions du niveau ; conjugaison : temps et groupes du niveau ; grammaire : tous les jeux, au niveau.
//  - Géographie et Histoire (v8.6, demande du 13/11/2026) : tous les jeux de la matière jouables dans le mode choisi
//    (Quiz ou Normal, choix visible seulement quand l'une des deux est cochée), au niveau choisi.
// Aventure : Facile → facile, Moyen → moyenne, Difficile et Expert → difficile (des aventures « Expert » viendront plus tard).
// Partie logique (sans interface) utilisable dans les tests Node ; l'écran est construit plus bas, dans la page seulement.
(function (racine) {
  'use strict';

  var noeud = typeof module !== 'undefined' && module.exports;
  var A = noeud ? require('./aventures.js') : racine.Aventures;
  var P = noeud ? require('./aventuriers.js') : racine.Aventuriers;
  var K = noeud ? require('./calcul.js') : racine.Calcul;
  var V = noeud ? require('./conjugaison.js') : racine.Conjugaison;
  var D = noeud ? require('./defis.js') : racine.Defis;
  var G = noeud ? require('./grammaire.js') : racine.Grammaire;

  var MATIERES = [{ id: 'maths', nom: 'Maths' }, { id: 'francais', nom: 'Français' },
    { id: 'geographie', nom: 'Géographie' }, { id: 'histoire', nom: 'Histoire' }];
  var IDS = MATIERES.map(function (m) { return m.id; });
  // Mode des cartes de Géographie et d'Histoire (v8.6) : les mêmes que dans la partie libre (js/savoirs.js).
  var MODES = [{ id: 'quiz', nom: 'Quiz' }, { id: 'normal', nom: 'Normal' }];
  function modeValide(m) { return m === 'normal' ? 'normal' : 'quiz'; }
  function avecSavoir(matieres) { return (matieres || []).some(function (m) { return m === 'geographie' || m === 'histoire'; }); }
  var NIVEAUX = D.NIVEAUX;
  function niveauValide(n) { return NIVEAUX.some(function (x) { return x.id === n; }) ? n : 'facile'; }

  function tirer(t, r) { return t[Math.floor(r() * t.length)]; }
  function melanger(t, r) {
    t = t.slice();
    for (var i = t.length - 1; i > 0; i--) { var k = Math.floor(r() * (i + 1)), x = t[i]; t[i] = t[k]; t[k] = x; }
    return t;
  }

  // Réglages de calcul « tout coché » pour un niveau.
  function mathsTout(niveau) {
    var m = { niveau: niveau, signes: K.SIGNES.map(function (s) { return s.id; }), nbSignes: K.choixSignes(niveau),
      nombres: [], dizaines: [], centaines: [], milliers: [] };
    K.groupes(niveau).forEach(function (g) { m[g.id] = g.valeurs.slice(); });
    return m;
  }
  // Réglages de conjugaison « tout coché » pour un niveau de verbes.
  function conjTout(niveau) {
    var modes = V.MODES.map(function (m) { return m.id; });
    return { niveau: niveau, modes: modes, temps: V.TEMPS.map(function (t) { return t.id; }), groupes: [1, 2, 3] };
  }

  // Réglages de grammaire « tout coché » pour un niveau (v6.55).
  function gramTout(niveau) { return { niveau: niveau, jeux: G.JEUX.map(function (j) { return j.id; }) }; }

  // La partie : choix = { matieres: ['maths', 'francais', 'geographie', 'histoire'], niveau, mode } → aventure (de la difficulté du niveau)
  // et aventurier tirés au hasard. Toujours 1 joueur (partie rapide solo, v6.45).
  function generer(choix, r) {
    r = r || Math.random;
    var niveau = niveauValide(choix.niveau);
    var matieres = (choix.matieres || []).filter(function (m) { return IDS.indexOf(m) >= 0; });
    if (!matieres.length) matieres = IDS.slice();
    var aventures = A.LISTE.filter(function (a) { return a.difficulte === D.DIFFICULTE_AVENTURE[niveau]; });
    return {
      joueurs: 1,
      matieres: matieres,
      niveau: niveau,
      mode: modeValide(choix.mode),
      aventure: tirer(aventures, r).id,
      aventuriers: [tirer(P.LISTE, r).id]
    };
  }

  // Réglages d'orthographe de la partie (le tas de cartes du joueur) : tous les thèmes, les mots et toutes
  // les questions du niveau. dispo : questions jouables sur l'appareil (facultatif).
  function ortho(niveau, dispo) {
    var o = D.ORTHO[niveauValide(niveau)];
    return { packs: D.PACKS.slice(), types: o.types.filter(function (t) { return !dispo || dispo.indexOf(t) >= 0; }), mots: o.mots.slice() };
  }

  // Ce que demande la prochaine carte : { matiere: 'maths' | 'orthographe' | 'conjugaison' | 'grammaire' | 'geographie' | 'histoire',
  // maths?, conj?, gram?, savoir? } ; savoir = { niveau, mode } (les jeux sont ceux de la matière jouables dans ce mode).
  // niveau absent (partie rapide gardée d'avant la v6.45) : un niveau au hasard, tout coché, comme avant.
  function carte(matieres, niveau, r, mode) {
    r = r || Math.random;
    var m = tirer(matieres && matieres.length ? matieres : ['maths', 'francais'], r);
    if (m === 'francais') { var f = r(); m = f < 1 / 3 ? 'orthographe' : f < 2 / 3 ? 'conjugaison' : 'grammaire'; }
    if (m === 'geographie' || m === 'histoire') return { matiere: m, savoir: { niveau: niveau ? niveauValide(niveau) : 'facile', mode: modeValide(mode) } };
    if (m === 'orthographe') return { matiere: 'orthographe' };
    if (m === 'grammaire') return { matiere: 'grammaire', gram: gramTout(niveau ? niveauValide(niveau) : tirer(NIVEAUX, r).id) };
    if (!niveau) {
      if (m === 'maths') return { matiere: 'maths', maths: mathsTout(tirer(K.NIVEAUX, r).id) };
      return { matiere: 'conjugaison', conj: conjTout(tirer(V.NIVEAUX, r).id) };
    }
    var reg = D.reglages(m, niveauValide(niveau), r);
    return m === 'maths' ? { matiere: 'maths', maths: reg.maths } : { matiere: 'conjugaison', conj: reg.conj };
  }

  var api = { MATIERES: MATIERES, MODES: MODES, NIVEAUX: NIVEAUX, avecSavoir: avecSavoir, generer: generer, carte: carte, ortho: ortho, gramTout: gramTout, mathsTout: mathsTout, conjTout: conjTout };
  if (noeud) { module.exports = api; return; }
  racine.Rapide = api;

  // ---------- Écran « Partie rapide » ----------
  var $ = function (id) { return document.getElementById(id); };
  var CLE = 'ludoaventura-rapide-choix';
  var choix = { matieres: IDS.slice(), niveau: 'facile', mode: 'quiz' };
  try { var lu = JSON.parse(localStorage.getItem(CLE) || 'null'); if (lu) { if (lu.matieres) choix.matieres = lu.matieres; if (lu.niveau) choix.niveau = niveauValide(lu.niveau); if (lu.mode) choix.mode = modeValide(lu.mode); } } catch (e) { /* */ }
  function garder() { try { localStorage.setItem(CLE, JSON.stringify(choix)); } catch (e) { /* */ } }

  // v6.45 : plus de choix du nombre de joueurs (solo) ; niveau ajouté ; « Tout » / « Aucune » à côté du mot « Matières ».
  function page() {
    var tout = choix.matieres.length === MATIERES.length;
    // Le titre « Matières » n'est pas une <legend> pour pouvoir mettre le bouton sur la même ligne
    // sans qu'il fasse partie du nom du groupe (aria-labelledby).
    var h = '<section class="carte-page"><fieldset class="defi-choix rapide-matieres" aria-labelledby="rapide-titre-matieres">' +
      '<div class="titre-choix"><span class="legende" id="rapide-titre-matieres">Matières</span>' +
      '<button type="button" class="btn-tout" id="btn-rapide-tout">' + (tout ? 'Aucune' : 'Tout') + '</button></div><div class="packs">';
    MATIERES.forEach(function (m) {
      h += '<label class="pack"><input type="checkbox" name="rapide-matiere" value="' + m.id + '"' + (choix.matieres.indexOf(m.id) >= 0 ? ' checked' : '') + '><span>' + m.nom + '</span></label>';
    });
    h += '</div></fieldset>';
    h += '<fieldset class="defi-choix"><legend>Niveau</legend><div class="packs">';
    NIVEAUX.forEach(function (n) {
      h += '<label class="pack"><input type="radio" name="rapide-niveau" value="' + n.id + '"' + (choix.niveau === n.id ? ' checked' : '') + '><span>' + n.nom + '</span></label>';
    });
    h += '</div></fieldset>';
    // v8.6 : mode Quiz / Normal, seulement si Géographie ou Histoire est cochée (choix de l'utilisateur).
    // v8.6 : plus de petit commentaire sous les choix (demande de l'utilisateur).
    if (avecSavoir(choix.matieres)) {
      h += '<fieldset class="defi-choix"><legend>Mode</legend><div class="packs">';
      MODES.forEach(function (m) {
        h += '<label class="pack"><input type="radio" name="rapide-mode" value="' + m.id + '"' + (choix.mode === m.id ? ' checked' : '') + '><span>' + m.nom + '</span></label>';
      });
      h += '</div></fieldset>';
    }
    h += '<p class="reglage-alerte" id="rapide-alerte" role="status" aria-live="polite"></p>';
    h += '<button type="button" class="btn btn-principal" id="btn-lancer-rapide">Lancer la partie</button></section>';
    $('rapide-corps').innerHTML = h;
  }

  $('rapide-corps').addEventListener('change', function (e) {
    if (e.target.name === 'rapide-niveau') choix.niveau = niveauValide(e.target.value);
    if (e.target.name === 'rapide-mode') choix.mode = modeValide(e.target.value);
    if (e.target.name === 'rapide-matiere') {
      choix.matieres = MATIERES.map(function (m) { return m.id; }).filter(function (id) {
        var c = $('rapide-corps').querySelector('input[name="rapide-matiere"][value="' + id + '"]');
        return c && c.checked;
      });
    }
    garder();
    var n = e.target.name, v = e.target.value;
    page();
    var el = $('rapide-corps').querySelector('input[name="' + n + '"][value="' + v + '"]');
    if (el) el.focus({ preventScroll: true });
  });
  $('rapide-corps').addEventListener('click', function (e) {
    if (e.target.closest('#btn-rapide-tout')) {
      choix.matieres = choix.matieres.length === MATIERES.length ? [] : MATIERES.map(function (m) { return m.id; });
      garder(); page();
      $('btn-rapide-tout').focus();
      return;
    }
    if (e.target.closest('#btn-lancer-rapide')) {
      if (!choix.matieres.length) { $('rapide-alerte').textContent = 'Choisis au moins une matière.'; return; }
      window.Aventura.lancerRapide(generer(choix));
    }
  });
  // « Recommencer la partie » en fin de partie rapide (v6.45) passe par js/plateau.js.
  $('btn-rapide').addEventListener('click', function () { window.Aventura.afficher('ecran-rapide'); });
  document.addEventListener('aventura-ecran', function (e) { if (e.detail === 'ecran-rapide') page(); });
})(this);
