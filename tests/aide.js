// Outils partagés par les tests.
// Va de l'accueil au plateau : nombre de joueurs et aventure au choix.
// Les tests raccourcissent la pause entre deux joueurs (2,2 s en vrai) et repoussent le lancer
// automatique du dé (1,6 s en vrai) pour pouvoir lancer le dé (lancerLeDe) sans course.
async function rapide(page, { autoDe = 600000, pause = 80 } = {}) {
  await page.addInitScript(([a, p]) => { window.AVENTURA_PAUSE = p; window.AVENTURA_DUREE_DE = 0; window.AVENTURA_AUTO_DE = a; }, [autoDe, pause]);
  page.__rapide = true;
}

// Préparation en écrans successifs (v4.6) : 1 nombre de joueurs → 2 aventuriers → 3 cartes → 4 aventure.
// Le bouton « Valider » visible fait passer au joueur suivant, puis à l'écran suivant.
async function valider(page) {
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
}

// Coche tous les packs et toutes les questions du joueur affiché (écran 3).
async function cocherJoueur(page) {
  for (const c of await page.locator('#packs input, #types-questions input').all()) await c.check();
}

// Écran 3 : packs et questions sont décochés au départ (v3.9) : coche tout pour chaque joueur et valide
// (on arrive sur l'écran 4, le choix de l'aventure).
async function cocherTout(page, joueurs) {
  for (let k = 0; k < joueurs; k++) { await cocherJoueur(page); await valider(page); }
  await page.getByRole('button', { name: 'Lancer la partie' }).waitFor();
}

// De l'accueil jusqu'à l'écran 3 (cartes du joueur 1), aventuriers par défaut.
async function versReglages(page, joueurs) {
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('radio', { name: new RegExp('^' + joueurs + ' joueurs?$') }).check();
  await valider(page);
  for (let k = 0; k < joueurs; k++) await valider(page);
  await page.locator('#reglages-titre').waitFor();
}

// Termine la préparation (valide les écrans restants) et lance la partie.
async function lancer(page) {
  const go = page.getByRole('button', { name: 'Lancer la partie' });
  while (!(await go.isVisible())) await valider(page);
  await go.click();
}

// Depuis v4.0 la partie est gardée dans l'onglet (sessionStorage) : pour une nouvelle partie dans la
// même page de test, on efface cette sauvegarde, comme si l'onglet avait été fermé.
async function ouvrirNeuf(page) {
  // (la page sauvegarde aussi en partant : on efface après ses sauvegardes de pagehide et visibilitychange.)
  if (page.url().startsWith('http')) {
    await page.evaluate(() => {
      const effacer = () => sessionStorage.clear();
      effacer();
      window.addEventListener('pagehide', effacer);
      document.addEventListener('visibilitychange', effacer); // déclenché après pagehide quand la page se décharge
    });
  }
  await page.goto('./');
}

async function lancerPartie(page, { joueurs = 2, aventure = 'Viking' } = {}) {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await ouvrirNeuf(page);
  await versReglages(page, joueurs);
  await cocherTout(page, joueurs);
  await page.getByRole('radio', { name: new RegExp('^' + aventure) }).check();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
}
// Lance le dé tout de suite (le bouton « Lancer le dé » n'existe plus depuis v4.3 : sans les tests, il se lance seul).
async function lancerLeDe(page) {
  await page.waitForFunction(() => window.Aventura && window.Aventura.partie.regles && window.Aventura.partie.regles.etape === 'lancer');
  await page.evaluate(() => window.Aventura.lancerDe());
}

// Attend que le tour passe au joueur suivant (enchaînement automatique après le dé).
async function attendreJoueur(page, nom) {
  await page.locator('#tour-nom').filter({ hasText: new RegExp('^' + nom + '$') }).waitFor();
  await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
}

module.exports = { valider, cocherJoueur, versReglages, lancer, lancerLeDe, lancerPartie, rapide, attendreJoueur, cocherTout, ouvrirNeuf };
