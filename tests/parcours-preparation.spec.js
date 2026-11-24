// v10.36 (demande du 24/11/2026, backlog lignes 475 à 479) : à l'étape 1 de la préparation, chaque joueur a 2 boutons,
// « Suivre ma progression » (seulement la matière) et « Personnaliser » (matière, niveau 1 à 10, réglages) ; le bouton
// « Choisir l'aventure » n'apparaît en bas que lorsque tous les joueurs ont fini de se préparer.
const { test, expect } = require('@playwright/test');
const { rapide, ouvrirNeuf, creerJoueurs, personnaliser, suivreMaProgression, valider, cocher } = require('./aide');

const ETAT = {
  v: 1, total: 0,
  joueurs: [
    { id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: { 'maths.calcul': 55, 'maths.probleme': 55 } },
    { id: 'j-2', nom: 'Hugo', perso: 'tom', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: {} }
  ]
};
async function ouvrir(page, etat = ETAT) {
  await rapide(page);
  await page.addInitScript((e) => {
    try { localStorage.setItem('ludo-vu', '1'); if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify(e)); } catch (x) { /* */ }
  }, etat);
  await ouvrirNeuf(page);
}
// Accueil → étape 1 avec n joueurs choisis.
async function etape1(page, n = 1) {
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  for (let k = 1; k < n; k++) {
    await page.locator('[data-ajouter]').click();
    await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  }
}
const aventure = (page) => page.getByRole('button', { name: 'Choisir l\'aventure' });

test('étape 1 : 2 boutons à côté de chaque joueur ; « Choisir l\'aventure » reste caché tant qu\'un joueur n\'est pas prêt', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 2);
  for (const k of [0, 1]) {
    const ligne = page.locator('.cj-ligne').nth(k);
    await expect(ligne.getByRole('button', { name: /^Suivre ma progression/ })).toBeVisible();
    await expect(ligne.getByRole('button', { name: /^Personnaliser/ })).toBeVisible();
  }
  await expect(aventure(page)).toBeHidden();
  await expect(page.locator('#prepa-aide')).toContainText('Léa');
  // Léa : « Personnaliser » → étape 2 ; « Valider » après ses réglages la ramène à l'étape 1 ; Hugo n'est pas prêt : toujours pas de bouton.
  await personnaliser(page, 0);
  await expect(page.locator('#prepa-progres')).toContainText('Étape 2 sur 3');
  await page.locator('#matieres input[value="maths"]').setChecked(true);
  await valider(page); // écran des réglages de calcul
  await page.getByRole('checkbox', { name: 'Additionner' }).click({ force: true });
  await page.locator('#nombres label', { hasText: /^\s*4\s*$/ }).click();
  await valider(page);
  await expect(page.locator('#prepa-progres')).toContainText('Étape 1 sur 3');
  await expect(page.locator('.cj-ligne').nth(0).locator('.cj-resume')).toContainText('Maths');
  await expect(page.locator('.cj-ligne').nth(0).locator('.cj-resume')).toContainText('personnalisé');
  await expect(aventure(page)).toBeHidden();
  // Hugo : « Suivre ma progression » → matière seule ; « Choisir l'aventure » apparaît.
  await suivreMaProgression(page, 1, 'francais');
  await expect(page.locator('.cj-ligne').nth(1).locator('.cj-resume')).toContainText('suit sa progression');
  await expect(aventure(page)).toBeVisible();
  await aventure(page).click();
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
  // « Retour » de l'aventure ramène à l'étape 1, les joueurs restent prêts.
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(aventure(page)).toBeVisible();
});

test('« Suivre ma progression » : seulement la matière à choisir, avec le niveau déjà atteint dans chacune', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 1);
  await page.locator('.cj-parcours-btn[data-parcours="suivre"]').click();
  await expect(page.locator('#choix-suivre')).toBeVisible();
  await expect(page.locator('#choix-matiere')).toBeHidden();
  await expect(page.locator('#suivre-matieres input')).toHaveCount(4);
  await expect(page.locator('#suivre-matieres label').first()).toContainText('Maths');
  // Léa a 55 sur 100 en calcul et en problèmes : la moyenne de ses maths est 55 / 2 sous-matières = 55 → niveau 6.
  await expect(page.locator('#suivre-matieres label').first()).toContainText('niveau 6 sur 10');
  await expect(page.locator('#suivre-matieres label').nth(1)).toContainText('niveau 1 sur 10');
  // Sans matière, « Valider » refuse et le dit.
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('#packs-alerte')).toContainText('doit choisir une matière');
  await expect(aventure(page)).toBeHidden();
  await page.locator('#suivre-matieres input[value="maths"]').check();
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(aventure(page)).toBeVisible();
  const p = await page.evaluate(() => window.Aventura.partie);
  expect(p.parcours[0]).toBe('suivre');
  expect(p.suivi[0]).toBe('maths');
  expect(p.pret[0]).toBe(true);
});

