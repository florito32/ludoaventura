// Choix des joueurs d'une partie (demande de l'utilisateur du 23/11/2026, backlog lignes 446 à 448).
// Remplace « Combien de joueurs ? » et « Choisis ton aventurier » : on choisit parmi les joueurs créés dans le compte
// (js/joueurs.js). Proposition A retenue : une ligne par joueur (visage, nom, niveaux), « Changer » ouvre la liste des
// joueurs du compte, « Ajouter un joueur » en ajoute un (4 au plus), un joueur déjà dans la partie est grisé.
// Utilisé par l'étape 1 de la préparation (js/plateau.js) et par la fenêtre « Qui joue ? » des défis, parties rapides et
// Baby jeux (nombre de places fixé). Deux joueurs peuvent avoir le même personnage : même figurine, pion de couleur différente.
(function () {
  'use strict';

  var J = window.Joueurs, A = window.Aventuriers;
  var COULEURS = ['rouge', 'jaune', 'bleu', 'vert'];
  var MAX = 4;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function perso(id) { return (A && A.trouver(id)) || (A && A.LISTE[0]); }
  function parId(id) { var l = J.duCompte(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function abrege(j) {
    var ab = { francais: 'Fr', maths: 'Ma', histoire: 'Hi', geographie: 'Gé' };
    return 'Niv. ' + J.niveauGlobal(j) + ' · ' + J.MATIERES.map(function (m) { return ab[m.id] + ' ' + J.niveauMatiere(j, m.id); }).join(' · ');
  }

  // opts : { fixe: nombre de places imposé (sinon 1 à 4, on ajoute et on retire), slots: [id ou null…], idBase,
  //          surChangement(slots), surCreer() }
  function creer(zone, opts) {
    var idBase = opts.idBase || 'cj';
    var slots = (opts.slots && opts.slots.length ? opts.slots : [null]).slice(0, MAX);
    if (opts.fixe) { while (slots.length < opts.fixe) slots.push(null); slots.length = opts.fixe; }
    var ouvert = null; // place dont la liste est ouverte
    var focus = null;

    function rendre() {
      var liste = J.duCompte();
      // Un joueur supprimé ailleurs ou introuvable : la place redevient vide.
      slots = slots.map(function (id) { return id && parId(id) ? id : null; });
      var h = '<div class="cj-places">';
      slots.forEach(function (id, i) {
        var j = id && parId(id), coul = COULEURS[i], p = j && perso(j.perso);
        h += '<div class="cj-ligne joueur-' + coul + (j ? '' : ' vide') + '" data-place="' + i + '">' +
          (j ? '<img class="cj-avatar" src="' + p.image + '" alt="" width="58" height="58">' : '') +
          '<div class="cj-qui"><div class="cj-etiq">Joueur ' + (i + 1) + ' · pion ' + coul + '</div>' +
          (j ? '<div class="cj-nom">' + esc(j.nom) + '</div><div class="cj-niv">' + abrege(j) + '</div>' : '<div class="cj-niv">Choisis un joueur</div>') + '</div>' +
          '<button type="button" class="btn btn-secondaire cj-btn" data-ouvrir="' + i + '" aria-label="' + (j ? 'Changer le joueur ' : 'Choisir le joueur ') + (i + 1) + '">' + (j ? 'Changer' : 'Choisir') + '</button>' +
          (!opts.fixe && i > 0 ? '<button type="button" class="btn btn-secondaire cj-btn cj-retirer" data-retirer="' + i + '" aria-label="Retirer le joueur ' + (i + 1) + '">✕</button>' : '') +
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
            '<small>' + (pris ? 'Déjà dans la partie' : 'Niv. ' + J.niveauGlobal(j)) + '</small></button>';
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
