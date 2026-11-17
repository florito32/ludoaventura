// Baby jeux (v9.1, demande du 16/11/2026, backlog lignes 355 à 362 ; v9.2 : lignes 368 à 372) : bouton de l'accueil, réglages,
// 20 petits jeux de lettres et de chiffres joués sur le plateau comme une partie rapide.
const { test, expect } = require('@playwright/test');
const B = require('../js/baby.js');
const { rapide } = require('./aide');

test.describe('contenu des baby jeux', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('20 jeux, 10 de lettres et 10 de chiffres, tous jouables et justes avec la bonne réponse', () => {
    expect(B.JEUX).toHaveLength(20);
    expect(B.JEUX.filter((j) => j.cat === 'lettres')).toHaveLength(10);
    expect(B.JEUX.filter((j) => j.cat === 'chiffres')).toHaveLength(10);
    const reglages = [{}, { lettres: ['A', 'B'], chiffres: [3], ecriture: 'min' }, { lettres: ['Z'], chiffres: [10, 1], ecriture: 'deux' }];
    for (const id of B.IDS) {
      for (const reg of reglages) {
        for (let k = 0; k < 60; k++) {
          const c = B.generer(id, reg);
          if (!c) continue;
          expect(c.module).toBe('baby');
          expect(c.consigne).toBeTruthy();
          expect(c.oral).toBeTruthy();
          if (c.meca === 'choix') {
            expect(new Set(c.choix).size).toBe(c.choix.length);
            expect(c.choix).toContain(c.bonne);
            expect(B.juste(c, c.bonne)).toBe(true);
            expect(B.juste(c, c.choix.find((x) => x !== c.bonne))).toBe(false);
          }
          if (c.meca === 'relier') expect(B.juste(c, c.bonnes)).toBe(true);
          if (c.meca === 'ordre') expect(B.juste(c, c.bon)).toBe(true);
          if (c.meca === 'trier') expect(B.juste(c, c.bonnes)).toBe(true);
          if (c.jetons) expect(c.jetons.length).toBeLessThanOrEqual(12);
          expect(B.solution(c)).toBeTruthy();
        }
      }
    }
  });

  // v10.5 (demande du 17/11/2026) : la lettre, la syllabe ou le son à trouver est dit seul (phrase à part, lue lentement),
  // sinon la voix le noie dans la consigne.
  test('J’entends la lettre, Les syllabes, Un son : la cible est isolée dans la lecture à voix haute', () => {
    const V = require('../js/voix.js');
    for (const id of ['entends-lettre', 'syllabes', 'son-ecritures']) {
      for (let k = 0; k < 30; k++) {
        const c = B.generer(id, {});
        const morceaux = V.preparer(c.oral);
        const cible = id === 'son-ecritures' ? c.son : c.bonne.toLowerCase();
        const seuls = morceaux.filter((m) => m.texte.replace(/[.!?…,\s]/g, '').toLowerCase() === cible);
        expect(seuls.length, `${id} : « ${c.oral} » doit dire « ${cible} » dans un morceau à part`).toBeGreaterThanOrEqual(1);
        for (const m of seuls) expect(m.vitesse).toBeLessThan(0.8); // lecture lente
      }
    }
  });

  test('chiffres : les questions portent sur les chiffres choisis, les mauvaises réponses sont les autres', () => {
    const reg = { chiffres: [2, 5] };
    for (let k = 0; k < 300; k++) {
      for (const id of ['compter', 'doigts', 'entends-chiffre', 'chiffre-manque', 'attrape-chiffre']) {
        const c = B.generer(id, reg);
        const bonne = Number(c.bonne || c.points);
        expect([2, 5]).toContain(bonne);
        if (c.choix) for (const x of c.choix) if (x !== c.bonne) expect([2, 5]).not.toContain(Number(x));
        if (c.jetons) for (const j of c.jetons) expect(j.bon).toBe(j.t === String(bonne));
      }
      // J’en ajoute : on part d'un chiffre choisi (même seul : 1 convient), on ajoute 1 à 3.
      const e = B.generer('encore-un', reg);
      expect([2, 5]).toContain(e.avant);
      expect([1, 2, 3]).toContain(e.ajout);
      expect(e.bonne).toBe(String(e.avant + e.ajout));
      expect(e.choix).toHaveLength(3);
      expect(new Set(e.choix).size).toBe(3);
      for (const x of e.choix) expect(Number(x)).toBeGreaterThanOrEqual(1);
    }
    expect(B.generer('encore-un', { chiffres: [1] }).avant).toBe(1);
  });

  test('J’en ajoute : phrase naturelle (« Tu as 5 pommes… »), accords et vérité du calcul', () => {
    const vus = new Set();
    for (let k = 0; k < 400; k++) {
      const c = B.generer('encore-un', { chiffres: [1, 5, 10] });
      vus.add(c.avant + '+' + c.ajout);
      expect(c.consigne).toMatch(/^Tu as \d+ \S+\. Tu en reçois [123] de plus\. Combien d(e |’)\S+ as-tu maintenant \?$/);
      expect(c.consigne).not.toMatch(/Il y en a|encore un arrive/);
      expect(c.oral).toMatch(/^Tu as (un|une|[a-zé]+) \S+\. Tu en reçois (un|une|deux|trois) de plus\./);
      const nom = c.consigne.split(' ')[3].replace('.', '');
      if (c.avant === 1) expect(nom).not.toMatch(/s$/); // singulier : « 1 pomme »
      else expect(nom).toMatch(/s$/); // pluriel : « 5 pommes »
      expect(B.juste(c, String(c.avant + c.ajout))).toBe(true);
    }
    // 3 départs × 3 ajouts : tout sort.
    expect(vus.size).toBe(9);
  });

  test('lettres : lettres choisies et écriture (majuscules, minuscules, les deux)', () => {
    for (let k = 0; k < 200; k++) {
      const maj = B.generer('entends-lettre', { lettres: ['M'], ecriture: 'maj' });
      expect(maj.bonne).toBe('M');
      const min = B.generer('lettre-manque', { lettres: ['M'], ecriture: 'min' });
      expect(min.bonne).toBe('m');
      for (const x of min.choix) expect(x).toBe(x.toLowerCase());
      const deux = B.generer('attrape-lettre', { lettres: ['B'], ecriture: 'deux' });
      expect(deux.modele).toBe('B b');
      expect(deux.jetons.filter((j) => j.bon).map((j) => j.t).sort()).toEqual(['B', 'B', 'b', 'b']);
      // I et l ne sont jamais mélangés.
      const l = B.generer('attrape-lettre', { lettres: ['L'], ecriture: 'min' });
      expect(l.jetons.some((j) => j.t.toUpperCase() === 'I')).toBe(false);
    }
    // « Un son, des écritures » : le son « in » s'écrit aussi UN et AIN (demande de l'utilisateur).
    expect(B.SONS.find((s) => s.son === 'in').ecritures).toEqual(expect.arrayContaining(['IN', 'AIN', 'UN']));
  });

  test('attrape : juste avec au plus 1 erreur (choix de l’utilisateur) ; fabrique : toujours juste', () => {
    const c = B.generer('attrape-chiffre', {});
    c.erreurs = 1; expect(B.juste(c, 1)).toBe(true);
    c.erreurs = 2; expect(B.juste(c, 2)).toBe(false);
    expect(B.juste(B.generer('fabrique', {}), 'BLA')).toBe(true);
  });

  test('carte : seulement les catégories et les jeux cochés', () => {
    for (let k = 0; k < 300; k++) {
      expect(B.carte({ categories: ['chiffres'] }).cat).toBe('chiffres');
      expect(['alphabet', 'bulles']).toContain(B.carte({ jeux: ['alphabet', 'bulles'] }).jeu);
    }
  });
});

