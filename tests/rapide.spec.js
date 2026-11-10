// Partie rapide (v6.43, backlog lignes 202 à 205) ; solo, niveau, aventure du niveau, fin « Recommencer » / « Accueil » (v6.45, lignes 207 à 215).
const { test, expect } = require('@playwright/test');
const R = require('../js/rapide.js');
const K = require('../js/calcul.js');
const V = require('../js/conjugaison.js');
const A = require('../js/aventures.js');
const D = require('../js/defis.js');
const { rapide } = require('./aide');

test.describe('tirage de la partie rapide', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('solo : un seul aventurier ; l’aventure suit le niveau (Facile → facile… Expert → difficile)', () => {
    const attendu = { facile: 'facile', moyen: 'moyen', difficile: 'difficile', expert: 'difficile' };
    for (const n of Object.keys(attendu)) {
      const vues = new Set();
      for (let k = 0; k < 200; k++) {
        const d = R.generer({ joueurs: 4, matieres: ['maths'], niveau: n });
        expect(d.joueurs).toBe(1);
        expect(d.aventuriers).toHaveLength(1);
        expect(d.niveau).toBe(n);
        expect(A.trouver(d.aventure).difficulte).toBe(attendu[n]);
        vues.add(d.aventure);
      }
      expect(vues.size).toBe(A.LISTE.filter((a) => a.difficulte === attendu[n]).length);
    }
    expect(R.generer({ matieres: ['maths'], niveau: 'n’importe quoi' }).niveau).toBe('facile');
  });

  test('chaque carte a la difficulté du niveau choisi (mêmes réglages que le défi du jour)', () => {
    for (const n of ['facile', 'moyen', 'difficile', 'expert']) {
      for (let k = 0; k < 400; k++) {
        const t = R.carte(['maths', 'francais'], n);
        if (t.maths) {
          expect(t.maths.niveau).toBe(n);
          expect(K.generer(t.maths).resultatTexte).toBeTruthy();
          if (n === 'facile') { expect(t.maths.centaines).toEqual([]); expect(t.maths.dizaines).toEqual([]); }
          if (n === 'expert') expect(t.maths.milliers).toEqual([1000]);
        }
        if (t.conj) {
          expect(t.conj.niveau).toBe(n);
          expect(V.generer(t.conj).bonne).toBeTruthy();
          if (n === 'facile') expect(t.conj.groupes).toEqual([1]);
        }
      }
      const o = R.ortho(n);
      expect(o.packs).toEqual(D.PACKS);
      expect(o.mots).toEqual(D.ORTHO[n].mots);
      expect(o.types).toEqual(D.ORTHO[n].types);
    }
    for (let k = 0; k < 300; k++) expect(R.carte(['maths'], 'moyen').matiere).toBe('maths');
    for (let k = 0; k < 300; k++) expect(['orthographe', 'conjugaison']).toContain(R.carte(['francais'], 'moyen').matiere);
    // Partie rapide gardée d'avant la v6.45 (sans niveau) : tout coché, comme avant.
    expect(R.carte(['maths']).maths.signes).toHaveLength(4);
  });
});

