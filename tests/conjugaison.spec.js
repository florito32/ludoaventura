// Français → Conjugaison (v5.8) : temps rangés par mode, groupes de verbes, niveau (verbes plus rares) ;
// à la pioche, pronom + verbe + temps ; réponse écrite corrigée par le jeu ;
// réponse fausse : « ? » montre tout le temps, « C'est bon » lance le dé.
const { test, expect } = require('@playwright/test');
const V = require('../js/conjugaison.js');
const { rapide, versReglages, valider, conjugaison, lancer, lancerLeDe, ouvrirNeuf } = require('./aide');

test.describe('logique de la conjugaison', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('formes de référence, tous groupes et tous modes', () => {
    const cas = [
      ['chanter', 'ind-present', 'je', 'chante'], ['manger', 'ind-imparfait', 'je', 'mangeais'], ['manger', 'ind-imparfait', 'nous', 'mangions'],
      ['commencer', 'ind-passe-simple', 'nous', 'commençâmes'], ['commencer', 'ind-passe-simple', 'ils', 'commencèrent'],
      ['appeler', 'ind-present', 'il', 'appelle'], ['appeler', 'ind-futur', 'tu', 'appelleras'], ['jeter', 'ind-present', 'nous', 'jetons'],
      ['lever', 'subj-present', 'je', 'lève'], ['nettoyer', 'ind-futur', 'je', 'nettoierai'], ['envoyer', 'cond-present', 'vous', 'enverriez'],
      ['étudier', 'ind-imparfait', 'nous', 'étudiions'], ['créer', 'ind-present', 'ils', 'créent'],
      ['finir', 'ind-present', 'ils', 'finissent'], ['finir', 'subj-imparfait', 'il', 'finît'], ['haïr', 'ind-present', 'je', 'hais'],
      ['haïr', 'ind-passe-simple', 'nous', 'haïmes'],
      ['être', 'subj-present', 'nous', 'soyons'], ['avoir', 'subj-imparfait', 'il', 'eût'], ['aller', 'ind-futur', 'je', 'irai'],
      ['venir', 'ind-passe-simple', 'nous', 'vînmes'], ['venir', 'subj-imparfait', 'elle', 'vînt'], ['prendre', 'subj-present', 'ils', 'prennent'],
      ['faire', 'ind-present', 'vous', 'faites'], ['dire', 'ind-present', 'vous', 'dites'], ['savoir', 'imp-present', 'tu', 'sache'],
      ['naître', 'ind-passe-simple', 'il', 'naquit'], ['résoudre', 'ind-present', 'il', 'résout'], ['vaincre', 'ind-present', 'nous', 'vainquons'],
      ['acquérir', 'ind-futur', 'je', 'acquerrai'], ['rire', 'ind-imparfait', 'nous', 'riions'], ['boire', 'subj-present', 'nous', 'buvions'],
      ['ouvrir', 'imp-present', 'tu', 'ouvre'], ['chanter', 'imp-present', 'tu', 'chante'], ['aller', 'imp-present', 'tu', 'va'],
      // Temps composés : avoir ou être, accord du participe avec être.
      ['chanter', 'ind-passe-compose', 'je', 'ai chanté'], ['aller', 'ind-passe-compose', 'elle', 'est allée'],
      ['partir', 'ind-plus-que-parfait', 'ils', 'étaient partis'], ['naître', 'subj-passe', 'elles', 'soient nées'],
      ['finir', 'ind-passe-anterieur', 'nous', 'eûmes fini'], ['prendre', 'ind-futur-anterieur', 'tu', 'auras pris'],
      ['venir', 'cond-passe', 'il', 'serait venu'], ['voir', 'subj-plus-que-parfait', 'vous', 'eussiez vu']
    ];
    for (const [v, t, p, attendu] of cas) expect(V.forme(v, t, p).split('|')[0], v + ' ' + t + ' ' + p).toBe(attendu);
    // Pas d'impératif pour pouvoir, devoir, valoir.
    expect(V.forme('pouvoir', 'imp-present', 'tu')).toBeNull();
  });

  test('écriture avec le pronom : élision, « que » au subjonctif, pas de pronom à l\'impératif', () => {
    expect(V.avecPronom('je', 'aime', 'indicatif')).toBe('j’aime');
    expect(V.avecPronom('je', 'hais', 'indicatif')).toBe('je hais');
    expect(V.avecPronom('il', 'chante', 'subjonctif')).toBe('qu’il chante');
    expect(V.avecPronom('je', 'aie chanté', 'subjonctif')).toBe('que j’aie chanté');
    expect(V.avecPronom('nous', 'chantons', 'imperatif')).toBe('chantons');
  });

  test('correction : avec ou sans pronom, apostrophe courbe, variantes de 1990 ; accents exigés', () => {
    const c = { forme: 'aie chanté' };
    expect(V.juste('aie chanté', c)).toBe(true);
    expect(V.juste('que j’aie chanté', c)).toBe(true);
    expect(V.juste("  Que J'aie   chanté ", c)).toBe(true);
    expect(V.juste('aie chante', c)).toBe(false);
    expect(V.juste('connait', { forme: 'connaît' })).toBe(true);
    expect(V.juste('préfèrerai', { forme: V.forme('préférer', 'ind-futur', 'je') })).toBe(true);
    expect(V.juste('allée', { forme: V.forme('aller', 'ind-passe-compose', 'je') })).toBe(false);
    expect(V.juste('suis allée', { forme: V.forme('aller', 'ind-passe-compose', 'je') })).toBe(true);
    expect(V.juste('suis allé', { forme: V.forme('aller', 'ind-passe-compose', 'je') })).toBe(true);
  });

  test('tirage : seulement les temps et groupes choisis, verbes du niveau choisi', () => {
    for (const niveau of ['facile', 'moyen', 'difficile', 'expert']) {
      const rang = V.niveau(niveau).rang;
      for (let i = 0; i < 200; i++) {
        const c = V.generer({ temps: ['ind-futur', 'subj-present'], groupes: [2, 3], niveau });
        expect(['ind-futur', 'subj-present']).toContain(c.temps);
        expect([2, 3]).toContain(c.groupe);
        expect(V.verbe(c.verbe).niveau).toBe(rang);
        expect(c.solution.endsWith(c.forme.split('|')[0])).toBe(true);
      }
    }
    // Impératif : jamais je, il, ils.
    for (let i = 0; i < 100; i++) expect(['tu', 'nous', 'vous']).toContain(V.generer({ temps: ['imp-present'], groupes: [1, 2, 3] }).pronom);
  });

  test('tableau « ? » : tous les pronoms, accord avec être', () => {
    expect(V.tableau('finir', 'ind-present')).toEqual(['je finis', 'tu finis', 'il/elle finit', 'nous finissons', 'vous finissez', 'ils/elles finissent']);
    expect(V.tableau('aller', 'ind-passe-compose')).toContain('elle est allée');
    expect(V.tableau('aller', 'ind-passe-compose')).toContain('nous sommes allé(e)s');
    expect(V.tableau('chanter', 'imp-present')).toEqual(['(tu) chante', '(nous) chantons', '(vous) chantez']);
  });
});