// Résout la carte affichée en touchant les bonnes réponses, comme un enfant.
async function resoudre(page) {
  const c = await page.evaluate(() => window.Aventura.partie.carte);
  const boite = page.locator('#carte-gram');
  if (c.meca === 'choix') await boite.locator('.gram-bouton[data-v="' + c.bonne + '"]').click();
  else if (c.meca === 'attrape') {
    for (let i = 0; i < c.jetons.length; i++) if (c.jetons[i].bon) await boite.locator('.baby-jeton[data-j="' + i + '"]').click();
  } else if (c.meca === 'bulles') {
    for (const v of c.bon) await boite.locator('.baby-jeton', { hasText: new RegExp('^' + v + '$') }).click();
  } else if (c.meca === 'ordre') {
    for (const v of c.bon) await boite.locator('.baby-tuile[data-o="' + c.elements.indexOf(v) + '"]').click();
  } else if (c.meca === 'trier') {
    for (let i = 0; i < c.elements.length; i++) {
      await boite.locator('.baby-tuile[data-t="' + i + '"]').click();
      await boite.locator('.baby-panier-tete[data-col="' + c.bonnes[i] + '"]').click();
    }
  } else if (c.meca === 'relier') {
    for (let g = 0; g < c.gauche.length; g++) {
      await boite.locator('[data-cote="g"][data-i="' + g + '"]').click();
      await boite.locator('[data-cote="d"][data-i="' + c.bonnes[g] + '"]').click();
    }
  } else if (c.meca === 'fabrique') {
    await boite.locator('.baby-touche', { hasText: /^B$/i }).first().click();
    await boite.locator('.baby-touche', { hasText: /^OU$/i }).first().click();
    await expect(boite.getByRole('button', { name: 'J’ai fini' })).toBeDisabled(); // il faut d'abord lire le mot
    await boite.getByRole('button', { name: 'Lire' }).click();
    await boite.getByRole('button', { name: 'J’ai fini' }).click();
  }
}

