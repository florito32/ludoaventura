// Compte en ligne et sauvegarde de la progression (v9.4, backlog lignes 346 à 349).
// Le service Supabase est imité (page.route) : aucun appel réseau réel pendant les tests.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const C = require('../js/compte.js');

const SERVICE = 'https://qxaaqcivtnhikppwmgdh.supabase.co';
const UTILISATEUR = { id: '11111111-2222-3333-4444-555555555555', email: 'joueur@example.com' };
const SESSION = { access_token: 'jeton-test', refresh_token: 'renouveau-test', expires_in: 3600, token_type: 'bearer', user: UTILISATEUR };
function progression(total, gemmes = 0) {
  return { v: 1, total, gemmes, journal: [], parJour: {}, coffresJour: {}, coffresNiveau: {}, coffresMega: {}, visites: [], defis: {}, parties: [], simplesDepuis: 1, defisEnCours: {}, defisQuittes: {} };
}

// Imite le service : connexion, utilisateur, lecture et écriture de la progression. Renvoie les envois reçus.
async function service(page, { distant = null, connexion = SESSION, erreurConnexion = null } = {}) {
  const envois = { progression: [], deconnexion: 0, inscription: [], oubli: [] };
  await page.route(SERVICE + '/**', async (route) => {
    const req = route.request(), url = new URL(req.url()), m = req.method();
    const json = (status, corps) => route.fulfill({ status, contentType: 'application/json', body: corps === undefined ? '' : JSON.stringify(corps) });
    if (url.pathname === '/auth/v1/token') {
      if (erreurConnexion) return json(400, erreurConnexion);
      return json(200, connexion);
    }
    if (url.pathname === '/auth/v1/user') return json(200, UTILISATEUR);
    if (url.pathname === '/auth/v1/signup') { envois.inscription.push(req.postDataJSON()); return json(200, { id: 'nouveau', email: req.postDataJSON().email }); }
    if (url.pathname === '/auth/v1/recover') { envois.oubli.push(req.postDataJSON()); return json(200, {}); }
    if (url.pathname === '/auth/v1/logout') { envois.deconnexion++; return json(204); }
    if (url.pathname === '/rest/v1/progression' && m === 'GET') return json(200, distant ? [{ donnees: distant }] : []);
    if (url.pathname === '/rest/v1/progression' && m === 'POST') { const d = req.postDataJSON(); envois.progression.push(d); distant = d.donnees; return json(201); }
    return json(404, { message: 'inconnu' });
  });
  return envois;
}
// Premier démarrage passé (Ludo ne se présente pas), progression de l'appareil et session éventuelles.
async function preparer(page, { local = null, session = null, base = null } = {}) {
  await page.addInitScript(([l, s, b]) => {
    window.AVENTURA_DELAI_SYNCHRO = 0;
    if (sessionStorage.getItem('test-prepare')) return; // une seule fois : les rechargements gardent l'état
    sessionStorage.setItem('test-prepare', '1');
    localStorage.setItem('ludo-vu', '1');
    if (l) localStorage.setItem('ludoaventura-etoiles', JSON.stringify(l));
    if (s) localStorage.setItem('ludoaventura-session', JSON.stringify(s));
    if (b) localStorage.setItem('ludoaventura-compte', JSON.stringify(b));
  }, [local, session, base]);
}
const sessionValide = () => ({ access_token: 'jeton-test', refresh_token: 'renouveau-test', expires_at: Math.floor(Date.now() / 1000) + 3600, user: UTILISATEUR });

