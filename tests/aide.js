// Outils partagés par les tests.

// Calcule la réponse d'une question affichée (« 7 × 8 = ? », « 25 % de 40 = ? »…).
function resoudre(texte) {
  const expr = texte.replace('= ?', '')
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    .replace(/%\s*de/g, '/100*');
  // eslint-disable-next-line no-new-func
  return Function('return (' + expr + ')')();
}

// Répond à la question en cours : juste (par défaut) ou faux.
async function repondre(page, juste = true) {
  const texte = await page.locator('#defi-question').textContent();
  const bonne = String(resoudre(texte));
  const boutons = page.locator('#defi-choix button');
  const valeurs = await boutons.allTextContents();
  const cible = juste ? valeurs.indexOf(bonne) : valeurs.findIndex((v) => v !== bonne);
  await boutons.nth(cible).click();
  return { texte, bonne };
}

// Joue un lieu complet avec un nombre donné de bonnes réponses (les premières).
async function jouerLieu(page, bonnes = 5) {
  for (let i = 0; i < 5; i++) {
    const juste = i < bonnes;
    await repondre(page, juste);
    if (!juste) await page.getByRole('button', { name: 'Question suivante' }).click();
    else if (i < 4) await page.locator('#defi-compteur').filter({ hasText: `Question ${i + 2} sur 5` }).waitFor();
  }
}

module.exports = { resoudre, repondre, jouerLieu };
