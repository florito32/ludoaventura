// Parcours principal : niveau → carte → défis → trésor, sur téléphone, téléphone carré, tablette et ordinateur.
const { test, expect } = require('@playwright/test');
const { repondre, jouerLieu } = require('./aide');

const lieu = (page, n) => page.locator('#lieux button').nth(n);

async function commencer(page, niveau = 'Moussaillon') {
  await page.goto('./');
  await page.getByRole('radio', { name: new RegExp('^' + niveau + ' ') }).check();
  await page.getByRole('button', { name: 'Partir à l\'aventure' }).click();
  await expect(page.getByRole('heading', { name: 'Carte de l\'île' })).toBeVisible();
}

test('accueil : titre et 4 niveaux @smoke', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('L\'île aux calculs');
  await expect(page.getByRole('radio')).toHaveCount(4);
  await expect(page.getByRole('radio').first()).toBeChecked();
});

test('carte : seul le premier lieu est ouvert au départ', async ({ page }) => {
  await commencer(page);
  await expect(page.locator('#lieux button')).toHaveCount(5);
  await expect(lieu(page, 0)).toBeEnabled();
  for (let i = 1; i < 5; i++) await expect(lieu(page, i)).toBeDisabled();
});

test('un lieu réussi (5/5) donne 3 étoiles et ouvre le suivant', async ({ page }) => {
  await commencer(page);
  await lieu(page, 0).click();
  await expect(page.getByRole('heading', { name: 'La plage' })).toBeVisible();
  await jouerLieu(page, 5);
  await expect(page.getByRole('heading', { name: 'La plage : réussi !' })).toBeVisible();
  await expect(page.locator('#bilan-etoiles')).toContainText('3 étoiles sur 3');
  await page.getByRole('button', { name: 'Retour à la carte' }).click();
  await expect(lieu(page, 1)).toBeEnabled();
  await expect(page.locator('#total-etoiles-n')).toHaveText('3');
});

test('mauvaise réponse : correction affichée, puis question suivante', async ({ page }) => {
  await commencer(page);
  await lieu(page, 0).click();
  const { texte, bonne } = await repondre(page, false);
  await expect(page.locator('#defi-retour')).toHaveText(`Presque ! ${texte.replace(' = ?', '')} = ${bonne}`);
  await expect(page.locator('#defi-choix button.juste')).toHaveText(bonne);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(page.locator('#defi-compteur')).toHaveText('Question 2 sur 5');
});

test('moins de 3 bonnes réponses : le lieu suivant reste fermé', async ({ page }) => {
  await commencer(page);
  await lieu(page, 0).click();
  await jouerLieu(page, 2);
  await expect(page.getByRole('heading', { name: 'Encore un effort !' })).toBeVisible();
  await page.getByRole('button', { name: 'Retour à la carte' }).click();
  await expect(lieu(page, 1)).toBeDisabled();
});

test('les 5 lieux réussis mènent au trésor, et la progression est gardée', async ({ page }) => {
  test.setTimeout(90_000);
  await commencer(page, 'Capitaine');
  for (let i = 0; i < 5; i++) {
    await lieu(page, i).click();
    await jouerLieu(page, i === 4 ? 5 : 3);
    if (i < 4) await page.getByRole('button', { name: 'Retour à la carte' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Trésor trouvé !' })).toBeVisible();
  await expect(page.locator('#tresor-texte')).toContainText('7 étoiles sur 15');
  // En rouvrant le jeu, on retrouve directement sa carte.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Carte de l\'île' })).toBeVisible();
  for (let i = 0; i < 5; i++) await expect(lieu(page, i)).toBeEnabled();
});

test('clavier : les touches 1 à 4 répondent', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'clavier testé sur ordinateur');
  await commencer(page);
  await lieu(page, 0).click();
  await page.keyboard.press('2');
  await expect(page.locator('#defi-choix button').first()).toBeDisabled();
});

test('affichage : pas de défilement horizontal, lieux visibles et sans chevauchement', async ({ page }) => {
  await commencer(page);
  // Débloque tous les lieux pour afficher tous les noms.
  await page.evaluate(() => localStorage.setItem('ludoaventura-progression',
    JSON.stringify({ niveau: 'moussaillon', progression: { moussaillon: [3, 2, 1, 1, 0] } })));
  await page.reload();
  const largeur = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(largeur[0]).toBeLessThanOrEqual(largeur[1]);
  const boites = [];
  for (let i = 0; i < 5; i++) {
    const p = await lieu(page, i).locator('.lieu-pastille').boundingBox();
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x + p.width).toBeLessThanOrEqual(largeur[1]);
    boites.push(await lieu(page, i).boundingBox());
  }
  for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) {
    const A = boites[a], B = boites[b];
    const chevauche = A.x < B.x + B.width && B.x < A.x + A.width && A.y < B.y + B.height && B.y < A.y + A.height;
    expect(chevauche, `lieux ${a + 1} et ${b + 1}`).toBe(false);
  }
});

test('défi : les 4 réponses sont visibles sans défilement', async ({ page }) => {
  await commencer(page);
  await lieu(page, 0).click();
  const h = page.viewportSize().height;
  for (let i = 0; i < 4; i++) {
    const b = await page.locator('#defi-choix button').nth(i).boundingBox();
    expect(b.y + b.height, `réponse ${i + 1}`).toBeLessThanOrEqual(h);
  }
});
