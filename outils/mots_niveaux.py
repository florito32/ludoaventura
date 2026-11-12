"""Mots des niveaux Difficile (série 4) et Expert (série 5) de l'orthographe — v6.50.

Demande de l'utilisateur du 12/11/2026 : en Expert, les mots étaient trop faciles. Choix de l'utilisateur :
« durcir aussi Difficile » → Facile = séries 1 et 2 du fichier Excel, Moyen = série 3,
Difficile = série 4 et Expert = série 5 ci-dessous (mots écrits par Claude, pas dans l'Excel).

Une ligne par mot : MOT | lettres muettes | genre | pluriel | phrase d'exemple
  - lettres muettes : la lettre muette en minuscule (mêmes règles que outils/cartes.py : consonne finale
    non prononcée, e muet final, h hors ch/ph/th) ; vide = aucune ; « - » = question non posée
    (prononciation variable ou piège discutable) ;
  - genre : m, f, ou « - » (pas de question « Le ou la ? » : nom de ville, métier identique au masculin
    et au féminin, adjectif, nombre…) ;
  - pluriel : vide = le mot + S ; « - » = question non posée ; sinon le pluriel écrit en entier ;
  - phrase : lue par « Phrase d'exemple » et par la dictée ; elle contient le mot.
Lancer ensuite : python3 outils/cartes.py (régénère js/cartes.js et ajoute les phrases à js/phrases.js).
"""

