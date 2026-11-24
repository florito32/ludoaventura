// Joueurs d'un compte (v10.26, demande du 23/11/2026, backlog lignes 438 à 449).
// Règles : sous-matière sur 100, matière = moyenne, niveau par tranches de 10 (0-9 → 1 … 100 → 10), tout le monde part à 0.
// Vue « Mon compte » : proposition A (une colonne de cartes, jauges en barre). Le service Supabase est imité (aucun appel réel).
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const J = require('../js/joueurs.js');
const C = require('../js/compte.js');

const SERVICE = 'https://qxaaqcivtnhikppwmgdh.supabase.co';
const UTILISATEUR = { id: '11111111-2222-3333-4444-555555555555', email: 'joueur@example.com' };

// ---------- Règles (logique pure) ----------
test('niveau : 0 à 9 → 1, 10 à 19 → 2 … 90 à 100 → 10 (maximum) @smoke', () => {
  expect([0, 9, 9.9].map(J.niveauDe)).toEqual([1, 1, 1]);
  expect([10, 19, 20].map(J.niveauDe)).toEqual([2, 2, 3]);
  expect([89, 90, 99, 100].map(J.niveauDe)).toEqual([9, 10, 10, 10]);
});

test('matière = moyenne de ses sous-matières ; un nouveau joueur est à 0 partout', () => {
  const etat = { joueurs: [] };
  const { joueur } = J.creer(etat, 'Léa', 'lea');
  for (const m of J.MATIERES) {
    expect(J.scoreMatiere(joueur, m.id)).toBe(0);
    expect(J.niveauMatiere(joueur, m.id)).toBe(1);
    for (const s of m.subs) expect(J.score(joueur, m.id, s.id)).toBe(0);
  }
  expect(J.niveauGlobal(joueur)).toBe(1);
  // Maths : calcul 60, problèmes 25 → moyenne 42,5 → niveau 5.
  J.ajouterPoints(etat, joueur.id, 'maths', 'calcul', 60);
  J.ajouterPoints(etat, joueur.id, 'maths', 'probleme', 25);
  expect(J.scoreMatiere(joueur, 'maths')).toBe(42.5);
  expect(J.niveauMatiere(joueur, 'maths')).toBe(5);
  // Une sous-matière ne dépasse jamais 100.
  expect(J.ajouterPoints(etat, joueur.id, 'maths', 'calcul', 500)).toBe(100);
  expect(J.ajouterPoints(etat, joueur.id, 'maths', 'inconnue', 1)).toBe(-1);
});

test('les sous-matières : Français 3 (v10.44 : plus de phonèmes), Maths 2, Histoire = 7 périodes, Géographie = 4 jeux', () => {
  expect(J.MATIERES.map((m) => m.subs.length)).toEqual([3, 2, 7, 4]);
  expect(J.toutesLesCles()).toHaveLength(16);
});

test('noms : vide, trop long, interdit, déjà pris (majuscules et accents ignorés)', () => {
  const etat = { joueurs: [] };
  J.creer(etat, 'Zoé', 'zoe');
  expect(J.verifierNom('   ', etat.joueurs)).toBe('vide');
  expect(J.verifierNom('x'.repeat(21), etat.joueurs)).toBe('long');
  expect(J.verifierNom('<b>', etat.joueurs)).toBe('interdit');
  expect(J.verifierNom('zoe', etat.joueurs)).toBe('pris');
  expect(J.verifierNom('ZOÉ', etat.joueurs)).toBe('pris');
  expect(J.verifierNom('Zoé', etat.joueurs, etat.joueurs[0].id)).toBe(''); // garder son propre nom
  expect(J.creer(etat, 'Zoé', 'zoe').erreur).toBe('pris');
  expect(J.verifierNom('Tom', etat.joueurs)).toBe('');
});

