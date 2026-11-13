// v8.5 (demande du 13/11/2026, BACKLOG lignes 337 à 340) :
//  - plus de petits commentaires sous les niveaux, sous le mode et dans les titres des réglages ;
//  - partie rapide solo : Géographie et Histoire, avec le choix Quiz / Normal (visible seulement si l'une des deux est cochée) ;
//  - la toute première question de la partie s'appelle « Première question ».
const { test, expect } = require('@playwright/test');
const R = require('../js/rapide.js');
const { rapide, versReglages, cocherJoueur, lancer, repondre, lancerLeDe } = require('./aide');

test.describe('tirage de la partie rapide avec Géographie et Histoire', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('les cartes de Géographie et d’Histoire gardent le niveau et le mode choisis', () => {
    for (const m of ['geographie', 'histoire']) {
      for (const mode of ['quiz', 'normal']) {
        const t = R.carte([m], 'difficile', null, mode);
        expect(t).toEqual({ matiere: m, savoir: { niveau: 'difficile', mode } });
      }
    }
    // Sans mode (ou un mode inconnu) : Quiz.
    expect(R.carte(['histoire'], 'facile').savoir.mode).toBe('quiz');
    // Les 4 matières sont tirées.
    const vues = new Set();
    for (let k = 0; k < 400; k++) vues.add(R.carte(['maths', 'francais', 'geographie', 'histoire'], 'moyen', null, 'quiz').matiere);
    expect([...vues].sort()).toEqual(['conjugaison', 'geographie', 'grammaire', 'histoire', 'maths', 'orthographe']);
    expect(R.generer({ matieres: ['histoire'], niveau: 'moyen', mode: 'normal' })).toMatchObject({ matieres: ['histoire'], mode: 'normal' });
    expect(R.generer({ matieres: [], niveau: 'moyen' }).matieres).toEqual(['maths', 'francais', 'geographie', 'histoire']);
  });
});

test('partie rapide : Géographie et Histoire, choix Quiz / Normal, sans commentaire @smoke', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Partie rapide solo' }).click();
  // Plus de petit commentaire sous les choix.
  await expect(page.locator('#rapide-corps .petit')).toHaveCount(0);
  await expect(page.locator('#rapide-corps')).not.toContainText('tirés au hasard');
  // Le mode est proposé (Quiz par défaut) tant que Géographie ou Histoire est cochée.
  await expect(page.getByRole('group', { name: 'Mode' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Quiz' })).toBeChecked();
  await page.getByRole('button', { name: 'Aucune' }).click();
  await expect(page.locator('input[name="rapide-mode"]')).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Histoire' }).check();
  await expect(page.getByRole('group', { name: 'Mode' })).toBeVisible();
  await page.getByRole('radio', { name: 'Normal' }).check();
  // Ni débordement, ni bouton hors de l'écran.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const b = await page.locator('#btn-lancer-rapide').boundingBox();
  expect(b.y + b.height).toBeLessThanOrEqual(page.viewportSize().height);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  expect(await page.evaluate(() => window.Aventura.partie.rapide)).toEqual({ matieres: ['histoire'], niveau: 'facile', mode: 'normal' });
  // Toutes les cartes sont des cartes d'Histoire en mode Normal (jamais de QCM).
  const cartes = await page.evaluate(() => {
    const j = window.Aventura.partie.joueurs[0], t = [];
    for (let k = 0; k < 60; k++) { const c = window.Aventura.piocherCarte(j); t.push([c.type, c.matiere, c.mode, c.format].join(':')); }
    return t;
  });
  for (const c of cartes) {
    expect(c).toMatch(/^savoir:histoire:normal:/);
    expect(c).not.toMatch(/:Q$/);
  }
  // La première question de la partie.
  await expect(page.getByRole('button', { name: 'Première question' })).toBeVisible();
  await page.getByRole('button', { name: 'Première question' }).click();
  await expect(page.locator('#carte-piochee')).toBeVisible();
  // Le choix est gardé pour la prochaine fois.
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-rapide-choix')))).toEqual({ matieres: ['histoire'], niveau: 'facile', mode: 'normal' });
});

test('« Première question » seulement pour la toute première question, puis « Question suivante »', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await cocherJoueur(page);
  await lancer(page);
  await expect(page.getByRole('button', { name: 'Première question' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Question suivante' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Première question' }).click();
  await repondre(page, true);
  await lancerLeDe(page);
  await expect(page.getByRole('button', { name: 'Question suivante' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Première question' })).toHaveCount(0);
});

test('réglages : plus de commentaire sous les niveaux ni dans les titres', async ({ page }) => {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  for (const id of ['niveau-maths-aide', 'niveau-ortho-aide', 'niveau-conj-aide', 'niveau-gram-aide', 'niveau-savoir-aide', 'mode-savoir-aide']) {
    await expect(page.locator('#' + id)).toHaveCount(0);
  }
  await expect(page.locator('#reglages-joueur')).not.toContainText('(au moins un)');
  await page.locator('#matieres input[value="maths"]').check();
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('#nombres-titre')).toHaveText('Tables');
  await expect(page.locator('#signes-titre')).toHaveText('Signes');
});
