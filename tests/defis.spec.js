// Défis du jour (v6.37, demande du 10/11/2026, backlog lignes 166 à 168).
const { test, expect } = require('@playwright/test');
const D = require('../js/defis.js');
const A = require('../js/aventures.js');
const { rapide, lancerLeDe } = require('./aide');

test.describe('tirage des défis', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('même jour et mêmes choix → même défi ; il change d\'un jour à l\'autre', () => {
    const c = { type: 'solo', matiere: 'maths', niveau: 'moyen' };
    expect(D.generer('2026-11-10', c)).toEqual(D.generer('2026-11-10', c));
    const jours = ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'].map((j) => JSON.stringify(D.generer(j, c)));
    expect(new Set(jours).size).toBeGreaterThan(1);
  });

  test('solo : 1 aventurier ; équipe : le nombre choisi, tous différents ; aventure de la difficulté du niveau', () => {
    for (const niveau of ['facile', 'moyen', 'difficile', 'expert']) {
      const s = D.generer('2026-11-10', { type: 'solo', matiere: 'maths', niveau });
      expect(s.aventuriers).toHaveLength(1);
      expect(A.trouver(s.aventure).difficulte).toBe(niveau === 'expert' ? 'difficile' : niveau);
      for (const joueurs of [2, 3, 4]) {
        const e = D.generer('2026-11-10', { type: 'equipe', matiere: 'francais', niveau, joueurs });
        expect(e.joueurs).toBe(joueurs);
        expect(new Set(e.aventuriers).size).toBe(joueurs);
      }
    }
  });

  test('réglages complets pour chaque matière et niveau (un an de défis)', () => {
    for (let k = 0; k < 365; k++) {
      const j = new Date(Date.UTC(2026, 0, 1 + k)).toISOString().slice(0, 10);
      for (const niveau of ['facile', 'moyen', 'difficile', 'expert']) {
        const m = D.generer(j, { type: 'solo', matiere: 'maths', niveau });
        expect(m.maths.niveau).toBe(niveau);
        expect(m.maths.signes.length).toBeGreaterThan(0);
        expect(m.maths.nombres.length).toBeGreaterThan(0);
        if (niveau === 'expert') expect(m.maths.milliers).toEqual([1000]);
        const f = D.generer(j, { type: 'solo', matiere: 'francais', niveau }, { typesDisponibles: ['nombre', 'voyelles', 'consonnes', 'syllabes', 'nb-voyelles', 'nb-consonnes', 'combien-lettre', 'manquante', 'melange', 'genre', 'muettes', 'ecrire', 'pluriel'] });
        expect(['orthographe', 'conjugaison']).toContain(f.matiere);
        if (f.matiere === 'conjugaison') { expect(f.conj.temps.length).toBeGreaterThan(0); expect(f.conj.modes.length).toBeGreaterThan(0); }
        else { expect(f.packs).toHaveLength(3); expect(f.types.length).toBeGreaterThan(0); expect(f.types).not.toContain('epeler'); }
      }
    }
  });
});

// Joue la partie lancée en donnant la bonne réponse (calcul) jusqu'à la fin.
async function gagner(page) {
  for (let t = 0; t < 5 * 4; t++) {
    if (await page.evaluate(() => document.getElementById('fin').open)) return;
    await page.getByRole('button', { name: 'Question suivante' }).click();
    const juste = await page.evaluate(() => window.Aventura.partie.carte.resultatTexte);
    await page.locator('#reponse-joueur').fill(juste);
    await page.getByRole('button', { name: 'OK' }).click();
    await lancerLeDe(page);
    // Attendre le tour suivant (bouton « Question suivante ») ou l'écran de fin.
    await page.waitForFunction(() => document.getElementById('fin').open ||
      [...document.querySelectorAll('#tour-actions button')].some((b) => b.textContent.includes('Question suivante')));
  }
}

