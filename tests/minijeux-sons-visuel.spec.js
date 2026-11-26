// Mini-jeu « Les sons » (v10.60, demande du 26/11/2026) :
//  1. le visuel : le cadre du jeu prend toute la largeur (colonnes de 40 px et « [ə] » écrit en hauteur auparavant) ;
//  2. la voix : un clic sur un phonème le fait dire 0,5 s ;
//  3. la fenêtre « i » : l'image du jeu précédent ne reste plus visible une fraction de seconde ;
//  4. la capture d'écran de « Les sons » montre le jeu corrigé (img/minijeux/sons.webp).
const { test, expect } = require('@playwright/test');
const { rapide, creerJoueurs } = require('./aide');

const JEUX = ['completer', 'son', 'intrus', 'position', 'relier', 'trier'];

async function accueil(page, voix) {
  await rapide(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  if (voix) await page.addInitScript(voix); // fausse synthèse vocale
  await page.goto('./');
  await creerJoueurs(page, 1);
  await page.locator('#btn-minijeux').click();
  await expect(page.locator('.minijeu-carte').first()).toBeVisible();
}
const jouer = (page, jeu) => page.evaluate((j) => window.Minijeux.lancer('sons', window.Joueurs.duCompte()[0].id, j), jeu);
// Lance le jeu puis attend la lecture automatique de la consigne (300 ms après le début) : elle coupe la voix en cours,
// elle ne doit pas se mêler au son qu'on teste. Le journal de la fausse voix est ensuite vidé.
async function jouerEtAttendreConsigne(page, jeu) {
  await jouer(page, jeu);
  await expect.poll(() => page.evaluate(() => window.__voix.dits.length)).toBeGreaterThan(0);
  await page.waitForTimeout(100);
  await page.evaluate(() => { window.__voix.dits.length = 0; window.__voix.coupures.length = 0; });
}

// Fausse synthèse : note chaque phrase dite (texte, instant du démarrage) et chaque coupure (cancel).
const FAUSSE_VOIX = () => {
  const journal = { dits: [], coupures: [] };
  window.__voix = journal;
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  Object.defineProperty(window, 'speechSynthesis', { // propriété en lecture seule : defineProperty, pas une affectation
    configurable: true,
    value: {
      paused: false, getVoices: () => [], addEventListener() {}, resume() {},
      cancel() { journal.coupures.push(performance.now()); },
      speak(u) { setTimeout(() => { journal.dits.push({ texte: u.text, debut: performance.now() }); if (u.onstart) u.onstart(); }, 20); }
    }
  });
};

test.describe('moteur : le son dit seul', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));
  test('chaque son a une syllabe à dire', () => {
    const P = require('../js/phonemes.js');
    for (const id of P.TOUS_SONS) expect(P.sonDit(id), id).not.toBe('');
    expect(P.sonDit('inconnu')).toBe('');
  });
});

test('Les sons : le cadre du jeu prend toute la largeur de la carte, aucun texte écrit en hauteur @smoke', async ({ page }) => {
  await accueil(page);
  for (const jeu of JEUX) {
    for (let k = 0; k < 3; k++) { // plusieurs tirages : des sons à une ou plusieurs lettres, longs ou courts
      await jouer(page, jeu);
      await expect(page.locator('#minijeu-gram')).toBeVisible();
      const m = await page.evaluate(() => {
        const carte = document.querySelector('.carte-page.minijeu'), cadre = document.getElementById('minijeu-gram');
        const rc = carte.getBoundingClientRect(), rg = cadre.getBoundingClientRect(), pb = parseFloat(getComputedStyle(carte).paddingLeft) || 0;
        const boutons = [...cadre.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => {
          const r = b.getBoundingClientRect(), t = b.querySelector('.gram-texte') || b;
          return { texte: b.textContent.trim(), reponse: b.matches('.gram-bouton, .gram-mot-relier, .phon-col-tete'), l: r.width, h: r.height, lignes: Math.round(t.getBoundingClientRect().height / (parseFloat(getComputedStyle(t).lineHeight) || parseFloat(getComputedStyle(t).fontSize) * 1.2)) };
        });
        return { carteL: rc.width - 2 * pb, cadreL: rg.width, pageL: document.documentElement.scrollWidth, fenetre: innerWidth, boutons };
      });
      expect(m.cadreL, jeu + ' : cadre trop étroit').toBeGreaterThanOrEqual(m.carteL * 0.9);
      expect(m.pageL, jeu + ' : la page déborde').toBeLessThanOrEqual(m.fenetre + 1);
      for (const b of m.boutons) {
        if (b.reponse) expect(b.l, jeu + ' : bouton « ' + b.texte + ' » trop étroit').toBeGreaterThanOrEqual(56); // les bulles de mots courts (riz, île) restent petites
        expect(b.lignes, jeu + ' : « ' + b.texte + ' » sur plusieurs lignes').toBeLessThanOrEqual(2);
      }
    }
  }
});

