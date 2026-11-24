// Choix des joueurs d'une partie (demande de l'utilisateur du 23/11/2026, backlog lignes 446 à 448).
// Remplace « Combien de joueurs ? » et « Choisis ton aventurier » : on choisit parmi les joueurs créés dans le compte
// (js/joueurs.js). Proposition A retenue : une ligne par joueur (visage, nom, niveaux), « Changer » ouvre la liste des
// joueurs du compte, « Ajouter un joueur » en ajoute un (4 au plus), un joueur déjà dans la partie est grisé.
// Utilisé par l'étape 1 de la préparation (js/plateau.js) et par la fenêtre « Qui joue ? » des défis, parties rapides et
// Baby jeux (nombre de places fixé). Deux joueurs peuvent avoir le même personnage : même figurine, pion de couleur différente.
// v10.36 (demande du 24/11/2026) : à l'étape 1 de la préparation, chaque joueur choisi a 2 boutons à côté de lui, « Suivre ma
// progression » et « Personnaliser » (option opts.parcours) ; une fois sa préparation faite, la ligne indique ce qu'il a choisi.
// v10.45 (demande du 24/11/2026) : plus de niveaux dans les cartes ni dans la liste des joueurs ; à l'étape 1 de la préparation,
// la ligne du joueur dit la matière choisie ; plus de bouton « Changer » ; un seul joueur = aucun bouton ; plusieurs joueurs =
// une poubelle tout à droite de chaque ligne (elle retire le joueur de la PARTIE, son profil du compte n'est pas touché).
(function () {
  'use strict';

  var J = window.Joueurs, A = window.Aventuriers;
  var COULEURS = ['rouge', 'jaune', 'bleu', 'vert'];
  var MAX = 4;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Même poubelle que sur la carte d'un profil (js/joueurs-ecran.js).
  var POUBELLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
  function perso(id) { return (A && A.trouver(id)) || (A && A.LISTE[0]); }
  function parId(id) { var l = J.duCompte(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  // opts : { fixe: nombre de places imposé (sinon 1 à 4, on ajoute et on retire), slots: [id ou null…], idBase,
  //          surChangement(slots), surCreer(),
  //          parcours: { etat(i) → { parcours: 'suivre' | 'perso' | null, pret: vrai/faux, resume: texte }, choisir(i, parcours) } }
  function creer(zone, opts) {
    var idBase = opts.idBase || 'cj';
    var slots = (opts.slots && opts.slots.length ? opts.slots : [null]).slice(0, MAX);
    if (opts.fixe) { while (slots.length < opts.fixe) slots.push(null); slots.length = opts.fixe; }
    var ouvert = null; // place dont la liste est ouverte
    var focus = null;

    // Les 2 boutons de préparation du joueur de la place i (étape 1) : le bouton déjà choisi reste « appuyé » et la ligne
    // dit ce qui est prêt (« ✓ Maths · suit sa progression »).
    function boutonsParcours(i, j) {
      var e = opts.parcours.etat(i) || {}, nom = esc(j.nom);
      function b(type, texte) {
        return '<button type="button" class="btn cj-btn cj-parcours-btn ' + (e.parcours === type ? 'btn-principal' : 'btn-secondaire') + '" data-parcours="' + type + '" data-place="' + i + '"' +
          ' aria-pressed="' + (e.parcours === type ? 'true' : 'false') + '" aria-label="' + texte + ' : ' + nom + ' (joueur ' + (i + 1) + ')">' + texte + '</button>';
      }
      return '<div class="cj-parcours" role="group" aria-label="Préparation de ' + nom + '">' +
        b('suivre', 'Suivre ma progression') + b('perso', 'Personnaliser') +
        '<p class="cj-resume' + (e.pret ? ' pret' : '') + '" role="status">' + (e.pret ? '✓ ' + esc(e.resume || 'Prêt') : 'À préparer') + '</p></div>';
    }

    function rendre() {
      var liste = J.duCompte();
      // Un joueur supprimé ailleurs ou introuvable : la place redevient vide.
      slots = slots.map(function (id) { return id && parId(id) ? id : null; });
      var h = '<div class="cj-places">';
      slots.forEach(function (id, i) {
        var j = id && parId(id), coul = COULEURS[i], p = j && perso(j.perso);
        // Matière choisie (étape 1 de la préparation seulement) ; sans elle, la ligne dit qu'elle reste à choisir.
        var e = j && opts.parcours ? opts.parcours.etat(i) || {} : null;
        var mat = e ? (e.matiere ? esc(e.matiere) : 'Matière à choisir') : '';
        // Une poubelle par joueur dès qu'il y en a plusieurs (mode libre) ; un joueur seul : aucun bouton.
        var poubelle = !opts.fixe && slots.length > 1;
        h += '<div class="cj-ligne joueur-' + coul + (j ? '' : ' vide') + '" data-place="' + i + '">' +
          (j ? '<img class="cj-avatar" src="' + p.image + '" alt="" width="58" height="58">' : '') +
          '<div class="cj-qui"><div class="cj-etiq">Joueur ' + (i + 1) + ' · pion ' + coul + '</div>' +
          (j ? '<div class="cj-nom"' + (e && e.matiere ? ' data-matiere="' + esc(e.matiere) + '"' : '') + '>' + esc(j.nom) + '</div>' + (mat ? '<div class="cj-niv">' + mat + '</div>' : '') : '<div class="cj-niv">Choisis un joueur</div>') + '</div>' +
          // « Changer » n'existe plus : seule une place vide propose « Choisir » (et, en défi ou partie rapide, les places imposées).
          (!j || opts.fixe ? '<button type="button" class="btn btn-secondaire cj-btn" data-ouvrir="' + i + '" aria-label="' + (j ? 'Changer le joueur ' : 'Choisir le joueur ') + (i + 1) + '">' + (j ? 'Changer' : 'Choisir') + '</button>' : '') +
          (poubelle ? '<button type="button" class="icone-btn suppr cj-retirer" data-retirer="' + i + '" aria-label="Retirer ' + (j ? esc(j.nom) : 'le joueur ' + (i + 1)) + ' de la partie (joueur ' + (i + 1) + ')">' + POUBELLE + '</button>' : '') +
          (j && opts.parcours ? boutonsParcours(i, j) : '') +
          '</div>';
      });
      h += '</div>';
      if (!opts.fixe && slots.length < MAX) h += '<button type="button" class="btn cj-ajouter" data-ajouter="1">＋ Ajouter un joueur</button>';
      if (ouvert !== null && ouvert < slots.length) {
        h += '<div class="cj-choix" role="group" aria-label="Joueurs du compte pour le joueur ' + (ouvert + 1) + '"><p class="cj-titre">Quel joueur du compte ?</p><div class="cj-profils">';
        liste.forEach(function (j) {
          var pris = slots.indexOf(j.id) >= 0 && slots[ouvert] !== j.id, p = perso(j.perso);
          h += '<button type="button" class="cj-profil" data-choisir="' + j.id + '"' + (pris ? ' disabled' : '') + (slots[ouvert] === j.id ? ' aria-pressed="true"' : '') + '>' +
            '<img src="' + p.image + '" alt="" width="52" height="52"><span class="cj-pnom">' + esc(j.nom) + '</span>' +
            (pris ? '<small>Déjà dans la partie</small>' : '') + '</button>';
        });
        if (opts.surCreer) h += '<button type="button" class="cj-profil cj-creer" data-creer="1"><span aria-hidden="true">＋</span><small>Créer un joueur</small></button>';
        h += '</div></div>';
      }
      zone.innerHTML = h;
      if (focus) { var el = zone.querySelector(focus); focus = null; if (el) el.focus(); }
    }
    function changer() { if (opts.surChangement) opts.surChangement(slots.slice()); }

    zone.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !zone.contains(b)) return;
      if (b.hasAttribute('data-ouvrir')) { ouvert = Number(b.getAttribute('data-ouvrir')); focus = '.cj-profil:not([disabled])'; }
      else if (b.hasAttribute('data-ajouter')) { slots.push(null); ouvert = slots.length - 1; focus = '.cj-profil:not([disabled])'; changer(); }
      else if (b.hasAttribute('data-retirer')) { var k = Number(b.getAttribute('data-retirer')); slots.splice(k, 1); ouvert = null; focus = '[data-ajouter]'; changer(); }
      else if (b.hasAttribute('data-choisir')) { slots[ouvert] = b.getAttribute('data-choisir'); focus = '[data-ouvrir="' + ouvert + '"]'; ouvert = null; changer(); }
      else if (b.hasAttribute('data-creer')) { if (opts.surCreer) opts.surCreer(); return; }
      else if (b.hasAttribute('data-parcours')) { if (opts.parcours) opts.parcours.choisir(Number(b.getAttribute('data-place')), b.getAttribute('data-parcours')); return; }
      else return;
      rendre();
    });
    rendre();
    return {
      rendre: rendre,
      places: function () { return slots.slice(); },
      choisis: function () { return slots.filter(Boolean); },
      complet: function () { return slots.length > 0 && slots.every(Boolean); },
      definir: function (s) { slots = (s && s.length ? s : [null]).slice(0, MAX); if (opts.fixe) { while (slots.length < opts.fixe) slots.push(null); slots.length = opts.fixe; } ouvert = null; rendre(); }
    };
  }

  window.ChoixJoueurs = { creer: creer, COULEURS: COULEURS, MAX: MAX };
})();
