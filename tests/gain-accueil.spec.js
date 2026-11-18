// v9.8 (demande du 17/11/2026) : en revenant à l'accueil après une partie gagnée, « ⭐ +N étoiles » reste au centre
// de l'écran (sans encadré) et les étoiles s'envolent vers le compteur, qui grandit au fur et à mesure.
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

test('accueil : les étoiles gagnées partent du centre vers le compteur, qui grandit pendant n/10 s', async ({ page }) => {
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
  // Le compteur part de 80 et passe par des valeurs intermédiaires.
  const total = page.locator('#accueil-total');
  await expect.poll(async () => Number(await total.textContent()), { intervals: [50] }).toBeGreaterThan(80);
  const milieu = Number(await total.textContent());
  expect(milieu).toBeLessThan(100);
  await expect(page.locator('.etoile-volante').first()).toBeAttached();
  await expect(total).toHaveText('100', { timeout: 6000 });
  // 20 étoiles = 2 secondes (après le rechargement et 0,25 s de mise en place).
  expect(Date.now() - debut).toBeGreaterThan(2000);
  await expect(gain).toHaveCount(0);
  await expect(page.locator('.etoile-volante')).toHaveCount(0);
  // Une seule fois : un nouveau rechargement n'anime plus rien.
  await page.reload();
  await expect(total).toHaveText('100');
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
  // Pas de débordement horizontal.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('gros gain : 200 étoiles arrivent en 3 secondes au plus (v10.0), le compteur grandit au fur et à mesure', async ({ page }) => {
  await page.goto('./');
  await page.evaluate((etat) => {
    localStorage.setItem('ludo-vu', '1');
    localStorage.setItem('ludoaventura-etoiles', etat);
    sessionStorage.setItem('ludoaventura-gain-accueil', JSON.stringify({ n: 200 }));
  }, ETAT(500));
  await page.reload();
  await expect(page.locator('.gain-accueil')).toHaveText('+200 étoiles');
  const t0 = Date.now();
  const total = page.locator('#accueil-total');
  await expect.poll(async () => Number(await total.textContent()), { intervals: [50] }).toBeGreaterThan(300);
  expect(Number(await total.textContent())).toBeLessThan(500);
  await expect(total).toHaveText('500', { timeout: 5000 });
  expect(Date.now() - t0).toBeLessThan(3800);
  expect(Date.now() - t0).toBeGreaterThan(2000);
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
});

test('fin de partie → « Retour à l’accueil » : animation et total exact', async ({ page }) => {
  const pts = await gagner(page);
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(page.locator('.gain-accueil')).toHaveText('+' + pts + ' étoiles');
  await expect(page.locator('#accueil-total')).toHaveText(String(pts), { timeout: 8000 });
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
  expect(await page.evaluate(() => window.Recompenses.compte.etat.total)).toBe(pts);
});

