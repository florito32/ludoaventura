// Outils partagés par les tests.
// Va de l'accueil au plateau : nombre de joueurs et aventure au choix.
// Les tests raccourcissent la pause entre deux joueurs (2,2 s en vrai) et repoussent le lancer
// automatique du dé (1,6 s en vrai) pour pouvoir cliquer « Lancer le dé » sans course.
async function rapide(page, { autoDe = 600000 } = {}) {
  await page.addInitScript((a) => { window.AVENTURA_PAUSE = 80; window.AVENTURA_DUREE_DE = 0; window.AVENTURA_AUTO_DE = a; }, autoDe);
}

async function lancerPartie(page, { joueurs = 2, aventure = 'Viking' } = {}) {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('radio', { name: new RegExp('^' + joueurs + ' joueurs?$') }).check();
  await page.getByRole('radio', { name: new RegExp('^' + aventure) }).check();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
}
// Attend que le tour passe au joueur suivant (enchaînement automatique après le dé).
async function attendreJoueur(page, nom) {
  await page.locator('#tour-nom').filter({ hasText: new RegExp('^' + nom + '$') }).waitFor();
  await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
}

module.exports = { lancerPartie, rapide, attendreJoueur };
