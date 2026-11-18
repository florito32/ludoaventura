// v10.18 (demande du 18/11/2026, 10 h 47) :
//  - Les doigts : la main n'est plus coupée sur la droite.
//  - Les bulles : une couleur et une taille par chiffre (plus le chiffre est grand, plus la bulle est grosse) ;
//    toucher une bulle ne remet aucune autre bulle à sa place de départ (la carte n'est plus redessinée).
//  - Après la réponse : bonne = le plateau revient tout de suite ; mauvaise = le jeu se cache, la correction
//    et « J'ai compris » restent visibles (téléphone et tablette).
//  - Plateau : plus de bandeau en haut, le plateau est en haut de l'écran, le menu est sur le plateau à droite ;
//    bouton plein écran quand le navigateur sait le faire.
const { test, expect } = require('@playwright/test');
const { rapide } = require('./aide');

async function ouvrir(page, jeu, chiffres, { calme = true } = {}) {
  await rapide(page);
  if (calme) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((ch) => {
    try { localStorage.setItem('ludo-vu', '1'); localStorage.setItem('ludoaventura-baby-choix', JSON.stringify(ch)); } catch (e) { /* */ }
  }, { categories: ['chiffres'], chiffres, jeux: [jeu] });
  await page.goto('./');
  await page.getByRole('button', { name: 'Baby jeux' }).click();
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
}
async function premiereQuestion(page) {
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
}
const pasDebordement = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

test.describe('Les doigts : main entière', () => {
  test('les 5 mains de base tiennent entièrement dans leur cadre (rien de coupé à droite ni à gauche)', async ({ page }) => {
    test.skip(test.info().project.name !== 'ordinateur', 'test de rendu logique : un seul format suffit');
    await page.goto('./');
    const coupes = await page.evaluate(() => {
      const out = [];
      for (let n = 1; n <= 5; n++) {
        const d = document.createElement('div');
        d.style.cssText = 'position:fixed;left:0;top:0';
        d.innerHTML = window.BabyCarte.mains(n);
        document.body.appendChild(d);
        const svg = d.querySelector('svg.baby-main'), g = svg.querySelector('g');
        svg.style.overflow = 'visible'; // on mesure le dessin entier, même ce qui dépasserait du cadre
        const cadre = svg.getBoundingClientRect(), dessin = g.getBoundingClientRect();
        if (dessin.left < cadre.left - 0.5) out.push(n + ' : coupée à gauche de ' + (cadre.left - dessin.left).toFixed(1));
        if (dessin.right > cadre.right + 0.5) out.push(n + ' : coupée à droite de ' + (dessin.right - cadre.right).toFixed(1));
        if (dessin.bottom > cadre.bottom + 0.5) out.push(n + ' : coupée en bas');
        d.remove();
      }
      return out;
    });
    expect(coupes).toEqual([]);
  });
});

