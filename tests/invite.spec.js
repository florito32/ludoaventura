// Joueur invité (v10.27, demande du 23/11/2026) : « Jouer en invité » crée une connexion anonyme Supabase (sans e-mail),
// pseudo « invité0001 » donné par la base ; à la création du compte ou à la connexion, la progression de l'invité est
// fusionnée dans le compte, puis la ligne invité est supprimée. Le service Supabase est imité (page.route) : aucun appel réel.
// Les règles de la base (numérotation, suppression réservée aux anonymes) sont testées dans la base (voir la pull request).
const { test, expect } = require('@playwright/test');

const SERVICE = 'https://qxaaqcivtnhikppwmgdh.supabase.co';
const INVITE = { id: 'aaaaaaaa-0000-0000-0000-000000000001', email: null, is_anonymous: true };
const COMPTE = { id: '11111111-2222-3333-4444-555555555555', email: 'joueur@example.com', is_anonymous: false };
const dans1h = () => Math.floor(Date.now() / 1000) + 3600;
// Réponse du service (utilisateur au format Supabase : is_anonymous) et session enregistrée par le jeu (anonyme).
const sessionDe = (u, jeton) => ({ access_token: jeton, refresh_token: 'renouveau-' + jeton, expires_at: dans1h(), user: u });
const sessionGardee = (u, jeton) => ({ ...sessionDe(u, jeton), user: { id: u.id, email: u.email, anonyme: !!u.is_anonymous } });

// Imite le service. distant : progression déjà dans le compte « joueur@example.com ». echecProgression : l'envoi échoue.
async function service(page, { distant = null, echecProgression = false } = {}) {
  const e = { signups: [], progression: [], suppressions: [], ordre: [] };
  await page.route(SERVICE + '/**', async (route) => {
    const req = route.request(), url = new URL(req.url()), m = req.method();
    const json = (status, corps) => route.fulfill({ status, contentType: 'application/json', body: corps === undefined ? '' : JSON.stringify(corps) });
    const chemin = url.pathname, auth = req.headers().authorization || '';
    if (chemin === '/auth/v1/signup') { e.signups.push(req.postDataJSON()); return json(200, { ...sessionDe(INVITE, 'jeton-invite'), token_type: 'bearer' }); }
    if (chemin === '/auth/v1/token' && url.searchParams.get('grant_type') === 'password') return json(200, sessionDe(COMPTE, 'jeton-compte'));
    if (chemin === '/auth/v1/user') return json(200, auth.includes('jeton-invite') ? INVITE : COMPTE);
    if (chemin === '/rest/v1/rpc/mon_profil') {
      return auth.includes('jeton-invite')
        ? json(200, { pseudo: 'invité0001', pseudo_auto: true, a_proposer: false, invite: true })
        : json(200, { pseudo: 'Florito', pseudo_auto: false, a_proposer: false, invite: false });
    }
    if (chemin === '/rest/v1/progression' && m === 'GET') {
      const compte = auth.includes('jeton-compte');
      return json(200, compte && distant ? [{ donnees: distant }] : []);
    }
    if (chemin === '/rest/v1/progression' && m === 'POST') {
      if (echecProgression && auth.includes('jeton-compte')) return json(500, { message: 'panne' });
      const d = req.postDataJSON(); d.jeton = auth; e.progression.push(d); e.ordre.push('progression:' + d.user_id); return json(201);
    }
    if (chemin === '/rest/v1/rpc/supprimer_invite') { e.suppressions.push(auth); e.ordre.push('suppression'); return json(200, true); }
    return json(404, { message: 'inconnu' });
  });
  return e;
}
async function preparer(page, { session = null, local = null } = {}) {
  await page.addInitScript(([s, l]) => {
    window.AVENTURA_FENETRE_COMPTE = true; // les tests ne voient la fenêtre que s'ils la demandent
    window.AVENTURA_DELAI_SYNCHRO = 0;
    localStorage.setItem('ludo-vu', '1');
    if (s && !localStorage.getItem('ludoaventura-session')) localStorage.setItem('ludoaventura-session', JSON.stringify(s));
    if (l && !localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify(l));
  }, [session, local]);
}
const fenetre = (page) => page.locator('#fenetre-compte');
const sansDebordement = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const progression = (total) => ({ v: 1, total, gemmes: 0, parJour: {}, journal: [] });