async function ouvrirBaby(page, choix) {
  await rapide(page);
  await page.emulateMedia({ reducedMotion: 'reduce' }); // jetons immobiles : on peut les toucher sans attendre
  await page.addInitScript((ch) => {
    try { localStorage.setItem('ludo-vu', '1'); if (ch) localStorage.setItem('ludoaventura-baby-choix', JSON.stringify(ch)); } catch (e) { /* */ }
  }, choix || null);
  await page.goto('./');
  await page.getByRole('button', { name: 'Baby jeux' }).click();
  await expect(page.getByRole('heading', { name: 'Baby jeux' })).toBeVisible();
}

// Rien ne dépasse et rien n'est caché sous le bas de l'écran : la page ne défile pas (v9.2).
async function tientSurUnEcran(page) {
  return page.evaluate(() => {
    const h = window.innerHeight, w = window.innerWidth, out = [];
    if (document.documentElement.scrollHeight > h + 1) out.push('page haute : ' + document.documentElement.scrollHeight + ' > ' + h);
    if (document.documentElement.scrollWidth > w + 1) out.push('page large');
    const cadre = document.querySelector('#baby-corps .baby-reglages').getBoundingClientRect();
    document.querySelectorAll('#ecran-baby button, #ecran-baby label').forEach((e) => {
      const r = e.getBoundingClientRect(), dedans = !e.closest('.baby-reglages') || (r.bottom <= cadre.bottom + 1 && r.right <= cadre.right + 1);
      if (r.width && (r.bottom > h + 1 || r.right > w + 1 || !dedans)) out.push((e.id || e.textContent.trim()).slice(0, 20) + ' en dehors');
    });
    return out.slice(0, 5);
  });
}

