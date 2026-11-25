// Mini-jeux « Course aux étoiles » et « Aventure des multiplications » (v10.44, demande du 24/11/2026) : repris du dépôt
// florito32/minijeux, dans la charte d'Aventura. Chaque partie terminée (gagnée ou perdue) rapporte 10 étoiles, sans toucher à la progression.
const { test, expect } = require('@playwright/test');
const { rapide, creerJoueurs, quiJoue } = require('./aide');

async function accueil(page) {
  await rapide(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await creerJoueurs(page, 1);
}
const compte = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')).total);
const debordements = (page) => page.evaluate(() => {
  const w = window.innerWidth, out = [];
  if (document.documentElement.scrollWidth > w + 1) out.push('page large : ' + document.documentElement.scrollWidth + ' > ' + w);
  document.querySelectorAll('.ecran:not([hidden]) button, .ecran:not([hidden]) canvas').forEach((e) => {
    const r = e.getBoundingClientRect(); if (r.width && (r.right > w + 1 || r.left < -1)) out.push((e.textContent || e.tagName).trim().slice(0, 20));
  });
  return out.slice(0, 5);
});
async function ouvrir(page, nom) {
  if (await page.locator('#btn-minijeux').isVisible()) await page.locator('#btn-minijeux').click(); // déjà sur la liste sinon
  await page.locator('.minijeu-carte', { hasText: nom }).click();
  await quiJoue(page);
  await expect(page.locator('#titre-minijeu')).toHaveText(nom);
}

/* ---------- Course aux étoiles ---------- */
const etoiles = (page) => page.evaluate(() => window.__mjEtoiles.etat());
async function demarrerEtoiles(page, tables = [3]) {
  await ouvrir(page, 'Course aux étoiles');
  await expect(page.locator('[data-demarrer]')).toBeDisabled(); // aucune table choisie
  for (const t of tables) await page.locator('.mj-etoiles [data-table="' + t + '"]').click();
  await page.locator('[data-demarrer]').click();
  await expect.poll(async () => (await etoiles(page)).enCours).toBe(true);
}
async function repondreEtoiles(page, juste) {
  const q = (await etoiles(page)).question;
  const v = juste ? q.bonne : q.choix.find((c) => c !== q.bonne);
  await page.locator('.mj-reponse', { hasText: new RegExp('^' + v + '$') }).click();
}

test('Course aux étoiles : tables, 3 réponses, 50 bonnes réponses, +10 étoiles sans toucher aux niveaux @smoke', async ({ page }) => {
  test.setTimeout(90000);
  const erreurs = []; page.on('pageerror', (e) => erreurs.push(e.message));
  await accueil(page);
  const avant = await compte(page);
  await page.locator('#btn-minijeux').click();
  await expect(page.locator('.minijeu-carte', { hasText: 'Course aux étoiles' })).not.toContainText('+10');
  expect(await debordements(page)).toEqual([]);
  await demarrerEtoiles(page, [3]);
  expect(await debordements(page)).toEqual([]);
  const e0 = await etoiles(page);
  expect(e0.question.choix).toHaveLength(3);
  expect(e0.question.a === 3 || e0.question.b === 3).toBe(true); // la table choisie
  expect(e0.question.choix).toContain(e0.question.bonne);
  for (let i = 1; i <= 50; i++) {
    await repondreEtoiles(page, true);
    if (i < 50) await expect.poll(async () => (await etoiles(page)).score).toBe(i);
    if (i < 50) await expect.poll(async () => (await etoiles(page)).question.bonne !== undefined && !(await page.locator('.mj-reponse.bonne').count())).toBe(true);
  }
  await expect(page.locator('.minijeu-fin')).toContainText('+10 étoiles', { timeout: 5000 });
  await expect(page.locator('.minijeu-fin')).toContainText('Ton temps');
  expect((await compte(page)) - avant).toBe(10);
  expect(await debordements(page)).toEqual([]);
  // Le meilleur temps est gardé : il revient au choix des tables.
  await page.locator('#minijeu-rejouer').click();
  await expect(page.locator('[data-record]')).toContainText('Ton meilleur temps');
  expect(erreurs).toEqual([]);
});

test('Course aux étoiles : 3 erreurs = partie perdue, +10 étoiles quand même', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  await demarrerEtoiles(page, [2, 5]);
  await page.evaluate(() => window.__mjEtoiles.delaiErreur(60));
  for (let i = 0; i < 3; i++) {
    await expect.poll(async () => (await etoiles(page)).vies).toBe(3 - i);
    await repondreEtoiles(page, false);
    await expect(page.locator('.mj-reponse.bonne')).toHaveCount(1); // la bonne réponse est montrée
    // La question suivante n'arrive qu'après la correction : on attend qu'elle soit là avant de répondre encore.
    if (i < 2) { await expect.poll(async () => (await etoiles(page)).vies).toBe(2 - i); await expect(page.locator('.mj-reponse.bonne')).toHaveCount(0); }
  }
  await expect(page.locator('.minijeu-fin')).toContainText('Plus de vies');
  await expect(page.locator('.minijeu-fin')).toContainText('+10 étoiles');
  expect((await compte(page)) - avant).toBe(10);
});