test('accueil → Partie rapide solo : matières (« Tout » / « Aucune » à côté du titre) et niveau, puis la partie se lance @smoke', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Partie rapide solo' }).click();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  // Plus de choix du nombre de joueurs.
  await expect(page.locator('input[name="rapide-joueurs"]')).toHaveCount(0);
  // « Tout » / « Aucune » sur la même ligne que le mot « Matières ».
  const titre = await page.locator('#rapide-titre-matieres').boundingBox();
  const bouton = await page.locator('#btn-rapide-tout').boundingBox();
  expect(Math.abs((titre.y + titre.height / 2) - (bouton.y + bouton.height / 2))).toBeLessThan(8);
  expect(bouton.x).toBeGreaterThan(titre.x + titre.width);
  await expect(page.getByRole('group', { name: 'Matières' })).toBeVisible();
  // Aucune matière : on ne peut pas lancer.
  await page.getByRole('button', { name: 'Aucune' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.locator('#rapide-alerte')).toHaveText('Choisis au moins une matière.');
  await page.getByRole('button', { name: 'Tout', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Maths' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Français' })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Maths' }).uncheck();
  // Niveau : Facile par défaut, 4 choix.
  await expect(page.getByRole('radio', { name: 'Facile' })).toBeChecked();
  await expect(page.locator('input[name="rapide-niveau"]')).toHaveCount(4);
  await page.getByRole('radio', { name: 'Difficile' }).check();
  const largeur = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(largeur).toBe(true);
  // Tout tient sans défiler.
  const tient = await page.evaluate(() => { const b = document.getElementById('btn-lancer-rapide').getBoundingClientRect(); return b.bottom <= window.innerHeight; });
  expect(tient).toBe(true);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  // Directement sur le plateau : 1 aventurier, aventure difficile.
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  const p = await page.evaluate(() => ({ nb: window.Aventura.partie.joueurs.length, rapide: window.Aventura.partie.rapide, diff: window.Aventura.partie.aventure.difficulte, mots: window.Aventura.partie.mots[0], types: window.Aventura.partie.types[0] }));
  expect(p.nb).toBe(1);
  expect(p.rapide).toEqual({ matieres: ['francais'], niveau: 'difficile' });
  expect(p.diff).toBe('difficile');
  expect(p.mots).toEqual(D.ORTHO.difficile.mots);
  expect(p.types).toEqual(D.ORTHO.difficile.types);
  // Français seulement : orthographe (mots du niveau) et conjugaison (temps du niveau).
  const tirees = await page.evaluate(() => {
    const j = window.Aventura.partie.joueurs[0], t = [];
    for (let k = 0; k < 200; k++) { const c = window.Aventura.piocherCarte(j); t.push(c.type === 'conjugaison' ? 'conjugaison:' + c.temps : c.type === 'calcul' ? 'calcul' : 'ortho:' + c.niveau); }
    return t;
  });
  expect(tirees).not.toContain('calcul');
  expect(tirees.some((t) => t.startsWith('conjugaison:'))).toBe(true);
  for (const t of tirees.filter((x) => x.startsWith('ortho:'))) expect(['ortho:2', 'ortho:3']).toContain(t);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(page.locator('#carte-piochee')).toBeVisible();
  // Recharger pendant la partie la reprend en partie rapide, avec son niveau.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  expect(await page.evaluate(() => window.Aventura.partie.rapide)).toEqual({ matieres: ['francais'], niveau: 'difficile' });
});

// Fin d'une partie rapide (v6.45) : « Recommencer la partie » ou « Retour à l'accueil », pas de retour aux choix.
test('fin de partie rapide : « Recommencer la partie » et « Retour à l’accueil »', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur' && test.info().project.name !== 'telephone', 'deux formats suffisent');
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); localStorage.setItem('ludoaventura-rapide-choix', JSON.stringify({ matieres: ['maths'], niveau: 'moyen' })); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Partie rapide solo' }).click();
  await expect(page.getByRole('radio', { name: 'Moyen' })).toBeChecked();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  const av = await page.evaluate(() => window.Aventura.partie.aventure.id);
  async function jouer() {
    for (let t = 0; t < 5; t++) {
      await page.getByRole('button', { name: 'Question suivante' }).click();
      await page.locator('#reponse-joueur').waitFor({ state: 'visible' });
      const c = await page.evaluate(() => window.Aventura.partie.carte);
      expect(c.type).toBe('calcul');
      expect(c.packNom).toContain('Moyen');
      await page.locator('#reponse-joueur').fill(c.resultatTexte);
      await page.getByRole('button', { name: 'OK', exact: true }).click();
      await page.waitForFunction(() => window.Aventura.partie.regles.etape === 'lancer');
      await page.evaluate(() => window.Aventura.lancerDe());
    }
    await expect(page.locator('#fin')).toBeVisible();
  }
  await jouer();
  await expect(page.locator('#fin').getByRole('button')).toHaveText(['Recommencer la partie', 'Retour à l’accueil']);
  await expect(page.locator('#fin')).not.toContainText('Nouvelle partie');
  // Recommencer : même aventure, points remis à zéro, toujours en partie rapide.
  await page.getByRole('button', { name: 'Recommencer la partie' }).click();
  await expect(page.locator('#fin')).toBeHidden();
  const apres = await page.evaluate(() => ({ av: window.Aventura.partie.aventure.id, pts: window.Aventura.partie.regles.points, rapide: window.Aventura.partie.rapide }));
  expect(apres).toEqual({ av, pts: 0, rapide: { matieres: ['maths'], niveau: 'moyen' } });
  await jouer();
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(page.locator('#btn-commencer')).toBeVisible();
  await expect(page.locator('#ecran-preparation')).toBeHidden();
  // La partie est effacée : plus de partie rapide ni de points en cours.
  await page.waitForFunction(() => window.Aventura && window.Aventura.partie);
  expect(await page.evaluate(() => ({ rapide: window.Aventura.partie.rapide, regles: !!window.Aventura.partie.regles }))).toEqual({ rapide: null, regles: false });
});
