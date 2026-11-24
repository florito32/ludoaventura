// Écran « Mon compte », onglet « Profil et joueurs » (demande du 23/11/2026, backlog lignes 438 à 449 puis 459 à 462).
// v10.32 (proposition A de la page de test) : carte fermée = visage, nom + crayon (page de modification : nom et personnage),
// niveau ; en bas « Statistiques » (déroule étoiles, pierres, niveaux et parties par matière) et la poubelle (confirmation).
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

  // ---------- Confirmation d'une action sans retour (aussi utilisée par js/compte.js : suppression du compte) ----------
  // Confirmer({ titre, texte, oui }) → Promesse : vrai si la personne confirme. Le focus est d'abord sur « Annuler » (choix prudent).
  function confirmer(o) {
    var d = $('dlg-confirmer');
    if (!d || !d.showModal) return Promise.resolve(window.confirm ? window.confirm(o.titre + '\n' + o.texte) : false);
    $('confirmer-titre').textContent = o.titre; $('confirmer-texte').textContent = o.texte; $('confirmer-oui').textContent = o.oui || 'Oui, supprimer';
    return new Promise(function (fini) {
      function fin(v) { d.removeEventListener('close', annule); $('confirmer-oui').onclick = $('confirmer-non').onclick = null; if (d.open) d.close(); fini(v); }
      function annule() { fin(false); }
      $('confirmer-oui').onclick = function () { fin(true); };
      $('confirmer-non').onclick = annule;
      d.addEventListener('close', annule);
      d.showModal();
      $('confirmer-non').focus();
    });
  }
  window.Confirmer = confirmer;

  var SVG = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>'; };
  var I_CRAYON = SVG('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>');
  var I_POUBELLE = SVG('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>');
  var I_CHEVRON = SVG('<path d="M6 9l6 6 6-6" stroke-width="3"/>');
  var I_GRAPHIQUE = SVG('<path d="M5 20V12M12 20V5M19 20v-5" stroke-width="2.4"/>');

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
  function pluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }
  // Une matière dans « Statistiques » : jauge, puis parties jouées, réussies, réussies d'affilée (en ce moment, et record).
  function blocMatiere(j, m) {
    var st = J.statDe(j, m.id);
    return '<div class="jm-bloc m-' + m.id + '">' + jauge(j, m) + '<p class="jm-detail">' + pluriel(st.jouees, 'partie jouée', 'parties jouées') + ' · ' +
      pluriel(st.reussies, 'réussie', 'réussies') + ' · ' + st.serie + ' d’affilée (record : ' + st.record + ')</p></div>';
  }
  function choixPerso(idBase, choisi) {
    return '<div class="perso-choix" role="group" aria-label="Personnage">' + A.LISTE.map(function (p) {
      return '<button type="button" class="perso-bouton" data-perso="' + p.id + '" aria-pressed="' + (p.id === choisi) + '" aria-label="' + esc(p.nom + ', ' + p.titre) + '">' +
        '<img src="' + p.image + '" alt="" width="52" height="52" loading="lazy"><span>' + esc(p.nom) + '</span></button>';
    }).join('') + '</div>';
  }

  function ico(id, classe) { return '<svg class="ico ' + (classe || '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  // Étoiles (avec le « ? » qui explique comment en gagner), niveau, pierres précieuses et « Mes coffres » (v10.36 : bouton
  // coffre sans texte ; l'écran montre les coffres des prochains niveaux, le coffre du jour, les défis et le méga coffre).
  function resumeTresor(j) {
    var R = window.Recompenses, t = R && R.resume && R.resume(j.id);
    if (!t) return '';
    return '<div class="js-resume"><span class="jt-etoiles">' + ico('i-etoile') + '<strong>' + t.total + '</strong> ' + (t.total > 1 ? 'étoiles' : 'étoile') +
      '<button type="button" class="aide-etoiles" data-act="aide-etoiles" aria-haspopup="dialog" aria-controls="comment-gagner" aria-label="Comment gagner des étoiles ?"><span aria-hidden="true">?</span></button></span>' +
      '<span class="jt-niveau">niveau ' + t.niveau + '</span>' +
      '<span class="jt-gemmes">' + ico('i-gemme') + '<strong>' + t.gemmes + '</strong> ' + (t.gemmes > 1 ? 'pierres' : 'pierre') + '</span>' +
      '<button type="button" class="btn btn-secondaire btn-icone" data-act="voir-coffres" aria-label="Mes coffres" title="Mes coffres">' + ico('i-coffre', 'coffre-jour') + '</button></div>';
  }
  // Ses coffres à ouvrir restent visibles sur la carte fermée : ils s'ouvrent ici, hors partie (backlog ligne 447).
  function coffres(j) {
    var R = window.Recompenses, t = R && R.resume && R.resume(j.id);
    if (!t || !t.coffres) return '';
    return '<p class="joueur-coffres"><button type="button" class="btn btn-principal jt-coffres" data-act="coffres">' + ico('i-coffre', 'coffre-jour') + ' Ouvrir ' + (t.coffres > 1 ? 'mes ' + t.coffres + ' coffres' : 'mon coffre') + '</button></p>';
  }
  function statistiques(j, ouvert) {
    var tot = J.statTotal(j);
    return '<div class="joueur-stats" id="stats-' + j.id + '"' + (ouvert ? '' : ' hidden') + '>' + resumeTresor(j) +
      '<p class="petit">En tout : ' + pluriel(tot.jouees, 'partie jouée', 'parties jouées') + ', ' + pluriel(tot.reussies, 'réussie', 'réussies') + '.</p>' +
      '<div class="joueur-jauges">' + J.MATIERES.map(function (m) { return blocMatiere(j, m); }).join('') + '</div></div>';
  }

  function carte(j) {
    var p = perso(j.perso), ouvert = !!ouverts[j.id];
    return '<article class="carte-page joueur-carte" data-id="' + j.id + '" aria-label="Joueur ' + esc(j.nom) + '">' +
      '<div class="joueur-tete"><img class="joueur-avatar" src="' + p.image + '" alt="" width="56" height="56">' +
      '<div class="joueur-qui"><div class="joueur-nomligne"><h4 class="joueur-nom">' + esc(j.nom) + '</h4>' +
      '<button type="button" class="icone-btn" data-act="modifier" aria-label="Modifier le joueur ' + esc(j.nom) + '">' + I_CRAYON + '</button></div>' +
      '<p class="petit">Personnage : ' + esc(p.nom + ', ' + p.titre) + '</p></div>' +
      '<span class="joueur-niv" title="Niveau moyen">Niv. ' + J.niveauGlobal(j) + '</span></div>' +
      coffres(j) +
      '<div class="joueur-pied"><button type="button" class="stats-btn" data-act="stats" aria-expanded="' + ouvert + '" aria-controls="stats-' + j.id + '">' + I_GRAPHIQUE + 'Statistiques' + I_CHEVRON + '</button>' +
      '<button type="button" class="icone-btn suppr" data-act="supprimer" aria-label="Supprimer le joueur ' + esc(j.nom) + '">' + I_POUBELLE + '</button></div>' +
      statistiques(j, ouvert) + '</article>';
  }
  // Page de modification (crayon) ou de création : le nom et le personnage, puis Enregistrer.
  function pageEdition() {
    var e = edition, creer = e.mode === 'creer', idBase = 'edition';
    return '<article class="carte-page joueur-carte joueur-edition" aria-labelledby="edition-titre">' +
      '<button type="button" class="joueur-retour" data-act="annuler"><span aria-hidden="true">←</span> Profil et joueurs</button>' +
      '<h4 class="joueur-nom" id="edition-titre">' + (creer ? 'Créer un joueur' : 'Modifier le joueur') + '</h4>' +
      '<form class="joueur-form" data-form="' + idBase + '" novalidate><label for="champ-' + idBase + '">Nom du joueur <span class="petit-inline">(' + J.NOM_MAX + ' caractères au plus)</span></label>' +
      '<input type="text" id="champ-' + idBase + '" maxlength="' + (J.NOM_MAX + 10) + '" autocomplete="off" spellcheck="false" value="' + esc(e.nom) + '"' + (e.erreur ? ' aria-invalid="true" aria-describedby="err-' + idBase + '"' : '') + '>' +
      '<p class="compte-message erreur" id="err-' + idBase + '" role="alert"' + (e.erreur ? '' : ' hidden') + '>' + (e.erreur ? esc(J.MESSAGES[e.erreur] || 'Ce nom ne convient pas.') : '') + '</p>' +
      '<p class="petit">Personnage :</p>' + choixPerso(idBase, e.perso) +
      '<div class="compte-boutons"><button type="submit" class="btn btn-principal">' + (creer ? 'Créer le joueur' : 'Enregistrer') + '</button>' +
      '<button type="button" class="btn btn-secondaire" data-act="annuler">Annuler</button></div></form></article>';
  }
  function carteCreer() {
    return '<button type="button" class="joueur-ajout" data-act="creer"><span aria-hidden="true">＋</span> Créer un joueur</button>';
  }

  // edition : { mode: 'modifier' | 'creer', id, nom, perso, erreur } ou null. ouverts : { idJoueur: true } (statistiques déroulées).
  var edition = null, ouverts = {};
  // Ce qui reprend le focus après un rafraîchissement : { selecteur }.
  var focus = null;

  function rendre() {
    var zone = $('joueurs-liste'), c = compte();
    if (!zone || !c || !J) return;
    var liste = J.duCompte();
    $('joueurs-compte').textContent = liste.length + ' joueur' + (liste.length > 1 ? 's' : '');
    zone.innerHTML = edition ? pageEdition() : liste.map(carte).join('') + carteCreer();
    if (focus) {
      var el = zone.querySelector(focus.selecteur) || (focus.secours && document.querySelector(focus.secours));
      focus = null;
      if (el) el.focus();
    }
  }

  function enregistrer(c) { c.ecrire(); }
  function annonce(t) { var a = $('joueurs-annonce'); if (a) a.textContent = t; }

  function clic(e) {
    var b = e.target.closest('button'); if (!b) return;
    var c = compte(), carte_ = b.closest('.joueur-carte'), id = carte_ && carte_.getAttribute('data-id');
    var act = b.getAttribute('data-act'), sel = function (i, a) { return '.joueur-carte[data-id="' + i + '"] [data-act="' + a + '"]'; };
    if (act === 'voir-coffres' && window.Recompenses) { window.Recompenses.voir(id, 'ecran-coffres'); return; }
    if (act === 'aide-etoiles' && window.Recompenses) { window.Recompenses.aideEtoiles(); return; }
    if (act === 'coffres' && window.Recompenses) { window.Recompenses.ouvrirCoffresDe(id); return; }
    if (act === 'stats') {
      ouverts[id] = !ouverts[id];
      var panneau = $('stats-' + id); panneau.hidden = !ouverts[id]; b.setAttribute('aria-expanded', String(ouverts[id]));
      return;
    }
    if (act === 'modifier') {
      var j = J.trouver(c.etat, id);
      edition = { mode: 'modifier', id: id, nom: j.nom, perso: j.perso }; focus = { selecteur: '#champ-edition' }; rendre();
    } else if (act === 'creer') { edition = { mode: 'creer', perso: J.PERSO_DEFAUT, nom: '' }; focus = { selecteur: '#champ-edition' }; rendre(); }
    else if (act === 'annuler') {
      var avant = edition; edition = null;
      focus = { selecteur: avant && avant.id ? sel(avant.id, 'modifier') : '[data-act="creer"]' };
      rendre();
    } else if (act === 'supprimer') { supprimer(id); }
    else if (b.hasAttribute('data-perso') && edition) {
      var champ = $('champ-edition'); if (champ) edition.nom = champ.value;
      edition.perso = b.getAttribute('data-perso'); focus = { selecteur: '[data-perso="' + edition.perso + '"]' }; rendre();
    }
  }
  // Supprimer un joueur : confirmation d'abord (« détruira toute sa progression et ses gains »), puis suppression et envoi au compte.
  function supprimer(id) {
    var c = compte(), j = c && J.trouver(c.etat, id); if (!j) return;
    var nom = j.nom;
    confirmer({ titre: 'Supprimer le profil de ' + nom + ' ?', texte: 'Cela détruira toute sa progression et ses gains : niveaux, étoiles, pierres, coffres et statistiques. Cette action est définitive.', oui: 'Oui, supprimer' }).then(function (oui) {
      if (!oui) { var b = document.querySelector('.joueur-carte[data-id="' + id + '"] [data-act="supprimer"]'); if (b) b.focus(); return; }
      J.supprimer(c.etat, id); delete ouverts[id];
      enregistrer(c);
      focus = { selecteur: '#joueurs-titre' };
      rendre();
      annonce('Le profil de ' + nom + ' est supprimé.');
    });
  }
  function envoi(e) {
    var form = e.target.closest('.joueur-form'); if (!form || !edition) return;
    e.preventDefault();
    var c = compte(), nom = form.querySelector('input[type=text]').value, liste = J.lister(c.etat);
    var erreur = J.verifierNom(nom, liste, edition.id);
    if (erreur) { edition.nom = nom; edition.erreur = erreur; focus = { selecteur: '#champ-edition' }; rendre(); return; }
    var idFocus;
    if (edition.mode === 'creer') {
      var r = J.creer(c.etat, nom, edition.perso); idFocus = r.joueur.id;
    } else {
      J.renommer(c.etat, edition.id, nom); J.changerPerso(c.etat, edition.id, edition.perso); idFocus = edition.id;
    }
    enregistrer(c);
    edition = null;
    focus = { selecteur: '.joueur-carte[data-id="' + idFocus + '"] [data-act="modifier"]' };
    rendre();
  }

  if ($('joueurs-liste')) {
    $('joueurs-liste').addEventListener('click', clic);
    $('joueurs-liste').addEventListener('submit', envoi);
    document.addEventListener('aventura-ecran', function (e) {
      if (e.detail === 'ecran-compte') rendre(); else edition = null;
    });
  }
  window.JoueursEcran = { rendre: rendre };
})();
