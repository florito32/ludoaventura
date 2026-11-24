// « Mon compte » en 4 onglets (v10.32, demande du 23/11/2026, backlog lignes 459 à 465) :
// Profil et joueurs | Identifiant et connexion | Confidentialité et RGPD | Aide et mentions légales.
// Le service Supabase est imité (aucun appel réel).
const { test, expect } = require('@playwright/test');
const J = require('../js/joueurs.js');
const C = require('../js/compte.js');

const SERVICE = 'https://qxaaqcivtnhikppwmgdh.supabase.co';
const UTILISATEUR = { id: '11111111-2222-3333-4444-555555555555', email: 'joueur@example.com' };
const SESSION = { access_token: 'jeton-test', refresh_token: 'renouveau-test', expires_at: Math.floor(Date.now() / 1000) + 3600, user: UTILISATEUR };

// ---------- Règles (logique pure) ----------
test('statistiques : parties jouées, réussies, réussies d’affilée (en cours et record) par matière', () => {
  const etat = { joueurs: [] };
  const { joueur } = J.creer(etat, 'Léa', 'lea');
  expect(J.statDe(joueur, 'maths')).toEqual({ jouees: 0, reussies: 0, serie: 0, record: 0 });
  for (const ok of [true, true, false, true]) J.enregistrerPartie(etat, joueur.id, 'maths', ok);
  expect(J.statDe(joueur, 'maths')).toEqual({ jouees: 4, reussies: 3, serie: 1, record: 2 });
  J.enregistrerPartie(etat, joueur.id, 'histoire', true);
  expect(J.statTotal(joueur)).toEqual({ jouees: 5, reussies: 4, record: 2 });
  expect(J.enregistrerPartie(etat, joueur.id, 'inconnue', true)).toBe(false);
  expect(J.enregistrerPartie(etat, 'absent', 'maths', true)).toBe(false);
});

test('fusion des statistiques : le plus grand de chaque compteur, série en cours du côté le plus récent', () => {
  const a = [{ id: 'j-1', nom: 'A', perso: 'lea', maj: '2026-11-02T00:00:00Z', niv: {}, st: { maths: [10, 6, 2, 4] } }];
  const b = [{ id: 'j-1', nom: 'B', perso: 'lea', maj: '2026-11-09T00:00:00Z', niv: {}, st: { maths: [8, 7, 0, 3], francais: [2, 1, 1, 1] } }];
  const [x] = J.fusionner(a, b);
  expect(J.statDe(x, 'maths')).toEqual({ jouees: 10, reussies: 7, serie: 0, record: 4 });
  expect(J.statDe(x, 'francais')).toEqual({ jouees: 2, reussies: 1, serie: 1, record: 1 });
});

test('supprimer un joueur : il est retiré, son identifiant est « enterré » et ne revient pas à la fusion', () => {
  const etat = { joueurs: [] };
  J.assurerPremier(etat);
  const { joueur } = J.creer(etat, 'Tom', 'tom');
  expect(J.supprimer(etat, joueur.id)).toBe(true);
  expect(etat.joueurs.map((j) => j.nom)).toEqual(['Joueur 1']);
  expect(etat.supprimes).toEqual([joueur.id]);
  expect(J.supprimer(etat, 'absent')).toBe(false);
  // Un autre appareil a encore Tom : la fusion du compte ne le ramène pas.
  const distant = { v: 1, total: 0, joueurs: [{ id: joueur.id, nom: 'Tom', perso: 'tom', maj: '2026-11-01T00:00:00Z', niv: {} }] };
  const r = C.fusionner(Object.assign({ v: 1, total: 0 }, etat), distant, {});
  expect(r.joueurs.map((j) => j.id)).toEqual(['j-1']);
  expect(r.supprimes).toEqual([joueur.id]);
});