test('Relier : deux colonnes de même largeur, chaque phonème sur une seule ligne', async ({ page }) => {
  await accueil(page);
  await jouer(page, 'relier');
  const gauche = page.locator('.gram-mot-relier[data-cote="g"]'), droite = page.locator('.gram-mot-relier[data-cote="d"]');
  const n = await gauche.count();
  expect(n).toBeGreaterThanOrEqual(4);
  const l = await gauche.evaluateAll((l) => l.map((e) => Math.round(e.getBoundingClientRect().width)));
  const r = await droite.evaluateAll((l) => l.map((e) => Math.round(e.getBoundingClientRect().width)));
  expect(Math.min(...l)).toBeGreaterThanOrEqual(80);
  expect(Math.max(...l) - Math.min(...l)).toBeLessThanOrEqual(2);
  expect(Math.abs(l[0] - r[0])).toBeLessThanOrEqual(4);
  const hauteurs = await gauche.evaluateAll((l) => l.map((e) => Math.round(e.getBoundingClientRect().height)));
  expect(Math.max(...hauteurs)).toBeLessThanOrEqual(64); // pas de [ ə ] sur 3 lignes
});

test('Voix : un clic sur un phonème (Relier, colonne de gauche) le dit puis coupe la voix après 0,5 s @smoke', async ({ page }) => {
  await accueil(page, FAUSSE_VOIX);
  await jouerEtAttendreConsigne(page, 'relier');
  const { son, attendu } = await page.evaluate(() => {
    const c = window.Minijeux.carte(); return { son: c.gauche[0], attendu: window.Phonemes.sonDit(c.gauche[0]) };
  });
  expect(son).toBeTruthy();
  await page.locator('.gram-mot-relier[data-cote="g"][data-i="0"]').click();
  await expect.poll(() => page.evaluate(() => window.__voix.dits.length)).toBe(1);
  const dit = await page.evaluate(() => window.__voix.dits[0]);
  expect(dit.texte).toBe(attendu);
  await expect.poll(() => page.evaluate((d) => window.__voix.coupures.filter((t) => t > d).length, dit.debut), { timeout: 3000 }).toBeGreaterThan(0);
  const coupe = await page.evaluate((d) => window.__voix.coupures.filter((t) => t > d)[0] - d, dit.debut);
  expect(coupe).toBeGreaterThanOrEqual(480);
  expect(coupe).toBeLessThanOrEqual(700);
});

test('Voix : toucher l’écriture (colonne de droite) ne dit rien ; un autre phonème remplace le précédent', async ({ page }) => {
  await accueil(page, FAUSSE_VOIX);
  await jouerEtAttendreConsigne(page, 'relier');
  await page.locator('.gram-mot-relier[data-cote="d"][data-i="0"]').click();
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.__voix.dits.length)).toBe(0);
  await page.locator('.gram-mot-relier[data-cote="g"][data-i="1"]').click();
  await page.locator('.gram-mot-relier[data-cote="g"][data-i="2"]').click();
  await expect.poll(() => page.evaluate(() => window.__voix.dits.length)).toBe(2);
});