test('pas de limite : 30 joueurs créés ; le 1er joueur a un identifiant fixe', () => {
  const etat = { joueurs: [] };
  expect(J.assurerPremier(etat)).toBe(true);
  expect(etat.joueurs[0].id).toBe(J.ID_PREMIER);
  expect(J.assurerPremier(etat)).toBe(false);
  for (let i = 2; i <= 30; i++) expect(J.creer(etat, 'Joueur ' + i, 'tom').erreur).toBeUndefined();
  expect(etat.joueurs).toHaveLength(30);
  expect(new Set(etat.joueurs.map((j) => j.id)).size).toBe(30);
});

test('changer de nom et de personnage met à jour le joueur', () => {
  const etat = { joueurs: [] };
  const { joueur } = J.creer(etat, 'Tom', 'tom', new Date('2026-11-23T08:00:00Z'));
  expect(J.renommer(etat, joueur.id, 'Tom le fort', new Date('2026-11-23T09:00:00Z')).joueur.nom).toBe('Tom le fort');
  expect(J.changerPerso(etat, joueur.id, 'awa').joueur.perso).toBe('awa');
  expect(joueur.maj > joueur.cree).toBe(true);
});

test('fusion : même joueur = nom le plus récent et niveaux les plus hauts ; les autres sont gardés', () => {
  const a = [{ id: 'j-1', nom: 'Ancien', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-02T00:00:00Z', niv: { 'maths.calcul': 40, 'francais.grammaire': 5 } },
    { id: 'jA', nom: 'Seul-ici', perso: 'tom', cree: '2026-11-03T00:00:00Z', maj: '2026-11-03T00:00:00Z', niv: {} }];
  const b = [{ id: 'j-1', nom: 'Récent', perso: 'awa', cree: '2026-11-01T00:00:00Z', maj: '2026-11-10T00:00:00Z', niv: { 'maths.calcul': 30, 'francais.grammaire': 12 } },
    { id: 'jB', nom: 'Seul-ici', perso: 'sam', cree: '2026-11-04T00:00:00Z', maj: '2026-11-04T00:00:00Z', niv: {} }];
  const r = J.fusionner(a, b);
  const premier = r.find((j) => j.id === 'j-1');
  expect(premier.nom).toBe('Récent');
  expect(premier.perso).toBe('awa');
  expect(premier.niv).toEqual({ 'maths.calcul': 40, 'francais.grammaire': 12 });
  expect(r).toHaveLength(3);
  // Deux joueurs différents au même nom : départagés.
  expect(r.filter((j) => j.id !== 'j-1').map((j) => j.nom).sort()).toEqual(['Seul-ici', 'Seul-ici (2)']);
});

test('la fusion du compte (js/compte.js) emporte les joueurs des deux côtés', () => {
  const local = { v: 1, total: 10, gemmes: 0, joueurs: [{ id: 'j-1', nom: 'Local', perso: 'lea', maj: '2026-11-05T00:00:00Z', niv: { 'maths.calcul': 7 } }] };
  const distant = { v: 1, total: 50, gemmes: 0, joueurs: [{ id: 'j-1', nom: 'Distant', perso: 'tom', maj: '2026-11-01T00:00:00Z', niv: { 'maths.calcul': 3 } }, { id: 'jD', nom: 'Nour', perso: 'nour', maj: '2026-11-01T00:00:00Z', niv: {} }] };
  const r = C.fusionner(local, distant, { total: 0, gemmes: 0 });
  expect(r.joueurs.map((j) => j.id).sort()).toEqual(['j-1', 'jD']);
  expect(r.joueurs.find((j) => j.id === 'j-1')).toMatchObject({ nom: 'Local', perso: 'lea', niv: { 'maths.calcul': 7 } });
  // Compte encore vide : l'appareil garde ses joueurs.
  expect(C.fusionner(local, null, {}).joueurs).toHaveLength(1);
});

// ---------- Écran « Mon compte » ----------
async function preparer(page, { etat = null, session = null } = {}) {
  await page.addInitScript(([e, s]) => {
    window.AVENTURA_DELAI_SYNCHRO = 0;
    try {
      localStorage.setItem('ludo-vu', '1');
      if (e && !localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify(e));
      if (s) localStorage.setItem('ludoaventura-session', JSON.stringify(s));
    } catch (x) { /* */ }
  }, [etat, session]);
}
async function ouvrirCompte(page) {
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await expect(page.locator('#ecran-compte')).toBeVisible();
  await page.locator('#onglet-profil').click(); // v10.32 : « Profil et joueurs » (pas connecté, on arrive sur « Connexion »)
}
// v10.32 : les jauges et les chiffres sont dans « Statistiques », qui se déroule sous le nom du joueur.
async function ouvrirStats(c) {
  await c.getByRole('button', { name: 'Statistiques' }).click();
  await expect(c.locator('.joueur-stats')).toBeVisible();
}
const sansDebordement = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const joueursStockes = (page) => page.evaluate(() => (JSON.parse(localStorage.getItem('ludoaventura-etoiles') || '{}').joueurs) || []);
const carte = (page, nom) => page.locator('.joueur-carte', { has: page.getByRole('heading', { name: nom, exact: true }) });

test('sans compte : « Joueur 1 » existe déjà, avec 4 jauges à 0 (niveau 1) @smoke', async ({ page }) => {
  await preparer(page);
  await ouvrirCompte(page);
  const c = carte(page, 'Joueur 1');
  await expect(c).toBeVisible();
  await expect(page.locator('#joueurs-compte')).toHaveText('1 joueur');
  await expect(c.locator('.joueur-stats')).toBeHidden(); // fermées au départ
  await ouvrirStats(c);
  const jauges = c.locator('.joueur-jauges [role="meter"]');
  await expect(jauges).toHaveCount(4);
  for (const nom of ['Français', 'Maths', 'Histoire', 'Géographie']) {
    await expect(c.getByRole('meter', { name: nom })).toHaveAttribute('aria-valuenow', '0');
  }
  await expect(c.locator('.joueur-jauges .jm-val')).toHaveText(['Niv. 1 · 0', 'Niv. 1 · 0', 'Niv. 1 · 0', 'Niv. 1 · 0']);
  expect(await sansDebordement(page)).toBe(true);
});

test('les jauges montrent la moyenne des sous-matières ; les sous-matières restent invisibles', async ({ page }) => {
  await preparer(page, { etat: { v: 1, total: 0, joueurs: [{ id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z',
    niv: { 'maths.calcul': 60, 'maths.probleme': 25, 'francais.orthographe': 100, 'francais.conjugaison': 100, 'francais.grammaire': 100 } }] } });
  await ouvrirCompte(page);
  const c = carte(page, 'Léa');
  await ouvrirStats(c);
  await expect(c.getByRole('meter', { name: 'Maths' })).toHaveAttribute('aria-valuenow', '42.5');
  await expect(c.getByRole('meter', { name: 'Maths' })).toHaveAttribute('aria-valuetext', 'niveau 5, 42.5 sur 100');
  await expect(c.getByRole('meter', { name: 'Français' })).toHaveAttribute('aria-valuetext', 'niveau 10, 100 sur 100');
  await expect(c.locator('.jm').filter({ hasText: 'Maths' }).first().locator('.jm-val')).toHaveText('Niv. 5 · 42');
  // Niveau moyen : (100 + 42,5 + 0 + 0) / 4 = 35,6 → niveau 4.
  await expect(c.locator('.joueur-niv')).toHaveText('Niv. 4');
  // v10.27 : les sous-matières restent enregistrées mais ne se voient pas (demande du 23/11/2026, 10 h 19).
  await expect(c.locator('.joueur-details, details, summary')).toHaveCount(0);
  await expect(c.locator('.jm')).toHaveCount(4);
  await expect(c.getByText(/Calcul mental|Préhistoire|Nature|Orthographe/)).toHaveCount(0);
  expect(await sansDebordement(page)).toBe(true);
});

test('créer un joueur : nom et personnage, sans limite, gardés après rechargement @smoke', async ({ page }) => {
  await preparer(page);
  await ouvrirCompte(page);
  await page.getByRole('button', { name: 'Créer un joueur' }).click();
  const champ = page.getByLabel(/Nom du joueur/);
  await expect(champ).toBeFocused();
  await page.getByRole('button', { name: /^Tom,/ }).click();
  await page.getByLabel(/Nom du joueur/).fill('Tom');
  await page.getByRole('button', { name: 'Créer le joueur' }).click();
  await expect(carte(page, 'Tom')).toBeVisible();
  await expect(page.locator('#joueurs-compte')).toHaveText('2 joueurs');
  // Un 3e et un 4e, sans limite.
  for (const n of ['Nour', 'Inès']) {
    await page.getByRole('button', { name: 'Créer un joueur' }).click();
    await page.getByLabel(/Nom du joueur/).fill(n);
    await page.getByRole('button', { name: 'Créer le joueur' }).click();
  }
  await expect(page.locator('#joueurs-compte')).toHaveText('4 joueurs');
  const stockes = await joueursStockes(page);
  expect(stockes.map((j) => j.nom)).toEqual(['Joueur 1', 'Tom', 'Nour', 'Inès']);
  expect(stockes[1].perso).toBe('tom');
  expect(Object.keys(stockes[1].niv)).toHaveLength(0); // tout à 0
  await page.reload();
  // Le jeu rouvre l'écran où l'on était : on ne clique sur l'icône du compte que si elle est là.
  if (!(await page.locator('#ecran-compte').isVisible())) await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  await expect(carte(page, 'Tom')).toBeVisible();
  await expect(carte(page, 'Tom').locator('.joueur-avatar')).toHaveAttribute('src', /aventuriers\/tom\.webp/);
  expect(await sansDebordement(page)).toBe(true);
});

test('créer : nom vide ou déjà pris = message clair, rien n’est créé', async ({ page }) => {
  await preparer(page);
  await ouvrirCompte(page);
  await page.getByRole('button', { name: 'Créer un joueur' }).click();
  await page.getByRole('button', { name: 'Créer le joueur' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Écris un nom' })).toBeVisible();
  await page.getByLabel(/Nom du joueur/).fill('joueur 1');
  await page.getByRole('button', { name: 'Créer le joueur' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'porte déjà ce nom' })).toBeVisible();
  expect(await joueursStockes(page)).toHaveLength(1);
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(page.getByRole('button', { name: 'Créer un joueur' })).toBeVisible();
});

test('crayon : page de modification (nom et personnage), enregistrés et gardés @smoke', async ({ page }) => {
  await preparer(page);
  await ouvrirCompte(page);
  let c = carte(page, 'Joueur 1');
  await c.getByRole('button', { name: 'Modifier le joueur Joueur 1' }).click(); // v10.32 : icône à côté du nom
  await expect(page.getByRole('heading', { name: 'Modifier le joueur' })).toBeVisible();
  await expect(page.getByLabel(/Nom du joueur/)).toBeFocused();
  await page.getByLabel(/Nom du joueur/).fill('Capitaine Léa');
  await page.getByRole('button', { name: /^Awa,/ }).click();
  await expect(page.getByRole('button', { name: /^Awa,/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel(/Nom du joueur/)).toHaveValue('Capitaine Léa'); // le nom tapé est gardé en choisissant un personnage
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  c = carte(page, 'Capitaine Léa');
  await expect(c).toBeVisible();
  await expect(c.locator('.joueur-avatar')).toHaveAttribute('src', /aventuriers\/awa\.webp/);
  await expect(c.getByRole('button', { name: 'Modifier le joueur Capitaine Léa' })).toBeFocused();
  const [j] = await joueursStockes(page);
  expect(j).toMatchObject({ id: 'j-1', nom: 'Capitaine Léa', perso: 'awa' });
  expect(await sansDebordement(page)).toBe(true);
});

test('crayon : nom déjà pris = message, Annuler ne change rien', async ({ page }) => {
  await preparer(page, { etat: { v: 1, total: 0, joueurs: [
    { id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: {} },
    { id: 'j2', nom: 'Tom', perso: 'tom', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: {} }] } });
  await ouvrirCompte(page);
  await carte(page, 'Léa').getByRole('button', { name: 'Modifier le joueur Léa' }).click();
  await page.getByLabel(/Nom du joueur/).fill('tom');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'porte déjà ce nom' })).toBeVisible();
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(carte(page, 'Léa')).toBeVisible();
  expect((await joueursStockes(page)).map((j) => j.nom)).toEqual(['Léa', 'Tom']);
});

test('connecté : les joueurs du compte arrivent à la connexion et partent vers le compte', async ({ page }) => {
  const envois = [];
  const distant = { v: 1, total: 0, gemmes: 0, journal: [], parJour: {}, coffresJour: {}, coffresNiveau: {}, coffresMega: {}, visites: [], defis: {}, parties: [],
    joueurs: [{ id: 'jD', nom: 'Nour', perso: 'nour', cree: '2026-11-20T00:00:00Z', maj: '2026-11-20T00:00:00Z', niv: { 'geographie.monde': 80 } }] };
  await page.route(SERVICE + '/**', async (route) => {
    const req = route.request(), chemin = new URL(req.url()).pathname, m = req.method();
    const json = (status, corps) => route.fulfill({ status, contentType: 'application/json', body: corps === undefined ? '' : JSON.stringify(corps) });
    if (chemin === '/auth/v1/user') return json(200, UTILISATEUR);
    if (chemin === '/rest/v1/progression' && m === 'GET') return json(200, [{ donnees: distant }]);
    if (chemin === '/rest/v1/progression' && m === 'POST') { envois.push(req.postDataJSON()); return json(201); }
    return json(404, { message: 'inconnu' });
  });
  await preparer(page, { session: { access_token: 'jeton-test', refresh_token: 'renouveau-test', expires_at: Math.floor(Date.now() / 1000) + 3600, user: UTILISATEUR } });
  await ouvrirCompte(page);
  await expect(carte(page, 'Nour')).toBeVisible();
  await expect(carte(page, 'Joueur 1')).toBeVisible();
  await ouvrirStats(carte(page, 'Nour'));
  await expect(carte(page, 'Nour').getByRole('meter', { name: 'Géographie' })).toHaveAttribute('aria-valuenow', '20');
  await expect.poll(() => envois.length).toBeGreaterThan(0);
  const dernier = envois[envois.length - 1];
  expect(dernier.donnees.joueurs.map((j) => j.id).sort()).toEqual(['j-1', 'jD']);
  // Un changement de nom part au compte.
  await carte(page, 'Nour').getByRole('button', { name: 'Modifier le joueur Nour' }).click();
  await page.getByLabel(/Nom du joueur/).fill('Nour K');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect.poll(() => envois[envois.length - 1].donnees.joueurs.find((j) => j.id === 'jD').nom).toBe('Nour K');
});

test('accessibilité et aucun débordement avec 5 joueurs @smoke', async ({ page }) => {
  const joueurs = ['Léa', 'Tom', 'Nour', 'Papi Jo', 'Prénom très très long'].map((nom, i) => ({ id: 'j' + i, nom, perso: ['lea', 'tom', 'nour', 'jo', 'ines'][i], cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: { 'maths.calcul': 10 * i } }));
  await preparer(page, { etat: { v: 1, total: 0, joueurs } });
  await ouvrirCompte(page);
  await expect(page.locator('.joueur-carte')).toHaveCount(5);
  expect(await sansDebordement(page)).toBe(true);
  const r = await new AxeBuilder({ page }).include('#compte-joueurs').analyze();
  expect(r.violations.map((v) => v.id + ' : ' + v.help)).toEqual([]);
});