test('Baby jeux, page 1 : Lettres OU Chiffres, écriture, lettres ou chiffres ; page 2 : les jeux ; tout tient sur un écran @smoke', async ({ page }) => {
  await ouvrirBaby(page);
  // Lettres ou Chiffres : boutons radio, un seul choix possible.
  await expect(page.locator('input[name="baby-cat"]')).toHaveCount(2);
  await expect(page.locator('input[name="baby-cat"][type="radio"]')).toHaveCount(2);
  await expect(page.getByRole('radio', { name: /Lettres/ })).toBeChecked();
  await expect(page.locator('input[name="baby-ecriture"]')).toHaveCount(3);
  await expect(page.locator('input[name="baby-lettre"]')).toHaveCount(26);
  await expect(page.locator('input[name="baby-chiffre"]')).toHaveCount(0);
  await expect(page.locator('input[name="baby-jeu"]')).toHaveCount(0);
  expect(await tientSurUnEcran(page)).toEqual([]);
  // Les lettres s'affichent dans l'écriture choisie.
  await page.getByRole('radio', { name: 'Les deux' }).check();
  await expect(page.locator('.baby-grille.lettres .pack').first()).toHaveText('A a');
  expect(await tientSurUnEcran(page)).toEqual([]);
  // Chiffres : l'écriture et les lettres disparaissent, les chiffres 1 à 10 apparaissent.
  await page.getByRole('radio', { name: /Chiffres/ }).check();
  await expect(page.getByRole('radio', { name: /Lettres/ })).not.toBeChecked();
  await expect(page.locator('input[name="baby-ecriture"]')).toHaveCount(0);
  await expect(page.locator('input[name="baby-lettre"]')).toHaveCount(0);
  await expect(page.locator('input[name="baby-chiffre"]')).toHaveCount(10);
  expect(await tientSurUnEcran(page)).toEqual([]);
  // Aucun chiffre : on ne passe pas aux jeux.
  await page.locator('[data-tout="chiffres"]').click();
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  await expect(page.locator('#baby-alerte')).toHaveText('Choisis au moins un chiffre.');
  await page.locator('input[name="baby-chiffre"][value="2"]').check();
  await page.locator('input[name="baby-chiffre"][value="3"]').check();
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  // Page 2 : les 10 jeux de chiffres seulement.
  await expect(page.locator('input[name="baby-jeu"]')).toHaveCount(10);
  await expect(page.getByRole('checkbox', { name: /Attrape le chiffre/ })).toBeVisible();
  expect(await tientSurUnEcran(page)).toEqual([]);
  // Retour à la page 1 et de nouveau la page 2.
  await page.getByRole('button', { name: 'Chiffres', exact: false }).filter({ hasText: '←' }).click();
  await expect(page.locator('input[name="baby-chiffre"]')).toHaveCount(10);
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.getByRole('heading', { name: 'Baby jeux' })).toBeVisible();
  const p = await page.evaluate(() => ({ nb: window.Aventura.partie.joueurs.length, baby: window.Aventura.partie.rapide.baby, diff: window.Aventura.partie.aventure.difficulte }));
  expect(p.nb).toBe(1);
  expect(p.diff).toBe('facile');
  expect(p.baby.categories).toEqual(['chiffres']);
  expect(p.baby.chiffres).toEqual([2, 3]);
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await expect(page.locator('#carte-piochee')).toBeVisible();
  expect(await page.evaluate(() => window.Aventura.partie.carte.cat)).toBe('chiffres');
  // Recharger reprend la partie en Baby jeux.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Baby jeux' })).toBeVisible();
  expect((await page.evaluate(() => window.Aventura.partie.rapide.baby)).chiffres).toEqual([2, 3]);
});

// « Modifier les choix » en cours de partie (v9.2) : retour aux réglages de Baby jeux, pas à la préparation de l'aventure.
test('Baby jeux : « Modifier les choix » revient aux réglages Baby jeux, puis « Reprendre la partie » garde l’aventure et les points', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur' && test.info().project.name !== 'telephone', 'deux formats suffisent');
  await ouvrirBaby(page, { categories: ['lettres'], lettres: ['A', 'B'], ecriture: 'maj' });
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.getByRole('button', { name: /^(Première question|Question suivante)$/ })).toBeVisible();
  const avant = await page.evaluate(() => { const p = window.Aventura.partie; p.regles.points = 7; return { av: p.aventure.id, perso: p.choix[0] }; });
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Modifier les choix' }).click();
  await expect(page.locator('#ecran-baby')).toBeVisible();
  await expect(page.locator('#ecran-preparation')).toBeHidden();
  await expect(page.getByRole('radio', { name: /Lettres/ })).toBeChecked();
  await expect(page.locator('input[name="baby-lettre"]:checked')).toHaveCount(2);
  await expect(page.locator('#ecran-baby .btn-retour')).toHaveText(/Partie/);
  // « ← Partie » : retour au plateau, la carte est toujours là.
  await page.locator('#ecran-baby .btn-retour').click();
  await expect(page.locator('#ecran-plateau')).toBeVisible();
  await expect(page.getByRole('button', { name: /^(Première question|Question suivante)$/ })).toBeVisible();
  // De nouveau : on passe aux chiffres, et on reprend.
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Modifier les choix' }).click();
  await page.getByRole('radio', { name: /Chiffres/ }).check();
  // Un rechargement pendant la modification garde la partie.
  await page.reload();
  await expect(page.locator('#ecran-baby')).toBeVisible();
  await expect(page.locator('#ecran-baby .btn-retour')).toHaveText(/Partie/);
  await page.getByRole('radio', { name: /Chiffres/ }).check();
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  await page.getByRole('button', { name: 'Reprendre la partie' }).click();
  await expect(page.locator('#ecran-plateau')).toBeVisible();
  const apres = await page.evaluate(() => { const p = window.Aventura.partie; return { av: p.aventure.id, perso: p.choix[0], pts: p.regles.points, cat: p.rapide.baby.categories, modif: p.modif }; });
  expect(apres).toEqual({ av: avant.av, perso: avant.perso, pts: 7, cat: ['chiffres'], modif: false });
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  expect(await page.evaluate(() => window.Aventura.partie.carte.cat)).toBe('chiffres');
});

