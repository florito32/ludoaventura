// Tours de jeu : pioche dans son tas, bonne / mauvaise réponse, dé, points cumulés, fin de partie.
const { test, expect } = require('@playwright/test');
const R = require('../js/regles.js');
const { lancerPartie, attendreJoueur, rapide, lancerLeDe } = require('./aide');

test.describe('règles du déroulement', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('3 joueurs : 5 manches × 3 tours, croix par croix, points cumulés', () => {
    const p = R.nouvellePartie(3, 54);
    expect(p.positions).toEqual([1, 0, 0]);
    let tours = 0, total = 0;
    while (true) {
      R.piocher(p);
      const bonne = tours % 2 === 0;
      R.repondre(p, bonne);
      expect(p.de).toBe(bonne ? 'fort' : 'faible');
      const v = bonne ? 5 : 2;
      R.lancer(p, v);
      total += v; tours++;
      expect(p.points).toBe(total);
      if (p.etape === 'fin') break;
      const avant = p.manche;
      R.suivant(p);
      // Tous les joueurs passent sur une croix avant d'avancer à la suivante.
      if (p.joueur === 0) expect(p.manche).toBe(avant + 1);
      expect(p.positions[p.joueur]).toBe(p.manche);
    }
    expect(tours).toBe(15);
    expect(p.manche).toBe(5);
    expect(p.positions).toEqual([5, 5, 5]);
    expect(p.pioches).toEqual([5, 5, 5]); // chacun a pioché 5 cartes dans son propre tas
    expect(R.reussie(p)).toBe(total >= 54);
  });

  test('on ne peut pas sauter d\'étape ni tricher sur le dé', () => {
    const p = R.nouvellePartie(1, 15);
    expect(() => R.lancer(p, 6)).toThrow();
    R.piocher(p);
    R.repondre(p, false);
    expect(() => R.lancer(p, 6)).toThrow(); // le dé FAIBLE n'a pas de 6
    R.lancer(p, 3);
    expect(p.points).toBe(3);
  });
});

test('un tour complet : piocher, répondre, lancer, message écrit puis joueur suivant automatiquement', async ({ page }) => {
  await rapide(page, { pause: 1500 }); // le message « Léa gagne… » reste affiché assez longtemps pour être lu par le test
  await lancerPartie(page, { joueurs: 2 });
  await expect(page.locator('#tour-nom')).toHaveText('Léa');
  // Le tour de jeu n'écrit plus « Croix 1 sur 5 — la prairie » (demande du 02/11/2026).
  await expect(page.locator('#tour')).not.toContainText(/Croix \d sur \d/);
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await expect(page.locator('#carte-piochee')).toBeVisible();
  await expect(page.locator('#carte-titre')).not.toContainText('Carte n°'); // v6.27
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await lancerLeDe(page);
  const pts = Number(await page.locator('#points').textContent());
  expect(pts).toBeGreaterThanOrEqual(4);
  expect(pts).toBeLessThanOrEqual(6);
  // C'est écrit sur le plateau (bandeau), puis on passe tout seul au joueur suivant.
  await expect(page.locator('#bandeau')).toHaveText(`Léa gagne ${pts} points ! Au tour de Tom.`);
  await expect(page.locator('#bandeau')).toBeVisible();
  // v5.2 : plus écrit dans l'encadré Tour de jeu (seulement pour les lecteurs d'écran).
  await expect(page.locator('#tour-consigne .visually-hidden')).toHaveText(`Léa gagne ${pts} points ! Au tour de Tom.`);
  expect(await page.locator('#tour-consigne').evaluate((el) => el.offsetHeight > 0 && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))).toBe(false);
  await expect(page.locator('#tour')).not.toContainText(/gagne \d+ points?/, { useInnerText: true });
  await attendreJoueur(page, 'Tom');
  await expect(page.locator('.pion').nth(1)).toHaveAttribute('data-case', '1');
});

async function jouerPartie(page, bonne) {
  for (let t = 0; t < 10; t++) {
    await page.getByRole('button', { name: 'Question suivante' }).click();
    await page.getByRole('button', { name: bonne ? 'Bonne réponse' : 'Mauvaise réponse' }).click();
    await lancerLeDe(page);
    if (t < 9) await page.getByRole('button', { name: 'Question suivante' }).waitFor();
  }
  // Après le dernier lancer, le résultat s'affiche tout seul.
}

