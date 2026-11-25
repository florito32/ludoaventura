// Mini-jeu « Chasse aux lettres » (v10.54, demande du 25/11/2026, backlog lignes 532 à 541) : js/mj-reperes.js.
// Préparation (lettre, casse, style, hasard, record du profil), partie d'une minute (13 lettres immobiles dont un tiers demandées,
// toucher = disparaît + nouvelle ailleurs, une lettre non demandée change toutes les 2 s), pas de plafond de quantité, fin, record gardé dans Supabase (simulé ici) et bouton « Retour à l'accueil ».
const { test, expect } = require('@playwright/test');
const { rapide, creerJoueurs, quiJoue } = require('./aide');

// duree / delai / compte : raccourcis des tests (window.AVENTURA_REPERES) ; le délai de décompte est de 700 ms en vrai.
async function ouvrir(page, cfg = { duree: 60, delai: 2, compte: 0 }, avantJeu = null) {
  await rapide(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((c) => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } window.AVENTURA_REPERES = c; }, cfg);
  await page.goto('./');
  await creerJoueurs(page, 1);
  if (avantJeu) await avantJeu();
  await page.locator('#btn-minijeux').click();
  await page.locator('.minijeu-carte[data-jeu="reperes"]').click();
  await quiJoue(page);
  await expect(page.locator('#titre-minijeu')).toHaveText('Chasse aux lettres');
}
async function jouer(page, lettre = 'm', casse = 'maj', style = 'imp') {
  if (lettre) await page.locator('.rep-touche[data-l="' + lettre + '"]').click(); else await page.locator('.rep-hasard').click();
  await page.locator('[data-casse="' + casse + '"]').click();
  await page.locator('[data-style="' + style + '"]').click();
  await page.locator('.rep-jouer').click();
  await expect(page.locator('.rep-let:not(.rep-vide)')).toHaveCount(13);
}
const etat = (page) => page.evaluate(() => {
  const j = window.MJReperes.courant();
  return { base: j.base, bons: j.bons, mauvais: j.mauvais, apparues: j.apparues, fini: j.fini, occ: j.slots.filter((s) => s.occ).length, cibles: j.slots.filter((s) => s.occ && s.data.cible).length };
});
const debordements = (page) => page.evaluate(() => {
  const w = window.innerWidth, out = [];
  if (document.documentElement.scrollWidth > w + 1) out.push('page large : ' + document.documentElement.scrollWidth + ' > ' + w);
  const aire = document.querySelector('.rep-aire'), a = aire && aire.getBoundingClientRect();
  document.querySelectorAll('.rep-let:not(.rep-vide)').forEach((b) => {
    const r = b.getBoundingClientRect();
    if (r.left < a.left - 1 || r.right > a.right + 1 || r.top < a.top - 1 || r.bottom > a.bottom + 1) out.push('lettre hors zone : ' + b.textContent);
    if (r.width < 43 || r.height < 43) out.push('lettre trop petite : ' + Math.round(r.width) + ' px');
  });
  return out.slice(0, 5);
});
// Deux lettres affichées ne se chevauchent pas.
const chevauchements = (page) => page.evaluate(() => {
  const rs = [...document.querySelectorAll('.rep-let:not(.rep-vide)')].map((b) => b.getBoundingClientRect()), out = [];
  for (let i = 0; i < rs.length; i++) for (let k = i + 1; k < rs.length; k++) {
    const a = rs[i], b = rs[k];
    if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.push(i + '/' + k);
  }
  return out.slice(0, 5);
});

