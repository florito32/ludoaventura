// v10.36 (demande du 24/11/2026, backlog lignes 475 à 479) : à l'étape 1 de la préparation, chaque joueur a 2 boutons,
// « Suivre ma progression » (seulement la matière) et « Personnaliser » (matière, niveau 1 à 10, réglages) ; le bouton
// « Choisir l'aventure » n'apparaît en bas que lorsque tous les joueurs ont fini de se préparer.
const { test, expect } = require('@playwright/test');
const { rapide, ouvrirNeuf, creerJoueurs, personnaliser, suivreMaProgression, valider, cocher } = require('./aide');

const ETAT = {
  v: 1, total: 0,
  joueurs: [
    { id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: { 'maths.calcul': 55, 'maths.probleme': 55 } },
    { id: 'j-2', nom: 'Hugo', perso: 'tom', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: {} }
  ]
};
async function ouvrir(page, etat = ETAT) {
  await rapide(page);
  await page.addInitScript((e) => {
    try { localStorage.setItem('ludo-vu', '1'); if (!localStorage.getItem('ludoaventura-etoiles')) localStorage.setItem('ludoaventura-etoiles', JSON.stringify(e)); } catch (x) { /* */ }
  }, etat);
  await ouvrirNeuf(page);
}
// Accueil → étape 1 avec n joueurs choisis.
async function etape1(page, n = 1) {
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  for (let k = 1; k < n; k++) {
    await page.locator('[data-ajouter]').click();
    await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  }
}
const aventure = (page) => page.getByRole('button', { name: 'Choisir l\'aventure' });

test('étape 1 : 2 boutons à côté de chaque joueur ; « Choisir l\'aventure » reste caché tant qu\'un joueur n\'est pas prêt', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 2);
  for (const k of [0, 1]) {
    const ligne = page.locator('.cj-ligne').nth(k);
    await expect(ligne.getByRole('button', { name: /^Suivre ma progression/ })).toBeVisible();
    await expect(ligne.getByRole('button', { name: /^Personnaliser/ })).toBeVisible();
  }
  await expect(aventure(page)).toBeHidden();
  await expect(page.locator('#prepa-aide')).toContainText('Léa');
  // Léa : « Personnaliser » → étape 2 ; « Valider » après ses réglages la ramène à l'étape 1 ; Hugo n'est pas prêt : toujours pas de bouton.
  await personnaliser(page, 0);
  await expect(page.locator('#prepa-progres')).toContainText('Étape 2 sur 3');
  await page.locator('#matieres input[value="maths"]').setChecked(true);
  await valider(page); // écran des réglages de calcul
  await page.getByRole('checkbox', { name: 'Additionner' }).click({ force: true });
  await page.locator('#nombres label', { hasText: /^\s*4\s*$/ }).click();
  await valider(page);
  await expect(page.locator('#prepa-progres')).toContainText('Étape 1 sur 3');
  await expect(page.locator('.cj-ligne').nth(0).locator('.cj-resume')).toContainText('Maths');
  await expect(page.locator('.cj-ligne').nth(0).locator('.cj-resume')).toContainText('personnalisé');
  await expect(aventure(page)).toBeHidden();
  // Hugo : « Suivre ma progression » → matière seule ; « Choisir l'aventure » apparaît.
  await suivreMaProgression(page, 1, 'francais');
  await expect(page.locator('.cj-ligne').nth(1).locator('.cj-resume')).toContainText('suit sa progression');
  await expect(aventure(page)).toBeVisible();
  await aventure(page).click();
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
  // « Retour » de l'aventure ramène à l'étape 1, les joueurs restent prêts.
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(aventure(page)).toBeVisible();
});

test('« Suivre ma progression » : seulement la matière à choisir, avec le niveau déjà atteint dans chacune', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 1);
  await page.locator('.cj-parcours-btn[data-parcours="suivre"]').click();
  await expect(page.locator('#choix-suivre')).toBeVisible();
  await expect(page.locator('#choix-matiere')).toBeHidden();
  await expect(page.locator('#suivre-matieres input')).toHaveCount(6); // v10.42 : + Lettres et Chiffres (sans niveau)
  await expect(page.locator('#suivre-matieres label').first()).toContainText('Maths');
  // v10.45 : aucun niveau sur les boutons de matière (Léa a pourtant 55 sur 100 en maths).
  await expect(page.locator('#suivre-matieres label').first()).not.toContainText('niveau');
  await expect(page.locator('#suivre-matieres small')).toHaveCount(0);
  // Sans matière, « Valider » refuse et le dit.
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('#packs-alerte')).toContainText('doit choisir une matière');
  await expect(aventure(page)).toBeHidden();
  await page.locator('#suivre-matieres input[value="maths"]').check();
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(aventure(page)).toBeVisible();
  const p = await page.evaluate(() => window.Aventura.partie);
  expect(p.parcours[0]).toBe('suivre');
  expect(p.suivi[0]).toBe('maths');
  expect(p.pret[0]).toBe(true);
});