test('fin de partie → « Rejouer » : étoiles comptées sans animation', async ({ page }) => {
  const pts = await gagner(page);
  await page.getByRole('button', { name: 'Rejouer cette aventure' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  expect(await page.evaluate(() => sessionStorage.getItem('ludoaventura-gain-accueil'))).toBeNull();
  expect(await page.evaluate(() => window.Recompenses.compte.etat.total)).toBe(pts);
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
});

// ---------- v10.3 : coffres ----------
// Plusieurs coffres à ouvrir : coffre du jour + niveaux 2, 3, 4 (simples) et 5 (argent).
async function accueilAvecCoffres(page, total = 175) {
  await page.addInitScript(([etat]) => {
    window.AVENTURA_DUREE_COFFRE = 0;
    try { localStorage.setItem('ludo-vu', '1'); if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', etat); } catch (e) { /* */ }
  }, [ETAT(total)]);
  await page.goto('./');
  await expect(page.locator('#btn-commencer')).toBeVisible();
}
// Ouvre tous les coffres de la file, l'un après l'autre, puis ferme la fenêtre.
async function ouvrirTous(page) {
  const fenetre = page.locator('#coffre');
  let ouverts = 0;
  for (let k = 0; k < 12; k++) {
    await page.locator('#btn-coffre-ouvrir').click();
    ouverts++;
    // Attend la fin de l'ouverture : « Coffre suivant » ou « Super ! » apparaît.
    await page.locator('#btn-coffre-suivant:visible, #btn-coffre-fermer:visible').first().waitFor();
    if (await page.locator('#btn-coffre-fermer').isVisible()) break;
    await page.locator('#btn-coffre-suivant').click();
  }
  await page.locator('#btn-coffre-fermer').click();
  await expect(fenetre).toBeHidden();
  return ouverts;
}

test('coffres : le cumul des étoiles de tous les coffres ouverts s\'envole d\'un coup vers le compteur', async ({ page }) => {
  await accueilAvecCoffres(page);
  const total = page.locator('#accueil-total');
  await expect(total).toHaveText('175');
  await page.locator('#btn-coffre-haut').click();
  await expect(page.locator('#coffre')).toBeVisible();
  const ouverts = await ouvrirTous(page);
  expect(ouverts).toBeGreaterThan(1);
  const apres = await page.evaluate(() => window.Recompenses.compte.etat.total);
  const gain = apres - 175;
  expect(gain).toBeGreaterThan(0);
  // Un seul « +N étoiles » : la somme de tous les coffres ; le compteur ne montait pas pendant les ouvertures.
  await expect(page.locator('.gain-accueil')).toHaveCount(1);
  await expect(page.locator('.gain-accueil')).toHaveText('+' + gain + ' étoiles');
  expect(Number(await total.textContent())).toBeLessThan(apres);
  await expect(total).toHaveText(String(apres), { timeout: 6000 });
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
});

test('coffre ouvert ailleurs que sur l\'accueil : l\'envol attend le retour à l\'accueil', async ({ page }) => {
  await accueilAvecCoffres(page, 40);
  await page.locator('#btn-etoiles-haut').click();
  await expect(page.locator('#ecran-etoiles')).toBeVisible();
  await page.evaluate(() => window.Recompenses.ouvrirCoffres(window.Recompenses.compte.coffresAOuvrir()));
  await ouvrirTous(page);
  await expect(page.locator('.gain-accueil')).toHaveCount(0); // pas d'accueil à l'écran : rien ne vole
  const apres = await page.evaluate(() => window.Recompenses.compte.etat.total);
  await page.locator('#ecran-etoiles [data-retour-accueil]').first().click();
  await expect(page.locator('.gain-accueil')).toHaveText('+' + (apres - 40) + ' étoiles');
  await expect(page.locator('#accueil-total')).toHaveText(String(apres), { timeout: 6000 });
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
});

test('coffres : l\'envol ne se rejoue pas (rien ne reste en attente, même après rechargement)', async ({ page }) => {
  await accueilAvecCoffres(page);
  await page.locator('#btn-coffre-haut').click();
  await ouvrirTous(page);
  await expect(page.locator('.gain-accueil')).toHaveCount(1);
  await expect(page.locator('.gain-accueil')).toHaveCount(0, { timeout: 8000 });
  expect(await page.evaluate(() => sessionStorage.getItem('ludoaventura-gain-accueil'))).toBeNull();
  const apres = await page.evaluate(() => window.Recompenses.compte.etat.total);
  await page.reload();
  await expect(page.locator('#accueil-total')).toHaveText(String(apres));
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
});

test('coffre ouvert sur l\'écran de fin : un seul envol pour la partie et le coffre ensemble', async ({ page }) => {
  await page.addInitScript(([etat]) => {
    window.AVENTURA_DUREE_COFFRE = 0;
    try { if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', etat); } catch (e) { /* */ }
  }, [ETAT(175)]);
  await gagner(page);
  await page.getByRole('button', { name: 'Ouvrir le coffre d’argent' }).click();
  await ouvrirTous(page);
  const fin = await page.evaluate(() => window.Recompenses.compte.etat.total);
  expect(await page.locator('.gain-accueil').count()).toBe(0); // pas d'accueil à l'écran : rien ne vole encore
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(page.locator('.gain-accueil')).toHaveText('+' + (fin - 175) + ' étoiles');
  await expect(page.locator('#accueil-total')).toHaveText(String(fin), { timeout: 6000 });
  await expect(page.locator('.gain-accueil')).toHaveCount(0);
});