test('Voix : « Quel son ? » dit le son touché, et la fin de partie ne le coupe pas avant 0,5 s', async ({ page }) => {
  await accueil(page, FAUSSE_VOIX);
  await jouerEtAttendreConsigne(page, 'son');
  const v = await page.locator('#minijeu-gram .gram-bouton').first().getAttribute('data-v');
  const attendu = await page.evaluate((id) => window.Phonemes.sonDit(id), v);
  await page.locator('#minijeu-gram .gram-bouton').first().click();
  await expect(page.locator('#minijeu-fin .minijeu-bravo')).toBeVisible(); // la partie est finie tout de suite
  await expect.poll(() => page.evaluate(() => window.__voix.dits.length)).toBe(1);
  const dit = await page.evaluate(() => window.__voix.dits[0]);
  expect(dit.texte).toBe(attendu);
  await expect.poll(() => page.evaluate((d) => window.__voix.coupures.filter((t) => t > d).length, dit.debut), { timeout: 3000 }).toBeGreaterThan(0);
  const coupe = await page.evaluate((d) => window.__voix.coupures.filter((t) => t > d)[0] - d, dit.debut);
  expect(coupe).toBeGreaterThanOrEqual(480); // pas coupé par « terminer »
});

test('Fenêtre « i » : à l’ouverture, c’est déjà la capture du bon jeu (plus de flash du jeu précédent) @smoke', async ({ page }) => {
  await accueil(page);
  // On note, à chaque ouverture de la fenêtre, l'image qu'elle montre à cet instant précis.
  await page.evaluate(() => {
    window.__ouvertures = [];
    const ouvrir = HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal = function () {
      if (this.id === 'minijeu-info') { const i = this.querySelector('img'); window.__ouvertures.push({ src: i.getAttribute('src'), pret: i.complete && i.naturalWidth > 0 }); }
      return ouvrir.apply(this, arguments);
    };
  });
  const suite = ['fabrique', 'sons', 'quiz', 'sons', 'reperes'];
  for (const id of suite) {
    await page.locator('.minijeu-info[data-info="' + id + '"]').click();
    await expect(page.locator('#minijeu-info')).toBeVisible();
    await page.locator('#minijeu-info-fermer').click();
    await expect(page.locator('#minijeu-info')).toBeHidden();
  }
  const o = await page.evaluate(() => window.__ouvertures);
  expect(o.length).toBe(suite.length);
  o.forEach((x, k) => {
    expect(x.src, 'ouverture ' + (k + 1)).toBe('img/minijeux/' + suite[k] + '.webp'); // pas l'image d'avant
    expect(x.pret, 'ouverture ' + (k + 1) + ' : image pas encore chargée').toBe(true);
  });
});

test('Fenêtre « i » : deux clics rapides sur deux jeux, c’est le dernier qui s’affiche', async ({ page }) => {
  await accueil(page);
  await page.evaluate(() => { document.querySelector('.minijeu-info[data-info="aventure"]').click(); document.querySelector('.minijeu-info[data-info="reperes"]').click(); });
  await expect(page.locator('#minijeu-info')).toBeVisible();
  await expect(page.locator('#minijeu-info-titre')).toHaveText('Chasse aux lettres');
  await expect(page.locator('#minijeu-info-img')).toHaveAttribute('src', 'img/minijeux/reperes.webp');
});

test('Capture de « Les sons » : le jeu corrigé (boutons larges), pas l’ancien visuel étroit', async ({ page, request }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'une seule vérification suffit');
  const r = await request.get('img/minijeux/sons.webp');
  expect(r.status()).toBe(200);
  await accueil(page);
  await page.locator('.minijeu-info[data-info="sons"]').click();
  const img = page.locator('#minijeu-info-img');
  await expect.poll(() => img.evaluate((e) => e.complete && e.naturalWidth > 0)).toBe(true);
  // Ouvre la capture dans un canvas : sur la ligne du premier bouton de gauche, la part de « parchemin » (fond de la carte) doit
  // être faible (boutons larges) ; avec l'ancien visuel, de longues plages de fond séparaient deux colonnes étroites.
  const largeur = await img.evaluate((e) => {
    const c = document.createElement('canvas'); c.width = e.naturalWidth; c.height = e.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(e, 0, 0);
    const y = Math.round(c.height * 0.33), d = g.getImageData(0, y, c.width, 1).data;
    let blancs = 0;
    for (let x = 0; x < c.width; x++) { const i = x * 4; if (d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245) blancs++; }
    return blancs / c.width;
  });
  expect(largeur).toBeGreaterThan(0.45); // deux boutons blancs qui couvrent près de la moitié de la largeur de l'image
});