test('Chasse aux lettres : dans la liste des mini-jeux ; préparation avec 26 touches, hasard, casse, style, record à battre @smoke', async ({ page }) => {
  await ouvrir(page);
  await expect(page.locator('.rep-touche[data-l]')).toHaveCount(27); // 26 lettres + « Au hasard »
  await expect(page.locator('.rep-hasard')).toBeVisible();
  await expect(page.locator('.rep-record')).toContainText('à battre');
  await expect(page.locator('[data-casse]')).toHaveCount(3);
  await expect(page.locator('[data-style]')).toHaveCount(2);
  await expect(page.locator('.rep-jouer')).toBeVisible();
  // Les touches suivent la casse choisie.
  await page.locator('[data-casse="min"]').click();
  await expect(page.locator('.rep-touche[data-l="m"]')).toHaveText('m');
  await page.locator('[data-casse="mix"]').click();
  await expect(page.locator('.rep-touche[data-l="m"]')).toHaveText('Mm');
  await page.locator('.rep-touche[data-l="m"]').click();
  await expect(page.locator('.rep-touche[data-l="m"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.rep-hasard')).toHaveAttribute('aria-pressed', 'false');
  expect(await debordements(page)).toEqual([]);
  // Tout tient sans défiler dans la page de préparation (jusqu'au bouton Jouer).
  const b = await page.locator('.rep-jouer').boundingBox();
  expect(b.y + b.height).toBeLessThanOrEqual(page.viewportSize().height + 1);
});