DONNEES = {
'animaux': {
'4': """
RHINOCÉROS | RhINOCÉROS | m | RHINOCÉROS | Le rhinocéros a une corne sur le nez.
CHIMPANZÉ |  | m |  | Le chimpanzé mange une banane.
DAUPHIN |  | m |  | Le dauphin saute hors de l'eau.
ESCARGOT | ESCARGOt | m |  | L'escargot avance tout doucement.
GRENOUILLE | GRENOUILLe | f |  | La grenouille saute dans la mare.
SAUTERELLE | SAUTERELLe | f |  | Une sauterelle se cache dans l'herbe.
CHAUVE-SOURIS | CHAUVe-SOURIs | f | CHAUVES-SOURIS | La chauve-souris vole la nuit.
PHOQUE | PHOQUe | m |  | Le phoque dort sur la banquise.
""",
'5': """
ORNITHORYNQUE | ORNITHORYNQUe | m |  | L'ornithorynque a un bec de canard.
HIPPOCAMPE | hIPPOCAMPe | m |  | L'hippocampe nage tout droit.
PHACOCHÈRE | PHACOCHÈRe | m |  | Le phacochère creuse la terre avec son groin.
CAMÉLÉON |  | m |  | Le caméléon change de couleur.
CHEVREUIL |  | m |  | Un chevreuil traverse la forêt.
PTÉRODACTYLE | PTÉRODACTYLe | m |  | Le ptérodactyle volait au temps des dinosaures.
COCCINELLE | COCCINELLe | f |  | Une coccinelle se pose sur ma main.
ÉPERVIER | ÉPERVIEr | m |  | L'épervier tourne au-dessus du champ.
""",
},
'lieux': {
'4': """
CATHÉDRALE | CATHÉDRALe | f |  | La cathédrale a deux grandes tours.
GYMNASE | GYMNASe | m |  | Nous faisons du sport au gymnase.
CHAPELLE | CHAPELLe | f |  | Une petite chapelle se dresse sur la colline.
FORTERESSE | FORTERESSe | f |  | La forteresse protège la ville.
LABORATOIRE | LABORATOIRe | m |  | La savante travaille dans son laboratoire.
PHARMACIE | PHARMACIe | f |  | Maman achète du sirop à la pharmacie.
MAIRIE | MAIRIe | f |  | Les mariés sortent de la mairie.
CIMETIÈRE | CIMETIÈRe | m |  | De vieux arbres poussent dans le cimetière.
""",
'5': """
AMPHITHÉÂTRE | AMPHITHÉÂTRe | m |  | Les Romains se réunissaient dans l'amphithéâtre.
BASILIQUE | BASILIQUe | f |  | La basilique domine toute la ville.
MONASTÈRE | MONASTÈRe | m |  | Les moines vivent dans un monastère.
OBSERVATOIRE | OBSERVATOIRe | m |  | On regarde les étoiles depuis l'observatoire.
AQUEDUC |  | m |  | L'aqueduc amenait l'eau jusqu'à la ville.
CITADELLE | CITADELLe | f |  | La citadelle est bâtie sur un rocher.
HYPERMARCHÉ | hYPERMARCHÉ | m |  | Nous faisons les courses à l'hypermarché.
GRATTE-CIEL | GRATTe-CIEL | m | - | Le gratte-ciel touche presque les nuages.
""",
},
'pays': {
'4': """
AUTRICHE | AUTRICHe | f | - | Vienne est la capitale de l'Autriche.
IRLANDE | IRLANDe | f | - | L'Irlande est une île très verte.
POLOGNE | POLOGNe | f | - | Mon cousin habite en Pologne.
TURQUIE | TURQUIe | f | - | La Turquie est entre l'Europe et l'Asie.
HONGRIE | hONGRIe | f | - | Le Danube traverse la Hongrie.
SUÈDE | SUÈDe | f | - | Il neige beaucoup en Suède.
ÉTHIOPIE | ÉTHIOPIe | f | - | L'Éthiopie se trouve en Afrique.
COLOMBIE | COLOMBIe | f | - | On cultive du café en Colombie.
""",
'5': """
AFGHANISTAN | AFGhANISTAN | m | - | L'Afghanistan a de hautes montagnes.
KAZAKHSTAN | KAZAKhSTAN | m | - | Le Kazakhstan est un immense pays.
PHILIPPINES | PHILIPPINes | - | - | Les Philippines comptent des milliers d'îles.
MOZAMBIQUE | MOZAMBIQUe | m | - | Le Mozambique borde l'océan Indien.
AZERBAÏDJAN |  | m | - | L'Azerbaïdjan touche la mer Caspienne.
LIECHTENSTEIN | - | m | - | Le Liechtenstein est un tout petit pays.
MADAGASCAR |  | - | - | Les lémuriens vivent à Madagascar.
NOUVELLE-ZÉLANDE | NOUVELLe-ZÉLANDe | f | - | La Nouvelle-Zélande est au bout du monde.
""",
},
'villes': {
'4': """
CHAMONIX | CHAMONIx | - | - | On skie à Chamonix, au pied du mont Blanc.
CHERBOURG | CHERBOURg | - | - | Le bateau arrive au port de Cherbourg.
BESANÇON |  | - | - | Besançon est entourée par une rivière.
VERSAILLES | VERSAILLes | - | - | Le roi vivait au château de Versailles.
LIMOGES | LIMOGes | - | - | Limoges est connue pour sa porcelaine.
ORLÉANS | ORLÉANs | - | - | Jeanne d'Arc a libéré Orléans.
BAYONNE | BAYONNe | - | - | Nous mangeons du jambon de Bayonne.
CARCASSONNE | CARCASSONNe | - | - | Carcassonne a de très hauts remparts.
""",
'5': """
BIARRITZ |  | - | - | Les surfeurs adorent les vagues de Biarritz.
SAINT-ÉTIENNE | SAINt-ÉTIENNe | - | - | Mon oncle habite à Saint-Étienne.
AIX-EN-PROVENCE | AIX-EN-PROVENCe | - | - | Il fait chaud à Aix-en-Provence.
REIMS | - | - | - | Les rois étaient sacrés à Reims.
COPENHAGUE | COPENhAGUe | - | - | La petite sirène est à Copenhague.
ÉDIMBOURG | ÉDIMBOURg | - | - | Un château domine Édimbourg.
PHILADELPHIE | PHILADELPHIe | - | - | Philadelphie est une ville des États-Unis.
SAINT-PÉTERSBOURG | SAINt-PÉTERSBOURg | - | - | Il fait très froid l'hiver à Saint-Pétersbourg.
""",
},
'nature': {
'4': """
MARAIS | MARAIs | m | MARAIS | Les canards nagent dans le marais.
PRESQU'ÎLE | PRESQU'ÎLe | f | PRESQU'ÎLES | La presqu'île est presque entourée d'eau.
ARCHIPEL |  | m |  | L'archipel compte une dizaine d'îles.
LAGUNE | LAGUNe | f |  | L'eau de la lagune est calme.
CRATÈRE | CRATÈRe | m |  | De la fumée sort du cratère.
SOMMET | SOMMEt | m |  | Nous arrivons au sommet de la montagne.
RUISSEAU |  | m | RUISSEAUX | Le ruisseau coule entre les pierres.
OASIS |  | f | OASIS | Les chameaux boivent à l'oasis.
""",
'5': """
STALACTITE | STALACTITe | f |  | Une stalactite pend du plafond de la grotte.
STALAGMITE | STALAGMITe | f |  | La stalagmite pousse depuis le sol.
ATOLL |  | m |  | L'atoll est un anneau de corail.
FJORD | - | m |  | Le bateau entre dans le fjord.
GEYSER | - | m |  | Le geyser crache de l'eau chaude.
ESTUAIRE | ESTUAIRe | m |  | Le fleuve rejoint la mer dans l'estuaire.
MANGROVE | MANGROVe | f |  | Les arbres de la mangrove ont les pieds dans l'eau.
ÉCOSYSTÈME | ÉCOSYSTÈMe | m |  | La forêt est un écosystème fragile.
""",
},
'meteo': {
'4': """
BOURRASQUE | BOURRASQUe | f |  | Une bourrasque emporte mon chapeau.
CANICULE | CANICULe | f |  | Pendant la canicule, il faut boire de l'eau.
SÉCHERESSE | SÉCHERESSe | f |  | La sécheresse a jauni l'herbe.
HUMIDITÉ | hUMIDITÉ | f | - | L'humidité fait friser mes cheveux.
BRUINE | BRUINe | f | - | Une fine bruine mouille la route.
GIBOULÉE | GIBOULÉe | f |  | Les giboulées arrivent au mois de mars.
ÉCLAIRCIE | ÉCLAIRCIe | f |  | Profitons de l'éclaircie pour sortir.
THERMOMÈTRE | THERMOMÈTRe | m |  | Le thermomètre indique vingt degrés.
""",
'5': """
TYPHON |  | m |  | Le typhon souffle sur la mer de Chine.
CYCLONE | CYCLONe | m |  | Le cyclone tourne au-dessus de l'océan.
BLIZZARD | BLIZZARd | m |  | Le blizzard soulève la neige.
MOUSSON |  | f |  | La mousson apporte de fortes pluies.
ANTICYCLONE | ANTICYCLONe | m |  | L'anticyclone nous promet du beau temps.
ÉQUINOXE | ÉQUINOXe | m |  | À l'équinoxe, le jour dure autant que la nuit.
SOLSTICE | SOLSTICe | m |  | Le solstice d'été est le jour le plus long.
BAROMÈTRE | BAROMÈTRe | m |  | Le baromètre annonce la pluie.
""",
},
'corps': {
'4': """
CERVEAU |  | m | CERVEAUX | Le cerveau commande tout le corps.
NOMBRIL | - | m |  | Le bébé montre son nombril.
MÂCHOIRE | MÂCHOIRe | f |  | Le requin a une mâchoire puissante.
NARINE | NARINe | f |  | L'air entre par la narine.
CLAVICULE | CLAVICULe | f |  | Il s'est cassé la clavicule au ski.
GENCIVE | GENCIVe | f |  | Ma gencive saigne un peu.
ARTÈRE | ARTÈRe | f |  | Le sang circule dans l'artère.
THORAX |  | m | THORAX | Le thorax protège le cœur.
""",
'5': """
PHALANGE | PHALANGe | f |  | Chaque doigt a trois phalanges, sauf le pouce.
TRACHÉE | TRACHÉe | f |  | L'air descend par la trachée.
PANCRÉAS |  | m | PANCRÉAS | Le pancréas aide à digérer.
OMOPLATE | OMOPLATe | f |  | J'ai mal à l'omoplate gauche.
LARYNX |  | m | LARYNX | Le larynx nous permet de parler.
PHARYNX |  | m | PHARYNX | Le pharynx est au fond de la gorge.
TYMPAN |  | m |  | Le tympan vibre quand on entend un son.
DIAPHRAGME | DIAPHRAGMe | m |  | Le diaphragme nous aide à respirer.
""",
},
'aliments': {
'4': """
CONFITURE | CONFITURe | f |  | Je mets de la confiture sur ma tartine.
CORNICHON |  | m |  | Papa coupe un cornichon.
CHOU-FLEUR |  | m | CHOUX-FLEURS | Le chou-fleur est blanc comme un nuage.
BROCOLI |  | m |  | Le brocoli ressemble à un petit arbre.
COURGETTE | COURGETTe | f |  | Mamie fait une soupe de courgette.
POIREAU |  | m | POIREAUX | Le poireau dépasse du panier.
PAMPLEMOUSSE | PAMPLEMOUSSe | m |  | Le pamplemousse est un peu amer.
MYRTILLE | MYRTILLe | f |  | Nous cueillons des myrtilles dans la forêt.
""",
'5': """
ARTICHAUT | ARTICHAUt | m |  | On mange l'artichaut feuille par feuille.
RHUBARBE | RhUBARBe | f | - | Mamie prépare une tarte à la rhubarbe.
ÉCHALOTE | ÉCHALOTe | f |  | Le cuisinier émince une échalote.
CÉLERI |  | m |  | Le céleri croque sous la dent.
MOZZARELLA |  | f | - | La pizza est couverte de mozzarella.
FENOUIL |  | m | - | Le fenouil sent un peu l'anis.
GROSEILLE | GROSEILLe | f |  | La groseille est une petite baie rouge.
PISTACHE | PISTACHe | f |  | J'adore la glace à la pistache.
""",
},
'maison': {
'4': """
CANAPÉ |  | m |  | Le chat dort sur le canapé.
FAUTEUIL |  | m |  | Papi lit dans son fauteuil.
VAISSELLE | VAISSELLe | f | - | Après le repas, je fais la vaisselle.
COUVERTURE | COUVERTURe | f |  | La couverture me tient chaud.
GRILLE-PAIN | GRILLe-PAIN | m | - | Le grille-pain fait sauter les tartines.
LAVABO |  | m |  | Je me lave les mains au lavabo.
PLAFOND | PLAFONd | m |  | Une araignée court au plafond.
RIDEAU |  | m | RIDEAUX | Je ferme le rideau pour dormir.
""",
'5': """
THERMOSTAT | THERMOSTAt | m |  | Papa baisse le thermostat du chauffage.
ABAT-JOUR | ABAt-JOUR | m | - | L'abat-jour adoucit la lumière.
ESCABEAU |  | m | ESCABEAUX | Je monte sur l'escabeau pour attraper le pot.
BOUILLOIRE | BOUILLOIRe | f |  | La bouilloire siffle dans la cuisine.
VESTIBULE | VESTIBULe | m |  | Nous laissons nos bottes dans le vestibule.
PERSIENNE | PERSIENNe | f |  | Le soleil passe à travers la persienne.
TABOURET | TABOUREt | m |  | Je m'assois sur le tabouret.
CHAUFFE-EAU | CHAUFFe-EAU | m | - | Le chauffe-eau est dans le garage.
""",
},
'vetements': {
'4': """
SURVÊTEMENT | SURVÊTEMENt | m |  | Je mets mon survêtement pour le sport.
MOUFLE | MOUFLe | f |  | J'ai perdu une moufle dans la neige.
CRAVATE | CRAVATe | f |  | Papa met une cravate pour le mariage.
GILET | GILEt | m |  | Ferme ton gilet, il fait froid.
BRETELLE | BRETELLe | f |  | La bretelle de mon sac est cassée.
COLLANT | COLLANt | m |  | Elle porte un collant rouge.
TABLIER | TABLIEr | m |  | Le boulanger met son tablier.
ESPADRILLE | ESPADRILLe | f |  | L'été, je marche en espadrilles.
""",
'5': """
MOCASSIN |  | m |  | Il porte des mocassins en cuir.
BERMUDA |  | m |  | En vacances, je porte un bermuda.
SOMBRERO |  | m |  | Le sombrero protège bien du soleil.
CHÂLE | CHÂLe | m |  | Mamie pose un châle sur ses épaules.
PARDESSUS | PARDESSUs | m | PARDESSUS | Il enfile son pardessus pour sortir.
CACHE-NEZ | CACHe-NEz | m | CACHE-NEZ | Le cache-nez me protège du vent.
DÉBARDEUR |  | m |  | Il fait chaud, je mets un débardeur.
ESCARPIN |  | m |  | La danseuse porte des escarpins.
""",
},
'ecole': {
'4': """
CALCULATRICE | CALCULATRICe | f |  | La calculatrice fait les multiplications.
CANTINE | CANTINe | f |  | À midi, je mange à la cantine.
AGENDA |  | m |  | J'écris mes devoirs dans mon agenda.
SURLIGNEUR |  | m |  | Je colorie le titre avec le surligneur.
PUPITRE | PUPITRe | m |  | Le livre est posé sur le pupitre.
CLASSEUR |  | m |  | Je range mes feuilles dans le classeur.
BUVARD | BUVARd | m |  | Le buvard boit l'encre.
CONJUGAISON |  | f | - | Aujourd'hui, nous faisons de la conjugaison.
""",
'5': """
ORTHOGRAPHE | ORTHOGRAPHe | f | - | Je fais attention à l'orthographe.
GÉOGRAPHIE | GÉOGRAPHIe | f | - | En géographie, nous étudions les fleuves.
GRAMMAIRE | GRAMMAIRe | f |  | La leçon de grammaire porte sur le verbe.
ENCYCLOPÉDIE | ENCYCLOPÉDIe | f |  | Je cherche les volcans dans l'encyclopédie.
PHOTOCOPIE | PHOTOCOPIe | f |  | La maîtresse distribue une photocopie.
RAPPORTEUR |  | m |  | Je mesure l'angle avec le rapporteur.
ARITHMÉTIQUE | ARITHMÉTIQUe | f | - | L'arithmétique, c'est l'art de calculer.
TAILLE-CRAYON | TAILLe-CRAYON | m | - | Mon taille-crayon est plein de copeaux.
""",
},
'metiers': {
'4': """
AGRICULTEUR |  | m |  | L'agriculteur conduit son tracteur.
CHAUFFEUR |  | m |  | Le chauffeur du car nous attend.
PLOMBIER | PLOMBIEr | m |  | Le plombier répare le robinet.
HORLOGER | hORLOGEr | m |  | L'horloger répare la vieille pendule.
PÂTISSIER | PÂTISSIEr | m |  | Le pâtissier prépare des éclairs.
BIJOUTIER | BIJOUTIEr | m |  | Le bijoutier vend des bagues.
PHOTOGRAPHE | PHOTOGRAPHe | - |  | Le photographe prend la classe en photo.
MÉCANICIEN |  | m |  | Le mécanicien change la roue.
""",
'5': """
PSYCHOLOGUE | PSYCHOLOGUe | - |  | La psychologue écoute l'enfant.
ORTHOPHONISTE | ORTHOPHONISTe | - |  | L'orthophoniste m'aide à bien parler.
KINÉSITHÉRAPEUTE | KINÉSITHÉRAPEUTe | - |  | Le kinésithérapeute soigne mon genou.
OPHTALMOLOGUE | OPHTALMOLOGUe | - |  | L'ophtalmologue examine mes yeux.
ARCHÉOLOGUE | ARCHÉOLOGUe | - |  | L'archéologue a trouvé un vieux vase.
CHORÉGRAPHE | CHORÉGRAPHe | - |  | La chorégraphe invente la danse du spectacle.
PALÉONTOLOGUE | PALÉONTOLOGUe | - |  | Le paléontologue étudie les os de dinosaures.
ANESTHÉSISTE | ANESTHÉSISTe | - |  | L'anesthésiste endort le malade avant l'opération.
""",
},
'transports': {
'4': """
CAMIONNETTE | CAMIONNETTe | f |  | Le livreur gare sa camionnette.
MOTONEIGE | MOTONEIGe | f |  | La motoneige file sur la glace.
DIRIGEABLE | DIRIGEABLe | m |  | Un dirigeable flotte au-dessus de la ville.
VOILIER | VOILIEr | m |  | Le voilier glisse sur la mer.
PÉNICHE | PÉNICHe | f |  | La péniche avance lentement sur le canal.
LOCOMOTIVE | LOCOMOTIVe | f |  | La locomotive tire tous les wagons.
CATAMARAN |  | m |  | Le catamaran a deux coques.
AÉROGLISSEUR |  | m |  | L'aéroglisseur passe de la mer à la plage.
""",
'5': """
HYDRAVION | hYDRAVION | m |  | L'hydravion se pose sur le lac.
MONOCYCLE | MONOCYCLe | m |  | Le clown roule sur un monocycle.
FUNICULAIRE | FUNICULAIRe | m |  | Le funiculaire grimpe la colline.
TÉLÉCABINE | TÉLÉCABINe | f |  | La télécabine nous monte au sommet.
DÉPANNEUSE | DÉPANNEUSe | f |  | La dépanneuse remorque la voiture.
BATHYSCAPHE | BATHYSCAPHe | m |  | Le bathyscaphe plonge au fond de l'océan.
TRANSATLANTIQUE | TRANSATLANTIQUe | m |  | Le transatlantique traverse l'océan.
CHASSE-NEIGE | CHASSe-NEIGe | m | - | Le chasse-neige dégage la route.
""",
},
'couleurs': {
'4': """
PENTAGONE | PENTAGONe | m |  | Le pentagone a cinq côtés.
HEXAGONE | HEXAGONe | m |  | L'hexagone a six côtés.
SPHÈRE | SPHÈRe | f |  | Une balle a la forme d'une sphère.
PYRAMIDE | PYRAMIDe | f |  | Je dessine une pyramide.
POURPRE | POURPRe | - | - | Le roi porte un manteau pourpre.
ÉCARLATE | ÉCARLATe | - | - | Elle est devenue écarlate de honte.
KAKI |  | - | - | Le soldat porte une veste kaki.
ARGENTÉ |  | - | - | Le papier argenté brille.
""",
'5': """
PARALLÉLOGRAMME | PARALLÉLOGRAMMe | m |  | Le parallélogramme a ses côtés opposés parallèles.
PARALLÉLÉPIPÈDE | PARALLÉLÉPIPÈDe | m |  | Une boîte à chaussures est un parallélépipède.
TRAPÈZE | TRAPÈZe | m |  | Le trapèze a deux côtés parallèles.
POLYGONE | POLYGONe | m |  | Un triangle est un polygone.
ELLIPSE | ELLIPSe | f |  | La Terre tourne en dessinant une ellipse.
VERMILLON |  | - | - | Le coucher de soleil est vermillon.
FUCHSIA | - | - | - | Elle porte une robe fuchsia.
CRAMOISI |  | - | - | Ses joues sont cramoisies de froid.
""",
},
'loisirs': {
'4': """
CLARINETTE | CLARINETTe | f |  | Ma sœur joue de la clarinette.
SAXOPHONE | SAXOPHONe | m |  | Le saxophone joue un air de jazz.
VIOLONCELLE | VIOLONCELLe | m |  | Le violoncelle a une voix grave.
RANDONNÉE | RANDONNÉe | f |  | Nous partons en randonnée dans la montagne.
PLONGÉE | PLONGÉe | f | - | En plongée, on voit des poissons.
PATINAGE | PATINAGe | m | - | Je fais du patinage sur la glace.
ATHLÉTISME | ATHLÉTISMe | m | - | Le saut en longueur est une épreuve d'athlétisme.
CYCLISME | CYCLISMe | m | - | Le cyclisme demande de bonnes jambes.
""",
'5': """
HAUTBOIS | hAUTBOIs | m | HAUTBOIS | Le hautbois a un son doux.
HARMONICA | hARMONICA | m |  | Papi souffle dans son harmonica.
BADMINTON |  | m | - | Au badminton, on frappe un volant.
HANDBALL | - | m | - | Au handball, on lance le ballon avec la main.
TRIATHLON |  | m | - | Le triathlon enchaîne nage, vélo et course.
CONTREBASSE | CONTREBASSe | f |  | La contrebasse est plus grande que moi.
SYNTHÉTISEUR |  | m |  | Le synthétiseur imite tous les instruments.
RUGBY |  | m | - | Au rugby, le ballon est ovale.
""",
},
'temps': {
'4': """
TRIMESTRE | TRIMESTRe | m |  | Le premier trimestre se termine à Noël.
CALENDRIER | CALENDRIEr | m |  | J'entoure mon anniversaire sur le calendrier.
DÉCENNIE | DÉCENNIe | f |  | Une décennie dure dix ans.
LENDEMAIN |  | m |  | Le lendemain, il a neigé.
MINUIT | MINUIt | m | - | À minuit, tout le monde dort.
QUINZAINE | QUINZAINe | f |  | Nous partons une quinzaine de jours.
ANNIVERSAIRE | ANNIVERSAIRe | m |  | Pour mon anniversaire, j'ai eu un vélo.
WEEK-END | - | m | - | Ce week-end, nous allons chez Mamie.
""",
'5': """
MILLÉNAIRE | MILLÉNAIRe | m |  | Ce château a presque un millénaire.
HEBDOMADAIRE | hEBDOMADAIRe | m |  | Papa lit un hebdomadaire.
SEMESTRE | SEMESTRe | m |  | Un semestre dure six mois.
AVANT-VEILLE | AVANt-VEILLe | f | - | L'avant-veille de Noël, nous faisons le sapin.
CRÉPUSCULE | CRÉPUSCULe | m |  | Au crépuscule, le ciel devient orange.
ÉPHÉMÉRIDE | ÉPHÉMÉRIDe | f |  | Chaque matin, j'arrache une page de l'éphéméride.
BISSEXTILE | BISSEXTILe | - | - | Une année bissextile compte un jour de plus.
QUOTIDIEN |  | m |  | Le quotidien du matin est sur la table.
""",
},
'numerique': {
'4': """
VINGT-ET-UN | - | - | - | Nous sommes vingt-et-un dans la classe.
SOIXANTE-ET-ONZE | - | - | - | Papi a soixante-et-onze ans.
QUATRE-VINGTS | - | - | - | Le livre a quatre-vingts pages.
DEUX-CENTS | - | - | - | Il y a deux-cents élèves dans l'école.
TRENTE-SIX | - | - | - | J'ai trente-six images dans mon album.
CINQUANTE-HUIT | - | - | - | Le bus numéro cinquante-huit passe devant chez moi.
QUATRE-VINGT-UN | - | - | - | Mamie a fêté ses quatre-vingt-un ans.
SOIXANTE-SEIZE | - | - | - | La page soixante-seize est déchirée.
""",
'5': """
QUATRE-VINGT-DIX-SEPT | - | - | - | Il a eu quatre-vingt-dix-sept sur cent.
SOIXANTE-DIX-NEUF | - | - | - | Le panneau indique soixante-dix-neuf kilomètres.
TROIS-CENT-QUATRE-VINGTS | - | - | - | Le camion transporte trois-cent-quatre-vingts caisses.
DEUX-MILLE-CENT | - | - | - | La fusée partira en deux-mille-cent.
CINQ-CENT-VINGT | - | - | - | Ce gros livre a cinq-cent-vingt pages.
VINGTIÈME | VINgTIÈMe | - | - | Il est arrivé vingtième à la course.
CENTIÈME | CENTIÈMe | - | - | C'est la centième fois que je te le dis.
MILLIONIÈME | MILLIONIÈMe | - | - | Le musée a accueilli son millionième visiteur.
""",
},
}

