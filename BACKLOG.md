# BACKLOG — ludoaventura

Statuts : à faire / en cours / fait à valider / terminé / question en attente

| # | Instruction | Statut | Tests |
|---|-------------|--------|-------|
| 1 | Créer un nouveau dépôt GitHub `ludoaventura`, en plus de `minijeux` | terminé (créé par l'utilisateur : la création de dépôt est bloquée pour Claude ; l'ancienne redirection `ludoaventura` → `minijeux` est remplacée) | — |
| 2 | Genre du jeu : jeu éducatif d'aventure | terminé (choix de l'utilisateur) | — |
| 3 | Public : tous âges | fait à valider (v1.0) — hypothèse : 4 niveaux au choix, Moussaillon (dès 5 ans), Matelot (dès 7 ans), Navigateur (dès 9 ans), Capitaine (ados et adultes) | ✅ |
| 4 | Matières travaillées | fait à valider (v1.0) — pas de préférence : hypothèse = calcul pour commencer ; français, culture générale ou langues ajoutables ensuite | ✅ |
| 5 | Première version jouable : « L'île aux calculs » | fait à valider (v1.0) — hypothèses : 5 lieux (plage, forêt, rivière, grotte, volcan) de difficulté croissante, 5 questions à 4 choix par lieu, 3 bonnes réponses pour ouvrir le lieu suivant, 1 à 3 étoiles, trésor à la fin, progression mémorisée sur l'appareil (contrairement à minijeux qui repart de zéro) | ✅ local sur 4 formats + CI 72/72 (PR #1) |
| 6 | Mettre en place le dépôt : CLAUDE.md, BACKLOG.md, tests Playwright + GitHub Actions, PWA installable avec mise à jour automatique, numéro de version, SEO, accessibilité | fait à valider (v1.0) | ✅ local + CI 72/72 avec audit axe-core WCAG 2.1 AA clair + sombre (PR #1) |
| 7 | Mettre en ligne sur GitHub Pages | question en attente — action de l'utilisateur requise : GitHub Pages n'est pas activé (`has_pages: false`) et l'API Pages est bloquée depuis les sessions cloud. À faire dans GitHub : Settings → Pages → Source « Deploy from a branch », branche `main`, dossier `/ (root)` → Save. Le test en ligne sera fait au réveil suivant | — |
| 8 | Tâche planifiée de reprise automatique pour ludoaventura | terminé (01/11/2026) — tâche « Reprise automatique du backlog ludoaventura (jeu d'aventure) », toutes les 2 h à hh:41 (heure de Paris), distincte de celle de minijeux | — |
| 9 | Supprimer les branches fusionnées (`claude/v1-0`…) | question en attente : suppression refusée par le proxy — à supprimer à la main sur GitHub (onglet Branches) | — |
