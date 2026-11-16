// Problèmes de mathématiques (v9.0, demande de l'utilisateur du 16/11/2026).
// Le joueur garde ses réglages de calcul (niveau, signes, nombres, nombre de signes) : js/calcul.js tire la
// formule, puis ce module la raconte comme un petit problème, sur un thème tiré au hasard parmi ceux du
// fichier de l'utilisateur « questions/problèmes de math.docx » (58 thèmes).
// La réponse attendue est exactement le résultat de la formule (mêmes priorités : × et ÷ avant + et −).
//  - un terme seul (ex. 6 × 4, 18 ÷ 3) : « Il y a 6 boîtes. Dans chaque boîte… », « On partage équitablement… » ;
//  - plusieurs termes (ex. 12 + 3 × 6 − 5) : « Au départ, il y a 12… Ensuite, on achète 3 boîtes de 6… Puis on vend 5… » ;
//  - s'il y a un nombre à virgule (division), le problème parle d'une quantité qui se mesure (litres, kilos, mètres…).
// Module sans interface : utilisable dans la page (window.Problemes) et dans les tests Node.
(function (racine) {
  'use strict';

  // Un thème : t = titre court, i = phrase d'introduction,
  //  o = objet que l'on compte [singulier, pluriel], c = contenant [sing., plur.], r = qui reçoit un partage [sing., plur.],
  //  p = verbes qui ajoutent, m = verbes qui retirent (suivis de la quantité : « on vend 12 pots de miel ») ;
  //  u = mesure [unité sing., unité plur., « de … »], uc = contenant de la mesure, ur = qui reçoit (sinon r),
  //  up / um = verbes qui ajoutent / retirent de la mesure.
  function T(t, i, o, c, r, p, m, u, uc, up, um, ur) {
    return { titre: t, intro: i, o: o, c: c, r: r, p: p, m: m, u: u, uc: uc, up: up, um: um, ur: ur || r };
  }

  var THEMES = [
    T('Le château fort', 'Au château fort, l’intendant surveille les réserves.',
      ['pain', 'pains'], ['panier', 'paniers'], ['garde', 'gardes'], ['le boulanger cuit', 'une charrette apporte'], ['les soldats mangent', 'les cuisiniers servent'],
      ['kilo', 'kilos', 'de farine'], ['sac', 'sacs'], ['le meunier livre', 'on achète au marché'], ['le boulanger utilise', 'les cuisiniers prennent']),
    T('L’atelier de l’alchimiste', 'Dans son atelier, l’alchimiste prépare des potions.',
      ['fiole', 'fioles'], ['coffret', 'coffrets'], ['apprenti', 'apprentis'], ['l’alchimiste remplit', 'on prépare'], ['on vend', 'l’apprenti casse'],
      ['litre', 'litres', 'd’élixir'], ['chaudron', 'chaudrons'], ['l’alchimiste distille', 'on prépare'], ['on utilise', 'on renverse']),
    T('L’expédition en terre inconnue', 'Une expédition part explorer une terre inconnue.',
      ['ration', 'rations'], ['sac à dos', 'sacs à dos'], ['explorateur', 'explorateurs'], ['on achète', 'le camp de base envoie'], ['l’équipe mange', 'on laisse au camp'],
      ['litre', 'litres', 'd’eau'], ['gourde', 'gourdes'], ['on puise à la source', 'on achète'], ['l’équipe boit', 'on utilise pour la cuisine']),
    T('La guilde des marchands', 'La guilde des marchands fait le compte de ses marchandises.',
      ['rouleau de tissu', 'rouleaux de tissu'], ['ballot', 'ballots'], ['marchand', 'marchands'], ['un navire livre', 'la guilde achète'], ['la guilde vend', 'on expédie'],
      ['mètre', 'mètres', 'de soie'], ['bobine', 'bobines'], ['un navire livre', 'la guilde achète'], ['la guilde vend', 'le tailleur coupe']),
    T('La forêt mystique', 'Tout en haut des arbres de la forêt mystique poussent des fruits lumineux.',
      ['fruit lumineux', 'fruits lumineux'], ['panier de lianes', 'paniers de lianes'], ['oiseau', 'oiseaux'], ['les arbres donnent', 'on cueille'], ['les singes mangent', 'le vent fait tomber'],
      ['litre', 'litres', 'de rosée magique'], ['grande feuille', 'grandes feuilles'], ['on recueille', 'les fleurs donnent'], ['les oiseaux boivent', 'le soleil fait sécher']),
    T('L’atelier de l’horloger', 'Dans l’atelier de l’horloger, on répare des automates anciens.',
      ['engrenage', 'engrenages'], ['boîte', 'boîtes'], ['automate', 'automates'], ['l’horloger fabrique', 'on commande'], ['l’horloger utilise', 'on jette'],
      ['mètre', 'mètres', 'de fil de laiton'], ['bobine', 'bobines'], ['on achète', 'on commande'], ['l’horloger utilise', 'on coupe']),
    T('La planète lointaine', 'Des colons s’installent sur une planète lointaine.',
      ['brique', 'briques'], ['conteneur', 'conteneurs'], ['colon', 'colons'], ['une fusée apporte', 'les robots fabriquent'], ['les colons utilisent', 'une tempête détruit'],
      ['litre', 'litres', 'd’eau'], ['réservoir', 'réservoirs'], ['les robots filtrent', 'une fusée apporte'], ['les colons boivent', 'les serres utilisent']),
    T('Le cirque', 'Le cirque prépare son grand spectacle.',
      ['balle de jonglage', 'balles de jonglage'], ['malle', 'malles'], ['jongleur', 'jongleurs'], ['on achète', 'le directeur commande'], ['les jongleurs perdent', 'on prête'],
      ['mètre', 'mètres', 'de corde'], ['rouleau', 'rouleaux'], ['on achète', 'on commande'], ['les acrobates utilisent', 'on coupe']),
    T('La migration des oies', 'Les oies sauvages s’envolent vers le sud, portées par les vents dominants.',
      ['oie', 'oies'], ['formation en V', 'formations en V'], ['étang', 'étangs'], ['il arrive', 'le vent amène'], ['on voit repartir', 'le vent contraire disperse'],
      ['kilo', 'kilos', 'de graines'], ['sac', 'sacs'], ['les soigneurs apportent', 'on achète'], ['les oies mangent', 'la pluie abîme'], ['mangeoire', 'mangeoires']),
    T('La ruche', 'Dans la ruche, les abeilles fabriquent du miel avec le nectar des fleurs.',
      ['pot de miel', 'pots de miel'], ['caisse', 'caisses'], ['client', 'clients'], ['l’apicultrice remplit', 'on récolte'], ['on vend', 'on offre'],
      ['kilo', 'kilos', 'de miel'], ['cadre', 'cadres'], ['les abeilles produisent', 'on récolte'], ['on vend', 'les abeilles mangent']),
    T('Le réseau sous la forêt', 'Sous la forêt, un réseau de champignons relie les arbres et leur fait passer des nutriments.',
      ['filament', 'filaments'], ['racine', 'racines'], ['arbre', 'arbres'], ['le champignon fait pousser', 'la pluie fait pousser'], ['une taupe coupe', 'la sécheresse fait mourir'],
      ['gramme', 'grammes', 'de sucre'], ['racine', 'racines'], ['les arbres envoient', 'les feuilles fabriquent'], ['les jeunes arbres reçoivent', 'le champignon garde']),
    T('Les tortues marines', 'Sur une plage, les tortues marines viennent pondre leurs œufs, mais la marée monte.',
      ['œuf', 'œufs'], ['nid', 'nids'], ['abri', 'abris'], ['les tortues pondent', 'on découvre'], ['la marée emporte', 'les crabes mangent'],
      ['mètre', 'mètres', 'de plage'], ['zone', 'zones'], ['on protège', 'on nettoie'], ['la marée recouvre', 'les vagues emportent'], ['bénévole', 'bénévoles']),
    T('Le barrage des castors', 'Une colonie de castors construit un barrage sur la rivière.',
      ['branche', 'branches'], ['tas', 'tas'], ['castor', 'castors'], ['les castors rapportent', 'on compte encore'], ['le courant emporte', 'les castors mangent'],
      ['mètre', 'mètres', 'de barrage'], ['section', 'sections'], ['les castors construisent', 'la colonie bâtit'], ['une crue détruit', 'le courant abîme']),
    T('L’érablière', 'Au printemps, on récolte la sève des érables pour faire du sirop.',
      ['seau de sève', 'seaux de sève'], ['traîneau', 'traîneaux'], ['cabane', 'cabanes'], ['les érables remplissent', 'on récolte'], ['on fait bouillir', 'on renverse'],
      ['litre', 'litres', 'de sève'], ['bidon', 'bidons'], ['les érables donnent', 'on récolte'], ['on fait bouillir', 'on renverse']),
    T('Les bourdons du verger', 'Dans le verger, les bourdons volent de fleur en fleur pour les polliniser.',
      ['fleur', 'fleurs'], ['branche', 'branches'], ['bourdon', 'bourdons'], ['les bourdons pollinisent', 'le soleil fait éclore'], ['le vent fait tomber', 'la gelée abîme'],
      ['gramme', 'grammes', 'de pollen'], ['corbeille à pollen', 'corbeilles à pollen'], ['les bourdons récoltent', 'on trouve encore'], ['les bourdons mangent', 'le vent emporte']),
    T('La prairie sauvage', 'Dans la prairie, le vent disperse les graines des fleurs sauvages.',
      ['graine', 'graines'], ['grappe', 'grappes'], ['carré de terre', 'carrés de terre'], ['le vent apporte', 'les fleurs lâchent'], ['les oiseaux mangent', 'la pluie emporte'],
      ['gramme', 'grammes', 'de graines'], ['sachet', 'sachets'], ['on ramasse', 'le vent dépose'], ['les oiseaux mangent', 'on sème']),
    T('Les lucioles', 'Le soir, dans une clairière, des lucioles s’allument dans le noir.',
      ['luciole', 'lucioles'], ['buisson', 'buissons'], ['coin de la clairière', 'coins de la clairière'], ['il apparaît', 'la nuit fait briller'], ['on voit s’éteindre', 'le vent chasse'],
      ['litre', 'litres', 'de rosée'], ['feuille', 'feuilles'], ['la nuit dépose', 'on recueille'], ['les lucioles boivent', 'le soleil fait sécher']),
    T('La meute de loups', 'En hiver, le gibier se fait rare et la meute de loups doit survivre.',
      ['loup', 'loups'], ['meute', 'meutes'], ['territoire', 'territoires'], ['il arrive', 'il naît'], ['on voit partir', 'le froid fait fuir'],
      ['kilo', 'kilos', 'de nourriture'], ['réserve', 'réserves'], ['la meute trouve', 'les loups chassent'], ['la meute mange', 'les corbeaux volent'], ['loup', 'loups']),
    T('Le parchemin ancien', 'Un savant déchiffre un parchemin couvert de symboles qui se répètent.',
      ['symbole', 'symboles'], ['ligne', 'lignes'], ['élève', 'élèves'], ['le savant découvre', 'on déchiffre encore'], ['l’eau a effacé', 'on barre'],
      ['centimètre', 'centimètres', 'de parchemin'], ['bande', 'bandes'], ['on déroule', 'le savant lit'], ['les souris ont rongé', 'on découpe']),
    T('La cathédrale gothique', 'On construit une cathédrale gothique et on achemine les blocs de pierre.',
      ['bloc de pierre', 'blocs de pierre'], ['charrette', 'charrettes'], ['tailleur de pierre', 'tailleurs de pierre'], ['la carrière envoie', 'un bateau apporte'], ['les maçons posent', 'on taille'],
      ['tonne', 'tonnes', 'de pierre'], ['barge', 'barges'], ['la carrière envoie', 'un bateau apporte'], ['les maçons utilisent', 'on monte sur le chantier']),
    T('La navigation aux étoiles', 'Un navire traverse l’océan en se guidant avec les étoiles et les courants marins.',
      ['étoile', 'étoiles'], ['constellation', 'constellations'], ['marin', 'marins'], ['le marin repère', 'la nuit montre'], ['les nuages cachent', 'la brume cache'],
      ['kilo', 'kilos', 'de biscuits de mer'], ['tonneau', 'tonneaux'], ['on embarque', 'on achète au port'], ['l’équipage mange', 'les rats grignotent']),
    T('La route de la soie', 'Une caravane transporte des épices le long de la route de la soie.',
      ['sac d’épices', 'sacs d’épices'], ['caisse', 'caisses'], ['marchand', 'marchands'], ['on achète', 'une autre caravane apporte'], ['on vend', 'les voleurs prennent'],
      ['kilo', 'kilos', 'de poivre'], ['sac', 'sacs'], ['on achète', 'on charge'], ['on vend', 'on échange']),
    T('Le site archéologique', 'Des archéologues fouillent un site et rangent les poteries trouvées.',
      ['poterie', 'poteries'], ['caisse', 'caisses'], ['musée', 'musées'], ['on déterre', 'les archéologues trouvent'], ['on envoie au musée', 'on prête'],
      ['mètre', 'mètres', 'de terrain'], ['carré de fouille', 'carrés de fouille'], ['on fouille', 'on dégage'], ['on rebouche', 'la pluie recouvre'], ['équipe', 'équipes']),
    T('Le scriptorium', 'Dans un monastère, des moines copient et décorent des manuscrits.',
      ['page', 'pages'], ['cahier', 'cahiers'], ['moine', 'moines'], ['les moines copient', 'on enlumine'], ['on envoie', 'l’encre renversée abîme'],
      ['litre', 'litres', 'd’encre'], ['pot', 'pots'], ['on fabrique', 'on achète'], ['les moines utilisent', 'on renverse']),
    T('Le comptoir phénicien', 'Sur une île lointaine, des marchands phéniciens tiennent un comptoir.',
      ['amphore', 'amphores'], ['navire', 'navires'], ['marchand', 'marchands'], ['un navire débarque', 'on achète'], ['on vend', 'on échange'],
      ['litre', 'litres', 'd’huile d’olive'], ['jarre', 'jarres'], ['un navire débarque', 'on achète'], ['on vend', 'on échange']),
    T('Les mosaïques romaines', 'Des artisans romains fabriquent du verre et des mosaïques.',
      ['tesselle', 'tesselles'], ['panier', 'paniers'], ['artisan', 'artisans'], ['on fabrique', 'le verrier coupe'], ['on colle', 'on casse'],
      ['kilo', 'kilos', 'de sable'], ['sac', 'sacs'], ['on livre', 'on achète'], ['le verrier fait fondre', 'on utilise']),
    T('L’aqueduc', 'Dans une cité antique, un aqueduc apporte l’eau aux habitants.',
      ['amphore d’eau', 'amphores d’eau'], ['charrette', 'charrettes'], ['maison', 'maisons'], ['l’aqueduc remplit', 'on remplit'], ['les habitants utilisent', 'on vide'],
      ['litre', 'litres', 'd’eau'], ['bassin', 'bassins'], ['l’aqueduc apporte', 'la source donne'], ['les thermes utilisent', 'les habitants boivent']),
    T('L’épave', 'Des plongeurs cherchent des trésors dans une épave échouée sur un récif.',
      ['pièce d’or', 'pièces d’or'], ['coffre', 'coffres'], ['plongeur', 'plongeurs'], ['les plongeurs remontent', 'on trouve'], ['on donne au musée', 'le courant emporte'],
      ['mètre', 'mètres', 'de corde'], ['rouleau', 'rouleaux'], ['on déroule', 'on ajoute'], ['on coupe', 'les rochers usent']),
    T('La boulangerie', 'Le boulanger prépare le pain en surveillant la pâte qui lève.',
      ['baguette', 'baguettes'], ['panier', 'paniers'], ['client', 'clients'], ['le boulanger cuit', 'on prépare'], ['on vend', 'on donne'],
      ['kilo', 'kilos', 'de farine'], ['sac', 'sacs'], ['le meunier livre', 'on achète'], ['le boulanger utilise', 'on verse dans le pétrin']),
    T('La cave à fromages', 'Dans une cave fraîche, on affine des fromages.',
      ['fromage', 'fromages'], ['étagère', 'étagères'], ['client', 'clients'], ['on fabrique', 'on range à la cave'], ['on vend', 'on goûte'],
      ['litre', 'litres', 'de lait'], ['bidon', 'bidons'], ['la ferme livre', 'les vaches donnent'], ['on utilise', 'on verse dans les moules']),
    T('Le joaillier royal', 'Un joaillier taille des pierres précieuses pour le roi.',
      ['rubis', 'rubis'], ['écrin', 'écrins'], ['couronne', 'couronnes'], ['le joaillier taille', 'on reçoit'], ['le joaillier sertit', 'on offre'],
      ['gramme', 'grammes', 'd’or'], ['lingot', 'lingots'], ['on achète', 'le roi donne'], ['le joaillier utilise', 'on fait fondre']),
    T('L’échoppe du potier', 'Un potier façonne des pots et les cuit avec leurs émaux dans son four.',
      ['bol', 'bols'], ['étagère', 'étagères'], ['client', 'clients'], ['le potier façonne', 'on cuit'], ['on vend', 'on casse'],
      ['kilo', 'kilos', 'd’argile'], ['bloc', 'blocs'], ['on achète', 'on livre'], ['le potier utilise', 'on façonne']),
    T('Le théâtre de marionnettes', 'On coud des costumes sur mesure pour les marionnettes d’un théâtre.',
      ['bouton', 'boutons'], ['boîte', 'boîtes'], ['marionnette', 'marionnettes'], ['on achète', 'la couturière trouve'], ['la couturière coud', 'on perd'],
      ['mètre', 'mètres', 'de tissu'], ['rouleau', 'rouleaux'], ['on achète', 'on reçoit'], ['la couturière utilise', 'on coupe']),
    T('L’apothicaire', 'On récolte et on fait sécher des plantes médicinales pour l’apothicaire.',
      ['bouquet', 'bouquets'], ['panier', 'paniers'], ['malade', 'malades'], ['on cueille', 'on récolte'], ['on vend', 'l’apothicaire utilise'],
      ['gramme', 'grammes', 'de tisane'], ['sachet', 'sachets'], ['on fait sécher', 'on prépare'], ['on vend', 'l’apothicaire utilise']),
    T('Les bougies', 'Un artisan fabrique des bougies en cire d’abeille de différentes tailles.',
      ['bougie', 'bougies'], ['boîte', 'boîtes'], ['client', 'clients'], ['l’artisan fabrique', 'on moule'], ['on vend', 'on allume'],
      ['kilo', 'kilos', 'de cire'], ['bloc', 'blocs'], ['l’apiculteur livre', 'on achète'], ['l’artisan fait fondre', 'on utilise']),
    T('Le tissage de tapis', 'Une tisserande tisse des tapis aux motifs géométriques.',
      ['motif', 'motifs'], ['rangée', 'rangées'], ['tapis', 'tapis'], ['la tisserande tisse', 'on dessine'], ['on défait', 'on efface'],
      ['mètre', 'mètres', 'de laine'], ['pelote', 'pelotes'], ['on achète', 'on file'], ['la tisserande utilise', 'on coupe']),
    T('Les vieux livres', 'Un relieur répare de vieux livres reliés en cuir.',
      ['livre', 'livres'], ['étagère', 'étagères'], ['bibliothèque', 'bibliothèques'], ['on apporte', 'le relieur répare'], ['on rend', 'on vend'],
      ['mètre', 'mètres', 'de fil'], ['bobine', 'bobines'], ['on achète', 'on reçoit'], ['le relieur utilise', 'on coupe']),
    T('La fabrique de sirop', 'Une petite fabrique prépare des sirops artisanaux en mélangeant des malts.',
      ['bouteille', 'bouteilles'], ['caisse', 'caisses'], ['épicerie', 'épiceries'], ['on remplit', 'on prépare'], ['on vend', 'on livre'],
      ['litre', 'litres', 'de sirop'], ['cuve', 'cuves'], ['on prépare', 'on fait cuire'], ['on met en bouteilles', 'on vend']),
    T('Le labyrinthe magique', 'Des aventuriers traversent un labyrinthe végétal aux portes magiques.',
      ['porte magique', 'portes magiques'], ['couloir', 'couloirs'], ['aventurier', 'aventuriers'], ['on découvre', 'la magie fait apparaître'], ['on ouvre', 'on referme'],
      ['mètre', 'mètres', 'de haie'], ['allée', 'allées'], ['le jardinier plante', 'la magie fait pousser'], ['on taille', 'le jardinier coupe']),
    T('Le vaisseau spatial', 'Un vaisseau en orbite recharge ses boucliers d’énergie.',
      ['cellule d’énergie', 'cellules d’énergie'], ['batterie', 'batteries'], ['bouclier', 'boucliers'], ['les panneaux solaires chargent', 'on recharge'], ['les boucliers utilisent', 'une météorite détruit'],
      ['litre', 'litres', 'de carburant'], ['réservoir', 'réservoirs'], ['une station livre', 'on pompe'], ['les moteurs brûlent', 'on utilise']),
    T('Le golem de pierre', 'Un magicien assemble un golem de pierre aux pièces articulées.',
      ['pièce de pierre', 'pièces de pierre'], ['chariot', 'chariots'], ['golem', 'golems'], ['le magicien taille', 'on apporte'], ['le magicien assemble', 'on casse'],
      ['kilo', 'kilos', 'de pierre'], ['bloc', 'blocs'], ['on apporte', 'la carrière livre'], ['le magicien utilise', 'on taille']),
    T('La guilde d’aventuriers', 'Une guilde d’aventuriers distribue des potions de mana à ses membres.',
      ['potion', 'potions'], ['caisse', 'caisses'], ['aventurier', 'aventuriers'], ['l’alchimiste livre', 'on prépare'], ['on distribue', 'les aventuriers boivent'],
      ['litre', 'litres', 'de mana'], ['tonneau', 'tonneaux'], ['on prépare', 'la source magique donne'], ['on verse dans les fioles', 'les aventuriers boivent']),
    T('Les grottes lumineuses', 'Des explorateurs visitent des grottes habitées par des créatures lumineuses.',
      ['créature lumineuse', 'créatures lumineuses'], ['galerie', 'galeries'], ['explorateur', 'explorateurs'], ['on découvre', 'il apparaît'], ['on voit s’éloigner', 'on voit partir'],
      ['mètre', 'mètres', 'de galerie'], ['tunnel', 'tunnels'], ['on explore', 'on découvre'], ['un éboulement bouche', 'on referme']),
    T('Le voilier des étoiles', 'Un voilier intergalactique règle ses voiles solaires.',
      ['voile solaire', 'voiles solaires'], ['mât', 'mâts'], ['équipage', 'équipages'], ['on déploie', 'on installe'], ['on replie', 'une tempête déchire'],
      ['mètre', 'mètres', 'de câble'], ['bobine', 'bobines'], ['on achète', 'on déroule'], ['on utilise', 'on coupe']),
    T('Les cristaux magiques', 'Un mage trie des cristaux magiques selon leur résonance et leur pureté.',
      ['cristal', 'cristaux'], ['coffret', 'coffrets'], ['mage', 'mages'], ['on trouve', 'les mineurs apportent'], ['on écarte', 'le mage utilise'],
      ['gramme', 'grammes', 'de poudre de cristal'], ['fiole', 'fioles'], ['on broie', 'on récolte'], ['le mage utilise', 'on souffle']),
    T('Le phare des comètes', 'Un phare interstellaire guide les comètes dans l’espace.',
      ['comète', 'comètes'], ['groupe', 'groupes'], ['gardien', 'gardiens'], ['il arrive', 'le phare attire'], ['le phare fait repartir', 'on voit s’éloigner'],
      ['litre', 'litres', 'de lumière liquide'], ['réservoir', 'réservoirs'], ['on remplit', 'une navette livre'], ['le phare utilise', 'la lampe brûle']),
    T('Les automates à ressorts', 'Une inventrice fabrique des automates miniatures à ressorts.',
      ['ressort', 'ressorts'], ['boîte', 'boîtes'], ['automate', 'automates'], ['on fabrique', 'on achète'], ['l’inventrice monte', 'on casse'],
      ['centimètre', 'centimètres', 'de fil de cuivre'], ['bobine', 'bobines'], ['on achète', 'on reçoit'], ['l’inventrice utilise', 'on coupe']),
    T('La poussière d’étoile', 'Un vaisseau récolte de la poussière d’étoile dans la queue d’une comète.',
      ['flacon', 'flacons'], ['caisse', 'caisses'], ['laboratoire', 'laboratoires'], ['on remplit', 'le vaisseau récolte'], ['on livre', 'on renverse'],
      ['gramme', 'grammes', 'de poussière d’étoile'], ['flacon', 'flacons'], ['on récolte', 'le filet attrape'], ['on étudie', 'on perd']),
    T('Le tournoi de jeux', 'Un village organise un tournoi de jeux de plateau.',
      ['pion', 'pions'], ['boîte', 'boîtes'], ['table', 'tables'], ['on achète', 'les joueurs apportent'], ['on perd', 'on range'],
      ['mètre', 'mètres', 'de banderole'], ['rouleau', 'rouleaux'], ['on achète', 'on fabrique'], ['on accroche', 'on coupe']),
    T('L’expédition en montagne', 'Des alpinistes préparent le matériel pour escalader une haute montagne.',
      ['mousqueton', 'mousquetons'], ['sac', 'sacs'], ['alpiniste', 'alpinistes'], ['on achète', 'on emprunte'], ['on laisse au refuge', 'on perd'],
      ['mètre', 'mètres', 'de corde'], ['rouleau', 'rouleaux'], ['on achète', 'on emprunte'], ['on utilise', 'on coupe']),
    T('La course d’orientation', 'On prépare une course d’orientation dans une forêt dense.',
      ['balise', 'balises'], ['carton', 'cartons'], ['équipe', 'équipes'], ['on installe', 'on ajoute'], ['on retire', 'le vent fait tomber'],
      ['kilomètre', 'kilomètres', 'de parcours'], ['boucle', 'boucles'], ['on trace', 'on ajoute'], ['on supprime', 'on retire']),
    T('Les planches de surf', 'Un artisan sculpte des planches de surf en bois.',
      ['planche', 'planches'], ['remorque', 'remorques'], ['surfeur', 'surfeurs'], ['l’artisan sculpte', 'on fabrique'], ['on vend', 'on prête'],
      ['litre', 'litres', 'de vernis'], ['pot', 'pots'], ['on achète', 'on reçoit'], ['l’artisan utilise', 'on renverse']),
    T('L’accrobranche', 'On construit un parcours d’accrobranche entre les cimes des arbres.',
      ['plateforme', 'plateformes'], ['arbre', 'arbres'], ['parcours', 'parcours'], ['on construit', 'on ajoute'], ['on démonte', 'on ferme'],
      ['mètre', 'mètres', 'de câble'], ['bobine', 'bobines'], ['on tend', 'on installe'], ['on remplace', 'on coupe']),
    T('Le marathon des villages', 'Des bénévoles ravitaillent les coureurs d’un marathon qui traverse les villages.',
      ['bouteille d’eau', 'bouteilles d’eau'], ['pack', 'packs'], ['coureur', 'coureurs'], ['on livre', 'on achète'], ['les coureurs prennent', 'on distribue'],
      ['litre', 'litres', 'de jus de fruits'], ['bidon', 'bidons'], ['on prépare', 'on livre'], ['les coureurs boivent', 'on distribue']),
    T('Le théâtre ambulant', 'Une troupe de théâtre ambulant se répartit les rôles et les costumes.',
      ['costume', 'costumes'], ['malle', 'malles'], ['comédien', 'comédiens'], ['on coud', 'on achète'], ['on prête', 'on abîme'],
      ['mètre', 'mètres', 'de rideau'], ['rouleau', 'rouleaux'], ['on achète', 'on coud'], ['on coupe', 'on utilise']),
    T('Le spectacle son et lumière', 'On prépare l’éclairage et les décors d’un spectacle son et lumière.',
      ['projecteur', 'projecteurs'], ['caisse', 'caisses'], ['scène', 'scènes'], ['on installe', 'on loue'], ['on rend', 'on éteint'],
      ['mètre', 'mètres', 'de câble'], ['bobine', 'bobines'], ['on déroule', 'on achète'], ['on utilise', 'on coupe']),
    T('Les cerfs-volants', 'Un atelier fabrique des cerfs-volants acrobatiques de toutes les tailles.',
      ['cerf-volant', 'cerfs-volants'], ['carton', 'cartons'], ['enfant', 'enfants'], ['on fabrique', 'l’atelier termine'], ['on vend', 'le vent emporte'],
      ['mètre', 'mètres', 'de toile'], ['rouleau', 'rouleaux'], ['on achète', 'on reçoit'], ['on découpe', 'on utilise']),
    T('Le marché de créateurs', 'On organise un marché de créateurs et on place les stands.',
      ['stand', 'stands'], ['allée', 'allées'], ['créateur', 'créateurs'], ['on installe', 'on ajoute'], ['on démonte', 'on retire'],
      ['mètre', 'mètres', 'de guirlande'], ['rouleau', 'rouleaux'], ['on accroche', 'on achète'], ['on retire', 'on décroche'])
  ];

  // ---------- Petits outils de français ----------
  // Écriture française des nombres (virgule décimale).
  function ecrire(x) { return String(Math.round(x * 10) / 10).replace('.', ','); }
  // Singulier en dessous de 2 (« 1 oie », « 1,5 litre »), pluriel à partir de 2.
  function nom(n, paire) { return n < 2 ? paire[0] : paire[1]; }
  function qte(n, paire) { return ecrire(n) + ' ' + nom(n, paire); }
  // « de » devant une voyelle ou un h muet devient « d’ » (« combien d’oies »).
  function de(mot) { return (/^[aeiouyéèêàâîïôûœh]/i.test(mot) ? 'd’' : 'de ') + mot; }
  function maj(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  // ---------- Découpage de la formule ----------
  // 12 + 3 × 6 − 5 → termes [12], [3 × 6], [5] reliés par + et −, comme les priorités de calcul.
  function termes(nb, ops) {
    var t = [{ signe: 'plus', nb: [nb[0]], ops: [] }];
    for (var i = 0; i < ops.length; i++) {
      if (ops[i] === 'fois' || ops[i] === 'divise') { var d = t[t.length - 1]; d.ops.push(ops[i]); d.nb.push(nb[i + 1]); }
      else t.push({ signe: ops[i], nb: [nb[i + 1]], ops: [] });
    }
    return t;
  }
  // Valeur d'un terme (× et ÷ de gauche à droite), et liste de ses étapes.
  function etapes(term) {
    var v = term.nb[0], l = [v];
    for (var i = 0; i < term.ops.length; i++) { v = term.ops[i] === 'fois' ? v * term.nb[i + 1] : v / term.nb[i + 1]; l.push(v); }
    return l;
  }
  function entier(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
  // Y a-t-il un nombre à virgule quelque part (étape d'un terme, ou total en cours) ?
  function aVirgule(ts) {
    var total = 0;
    for (var i = 0; i < ts.length; i++) {
      var e = etapes(ts[i]);
      if (!e.every(entier)) return true;
      total += (ts[i].signe === 'moins' ? -1 : 1) * e[e.length - 1];
      if (!entier(total)) return true;
    }
    return false;
  }

  // ---------- Vocabulaire du problème ----------
  // Objets que l'on compte, ou quantité qui se mesure (dès qu'un nombre à virgule apparaît).
  function vocabulaire(th, mesure) {
    if (!mesure) return { o: th.o, c: th.c, r: th.r, p: th.p, m: th.m };
    return { o: [th.u[0] + ' ' + th.u[2], th.u[1] + ' ' + th.u[2]], c: th.uc, r: th.ur, p: th.up, m: th.um };
  }

  // Quantité décrite par un terme : « 12 pains », « 3 paniers de 6 pains »,
  // « une des 3 parts égales de 18 pains », « 2 lots de 3 paniers de 6 pains ».
  var LOTS = [['lot', 'lots'], ['série', 'séries'], ['groupe', 'groupes']];
  function quantite(term, v) {
    var nb = term.nb, ops = term.ops;
    if (!ops.length) return qte(nb[0], v.o);
    var cur, niveau = 0;
    if (ops[0] === 'fois') cur = qte(nb[0], v.c) + ' ' + de(qte(nb[1], v.o));
    else cur = part(nb[1], qte(nb[0], v.o));
    for (var i = 1; i < ops.length; i++) {
      var k = nb[i + 1];
      if (ops[i] === 'divise') cur = part(k, cur);
      else if (/^(une des|1\u00a0seule part) /.test(cur)) cur = ecrire(k) + ' fois ' + cur;
      else { cur = qte(k, LOTS[Math.min(niveau, LOTS.length - 1)]) + ' ' + de(cur); niveau++; }
    }
    return cur;
  }
  function part(k, quoi) { return k === 1 ? '1\u00a0seule part ' + de(quoi) : 'une des ' + ecrire(k) + '\u00a0parts égales ' + de(quoi); }
  // « en 3 parts égales et on en garde une » ; partager en 1 : « en 1 seule part et on la garde ».
  function enParts(k) { return k === 1 ? 'en 1\u00a0seule part et on la garde' : 'en ' + ecrire(k) + '\u00a0parts égales et on en garde une'; }

  // ---------- Énoncé ----------
  // carte = une carte de js/calcul.js ({ nombres, operations, resultat… }). Renvoie l'énoncé et le thème.
  function enonce(carte, hasard, themeIndex) {
    hasard = hasard || Math.random;
    var th = THEMES[themeIndex != null ? themeIndex : Math.floor(hasard() * THEMES.length)];
    var ts = termes(carte.nombres, carte.operations);
    var v = vocabulaire(th, aVirgule(ts));
    var phrases = [th.intro], question;
    var combien = 'Combien ' + de(v.o[1]);
    if (ts.length === 1) {
      // Un seul terme : produit et/ou quotient.
      var t0 = ts[0], nb = t0.nb, ops = t0.ops;
      // ref : ce qu'on vient d'obtenir (« ce total » après ×, « cette part » après ÷).
      var ref;
      if (ops[0] === 'fois') { phrases.push('Il y a ' + qte(nb[0], v.c) + '. Dans chaque ' + v.c[0] + ', il y a ' + qte(nb[1], v.o) + '.'); ref = 'ce total'; }
      else if (ops.length === 1) phrases.push('On partage équitablement ' + qte(nb[0], v.o) + ' entre ' + qte(nb[1], v.r) + '.');
      else { phrases.push('On partage ' + qte(nb[0], v.o) + ' ' + enParts(nb[1]) + '.'); ref = 'cette part'; }
      var dernier = ops[0];
      for (var i = 1; i < ops.length; i++) {
        var k = nb[i + 1];
        if (ops[i] === 'fois') { phrases.push('On multiplie ' + ref + ' par ' + ecrire(k) + '.'); ref = 'ce nouveau total'; }
        else if (i === ops.length - 1) phrases.push('On partage ' + ref + ' équitablement entre ' + qte(k, v.r) + '.');
        else { phrases.push('On partage ' + ref + ' ' + enParts(k) + '.'); ref = 'cette nouvelle part'; }
        dernier = ops[i];
      }
      question = dernier === 'divise' ? combien + ' reçoit chaque ' + v.r[0] + ' ?' : combien + ' cela fait-il en tout ?';
    } else {
      // Plusieurs termes : une réserve qui change (ajouts et retraits, dans l'ordre de la formule).
      var a = ts[0];
      if (a.ops.length === 1 && a.ops[0] === 'divise') phrases.push('Au départ, on partage ' + qte(a.nb[0], v.o) + ' ' + enParts(a.nb[1]) + '.');
      else phrases.push('Au départ, il y a ' + quantite(a, v) + '.');
      // Mots de liaison selon le nombre d'événements (1 à 4).
      var liens = [null, ['Ensuite,'], ['Ensuite,', 'Puis'], ['Ensuite,', 'Puis', 'Enfin,'], ['Ensuite,', 'Puis', 'Après cela,', 'Enfin,']][ts.length - 1];
      var ajoute = false, retire = false;
      // Les verbes alternent (jamais deux fois le même de suite), en partant d'un verbe tiré au hasard.
      var rangs = { p: Math.floor(hasard() * v.p.length), m: Math.floor(hasard() * v.m.length) };
      for (var j = 1; j < ts.length; j++) {
        var plus = ts[j].signe === 'plus';
        if (plus) ajoute = true; else retire = true;
        var cle = plus ? 'p' : 'm', verbe = v[cle][rangs[cle]++ % v[cle].length];
        // Un seul ajout d'un nombre simple : « … 7 pains de plus ».
        var fin = plus && !ts[j].ops.length && ts.length === 2 ? ' de plus' : '';
        phrases.push(liens[j - 1] + ' ' + verbe + ' ' + quantite(ts[j], v) + fin + '.');
      }
      question = combien + (retire && ts[ts.length - 1].signe === 'moins' && ts.length === 2 ? ' reste-t-il ?'
        : !retire && ajoute ? ' y a-t-il maintenant ?' : ' y a-t-il à la fin ?');
    }
    phrases.push(question);
    var texte = phrases.map(function (p) { return maj(p); }).join(' ');
    return { texte: texte, theme: th.titre, mesure: v.o !== th.o };
  }

  // Transforme une carte de calcul en carte de problème (même réponse, même formule pour la correction).
  function habiller(carte, hasard, themeIndex) {
    var e = enonce(carte, hasard, themeIndex);
    carte.probleme = e.texte;
    carte.theme = e.theme;
    carte.oral = e.texte.replace(/ /g, ' ');
    return carte;
  }

  var api = { THEMES: THEMES, enonce: enonce, habiller: habiller, termes: termes };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Problemes = api;
})(this);