test('Chasse aux lettres : 13 lettres immobiles, un tiers demandées, bandeau (lettre, chrono, compte), sans débordement ni chevauchement', async ({ page }) => {
  await ouvrir(page);
  await jouer(page, 'm', 'mix', 'cur');
  const e = await etat(page);
  expect(e.base).toBe('m');
  expect(e.occ).toBe(13);
  expect(e.cibles).toBeGreaterThanOrEqual(3);
  expect(e.cibles).toBeLessThanOrEqual(6);
  await expect(page.locator('.rep-lettre-cible')).toHaveText('M m');
  await expect(page.locator('.rep-chrono')).toHaveText(/^[01]:\d\d$/);
  await expect(page.locator('.rep-bons')).toHaveText('✓ 0');
  expect(await debordements(page)).toEqual([]);
  expect(await chevauchements(page)).toEqual([]);
  // Cursive : la police du site est bien chargée (hébergée, pas chez Google).
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('20px "Ludo Cursive"', 'Mm'))).toBe(true);
  expect(await page.evaluate(() => [...document.fonts].filter((f) => f.family.replace(/"/g, '') === 'Ludo Cursive')[0].status)).toBe('loaded');
});

test('Chasse aux lettres : toucher une lettre (bonne ou mauvaise) la fait disparaître, une nouvelle apparaît ailleurs, pas de limite d\'erreurs', async ({ page }) => {
  await ouvrir(page, { duree: 60, delai: 30, compte: 0 }); // délai long : seuls nos clics changent les lettres
  await jouer(page, 'b', 'maj', 'imp');
  // Une lettre demandée : le compteur monte, la lettre touchée disparaît, il y en a toujours 13.
  const idx = await page.evaluate(() => window.MJReperes.courant().slots.findIndex((s) => s.occ && s.data.cible));
  const avant = await page.evaluate((i) => { const s = window.MJReperes.courant().slots[i]; return { x: s.el.style.getPropertyValue('--x'), y: s.el.style.getPropertyValue('--y') }; }, idx);
  await page.locator('.rep-let').nth(idx).click();
  let e = await etat(page);
  expect(e.bons).toBe(1); expect(e.mauvais).toBe(0); expect(e.occ).toBe(13);
  await expect(page.locator('.rep-bons')).toHaveText('✓ 1');
  await expect(page.locator('.rep-let').nth(idx)).toHaveClass(/rep-vide/); // la nouvelle lettre est ailleurs
  expect(avant.x).not.toBe('');
  // Beaucoup de mauvaises réponses : aucune limite, la partie continue.
  for (let k = 0; k < 15; k++) {
    const j = await page.evaluate(() => window.MJReperes.courant().slots.findIndex((s) => s.occ && !s.data.cible));
    await page.locator('.rep-let').nth(j).click();
  }
  e = await etat(page);
  expect(e.mauvais).toBe(15); expect(e.fini).toBe(false); expect(e.occ).toBe(13);
  // Les lettres touchées ne bougent pas : leurs emplacements restent fixes (la position d'une lettre ne change qu'à son remplacement).
  expect(await debordements(page)).toEqual([]);
});

test('Chasse aux lettres : toutes les 2 secondes (ici 0,4 s), une lettre non demandée est remplacée ; les lettres demandées ne bougent pas seules', async ({ page }) => {
  await ouvrir(page, { duree: 60, delai: 0.4, compte: 0 });
  await jouer(page, 'n', 'maj', 'imp');
  const avant = await page.evaluate(() => window.MJReperes.courant().slots.map((s) => (s.occ ? s.data.l + (s.data.cible ? '!' : '') : '')));
  await page.waitForTimeout(1500);
  const e = await etat(page);
  const apres = await page.evaluate(() => window.MJReperes.courant().slots.map((s) => (s.occ ? s.data.l + (s.data.cible ? '!' : '') : '')));
  expect(apres).not.toEqual(avant);
  expect(e.occ).toBe(13);
  expect(e.bons + e.mauvais).toBe(0);
  // Le nombre de lettres demandées reste proche d'un tiers (13 × 33 % = 4).
  expect(e.cibles).toBeGreaterThanOrEqual(3);
  expect(e.cibles).toBeLessThanOrEqual(6);
});

test('Chasse aux lettres : pas de limite de quantité (plus de 55 lettres demandées trouvées, la partie continue) ; record enregistré @smoke', async ({ page }) => {
  await ouvrir(page, { duree: 60, delai: 30, compte: 0 });
  await jouer(page, 'm', 'maj', 'imp');
  // On touche toutes les lettres demandées, en boucle : de nouvelles apparaissent sans fin.
  for (let tour = 0; tour < 200 && (await etat(page)).bons < 56; tour++) {
    await page.evaluate(() => {
      const j = window.MJReperes.courant(); if (!j) return;
      j.slots.filter((s) => s.occ && s.data.cible).forEach((s) => s.el.click());
    });
    await page.waitForTimeout(10);
  }
  const e = await etat(page);
  expect(e.bons).toBeGreaterThanOrEqual(56);
  expect(e.fini).toBe(false);
  expect(e.cibles).toBeGreaterThanOrEqual(1); // il en reste toujours à trouver
  await expect(page.locator('.minijeu-fin')).toHaveCount(0);
  // Fin : on quitte la minute en forçant le temps écoulé.
  await page.evaluate(() => { const j = window.MJReperes.courant(); j.debut -= 61000; });
  await expect(page.locator('.minijeu-fin')).toBeVisible({ timeout: 4000 });
  await expect(page.locator('.minijeu-fin')).toContainText('Bravo');
  await expect(page.locator('.minijeu-fin')).toContainText('lettres « M » trouvées');
  await expect(page.locator('.minijeu-fin')).toContainText('Nouveau record');
  await expect(page.locator('.minijeu-fin')).toContainText('+10 étoiles');
  const rec = await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('ludoaventura-mj-reperes-records-v1')))[0]);
  expect(rec).toBeGreaterThanOrEqual(56);
  // Rejouer : retour à la préparation, avec le record du profil et les derniers choix.
  await page.locator('#minijeu-rejouer').click();
  await expect(page.locator('.rep-record')).toContainText(rec + ' lettres');
  await expect(page.locator('.rep-touche[data-l="m"]')).toHaveAttribute('aria-pressed', 'true');
});

// Simule Supabase : record_reperes rend le record du serveur, enregistrer_reperes rend record_avant / record.
const brancherBase = (page, serveur) => async () => {
  await page.evaluate((srv) => {
    window.__appels = [];
    window.Compte.rpc = (nom, corps) => {
      window.__appels.push([nom, corps]);
      if (srv === null) return Promise.resolve(null);
      if (nom === 'record_reperes') return Promise.resolve(srv);
      if (nom === 'enregistrer_reperes') return Promise.resolve({ record_avant: srv, record: Math.max(srv, corps.p_score) });
      return Promise.resolve(null);
    };
  }, serveur);
};

