// Phonèmes (v7.3, demande de l'utilisateur du 12/11/2026, backlog lignes 279 à 291).
// Français → Phonèmes (sans niveau) : écran des sons (catégories, puis les sons sur deux colonnes, comme les
// temps de la conjugaison), écran des jeux, puis 6 petits jeux joués en touchant la réponse dans la carte.
const { test, expect } = require('@playwright/test');
const P = require('../js/phonemes.js');
const { rapide, versReglages, valider, lancer } = require('./aide');

test.describe('moteur des phonèmes', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('36 sons de l\'OQLF + [ŋ] : 18 consonnes, 16 voyelles, 3 semi-voyelles', () => {
    expect(P.CATEGORIES.map((c) => [c.id, c.sons.length])).toEqual([['consonnes', 18], ['voyelles', 16], ['semi', 3]]);
    expect(P.TOUS_SONS[0]).toBe('p'); // ordre des catégories, pas celui des clés numériques
    expect(P.crochets('S')).toBe('[ʃ]');
  });

  test('chaque mot est bien découpé ; chaque son a un mot d\'exemple où ses lettres sont repérées', () => {
    for (const l of P.MOTS) expect(() => P.lireMot(l), l).not.toThrow();
    for (const id of P.TOUS_SONS) {
      const e = P.exemple(id);
      expect(e.son, id).not.toBe('');
      expect(e.avant + e.son + e.apres).toBe(P.SONS[id].mot);
    }
    // Mot qui commence par le son… sauf quand il n'y en a pas de simple.
    expect(P.exemple('p')).toMatchObject({ avant: '', son: 'p', debut: true });
    expect(P.exemple('J')).toMatchObject({ avant: 'a', son: 'gn', debut: false });
    expect(P.sonOral('J')).toBe('le son « gn » de « agneau »');
  });

  test('chaque jeu fabrique des cartes pour chaque son, et la bonne réponse est acceptée', () => {
    for (const j of P.JEUX) for (const id of P.TOUS_SONS) for (let k = 0; k < 25; k++) {
      const c = P.generer(j.id, [id]);
      expect(c, j.id + ' ' + id).not.toBeNull();
      const bonne = j.id === 'relier' || j.id === 'trier' ? c.bonnes : c.bonne;
      expect(P.juste(c, bonne)).toBe(true);
      expect(c.oral).not.toMatch(/\[|undefined/);
      if (j.id === 'completer' || j.id === 'son' || j.id === 'intrus') expect(new Set(c.choix).size).toBe(c.choix.length);
    }
  });

  test('Complète le mot : une seule écriture fait le mot (jamais un autre vrai mot)', () => {
    for (let k = 0; k < 400; k++) {
      const c = P.generer('completer', P.TOUS_SONS);
      expect(c.choix).toContain(c.bonne);
      for (const g of c.choix) if (g !== c.bonne) expect(P.VRAIS_MOTS).not.toContain(c.avant + g + c.apres);
    }
  });

  test('L\'intrus : 3 mots ont le son, un seul ne l\'a pas', () => {
    for (let k = 0; k < 300; k++) {
      const c = P.generer('intrus', P.TOUS_SONS);
      const avec = c.mots.filter((m) => P.mot(m).sons.includes(c.son));
      expect(avec.length).toBe(3);
      expect(avec).not.toContain(c.bonne);
    }
  });

  test('Où est le son ? : on l\'entend une seule fois, à la place donnée', () => {
    for (let k = 0; k < 300; k++) {
      const c = P.generer('position', P.TOUS_SONS);
      const m = P.mot(c.mot);
      expect(m.sons.filter((s) => s === c.son).length).toBe(1);
      expect(P.placeDe(m, c.son)).toBe(c.bonne);
    }
  });

  test('sons que les régions prononcent différemment ([o]/[ɔ], [e]/[ɛ]…) : jamais l\'un pour piéger l\'autre', () => {
    for (let k = 0; k < 300; k++) {
      const t = P.generer('trier', P.TOUS_SONS);
      expect(P.delicat(t.colonnes[0], t.colonnes[1])).toBe(false);
      const s = P.generer('son', P.TOUS_SONS);
      expect(s.choix.some((x) => x !== s.bonne && P.delicat(x, s.bonne))).toBe(false);
    }
  });

  test('Relier et Trier : chaque écriture ne va qu\'avec un son ; chaque mot n\'a qu\'un des deux sons', () => {
    for (let k = 0; k < 300; k++) {
      const r = P.generer('relier', ['j']); // semi-voyelles seules : complétées par d'autres sons
      expect(r.gauche.length).toBeGreaterThanOrEqual(4);
      r.droite.forEach((g) => expect(r.gauche.filter((s) => P.GRAPHIES[s].includes(g)).length).toBe(1));
      const t = P.generer('trier', P.TOUS_SONS);
      t.mots.forEach((m, i) => {
        const ss = P.mot(m).sons;
        expect(ss.includes(t.colonnes[t.bonnes[i]])).toBe(true);
        expect(ss.includes(t.colonnes[1 - t.bonnes[i]])).toBe(false);
      });
    }
  });
});

