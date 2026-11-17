// Pseudos des joueurs (v10.9, demande du 17/11/2026, backlog lignes 416 à 419).
// Règles : pseudo unique de 4 à 20 caractères (lettres, chiffres, - et _, sans espace), choisi à la création d'un compte
// e-mail, modifiable dans « Mon compte » ; pseudo automatique (compte Google) proposé à la prochaine ouverture du jeu.
// Le service Supabase est imité (page.route) : aucun appel réseau réel. Les règles de la base (unicité, pseudo automatique,
// classements) sont testées dans la base elle-même (voir la pull request).
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const C = require('../js/compte.js');

const SERVICE = 'https://qxaaqcivtnhikppwmgdh.supabase.co';
const UTILISATEUR = { id: '11111111-2222-3333-4444-555555555555', email: 'joueur@example.com' };
const sessionValide = () => ({ access_token: 'jeton-test', refresh_token: 'renouveau-test', expires_at: Math.floor(Date.now() / 1000) + 3600, user: UTILISATEUR });
const PSEUDO_AUTO = { pseudo: 'FlorianB01', pseudo_auto: true, a_proposer: true };

// Imite le service. pris : pseudos déjà pris (sans tenir compte des majuscules). etat.profil : profil du compte (null = illisible).
async function service(page, { profil = null, pris = ['Lina_Rose'] } = {}) {
  const etat = { profil, changements: [], verifications: [], inscriptions: [] };
  const estPris = (p) => pris.some((x) => x.toLowerCase() === String(p).toLowerCase());
  await page.route(SERVICE + '/**', async (route) => {
    const req = route.request(), url = new URL(req.url()), m = req.method();
    const json = (status, corps) => route.fulfill({ status, contentType: 'application/json', body: corps === undefined ? '' : JSON.stringify(corps) });
    const chemin = url.pathname;
    if (chemin === '/auth/v1/user') return json(200, UTILISATEUR);
    if (chemin === '/auth/v1/signup') { etat.inscriptions.push(req.postDataJSON()); return json(200, { id: 'nouveau', email: req.postDataJSON().email }); }
    if (chemin === '/rest/v1/progression' && m === 'GET') return json(200, []);
    if (chemin === '/rest/v1/progression' && m === 'POST') return json(201);
    if (chemin === '/rest/v1/rpc/mon_profil') return etat.profil ? json(200, etat.profil) : json(404, { message: 'inconnu' });
    if (chemin === '/rest/v1/rpc/pseudo_disponible') {
      const p = req.postDataJSON().p_pseudo; etat.verifications.push(p);
      return json(200, C.verifierPseudo(p) ? 'invalide' : estPris(p) ? 'pris' : 'ok');
    }
    if (chemin === '/rest/v1/rpc/changer_pseudo') {
      const p = req.postDataJSON().p_pseudo; etat.changements.push(p);
      if (C.verifierPseudo(p)) return json(200, { ok: false, raison: 'invalide' });
      if (estPris(p)) return json(200, { ok: false, raison: 'pris' });
      if (etat.profil && etat.profil.pseudo_auto && etat.profil.pseudo.toLowerCase() === p.toLowerCase()) return json(200, { ok: false, raison: 'identique' });
      etat.profil = { pseudo: p, pseudo_auto: false, a_proposer: false };
      return json(200, { ok: true, pseudo: p });
    }
    return json(404, { message: 'inconnu' });
  });
  return etat;
}
async function preparer(page, { session = null } = {}) {
  await page.addInitScript((s) => {
    window.AVENTURA_DELAI_SYNCHRO = 0;
    localStorage.setItem('ludo-vu', '1');
    if (s) localStorage.setItem('ludoaventura-session', JSON.stringify(s));
  }, session);
}
const fenetre = (page) => page.locator('#fenetre-pseudo');
const sansDebordement = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
async function dansLEcran(page, locator) {
  const v = page.viewportSize(), b = await locator.boundingBox();
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.y).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(v.width + 1);
  expect(b.y + b.height).toBeLessThanOrEqual(v.height + 1);
}

test.describe('règles du pseudo', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('4 à 20 caractères : lettres (accents compris), chiffres, - et _, sans espace', () => {
    const ok = ['abcd', 'a'.repeat(20), 'Lina_Rose', 'Élodie-2', 'Cœur_Ñandú', '  Lina_Rose  ', 'FlorianB01'];
    for (const p of ok) expect(C.verifierPseudo(p), p).toBeNull();
    expect(C.verifierPseudo('')).toBe('court');
    expect(C.verifierPseudo('abc')).toBe('court');
    expect(C.verifierPseudo('a'.repeat(21))).toBe('long');
    for (const p of ['Petit Lion', 'ab cd', 'a@bcd', 'abcd!', 'abcd😀', 'abcd.']) expect(C.verifierPseudo(p), p).toBe('caracteres');
  });
});

