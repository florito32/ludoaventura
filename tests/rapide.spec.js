// Partie rapide (v6.43, backlog lignes 202 à 205) ; solo, niveau, aventure du niveau, fin « Recommencer » / « Accueil » (v6.45, lignes 207 à 215).
const { test, expect } = require('@playwright/test');
const R = require('../js/rapide.js');
const K = require('../js/calcul.js');
const V = require('../js/conjugaison.js');
const A = require('../js/aventures.js');
const D = require('../js/defis.js');
const G = require('../js/grammaire.js');
const { rapide, lancerRapideQui } = require('./aide');

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
    // v10.4 : Maths = calcul mental ou problème.
    const typesMaths = new Set();
    for (let k = 0; k < 300; k++) { const t = R.carte(['maths'], 'moyen'); expect(t.matiere).toBe('maths'); typesMaths.add(t.maths.type); }
    expect([...typesMaths].sort()).toEqual(['calcul', 'probleme']);
    // v6.55 : Français = orthographe, conjugaison ou grammaire (tous les jeux, au niveau choisi) ;
    // v10.43 : plus de phonèmes (devenus le mini-jeu « Les sons »).
    const vues = new Set();
    for (let k = 0; k < 400; k++) {
      const t = R.carte(['francais'], 'moyen');
      expect(['orthographe', 'conjugaison', 'grammaire']).toContain(t.matiere);
      if (t.matiere === 'grammaire') expect(t.gram).toEqual({ niveau: 'moyen', jeux: G.JEUX.map((j) => j.id) });
      vues.add(t.matiere);
    }
    expect(vues.size).toBe(3);
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
  await expect(page.getByRole('checkbox', { name: 'Géographie' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Histoire' })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Maths' }).uncheck();
  await page.getByRole('checkbox', { name: 'Géographie' }).uncheck();
  await page.getByRole('checkbox', { name: 'Histoire' }).uncheck();
  // v8.5 : sans Géographie ni Histoire, pas de choix Quiz / Normal.
  await expect(page.locator('input[name="rapide-mode"]')).toHaveCount(0);
  // Niveau : Facile par défaut, 4 choix.
  await expect(page.getByRole('radio', { name: 'Facile' })).toBeChecked();
  await expect(page.locator('input[name="rapide-niveau"]')).toHaveCount(4);
  await page.getByRole('radio', { name: 'Difficile' }).check();
  const largeur = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(largeur).toBe(true);
  // Tout tient sans défiler.
  const tient = await page.evaluate(() => { const b = document.getElementById('btn-lancer-rapide').getBoundingClientRect(); return b.bottom <= window.innerHeight; });
  expect(tient).toBe(true);
  await lancerRapideQui(page);
  // Directement sur le plateau : 1 aventurier, aventure difficile.
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  const p = await page.evaluate(() => ({ nb: window.Aventura.partie.joueurs.length, rapide: window.Aventura.partie.rapide, diff: window.Aventura.partie.aventure.difficulte, mots: window.Aventura.partie.mots[0], types: window.Aventura.partie.types[0] }));
  expect(p.nb).toBe(1);
  expect(p.rapide).toEqual({ matieres: ['francais'], niveau: 'difficile', mode: 'quiz' });
  expect(p.diff).toBe('difficile');
  expect(p.mots).toEqual(D.ORTHO.difficile.mots);
  expect(p.types).toEqual(D.ORTHO.difficile.types);
  // Français seulement : orthographe (mots du niveau) et conjugaison (temps du niveau).
  const tirees = await page.evaluate(() => {
    const j = window.Aventura.partie.joueurs[0], t = [];
    for (let k = 0; k < 200; k++) { const c = window.Aventura.piocherCarte(j); t.push(c.type === 'conjugaison' ? 'conjugaison:' + c.temps : c.type === 'calcul' ? 'calcul' : c.type === 'grammaire' ? 'grammaire:' + c.niveau : c.pack === 'grammaire' ? 'grammaire:mot' : 'ortho:' + c.niveau); }
    return t;
  });
  expect(tirees).not.toContain('calcul');
  expect(tirees.some((t) => t.startsWith('conjugaison:'))).toBe(true);
  for (const t of tirees.filter((x) => x.startsWith('ortho:'))) expect(['ortho:4']).toContain(t); // v6.50 : Difficile = série 4
  // v6.55 : la grammaire aussi, au niveau choisi.
  expect(tirees.some((t) => t.startsWith('grammaire:'))).toBe(true);
  for (const t of tirees.filter((x) => x.startsWith('grammaire:'))) expect(['grammaire:difficile', 'grammaire:mot']).toContain(t);
  // v10.43 : les phonèmes ne tombent plus en partie rapide (mini-jeu « Les sons »).
  expect(tirees.some((t) => /honem/.test(t))).toBe(false);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await expect(page.locator('#carte-piochee')).toBeVisible();
  // Recharger pendant la partie la reprend en partie rapide, avec son niveau.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  expect(await page.evaluate(() => window.Aventura.partie.rapide)).toEqual({ matieres: ['francais'], niveau: 'difficile', mode: 'quiz' });
});

