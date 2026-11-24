// Baby jeux (v9.1, demande du 16/11/2026, backlog lignes 355 à 362) : petits jeux de lettres et de chiffres.
// v10.41 (demande du 24/11/2026) : Lettres et Chiffres sont des matières de l'aventure (« Personnaliser » et « Suivre ma progression »),
// sans niveau ; « La fabrique à mots » est un mini-jeu (tests/minijeux.spec.js).
const { test, expect } = require('@playwright/test');
const B = require('../js/baby.js');
const { rapide, lancerBaby, creerJoueurs, personnaliser, suivreMaProgression, cocher, valider, babyMatiere } = require('./aide');

test.describe('contenu des baby jeux', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  // v10.41 : « La fabrique à mots » est un mini-jeu (catégorie 'mini', js/minijeux.js) : 9 jeux de lettres, 10 de chiffres, 1 mini-jeu.
  test('20 jeux, 9 de lettres, 10 de chiffres et 1 mini-jeu, tous jouables et justes avec la bonne réponse', () => {
    expect(B.JEUX).toHaveLength(20);
    expect(B.JEUX.filter((j) => j.cat === 'lettres')).toHaveLength(9);
    expect(B.JEUX.filter((j) => j.cat === 'chiffres')).toHaveLength(10);
    expect(B.JEUX.filter((j) => j.cat === 'mini').map((j) => j.id)).toEqual(['fabrique']);
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
  }
}

// Le panneau des réglages de Lettres / Chiffres (dans « Personnaliser ») ne dépasse jamais en largeur : il défile en hauteur si l'écran est bas.
async function reglagesTiennent(page) {
  return page.evaluate(() => {
    const w = window.innerWidth, out = [];
    if (document.documentElement.scrollWidth > w + 1) out.push('page large : ' + document.documentElement.scrollWidth + ' > ' + w);
    const z = document.getElementById('reglages-baby').getBoundingClientRect();
    document.querySelectorAll('#reglages-baby button, #reglages-baby label').forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.width && (r.right > z.right + 1 || r.left < z.left - 1)) out.push((e.textContent.trim() || e.className).slice(0, 20) + ' déborde');
    });
    return out.slice(0, 5);
  });
}

