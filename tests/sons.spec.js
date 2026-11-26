// Sons et vibrations (v10.61, demande du 26/11/2026, backlog lignes 565 à 571) :
//  - dé : son + vibration de 0,1 s ; bonne réponse : son « réussite » ; mauvaise : son « raté » ;
//  - étoiles gagnées : un son toutes les 0,1 s avec de petites vibrations ;
//  - Paramètres › Sons : volume de l'animation, volume de la voix, vibration à 4 niveaux (gardés sur l'appareil) ;
//  - tout s'arrête quand le joueur quitte l'écran en cours.
const { test, expect } = require('@playwright/test');
const { repondre, lancerPartie, lancerLeDe } = require('./aide');

const ETAT = (total) => JSON.stringify({ v: 1, total, journal: [], parJour: {}, coffresJour: {}, coffresNiveau: {}, defis: {}, parties: [] });

// Imite le vibreur (le navigateur de test n'en a pas) et garde chaque appel.
async function vibreurImite(page) {
  await page.addInitScript(() => {
    window.__vib = [];
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: (p) => { window.__vib.push(p); return true; } });
    try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ }
  });
}
const sons = (page, nom) => page.evaluate((n) => window.Sons.historique.filter((h) => h.son === n).length, nom);

test('les 4 fichiers de sons existent et sont lus par le navigateur', async ({ page, request }) => {
  for (const f of ['de', 'reussite', 'rate', 'etoile']) {
    const r = await request.get('sons/' + f + '.mp3');
    expect(r.ok(), f).toBe(true);
    expect((await r.body()).length).toBeGreaterThan(10000);
  }
});

test('Paramètres › Sons : volumes et vibration, gardés après rechargement', async ({ page }) => {
  await vibreurImite(page);
  await page.goto('./');
  await page.locator('#btn-parametres').click();
  await page.locator('#onglet-sons').click();
  // Valeurs de départ : tout à 100 %, vibration normale.
  await expect(page.locator('#sons-anim')).toHaveValue('100');
  await expect(page.locator('#sons-voix')).toHaveValue('100');
  await expect(page.locator('input[name="sons-vib"][value="normale"]')).toBeChecked();
  await page.locator('#sons-anim').fill('40');
  await page.locator('#sons-voix').fill('70');
  await page.locator('input[name="sons-vib"][value="legere"]').check();
  await expect(page.locator('#sons-anim-val')).toHaveText('40 %');
  expect(await page.evaluate(() => window.Sons.reglages())).toEqual({ anim: 0.4, voix: 0.7, vib: 'legere' });
  expect(await page.evaluate(() => window.Sons.volumeVoix())).toBe(0.7);
  await page.reload();
  // Le rechargement garde l'écran affiché (sessionStorage) mais pas la vue : on revient à l'accueil, puis on rouvre les Paramètres.
  const retour = page.locator('#ecran-compte [data-retour-accueil]');
  if (await retour.isVisible()) await retour.click();
  await page.locator('#btn-parametres').click();
  await page.locator('#onglet-sons').click();
  await expect(page.locator('#sons-anim')).toHaveValue('40');
  await expect(page.locator('#sons-voix')).toHaveValue('70');
  await expect(page.locator('input[name="sons-vib"][value="legere"]')).toBeChecked();
  // Pas de débordement sur ce format d'écran.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('la vibration suit le niveau choisi (désactivée, légère, normale, forte)', async ({ page }) => {
  await vibreurImite(page);
  await page.goto('./');
  const duree = async (niveau) => page.evaluate((n) => { window.__vib.length = 0; window.Sons.regler('vib', n); window.__vib.length = 0; window.Sons.vibrer(100); return window.__vib.filter((v) => v > 0); }, niveau);
  expect(await duree('aucune')).toEqual([]);
  expect(await duree('legere')).toEqual([50]);
  expect(await duree('normale')).toEqual([100]);
  expect(await duree('forte')).toEqual([200]);
});

test('bonne réponse : son « réussite » ; dé : son « dé » et vibration de 0,1 s', async ({ page }) => {
  await vibreurImite(page);
  await lancerPartie(page, { joueurs: 1 });
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await repondre(page, true);
  await expect.poll(() => sons(page, 'reussite')).toBe(1);
  expect(await sons(page, 'rate')).toBe(0);
  await page.evaluate(() => { window.__vib.length = 0; });
  await lancerLeDe(page);
  expect(await sons(page, 'de')).toBe(1);
  expect(await page.evaluate(() => window.__vib)).toContain(100);
});

test('mauvaise réponse : son « raté »', async ({ page }) => {
  await vibreurImite(page);
  await lancerPartie(page, { joueurs: 1 });
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await repondre(page, false);
  await expect.poll(() => sons(page, 'rate')).toBe(1);
  expect(await sons(page, 'reussite')).toBe(0);
});

test('étoiles gagnées : un son toutes les 0,1 s avec une petite vibration, et tout s’arrête en quittant l’accueil', async ({ page }) => {
  await vibreurImite(page);
  await page.goto('./');
  await page.evaluate((etat) => {
    localStorage.setItem('ludo-vu', '1');
    localStorage.setItem('ludoaventura-etoiles', etat);
    sessionStorage.setItem('ludoaventura-gain-accueil', JSON.stringify({ n: 20 }));
  }, ETAT(100));
  await page.reload();
  await expect.poll(() => sons(page, 'etoile'), { timeout: 4000 }).toBeGreaterThan(5);
  const t = await page.evaluate(() => window.Sons.historique.filter((h) => h.son === 'etoile').map((h) => h.t));
  const ecarts = t.slice(1).map((x, i) => x - t[i]);
  const moyen = ecarts.reduce((a, b) => a + b, 0) / ecarts.length;
  expect(moyen).toBeGreaterThan(70);
  expect(moyen).toBeLessThan(160);
  expect(await page.evaluate(() => window.__vib.filter((v) => v > 0).length)).toBeGreaterThan(5);
  // Le joueur quitte l'accueil : plus aucun son, la vibration est coupée.
  await page.evaluate(() => { window.__vib.length = 0; });
  await page.locator('#btn-parametres').click();
  const avant = await sons(page, 'etoile');
  await page.waitForTimeout(600);
  expect(await sons(page, 'etoile')).toBe(avant);
  expect(await page.evaluate(() => window.__vib)).toContain(0); // navigator.vibrate(0) = arrêt
});
