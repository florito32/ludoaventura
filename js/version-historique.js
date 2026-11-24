// Historique des versions (ce qui a changé), chargé seulement quand l'auteur clique sur le numéro de version
// (js/version.js). Séparé du numéro depuis l'audit du 17/11/2026 (backlog ligne 395) : les joueurs ne le
// téléchargent plus, et une mise en ligne ajoute une entrée en tête de ce tableau.
window.SITE_HISTORY = [
  { v: '10.39', date: '2026-11-24', changes: [
    "Défi du jour : tu ne vois plus « Tu as quitté ce défi avant la fin » à tort quand tu as bien terminé ton défi. Si le jeu avait été ouvert une 2e fois pendant ta partie (autre onglet, raccourci, retour dans le navigateur), le défi était noté quitté par erreur ; maintenant, une partie menée jusqu’au bout est toujours récompensée."
  ] },
  { v: '10.38', date: '2026-11-24', changes: [
    "Préparation de la partie : à côté de chaque joueur (étape 1), deux boutons, « Suivre ma progression » et « Personnaliser ». Le joueur se prépare, revient à l’étape 1 pour le suivant, et « Choisir l’aventure » apparaît en bas quand tous les joueurs sont prêts.",
    "« Suivre ma progression » : le joueur ne choisit que sa matière (Maths, Français, Géographie ou Histoire) ; ses questions viennent de cette matière, au niveau enregistré dans son profil.",
    "« Personnaliser » : l’étape actuelle (matière, réglages) avec un niveau de 1 à 10 à la place de Facile, Moyen, Difficile et Expert ; chaque niveau regroupe dix niveaux de la progression (le niveau 2, c’est les niveaux 11 à 20)."
  ] },
  { v: '10.37', date: '2026-11-24', changes: [
    "Défi du jour : le bouton est maintenant un rectangle jaune juste sous « Commencer l’aventure ». Tu choisis seulement ton ou tes profils (1 = défi solo, 2 à 4 = défi en équipe) puis tu lances : plus de matière, de niveau ni d’aventure à choisir.",
    "Les cartes du défi mêlent Français, Maths, Histoire et Géographie, au niveau de chaque joueur dans la matière. Le défi du jour ne fait pas monter les niveaux, mais les étoiles gagnées sont multipliées par 3 (une fois par jour et par profil)."
  ] },
  { v: '10.36', date: '2026-11-24', changes: [
    "Mon compte : dans la carte du joueur, le bouton « Mes étoiles » est remplacé par un bouton coffre (sans texte). Il ouvre la page « Mes coffres » : coffres des prochains niveaux, coffre du jour, défis et méga coffre sur une seule page (l’écran « Ma progression » n’existe plus).",
    "Un petit « ? » à côté du nombre d’étoiles du joueur ouvre la fenêtre « Comment gagner des étoiles ? »."
  ] },
  { v: '10.35', date: '2026-11-23', changes: [
    "Histoire et Géographie : chaque question a maintenant un niveau de difficulté « progression » de 1 à 100 (100 niveaux par période d’Histoire et par famille de Géographie). Rien ne change à l’écran pour l’instant."
  ] },
  { v: '10.34', date: '2026-11-23', changes: [
    "Orthographe, Grammaire, Conjugaison et Phonèmes : chaque carte possible a maintenant un niveau de difficulté « progression » de 1 à 100 (mot, verbe et temps, jeu, son). Rien ne change à l’écran pour l’instant."
  ] },
  { v: '10.33', date: '2026-11-23', changes: [
    "Maths : chaque calcul a maintenant un niveau de difficulté « progression » de 1 à 100 (addition plus facile que soustraction, plus facile que multiplication, plus facile que division ; petits nombres avant grands ; un signe avant plusieurs). Rien ne change à l’écran pour l’instant."
  ] },
  { v: '10.32', date: '2026-11-23', changes: [
    "« Mon compte » a maintenant 4 onglets : Profil et joueurs, Identifiant et connexion, Confidentialité et RGPD, Aide et mentions légales.",
    "Profil et joueurs : chaque joueur a un crayon à côté de son nom (page pour changer le nom et le personnage) et une poubelle (avec confirmation, car elle détruit toute sa progression et ses gains). Un bouton « Statistiques » déroule étoiles, pierres, niveaux et, par matière, les parties jouées, réussies et réussies d’affilée.",
    "Identifiant et connexion : l’e-mail, le pseudo et la connexion, avec en plus le changement d’adresse e-mail et du mot de passe.",
    "Confidentialité et RGPD : ce que le jeu garde de toi, export de tes données et suppression définitive du compte (avec confirmation).",
    "Aide et mentions légales : politique de confidentialité, mentions légales, crédits et version. Ils ne sont plus dans le bas de l’accueil."
  ] },
  { v: '10.31', date: '2026-11-23', changes: [
    "Chaque joueur du compte a maintenant ses propres étoiles, son niveau, ses pierres précieuses, son coffre du jour, ses coffres de niveau, son méga coffre et ses défis du jour. Ce que le compte avait déjà gagné revient au Joueur 1.",
    "L’accueil n’affiche plus aucun nombre : il ne reste que « Défi du jour » et le compte. Les étoiles, pierres et coffres se voient dans la carte de chaque joueur (Mon compte), qui ouvre ses coffres et son écran « Mes étoiles ».",
    "Fin de partie gagnée : chacun reçoit les étoiles de ce qu’il a lui-même récolté (doublées au défi du jour s’il ne l’a pas encore réussi aujourd’hui). Un coffre gagné s’ouvre ensuite dans Mon compte.",
    "En revenant à l’accueil après une partie gagnée, les étoiles s’envolent vers le bouton du compte."
  ] },
  { v: '10.30', date: '2026-11-23', changes: [
    "Jouer en invité : sans adresse e-mail, le jeu te donne un pseudo « invité0001 » (puis invité0002…) et sauvegarde ta progression. Tu le vois dans « Mon compte ».",
    "Quand tu crées ton compte ou que tu te connectes, tu retrouves ce que tu as gagné en invité ; ton pseudo d’invité disparaît."
  ] },
  { v: '10.29', date: '2026-11-23', changes: [
    "Préparation de la partie : plus de « Combien de joueurs ? » ni de choix de l’aventurier. Une seule étape « Qui joue ? » : le Joueur 1 est déjà là, « Ajouter un joueur » en ajoute jusqu’à 4, chacun choisi parmi les joueurs de ton compte (visage, nom et niveaux affichés, pion de couleur). Un joueur déjà dans la partie est grisé ; deux joueurs peuvent avoir le même personnage.",
    "Défi du jour, partie rapide et Baby jeux : la fenêtre « Qui joue ? » s’ouvre à chaque lancement, avec les derniers joueurs déjà proposés.",
    "Mon compte : la progression des sous-matières n’est plus visible (elle reste enregistrée), il ne reste que les 4 jauges Français, Maths, Histoire et Géographie.",
    "Un joueur gagne +1 point de niveau seulement s’il réussit sa part de l’objectif (objectif ÷ nombre de joueurs), que l’équipe gagne ou non."
  ] },
  { v: '10.28', date: '2026-11-23', changes: [
    "À plusieurs, l’écran de fin dit ce que chacun devait récolter (l’objectif de l’équipe partagé entre les joueurs : 30 à 2, c’est 15 chacun) et qui a réussi sa part. La réussite de l’aventure reste celle de l’équipe."
  ] },
  { v: '10.27', date: '2026-11-23', changes: [
    "Préparation de la partie, étape 2 : si ton compte a au moins 2 joueurs, tu choisis qui joue (un joueur déjà pris est grisé pour les suivants) ; son personnage est proposé d’office.",
    "À la fin de chaque partie, réussie ou non, chaque joueur du compte gagne +1 point sur 100 dans la sous-matière qu’il a jouée (orthographe, calcul mental, une période d’histoire…)."
  ] },
  { v: '10.26', date: '2026-11-23', changes: [
    "Mon compte : nouvelle section « Mes joueurs ». Un compte fait jouer plusieurs joueurs, sans limite : chacun a son nom, son personnage (un des 10 aventuriers) et ses niveaux. Tu peux créer un joueur, changer son nom et son personnage quand tu veux.",
    "Niveaux : chaque sous-matière est notée de 0 à 100 (Français : orthographe, conjugaison, grammaire, phonèmes ; Maths : calcul mental, problèmes ; Histoire : une période ; Géographie : un jeu). La matière est la moyenne de ses sous-matières, affichée en jauge coupée en 10 niveaux.",
    "Les joueurs sont sauvegardés avec ta progression (sur ton compte, ou sur l’appareil en invité) et retrouvés sur tous tes appareils. Les niveaux augmenteront avec les parties : étape suivante."
  ] },
  { v: '10.25', date: '2026-11-18', changes: [
    "Histoire, Antiquité (fin) : nouvelles questions pour « Monuments et merveilles » (dont les 7 merveilles), « Chiffres romains » (règles et culture), « Olympie » et « Écritures », et compléments pour Rome, la Gaule et la vie antique. Toute l’Antiquité est maintenant ajoutée.",
    "Mêmes formats : 4 choix en mode Quiz ; en mode Normal, question ouverte dès Difficile quand la réponse est courte, vrai ou faux avant, dates en frise (avant J.-C. comprises)."
  ] },
  { v: '10.24', date: '2026-11-18', changes: [
    "Histoire, Antiquité : 693 nouvelles questions ajoutées aux jeux « Dieux et mythes », « L’Égypte des pharaons », « Rome et la Gaule » et « Vie antique et JO » (une partie seulement : Monuments, merveilles, Olympie et chiffres romains arrivent ensuite).",
    "Mode Quiz : 4 choix par question. Mode Normal : question ouverte dès Difficile quand la réponse est courte, vrai ou faux avant ; les dates (avant J.-C. comprises) s’ajoutent aux frises chronologiques."
  ] },
  { v: '10.23', date: '2026-11-18', changes: [
    "Plateau : le bouton « plein écran » est maintenant en bas à droite de l’écran, à côté de « Mentions légales » et « Crédits » : il ne cache plus rien du plateau de jeu.",
    "Téléphone : après ta réponse, la correction (« Bonne réponse ! … ») n’est plus coupée en bas. Le drapeau d’une question rétrécit un peu pour que tout tienne, et si la place manque encore, l’encadré descend jusqu’à la correction."
  ] },
  { v: '10.22', date: '2026-11-18', changes: [
    "Accueil : le « +N étoiles » gagné est écrit en jaune clair avec un contour brun foncé, lisible même au-dessus du bouton rouge « Commencer l’aventure »."
  ] },
  { v: '10.21', date: '2026-11-18', changes: [
    "Histoire, Temps modernes : 604 nouvelles questions ajoutées aux jeux « Écrivains et Lumières », « Révolution, Napoléon et République », « Industrie, inventions et monuments » et « Arts et lettres du XIXe », à tous les niveaux (questions de 15 mots au plus).",
    "Mode Quiz : chaque nouvelle question a ses 4 choix. Mode Normal : question ouverte dès Difficile quand la réponse est un nom, vrai ou faux avant ; les dates s’ajoutent à la frise chronologique."
  ] },
  { v: '10.20', date: '2026-11-18', changes: [
    "Histoire, XXe siècle : 544 nouvelles questions ajoutées aux jeux « Le XXe siècle en dates », « Sciences et espace » et « Grandes figures », à tous les niveaux (questions de 15 mots au plus).",
    "Mode Quiz : chaque nouvelle question a ses 4 choix. Mode Normal : question ouverte dès Difficile quand la réponse est un nom, vrai ou faux avant ; les dates s’ajoutent à la frise chronologique."
  ] },
  { v: '10.19', date: '2026-11-18', changes: [
    "Baby jeux › Les doigts : la main n’est plus coupée sur la droite (le pouce de la main à 5 doigts était rogné).",
    "Baby jeux › Les bulles : chaque chiffre a sa couleur et plus le chiffre est grand, plus la bulle est grosse. Quand tu touches une bulle (juste ou fausse), les autres ne repartent plus de leur place de départ ; même chose pour « Attrape le chiffre ».",
    "Après ta réponse, sur téléphone et tablette : si c’est juste, le plateau revient tout de suite ; si c’est faux, le jeu se cache et il ne reste que la correction et le bouton « J’ai compris », toujours visible.",
    "Plateau : plus de bandeau en haut, le plateau monte en haut de l’écran et le bouton Menu est posé dessus, à droite. Un bouton « plein écran » apparaît à côté quand ton navigateur le permet (pas sur iPhone)."
  ] },
  { v: '10.18', date: '2026-11-18', changes: [
    "Histoire, Moyen Âge : environ 540 nouvelles questions ajoutées aux jeux « Rois, batailles et frise », « Châteaux, chevaliers et paysans » et « Églises, croisades et Vikings », à tous les niveaux (questions de 15 mots au plus).",
    "Mode Quiz : chaque nouvelle question a ses 4 choix. Mode Normal : question ouverte dès Difficile quand la réponse est un nom, vrai ou faux avant ; les dates des rois et des conciles s’ajoutent à la frise chronologique."
  ] },
  { v: '10.17', date: '2026-11-18', changes: [
    "Fin de tour : les points gagnés prennent la forme de l’aventure (flamme pour la Préhistoire, pierre pour les Mayas, tronc, épée, gazelle, bloc, brique, rail, menhir…). Une forme par point : elles se posent en tas au centre du plateau, puis volent l’une après l’autre vers l’image à côté du comptage, en rétrécissant jusqu’à devenir minuscules dans l’image ; le comptage monte à chaque arrivée.",
    "Réglages choisis sur la page de test (proposition A) : vol d’une seconde, courbe légère, un tour sur elles-mêmes, éclat à l’arrivée. Le joueur suivant arrive après la dernière arrivée. Pas d’envol quand l’appareil demande moins de mouvement."
  ] },
  { v: '10.16', date: '2026-11-18', changes: [
    "Histoire, Préhistoire : 258 nouvelles questions ajoutées aux jeux « Nos ancêtres et les périodes » et « Art, outils et mégalithes », à tous les niveaux (questions de 15 mots au plus).",
    "Mode Quiz : chaque nouvelle question a ses 4 choix. Mode Normal : question ouverte dès Difficile quand la réponse est un nom, vrai ou faux avant ; de vraies questions « vrai ou faux » s’ajoutent."
  ] },
  { v: '10.15', date: '2026-11-18', changes: [
    "Choix de la partie : la matière, l’exercice, le niveau et le nombre de signes se choisissent dans des onglets à gauche. Un bandeau déroulant s’ouvre à droite de l’onglet touché, avec les choix l’un sous l’autre ; après un choix, il se ferme et le suivant s’ouvre.",
    "Ton choix reste écrit dans l’onglet (avec un ✓) : touche l’onglet pour le changer. Le choix retenu est écrit en noir avec un ✓ à droite. Le bouton « Valider » est dans le dernier bandeau."
  ] },
  { v: '10.14', date: '2026-11-18', changes: [
    "Histoire, Renaissance : 362 nouvelles questions ajoutées aux jeux « Arts, découvertes et châteaux » et « Louis XIV et son temps », à tous les niveaux (questions de 15 mots au plus).",
    "Mode Quiz : chaque nouvelle question a ses 4 choix. Mode Normal : question ouverte dès Difficile quand la réponse est un nom, vrai ou faux avant ; les dates de Louis XIV s’ajoutent à la frise chronologique."
  ] },
  { v: '10.13', date: '2026-11-18', changes: [
    "Histoire et Géographie : l’écran des jeux est présenté comme celui des temps de la conjugaison. Chaque période (ou famille) est un cadre avec ses jeux l’un sous l’autre et son bouton « Tout » ; les cadres se rangent côte à côte pour que tout tienne sans défiler.",
    "Sur un téléphone en hauteur, les cadres se rangent sur 2 colonnes (3 sur un petit écran peu haut) ; sur ordinateur, un cadre par famille."
  ] },
  { v: '10.12', date: '2026-11-18', changes: [
    "Coffres : à la fermeture de la fenêtre, les étoiles de tous les coffres ouverts à la suite s’envolent ensemble vers le compteur de l’accueil (« +N étoiles » au centre, le compteur grandit au fur et à mesure, 3 secondes au plus).",
    "Un coffre ouvert depuis « Mes étoiles », « Ma progression » ou l’écran de fin attend l’arrivée sur l’accueil ; avec le gain d’une partie, un seul envol pour le tout."
  ] },
  { v: '10.11', date: '2026-11-17', changes: [
    "Pseudo : chaque compte a un pseudo unique de 4 à 20 caractères (lettres, chiffres, - et _, sans espace). Tu le choisis en créant ton compte par e-mail ; avec Google, le jeu t’en donne un (prénom + initiale + 01) et te propose d’en choisir un à la prochaine ouverture.",
    "Mon compte : ton pseudo s’affiche et tu peux le changer quand tu veux.",
    "Les étoiles, pierres précieuses et niveaux de chaque joueur sont suivis dans Supabase (tables profils, stats_joueur, etoiles_jour) pour des classements de la semaine, du mois et du niveau général."
  ] },
  { v: '10.10', date: '2026-11-17', changes: [
    "Baby jeux : « Encore un ! » devient « J’en ajoute ». Tu pars d’un des chiffres que tu travailles et on t’en ajoute 1, 2 ou 3 (le total peut dépasser 10).",
    "La phrase est plus naturelle : « Tu as 5 pommes. Tu en reçois 2 de plus. Combien de pommes as-tu maintenant ? » (avec « une pomme », « un ballon », « d’étoiles » bien accordés)."
  ] },
  { v: '10.9', date: '2026-11-17', changes: [
    "Baby jeux › Les chiffres › Les doigts : de nouvelles mains, dessinées en noir sur blanc (une main pour 1 à 5, deux mains pour 6 à 10)."
  ] },
  { v: '10.8', date: '2026-11-17', changes: [
    "Baby jeux « La lettre qui manque » et « Le chiffre qui manque » : la suite en haut est à plat dans un bandeau (on ne la touche pas), puis une ligne pointillée et « Touche ta réponse » annoncent les gros boutons en relief du bas, comme dans « Remettre la phrase »."
  ] },
  { v: '10.7', date: '2026-11-17', changes: [
    "Crédits (en bas de page) : les illustrations du jeu sont de Stuki San."
  ] },
  { v: '10.6', date: '2026-11-17', changes: [
    "Le jeu te tutoie partout. Quand tu joues seul, l’histoire de l’aventure s’adresse à toi (« Ton pire ennemi, Ragnar, t’a volé des troncs… ») ; à plusieurs, elle parle à l’équipe (« vous »).",
    "« Choisis ton aventure » quand tu joues seul ; Ludo dit « Continue jusqu’au volcan »."
  ] },
  { v: '10.5', date: '2026-11-17', changes: [
    "Baby jeux « J’entends la lettre », « Les syllabes » et « Un son, des écritures » : la lettre, la syllabe ou le son à trouver est dit seul, dans une phrase à part et plus lentement, pour bien l’entendre.",
    "À la fin du tour, l’encadré de progression (« … taille 5 pierres ! Au tour de … ») ne s’affiche plus sur le plateau ; il reste annoncé aux lecteurs d’écran."
  ] },
  { v: '10.4', date: '2026-11-17', changes: [
    "Partie rapide : toutes les questions des matières peuvent tomber, hors Baby jeux. En français, les phonèmes s’ajoutent à l’orthographe, la conjugaison et la grammaire ; en maths, un calcul sur deux est raconté comme un problème."
  ] },
  { v: '10.3', date: '2026-11-17', changes: [
    "Au lancement, tant que tu n’es pas connecté, une fenêtre au centre de l’écran propose « Se connecter », « Créer un compte » ou « Jouer en invité ». Elle revient à chaque ouverture du jeu."
  ] },
  { v: '10.2', date: '2026-11-17', changes: [
    "Coulisses : cet historique n’est plus téléchargé par les joueurs, il se charge au clic sur le numéro de version.",
    "Tests automatiques plus rapides (4 en parallèle) et suivi du projet allégé."
  ] },
  { v: '10.1', date: '2026-11-17', changes: [
    "Mon compte : « Se connecter » et « Créer un compte » sont séparés. « Créer un compte » ouvre un formulaire à part : adresse e-mail, mot de passe et confirmation du mot de passe, puis « Créer mon compte ».",
    "Après « Créer mon compte », l’écran n’affiche plus que « Vérifie tes e-mails » : le compte attend sa validation (avec « Renvoyer l’e-mail »).",
    "Nouvel e-mail de validation en français, avec le logo du jeu et un bouton « Valider mon compte » ; ce bouton ramène dans le jeu sur « Ton compte est validé ! » puis « Commencer à jouer ».",
    "Un lien de validation déjà utilisé n’affiche plus « lien expiré » : si l’appareil est connecté, le jeu indique que le compte est déjà validé.",
    "E-mail « Mot de passe oublié » aussi en français, avec le même habillage."
  ] },
  { v: '10.0', date: '2026-11-17', changes: [
    "L’envol des étoiles gagnées vers le compteur de l’accueil dure 3 secondes au plus (toujours 1 seconde pour 10 étoiles en dessous) : pour un gros gain, chaque étoile qui arrive en apporte plusieurs."
  ] },
  { v: '9.9', date: '2026-11-17', changes: [
    "Histoire et géographie : toutes les questions sont de vraies phrases, sans deux-points. « Quelle est la capitale de ce pays : Togo ? » devient « Quelle est la capitale du Togo ? », « Touche le département : Finistère » devient « Touche le Finistère sur la carte. ».",
    "Les questions « Lequel va avec : … ? » n’existent plus : chaque série à classer a ses propres questions, par exemple « Lequel de ces gestes se faisait déjà à la cour de Louis XIV ? ».",
    "Les dates (« En quelle année Jules César a-t-il été assassiné ? ») et les devinettes sur les personnages (« Qui a fondé Québec en 1608 ? ») sont écrites une à une.",
    "Les articles s’accordent tout seuls avec les noms de pays, de départements, de fleuves et de monuments (du Togo, de la France, de l’Iran, des Pays-Bas, de Cuba, au Japon, aux États-Unis)."
  ] },
  { v: '9.8', date: '2026-11-17', changes: [
    "Après une aventure gagnée, « Retour à l’accueil » garde « ⭐ +19 étoiles » au milieu de l’écran : les étoiles s’envolent une à une vers le compteur du haut, qui grandit à chaque arrivée (1 seconde pour 10 étoiles).",
    "« Rejouer » ou « Nouvelle partie » : les étoiles sont ajoutées au compte sans animation."
  ] },
  { v: '9.7', date: '2026-11-17', changes: [
    "Cartes à toucher (départements, Europe, monde) : on peut zoomer beaucoup plus fort, jusqu’à ce que le plus petit pays ou département à trouver (Israël, Liban, Paris…) soit aussi large qu’un doigt.",
    "Les petits pays gardent leur forme quand on zoome : contours dix fois plus précis qu’avant.",
    "Sur téléphone, la carte du monde est plus haute : plus de place pour zoomer et viser, et les boutons + et − ne dépassent plus de la carte.",
    "Après une réponse, la carte se zoome toute seule sur le bon pays (en vert) et sur celui touché (en rouge).",
    "Une fois la réponse donnée, le pays touché reste rouge : il ne passe plus en jaune sous le doigt ou la souris."
  ] },
  { v: '9.6', date: '2026-11-17', changes: [
    "Téléphone : barre du haut de l’accueil plus compacte. Le défi du jour, le coffre et le compte deviennent des boutons ronds à icône seule ; le bouton du compte est de nouveau visible.",
    "Le bloc des étoiles est sur trois lignes : niveau, puis étoiles, puis pierres précieuses.",
    "Le numéro de version et cet historique ne s’affichent plus que pour le compte de l’auteur du jeu."
  ] },
  { v: '9.5', date: '2026-11-17', changes: [
    "Voix plus naturelle pour « 🔊 Écouter » (maths, problèmes, français, histoire, géographie, Baby jeux) : le jeu choisit la meilleure voix française de l’appareil (voix « Natural » de Microsoft, « Premium » ou « Enhanced » d’Apple, voix Google), sinon une autre voix française.",
    "Le texte est préparé avant d’être lu : petites pauses après « : » et autour des mots entre guillemets, une phrase à la fois, la question dite en montant un peu le ton, les nombres un peu plus lentement.",
    "Bonne prononciation de ce que les voix lisaient mal : × ÷ = ? dans les calculs, « av. J.-C. », Louis XIV, François Ier, XIXe siècle, Ve République, °C, %, 50 000.",
    "Les longues cartes (histoire, géographie, problèmes) sont lues jusqu’au bout, même sur les navigateurs qui coupaient la voix au bout de quelques secondes."
  ] },
  { v: '9.4', date: '2026-11-16', changes: [
    "Nouveau bouton « Se connecter » en haut de l’accueil (icône d’aventurier) : avec Google ou avec une adresse e-mail et un mot de passe, pour retrouver ses étoiles, coffres, pierres et niveaux sur l’ordinateur, la tablette ou le téléphone.",
    "La connexion est facultative : « Jouer en invité » garde la progression seulement sur l’appareil, comme avant.",
    "En se connectant, ce qui a été gagné sur l’appareil s’ajoute à la progression du compte ; ensuite chaque gain est sauvegardé tout seul quelques secondes plus tard.",
    "Inscription par e-mail avec confirmation, « Mot de passe oublié ? », « Se déconnecter » (l’appareil repart alors en invité, la progression reste sur le compte)."
  ] },
  { v: '9.3', date: '2026-11-16', changes: [
    "Clavier à lettres : en orthographe, en conjugaison et pour les questions ouvertes de géographie et d’histoire, on répond en touchant des lettres proposées par le jeu (celles de la réponse et des lettres pièges, au moins 18, par ordre alphabétique) : plus jamais le clavier du téléphone ni de l’ordinateur.",
    "Une case par lettre (l’espace, le tiret et l’apostrophe ont aussi leur case), touche « é è ê » pour mettre l’accent sur la dernière lettre, touches - et ’, ⌫, « Tout effacer », espace et Valider.",
    "Une question ouverte attend toujours un nom, jamais une phrase entière : sinon elle se pose dans l’autre sens, ou devient « Relie »."
  ] },
  { v: '9.2', date: '2026-11-16', changes: [
    "Baby jeux : réglages en deux pages qui tiennent chacune sur l’écran, sans défiler. Page 1 : Lettres ou Chiffres (l’un ou l’autre), l’écriture (majuscules, minuscules ou les deux) et les lettres ou les chiffres à travailler ; page 2 : la liste des petits jeux.",
    "« Modifier les choix » pendant une partie de Baby jeux ou une partie rapide solo ramène à ses propres réglages (et plus à la préparation de l’aventure) ; « Reprendre la partie » garde l’aventure, l’aventurier et les points, « ← Partie » revient au plateau sans rien changer."
  ] },
  { v: '9.1', date: '2026-11-16', changes: [
    "Nouveau bouton « Baby jeux » sur l’accueil : 20 petits jeux pour les tout-petits, joués sur le plateau comme une partie rapide (aventure, dés, étoiles).",
    "Lettres : Attrape la lettre (les lettres se baladent), Grandes et petites, L’alphabet dans l’ordre, La lettre qui manque, J’entends la lettre, La première lettre, Voyelle ou consonne, La fabrique à mots (la voix lit le mot fabriqué), Les syllabes, Un son et ses écritures (IN, AIN, UN…).",
    "Chiffres : Attrape le chiffre (avec un dé), Compte les objets, Du plus petit au plus grand, Le chiffre qui manque, Où y en a-t-il le plus ?, Les doigts, Relier dés et chiffres, Les bulles, J’entends le chiffre, Encore un !",
    "On choisit les lettres et les chiffres (1 à 10) travaillés, l’écriture (majuscules, minuscules ou les deux) et les jeux ; la consigne est lue à voix haute."
  ] },
  { v: '9.0', date: '2026-11-16', changes: [
    "Mathématiques : deux choix, « Calcul mental » ou « Problèmes ». Un problème raconte le calcul tiré avec tes réglages habituels (niveau, signes, nombres), sur un thème tiré au hasard parmi 58 (château fort, ruche, épave, vaisseau spatial…).",
    "Pavé numérique à l’écran pour toute réponse en nombre (chiffres, virgule, ⌫ pour effacer le dernier chiffre, C pour tout effacer, OK) : plus besoin du clavier du téléphone ni de l’ordinateur.",
    "Sur téléphone et tablette, la question prend tout l’écran ; le plateau revient quand le dé se lance."
  ] },
  { v: '8.10', date: '2026-11-16', changes: [
    "Histoire, XXe siècle : les 7 petits jeux sont regroupés en 3, avec environ 38 à 50 questions par niveau chacun, jouables en Quiz et en Normal — Le XXe siècle en dates (présidents, construction européenne, frise, vie en France) ; Sciences et espace (conquête spatiale, inventions) ; Grandes figures (femmes qui ont marqué l’histoire, grandes figures du monde)."
  ] },
  { v: '8.9', date: '2026-11-16', changes: [
    "Histoire, Révolution et XIXe siècle : les 9 petits jeux sont regroupés en 3, avec environ 38 à 48 questions par niveau chacun, jouables en Quiz et en Normal — Révolution, Napoléon et République (avec les symboles de la République, les régimes et les grandes lois) ; Industrie, inventions et monuments ; Arts et lettres du XIXe (écrivains, peintres, compositeurs)."
  ] },
  { v: '8.8', date: '2026-11-15', changes: [
    "Histoire, Temps modernes : les 4 petits jeux sont regroupés en 2, avec environ 36 à 48 questions par niveau chacun, jouables en Quiz et en Normal — Louis XIV et son temps (Louis XIII, Louis XIV, Louis XV, Louis XVI, Nouvelle-France, frise) ; Écrivains et Lumières (écrivains classiques, fables et contes, philosophes et savants des Lumières)."
  ] },
  { v: '8.7', date: '2026-11-15', changes: [
    "Histoire, Renaissance : les 6 petits jeux sont regroupés en 2, avec environ 37 à 56 questions par niveau chacun, jouables en Quiz et en Normal — Arts, découvertes et châteaux ; Rois et guerres de Religion (les artistes et les châteaux de la Loire sont de nouveau jouables en Quiz)."
  ] },
  { v: '8.6', date: '2026-11-13', changes: [
    "Histoire, Moyen Âge : les 8 petits jeux sont regroupés en 3, avec environ 35 à 40 questions par niveau chacun, jouables en Quiz et en Normal — Rois, batailles et frise ; Châteaux, chevaliers et paysans ; Églises, croisades et Vikings (les Vikings sont de nouveau jouables en Quiz)."
  ] },
  { v: '8.5', date: '2026-11-13', changes: [
    "Partie rapide solo : on peut aussi choisir la Géographie et l’Histoire, et, avec l’une des deux, le mode « Quiz » ou « Normal ».",
    "Le tout premier bouton de la partie s’appelle « Première question ».",
    "Plus de petits commentaires sous les niveaux, sous le mode, dans la partie rapide ni dans les titres des réglages (« au moins un », exemples entre parenthèses)."
  ] },
  { v: '8.4', date: '2026-11-13', changes: [
    "Histoire, Antiquité : les 12 petits jeux sont regroupés en 6, avec environ 40 questions par niveau chacun, jouables en Quiz et en Normal — Dieux et mythes, L’Égypte des pharaons, Rome et la Gaule, Monuments et merveilles, Chiffres romains, Vie antique et Jeux olympiques.",
    "Quiz : les questions « Qui a… ? » et « Chez les Égyptiens, qui est… ? » proposent bien 4 noms au choix (et non 4 descriptions)."
  ] },
  { v: '8.3', date: '2026-11-13', changes: [
    "Histoire, Préhistoire : les 5 petits jeux sont regroupés en 2 grands jeux, « Nos ancêtres et les périodes » et « Art, outils et mégalithes », avec environ 40 questions par niveau chacun, jouables en Quiz et en Normal."
  ] },
  { v: '8.2', date: '2026-11-13', changes: [
    "Géographie : « Climats et paysages » passe à environ 45 questions par niveau — paysages, animaux et leurs milieux, climats des villes de France, météo, vents, saisons et vocabulaire. Tous les thèmes de géographie ont maintenant leur grand choix de questions."
  ] },
  { v: '8.1', date: '2026-11-13', changes: [
    "Géographie : environ 50 questions différentes par niveau dans chaque thème, de plus en plus difficiles — Pays et capitales (184 pays), Drapeaux (195 pays), Pays voisins (frontières de tous les pays), Monuments du monde (200 monuments), Fleuves et rivières, Montagnes et sommets, Records de la Terre.",
    "Drapeaux : deux drapeaux qui se ressemblent (Tchad et Roumanie, Monaco et Indonésie…) ne sont jamais proposés ensemble.",
    "Quiz : « Trouve le plus haut / le plus ancien… » remplace « Lequel est… » dans les questions de rangement."
  ] },
  { v: '8.0', date: '2026-11-13', changes: [
    "Géographie et Histoire : nouveau choix du mode, « Quiz » (une question et 4 réponses, une seule est bonne) ou « Normal » (relier, écrire la réponse, toucher la carte, remettre dans l’ordre, vrai ou faux, classer, qui suis-je ?).",
    "Toujours 4 réponses au choix et toujours 4 paires à relier, quel que soit le niveau.",
    "Géographie : un seul jeu « Départements » (numéro, nom et préfecture), 25 départements par niveau, rangés par population (Insee).",
    "Géographie : la carte devient trois jeux, Carte de France (les départements), Carte d’Europe et Carte du monde ; plus le niveau monte, plus les zones sont petites. En Quiz, la zone est en vert et on choisit son nom parmi 4.",
    "Géographie : « Régions » demande aussi dans quelle région se trouve chaque département."
  ] },
  { v: '7.11', date: '2026-11-13', changes: [
    "Histoire : nouvelle période, le XXe siècle, avec 7 jeux et 4 niveaux — Conquête spatiale, Inventions du XXe siècle, Présidents de la Ve République (avec Qui suis-je ?), Femmes qui ont marqué l’histoire (avec Qui suis-je ?), Construction européenne, Grandes figures du monde (avec Qui suis-je ?), Frise du XXe siècle. Les 7 périodes de l’histoire sont maintenant toutes jouables."
  ] },
  { v: '7.10', date: '2026-11-13', changes: [
    "Histoire : nouvelle période, la Révolution et le XIXe siècle, avec 9 jeux et 4 niveaux — La Révolution française, Symboles de la République, Napoléon (avec Qui suis-je ?), Les régimes politiques, Inventions de la révolution industrielle, Écrivains du XIXe siècle, Peintres impressionnistes (avec Qui suis-je ?), Monuments du XIXe siècle, Grandes lois."
  ] },
  { v: '7.9', date: '2026-11-13', changes: [
    "Histoire : nouvelle période, les Temps modernes, avec 4 jeux et 4 niveaux — Louis XIV et Versailles (avec Qui suis-je ?), Écrivains classiques (Molière, La Fontaine, Racine…), Les Lumières (Voltaire, Rousseau, Montesquieu, Diderot), Frise des Temps modernes."
  ] },
  { v: '7.8', date: '2026-11-13', changes: [
    "Histoire : nouvelle période, la Renaissance, avec 6 jeux et 4 niveaux — Artistes et œuvres, Grandes découvertes, Châteaux de la Loire, Rois de la Renaissance (avec Qui suis-je ?), Réforme et guerres de Religion, Frise de la Renaissance.",
    "Téléphone : sur l’écran des jeux d’histoire, le haut de la liste (Préhistoire) est de nouveau atteignable en faisant défiler."
  ] },
  { v: '7.7', date: '2026-11-12', changes: [
    "Histoire : nouvelle période, le Moyen Âge, avec 8 jeux et 4 niveaux — Rois de France, Le château fort, Chevaliers, Jeanne d’Arc et la guerre de Cent Ans, Frise du Moyen Âge, Roman ou gothique ?, Les Vikings, Seigneurs et paysans."
  ] },
  { v: '7.6', date: '2026-11-12', changes: [
    "Histoire : nouvelle période, la Préhistoire, avec 5 jeux et 4 niveaux — Nos ancêtres (frise, lieux de découverte, Qui suis-je ?), Paléolithique ou Néolithique ? (classer, vrai ou faux, ordre des périodes), Grottes ornées (Lascaux, Chauvet, Cosquer…), Outils et inventions, Mégalithes (menhirs, dolmens, Carnac, Stonehenge)."
  ] },
  { v: '7.5', date: '2026-11-12', changes: [
    "Nouvelle matière : l’Histoire, avec 4 niveaux (Facile, Moyen, Difficile, Expert) ; chaque niveau a son propre contenu. Les jeux sont rangés par période.",
    "Première période : l’Antiquité et ses 12 jeux — dieux grecs et romains, dieux égyptiens, pharaons, héros et mythes, frise de Rome, la Gaule, monuments antiques, les 7 merveilles du monde, écritures anciennes, chiffres romains, vie quotidienne, Jeux olympiques antiques.",
    "Nouveau format « Qui suis-je ? » : des indices dévoilés un à un ; 6 points si l’on trouve au premier indice, puis de moins en moins, sans lancer de dé."
  ] },
  { v: '7.4', date: '2026-11-12', changes: [
    "Carte à toucher : on peut zoomer sur la carte seule (pas la page) pour toucher plus précisément : en pinçant à deux doigts, avec la molette ou avec les boutons + et −. Un doigt glissé déplace la carte zoomée ; le bouton ⤢ remet toute la carte."
  ] },
  { v: '7.3', date: '2026-11-12', changes: [
    "Nouveau en français : les Phonèmes, à côté de l'orthographe, de la conjugaison et de la grammaire (sans niveau).",
    "Écran des sons, présenté comme celui des temps de conjugaison : on choisit Consonnes, Voyelles ou Semi-voyelles, puis les sons, rangés sur deux colonnes ; chaque son a son symbole entre crochets et un mot simple, lettres du son soulignées ([p] pomme, [ʃ] chat…). Bouton « Tout sélectionner ».",
    "6 petits jeux au choix : Complète le mot (choisir la bonne écriture du son), Quel son ? (les lettres en couleur, 3 sons au choix), L'intrus (le mot qui n'a pas le son), Où est le son ? (au début, au milieu, à la fin), Relier son ↔ écriture, Trier les mots (deux sons proches, deux colonnes).",
    "Le jeu corrige tout seul et lance le bon dé ; « Écouter » lit la carte (« le son du début de pomme »)."
  ] },
  { v: '7.2', date: '2026-11-12', changes: [
    "Géographie, choix des jeux : chaque jeu est une tuile avec son icône et son nom, plus aucun mot coupé par le contour. Sur téléphone, 2 jeux par ligne ; sur ordinateur et tablette en largeur, une famille par ligne."
  ] },
  { v: '7.1', date: '2026-11-12', changes: [
    "Fin de partie : nouveau bouton « Retour à l’accueil », sous « Rejouer cette aventure » et « Nouvelle partie »."
  ] },
  { v: '7.0', date: '2026-11-12', changes: [
    "Nouvelle matière : la Géographie, avec 4 niveaux (Facile, Moyen, Difficile, Expert) ; chaque niveau a son propre contenu.",
    "12 jeux au choix, rangés en 3 familles : France (numéros des départements, préfectures, régions, carte à toucher), Monde (capitales, drapeaux, pays voisins, monuments) et Nature (fleuves, montagnes, records de la Terre, climats et paysages).",
    "Plusieurs façons de répondre : relier deux colonnes, choisir la bonne réponse, écrire la réponse (Difficile et Expert, sans compter les accents), remettre dans l'ordre, vrai ou faux, classer en deux colonnes. Le jeu corrige tout seul et lance le bon dé.",
    "Carte à toucher : Facile, les régions de France ; Moyen, les départements sur la carte de leur région ; Difficile, les pays d'Europe ; Expert, les pays d'Afrique, d'Asie et Océanie ou des Amériques. Seules les zones assez grandes pour un doigt sont demandées.",
    "Nouveau lien « Crédits » en bas de page : drapeaux flag-icons (licence MIT), cartes de France IGN (Licence ouverte), cartes du monde Natural Earth (domaine public)."
  ] },
  { v: '6.55', date: '2026-11-12', changes: [
    "Partie rapide solo et défi du jour : avec « Français », les cartes peuvent aussi être de la grammaire (au niveau choisi), en plus de l'orthographe et de la conjugaison."
  ] },
  { v: '6.54', date: '2026-11-12', changes: [
    "Nouveau : la Grammaire, en français, à côté de l'orthographe et de la conjugaison. On choisit un niveau (Facile, Moyen, Difficile, Expert) puis ses petits jeux ; chaque carte en tire un au hasard.",
    "Remettre la phrase : on touche les mots mélangés dans l'ordre pour refaire la phrase ; plus le niveau est haut, plus la phrase est longue (compléments, mais / car / donc, qui / que…).",
    "Les contraires (3 choix), Trouve l'erreur (toucher le mot faux), Nature du mot (nom, verbe, adjectif…), Homophones (a / à, son / sont, c'est / s'est…).",
    "Relier les paires : deux colonnes de 6 à 8 mots ; on touche un mot d'un côté puis de l'autre, une ligne de couleur les relie.",
    "« Le ou la ? » et « Au pluriel » quittent l'orthographe pour la grammaire."
  ] },
  { v: '6.53', date: '2026-11-12', changes: [
    "Nouveau lien « Mentions légales » en bas de page, vers la page du site ludo-aventura.fr (obligatoire pour un site public)."
  ] },
  { v: '6.52', date: '2026-11-12', changes: [
    "Mot mélangé : on n'écrit plus le mot. On touche les lettres mélangées : chacune va dans la case suivante du mot. Toucher une lettre placée la renvoie à sa place ; « ↺ Tout remettre » les renvoie toutes. Le mot complet est corrigé tout seul.",
    "Sur ordinateur, on peut aussi taper les lettres au clavier (Retour arrière retire la dernière)."
  ] },
  { v: '6.51', date: '2026-11-12', changes: [
    "Orthographe, choix des questions sur téléphone : les noms des questions débordaient de leurs boutons quand l'écran est étroit ou le texte agrandi. Le nom de chaque famille passe au-dessus de ses boutons, qui reprennent toute la largeur, 3 par ligne."
  ] },
  { v: '6.50', date: '2026-11-12', changes: [
    "Orthographe : 4 niveaux, Facile, Moyen, Difficile et Expert, à choisir sur l'écran de la matière, juste sous « Orthographe ».",
    "272 nouveaux mots pour les niveaux Difficile et Expert, 16 par thème : rhinocéros, chauve-souris, cathédrale… puis ornithorynque, amphithéâtre, kinésithérapeute, parallélépipède…",
    "Facile pioche les mots courts d'avant, Moyen les plus longs ; la partie rapide et les défis du jour utilisent aussi les nouveaux mots en Difficile et en Expert."
  ] },
  { v: '6.49', date: '2026-11-12', changes: [
    "Conjugaison : le niveau (Facile, Moyen, Difficile, Expert) se choisit tout de suite, sur l'écran de la matière, avec quelques verbes en exemple.",
    "Conjugaison : les modes, les groupes de verbes et les temps se choisissent sur un seul écran. Il n'y a plus qu'une page de réglages avant la partie."
  ] },
  { v: '6.48', date: '2026-11-12', changes: [
    "Aventura se joue maintenant toujours dans le navigateur, sur ordinateur, tablette, iPhone et Android : ce n'est plus une application à installer. Le bouton « Installer l'application » est retiré.",
    "Le jeu ne garde plus de copie hors ligne : il faut une connexion Internet. Les appareils qui avaient installé l'application reçoivent toujours la dernière version."
  ] },
  { v: '6.47', date: '2026-11-10', changes: [
    "Défi du jour : un défi quitté avant la fin (retour à l'accueil, redémarrage, jeu fermé…) ne rapporte plus rien ce jour-là, même rejoué et gagné. On peut toujours y jouer. Une partie perdue jusqu'au bout se retente normalement."
  ] },
  { v: '6.46', date: '2026-11-10', changes: [
    "Un coffre simple (10 à 25 étoiles) à chaque nouveau niveau ; aux niveaux 5, 10, 15… le gros coffre (argent ou or) le remplace.",
    "Nouveau : les pierres précieuses ! Une partie gagnée en rapporte parfois une (1 chance sur 3), et chaque coffre en contient : 1 (coffre du jour, coffre simple), 2 (argent), 3 (or), 5 (méga coffre). Leur nombre s'affiche sous tes étoiles."
  ] },
  { v: '6.45', date: '2026-11-10', changes: [
    "Partie rapide solo : on joue seul ; on choisit les matières et le niveau (Facile, Moyen, Difficile ou Expert), qui règle la difficulté des questions et de l'aventure.",
    "Le bouton « Tout » / « Aucune » est maintenant à côté du mot « Matières ».",
    "Fin d'une partie rapide : « Recommencer la partie » ou « Retour à l'accueil »."
  ] },
  { v: '6.44', date: '2026-11-10', changes: [
    "Accueil : l'encadré « Un jeu éducatif d'aventure, à jouer en équipe » est retiré ; le bouton devient « Partie rapide solo », en bleu.",
    "Ma progression : l'encadré « Coffres de niveau » est retiré (il est déjà dans « Mes étoiles »)."
  ] },
  { v: '6.43', date: '2026-11-10', changes: [
    "Nouveau : la Partie rapide ! Depuis l'accueil, choisis le nombre de joueurs et les matières (Maths, Français ou les deux), puis « Lancer la partie » : l'aventure et les aventuriers sont tirés au hasard.",
    "En partie rapide, chaque question est tirée au hasard dans les matières choisies, tous niveaux, tous thèmes de mots, tous les temps de conjugaison."
  ] },
  { v: '6.42', date: '2026-11-10', changes: [
    "Mes étoiles : la page est plus courte. « Comment gagner des étoiles ? » est maintenant un petit bouton qui ouvre l'explication, et la liste des dernières étoiles gagnées est retirée."
  ] },
  { v: '6.41', date: '2026-11-10', changes: [
    "Accueil : le bouton « Défi du jour » est en haut de l'écran, entre les étoiles et le coffre ; les boutons « Mes étoiles » et « Progrès » sont retirés (le bouton des étoiles et celui du coffre mènent aux mêmes pages).",
    "Défi du jour : on choisit seulement la matière et le niveau, puis « Valider » ; l'aventure reste une surprise jusqu'au plateau.",
    "Nouveau : le méga coffre (100 à 200 étoiles) chaque fois que tu viens 5 jours d'affilée. « Ma progression » montre ta série de jours à la place des 7 derniers jours.",
    "Coffres redessinés (planches, ferrures, serrure) : ils s'ouvrent par devant et les étoiles sortent du coffre."
  ] },
  { v: '6.40', date: '2026-11-10', changes: [
    "Orthographe : après « 🔊 Écouter », un bouton « 💬 Phrase d'exemple » apparaît : il lit une courte phrase avec le mot (pas pour « Mot mélangé » ni « Le ou la ? », où la phrase donnerait la réponse)."
  ] },
  { v: '6.39', date: '2026-11-10', changes: [
    "Orthographe : les « packs » s'appellent maintenant des « thèmes », rangés en 4 familles encadrées avec chacune son bouton « Tout » : Nature et animaux, Tous les jours, En ville, Le monde, le temps, les nombres.",
    "« Mots simples » et « Mots compliqués » ne sont plus proposés ; « Temps » devient « Jours et mois » et « Numérique » devient « Nombres »."
  ] },
  { v: '6.38', date: '2026-11-10', changes: [
    "Orthographe : la question « Épeler à l'oral » est retirée. Toutes les questions s'écrivent dans la case de réponse."
  ] },
  { v: '6.37', date: '2026-11-10', changes: [
    "Nouveau : le Défi du jour ! Chaque jour, un défi solo et un défi en équipe : tu choisis la matière (Maths ou Français) et le niveau (et le nombre de joueurs en équipe), le jeu choisit l'aventure, les aventuriers et les questions.",
    "Défi gagné : les étoiles de la partie sont doublées (une fois par jour pour chaque défi). Perdu : réessaie autant de fois que tu veux.",
    "Accueil : bouton « Défi du jour » (avec le nombre de défis restants) ; « Progression » devient « Progrès » et montre aussi les deux défis du jour."
  ] },
  { v: '6.36', date: '2026-11-10', changes: [
    "Nouveau : les étoiles ⭐ ! Chaque aventure gagnée rapporte une étoile par tronc coupé, pierre taillée… récolté par l'équipe.",
    "Un coffre du jour à ouvrir chaque jour (5 à 20 étoiles). Les étoiles font monter de niveau ; tous les 5 niveaux un coffre d'argent, tous les 10 niveaux un coffre d'or.",
    "Accueil : le total d'étoiles, le niveau et le coffre en haut ; boutons « Mes étoiles » et « Progression » (la journée et les 7 derniers jours). Les étoiles sont gardées sur l'appareil."
  ] },
  { v: '6.35', date: '2026-11-09', changes: [
    "Épeler à l'oral : plus d'essais. Si le micro se trompe de lettre, les lettres entendues s'affichent dans la case : corrige-les au clavier, puis touche « OK ». « Redire les lettres » recommence l'écoute."
  ] },
  { v: '6.34', date: '2026-11-09', changes: [
    "Épeler à l'oral : une réponse juste n'est plus refusée quand la reconnaissance vocale colle les lettres en un mot (« E, S, T, O, M, A, C » écrit « estomac »)."
  ] },
  { v: '6.33', date: '2026-11-09', changes: [
    "Orthographe : les questions sont rangées en 3 familles encadrées (✏️ Écrire un mot, 🔍 Trouver des lettres, 🔢 Compter), 3 par ligne, avec un bouton « Tout » par famille ; Voyelles et Consonnes sont côte à côte."
  ] },
  { v: '6.32', date: '2026-11-09', changes: [
    "Orthographe : « Réécrire le mot » devient une dictée au clavier : la voix lit le mot, une petite phrase d'exemple, puis le mot encore ; le joueur l'écrit et le jeu corrige (plus de « Bonne / Mauvaise réponse »)."
  ] },
  { v: '6.31', date: '2026-11-09', changes: [
    "Orthographe : « Épeler » devient « Épeler à l'oral » : touche « Parler » et dis les lettres du mot, le jeu les écoute et corrige (3 essais). Proposée seulement si l'appareil sait reconnaître la voix (pas dans Firefox, ni dans l'application installée sur iPhone).",
    "Si le micro ne marche pas pendant la partie, les autres joueurs jugent avec « Bonne / Mauvaise réponse »."
  ] },
  { v: '6.30', date: '2026-11-09', changes: [
    "Hors ligne (mode avion) : le plateau s'affiche correctement. Les deux plateaux (jour et soir) sont gardés en mémoire dès l'ouverture du jeu, un fichier manquant dans la copie hors ligne est retéléchargé dès que le réseau revient, et l'image se recharge seule au retour du réseau."
  ] },
  { v: '6.29', date: '2026-11-09', changes: [
    "Plus de « points » : chaque aventure compte dans son unité. Encadré du plateau « Pierres taillées 17 / 18 », message « Léa taille 3 pierres ! », fin de partie « L'équipe a taillé 17 pierres, il en fallait 18. » (troncs, épées, silex, gazelles, blocs, briques, rails, menhirs, pierres selon l'aventure)."
  ] },
  { v: '6.28', date: '2026-11-09', changes: [
    "Orthographe : un bouton « Tout sélectionner » sur l'écran des packs et sur celui des questions (il devient « Tout désélectionner » quand tout est coché)."
  ] },
  { v: '6.27', date: '2026-11-09', changes: [
    "Cartes : le titre « Carte n° 3 de Sam » disparaît ; seul le thème reste (ex. « Numérique · Mot mélangé »), écrit plus gros.",
    "Le bouton pour envoyer sa réponse s'appelle maintenant « OK » (au lieu de « Valider »)."
  ] },
  { v: '6.26', date: '2026-11-09', changes: [
    "Plateau : le bouton « Piocher une carte » s'appelle maintenant « Question suivante ».",
    "Plateau : le dé et ses points gagnés ne cachent plus le message « … gagne N points ! Au tour de … » : le dé glisse juste au-dessus du message.",
    "Téléphone : pendant qu'on écrit sa réponse, la case et « Valider » ne débordent plus sur le cadre de la carte."
  ] },
  { v: '6.25', date: '2026-11-04', changes: [
    "Menu : « Redémarrer partie » et « Retour à l'accueil » demandent une confirmation avant d'effacer la partie en cours."
  ] },
  { v: '6.24', date: '2026-11-04', changes: [
    "Accueil, sur téléphone et tablette : un bouton « Installer l'application » pour mettre l'icône d'Aventura sur l'écran d'accueil. Il n'apparaît pas quand le jeu est déjà ouvert comme application."
  ] },
  { v: '6.23', date: '2026-11-04', changes: [
    "Touche « précédent » du téléphone ou de la tablette : pendant la préparation, elle revient à l'étape précédente ; sur le plateau, elle ouvre le menu. Elle ne ferme plus l'application (sauf depuis l'accueil)."
  ] },
  { v: '6.22', date: '2026-11-04', changes: [
    "Plateau : le bouton « ☰ Menu » (en haut à gauche) ouvre trois choix au milieu de l'écran : « Redémarrer partie », « Modifier les choix » et « Retour à l'accueil ».",
    "« Modifier les choix » ramène à la préparation avec tous les choix gardés ; « Reprendre la partie » la continue là où elle en était, avec les nouveaux réglages (les points sont gardés)."
  ] },
  { v: '6.21', date: '2026-11-04', changes: [
    "Fin d'une manche : au lieu de « croix suivante », le jeu annonce où l'équipe part — « Au tour de Léa, en route vers le lac. » (puis le marais, les collines et le volcan)."
  ] },
  { v: '6.20', date: '2026-11-04', changes: [
    "Préparation : 1 joueur est sélectionné au départ (au lieu de 2)."
  ] },
  { v: '6.19', date: '2026-11-04', changes: [
    "Nouveaux personnages : les 10 aventuriers sont maintenant tes illustrations. Au choix des aventuriers, on voit leur buste sur un fond clair de la couleur de leur tenue ; sur le plateau, ils sont en pied et marchent d\u2019une croix à l\u2019autre en balançant les jambes."
  ] },
  { v: '6.18', date: '2026-11-04', changes: [
    "Orthographe : 2 nouvelles questions — « Le ou la ? » (« Un ou une ? » devant une voyelle : l\u2019école) et « Au pluriel » (un cheval → des chevaux)."
  ] },
  { v: '6.17', date: '2026-11-04', changes: [
    "Orthographe : 5 nouvelles questions — Lettre manquante (B_NANE), Mot mélangé (les lettres en désordre), Nombre de voyelles, Nombre de consonnes et Combien de fois cette lettre ?. Le joueur écrit sa réponse, le jeu corrige."
  ] },
  { v: '6.16', date: '2026-11-04', changes: [
    "Orthographe : 15 nouveaux packs de mots — Animaux, Lieux et constructions, Pays, Villes, Paysages et nature, Météo et saisons, Le corps, Aliments, Dans la maison, Vêtements, L\u2019école, Métiers, Transports, Couleurs et formes, Sports et musique.",
    "Préparation : en orthographe, on choisit d\u2019abord ses packs sur un écran, puis ses questions sur l\u2019écran suivant."
  ] },
  { v: '6.15', date: '2026-11-04', changes: [
    "Mathématiques : le niveau décide des nombres proposés. Facile : les tables de 1 à 10 ; Moyen : jusqu\u2019à 99 (unités et dizaines) ; Difficile : jusqu\u2019à 999 (et centaines) ; Expert : aussi « 1000+ ».",
    "Sous le niveau, le nombre de signes par calcul : 1 au Facile, jusqu\u2019à 2 au Moyen, 3 au Difficile, 4 en Expert. On peut en choisir plusieurs, chaque carte en prend un au hasard.",
    "Chaque calcul prend un nombre de chaque groupe choisi : avec 7, 8 et 50, on a 7 × 54 ou 8 × 56, plus 7 × 8.",
    "La règle « au moins 4 nombres » est retirée."
  ] },
  { v: '6.14', date: '2026-11-04', changes: [
    "Orthographe : pour le nombre de lettres, le nombre de syllabes, les consonnes, les voyelles et les lettres muettes, le joueur écrit lui-même sa réponse et le jeu la corrige. Plusieurs lettres peuvent être séparées par un espace, une virgule ou rien du tout (« a i o », « a,i,o » ou « aio ») ; les accents ne comptent pas.",
    "La question « Syllabes » devient « Nombre de syllabes » : on écrit combien il y en a, la correction montre le découpage.",
    "« Épeler » et « Réécrire le mot » restent à l\u2019oral, avec « Bonne réponse » / « Mauvaise réponse »."
  ] },
  { v: '6.13', date: '2026-11-04', changes: [
    "Téléphone et tablette : quand tu écris ta réponse, la carte se pose par-dessus le plateau et prend toute la place au-dessus du clavier. Rien n\u2019est caché par le clavier ni coupé en haut ; la case de réponse est juste au-dessus du clavier.",
    "Après « Valider », ou si tu refermes le clavier, le plateau revient tout seul."
  ] },
  { v: '6.12', date: '2026-11-04', changes: [
    "Mathématiques : les signes +, −, × et ÷ sont seuls dans des ronds, sur une seule ligne (le mot « Additionner » ne tenait pas dans sa case).",
    "Nouveaux choix : les dizaines (30 = les nombres de 30 à 39) et les centaines (300 = les nombres de 300 à 399), en plus des unités de 1 à 10. Au niveau Facile, ce sont des tables (30 → tables de 30 à 39).",
    "Un bouton « Tout sélectionner / Tout désélectionner » pour les unités, les dizaines et les centaines.",
    "Niveaux Moyen, Difficile et Expert : il faut choisir au moins 4 nombres (unités, dizaines et centaines comptées ensemble)."
  ] },
  { v: '6.11', date: '2026-11-04', changes: [
    "Ouverture de l\u2019application installée : sur iPhone, l\u2019écran de lancement est l\u2019image de l\u2019accueil en plein écran (aventurier, arche et boutons), sans saut à l\u2019arrivée sur l\u2019accueil.",
    "Sur Android, le téléphone fabrique lui-même cet écran (petite icône au centre) : son fond passe du vert au bleu du ciel de l\u2019accueil pour s\u2019y fondre. Le changement arrive sur le téléphone en général sous un ou deux jours, ou tout de suite en réinstallant l\u2019application."
  ] },
  { v: '6.10', date: '2026-11-04', changes: [
    "Accueil : la bulle de Ludo se place en haut, dans le ciel, et ne cache plus sa tête ni l\u2019arche « Aventura ». Sur les petits écrans sans assez de ciel, elle se fait plus étroite et se pose à côté de Ludo, dans l\u2019herbe."
  ] },
  { v: '6.9', date: '2026-11-03', changes: [
    "Ludo, l\u2019aventurier de l\u2019accueil, devient le guide du jeu. Au premier démarrage, il se présente et propose de montrer comment jouer ; le bouton « Didacticiel avec Ludo » de l\u2019accueil le relance.",
    "Didacticiel : à chaque écran de la préparation et pendant le premier tour, Ludo explique l\u2019étape dans une bulle de bande dessinée et une flèche rouge, qui grandit et rétrécit, montre où toucher.",
    "Pendant une partie, Ludo attend en bas à gauche : touche-le pour savoir quoi faire sur l\u2019écran en cours."
  ] },
  { v: '6.8', date: '2026-11-03', changes: [
    "Plateau : la page ne défile plus jamais, sur tous les écrans (ordinateur et téléphone en paysage compris). Sur un écran large, le plateau prend toute la hauteur et le tour de jeu est à droite ; s\u2019il manque de place (correction, tableau « ? »), l\u2019encadré s\u2019élargit par-dessus le plateau. Les boutons restent toujours à l\u2019écran.",
    "Correction : au tout début de la partie, toucher « Piocher une carte » au mauvais moment pouvait ne rien faire."
  ] },
  { v: '6.7', date: '2026-11-03', changes: [
    "Préparation, conjugaison : les groupes de verbes et le niveau sont en grands boutons qui prennent toute la place de l\u2019écran."
  ] },
  { v: '6.6', date: '2026-11-03', changes: [
    "Préparation, conjugaison : chaque mode choisi (indicatif, conditionnel…) est un cadre qui entoure ses propres temps, rangés l\u2019un sous l\u2019autre, pour ne pas se tromper de mode. Les cadres et les boutons prennent toute la place de l\u2019écran."
  ] },
  { v: '6.5', date: '2026-11-03', changes: [
    "Préparation, réglages Orthographe : packs et questions en grille de boutons de même taille, qui remplit l\u2019écran (4 par ligne sur un écran large, 2 sur un écran en hauteur)."
  ] },
  { v: '6.4', date: '2026-11-03', changes: [
    "Préparation, réglages Mathématiques : les choix sont centrés et prennent toute la place de l\u2019écran. Signes en grand sur deux lignes (Additionner et Soustraire, puis Multiplier et Diviser), nombres sur deux lignes (1 à 5, puis 6 à 10)."
  ] },
  { v: '6.3', date: '2026-11-03', changes: [
    "Conjugaison : chaque mode choisi doit avoir au moins un de ses temps. Avec Indicatif et Conditionnel, choisir seulement un temps de l\u2019indicatif est maintenant refusé, avec un message qui dit quel mode n\u2019a pas de temps."
  ] },
  { v: '6.2', date: '2026-11-03', changes: [
    'Téléphones et tablettes : le jeu tient dans l\u2019écran, on n\u2019a plus à faire défiler. Quand la correction ou le tableau « ? » ne tiennent plus sous le plateau, l\u2019encadré Tour de jeu remonte sur le plateau, juste de ce qu\u2019il faut ; il redescend quand le dé roule.',
    'Après une réponse écrite, la case disparaît et la correction rappelle ce qui a été écrit (« tu as écrit … »).'
  ] },
  { v: '6.1', date: '2026-11-03', changes: [
    'Après une erreur (mathématiques, orthographe ou conjugaison), la bonne réponse reste affichée et le dé attend que le joueur touche « J\u2019ai compris » (ce bouton s\u2019appelait « C\u2019est bon pour moi »). Une bonne réponse lance toujours le dé tout seul.'
  ] },
  { v: '6.0', date: '2026-11-03', changes: [
    'Conjugaison en trois petits écrans : la matière (Français → Conjugaison), puis les modes (indicatif, conditionnel, subjonctif, impératif) avec seulement les temps de ces modes, puis les groupes de verbes et le niveau.'
  ] },
  { v: '5.9', date: '2026-11-03', changes: [
    'Mathématiques : le niveau se choisit tout de suite, sur le même écran que « Mathématiques ».',
    'Niveau Facile : les nombres choisis sont des tables. Table de 2 → 2 × 8, 2 + 6, 12 − 2, 16 ÷ 2…, selon les signes choisis. Les autres niveaux ne changent pas.'
  ] },
  { v: '5.8', date: '2026-11-03', changes: [
    'Français → Conjugaison : chaque joueur choisit ses temps (rangés par mode : indicatif, conditionnel, subjonctif, impératif), les groupes de verbes et le niveau (des verbes de plus en plus rares).',
    'À chaque carte : un pronom, un verbe et un temps ; le joueur écrit la forme et le jeu la corrige. Si c\u2019est faux, la bonne réponse s\u2019affiche avec un « ? » qui montre toute la conjugaison du verbe à ce temps ; « C\u2019est bon pour moi » lance le dé.'
  ] },
  { v: '5.7', date: '2026-11-03', changes: [
    'Préparation, étape 3 : chaque joueur choisit d\u2019abord sa matière, Mathématiques ou Français (puis Orthographe).',
    'Mathématiques : choix des signes (+, −, ×, ÷), des nombres de 1 à 10 et du niveau (Facile = 1 signe, Moyen = 2, Difficile = 3, Expert = 4). À chaque carte, une formule ; le joueur écrit le résultat (entier, ou une décimale avec une division) et le jeu le corrige, puis le dé se lance tout seul.'
  ] },
  { v: '5.6', date: '2026-11-03', changes: [
    'Préparation, étape 3 : plus de cases à cocher. Chaque choix est simplement entouré, sur fond transparent, et se remplit de couleur quand il est choisi.'
  ] },
  { v: '5.5', date: '2026-11-03', changes: [
    'Encadré des points : les constructions (drakkar, épées, feu, pyramides, gazelles, muraille, voie ferrée, pierres levées, temple inca) sont redessinées dans le style des nouvelles images d\u2019aventure, avec le même décor que chaque histoire. La progression ne change pas.'
  ] },
  { v: '5.4', date: '2026-11-03', changes: [
    'Nouvelles images des 10 aventures (illustrations de la planche « histoires ») sur le choix de l\u2019aventure et sur le rouleau du plateau.'
  ] },
  { v: '5.3', date: '2026-11-03', changes: [
    'Choix de l\u2019aventure : le cadre rouge de l\u2019aventure choisie n\u2019est plus coupé sur les bords, il est dessiné à l\u2019intérieur de la carte.'
  ] },
  { v: '5.2', date: '2026-11-03', changes: [
    'Tour de jeu : « Léa gagne 3 points ! Au tour de Tom. » n\u2019est plus écrit dans l\u2019encadré, seulement sur le plateau.'
  ] },
  { v: '5.1', date: '2026-11-03', changes: [
    'Dé : les points sont noirs (plus de couleurs).'
  ] },
  { v: '5.0', date: '2026-11-03', changes: [
    'Cartes : le bouton « Voir le mot » est juste sous « Écouter », dans le même style, avec une icône d\u2019œil.'
  ] },
  { v: '4.9', date: '2026-11-03', changes: [
    'La question « Première lettre » n\u2019est plus proposée.'
  ] },
  { v: '4.8', date: '2026-11-03', changes: [
    'Préparation : plus de choix du niveau. Chaque joueur coche ses packs et pioche dans tous leurs mots, niveaux 1, 2 et 3 mélangés.',
    'Le pack « Lettres » n\u2019est plus proposé.'
  ] },
  { v: '4.7', date: '2026-11-03', changes: [
    'Choix des aventuriers : le cadre de couleur des personnages choisis (J1, J2…) n\u2019est plus coupé sur les bords de l\u2019écran, il est dessiné à l\u2019intérieur de la carte.'
  ] },
  { v: '4.6', date: '2026-11-02', changes: [
    'Préparation en écrans successifs, sans défiler : 1) nombre de joueurs, 2) chaque joueur choisit son aventurier, 3) chaque joueur choisit son niveau, ses packs et ses questions, 4) l\u2019aventure, puis « Lancer la partie ». Chaque écran a son bouton « Valider » ; « Retour » revient au joueur ou à l\u2019écran précédent.'
  ] },
  { v: '4.5', date: '2026-11-02', changes: [
    'Quand le dé est lancé, le personnage reste sur sa croix : il ne disparaît plus pour réapparaître.'
  ] },
  { v: '4.4', date: '2026-11-02', changes: [
    'Dé : les coins épousent le bord arrondi (les faces de derrière ne dépassent plus aux coins).'
  ] },
  { v: '4.3', date: '2026-11-02', changes: [
    'Tour de jeu : plus de commentaires après « Bonne réponse » / « Mauvaise réponse » ni au moment de piocher, et plus de bouton « Lancer le dé » : le dé se lance tout seul.'
  ] },
  { v: '4.2', date: '2026-11-02', changes: [
    'Sur le plateau, les aventuriers sont debout (corps entier) sur un socle à la couleur du joueur, au lieu d\u2019un visage dans un rond.',
    'Ils marchent d\u2019une croix à l\u2019autre : jambes et bras qui se balancent, et ils se tournent dans le sens de la route.'
  ] },
  { v: '4.1', date: '2026-11-02', changes: [
    'Les personnages suivent la route pour aller d\u2019une croix à l\u2019autre (et non plus en ligne droite) : chemin pavé, pont, sentier du marais, descente vers le volcan. Chaque déplacement dure 1,5 seconde.'
  ] },
  { v: '4.0', date: '2026-11-02', changes: [
    'La partie en cours n\u2019est plus perdue : rafraîchir la page, aller sur une autre page ou mettre l\u2019écran en veille, on reprend au même endroit. Elle ne repart de l\u2019accueil que si la page est fermée.'
  ] },
  { v: '3.9', date: '2026-11-02', changes: [
    'Préparation : les packs et les questions sont décochés au départ, chaque joueur coche les siens. Si un joueur n\u2019a rien coché, « Lancer la partie » affiche ses réglages avec un message.'
  ] },
  { v: '3.8', date: '2026-11-02', changes: [
    'Tour de jeu : la mention « Croix 1 sur 5 — la prairie » n\u2019est plus affichée.'
  ] },
  { v: '3.7', date: '2026-11-02', changes: [
    'Points de l\u2019équipe : le chiffre n\u2019est plus écrit deux fois (ombre décalée retirée), il reste seulement en rouge.'
  ] },
  { v: '3.6', date: '2026-11-02', changes: [
    'Encadré des points horizontal : la construction à gauche, le comptage des points à sa droite. Sur téléphone, il ne cache plus la croix de la prairie.'
  ] },
  { v: '3.5', date: '2026-11-02', changes: [
    'Sur la carte, nouveau bouton « Voir le mot » à côté de « Voir la réponse » : le mot seul, comme une aide avant la solution.'
  ] },
  { v: '3.4', date: '2026-11-02', changes: [
    'Après l\u2019animation « Bravo ! » ou « Oups ! », le bon dé (FORT ou FAIBLE) se lance tout seul. Le bouton reste là pour le lancer plus tôt.'
  ] },
  { v: '3.3', date: '2026-11-02', changes: [
    'Préparation : bouton « Mêmes réglages pour tous les joueurs » (mêmes packs, même niveau, mêmes questions).'
  ] },
  { v: '3.2', date: '2026-11-02', changes: [
    'Huit types de questions : épeler, nombre de lettres, syllabes, consonnes, voyelles, première lettre, lettres muettes, réécrire le mot.',
    'À la préparation, chaque joueur coche les questions qu\u2019il veut ; chaque carte en tire une au hasard.',
    '« Voir la réponse » montre le mot et la réponse attendue (lettres muettes surlignées). La voix lit la question tirée.'
  ] },
  { v: '3.1', date: '2026-11-02', changes: [
    'Sous les points, ce que l\u2019équipe construit (drakkar, épées, grand feu, pyramide…) se construit étape par étape au fil des points, et il est complet quand l\u2019objectif est atteint.'
  ] },
  { v: '3.0', date: '2026-11-02', changes: [
    'Bonne réponse : le pion saute, des confettis éclatent et « Bravo ! » s\u2019affiche.',
    'Mauvaise réponse : le pion tremble et « Oups ! » s\u2019affiche.'
  ] },
  { v: '2.9', date: '2026-11-02', changes: [
    'Quand on lance le dé, un vrai dé roule sur le plateau, rebondit et montre les points gagnés.'
  ] },
  { v: '2.8', date: '2026-11-02', changes: [
    'Les points de l\u2019équipe sont affichés dans un encadré en haut à gauche du plateau.',
    'Plateau épuré : plus d\u2019encadrés Joueurs, Dés, Tas de cartes ni Ambiance.',
    'L\u2019ambiance jour ou soir se règle toute seule selon l\u2019aventure.',
    'En début de partie, le premier aventurier part de DÉPART et marche jusqu\u2019à la prairie.',
    'Après le dé, c\u2019est écrit (« Léa gagne 5 points ! Au tour de Tom. ») et on passe tout seul au joueur suivant.'
  ] },
  { v: '2.7', date: '2026-11-02', changes: [
    'Illustrations des aventures plus élaborées, dans l\u2019esprit du dessin de l\u2019aventurier : trait d\u2019encre irrégulier, hachures dans les ombres, couleurs peintes et grain de papier, plus de détails.'
  ] },
  { v: '2.6', date: '2026-11-02', changes: [
    'Les cartes JEU arrivent : 300 cartes en 5 packs (Mots simples, Mots compliqués, Temps, Numérique, Lettres), 3 niveaux chacun.',
    'À la préparation, chaque joueur choisit les packs où il pioche et son niveau.',
    'Dictée : le mot reste caché, « Voir le mot » permet de vérifier. Pour les lettres : « Quelle est cette lettre ? ».',
    'Bouton « Écouter » : une voix lit la carte à haute voix.'
  ] },
  { v: '2.5', date: '2026-11-02', changes: [
    'Toutes les aventures ont maintenant une illustration dessinée, dans le style du plateau (comme Préhistoire) à la place des photos.'
  ] },
  { v: '2.4', date: '2026-11-02', changes: [
    'On joue ! Chacun son tour, le joueur avance sur la croix et pioche une carte dans son propre tas.',
    'Le maître du jeu indique si la réponse est bonne : bonne réponse = dé FORT, mauvaise réponse = aide des autres puis dé FAIBLE.',
    'Les points du dé s\u2019ajoutent aux points de l\u2019équipe ; tous les joueurs passent une croix avant d\u2019aller à la suivante.',
    'À l\u2019ARRIVÉE : aventure réussie si l\u2019équipe atteint l\u2019objectif, avec « Rejouer » ou « Nouvelle partie ».',
    'Les cartes n\u2019ont pas encore de questions : le maître du jeu pose les siennes.'
  ] },
  { v: '2.3', date: '2026-11-02', changes: [
    'Chaque joueur choisit son aventurier parmi 10 personnages : Léa, Tom, Nour, Malo, Inès, Papi Jo, Kenji, Zoé, Sam et Awa.',
    'Le portrait de l\u2019aventurier apparaît sur son pion, dans la liste des joueurs et sur son tas de cartes.'
  ] },
  { v: '2.2', date: '2026-11-02', changes: [
    'Nouvel écran « Préparer la partie » : nombre de joueurs (1 à 4) et choix de l\u2019aventure parmi 10.',
    'Le nom et l\u2019image de l\u2019aventure s\u2019affichent sur le rouleau du plateau, à la place de « MISSION ».',
    'Objectif de l\u2019équipe affiché avec une jauge : 15, 18 ou 21 points par joueur selon la difficulté de l\u2019aventure.',
    'Chaque joueur a son propre tas de cartes, de la couleur de son pion (rouge, jaune, bleu, vert).'
  ] },
  { v: '2.1', date: '2026-11-02', changes: [
    'Les dés se lancent en les touchant.',
    'Dé FAIBLE : 2 faces à 1, 2 faces à 2, 2 faces à 3 points. Dé FORT : 2 faces à 4, 2 faces à 5, 2 faces à 6 points.'
  ] },
  { v: '2.0', date: '2026-11-02', changes: [
    'Le jeu devient Aventura, avec les vraies illustrations du jeu de société.',
    'Accueil composé comme la boîte : arche « Aventura », aventurier, décor et herbes.',
    'Plateau illustré avec les 4 pions sur la case DÉPART, les points de l\u2019équipe, les dés FAIBLE et FORT et les piles de cartes.',
    'Ambiance Jour ou Soir (les deux versions du plateau).',
    'Pas encore de questions : visuel seulement. Le jeu de calcul de la v1.0 est retiré.'
  ] },
  { v: '1.0', date: '2026-11-01', changes: [
    'Première version de Ludoaventura : l\u2019île aux calculs.',
    'Quatre niveaux : Moussaillon (dès 5 ans), Matelot (dès 7 ans), Navigateur (dès 9 ans), Capitaine (ados et adultes).',
    'Cinq lieux à traverser (plage, forêt, rivière, grotte, volcan), 5 calculs par lieu, jusqu\u2019à 3 étoiles.',
    'Progression mémorisée sur l\u2019appareil, jouable hors ligne et installable comme une application.'
  ] }
];