async function versConj(page, joueurs = 1) {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await versReglages(page, joueurs);
}

test('étape 3 : Français → Conjugaison propose les temps par mode, 3 groupes et 4 niveaux ; il faut un temps et un groupe', async ({ page }) => {
  await versConj(page);
  await page.locator('#matieres label', { hasText: 'Français' }).click();
  await page.locator('#francais label', { hasText: 'Conjugaison' }).click();
  await expect(page.locator('#reglages-conj')).toBeVisible();
  await expect(page.locator('#reglages-ortho')).toBeHidden();
  await expect(page.locator('#modes-conj label')).toHaveText(['Indicatif', 'Conditionnel', 'Subjonctif', 'Impératif']);
  await expect(page.locator('#temps-conj input:visible')).toHaveCount(8); // onglet Indicatif
  await page.locator('#modes-conj label', { hasText: 'Subjonctif' }).click();
  await expect(page.locator('#temps-conj input:visible')).toHaveCount(4);
  await expect(page.locator('#temps-conj input')).toHaveCount(15);
  await expect(page.locator('#groupes input')).toHaveCount(3);
  await expect(page.locator('#niveau-conj input')).toHaveCount(4);
  await expect(page.locator('#niveau-conj input[value="facile"]')).toBeChecked();
  // L'écran tient sans défiler.
  expect(await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1)).toBe(false);
  expect(await page.locator('#reglages-joueur').evaluate((e) => e.scrollHeight > e.clientHeight + 1)).toBe(false);
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un temps.');
  await page.getByRole('checkbox', { name: 'Subjonctif présent' }).check();
  await expect(page.locator('#modes-conj label', { hasText: 'Subjonctif' })).toHaveText('Subjonctif 1');
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un groupe de verbes.');
  await page.getByRole('checkbox', { name: '2e groupe' }).check();
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
});

