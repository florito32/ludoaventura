// v6.26 (lignes 144 à 146 du backlog, captures du 09/11/2026) :
// - le bouton « Piocher une carte » devient « Question suivante » ;
// - le dé et son « +N » ne cachent plus le message écrit sur le plateau (ni l'encadré des points) ;
// - sur téléphone, la case de réponse (et son contour de focus) et « Valider » restent dans le cadre de la carte.
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, conjugaison, cocherJoueur, lancer, lancerLeDe } = require('./aide');

// Deux rectangles se chevauchent-ils ? (1 px de tolérance)
function chevauche(a, b) {
  return a.top < b.bottom - 1 && a.bottom > b.top + 1 && a.left < b.right - 1 && a.right > b.left + 1;
}

test('le bouton s\'appelle « Question suivante »', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page);
  await lancer(page);
  await expect(page.getByRole('button', { name: 'Question suivante' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Piocher une carte' })).toHaveCount(0);
});

test('le dé et ses points ne cachent ni le message ni l\'encadré des points', async ({ page }) => {
  await rapide(page, { pause: 600000 }); // le message reste affiché pendant la mesure
  await page.goto('./');
  await versReglages(page, 1); // 1 joueur : chaque tour finit la manche, message le plus long (« en route vers le lac »)
  await cocherJoueur(page);
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await lancerLeDe(page);
  await expect(page.locator('#bandeau')).toContainText('en route vers le lac');
  // Le dé glisse en 0,3 s : on attend qu'il soit dégagé.
  await expect.poll(async () => page.evaluate(() => {
    const r = (el) => el.getBoundingClientRect();
    const m = r(document.getElementById('bandeau'));
    const d = r(document.getElementById('de-plateau')), g = r(document.getElementById('de-gain'));
    const de = { top: Math.min(d.top, g.top), bottom: d.bottom, left: d.left, right: Math.max(d.right, g.right) };
    const ch = (a, b) => a.top < b.bottom - 1 && a.bottom > b.top + 1 && a.left < b.right - 1 && a.right > b.left + 1;
    return ch(de, m);
  }), { timeout: 3000 }).toBe(false);
  const z = await page.evaluate(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, right: b.right }; };
    return { de: r(document.getElementById('de-plateau')), pts: r(document.querySelector('.points-plateau')),
      plateau: r(document.getElementById('de-plateau').offsetParent) };
  });
  expect(chevauche(z.de, z.pts), 'le dé cache l\'encadré des points').toBe(false);
  // Le dé reste sur le plateau.
  expect(z.de.top).toBeGreaterThanOrEqual(z.plateau.top - 1);
  expect(z.de.bottom).toBeLessThanOrEqual(z.plateau.bottom + 1);
});

// Simule le clavier : la zone visible garde `part` de la hauteur de l'écran (comme dans saisie-clavier.spec.js).
async function clavier(page, part) {
  await page.evaluate((p) => {
    const vv = window.visualViewport, h = Math.round(innerHeight * p);
    Object.defineProperty(vv, 'height', { configurable: true, get: () => h });
    vv.dispatchEvent(new Event('resize'));
  }, part);
}

test('la case de réponse et « Valider » restent dans le cadre de couleur de la carte', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await conjugaison(page, { temps: ['indicatif.present'], groupes: [3], niveau: 'moyen' });
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(page.getByLabel('Ta réponse')).toBeFocused();
  // Clavier ouvert sur écran tactile (carte en grand), sinon carte normale.
  const tactile = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  if (tactile) await clavier(page, 0.55);
  // Le focus au clavier montre le contour (comme sur le téléphone de la capture).
  await page.getByLabel('Ta réponse').blur();
  await page.getByLabel('Ta réponse').focus();
  const r = await page.evaluate(() => {
    const carte = document.getElementById('carte-piochee').getBoundingClientRect();
    const cadre = 3 + 5; // bord de 3 px + cadre de couleur de 5 px (ombre intérieure)
    const dedans = { top: carte.top + cadre, bottom: carte.bottom - cadre, left: carte.left + cadre, right: carte.right - cadre };
    const input = document.getElementById('reponse-joueur'), cs = getComputedStyle(input);
    const o = cs.outlineStyle === 'none' ? 0 : parseFloat(cs.outlineWidth) + parseFloat(cs.outlineOffset);
    const i = input.getBoundingClientRect();
    const v = document.getElementById('btn-valider-reponse').getBoundingClientRect();
    return {
      dedans,
      case: { top: i.top - o, bottom: i.bottom + o, left: i.left - o, right: i.right + o },
      valider: { top: v.top, bottom: v.bottom + 4, left: v.left, right: v.right } // + l'ombre de 4 px sous le bouton
    };
  });
  for (const [nom, b] of [['case de réponse', r.case], ['Valider', r.valider]]) {
    expect(b.top, nom + ' : haut').toBeGreaterThanOrEqual(r.dedans.top - 0.5);
    expect(b.bottom, nom + ' : bas').toBeLessThanOrEqual(r.dedans.bottom + 0.5);
    expect(b.left, nom + ' : gauche').toBeGreaterThanOrEqual(r.dedans.left - 0.5);
    expect(b.right, nom + ' : droite').toBeLessThanOrEqual(r.dedans.right + 0.5);
  }
});
