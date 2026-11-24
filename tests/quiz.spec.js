// Mini-jeu « Quiz » Histoire / Géographie (v10.51, demande du 24/11/2026, backlog ligne 520).
// Choix matière + sous-matière + niveau 1 à 10 ; 10 questions (niveaux 1 à 5) ou 15 (niveaux 6 à 10) ; 4 réponses dont une bonne ;
// 15 s par question ; vert / rouge, pause de 3 s, page qui se tourne ; score ; enregistrement Supabase et phrase de félicitations.
const { test, expect } = require('@playwright/test');
const { rapide, creerJoueurs, quiJoue } = require('./aide');

async function ouvrir(page, { pause = 40, duree = null, reduit = true } = {}) {
  await rapide(page);
  if (reduit) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(([p, d]) => {
    try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ }
    if (p !== null) window.AVENTURA_QUIZ_PAUSE = p;
    if (d !== null) window.AVENTURA_QUIZ_DUREE = d;
  }, [pause, duree]);
  await page.goto('./');
  await creerJoueurs(page, 1);
  // Supabase simulé : on garde les appels et on répond avec le pourcentage voulu.
  await page.evaluate(() => { window.__appels = []; window.__pct = 80; window.Compte.rpc = (nom, corps) => { window.__appels.push([nom, corps]); return Promise.resolve(window.__pct === null ? null : { joueurs: 5, battus: 4, pourcentage: window.__pct }); }; });
  await page.locator('#btn-minijeux').click();
  await page.locator('.minijeu-carte[data-jeu="quiz"]').click();
  await quiJoue(page);
  await expect(page.locator('#titre-minijeu')).toHaveText('Quiz');
}
async function choisir(page, matiere, sous, niveau) {
  await page.getByRole('radio', { name: matiere, exact: true }).check();
  await page.getByRole('radio', { name: sous, exact: true }).check();
  await page.getByRole('radio', { name: String(niveau), exact: true }).check();
}
const bonneDe = (page, k) => page.evaluate((k) => { const c = window.MJQuiz.courant().cartes[k]; return c.options.indexOf(c.bonne); }, k);
// Répond à toutes les questions (juste ou faux) ; renvoie le nombre de questions.
async function jouer(page, juste) {
  const n = await page.evaluate(() => window.MJQuiz.courant().cartes.length);
  for (let k = 0; k < n; k++) {
    await expect(page.locator('#quiz-num')).toHaveText('Question ' + (k + 1) + ' / ' + n);
    const b = await bonneDe(page, k);
    await page.locator('.quiz-page:not(.sortante) .btn-option').nth(juste ? b : (b + 1) % 4).click();
  }
  return n;
}
const debordements = (page) => page.evaluate(() => {
  const w = window.innerWidth, out = [];
  if (document.documentElement.scrollWidth > w + 1) out.push('page large : ' + document.documentElement.scrollWidth + ' > ' + w);
  document.querySelectorAll('.ecran:not([hidden]) button, .ecran:not([hidden]) label').forEach((e) => { const r = e.getBoundingClientRect(); if (r.width && (r.right > w + 1 || r.left < -1)) out.push((e.textContent || '').trim().slice(0, 20)); });
  return out.slice(0, 5);
});