test('les 20 baby jeux se jouent au toucher, sans déborder, et la bonne réponse donne le dé FORT', async ({ page }) => {
  test.setTimeout(240000);
  await ouvrirBaby(page);
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await expect(page.getByRole('heading', { name: 'Baby jeux' })).toBeVisible();
  for (const id of B.IDS) {
    const suivante = page.getByRole('button', { name: /^(Première question|Question suivante)$/ });
    await expect(page.locator('#fin').or(suivante).first()).toBeVisible();
    if (await page.locator('#fin').isVisible()) await page.getByRole('button', { name: 'Recommencer la partie' }).click();
    await page.evaluate(([x, k]) => { const b = window.Aventura.partie.rapide.baby; b.jeux = [x]; b.categories = [k]; }, [id, B.jeu(id).cat]);
    await suivante.click();
    await expect(page.locator('#carte-gram .baby')).toBeVisible();
    expect(await page.evaluate(() => window.Aventura.partie.carte.jeu)).toBe(id);
    // Rien ne dépasse : ni la page, ni la carte.
    const deborde = await page.evaluate(() => {
      const b = document.getElementById('carte-gram');
      const out = [];
      if (document.documentElement.scrollWidth > window.innerWidth) out.push('page');
      b.querySelectorAll('.baby *').forEach((e) => {
        const r = e.getBoundingClientRect(), z = b.getBoundingClientRect();
        if (r.width && (r.left < z.left - 2 || r.right > z.right + 2) && !e.closest('.baby-arene')) out.push(e.className.baseVal || e.className);
      });
      return out.slice(0, 5);
    });
    expect(deborde, id).toEqual([]);
    await resoudre(page);
    await page.waitForFunction(() => window.Aventura.partie.regles.etape === 'lancer');
    const c = await page.evaluate(() => window.Aventura.partie.carte);
    expect(c.juste, id).toBe(true);
    await expect(page.locator('#carte-reponse')).toContainText('Bravo !');
    await page.evaluate(() => window.Aventura.lancerDe());
  }
});

test('attrape la lettre : une mauvaise lettre se grise ; 2 erreurs → dé FAIBLE après « J’ai compris »', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur' && test.info().project.name !== 'telephone', 'deux formats suffisent');
  await ouvrirBaby(page, { categories: ['lettres'], lettres: ['L'], ecriture: 'maj', jeux: ['attrape-lettre'] });
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  const c = await page.evaluate(() => window.Aventura.partie.carte);
  expect(c.modele).toBe('L');
  const mauvais = c.jetons.map((j, i) => (j.bon ? -1 : i)).filter((i) => i >= 0).slice(0, 2);
  for (const i of mauvais) await page.locator('.baby-jeton[data-j="' + i + '"]').click();
  await expect(page.locator('.baby-jeton.rate')).toHaveCount(2);
  await expect(page.locator('.baby-compte')).toContainText('2 erreurs');
  for (let i = 0; i < c.jetons.length; i++) if (c.jetons[i].bon) await page.locator('.baby-jeton[data-j="' + i + '"]').click();
  await expect(page.locator('#carte-reponse')).toContainText('Presque !');
  expect(await page.evaluate(() => window.Aventura.partie.carte.juste)).toBe(false);
});

test('les jetons se baladent (animation) quand l’appareil n’a pas demandé moins d’animations', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'un format suffit');
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); localStorage.setItem('ludoaventura-baby-choix', JSON.stringify({ categories: ['chiffres'], jeux: ['attrape-chiffre'] })); } catch (e) { /* */ } });
  await page.goto('./');
  await page.getByRole('button', { name: 'Baby jeux' }).click();
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await expect(page.locator('.baby-modele .baby-de').first()).toBeVisible(); // le dé classique
  const anim = await page.locator('.baby-jeton').first().evaluate((e) => getComputedStyle(e).animationName);
  expect(anim).toBe('baby-balade');
});