test('Course aux étoiles : « Arrêter la partie » ne rapporte rien, le retour revient à la liste', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  await demarrerEtoiles(page, [4]);
  await repondreEtoiles(page, true);
  await page.locator('[data-arreter]').click();
  await expect(page.locator('[data-ecran="choix"]')).toBeVisible();
  await page.locator('#minijeu-retour').click();
  await expect(page.locator('.minijeu-carte').first()).toBeVisible();
  expect((await compte(page)) - avant).toBe(0);
});

/* ---------- Aventure des multiplications ---------- */
const jeu = (page) => page.evaluate(() => window.__mjAventure.etat());
async function demarrerAventure(page) {
  await ouvrir(page, 'Aventure des multiplications');
  await expect(page.locator('[data-jouer]')).toBeDisabled();
  await page.locator('.mj-aventure [data-toutes]').click();
  await page.locator('[data-jouer]').click();
  await expect.poll(async () => (await jeu(page)).statut).toBe('playing');
}
// Place le personnage sous la caisse i, attend qu'il soit posé, puis saute.
async function casser(page, i) {
  await page.evaluate((n) => window.__mjAventure.placerSous(n), i);
  await expect.poll(async () => (await jeu(page)).joueur.onGround).toBe(true);
  await page.keyboard.down('Space');
  await expect.poll(async () => (await jeu(page)).caisses[i].broken, { timeout: 3000 }).toBe(true);
  await page.keyboard.up('Space');
}

test('Aventure : le nombre à trouver, 1 caisse sur 3 lui correspond, tout tient à l’écran @smoke', async ({ page }) => {
  const erreurs = []; page.on('pageerror', (e) => erreurs.push(e.message));
  await accueil(page);
  await ouvrir(page, 'Aventure des multiplications');
  expect(await debordements(page)).toEqual([]);
  await page.locator('.mj-aventure [data-toutes]').click();
  await page.locator('[data-jouer]').click();
  const s = await jeu(page);
  await expect(page.locator('[data-cible]')).toHaveText(String(s.cible));
  expect(s.caisses.filter((b) => b.correct).length * 3).toBe(s.caisses.length);
  for (const b of s.caisses) expect(b.a * b.b === s.cible).toBe(b.correct);
  // Le canvas est bien dessiné (pas vide) et le nombre est sous le jeu.
  // Le premier dessin arrive à l'image suivante (requestAnimationFrame) : on attend au lieu de lire tout de suite (test instable en CI, 25/11).
  await expect.poll(() => page.locator('[data-canvas]').evaluate((c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4000) if (d[i + 3]) n++; return n; })).toBeGreaterThan(0);
  const [cv, cible] = [await page.locator('[data-canvas]').boundingBox(), await page.locator('.mj-cible').boundingBox()];
  expect(cible.y).toBeGreaterThanOrEqual(cv.y + cv.height - 1);
  expect(await debordements(page)).toEqual([]);
  expect(erreurs).toEqual([]);
});

test('Aventure : casser les bonnes caisses puis le drapeau = niveau réussi, +10 étoiles @smoke', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  await demarrerAventure(page);
  const s = await jeu(page);
  const bonnes = s.caisses.map((b, i) => (b.correct ? i : -1)).filter((i) => i >= 0);
  for (const i of bonnes) await casser(page, i);
  await expect(page.locator('[data-trouvees]')).toHaveText(String(bonnes.length));
  expect((await jeu(page)).coeurs).toBe(3);
  await page.evaluate(() => window.__mjAventure.placerAuDrapeau());
  await page.keyboard.down('ArrowRight');
  await expect(page.locator('.minijeu-fin')).toContainText('+10 étoiles', { timeout: 8000 });
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('.minijeu-fin')).toContainText('Tu as trouvé les ' + bonnes.length + ' caisses');
  expect((await compte(page)) - avant).toBe(10);
  expect(await debordements(page)).toEqual([]);
});

test('Aventure : 3 mauvaises caisses = plus de cœurs, +10 étoiles quand même ; Rejouer relance', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  await demarrerAventure(page);
  const s = await jeu(page);
  const fausses = s.caisses.map((b, i) => (b.correct ? -1 : i)).filter((i) => i >= 0).slice(0, 3);
  for (const i of fausses) await casser(page, i);
  await expect(page.locator('.minijeu-fin')).toContainText('+10 étoiles', { timeout: 8000 });
  await expect(page.locator('.minijeu-bravo')).toContainText('Dommage');
  expect((await compte(page)) - avant).toBe(10);
  await page.locator('#minijeu-rejouer').click();
  await expect(page.locator('[data-ecran="choix"]')).toBeVisible(); // retour au choix des tables : nouvelle partie
  await expect(page.locator('.minijeu-fin')).toHaveCount(0);
});

test('Aventure : le bouton retour arrête le jeu sans étoiles, le clavier ne bouge plus rien', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  await demarrerAventure(page);
  await page.locator('#minijeu-retour').click();
  await expect(page.locator('.minijeu-carte').first()).toBeVisible();
  expect(await page.evaluate(() => typeof window.__mjAventure)).toBe('undefined'); // jeu démonté
  const y = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Space'); // plus capturé par le jeu
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(y);
  expect((await compte(page)) - avant).toBe(0);
});
