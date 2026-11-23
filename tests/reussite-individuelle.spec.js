// v10.28 (backlog ligne 446) : à plusieurs, chaque joueur a sa part de l'objectif de l'équipe (objectif ÷ nombre de joueurs).
const { test, expect } = require('@playwright/test');
const { rapide, lancerPartie, repondre, lancerLeDe } = require('./aide');

async function jouerJusquALaFin(page) {
  const suite = page.getByRole('button', { name: /^(Première question|Question suivante)$/ });
  for (let t = 0; t < 14; t++) {
    await suite.or(page.locator('#fin[open]')).first().waitFor();
    if (await page.locator('#fin').isVisible()) return;
    await suite.click();
    await repondre(page, true);
    await lancerLeDe(page);
  }
}

test('à 2 joueurs : l\'écran de fin donne la part de chacun et dit qui l\'a réussie @smoke', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await lancerPartie(page, { joueurs: 2 });
  const objectif = await page.evaluate(() => window.Aventura.partie.regles.objectif);
  await jouerJusquALaFin(page);
  const box = page.locator('#fin-joueurs');
  await expect(box).toBeVisible();
  await expect(box.locator('.fin-joueurs-liste li')).toHaveCount(2);
  await expect(box.locator('.fin-joueurs-titre')).toContainText(String(Math.round((objectif / 2) * 10) / 10));
  // Chaque ligne compare les points du joueur à sa part : réussi si points ≥ part.
  const attendu = await page.evaluate((part) => {
    const r = window.Aventura.partie.regles, pts = [0, 0];
    (r.historique || []).forEach((h) => { if (h.joueur >= 0 && h.joueur < 2) pts[h.joueur] += Number(h.points) || 0; });
    return pts.map((p) => (p >= part ? 'réussi' : 'manqué'));
  }, objectif / 2);
  for (let i = 0; i < 2; i++) await expect(box.locator('.fin-joueurs-liste li').nth(i)).toContainText(attendu[i]);
});

test('à 1 joueur : pas de part individuelle (l\'objectif est déjà le sien)', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await lancerPartie(page, { joueurs: 1 });
  await jouerJusquALaFin(page);
  await expect(page.locator('#fin')).toBeVisible();
  await expect(page.locator('#fin-joueurs')).toBeHidden();
});