test('Chasse aux lettres : le record du profil vient de Supabase (record_reperes) à la préparation', async ({ page }) => {
  await ouvrir(page, { duree: 60, delai: 30, compte: 0 }, brancherBase(page, 17));
  await expect(page.locator('.rep-record')).toContainText('17 lettres');
  const appels = await page.evaluate(() => window.__appels);
  expect(appels.some((a) => a[0] === 'record_reperes')).toBe(true);
});

test('Chasse aux lettres : la partie est enregistrée dans Supabase (score, erreurs, lettre, casse, style) ; « Nouveau record » vient de record_avant', async ({ page }) => {
  await ouvrir(page, { duree: 2, delai: 30, compte: 0 }, brancherBase(page, 2));
  await jouer(page, 'b', 'min', 'cur');
  for (let k = 0; k < 4; k++) await page.evaluate(() => window.MJReperes.courant().slots.filter((s) => s.occ && s.data.cible)[0].el.click());
  await page.evaluate(() => window.MJReperes.courant().slots.filter((s) => s.occ && !s.data.cible)[0].el.click());
  await expect(page.locator('.minijeu-fin')).toBeVisible({ timeout: 6000 });
  await expect(page.locator('.minijeu-fin')).toContainText('4 lettres « b » trouvées');
  await expect(page.locator('.minijeu-fin')).toContainText('Nouveau record'); // 4 > 2 (record du serveur)
  const envoi = (await page.evaluate(() => window.__appels)).filter((a) => a[0] === 'enregistrer_reperes');
  expect(envoi).toHaveLength(1);
  expect(envoi[0][1]).toMatchObject({ p_score: 4, p_erreurs: 1, p_lettre: 'b', p_casse: 'min', p_style: 'cur' });
});

test('Chasse aux lettres : le record du serveur (30) n\'est pas battu par un score de 1 ; base injoignable = record de l\'appareil', async ({ page }) => {
  await ouvrir(page, { duree: 2, delai: 30, compte: 0 }, brancherBase(page, 30));
  await jouer(page, 'm', 'maj', 'imp');
  await page.evaluate(() => window.MJReperes.courant().slots.filter((s) => s.occ && s.data.cible)[0].el.click());
  await expect(page.locator('.minijeu-fin')).toBeVisible({ timeout: 6000 });
  await expect(page.locator('.minijeu-fin')).toContainText('Ton record : 30');
  await expect(page.locator('.minijeu-fin')).not.toContainText('Nouveau record');
});

test('Chasse aux lettres : sans connexion à la base (réponse nulle), la partie se termine et le record de l\'appareil sert', async ({ page }) => {
  await ouvrir(page, { duree: 2, delai: 30, compte: 0 }, brancherBase(page, null));
  await jouer(page, 'n', 'maj', 'imp');
  for (let k = 0; k < 2; k++) await page.evaluate(() => window.MJReperes.courant().slots.filter((s) => s.occ && s.data.cible)[0].el.click());
  await expect(page.locator('.minijeu-fin')).toBeVisible({ timeout: 6000 });
  await expect(page.locator('.minijeu-fin')).toContainText('2 lettres « N » trouvées');
  await expect(page.locator('.minijeu-fin')).toContainText('Nouveau record');
  await page.locator('#minijeu-rejouer').click();
  await expect(page.locator('.rep-record')).toContainText('2 lettres');
});

test('Chasse aux lettres : l\'écran de fin propose « Retour à l\'accueil » (comme tous les mini-jeux) @smoke', async ({ page }) => {
  await ouvrir(page, { duree: 1, delai: 30, compte: 0 });
  await jouer(page, 'm', 'maj', 'imp');
  await expect(page.locator('.minijeu-fin')).toBeVisible({ timeout: 6000 });
  await expect(page.locator('#minijeu-accueil')).toHaveText('Retour à l\'accueil');
  await expect(page.locator('#minijeu-accueil')).toBeVisible();
  expect(await debordements(page)).toEqual([]);
  await page.locator('#minijeu-accueil').click();
  await expect(page.locator('#ecran-accueil')).toBeVisible();
  expect(await page.evaluate(() => window.MJReperes.courant())).toBeNull();
});

