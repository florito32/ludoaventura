// Référencement : balises essentielles présentes et cohérentes.
const { test, expect } = require('@playwright/test');

test('balises SEO présentes @smoke', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  expect((await page.title()).length).toBeGreaterThan(10);
  expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe('https://florito32.github.io/ludoaventura/');
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('robots.txt et sitemap.xml accessibles @smoke', async ({ request, baseURL }) => {
  expect((await request.get(new URL('robots.txt', baseURL).href)).ok()).toBeTruthy();
  const sitemap = await request.get(new URL('sitemap.xml', baseURL).href);
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain('https://florito32.github.io/ludoaventura/');
});
