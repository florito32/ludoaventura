// Mini-jeux : liste en petites tuiles avec pastille « i » (v10.54, demande du 25/11/2026).
// Une tuile = l'icône et le nom, rien d'autre ; la pastille « i » (ronde, fond rouge, « i » blanc) ouvre une fenêtre avec le nom du jeu,
// son explication et une capture d'écran de la partie (img/minijeux/<id>.webp) ; la fenêtre se ferme (Fermer, Échap, clic à côté).
// Vaut pour tous les jeux de Minijeux.JEUX, y compris ceux qui viendront.
const { test, expect } = require('@playwright/test');
const { rapide, creerJoueurs, quiJoue } = require('./aide');

async function liste(page) {
  await rapide(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await creerJoueurs(page, 1);
  await page.locator('#btn-minijeux').click();
  await expect(page.locator('.minijeu-carte').first()).toBeVisible();
}
const debordements = (page) => page.evaluate(() => {
  const w = window.innerWidth, out = [];
  if (document.documentElement.scrollWidth > w + 1) out.push('page large : ' + document.documentElement.scrollWidth + ' > ' + w);
  document.querySelectorAll('.minijeu-case').forEach((c) => {
    const r = c.getBoundingClientRect(), b = c.querySelector('.minijeu-info').getBoundingClientRect(), n = c.querySelector('.minijeu-nom');
    if (r.right > w + 1 || r.left < -1 || b.right > w + 1 || b.left < -1) out.push('hors écran : ' + c.textContent.trim());
    if (n.scrollWidth > n.clientWidth + 1) out.push('nom coupé : ' + n.textContent);
  });
  return out;
});

test('Mini-jeux : de petites tuiles (icône + nom), une pastille « i » ronde à fond rouge à côté de chacune @smoke', async ({ page }) => {
  await liste(page);
  const jeux = await page.evaluate(() => window.Minijeux.JEUX.map((j) => ({ id: j.id, nom: j.nom })));
  await expect(page.locator('.minijeu-carte')).toHaveCount(jeux.length);
  await expect(page.locator('.minijeu-info')).toHaveCount(jeux.length);
  for (const j of jeux) {
    const tuile = page.locator('.minijeu-carte[data-jeu="' + j.id + '"]');
    await expect(tuile).toHaveText(new RegExp('^\\s*\\S*\\s*' + j.nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$')); // l'icône et le nom, rien d'autre
    await expect(tuile).not.toContainText('+10');
    const t = await tuile.boundingBox();
    expect(t.width).toBeLessThanOrEqual(130); // petite tuile : on en voit beaucoup d'un coup
    expect(t.height).toBeLessThanOrEqual(110);
    const i = page.locator('.minijeu-info[data-info="' + j.id + '"]');
    await expect(i).toHaveText('i');
    await expect(i).toHaveAccessibleName(/Comment on joue à .+ \?/);
    const style = await i.evaluate((e) => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return { fond: s.backgroundColor, texte: s.color, rond: s.borderRadius, l: Math.round(r.width), h: Math.round(r.height) }; });
    expect(style.fond).toBe('rgb(227, 38, 42)');
    expect(style.texte).toBe('rgb(255, 255, 255)');
    expect(style.rond).toBe('50%');
    expect(style.l).toBe(style.h);
    expect(style.l).toBeLessThanOrEqual(32);
  }
  // Plusieurs tuiles sur la même rangée, quel que soit le format.
  const hauts = await page.locator('.minijeu-carte').evaluateAll((l) => l.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(hauts.filter((h) => h === hauts[0]).length).toBeGreaterThanOrEqual(3);
  expect(await debordements(page)).toEqual([]);
});

test('Pastille « i » : fenêtre avec le nom, l’explication et la capture du jeu, sans lancer la partie @smoke', async ({ page }) => {
  await liste(page);
  const jeux = await page.evaluate(() => window.Minijeux.JEUX.map((j) => ({ id: j.id, nom: j.nom, aide: j.aide })));
  const fenetre = page.locator('#minijeu-info');
  await expect(fenetre).toBeHidden();
  for (const j of jeux) {
    await page.locator('.minijeu-info[data-info="' + j.id + '"]').click();
    await expect(fenetre).toBeVisible();
    await expect(page.getByRole('dialog', { name: j.nom })).toBeVisible();
    await expect(fenetre.locator('#minijeu-info-texte')).toHaveText(j.aide);
    const img = fenetre.locator('#minijeu-info-img');
    await expect(img).toHaveAttribute('alt', /Capture d’écran de /);
    await expect.poll(() => img.evaluate((e) => e.complete && e.naturalWidth > 0), { message: 'capture de ' + j.id }).toBe(true);
    // La fenêtre tient dans l'écran (téléphone carré compris) et le jeu n'est pas lancé.
    const place = await fenetre.evaluate((e) => { const r = e.getBoundingClientRect(); return { haut: r.top, bas: r.bottom, gauche: r.left, droite: r.right, h: innerHeight, l: innerWidth }; });
    expect(place.haut).toBeGreaterThanOrEqual(-1); expect(place.bas).toBeLessThanOrEqual(place.h + 1);
    expect(place.gauche).toBeGreaterThanOrEqual(-1); expect(place.droite).toBeLessThanOrEqual(place.l + 1);
    await expect(page.getByRole('dialog', { name: 'Qui joue ?' })).toHaveCount(0);
    await expect(page.locator('#ecran-minijeu')).toBeHidden();
    await fenetre.getByRole('button', { name: 'Fermer' }).click();
    await expect(fenetre).toBeHidden();
  }
});

test('Fenêtre « i » : se ferme avec Échap et avec un clic à côté ; la tuile lance toujours le jeu', async ({ page }) => {
  await liste(page);
  const fenetre = page.locator('#minijeu-info');
  await page.locator('.minijeu-info[data-info="fabrique"]').click();
  await expect(fenetre).toBeVisible();
  await expect(fenetre.locator('h2')).toHaveText('La fabrique à mots');
  await expect(fenetre.locator('#minijeu-info-texte')).toHaveText('Fabrique des mots avec des lettres et des sons, puis écoute-les.');
  await page.keyboard.press('Escape');
  await expect(fenetre).toBeHidden();
  await page.locator('.minijeu-info[data-info="sons"]').click();
  await expect(fenetre).toBeVisible();
  await fenetre.evaluate((e) => e.click()); // clic sur le fond grisé (la cible est la fenêtre elle-même)
  await expect(fenetre).toBeHidden();
  await page.locator('.minijeu-carte[data-jeu="fabrique"]').click();
  await quiJoue(page);
  await expect(page.locator('#titre-minijeu')).toHaveText('La fabrique à mots');
});

test('Chaque mini-jeu a sa capture d’écran (img/minijeux/<id>.webp)', async ({ page, request }) => {
  await liste(page);
  const ids = await page.evaluate(() => window.Minijeux.JEUX.map((j) => j.id));
  for (const id of ids) {
    const r = await request.get('img/minijeux/' + id + '.webp');
    expect(r.status(), 'capture manquante : python3 outils/captures_minijeux.py ' + id).toBe(200);
    expect((await r.body()).length).toBeGreaterThan(2000);
  }
});
