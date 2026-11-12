// Zoom de la carte à toucher (v7.2, BACKLOG ligne 277) : après un zoom, toucher une zone la choisit bien.
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, valider, ouvrirNeuf, lancer } = require('./aide');
test('carte à toucher zoomée (v7.2) : un vrai toucher (doigt ou souris) choisit bien la zone visée', async ({ page }, info) => {
  await rapide(page); await ouvrirNeuf(page); await versReglages(page, 1);
  await page.locator('#matieres input[value="geographie"]').check();
  await valider(page); await page.locator('#savoir-jeux').waitFor();
  await page.locator('#savoir-liste input[value="g10"]').check();
  await lancer(page);
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  await page.evaluate(() => window.Savoirs.regler(() => 0.3));
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.locator('#carte-piochee').waitFor();
  const c = await page.evaluate(() => window.Aventura.partie.carte);
  await page.getByRole('button', { name: 'Zoomer sur la carte' }).click();
  await page.locator('#carte-savoir .carte-geo').scrollIntoViewIfNeeded();
  const svgB = await page.locator('#carte-savoir svg').boundingBox();
  const z = await page.locator('#carte-savoir [data-zone="' + c.bonne + '"]').boundingBox();
  const x = Math.min(Math.max(z.x + z.width / 2, svgB.x + 5), svgB.x + svgB.width - 60), y = Math.min(Math.max(z.y + z.height / 2, svgB.y + 5), svgB.y + svgB.height - 5);
  const id = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e.getAttribute('data-zone'); }, [x, y]);
  if (info.project.use.hasTouch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y);
  const rep = await page.evaluate(() => window.Aventura.partie.carte.touche);
  expect(rep).toBe(id);
});
