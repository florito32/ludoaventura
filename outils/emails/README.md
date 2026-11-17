# Modèles des e-mails du compte (v9.9)

À coller dans Supabase → Authentication → Emails → Templates (projet « ludo jeu ») :

| Modèle Supabase | Objet (Subject) | Contenu (Message body) |
| --- | --- | --- |
| Confirm sign up | `Valide ton compte Aventura` | `confirmation.html` |
| Reset password | `Ton nouveau mot de passe Aventura` | `mot-de-passe.html` |

Les liens mènent au jeu (`?valider=` et `?mdp=`), qui vérifie lui-même le jeton (POST `/auth/v1/verify`, js/compte.js).
Un antivirus de messagerie qui « ouvre » le lien avant la personne ne consomme donc plus le jeton
(docs Supabase : https://supabase.com/docs/guides/auth/auth-email-templates, « Email prefetching »).
Le logo est servi par GitHub Pages : `img/email-arche.png`.
