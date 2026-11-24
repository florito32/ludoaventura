// Repro : défi solo réussi sans rien quitter → ne doit jamais afficher « Tu as quitté ce défi ».
const { test, expect } = require('@playwright/test');
const { rapide, lancerLeDe, lancerDefiJour } = require('./aide');

async function gagner(page) {
  for (let t = 0; t < 5 * 4; t++) {
    if (await page.evaluate(() => document.getElementById('fin').open)) return;
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    const juste = await page.evaluate(() => window.Aventura.partie.carte.resultatTexte);
    await page.locator('#reponse-joueur').fill(juste);
    await page.getByRole('button', { name: 'OK' }).click();
    await lancerLeDe(page);
    await page.waitForFunction(() => document.getElementById('fin').open ||
      [...document.querySelectorAll('#tour-actions button')].some((b) => b.textContent.includes('Question suivante')));
  }
}

test('défi solo : rechargement en cours de partie puis victoire', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'un format suffit');
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await lancerDefiJour(page, 1);
  await page.evaluate(() => { const pa = window.Aventura.partie; pa.defi.mixte = false; pa.matiere[0] = 'maths'; pa.maths[0] = window.Rapide.mathsTout('facile'); });
  // un tour joué
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await page.locator('#reponse-joueur').fill(await page.evaluate(() => window.Aventura.partie.carte.resultatTexte));
  await page.getByRole('button', { name: 'OK' }).click();
  await lancerLeDe(page);
  console.log('AVANT reload', await page.evaluate(() => JSON.stringify([window.Recompenses.compte.etat.defisEnCours, window.Recompenses.compte.etat.defisQuittes])));
  await page.reload();
  console.log('APRES reload', await page.evaluate(() => JSON.stringify([window.Recompenses.compte.etat.defisEnCours, window.Recompenses.compte.etat.defisQuittes, window.Aventura.partie.defi && window.Aventura.partie.defi.type, window.Aventura.partie.regles && window.Aventura.partie.regles.id])));
  await gagner(page);
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  console.log('FIN', await page.locator('#fin-etoiles').innerText());
  await expect(page.locator('#fin-etoiles')).not.toContainText('quitté');
});

// v10.38 : une 2e ouverture du jeu (autre onglet, raccourci, restauration par le navigateur) pendant un défi
// ne doit pas faire croire que le défi a été quitté : le joueur le termine, il est récompensé.
test('défi solo terminé alors qu’une 2e page du jeu s’est ouverte entre-temps : pas « quitté », étoiles ×3', async ({ page, context }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'un format suffit');
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await lancerDefiJour(page, 1);
  await page.evaluate(() => { const pa = window.Aventura.partie; pa.defi.mixte = false; pa.matiere[0] = 'maths'; pa.maths[0] = window.Rapide.mathsTout('facile'); });
  const autre = await context.newPage();           // même navigateur, même stockage, aucune partie ici
  await autre.goto('./');
  await autre.close();
  await gagner(page);
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  await expect(page.locator('#fin-etoiles')).not.toContainText('quitté');
  const pts = await page.evaluate(() => window.Aventura.partie.regles.points);
  await expect(page.locator('#fin-etoiles')).toContainText('+' + (3 * pts) + ' étoiles');
  // Le défi n'apparaît pas « Quitté » ensuite.
  expect(await page.evaluate(() => window.Recompenses.compte.defiQuitte('solo', 'j-1'))).toBe(false);
});

test.describe('défi « quitté » à tort : logique', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));
  const E = require('../js/etoiles.js');
  function memoire() { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; }
  test('une marque « quitté » qui vise une partie finie est ignorée ; un vrai abandon reste un abandon', () => {
    const maintenant = new Date(2026, 10, 24, 9);
    const c = new E.Compte(memoire(), () => maintenant);
    c.commencerDefi('solo', 'a', ['j-1']);
    c.verifierDefis(null, null);                       // 2e page ouverte : la partie « a » est marquée quittée…
    expect(c.defiQuitte('solo', 'j-1')).toBe(true);
    expect(c.etat.defisQuittes['2026-11-24']['solo@j-1']).toBe('a'); // …avec son identifiant
    const r = c.recompenserJoueurs('a', [{ joueur: 'j-1', unites: 10 }], true, 'solo', 'x', () => 0.9); // « a » va au bout
    expect(r[0]).toMatchObject({ base: 10, bonus: 20 });
    expect(r[0].quitte).toBeUndefined();
    expect(c.defiQuitte('solo', 'j-1')).toBe(false);
    // Vrai abandon ensuite (partie « b » laissée, puis « c » lancée) : quitté, même si une fausse alerte était là avant.
    c.commencerDefi('solo', 'b', ['j-1']);
    c.commencerDefi('solo', 'c', ['j-1']);
    expect(c.defiQuitte('solo', 'j-1')).toBe(true);
    expect(c.etat.defisQuittes['2026-11-24']['solo@j-1']).toBe('b');
    // Ancienne marque (true, d'avant la v10.38) : toujours un abandon.
    c.etat.defisQuittes['2026-11-24'] = { 'solo@j-2': true };
    expect(c.defiQuitte('solo', 'j-2')).toBe(true);
  });
});
