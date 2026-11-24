// v10.13 (demande du 18/11/2026, proposition A de la page de test) : à l'écran « quelle matière ? », les choix sont des
// onglets à gauche (Matière, Exercice, Niveau, Signes par calcul) ; un seul bandeau déroulant est ouvert, à droite de l'onglet.
// Un choix unique ferme le bandeau et ouvre le suivant ; le choix reste écrit dans l'onglet et se change en le touchant.
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, valider, cocher, choisir } = require('./aide');

const onglet = (page, cle) => page.locator('.onglet[data-etape="' + cle + '"]');
// Rien ne déborde de l'écran ni de la zone des réglages.
async function sansDebordement(page) {
  const d = await page.evaluate(() => {
    const c = document.querySelector('#reglages-joueur');
    return Math.max(document.documentElement.scrollHeight - innerHeight, document.documentElement.scrollWidth - document.documentElement.clientWidth, c.scrollHeight - c.clientHeight);
  });
  expect(d).toBeLessThanOrEqual(1);
}

test('mathématiques : le parcours onglets → bandeaux, le choix marqué dans l\'onglet, puis « Valider »', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  // Au départ : le bandeau de la matière est ouvert, les onglets suivants sont grisés.
  await expect(page.locator('#reglage-matiere')).toBeVisible();
  await expect(onglet(page, 'type')).toBeDisabled();
  // Mathématiques → le bandeau « En mathématiques » (Calcul mental / Problèmes) s'ouvre tout seul.
  await choisir(page, '#matieres', 'Mathématiques');
  await expect(page.locator('#reglage-type-maths')).toBeVisible();
  await expect(page.locator('#reglage-matiere')).toBeHidden();
  await expect(onglet(page, 'matiere')).toContainText('Mathématiques');
  // Problèmes → le bandeau du niveau (4 choix l'un sous l'autre) ; l'onglet garde le choix.
  await choisir(page, '#type-maths', 'Problèmes');
  await expect(onglet(page, 'type')).toContainText('Problèmes');
  await expect(page.locator('#reglage-niveau-prog')).toBeVisible();
  const n = await page.locator('#niveau-maths .pack span').evaluateAll((l) => l.map((e) => { const r = e.getBoundingClientRect(); return Math.round(r.x); }));
  expect(n).toHaveLength(4);
  expect(new Set(n).size).toBe(1);
  // Niveau Moyen → le bandeau des signes (plusieurs possibles : il reste ouvert) avec son « Valider ».
  await choisir(page, '#niveau-maths', 'Moyen');
  await expect(page.locator('#reglage-nb-signes')).toBeVisible();
  await choisir(page, '#nb-signes', '2');
  await expect(page.locator('#reglage-nb-signes')).toBeVisible();
  await expect(onglet(page, 'signes')).toContainText('1, 2');
  await sansDebordement(page);
  // Le choix retenu est écrit en noir (pas en blanc) avec un ✓ à droite.
  const choisi = page.locator('#nb-signes label', { hasText: '2' }).locator('span');
  expect(await choisi.evaluate((e) => getComputedStyle(e).color)).toBe('rgb(59, 42, 30)');
  expect(await choisi.evaluate((e) => getComputedStyle(e, '::after').content)).toContain('✓');
  // Revenir sur un choix précédent : on retouche l'onglet, le bandeau se rouvre avec le choix marqué.
  await onglet(page, 'niveau').click();
  await expect(page.locator('#reglage-niveau-prog')).toBeVisible();
  await expect(page.locator('#niveau-prog input[value="4"]')).toBeChecked(); // v10.36 : Moyen = niveau 4
  const coche = page.locator('#niveau-prog label', { hasText: /^\s*4\s*$/ }).locator('span');
  expect(await coche.evaluate((e) => getComputedStyle(e).color)).toBe('rgb(59, 42, 30)');
  await choisir(page, '#niveau-maths', 'Difficile');
  await expect(onglet(page, 'niveau')).toContainText('6');
  // Un seul « Valider » visible à la fois ; celui du bandeau passe à l'écran suivant.
  if (!(await page.locator('#reglage-nb-signes').isVisible())) await onglet(page, 'signes').click(); // (déjà ouvert après le niveau)
  await expect(page.getByRole('button', { name: 'Valider mes choix' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Valider', exact: true })).toHaveCount(0);
  await valider(page);
  await expect(page.locator('#reglages-maths')).toBeVisible();
  expect(await page.evaluate(() => window.Aventura.partie.maths[0].type)).toBe('probleme');
});

test('un clic ailleurs, ou Échap, ferme le bandeau ; le « Valider » du bas revient', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await cocher(page, '#matieres', 'francais');
  await cocher(page, '#francais', 'orthographe');
  await expect(page.locator('#reglage-niveau-prog')).toBeVisible(); // Français → Orthographe → son niveau (dernier bandeau)
  await expect(page.getByRole('button', { name: 'Valider mes choix' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#reglage-niveau-prog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Valider', exact: true })).toBeVisible();
  await expect(onglet(page, 'signes')).toBeHidden(); // pas de signes en français
  await sansDebordement(page);
  await valider(page);
  await page.locator('#ortho-packs').waitFor();
});

test('géographie : l\'onglet s\'appelle « Mode » ; l\'écran tient sans défiler', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await choisir(page, '#matieres', 'Géographie');
  await expect(onglet(page, 'type')).toContainText('Mode');
  await expect(page.locator('#reglage-mode-savoir')).toBeVisible();
  await choisir(page, '#mode-savoir', 'Normal');
  await expect(page.locator('#reglage-niveau-prog')).toBeVisible();
  await sansDebordement(page);
});
