// Outils partagés par les tests.
// Va de l'accueil au plateau : nombre de joueurs et aventure au choix.
// Les tests raccourcissent la pause entre deux joueurs (2,2 s en vrai) et repoussent le lancer
// automatique du dé (1,6 s en vrai) pour pouvoir lancer le dé (lancerLeDe) sans course.
async function rapide(page, { autoDe = 600000, pause = 80 } = {}) {
  await page.addInitScript(([a, p]) => { window.AVENTURA_PAUSE = p; window.AVENTURA_DUREE_DE = 0; window.AVENTURA_AUTO_DE = a; }, [autoDe, pause]);
  page.__rapide = true;
}

// Préparation en écrans successifs (v4.6) : 1 joueurs du compte → 2 cartes → 3 aventure.
// Le bouton « Valider » visible fait passer au joueur suivant, puis à l'écran suivant.
async function valider(page) {
  // v10.13 : à l'écran « matière », le dernier bandeau déroulant ouvert a son propre « Valider » (« Valider mes choix »).
  const bandeau = page.getByRole('button', { name: 'Valider mes choix' });
  if (await bandeau.isVisible()) await bandeau.click();
  else await page.getByRole('button', { name: 'Valider', exact: true }).click();
}

// v10.13 : à l'écran « matière », les choix sont dans des bandeaux déroulants (un seul ouvert à la fois, js/selecteur.js).
// ouvrirChoix ouvre celui du conteneur voulu (ex. '#niveau-maths') s'il n'est pas déjà ouvert ; cocher / choisir agissent ensuite.
const ONGLET_DE = { matieres: 'matiere', francais: 'type', 'type-maths': 'type', 'mode-savoir': 'type', 'niveau-prog': 'niveau', 'nb-signes': 'signes' };
// v10.36 (demande du 24/11/2026) : Facile / Moyen / Difficile / Expert sont remplacés par un niveau de 1 à 10 (#niveau-prog). Les tests qui
// parlent encore de « facile »… passent par cette table : facile = niveau 1, moyen = 4, difficile = 6, expert = 9 (js/plateau.js → NIVEAU_DE_PROG).
const NIVEAU_ANCIEN = { '#niveau-maths': 1, '#niveau-ortho': 1, '#niveau-conj': 1, '#niveau-gram': 1, '#niveau-savoir': 1 };
const PROG_DE = { facile: 1, moyen: 4, difficile: 6, expert: 9, Facile: 1, Moyen: 4, Difficile: 6, Expert: 9 };
async function ouvrirChoix(page, conteneur) {
  if (await page.locator(conteneur).isVisible()) return;
  await page.locator('.onglet[data-etape="' + ONGLET_DE[conteneur.slice(1)] + '"]').click();
  await page.locator(conteneur).waitFor();
}
async function cocher(page, conteneur, valeur, etat = true) {
  if (conteneur in NIVEAU_ANCIEN) { conteneur = '#niveau-prog'; valeur = PROG_DE[valeur] || valeur; }
  await ouvrirChoix(page, conteneur);
  await page.locator(conteneur + ' input[value="' + valeur + '"]').setChecked(etat);
}
async function choisir(page, conteneur, texte) {
  if (conteneur in NIVEAU_ANCIEN) { await cocher(page, conteneur, texte); return; }
  await ouvrirChoix(page, conteneur);
  await page.locator(conteneur + ' label', { hasText: texte }).click();
}
// Étape 1 (v10.36) : les 2 boutons à côté du joueur k (0 = le premier). « Personnaliser » ouvre l'étape 2 de ce joueur ;
// « Suivre ma progression » n'a que la matière à choisir.
async function personnaliser(page, k = 0) {
  await page.locator('.cj-parcours-btn[data-parcours="perso"][data-place="' + k + '"]').click();
  await page.locator('#reglages-titre').waitFor();
}
async function suivreMaProgression(page, k = 0, matiere = 'maths') {
  await page.locator('.cj-parcours-btn[data-parcours="suivre"][data-place="' + k + '"]').click();
  await page.locator('#suivre-matieres').waitFor();
  await page.locator('#suivre-matieres input[value="' + matiere + '"]').check();
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
}

