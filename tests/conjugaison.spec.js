// Conjugaison (v5.8) : Français → Conjugaison, temps rangés par mode, groupes, niveau ;
// carte = pronom + verbe + temps, réponse écrite et corrigée ; si faux : « ? » (tableau) et « J'ai compris ».
const { test, expect } = require('@playwright/test');
const V = require('../js/conjugaison.js');
const { rapide, versReglages, valider, conjugaison, matiere, lancer, lancerLeDe } = require('./aide');

test.describe('moteur de conjugaison', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  // Formes de référence (tableaux de conjugaison usuels).
  const ATTENDUS = [
    ['chanter', 'indicatif.present', 3, 'chantons'], ['manger', 'indicatif.present', 3, 'mangeons'],
    ['commencer', 'indicatif.imparfait', 0, 'commençais'], ['manger', 'indicatif.passe-simple', 5, 'mangèrent'],
    ['appeler', 'indicatif.present', 0, 'appelle'], ['appeler', 'indicatif.futur', 3, 'appellerons'],
    ['jeter', 'indicatif.present', 5, 'jettent'], ['acheter', 'indicatif.futur', 0, 'achèterai'],
    ['lever', 'subjonctif.present', 1, 'lèves'], ['céder', 'indicatif.present', 2, 'cède'],
    ['employer', 'indicatif.futur', 2, 'emploiera'], ['envoyer', 'indicatif.futur', 0, 'enverrai'],
    ['finir', 'indicatif.present', 3, 'finissons'], ['finir', 'subjonctif.imparfait', 2, 'finît'],
    ['être', 'indicatif.imparfait', 0, 'étais'], ['être', 'subjonctif.present', 3, 'soyons'],
    ['avoir', 'subjonctif.present', 0, 'aie'], ['avoir', 'indicatif.passe-simple', 3, 'eûmes'],
    ['aller', 'indicatif.futur', 4, 'irez'], ['aller', 'subjonctif.present', 0, 'aille'], ['aller', 'imperatif.present', 1, 'va'],
    ['faire', 'indicatif.present', 4, 'faites'], ['faire', 'subjonctif.present', 3, 'fassions'],
    ['venir', 'indicatif.passe-simple', 3, 'vînmes'], ['prendre', 'subjonctif.present', 5, 'prennent'],
    ['pouvoir', 'subjonctif.present', 0, 'puisse'], ['vouloir', 'imperatif.present', 4, 'veuillez'],
    ['savoir', 'imperatif.present', 1, 'sache'], ['boire', 'indicatif.imparfait', 3, 'buvions'],
    ['voir', 'indicatif.futur', 0, 'verrai'], ['devoir', 'indicatif.passe-compose', 0, 'ai dû'],
    ['mourir', 'indicatif.passe-compose', 5, 'sont morts'], ['naître', 'indicatif.passe-simple', 2, 'naquit'],
    ['ouvrir', 'imperatif.present', 1, 'ouvre'], ['vivre', 'indicatif.passe-simple', 0, 'vécus'],
    ['acquérir', 'indicatif.present', 5, 'acquièrent'], ['résoudre', 'indicatif.present', 3, 'résolvons'],
    ['vaincre', 'indicatif.present', 2, 'vainc'], ['rire', 'indicatif.imparfait', 3, 'riions'],
    ['aller', 'indicatif.plus-que-parfait', 3, 'étions allés'], ['finir', 'conditionnel.passe', 0, 'aurais fini'],
    ['partir', 'subjonctif.passe', 2, 'soit parti'], ['chanter', 'imperatif.passe', 1, 'aie chanté'],
    ['cueillir', 'indicatif.futur', 0, 'cueillerai'], ['valoir', 'subjonctif.present', 0, 'vaille']
  ];
  for (const [v, t, k, f] of ATTENDUS) {
    test(`${v}, ${t}, ${V.PRONOMS[k]} : ${f}`, () => { expect(V.formes(v, t, k)[0]).toBe(f); });
  }

  test('pronoms : élision, « que » au subjonctif, pas de pronom à l\'impératif', () => {
    expect(V.avecPronom('indicatif.present', 0, 'aime')).toBe('j’aime');
    expect(V.avecPronom('indicatif.present', 0, 'habite')).toBe('j’habite');
    expect(V.avecPronom('subjonctif.present', 2, 'finisse')).toBe('qu’il finisse');
    expect(V.avecPronom('subjonctif.present', 0, 'aie')).toBe('que j’aie');
    expect(V.avecPronom('imperatif.present', 3, 'chantons')).toBe('chantons');
    expect(V.personnes('chanter', 'imperatif.present')).toEqual([1, 3, 4]);
    expect(V.personnes('pouvoir', 'imperatif.present')).toEqual([]);
  });

  test('réponse : pronom et « que » facultatifs, majuscules et apostrophe courbe tolérées, écritures admises', () => {
    expect(V.juste('nous finissions', 'finir', 'indicatif.imparfait', 3)).toBe(true);
    expect(V.juste('finissions', 'finir', 'indicatif.imparfait', 3)).toBe(true);
    expect(V.juste('Que je sois', 'être', 'subjonctif.present', 0)).toBe(true);
    expect(V.juste('J’ai fini', 'finir', 'indicatif.passe-compose', 0)).toBe(true);
    expect(V.juste('qu\'il finisse', 'finir', 'subjonctif.present', 2)).toBe(true);
    expect(V.juste('je paye', 'payer', 'indicatif.present', 0)).toBe(true);
    expect(V.juste('je cèderai', 'céder', 'indicatif.futur', 0)).toBe(true);
    expect(V.juste('il connait', 'connaître', 'indicatif.present', 2)).toBe(true);
    expect(V.juste('vous êtes allé', 'aller', 'indicatif.passe-compose', 4)).toBe(true);
    // Les accents comptent.
    expect(V.juste('il cede', 'céder', 'indicatif.present', 2)).toBe(false);
    expect(V.juste('nous finisions', 'finir', 'indicatif.imparfait', 3)).toBe(false);
  });

  test('le tirage respecte les temps, les groupes et le niveau choisis', () => {
    for (let i = 0; i < 400; i++) {
      const c = V.generer({ temps: ['subjonctif.present', 'imperatif.present'], groupes: [3], niveau: 'moyen' });
      expect(['subjonctif.present', 'imperatif.present']).toContain(c.temps);
      const v = V.verbe(c.verbe);
      expect(v.groupe).toBe(3);
      expect(v.niveau).toBe('moyen');
      expect(V.formes(c.verbe, c.temps, c.personne).length).toBeGreaterThan(0);
    }
    // Chaque groupe a des verbes à chaque niveau.
    for (const n of ['facile', 'moyen', 'difficile', 'expert']) for (const g of [1, 2, 3]) {
      expect(V.VERBES.filter((v) => v.niveau === n && v.groupe === g).length).toBeGreaterThan(3);
    }
    // Aucune forme vide ou indéfinie pour aucun verbe.
    for (const v of V.VERBES) for (const t of V.TEMPS) for (let k = 0; k < 6; k++) {
      for (const f of V.formes(v.inf, t.id, k)) expect(f).toMatch(/^[a-zàâäçéèêëîïôöûüÿœ' ]+$/);
    }
  });
});

async function preparer(page, joueurs = 1) {
  if (!page.__rapide) { await rapide(page); page.__rapide = true; }
  await page.goto('./');
  await versReglages(page, joueurs);
}

// v6.0 : trois écrans pour la conjugaison (choix de l'utilisateur).
async function tient(page) {
  const r = await page.evaluate(() => ({
    page: document.documentElement.scrollHeight - innerHeight,
    corps: (() => { const c = document.querySelector('#reglages-joueur'); return c.scrollHeight - c.clientHeight; })()
  }));
  expect(r.page).toBeLessThanOrEqual(1);
  expect(r.corps).toBeLessThanOrEqual(1);
}

test('conjugaison en 3 écrans : matière → modes et leurs temps seulement → groupes et niveau ; tout tient sans défiler', async ({ page }) => {
  await preparer(page);
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : quelle matière ?');
  await matiere(page, 'conjugaison');
  // Écran 2 : les 4 modes ; aucun temps tant qu'aucun mode n'est choisi.
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Conjugaison, les temps');
  await expect(page.locator('#modes-conj input')).toHaveCount(4);
  await expect(page.locator('#temps-conj input:visible')).toHaveCount(0);
  await expect(page.locator('#temps-conj-vide')).toBeVisible();
  await expect(page.locator('#groupes')).toBeHidden();
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un mode.');
  // Subjonctif : seulement ses 4 temps.
  await page.locator('#modes-conj label', { hasText: 'Subjonctif' }).click();
  await expect(page.locator('#temps-conj input:visible')).toHaveCount(4);
  await expect(page.getByRole('checkbox', { name: 'Subjonctif imparfait' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Indicatif présent' })).toBeHidden();
  // Tous les modes : les 16 temps tiennent sans défiler.
  for (const m of ['Indicatif', 'Conditionnel', 'Impératif']) await page.locator('#modes-conj label', { hasText: m }).click();
  await expect(page.locator('#temps-conj input:visible')).toHaveCount(16);
  await tient(page);
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un temps.');
  await page.getByRole('checkbox', { name: 'Conditionnel passé' }).check();
  // Retirer le mode retire aussi ses temps.
  await page.locator('#modes-conj label', { hasText: 'Conditionnel' }).click();
  expect(await page.evaluate(() => window.Aventura.partie.conj[0].temps)).toEqual([]);
  await page.getByRole('checkbox', { name: 'Indicatif futur simple' }).check();
  await valider(page);
  // Écran 3 : groupes et niveau.
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Conjugaison, les verbes');
  await expect(page.locator('#groupes input')).toHaveCount(3);
  await expect(page.locator('#niveau-conj input')).toHaveCount(4);
  await expect(page.locator('#modes-conj')).toBeHidden();
  await tient(page);
  await valider(page);
  await expect(page.locator('#packs-alerte')).toHaveText('Léa (Joueur 1) doit choisir au moins un groupe de verbes.');
  // Retour : écran des temps (choix gardés), puis la matière.
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : Conjugaison, les temps');
  await expect(page.getByRole('checkbox', { name: 'Indicatif futur simple' })).toBeChecked();
  await page.getByRole('button', { name: /Retour/ }).click();
  await expect(page.locator('#reglages-titre')).toHaveText('Léa (Joueur 1) : quelle matière ?');
  await valider(page);
  await valider(page);
  await page.locator('#groupes input[value="2"]').check();
  await valider(page);
  await expect(page.getByRole('button', { name: 'Lancer la partie' })).toBeVisible();
});

// Joue la carte affichée : bonne réponse ou réponse fausse.
async function repondre(page, bonne) {
  const c = await page.evaluate(() => window.Aventura.partie.carte);
  const juste = await page.evaluate((c) => window.Conjugaison.formes(c.verbe, c.temps, c.personne)[0], c);
  await page.getByLabel('Ta réponse').fill(bonne ? juste : juste + 'x');
  await page.getByRole('button', { name: 'Valider' }).click();
  return c;
}

test('partie en conjugaison : bonne réponse → dé FORT tout seul @smoke', async ({ page }) => {
  await rapide(page, { autoDe: 50 });
  page.__rapide = true;
  await preparer(page);
  await conjugaison(page, { temps: ['indicatif.imparfait'], groupes: [2], niveau: 'facile' });
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  await expect(page.locator('#carte-consigne')).toContainText(/Conjugue (finir|choisir|grandir|remplir)/);
  await expect(page.locator('#carte-consigne')).toContainText('Indicatif · imparfait');
  await expect(page.locator('#carte-mot')).toHaveText(/^(je|tu|il|nous|vous|ils) …$/);
  const c = await repondre(page, true);
  await expect(page.locator('#carte-reponse')).toHaveText('Bonne réponse ! ' + c.bonne);
  await expect(page.locator('#btn-tableau')).toBeHidden();
  await expect.poll(async () => Number(await page.locator('#points').textContent())).toBeGreaterThanOrEqual(4);
});

test('conjugaison fausse : bonne réponse affichée, « ? » montre tout le verbe, le dé attend « J\'ai compris »', async ({ page }) => {
  await rapide(page, { autoDe: 50 });
  page.__rapide = true;
  await preparer(page);
  await conjugaison(page, { temps: ['indicatif.present'], groupes: [3], niveau: 'facile' });
  await lancer(page);
  await page.getByRole('button', { name: 'Piocher une carte' }).click();
  const c = await repondre(page, false);
  await expect(page.locator('#carte-reponse')).toHaveText('Ce n’est pas ça. La bonne réponse : ' + c.bonne + '.');
  await expect(page.locator('#reaction')).toHaveClass(/mauvaise/);
  const aide = page.locator('#btn-tableau');
  await expect(aide).toBeVisible();
  await expect(aide).toHaveAccessibleName('Voir toute la conjugaison de ' + c.verbe + ' : indicatif présent');
  await expect(page.locator('#carte-tableau')).toBeHidden();
  await aide.click();
  await expect(aide).toHaveAttribute('aria-expanded', 'true');
  const lignes = page.locator('#carte-tableau li');
  await expect(lignes).toHaveCount(6);
  await expect(page.locator('#carte-tableau .demande')).toHaveText(c.bonne);
  // Le dé ne part pas tout seul : on attend le joueur.
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.Aventura.partie.regles.etape)).toBe('lancer');
  expect(Number(await page.locator('#points').textContent())).toBe(0);
  // Rafraîchir garde la correction et l'attente.
  await page.reload();
  await expect(page.locator('#carte-reponse')).toContainText(c.bonne);
  await page.waitForTimeout(300);
  expect(Number(await page.locator('#points').textContent())).toBe(0);
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await expect.poll(async () => Number(await page.locator('#points').textContent())).toBeGreaterThanOrEqual(1);
  expect(Number(await page.locator('#points').textContent())).toBeLessThanOrEqual(3);
});

test('impératif : pronom entre parenthèses ; subjonctif : « que » devant le pronom', async ({ page }) => {
  await preparer(page);
  await conjugaison(page, { temps: ['imperatif.present', 'subjonctif.present'], groupes: [1], niveau: 'facile' });
  await lancer(page);
  for (let i = 0; i < 2; i++) {
    if (i) { await lancerLeDe(page); await page.getByRole('button', { name: 'Piocher une carte' }).waitFor(); }
    await page.getByRole('button', { name: 'Piocher une carte' }).click();
    const c = await page.evaluate(() => window.Aventura.partie.carte);
    await expect(page.locator('#carte-mot')).toHaveText(c.temps === 'imperatif.present' ? /^\((tu|nous|vous)\) …$/ : /^(que|qu’)/);
    await repondre(page, true);
    await expect(page.locator('#carte-reponse')).toContainText('Bonne réponse !');
  }
});