test('création de compte : le pseudo est contrôlé (4 à 20 caractères, libre) avant l’envoi, puis envoyé avec l’inscription', async ({ page }) => {
  await preparer(page);
  const etat = await service(page);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.getByRole('button', { name: 'Créer un compte' }).click();
  const champ = page.locator('#creation-pseudo');
  await expect(champ).toBeVisible();
  await expect(champ).toHaveAttribute('maxlength', '20');
  await expect(page.getByRole('textbox', { name: /^Pseudo/ })).toBeVisible();
  expect(await sansDebordement(page)).toBe(true);
  await page.locator('#creation-email').fill('nouveau@example.com');
  await page.locator('#creation-mdp').fill('secret123');
  await page.locator('#creation-mdp2').fill('secret123');
  const creer = page.getByRole('button', { name: 'Créer mon compte' });
  const message = page.locator('#compte-message');
  // Trop court, avec espace : refusés sans rien envoyer.
  await creer.click();
  await expect(message).toContainText('au moins 4 caractères');
  await champ.fill('abc'); await creer.click();
  await expect(message).toContainText('au moins 4 caractères');
  await champ.fill('Petit Lion'); await creer.click();
  await expect(message).toContainText('sans espace');
  expect(etat.verifications).toEqual([]);
  expect(etat.inscriptions).toEqual([]);
  // Déjà pris (sans tenir compte des majuscules) : refusé, aucun compte créé.
  await champ.fill('lina_rose'); await creer.click();
  await expect(message).toContainText('déjà pris');
  await expect(champ).toBeFocused();
  expect(etat.inscriptions).toEqual([]);
  // Libre : le pseudo part avec l'inscription.
  await champ.fill('Lina_Fan'); await creer.click();
  await expect(page.getByRole('heading', { name: 'Vérifie tes e-mails' })).toBeVisible();
  expect(etat.inscriptions).toEqual([{ email: 'nouveau@example.com', password: 'secret123', data: { pseudo: 'Lina_Fan' } }]);
  expect(await sansDebordement(page)).toBe(true);
});

test('Mon compte : le pseudo est affiché et se change tout de suite, avec des messages clairs', async ({ page }) => {
  await preparer(page, { session: sessionValide() });
  const etat = await service(page, { profil: { pseudo: 'FlorianB01', pseudo_auto: true, a_proposer: false } });
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await expect(page.locator('#compte-pseudo')).toHaveText('FlorianB01');
  await expect(page.locator('#compte-pseudo-note')).toBeVisible(); // pseudo choisi par le jeu
  await expect(page.locator('#compte-pseudo-form')).toBeHidden();
  await page.getByRole('button', { name: 'Changer mon pseudo' }).click();
  const champ = page.locator('#compte-pseudo-champ');
  await expect(champ).toBeFocused();
  expect(await sansDebordement(page)).toBe(true);
  const enregistrer = page.getByRole('button', { name: 'Enregistrer le pseudo' });
  const probleme = page.locator('#compte-pseudo-message');
  await champ.fill('abc'); await enregistrer.click();
  await expect(probleme).toContainText('au moins 4 caractères');
  await champ.fill('lina_rose'); await enregistrer.click();
  await expect(probleme).toContainText('déjà pris');
  await champ.fill('florianb01'); await enregistrer.click(); // le pseudo automatique retapé n'est pas un changement
  await expect(probleme).toContainText('déjà ton pseudo');
  // Annuler : rien ne change.
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(page.locator('#compte-pseudo-form')).toBeHidden();
  await expect(page.locator('#compte-pseudo')).toHaveText('FlorianB01');
  // Un vrai changement : enregistré dans Supabase, affiché, la note « choisi par le jeu » disparaît.
  await page.getByRole('button', { name: 'Changer mon pseudo' }).click();
  await champ.fill('  Zoé_Aventure '); await enregistrer.click();
  await expect(page.locator('#compte-pseudo')).toHaveText('Zoé_Aventure');
  await expect(page.locator('#compte-pseudo-note')).toBeHidden();
  await expect(page.locator('#compte-message')).toContainText('Zoé_Aventure');
  expect(etat.changements.at(-1)).toBe('Zoé_Aventure');
  expect(await sansDebordement(page)).toBe(true);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => v.id)).toEqual([]);
});

test('pas de pseudo affiché quand il n’est pas lisible ou hors connexion', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'un format suffit');
  await preparer(page, { session: sessionValide() });
  await service(page, { profil: null });
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await expect(page.locator('#compte-connecte')).toBeVisible();
  await expect(page.locator('#compte-pseudo-bloc')).toBeHidden();
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await expect(page.locator('#compte-pseudo-bloc')).toBeHidden();
});

