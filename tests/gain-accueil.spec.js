// v9.8 (demande du 17/11/2026) : en revenant à l'accueil après une partie gagnée, « ⭐ +N étoiles » reste au centre
// de l'écran (sans encadré) et les étoiles s'envolent vers le compteur, qui grandit au fur et à mesure.
// v10.30 (backlog ligne 453) : plus de compteur sur l'accueil ; les étoiles volent vers le bouton « Mon compte ».
// Les coffres s'ouvrent dans la carte du joueur : plus d'envol vers l'accueil après un coffre.
// Durée : 1 seconde pour 10 étoiles. « Rejouer » : pas d'animation, les étoiles sont déjà dans le compte.
const { test, expect } = require('@playwright/test');
const { repondre, lancerPartie, lancerLeDe } = require('./aide');

const ETAT = (total) => JSON.stringify({ v: 1, total, journal: [], parJour: {}, coffresJour: {}, coffresNiveau: {}, defis: {}, parties: [] });

async function gagner(page) {
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await lancerPartie(page, { joueurs: 1 });
  for (let t = 0; t < 5; t++) {
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    await repondre(page, true);
    await lancerLeDe(page);
  }
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  return page.evaluate(() => window.Aventura.partie.regles.points);
}

// Centre de l'élément (pour vérifier où arrivent les étoiles volantes).
const centre = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