// Écran 3 (v5.7, deux écrans depuis v5.8) : choisit la matière, valide, et arrive sur ses réglages.
async function matiere(page, valeur) {
  if (valeur === 'maths') await cocher(page, '#matieres', 'maths');
  else {
    await cocher(page, '#matieres', 'francais');
    await cocher(page, '#francais', valeur);
  }
  await valider(page);
  await page.locator(valeur === 'maths' ? '#reglages-maths' : valeur === 'orthographe' ? '#ortho-packs' : '#conj-temps').waitFor();
}
// Français → Orthographe, puis coche tous les packs et toutes les questions du joueur affiché.
async function orthographe(page) { await matiere(page, 'orthographe'); }
// v6.38 : « Épeler à l'oral » n'existe plus, toutes les questions s'écrivent. Par défaut les tests cochent
// « Nombre de lettres » et répondent avec repondre() (juste ou faux).
// Depuis v6.16, l'orthographe a deux écrans : les thèmes, « Valider », puis les questions.
const PACKS_ORIGINE = ['temps', 'numerique', 'animaux', 'corps'];
async function cocherJoueur(page, { packs = PACKS_ORIGINE, types = ['nombre'] } = {}) {
  await orthographe(page);
  for (const p of packs) await page.locator('#packs input[value="' + p + '"]').check();
  await valider(page);
  await page.locator('#reglages-ortho').waitFor();
  for (const t of types) await page.locator('#types-questions input[value="' + t + '"]').check();
}
// Répond à la carte d'orthographe affichée : la bonne réponse (juste = true) ou une fausse, puis « OK ».
// (Remplace les anciens boutons « Bonne réponse » / « Mauvaise réponse » d'« Épeler à l'oral ».)
async function repondre(page, juste = true) {
  await page.locator('#reponse-joueur').waitFor({ state: 'visible' });
  const texte = await page.evaluate((j) => {
    const c = window.Aventura.partie.carte, info = window.Cartes.INFOS[c.mot];
    let a = c.question.attendu(c.mot, info, c.params);
    if (typeof a === 'number') return String(j ? a : a + 7);
    if (Array.isArray(a)) a = a.join(' ');
    if (c.question.saisie === 'article') return j ? a : ({ le: 'la', la: 'le', un: 'une', une: 'un' })[a];
    return j ? a : 'ZZZ';
  }, juste);
  await page.locator('#reponse-joueur').fill(texte);
  await page.getByRole('button', { name: /^(OK|Valider)$/ }).click();
}