// ---------- Écrans de la préparation ----------
async function versPhonemes(page) {
  await rapide(page);
  await page.goto('./');
  await versReglages(page, 1);
  await page.locator('#matieres input[value="francais"]').check();
  await page.locator('#francais input[value="phonemes"]').check();
  await valider(page);
  await page.locator('#phon-sons').waitFor();
}
// Rien ne dépasse de l'écran ni de son cadre (téléphone, téléphone carré, tablette, ordinateur).
async function sansDebordement(page, cadre) {
  const d = await page.evaluate((sel) => {
    const b = document.querySelector(sel), r = b.getBoundingClientRect();
    const dehors = [...b.querySelectorAll('button, label.pack, .gram-bulle, .gram-mot-relier')].filter((x) => {
      const q = x.getBoundingClientRect();
      return q.width && (q.left < r.left - 1 || q.right > r.right + 1);
    }).map((x) => x.textContent);
    // Texte coupé dans un bouton de son (« [ɛ̃] insecte »).
    const coupes = [...b.querySelectorAll('.pack span')].filter((s) => s.offsetWidth && s.scrollWidth > s.clientWidth + 1).map((s) => s.textContent);
    return { dehors, coupes, page: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  }, cadre);
  expect(d.dehors).toEqual([]);
  expect(d.coupes).toEqual([]);
  expect(d.page).toBeLessThanOrEqual(0);
}

test('écran des sons : catégories, sons sur deux colonnes avec un mot d\'exemple, « Tout sélectionner » @smoke', async ({ page }) => {
  await versPhonemes(page);
  await expect(page.locator('#reglages-titre')).toContainText('Phonèmes, les sons');
  // Pas de niveau pour les phonèmes (choix de l'utilisateur).
  await expect(page.locator('#cats-phon input')).toHaveCount(3);
  await expect(page.locator('#sons-phon-vide')).toBeVisible();
  // Valider sans catégorie : message.
  await valider(page);
  await expect(page.locator('#packs-alerte')).toContainText('choisir au moins une catégorie');
  await page.locator('#cats-phon input[value="consonnes"]').check();
  const cadre = page.locator('.phon-cadre[data-cat="consonnes"]');
  await expect(cadre).toBeVisible();
  await expect(page.locator('.phon-cadre[data-cat="voyelles"]')).toBeHidden();
  await expect(cadre.locator('label.pack')).toHaveCount(18);
  await expect(cadre.locator('label.pack').first()).toContainText('[p]');
  await expect(cadre.locator('label.pack').first()).toContainText('pomme');
  await expect(cadre.locator('label.pack').first().locator('strong')).toHaveText('p');
  // Deux colonnes : les deux premiers sons sur la même ligne, le troisième en dessous.
  const [a, b, c] = await Promise.all([0, 1, 2].map((i) => cadre.locator('label.pack').nth(i).boundingBox()));
  expect(Math.abs(a.y - b.y)).toBeLessThan(2);
  expect(b.x).toBeGreaterThan(a.x);
  expect(c.y).toBeGreaterThan(a.y + 5);
  await valider(page);
  await expect(page.locator('#packs-alerte')).toContainText('choisir au moins un son');
  // « Tout sélectionner » : toutes les catégories et tous les sons, puis « Tout désélectionner ».
  await page.locator('#btn-tout-sons').click();
  await expect(page.locator('#cats-phon input:checked')).toHaveCount(3);
  await expect(page.locator('#sons-phon input:checked')).toHaveCount(37);
  await expect(page.locator('#btn-tout-sons')).toHaveAttribute('aria-label', /Tout désélectionner/);
  await sansDebordement(page, '#reglages-joueur');
  await page.locator('#btn-tout-sons').click();
  await expect(page.locator('#sons-phon input:checked')).toHaveCount(0);
  // « Tout » d'un cadre ; une catégorie choisie sans son → message qui la nomme.
  await page.locator('#cats-phon input[value="voyelles"]').check();
  await page.locator('#cats-phon input[value="semi"]').check();
  await page.locator('.phon-cadre[data-cat="voyelles"] .btn-tout-famille').click();
  await expect(page.locator('.phon-cadre[data-cat="voyelles"] input:checked')).toHaveCount(16);
  await valider(page);
  await expect(page.locator('#packs-alerte')).toContainText('au moins un son dans « Semi-voyelles »');
  // Retirer une catégorie retire ses sons.
  await page.locator('#cats-phon input[value="semi"]').uncheck();
  await page.locator('#cats-phon input[value="voyelles"]').uncheck();
  await page.locator('#cats-phon input[value="voyelles"]').check();
  await expect(page.locator('.phon-cadre[data-cat="voyelles"] input:checked')).toHaveCount(0);
  await page.locator('#sons-phon input[value="o"]').check();
  // Écran suivant : les 6 jeux, tous cochés au départ.
  await valider(page);
  await expect(page.locator('#reglages-titre')).toContainText('Phonèmes, les jeux');
  await expect(page.locator('#jeux-phon input:checked')).toHaveCount(6);
  await sansDebordement(page, '#reglages-joueur');
  await page.locator('#btn-tout-phon').click();
  await valider(page);
  await expect(page.locator('#packs-alerte')).toContainText('choisir au moins un jeu');
  await page.locator('#jeux-phon input[value="intrus"]').check();
  // Retour : on retrouve les sons choisis.
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page.locator('#sons-phon input:checked')).toHaveCount(1);
  await valider(page);
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
});