test('accueil : les étoiles gagnées partent du centre vers le bouton du compte, pendant n/10 s', async ({ page }) => {
  await page.goto('./');
  await page.evaluate((etat) => {
    localStorage.setItem('ludo-vu', '1');
    localStorage.setItem('ludoaventura-etoiles', etat);
    sessionStorage.setItem('ludoaventura-gain-accueil', JSON.stringify({ n: 20 }));
  }, ETAT(100));
  const debut = Date.now();
  await page.reload();
  const gain = page.locator('.gain-accueil');
  await expect(gain).toBeVisible();
  await expect(gain).toHaveText('+20 étoiles');
  // Pas d'encadré : ni bordure ni fond.
  const style = await gain.evaluate((e) => { const s = getComputedStyle(e); return s.borderTopWidth + ' ' + s.backgroundColor; });
  expect(style).toBe('0px rgba(0, 0, 0, 0)');
  // Au centre de l'écran, sans dépasser.
  const b = await gain.boundingBox(), v = page.viewportSize();
  expect(Math.abs(b.x + b.width / 2 - v.width / 2)).toBeLessThan(4);
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(v.width);
  // Des étoiles volent ; le bouton du compte « reçoit » (petit rebond).
  await expect(page.locator('.etoile-volante').first()).toBeAttached();
  await expect(page.locator('#btn-compte')).toHaveClass(/recoit/, { timeout: 4000 });
  await expect(gain).toHaveCount(0, { timeout: 6000 });
  // 20 étoiles = 2 secondes (après le rechargement et 0,25 s de mise en place).
  expect(Date.now() - debut).toBeGreaterThan(2000);
  await expect(page.locator('.etoile-volante')).toHaveCount(0);
  // Aucun nombre n'apparaît sur l'accueil (ligne 453).
  await expect(page.locator('#accueil-total')).toHaveCount(0);
  // Une seule fois : un nouveau rechargement n'anime plus rien.
  await page.reload();
  await expect(page.locator('#btn-commencer')).toBeVisible();
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('les étoiles volantes arrivent sur le bouton « Mon compte »', async ({ page }) => {
  await page.goto('./');
  await page.evaluate((etat) => {
    localStorage.setItem('ludo-vu', '1');
    localStorage.setItem('ludoaventura-etoiles', etat);
    sessionStorage.setItem('ludoaventura-gain-accueil', JSON.stringify({ n: 10 }));
  }, ETAT(100));
  await page.reload();
  await expect(page.locator('.etoile-volante').first()).toBeAttached();
  // Fin du vol (transform final) : on mesure là où l'étoile arrive, au moment où elle arrive.
  const arrivee = await page.evaluate(() => new Promise((ok) => {
    const s = document.querySelector('.etoile-volante');
    const a = s.getAnimations()[0];
    a.pause(); a.currentTime = a.effect.getComputedTiming().duration - 1;
    const r = s.getBoundingClientRect(); a.play();
    ok({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }));
  const cible = centre(await page.locator('#btn-compte .ico').boundingBox());
  expect(Math.abs(arrivee.x - cible.x)).toBeLessThan(12);
  expect(Math.abs(arrivee.y - cible.y)).toBeLessThan(12);
});

test('gros gain : 200 étoiles arrivent en 3 secondes au plus (v10.0)', async ({ page }) => {
  await page.goto('./');
  await page.evaluate((etat) => {
    localStorage.setItem('ludo-vu', '1');
    localStorage.setItem('ludoaventura-etoiles', etat);
    sessionStorage.setItem('ludoaventura-gain-accueil', JSON.stringify({ n: 200 }));
  }, ETAT(500));
  await page.reload();
  await expect(page.locator('.gain-accueil')).toHaveText('+200 étoiles');
  const t0 = Date.now();
  await expect(page.locator('.gain-accueil')).toHaveCount(0, { timeout: 6000 });
  expect(Date.now() - t0).toBeLessThan(4000);
  expect(Date.now() - t0).toBeGreaterThan(2000);
});

test('fin de partie → « Retour à l’accueil » : animation, étoiles dans la carte du joueur', async ({ page }) => {
  const pts = await gagner(page);
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(page.locator('.gain-accueil')).toHaveText('+' + pts + ' étoiles');
  await expect(page.locator('.gain-accueil')).toHaveCount(0, { timeout: 8000 });
  expect(await page.evaluate(() => window.Recompenses.compte.etat.total)).toBe(pts);
  await page.locator('#btn-compte').click();
  await expect(page.locator('.joueur-carte').first().locator('.jt-etoiles strong')).toHaveText(String(pts));
});

test('fin de partie → « Rejouer » : étoiles comptées sans animation', async ({ page }) => {
  const pts = await gagner(page);
  await page.getByRole('button', { name: 'Rejouer cette aventure' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  expect(await page.evaluate(() => sessionStorage.getItem('ludoaventura-gain-accueil'))).toBeNull();
  expect(await page.evaluate(() => window.Recompenses.compte.etat.total)).toBe(pts);
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
});

// v10.30 : les coffres s'ouvrent dans la carte du joueur (Mon compte) ; leurs étoiles sortent du coffre dans la fenêtre,
// et rien n'attend plus de s'envoler vers l'accueil (qui n'a plus de compteur).
test('coffres ouverts depuis la carte du joueur : pas d\'envol en revenant à l\'accueil', async ({ page }) => {
  await page.addInitScript(([etat]) => {
    window.AVENTURA_DUREE_COFFRE = 0;
    try { localStorage.setItem('ludo-vu', '1'); if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', etat); } catch (e) { /* */ }
  }, [ETAT(175)]);
  await page.goto('./');
  await page.locator('#btn-compte').click();
  await page.locator('.joueur-carte [data-act="coffres"]').first().click();
  for (let k = 0; k < 12; k++) {
    await page.locator('#btn-coffre-ouvrir').click();
    await page.locator('#btn-coffre-suivant:visible, #btn-coffre-fermer:visible').first().waitFor();
    if (await page.locator('#btn-coffre-fermer').isVisible()) break;
    await page.locator('#btn-coffre-suivant').click();
  }
  await page.locator('#btn-coffre-fermer').click();
  await expect(page.locator('#coffre')).toBeHidden();
  const apres = await page.evaluate(() => window.Recompenses.compte.etat.total);
  expect(apres).toBeGreaterThan(175);
  await page.locator('.joueur-carte').first().locator('.stats-btn').click(); // v10.32 : étoiles dans « Statistiques »
  await expect(page.locator('.joueur-carte').first().locator('.jt-etoiles strong')).toHaveText(String(apres));
  await expect(page.locator('.joueur-carte [data-act="coffres"]')).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem('ludoaventura-gain-accueil'))).toBeNull();
  await page.locator('#ecran-compte [data-retour-accueil]').click();
  await expect(page.locator('#btn-commencer')).toBeVisible();
  await page.waitForTimeout(400);
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
});

// v10.22 (demande du 18/11/2026, 15 h 36) : « +N étoiles » au centre de l'accueil se lisait mal sur le bouton rouge
// « Commencer l'aventure » (texte rouge). Il est maintenant jaune clair avec un contour brun foncé.
test('accueil : « +N étoiles » est jaune clair à contour foncé, lisible sur le bouton rouge (v10.22)', async ({ page }) => {
  await page.goto('./');
  await page.evaluate((etat) => {
    localStorage.setItem('ludo-vu', '1');
    localStorage.setItem('ludoaventura-etoiles', etat);
    sessionStorage.setItem('ludoaventura-gain-accueil', JSON.stringify({ n: 18 }));
  }, ETAT(100));
  await page.reload();
  const texte = page.locator('.gain-accueil strong');
  await expect(texte).toBeVisible();
  const s = await texte.evaluate((e) => { const c = getComputedStyle(e); return { couleur: c.color, contour: parseFloat(c.webkitTextStrokeWidth), couleurContour: c.webkitTextStrokeColor }; });
  const [r, g, b] = s.couleur.match(/\d+/g).map(Number);
  // Texte clair (pas le rouge d'avant) ...
  expect(r).toBeGreaterThan(220); expect(g).toBeGreaterThan(200); expect(b).toBeGreaterThan(120);
  // ... entouré d'un contour foncé épais : lisible sur le ciel, l'herbe et le rouge.
  expect(s.contour).toBeGreaterThan(2);
  const [r2, g2, b2] = s.couleurContour.match(/\d+/g).map(Number);
  expect(r2 + g2 + b2).toBeLessThan(250);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