// Écran 3 : Mathématiques avec les signes, nombres et niveau donnés.
// Depuis v5.9, le niveau se choisit sur l'écran de la matière ; au niveau Facile, les nombres sont des tables.
async function maths(page, { signes = ['plus'], nombres = [2, 3], dizaines = [], centaines = [], milliers = [], niveau = 'facile', nbSignes = null } = {}) {
  await cocher(page, '#matieres', 'maths');
  await cocher(page, '#niveau-maths', niveau);
  // v6.14 : nombres de signes par calcul (1 coché au départ).
  const max = { facile: 1, moyen: 2, difficile: 3, expert: 4 }[niveau];
  if (nbSignes) for (const n of [...nbSignes, 1, 2, 3, 4].filter((n, i, t) => n <= max && t.indexOf(n) === i)) {
    await cocher(page, '#nb-signes', n, nbSignes.includes(n));
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
  // v10.36 : chaque joueur choisit « Personnaliser » à l'étape 1, règle ses cartes, « Valider » le ramène à l'étape 1 ; puis « Choisir l'aventure ».
  for (let k = 0; k < joueurs; k++) {
    if (k > 0) await personnaliser(page, k);
    await cocherJoueur(page); await valider(page);
  }
  await page.getByRole('button', { name: 'Choisir l\'aventure' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).waitFor();
}

// De l'accueil jusqu'aux réglages des cartes du joueur 1 (v10.29) : l'étape « Qui joue ? » choisit parmi les joueurs du compte.
// Les tests créent d'abord les joueurs manquants dans le compte (Joueur 1 existe toujours), puis les ajoutent un à un.
async function creerJoueurs(page, joueurs) {
  // Les joueurs de test portent le nom et le personnage des aventuriers dans l'ordre (Léa, Tom, Nour, Malo) : les anciens
  // tests, qui cherchaient ces noms, restent valables.
  await page.evaluate((n) => {
    const J = window.Joueurs, c = window.Recompenses.compte, A = window.Aventuriers.LISTE;
    const l = J.duCompte();
    if (l.length === 1 && l[0].nom === 'Joueur 1') J.renommer(c.etat, l[0].id, A[0].nom);
    for (let k = J.duCompte().length; k < n; k++) J.creer(c.etat, A[k].nom, A[k].id);
    localStorage.setItem(window.Etoiles.CLE, JSON.stringify(c.etat));
  }, joueurs);
}
// Fenêtre « Qui joue ? » (v10.29), demandée au lancement d'un défi, d'une partie rapide ou de Baby jeux : remplit les places
// vides avec les premiers joueurs libres du compte, puis « C'est parti ». Les joueurs doivent exister (creerJoueurs) avant.
async function quiJoue(page) {
  const fenetre = page.getByRole('dialog', { name: 'Qui joue ?' });
  await fenetre.waitFor();
  while (await fenetre.locator('.cj-ligne.vide [data-ouvrir]').count()) {
    await fenetre.locator('.cj-ligne.vide [data-ouvrir]').first().click();
    await fenetre.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  }
  await fenetre.getByRole('button', { name: 'C’est parti' }).click();
}
async function lancerRapideQui(page) {
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await quiJoue(page);
}
async function versReglages(page, joueurs) {
  await creerJoueurs(page, joueurs);
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  for (let k = 1; k < joueurs; k++) {
    await page.locator('[data-ajouter]').click();
    await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  }
  await personnaliser(page, 0); // v10.36 : le premier joueur choisit « Personnaliser » (étape 1)
}

// Termine la préparation (valide les écrans restants, puis « Choisir l'aventure ») et lance la partie.
async function lancer(page) {
  const go = page.getByRole('button', { name: 'Lancer la partie' });
  const aventure = page.getByRole('button', { name: 'Choisir l\'aventure' });
  for (let i = 0; i < 12 && !(await go.isVisible()); i++) {
    if (await aventure.isVisible()) await aventure.click(); else await valider(page);
  }
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
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).waitFor();
}

// Écran 3 : Français → Conjugaison avec les temps, groupes et niveau donnés.
// v6.49 : le niveau se choisit sur l'écran de la matière ; modes, groupes et temps sur un seul écran ensuite.
async function conjugaison(page, { temps = ['indicatif.present'], groupes = [1], niveau = 'facile' } = {}) {
  await cocher(page, '#matieres', 'francais');
  await cocher(page, '#francais', 'conjugaison');
  await cocher(page, '#niveau-conj', niveau);
  await valider(page);
  await page.locator('#conj-temps').waitFor();
  for (const m of [...new Set(temps.map((t) => t.split('.')[0]))]) await page.locator('#modes-conj input[value="' + m + '"]').check();
  for (const g of groupes) await page.locator('#groupes input[value="' + g + '"]').check();
  for (const t of temps) await page.locator('#temps-conj input[value="' + t + '"]').check();
}

// Écran 3 : Français → Grammaire (v6.54) au niveau donné ; jeux = liste des jeux gardés (tous cochés au départ).
async function grammaire(page, { jeux = null, niveau = 'facile' } = {}) {
  await cocher(page, '#matieres', 'francais');
  await cocher(page, '#francais', 'grammaire');
  await cocher(page, '#niveau-gram', niveau);
  await valider(page);
  await page.locator('#reglages-gram').waitFor();
  if (jeux) {
    for (const box of await page.locator('#jeux-gram input').all()) await box.setChecked(jeux.includes(await box.getAttribute('value')));
  }
}

// v10.30 (backlog lignes 447, 453) : les étoiles, pierres et coffres sont dans la carte de chaque joueur (Mon compte).
// Depuis l'accueil : « Mon compte » puis, sur la carte du joueur (le 1er, ou celui qui porte ce nom), le bouton coffre « Mes coffres » (v10.36).
function carteJoueur(page, nom) {
  return nom ? page.locator('.joueur-carte', { has: page.locator('.joueur-nom', { hasText: nom }) }) : page.locator('.joueur-carte').first();
}
async function mesEtoiles(page, nom) {
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click(); // v10.32 : « Profil et joueurs » ; « Mes coffres » est dans « Statistiques »
  await carteJoueur(page, nom).getByRole('button', { name: 'Statistiques' }).click();
  await carteJoueur(page, nom).getByRole('button', { name: 'Mes coffres' }).click();
  await page.getByRole('heading', { name: 'Mes coffres' }).waitFor();
}
// Depuis l'accueil : « Mon compte » puis le bouton des coffres à ouvrir de la carte du joueur.
async function coffresJoueur(page, nom) {
  await page.locator('#btn-compte').click();
  await page.locator('#onglet-profil').click();
  await carteJoueur(page, nom).locator('[data-act="coffres"]').click();
}
module.exports = { personnaliser, suivreMaProgression, carteJoueur, mesEtoiles, coffresJoueur, quiJoue, lancerRapideQui, creerJoueurs, ouvrirChoix, cocher, choisir, grammaire, repondre, valider, cocherJoueur, orthographe, maths, conjugaison, matiere, versReglages, lancer, lancerLeDe, lancerPartie, rapide, attendreJoueur, cocherTout, ouvrirNeuf };
