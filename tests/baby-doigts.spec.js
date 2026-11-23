// Baby jeux › Les chiffres › Les doigts (v10.7, demande du 17/11/2026) : mains noir sur blanc (Openclipart « Count on fingers », CC0)
// à la place des mains dessinées en code (jugées moches). 1 à 5 : une main ; 6 à 10 : deux mains (5 + le reste).
const { test, expect } = require('@playwright/test');
const { rapide, lancerRapideQui } = require('./aide');

async function ouvrir(page, n) {
  await rapide(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((ch) => {
    try { localStorage.setItem('ludo-vu', '1'); localStorage.setItem('ludoaventura-baby-choix', JSON.stringify(ch)); } catch (e) { /* */ }
  }, { categories: ['chiffres'], chiffres: [n], jeux: ['doigts'] });
  await page.goto('./');
  await page.getByRole('button', { name: 'Baby jeux' }).click();
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  await lancerRapideQui(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await expect(page.locator('#carte-gram .baby-mains')).toBeVisible();
}

test.describe('Les doigts : les mains', () => {
  test('pour chaque nombre de 1 à 10 : le bon nombre de mains, noir sur blanc, texte alternatif juste', async ({ page }) => {
    test.skip(test.info().project.name !== 'ordinateur', 'test de rendu logique : un seul format suffit');
    await page.goto('./');
    const r = await page.evaluate(() => {
      const out = [];
      for (let n = 1; n <= 10; n++) {
        const d = document.createElement('div');
        d.innerHTML = window.BabyCarte.mains(n);
        const mains = d.querySelectorAll('svg.baby-main');
        const couleurs = new Set();
        d.querySelectorAll('path').forEach((p) => couleurs.add(p.getAttribute('fill')));
        out.push({ n, nb: mains.length, miroir: d.querySelectorAll('svg.miroir').length, label: d.firstChild.getAttribute('aria-label'), couleurs: [...couleurs] });
      }
      return out;
    });
    for (const x of r) {
      expect(x.nb, 'mains pour ' + x.n).toBe(x.n <= 5 ? 1 : 2);
      expect(x.miroir, 'main retournée pour ' + x.n).toBe(x.n <= 5 ? 0 : 1);
      expect(x.label).toBe(x.n + (x.n > 1 ? ' doigts levés' : ' doigt levé'));
      for (const c of x.couleurs) expect(['#fff', 'none']).toContain(c); // plus de couleur chair : noir sur blanc
    }
  });

  for (const n of [1, 3, 5, 8, 10]) {
    test('la carte affiche ' + n + ' doigts, sans déborder, et la bonne réponse est acceptée', async ({ page }) => {
      await ouvrir(page, n);
      const mains = page.locator('#carte-gram .baby-main');
      await expect(mains).toHaveCount(n <= 5 ? 1 : 2);
      for (const m of await mains.all()) {
        const b = await m.boundingBox();
        expect(b.width).toBeGreaterThan(30); // la main est bien dessinée (pas un trait vide)
        expect(b.height).toBeGreaterThan(60);
      }
      const deborde = await page.evaluate(() => {
        const z = document.getElementById('carte-gram').getBoundingClientRect(), out = [];
        if (document.documentElement.scrollWidth > window.innerWidth) out.push('page');
        document.querySelectorAll('#carte-gram .baby-main').forEach((e) => {
          const r = e.getBoundingClientRect();
          if (r.left < z.left - 2 || r.right > z.right + 2) out.push('main');
        });
        return out;
      });
      expect(deborde).toEqual([]);
      await page.locator('#carte-gram .gram-bouton[data-v="' + n + '"]').click();
      await expect(page.locator('#carte-reponse')).toContainText('Bravo !');
    });
  }
});
