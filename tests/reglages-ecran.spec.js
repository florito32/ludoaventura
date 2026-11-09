// Étape 3 : les écrans de réglages remplissent la place (v6.4, lignes 81 à 85 du backlog) :
// choix centrés, grands, rangés en lignes régulières, sans défiler ni laisser l'écran presque vide.
const { test, expect } = require('@playwright/test');
const { rapide, versReglages, maths, orthographe, matiere, conjugaison } = require('./aide');

// Boîtes (x, y, largeur, hauteur) des choix visibles d'un groupe.
async function boites(page, sel) {
  return page.locator(sel + ' .pack span').evaluateAll((l) => l.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }));
}
// Rien ne défile, et les choix occupent au moins `part` de la hauteur de la zone des réglages.
async function remplit(page, ecran, part = 0.5) {
  const r = await page.evaluate((sel) => {
    const corps = document.querySelector('#reglages-joueur');
    const packs = [...document.querySelectorAll(sel + ' .pack span')].map((e) => e.getBoundingClientRect()).filter((b) => b.height > 0); // choix visibles
    const haut = Math.min(...packs.map((b) => b.top)), bas = Math.max(...packs.map((b) => b.bottom));
    const c = corps.getBoundingClientRect();
    return { defile: document.documentElement.scrollHeight > innerHeight + 1 || corps.scrollHeight > corps.clientHeight + 1,
      part: (bas - haut) / c.height, dedans: haut >= c.top - 1 && bas <= c.bottom + 1,
      centre: Math.abs((haut + bas) / 2 - (c.top + c.bottom) / 2) };
  }, ecran);
  expect(r.defile).toBe(false);
  expect(r.dedans).toBe(true);
  expect(r.part).toBeGreaterThan(part);
  return r;
}

// v7.0 : signes seuls sur une ligne ; unités, dizaines et centaines, 5 par ligne (une seule ligne par groupe sur écran peu haut).
test('mathématiques : signes sur une ligne, unités, dizaines et centaines en lignes de 5, sans défiler', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  // Difficile : unités, dizaines et centaines (v6.14 : les groupes dépendent du niveau).
  await maths(page, { signes: [], nombres: [], niveau: 'difficile' });
  const s = await boites(page, '#signes');
  for (let k = 1; k < 4; k++) expect(s[k][1]).toBe(s[0][1]); // les 4 signes sur la même ligne
  let haut = s[0][1];
  for (const g of ['#nombres', '#dizaines', '#centaines']) {
    const n = await boites(page, g);
    // 5 par ligne ; sur un écran peu haut (téléphone carré), tout le groupe sur une seule ligne.
    const parLigne = n.filter((b) => b[1] === n[0][1]).length;
    expect([5, n.length]).toContain(parLigne);
    for (let k = parLigne + 1; k < n.length; k++) expect(n[k][1]).toBe(n[parLigne][1]);
    if (parLigne === 5) expect(n[5][1]).toBeGreaterThan(n[0][1]);
    expect(n[0][1]).toBeGreaterThan(haut); // chaque groupe sous le précédent
    expect(n[0][3]).toBeGreaterThanOrEqual(24); // cible tactile (≥ 24 px, WCAG 2.2, critère 2.5.8)
    haut = n[n.length - 1][1];
  }
  // Aucun texte ne déborde de son bouton, et chaque bouton « Tout » est visible.
  const deborde = await page.locator('#reglages-maths .reglage:not([hidden]) .pack span, #reglages-maths .reglage:not([hidden]) .btn-tout').evaluateAll((l) => l.some((e) => e.scrollWidth > e.clientWidth + 1));
  expect(deborde).toBe(false);
  for (const b of await page.locator('#reglages-maths .reglage:not([hidden]) .btn-tout').all()) await expect(b).toBeInViewport();
  await remplit(page, '#reglages-maths');
  // Les autres niveaux tiennent aussi sans défiler (Expert : une ligne « 1000+ » en plus).
  for (const nv of ['facile', 'moyen', 'expert']) {
    await page.getByRole('button', { name: /Retour/ }).click();
    await page.locator('#niveau-maths input[value="' + nv + '"]').check();
    await page.locator('#btn-valider-reglages').click();
    await remplit(page, '#reglages-maths', nv === 'facile' ? 0.3 : 0.5);
  }
  await page.getByRole('button', { name: /Retour/ }).click();
  await page.locator('#niveau-maths input[value="difficile"]').check();
  await page.locator('#btn-valider-reglages').click();
  // Les choix restent utilisables.
  await page.locator('#signes label').nth(2).click();
  await page.locator('#nombres label').nth(9).click();
  await page.locator('#centaines label').nth(8).click();
  expect(await page.evaluate(() => window.Aventura.partie.maths[0])).toMatchObject({ signes: ['fois'], nombres: [10], centaines: [900] });
});