test('défi solo du jour : le joueur choisit seulement matière et niveau ; gagné, ses étoiles sont doublées une fois @smoke', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await expect(page.locator('#defi-badge')).toHaveText('2');
  await page.locator('#btn-defi').click();
  await expect(page.getByRole('heading', { name: 'Défi du jour' })).toBeVisible();
  await expect(page.locator('#btn-lancer-defi')).toHaveCount(0); // pas de défi avant d'avoir choisi la matière
  await page.locator('label:has(input[name="defi-matiere"][value="maths"])').click();
  await page.locator('label:has(input[name="defi-niveau"][value="facile"])').click();
  await expect(page.locator('.defi-aventure h3')).toContainText('Aventure');
  await expect(page.locator('.defi-aventuriers li')).toHaveCount(1);
  await expect(page.locator('.defi-recompense')).toContainText('doublées');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Lancer le défi' }).click();
  await expect(page.getByRole('heading', { name: 'Défi solo du jour' })).toBeVisible();
  const p = await page.evaluate(() => ({ nb: window.Aventura.partie.nbJoueurs, m: window.Aventura.partie.matiere[0], defi: window.Aventura.partie.defi.type, niv: window.Aventura.partie.maths[0].niveau }));
  expect(p).toEqual({ nb: 1, m: 'maths', defi: 'solo', niv: 'facile' });
  await gagner(page);
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  const pts = await page.evaluate(() => window.Aventura.partie.regles.points);
  await expect(page.locator('#fin-etoiles')).toContainText('+' + (2 * pts) + ' étoiles');
  await expect(page.locator('#fin-etoiles')).toContainText('Défi du jour réussi');
  // Rejouer le même défi : étoiles normales.
  await page.getByRole('button', { name: 'Rejouer cette aventure' }).click();
  await gagner(page);
  const pts2 = await page.evaluate(() => window.Aventura.partie.regles.points);
  await expect(page.locator('#fin-etoiles')).toContainText('+' + pts2 + ' étoile');
  await expect(page.locator('#fin-etoiles')).toContainText('déjà réussi');
  expect(await page.evaluate(() => window.Recompenses.compte.etat.total)).toBe(2 * pts + pts2);
  // « Nouvelle partie » : on sort du défi, la préparation est vierge comme avant.
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  expect(await page.evaluate(() => [window.Aventura.partie.defi, window.Aventura.partie.matiere[0]])).toEqual([null, null]);
});

test('défi en équipe : nombre de joueurs choisi, aventuriers tirés, plateau « Défi en équipe du jour »', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await page.locator('#btn-defi').click();
  await page.locator('label:has(input[name="defi-type"][value="equipe"])').click();
  await page.locator('label:has(input[name="defi-matiere"][value="francais"])').click();
  await page.locator('label:has(input[name="defi-niveau"][value="difficile"])').click();
  await page.locator('label:has(input[name="defi-joueurs"][value="3"])').click();
  await expect(page.locator('.defi-aventuriers li')).toHaveCount(3);
  await expect(page.locator('.defi-cartes')).toContainText(/Orthographe|Conjugaison/);
  // Les choix sont gardés : on les retrouve en rouvrant l'écran.
  await page.getByRole('button', { name: 'Accueil' }).click();
  await page.locator('#btn-defi').click();
  await expect(page.locator('input[name="defi-joueurs"][value="3"]')).toBeChecked();
  await page.getByRole('button', { name: 'Lancer le défi' }).click();
  await expect(page.getByRole('heading', { name: 'Défi en équipe du jour' })).toBeVisible();
  const p = await page.evaluate(() => ({ nb: window.Aventura.partie.nbJoueurs, defi: window.Aventura.partie.defi.type, m: window.Aventura.partie.matiere.slice(0, 3) }));
  expect(p.nb).toBe(3); expect(p.defi).toBe('equipe');
  expect(new Set(p.m).size).toBe(1);
  // Le défi survit à un rechargement de la page.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Défi en équipe du jour' })).toBeVisible();
  // « Modifier les choix » en fait une partie libre.
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Modifier les choix' }).click();
  expect(await page.evaluate(() => window.Aventura.partie.defi)).toBeNull();
});
