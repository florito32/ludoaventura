// Déplacement des personnages : ils suivent la route d'une croix à l'autre (pas en ligne droite), en 1,5 s.
const { test, expect } = require('@playwright/test');
const { lancerPartie, attendreJoueur } = require('./aide');

// Distance (en % de la largeur du plateau) d'un point à une ligne brisée.
function distanceTrajet(p, pts, rapport) {
  let best = Infinity;
  for (let k = 1; k < pts.length; k++) {
    const [ax, ay] = [pts[k - 1][0], pts[k - 1][1] / rapport], [bx, by] = [pts[k][0], pts[k][1] / rapport];
    const [px, py] = [p[0], p[1] / rapport];
    const l2 = (bx - ax) ** 2 + (by - ay) ** 2;
    const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2)) : 0;
    best = Math.min(best, Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay))));
  }
  return best;
}

test.describe('tracé de la route', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('chaque tronçon a son tracé, et ce n\'est pas une ligne droite', async ({ page }) => {
    await page.goto('./');
    const { route, cases } = await page.evaluate(() => ({ route: window.Aventura.route, cases: window.Aventura.cases }));
    for (let i = 1; i < cases.length; i++) {
      expect(route[i].length, 'tronçon ' + i).toBeGreaterThanOrEqual(5);
      // Pont → marais (tronçon 3) : la route y est presque droite sur l'illustration.
      if (i === 3) continue;
      // Ailleurs, au moins un point du tracé s'écarte nettement de la ligne droite entre les deux croix.
      const droite = [[cases[i - 1].x, cases[i - 1].y], [cases[i].x, cases[i].y]];
      const ecart = Math.max(...route[i].map((q) => distanceTrajet(q, droite, 1600 / 1071)));
      expect(ecart, 'tronçon ' + i).toBeGreaterThan(2);
    }
  });
});

test('le personnage marche sur la route de DÉPART à la prairie, en 1,5 s @smoke', async ({ page }) => {
  await lancerPartie(page, { joueurs: 1 });
  const pion = page.locator('.pion').first();
  await expect(pion).toHaveClass(/marche/);
  const mesures = await page.evaluate(() => {
    const p = document.querySelector('.pion');
    const anim = p.getAnimations().find((a) => a.effect.getKeyframes().some((k) => k.left));
    anim.pause();
    const plateau = document.getElementById('pions').getBoundingClientRect(); // repère des % des pions
    const res = { duree: anim.effect.getTiming().duration, points: [] };
    for (let t = 0; t <= 1500; t += 100) {
      anim.currentTime = t;
      const s = getComputedStyle(p);
      res.points.push([parseFloat(s.left) / plateau.width * 100, parseFloat(s.top) / plateau.height * 100]);
    }
    anim.finish();
    res.trajet = window.Aventura.trajet(0, 1);
    res.decalage = window.Aventura.decalages[0];
    return res;
  });
  expect(mesures.duree).toBe(1500);
  // Décalage du pion du joueur 1 sur sa case (js/plateau.js → DECALAGES[0]).
  const rapport = 1600 / 1071;
  const [ddx, ddy] = mesures.decalage;
  const trajet = mesures.trajet.map(([x, y]) => [x + ddx, y + ddy * rapport]);
  for (const p of mesures.points) expect(distanceTrajet(p, trajet, rapport)).toBeLessThan(0.6);
  // Il n'est pas allé en ligne droite : à mi-chemin, il est loin de la droite DÉPART → prairie.
  const droite = [trajet[0], trajet[trajet.length - 1]];
  expect(distanceTrajet(mesures.points[8], droite, rapport)).toBeGreaterThan(3);
  await expect(pion).not.toHaveClass(/marche/);
});

test('au tour suivant, le personnage suit la route du pont jusqu\'au marais', async ({ page }) => {
  await page.addInitScript(() => { window.AVENTURA_MARCHE = 1500; });
  await lancerPartie(page, { joueurs: 1 });
  for (let t = 0; t < 2; t++) {
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    await page.getByRole('button', { name: 'Bonne réponse' }).click();
    await page.getByRole('button', { name: 'Lancer le dé FORT' }).click();
    await attendreJoueur(page, 'Léa');
  }
  // 3e croix : le marais. Le pion part du pont et marche.
  await expect(page.locator('.pion').first()).toHaveAttribute('data-case', '3');
  const ok = await page.evaluate(() => {
    const p = document.querySelector('.pion');
    const anim = p.getAnimations().find((a) => a.effect.getKeyframes().some((k) => k.left));
    return !!anim && anim.effect.getKeyframes().length === window.Aventura.trajet(2, 3).length;
  });
  expect(ok).toBe(true);
});

test('les personnages sont debout sur le plateau (corps entier, pas un visage dans un cercle)', async ({ page }) => {
  await lancerPartie(page, { joueurs: 4 });
  for (let k = 0; k < 4; k++) {
    const pion = page.locator('.pion').nth(k);
    await expect(pion.locator('svg.figurine-svg')).toHaveCount(1);
    for (const partie of ['.tete', '.corps', '.jambe-g', '.jambe-d', '.bras-g', '.bras-d']) await expect(pion.locator(partie)).toHaveCount(1);
    await expect(pion.locator('.socle')).toHaveCount(1); // socle à la couleur du joueur
    const b = await pion.boundingBox();
    expect(b.height).toBeGreaterThan(b.width * 1.6); // silhouette debout, plus haute que large
    expect(await pion.evaluate((e) => getComputedStyle(e).borderRadius)).toBe('0px');
  }
});

test('pendant le déplacement, le personnage marche : jambes et bras bougent, puis s\'arrêtent', async ({ page }) => {
  await lancerPartie(page, { joueurs: 1 });
  const pion = page.locator('.pion').first();
  await expect(pion).toHaveClass(/marche/);
  const enMarche = await pion.evaluate((p) => ['.jambe-g', '.jambe-d', '.bras-g', '.bras-d'].map((s) => p.querySelector(s).getAnimations().length));
  expect(enMarche).toEqual([1, 1, 1, 1]);
  await expect(pion).not.toHaveClass(/marche/, { timeout: 4000 });
  const arrete = await pion.evaluate((p) => p.querySelector('.jambe-g').getAnimations().length);
  expect(arrete).toBe(0);
});

test('le personnage se tourne dans le sens de la marche (vers la gauche entre le marais et les collines)', async ({ page }) => {
  await lancerPartie(page, { joueurs: 1 });
  const pion = page.locator('.pion').first();
  await expect(pion).not.toHaveClass(/gauche/); // DÉPART → prairie : il part vers la droite
  for (let t = 0; t < 3; t++) {
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    await page.getByRole('button', { name: 'Bonne réponse' }).click();
    await page.getByRole('button', { name: 'Lancer le dé FORT' }).click();
    await attendreJoueur(page, 'Léa');
  }
  await expect(pion).toHaveAttribute('data-case', '4');
  await expect(pion).toHaveClass(/gauche/, { timeout: 4000 }); // la route redescend vers la gauche
});