test('orthographe : packs puis questions, chacun en grille régulière qui remplit l\'écran, sans défiler', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await orthographe(page);
  // Aucun texte ne déborde de son bouton.
  const deborde = (sel) => page.locator(sel + ' .pack span').evaluateAll((l) => l.some((e) => e.offsetHeight > 0 && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)));
  const egaux = (l) => { for (const b of l) { expect(Math.round(b[2])).toBe(Math.round(l[0][2])); expect(Math.round(b[3])).toBe(Math.round(l[0][3])); } };
  // Écran des packs (v6.16) : 19 packs, 3 ou 5 par ligne selon la forme de l'écran.
  const p = await boites(page, '#packs');
  expect(p).toHaveLength(19);
  egaux(p);
  expect([3, 5]).toContain(p.filter((b) => b[1] === p[0][1]).length);
  expect(await deborde('#ortho-packs')).toBe(false);
  await remplit(page, '#ortho-packs', 0.55);
  await page.locator('#packs label', { hasText: 'Animaux' }).click();
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  // Écran des questions (v6.33) : 3 familles encadrées, 3 boutons par ligne.
  await page.locator('#reglages-ortho').waitFor();
  const q = await boites(page, '#types-questions');
  egaux(q);
  expect(q.filter((b) => b[1] === q[0][1]).length).toBe(3);
  expect(await deborde('#reglages-ortho')).toBe(false);
  await remplit(page, '#reglages-ortho', 0.55);
  await page.locator('#types-questions label', { hasText: 'Syllabes' }).click();
  expect(await page.evaluate(() => window.Aventura.partie.types[0])).toEqual(['syllabes']);
});

test('conjugaison : chaque mode est un cadre qui entoure ses propres temps, rangés en colonne, sans défiler', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await matiere(page, 'conjugaison');
  for (const m of ['Indicatif', 'Conditionnel', 'Subjonctif', 'Impératif']) await page.locator('#modes-conj label', { hasText: m }).click();
  const cadres = await page.locator('#temps-conj .mode-ligne').evaluateAll((l) => l.map((c) => {
    const r = c.getBoundingClientRect(), st = getComputedStyle(c);
    const t = [...c.querySelectorAll('.pack span')].map((e) => e.getBoundingClientRect());
    const v = [...c.querySelectorAll('input')].map((i) => i.value.split('.')[0]);
    return { mode: c.dataset.mode, bord: parseFloat(st.borderTopWidth), propres: v.every((m) => m === c.dataset.mode),
      dedans: t.every((b) => b.left >= r.left && b.right <= r.right && b.top >= r.top && b.bottom <= r.bottom),
      colonnes: new Set(t.map((b) => Math.round(b.left))).size, lignes: new Set(t.map((b) => Math.round(b.top))).size, n: t.length };
  }));
  for (const c of cadres) {
    expect(c.bord).toBeGreaterThanOrEqual(2); // le cadre est visible
    expect(c.propres).toBe(true);
    expect(c.dedans).toBe(true);
    expect(c.colonnes).toBeLessThanOrEqual(2); // un temps sous l'autre (2 colonnes au plus sur écran bas)
    expect(c.lignes).toBeGreaterThanOrEqual(c.n / 2);
  }
  // Deux cadres ne se chevauchent pas.
  const r = await page.locator('#temps-conj .mode-ligne').evaluateAll((l) => l.map((c) => c.getBoundingClientRect().toJSON()));
  for (let a = 0; a < r.length; a++) for (let b = a + 1; b < r.length; b++) {
    const sep = r[a].right <= r[b].left + 1 || r[b].right <= r[a].left + 1 || r[a].bottom <= r[b].top + 1 || r[b].bottom <= r[a].top + 1;
    expect(sep).toBe(true);
  }
  const deborde = await page.locator('#temps-conj .pack span').evaluateAll((l) => l.some((e) => e.scrollWidth > e.clientWidth + 1));
  expect(deborde).toBe(false);
  await remplit(page, '#temps-conj', 0.3);
});

test('conjugaison, groupes et niveau : en grand, sur toute la largeur, sans défiler', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await conjugaison(page, { groupes: [] });
  const g = await boites(page, '#groupes'), n = await boites(page, '#niveau-conj');
  expect(new Set(g.map((b) => b[1])).size).toBe(1); // les 3 groupes sur une ligne
  expect([1, 2]).toContain(new Set(n.map((b) => b[1])).size); // les 4 niveaux sur 1 ligne (2 × 2 en hauteur)
  const corps = await page.locator('#reglages-joueur').boundingBox();
  expect(g[2][0] + g[2][2] - g[0][0]).toBeGreaterThan(corps.width * 0.6); // les groupes prennent la largeur
  await remplit(page, '#reglages-conj', 0.4);
  await page.locator('#groupes label', { hasText: '2e' }).click();
  expect(await page.evaluate(() => window.Aventura.partie.conj[0].groupes)).toEqual([2]);
});
