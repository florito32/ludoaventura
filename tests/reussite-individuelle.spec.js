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

// v10.30 (backlog lignes 447 et 454) : partie gagnée à plusieurs, chacun reçoit les étoiles qu'il a lui-même récoltées.
test('à 2 joueurs, partie gagnée : chacun reçoit ses propres étoiles, visibles dans sa carte', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await lancerPartie(page, { joueurs: 2 });
  await jouerJusquALaFin(page);
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  const pts = await page.evaluate(() => {
    const r = window.Aventura.partie.regles, t = [0, 0];
    (r.historique || []).forEach((h) => { if (h.joueur >= 0 && h.joueur < 2) t[h.joueur] += Number(h.points) || 0; });
    return t;
  });
  const lignes = page.locator('#fin-etoiles .fin-gains-joueurs li');
  await expect(lignes).toHaveCount(2);
  await expect(page.locator('#fin-etoiles .fin-gain')).toContainText('+' + (pts[0] + pts[1]));
  for (let i = 0; i < 2; i++) await expect(lignes.nth(i).locator('.fg-etoiles')).toHaveText('+' + pts[i]);
  // Pas de débordement de l'écran de fin.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  // Chacun dans sa carte (Mon compte).
  const noms = await page.evaluate(() => window.Aventura.partie.joueurs.map((j) => j.nom));
  await page.locator('#fin').evaluate((d) => d.close());
  await page.evaluate(() => window.Aventura.afficher('ecran-compte'));
  for (let i = 0; i < 2; i++) {
    const carte = page.locator('.joueur-carte', { has: page.locator('.joueur-nom', { hasText: noms[i] }) });
    await expect(carte.locator('.jt-etoiles strong')).toHaveText(String(pts[i]));
  }
});

// v10.32 (backlog ligne 462) : chaque partie jouée s'ajoute aux statistiques du joueur (jouées, réussies, d'affilée), par matière.
test('statistiques : une partie finie compte pour le joueur, dans la matière jouée', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await lancerPartie(page, { joueurs: 1 });
  await jouerJusquALaFin(page);
  await expect(page.locator('#fin')).toBeVisible();
  const total = await page.evaluate(() => { const J = window.Joueurs, j = J.duCompte()[0]; return J.statTotal(j); });
  expect(total.jouees).toBe(1);
  expect(total.reussies + total.record).toBeGreaterThanOrEqual(0);
  const parMatiere = await page.evaluate(() => { const J = window.Joueurs, j = J.duCompte()[0]; return J.MATIERES.map((m) => J.statDe(j, m.id).jouees); });
  expect(parMatiere.reduce((a, b) => a + b, 0)).toBe(1); // une seule matière a été jouée
  // Affichée dans « Statistiques » de sa carte.
  await page.locator('#fin').evaluate((d) => d.close());
  await page.evaluate(() => window.Aventura.afficher('ecran-compte'));
  await page.locator('#onglet-profil').click();
  await page.locator('.joueur-carte').first().getByRole('button', { name: 'Statistiques' }).click();
  await expect(page.locator('.joueur-carte').first().locator('.joueur-stats > .petit')).toContainText('1 partie jouée');
});