test.describe('fusion des progressions', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('1re connexion : les étoiles et pierres de l’appareil s’ajoutent à celles du compte', () => {
    const local = { ...progression(20, 1), journal: [{ quand: '2026-11-16T10:00:00Z', type: 'partie', n: 20 }], coffresJour: { '2026-11-16': 10 }, visites: ['2026-11-16'], parties: ['a'] };
    const distant = { ...progression(50, 2), journal: [{ quand: '2026-11-15T10:00:00Z', type: 'partie', n: 50 }], coffresNiveau: { 2: 12 }, visites: ['2026-11-15'], parties: ['b'] };
    const r = C.fusionner(local, distant, { total: 0, gemmes: 0 });
    expect(r.total).toBe(70);
    expect(r.gemmes).toBe(3);
    expect(r.journal.map((g) => g.n)).toEqual([20, 50]); // du plus récent au plus ancien
    expect(r.coffresJour).toEqual({ '2026-11-16': 10 });
    expect(r.coffresNiveau).toEqual({ 2: 12 });
    expect(r.visites).toEqual(['2026-11-15', '2026-11-16']);
    expect(r.parties.sort()).toEqual(['a', 'b']);
  });

  test('rien n’est compté deux fois : seules les étoiles gagnées depuis le dernier envoi s’ajoutent', () => {
    const compte = progression(70, 3);
    // Cet appareil a déjà envoyé 70 ⭐ et gagne 5 ⭐ ; un autre appareil a entre-temps porté le compte à 80 ⭐.
    const r = C.fusionner(progression(75, 3), { ...compte, total: 80 }, { total: 70, gemmes: 3 });
    expect(r.total).toBe(85);
    expect(r.gemmes).toBe(3);
    const journal = [{ quand: '2026-11-16T10:00:00Z', type: 'partie', n: 5 }];
    expect(C.fusionner({ ...progression(5), journal }, { ...progression(5), journal }, { total: 5 }).journal).toHaveLength(1);
  });

  test('compte vide ou appareil vide : on garde l’autre', () => {
    expect(C.fusionner(progression(12), null, {}).total).toBe(12);
    expect(C.fusionner(null, progression(40), {}).total).toBe(40);
  });
});

