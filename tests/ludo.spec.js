// Ludo, le guide (v6.9) : présentation au premier démarrage, didacticiel (bulle + flèche rouge),
// aide quand on touche Ludo pendant une partie.
const { test, expect } = require('@playwright/test');
const A = require('./aide');

const bulle = (page) => page.locator('#ludo-bulle');
const texte = (page) => page.locator('#ludo-texte');

// La flèche est visible et pointe sur l'élément (son centre horizontal tombe dans l'élément).
async function flecheSur(page, selecteur) {
  await expect(page.locator('#ludo-fleche')).toBeVisible();
  await expect.poll(async () => {
    const f = await page.locator('#ludo-fleche').boundingBox();
    const c = await page.locator(selecteur).first().boundingBox();
    const x = f.x + f.width / 2;
    return x >= c.x - 1 && x <= c.x + c.width + 1;
  }).toBe(true);
}

// La bulle ne cache aucun bouton d'action visible.
async function bulleSansBouton(page) {
  const b = await bulle(page).boundingBox();
  const boutons = page.locator('.etape:not([hidden]) .etape-actions .btn, #tour-actions .btn, .accueil-actions .btn');
  for (const el of await boutons.all()) {
    if (!(await el.isVisible())) continue;
    const r = await el.boundingBox();
    const chevauche = b.x < r.x + r.width && b.x + b.width > r.x && b.y < r.y + r.height && b.y + b.height > r.y;
    expect(chevauche, 'la bulle cache « ' + (await el.textContent()) + ' »').toBe(false);
  }
}

test('premier démarrage : Ludo se présente, « Non merci » ne le remontre plus', async ({ page }) => {
  await page.goto('./');
  await expect(texte(page)).toContainText('je suis Ludo');
  await expect(page.locator('#ludo-fleche')).toBeHidden();
  await page.getByRole('button', { name: 'Non merci' }).click();
  await expect(bulle(page)).toBeHidden();
  await page.reload();
  await page.waitForTimeout(500);
  await expect(bulle(page)).toBeHidden();
  // Le bouton de l'accueil relance le didacticiel.
  await page.getByRole('button', { name: 'Didacticiel avec Ludo' }).click();
  await expect(texte(page)).toContainText('Commencer l’aventure');
  await flecheSur(page, '#btn-commencer');
});

test('premier démarrage : « Commencer l’aventure » sans répondre referme la présentation', async ({ page }) => {
  await page.goto('./');
  await expect(bulle(page)).toBeVisible();
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await expect(bulle(page)).toBeHidden();
  await expect(page.locator('#ludo-bouton')).toBeVisible();
});

