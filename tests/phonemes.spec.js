// Phonèmes (v7.3), devenus un mini-jeu « Les sons » en v10.43 (demande du 24/11/2026) : plus de matière dans l'aventure,
// plus de sous-matière dans le profil. Le moteur (6 jeux) est testé ici ; l'écran du mini-jeu juste après.
const { test, expect } = require('@playwright/test');
const P = require('../js/phonemes.js');
const { rapide, creerJoueurs, quiJoue } = require('./aide');

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

// ---------- Le mini-jeu « Les sons » ----------
async function accueil(page) {
  await rapide(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await creerJoueurs(page, 1);
}
const compte = (page) => page.evaluate(() => { const e = JSON.parse(localStorage.getItem('ludoaventura-etoiles')); return { total: e.total, niv: e.joueurs.map((j) => j.niv || null) }; });
// Lance « Les sons » avec un seul jeu possible (les autres sont retirés de la liste pour la partie).
async function lancerSons(page, jeu) {
  await page.locator('#btn-minijeux').click();
  await page.evaluate((id) => { const L = window.Phonemes.JEUX; const g = L.filter((x) => x.id === id); L.length = 0; g.forEach((x) => L.push(x)); }, jeu);
  await page.locator('.minijeu-carte[data-jeu="sons"]').click();
  await quiJoue(page);
  await expect(page.locator('#ecran-minijeu')).toBeVisible();
  await expect(page.locator('#titre-minijeu')).toHaveText('Les sons');
  return page.evaluate(() => window.Minijeux.carte());
}
// Rien ne dépasse de l'écran (téléphone, téléphone carré, tablette, ordinateur).
async function sansDebordement(page) {
  const d = await page.evaluate(() => {
    const b = document.getElementById('minijeu-corps'), r = b.getBoundingClientRect();
    const dehors = [...b.querySelectorAll('button, .gram-bulle, .gram-mot-relier')].filter((x) => { const q = x.getBoundingClientRect(); return q.width && (q.left < r.left - 1 || q.right > r.right + 1); }).map((x) => x.textContent);
    return { dehors, page: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  expect(d.dehors).toEqual([]);
  expect(d.page).toBeLessThanOrEqual(0);
}
// Après la réponse : la carte corrigée reste affichée, +10 étoiles, aucun niveau touché.
async function fin(page, avant) {
  await expect(page.locator('.minijeu-fin')).toContainText('+10 étoiles');
  await expect(page.locator('.minijeu-fin')).toContainText(/Bravo|Dommage/);
  const apres = await compte(page);
  expect(apres.total - avant.total).toBe(10);
  expect(apres.niv).toEqual(avant.niv);
  await sansDebordement(page);
}

test('Mini-jeux : « Les sons » est dans la liste (tuile : le nom seulement, v10.54) @smoke', async ({ page }) => {
  await accueil(page);
  await page.locator('#btn-minijeux').click();
  const carte = page.locator('.minijeu-carte[data-jeu="sons"]');
  await expect(carte).toContainText('Les sons');
  await expect(carte).not.toContainText('+10');
  await sansDebordement(page);
});

test('Complète le mot : 3 écritures ; la bonne réponse ou non, 10 étoiles', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  const c = await lancerSons(page, 'completer');
  await expect(page.locator('.phon-trou')).toHaveCount(1);
  await expect(page.locator('.gram-bouton')).toHaveCount(3);
  await sansDebordement(page);
  await page.locator('.gram-bouton[data-v="' + c.bonne + '"]').click();
  await expect(page.locator('.gram-trou.rempli')).toHaveText(c.bonne);
  await expect(page.locator('.minijeu-fin')).toContainText('Bravo');
  await fin(page, avant);
});

test('Quel son ? : une mauvaise réponse montre la correction, 10 étoiles quand même', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  const c = await lancerSons(page, 'son');
  await expect(page.locator('.phon-lettres')).toHaveText(c.morceaux[c.k]);
  const faux = c.choix.find((x) => x !== c.bonne);
  await page.locator('.gram-bouton[data-v="' + faux + '"]').click();
  await expect(page.locator('.minijeu-fin')).toContainText('Dommage');
  await expect(page.locator('.minijeu-fin')).toContainText(P.crochets(c.bonne));
  await fin(page, avant);
});

test('L’intrus et Où est le son ? : on touche la réponse', async ({ page }) => {
  for (const jeu of ['intrus', 'position']) {
    await accueil(page);
    const avant = await compte(page);
    const c = await lancerSons(page, jeu);
    await page.locator('.gram-bouton[data-v="' + c.bonne + '"]').click();
    await fin(page, avant);
  }
});

test('Relier son ↔ écriture : tout juste → Bravo, 10 étoiles', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  const c = await lancerSons(page, 'relier');
  await sansDebordement(page);
  for (let g = 0; g < c.gauche.length; g++) {
    await page.locator('[data-cote="g"][data-i="' + g + '"]').click();
    await page.locator('[data-cote="d"][data-i="' + c.bonnes[g] + '"]').click();
  }
  await expect(page.locator('.minijeu-fin')).toContainText('Bravo');
  await fin(page, avant);
});

test('Trier les mots : un mot puis sa colonne ; une erreur → Dommage, 10 étoiles ; Rejouer redonne une carte', async ({ page }) => {
  await accueil(page);
  const avant = await compte(page);
  const c = await lancerSons(page, 'trier');
  await expect(page.locator('.phon-reste .gram-bulle')).toHaveCount(6);
  await sansDebordement(page);
  for (let i = 0; i < 6; i++) {
    await page.locator('.phon-reste [data-m="' + i + '"]').click();
    await page.locator('.phon-col-tete[data-col="' + (i === 5 ? 1 - c.bonnes[i] : c.bonnes[i]) + '"]').click();
  }
  await expect(page.locator('.minijeu-fin')).toContainText('Dommage');
  await expect(page.locator('.phon-colonne .gram-bulle.fausse')).toHaveCount(1);
  await fin(page, avant);
  await page.locator('#minijeu-rejouer').click();
  await expect(page.locator('.phon-reste .gram-bulle')).toHaveCount(6);
  await expect(page.locator('.minijeu-fin')).toHaveCount(0);
});

test('« Les sons » ne laisse rien derrière : la matière et le profil n’ont plus de Phonèmes, la partie fonctionne ensuite', async ({ page }) => {
  await accueil(page);
  await lancerSons(page, 'intrus');
  await page.locator('#minijeu-retour').click();
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Commencer l\'aventure' })).toBeVisible();
  const sous = await page.evaluate(() => window.Joueurs.matiere('francais').subs.map((x) => x.id));
  expect(sous).toEqual(['orthographe', 'conjugaison', 'grammaire']);
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await expect(page.locator('input[name="francais"][value="phonemes"]')).toHaveCount(0);
});
