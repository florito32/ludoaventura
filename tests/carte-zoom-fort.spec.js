// v9.5 (demande du 17/11/2026) : sur les cartes à toucher, on peut zoomer assez fort pour toucher un tout petit
// pays (Israël sur la carte du monde) sans se tromper ; la carte du monde est plus haute sur téléphone ;
// après la réponse, la carte se zoome sur la bonne zone.
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, valider, ouvrirNeuf, lancer, cocher } = require('./aide');

async function questionIsrael(page) {
  await rapide(page); await ouvrirNeuf(page); await versReglages(page, 1);
  await cocher(page, '#matieres', 'geographie');
  await cocher(page, '#mode-savoir', 'normal');
  await cocher(page, '#niveau-savoir', 'moyen');
  await valider(page); await page.locator('#savoir-jeux').waitFor();
  await page.locator('#savoir-liste input[value="g19"]').check();
  await lancer(page);
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  // La question tirée est toujours « Touche le pays : Israël ».
  await page.evaluate(() => {
    window.CartesGeo.tirer = (id) => ({ format: 'C', consigne: 'Touche le pays : Israël', carte: id, bonne: 'pIL', bonneNom: 'Israël', touche: null });
  });
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await page.locator('#carte-piochee').waitFor();
  expect(await page.evaluate(() => window.Aventura.partie.carte.bonne)).toBe('pIL');
}

test('carte du monde (v9.5) : zoom assez fort pour toucher Israël sans se tromper', async ({ page }) => {
  await questionIsrael(page);
  const svg = page.locator('#carte-savoir .carte-geo svg');
  await svg.scrollIntoViewIfNeeded();
  const israel = page.locator('#carte-savoir [data-zone="pIL"]');
  const plus = page.getByRole('button', { name: 'Zoomer sur la carte' });
  const largeur = async () => Number((await svg.getAttribute('viewBox')).split(' ')[2]);
  const w0 = await largeur();
  // On amène Israël au centre (glisser), puis « + », jusqu'au zoom maximal.
  for (let i = 0; i < 12 && await plus.isEnabled(); i++) {
    const s = await svg.boundingBox(), z = await israel.boundingBox();
    const dx = s.x + s.width / 2 - (z.x + z.width / 2), dy = s.y + s.height / 2 - (z.y + z.height / 2);
    if (Math.hypot(dx, dy) > 12 && i > 0) {
      await page.mouse.move(s.x + s.width / 2 - dx / 2, s.y + s.height / 2 - dy / 2);
      await page.mouse.down();
      await page.mouse.move(s.x + s.width / 2 + dx / 2, s.y + s.height / 2 + dy / 2, { steps: 5 });
      await page.mouse.up();
    }
    await plus.click();
  }
  await expect(plus).toBeDisabled();
  // Bien plus fort qu'avant (×8 au plus) : Israël fait au moins la largeur d'un doigt (44 px).
  expect(w0 / await largeur()).toBeGreaterThan(16);
  const z = await israel.boundingBox();
  expect(Math.min(z.width, z.height)).toBeGreaterThanOrEqual(40);
  // Un point d'Israël entouré d'Israël sur 12 px de chaque côté (la taille d'un bout de doigt) : on ne peut pas se tromper.
  const s = await svg.boundingBox();
  const pt = await page.evaluate(([z, s]) => {
    const ici = (x, y) => { const e = document.elementFromPoint(x, y); return e && e.getAttribute('data-zone'); };
    for (let y = z.y + 12; y < z.y + z.height - 12; y += 4) {
      for (let x = z.x + 12; x < z.x + z.width - 12; x += 4) {
        if (x < s.x + 12 || x > s.x + s.width - 70 || y < s.y + 12 || y > s.y + s.height - 12) continue; // loin des boutons
        if ([[0, 0], [12, 0], [-12, 0], [0, 12], [0, -12]].every(([a, b]) => ici(x + a, y + b) === 'pIL')) return [x, y];
      }
    }
    return null;
  }, [z, s]);
  expect(pt).not.toBeNull();
  const [x, y] = pt;
  await page.mouse.click(x, y);
  expect(await page.evaluate(() => window.Aventura.partie.carte.touche)).toBe('pIL');
  await expect(page.locator('#carte-reponse')).toHaveClass(/juste/);
  // Après la réponse, la carte reste zoomée sur Israël (en vert). Depuis la v10.15, une bonne réponse ramène le plateau tout de suite sur téléphone :
  // la carte n'a plus à rester à l'écran, mais elle garde son zoom et sa zone verte.
  expect(await largeur()).toBeLessThan(w0 / 4);
  await expect(page.locator('#carte-savoir .zone.bonne')).toBeAttached();
  // Une fois répondu, survoler ou toucher un pays ne le colore plus en jaune.
  await expect(page.locator('#carte-savoir .zone.cible')).toHaveCount(0);
  const d = await page.evaluate(() => ({ l: document.documentElement.scrollWidth, v: window.innerWidth }));
  expect(d.l).toBeLessThanOrEqual(d.v);
});

test('carte du monde (v9.5) : assez haute sur téléphone, les boutons de zoom restent dans la carte', async ({ page }) => {
  await questionIsrael(page);
  const svg = page.locator('#carte-savoir .carte-geo svg');
  await page.getByRole('button', { name: 'Zoomer sur la carte' }).click(); // les 3 boutons sont visibles
  const s = await svg.boundingBox();
  for (const nom of ['Zoomer sur la carte', 'Dézoomer la carte', 'Revoir toute la carte']) {
    const b = await page.getByRole('button', { name: nom }).boundingBox();
    expect(b.y + b.height).toBeLessThanOrEqual(s.y + s.height + 1);
  }
  // La vue a la même forme que la carte à l'écran : pas de bande perdue.
  const vb = (await svg.getAttribute('viewBox')).split(' ').map(Number);
  expect(vb[2] / vb[3]).toBeCloseTo(s.width / s.height, 1);
});