# Syllabes écrites relues à la main (voyelles qui se prononcent séparément, comme LI-ON).
SYLLABES = {
    'CAMÉLÉON': 'CA-MÉ-LÉ-ON', 'CHIMPANZÉ': 'CHIM-PAN-ZÉ', 'AÉROGLISSEUR': 'A-É-RO-GLIS-SEUR',
    'OASIS': 'O-A-SIS', 'BRUINE': 'BRU-I-NE', 'ÉCOSYSTÈME': 'É-CO-SYS-TÈ-ME', 'ÉTHIOPIE': 'É-THI-O-PIE',
    'PANCRÉAS': 'PAN-CRÉ-AS', 'CÉLERI': 'CÉ-LE-RI', 'GÉOGRAPHIE': 'GÉ-O-GRA-PHIE',
    'ARCHÉOLOGUE': 'AR-CHÉ-O-LO-GUE', 'PALÉONTOLOGUE': 'PA-LÉ-ON-TO-LO-GUE', 'CHORÉGRAPHE': 'CHO-RÉ-GRA-PHE',
    'AQUEDUC': 'A-QUE-DUC', 'FUCHSIA': 'FUCH-SIA', 'TRIATHLON': 'TRI-A-THLON',
    'MILLIONIÈME': 'MIL-LI-O-NIÈ-ME', 'QUOTIDIEN': 'QUO-TI-DIEN', 'PHOTOGRAPHE': 'PHO-TO-GRA-PHE',
    'PHOTOCOPIE': 'PHO-TO-CO-PIE', 'DIAPHRAGME': 'DI-A-PHRAG-ME', 'MOZZARELLA': 'MOZ-ZA-REL-LA',
    'AMPHITHÉÂTRE': 'AM-PHI-THÉ-Â-TRE', 'AFGHANISTAN': 'AF-GHA-NIS-TAN', 'AZERBAÏDJAN': 'A-ZER-BAÏ-DJAN',
    'LIECHTENSTEIN': 'LIECH-TEN-STEIN', 'ORLÉANS': 'OR-LÉ-ANS', 'BAYONNE': 'BA-YON-NE', 'BIARRITZ': 'BI-AR-RITZ',
    'ESTUAIRE': 'ES-TU-AI-RE', 'VIOLONCELLE': 'VI-O-LON-CEL-LE', 'KAZAKHSTAN': 'KA-ZAKHS-TAN',
}

# h aspiré : on dit « le hautbois », « le handball », « la Hongrie » (pas d'élision).
H_ASPIRE = {'HAUTBOIS', 'HANDBALL', 'HONGRIE'}


def lire():
    """Renvoie { theme: { '4': [(mot, muettes, genre, pluriel, phrase), …], '5': […] } }."""
    res = {}
    for theme, niveaux in DONNEES.items():
        res[theme] = {}
        for n, bloc in niveaux.items():
            lignes = []
            for ligne in bloc.strip().splitlines():
                parts = [p.strip() for p in ligne.split('|')]
                if len(parts) != 5:
                    raise SystemExit('Ligne mal formée (' + theme + ') : ' + ligne)
                lignes.append(tuple(parts))
            res[theme][n] = lignes
    return res
