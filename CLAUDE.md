# CLAUDE.md — Comment on travaille sur ludoaventura

À lire en premier à chaque session, avec `BACKLOG.md`.

## Le projet
- Ludoaventura : version numérique du jeu de société éducatif **Aventura** (plateau, pions, dés FAIBLE / FORT, cartes AVENTURE et JEU). Matériel d'origine sur l'ordinateur de l'utilisateur : `C:\Users\fbore\Documents\Projets\09- Aventura\jeu numérique` (illustrations, plateau.pdf, Règles.docx).
- Site en ligne : https://florito32.github.io/ludoaventura/
- Dépôt distinct de `florito32/minijeux` (site de petits jeux, ancien nom « ludoaventura »).
- Fichiers clés : `index.html` (écrans : accueil, plateau), `js/plateau.js` (cases du parcours en % de l'image, pions), `img/` (illustrations détourées en WebP), `js/version.js` (version + historique), `js/navigateur.js` + `sw.js` (nettoyage de l'ancienne copie hors ligne, ne pas réactiver).
- À chaque mise en ligne : incrémenter `VERSION` dans `js/version.js`.

## Questions
- Au moindre doute, poser la question **avant** de mettre en ligne (boîte de dialogue à choix, réponse recommandée en premier, une question à la fois).
- Sans réponse : avancer avec l'hypothèse la plus raisonnable et la noter dans le backlog comme « à valider ».

## Backlog
- `BACKLOG.md` est la mémoire du projet : chaque instruction = une ligne.
- Statuts : à faire / en cours / fait à valider / terminé / question en attente.
- Pour chaque ligne livrée, indiquer que les tests sont passés.

## Code et site
- Site web statique hébergé sur GitHub Pages.
- HTML, CSS, JavaScript standards, minimum de dépendances, code sémantique, accessible, SEO, commenté.
- Responsive : téléphones (y compris formats carrés), tablettes, ordinateurs.
- **Pas d'application installable** (décision de l'utilisateur, 12/11/2026, v6.48) : le jeu se joue toujours dans le navigateur (ordinateur, tablette, iPhone, Android). Pas de manifeste, pas de bouton « Installer », pas de service worker ni de copie hors ligne. Cette décision remplace, pour ce projet, la préférence générale « PWA installable ».
- Design sobre et efficace, couleurs simples, hiérarchie visuelle claire.

## Versions
- Chaque page affiche son numéro de version (ex. v1.3) ; un clic ouvre l'historique des changements.
- Incrémenter à chaque mise en ligne.

## Tests A/B
- En cas d'hésitation : page de test (A à gauche, B à droite, paramètres modifiables), bouton « Copier mes choix ».

## Workflow GitHub
- Chaque modification : branche → pull request → fusion → mise en ligne GitHub Pages, sans attendre de validation.
- Livrer dès qu'une modification est prête, sans les regrouper.
- C'est toujours Claude qui fusionne les pull requests lui-même, sans demander à l'utilisateur de cliquer. Fusion sans relecture humaine explicitement et durablement autorisée sur tous les dépôts florito32/*, dès que les tests passent.
- Autorisation complète sur les dépôts : créer, modifier, copier et supprimer (code, fichiers, branches, pull requests), pousser, fusionner, activer GitHub Pages. Supprimer les branches une fois fusionnées.
- Seule exception : demander confirmation avant une suppression irréversible (ex. un dépôt entier).
- PR et fusion via l'API REST (`gh api repos/...`) : GraphQL (`gh pr create`) n'est pas disponible depuis les sessions cloud.

## Tests (Playwright)
- Avant chaque push : parcours principal, fonctionnalités modifiées, affichage téléphone / tablette / ordinateur.
- Chaque fonctionnalité ou bug corrigé ajoute son test.
- Les tests tournent sur GitHub Actions à chaque pull request : pas de fusion si un test échoue.
- Après mise en ligne : test rapide sur la vraie page GitHub Pages.

## Vérité
- Ne jamais inventer : toute affirmation sur des normes ou des chiffres s'appuie sur une source citée. Sans source : « je n'ai pas la réponse ».

## Autonomie
- Tant que le backlog n'est pas vide, continuer ; une tâche planifiée reprend le backlog si la session s'arrête.
- Réveil automatique : si une limite d'utilisation ou de crédits arrête la session, reprendre seul dès qu'elle est levée, relire tous les messages envoyés entre-temps, les ajouter au backlog et tout terminer en autonomie.
- Créer cette tâche planifiée de reprise (toutes les 2 h) dès le début de chaque nouvelle session, sans demander.