test('« Personnaliser » : niveau de 1 à 10 (dizaine de la progression), celui du profil proposé d\'abord', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 1);
  await personnaliser(page, 0);
  await expect(page.locator('#reglage-niveau-prog')).toHaveAttribute('hidden', ''); // pas de niveau avant la matière
  await cocher(page, '#matieres', 'maths');
  await expect(page.locator('#reglage-niveau-prog')).not.toHaveAttribute('hidden', ''); // le niveau a son onglet (bandeau ouvert au toucher)
  await expect(page.locator('#niveau-prog input')).toHaveCount(10);
  await expect(page.locator('#niveau-prog input[value="6"]')).toBeChecked(); // 55 sur 100 → niveau 6
  await expect(page.locator('#niveau-prog-aide')).toContainText('niveau 2, c’est les niveaux 11 à 20');
  await expect(page.locator('#niveau-prog input').nth(1)).toHaveAttribute('aria-label', /Niveau 2 : questions de la progression 11 à 20/);
  // Les 4 niveaux Facile…Expert ne sont plus proposés.
  await expect(page.locator('#reglage-niveau-maths')).toHaveAttribute('hidden', '');
  // Niveau 2 → Facile ; 5 → Moyen ; 8 → Difficile ; 10 → Expert (traduction provisoire pour les générateurs).
  for (const [n, id] of [[2, 'facile'], [5, 'moyen'], [8, 'difficile'], [10, 'expert']]) {
    await cocher(page, '#niveau-prog', n);
    expect(await page.evaluate(() => window.Aventura.partie.niveauProg[0])).toBe(n);
    expect(await page.evaluate(() => window.Aventura.partie.maths[0].niveau)).toBe(id);
  }
  // Changer de matière : le niveau repart de celui du profil dans cette matière (Léa : 0 sur 100 en orthographe → niveau 1).
  await cocher(page, '#matieres', 'francais');
  await cocher(page, '#francais', 'orthographe');
  await expect(page.locator('#niveau-prog input[value="1"]')).toBeChecked();
});

test('« Suivre ma progression » : les calculs sont dans une fenêtre de 5 niveaux autour du niveau du profil (v10.39)', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 1);
  await suivreMaProgression(page, 0, 'maths'); // Léa : 55 en calcul et en problèmes → calculs de niveau 53 à 57
  await aventure(page).click();
  await page.getByRole('radio', { name: /^Viking/ }).check();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  const cartes = await page.evaluate(() => {
    const p = window.Aventura.partie, j = p.joueurs[0], r = [];
    for (let i = 0; i < 40; i++) { const c = window.Aventura.piocherCarte(j); r.push({ type: c.type, nom: c.packNom, prog: window.ProgressionCalcul.niveau(c) }); }
    return { cartes: r, sous: j.sous };
  });
  for (const c of cartes.cartes) {
    expect(c.nom).toMatch(/^(Calcul|Problème) · niveau \d+/);
    expect(c.prog).toBeGreaterThanOrEqual(53);
    expect(c.prog).toBeLessThanOrEqual(57);
  }
  expect(Object.keys(cartes.sous).sort()).toEqual(['maths.calcul', 'maths.probleme']); // les deux sous-matières des maths sont tirées
  expect(cartes.cartes.some((c) => c.nom.startsWith('Calcul'))).toBe(true);
  expect(cartes.cartes.some((c) => c.nom.startsWith('Problème'))).toBe(true);
});

test('« Suivre ma progression » : un joueur à 26 en calcul reçoit des calculs de niveau 24 à 28 (exemple de l\'utilisateur)', async ({ page }) => {
  await ouvrir(page, { v: 1, total: 0, joueurs: [{ id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z',
    niv: { 'maths.calcul': 26, 'maths.probleme': 26 } }] });
  await etape1(page, 1);
  await suivreMaProgression(page, 0, 'maths');
  await aventure(page).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  const niveaux = await page.evaluate(() => {
    const j = window.Aventura.partie.joueurs[0], r = [];
    for (let i = 0; i < 60; i++) r.push(window.ProgressionCalcul.niveau(window.Aventura.piocherCarte(j)));
    return r;
  });
  expect(Math.min(...niveaux)).toBeGreaterThanOrEqual(24);
  expect(Math.max(...niveaux)).toBeLessThanOrEqual(28);
  expect(new Set(niveaux).size).toBeGreaterThan(1); // la fenêtre est bien utilisée, pas un seul niveau
});