test('pseudo automatique : à la prochaine ouverture, une fenêtre propose d’en choisir un ; « Plus tard » la ferme jusqu’à l’ouverture suivante', async ({ page }) => {
  await preparer(page, { session: sessionValide() });
  await service(page, { profil: PSEUDO_AUTO });
  await page.goto('./');
  await expect(fenetre(page)).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Choisis ton pseudo' })).toBeVisible();
  await expect(page.locator('#fenetre-pseudo-actuel')).toHaveText('FlorianB01');
  await expect(page.locator('#fenetre-pseudo-champ')).toBeFocused();
  // Entièrement dans l'écran, sans défilement, sur les 4 formats.
  await dansLEcran(page, fenetre(page));
  expect(await fenetre(page).evaluate((d) => d.scrollHeight > d.clientHeight + 1 || d.scrollWidth > d.clientWidth + 1)).toBe(false);
  for (const id of ['fenetre-pseudo-champ', 'fenetre-pseudo-ok', 'fenetre-pseudo-plus-tard']) await dansLEcran(page, page.locator('#' + id));
  const r = await new AxeBuilder({ page }).include('#fenetre-pseudo').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations).toEqual([]);
  // « Plus tard » : fermée, et pas de nouvelle demande pendant cette ouverture (rechargement compris)…
  await page.getByRole('button', { name: 'Plus tard' }).click();
  await expect(fenetre(page)).toBeHidden();
  await page.reload();
  await expect(page.locator('#btn-compte')).toHaveClass(/connecte/);
  await page.waitForTimeout(400);
  await expect(fenetre(page)).toBeHidden();
  // … mais elle revient à l'ouverture suivante (nouvelle session du navigateur), tant que le pseudo n'est pas changé.
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(fenetre(page)).toBeVisible();
  await page.keyboard.press('Escape'); // Échap = « Plus tard »
  await expect(fenetre(page)).toBeHidden();
});

test('fenêtre du pseudo : messages clairs, puis le pseudo choisi est enregistré et n’est plus proposé', async ({ page }) => {
  await preparer(page, { session: sessionValide() });
  const etat = await service(page, { profil: PSEUDO_AUTO });
  await page.goto('./');
  await expect(fenetre(page)).toBeVisible();
  const champ = page.locator('#fenetre-pseudo-champ'), ok = page.getByRole('button', { name: 'Choisir ce pseudo' });
  const probleme = page.locator('#fenetre-pseudo-message');
  await champ.fill('Pi'); await ok.click();
  await expect(probleme).toContainText('au moins 4 caractères');
  await expect(fenetre(page)).toBeVisible();
  await dansLEcran(page, fenetre(page));
  await champ.fill('LINA_ROSE'); await ok.click();
  await expect(probleme).toContainText('déjà pris');
  await expect(fenetre(page)).toBeVisible();
  await champ.fill('Capitaine_Flo'); await ok.click();
  await expect(fenetre(page)).toBeHidden();
  expect(etat.changements.at(-1)).toBe('Capitaine_Flo');
  // Plus jamais proposé : la base répond maintenant « pseudo choisi par le joueur ».
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.locator('#btn-compte')).toHaveClass(/connecte/);
  await page.waitForTimeout(400);
  await expect(fenetre(page)).toBeHidden();
  await page.locator('#btn-compte').click();
  await expect(page.locator('#compte-pseudo')).toHaveText('Capitaine_Flo');
});

for (const [nom, profil] of [
  ['compte tout juste créé (moins de 10 minutes), pseudo encore automatique', { pseudo: 'Joueur01', pseudo_auto: true, a_proposer: false }],
  ['pseudo déjà choisi par le joueur', { pseudo: 'Lina_Fan', pseudo_auto: false, a_proposer: false }],
]) {
  test('pas de fenêtre : ' + nom, async ({ page }) => {
    test.skip(test.info().project.name !== 'ordinateur', 'un format suffit');
    await preparer(page, { session: sessionValide() });
    await service(page, { profil });
    await page.goto('./');
    await expect(page.locator('#btn-compte')).toHaveClass(/connecte/);
    await page.waitForTimeout(400);
    await expect(fenetre(page)).toBeHidden();
    await page.locator('#btn-compte').click();
    await expect(page.locator('#compte-pseudo')).toHaveText(profil.pseudo);
    if (profil.pseudo_auto) await expect(page.locator('#compte-pseudo-note')).toBeVisible();
    else await expect(page.locator('#compte-pseudo-note')).toBeHidden();
  });
}
