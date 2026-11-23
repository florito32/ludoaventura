// v10.29 (backlog lignes 446 et 448) : les joueurs du compte jouent la partie ; +1 point à la sous-matière jouée de chaque profil
// qui a réussi sa part (objectif ÷ nombre de joueurs), que l'équipe réussisse ou non.
const { test, expect } = require('@playwright/test');
const { rapide, lancerPartie, repondre, lancerLeDe } = require('./aide');

const ETAT = {
  v: 1, total: 0,
  joueurs: [
    { id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: { 'francais.orthographe': 10 } },
    { id: 'j-2', nom: 'Hugo', perso: 'tom', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: {} }
  ]
};
async function preparer(page, etat) {
  await page.addInitScript((e) => {
    try { localStorage.setItem('ludo-vu', '1'); if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify(e)); } catch (x) { /* */ }
  }, etat);
}
const stockes = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles') || '{}').joueurs || []);

test('fin de partie : +1 point à l\'orthographe pour chaque profil qui a réussi sa part, une seule fois', async ({ page }) => {
  await rapide(page); await preparer(page, ETAT);
  await lancerPartie(page, { joueurs: 2 });
  const suite = page.getByRole('button', { name: /^(Première question|Question suivante)$/ });
  for (let t = 0; t < 14; t++) {
    await suite.or(page.locator('#fin[open]')).first().waitFor();
    if (await page.locator('#fin').isVisible()) break;
    await suite.click();
    await repondre(page, true);
    await lancerLeDe(page);
  }
  await expect(page.locator('#fin')).toBeVisible();
  // Qui a réussi sa part ? (points de chaque joueur d'après l'historique, comparés à objectif ÷ 2)
  const reussi = await page.evaluate(() => {
    const r = window.Aventura.partie.regles, pts = [0, 0];
    (r.historique || []).forEach((h) => { if (h.joueur >= 0 && h.joueur < 2) pts[h.joueur] += Number(h.points) || 0; });
    return pts.map((p) => p >= r.objectif / 2);
  });
  const j = await stockes(page);
  expect(j.find((x) => x.id === 'j-1').niv['francais.orthographe']).toBe(reussi[0] ? 11 : 10);
  expect((j.find((x) => x.id === 'j-2').niv || {})['francais.orthographe'] || 0).toBe(reussi[1] ? 1 : 0);
  await page.reload();
  const apres = await stockes(page);
  expect(apres.find((x) => x.id === 'j-1').niv['francais.orthographe']).toBe(reussi[0] ? 11 : 10);
});

test('v10.29 : un joueur qui ne rapporte rien à l\'équipe ne gagne aucun point de niveau', async ({ page }) => {
  await rapide(page); await preparer(page, ETAT);
  await lancerPartie(page, { joueurs: 2 });
  // Partie fabriquée : le joueur 1 a tout rapporté, le joueur 2 rien ; la partie est finie.
  await page.evaluate(() => {
    const p = window.Aventura.partie, r = p.regles;
    r.historique = [{ manche: 1, joueur: 0, de: 'fort', points: r.objectif }];
    r.points = r.objectif; r.etape = 'fin';
  });
  await page.reload(); // la partie finie est restaurée : l'écran de fin note les niveaux
  await expect(page.locator('#fin')).toBeVisible();
  const j = await stockes(page);
  expect(j.find((x) => x.id === 'j-1').niv['francais.orthographe']).toBe(11); // il a réussi sa part
  expect((j.find((x) => x.id === 'j-2').niv || {})['francais.orthographe'] || 0).toBe(0); // lui n'a rien rapporté
});
