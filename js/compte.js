// Compte en ligne et sauvegarde de la progression (v9.4, demande du 16/11/2026, backlog lignes 346 à 349).
// Choix de l'utilisateur :
//  - connexion FACULTATIVE : sans compte, on joue « en invité » et la progression reste sur l'appareil (comme avant) ;
//  - connexion avec Google, ou avec une adresse e-mail + un mot de passe (confirmation par e-mail à l'inscription,
//    « Mot de passe oublié ») ; les e-mails partent par Brevo (réglé dans le tableau de bord Supabase) ;
//  - une seule progression par compte (pas de profils par enfant) ;
//  - en se connectant, la progression de l'appareil est FUSIONNÉE avec celle du compte (on garde le meilleur des deux).
// Ce qui est sauvegardé : les étoiles, niveaux, coffres, pierres et défis (js/etoiles.js, clé « ludoaventura-etoiles »).
// Les réglages des parties (packs, niveaux…) restent propres à chaque appareil.
// Service : Supabase (projet « ludo jeu »), table public.progression (une ligne par compte, sécurité par ligne :
// chacun ne lit et n'écrit que la sienne). Aucune bibliothèque : appels HTTP directs (fetch) à l'API d'authentification
// (GoTrue, /auth/v1) et à l'API de données (PostgREST, /rest/v1). La clé « publishable » est publique par nature.
// Partie logique (fusion) utilisable dans les tests Node : module.exports.
(function (racine) {
  'use strict';

  var URL_SUPABASE = 'https://qxaaqcivtnhikppwmgdh.supabase.co';
  var CLE_API = 'sb_publishable_jsD5pZK2_7QooEpanwGEmw_bhj_TJYm';
  var CLE_ETOILES = 'ludoaventura-etoiles';
  var CLE_SESSION = 'ludoaventura-session'; // jetons de connexion (localStorage : on reste connecté)
  var CLE_BASE = 'ludoaventura-compte';     // { uid, total, gemmes, quand } : dernière progression envoyée au compte

  // ---------- Fusion de deux progressions (logique pure) ----------
  // local : progression de l'appareil ; distant : celle du compte ; base : ce que l'appareil a déjà envoyé au compte
  // (total et pierres). Les étoiles et pierres GAGNÉES sur l'appareil depuis la base s'ajoutent à celles du compte :
  // rien n'est compté deux fois quand deux appareils jouent tour à tour, et la 1re connexion ajoute tout (base 0).
  function objet(x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
  function liste(x) { return Array.isArray(x) ? x : []; }
  function nombre(x) { return typeof x === 'number' && isFinite(x) ? x : 0; }
  function unir(a, b) { var r = liste(b).slice(); liste(a).forEach(function (x) { if (r.indexOf(x) < 0) r.push(x); }); return r; }
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
    r.visites = unir(a.visites, d.visites).sort();
    r.parties = unir(a.parties, d.parties).slice(0, 50);
    r.defisEnCours = objet(a.defisEnCours); // défi commencé sur CET appareil
    var s = [a.simplesDepuis, d.simplesDepuis].filter(function (x) { return typeof x === 'number'; });
    r.simplesDepuis = s.length ? Math.min.apply(null, s) : null;
    return r;
  }

  var C = { fusionner: fusionner, URL: URL_SUPABASE, CLE_SESSION: CLE_SESSION, CLE_BASE: CLE_BASE };
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
        user: s.user ? { id: s.user.id, email: s.user.email } : (session && session.user) || null };
    } else session = null;
    ecrireJSON(CLE_SESSION, session);
  }
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
          ecrireJSON(CLE_BASE, { uid: uid, total: nombre(r.total), gemmes: nombre(r.gemmes), quand: new Date().toISOString() });
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

  // ---------- Connexion, inscription, mot de passe ----------
  function connecteAvec(s, message) {
    garderSession(s);
    return (s.user ? Promise.resolve(s.user) : appel('/auth/v1/user', { jeton: s.access_token })).then(function (u) {
      garderSession(Object.assign({}, session, { user: u }));
      dire(message || 'Tu es connecté. Ta progression est maintenant sauvegardée sur ton compte.', 'ok');
      return synchroniser();
    });
  }
  function google() {
    location.href = URL_SUPABASE + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(adresseRetour());
  }
  // Messages d'erreur du service, en français.
  function traduire(e) {
    var m = String(e && e.message || ''), c = e && e.code;
    if (c === 'invalid_credentials' || /invalid login credentials/i.test(m)) return 'Adresse e-mail ou mot de passe incorrect.';
    if (c === 'email_not_confirmed' || /not confirmed/i.test(m)) return 'Adresse pas encore confirmée : ouvre l’e-mail reçu et touche le lien de confirmation.';
    if (c === 'weak_password' || /password should/i.test(m)) return 'Mot de passe trop faible : au moins 6 caractères.';
    if (c === 'user_already_exists' || /already registered/i.test(m)) return 'Un compte existe déjà avec cette adresse : connecte-toi.';
    if (c === 'over_email_send_rate_limit' || /rate limit/i.test(m)) return 'Trop de demandes pour le moment : réessaie dans quelques minutes.';
    if (c === 'validation_failed' || /invalid format|email address .* invalid/i.test(m)) return 'Adresse e-mail invalide.';
    if (/failed to fetch|networkerror|load failed/i.test(m)) return 'Pas de connexion à Internet : réessaie plus tard.';
    return 'Ça n’a pas marché (' + (m || 'erreur inconnue') + ').';
  }
  function champs() { return { email: $('compte-email').value.trim(), mdp: $('compte-mdp').value }; }
  function verifier(avecMdp) {
    var f = champs();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) { dire('Écris ton adresse e-mail (exemple : prenom@gmail.com).', 'erreur'); $('compte-email').focus(); return null; }
    if (avecMdp && f.mdp.length < 6) { dire('Écris ton mot de passe (au moins 6 caractères).', 'erreur'); $('compte-mdp').focus(); return null; }
    return f;
  }
  function occupe(oui) { document.querySelectorAll('#compte-corps button').forEach(function (b) { b.disabled = oui; }); }
  function action(promesse) { occupe(true); return promesse.catch(function (e) { dire(traduire(e), 'erreur'); }).then(function () { occupe(false); majPage(); }); }
  function seConnecter() {
    var f = verifier(true); if (!f) return;
    action(appel('/auth/v1/token?grant_type=password', { methode: 'POST', corps: { email: f.email, password: f.mdp } }).then(function (s) { $('compte-mdp').value = ''; return connecteAvec(s); }));
  }
  function creer() {
    var f = verifier(true); if (!f) return;
    action(appel('/auth/v1/signup?redirect_to=' + encodeURIComponent(adresseRetour()), { methode: 'POST', corps: { email: f.email, password: f.mdp } }).then(function (r) {
      $('compte-mdp').value = '';
      if (r && r.access_token) return connecteAvec(r, 'Compte créé, tu es connecté.');
      dire('Presque fini : ouvre l’e-mail envoyé à ' + f.email + ' et touche le lien pour confirmer ton adresse. (Pense à regarder dans les indésirables.)', 'ok');
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
      $('compte-nouveau').value = ''; modeNouveau = false; dire('Nouveau mot de passe enregistré.', 'ok');
    }));
  }
  // Déconnexion : le compte garde la progression ; l'appareil repart en invité, à zéro.
  function seDeconnecter() {
    var j = session && session.access_token;
    clearTimeout(minuterie);
    var fin = function () {
      garderSession(null); ecrireJSON(CLE_BASE, null);
      poserLocal({ v: 1, total: 0 });
      etat.synchro = 'aucune';
      dire('Tu es déconnecté. Ta progression reste sur ton compte ; sur cet appareil tu joues maintenant en invité.', 'ok');
      majPage();
    };
    // Dernier envoi avant de partir, puis fin de session côté service (sans bloquer si hors ligne).
    action(synchroniser().then(function () { return j ? appel('/auth/v1/logout', { methode: 'POST', jeton: j }).catch(function () {}) : null; }).then(fin, fin));
  }

  // ---------- Écran « Mon compte » ----------
  var modeNouveau = false; // retour d'un lien « mot de passe oublié »
  function dire(texte, type) { var m = $('compte-message'); if (!m) return; m.textContent = texte; m.className = 'compte-message ' + (type || ''); m.hidden = !texte; }
  function heure(d) { return d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''; }
  function majPastille() {
    var b = $('btn-compte'); if (!b) return;
    b.classList.toggle('connecte', !!session);
    $('compte-pastille-texte').textContent = session ? 'Mon compte' : 'Se connecter';
    $('compte-pastille-aide').textContent = session ? ' : connecté, progression sauvegardée' : ' : sauvegarder ma progression';
  }
  function majPage() {
    majPastille();
    var corps = $('compte-corps'); if (!corps) return;
    var co = !!session, attente = etat.synchro === 'en-cours';
    $('compte-invite').hidden = co || modeNouveau;
    $('compte-connecte').hidden = !co || modeNouveau;
    $('compte-nouveau-bloc').hidden = !modeNouveau;
    if (co) {
      $('compte-qui').textContent = session.user && session.user.email ? session.user.email : 'ton compte';
      $('compte-etat').textContent = attente ? 'Sauvegarde en cours…'
        : etat.synchro === 'ok' ? 'Progression sauvegardée sur ton compte à ' + heure(etat.quand) + '.'
        : etat.synchro === 'erreur' ? 'Sauvegarde impossible pour le moment (' + traduire(etat.erreur) + ') Elle sera refaite à la prochaine partie.'
        : 'Ta progression est sauvegardée sur ton compte.';
    }
  }

  $('btn-compte').addEventListener('click', function () { window.Aventura.afficher('ecran-compte'); });
  $('compte-google').addEventListener('click', google);
  $('compte-form').addEventListener('submit', function (e) { e.preventDefault(); seConnecter(); });
  $('compte-creer').addEventListener('click', creer);
  $('compte-oublie').addEventListener('click', oublie);
  $('compte-invite-ok').addEventListener('click', function () { window.Aventura.afficher('ecran-accueil'); });
  $('compte-synchro').addEventListener('click', function () { action(synchroniser()); });
  $('compte-sortir').addEventListener('click', seDeconnecter);
  $('compte-nouveau-form').addEventListener('submit', function (e) { e.preventDefault(); nouveauMdp(); });
  $('compte-voir').addEventListener('change', function () { $('compte-mdp').type = this.checked ? 'text' : 'password'; });
  document.addEventListener('aventura-ecran', function (e) { if (e.detail === 'ecran-compte') majPage(); else if (!modeNouveau) dire(''); });

  // ---------- Retour de Google ou d'un lien reçu par e-mail (#access_token=… ou #error=…) ----------
  function lireRetour() {
    var h = location.hash.replace(/^#/, '');
    if (!/(access_token|error)=/.test(h)) return false;
    var p = {}; h.split('&').forEach(function (x) { var i = x.indexOf('='); if (i > 0) p[decodeURIComponent(x.slice(0, i))] = decodeURIComponent(x.slice(i + 1).replace(/\+/g, ' ')); });
    history.replaceState(null, '', location.pathname + location.search); // les jetons ne restent pas dans l'adresse
    window.Aventura.afficher('ecran-compte');
    if (p.error) { dire(p.error_code === 'otp_expired' ? 'Ce lien a expiré ou a déjà servi : demande-en un nouveau.' : 'Connexion annulée ou impossible (' + (p.error_description || p.error) + ').', 'erreur'); return true; }
    var s = { access_token: p.access_token, refresh_token: p.refresh_token, expires_in: p.expires_in, expires_at: Number(p.expires_at) || undefined };
    if (p.type === 'recovery') {
      modeNouveau = true;
      garderSession(s);
      action(appel('/auth/v1/user', { jeton: s.access_token }).then(function (u) { garderSession(Object.assign({}, session, { user: u })); dire('Choisis ton nouveau mot de passe.', ''); }));
      return true;
    }
    action(connecteAvec(s, p.type === 'signup' ? 'Adresse confirmée : tu es connecté et ta progression est sauvegardée.' : null));
    return true;
  }

  majPage();
  if (!lireRetour() && session) synchroniser(); // ouverture du jeu : on récupère ce qui a été gagné ailleurs
  window.Compte = Object.assign(C, { synchroniser: synchroniser, session: function () { return session; }, etat: etat });
})(typeof window !== 'undefined' ? window : globalThis);