test('partie en conjugaison : bonne réponse → dé FORT tout seul ; fausse → correction, « ? », « C\'est bon » → dé FAIBLE @smoke', async ({ page }) => {
  await versConj(page);
  await conjugaison(page, { temps: ['ind-present', 'ind-passe-compose'], groupes: [1, 3] });
  await lancer(page);
  for (const bonne of [true, false]) {
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    const c = await page.evaluate(() => window.Aventura.partie.carte);
    await expect(page.locator('#carte-consigne')).toContainText(c.tempsNom);
    await expect(page.locator('#carte-mot')).toContainText(c.verbe);
    await expect(page.getByLabel('Ta réponse')).toBeFocused();
    await page.getByLabel('Ta réponse').fill(bonne ? c.solution : 'zzz');
    await page.getByRole('button', { name: 'Valider' }).click();
    await expect(page.locator('#carte-reponse')).toContainText(bonne ? 'Bonne réponse !' : 'La bonne réponse est : ' + c.solution);
    await expect(page.locator('#reaction')).toHaveClass(bonne ? /bonne/ : /mauvaise/);
    if (bonne) {
      await expect(page.locator('#conj-suite')).toBeHidden();
      await lancerLeDe(page);
    } else {
      // Le dé attend : « ? » ouvre le tableau, « C'est bon » lance le dé.
      await expect(page.getByRole('button', { name: 'C’est bon' })).toBeFocused();
      await page.getByRole('button', { name: 'Voir toute la conjugaison' }).click();
      await expect(page.locator('#conj-tableau li')).toHaveCount(c.temps === 'ind-passe-compose' && ['aller', 'venir', 'arriver', 'tomber', 'rester', 'entrer'].includes(c.verbe) ? 8 : 6);
      expect(await page.evaluate(() => window.Aventura.partie.carte.attente)).toBe(true);
      await page.reload(); // rafraîchir : on attend toujours « C'est bon », le tableau reste ouvert
      await expect(page.locator('#conj-tableau')).toBeVisible();
      await page.getByRole('button', { name: 'C’est bon' }).click();
      await expect(page.locator('#conj-suite')).toBeHidden();
      expect(await page.evaluate(() => window.Aventura.partie.regles.de)).toBe('faible');
      await lancerLeDe(page);
    }
    await page.getByRole('button', { name: 'Piocher une carte' }).waitFor();
  }
});

test('« Mêmes réglages pour tous » copie la conjugaison', async ({ page }) => {
  await versConj(page, 2);
  await conjugaison(page, { temps: ['cond-present'], groupes: [2], niveau: 'expert' });
  await page.getByRole('button', { name: 'Mêmes réglages pour tous' }).click();
  const p = await page.evaluate(() => window.Aventura.partie);
  expect(p.matiere[1]).toBe('conjugaison');
  expect(p.conj[1]).toEqual({ temps: ['cond-present'], groupes: [2], niveau: 'expert' });
  await ouvrirNeuf(page);
});