// Fin d'une partie rapide (v6.45) : « Recommencer la partie » ou « Retour à l'accueil », pas de retour aux choix.
test('fin de partie rapide : « Recommencer la partie » et « Retour à l’accueil »', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur' && test.info().project.name !== 'telephone', 'deux formats suffisent');
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); localStorage.setItem('ludoaventura-rapide-choix', JSON.stringify({ matieres: ['maths'], niveau: 'moyen' })); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Partie rapide solo' }).click();
  await expect(page.getByRole('radio', { name: 'Moyen' })).toBeChecked();
  await lancerRapideQui(page);
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  const av = await page.evaluate(() => window.Aventura.partie.aventure.id);
  async function jouer() {
    for (let t = 0; t < 5; t++) {
      await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
      await page.locator('#reponse-joueur').waitFor({ state: 'visible' });
      const c = await page.evaluate(() => window.Aventura.partie.carte);
      expect(c.type).toBe('calcul');
      expect(c.packNom).toContain('Moyen');
      await page.locator('#reponse-joueur').fill(c.resultatTexte);
      await page.getByRole('button', { name: /^(OK|Valider)$/ }).click();
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
  expect(apres).toEqual({ av, pts: 0, rapide: { matieres: ['maths'], niveau: 'moyen', mode: 'quiz' } });
  await jouer();
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(page.locator('#btn-commencer')).toBeVisible();
  await expect(page.locator('#ecran-preparation')).toBeHidden();
  // La partie est effacée : plus de partie rapide ni de points en cours.
  await page.waitForFunction(() => window.Aventura && window.Aventura.partie);
  expect(await page.evaluate(() => ({ rapide: window.Aventura.partie.rapide, regles: !!window.Aventura.partie.regles }))).toEqual({ rapide: null, regles: false });
});

