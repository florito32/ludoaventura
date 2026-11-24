// Choix de la partie en onglets à gauche + bandeaux déroulants à droite (v10.13, demande du 18/11/2026,
// proposition A de la page de test). Écran « quelle matière ? » de l'étape 3.
//
// Ce fichier ne change PAS la logique du jeu : les choix restent les cases rondes/cochables de index.html
// (rangées .reglage-ligne), gérées par js/plateau.js. Ici on ne fait que
//   - lire ces rangées pour écrire, dans chaque onglet, le choix fait ;
//   - afficher une seule rangée à la fois (la rangée « ouverte »), à droite de l'onglet cliqué ;
//   - passer au bandeau suivant après un choix (un seul choix possible), et rester ouvert pour les cases multiples.
// plateau.js appelle Selecteur.maj() à chaque rafraîchissement de l'étape 3.
(function () {
  'use strict';

  // Les 4 onglets. « lignes » : les rangées de index.html qui peuvent servir de bandeau (une seule est visible à la fois,
  // selon la matière : plateau.js masque les autres avec l'attribut hidden).
  var ETAPES = [
    { cle: 'matiere', titre: 'Matière', icone: '📚', lignes: ['reglage-matiere'] },
    { cle: 'type', titre: 'Exercice', icone: '✏️', lignes: ['reglage-francais', 'reglage-type-maths', 'reglage-mode-savoir'] },
    { cle: 'niveau', titre: 'Niveau', icone: '🎚️', lignes: ['reglage-niveau-prog', 'reglage-niveau-maths', 'reglage-niveau-ortho', 'reglage-niveau-conj', 'reglage-niveau-gram', 'reglage-niveau-savoir'] }, // v10.36 : niveau 1 à 10 d'abord
    { cle: 'signes', titre: 'Signes par calcul', icone: '🔢', lignes: ['reglage-nb-signes'] }
  ];

  var conteneur, rail, zone, ouverte = null, etaitVisible = false, focaliser = false, onglets = {}, avance = null;

  function $(id) { return document.getElementById(id); }

  // La rangée de l'étape qui est affichée pour la matière en cours (null si aucune).
  function ligneDe(etape) {
    for (var i = 0; i < etape.lignes.length; i++) {
      var l = $(etape.lignes[i]);
      if (l && !l.hidden) return l;
    }
    return null;
  }
  function etapeDe(ligne) {
    return ETAPES.filter(function (e) { return e.lignes.indexOf(ligne.id) >= 0; })[0] || null;
  }
  // Texte des choix cochés d'une rangée (ex. « Calcul mental », ou « 1, 2 » pour les signes).
  function valeur(ligne) {
    var t = [];
    ligne.querySelectorAll('input:checked').forEach(function (i) {
      var p = i.closest('.pack');
      if (p && !p.hidden) t.push(p.textContent.replace(/\s+/g, ' ').trim());
    });
    return t.join(', ');
  }

  function construire() {
    ETAPES.forEach(function (e) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'onglet';
      b.dataset.etape = e.cle;
      b.setAttribute('aria-expanded', 'false');
      b.innerHTML = '<span class="onglet-icone" aria-hidden="true">' + e.icone + '</span>' +
        '<span class="onglet-texte"><span class="onglet-titre"></span><span class="onglet-valeur"></span></span>' +
        '<span class="onglet-coche" aria-hidden="true">✓</span>';
      rail.appendChild(b);
      onglets[e.cle] = b;
    });
  }

  // Remet l'écran d'aplomb : onglets, bandeau ouvert, bouton « Valider » du dernier bandeau.
  function maj() {
    conteneur = conteneur || $('choix-matiere');
    if (!conteneur) return;
    if (conteneur.hidden) { // autre écran : « Valider » du bas à nouveau visible
      etaitVisible = false; ouverte = null; $('btn-valider-reglages').classList.remove('valider-masque'); return;
    }
    var matiereChoisie = !!conteneur.querySelector('#matieres input:checked');
    if (!etaitVisible) { etaitVisible = true; ouverte = matiereChoisie ? null : 'matiere'; focaliser = false; }

    // Étapes à montrer : celles qui ont une rangée ; avant la matière, les suivantes sont grisées.
    var liste = [];
    ETAPES.forEach(function (e) {
      var l = ligneDe(e);
      if (l) liste.push({ e: e, l: l });
      else if (!matiereChoisie && e.cle !== 'matiere') liste.push({ e: e, l: null });
    });
    // Un choix unique vient d'être fait : on ouvre le bandeau suivant (ou on garde celui-ci s'il est le dernier).
    if (avance) {
      var iA = -1;
      liste.forEach(function (x, i) { if (x.e.cle === avance) iA = i; });
      var suiv = liste.slice(iA + 1).filter(function (x) { return x.l; })[0];
      ouverte = suiv ? suiv.e.cle : avance;
      focaliser = true; avance = null;
    }
    if (ouverte && !liste.some(function (x) { return x.e.cle === ouverte && x.l; })) ouverte = null;

    ETAPES.forEach(function (e) {
      var item = liste.filter(function (x) { return x.e.cle === e.cle; })[0], b = onglets[e.cle];
      b.hidden = !item;
      if (!item) return;
      var v = item.l ? valeur(item.l) : '';
      b.disabled = !item.l;
      b.classList.toggle('ouvert', ouverte === e.cle);
      b.classList.toggle('fait', !!v);
      b.setAttribute('aria-expanded', String(ouverte === e.cle));
      if (item.l) b.setAttribute('aria-controls', item.l.id); else b.removeAttribute('aria-controls');
      var titre = (e.cle === 'type' && item.l && item.l.id === 'reglage-mode-savoir') ? 'Mode' : e.titre; // géographie / histoire : « Mode »
      b.querySelector('.onglet-titre').textContent = titre;
      b.querySelector('.onglet-valeur').textContent = v;
      b.setAttribute('aria-label', titre + (v ? ' : ' + v : ''));
    });

    // Une seule rangée ouverte ; le dernier bandeau porte le bouton « Valider ».
    ETAPES.forEach(function (e) {
      e.lignes.forEach(function (id) {
        var l = $(id);
        if (!l) return;
        var ouvre = ouverte === e.cle && !l.hidden;
        l.classList.toggle('ouvert', ouvre);
        var bv = l.querySelector('.btn-valider-bandeau');
        var derniere = liste.length && liste[liste.length - 1].l === l;
        if (derniere && !bv) {
          bv = document.createElement('button');
          bv.type = 'button';
          bv.className = 'btn btn-principal btn-valider-bandeau';
          bv.textContent = 'Valider';
          bv.setAttribute('aria-label', 'Valider mes choix'); // nom différent de « Valider » du bas de l'écran
          l.appendChild(bv);
        } else if (!derniere && bv) bv.remove();
        if (bv && derniere) bv.disabled = $('btn-valider-reglages').disabled; // même état que « Valider » du bas
      });
    });
    var dernierOuvert = !!ouverte && liste.length > 0 && liste[liste.length - 1].e.cle === ouverte;
    $('btn-valider-reglages').classList.toggle('valider-masque', dernierOuvert); // un seul « Valider » visible
    zone.textContent = ouverte ? '' : (matiereChoisie ? 'Touche un onglet pour changer un choix, puis « Valider ».' : 'Touche « Matière » pour commencer.');

    placer(liste);
    if (focaliser && ouverte) {
      var l2 = ligneDe(ETAPES.filter(function (e) { return e.cle === ouverte; })[0]);
      var f = l2 && (l2.querySelector('input:checked') || l2.querySelector('input'));
      if (f) f.focus({ preventScroll: true });
    }
    focaliser = false;
  }

  // Place le bandeau ouvert à droite de son onglet (en haut si l'écran est trop bas).
  function placer() {
    conteneur.style.setProperty('--rail-l', rail.offsetWidth + 'px');
    var l = conteneur.querySelector('.reglage-ligne.ouvert');
    if (!l) return;
    var b = onglets[ouverte];
    l.style.top = '0px';
    var haut = Math.max(0, Math.min(b.offsetTop, conteneur.clientHeight - l.offsetHeight));
    l.style.top = haut + 'px';
    l.style.setProperty('--fleche', Math.max(8, b.offsetTop + b.offsetHeight / 2 - haut - 7) + 'px');
  }

  function ouvrir(cle, avecFocus) {
    ouverte = cle; focaliser = !!avecFocus; maj();
  }

  function init() {
    conteneur = $('choix-matiere'); rail = $('rail-choix'); zone = $('zone-choix');
    if (!conteneur || !rail || !zone) return;
    construire();
    rail.addEventListener('click', function (e) {
      var b = e.target.closest('.onglet');
      if (!b || b.disabled) return;
      ouvrir(ouverte === b.dataset.etape ? null : b.dataset.etape, true);
    });
    // Après un choix unique (case ronde) : le bandeau se ferme et le suivant s'ouvre, même si le choix touché était déjà celui
    // en place (le navigateur n'envoie alors pas d'événement « change », d'où le « click »). Cases multiples (signes) : reste ouvert.
    conteneur.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || t.tagName !== 'INPUT' || t.type !== 'radio') return;
      var ligne = t.closest('.reglage-ligne'), et = ligne && etapeDe(ligne);
      if (!et) return;
      // maj() (appelée par plateau.js juste après, quand les rangées suivantes sont révélées) ouvre le bandeau suivant ;
      // la minuterie sert quand plateau.js ne rafraîchit pas (choix déjà en place).
      avance = et.cle;
      setTimeout(function () { if (avance) maj(); }, 0);
    });
    conteneur.addEventListener('click', function (e) {
      if (e.target.closest('.btn-valider-bandeau')) $('btn-valider-reglages').click();
    });
    // Un clic ailleurs ou Échap ferme le bandeau.
    document.addEventListener('click', function (e) {
      if (!ouverte || conteneur.hidden) return;
      if (e.target.closest('#rail-choix') || e.target.closest('#choix-matiere .reglage-ligne.ouvert')) return;
      if (!conteneur.contains(e.target)) return; // seulement dans l'écran de choix : les autres boutons gardent leur rôle
      ouverte = null; maj();
    });
    conteneur.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ouverte) { var cle = ouverte; ouverte = null; maj(); onglets[cle].focus(); }
    });
    window.addEventListener('resize', function () { if (!conteneur.hidden) placer(); });
    maj();
  }

  // Le bouton « Valider » à montrer maintenant (celui du dernier bandeau s'il est ouvert, sinon celui du bas) : pour Ludo.
  function boutonValider() {
    var b = conteneur && !conteneur.hidden && conteneur.querySelector('.reglage-ligne.ouvert .btn-valider-bandeau');
    return b || $('btn-valider-reglages');
  }
  window.Selecteur = { maj: maj, boutonValider: boutonValider, onglet: function (cle) { return onglets[cle]; } };
  init();
})();
