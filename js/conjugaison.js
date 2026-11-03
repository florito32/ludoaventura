// Cartes de conjugaison (Français → Conjugaison), demande de l'utilisateur du 03/11/2026.
// Le joueur choisit à la préparation : les temps (rangés par mode), les groupes de verbes (1er, 2e, 3e)
// et le niveau (Facile, Moyen, Difficile, Expert : des verbes de plus en plus rares ou pièges).
// À la pioche : un pronom, un verbe à l'infinitif et un temps ; le joueur écrit la forme, le jeu corrige.
//
// Moteur de conjugaison écrit pour le jeu (aucune bibliothèque) :
//  - 1er groupe : radical + terminaisons, avec les règles d'écriture (c → ç, g → ge, e → è, l → ll, t → tt,
//    é → è, y → i) ;
//  - 2e groupe : radical + iss ;
//  - 3e groupe (et être, avoir) : présent, passé simple, radical du futur et participe passé donnés verbe
//    par verbe ; imparfait et subjonctif déduits du présent (sauf exceptions données) ;
//  - temps composés : auxiliaire (avoir ou être) conjugué + participe passé (accordé au pluriel avec être).
// Quelques formes ont deux écritures admises (je paie / je paye, je cède / je cèderai, il connaît / il connait) :
// les deux sont acceptées. Module sans interface : window.Conjugaison et tests Node.
(function (racine) {
  'use strict';

  // ---------- Temps, rangés par mode ----------
  var MODES = [
    { id: 'indicatif', nom: 'Indicatif', oral: 'de l’indicatif', temps: [
      { id: 'present', nom: 'Présent' }, { id: 'imparfait', nom: 'Imparfait' }, { id: 'passe-simple', nom: 'Passé simple' },
      { id: 'futur', nom: 'Futur simple' }, { id: 'passe-compose', nom: 'Passé composé' },
      { id: 'plus-que-parfait', nom: 'Plus-que-parfait' }, { id: 'passe-anterieur', nom: 'Passé antérieur' },
      { id: 'futur-anterieur', nom: 'Futur antérieur' }] },
    { id: 'conditionnel', nom: 'Conditionnel', oral: 'du conditionnel', temps: [
      { id: 'present', nom: 'Présent' }, { id: 'passe', nom: 'Passé' }] },
    { id: 'subjonctif', nom: 'Subjonctif', oral: 'du subjonctif', temps: [
      { id: 'present', nom: 'Présent' }, { id: 'imparfait', nom: 'Imparfait' }, { id: 'passe', nom: 'Passé' },
      { id: 'plus-que-parfait', nom: 'Plus-que-parfait' }] },
    { id: 'imperatif', nom: 'Impératif', oral: 'de l’impératif', temps: [
      { id: 'present', nom: 'Présent' }, { id: 'passe', nom: 'Passé' }] }
  ];
  // Liste à plat : id « mode.temps » (ex. « indicatif.imparfait »).
  var TEMPS = [];
  MODES.forEach(function (m) {
    m.temps.forEach(function (t) {
      TEMPS.push({ id: m.id + '.' + t.id, mode: m, nom: t.nom, complet: m.nom + ' ' + t.nom.toLowerCase() });
    });
  });
  function temps(id) { for (var i = 0; i < TEMPS.length; i++) if (TEMPS[i].id === id) return TEMPS[i]; return null; }

  var NIVEAUX = [
    { id: 'facile', nom: 'Facile' }, { id: 'moyen', nom: 'Moyen' },
    { id: 'difficile', nom: 'Difficile' }, { id: 'expert', nom: 'Expert' }
  ];
  var GROUPES = [{ id: 1, nom: '1er groupe' }, { id: 2, nom: '2e groupe' }, { id: 3, nom: '3e groupe' }];
  var PRONOMS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

  // ---------- Verbes ----------
  // 1er groupe : type d'écriture du radical devant un e muet.
  //  e → è (lever), dbl = consonne doublée (appeler, jeter), eacc = é → è (céder),
  //  oy = y → i obligatoire (employer, appuyer), ay = y → i ou y (payer), envoyer.
  var G1 = {
    facile: [['chanter'], ['parler'], ['jouer'], ['aimer'], ['danser'], ['regarder'], ['donner'], ['marcher']],
    moyen: [['manger'], ['commencer'], ['lancer'], ['nager'], ['ranger'], ['avancer'], ['crier'], ['oublier'], ['travailler'], ['habiter']],
    difficile: [['appeler', 'dbl'], ['jeter', 'dbl'], ['acheter', 'e'], ['lever', 'e'], ['mener', 'e'], ['payer', 'ay'],
      ['essayer', 'ay'], ['employer', 'oy'], ['nettoyer', 'oy'], ['envoyer', 'envoyer']],
    expert: [['céder', 'eacc'], ['préférer', 'eacc'], ['répéter', 'eacc'], ['espérer', 'eacc'], ['geler', 'e'], ['peler', 'e'],
      ['rappeler', 'dbl'], ['rejeter', 'dbl'], ['appuyer', 'oy'], ['créer'], ['modeler', 'e'], ['amener', 'e']]
  };
  var G2 = {
    facile: ['finir', 'choisir', 'grandir', 'remplir'],
    moyen: ['rougir', 'salir', 'obéir', 'réussir', 'punir', 'bâtir'],
    difficile: ['réfléchir', 'nourrir', 'agir', 'applaudir', 'avertir', 'saisir'],
    expert: ['établir', 'frémir', 'gémir', 'ralentir', 'resplendir', 'assouvir', 'rétablir', 'franchir']
  };
  // 3e groupe (être et avoir y sont rangés, au niveau Facile).
  // p = présent (6 formes), ps = [radical, voyelle du passé simple], f = radical du futur, pp = participe passé,
  // e = auxiliaire être ; s = radicaux du subjonctif [je/tu/il/ils, nous/vous] s'ils ne viennent pas du présent ;
  // i = impératif [tu, nous, vous] s'il ne vient pas du présent (null : pas d'impératif).
  var G3 = {
    facile: [
      { v: 'être', p: 'suis es est sommes êtes sont', ps: ['f', 'u'], f: 'ser', pp: 'été', imp: 'ét',
        sp: 'sois sois soit soyons soyez soient', i: ['sois', 'soyons', 'soyez'] },
      { v: 'avoir', p: 'ai as a avons avez ont', ps: ['e', 'u'], f: 'aur', pp: 'eu',
        sp: 'aie aies ait ayons ayez aient', i: ['aie', 'ayons', 'ayez'] },
      { v: 'aller', p: 'vais vas va allons allez vont', ps: ['all', 'a'], f: 'ir', pp: 'allé', e: 1, s: ['aill', 'all'], i: ['va', 'allons', 'allez'] },
      { v: 'faire', p: 'fais fais fait faisons faites font', ps: ['f', 'i'], f: 'fer', pp: 'fait', s: ['fass', 'fass'] },
      { v: 'dire', p: 'dis dis dit disons dites disent', ps: ['d', 'i'], f: 'dir', pp: 'dit' },
      { v: 'voir', p: 'vois vois voit voyons voyez voient', ps: ['v', 'i'], f: 'verr', pp: 'vu' },
      { v: 'prendre', p: 'prends prends prend prenons prenez prennent', ps: ['pr', 'i'], f: 'prendr', pp: 'pris' },
      { v: 'venir', p: 'viens viens vient venons venez viennent', ps: ['v', 'in'], f: 'viendr', pp: 'venu', e: 1 }
    ],
    moyen: [
      { v: 'pouvoir', p: 'peux peux peut pouvons pouvez peuvent', ps: ['p', 'u'], f: 'pourr', pp: 'pu', s: ['puiss', 'puiss'], i: null },
      { v: 'vouloir', p: 'veux veux veut voulons voulez veulent', ps: ['voul', 'u'], f: 'voudr', pp: 'voulu', s: ['veuill', 'voul'], i: ['veuille', 'veuillons', 'veuillez'] },
      { v: 'savoir', p: 'sais sais sait savons savez savent', ps: ['s', 'u'], f: 'saur', pp: 'su', s: ['sach', 'sach'], i: ['sache', 'sachons', 'sachez'] },
      { v: 'mettre', p: 'mets mets met mettons mettez mettent', ps: ['m', 'i'], f: 'mettr', pp: 'mis' },
      { v: 'partir', p: 'pars pars part partons partez partent', ps: ['part', 'i'], f: 'partir', pp: 'parti', e: 1 },
      { v: 'sortir', p: 'sors sors sort sortons sortez sortent', ps: ['sort', 'i'], f: 'sortir', pp: 'sorti', e: 1 },
      { v: 'lire', p: 'lis lis lit lisons lisez lisent', ps: ['l', 'u'], f: 'lir', pp: 'lu' },
      { v: 'écrire', p: 'écris écris écrit écrivons écrivez écrivent', ps: ['écriv', 'i'], f: 'écrir', pp: 'écrit' },
      { v: 'boire', p: 'bois bois boit buvons buvez boivent', ps: ['b', 'u'], f: 'boir', pp: 'bu' }
    ],
    difficile: [
      { v: 'devoir', p: 'dois dois doit devons devez doivent', ps: ['d', 'u'], f: 'devr', pp: 'dû' },
      { v: 'tenir', p: 'tiens tiens tient tenons tenez tiennent', ps: ['t', 'in'], f: 'tiendr', pp: 'tenu' },
      { v: 'courir', p: 'cours cours court courons courez courent', ps: ['cour', 'u'], f: 'courr', pp: 'couru' },
      { v: 'mourir', p: 'meurs meurs meurt mourons mourez meurent', ps: ['mour', 'u'], f: 'mourr', pp: 'mort', e: 1 },
      { v: 'ouvrir', p: 'ouvre ouvres ouvre ouvrons ouvrez ouvrent', ps: ['ouvr', 'i'], f: 'ouvrir', pp: 'ouvert' },
      { v: 'offrir', p: 'offre offres offre offrons offrez offrent', ps: ['offr', 'i'], f: 'offrir', pp: 'offert' },
      { v: 'recevoir', p: 'reçois reçois reçoit recevons recevez reçoivent', ps: ['reç', 'u'], f: 'recevr', pp: 'reçu' },
      { v: 'croire', p: 'crois crois croit croyons croyez croient', ps: ['cr', 'u'], f: 'croir', pp: 'cru' },
      { v: 'connaître', p: 'connais connais connaît connaissons connaissez connaissent', ps: ['conn', 'u'], f: 'connaîtr', pp: 'connu' },
      { v: 'vivre', p: 'vis vis vit vivons vivez vivent', ps: ['véc', 'u'], f: 'vivr', pp: 'vécu' },
      { v: 'suivre', p: 'suis suis suit suivons suivez suivent', ps: ['suiv', 'i'], f: 'suivr', pp: 'suivi' },
      { v: 'rire', p: 'ris ris rit rions riez rient', ps: ['r', 'i'], f: 'rir', pp: 'ri' }
    ],
    expert: [
      { v: 'acquérir', p: 'acquiers acquiers acquiert acquérons acquérez acquièrent', ps: ['acqu', 'i'], f: 'acquerr', pp: 'acquis' },
      { v: 'résoudre', p: 'résous résous résout résolvons résolvez résolvent', ps: ['résol', 'u'], f: 'résoudr', pp: 'résolu' },
      { v: 'peindre', p: 'peins peins peint peignons peignez peignent', ps: ['peign', 'i'], f: 'peindr', pp: 'peint' },
      { v: 'craindre', p: 'crains crains craint craignons craignez craignent', ps: ['craign', 'i'], f: 'craindr', pp: 'craint' },
      { v: 'coudre', p: 'couds couds coud cousons cousez cousent', ps: ['cous', 'i'], f: 'coudr', pp: 'cousu' },
      { v: 'moudre', p: 'mouds mouds moud moulons moulez moulent', ps: ['moul', 'u'], f: 'moudr', pp: 'moulu' },
      { v: 'vaincre', p: 'vaincs vaincs vainc vainquons vainquez vainquent', ps: ['vainqu', 'i'], f: 'vaincr', pp: 'vaincu' },
      { v: 'conclure', p: 'conclus conclus conclut concluons concluez concluent', ps: ['concl', 'u'], f: 'conclur', pp: 'conclu' },
      { v: 'battre', p: 'bats bats bat battons battez battent', ps: ['batt', 'i'], f: 'battr', pp: 'battu' },
      { v: 'cueillir', p: 'cueille cueilles cueille cueillons cueillez cueillent', ps: ['cueill', 'i'], f: 'cueiller', pp: 'cueilli' },
      { v: 'valoir', p: 'vaux vaux vaut valons valez valent', ps: ['val', 'u'], f: 'vaudr', pp: 'valu', s: ['vaill', 'val'], i: null },
      { v: 'plaire', p: 'plais plais plaît plaisons plaisez plaisent', ps: ['pl', 'u'], f: 'plair', pp: 'plu' },
      { v: 'naître', p: 'nais nais naît naissons naissez naissent', ps: ['naqu', 'i'], f: 'naîtr', pp: 'né', e: 1 }
    ]
  };

  // ---------- Terminaisons ----------
  var T = {
    imparfait: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
    futur: ['ai', 'as', 'a', 'ons', 'ez', 'ont'],
    subj: ['e', 'es', 'e', 'ions', 'iez', 'ent'],
    ps: { a: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'], i: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
      u: ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'], in: ['ins', 'ins', 'int', 'înmes', 'întes', 'inrent'] },
    si: { a: ['asse', 'asses', 'ât', 'assions', 'assiez', 'assent'], i: ['isse', 'isses', 'ît', 'issions', 'issiez', 'issent'],
      u: ['usse', 'usses', 'ût', 'ussions', 'ussiez', 'ussent'], in: ['insse', 'insses', 'înt', 'inssions', 'inssiez', 'inssent'] }
  };
  var MUETTES = [0, 1, 2, 5]; // personnes dont la terminaison commence par un e muet (présent, subjonctif)

  // c → ç et g → ge devant a, â, o (commençons, mangea).
  function joindre(radical, fin) {
    if (/^[aâo]/.test(fin)) {
      if (/c$/.test(radical)) radical = radical.slice(0, -1) + 'ç';
      else if (/g$/.test(radical)) radical += 'e';
    }
    return radical + fin;
  }

  // Radical du 1er groupe devant un e muet. variante = vrai : l'autre écriture admise (paye, cèderai).
  function radicalMuet(R, type) {
    switch (type) {
      case 'e': return R.replace(/e([^aeiouyéèêë]+)$/, 'è$1');
      case 'dbl': return R + R.slice(-1);
      case 'eacc': return R.replace(/é([^aeiouyéèêë]+)$/, 'è$1');
      case 'oy': case 'ay': case 'envoyer': return R.replace(/y$/, 'i');
      default: return R;
    }
  }

  // Formes simples de chaque verbe : { 'indicatif.present': [6 formes ou null], … } + variantes admises.
  function premier(inf, type) {
    var R = inf.slice(0, -2), M = radicalMuet(R, type);
    var f = {}, variantes = {};
    function six(radicalDe, fins) { return fins.map(function (fin, k) { return joindre(radicalDe(k), fin); }); }
    var mu = function (k) { return MUETTES.indexOf(k) >= 0 ? M : R; };
    f['indicatif.present'] = six(mu, ['e', 'es', 'e', 'ons', 'ez', 'ent']);
    f['indicatif.imparfait'] = six(function () { return R; }, T.imparfait);
    f['indicatif.passe-simple'] = six(function () { return R; }, T.ps.a);
    var futur = type === 'envoyer' ? 'enverr' : (type === 'eacc' ? R : M) + (type === 'envoyer' ? '' : 'er');
    f['indicatif.futur'] = T.futur.map(function (fin) { return futur + fin; });
    f['conditionnel.present'] = T.imparfait.map(function (fin) { return futur + fin; });
    f['subjonctif.present'] = six(mu, T.subj);
    f['subjonctif.imparfait'] = six(function () { return R; }, T.si.a);
    f['imperatif.present'] = [null, f['indicatif.present'][0], null, f['indicatif.present'][3], f['indicatif.present'][4], null];
    // Autres écritures admises : payer (je paye, je payerai), céder (je cèderai, rectifications de 1990).
    if (type === 'ay' || type === 'eacc') {
      var autre = type === 'ay' ? R : M;
      var tf = autre + 'er';
      variantes['indicatif.futur'] = T.futur.map(function (fin) { return tf + fin; });
      variantes['conditionnel.present'] = T.imparfait.map(function (fin) { return tf + fin; });
      if (type === 'ay') {
        variantes['indicatif.present'] = ['e', 'es', 'e', 'ons', 'ez', 'ent'].map(function (fin) { return R + fin; });
        variantes['subjonctif.present'] = T.subj.map(function (fin) { return R + fin; });
        variantes['imperatif.present'] = [null, R + 'e', null, null, null, null];
      }
    }
    return { formes: f, variantes: variantes, pp: R + 'é', etre: false };
  }

  function deuxieme(inf) {
    var R = inf.slice(0, -2), I = R + 'iss', f = {};
    f['indicatif.present'] = ['is', 'is', 'it', 'issons', 'issez', 'issent'].map(function (fin) { return R + fin; });
    f['indicatif.imparfait'] = T.imparfait.map(function (fin) { return I + fin; });
    f['indicatif.passe-simple'] = T.ps.i.map(function (fin) { return R + fin; });
    f['indicatif.futur'] = T.futur.map(function (fin) { return inf + fin; });
    f['conditionnel.present'] = T.imparfait.map(function (fin) { return inf + fin; });
    f['subjonctif.present'] = T.subj.map(function (fin) { return I + fin; });
    f['subjonctif.imparfait'] = T.si.i.map(function (fin) { return R + fin; });
    f['imperatif.present'] = [null, R + 'is', null, I + 'ons', I + 'ez', null];
    return { formes: f, variantes: {}, pp: R + 'i', etre: false };
  }

  function troisieme(d) {
    var p = d.p.split(' '), f = {};
    var imp = d.imp || p[3].replace(/ons$/, '');
    f['indicatif.present'] = p;
    f['indicatif.imparfait'] = T.imparfait.map(function (fin) { return imp + fin; });
    f['indicatif.passe-simple'] = T.ps[d.ps[1]].map(function (fin) { return d.ps[0] + fin; });
    f['indicatif.futur'] = T.futur.map(function (fin) { return d.f + fin; });
    f['conditionnel.present'] = T.imparfait.map(function (fin) { return d.f + fin; });
    if (d.sp) f['subjonctif.present'] = d.sp.split(' ');
    else {
      var s1 = d.s ? d.s[0] : p[5].replace(/ent$/, ''), s2 = d.s ? d.s[1] : imp;
      f['subjonctif.present'] = T.subj.map(function (fin, k) { return (k === 3 || k === 4 ? s2 : s1) + fin; });
    }
    f['subjonctif.imparfait'] = T.si[d.ps[1]].map(function (fin) { return d.ps[0] + fin; });
    var i = d.i === undefined ? [p[1].replace(/es$/, 'e'), p[3], p[4]] : d.i;
    f['imperatif.present'] = i ? [null, i[0], null, i[1], i[2], null] : null;
    // Rectifications de 1990 : « il connait », « il plait », « je naitrai » sont aussi admis.
    var variantes = {};
    if (/aît/.test(d.p + d.f)) {
      Object.keys(f).forEach(function (t) {
        if (f[t] && f[t].some(function (x) { return x && /aît/.test(x); })) {
          variantes[t] = f[t].map(function (x) { return x && /aît/.test(x) ? x.replace(/aît/g, 'ait') : null; });
        }
      });
    }
    return { formes: f, variantes: variantes, pp: d.pp, etre: !!d.e };
  }

  // Tous les verbes : { inf, groupe, niveau, c (conjugaison simple) }.
  var VERBES = [];
  NIVEAUX.forEach(function (nv) {
    G1[nv.id].forEach(function (x) { VERBES.push({ inf: x[0], groupe: 1, niveau: nv.id, c: premier(x[0], x[1]) }); });
    G2[nv.id].forEach(function (x) { VERBES.push({ inf: x, groupe: 2, niveau: nv.id, c: deuxieme(x) }); });
    G3[nv.id].forEach(function (d) { VERBES.push({ inf: d.v, groupe: 3, niveau: nv.id, c: troisieme(d) }); });
  });
  function verbe(inf) { for (var i = 0; i < VERBES.length; i++) if (VERBES[i].inf === inf) return VERBES[i]; return null; }
  var AVOIR = verbe('avoir'), ETRE = verbe('être');

  // Temps composés : temps de l'auxiliaire.
  var COMPOSES = {
    'indicatif.passe-compose': 'indicatif.present', 'indicatif.plus-que-parfait': 'indicatif.imparfait',
    'indicatif.passe-anterieur': 'indicatif.passe-simple', 'indicatif.futur-anterieur': 'indicatif.futur',
    'conditionnel.passe': 'conditionnel.present', 'subjonctif.passe': 'subjonctif.present',
    'subjonctif.plus-que-parfait': 'subjonctif.imparfait', 'imperatif.passe': 'imperatif.present'
  };

  // Formes (sans pronom) acceptées pour un verbe, un temps et une personne (0 à 5) ;
  // la première est l'écriture donnée comme correction. [] si la forme n'existe pas.
  function formes(inf, idTemps, k) {
    var v = verbe(inf);
    if (!v) return [];
    var aux = COMPOSES[idTemps];
    if (aux) {
      var auxV = v.c.etre ? ETRE : AVOIR;
      var a = auxV.c.formes[aux];
      if (!a || !a[k] || !v.c.formes['imperatif.present'] && idTemps === 'imperatif.passe') return [];
      var pp = v.c.pp;
      if (v.c.etre && k >= 3) {
        var pl = /s$/.test(pp) ? pp : pp + 's';
        // Avec « vous », le participe reste au singulier si l'on vouvoie une seule personne : les deux sont admis.
        return k === 4 ? [a[k] + ' ' + pl, a[k] + ' ' + pp] : [a[k] + ' ' + pl];
      }
      return [a[k] + ' ' + pp];
    }
    var t = v.c.formes[idTemps];
    if (!t || !t[k]) return [];
    var liste = [t[k]];
    var w = v.c.variantes[idTemps];
    if (w && w[k] && liste.indexOf(w[k]) === -1) liste.push(w[k]);
    return liste;
  }

  // Personnes possibles à ce temps (impératif : tu, nous, vous).
  function personnes(inf, idTemps) {
    var r = [];
    for (var k = 0; k < 6; k++) if (formes(inf, idTemps, k).length) r.push(k);
    return r;
  }

  // Pronom écrit devant la forme : « j' » devant une voyelle ou un h muet, « que » au subjonctif.
  function avecPronom(idTemps, k, forme) {
    if (/^imperatif/.test(idTemps)) return forme;
    var pr = PRONOMS[k];
    var texte = pr === 'je' && /^[aeiouyhâàéèêîïôû]/i.test(forme) ? 'j’' + forme : pr + ' ' + forme;
    if (/^subjonctif/.test(idTemps)) texte = (/^[aeiouy]/.test(texte) ? 'qu’' : 'que ') + texte;
    return texte;
  }
  // Pronom affiché sur la carte, avant la case vide : « nous », « que tu », « (vous) » à l'impératif.
  function pronomCarte(idTemps, k) {
    if (/^imperatif/.test(idTemps)) return '(' + PRONOMS[k] + ')';
    var pr = PRONOMS[k];
    if (/^subjonctif/.test(idTemps)) return (pr === 'il' || pr === 'ils' ? 'qu’' : 'que ') + pr;
    return pr;
  }

  // Tableau complet pour l'aide « ? » : [[« nous finissions »], …] (une ligne par personne).
  function tableau(inf, idTemps) {
    return personnes(inf, idTemps).map(function (k) {
      return { personne: k, texte: avecPronom(idTemps, k, formes(inf, idTemps, k)[0]) };
    });
  }

  // Réponse écrite : minuscules, apostrophe droite, espaces simplifiés ; le pronom (et « que ») est facultatif.
  function normaliser(texte) {
    var t = String(texte || '').toLowerCase().replace(/[’`´]/g, '\'').replace(/[.!?;]+$/, '')
      .replace(/\s+/g, ' ').trim();
    t = t.replace(/^\((je|tu|il|nous|vous|ils)\)\s*/, '');
    t = t.replace(/^(que |qu' ?)/, '');
    t = t.replace(/^(j' ?|je |tu |il |elle |on |nous |vous |ils |elles )/, '');
    return t.trim();
  }
  function juste(texte, inf, idTemps, k) {
    var r = normaliser(texte);
    return formes(inf, idTemps, k).some(function (f) { return f === r; });
  }

  // « au présent de l'indicatif », « à l'imparfait du subjonctif ».
  function tempsOral(idTemps) {
    var t = temps(idTemps), nom = t.nom.toLowerCase();
    return (/^[aeiouyé]/.test(nom) ? 'à l’' : 'au ') + nom + ' ' + t.mode.oral;
  }

  // Tire une carte. reglages = { temps: ['indicatif.present', …], groupes: [1, 2, 3], niveau: 'facile' }.
  function generer(reglages, hasard) {
    hasard = hasard || Math.random;
    function tirer(t) { return t[Math.floor(hasard() * t.length)]; }
    var tps = (reglages.temps || []).filter(temps);
    if (!tps.length) tps = ['indicatif.present'];
    var groupes = reglages.groupes && reglages.groupes.length ? reglages.groupes : [1, 2, 3];
    var niveau = reglages.niveau || 'facile';
    var choix = VERBES.filter(function (v) { return v.niveau === niveau && groupes.indexOf(v.groupe) >= 0; });
    if (!choix.length) choix = VERBES.filter(function (v) { return groupes.indexOf(v.groupe) >= 0; });
    for (var essai = 0; essai < 200; essai++) {
      var v = tirer(choix), t = tirer(tps), ks = personnes(v.inf, t);
      if (!ks.length) continue; // ex. pouvoir n'a pas d'impératif
      var k = tirer(ks);
      return carte(v.inf, t, k);
    }
    return carte('chanter', 'indicatif.present', 0);
  }

  function carte(inf, idTemps, k) {
    var t = temps(idTemps), v = verbe(inf);
    return {
      verbe: inf, groupe: v.groupe, temps: idTemps, personne: k,
      mode: t.mode.nom, tempsNom: t.nom, pronom: pronomCarte(idTemps, k),
      bonne: avecPronom(idTemps, k, formes(inf, idTemps, k)[0]),
      oral: 'Conjugue le verbe ' + inf + ' ' + tempsOral(idTemps) + ', avec ' + PRONOMS[k] + '.'
    };
  }

  var api = { MODES: MODES, TEMPS: TEMPS, NIVEAUX: NIVEAUX, GROUPES: GROUPES, PRONOMS: PRONOMS, VERBES: VERBES,
    temps: temps, verbe: verbe, formes: formes, personnes: personnes, avecPronom: avecPronom, tableau: tableau,
    normaliser: normaliser, juste: juste, generer: generer, carte: carte, tempsOral: tempsOral };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Conjugaison = api;
})(this);