// « Modifier les choix » en cours de partie rapide (v9.2, demande du 16/11/2026) : retour aux réglages de la partie rapide.
test('partie rapide : « Modifier les choix » revient aux réglages de la partie rapide, « Reprendre la partie » garde l’aventure et les points', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur' && test.info().project.name !== 'telephone', 'deux formats suffisent');
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); localStorage.setItem('ludoaventura-rapide-choix', JSON.stringify({ matieres: ['maths'], niveau: 'moyen' })); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Partie rapide solo' }).click();
  await lancerRapideQui(page);
  // Sur ordinateur, une carte est piochée avant de modifier (elle sera repiochée) ; sur téléphone la question
  // prend tout l'écran (v9.0), on passe par le menu avant de piocher.
  if (test.info().project.name === 'ordinateur') {
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    await page.waitForFunction(() => window.Aventura.partie.carte);
  }
  const avant = await page.evaluate(() => { const p = window.Aventura.partie; p.regles.points = 9; return { av: p.aventure.id, perso: p.choix[0] }; });
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Modifier les choix' }).click();
  await expect(page.locator('#ecran-rapide')).toBeVisible();
  await expect(page.locator('#ecran-preparation')).toBeHidden();
  await expect(page.getByRole('radio', { name: 'Moyen' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Maths' })).toBeChecked();
  await expect(page.locator('#ecran-rapide .btn-retour')).toHaveText(/Partie/);
  // « ← Partie » : retour au plateau sans changement.
  await page.locator('#ecran-rapide .btn-retour').click();
  await expect(page.locator('#ecran-plateau')).toBeVisible();
  expect(await page.evaluate(() => window.Aventura.partie.rapide)).toEqual({ matieres: ['maths'], niveau: 'moyen', mode: 'quiz' });
  // Modifier : Français, Difficile, puis reprendre.
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Modifier les choix' }).click();
  await page.getByRole('checkbox', { name: 'Français' }).check();
  await page.getByRole('checkbox', { name: 'Maths' }).uncheck();
  await page.getByRole('radio', { name: 'Difficile' }).check();
  await page.getByRole('button', { name: 'Reprendre la partie' }).click();
  await expect(page.locator('#ecran-plateau')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  const apres = await page.evaluate(() => { const p = window.Aventura.partie; return { av: p.aventure.id, perso: p.choix[0], pts: p.regles.points, rapide: p.rapide, modif: p.modif }; });
  expect(apres).toEqual({ av: avant.av, perso: avant.perso, pts: 9, rapide: { matieres: ['francais'], niveau: 'difficile', mode: 'quiz' }, modif: false });
  // La carte non répondue est repiochée avec les nouveaux réglages.
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  expect(await page.evaluate(() => window.Aventura.partie.carte.type)).not.toBe('calcul');
});

// v10.4 (demande du 17/11/2026, backlog ligne 290) : n'importe quelle question des matières, hors Baby jeux :
// problèmes de maths compris (v10.43 : les phonèmes sont un mini-jeu) ; aucune carte de phonèmes ne tombe.
test('partie rapide : problèmes de maths, et plus de phonèmes, sur le plateau', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Partie rapide solo' }).click();
  // Toutes les matières sont cochées au départ.
  await expect(page.getByRole('button', { name: 'Aucune' })).toBeVisible();
  await lancerRapideQui(page);
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  const vus = await page.evaluate(() => {
    const j = window.Aventura.partie.joueurs[0], v = { probleme: 0, calcul: 0, phonemes: 0, baby: 0 };
    for (let k = 0; k < 400; k++) {
      const c = window.Aventura.piocherCarte(j);
      if (c.probleme) v.probleme++; else if (c.type === 'calcul') v.calcul++;
      if (/^Phonèmes/.test(c.packNom || '')) v.phonemes++;
      if (c.module === 'baby') v.baby++;
    }
    return v;
  });
  expect(vus.probleme).toBeGreaterThan(0);
  expect(vus.calcul).toBeGreaterThan(0);
  expect(vus.phonemes).toBe(0);
  expect(vus.baby).toBe(0);
});

test('v10.27 : « Qui joue ? » est demandé au lancement ; « Annuler » ne lance rien ; « C’est parti » lance avec le joueur du compte', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Partie rapide solo' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  const fenetre = page.getByRole('dialog', { name: 'Qui joue ?' });
  await expect(fenetre).toBeVisible();
  await expect(fenetre.locator('.cj-ligne')).toHaveCount(1); // solo : une seule place, pas de « Ajouter un joueur »
  await expect(fenetre.locator('[data-ajouter]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await fenetre.getByRole('button', { name: 'Annuler' }).click();
  await expect(fenetre).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Partie rapide' })).toBeVisible();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await fenetre.getByRole('button', { name: 'C’est parti' }).click();
  await expect(page.getByRole('heading', { name: 'Partie rapide', level: 1 }).or(page.locator('#titre-plateau'))).toBeVisible();
  expect(await page.evaluate(() => window.Aventura.partie.profils)).toEqual(['j-1']);
});