test('« Jouer en invité » crée une connexion anonyme (sans e-mail) et sauvegarde la progression @smoke', async ({ page }) => {
  await preparer(page, { local: progression(12) });
  const e = await service(page);
  await page.goto('./');
  await fenetre(page).getByRole('button', { name: 'Jouer en invité' }).click();
  await expect(fenetre(page)).toBeHidden();
  await expect.poll(() => e.signups.length).toBe(1);
  expect(e.signups[0].email).toBeUndefined(); // aucune adresse e-mail envoyée : c'est ce qui rend l'invité « anonyme »
  expect(e.signups[0].password).toBeUndefined();
  await expect.poll(() => e.progression.length).toBeGreaterThan(0);
  expect(e.progression.at(-1).user_id).toBe(INVITE.id);
  expect(e.progression.at(-1).donnees.total).toBe(12);
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-session')));
  expect(s.user.anonyme).toBe(true);
  expect(s.user.email == null).toBe(true);
  // Un invité n'est pas « connecté » : la pastille reste « Se connecter ».
  await expect(page.locator('#btn-compte')).not.toHaveClass(/connecte/);
});

test('l’invité garde sa connexion : pas de nouvel invité à la réouverture, la fenêtre revient', async ({ page }) => {
  await preparer(page, { session: sessionGardee(INVITE, 'jeton-invite') });
  const e = await service(page);
  await page.goto('./');
  await expect(fenetre(page)).toBeVisible(); // pas de vrai compte : la fenêtre revient à chaque ouverture
  await fenetre(page).getByRole('button', { name: 'Jouer en invité' }).click();
  await expect(fenetre(page)).toBeHidden();
  await page.waitForTimeout(300);
  expect(e.signups).toHaveLength(0);
});

test('« Mon compte » rappelle le pseudo d’invité, sans débordement', async ({ page }) => {
  await preparer(page, { session: sessionGardee(INVITE, 'jeton-invite') });
  await service(page);
  await page.goto('./');
  await fenetre(page).getByRole('button', { name: 'Jouer en invité' }).click();
  await page.locator('#btn-parametres').click();
  await expect(page.locator('#compte-invite-nom')).toBeVisible();
  await expect(page.locator('#compte-invite-pseudo')).toHaveText('invité0001');
  await expect(page.locator('#compte-pseudo-bloc')).toBeHidden(); // pas de changement de pseudo pour un invité
  expect(await sansDebordement(page)).toBe(true);
});

test('l’invité qui se connecte retrouve sa progression dans le compte, puis la ligne invité est supprimée', async ({ page }) => {
  await preparer(page, { session: sessionGardee(INVITE, 'jeton-invite'), local: progression(20) });
  const e = await service(page, { distant: progression(50) });
  await page.goto('./');
  await fenetre(page).getByRole('button', { name: 'Se connecter' }).click();
  await page.locator('#compte-email').fill('joueur@example.com');
  await page.locator('#compte-mdp').fill('secret123');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#compte-qui')).toHaveText('joueur@example.com');
  await expect.poll(() => e.suppressions.length).toBe(1);
  // Étoiles de l'invité (20) + celles du compte (50) : rien de perdu.
  const envoi = e.progression.filter((p) => p.user_id === COMPTE.id).at(-1);
  expect(envoi.donnees.total).toBe(70);
  // La suppression a lieu APRÈS l'envoi au compte, avec le jeton de l'invité.
  expect(e.ordre.indexOf('suppression')).toBeGreaterThan(e.ordre.indexOf('progression:' + COMPTE.id));
  expect(e.suppressions[0]).toContain('jeton-invite');
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-session')));
  expect(s.user.email).toBe('joueur@example.com');
  expect(s.user.anonyme).toBe(false);
  await expect(page.locator('#btn-compte')).toHaveClass(/connecte/);
});

test('si l’envoi au compte échoue, l’invité n’est pas supprimé (rien n’est perdu)', async ({ page }) => {
  await preparer(page, { session: sessionGardee(INVITE, 'jeton-invite'), local: progression(20) });
  const e = await service(page, { echecProgression: true });
  await page.goto('./');
  await fenetre(page).getByRole('button', { name: 'Se connecter' }).click();
  await page.locator('#compte-email').fill('joueur@example.com');
  await page.locator('#compte-mdp').fill('secret123');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.locator('#compte-qui')).toHaveText('joueur@example.com');
  await page.waitForTimeout(500);
  expect(e.suppressions).toHaveLength(0);
});

test('un vrai compte déjà connecté : aucun invité créé, aucune fenêtre', async ({ page }) => {
  await preparer(page, { session: sessionGardee(COMPTE, 'jeton-compte') });
  const e = await service(page);
  await page.goto('./');
  await page.waitForTimeout(400);
  await expect(fenetre(page)).toBeHidden();
  expect(e.signups).toHaveLength(0);
  expect(e.suppressions).toHaveLength(0);
});