test.describe('Les bulles : couleurs, tailles, position', () => {
  test('chaque chiffre a sa couleur et sa taille : plus il est grand, plus la bulle est grosse', async ({ page }) => {
    await ouvrir(page, 'bulles', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    await premiereQuestion(page);
    const bulles = await page.locator('#carte-gram .baby-jeton').evaluateAll((l) => l.map((b) => {
      const r = b.getBoundingClientRect(), cs = getComputedStyle(b);
      return { n: Number(b.textContent), w: Math.round(r.width), h: Math.round(r.height), fond: cs.backgroundImage, bord: cs.borderTopColor };
    }));
    expect(bulles.length).toBeGreaterThanOrEqual(3);
    const tri = bulles.slice().sort((a, b) => a.n - b.n);
    for (let i = 1; i < tri.length; i++) expect(tri[i].w, 'la bulle ' + tri[i].n + ' plus grosse que la ' + tri[i - 1].n).toBeGreaterThan(tri[i - 1].w);
    for (const b of bulles) expect(Math.abs(b.w - b.h)).toBeLessThanOrEqual(1); // rondes
    expect(new Set(bulles.map((b) => b.fond)).size).toBe(bulles.length); // une couleur par chiffre
    expect(new Set(bulles.map((b) => b.bord)).size).toBe(bulles.length);
    expect(await pasDebordement(page)).toBe(true);
    // Rien ne dépasse de l'arène et deux bulles ne se chevauchent pas.
    const dehors = await page.evaluate(() => {
      const a = document.querySelector('#carte-gram .baby-arene').getBoundingClientRect(), r = [...document.querySelectorAll('#carte-gram .baby-jeton')].map((b) => b.getBoundingClientRect()), out = [];
      r.forEach((x, i) => {
        if (x.left < a.left || x.right > a.right || x.top < a.top || x.bottom > a.bottom) out.push('bulle ' + i + ' dépasse');
        // Bulles rondes : elles se chevauchent si leurs centres sont plus proches que la somme des rayons.
        r.slice(i + 1).forEach((y, k) => {
          const d = Math.hypot((x.left + x.right) / 2 - (y.left + y.right) / 2, (x.top + x.bottom) / 2 - (y.top + y.bottom) / 2);
          if (d < (x.width + y.width) / 2) out.push('bulles ' + i + ' et ' + (i + 1 + k) + ' se chevauchent');
        });
      });
      return out;
    });
    expect(dehors).toEqual([]);
  });

  test('éclater une bulle ne remet pas les autres à leur place de départ ; une erreur non plus', async ({ page }) => {
    await ouvrir(page, 'bulles', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { calme: false }); // les bulles se baladent vraiment
    await premiereQuestion(page);
    const c = await page.evaluate(() => window.Aventura.partie.carte);
    const boite = page.locator('#carte-gram');
    // On marque les bulles : si la carte était redessinée, les marques disparaîtraient (et les bulles repartiraient de leur départ).
    await boite.locator('.baby-jeton').evaluateAll((l) => l.forEach((b) => { b.dataset.marque = 'oui'; }));
    // Une mauvaise bulle : elle tremble mais reste la même, et sa balade continue (elle ne saute pas à sa place de départ).
    const mauvaise = c.bon[c.bon.length - 1];
    await boite.locator('.baby-jeton', { hasText: new RegExp('^' + mauvaise + '$') }).click({ force: true });
    await expect(boite.locator('.baby-jeton[data-marque="oui"]')).toHaveCount(c.bon.length);
    const anim = await boite.locator('.baby-jeton', { hasText: new RegExp('^' + mauvaise + '$') }).evaluate((b) => getComputedStyle(b).animationName);
    expect(anim).toContain('baby-balade');
    await expect(page.locator('#carte-gram .baby-compte')).toContainText('1 erreur');
    // La bonne bulle : seule elle disparaît ; les autres gardent leur marque (même élément, même balade).
    await boite.locator('.baby-jeton', { hasText: new RegExp('^' + c.bon[0] + '$') }).click({ force: true });
    await expect(boite.locator('.baby-jeton')).toHaveCount(c.bon.length - 1);
    await expect(boite.locator('.baby-jeton[data-marque="oui"]')).toHaveCount(c.bon.length - 1);
    await expect(page.locator('#carte-gram .baby-compte')).toContainText('Éclatées : 1 / ' + c.bon.length);
  });
});

test.describe('Après la réponse (téléphone et tablette)', () => {
  test('bonne réponse : le plateau revient tout de suite, sans écran de question', async ({ page }) => {
    test.skip(test.info().project.name === 'ordinateur', 'plein écran de la question : téléphone et tablette');
    await ouvrir(page, 'doigts', [5]);
    await premiereQuestion(page);
    await expect(page.locator('body')).toHaveClass(/question-plein/);
    await page.locator('#carte-gram .gram-bouton[data-v="5"]').click();
    await expect(page.locator('#carte-reponse')).toContainText('Bravo !');
    await expect(page.locator('body')).not.toHaveClass(/question-plein/);
    await expect(page.locator('#plateau')).toBeInViewport({ ratio: 0.9 });
    await expect(page.locator('#carte-gram')).toBeHidden(); // le jeu ne prend plus de place
    expect(await pasDebordement(page)).toBe(true);
  });

  test('mauvaise réponse : le jeu se cache, la correction et « J\'ai compris » restent visibles sans défiler', async ({ page }) => {
    test.skip(test.info().project.name === 'ordinateur', 'plein écran de la question : téléphone et tablette');
    await ouvrir(page, 'doigts', [5]);
    await premiereQuestion(page);
    await page.locator('#carte-gram .gram-bouton:not([data-v="5"])').first().click();
    await expect(page.locator('#carte-reponse')).toContainText('Presque !');
    await expect(page.locator('body')).toHaveClass(/question-plein/);
    await expect(page.locator('#carte-gram')).toBeHidden();
    await expect(page.locator('#carte-reponse')).toBeInViewport({ ratio: 1 });
    const jai = page.getByRole('button', { name: 'J’ai compris' });
    await expect(jai).toBeInViewport({ ratio: 1 });
    expect(await pasDebordement(page)).toBe(true);
    await jai.click();
    await expect(page.locator('body')).not.toHaveClass(/question-plein/);
  });

  test('bulles terminées avec 2 erreurs : le message et « J\'ai compris » sont visibles', async ({ page }) => {
    test.skip(test.info().project.name === 'ordinateur', 'plein écran de la question : téléphone et tablette');
    await ouvrir(page, 'bulles', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    await premiereQuestion(page);
    const c = await page.evaluate(() => window.Aventura.partie.carte);
    const boite = page.locator('#carte-gram');
    const plus = c.bon[c.bon.length - 1];
    for (let i = 0; i < 2; i++) await boite.locator('.baby-jeton', { hasText: new RegExp('^' + plus + '$') }).click({ force: true });
    for (const v of c.bon) await boite.locator('.baby-jeton', { hasText: new RegExp('^' + v + '$') }).click({ force: true });
    await expect(page.locator('#carte-reponse')).toContainText('Presque !');
    await expect(page.getByRole('button', { name: 'J’ai compris' })).toBeInViewport({ ratio: 1 });
    await expect(page.locator('#carte-reponse')).toBeInViewport({ ratio: 1 });
  });
});

test.describe('Plateau sans bandeau, menu sur le plateau, plein écran', () => {
  test('pas de bandeau : le plateau est en haut, le menu est à droite sur le plateau et s\'ouvre', async ({ page }) => {
    await ouvrir(page, 'doigts', [5]);
    await expect(page.locator('#ecran-plateau .barre')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /Baby jeux|Le plateau/ })).toBeAttached(); // titre gardé pour les lecteurs d'écran
    const g = await page.evaluate(() => {
      const p = document.getElementById('plateau').getBoundingClientRect(), m = document.getElementById('btn-menu').getBoundingClientRect();
      return { hautPlateau: p.top, gaucheP: p.left, droiteP: p.right, hautM: m.top, gaucheM: m.left, droiteM: m.right, basM: m.bottom, basP: p.bottom };
    });
    expect(g.hautPlateau).toBeLessThanOrEqual(8); // le haut du plateau est en haut de l'écran
    expect(g.gaucheM).toBeGreaterThan((g.gaucheP + g.droiteP) / 2); // menu dans la moitié droite
    expect(g.droiteM).toBeLessThanOrEqual(g.droiteP + 1);
    expect(g.hautM).toBeGreaterThanOrEqual(g.hautPlateau);
    expect(g.basM).toBeLessThan(g.basP); // posé sur le plateau
    expect(await pasDebordement(page)).toBe(true);
    await page.locator('#btn-menu').click();
    await expect(page.locator('#menu-partie')).toBeVisible();
  });

  test('bouton plein écran : visible seulement si le navigateur sait le faire (caché sur iPhone)', async ({ page }) => {
    await page.addInitScript(() => { Object.defineProperty(document, 'fullscreenEnabled', { get: () => false }); Object.defineProperty(document, 'webkitFullscreenEnabled', { get: () => false }); });
    await ouvrir(page, 'doigts', [5]);
    await expect(page.locator('#btn-plein-ecran')).toBeHidden();
  });

  test('bouton plein écran : présent, nommé, et son état suit le plein écran', async ({ page }) => {
    await ouvrir(page, 'doigts', [5]);
    const possible = await page.evaluate(() => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled));
    test.skip(!possible, 'plein écran indisponible dans ce navigateur de test');
    const b = page.locator('#btn-plein-ecran');
    await expect(b).toBeVisible();
    await expect(b).toHaveAccessibleName('Plein écran');
    await expect(b).toHaveAttribute('aria-pressed', 'false');
    // v10.21 : le bouton est en bas à droite de l'écran, hors du plateau (voir tests/plein-ecran-coin.spec.js).
    const [bb, bp] = await Promise.all([b.boundingBox(), page.locator('#plateau').boundingBox()]);
    const croise = bb.x < bp.x + bp.width && bb.x + bb.width > bp.x && bb.y < bp.y + bp.height && bb.y + bb.height > bp.y;
    expect(croise).toBe(false);
    await page.evaluate(() => { document.fullscreenElement; });
    await b.click();
    // En test, le navigateur peut refuser : on vérifie seulement la cohérence de l'état affiché.
    await page.waitForTimeout(300);
    const etat = await page.evaluate(() => ({ plein: !!document.fullscreenElement, presse: document.getElementById('btn-plein-ecran').getAttribute('aria-pressed') }));
    expect(etat.presse).toBe(String(etat.plein));
  });
});
