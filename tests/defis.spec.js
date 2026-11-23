// Défis du jour (v6.37, demande du 10/11/2026, backlog lignes 166 à 168).
const { test, expect } = require('@playwright/test');
const D = require('../js/defis.js');
const A = require('../js/aventures.js');
const { rapide, lancerLeDe, quiJoue, creerJoueurs } = require('./aide');

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
    const vuesFr = new Set(); // v6.55 : orthographe, conjugaison et grammaire reviennent toutes
    for (let k = 0; k < 365; k++) {
      const j = new Date(Date.UTC(2026, 0, 1 + k)).toISOString().slice(0, 10);
      for (const niveau of ['facile', 'moyen', 'difficile', 'expert']) {
        const m = D.generer(j, { type: 'solo', matiere: 'maths', niveau });
        expect(m.maths.niveau).toBe(niveau);
        expect(m.maths.signes.length).toBeGreaterThan(0);
        expect(m.maths.nombres.length).toBeGreaterThan(0);
        if (niveau === 'expert') expect(m.maths.milliers).toEqual([1000]);
        const f = D.generer(j, { type: 'solo', matiere: 'francais', niveau }, { typesDisponibles: ['nombre', 'voyelles', 'consonnes', 'syllabes', 'nb-voyelles', 'nb-consonnes', 'combien-lettre', 'manquante', 'melange', 'genre', 'muettes', 'ecrire', 'pluriel'] });
        expect(['orthographe', 'conjugaison', 'grammaire']).toContain(f.matiere);
        vuesFr.add(f.matiere);
        if (f.matiere === 'grammaire') { expect(f.gram.niveau).toBe(niveau); expect(f.gram.jeux).toHaveLength(4); }
        else if (f.matiere === 'conjugaison') { expect(f.conj.temps.length).toBeGreaterThan(0); expect(f.conj.modes.length).toBeGreaterThan(0); }
        else { expect(f.packs).toHaveLength(3); expect(f.types.length).toBeGreaterThan(0); expect(f.types).not.toContain('epeler'); }
      }
    }
    expect([...vuesFr].sort()).toEqual(['conjugaison', 'grammaire', 'orthographe']);
  });
});

