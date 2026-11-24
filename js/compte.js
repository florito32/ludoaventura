// Compte en ligne et sauvegarde de la progression (v9.4, demande du 16/11/2026, backlog lignes 346 à 349).
// Choix de l'utilisateur :
//  - sans compte, on joue « en invité » et la progression reste sur l'appareil (comme avant) ; depuis la v10.3,
//    une fenêtre propose de se connecter à chaque ouverture du jeu tant qu'on n'est pas connecté ;
//  - connexion avec Google, ou avec une adresse e-mail + un mot de passe (confirmation par e-mail à l'inscription,
//    « Mot de passe oublié ») ; les e-mails partent par Brevo (réglé dans le tableau de bord Supabase) ;
//  - une seule progression par compte ; depuis la v10.26 elle range plusieurs joueurs, et depuis la v10.30 chaque joueur
//    y a son propre trésor (étoiles, pierres, coffres : js/etoiles.js → pourJoueur) ;
//  - en se connectant, la progression de l'appareil est FUSIONNÉE avec celle du compte (on garde le meilleur des deux).
// Ce qui est sauvegardé : les étoiles, niveaux, coffres, pierres et défis (js/etoiles.js, clé « ludoaventura-etoiles »).
// Les réglages des parties (packs, niveaux…) restent propres à chaque appareil.
// Service : Supabase (projet « ludo jeu »), table public.progression (une ligne par compte, sécurité par ligne :
// chacun ne lit et n'écrit que la sienne). Aucune bibliothèque : appels HTTP directs (fetch) à l'API d'authentification
// (GoTrue, /auth/v1) et à l'API de données (PostgREST, /rest/v1). La clé « publishable » est publique par nature.
// Pseudo (v10.9, demande du 17/11/2026) : chaque compte a un pseudo UNIQUE de 4 à 20 caractères (lettres, chiffres, - et _,
// sans espace ; majuscules et accents ne comptent pas pour l'unicité). Choisi à la création d'un compte e-mail ; pour un
// compte Google, le jeu en fabrique un (prénom + initiale du nom + 01) et propose d'en changer à la prochaine ouverture,
// tant que le joueur ne l'a pas changé. Modifiable dans « Mon compte ». Tout est rangé dans Supabase (tables profils,
// stats_joueur, etoiles_jour : outils/supabase/20261117_pseudos_stats_classements.sql) ; les étoiles, pierres et niveaux
// y sont recopiés par la base à chaque sauvegarde de la progression : le jeu n'envoie rien de plus.
// Invité (v10.27, demande du 23/11/2026) : « Jouer en invité » crée une connexion ANONYME Supabase (aucune adresse e-mail) ;
// la base lui donne le pseudo « invité0001 », « invité0002 »… et la progression est sauvegardée comme pour un compte, ce qui
// rend l'invité visible dans Supabase (Authentication › Users, e-mail vide). Quand il crée un compte ou se connecte, sa progression
// est fusionnée dans le compte (même fusion que d'habitude), puis la ligne invité est supprimée (rpc supprimer_invite) : pas de
// doublon dans les classements. Outils SQL : outils/supabase/20261123_invites_anonymes.sql.
// Partie logique (fusion, règles du pseudo) utilisable dans les tests Node : module.exports.
(function (racine) {
  'use strict';

  var URL_SUPABASE = 'https://qxaaqcivtnhikppwmgdh.supabase.co';
  var CLE_API = 'sb_publishable_jsD5pZK2_7QooEpanwGEmw_bhj_TJYm';
  var CLE_ETOILES = 'ludoaventura-etoiles';
  var CLE_SESSION = 'ludoaventura-session'; // jetons de connexion (localStorage : on reste connecté)
  var CLE_BASE = 'ludoaventura-compte';     // { uid, total, gemmes, quand } : dernière progression envoyée au compte
  var CLE_PLUS_TARD = 'ludoaventura-pseudo-plus-tard'; // sessionStorage : « Plus tard » touché, on ne redemande pas avant la prochaine ouverture

  // ---------- Fusion de deux progressions (logique pure) ----------
  // local : progression de l'appareil ; distant : celle du compte ; base : ce que l'appareil a déjà envoyé au compte
  // (total et pierres). Les étoiles et pierres GAGNÉES sur l'appareil depuis la base s'ajoutent à celles du compte :
  // rien n'est compté deux fois quand deux appareils jouent tour à tour, et la 1re connexion ajoute tout (base 0).
  function objet(x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
  function liste(x) { return Array.isArray(x) ? x : []; }
  function nombre(x) { return typeof x === 'number' && isFinite(x) ? x : 0; }
  function unir(a, b) { var r = liste(b).slice(); liste(a).forEach(function (x) { if (r.indexOf(x) < 0) r.push(x); }); return r; }
  function joueursFusion(a, b, supprimes) {
    var J = (typeof module !== 'undefined' && module.exports) ? require('./joueurs.js') : racine.Joueurs;
    return J ? J.fusionner(a, b, supprimes) : liste(b).concat(liste(a));
  }
  function fusionner(local, distant, base) {
    var a = objet(local), d = objet(distant), b = objet(base);
    if (!distant || d.v !== 1) return JSON.parse(JSON.stringify(a)); // compte encore vide
    if (!local || a.v !== 1) return JSON.parse(JSON.stringify(d));   // appareil vide
    var r = JSON.parse(JSON.stringify(d));
    r.total = nombre(d.total) + Math.max(0, nombre(a.total) - nombre(b.total));
    r.gemmes = nombre(d.gemmes) + Math.max(0, nombre(a.gemmes) - nombre(b.gemmes));
    // Étoiles par jour : la plus grande des deux (sert aux graphiques de « Ma progression »).
    r.parJour = objet(d.parJour);
    Object.keys(objet(a.parJour)).forEach(function (j) { r.parJour[j] = Math.max(nombre(r.parJour[j]), nombre(a.parJour[j])); });
    // Journal des gains : les deux, sans doublon, du plus récent au plus ancien (200 au plus, comme js/etoiles.js).
    var vu = {}, journal = [];
    liste(d.journal).concat(liste(a.journal)).forEach(function (g) {
      var k = g && (g.quand + '|' + g.type + '|' + g.n);
      if (g && !vu[k]) { vu[k] = true; journal.push(g); }
    });
    journal.sort(function (x, y) { return String(y.quand).localeCompare(String(x.quand)); });
    r.journal = journal.slice(0, 200);
    // Coffres ouverts, défis réussis : tout ce qui est fait d'un côté ou de l'autre.
    ['coffresJour', 'coffresNiveau'].forEach(function (k) {
      r[k] = objet(d[k]);
      Object.keys(objet(a[k])).forEach(function (c) { if (r[k][c] === undefined) r[k][c] = a[k][c]; });
    });
    r.coffresMega = objet(d.coffresMega); // null = méga coffre gagné mais pas encore ouvert
    Object.keys(objet(a.coffresMega)).forEach(function (c) { if (r.coffresMega[c] === undefined || r.coffresMega[c] === null) r.coffresMega[c] = a.coffresMega[c]; });
    r.defis = objet(d.defis);
    Object.keys(objet(a.defis)).forEach(function (j) {
      r.defis[j] = objet(r.defis[j]);
      Object.keys(objet(a.defis[j])).forEach(function (t) { r.defis[j][t] = Math.max(nombre(r.defis[j][t]), nombre(a.defis[j][t])); });
    });
    r.defisQuittes = objet(d.defisQuittes);
    Object.keys(objet(a.defisQuittes)).forEach(function (j) { r.defisQuittes[j] = Object.assign(objet(r.defisQuittes[j]), objet(a.defisQuittes[j])); });
    // Joueurs du compte (v10.26) : même id = même joueur (nom le plus récent, niveaux les plus hauts), les autres sont gardés.
    // Joueurs supprimés (v10.32) : leur identifiant reste « enterré » des deux côtés, ils ne reviennent pas.
    r.supprimes = unir(a.supprimes, d.supprimes);
    r.joueurs = joueursFusion(a.joueurs, d.joueurs, r.supprimes);
    // Trésor de chaque joueur (v10.30) : comme pour le compte, les étoiles et pierres gagnées sur l'appareil depuis le
    // dernier envoi (base.joueurs) s'ajoutent à celles du compte. Sans base pour ce joueur : le plus grand des deux.
    // 1re synchronisation avec ce compte (base vide) : tout ce que l'appareil a gagné s'ajoute, comme pour le compte.
    var bj = objet(b.joueurs), premiere = !b.joueurs && !nombre(b.total) && !nombre(b.gemmes);
    function recDe(l, id) { var x = liste(l).filter(function (j) { return j && j.id === id; })[0]; return x && x.rec ? x.rec : null; }
    r.joueurs.forEach(function (p) {
      var la = recDe(a.joueurs, p.id), ld = recDe(d.joueurs, p.id), base = bj[p.id] || (premiere ? { total: 0, gemmes: 0 } : null);
      if (!la || !ld || !base || !p.rec) return;
      p.rec.total = nombre(ld.total) + Math.max(0, nombre(la.total) - nombre(base.total));
      p.rec.gemmes = nombre(ld.gemmes) + Math.max(0, nombre(la.gemmes) - nombre(base.gemmes));
    });
    // Compte écrit par un appareil d'avant la v10.30 (pas encore de trésor par joueur) : ce qu'il a gagné depuis le dernier
    // envoi de cet appareil revient à « Joueur 1 », comme la migration de js/etoiles.js.
    var E = (typeof module !== 'undefined' && module.exports) ? require('./etoiles.js') : racine.Etoiles;
    if (a.parJoueur && !d.parJoueur && E) {
      var p1 = r.joueurs.filter(function (p) { return p.id === 'j-1'; })[0];
      if (p1) {
        var t = nombre(p1.rec && p1.rec.total), g = nombre(p1.rec && p1.rec.gemmes);
        p1.rec = E.fusionnerRec(p1.rec, d);
        p1.rec.total = t + Math.max(0, nombre(d.total) - nombre(b.total));
        p1.rec.gemmes = g + Math.max(0, nombre(d.gemmes) - nombre(b.gemmes));
      }
    }
    r.parJoueur = a.parJoueur || d.parJoueur || 0;
    r.visites = unir(a.visites, d.visites).sort();
    r.parties = unir(a.parties, d.parties).slice(0, 50);
    r.defisEnCours = objet(a.defisEnCours); // défi commencé sur CET appareil
    var s = [a.simplesDepuis, d.simplesDepuis].filter(function (x) { return typeof x === 'number'; });
    r.simplesDepuis = s.length ? Math.min.apply(null, s) : null;
    return r;
  }

  // ---------- Règles du pseudo (mêmes règles que la base : fonction public.pseudo_valide) ----------
  var PSEUDO_MIN = 4, PSEUDO_MAX = 20;
  var PSEUDO_CARACTERES = /^[A-Za-z0-9_àáâãäåçèéêëìíîïñòóôõöùúûüýÿœÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝŸŒ-]*$/;
  var MESSAGES_PSEUDO = {
    court: 'Ton pseudo doit avoir au moins ' + PSEUDO_MIN + ' caractères.',
    long: 'Ton pseudo doit avoir ' + PSEUDO_MAX + ' caractères au plus.',
    caracteres: 'Utilise seulement des lettres, des chiffres, le tiret (-) et le tiret bas (_), sans espace.',
    pris: 'Ce pseudo est déjà pris : choisis-en un autre.',
    invalide: 'Utilise seulement des lettres, des chiffres, le tiret (-) et le tiret bas (_), sans espace.',
    identique: 'C’est déjà ton pseudo actuel : choisis-en un autre.'
  };
  // Renvoie null si le pseudo est correct, sinon la raison : 'court' | 'long' | 'caracteres'.
  function verifierPseudo(texte) {
    var p = String(texte == null ? '' : texte).trim();
    if (!PSEUDO_CARACTERES.test(p)) return 'caracteres';
    if (p.length < PSEUDO_MIN) return 'court';
    if (p.length > PSEUDO_MAX) return 'long';
    return null;
  }

  var C = { fusionner: fusionner, verifierPseudo: verifierPseudo, MESSAGES_PSEUDO: MESSAGES_PSEUDO, URL: URL_SUPABASE, CLE_SESSION: CLE_SESSION, CLE_BASE: CLE_BASE };
  if (typeof module !== 'undefined' && module.exports) module.exports = C;
  racine.Compte = C;
  if (typeof document === 'undefined') return; // tests Node : la logique suffit

  // ---------- Page ----------
  var $ = function (id) { return document.getElementById(id); };
  function lireJSON(cle) { try { return JSON.parse(localStorage.getItem(cle) || 'null'); } catch (e) { return null; } }
  function ecrireJSON(cle, v) { try { if (v === null) localStorage.removeItem(cle); else localStorage.setItem(cle, JSON.stringify(v)); } catch (e) { /* stockage interdit */ } }
  // Adresse de retour après Google ou un lien reçu par e-mail : la page du jeu, sans #… ni ?…
  function adresseRetour() { return location.origin + location.pathname; }

  // ---------- Appels au service ----------
  function appel(chemin, options) {
    options = options || {};
    var entetes = { apikey: CLE_API, 'Content-Type': 'application/json' };
    if (options.jeton) entetes.Authorization = 'Bearer ' + options.jeton;
    Object.assign(entetes, options.entetes || {});
    return fetch(URL_SUPABASE + chemin, { method: options.methode || 'GET', headers: entetes, body: options.corps ? JSON.stringify(options.corps) : undefined })
      .then(function (rep) {
        return rep.text().then(function (t) {
          var json = null; try { json = t ? JSON.parse(t) : null; } catch (e) { json = null; }
          if (!rep.ok) { var err = new Error((json && (json.msg || json.error_description || json.message || json.error)) || ('Erreur ' + rep.status)); err.code = json && (json.error_code || json.code); err.statut = rep.status; throw err; }
          return json;
        });
      });
  }

  // ---------- Session ----------
  var session = lireJSON(CLE_SESSION); // { access_token, refresh_token, expires_at (s), user: { id, email } }
  function garderSession(s) {
    if (s && s.access_token) {
      session = { access_token: s.access_token, refresh_token: s.refresh_token,
        expires_at: s.expires_at || Math.floor(Date.now() / 1000) + (Number(s.expires_in) || 3600),
        user: s.user ? { id: s.user.id, email: s.user.email, anonyme: !!s.user.is_anonymous,
          fournisseur: (s.user.app_metadata && s.user.app_metadata.provider) || (session && session.user && session.user.fournisseur) || '' } : (session && session.user) || null };
    } else session = null;
    ecrireJSON(CLE_SESSION, session);
    if (window.SiteVersion) window.SiteVersion.rafraichir(); // version visible seulement pour le compte de l'auteur (v9.5)
  }
  // Invité = connexion anonyme (sans e-mail) ; « réel » = compte avec adresse e-mail ou Google.
  function invite() { return !!(session && session.user && session.user.anonyme); }
  function reel() { return !!session && !invite(); }
  // Jeton valable (renouvelé s'il expire dans moins d'une minute) ; null si pas connecté ou session perdue.
  function jeton() {
    if (!session) return Promise.resolve(null);
    if (session.expires_at - 60 > Date.now() / 1000) return Promise.resolve(session.access_token);
    return appel('/auth/v1/token?grant_type=refresh_token', { methode: 'POST', corps: { refresh_token: session.refresh_token } })
      .then(function (s) { garderSession(s); return session.access_token; })
      .catch(function (e) { if (e.statut && e.statut < 500) garderSession(null); return null; });
  }

  // ---------- Synchronisation ----------
  var etat = { synchro: 'aucune', quand: null, erreur: null }; // aucune | en-cours | ok | erreur
  var enCours = null, encore = false, minuterie = null;
  function compteEtoiles() { return window.Recompenses && window.Recompenses.compte; }
  // Remplace la progression de l'appareil et rafraîchit l'affichage (étoiles, coffres, défi du jour).
  function poserLocal(donnees) {
    var c = compteEtoiles();
    if (c) { c.etat = donnees; ecrireOrigine.call(c); c.etat = c.lire(); }
    else ecrireJSON(CLE_ETOILES, donnees);
    if (window.Recompenses && window.Recompenses.majTout) window.Recompenses.majTout();
  }
  // Lit le compte, fusionne avec l'appareil, écrit des deux côtés. Une seule à la fois ; une demande pendant
  // la synchronisation en relance une autre à la fin.
  function synchroniser() {
    if (enCours) { encore = true; return enCours; }
    etat.synchro = 'en-cours'; majPage();
    enCours = jeton().then(function (j) {
      if (!j) { etat.synchro = 'aucune'; return; }
      var uid = session.user && session.user.id;
      return appel('/rest/v1/progression?select=donnees&user_id=eq.' + encodeURIComponent(uid), { jeton: j }).then(function (lignes) {
        var distant = lignes && lignes[0] ? lignes[0].donnees : null;
        var b = lireJSON(CLE_BASE);
        if (!b || b.uid !== uid) b = { uid: uid, total: 0, gemmes: 0 };
        var c = compteEtoiles(), local = c ? c.etat : lireJSON(CLE_ETOILES);
        var r = fusionner(local, distant, b);
        poserLocal(r);
        if (c) r = c.etat; // progression remise en forme par js/etoiles.js (champs manquants complétés)
        return appel('/rest/v1/progression', { methode: 'POST', jeton: j, entetes: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          corps: { user_id: uid, donnees: r, mis_a_jour: new Date().toISOString() } }).then(function () {
          var parJ = {}; // v10.30 : ce qui a été envoyé pour chaque joueur
          liste(r.joueurs).forEach(function (p) { if (p && p.rec) parJ[p.id] = { total: nombre(p.rec.total), gemmes: nombre(p.rec.gemmes) }; });
          ecrireJSON(CLE_BASE, { uid: uid, total: nombre(r.total), gemmes: nombre(r.gemmes), joueurs: parJ, quand: new Date().toISOString() });
          etat.synchro = 'ok'; etat.quand = new Date(); etat.erreur = null;
        });
      });
    }).catch(function (e) {
      etat.synchro = 'erreur'; etat.erreur = e;
    }).then(function () {
      enCours = null; majPage();
      if (encore) { encore = false; return synchroniser(); }
    });
    return enCours;
  }
  // Après chaque gain (étoiles, coffre, défi), envoi au compte quelques secondes plus tard.
  var DELAI = typeof window.AVENTURA_DELAI_SYNCHRO === 'number' ? window.AVENTURA_DELAI_SYNCHRO : 3000;
  function planifier() {
    if (!session) return;
    clearTimeout(minuterie);
    minuterie = setTimeout(synchroniser, DELAI);
  }
  var ecrireOrigine = window.Etoiles.Compte.prototype.ecrire;
  window.Etoiles.Compte.prototype.ecrire = function () { ecrireOrigine.call(this); planifier(); };

  // ---------- Pseudo (v10.9) ----------
  // profil : { pseudo, pseudo_auto, a_proposer } lu sur le compte (null tant qu'il n'est pas lu, ou hors connexion).
  // a_proposer (calculé par la base) : le pseudo est celui du jeu ET le compte a plus de 10 minutes : on ne le propose
  // donc pas pendant la création du compte, mais à la prochaine ouverture du jeu.
  var profil = null, editionPseudo = false;
  function lireProfil() {
    return jeton().then(function (j) {
      if (!j) return null;
      return appel('/rest/v1/rpc/mon_profil', { methode: 'POST', jeton: j, corps: {} });
    }).then(function (p) {
      profil = p && p.pseudo ? p : null;
      majPage();
      proposerPseudo();
      return profil;
    }).catch(function () { return null; }); // pseudo illisible : le reste du jeu continue
  }
  // Change le pseudo (fenêtre ou écran Mon compte). Renvoie une promesse : null si c'est fait, sinon le message à montrer.
  function enregistrerPseudo(texte) {
    var raison = verifierPseudo(texte);
    if (raison) return Promise.resolve(MESSAGES_PSEUDO[raison]);
    return jeton().then(function (j) {
      if (!j) return 'Connecte-toi pour changer ton pseudo.';
      return appel('/rest/v1/rpc/changer_pseudo', { methode: 'POST', jeton: j, corps: { p_pseudo: String(texte).trim() } }).then(function (r) {
        if (r && r.ok) { profil = { pseudo: r.pseudo, pseudo_auto: false, a_proposer: false }; return null; }
        return MESSAGES_PSEUDO[r && r.raison] || 'Ton pseudo n’a pas pu être changé : réessaie.';
      });
    }).catch(function (e) { return traduire(e); });
  }
  function messagePseudo(id, texte) { var m = $(id); if (m) { m.textContent = texte || ''; m.hidden = !texte; } }
  var fenetrePseudo = $('fenetre-pseudo');
  function proposerPseudo() {
    if (!fenetrePseudo || !profil || !profil.a_proposer || fenetrePseudo.open) return;
    try { if (sessionStorage.getItem(CLE_PLUS_TARD) === '1') return; } catch (e) { /* stockage interdit */ }
    $('fenetre-pseudo-actuel').textContent = profil.pseudo;
    $('fenetre-pseudo-champ').value = '';
    messagePseudo('fenetre-pseudo-message', '');
    fenetrePseudo.showModal();
    $('fenetre-pseudo-champ').focus();
  }
  function pseudoPlusTard() {
    try { sessionStorage.setItem(CLE_PLUS_TARD, '1'); } catch (e) { /* stockage interdit */ }
    if (fenetrePseudo.open) fenetrePseudo.close();
  }

  // ---------- Connexion, inscription, mot de passe ----------
  // Si l'appareil jouait en invité, sa progression (gardée sur l'appareil) est fusionnée dans le compte par synchroniser(),
  // puis la ligne invité est supprimée côté Supabase, seulement si cet envoi a réussi.
  function connecteAvec(s, message) {
    var avant = invite() ? jeton().then(function (j) { return j ? { jeton: j, uid: session.user.id } : null; }) : Promise.resolve(null);
    return avant.then(function (inv) {
      garderSession(s);
      return (s.user ? Promise.resolve(s.user) : appel('/auth/v1/user', { jeton: s.access_token })).then(function (u) {
        garderSession(Object.assign({}, session, { user: u }));
        dire(message || 'Tu es connecté. Ta progression est maintenant sauvegardée sur ton compte.', 'ok');
        lireProfil(); // pseudo du compte (sans attendre la synchronisation)
        return synchroniser().then(function () { return effacerInvite(inv); });
      });
    });
  }
  function effacerInvite(inv) {
    if (!inv || !session || inv.uid === session.user.id || etat.synchro !== 'ok') return null;
    return appel('/rest/v1/rpc/supprimer_invite', { methode: 'POST', jeton: inv.jeton, corps: {} }).catch(function () { /* l'invité reste : sans gravité */ });
  }
  // « Jouer en invité » : crée la connexion anonyme (une seule par appareil : tant qu'elle existe, on la garde).
  // Hors ligne ou service refusant : on joue quand même, l'invité sera créé à la prochaine ouverture.
  function jouerInvite() {
    if (session) return Promise.resolve();
    return appel('/auth/v1/signup', { methode: 'POST', corps: { data: {} } }).then(function (s) {
      if (!s || !s.access_token) return;
      garderSession(s);
      majPage();
      lireProfil();
      return synchroniser();
    }).catch(function () { /* on joue sans sauvegarde en ligne */ });
  }
  function google() {
    location.href = URL_SUPABASE + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(adresseRetour());
  }
  // Messages d'erreur du service, en français.
  function traduire(e) {
    var m = String(e && e.message || ''), c = e && e.code;
    if (c === 'invalid_credentials' || /invalid login credentials/i.test(m)) return 'Adresse e-mail ou mot de passe incorrect.';
    if (c === 'email_not_confirmed' || /not confirmed/i.test(m)) return 'Ton compte attend encore sa validation : ouvre l’e-mail reçu et touche « Valider mon compte ».';
    if (c === 'weak_password' || /password should/i.test(m)) return 'Mot de passe trop faible : au moins 6 caractères.';
    if (c === 'user_already_exists' || /already registered/i.test(m)) return 'Un compte existe déjà avec cette adresse : connecte-toi.';
    if (c === 'otp_expired' || /expired|invalid/i.test(m) && /token|link|otp/i.test(m)) return 'Ce lien de validation a déjà servi ou n’est plus valable.';
    if (c === 'over_email_send_rate_limit' || /rate limit/i.test(m)) return 'Trop de demandes pour le moment : réessaie dans quelques minutes.';
    if (c === 'validation_failed' || /invalid format|email address .* invalid/i.test(m)) return 'Adresse e-mail invalide.';
    if (/failed to fetch|networkerror|load failed/i.test(m)) return 'Pas de connexion à Internet : réessaie plus tard.';
    return 'Ça n’a pas marché (' + (m || 'erreur inconnue') + ').';
  }
  function champs() { return { email: $('compte-email').value.trim(), mdp: $('compte-mdp').value }; }
  function verifier(avecMdp) {
    var f = champs();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) { dire('Écris ton adresse e-mail (exemple : prenom@gmail.com).', 'erreur'); $('compte-email').focus(); return null; }
    if (avecMdp && !f.mdp) { dire('Écris ton mot de passe.', 'erreur'); $('compte-mdp').focus(); return null; }
    return f;
  }
  function occupe(oui) { document.querySelectorAll('#compte-corps button').forEach(function (b) { b.disabled = oui; }); }
  function action(promesse) { occupe(true); return promesse.catch(function (e) { dire(traduire(e), 'erreur'); }).then(function () { occupe(false); majPage(); }); }
  function seConnecter() {
    var f = verifier(true); if (!f) return;
    action(appel('/auth/v1/token?grant_type=password', { methode: 'POST', corps: { email: f.email, password: f.mdp } }).then(function (s) { $('compte-mdp').value = ''; return connecteAvec(s); })
      .catch(function (e) {
        // Compte pas encore validé : on remontre l'écran « Vérifie tes e-mails » (avec « Renvoyer l'e-mail »).
        if (e.code === 'email_not_confirmed' || /not confirmed/i.test(e.message)) { emailAttente = f.email; mode = 'attente'; dire(traduire(e), 'erreur'); return; }
        throw e;
      }));
  }
  // Création de compte (v9.9) : formulaire à part (e-mail, mot de passe, confirmation). Une fois la demande
  // acceptée, l'écran ne montre plus que « Vérifie tes e-mails » (mode « attente »).
  function creer() {
    var email = $('creation-email').value.trim(), pseudo = $('creation-pseudo').value.trim(), mdp = $('creation-mdp').value, mdp2 = $('creation-mdp2').value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { dire('Écris ton adresse e-mail (exemple : prenom@gmail.com).', 'erreur'); $('creation-email').focus(); return; }
    var raison = verifierPseudo(pseudo);
    if (raison) { dire(MESSAGES_PSEUDO[raison], 'erreur'); $('creation-pseudo').focus(); return; }
    if (mdp.length < 6) { dire('Choisis un mot de passe d’au moins 6 caractères.', 'erreur'); $('creation-mdp').focus(); return; }
    if (mdp !== mdp2) { dire('Les deux mots de passe ne sont pas pareils : écris le même dans les deux cases.', 'erreur'); $('creation-mdp2').focus(); return; }
    // Pseudo libre ? (vérifié avant la création ; la base le revérifie : s'il est pris entre-temps, elle en donne un automatique.)
    action(appel('/rest/v1/rpc/pseudo_disponible', { methode: 'POST', corps: { p_pseudo: pseudo } }).then(function (dispo) {
      if (dispo !== 'ok') { dire(MESSAGES_PSEUDO[dispo === 'pris' ? 'pris' : 'invalide'], 'erreur'); $('creation-pseudo').focus(); return; }
      return appel('/auth/v1/signup?redirect_to=' + encodeURIComponent(adresseRetour()), { methode: 'POST', corps: { email: email, password: mdp, data: { pseudo: pseudo } } }).then(function (r) {
        $('creation-mdp').value = ''; $('creation-mdp2').value = '';
        if (r && r.access_token) return connecteAvec(r, 'Compte créé, tu es connecté.');
        emailAttente = email; mode = 'attente'; dire('');
      });
    }));
  }
  // « Renvoyer l'e-mail » de validation (écran d'attente, ou connexion refusée car adresse pas encore validée).
  function renvoyer(email) {
    action(appel('/auth/v1/resend?redirect_to=' + encodeURIComponent(adresseRetour()), { methode: 'POST', corps: { type: 'signup', email: email } }).then(function () {
      dire('C’est reparti : un nouvel e-mail vient d’être envoyé à ' + email + '.', 'ok');
    }));
  }
  function oublie() {
    var f = verifier(false); if (!f) return;
    action(appel('/auth/v1/recover?redirect_to=' + encodeURIComponent(adresseRetour()), { methode: 'POST', corps: { email: f.email } }).then(function () {
      dire('Si un compte existe pour ' + f.email + ', un e-mail vient de partir avec un lien pour choisir un nouveau mot de passe.', 'ok');
    }));
  }
  function nouveauMdp() {
    var mdp = $('compte-nouveau').value;
    if (mdp.length < 6) { dire('Au moins 6 caractères.', 'erreur'); $('compte-nouveau').focus(); return; }
    action(jeton().then(function (j) { return appel('/auth/v1/user', { methode: 'PUT', jeton: j, corps: { password: mdp } }); }).then(function () {
      $('compte-nouveau').value = ''; mode = 'connexion'; dire('Nouveau mot de passe enregistré.', 'ok');
    }));
  }
  // Déconnexion : le compte garde la progression ; l'appareil repart en invité, à zéro.
  function seDeconnecter() {
    var j = session && session.access_token;
    clearTimeout(minuterie);
    var fin = function () {
      garderSession(null); ecrireJSON(CLE_BASE, null);
      profil = null; editionPseudo = false; // le pseudo reste sur le compte
      poserLocal({ v: 1, total: 0 });
      etat.synchro = 'aucune';
      dire('Tu es déconnecté. Ta progression reste sur ton compte ; sur cet appareil tu joues maintenant en invité.', 'ok');
      majPage();
    };
    // Dernier envoi avant de partir, puis fin de session côté service (sans bloquer si hors ligne).
    action(synchroniser().then(function () { return j ? appel('/auth/v1/logout', { methode: 'POST', jeton: j }).catch(function () {}) : null; }).then(fin, fin));
  }

  // ---------- Écran « Mon compte » ----------
  // Ce que montre l'écran (v9.9) : connexion | creation | attente (e-mail de validation envoyé) |
  // validation (lien de l'e-mail en cours de vérification) | bienvenue (compte validé) | nouveau (nouveau mot de passe).
  // Connecté, « connexion » montre la carte « Tu es connecté ».
  var mode = 'connexion', emailAttente = '', bienvenueDeja = false;
  function dire(texte, type) { var m = $('compte-message'); if (!m) return; m.textContent = texte; m.className = 'compte-message ' + (type || ''); m.hidden = !texte; }
  function heure(d) { return d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''; }
  function majPastille() {
    var b = $('btn-compte'); if (!b) return;
    b.classList.toggle('connecte', reel());
    $('compte-pastille-texte').textContent = reel() ? 'Mon compte' : 'Se connecter';
    $('compte-pastille-aide').textContent = reel() ? ' : connecté, progression sauvegardée' : ' : sauvegarder ma progression';
  }
  function majPage() {
    majPastille();
    if (window.JoueursEcran) window.JoueursEcran.rendre();
    var corps = $('compte-corps'); if (!corps) return;
    var co = reel(), attente = etat.synchro === 'en-cours';
    $('compte-invite').hidden = !(mode === 'connexion' && !co);
    $('compte-connecte').hidden = !(mode === 'connexion' && co);
    $('compte-creation').hidden = mode !== 'creation';
    $('compte-attente').hidden = mode !== 'attente';
    $('compte-validation').hidden = mode !== 'validation';
    $('compte-bienvenue').hidden = mode !== 'bienvenue';
    $('compte-nouveau-bloc').hidden = mode !== 'nouveau';
    $('attente-email').textContent = emailAttente;
    // Invité : son pseudo (invité0001…) est rappelé dans la carte « Jouer en invité ».
    var nomInvite = $('compte-invite-nom');
    if (nomInvite) { nomInvite.hidden = !(invite() && profil); if (invite() && profil) $('compte-invite-pseudo').textContent = profil.pseudo; }
    var qui = session && session.user && session.user.email ? session.user.email : 'ton compte';
    $('bienvenue-email').textContent = qui;
    $('bienvenue-titre').textContent = bienvenueDeja ? 'Ton compte est déjà validé' : 'Ton compte est validé !';
    // Pseudo : montré dès qu'il est lu sur le compte ; le formulaire de changement s'ouvre à la demande.
    var avecPseudo = co && !!profil;
    $('compte-pseudo-bloc').hidden = !avecPseudo;
    if (avecPseudo) {
      $('compte-pseudo').textContent = profil.pseudo;
      $('compte-pseudo-note').hidden = !profil.pseudo_auto;
      $('compte-pseudo-form').hidden = !editionPseudo;
      $('compte-pseudo-changer').hidden = editionPseudo;
    }
    // v10.32 : un compte Google n'a ni mot de passe ni adresse à changer ici (c'est Google qui les gère).
    var google = co && session.user && session.user.fournisseur === 'google';
    $('compte-email-bloc').hidden = !co || google;
    $('compte-mdp-bloc').hidden = !co || google;
    // Un parcours de connexion en cours (création, e-mail à valider, nouveau mot de passe…) se voit dans l'onglet « Connexion ».
    if (mode !== 'connexion') choisirOnglet('id');
    $('aide-version').textContent = window.SITE_VERSION ? 'v' + window.SITE_VERSION : '';
    $('rgpd-suppr-titre').textContent = session ? 'Supprimer mon compte' : 'Effacer les données de cet appareil';
    $('rgpd-suppr-texte').textContent = session
      ? 'Efface définitivement ton compte et tout ce qui lui est lié : joueurs, niveaux, étoiles, pierres, coffres et statistiques. Il n’y a pas de retour en arrière.'
      : 'Efface de cet appareil ta progression et tes joueurs (niveaux, étoiles, pierres, coffres, statistiques). Il n’y a pas de retour en arrière.';
    $('rgpd-suppr').textContent = session ? 'Supprimer définitivement mon compte et mes données' : 'Effacer les données de cet appareil';
    if (co) {
      $('compte-qui').textContent = qui;
      $('compte-etat').textContent = attente ? 'Sauvegarde en cours…'
        : etat.synchro === 'ok' ? 'Progression sauvegardée sur ton compte à ' + heure(etat.quand) + '.'
        : etat.synchro === 'erreur' ? 'Sauvegarde impossible pour le moment (' + traduire(etat.erreur) + ') Elle sera refaite à la prochaine partie.'
        : 'Ta progression est sauvegardée sur ton compte.';
    }
  }
  function changerMode(m) { mode = m; dire(''); majPage(); }

  $('btn-compte').addEventListener('click', function () { window.Aventura.afficher('ecran-compte'); });
  $('compte-google').addEventListener('click', google);
  $('compte-form').addEventListener('submit', function (e) { e.preventDefault(); seConnecter(); });
  $('compte-creer').addEventListener('click', function () {
    $('creation-email').value = $('compte-email').value.trim(); // adresse déjà tapée : reprise
    changerMode('creation'); $('creation-email').focus();
  });
  $('compte-creation-form').addEventListener('submit', function (e) { e.preventDefault(); creer(); });
  $('creation-annuler').addEventListener('click', function () { changerMode('connexion'); $('compte-email').focus(); });
  $('creation-voir').addEventListener('change', function () { $('creation-mdp').type = $('creation-mdp2').type = this.checked ? 'text' : 'password'; });
  $('attente-renvoyer').addEventListener('click', function () { renvoyer(emailAttente); });
  $('bienvenue-jouer').addEventListener('click', function () { window.Aventura.afficher('ecran-accueil'); });
  $('compte-oublie').addEventListener('click', oublie);
  $('compte-invite-ok').addEventListener('click', function () { window.Aventura.afficher('ecran-accueil'); jouerInvite(); });
  $('compte-synchro').addEventListener('click', function () { action(synchroniser()); });
  $('compte-sortir').addEventListener('click', seDeconnecter);
  // Changer de pseudo depuis « Mon compte » (mis à jour tout de suite dans Supabase).
  $('compte-pseudo-changer').addEventListener('click', function () {
    editionPseudo = true; messagePseudo('compte-pseudo-message', ''); majPage();
    $('compte-pseudo-champ').value = ''; $('compte-pseudo-champ').focus();
  });
  $('compte-pseudo-annuler').addEventListener('click', function () { editionPseudo = false; majPage(); $('compte-pseudo-changer').focus(); });
  $('compte-pseudo-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var champ = $('compte-pseudo-champ');
    occupe(true);
    enregistrerPseudo(champ.value).then(function (probleme) {
      occupe(false);
      if (probleme) { messagePseudo('compte-pseudo-message', probleme); champ.focus(); return; }
      editionPseudo = false; messagePseudo('compte-pseudo-message', '');
      dire('Ton pseudo est maintenant « ' + profil.pseudo + ' ».', 'ok');
      majPage(); $('compte-pseudo-changer').focus();
    });
  });
  // Fenêtre « Choisis ton pseudo » (pseudo automatique, proposé à la prochaine ouverture).
  if (fenetrePseudo) {
    $('fenetre-pseudo-plus-tard').addEventListener('click', pseudoPlusTard);
    fenetrePseudo.addEventListener('cancel', function (e) { e.preventDefault(); pseudoPlusTard(); }); // Échap = « Plus tard »
    $('fenetre-pseudo-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var champ = $('fenetre-pseudo-champ'), ok = $('fenetre-pseudo-ok');
      ok.disabled = true;
      enregistrerPseudo(champ.value).then(function (probleme) {
        ok.disabled = false;
        if (probleme) { messagePseudo('fenetre-pseudo-message', probleme); champ.focus(); return; }
        fenetrePseudo.close();
        majPage();
      });
    });
  }
  $('compte-nouveau-form').addEventListener('submit', function (e) { e.preventDefault(); nouveauMdp(); });
  $('compte-voir').addEventListener('change', function () { $('compte-mdp').type = this.checked ? 'text' : 'password'; });
  // En quittant « Mon compte », l'écran revient à la connexion (sauf « nouveau mot de passe », pas encore choisi).
  document.addEventListener('aventura-ecran', function (e) {
    // Pas connecté : on arrive sur « Identifiant et connexion » ; connecté : sur « Profil et joueurs ».
    if (e.detail === 'ecran-compte') { majPage(); if (mode === 'connexion') choisirOnglet(ongletCourant || (reel() ? 'profil' : 'id')); }
    else {
      if (e.detail !== 'ecran-coffres') ongletCourant = null;
      if (mode !== 'nouveau') { mode = 'connexion'; editionPseudo = false; fermerFormulaires(); dire(''); }
    }
  });

  // ---------- Onglets de « Mon compte » (v10.32) ----------
  // Profil et joueurs | Identifiant et connexion | Confidentialité et RGPD | Aide et mentions légales. Flèches, Début et Fin au clavier.
  var NOMS_ONGLETS = ['profil', 'id', 'rgpd', 'aide'];
  var ongletCourant = null; // gardé en allant voir « Mes coffres » : on revient sur le même onglet
  function choisirOnglet(nom, avecFocus) {
    ongletCourant = nom;
    NOMS_ONGLETS.forEach(function (n) {
      var b = $('onglet-' + n), actif = n === nom;
      b.setAttribute('aria-selected', String(actif)); b.tabIndex = actif ? 0 : -1;
      $('panneau-' + n).hidden = !actif;
      if (actif && avecFocus) b.focus();
    });
    if (nom === 'profil' && window.JoueursEcran) window.JoueursEcran.rendre();
  }
  var liste_onglets = document.querySelector('.compte-onglets');
  if (liste_onglets) {
    liste_onglets.addEventListener('click', function (e) { var b = e.target.closest('[data-onglet]'); if (b) choisirOnglet(b.getAttribute('data-onglet')); });
    liste_onglets.addEventListener('keydown', function (e) {
      var i = NOMS_ONGLETS.indexOf(document.activeElement && document.activeElement.getAttribute('data-onglet'));
      if (i < 0) return;
      var n = e.key === 'ArrowRight' ? (i + 1) % 4 : e.key === 'ArrowLeft' ? (i + 3) % 4 : e.key === 'Home' ? 0 : e.key === 'End' ? 3 : -1;
      if (n < 0) return;
      e.preventDefault(); choisirOnglet(NOMS_ONGLETS[n], true);
    });
  }

  // ---------- Changer l'adresse e-mail et le mot de passe (v10.32) ----------
  function messageForm(id, texte) { var m = $(id); if (m) { m.textContent = texte || ''; m.hidden = !texte; } }
  function formulaire(idBouton, idForm, idChamp, idMessage, idAnnuler) {
    $(idBouton).addEventListener('click', function () { $(idForm).hidden = false; $(idBouton).hidden = true; messageForm(idMessage, ''); $(idChamp).value = ''; $(idChamp).focus(); });
    $(idAnnuler).addEventListener('click', function () { $(idForm).hidden = true; $(idBouton).hidden = false; $(idBouton).focus(); });
  }
  function fermerFormulaires() {
    [['compte-email-changer', 'compte-email-form'], ['compte-mdp-changer', 'compte-mdp-form']].forEach(function (p) { if ($(p[0])) { $(p[0]).hidden = false; $(p[1]).hidden = true; } });
  }
  formulaire('compte-email-changer', 'compte-email-form', 'compte-email-champ', 'compte-email-message', 'compte-email-annuler');
  formulaire('compte-mdp-changer', 'compte-mdp-form', 'compte-mdp-champ', 'compte-mdp-message', 'compte-mdp-annuler');
  $('compte-email-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var adresse = $('compte-email-champ').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adresse)) { messageForm('compte-email-message', 'Cette adresse e-mail ne semble pas correcte.'); $('compte-email-champ').focus(); return; }
    if (session && session.user && String(session.user.email).toLowerCase() === adresse.toLowerCase()) { messageForm('compte-email-message', 'C’est déjà l’adresse de ton compte.'); return; }
    action(jeton().then(function (j) { return appel('/auth/v1/user?redirect_to=' + encodeURIComponent(adresseRetour()), { methode: 'PUT', jeton: j, corps: { email: adresse } }); }).then(function () {
      fermerFormulaires();
      dire('Un e-mail de confirmation vient de partir à ' + adresse + '. Ouvre le lien qu’il contient (regarde aussi dans l’ancienne adresse) pour valider le changement.', 'ok');
    }));
  });
  $('compte-mdp-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var mdp = $('compte-mdp-champ').value;
    if (mdp.length < 6) { messageForm('compte-mdp-message', 'Au moins 6 caractères.'); $('compte-mdp-champ').focus(); return; }
    action(jeton().then(function (j) { return appel('/auth/v1/user', { methode: 'PUT', jeton: j, corps: { password: mdp } }); }).then(function () {
      fermerFormulaires(); $('compte-mdp-champ').value = ''; dire('Nouveau mot de passe enregistré.', 'ok');
    }));
  });

  // ---------- Confidentialité et RGPD : export et suppression (v10.32) ----------
  // Export : un fichier JSON avec ce qui est gardé sur l'appareil et sur le compte (sans les jetons de connexion).
  function exporterDonnees() {
    var c = compteEtoiles(), reglages = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^ludoaventura-/.test(k) && k !== CLE_SESSION && k !== CLE_ETOILES) reglages[k] = lireJSON(k);
      }
    } catch (e) { /* stockage interdit : on exporte le reste */ }
    var donnees = {
      export: { jeu: 'Ludoaventura', genere_le: new Date().toISOString(), version: window.SITE_VERSION || '' },
      compte: { connecte: reel(), invite: invite(), email: (session && session.user && session.user.email) || null, pseudo: (profil && profil.pseudo) || null },
      progression: c ? c.etat : lireJSON(CLE_ETOILES),
      reglages_de_l_appareil: reglages
    };
    var blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'), url = URL.createObjectURL(blob);
    a.href = url; a.download = 'ludoaventura-mes-donnees-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    dire('Le fichier de tes données est téléchargé.', 'ok');
  }
  // Efface tout ce que le jeu garde sur l'appareil, puis recharge la page (le jeu repart de zéro).
  function effacerAppareil() {
    clearTimeout(minuterie);
    garderSession(null);
    try {
      Object.keys(localStorage).forEach(function (k) { if (/^(ludoaventura|ludo)-/.test(k)) localStorage.removeItem(k); });
      sessionStorage.clear();
    } catch (e) { /* stockage interdit */ }
    location.reload();
  }
  function supprimerCompte() {
    var avecCompte = !!session;
    window.Confirmer({
      titre: avecCompte ? 'Supprimer définitivement ton compte ?' : 'Effacer les données de cet appareil ?',
      texte: avecCompte ? 'Ton compte et toutes les données liées (joueurs, niveaux, étoiles, pierres, coffres, statistiques, pseudo) seront détruits. Cette action est définitive.'
        : 'Ta progression et tes joueurs seront effacés de cet appareil. Cette action est définitive.',
      oui: avecCompte ? 'Oui, tout supprimer' : 'Oui, tout effacer'
    }).then(function (oui) {
      if (!oui) return;
      if (!avecCompte) { effacerAppareil(); return; }
      action(jeton().then(function (j) {
        if (!j) throw new Error('Ta connexion a expiré : reconnecte-toi, puis recommence.');
        return appel('/rest/v1/rpc/supprimer_mon_compte', { methode: 'POST', jeton: j, corps: {} });
      }).then(function (ok) {
        if (ok !== true) throw new Error('La suppression n’a pas pu être faite. Réessaie dans un instant.');
        effacerAppareil();
      }));
    });
  }
  $('rgpd-export').addEventListener('click', exporterDonnees);
  $('rgpd-suppr').addEventListener('click', supprimerCompte);

  // ---------- Retour d'un lien reçu par e-mail ou de Google ----------
  // v9.9 : l'e-mail de validation (modèle dans outils/emails/) mène à ?valider=<jeton> ; le jeu vérifie le jeton
  // lui-même (POST /auth/v1/verify). Un simple passage d'un antivirus de messagerie sur le lien (requête GET)
  // ne consomme donc plus le jeton (docs Supabase, « Email prefetching »). ?mdp=<jeton> : mot de passe oublié.
  // Les anciens liens (#access_token=… ou #error=…) restent compris.
  function lienValidationRate(e) {
    // Lien déjà utilisé : si l'appareil est déjà connecté, c'est que le compte est validé (cas du 17/11/2026 :
    // « lien expiré » affiché à quelqu'un de connecté). Sinon, on explique sans parler d'erreur technique.
    if (e && /failed to fetch|networkerror|load failed/i.test(e.message)) {
      mode = 'connexion'; dire('Pas de connexion à Internet : touche de nouveau le bouton de l’e-mail quand Internet revient.', 'erreur'); return;
    }
    if (reel()) { bienvenueDeja = true; mode = 'bienvenue'; dire(''); if (!etat.quand) synchroniser(); return; }
    mode = 'connexion';
    dire('Ce lien de validation a déjà servi ou n’est plus valable. Si tu as déjà validé ton compte, connecte-toi ci-dessous. Sinon, connecte-toi quand même : le jeu te proposera de recevoir un nouvel e-mail.', 'erreur');
    if (e) console.warn('Validation impossible :', e.message);
  }
  function lireRetour() {
    var q = new URLSearchParams(location.search), jetonLien = q.get('valider'), jetonMdp = q.get('mdp');
    if (jetonLien || jetonMdp) {
      history.replaceState(null, '', location.pathname + location.hash); // le jeton ne reste pas dans l'adresse
      window.Aventura.afficher('ecran-compte');
      if (jetonMdp) {
        action(appel('/auth/v1/verify', { methode: 'POST', corps: { type: 'recovery', token_hash: jetonMdp } }).then(function (s) {
          garderSession(s); mode = 'nouveau'; dire('Choisis ton nouveau mot de passe.', '');
        }).catch(function () {
          mode = 'connexion';
          dire('Ce lien a déjà servi ou n’est plus valable : touche « Mot de passe oublié ? » pour en recevoir un nouveau.', 'erreur');
        }));
        return true;
      }
      mode = 'validation'; majPage();
      action(appel('/auth/v1/verify', { methode: 'POST', corps: { type: 'email', token_hash: jetonLien } }).then(function (s) {
        bienvenueDeja = false;
        return connecteAvec(s, '').then(function () { mode = 'bienvenue'; dire(''); });
      }, lienValidationRate));
      return true;
    }
    var h = location.hash.replace(/^#/, '');
    if (!/(access_token|error)=/.test(h)) return false;
    var p = {}; h.split('&').forEach(function (x) { var i = x.indexOf('='); if (i > 0) p[decodeURIComponent(x.slice(0, i))] = decodeURIComponent(x.slice(i + 1).replace(/\+/g, ' ')); });
    history.replaceState(null, '', location.pathname + location.search); // les jetons ne restent pas dans l'adresse
    window.Aventura.afficher('ecran-compte');
    if (p.error) {
      if (p.error_code === 'otp_expired') lienValidationRate(null);
      else dire('Connexion annulée ou impossible (' + (p.error_description || p.error) + ').', 'erreur');
      majPage(); return true;
    }
    var s = { access_token: p.access_token, refresh_token: p.refresh_token, expires_in: p.expires_in, expires_at: Number(p.expires_at) || undefined };
    if (p.type === 'recovery') {
      mode = 'nouveau';
      garderSession(s);
      action(appel('/auth/v1/user', { jeton: s.access_token }).then(function (u) { garderSession(Object.assign({}, session, { user: u })); dire('Choisis ton nouveau mot de passe.', ''); }));
      return true;
    }
    if (p.type === 'signup') { action(connecteAvec(s, '').then(function () { bienvenueDeja = false; mode = 'bienvenue'; dire(''); })); return true; }
    action(connecteAvec(s, null));
    return true;
  }

  // ---------- Fenêtre de connexion au lancement (v10.3, backlog ligne 405) ----------
  // Demande du 17/11/2026 : il faut se connecter pour jouer. Tant que le joueur n'est pas connecté, une fenêtre
  // au centre de l'écran propose « Se connecter », « Créer un compte » ou « Jouer en invité », à CHAQUE ouverture
  // du jeu (choix de l'utilisateur). Échap = « Jouer en invité ».
  // Les tests automatiques (navigator.webdriver) ne la voient pas, sauf s'ils la demandent (AVENTURA_FENETRE_COMPTE) :
  // sinon elle couvrirait l'accueil de tous les autres tests.
  var fenetre = $('fenetre-compte');
  function fermerFenetre() { if (fenetre && fenetre.open) fenetre.close(); }
  function ouvrirCompte(m, champ) {
    fermerFenetre();
    window.Aventura.afficher('ecran-compte');
    changerMode(m);
    if ($(champ)) $(champ).focus();
  }
  if (fenetre) {
    $('fenetre-connecter').addEventListener('click', function () { ouvrirCompte('connexion', 'compte-email'); });
    $('fenetre-creer').addEventListener('click', function () { ouvrirCompte('creation', 'creation-email'); });
    $('fenetre-invite').addEventListener('click', function () { fermerFenetre(); jouerInvite(); });
  }
  function fenetreAuLancement() {
    if (!fenetre || reel()) return;
    var auto = typeof navigator !== 'undefined' && navigator.webdriver;
    if (auto && window.AVENTURA_FENETRE_COMPTE !== true) return;
    if (!fenetre.open) fenetre.showModal();
    $('fenetre-connecter').focus();
  }

  majPage();
  if (!lireRetour()) {
    if (session) { synchroniser(); lireProfil(); } // ouverture du jeu : on récupère ce qui a été gagné ailleurs, et le pseudo
    if (!reel()) fenetreAuLancement(); // pas de vrai compte (même en invité) : la fenêtre revient à chaque ouverture
  }
  // rpc : appelle une fonction de la base avec le jeton du joueur connecté (invité compris) ; rend null si personne n'est connecté.
  function rpc(nom, corps) {
    return jeton().then(function (j) { return j ? appel('/rest/v1/rpc/' + nom, { methode: 'POST', jeton: j, corps: corps || {} }) : null; });
  }
  window.Compte = Object.assign(C, { synchroniser: synchroniser, session: function () { return session; }, invite: invite, etat: etat, rpc: rpc });
})(typeof window !== 'undefined' ? window : globalThis);
