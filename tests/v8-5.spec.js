// v8.5 (demande du 13/11/2026, BACKLOG lignes 337 à 340) :
//  - plus de petits commentaires sous les niveaux, sous le mode et dans les titres des réglages ;
//  - (l'écran de la partie rapide solo a été retiré le 24/11/2026, ligne 519 ; reste le tirage des cartes) ;
//  - la toute première question de la partie s'appelle « Première question ».
const { test, expect } = require('@playwright/test');
const R = require('../js/rapide.js');
const { rapide, versReglages, cocherJoueur, lancer, repondre, lancerLeDe, cocher } = require('./aide');

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
    expect([...vues].sort()).toEqual(['conjugaison', 'geographie', 'grammaire', 'histoire', 'maths', 'orthographe']); // v10.43 : plus de phonèmes
    expect(R.generer({ matieres: ['histoire'], niveau: 'moyen', mode: 'normal' })).toMatchObject({ matieres: ['histoire'], mode: 'normal' });
    expect(R.generer({ matieres: [], niveau: 'moyen' }).matieres).toEqual(['maths', 'francais', 'geographie', 'histoire']);
  });
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
  await cocher(page, '#matieres', 'maths');
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('#nombres-titre')).toHaveText('Tables');
  await expect(page.locator('#signes-titre')).toHaveText('Signes');
});
