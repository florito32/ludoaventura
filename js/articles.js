// Articles des noms de lieux (v9.x, demande du 17/11/2026 : « pas de deux-points dans les questions, des phrases »).
// Permet d'écrire « Quelle est la capitale du Togo ? » au lieu de « Quelle est la capitale de ce pays : Togo ? ».
// Formes : le(nom) → « le Togo », de(nom) → « du Togo », en(nom) → « au Togo » (lieu), a(nom) → « au Togo » (à qui, à quoi),
// min(texte) → première lettre en minuscule.
// Un nom qui commence déjà par son article (« La tour Eiffel », « Le Nil », « L’Europe ») est accordé tout seul.
// Pour les noms sans article (pays, départements) : m = masculin (le), f = féminin (la), v = commence par
// une voyelle (l’), p = pluriel (les), 0 = sans article (Cuba, Paris), v0 = sans article et voyelle (Israël).
(function (racine) {
  'use strict';

  var GENRES = {};
  function genre(code, noms) { noms.split(';').forEach(function (n) { GENRES[n] = code; }); }

  // ---------- Pays (js/geographie.js et js/cartes-geo.js) ----------
  genre('m', 'Japon;Canada;Brésil;Portugal;Mexique;Maroc;Danemark;Sénégal;Cameroun;Luxembourg;Kenya;Pakistan;Venezuela;' +
    'Paraguay;Mali;Congo;Gabon;Burkina Faso;Niger;Tchad;Liban;Qatar;Liechtenstein;Monténégro;Kazakhstan;Turkménistan;' +
    'Tadjikistan;Kirghizistan;Népal;Bhoutan;Bangladesh;Sri Lanka;Laos;Cambodge;Timor oriental;Yémen;Koweït;Costa Rica;' +
    'Panama;Guatemala;Honduras;Salvador;Nicaragua;Belize;Guyana;Suriname;Mozambique;Zimbabwe;Botswana;Rwanda;Burundi;' +
    'Soudan;Soudan du Sud;Nigeria;Liberia;Ghana;Togo;Bénin;Cap-Vert;Lesotho;Malawi;Vatican;Pérou;Chili;Royaume-Uni;' +
    'Viêt Nam;Kosovo;Groenland;Vanuatu;Sénégal;Danemark');
  genre('f', 'France;Italie;Allemagne;Espagne;Chine;Suisse;Belgique;Grèce;Russie;Inde;Argentine;Australie;Tunisie;Turquie;' +
    'Suède;Norvège;Finlande;Pologne;Corée du Sud;Afrique du Sud;Jamaïque;Colombie;Hongrie;Roumanie;Croatie;Nouvelle-Zélande;' +
    'Côte d’Ivoire;Thaïlande;Éthiopie;Arabie saoudite;Corée du Nord;Mongolie;Malaisie;Bolivie;Guinée;République démocratique du Congo;' +
    'Libye;Syrie;Jordanie;Bulgarie;Serbie;Slovaquie;Slovénie;Lettonie;Lituanie;Biélorussie;Moldavie;Bosnie-Herzégovine;' +
    'Macédoine du Nord;Géorgie;Birmanie;Dominique;République dominicaine;Barbade;Grenade;Zambie;Namibie;Tanzanie;Somalie;' +
    'Mauritanie;Gambie;Guinée-Bissau;Sierra Leone;Centrafrique;Guinée équatoriale;Papouasie-Nouvelle-Guinée;Micronésie;' +
    'Palestine;Tchéquie;Indonésie');
  genre('v', 'Égypte;Algérie;Irlande;Autriche;Ukraine;Islande;Iran;Irak;Afghanistan;Uruguay;Équateur;Estonie;Albanie;Arménie;' +
    'Azerbaïdjan;Ouzbékistan;Angola;Ouganda;Érythrée;Eswatini');
  genre('p', 'États-Unis;Pays-Bas;Philippines;Émirats arabes unis;Maldives;Bahamas;Comores;Seychelles;Fidji;Îles Salomon;' +
    'Îles Marshall;Samoa;Tonga;Palaos');
  genre('0', 'Monaco;Cuba;Madagascar;Haïti;Singapour;Malte;Chypre;Saint-Marin;Bahreïn;Brunei;Oman;Djibouti;Maurice;' +
    'Sao Tomé-et-Principe;Sainte-Lucie;Saint-Vincent-et-les-Grenadines;Saint-Christophe-et-Niévès;Antigua-et-Barbuda;' +
    'Trinité-et-Tobago;Kiribati;Tuvalu;Nauru');
  genre('v0', 'Israël;Andorre');

  // ---------- Départements (js/geographie.js et js/cartes-geo.js) ----------
  genre('m', 'Calvados;Cantal;Cher;Doubs;Finistère;Gard;Gers;Jura;Loiret;Lot;Lot-et-Garonne;Morbihan;Nord;Pas-de-Calais;' +
    'Puy-de-Dôme;Bas-Rhin;Haut-Rhin;Rhône;Tarn;Tarn-et-Garonne;Var;Vaucluse;Territoire de Belfort;Val-de-Marne;Loir-et-Cher;' +
    'Val-d’Oise;Val-d\'Oise');
  genre('v', 'Ain;Aisne;Allier;Aube;Aude;Aveyron;Ardèche;Ariège;Eure;Eure-et-Loir;Hérault;Ille-et-Vilaine;Indre;Indre-et-Loire;Isère;' +
    'Oise;Orne;Yonne;Essonne');
  genre('f', 'Charente;Charente-Maritime;Corrèze;Côte-d’Or;Côte-d\'Or;Creuse;Dordogne;Drôme;Gironde;Haute-Garonne;Loire;Haute-Loire;' +
    'Loire-Atlantique;Lozère;Manche;Marne;Haute-Marne;Mayenne;Meurthe-et-Moselle;Meuse;Moselle;Nièvre;Sarthe;Savoie;' +
    'Haute-Savoie;Seine-Maritime;Seine-et-Marne;Seine-Saint-Denis;Somme;Vendée;Vienne;Haute-Vienne;Haute-Saône;Saône-et-Loire;' +
    'Maine-et-Loire;Corse-du-Sud;Haute-Corse;Guadeloupe;Martinique;Guyane');
  genre('p', 'Alpes-de-Haute-Provence;Hautes-Alpes;Alpes-Maritimes;Ardennes;Bouches-du-Rhône;Côtes-d’Armor;Côtes-d\'Armor;Landes;' +
    'Pyrénées-Atlantiques;Hautes-Pyrénées;Pyrénées-Orientales;Yvelines;Deux-Sèvres;Vosges;Hauts-de-Seine');
  genre('0', 'Paris;Mayotte');

  // Noms dont l'article fait partie du nom propre : il garde sa majuscule (« de La Réunion », « du Caire »).
  var ARTICLE_DU_NOM = /^(La Réunion|La Havane|La Paz|La Mecque|La Valette|La Haye|La Rochelle|Le Caire|Le Cap|Le Havre|Le Mans|Le Puy|Les Sables)/;

  function texte(nom) { return String(nom).split('|')[0]; }
  // Découpe « La tour Eiffel » en ['la', 'tour Eiffel'] ; renvoie null si le nom n'a pas d'article.
  function article(nom) {
    var m = /^(?:(Le|La|Les)\s+|(L’|L'))(.+)$/.exec(nom);
    if (!m) return null;
    var a = (m[1] || m[2]).replace("'", '’');
    return { a: a, reste: m[3], propre: ARTICLE_DU_NOM.test(nom) };
  }
  function voyelle(t) { return /^[aeiouyhâàäéèêëîïôöûüœæ]/i.test(t); }

  // « le Togo », « la France », « l’Iran », « les Pays-Bas », « Cuba », « la tour Eiffel », « Le Caire ».
  function le(nom) {
    var t = texte(nom), x = article(t), g = GENRES[t];
    if (x) return x.propre ? t : x.a.toLowerCase() + (x.a === 'L’' ? '' : ' ') + x.reste;
    if (g === 'm') return 'le ' + t;
    if (g === 'f') return 'la ' + t;
    if (g === 'v') return 'l’' + t;
    if (g === 'p') return 'les ' + t;
    return t;
  }
  // « du Togo », « de la France », « de l’Iran », « des Pays-Bas », « de Cuba », « d’Israël », « du Caire ».
  function de(nom) {
    var t = texte(nom), x = article(t), g = GENRES[t];
    if (x) {
      if (x.a === 'Le') return 'du ' + x.reste;
      if (x.a === 'Les') return 'des ' + x.reste;
      return 'de ' + (x.propre ? t : le(t));
    }
    if (g === 'm') return 'du ' + t;
    if (g === 'p') return 'des ' + t;
    if (g === 'f' || g === 'v') return 'de ' + le(t);
    return (voyelle(t) ? 'd’' : 'de ') + t;
  }
  // Lieu : « au Togo », « en France », « en Iran », « aux Pays-Bas », « à Cuba », « en Israël », « en Europe ».
  function en(nom) {
    var t = texte(nom), x = article(t), g = GENRES[t];
    if (x) {
      if (x.propre) return (x.a === 'Le' ? 'au ' + x.reste : x.a === 'Les' ? 'aux ' + x.reste : 'à ' + t);
      if (x.a === 'Le') return 'au ' + x.reste;
      if (x.a === 'Les') return 'aux ' + x.reste;
      return 'en ' + x.reste;
    }
    if (g === 'm') return voyelle(t) ? 'en ' + t : 'au ' + t;
    if (g === 'f' || g === 'v' || g === 'v0') return 'en ' + t;
    if (g === 'p') return 'aux ' + t;
    return 'à ' + t;
  }
  // « à » : « au Nil », « à la France », « à l’abbé Pierre », « aux frères Lumière », « à Graham Bell ».
  function a(nom) {
    var t = texte(nom), x = article(t), g = GENRES[t];
    if (x) {
      if (x.a === 'Le') return 'au ' + x.reste;
      if (x.a === 'Les') return 'aux ' + x.reste;
      return 'à ' + (x.propre ? t : le(t));
    }
    if (g === 'm') return 'au ' + t;
    if (g === 'p') return 'aux ' + t;
    return 'à ' + le(t);
  }
  // Première lettre en minuscule (« Une butte de terre » → « une butte de terre »), sauf un sigle ou un nom propre
  // évident (deux majuscules au début, ou « L’ » suivi d'une majuscule reste « l’ »).
  function min(t) {
    t = texte(t);
    if (/^[A-ZÀ-Ý]{2}/.test(t)) return t;
    return t.charAt(0).toLowerCase() + t.slice(1);
  }
  // Pluriel ? (« Les découpes… », « Des rangées… ») : pour accorder le verbe (« Comment s’appellent… »).
  function pluriel(t) { return /^(les|des)\s/i.test(texte(t)); }

  var api = { le: le, de: de, en: en, a: a, min: min, pluriel: pluriel, GENRES: GENRES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Articles = api;
})(this);
