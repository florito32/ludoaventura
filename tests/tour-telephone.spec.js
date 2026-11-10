// v6.2 : sur téléphone et tablette en hauteur, le tour de jeu tient dans l'écran, sans jamais faire défiler ;
// quand la correction ou le tableau « ? » ne tiennent plus sous le plateau, l'encadré remonte sur le plateau.
// v6.8 (ligne 86 du backlog) : sur TOUS les écrans (ordinateur, paysage compris), jamais de défilement,
// et chaque bouton du tour de jeu est entièrement à l'écran.
const { test, expect } = require('@playwright/test');
const { repondre, rapide, versReglages, valider, maths, conjugaison, cocherJoueur, lancer } = require('./aide');

// Rien ne dépasse : ni la page, ni l'encadré du tour de jeu (rien de caché qu'il faudrait faire défiler).
async function tient(page, quand) {
  const r = await page.evaluate(() => {
    const t = document.querySelector('#tour');
    return { page: document.documentElement.scrollHeight - innerHeight, tour: t.scrollHeight - t.clientHeight };
  });
  expect(r.page, quand + ' : la page défile').toBeLessThanOrEqual(1);
  expect(r.tour, quand + ' : le tour de jeu dépasse').toBeLessThanOrEqual(1);
  // Chaque bouton visible du tour de jeu est entièrement dans l'écran.
  const dehors = await page.evaluate(() => [...document.querySelectorAll('#tour button, #tour input')]
    .filter((b) => b.offsetParent && !b.closest('[hidden]'))
    .filter((b) => { const r = b.getBoundingClientRect(); return r.top < -1 || r.left < -1 || r.bottom > innerHeight + 1 || r.right > innerWidth + 1; })
    .map((b) => b.textContent.trim() || b.id));
  expect(dehors, quand + ' : boutons hors de l\'écran').toEqual([]);
}

async function partie(page, reglage) {
  await rapide(page, { autoDe: 50 });
  page.__rapide = true;
  await page.goto('./');
  await versReglages(page, 1);
  await reglage(page);
  await lancer(page);
  await page.getByRole('button', { name: 'Question suivante' }).waitFor();
}


test('conjugaison fausse puis « ? » : tout reste à l\'écran, l\'encadré remonte puis redescend après « J\'ai compris »', async ({ page }) => {
  await partie(page, (p) => conjugaison(p, { temps: ['subjonctif.plus-que-parfait'], groupes: [3], niveau: 'expert' }));
  await tient(page, 'avant de piocher');
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await tient(page, 'carte');
  await page.getByLabel('Ta réponse').fill('faux');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await tient(page, 'correction');
  await page.locator('#btn-tableau').click();
  await expect(page.locator('#carte-tableau li')).toHaveCount(6);
  await tient(page, 'tableau « ? »');
  // Toutes les lignes du tableau et « J'ai compris » sont visibles à l'écran.
  for (const el of await page.locator('#carte-tableau li').all()) await expect(el).toBeInViewport();
  await expect(page.getByRole('button', { name: 'J’ai compris' })).toBeInViewport();
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  // Le dé roule sur le plateau : l'encadré est redescendu pour qu'on le voie.
  await expect(page.locator('.table')).not.toHaveClass(/tour-monte/);
  await expect(page.locator('#carte-tableau')).toBeHidden();
  // Pendant le dé, la page ne défile pas (bug trouvé par la CI : un texte pour lecteurs d'écran sortait de l'encadré).
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);
});

test('calcul faux (niveau Expert) : correction et « J\'ai compris » à l\'écran, sans défiler', async ({ page }) => {
  await partie(page, (p) => maths(p, { signes: ['plus', 'fois'], nombres: [5, 6, 7, 8], niveau: 'expert' }));
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await tient(page, 'carte');
  await expect(page.getByLabel('Ta réponse')).toBeInViewport();
  await page.getByLabel('Ta réponse').fill('1');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.locator('#carte-reponse')).toContainText('tu as écrit « 1 »');
  await tient(page, 'correction');
  await expect(page.locator('#carte-reponse')).toBeInViewport();
  await expect(page.getByRole('button', { name: 'J’ai compris' })).toBeInViewport();
});

test('orthographe : carte, case de réponse et mauvaise réponse sans défiler', async ({ page }) => {
  await partie(page, (p) => cocherJoueur(p));
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await tient(page, 'carte');
  await expect(page.getByRole('button', { name: 'OK', exact: true })).toBeInViewport();
  await repondre(page, false);
  await tient(page, 'après une mauvaise réponse');
  await expect(page.getByRole('button', { name: 'J’ai compris' })).toBeInViewport();
});
