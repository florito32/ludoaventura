// Déroulement du jeu Ludoaventura : niveau → carte de l'île → défis → trésor.
// La progression (étoiles par lieu et par niveau) est mémorisée sur l'appareil.
(function () {
  'use strict';

  var Q = window.Questions;
  var NB_QUESTIONS = 5;        // questions par lieu
  var MIN_POUR_PASSER = 3;     // bonnes réponses nécessaires pour ouvrir le lieu suivant
  var CLE = 'ludoaventura-progression';

  // Les cinq lieux de l'île, dans l'ordre du chemin (x, y en % de la carte).
  var LIEUX = [
    { nom: 'La plage', icone: '🏖️', x: 15, y: 62, histoire: 'Ton bateau accoste. Compte les coquillages pour trouver le sentier.' },
    { nom: 'La forêt', icone: '🌴', x: 37, y: 80, histoire: 'Les singes ne laissent passer que ceux qui calculent vite.' },
    { nom: 'La rivière', icone: '🌊', x: 65, y: 72, histoire: 'Pose les bonnes pierres pour traverser sans te mouiller.' },
    { nom: 'La grotte', icone: '🦇', x: 40, y: 44, histoire: 'Une porte de pierre s’ouvre avec les bons nombres.' },
    { nom: 'Le volcan', icone: '🌋', x: 78, y: 30, histoire: 'Dernière montée ! Le trésor t’attend au sommet.' }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var etat = { niveau: null, progression: {} };
  var defi = null; // { lieu, questions, index, bonnes, attente }

  // ----- Sauvegarde (protégée : le stockage peut être indisponible) -----
  function charger() {
    try {
      var d = JSON.parse(localStorage.getItem(CLE) || '{}');
      if (d && typeof d === 'object') {
        etat.niveau = Q.NIVEAUX[d.niveau] ? d.niveau : null;
        etat.progression = d.progression || {};
      }
    } catch (e) { /* stockage indisponible : on joue sans sauvegarde */ }
  }
  function sauver() {
    try { localStorage.setItem(CLE, JSON.stringify({ niveau: etat.niveau, progression: etat.progression })); } catch (e) {}
  }
  function etoiles() {
    var t = etat.progression[etat.niveau];
    if (!t) t = etat.progression[etat.niveau] = [0, 0, 0, 0, 0];
    return t;
  }
  function totalEtoiles() { return etoiles().reduce(function (a, b) { return a + b; }, 0); }
  function ouvert(i) { return i === 0 || etoiles()[i - 1] > 0; }

  // ----- Navigation entre écrans -----
  function afficher(id) {
    document.querySelectorAll('.ecran').forEach(function (s) { s.hidden = s.id !== id; });
    $('total-etoiles').hidden = id === 'ecran-accueil';
    $('total-etoiles-n').textContent = etat.niveau ? totalEtoiles() : 0;
    // Le titre de l'écran reçoit le focus : les lecteurs d'écran annoncent le changement.
    var titre = $(id).querySelector('h1, h2');
    if (titre) { titre.setAttribute('tabindex', '-1'); titre.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
  }

  // ----- Écran d'accueil : cartes de niveau -----
  function construireNiveaux() {
    var fs = document.querySelector('.niveaux');
    Object.keys(Q.NIVEAUX).forEach(function (cle, i) {
      var n = Q.NIVEAUX[cle];
      var label = document.createElement('label');
      label.className = 'niveau';
      label.innerHTML =
        '<input type="radio" name="niveau" value="' + cle + '"' + ((etat.niveau ? etat.niveau === cle : i === 0) ? ' checked' : '') + '>' +
        '<span class="niveau-nom">' + n.nom + '</span> ' +
        '<span class="niveau-age">' + n.age + '</span> ' +
        '<span class="niveau-resume">' + n.resume + '</span>';
      fs.appendChild(label);
    });
    $('form-niveau').addEventListener('submit', function (e) {
      e.preventDefault();
      var choix = document.querySelector('input[name="niveau"]:checked');
      etat.niveau = choix ? choix.value : 'moussaillon';
      sauver();
      montrerCarte();
    });
  }

  // ----- Carte de l'île -----
  function montrerCarte() {
    var ol = $('lieux');
    ol.innerHTML = '';
    var e = etoiles();
    var courant = -1;
    LIEUX.forEach(function (l, i) {
      if (courant === -1 && ouvert(i) && e[i] === 0) courant = i;
      var li = document.createElement('li');
      li.style.left = l.x + '%';
      li.style.top = l.y + '%';
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lieu' + (i === courant ? ' lieu-courant' : '') + (e[i] > 0 ? ' lieu-fait' : '');
      b.disabled = !ouvert(i);
      var statut = !ouvert(i) ? 'fermé' : e[i] > 0 ? e[i] + ' étoile' + (e[i] > 1 ? 's' : '') + ' sur 3' : 'à explorer';
      b.setAttribute('aria-label', (i + 1) + '. ' + l.nom + ' — ' + statut);
      b.innerHTML = '<span class="lieu-pastille" aria-hidden="true">' + (ouvert(i) ? l.icone : '🔒') + '</span>' +
        '<span class="lieu-nom" aria-hidden="true">' + l.nom + '</span>' +
        '<span class="lieu-etoiles" aria-hidden="true">' + '★'.repeat(e[i]) + '☆'.repeat(3 - e[i]) + '</span>';
      b.addEventListener('click', function () { lancerDefi(i); });
      li.appendChild(b);
      ol.appendChild(li);
    });
    var tous = e.every(function (n) { return n > 0; });
    $('carte-aide').textContent = tous
      ? 'Tous les lieux sont explorés ! Rejoue-les pour gagner plus d’étoiles.'
      : 'Touche le lieu qui brille pour relever son défi.';
    afficher('ecran-carte');
  }

  // ----- Défi d'un lieu -----
  function lancerDefi(i) {
    var l = LIEUX[i];
    defi = { lieu: i, questions: Q.serie(etat.niveau, i, NB_QUESTIONS), index: 0, bonnes: 0, attente: null };
    $('defi-icone').textContent = l.icone;
    $('titre-defi').textContent = l.nom;
    $('defi-histoire').textContent = l.histoire;
    afficher('ecran-defi');
    poserQuestion();
  }

  function poserQuestion() {
    var q = defi.questions[defi.index];
    $('defi-compteur').textContent = 'Question ' + (defi.index + 1) + ' sur ' + NB_QUESTIONS;
    $('defi-barre').style.width = (defi.index / NB_QUESTIONS * 100) + '%';
    $('defi-question').textContent = q.texte + ' = ?';
    $('defi-retour').textContent = '';
    $('defi-retour').className = 'retour';
    $('btn-suivant').hidden = true;
    var box = $('defi-choix');
    box.innerHTML = '';
    q.choix.forEach(function (v, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choix-btn';
      b.textContent = v;
      b.setAttribute('aria-keyshortcuts', String(k + 1));
      b.addEventListener('click', function () { repondre(b, v); });
      box.appendChild(b);
    });
  }

  function repondre(bouton, valeur) {
    var q = defi.questions[defi.index];
    if (defi.repondu) return;
    defi.repondu = true;
    var boutons = $('defi-choix').querySelectorAll('button');
    boutons.forEach(function (b) {
      b.disabled = true;
      if (Number(b.textContent) === q.reponse) b.classList.add('juste');
    });
    var retour = $('defi-retour');
    if (valeur === q.reponse) {
      defi.bonnes++;
      retour.textContent = 'Bravo ! ' + q.texte + ' = ' + q.reponse;
      retour.className = 'retour ok';
      // Bonne réponse : on enchaîne tout seul après un court instant.
      defi.attente = setTimeout(suivante, 900);
    } else {
      bouton.classList.add('faux');
      retour.textContent = 'Presque ! ' + q.texte + ' = ' + q.reponse;
      retour.className = 'retour ko';
      $('btn-suivant').hidden = false;
      $('btn-suivant').focus();
    }
  }

  function suivante() {
    clearTimeout(defi.attente);
    defi.repondu = false;
    defi.index++;
    if (defi.index < NB_QUESTIONS) poserQuestion();
    else terminerDefi();
  }

  function etoilesPour(bonnes) {
    if (bonnes >= NB_QUESTIONS) return 3;
    if (bonnes >= NB_QUESTIONS - 1) return 2;
    if (bonnes >= MIN_POUR_PASSER) return 1;
    return 0;
  }

  function terminerDefi() {
    var i = defi.lieu;
    var gagnees = etoilesPour(defi.bonnes);
    var e = etoiles();
    var premiereFois = e[i] === 0 && gagnees > 0;
    if (gagnees > e[i]) e[i] = gagnees;
    sauver();

    if (premiereFois && i === LIEUX.length - 1) return montrerTresor();

    $('bilan-icone').textContent = LIEUX[i].icone;
    $('titre-bilan').textContent = gagnees > 0 ? LIEUX[i].nom + ' : réussi !' : 'Encore un effort !';
    $('bilan-etoiles').innerHTML = '<span aria-hidden="true">' + '★'.repeat(gagnees) + '☆'.repeat(3 - gagnees) + '</span>' +
      '<span class="visually-hidden">' + gagnees + ' étoile' + (gagnees > 1 ? 's' : '') + ' sur 3</span>';
    $('bilan-texte').textContent = defi.bonnes + ' bonne' + (defi.bonnes > 1 ? 's' : '') + ' réponse' + (defi.bonnes > 1 ? 's' : '') +
      ' sur ' + NB_QUESTIONS + '. ' +
      (gagnees > 0
        ? (premiereFois ? 'Le chemin vers ' + LIEUX[i + 1].nom.toLowerCase() + ' est ouvert.' : '')
        : 'Il faut au moins ' + MIN_POUR_PASSER + ' bonnes réponses pour continuer. Tu vas y arriver !');
    afficher('ecran-bilan');
  }

  function montrerTresor() {
    $('tresor-texte').textContent = 'Tu as traversé toute l’île en niveau ' + Q.NIVEAUX[etat.niveau].nom +
      ' et gagné ' + totalEtoiles() + ' étoiles sur 15. Essaie d’obtenir 3 étoiles partout, ou tente un niveau plus difficile !';
    afficher('ecran-tresor');
  }

  // ----- Boutons -----
  function brancher() {
    $('btn-suivant').addEventListener('click', suivante);
    $('btn-quitter-defi').addEventListener('click', function () { clearTimeout(defi && defi.attente); defi = null; montrerCarte(); });
    $('btn-bilan-carte').addEventListener('click', montrerCarte);
    $('btn-bilan-rejouer').addEventListener('click', function () { lancerDefi(defi.lieu); });
    $('btn-tresor-carte').addEventListener('click', montrerCarte);
    $('btn-tresor-rejouer').addEventListener('click', function () { afficher('ecran-accueil'); });
    $('btn-changer-niveau').addEventListener('click', function () { afficher('ecran-accueil'); });

    // Clavier : touches 1 à 4 pour répondre, Entrée pour la question suivante.
    document.addEventListener('keydown', function (e) {
      if ($('ecran-defi').hidden || e.altKey || e.ctrlKey || e.metaKey) return;
      var k = Number(e.key);
      if (k >= 1 && k <= 4) {
        var b = $('defi-choix').querySelectorAll('button')[k - 1];
        if (b && !b.disabled) b.click();
      }
    });
  }

  charger();
  construireNiveaux();
  brancher();
  // Un joueur qui revient retrouve directement sa carte.
  if (etat.niveau) montrerCarte();

  // Accès pour les tests automatiques.
  window.Ludo = { lieux: LIEUX, nbQuestions: NB_QUESTIONS };
})();