test('Chasse aux lettres : fin au bout du temps ; un score plus bas ne bat pas le record ; erreurs comptées', async ({ page }) => {
  await ouvrir(page, { duree: 2, delai: 30, compte: 0 });
  await jouer(page, 'd', 'min', 'imp');
  // 3 bonnes, 2 mauvaises, puis le temps passe.
  for (let k = 0; k < 3; k++) await page.evaluate(() => window.MJReperes.courant().slots.filter((s) => s.occ && s.data.cible)[0].el.click());
  for (let k = 0; k < 2; k++) await page.evaluate(() => window.MJReperes.courant().slots.filter((s) => s.occ && !s.data.cible)[0].el.click());
  await expect(page.locator('.minijeu-fin')).toBeVisible({ timeout: 6000 });
  await expect(page.locator('.minijeu-fin')).toContainText('3 lettres « d » trouvées');
  await expect(page.locator('.minijeu-fin')).toContainText('2 erreurs');
  // Deuxième partie, 1 seule bonne réponse : le record (3) est gardé.
  await page.locator('#minijeu-rejouer').click();
  await expect(page.locator('.rep-record')).toContainText('3 lettres');
  await page.locator('.rep-jouer').click();
  await expect(page.locator('.rep-let:not(.rep-vide)')).toHaveCount(13);
  await page.evaluate(() => window.MJReperes.courant().slots.filter((s) => s.occ && s.data.cible)[0].el.click());
  await expect(page.locator('.minijeu-fin')).toBeVisible({ timeout: 6000 });
  await expect(page.locator('.minijeu-fin')).toContainText('Ton record : 3');
  await expect(page.locator('.minijeu-fin')).not.toContainText('Nouveau record');
});

test('Chasse aux lettres : « Au hasard » choisit une lettre ; quitter en cours de partie n\'enregistre rien', async ({ page }) => {
  await ouvrir(page, { duree: 60, delai: 30, compte: 0 });
  await page.locator('.rep-hasard').click();
  await page.locator('.rep-jouer').click();
  await expect(page.locator('.rep-let:not(.rep-vide)')).toHaveCount(13);
  const base = (await etat(page)).base;
  expect(base).toMatch(/^[a-z]$/);
  await page.locator('#minijeu-retour').click();
  await expect(page.locator('#ecran-minijeux')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('ludoaventura-mj-reperes-records-v1'))).toBeNull();
  expect(await page.evaluate(() => window.MJReperes.courant())).toBeNull();
});

test('Chasse aux lettres : le décompte 3, 2, 1 précède le départ (la minute ne commence qu\'après)', async ({ page }) => {
  await ouvrir(page, { duree: 60, delai: 2, compte: 2 });
  await page.locator('.rep-jouer').click();
  await expect(page.locator('.rep-depart')).toBeVisible();
  await expect(page.locator('.rep-let:not(.rep-vide)')).toHaveCount(0);
  await expect(page.locator('.rep-let:not(.rep-vide)')).toHaveCount(13, { timeout: 4000 });
  await expect(page.locator('.rep-depart')).toHaveCount(0);
});

test('Chasse aux lettres : les sosies (b/d, m/n…) forment la majorité des lettres non demandées', async ({ page }) => {
  await ouvrir(page);
  const r = await page.evaluate(() => {
    const M = window.MJReperes; let sos = 0, tot = 0; const s = M.sosies('b');
    for (let i = 0; i < 3000; i++) { const x = M.nouvelle('b', 'min', false); tot++; if (s.indexOf(x.l) >= 0) sos++; if (x.cible || x.l === 'b') return { erreur: true }; }
    return { part: sos / tot, sosB: s.join(''), sosM: M.sosies('m').join('') };
  });
  expect(r.erreur).toBeUndefined();
  expect(r.part).toBeGreaterThan(0.6);
  expect(r.sosB).toContain('d'); expect(r.sosB).toContain('p'); expect(r.sosB).toContain('q');
  expect(r.sosM).toContain('n'); expect(r.sosM).toContain('w');
});
