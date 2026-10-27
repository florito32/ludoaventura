# BACKLOG — ludoaventura

Statuts : à faire / en cours / fait à valider / terminé / question en attente

| # | Instruction | Statut | Tests |
|---|-------------|--------|-------|
| 1 | Accéder au dépôt GitHub et lire CLAUDE.md / BACKLOG.md | terminé (les fichiers n'existaient pas) | — |
| 2 | Appliquer les instructions de travail : créer CLAUDE.md et BACKLOG.md | terminé (PR #1 fusionnée) | — |
| 3 | Afficher le numéro de version sur la page + historique au clic | fait à valider (v1.1, pied de page, PR #4) | ✅ 16/16 en local + CI + test en ligne |
| 4 | Mettre en ligne sur GitHub Pages | terminé (déjà actif depuis `main` : https://florito32.github.io/ludoaventura/) | test en ligne automatique après chaque déploiement (workflow « Test en ligne ») |
| 5 | Rendre le site installable (PWA) avec mise à jour automatique | fait à valider (v1.2, PR #5 : manifeste, icônes, service worker réseau d'abord, hors ligne) | ✅ 24/24 en local + CI + test en ligne |
| 6 | Tests Playwright (parcours, mobile / tablette / ordinateur) + GitHub Actions sur chaque PR | terminé (PR #3) | ✅ 12/12 en local (téléphone, téléphone carré, tablette, ordinateur) |
| 7 | Vérifier SEO et accessibilité de la page actuelle | à faire | |
| 8 | Sourcer les chiffres et affirmations de la page « éléphants » | à faire | |
| 9 | Clarifier l'objectif du site : le dépôt s'appelle « ludoaventura » mais la page parle d'éléphants | terminé : Ludoaventura = collection d'aventures, les éléphants sont la 1re | — |
| 10 | Rétablir l'accès GitHub en écriture | terminé (app Claude installée, push + PR + fusion OK) | — |
| 11 | Claude fusionne toujours lui-même les PR | terminé (noté dans CLAUDE.md) | — |
| 12 | Autorisation complète : créer, modifier, copier, supprimer (code, fichiers, branches, PR) | terminé (noté dans CLAUDE.md) | — |
| 13 | Réveil automatique après une limite d'utilisation + reprise des messages de la nuit | terminé (tâche planifiée toutes les 2 h, noté dans CLAUDE.md) | — |
| 14 | Mettre à jour CLAUDE.md sur GitHub | fait à valider | — |
| 15 | Supprimer les branches fusionnées `claude/setup-instructions` et `claude/claude-md-autonomie` | question en attente : suppression refusée par le proxy des sessions cloud (API et git push) — à supprimer à la main sur GitHub | |
| 16 | « Go » : reprendre tout le backlog en autonomie | en cours | |
| 17 | Structurer le site : accueil Ludoaventura + page éléphants comme 1re aventure | fait à valider (v1.3) — hypothèses à valider : adresse `/elephants/`, carte « Prochaine aventure » sur l'accueil, CSS commun `css/site.css` | ✅ 36/36 en local |
| 18 | Accélérer la CI (image officielle Playwright au lieu de l'installation de Chromium) | fait à valider | ✅ |