test('« Suivre ma progression » en Français : chaque sous-matière tire dans une fenêtre de 5 niveaux autour de son niveau (v10.41)', async ({ page }) => {
  await ouvrir(page, { v: 1, total: 0, joueurs: [{ id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z',
    niv: { 'francais.orthographe': 5, 'francais.conjugaison': 26, 'francais.grammaire': 35 } }] });
  await etape1(page, 1);
  await suivreMaProgression(page, 0, 'francais');
  await aventure(page).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  const r = await page.evaluate(() => {
    const j = window.Aventura.partie.joueurs[0], noms = {};
    const ratees = [];
    for (let i = 0; i < 300; i++) {
      const c = window.Aventura.piocherCarte(j), m = /^(\S+) · niveau (\d+)/.exec(c.packNom || '');
      if (m) (noms[m[1]] = noms[m[1]] || []).push(Number(m[2])); else ratees.push(c.packNom);
      // La carte est jouable : orthographe = une réponse attendue ; conjugaison = une bonne forme ; grammaire = une consigne.
      try {
        if (c.question) { const a = c.question.attendu(c.mot, window.Cartes.INFOS[c.mot], c.params); if (a === undefined || a === '') ratees.push('attendu vide ' + c.mot); }
        else if (c.type === 'conjugaison') { if (!c.bonne) ratees.push('conjugaison sans réponse'); }
        else if (!c.consigne) ratees.push('sans consigne ' + c.packNom);
      } catch (e) { ratees.push('erreur ' + e.message); }
    }
    return { sous: j.sous, noms, ratees };
  });
  expect(r.ratees).toEqual([]); // toutes les cartes viennent de la progression et se jouent
  expect(Object.keys(r.sous).sort()).toEqual(['francais.conjugaison', 'francais.grammaire', 'francais.orthographe']);
  const bornes = { Orthographe: [3, 7], Conjugaison: [24, 28], Grammaire: [33, 37] };
  for (const [nom, [bas, haut]] of Object.entries(bornes)) {
    expect(r.noms[nom], nom).toBeDefined();
    for (const n of r.noms[nom]) { expect(n, nom).toBeGreaterThanOrEqual(bas); expect(n, nom).toBeLessThanOrEqual(haut); }
  }
});

// v10.42 : Histoire et Géographie : chaque question posée a un niveau de progression dans la fenêtre de 5 niveaux du profil.
for (const matiere of ['histoire', 'geographie']) {
  test('« Suivre ma progression » en ' + (matiere === 'histoire' ? 'Histoire' : 'Géographie') + ' : les cartes tirent dans une fenêtre de 5 niveaux autour du niveau du profil (v10.42)', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    // Léa a 40 sur 100 dans chaque sous-matière de la matière jouée → fenêtre 38 à 42.
    const niv = {};
    const subs = { histoire: ['pre', 'ant', 'mag', 'ren', 'mod', 'xix', 'xx'], geographie: ['cartes', 'france', 'monde', 'nature'] };
    subs[matiere].forEach((x) => { niv[matiere + '.' + x] = 40; });
    await ouvrir(page, { v: 1, total: 0, joueurs: [{ id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv }] });
    await etape1(page, 1);
    await suivreMaProgression(page, 0, matiere);
    await aventure(page).click();
    await page.getByRole('button', { name: 'Lancer la partie' }).click();
    await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
    const r = await page.evaluate(() => {
      const j = window.Aventura.partie.joueurs[0], fen = [], nulles = [];
      for (let i = 0; i < 60; i++) {
        const c = window.Aventura.piocherCarte(j);
        if (!c || c.type !== 'savoir') { nulles.push(c && c.type); continue; }
        fen.push(c.fenetre ? c.fenetre.haut - c.fenetre.bas : -1);
      }
      return { fen, nulles, sous: Object.keys(j.sous) };
    });
    expect(r.nulles).toEqual([]); // chaque tirage donne une carte de savoir jouable
    expect(r.fen.length).toBe(60);
    // La fenêtre normale (38 à 42, écart 4) est utilisée presque toujours ; elle ne s'élargit que si la série est trop courte.
    expect(r.fen.filter((e) => e === 4).length).toBeGreaterThan(40);
    expect(r.sous.every((x) => x.startsWith(matiere + '.'))).toBe(true);
    expect(erreurs).toEqual([]);
  });
}

test('fin de partie : le point de niveau va à la sous-matière la plus jouée par un joueur qui suit sa progression', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 1);
  await suivreMaProgression(page, 0, 'maths');
  await aventure(page).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  // Partie fabriquée : 5 cartes de problèmes, 2 de calcul, objectif atteint par Léa ; la partie est finie.
  await page.evaluate(() => {
    const p = window.Aventura.partie, r = p.regles;
    p.joueurs[0].sous = { 'maths.probleme': 5, 'maths.calcul': 2 };
    r.historique = [{ manche: 1, joueur: 0, de: 'fort', points: r.objectif }];
    r.points = r.objectif; r.etape = 'fin';
  });
  await page.reload();
  await expect(page.locator('#fin')).toBeVisible();
  const niv = await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')).joueurs.find((x) => x.id === 'j-1').niv);
  expect(niv['maths.probleme']).toBe(56);
  expect(niv['maths.calcul']).toBe(55);
});

