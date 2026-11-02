// Outils partagés par les tests.
// Va de l'accueil au plateau : nombre de joueurs et aventure au choix.
// Les tests raccourcissent la pause entre deux joueurs (2,2 s en vrai) et repoussent le lancer
// automatique du dé (1,6 s en vrai) pour pouvoir cliquer « Lancer le dé » sans course.
async function rapide(page, { autoDe = 600000, pause = 80 } = {}) {
  await page.addInitScript(([a, p]) => { window.AVENTURA_PAUSE = p; window.AVENTURA_DUREE_DE = 0; window.AVENTURA_AUTO_DE = a; }, [autoDe, pause]);
  page.__rapide = true;
}

// Packs et questions sont décochés au départ (v3.9) : coche tout pour chaque joueur, puis revient au joueur 1.
async function cocherTout(page, joueurs) {
  for (let k = 0; k < joueurs; k++) {
    await page.locator('.onglet-joueur').nth(k).click();
    for (const c of await page.locator('#packs input, #types-questions input').all()) await c.check();
  }
  await page.locator('.onglet-joueur').nth(0).click();
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
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('radio', { name: new RegExp('^' + joueurs + ' joueurs?$') }).check();
  await page.getByRole('radio', { name: new RegExp('^' + aventure) }).check();
  await cocherTout(page, joueurs);
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
}
// Attend que le tour passe au joueur suivant (enchaînement automatique après le dé).
async function attendreJoueur(page, nom) {
  await page.locator('#tour-nom').filter({ hasText: new RegExp('^' + nom + '$') }).waitFor();
  await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
}

module.exports = { lancerPartie, rapide, attendreJoueur, cocherTout, ouvrirNeuf };