test('partie entière gagnée : toutes les réponses bonnes → aventure réussie @smoke', async ({ page }) => {
  test.setTimeout(60_000);
  await lancerPartie(page, { joueurs: 2, aventure: 'Savane' }); // objectif 42, au moins 40 points avec le dé FORT
  await jouerPartie(page, true);
  const pts = Number(await page.locator('#points').textContent());
  expect(pts).toBeGreaterThanOrEqual(40);
  await expect(page.locator('.pion').nth(0)).toHaveAttribute('data-case', '5');
  await expect(page.locator('.pion').nth(1)).toHaveAttribute('data-case', '5');
  const fin = page.getByRole('dialog');
  await expect(fin).toBeVisible();
  await expect(fin.getByRole('heading')).toHaveText(pts >= 42 ? 'Aventure réussie !' : 'Aventure manquée…');
  await expect(fin).toContainText(`${pts} points pour un objectif de 42 gazelles à chasser`);
  await fin.getByRole('button', { name: 'Rejouer cette aventure' }).click();
  await expect(page.locator('#points')).toHaveText('0');
  await expect(page.locator('#rouleau-nom')).toHaveText('Savane');
});

test('partie entière perdue : toutes les réponses mauvaises → aventure manquée', async ({ page }) => {
  test.setTimeout(60_000);
  await lancerPartie(page, { joueurs: 2, aventure: 'Viking' }); // objectif 30, au plus 30 points avec le dé FAIBLE
  await jouerPartie(page, false);
  const pts = Number(await page.locator('#points').textContent());
  expect(pts).toBeLessThanOrEqual(30);
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(pts >= 30 ? 'Aventure réussie !' : 'Aventure manquée…');
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  await expect(page.getByRole('heading', { name: 'Préparer la partie' })).toBeVisible();
  await expect(page.locator('#prepa-progres')).toHaveText('Étape 1 sur 4'); // une nouvelle partie repart du nombre de joueurs
});

test('animation de réponse : « Bravo ! » et confettis si bonne, « Oups ! » si mauvaise', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2 });
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  const reaction = page.locator('#reaction');
  await expect(reaction).toHaveClass(/bonne/);
  await expect(reaction).toContainText('Bravo !');
  await expect(reaction.locator('i')).toHaveCount(18);
  await expect(page.locator('.pion').nth(0)).toHaveClass(/saute/);
  await lancerLeDe(page);
  await attendreJoueur(page, 'Tom');
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.getByRole('button', { name: 'Mauvaise réponse' }).click();
  await expect(reaction).toHaveClass(/mauvaise/);
  await expect(reaction).toContainText('Oups !');
  await expect(page.locator('.pion').nth(1)).toHaveClass(/secoue/);
});

test('après l\u2019animation de réponse, le bon dé se lance tout seul (FORT si bonne) ; FAIBLE après « J’ai compris » (v6.1)', async ({ page }) => {
  await rapide(page, { autoDe: 300 });
  page.__rapide = true;
  await lancerPartie(page, { joueurs: 2 });
  for (const [reponse, min, max, nom] of [['Bonne réponse', 4, 6, 'Tom'], ['Mauvaise réponse', 1, 3, 'Léa']]) {
    const avant = Number(await page.locator('#points').textContent());
    await page.getByRole('button', { name: 'Question suivante' }).click();
    await page.getByRole('button', { name: reponse }).click();
    // v4.3 : ni commentaire visible ni bouton « Lancer le dé » dans le tour de jeu ;
    // v6.1 : après une mauvaise réponse, seul le bouton « J'ai compris ».
    if (reponse === 'Bonne réponse') await expect(page.locator('#tour-actions')).toBeEmpty();
    else await page.getByRole('button', { name: 'J’ai compris' }).click();
    await expect(page.locator('#tour-consigne .visually-hidden')).toHaveCount(1);
    await expect(page.locator('#tour-consigne')).not.toContainText('Bravo');
    // Le dé roule seul, les points arrivent et le tour passe.
    await attendreJoueur(page, nom);
    const gain = Number(await page.locator('#points').textContent()) - avant;
    expect(gain).toBeGreaterThanOrEqual(min);
    expect(gain).toBeLessThanOrEqual(max);
  }
});

test('lancer le dé avant le lancer automatique ne le lance pas deux fois', async ({ page }) => {
  await rapide(page, { autoDe: 400 });
  page.__rapide = true;
  await lancerPartie(page, { joueurs: 1 });
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await lancerLeDe(page);
  const pts = Number(await page.locator('#points').textContent());
  await page.getByRole('button', { name: 'Question suivante' }).waitFor();
  await page.waitForTimeout(800);
  await expect(page.locator('#points')).toHaveText(String(pts));
  await expect(page.getByRole('button', { name: 'Question suivante' })).toBeVisible();
});