// ---------- Dans la partie ----------
async function partie(page, jeu, sons = P.TOUS_SONS) {
  await versPhonemes(page);
  for (const c of [...new Set(sons.map((s) => P.SONS[s].categorie))]) await page.locator('#cats-phon input[value="' + c + '"]').check();
  for (const s of sons) await page.locator('#sons-phon input[value="' + s + '"]').check();
  await valider(page);
  for (const box of await page.locator('#jeux-phon input').all()) await box.setChecked((await box.getAttribute('value')) === jeu);
  await lancer(page);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await page.locator('#carte-gram').waitFor();
  return page.evaluate(() => window.Aventura.partie.carte);
}
const de = (page) => page.evaluate(() => window.Aventura.partie.regles.de);

test('Complète le mot : le mot à trou, 3 écritures ; la bonne → dé FORT', async ({ page }) => {
  const c = await partie(page, 'completer');
  await expect(page.locator('#carte-titre')).toHaveText('Phonèmes · Complète le mot');
  await expect(page.locator('#carte-consigne')).toContainText(P.crochets(c.son));
  await expect(page.locator('.phon-trou')).toHaveCount(1);
  await expect(page.locator('.gram-bouton')).toHaveCount(3);
  await sansDebordement(page, '#carte-piochee');
  await page.locator('.gram-bouton[data-v="' + c.bonne + '"]').click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
  await expect(page.locator('.gram-trou.rempli')).toHaveText(c.bonne);
  expect(await de(page)).toBe('fort');
});

test('Quel son ? : les lettres du son en couleur, 3 sons au choix ; mauvais choix → correction, dé FAIBLE', async ({ page }) => {
  const c = await partie(page, 'son');
  await expect(page.locator('.phon-lettres')).toHaveText(c.morceaux[c.k]);
  await expect(page.locator('.gram-bouton')).toHaveCount(3);
  await expect(page.locator('.gram-bouton[data-v="' + c.bonne + '"]')).toContainText(P.crochets(c.bonne));
  await sansDebordement(page, '#carte-piochee');
  const faux = c.choix.find((x) => x !== c.bonne);
  await page.locator('.gram-bouton[data-v="' + faux + '"]').click();
  await expect(page.locator('#carte-reponse')).toContainText('tu as choisi « ' + P.crochets(faux) + ' »');
  await expect(page.locator('#carte-reponse')).toContainText(P.crochets(c.bonne));
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  expect(await de(page)).toBe('faible');
});