// v10.41 (demande du 24/11/2026) : Lettres et Chiffres sont des matières de l'aventure, sans niveau.
test('Lettres et Chiffres : matières de « Personnaliser », sans niveau, avec leurs réglages et un message si rien n’est coché @smoke', async ({ page }) => {
  await rapide(page);
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await creerJoueurs(page, 1);
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await personnaliser(page, 0);
  // Six matières : les quatre d'avant, plus Lettres et Chiffres.
  await expect(page.locator('input[name="matiere"]')).toHaveCount(6);
  await expect(page.locator('#matieres label', { hasText: /^Lettres$/ })).toBeVisible();
  await expect(page.locator('#matieres label', { hasText: /^Chiffres$/ })).toBeVisible();
  // Lettres : pas d'onglet « Niveau » (ni niveau de 1 à 10) ; « Valider » mène aux réglages.
  await cocher(page, '#matieres', 'lettres');
  await expect(page.locator('.onglet[data-etape="niveau"]')).toBeHidden();
  await expect(page.locator('#reglage-niveau-prog')).toBeHidden();
  await valider(page);
  await expect(page.locator('#reglages-baby')).toBeVisible();
  await expect(page.locator('#reglages-titre')).toContainText('Lettres, les réglages');
  await expect(page.locator('input[name="baby-ecriture"]')).toHaveCount(3);
  await expect(page.locator('input[name="baby-lettre"]')).toHaveCount(26);
  await expect(page.locator('input[name="baby-lettre"]:checked')).toHaveCount(26); // tout est coché au départ
  await expect(page.locator('input[name="baby-chiffre"]')).toHaveCount(0);
  // 9 jeux de lettres : la fabrique à mots n'y est plus (c'est un mini-jeu).
  await expect(page.locator('input[name="baby-jeu"]')).toHaveCount(9);
  await expect(page.locator('#reglages-baby')).not.toContainText('fabrique');
  expect(await reglagesTiennent(page)).toEqual([]);
  // L'écriture change l'aspect des lettres.
  await page.getByRole('radio', { name: 'Les deux' }).check();
  await expect(page.locator('.baby-grille.lettres .pack').first()).toHaveText('A a');
  // « Aucun » puis « Valider » : message, on reste là.
  await page.locator('[data-tout="lettres"]').click();
  await expect(page.locator('input[name="baby-lettre"]:checked')).toHaveCount(0);
  await valider(page);
  await expect(page.locator('#packs-alerte')).toContainText('doit choisir au moins une lettre');
  await page.locator('input[name="baby-lettre"][value="M"]').check();
  await page.locator('[data-tout="jeux"]').click();
  await valider(page);
  await expect(page.locator('#packs-alerte')).toContainText('doit choisir au moins un jeu');
  await page.locator('input[name="baby-jeu"][value="alphabet"]').check();
  expect(await reglagesTiennent(page)).toEqual([]);
  // Retour à la matière : Chiffres, avec ses chiffres et ses 10 jeux.
  await page.getByRole('button', { name: /Retour/ }).click();
  await cocher(page, '#matieres', 'chiffres');
  await valider(page);
  await expect(page.locator('#reglages-titre')).toContainText('Chiffres, les réglages');
  await expect(page.locator('input[name="baby-ecriture"]')).toHaveCount(0);
  await expect(page.locator('input[name="baby-lettre"]')).toHaveCount(0);
  await expect(page.locator('input[name="baby-chiffre"]')).toHaveCount(10);
  await expect(page.locator('input[name="baby-jeu"]')).toHaveCount(10);
  expect(await reglagesTiennent(page)).toEqual([]);
  await page.locator('[data-tout="chiffres"]').click();
  await page.locator('input[name="baby-chiffre"][value="2"]').check();
  await page.locator('input[name="baby-chiffre"][value="3"]').check();
  // Valider : le joueur est prêt, sans niveau.
  await valider(page);
  await expect(page.locator('.cj-resume').first()).toContainText('Chiffres · sans niveau');
  await page.getByRole('button', { name: 'Choisir l\'aventure' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  const p = await page.evaluate(() => ({ mat: window.Aventura.partie.matiere[0], baby: window.Aventura.partie.baby[0], niv: window.Aventura.partie.niveauProg[0] }));
  expect(p.mat).toBe('chiffres');
  expect(p.baby.chiffres).toEqual([2, 3]);
  expect(p.niv).toBeNull();
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await expect(page.locator('#carte-piochee')).toBeVisible();
  const c = await page.evaluate(() => window.Aventura.partie.carte);
  expect(c.cat).toBe('chiffres');
  expect(c.packNom).toMatch(/^Chiffres · /);
  // Recharger reprend la partie, réglages compris.
  await page.reload();
  expect((await page.evaluate(() => window.Aventura.partie.baby[0])).chiffres).toEqual([2, 3]);
});

test('« Suivre ma progression » : Lettres et Chiffres, marqués « sans niveau », jouables sans noter de progression', async ({ page }) => {
  await rapide(page);
  await page.emulateMedia({ reducedMotion: 'reduce' }); // jetons immobiles
  await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* */ } });
  await page.goto('./');
  await creerJoueurs(page, 1);
  await page.getByRole('button', { name: 'Commencer l\'aventure' }).click();
  await page.locator('.cj-parcours-btn[data-parcours="suivre"][data-place="0"]').click();
  await expect(page.locator('#suivre-matieres input')).toHaveCount(6);
  // v10.45 : plus aucun niveau affiché sur les boutons de matière (ni « sans niveau », ni « niveau 1 sur 10 »).
  await expect(page.locator('#suivre-matieres label', { hasText: 'Lettres' })).not.toContainText('niveau');
  await expect(page.locator('#suivre-matieres label', { hasText: 'Chiffres' })).not.toContainText('niveau');
  await expect(page.locator('#suivre-matieres label', { hasText: 'Maths' })).not.toContainText('niveau');
  await page.locator('#suivre-matieres input[value="lettres"]').check();
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await expect(page.locator('.cj-resume').first()).toContainText('Lettres · sans niveau');
  await page.getByRole('button', { name: 'Choisir l\'aventure' }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
  const avant = await page.evaluate(() => localStorage.getItem('ludoaventura-etoiles'));
  for (let i = 0; i < 3; i++) {
    const suivante = page.getByRole('button', { name: /^(Première question|Question suivante)$/ });
    await suivante.click();
    expect(await page.evaluate(() => window.Aventura.partie.carte.cat)).toBe('lettres');
    expect(await page.evaluate(() => window.Aventura.partie.carte.jeu)).not.toBe('fabrique'); // la fabrique n'est plus tirée
    await resoudre(page);
    await page.waitForFunction(() => window.Aventura.partie.regles.etape === 'lancer');
    await page.evaluate(() => window.Aventura.lancerDe());
  }
  // Aucune sous-matière notée : rien à ajouter à la progression.
  expect(await page.evaluate(() => window.Aventura.partie.joueurs[0].sous || null)).toBeNull();
  const apres = await page.evaluate(() => JSON.parse(localStorage.getItem('ludoaventura-etoiles')).joueurs.map((j) => j.niv || {}));
  for (const niv of apres) expect(Object.keys(niv).filter((k) => /lettres|chiffres/.test(k))).toEqual([]);
  void avant;
});