test('didacticiel : préparation et premier tour, flèche et bulle à chaque étape @smoke', async ({ page }) => {
  await A.rapide(page);
  await page.goto('./');
  await page.getByRole('button', { name: 'Oui, guide-moi' }).click();
  await flecheSur(page, '#btn-commencer');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();

  // Étape 1 : la flèche montre les nombres, puis « Valider » une fois le nombre touché.
  await expect(texte(page)).toContainText('Combien êtes-vous');
  await flecheSur(page, '.nb-joueurs');
  await page.locator('.nb-joueurs label').first().click();
  await flecheSur(page, '#btn-valider-nb');
  await bulleSansBouton(page);
  await A.valider(page);

  await expect(texte(page)).toContainText('choisis ton aventurier');
  await A.valider(page);

  await expect(texte(page)).toContainText('choisis ta matière');
  await flecheSur(page, '#matieres');
  await page.locator('#matieres input[value="francais"]').check();
  await expect(texte(page)).toContainText('Orthographe');
  await flecheSur(page, '#francais');
  await page.locator('#francais input[value="orthographe"]').check();
  await A.valider(page);

  await expect(texte(page)).toContainText('packs');
  await flecheSur(page, '#packs');
  await page.locator('#packs input').first().check();
  await flecheSur(page, '#btn-valider-reglages');
  await A.valider(page); // v6.16 : écran des questions
  await expect(texte(page)).toContainText('questions');
  // Téléphone carré : la bulle couvre une partie des questions (limite connue, ligne 91 du backlog) ;
  // le joueur touche une question visible, le test coche la première sans viser l'écran.
  await page.locator('#types-questions input').first().evaluate((i) => i.click());
  await flecheSur(page, '#btn-valider-reglages');
  await bulleSansBouton(page);
  await A.valider(page);

  await expect(texte(page)).toContainText('Choisissez votre aventure');
  await page.getByRole('button', { name: 'Lancer la partie' }).click();

  // Premier tour : piocher, répondre, « J'ai compris », dé.
  await expect(texte(page)).toContainText('Piocher une carte');
  await flecheSur(page, '#tour-actions .btn');
  await bulleSansBouton(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(texte(page)).toContainText('Bonne réponse');
  await bulleSansBouton(page);
  await page.getByRole('button', { name: 'Mauvaise réponse' }).click();
  await expect(texte(page)).toContainText('J’ai compris');
  await page.getByRole('button', { name: 'J’ai compris' }).click();

  // Après le premier tour, Ludo félicite et le didacticiel s'arrête.
  await expect(texte(page)).toContainText('tu sais jouer', { timeout: 15000 });
  await page.getByRole('button', { name: 'Compris' }).click();
  await expect(bulle(page)).toBeHidden();
  expect(await page.evaluate(() => sessionStorage.getItem('ludo-tuto'))).toBeNull();
});

test('pendant une partie : toucher Ludo donne l’aide de l’étape, qui se referme une fois l’action faite', async ({ page }) => {
  await A.lancerPartie(page, { joueurs: 2 });
  const ludo = page.getByRole('button', { name: /Ludo, ton guide/ });
  await expect(ludo).toBeVisible();
  // Ludo, dans le pied de page, ne recouvre aucun bouton.
  const l = await ludo.boundingBox();
  for (const el of await page.locator('.btn, .btn-retour').all()) {
    if (!(await el.isVisible())) continue;
    const r = await el.boundingBox();
    expect(l.x < r.x + r.width && l.x + l.width > r.x && l.y < r.y + r.height && l.y + l.height > r.y).toBe(false);
  }
  await ludo.click();
  await expect(texte(page)).toContainText('Piocher une carte');
  await flecheSur(page, '#tour-actions .btn');
  await bulleSansBouton(page);
  // « Compris » referme la bulle.
  await page.getByRole('button', { name: 'Compris' }).click();
  await expect(bulle(page)).toBeHidden();
  await expect(page.locator('#ludo-fleche')).toBeHidden();
  // L'action faite referme aussi l'aide.
  await ludo.click();
  await expect(bulle(page)).toBeVisible();
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(bulle(page)).toBeHidden();
});

test('didacticiel : continue après un rechargement de la page', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Oui, guide-moi' }).click();
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await expect(texte(page)).toContainText('Combien êtes-vous');
  await page.reload();
  await expect(texte(page)).toContainText('Combien êtes-vous');
  await page.getByRole('button', { name: 'Arrêter le guide' }).click();
  await expect(bulle(page)).toBeHidden();
});

// v6.10 (demande du 04/11/2026) : sur l'accueil, la bulle ne cache ni la tête de Ludo ni l'arche.
for (const taille of [null, { width: 360, height: 640 }, { width: 915, height: 412 }]) {
  test('accueil : la bulle laisse voir la tête de Ludo et l’arche' + (taille ? ' (' + taille.width + '×' + taille.height + ')' : ''), async ({ page }, info) => {
    if (taille && info.project.name !== 'telephone') test.skip();
    if (taille) await page.setViewportSize(taille);
    await page.goto('./');
    for (const etape of ['presentation', 'didacticiel']) {
      if (etape === 'didacticiel') await page.getByRole('button', { name: 'Oui, guide-moi' }).click();
      await expect(bulle(page)).toBeVisible();
      await page.waitForTimeout(300);
      const m = await page.evaluate(() => {
        const r = (el) => el.getBoundingClientRect();
        const b = r(document.getElementById('ludo-bulle'));
        const p = r(document.querySelector('.calque.perso'));
        const a = r(document.querySelector('.calque.arche'));
        const tete = { left: p.left + p.width * 0.2, right: p.left + p.width * 0.72, top: p.top, bottom: p.top + p.height * 0.27 };
        const commun = (x, y) => Math.max(0, Math.min(x.right, y.right) - Math.max(x.left, y.left)) * Math.max(0, Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top));
        return { tete: commun(b, tete), arche: commun(b, a) / (a.width * a.height) };
      });
      expect(m.tete, 'la bulle cache la tête de Ludo').toBe(0);
      expect(m.arche, 'la bulle cache l’arche').toBeLessThan(0.03);
    }
  });
}