test('« Personnaliser » : niveau de 1 à 10 (dizaine de la progression), celui du profil proposé d\'abord', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 1);
  await personnaliser(page, 0);
  await expect(page.locator('#reglage-niveau-prog')).toHaveAttribute('hidden', ''); // pas de niveau avant la matière
  await cocher(page, '#matieres', 'maths');
  await expect(page.locator('#reglage-niveau-prog')).not.toHaveAttribute('hidden', ''); // le niveau a son onglet (bandeau ouvert au toucher)
  await expect(page.locator('#niveau-prog input')).toHaveCount(10);
  await expect(page.locator('#niveau-prog input[value="6"]')).toBeChecked(); // 55 sur 100 → niveau 6
  await expect(page.locator('#niveau-prog-aide')).toContainText('niveau 2, c’est les niveaux 11 à 20');
  await expect(page.locator('#niveau-prog input').nth(1)).toHaveAttribute('aria-label', /Niveau 2 : questions de la progression 11 à 20/);
  // Les 4 niveaux Facile…Expert ne sont plus proposés.
  await expect(page.locator('#reglage-niveau-maths')).toHaveAttribute('hidden', '');
  // Niveau 2 → Facile ; 5 → Moyen ; 8 → Difficile ; 10 → Expert (traduction provisoire pour les générateurs).
  for (const [n, id] of [[2, 'facile'], [5, 'moyen'], [8, 'difficile'], [10, 'expert']]) {
    await cocher(page, '#niveau-prog', n);
    expect(await page.evaluate(() => window.Aventura.partie.niveauProg[0])).toBe(n);
    expect(await page.evaluate(() => window.Aventura.partie.maths[0].niveau)).toBe(id);
  }
  // Changer de matière : le niveau repart de celui du profil dans cette matière (Léa : 0 sur 100 en orthographe → niveau 1).
  await cocher(page, '#matieres', 'francais');
  await cocher(page, '#francais', 'orthographe');
  await expect(page.locator('#niveau-prog input[value="1"]')).toBeChecked();
});

test('« Suivre ma progression » : les cartes viennent de la matière, au niveau enregistré dans le profil', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 1);
  await suivreMaProgression(page, 0, 'maths'); // Léa : 55 en calcul et en problèmes → niveau 6 → « Difficile »
  await aventure(page).click();
  await page.getByRole('radio', { name: /^Viking/ }).check();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  const cartes = await page.evaluate(() => {
    const p = window.Aventura.partie, j = p.joueurs[0], r = [];
    for (let i = 0; i < 40; i++) { const c = window.Aventura.piocherCarte(j); r.push({ type: c.type, nom: c.packNom }); }
    return { cartes: r, sous: j.sous };
  });
  for (const c of cartes.cartes) expect(c.nom).toMatch(/^(Calcul|Problème) · Difficile/);
  expect(Object.keys(cartes.sous).sort()).toEqual(['maths.calcul', 'maths.probleme']); // les deux sous-matières des maths sont tirées
  expect(cartes.cartes.some((c) => c.nom.startsWith('Calcul'))).toBe(true);
  expect(cartes.cartes.some((c) => c.nom.startsWith('Problème'))).toBe(true);
});

test('« Suivre ma progression » en Français : orthographe, conjugaison, grammaire et phonèmes, chacun à son niveau', async ({ page }) => {
  await ouvrir(page, { v: 1, total: 0, joueurs: [{ id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z',
    niv: { 'francais.orthographe': 5, 'francais.conjugaison': 95, 'francais.grammaire': 35, 'francais.phonemes': 0 } }] });
  await etape1(page, 1);
  await suivreMaProgression(page, 0, 'francais');
  await aventure(page).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  const r = await page.evaluate(() => {
    const j = window.Aventura.partie.joueurs[0], vus = {};
    for (let i = 0; i < 120; i++) { const c = window.Aventura.piocherCarte(j); const k = (c.packNom || '').split(' · ')[0] + ' · ' + (c.type || ''); vus[k] = c.packNom; }
    return { sous: j.sous, conj: Object.values(vus).filter((n) => n.startsWith('Conjugaison')), gram: Object.values(vus).filter((n) => n.startsWith('Grammaire')) };
  });
  expect(Object.keys(r.sous).sort()).toEqual(['francais.conjugaison', 'francais.grammaire', 'francais.orthographe', 'francais.phonemes']);
  for (const n of r.conj) expect(n).toContain('Expert'); // 95 → niveau 10 → Expert
  for (const n of r.gram) expect(n).toContain('Moyen'); // 35 → niveau 4 → Moyen
});

