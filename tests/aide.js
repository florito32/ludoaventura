// Outils partagés par les tests.
// Va de l'accueil au plateau : nombre de joueurs et aventure au choix.
// Les tests raccourcissent la pause entre deux joueurs (2,2 s en vrai) et repoussent le lancer
// automatique du dé (1,6 s en vrai) pour pouvoir lancer le dé (lancerLeDe) sans course.
// « Épeler à l'oral » (v6.28) : par défaut les tests jugent avec « Bonne / Mauvaise réponse » (window.AVENTURA_JUGE,
// le mode utilisé quand le micro ne marche pas) ; les tests de la voix passent { juge: false } (tests/epeler-oral.spec.js).
async function rapide(page, { autoDe = 600000, pause = 80, juge = true } = {}) {
  await page.addInitScript(([a, p, j]) => { window.AVENTURA_PAUSE = p; window.AVENTURA_DUREE_DE = 0; window.AVENTURA_AUTO_DE = a; window.AVENTURA_JUGE = j; }, [autoDe, pause, juge]);
  page.__rapide = true;
}

// Préparation en écrans successifs (v4.6) : 1 nombre de joueurs → 2 aventuriers → 3 cartes → 4 aventure.
// Le bouton « Valider » visible fait passer au joueur suivant, puis à l'écran suivant.
async function valider(page) {
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
}

// Écran 3 (v5.7, deux écrans depuis v5.8) : choisit la matière, valide, et arrive sur ses réglages.
async function matiere(page, valeur) {
  if (valeur === 'maths') await page.locator('#matieres input[value="maths"]').check();
  else {
    await page.locator('#matieres input[value="francais"]').check();
    await page.locator('#francais input[value="' + valeur + '"]').check();
  }
  await valider(page);
  await page.locator(valeur === 'maths' ? '#reglages-maths' : valeur === 'orthographe' ? '#ortho-packs' : '#conj-temps').waitFor();
}
// Français → Orthographe, puis coche tous les packs et toutes les questions du joueur affiché.
async function orthographe(page) { await matiere(page, 'orthographe'); }
// Depuis la v6.31, seule « Épeler à l'oral » (en mode juge, voir rapide()) se joue avec « Bonne / Mauvaise réponse » :
// par défaut les tests cochent ces deux-là (les questions écrites ont leurs propres tests, avec { types }).
// Depuis v6.16, l'orthographe a deux écrans : les packs (par défaut les 4 packs d'origine), « Valider », puis les questions.
const PACKS_ORIGINE = ['mots-simples', 'mots-compliques', 'temps', 'numerique'];
async function cocherJoueur(page, { packs = PACKS_ORIGINE, types = ['epeler'] } = {}) {
  await orthographe(page);
  for (const p of packs) await page.locator('#packs input[value="' + p + '"]').check();
  await valider(page);
  await page.locator('#reglages-ortho').waitFor();
  for (const t of types) await page.locator('#types-questions input[value="' + t + '"]').check();
}
// Écran 3 : Mathématiques avec les signes, nombres et niveau donnés.
// Depuis v5.9, le niveau se choisit sur l'écran de la matière ; au niveau Facile, les nombres sont des tables.
async function maths(page, { signes = ['plus'], nombres = [2, 3], dizaines = [], centaines = [], milliers = [], niveau = 'facile', nbSignes = null } = {}) {
  await page.locator('#matieres input[value="maths"]').check();
  await page.locator('#niveau-maths input[value="' + niveau + '"]').check();
  // v6.14 : nombres de signes par calcul (1 coché au départ).
  const max = { facile: 1, moyen: 2, difficile: 3, expert: 4 }[niveau];
  if (nbSignes) for (const n of [...nbSignes, 1, 2, 3, 4].filter((n, i, t) => n <= max && t.indexOf(n) === i)) {
    await page.locator('#nb-signes input[value="' + n + '"]').setChecked(nbSignes.includes(n));
  }
  await valider(page);
  await page.locator('#reglages-maths').waitFor();
  for (const s of signes) await page.locator('#signes input[value="' + s + '"]').check();
  for (const n of nombres) await page.locator('#nombres input[value="' + n + '"]').check();
  for (const n of dizaines) await page.locator('#dizaines input[value="' + n + '"]').check();
  for (const n of centaines) await page.locator('#centaines input[value="' + n + '"]').check();
  for (const n of milliers) await page.locator('#milliers input[value="' + n + '"]').check();
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
  await page.getByRole('button', { name: 'Question suivante' }).waitFor();
}

// Écran 3 : Français → Conjugaison avec les temps, groupes et niveau donnés.
async function conjugaison(page, { temps = ['indicatif.present'], groupes = [1], niveau = 'facile' } = {}) {
  // v6.0 : écran des modes et des temps, puis écran des groupes et du niveau.
  await matiere(page, 'conjugaison');
  for (const m of [...new Set(temps.map((t) => t.split('.')[0]))]) await page.locator('#modes-conj input[value="' + m + '"]').check();
  for (const t of temps) await page.locator('#temps-conj input[value="' + t + '"]').check();
  await valider(page);
  await page.locator('#reglages-conj').waitFor();
  for (const g of groupes) await page.locator('#groupes input[value="' + g + '"]').check();
  await page.locator('#niveau-conj input[value="' + niveau + '"]').check();
}

module.exports = { valider, cocherJoueur, orthographe, maths, conjugaison, matiere, versReglages, lancer, lancerLeDe, lancerPartie, rapide, attendreJoueur, cocherTout, ouvrirNeuf };
