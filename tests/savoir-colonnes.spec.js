// Histoire et Géographie, écran des jeux (v10.13, demande du 18/11/2026) : présenté comme les temps de la conjugaison,
// une colonne (un cadre) par famille, tout visible sans défiler. Noms entiers sur une ligne, rien ne dépasse en largeur.
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, valider, ouvrirNeuf } = require('./aide');

async function versJeux(page, matiere) {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await page.locator('#matieres input[value="' + matiere + '"]').check();
  await valider(page);
  await page.locator('#savoir-jeux').waitFor();
  await page.locator('#btn-tout-savoir').click(); // état « choisi » (fond foncé) : mêmes dimensions
}

// Mesures de l'écran : défilement, tuiles coupées, position des cadres.
async function mesures(page) {
  return page.evaluate(() => {
    const corps = document.querySelector('#reglages-joueur');
    const tuiles = [...document.querySelectorAll('#savoir-liste .famille:not([hidden]) .pack > span')];
    const coupees = tuiles.filter((el) => {
      const r = el.getBoundingClientRect(), n = el.querySelector('.pack-nom'), nr = n.getBoundingClientRect();
      return el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1 || nr.right > r.right - 1 || nr.left < r.left + 1
        || Math.round(nr.height / parseFloat(getComputedStyle(n).lineHeight)) > 1;
    }).map((e) => e.textContent);
    const cadres = [...document.querySelectorAll('#savoir-liste .famille:not([hidden])')].map((f) => f.getBoundingClientRect());
    return {
      defile: corps.scrollHeight > corps.clientHeight + 1,
      largeur: document.documentElement.scrollWidth > innerWidth,
      tuiles: tuiles.length, coupees, cadres: cadres.length,
      surUneLigne: cadres.every((r) => Math.abs(r.top - cadres[0].top) < 2),
      petites: tuiles.filter((e) => e.getBoundingClientRect().height < 24).length,
    };
  });
}

for (const [matiere, nbTuiles, nbCadres] of [['histoire', 21, 7], ['geographie', 13, 4]]) {
  test(matiere + ' : jeux rangés en colonnes, noms entiers, sans défiler', async ({ page }, info) => {
    await versJeux(page, matiere);
    const m = await mesures(page);
    expect(m.tuiles).toBe(nbTuiles);
    expect(m.cadres).toBe(nbCadres);
    expect(m.coupees).toEqual([]);   // aucun nom coupé ni sur deux lignes
    expect(m.largeur).toBe(false);   // pas de débordement horizontal
    expect(m.petites).toBe(0);       // cibles tactiles ≥ 24 px (WCAG 2.5.8)
    // Sans défiler : sur téléphone, tablette et ordinateur. Le téléphone carré (480 × 480) ne tient pas toute
    // l'histoire (21 jeux) : la zone défile alors, mais la géographie tient.
    if (info.project.name !== 'telephone-carre' || matiere === 'geographie') expect(m.defile).toBe(false);
    // Ordinateur : un cadre par famille, côte à côte.
    if (info.project.name === 'ordinateur') expect(m.surUneLigne).toBe(true);
  });
}

test('« Tout » d\'un cadre choisit ses jeux, le haut de la liste reste atteignable', async ({ page }) => {
  await versJeux(page, 'histoire');
  await page.locator('#btn-tout-savoir').click(); // tout désélectionner
  const cadre = page.locator('#savoir-liste .famille:not([hidden])').nth(1);
  await cadre.locator('.btn-tout-famille').click();
  expect(await page.evaluate(() => window.Aventura.partie.savoirs[0].histoire.jeux)).toHaveLength(6);
  const haut = await page.locator('#savoir-liste').evaluate((el) => {
    let c = el.parentElement; while (getComputedStyle(c).overflowY === 'visible') c = c.parentElement;
    c.scrollTop = 0; return el.getBoundingClientRect().top - c.getBoundingClientRect().top;
  });
  expect(haut).toBeGreaterThanOrEqual(-1);
});