test('supprimer le dernier joueur : un nouveau « Joueur 1 » vide prend un autre identifiant', () => {
  const etat = { joueurs: [] };
  J.assurerPremier(etat);
  J.supprimer(etat, J.ID_PREMIER);
  expect(J.assurerPremier(etat)).toBe(true);
  expect(etat.joueurs[0].nom).toBe('Joueur 1');
  expect(etat.joueurs[0].id).not.toBe(J.ID_PREMIER);
});

// ---------- Écran ----------
async function preparer(page, { etat = null, session = null } = {}) {
  await page.addInitScript(([e, s]) => {
    window.AVENTURA_DELAI_SYNCHRO = 0;
    try {
      localStorage.setItem('ludo-vu', '1');
      if (e && !localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify(e));
      if (s && !localStorage.getItem('ludoaventura-session')) localStorage.setItem('ludoaventura-session', JSON.stringify(s));
    } catch (x) { /* */ }
  }, [etat, session]);
}
// Pour les tests qui rechargent la page après avoir tout effacé : on sème les données une seule fois (un script d'initialisation les remettrait).
async function semer(page, { etat = null, session = null } = {}) {
  await page.goto('./');
  await page.evaluate(([e, s]) => {
    localStorage.setItem('ludo-vu', '1');
    if (e) localStorage.setItem('ludoaventura-etoiles', JSON.stringify(e));
    if (s) localStorage.setItem('ludoaventura-session', JSON.stringify(s));
  }, [etat, session]);
  await page.reload();
}
// Service imité : garde les appels intéressants.
async function service(page) {
  const appels = { put: [], rpc: [], progression: [] };
  await page.route(SERVICE + '/**', async (route) => {
    const req = route.request(), chemin = new URL(req.url()).pathname, m = req.method();
    const json = (status, corps) => route.fulfill({ status, contentType: 'application/json', body: corps === undefined ? '' : JSON.stringify(corps) });
    if (chemin === '/auth/v1/user' && m === 'GET') return json(200, UTILISATEUR);
    if (chemin === '/auth/v1/user' && m === 'PUT') { appels.put.push(req.postDataJSON()); return json(200, UTILISATEUR); }
    if (chemin === '/rest/v1/progression' && m === 'GET') return json(200, []);
    if (chemin === '/rest/v1/progression' && m === 'POST') { appels.progression.push(req.postDataJSON()); return json(201); }
    if (chemin === '/rest/v1/rpc/supprimer_mon_compte') { appels.rpc.push(chemin); return json(200, true); }
    if (chemin === '/rest/v1/rpc/mon_profil') return json(200, { pseudo: 'Aventurier42', pseudo_auto: false, a_proposer: false, invite: false });
    return json(404, { message: 'inconnu' });
  });
  return appels;
}
const sansDebordement = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const carte = (page, nom) => page.locator('.joueur-carte', { has: page.getByRole('heading', { name: nom, exact: true }) });
const joueursStockes = (page) => page.evaluate(() => (JSON.parse(localStorage.getItem('ludoaventura-etoiles') || '{}').joueurs) || []);
const ETAT_2 = { v: 1, total: 0, joueurs: [
  { id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: { 'maths.calcul': 40 }, st: { maths: [4, 3, 1, 2] } },
  { id: 'j2', nom: 'Tom', perso: 'tom', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: {} }] };

