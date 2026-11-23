// Écran « Mon compte » : la section « Mes joueurs » (demande du 23/11/2026, backlog lignes 438 à 449).
// Proposition A retenue par l'utilisateur : une colonne de cartes, une carte par joueur (visage, nom, niveau moyen,
// 4 jauges en barre : Français, Maths, Histoire, Géographie ; les sous-matières se déplient), « Changer de nom »,
// « Changer de personnage » et une carte « Créer un joueur ». Pas de limite au nombre de joueurs.
// Les données sont celles de js/joueurs.js, rangées dans la progression du compte (window.Recompenses.compte).
(function () {
  'use strict';

  var J = window.Joueurs, A = window.Aventuriers;
  var $ = function (id) { return document.getElementById(id); };
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function compte() { return window.Recompenses && window.Recompenses.compte; }

  // edition : { mode: 'nom' | 'perso' | 'creer', id, erreur, perso, nom } ou null.
  var edition = null;
  // Ce qui reprend le focus après un rafraîchissement : { selecteur }.
  var focus = null;

  function perso(id) { return (A && A.trouver(id)) || (A && A.LISTE[0]) || { id: id, nom: id, titre: '', image: '' }; }

  function jauge(j, m) {
    var s = J.scoreMatiere(j, m.id), n = J.niveauDe(s), arrondi = Math.round(s * 10) / 10;
    return '<div class="jm m-' + m.id + '"><span class="jm-nom" id="mat-' + j.id + '-' + m.id + '">' + m.nom + '</span>' +
      '<div class="jm-barre" role="meter" aria-labelledby="mat-' + j.id + '-' + m.id + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + arrondi +
      '" aria-valuetext="niveau ' + n + ', ' + arrondi + ' sur 100"><i style="width:' + s + '%"></i></div>' +
      '<span class="jm-val">Niv. ' + n + ' · ' + Math.floor(s) + '</span></div>';
  }
  function choixPerso(idBase, choisi) {
    return '<div class="perso-choix" role="group" aria-label="Personnage">' + A.LISTE.map(function (p) {
      return '<button type="button" class="perso-bouton" data-perso="' + p.id + '" aria-pressed="' + (p.id === choisi) + '" aria-label="' + esc(p.nom + ', ' + p.titre) + '">' +
        '<img src="' + p.image + '" alt="" width="52" height="52" loading="lazy"><span>' + esc(p.nom) + '</span></button>';
    }).join('') + '</div>';
  }
  function formNom(idBase, valeur, erreur, bouton) {
    return '<form class="joueur-form" data-form="' + idBase + '" novalidate><label for="champ-' + idBase + '">Nom du joueur <span class="petit-inline">(' + J.NOM_MAX + ' caractères au plus)</span></label>' +
      '<input type="text" id="champ-' + idBase + '" maxlength="' + (J.NOM_MAX + 10) + '" autocomplete="off" spellcheck="false" value="' + esc(valeur) + '"' + (erreur ? ' aria-invalid="true" aria-describedby="err-' + idBase + '"' : '') + '>' +
      '<p class="compte-message erreur" id="err-' + idBase + '" role="alert"' + (erreur ? '' : ' hidden') + '>' + (erreur ? esc(J.MESSAGES[erreur] || 'Ce nom ne convient pas.') : '') + '</p>';
  }

  function carte(j) {
    var p = perso(j.perso), mode = edition && edition.id === j.id ? edition.mode : null;
    var h = '<article class="carte-page joueur-carte" data-id="' + j.id + '" aria-label="Joueur ' + esc(j.nom) + '">' +
      '<div class="joueur-tete"><img class="joueur-avatar" src="' + p.image + '" alt="" width="56" height="56">' +
      '<div class="joueur-qui"><h4 class="joueur-nom">' + esc(j.nom) + '</h4><p class="petit">Personnage : ' + esc(p.nom + ', ' + p.titre) + '</p></div>' +
      '<span class="joueur-niv" title="Niveau moyen">Niv. ' + J.niveauGlobal(j) + '</span></div>' +
      '<div class="joueur-jauges">' + J.MATIERES.map(function (m) { return jauge(j, m); }).join('') + '</div>';
    if (mode === 'nom') {
      h += formNom('nom-' + j.id, edition.nom !== undefined ? edition.nom : j.nom, edition.erreur) +
        '<div class="compte-boutons"><button type="submit" class="btn btn-principal">Enregistrer</button><button type="button" class="btn btn-secondaire" data-act="annuler">Annuler</button></div></form>';
    } else if (mode === 'perso') {
      h += '<div class="joueur-form"><p class="petit">Choisis le personnage de ' + esc(j.nom) + ' :</p>' + choixPerso(j.id, j.perso) +
        '<div class="compte-boutons"><button type="button" class="btn btn-secondaire" data-act="annuler">Fermer</button></div></div>';
    } else {
      h += '<div class="compte-boutons"><button type="button" class="btn btn-secondaire" data-act="nom">Changer de nom</button>' +
        '<button type="button" class="btn btn-secondaire" data-act="perso">Changer de personnage</button></div>';
    }
    return h + '</article>';
  }
  function carteCreer() {
    if (!(edition && edition.mode === 'creer')) {
      return '<button type="button" class="joueur-ajout" data-act="creer"><span aria-hidden="true">＋</span> Créer un joueur</button>';
    }
    return '<article class="carte-page joueur-carte" aria-label="Nouveau joueur"><h4 class="joueur-nom">Nouveau joueur</h4>' +
      formNom('nouveau', edition.nom || '', edition.erreur) +
      '<p class="petit">Personnage :</p>' + choixPerso('nouveau', edition.perso) +
      '<div class="compte-boutons"><button type="submit" class="btn btn-principal">Créer le joueur</button><button type="button" class="btn btn-secondaire" data-act="annuler">Annuler</button></div></form></article>';
  }

  function rendre() {
    var zone = $('joueurs-liste'), c = compte();
    if (!zone || !c || !J) return;
    var liste = J.duCompte();
    $('joueurs-compte').textContent = liste.length + ' joueur' + (liste.length > 1 ? 's' : '');
    zone.innerHTML = liste.map(carte).join('') + carteCreer();
    if (focus) {
      var el = zone.querySelector(focus.selecteur);
      focus = null;
      if (el) el.focus();
    }
  }

  function enregistrer(c) { c.ecrire(); }
  function nomSaisi(form) { return form.querySelector('input[type=text]').value; }

  function clic(e) {
    var b = e.target.closest('button'); if (!b) return;
    var c = compte(), carte_ = b.closest('.joueur-carte'), id = carte_ && carte_.getAttribute('data-id');
    var act = b.getAttribute('data-act');
    if (act === 'nom') { edition = { mode: 'nom', id: id }; focus = { selecteur: '.joueur-carte[data-id="' + id + '"] input[type=text]' }; rendre(); }
    else if (act === 'perso') { edition = { mode: 'perso', id: id }; focus = { selecteur: '.joueur-carte[data-id="' + id + '"] [aria-pressed="true"]' }; rendre(); }
    else if (act === 'creer') { edition = { mode: 'creer', perso: J.PERSO_DEFAUT, nom: '' }; focus = { selecteur: '#champ-nouveau' }; rendre(); }
    else if (act === 'annuler') {
      var avant = edition; edition = null;
      focus = { selecteur: avant && avant.id ? '.joueur-carte[data-id="' + avant.id + '"] [data-act="' + (avant.mode === 'perso' ? 'perso' : 'nom') + '"]' : '[data-act="creer"]' };
      rendre();
    } else if (b.hasAttribute('data-perso') && edition) {
      var p = b.getAttribute('data-perso');
      if (edition.mode === 'perso') {
        J.changerPerso(c.etat, edition.id, p); enregistrer(c);
        focus = { selecteur: '.joueur-carte[data-id="' + edition.id + '"] [data-perso="' + p + '"]' };
      } else if (edition.mode === 'creer') {
        var champ = $('champ-nouveau'); if (champ) edition.nom = champ.value;
        edition.perso = p; focus = { selecteur: '[data-perso="' + p + '"]' };
      }
      rendre();
    }
  }
  function envoi(e) {
    var form = e.target.closest('.joueur-form'); if (!form || !edition) return;
    e.preventDefault();
    var c = compte(), nom = nomSaisi(form), r;
    if (edition.mode === 'nom') {
      r = J.renommer(c.etat, edition.id, nom);
      if (r.erreur) { edition.nom = nom; edition.erreur = r.erreur; focus = { selecteur: '.joueur-carte[data-id="' + edition.id + '"] input[type=text]' }; }
      else { enregistrer(c); focus = { selecteur: '.joueur-carte[data-id="' + edition.id + '"] [data-act="nom"]' }; edition = null; }
    } else if (edition.mode === 'creer') {
      r = J.creer(c.etat, nom, edition.perso);
      if (r.erreur) { edition.nom = nom; edition.erreur = r.erreur; focus = { selecteur: '#champ-nouveau' }; }
      else { enregistrer(c); focus = { selecteur: '.joueur-carte[data-id="' + r.joueur.id + '"] [data-act="nom"]' }; edition = null; }
    }
    rendre();
  }

  if ($('joueurs-liste')) {
    $('joueurs-liste').addEventListener('click', clic);
    $('joueurs-liste').addEventListener('submit', envoi);
    // Entrée dans le champ du nom = Enregistrer (le formulaire englobe aussi les boutons).
    document.addEventListener('aventura-ecran', function (e) {
      if (e.detail === 'ecran-compte') rendre(); else edition = null;
    });
  }
  window.JoueursEcran = { rendre: rendre };
})();