// Joue la partie lancée en donnant la bonne réponse (calcul) jusqu'à la fin.
async function gagner(page) {
  for (let t = 0; t < 5 * 4; t++) {
    if (await page.evaluate(() => document.getElementById('fin').open)) return;
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
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
  await expect(page.locator('#defi-badge')).toBeHidden(); // v10.30 : rien de chiffré sur l'accueil
  // v6.38 : le défi du jour est en haut de l'écran.
  const haut = await page.evaluate(() => document.getElementById('btn-defi').getBoundingClientRect().top);
  expect(haut).toBeLessThan(80);
  await page.locator('#btn-defi').click();
  await expect(page.getByRole('heading', { name: 'Défi du jour' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Valider' })).toBeDisabled(); // pas avant d'avoir choisi la matière
  await page.locator('label:has(input[name="defi-matiere"][value="maths"])').click();
  await page.locator('label:has(input[name="defi-niveau"][value="facile"])').click();
  // v6.38 : l'aventure reste une surprise (ni aventure, ni aventurier, ni questions avant de valider).
  await expect(page.locator('#ecran-defi img, .defi-aventure, .defi-aventuriers, .defi-cartes')).toHaveCount(0);
  await expect(page.locator('#ecran-defi')).not.toContainText('Objectif');
  await expect(page.locator('.defi-recompense')).toContainText('doublées');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Valider' }).click();
  await quiJoue(page);
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

test('défi en équipe : nombre de joueurs choisi, joueurs demandés (v10.27), plateau « Défi en équipe du jour »', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await creerJoueurs(page, 3);
  await page.locator('#btn-defi').click();
  await page.locator('label:has(input[name="defi-type"][value="equipe"])').click();
  await page.locator('label:has(input[name="defi-matiere"][value="francais"])').click();
  await page.locator('label:has(input[name="defi-niveau"][value="difficile"])').click();
  await page.locator('label:has(input[name="defi-joueurs"][value="3"])').click();
  await expect(page.locator('.defi-aventuriers, .defi-cartes')).toHaveCount(0);
  // Les choix sont gardés : on les retrouve en rouvrant l'écran.
  await page.getByRole('button', { name: 'Accueil' }).click();
  await page.locator('#btn-defi').click();
  await expect(page.locator('input[name="defi-joueurs"][value="3"]')).toBeChecked();
  await page.getByRole('button', { name: 'Valider' }).click();
  await quiJoue(page);
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

// v6.47 (demande du 10/11/2026, backlog ligne 219) : un défi quitté avant la fin ne rapporte plus rien ce jour-là.
test.describe('défi quitté : logique', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));
  const E = require('../js/etoiles.js');
  function memoire() { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; }
  test('commencer un autre défi, en relancer un, ou fermer le jeu = quitté ; perdu jusqu’au bout = on peut retenter', () => {
    let maintenant = new Date(2026, 10, 10, 10);
    const s = memoire(), c = new E.Compte(s, () => maintenant);
    // Perdu jusqu'au bout : pas quitté, on retente avec récompense.
    c.commencerDefi('solo', 'a');
    expect(c.recompenserPartie('a', 10, false, 'solo', 'x').gain).toBeNull();
    expect(c.defiQuitte('solo')).toBe(false);
    c.commencerDefi('solo', 'b');
    expect(c.recompenserPartie('b', 10, true, 'solo', 'x', () => 0.9)).toMatchObject({ base: 10, bonus: 10 });
    // Défi en équipe commencé puis relancé (redémarrer, ou retour à l'accueil puis relancer) : quitté.
    c.commencerDefi('equipe', 'c');
    c.commencerDefi('equipe', 'd');
    expect(c.defiQuitte('equipe')).toBe(true);
    expect(c.defiAFaire('equipe')).toBe(false);
    expect(c.recompenserPartie('d', 30, true, 'equipe', 'x', () => 0)).toMatchObject({ base: 0, gemmes: 0, quitte: true });
    expect(c.etat.total).toBe(20);
    expect(c.etat.gemmes).toBe(0);
    // Le défi solo (déjà réussi) reste jouable ; le lendemain, tout est de nouveau possible.
    maintenant = new Date(2026, 10, 11, 9);
    const c2 = new E.Compte(s, () => maintenant);
    expect(c2.defiQuitte('equipe')).toBe(false);
    // Jeu fermé pendant un défi : à la réouverture, la partie affichée n'est pas ce défi → quitté.
    c2.commencerDefi('solo', 'e');
    c2.verifierDefis(null, null);
    expect(c2.defiQuitte('solo')).toBe(true);
    // Rechargement de la page sur le même défi : pas quitté.
    c2.commencerDefi('equipe', 'f');
    c2.verifierDefis('equipe', 'f');
    expect(c2.defiQuitte('equipe')).toBe(false);
    // Un défi en cours d'hier n'empêche rien aujourd'hui.
    c2.etat.defisEnCours.equipe = { jour: '2026-11-10', id: 'z' };
    c2.commencerDefi('equipe', 'g');
    expect(c2.defiQuitte('equipe')).toBe(false);
  });
});

test('défi quitté avant la fin (retour à l’accueil) : on peut le rejouer mais il ne rapporte plus rien aujourd’hui', async ({ page }) => {
  test.skip(test.info().project.name === 'tablette', 'trois formats suffisent');
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await page.locator('#btn-defi').click();
  await page.locator('label:has(input[name="defi-matiere"][value="maths"])').click();
  await page.locator('label:has(input[name="defi-niveau"][value="facile"])').click();
  await page.getByRole('button', { name: 'Valider' }).click();
  await quiJoue(page);
  await expect(page.getByRole('heading', { name: 'Défi solo du jour' })).toBeVisible();
  // Menu → Retour à l'accueil : l'avertissement le dit.
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(page.locator('#menu-confirmer-texte')).toContainText('ne pourra plus rien te rapporter aujourd’hui');
  await page.getByRole('button', { name: 'Oui, arrêter la partie' }).click();
  await expect(page.locator('#btn-commencer')).toBeVisible();
  // v10.30 : plus de nombre de défis restants sur l'accueil ; l'écran du défi (un seul joueur dans le compte) dit « Quitté ».
  await expect(page.locator('#defi-badge')).toBeHidden();
  await page.locator('#btn-defi').click();
  await expect(page.locator('.defi-type').first()).toContainText('Quitté aujourd’hui');
  await expect(page.locator('.defi-recompense')).toContainText('ne rapporte plus rien');
  // On peut toujours y jouer ; gagné, il ne rapporte ni étoiles ni pierres.
  await page.getByRole('button', { name: 'Valider' }).click();
  await quiJoue(page);
  await gagner(page);
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  await expect(page.locator('#fin-etoiles')).toContainText('Tu as quitté ce défi avant la fin');
  await expect(page.locator('#fin-etoiles')).not.toContainText('+');
  expect(await page.evaluate(() => [window.Recompenses.compte.etat.total, window.Recompenses.compte.etat.gemmes])).toEqual([0, 0]);
});

// v10.30 (backlog lignes 447, 454) : à plusieurs, chacun reçoit les étoiles qu'il a lui-même récoltées (doublées au défi),
// et le défi quitté ne bloque que les joueurs de cette partie.
test.describe('trésor par joueur', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));
  const E = require('../js/etoiles.js'), J = require('../js/joueurs.js');
  function memoire() { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; }
  const LE_10 = () => new Date(2026, 10, 10, 10);

  test('fin de partie : chacun ses étoiles, défi doublé une fois par joueur, perdue : rien', () => {
    const c = new E.Compte(memoire(), LE_10);
    const tom = J.creer(c.etat, 'Tom', 'tom').joueur.id;
    const r = c.recompenserJoueurs('a', [{ joueur: 'j-1', unites: 12 }, { joueur: tom, unites: 5 }], true, 'equipe', 'Défi', () => 0.9);
    expect(r.map((x) => [x.joueur, x.base, x.bonus])).toEqual([['j-1', 12, 12], [tom, 5, 5]]);
    expect(c.recompenserJoueurs('a', [{ joueur: 'j-1', unites: 12 }], true, 'equipe', 'Défi')).toBeNull(); // une seule fois
    // Le lendemain n'est pas encore là : Joueur 1 a déjà son défi, un 3e joueur l'a encore.
    const ines = J.creer(c.etat, 'Inès', 'ines').joueur.id;
    const r2 = c.recompenserJoueurs('b', [{ joueur: 'j-1', unites: 4 }, { joueur: ines, unites: 6 }], true, 'equipe', 'Défi', () => 0.9);
    expect(r2.map((x) => [x.base, x.bonus, !!x.defiDejaFait])).toEqual([[4, 0, true], [6, 6, false]]);
    expect(c.recompenserJoueurs('c', [{ joueur: tom, unites: 9 }], false, null, 'x')[0].gain).toBeNull();
    expect([c.pourJoueur('j-1').etat.total, c.pourJoueur(tom).etat.total, c.pourJoueur(ines).etat.total]).toEqual([28, 10, 12]);
    expect(c.etat.total).toBe(50); // le compte garde la somme (classements)
  });

  test('défi quitté : seuls les joueurs de la partie perdent la récompense du jour', () => {
    const c = new E.Compte(memoire(), LE_10);
    const tom = J.creer(c.etat, 'Tom', 'tom').joueur.id;
    c.commencerDefi('solo', 'p1', [tom]);
    c.marquerQuitte('solo');
    expect(c.pourJoueur(tom).defiQuitte('solo')).toBe(true);
    expect(c.pourJoueur('j-1').defiQuitte('solo')).toBe(false);
    const r = c.recompenserJoueurs('p2', [{ joueur: tom, unites: 8 }], true, 'solo', 'x');
    expect(r[0]).toMatchObject({ quitte: true, base: 0 });
    expect(c.recompenserJoueurs('p3', [{ joueur: 'j-1', unites: 8 }], true, 'solo', 'x', () => 0.9)[0]).toMatchObject({ base: 8, bonus: 8 });
  });

  test('migration : ce que le compte avait gagné revient à Joueur 1, une seule fois', () => {
    const s = memoire();
    s.setItem(E.CLE, JSON.stringify({ v: 1, total: 140, gemmes: 3, coffresJour: { '2026-11-09': 8 }, coffresNiveau: { 2: 12 }, simplesDepuis: 3, parties: [] }));
    const c = new E.Compte(s, LE_10);
    expect(c.etat.parJoueur).toBe(1);
    const p = c.pourJoueur('j-1');
    expect([p.etat.total, p.etat.gemmes, p.etat.simplesDepuis, p.etat.coffresNiveau]).toEqual([140, 3, 3, { 2: 12 }]);
    const tom = J.creer(c.etat, 'Tom', 'tom').joueur.id;
    c.pourJoueur(tom).gagner(30, 'partie', 'x');
    c.ecrire();
    const c2 = new E.Compte(s, LE_10); // relu : pas de nouvelle migration (Tom n'est pas recompté chez Joueur 1)
    expect([c2.pourJoueur('j-1').etat.total, c2.pourJoueur(tom).etat.total, c2.etat.total]).toEqual([140, 30, 170]);
    expect(c2.pourJoueur(tom).etat.simplesDepuis).toBe(1); // nouveau joueur : coffres simples dès le niveau 2
  });

  test('synchronisation : les gains d\'un joueur depuis le dernier envoi s\'ajoutent à ceux du compte', () => {
    const C = require('../js/compte.js');
    const rec = (t, g) => ({ total: t, gemmes: g });
    const j = (t, g) => [{ id: 'j-1', nom: 'Joueur 1', perso: 'lea', maj: '2026-11-10', niv: {}, rec: rec(t, g) }];
    const base = { uid: 'u', total: 100, gemmes: 2, joueurs: { 'j-1': { total: 100, gemmes: 2 } } };
    const local = { v: 1, total: 110, gemmes: 3, parJoueur: 1, joueurs: j(110, 3) };    // +10 ⭐, +1 pierre sur cet appareil
    const distant = { v: 1, total: 125, gemmes: 2, parJoueur: 1, joueurs: j(125, 2) }; // +25 ⭐ sur un autre appareil
    const r = C.fusionner(local, distant, base);
    expect([r.total, r.joueurs[0].rec.total, r.joueurs[0].rec.gemmes]).toEqual([135, 135, 3]);
    // Compte écrit par un appareil d'avant la v10.30 : ce qu'il a gagné depuis la base revient à Joueur 1.
    const ancien = { v: 1, total: 130, gemmes: 2 };
    const r2 = C.fusionner(local, ancien, base);
    expect([r2.total, r2.joueurs[0].rec.total, r2.parJoueur]).toEqual([140, 140, 1]);
  });
});
