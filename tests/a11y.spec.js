// Accessibilité : audit axe-core (WCAG 2.1 A et AA) sur chaque écran, thèmes clair et sombre.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function audit(page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.map((v) => `${v.id} (${v.nodes.length}) : ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
}

for (const scheme of ['light', 'dark']) {
  test(`aucune violation WCAG A/AA (${scheme}) : accueil, carte, défi`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.goto('./');
    expect(await audit(page)).toEqual([]);
    await page.getByRole('button', { name: 'Partir à l\'aventure' }).click();
    await expect(page.getByRole('heading', { name: 'Carte de l\'île' })).toBeVisible();
    expect(await audit(page)).toEqual([]);
    await page.locator('#lieux button').first().click();
    await page.locator('#defi-choix button').first().click();
    expect(await audit(page)).toEqual([]);
  });
}

test('le lien « Aller au contenu » est le premier arrêt clavier', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'navigation clavier testée sur ordinateur');
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused();
});