test('la préparation faite est gardée après un rechargement (parcours, matière, joueur prêt)', async ({ page }) => {
  await ouvrir(page);
  await etape1(page, 2);
  await suivreMaProgression(page, 0, 'histoire');
  await page.reload();
  await expect(page.locator('.cj-ligne').nth(0).locator('.cj-resume')).toContainText('Histoire');
  await expect(page.locator('.cj-ligne').nth(1).locator('.cj-resume')).toContainText('À préparer');
  await expect(aventure(page)).toBeHidden();
  // Un joueur retiré puis remis : sa place repart de zéro, c'est à lui de se préparer de nouveau.
  await suivreMaProgression(page, 1, 'maths');
  await expect(aventure(page)).toBeVisible();
  await page.locator('[data-retirer="1"]').click();
  await expect(page.locator('.cj-ligne')).toHaveCount(1);
  await page.locator('[data-ajouter]').click();
  await page.locator('.cj-profil[data-choisir]:not([disabled])').first().click();
  await expect(page.locator('.cj-ligne').nth(1).locator('.cj-resume')).toContainText('À préparer');
  await expect(page.locator('.cj-ligne').nth(0).locator('.cj-resume')).toContainText('Histoire'); // le premier est resté prêt
  await expect(aventure(page)).toBeHidden();
});

test('étape 1 : rien ne déborde avec 4 joueurs (téléphone, carré, tablette, ordinateur)', async ({ page }) => {
  const quatre = { v: 1, total: 0, joueurs: ['Léa', 'Hugo', 'Nour', 'Malo Le Grand Aventurier'].map((nom, i) => ({ id: 'j-' + (i + 1), nom, perso: ['lea', 'tom', 'nour', 'malo'][i], cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z', niv: {} })) };
  await ouvrir(page, quatre);
  await etape1(page, 4);
  await suivreMaProgression(page, 0, 'maths');
  await personnaliser(page, 1);
  await page.getByRole('button', { name: /Retour/ }).click();
  const mesures = await page.evaluate(() => {
    const doc = document.documentElement, zone = document.getElementById('choix-joueurs');
    const larges = [...zone.querySelectorAll('.cj-ligne, .cj-parcours, .cj-parcours-btn')].filter((e) => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > doc.clientWidth + 1);
    return { debordeLargeur: doc.scrollWidth > doc.clientWidth + 1, larges: larges.map((e) => e.className) };
  });
  expect(mesures.debordeLargeur).toBe(false);
  expect(mesures.larges).toEqual([]);
  // Les 4 boutons « Personnaliser » restent atteignables (zone de l'étape défilante si l'écran est bas).
  for (let k = 0; k < 4; k++) {
    const b = page.locator('.cj-parcours-btn[data-parcours="perso"][data-place="' + k + '"]');
    await b.scrollIntoViewIfNeeded();
    await expect(b).toBeVisible();
    const t = await b.boundingBox();
    expect(t.height).toBeGreaterThanOrEqual(24); // cible tactile (WCAG 2.5.8)
  }
});

// v10.41 : chaque sous-matière du Français fabrique une carte qui s'affiche sur le plateau, sans erreur ni débordement.
for (const [k, nom] of [[0, 'Orthographe'], [1, 'Conjugaison'], [2, 'Grammaire']]) {
  test('« Suivre ma progression » en Français : une carte de ' + nom + ' au niveau du profil s\'affiche sur le plateau', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrir(page, { v: 1, total: 0, joueurs: [{ id: 'j-1', nom: 'Léa', perso: 'lea', cree: '2026-11-01T00:00:00Z', maj: '2026-11-01T00:00:00Z',
      niv: { 'francais.orthographe': 40, 'francais.conjugaison': 40, 'francais.grammaire': 40 } }] });
    await etape1(page, 1);
    await suivreMaProgression(page, 0, 'francais');
    await aventure(page).click();
    await page.getByRole('button', { name: 'Lancer la partie' }).click();
    await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
    // La première décision aléatoire de la carte est le choix de la sous-matière : on la fixe pour ce test, puis on rend le hasard.
    await page.evaluate((idx) => { const o = Math.random; Math.random = () => { Math.random = o; return (idx + 0.1) / 3; }; }, k);
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    await expect(page.locator('#carte-piochee')).toBeVisible();
    const c = await page.evaluate(() => window.Aventura.partie.carte.packNom);
    expect(c).toMatch(new RegExp('^' + nom + ' · niveau (3[89]|4[0-2])'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    expect(erreurs).toEqual([]);
  });
}