test('4 onglets : pas connecté on arrive sur « Connexion », connecté sur « Joueurs » ; chacun sans débordement @smoke', async ({ page }) => {
  await preparer(page);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  const onglets = page.getByRole('tab');
  await expect(onglets).toHaveCount(4);
  await expect(page.locator('#onglet-id')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#compte-invite')).toBeVisible();
  const titres = { profil: 'Profil et joueurs', id: 'Identifiant et connexion', rgpd: 'Confidentialité et RGPD', aide: 'Aide et mentions légales' };
  for (const [nom, titre] of Object.entries(titres)) {
    await page.locator('#onglet-' + nom).click();
    await expect(page.locator('#onglet-' + nom)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panneau-' + nom)).toBeVisible();
    await expect(page.locator('#panneau-' + nom).getByRole('heading', { name: titre, level: 3 }).first()).toBeVisible();
    for (const autre of Object.keys(titres).filter((n) => n !== nom)) await expect(page.locator('#panneau-' + autre)).toBeHidden();
    expect(await sansDebordement(page), 'onglet ' + nom).toBe(true);
  }
});

test('onglets au clavier : flèches, Début, Fin', async ({ page }) => {
  await preparer(page);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-id').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#onglet-rgpd')).toBeFocused();
  await expect(page.locator('#onglet-rgpd')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(page.locator('#onglet-aide')).toBeFocused();
  await page.keyboard.press('ArrowRight'); // retour au début
  await expect(page.locator('#onglet-profil')).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#onglet-aide')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator('#onglet-profil')).toBeFocused();
});

test('connecté : « Mon compte » s’ouvre sur « Joueurs » ; l’e-mail et le pseudo sont dans « Connexion »', async ({ page }) => {
  await preparer(page, { session: SESSION });
  await service(page);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await expect(page.locator('#onglet-profil')).toHaveAttribute('aria-selected', 'true');
  await page.locator('#onglet-id').click();
  await expect(page.locator('#compte-qui')).toHaveText('joueur@example.com');
  await expect(page.locator('#compte-pseudo')).toHaveText('Aventurier42');
  await expect(page.getByRole('button', { name: 'Changer mon adresse e-mail' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Changer le mot de passe' })).toBeVisible();
});

test('carte fermée : visage, nom, crayon, niveau, Statistiques, poubelle ; icônes de 32 px avec zone de toucher de 44 px @smoke', async ({ page }) => {
  await preparer(page, { etat: ETAT_2 });
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  const c = carte(page, 'Léa');
  await expect(c.locator('.joueur-avatar')).toBeVisible();
  await expect(c.getByRole('button', { name: 'Modifier le joueur Léa' })).toBeVisible();
  await expect(c.getByRole('button', { name: 'Supprimer le joueur Léa' })).toBeVisible();
  await expect(c.getByRole('button', { name: 'Statistiques' })).toHaveAttribute('aria-expanded', 'false');
  await expect(c.getByRole('meter')).toHaveCount(0); // rien de chiffré tant que « Statistiques » est fermé
  const crayon = await c.getByRole('button', { name: 'Modifier le joueur Léa' }).boundingBox();
  expect(Math.round(crayon.width)).toBe(32);
  const zone = await c.getByRole('button', { name: 'Modifier le joueur Léa' }).evaluate((b) => { const r = getComputedStyle(b, '::after'); return { haut: parseFloat(r.top), bas: parseFloat(r.bottom) }; });
  expect(32 - zone.haut - zone.bas).toBeGreaterThanOrEqual(44);
  expect(await sansDebordement(page)).toBe(true);
});

test('Statistiques : se déroule sous le joueur, avec parties jouées / réussies / d’affilée par matière ; se referme', async ({ page }) => {
  await preparer(page, { etat: ETAT_2 });
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  const c = carte(page, 'Léa');
  const bouton = c.getByRole('button', { name: 'Statistiques' });
  await bouton.click();
  await expect(bouton).toHaveAttribute('aria-expanded', 'true');
  await expect(c.locator('.joueur-stats')).toBeVisible();
  await expect(c.locator('.js-resume')).toContainText('étoile');
  await expect(c.locator('.js-resume')).toContainText('niveau');
  await expect(c.locator('.js-resume')).toContainText('pierre');
  await expect(c.getByRole('meter')).toHaveCount(4);
  const maths = c.locator('.jm-bloc.m-maths');
  await expect(maths.locator('.jm-detail')).toHaveText('4 parties jouées · 3 réussies · 1 d’affilée (record : 2)');
  await expect(c.locator('.jm-bloc.m-francais .jm-detail')).toHaveText('0 partie jouée · 0 réussie · 0 d’affilée (record : 0)');
  await expect(c.locator('.joueur-stats > .petit')).toHaveText('En tout : 4 parties jouées, 3 réussies.');
  expect(await sansDebordement(page)).toBe(true);
  await bouton.click();
  await expect(c.locator('.joueur-stats')).toBeHidden();
  await expect(carte(page, 'Tom').locator('.joueur-stats')).toBeHidden(); // l'autre carte n'a pas bougé
});

test('poubelle : confirmation « détruira toute sa progression et ses gains » ; Annuler garde, Oui supprime @smoke', async ({ page }) => {
  await preparer(page, { etat: ETAT_2 });
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  await carte(page, 'Tom').getByRole('button', { name: 'Supprimer le joueur Tom' }).click();
  const fenetre = page.getByRole('dialog');
  await expect(fenetre).toBeVisible();
  await expect(fenetre).toContainText('Supprimer le profil de Tom ?');
  await expect(fenetre).toContainText('détruira toute sa progression et ses gains');
  await expect(page.getByRole('button', { name: 'Annuler' })).toBeFocused(); // le choix prudent d'abord
  expect(await sansDebordement(page)).toBe(true);
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(fenetre).toBeHidden();
  expect((await joueursStockes(page)).map((j) => j.nom)).toEqual(['Léa', 'Tom']);
  await page.keyboard.press('Escape'); // Échap n'a rien supprimé non plus
  // Confirmer.
  await carte(page, 'Tom').getByRole('button', { name: 'Supprimer le joueur Tom' }).click();
  await page.getByRole('button', { name: 'Oui, supprimer' }).click();
  await expect(carte(page, 'Tom')).toHaveCount(0);
  await expect(page.locator('#joueurs-compte')).toHaveText('1 joueur');
  await expect(page.locator('#joueurs-annonce')).toHaveText('Le profil de Tom est supprimé.');
  const stocke = await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')));
  expect(stocke.joueurs.map((j) => j.nom)).toEqual(['Léa']);
  expect(stocke.supprimes).toEqual(['j2']);
  await page.reload();
  // Le jeu rouvre l'écran où l'on était : on ne touche l'icône du compte que si elle est là.
  if (!(await page.locator('#ecran-compte').isVisible())) await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  await expect(carte(page, 'Tom')).toHaveCount(0);
});

test('supprimer le dernier joueur : un nouveau « Joueur 1 » vide apparaît', async ({ page }) => {
  await preparer(page, { etat: { v: 1, total: 0, joueurs: [ETAT_2.joueurs[0]] } });
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  await carte(page, 'Léa').getByRole('button', { name: 'Supprimer le joueur Léa' }).click();
  await page.getByRole('button', { name: 'Oui, supprimer' }).click();
  await expect(carte(page, 'Joueur 1')).toBeVisible();
  const [j] = await joueursStockes(page);
  expect(j.id).not.toBe('j-1');
  expect(j.niv).toEqual({});
});

test('revenir de « Mes coffres » ramène sur l’onglet Joueurs', async ({ page }) => {
  await preparer(page, { etat: ETAT_2 });
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  await carte(page, 'Léa').getByRole('button', { name: 'Statistiques' }).click();
  await carte(page, 'Léa').getByRole('button', { name: 'Mes coffres' }).click();
  await expect(page.getByRole('heading', { name: 'Mes coffres' })).toBeVisible();
  await page.locator('#ecran-coffres [data-retour-compte]').click();
  await expect(page.locator('#onglet-profil')).toHaveAttribute('aria-selected', 'true');
  await expect(carte(page, 'Léa')).toBeVisible();
});

// ---------- Identifiant et connexion ----------
test('changer l’adresse e-mail : vérifiée, envoyée au service, message de confirmation', async ({ page }) => {
  await preparer(page, { session: SESSION });
  const appels = await service(page);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-id').click();
  await page.getByRole('button', { name: 'Changer mon adresse e-mail' }).click();
  await expect(page.locator('#compte-email-champ')).toBeFocused();
  await page.locator('#compte-email-champ').fill('pas-une-adresse');
  await page.getByRole('button', { name: 'Enregistrer l’adresse' }).click();
  await expect(page.locator('#compte-email-message')).toContainText('ne semble pas correcte');
  await page.locator('#compte-email-champ').fill('JOUEUR@example.com');
  await page.getByRole('button', { name: 'Enregistrer l’adresse' }).click();
  await expect(page.locator('#compte-email-message')).toContainText('déjà l’adresse');
  expect(appels.put).toHaveLength(0);
  await page.locator('#compte-email-champ').fill('nouvelle@example.com');
  await page.getByRole('button', { name: 'Enregistrer l’adresse' }).click();
  await expect(page.locator('#compte-message')).toContainText('e-mail de confirmation vient de partir à nouvelle@example.com');
  expect(appels.put).toEqual([{ email: 'nouvelle@example.com' }]);
  await expect(page.locator('#compte-email-form')).toBeHidden();
  expect(await sansDebordement(page)).toBe(true);
});

test('changer le mot de passe : 6 caractères au moins, puis envoyé au service', async ({ page }) => {
  await preparer(page, { session: SESSION });
  const appels = await service(page);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-id').click();
  await page.getByRole('button', { name: 'Changer le mot de passe' }).click();
  await page.locator('#compte-mdp-champ').fill('abc');
  await page.getByRole('button', { name: 'Enregistrer le mot de passe' }).click();
  await expect(page.locator('#compte-mdp-message')).toHaveText('Au moins 6 caractères.');
  expect(appels.put).toHaveLength(0);
  await page.locator('#compte-mdp-champ').fill('secret123');
  await page.getByRole('button', { name: 'Enregistrer le mot de passe' }).click();
  await expect(page.locator('#compte-message')).toHaveText('Nouveau mot de passe enregistré.');
  expect(appels.put).toEqual([{ password: 'secret123' }]);
});

test('compte Google : ni e-mail ni mot de passe à changer ici', async ({ page }) => {
  await preparer(page, { session: { ...SESSION, user: { ...UTILISATEUR, fournisseur: 'google' } } });
  await service(page);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-id').click();
  await expect(page.locator('#compte-qui')).toHaveText('joueur@example.com');
  await expect(page.getByRole('button', { name: 'Changer mon adresse e-mail' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Changer le mot de passe' })).toBeHidden();
});

// ---------- Confidentialité et RGPD ----------
test('RGPD : ce qui est gardé, et export des données en fichier JSON sans les jetons @smoke', async ({ page }) => {
  await preparer(page, { etat: ETAT_2, session: SESSION });
  await service(page);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-rgpd').click();
  await expect(page.locator('#panneau-rgpd')).toContainText('aucune publicité');
  await expect(page.locator('#panneau-rgpd')).toContainText('Supabase');
  const [telechargement] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exporter mes données' }).click()]);
  expect(telechargement.suggestedFilename()).toMatch(/^ludoaventura-mes-donnees-\d{4}-\d{2}-\d{2}\.json$/);
  const chemin = await telechargement.path();
  const texte = require('fs').readFileSync(chemin, 'utf8');
  const donnees = JSON.parse(texte);
  expect(donnees.compte).toMatchObject({ connecte: true, email: 'joueur@example.com' });
  expect(donnees.progression.joueurs.map((j) => j.nom)).toEqual(expect.arrayContaining(['Léa', 'Tom']));
  expect(texte).not.toContain('jeton-test');
  expect(texte).not.toContain('renouveau-test');
  await expect(page.locator('#compte-message')).toContainText('téléchargé');
  expect(await sansDebordement(page)).toBe(true);
});

test('RGPD : supprimer le compte = confirmation, puis suppression côté service et appareil remis à zéro @smoke', async ({ page }) => {
  const appels = await service(page);
  await semer(page, { etat: ETAT_2, session: SESSION });
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-rgpd').click();
  await page.getByRole('button', { name: 'Supprimer définitivement mon compte et mes données' }).click();
  const fenetre = page.getByRole('dialog');
  await expect(fenetre).toContainText('Supprimer définitivement ton compte ?');
  await page.getByRole('button', { name: 'Annuler' }).click();
  expect(appels.rpc).toHaveLength(0); // annuler ne supprime rien
  expect(await page.evaluate(() => localStorage.getItem('ludoaventura-session'))).not.toBeNull();
  await page.getByRole('button', { name: 'Supprimer définitivement mon compte et mes données' }).click();
  await page.getByRole('button', { name: 'Oui, tout supprimer' }).click();
  await expect.poll(() => appels.rpc.length).toBe(1);
  // La page se recharge toute seule : une lecture faite pendant le rechargement est simplement refaite.
  const lire = (f) => async () => { try { return await page.evaluate(f); } catch (e) { return 'rechargement'; } };
  await expect.poll(lire(() => localStorage.getItem('ludoaventura-session'))).toBeNull();
  // Appareil remis à zéro : plus de joueurs d'avant (seul « Joueur 1 », recréé vide).
  await expect.poll(lire(() => (JSON.parse(localStorage.getItem('ludoaventura-etoiles') || '{}').joueurs || []).map((j) => j.nom).join())).not.toContain('Léa');
  // Le service imité est retiré avant la fin : sans cela, une requête encore en route pendant le rechargement peut bloquer la fermeture du test.
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});

test('RGPD : sans compte, le bouton efface les données de l’appareil après confirmation', async ({ page }) => {
  await semer(page, { etat: ETAT_2 });
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-rgpd').click();
  await expect(page.locator('#rgpd-suppr-titre')).toHaveText('Effacer les données de cet appareil');
  await page.getByRole('button', { name: 'Effacer les données de cet appareil' }).click();
  await expect(page.getByRole('dialog')).toContainText('effacés de cet appareil');
  await page.getByRole('button', { name: 'Oui, tout effacer' }).click();
  await page.waitForLoadState('load');
  if (!(await page.locator('#ecran-compte').isVisible())) await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  await expect(carte(page, 'Léa')).toHaveCount(0);
  await expect(carte(page, 'Joueur 1')).toBeVisible();
});

// ---------- Aide et mentions légales ----------
test('Aide : politique de confidentialité, mentions légales, crédits et version ; plus rien de tout cela dans le pied de l’accueil @smoke', async ({ page }) => {
  await preparer(page);
  await page.goto('./');
  const pied = page.locator('footer.pied');
  await expect(pied).not.toContainText('Mentions légales');
  await expect(pied).not.toContainText('Crédits');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-aide').click();
  const aide = page.locator('#panneau-aide');
  await expect(aide.getByRole('link', { name: /Politique de confidentialité/ })).toHaveAttribute('href', 'https://www.ludo-aventura.fr/policies/privacy-policy');
  await expect(aide.getByRole('link', { name: /Mentions légales/ })).toHaveAttribute('href', 'https://www.ludo-aventura.fr/pages/mentions-legales');
  await expect(aide.getByRole('link', { name: /Conditions générales/ })).toHaveCount(0); // masquées tant que la page n'existe pas (backlog)
  await expect(page.locator('#aide-version')).toHaveText(/^v\d+\.\d+$/); // la version, pour tout le monde
  await expect(page.locator('.version-badge')).toHaveCount(0); // le détail (historique) reste réservé à l'administrateur
  await aide.getByRole('button', { name: 'Crédits' }).click();
  const f = page.locator('#credits');
  await expect(f).toBeVisible();
  await expect(f).toContainText('Illustrations du jeu : Stuki San.');
  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(f).toBeHidden();
  expect(await sansDebordement(page)).toBe(true);
});

test('Aide : le détail de la version (historique) n’apparaît que pour l’administrateur', async ({ page }) => {
  await preparer(page, { session: { ...SESSION, user: { ...UTILISATEUR, email: 'fborel64@gmail.com' } } });
  await service(page);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-aide').click();
  await expect(page.locator('#aide-version')).toHaveText(/^v\d+\.\d+$/);
  await expect(page.locator('.version-badge')).toHaveCount(1); // le badge cliquable (historique) du pied de page, pour lui seul
});