test('Quiz : Histoire et Géographie seulement ; 7 périodes ou 4 familles ; niveaux 1 à 10 ; 10 ou 15 questions @smoke', async ({ page }) => {
  await ouvrir(page);
  await expect(page.locator('input[name="quiz-matiere"]')).toHaveCount(2);
  await expect(page.getByRole('radio', { name: 'Histoire', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Maths' })).toHaveCount(0);
  await expect(page.getByRole('radio', { name: 'Français' })).toHaveCount(0);
  await expect(page.locator('input[name="quiz-sous"]')).toHaveCount(7);
  await expect(page.locator('input[name="quiz-niveau"]')).toHaveCount(10);
  await expect(page.locator('#quiz-info')).toContainText('10 questions');
  await expect(page.locator('#quiz-info')).toContainText('15 secondes');
  await page.getByRole('radio', { name: '5', exact: true }).check();
  await expect(page.locator('#quiz-info')).toContainText('10 questions');
  await page.getByRole('radio', { name: '6', exact: true }).check();
  await expect(page.locator('#quiz-info')).toContainText('15 questions');
  await page.getByRole('radio', { name: 'Géographie', exact: true }).check();
  await expect(page.locator('input[name="quiz-sous"]')).toHaveCount(4);
  // Pas de plateau, pas de préparation d'aventure.
  await expect(page.getByRole('heading', { name: 'Le plateau' })).toBeHidden();
  expect(await debordements(page)).toEqual([]);
});

test('Quiz niveau 1 : 10 questions, 4 réponses, tout juste = 10 / 10, enregistré par matière, sous-matière et niveau @smoke', async ({ page }) => {
  await ouvrir(page);
  const avant = await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')).total);
  await choisir(page, 'Histoire', 'Antiquité', 1);
  await page.locator('#quiz-lancer').click();
  await expect(page.locator('.quiz-page .btn-option')).toHaveCount(4);
  expect(await debordements(page)).toEqual([]);
  expect(await jouer(page, true)).toBe(10);
  await expect(page.locator('.minijeu-fin')).toContainText('10 / 10');
  await expect(page.locator('.minijeu-fin')).toContainText('Histoire › Antiquité › niveau 1');
  await expect(page.locator('.quiz-felicitations')).toHaveText('Félicitations, tu fais mieux que 80 % des joueurs !');
  const appels = await page.evaluate(() => window.__appels);
  expect(appels).toHaveLength(1);
  expect(appels[0][0]).toBe('enregistrer_quiz');
  expect(appels[0][1]).toMatchObject({ p_matiere: 'histoire', p_sous_matiere: 'ant', p_niveau: 1, p_score: 10 });
  expect(appels[0][1].p_joueur).toBeTruthy();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')).total) - avant).toBe(10); // 10 étoiles, comme les autres mini-jeux
  expect(await debordements(page)).toEqual([]);
});

test('Quiz niveau 6 : 15 questions, score sur 15 ; la phrase n’apparaît pas sous 50 %, ni sans base', async ({ page }) => {
  await ouvrir(page);
  await page.evaluate(() => { window.__pct = 40; });
  await choisir(page, 'Géographie', 'Monde', 6);
  await page.locator('#quiz-lancer').click();
  expect(await jouer(page, false)).toBe(15);
  await expect(page.locator('.minijeu-fin')).toContainText('0 / 15');
  await expect(page.locator('.quiz-felicitations')).toHaveCount(0);
  expect((await page.evaluate(() => window.__appels))[0][1]).toMatchObject({ p_matiere: 'geographie', p_sous_matiere: 'monde', p_niveau: 6, p_score: 0 });
  // Rejouer : retour au choix, qui garde la matière, la sous-matière et le niveau.
  await page.locator('#minijeu-rejouer').click();
  await expect(page.getByRole('radio', { name: 'Monde', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: '6', exact: true })).toBeChecked();
  // Sans réponse de la base (hors ligne, personne de connecté) : le score s'affiche quand même.
  await page.evaluate(() => { window.__pct = null; });
  await page.locator('#quiz-lancer').click();
  await jouer(page, true);
  await expect(page.locator('.minijeu-fin')).toContainText('15 / 15');
  await expect(page.locator('.quiz-felicitations')).toHaveCount(0);
});

test('Quiz : phrase de félicitations à partir de 50 % (50 → oui, 49 → non)', async ({ page }) => {
  await ouvrir(page);
  await page.evaluate(() => { window.__pct = 50; });
  await choisir(page, 'Histoire', 'Préhistoire', 2);
  await page.locator('#quiz-lancer').click();
  await jouer(page, true);
  await expect(page.locator('.quiz-felicitations')).toHaveText('Félicitations, tu fais mieux que 50 % des joueurs !');
  await page.locator('#minijeu-rejouer').click();
  await page.evaluate(() => { window.__pct = 49; });
  await page.locator('#quiz-lancer').click();
  await jouer(page, true);
  await expect(page.locator('.minijeu-fin')).toContainText('10 / 10');
  await expect(page.locator('.quiz-felicitations')).toHaveCount(0);
});

test('Quiz : bonne réponse en vert ; mauvaise réponse en rouge et la bonne en vert ; toutes les cases se bloquent', async ({ page }) => {
  await ouvrir(page, { pause: 600000 });
  await choisir(page, 'Histoire', 'Moyen Âge', 3);
  await page.locator('#quiz-lancer').click();
  const vert = 'rgb(31, 122, 58)', rouge = 'rgb(198, 40, 40)';
  // 1re question : bonne réponse.
  let b = await bonneDe(page, 0);
  await page.locator('.quiz-page .btn-option').nth(b).click();
  await expect(page.locator('.btn-option.bonne')).toHaveCount(1);
  await expect(page.locator('.btn-option.fausse')).toHaveCount(0);
  await expect(page.locator('.btn-option.bonne')).toHaveCSS('background-color', vert);
  await expect(page.locator('.quiz-page .btn-option:disabled')).toHaveCount(4);
  expect(await page.evaluate(() => window.MJQuiz.courant().score)).toBe(1);
  await expect(page.locator('#quiz-annonce')).toHaveText('Bonne réponse !');
  // Un 2e clic ne change rien.
  await page.locator('.quiz-page .btn-option').nth((b + 1) % 4).click({ force: true });
  expect(await page.evaluate(() => window.MJQuiz.courant().score)).toBe(1);
});

test('Quiz : mauvaise réponse → la case touchée est rouge et la bonne est verte', async ({ page }) => {
  await ouvrir(page, { pause: 600000 });
  await choisir(page, 'Géographie', 'France', 2);
  await page.locator('#quiz-lancer').click();
  const b = await bonneDe(page, 0), faux = (b + 2) % 4;
  await page.locator('.quiz-page .btn-option').nth(faux).click();
  await expect(page.locator('.quiz-page .btn-option').nth(faux)).toHaveClass(/fausse/);
  await expect(page.locator('.quiz-page .btn-option').nth(faux)).toHaveCSS('background-color', 'rgb(198, 40, 40)');
  await expect(page.locator('.quiz-page .btn-option').nth(b)).toHaveClass(/bonne/);
  await expect(page.locator('.quiz-page .btn-option').nth(b)).toHaveCSS('background-color', 'rgb(31, 122, 58)');
  await expect(page.locator('.btn-option.fausse')).toHaveCount(1);
  await expect(page.locator('.btn-option.bonne')).toHaveCount(1);
  expect(await page.evaluate(() => window.MJQuiz.courant().score)).toBe(0);
  await expect(page.locator('#quiz-annonce')).toContainText('La bonne réponse était');
});

test('Quiz : 3 secondes de pause, puis la page se tourne toute seule vers la question suivante', async ({ page }) => {
  await ouvrir(page, { pause: null, reduit: false });
  await choisir(page, 'Histoire', 'Antiquité', 1);
  await page.locator('#quiz-lancer').click();
  await expect(page.locator('#quiz-chrono')).toHaveText('15 s'); // chronomètre de 15 secondes
  const b = await bonneDe(page, 0);
  await page.locator('.quiz-page .btn-option').nth(b).click();
  const t0 = Date.now();
  await page.waitForTimeout(2500);
  await expect(page.locator('#quiz-num')).toHaveText('Question 1 / 10'); // toujours la même question après 2,5 s
  await expect(page.locator('#quiz-num')).toHaveText('Question 2 / 10', { timeout: 2000 });
  const dt = Date.now() - t0;
  expect(dt).toBeGreaterThanOrEqual(2900);
  // L'ancienne page se tourne (animation) au-dessus de la nouvelle.
  await expect(page.locator('.quiz-page.sortante')).toHaveCount(1);
  expect(await page.locator('.quiz-page.sortante').evaluate((e) => getComputedStyle(e).animationName)).toBe('quiz-tourne');
  await expect(page.locator('.quiz-page')).toHaveCount(1, { timeout: 2000 }); // puis elle disparaît
  expect(await debordements(page)).toEqual([]);
  await expect(page.locator('#quiz-chrono')).toHaveText(/^1[45] s$/);
});

test('Quiz : sans réponse dans le temps, c’est une mauvaise réponse (la bonne passe en vert), puis la suite', async ({ page }) => {
  await ouvrir(page, { pause: 1500, duree: 1 });
  await choisir(page, 'Histoire', 'Antiquité', 1);
  await page.locator('#quiz-lancer').click();
  await expect(page.locator('.btn-option.bonne')).toHaveCount(1, { timeout: 4000 });
  await expect(page.locator('.btn-option.fausse')).toHaveCount(0);
  expect(await page.evaluate(() => window.MJQuiz.courant().score)).toBe(0);
  await expect(page.locator('#quiz-annonce')).toContainText('Temps écoulé');
  await expect(page.locator('#quiz-num')).toHaveText('Question 2 / 10', { timeout: 4000 });
});

test('Quiz : quitter en cours de partie n’enregistre rien', async ({ page }) => {
  await ouvrir(page, { pause: 600000 });
  await choisir(page, 'Histoire', 'XXe siècle', 4);
  await page.locator('#quiz-lancer').click();
  await page.locator('.quiz-page .btn-option').first().click();
  await page.locator('#minijeu-retour').click();
  await expect(page.locator('.minijeu-carte').first()).toBeVisible();
  expect(await page.evaluate(() => window.__appels)).toEqual([]);
});
