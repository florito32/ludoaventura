// Nouvelles questions d'histoire (v10.14, demande du 18/11/2026, BACKLOG lignes 425 à 427) : questions écrites par l'utilisateur,
// reformulées en 15 mots au plus, avec 3 mauvaises réponses (mode Quiz), ajoutées aux jeux existants (js/histoire-*.js,
// fabriqués par outils/histoire_questions.py). Mode Normal : question ouverte dès Difficile, sinon vrai ou faux ; frise pour les dates.
const { test, expect } = require('@playwright/test');
const S = require('../js/savoirs.js');
require('../js/histoire.js');
const { rapide, versReglages, valider, lancer, ouvrirNeuf, cocher } = require('./aide');

const NIVEAUX = ['facile', 'moyen', 'difficile', 'expert'];
// Jeux qui ont reçu des questions, avec le nombre minimal de questions ajoutées (Renaissance : 'ren' ; Louis XIV : 'mod').
const AJOUTS = { r01: 195, t01: 167 };

// Les séries ajoutées par js/histoire-*.js : les séries de questions « ouverte: true ».
function seriesAjoutees(jeu) { return S.trouver(jeu).series.filter((s) => s.k === 'qcm' && s.ouverte); }
function questionsAjoutees(jeu) {
  const t = [];
  for (const s of seriesAjoutees(jeu)) for (const n of NIVEAUX) for (const x of (s.niveaux[n] || [])) t.push({ niveau: n, x });
  return t;
}