test('accueil : bouton « Se connecter », écran Mon compte, retour en invité, sans débordement ni défaut d’accessibilité', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await preparer(page);
  await page.goto('./');
  const bouton = page.locator('#btn-compte');
  await expect(bouton).toBeVisible();
  await expect(bouton).toHaveAccessibleName(/Se connecter/);
  // La barre du haut tient dans l'écran.
  const larg = page.viewportSize().width;
  for (const id of ['btn-etoiles-haut', 'btn-coffre-haut', 'btn-compte']) {
    const b = await page.locator('#' + id).boundingBox();
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(larg + 1);
  }
  await bouton.click();
  await expect(page.getByRole('heading', { name: 'Mon compte' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuer avec Google' })).toBeVisible();
  await expect(page.getByLabel('Adresse e-mail')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => v.id + ' : ' + v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | '))).toEqual([]);
  await page.getByRole('button', { name: 'Jouer en invité' }).click();
  await expect(page.locator('#ecran-accueil')).toBeVisible();
});

test('connexion par e-mail : la progression de l’appareil est ajoutée à celle du compte et envoyée', async ({ page }) => {
  await preparer(page, { local: progression(20, 1) });
  const envois = await service(page, { distant: progression(50, 2) });
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.getByLabel('Adresse e-mail').fill('joueur@example.com');
  await page.getByLabel(/^Mot de passe/).fill('secret123');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#compte-message')).toContainText('Tu es connecté');
  await expect(page.locator('#compte-qui')).toHaveText('joueur@example.com');
  await expect(page.locator('#compte-etat')).toContainText('Progression sauvegardée');
  expect(envois.progression.at(-1).user_id).toBe(UTILISATEUR.id);
  expect(envois.progression.at(-1).donnees.total).toBe(70);
  expect(envois.progression.at(-1).donnees.gemmes).toBe(3);
  await page.locator('#ecran-compte [data-retour-accueil]').click();
  await expect(page.locator('#accueil-total')).toHaveText('70');
  await expect(page.locator('#btn-compte')).toHaveClass(/connecte/);
  // Le mot de passe n'est gardé nulle part sur l'appareil.
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('secret123');
});

test('connexion refusée : message clair en français', async ({ page }) => {
  await preparer(page);
  await service(page, { erreurConnexion: { error_code: 'invalid_credentials', msg: 'Invalid login credentials' } });
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.getByLabel('Adresse e-mail').fill('joueur@example.com');
  await page.getByLabel(/^Mot de passe/).fill('mauvais1');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#compte-message')).toHaveText('Adresse e-mail ou mot de passe incorrect.');
  await expect(page.locator('#compte-invite')).toBeVisible();
});

test('création de compte et mot de passe oublié : e-mail envoyé, explication affichée', async ({ page }) => {
  test.skip(test.info().project.name === 'telephone-carre', 'parcours de formulaire testé sur les autres formats');
  await preparer(page);
  const envois = await service(page);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.getByLabel('Adresse e-mail').fill('nouveau@example.com');
  await page.getByRole('button', { name: 'Créer un compte' }).click();
  await expect(page.locator('#compte-message')).toContainText('mot de passe'); // mot de passe manquant
  await page.getByLabel(/^Mot de passe/).fill('secret123');
  await page.getByRole('button', { name: 'Créer un compte' }).click();
  await expect(page.locator('#compte-message')).toContainText('Presque fini');
  expect(envois.inscription).toEqual([{ email: 'nouveau@example.com', password: 'secret123' }]);
  await page.getByRole('button', { name: 'Mot de passe oublié ?' }).click();
  await expect(page.locator('#compte-message')).toContainText('un e-mail vient de partir');
  expect(envois.oubli).toEqual([{ email: 'nouveau@example.com' }]);
});

test('retour de Google : connecté, jetons retirés de l’adresse, progression récupérée', async ({ page }) => {
  await preparer(page);
  const envois = await service(page, { distant: progression(120, 4) });
  await page.goto('./#access_token=jeton-google&refresh_token=r&expires_in=3600&token_type=bearer');
  await expect(page.getByRole('heading', { name: 'Mon compte' })).toBeVisible();
  await expect(page.locator('#compte-qui')).toHaveText('joueur@example.com');
  expect(page.url()).not.toContain('access_token');
  await expect(page.locator('#compte-etat')).toContainText('Progression sauvegardée');
  expect(envois.progression.at(-1).donnees.total).toBe(120);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')).total)).toBe(120);
});

test('lien expiré reçu par e-mail : message d’erreur', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'un format suffit');
  await preparer(page);
  await service(page);
  await page.goto('./#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid');
  await expect(page.locator('#compte-message')).toContainText('expiré');
});

test('connecté : chaque gain est envoyé au compte, et la déconnexion remet l’appareil en invité', async ({ page }) => {
  // Appareil déjà synchronisé (base = 30 ⭐ déjà envoyées) : rien n'est ajouté deux fois à l'ouverture.
  await preparer(page, { local: progression(30), session: sessionValide(), base: { uid: UTILISATEUR.id, total: 30, gemmes: 0 } });
  const envois = await service(page, { distant: progression(30) });
  await page.goto('./');
  await expect(page.locator('#btn-compte')).toHaveClass(/connecte/);
  await expect.poll(() => envois.progression.length).toBeGreaterThan(0); // synchro à l'ouverture
  expect(envois.progression[0].donnees.total).toBe(30);
  await page.evaluate(() => window.Recompenses.compte.gagner(5, 'partie', 'test'));
  await expect.poll(() => envois.progression.at(-1).donnees.total).toBe(35);
  await page.locator('#btn-compte').click();
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await expect(page.locator('#compte-message')).toContainText('Tu es déconnecté');
  expect(envois.deconnexion).toBe(1);
  await expect(page.locator('#compte-invite')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('ludoaventura-session'))).toBeNull();
  await page.getByRole('button', { name: 'Jouer en invité' }).click();
  await expect(page.locator('#accueil-total')).toHaveText('0');
});