test('L\'intrus : 4 mots, toucher celui qui n\'a pas le son', async ({ page }) => {
  const c = await partie(page, 'intrus');
  await expect(page.locator('.gram-bouton')).toHaveCount(4);
  await sansDebordement(page, '#carte-piochee');
  await page.locator('.gram-bouton[data-v="' + c.bonne + '"]').click();
  await expect(page.locator('#carte-reponse')).toContainText('n’a pas le son');
  expect(await de(page)).toBe('fort');
});

test('Où est le son ? : au début, au milieu ou à la fin', async ({ page }) => {
  const c = await partie(page, 'position');
  await expect(page.locator('.gram-mot')).toHaveText(c.mot);
  await expect(page.locator('.gram-bouton')).toHaveText(['Au début', 'Au milieu', 'À la fin']);
  await page.locator('.gram-bouton[data-v="' + c.bonne + '"]').click();
  await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
});

test('Relier son ↔ écriture : liens de couleur, tout juste → dé FORT', async ({ page }) => {
  const c = await partie(page, 'relier');
  const n = c.gauche.length;
  await expect(page.locator('[data-cote="g"]').first()).toContainText(P.crochets(c.gauche[0]));
  await sansDebordement(page, '#carte-piochee');
  for (let g = 0; g < n; g++) {
    await page.locator('[data-cote="g"][data-i="' + g + '"]').click();
    await page.locator('[data-cote="d"][data-i="' + c.bonnes[g] + '"]').click();
  }
  await expect(page.locator('#carte-reponse')).toContainText('Toutes les paires sont justes');
  expect(await de(page)).toBe('fort');
});

test('Trier les mots : un mot puis sa colonne ; un mot rangé revient ; gardé au rechargement ; une erreur → dé FAIBLE', async ({ page }) => {
  const c = await partie(page, 'trier');
  await expect(page.locator('.phon-reste .gram-bulle')).toHaveCount(6);
  await expect(page.locator('.phon-col-tete')).toHaveCount(2);
  await expect(page.locator('.phon-col-tete').first()).toBeDisabled(); // aucun mot pris
  await sansDebordement(page, '#carte-piochee');
  // Premier mot rangé, puis remis en haut.
  await page.locator('.phon-reste [data-m="0"]').click();
  await expect(page.locator('.phon-reste [data-m="0"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.phon-col-tete[data-col="' + c.bonnes[0] + '"]').click();
  await expect(page.locator('.phon-reste .gram-bulle')).toHaveCount(5);
  await page.locator('.phon-col-mots [data-m="0"]').click();
  await expect(page.locator('.phon-reste .gram-bulle')).toHaveCount(6);
  await page.locator('.phon-col-tete[data-col="' + c.bonnes[0] + '"]').click(); // il était repris : on le range
  await page.reload();
  await expect(page.locator('.phon-reste .gram-bulle')).toHaveCount(5);
  // Les autres : le dernier dans la mauvaise colonne.
  for (let i = 1; i < 6; i++) {
    await page.locator('.phon-reste [data-m="' + i + '"]').click();
    await page.locator('.phon-col-tete[data-col="' + (i === 5 ? 1 - c.bonnes[i] : c.bonnes[i]) + '"]').click();
  }
  await expect(page.locator('#carte-reponse')).toContainText('5 mots bien rangés sur 6');
  await expect(page.locator('.phon-colonne .gram-bulle.fausse')).toHaveCount(1);
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  expect(await de(page)).toBe('faible');
});

test('la carte se lit à voix haute sans symboles phonétiques', async ({ page }) => {
  const c = await partie(page, 'intrus', ['J']);
  const texte = await page.evaluate(() => window.Voix.texteCarte(window.Aventura.partie.carte));
  expect(texte).toContain('le son « gn » de « agneau »');
  expect(texte).not.toMatch(/\[/);
  expect(c.son).toBe('J');
});