// v10.8 (demande du 17/11/2026) : « La lettre qui manque » et « Le chiffre qui manque » — on ne comprenait pas sur quoi toucher.
// La suite (en haut) est à plat, non cliquable ; les réponses (en bas) sont des boutons en relief ; une ligne pointillée et
// « Touche ta réponse » les séparent, comme dans « Remettre la phrase ».
for (const id of ['lettre-manque', 'chiffre-manque']) {
  test('« ' + id + ' » : la suite et les boutons de réponse se distinguent nettement, sans déborder', async ({ page }) => {
    await ouvrirBaby(page);
    await page.getByRole('button', { name: 'Choisir les jeux' }).click();
    await page.getByRole('button', { name: 'Lancer la partie' }).click();
    await page.evaluate(([x, k]) => { const b = window.Aventura.partie.rapide.baby; b.jeux = [x]; b.categories = [k]; }, [id, B.jeu(id).cat]);
    await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
    const boite = page.locator('#carte-gram');
    await expect(boite.locator('.baby-suite')).toBeVisible();
    await expect(boite.locator('.baby-invite')).toContainText('Touche ta réponse');
    const m = await page.evaluate(() => {
      const q = (s) => document.querySelector('#carte-gram ' + s), r = (e) => e.getBoundingClientRect();
      const cs = (e) => getComputedStyle(e);
      return {
        casesBoutons: document.querySelectorAll('#carte-gram .baby-case button').length,
        ombreCase: cs(q('.baby-case')).boxShadow, ombreTrou: cs(q('.baby-case.trou')).boxShadow, ombreBouton: cs(q('.gram-bouton')).boxShadow,
        curseurCase: cs(q('.baby-case')).cursor,
        bas: r(q('.baby-suite')).bottom, invite: r(q('.baby-invite')), haut: r(q('.gram-choix')).top,
        large: document.documentElement.scrollWidth - window.innerWidth,
      };
    });
    expect(m.casesBoutons).toBe(0);
    expect(m.ombreCase).toBe('none');
    expect(m.ombreTrou).toBe('none');
    expect(m.ombreBouton).not.toBe('none');
    expect(m.curseurCase).toBe('default');
    expect(m.invite.top).toBeGreaterThanOrEqual(m.bas);       // la suite est au-dessus de l'invite…
    expect(m.haut).toBeGreaterThanOrEqual(m.invite.bottom);   // …qui est au-dessus des boutons
    expect(m.large).toBeLessThanOrEqual(0);
    // Toucher la bonne réponse marche toujours et l'invite disparaît.
    await resoudre(page);
    await expect(page.locator('#carte-reponse')).toContainText('Bravo !');
    await expect(boite.locator('.baby-invite')).toHaveCount(0);
  });
}

// « J’en ajoute » (v10.9, demande du 17/11/2026) : phrase claire, objets du départ + objets ajoutés, rien ne déborde (cas le plus chargé : 10 + 3).
test('J’en ajoute : la carte dit « Tu as 10 … Tu en reçois N de plus », montre les objets, tient sur tous les écrans', async ({ page }) => {
  await ouvrirBaby(page, { categories: ['chiffres'], chiffres: [10], jeux: ['encore-un'] });
  await page.getByRole('button', { name: 'Choisir les jeux' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  const carte = page.locator('#carte-piochee');
  await expect(carte).toBeVisible();
  const c = await page.evaluate(() => window.Aventura.partie.carte);
  expect(c.jeu).toBe('encore-un');
  expect(c.avant).toBe(10);
  await expect(carte).toContainText('Tu as 10 ');
  await expect(carte).toContainText('Tu en reçois ' + c.ajout + ' de plus');
  await expect(carte).not.toContainText('encore un arrive');
  // 10 objets au départ + les objets reçus.
  await expect(carte.locator('.baby-objets:not(.arrive) > span')).toHaveCount(10);
  await expect(carte.locator('.baby-objets.arrive > span')).toHaveCount(c.ajout);
  // Rien ne déborde de l'écran.
  const deborde = await page.evaluate(() => {
    const w = window.innerWidth, h = window.innerHeight, out = [];
    if (document.documentElement.scrollWidth > w + 1) out.push('page large');
    document.querySelectorAll('#carte-piochee .baby-objets, #carte-piochee button').forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.width && (r.right > w + 1 || r.left < -1 || r.bottom > h + 1)) out.push((e.className || e.textContent).toString().slice(0, 20));
    });
    return out;
  });
  expect(deborde).toEqual([]);
  // La bonne réponse est juste, une mauvaise non.
  await carte.getByRole('button', { name: c.bonne, exact: true }).click();
  await expect(page.locator('#carte-piochee')).toContainText(/Bravo|Bien joué|juste|Super/i);
});
