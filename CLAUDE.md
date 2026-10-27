# CLAUDE.md — Comment on travaille sur ludoaventura

À lire en premier à chaque session, avec `BACKLOG.md`.

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
- PWA installable (iPhone, Android) avec mise à jour automatique : vérification au lancement, sinon à la première interaction.
- Design sobre et efficace, couleurs simples, hiérarchie visuelle claire.

## Versions
- Chaque page affiche son numéro de version (ex. v1.3) ; un clic ouvre l'historique des changements.
- Incrémenter à chaque mise en ligne.

## Tests A/B
- En cas d'hésitation : page de test (A à gauche, B à droite, paramètres modifiables), bouton « Copier mes choix ».

## Workflow GitHub
- Chaque modification : branche → pull request → fusion → mise en ligne GitHub Pages, sans attendre de validation.
- Livrer dès qu'une modification est prête, sans les regrouper.

## Tests (Playwright)
- Avant chaque push : parcours principal, fonctionnalités modifiées, affichage téléphone / tablette / ordinateur.
- Chaque fonctionnalité ou bug corrigé ajoute son test.
- Les tests tournent sur GitHub Actions à chaque pull request : pas de fusion si un test échoue.
- Après mise en ligne : test rapide sur la vraie page GitHub Pages.

## Vérité
- Ne jamais inventer : toute affirmation sur des normes ou des chiffres s'appuie sur une source citée. Sans source : « je n'ai pas la réponse ».

## Autonomie
- Tant que le backlog n'est pas vide, continuer ; une tâche planifiée reprend le backlog si la session s'arrête.