test('v4.3 : pas de commentaire visible dans le tour de jeu au moment de piocher', async ({ page }) => {
  await lancerPartie(page, { joueurs: 2 });
  await page.getByRole('button', { name: 'Question suivante' }).waitFor();
  // Seul un texte pour lecteurs d'écran (masqué à l'écran) reste dans la consigne.
  const visibles = await page.locator('#tour-consigne').evaluate((el) =>
    Array.from(el.childNodes).filter((n) => !(n.classList && n.classList.contains('visually-hidden')) && n.textContent.trim()).length);
  expect(visibles).toBe(0);
  await expect(page.locator('#tour-consigne')).not.toContainText('avance sur la croix');
});

test('v4.5 : à la fin de « Bravo ! » / « Oups ! », le personnage reste sur sa croix (pas de disparition-réapparition)', async ({ page }) => {
  await rapide(page, { autoDe: 300 });
  page.__rapide = true;
  await lancerPartie(page, { joueurs: 2 });
  for (const reponse of ['Bonne réponse', 'Mauvaise réponse']) {
    await page.getByRole('button', { name: 'Question suivante' }).click();
    // L'arrivée normale des personnages en début de partie doit être finie avant de compter.
    await page.waitForFunction(() => [...document.querySelectorAll('.pion .figurine')]
      .every((f) => f.getAnimations().every((a) => a.animationName !== 'poser' || a.playState === 'finished')));
    // On compte les animations « poser » (arrivée du personnage) qui démarrent à partir de maintenant.
    await page.evaluate(() => {
      window.__arrivees = 0;
      document.querySelector('#pions').addEventListener('animationstart', (e) => { if (e.animationName === 'poser') window.__arrivees++; });
    });
    await page.getByRole('button', { name: reponse }).click();
    await page.locator('#reaction:not([hidden])').waitFor({ state: 'attached' });
    await page.locator('#reaction[hidden]').waitFor({ state: 'attached', timeout: 5000 }); // fin de l'animation de réponse
    if (reponse === 'Mauvaise réponse') await page.getByRole('button', { name: 'J’ai compris' }).click(); // v6.1
    await expect(page.locator('#de-plateau')).toHaveClass(/pose/);
    expect(await page.evaluate(() => window.__arrivees)).toBe(0);
    await page.getByRole('button', { name: 'Question suivante' }).waitFor();
  }
});

// v6.1 : après une erreur, le joueur a le temps de comprendre : la réponse s'affiche et le dé attend « J'ai compris ».
test('orthographe, « Mauvaise réponse » : la réponse s\'affiche, le dé FAIBLE attend « J\'ai compris »', async ({ page }) => {
  await rapide(page, { autoDe: 50 });
  await lancerPartie(page, { joueurs: 2 });
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.getByRole('button', { name: 'Mauvaise réponse' }).click();
  await expect(page.locator('#carte-reponse')).toBeVisible();
  await expect(page.locator('#carte-mot')).not.toHaveClass(/cache/);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.Aventura.partie.regles.etape)).toBe('lancer');
  expect(Number(await page.locator('#points').textContent())).toBe(0);
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await expect.poll(async () => Number(await page.locator('#points').textContent())).toBeGreaterThanOrEqual(1);
  expect(Number(await page.locator('#points').textContent())).toBeLessThanOrEqual(3);
  // Une bonne réponse, elle, lance le dé FORT tout seul.
  await attendreJoueur(page, 'Tom');
  await page.getByRole('button', { name: 'Question suivante' }).click();
  await page.getByRole('button', { name: 'Bonne réponse' }).click();
  await expect(page.getByRole('button', { name: 'J’ai compris' })).toHaveCount(0);
  await expect.poll(async () => Number(await page.locator('#points').textContent())).toBeGreaterThanOrEqual(5);
});

// v6.21 : à la fin d'une manche, on annonce où l'équipe part (demande du 04/11/2026) au lieu de « croix suivante ».
test('v6.21 : fin de manche, « en route vers le lac / le marais / les collines / le volcan »', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'texte identique sur tous les formats');
  await rapide(page, { pause: 1200 });
  await lancerPartie(page, { joueurs: 1 });
  for (const lieu of ['le lac', 'le marais', 'les collines', 'le volcan']) {
    await page.getByRole('button', { name: 'Question suivante' }).click();
    await page.getByRole('button', { name: 'Bonne réponse' }).click();
    await lancerLeDe(page);
    await expect(page.locator('#bandeau')).toContainText('Au tour de Léa, en route vers ' + lieu + '.');
    await expect(page.locator('#bandeau')).not.toContainText('croix suivante');
    await attendreJoueur(page, 'Léa');
  }
});
