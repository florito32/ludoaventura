// Outils partagés par les tests.
// Va de l'accueil au plateau : nombre de joueurs et aventure au choix.
async function lancerPartie(page, { joueurs = 2, aventure = 'Viking' } = {}) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.getByRole('radio', { name: String(joueurs), exact: true }).check();
  await page.getByRole('radio', { name: new RegExp('^' + aventure) }).check();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
}
module.exports = { lancerPartie };