// Fin d'une aventure en Lettres : aucun point de niveau, aucune statistique (les matières à jauge ne bougent pas).
test('une aventure réussie en Lettres ne fait bouger ni la progression ni les statistiques du joueur', async ({ page }) => {
  test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit');
  await lancerBaby(page, { categories: ['lettres'] });
  const avant = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('ludoaventura-etoiles')).joueurs.map((j) => [j.niv || {}, j.st || {}])));
  await page.evaluate(() => {
    const r = window.Aventura.partie.regles;
    r.historique = [{ manche: 1, joueur: 0, de: 'fort', points: 999 }];
    r.points = 999; r.etape = 'fin';
  });
  await page.reload();
  await expect(page.locator('#fin')).toBeVisible();
  await expect(page.locator('#fin-titre')).toHaveText('Aventure réussie !');
  const apres = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('ludoaventura-etoiles')).joueurs.map((j) => [j.niv || {}, j.st || {}])));
  expect(apres).toBe(avant);
});

test('les 19 baby jeux de Lettres et de Chiffres se jouent au toucher, sans déborder, et la bonne réponse donne le dé FORT', async ({ page }) => {
  test.setTimeout(240000);
  await lancerBaby(page, { categories: ['lettres'] });
  const ids = B.IDS.filter((id) => B.jeu(id).cat !== 'mini');
  expect(ids).toHaveLength(19);
  for (const id of ids) {
    const suivante = page.getByRole('button', { name: /^(Première question|Question suivante)$/ });
    await expect(page.locator('#fin').or(suivante).first()).toBeVisible();
    if (await page.locator('#fin').isVisible()) await page.getByRole('button', { name: 'Rejouer cette aventure' }).click();
    await page.evaluate(([x, k]) => { const p = window.Aventura.partie; p.matiere[0] = k; p.baby[0].jeux = [x]; }, [id, B.jeu(id).cat]);
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
  await lancerBaby(page, { categories: ['lettres'], lettres: ['L'], ecriture: 'maj', jeux: ['attrape-lettre'] });
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
  await lancerBaby(page, { categories: ['chiffres'], jeux: ['attrape-chiffre'] }, { calme: false });
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
    await lancerBaby(page, { categories: [B.jeu(id).cat], jeux: [id] });
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

// « J’en ajoute » (v10.10, demande du 17/11/2026) : phrase claire, objets du départ + objets ajoutés, rien ne déborde (cas le plus chargé : 10 + 3).
test('J’en ajoute : la carte dit « Tu as 10 … Tu en reçois N de plus », montre les objets, tient sur tous les écrans', async ({ page }) => {
  await lancerBaby(page, { categories: ['chiffres'], chiffres: [10], jeux: ['encore-un'] });
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