test('fin de partie : le point de niveau va à la sous-matière la plus jouée par un joueur qui suit sa progression', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 1);
  await suivreMaProgression(page, 0, 'maths');
  await aventure(page).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  // Partie fabriquée : 5 cartes de problèmes, 2 de calcul, objectif atteint par Léa ; la partie est finie.
  await page.evaluate(() => {
    const p = window.Aventura.partie, r = p.regles;
    p.joueurs[0].sous = { 'maths.probleme': 5, 'maths.calcul': 2 };
    r.historique = [{ manche: 1, joueur: 0, de: 'fort', points: r.objectif }];
    r.points = r.objectif; r.etape = 'fin';
  });
  await page.reload();
  await expect(page.locator('#fin')).toBeVisible();
  const niv = await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')).joueurs.find((x) => x.id === 'j-1').niv);
  expect(niv['maths.probleme']).toBe(56);
  expect(niv['maths.calcul']).toBe(55);
});

test('la préparation faite est gardée après un rechargement (parcours, matière, joueur prêt)', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 2);
  await suivreMaProgression(page, 0, 'histoire');
  await page.reload();
  await expect(page.locator('.cj-ligne').nth(0).locator('.cj-resume')).toContainText('Histoire');
  await expect(page.locator('.cj-ligne').nth(1).locator('.cj-resume')).toContainText('À préparer');
  await expect(aventure(page)).toBeHidden();
  // Un joueur retiré puis remis : sa place repart de zéro, c'est à lui de se préparer de nouveau.
  await suivreMaProgression(page, 1, 'maths');
  await expect(aventure(page)).toBeVisible();
  await page.locator('[data-retirer="1"]').click();
  await expect(page.locator('.cj-ligne')).toHaveCount(1);
  await page.locator('[data-ajouter]').click();
  await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  await expect(page.locator('.cj-ligne').nth(1).locator('.cj-resume')).toContainText('À préparer');
  await expect(page.locator('.cj-ligne').nth(0).locator('.cj-resume')).toContainText('Histoire'); // le premier est resté prêt
  await expect(aventure(page)).toBeHidden();
});

test('étape 1 : rien ne déborde avec 4 joueurs (téléphone, carré, tablette, ordinateur)', async ({ page }) => {
  const quatre = { v: 1, total: 0, joueurs: ['Léa', 'Hugo', 'Nour', 'Malo Le Grand Aventurier'].map((nom, i) => ({ id: 'j-' + (i + 1), nom, perso: ['lea', 'tom', 'nour', 'malo'][i], cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: {} })) };
  await ouvrir(page, quatre);
  await etape1(page, 4);
  await suivreMaProgression(page, 0, 'maths');
  await personnaliser(page, 1);
  await page.getByRole('button', { name: /Retour/ }).click();
  const mesures = await page.evaluate(() => {
    const doc = document.documentElement, zone = document.getElementById('choix-joueurs');
    const larges = [...zone.querySelectorAll('.cj-ligne, .cj-parcours, .cj-parcours-btn')].filter((e) => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > doc.clientWidth + 1);
    return { debordeLargeur: doc.scrollWidth > doc.clientWidth + 1, larges: larges.map((e) => e.className) };
  });
  expect(mesures.debordeLargeur).toBe(false);
  expect(mesures.larges).toEqual([]);
  // Les 4 boutons « Personnaliser » restent atteignables (zone de l'étape défilante si l'écran est bas).
  for (let k = 0; k < 4; k++) {
    const b = page.locator('.cj-parcours-btn[data-parcours="perso"][data-place="' + k + '"]');
    await b.scrollIntoViewIfNeeded();
    await expect(b).toBeVisible();
    const t = await b.boundingBox();
    expect(t.height).toBeGreaterThanOrEqual(24); // cible tactile (WCAG 2.5.8)
  }
});
