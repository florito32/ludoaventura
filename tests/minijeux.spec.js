// Mode « Mini-jeux » (v10.41, demande du 24/11/2026) : l'accueil propose « Mini-jeux » (à la place de Baby jeux, après Partie
// rapide solo) ; le joueur choisit un mini-jeu, son profil (« Qui joue ? »), joue, et gagne 10 étoiles par partie terminée,
// sans plateau, sans pion, sans matière ni progression.
const { test, expect } = require('@playwright/test');
const { rapide, creerJoueurs, quiJoue } = require('./aide');

async function accueil(page) {
  await rapide(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await creerJoueurs(page, 1);
}
const compte = (page) => page.evaluate(() => { const e = JSON.parse(localStorage.getItem('ludoaventura-etoiles')); return { total: e.total, joueurs: e.joueurs.map((j) => ({ st: j.st || null, niv: j.niv || null })) }; });
// Fabrique un mot (deux touches), le fait lire, puis « J'ai fini ».
async function jouerFabrique(page) {
  await page.locator('.baby-touche').first().click();
  await page.locator('.baby-lire').click();
  await page.locator('.baby-fini').click();
}
const debordements = (page) => page.evaluate(() => {
  const w = window.innerWidth, out = [];
  if (document.documentElement.scrollWidth > w + 1) out.push('page large : ' + document.documentElement.scrollWidth + ' > ' + w);
  document.querySelectorAll('.ecran:not([hidden]) button').forEach((e) => { const r = e.getBoundingClientRect(); if (r.width && (r.right > w + 1 || r.left < -1)) out.push((e.textContent || '').trim().slice(0, 20)); });
  return out.slice(0, 5);
});

test('l’accueil propose « Mini-jeux » après « Défi du jour », sans « Partie rapide solo » ni « Baby jeux » @smoke', async ({ page }) => {
  await accueil(page);
  await expect(page.locator('#btn-minijeux')).toBeVisible();
  await expect(page.locator('#btn-minijeux')).toContainText('Mini-jeux');
  await expect(page.locator('#btn-baby')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Baby jeux/ })).toHaveCount(0);
  const ordre = await page.evaluate(() => ['btn-defi', 'btn-minijeux'].map((id) => document.getElementById(id).getBoundingClientRect().top));
  expect(ordre[1]).toBeGreaterThan(ordre[0]);
  await expect(page.locator('#btn-rapide')).toHaveCount(0); // ligne 519 : partie rapide retirée
});

test('Mini-jeux : la liste, « Qui joue ? », la fabrique à mots et +10 étoiles sans toucher à la progression @smoke', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  await page.locator('#btn-minijeux').click();
  await expect(page.getByRole('heading', { name: 'Mini-jeux' })).toBeVisible();
  const carte = page.locator('.minijeu-carte[data-jeu="fabrique"]');
  await expect(page.locator('.minijeu-carte')).toHaveCount(6); // La fabrique à mots, Les sons (v10.43), Course aux étoiles, Aventure des multiplications (v10.47), Quiz (v10.51), Chasse aux lettres (v10.54)
  await expect(carte).toContainText('La fabrique à mots');
  await expect(carte).not.toContainText('+10'); // v10.54 : la tuile ne dit que le nom (les étoiles sont dites en haut de l'écran)
  expect(await debordements(page)).toEqual([]);
  await carte.click();
  await quiJoue(page); // un seul profil, pour les étoiles
  await expect(page.locator('#ecran-minijeu')).toBeVisible();
  await expect(page.locator('#titre-minijeu')).toHaveText('La fabrique à mots');
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeHidden(); // pas de plateau
  // « J'ai fini » est bloqué tant que le mot n'est pas lu.
  await expect(page.locator('.baby-fini')).toBeDisabled();
  expect(await debordements(page)).toEqual([]);
  await jouerFabrique(page);
  await expect(page.locator('.minijeu-fin')).toContainText('+10 étoiles');
  const apres = await compte(page);
  expect(apres.total - avant.total).toBe(10);
  // Aucun niveau, aucune statistique de matière.
  expect(apres.joueurs.map((j) => j.niv)).toEqual(avant.joueurs.map((j) => j.niv));
  expect(apres.joueurs.map((j) => j.st)).toEqual(avant.joueurs.map((j) => j.st));
  expect(await debordements(page)).toEqual([]);
  // Rejouer : une nouvelle partie, qui rapporte encore 10 étoiles ; « Autres mini-jeux » revient à la liste.
  await page.locator('#minijeu-rejouer').click();
  await expect(page.locator('.baby-fini')).toBeDisabled();
  await jouerFabrique(page);
  expect((await compte(page)).total - avant.total).toBe(20);
  // « Retour à l'accueil » (v10.54, tous les mini-jeux) : l'écran de fin propose aussi d'aller directement à l'accueil.
  await expect(page.locator('#minijeu-accueil')).toBeVisible();
  expect(await debordements(page)).toEqual([]);
  await page.locator('#minijeu-accueil').click();
  await expect(page.locator('#ecran-accueil')).toBeVisible();
  await page.locator('#btn-minijeux').click();
  await expect(page.locator('.minijeu-carte').first()).toBeVisible();
});

test('Mini-jeux : le bouton retour revient à la liste sans étoiles, la liste revient à l’accueil', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  await page.locator('#btn-minijeux').click();
  await page.locator('.minijeu-carte[data-jeu="fabrique"]').click();
  await quiJoue(page);
  await page.locator('#minijeu-retour').click(); // partie abandonnée : rien gagné
  await expect(page.locator('.minijeu-carte').first()).toBeVisible();
  expect((await compte(page)).total).toBe(avant.total);
});