test.describe('nouvelles questions d\'histoire (contenu)', () => {
  test.beforeEach(() => test.skip(test.info().project.name !== 'ordinateur', 'test de logique : un seul format suffit'));

  test('rien ne se perd : chaque jeu a au moins ses questions ajoutées', () => {
    for (const [jeu, minimum] of Object.entries(AJOUTS)) expect(questionsAjoutees(jeu).length, jeu).toBeGreaterThanOrEqual(minimum);
  });

  test('chaque question : 15 mots au plus, une vraie phrase, une bonne réponse et 3 mauvaises réponses différentes', () => {
    for (const jeu of Object.keys(AJOUTS)) {
      for (const { x } of questionsAjoutees(jeu)) {
        const [q, bonne, fausses] = x;
        expect(q.split(/\s+/).length, jeu + ' ' + q).toBeLessThanOrEqual(15);
        expect(q, jeu).toMatch(/\?$/);
        expect(q, jeu).not.toMatch(/[:{}]/);
        expect(q, jeu).not.toMatch(/'/); // apostrophes courbes comme partout dans le jeu
        expect(fausses, jeu + ' ' + q).toHaveLength(3);
        const toutes = fausses.map((t) => S.normaliser(S.affiche(t)));
        expect(new Set(toutes).size, jeu + ' ' + q).toBe(3);
        for (const b of String(bonne).split('|')) expect(toutes, jeu + ' ' + q).not.toContain(S.normaliser(b));
      }
    }
  });

  test('un niveau n\'a que ses questions : aucune question n\'est posée à deux niveaux', () => {
    for (const jeu of Object.keys(AJOUTS)) {
      const vus = {};
      for (const { niveau, x } of questionsAjoutees(jeu)) {
        const cle = S.normaliser(x[0]);
        expect(vus[cle], jeu + ' : ' + x[0] + ' en ' + vus[cle] + ' et ' + niveau).toBeUndefined();
        vus[cle] = niveau;
      }
    }
  });

  test('mode Quiz : les nouvelles questions sortent à 4 choix, la bonne réponse parmi eux', () => {
    for (const jeu of Object.keys(AJOUTS)) {
      const nouvelles = new Set(questionsAjoutees(jeu).map(({ x }) => x[0]));
      let vues = 0;
      for (const niveau of NIVEAUX) {
        for (let k = 0; k < 400; k++) {
          const c = S.generer({ jeux: [jeu], niveau, mode: 'quiz' }, 'histoire');
          expect(c.format).toBe('Q');
          expect(c.options).toHaveLength(4);
          expect(new Set(c.options).size).toBe(4);
          expect(c.options).toContain(c.bonne);
          if (nouvelles.has(c.consigne)) vues++;
        }
      }
      expect(vues, jeu + ' : des questions ajoutées sortent en Quiz').toBeGreaterThan(100);
    }
  });

  test('mode Normal : question ouverte seulement dès Difficile (réponse courte), vrai ou faux avant', () => {
    for (const jeu of Object.keys(AJOUTS)) {
      const nouvelles = new Map(questionsAjoutees(jeu).map(({ x }) => [x[0], x]));
      for (const niveau of NIVEAUX) {
        let ouvertes = 0, vraiFaux = 0;
        for (let k = 0; k < 600; k++) {
          const c = S.generer({ jeux: [jeu], niveau, mode: 'normal' }, 'histoire');
          const q = c.format === 'O' ? c.consigne : c.question;
          if (!nouvelles.has(q)) continue;
          const x = nouvelles.get(q);
          if (c.format === 'O') {
            ouvertes++;
            expect(['difficile', 'expert'], jeu + ' ' + niveau).toContain(niveau);
            for (const variante of String(x[1]).split('|')) expect(S.ouverteJuste(variante, c.attendu), q + ' / ' + variante).toBe(true);
            expect(S.ouverteJuste(S.affiche(x[2][0]), c.attendu), q + ' : une mauvaise réponse ne doit pas être acceptée').toBe(false);
          } else {
            vraiFaux++;
            expect(c.format).toBe('V');
          }
        }
        expect(vraiFaux + ouvertes, jeu + ' ' + niveau).toBeGreaterThan(0);
        if (niveau === 'facile' || niveau === 'moyen') expect(ouvertes, jeu + ' ' + niveau).toBe(0);
        else expect(ouvertes, jeu + ' ' + niveau).toBeGreaterThan(0);
      }
    }
  });

  test('frise : les dates ajoutées se rangent dans le bon ordre (Louis XIV)', () => {
    for (const niveau of NIVEAUX) {
      let vues = 0;
      for (let k = 0; k < 400; k++) {
        const c = S.generer({ jeux: ['t01'], niveau, mode: 'normal' }, 'histoire');
        if (c.format !== 'F') continue;
        vues++;
        const annees = c.valeurs.map((v) => parseInt(v, 10));
        expect(annees).toEqual([...annees].sort((a, b) => a - b));
        expect(new Set(c.elements).size).toBe(4);
      }
      expect(vues, niveau).toBeGreaterThan(0);
    }
  });
});

// ---------- Affichage : les cartes tiennent dans l'écran, sur les 4 formats ----------
async function versHistoire(page, { niveau, jeu, mode }) {
  await rapide(page);
  await ouvrirNeuf(page);
  await versReglages(page, 1);
  await cocher(page, '#matieres', 'histoire');
  await cocher(page, '#niveau-savoir', niveau);
  await cocher(page, '#mode-savoir', mode);
  await valider(page);
  await page.locator('#savoir-jeux').waitFor();
  await page.locator('#savoir-liste input[value="' + jeu + '"]').check();
  await lancer(page);
  await page.getByRole('heading', { name: 'Le plateau' }).waitFor();
}
async function piocher(page) {
  await page.getByRole('button', { name: /^(Première question|Question suivante)$/ }).click();
  await page.locator('#carte-piochee').waitFor();
  return page.evaluate(() => window.Aventura.partie.carte);
}
async function pasDeDebordement(page) {
  const d = await page.evaluate(() => ({ l: document.documentElement.scrollWidth, v: window.innerWidth }));
  expect(d.l).toBeLessThanOrEqual(d.v);
}
test('Quiz : une question ajoutée s\'affiche à 4 choix, sans déborder, et la bonne réponse est juste', async ({ page }) => {
  await versHistoire(page, { niveau: 'expert', jeu: 'r01', mode: 'quiz' });
  // jeu → 0 ; série → la dernière (les questions ajoutées) ; question → 0,3.
  await page.evaluate(([valeurs]) => { let i = 0; window.Savoirs.regler(() => (i < valeurs.length ? valeurs[i++] : 0.5)); }, [[0, 0.999, 0.3]]);
  const c = await piocher(page);
  expect(c.format).toBe('Q');
  await expect(page.locator('.btn-option')).toHaveCount(4);
  await pasDeDebordement(page);
  await page.locator('.btn-option', { hasText: c.bonne }).first().click();
  await expect(page.locator('#carte-reponse')).toContainText(/Bonne réponse|Bravo/);
});

test('Normal : une question ouverte ajoutée s\'affiche avec ses cases de lettres, sans déborder', async ({ page }) => {
  await versHistoire(page, { niveau: 'difficile', jeu: 'r01', mode: 'normal' });
  // jeu → 0 ; série → la dernière ; question → la 1re de Difficile ; ouverte → 0,1.
  await page.evaluate(([valeurs]) => { let i = 0; window.Savoirs.regler(() => (i < valeurs.length ? valeurs[i++] : 0.5)); }, [[0, 0.999, 0, 0.1]]);
  const c = await piocher(page);
  expect(c.format).toBe('O');
  expect(c.attendu).toBeTruthy();
  await expect(page.locator('#carte-titre')).toContainText('Question ouverte');
  await pasDeDebordement(page);
});
