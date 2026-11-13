"""Génère js/cartes-geo.js : les cartes des jeux Carte France, Carte Europe et Carte Monde (Géographie, v8.0).

Sources (libres) :
  - France : contours IGN Admin Express COG (édition 2018, Licence ouverte), mis en GeoJSON par
    Grégoire David (github.com/gregoiredavid/france-geojson), versions simplifiées.
  - Europe et monde : Natural Earth 1:50m (domaine public, naturalearthdata.com).
  - Populations des départements : Insee, populations de référence 2022 (outils/donnees/population-departements.csv ;
    Mayotte : recensement exhaustif Insee, 1er janvier 2026).
Usage : python3 outils/cartes_geo.py <dossier france-geojson> <ne_50m_admin_0_countries.geojson>
Niveaux (choix de l'utilisateur du 13/11/2026) : départements par population (25 / 25 / 25 / le reste),
pays par superficie (calculée sur les contours), découpés en quatre parts égales.
Zones trop petites pour être touchées, même en zoomant : dessinées, mais jamais demandées.
"""
import csv, json, math, sys

FR, NE = sys.argv[1], sys.argv[2]
LARGEUR = 1000.0
def dp(points, tol):
    """Douglas-Peucker : simplifie un anneau fermé (liste de (x, y)) en le coupant au point le plus éloigné du premier."""
    if len(points) < 4:
        return points
    x0, y0 = points[0]
    m = max(range(len(points)), key=lambda i: (points[i][0] - x0) ** 2 + (points[i][1] - y0) ** 2)
    if m == 0:
        return points[:1]
    return dp_ligne(points[:m + 1], tol)[:-1] + dp_ligne(points[m:], tol)

def dp_ligne(points, tol):
    """Douglas-Peucker sur une ligne ouverte."""
    if len(points) < 3:
        return points
    garde = [False] * len(points)
    garde[0] = garde[-1] = True
    pile = [(0, len(points) - 1)]
    while pile:
        a, b = pile.pop()
        ax, ay = points[a]; bx, by = points[b]
        dx, dy = bx - ax, by - ay
        n = math.hypot(dx, dy) or 1e-9
        loin, k = -1, -1
        for i in range(a + 1, b):
            px, py = points[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / n
            if d > loin:
                loin, k = d, i
        if loin > tol:
            garde[k] = True
            pile += [(a, k), (k, b)]
    return [p for p, g in zip(points, garde) if g]

def anneaux(geom):
    if geom['type'] == 'Polygon':
        return geom['coordinates']
    return [r for poly in geom['coordinates'] for r in poly]

class Carte:
    """Projection équirectangulaire (x corrigé par cos de la latitude moyenne) sur une boîte lon/lat."""
    def __init__(self, lon0, lon1, lat0, lat1):
        self.lon0, self.lat1 = lon0, lat1
        self.k = math.cos(math.radians((lat0 + lat1) / 2))
        self.ech = LARGEUR / ((lon1 - lon0) * self.k)
        self.h = (lat1 - lat0) * self.ech
        self.boite = (lon0, lon1, lat0, lat1)
    def p(self, lon, lat):
        return ((lon - self.lon0) * self.k * self.ech, (self.lat1 - lat) * self.ech)
    def chemin(self, geom, tol=0.8, dedans=None):
        """Chemin SVG (coordonnées arrondies) ; bbox en pixels ; anneaux hors de la boîte ignorés."""
        morceaux, xs, ys = [], [], []
        lon0, lon1, lat0, lat1 = self.boite
        for r in anneaux(geom):
            if dedans is not None:
                cx = sum(c[0] for c in r) / len(r); cy = sum(c[1] for c in r) / len(r)
                if not (lon0 - 5 <= cx <= lon1 + 5 and lat0 - 5 <= cy <= lat1 + 5):
                    continue
            pts = dp([self.p(c[0], c[1]) for c in r], tol)
            if len(pts) < 3:
                continue
            # Petites îles minuscules : ignorées (illisibles et intouchables).
            w = max(x for x, _ in pts) - min(x for x, _ in pts); h = max(y for _, y in pts) - min(y for _, y in pts)
            if w < 2 and h < 2:
                continue
            xs += [x for x, _ in pts]; ys += [y for _, y in pts]
            # Chemin en coordonnées relatives (plus court) : M x,y puis l dx dy…
            q = [(round(x), round(y)) for x, y in pts]
            rel = ['%d %d' % (q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]) for i in range(1, len(q))]
            rel = [r for r in rel if r != '0 0']
            morceaux.append('M%d %dl' % q[0] + ' '.join(rel).replace(' -', '-') + 'z')
        if not morceaux:
            return None, None
        return ''.join(morceaux), (min(xs), min(ys), max(xs), max(ys))

def zone(id_, nom, d, bbox, carte, cible):
    return {'id': id_, 'nom': nom, 'd': d, 'cible': cible}

def assez_grande(bbox, carte, seuil):
    """Assez grande pour un doigt : le plus petit côté fait au moins seuil × largeur de la carte."""
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    taille = max(LARGEUR, carte.h)
    return min(w, h) >= seuil * taille

NIVEAUX = ['facile', 'moyen', 'difficile', 'expert']

def aire(geom):
    """Superficie approchée (projection sinusoïdale, en degrés² × cos) : sert seulement à ranger les pays."""
    total = 0.0
    polys = [geom['coordinates']] if geom['type'] == 'Polygon' else geom['coordinates']
    for poly in polys:
        for k, r in enumerate(poly):
            a = 0.0
            for (x1, y1), (x2, y2) in zip(r, r[1:] + r[:1]):
                a += x1 * math.cos(math.radians(y1)) * y2 - x2 * math.cos(math.radians(y2)) * y1
            total += abs(a) / 2 * (1 if k == 0 else -1)
    return total

def quarts(ids):
    """ids rangés du plus facile au plus dur → niveau de chacun (4 parts égales, la dernière prend le reste)."""
    n = len(ids) // 4
    return {i: NIVEAUX[min(3, k // n)] for k, i in enumerate(ids)}

CARTES = {}

# ---------- France : tous les départements de métropole, sur une seule carte ----------
pop = {r['code']: int(r['population']) for r in csv.DictReader(open('outils/donnees/population-departements.csv'), delimiter=';')}
rang = quarts(sorted(pop, key=lambda c: -pop[c]))          # 101 départements : 25, 25, 25, 26
dep = json.load(open(FR + '/departements-version-simplifiee.geojson'))
france = Carte(-5.3, 9.7, 41.2, 51.2)
zs = []
for f in dep['features']:
    code = f['properties']['code']
    d, bb = france.chemin(f['geometry'], 0.9)
    if not d:
        continue
    zs.append({'id': 'd' + code, 'nom': f['properties']['nom'], 'd': d, 'cible': assez_grande(bb, france, 0.006), 'niv': rang[code]})
CARTES['france'] = {'vb': '0 0 %d %d' % (LARGEUR, round(france.h)), 'zones': zs, 'titre': 'la France', 'quoi': 'le département'}

# ---------- Europe et monde (Natural Earth) ----------
ne = json.load(open(NE))
NOMS = {'CZ': 'Tchéquie', 'GB': 'Royaume-Uni', 'MK': 'Macédoine du Nord', 'BA': 'Bosnie-Herzégovine', 'RU': 'Russie',
        'US': 'États-Unis', 'CD': 'République démocratique du Congo', 'CF': 'Centrafrique', 'SS': 'Soudan du Sud',
        'KR': 'Corée du Sud', 'KP': 'Corée du Nord', 'MM': 'Birmanie', 'VN': 'Viêt Nam', 'SA': 'Arabie saoudite', 'NL': 'Pays-Bas',
        'IE': 'Irlande', 'MD': 'Moldavie', 'BY': 'Biélorussie', 'CN': 'Chine', 'IR': 'Iran', 'TZ': 'Tanzanie', 'LY': 'Libye',
        'GL': 'Groenland', 'XK': 'Kosovo', 'NO': 'Norvège', 'FR': 'France', 'VA': 'Vatican', 'CG': 'Congo',
        'CI': 'Côte d’Ivoire', 'TL': 'Timor oriental', 'SZ': 'Eswatini', 'CV': 'Cap-Vert', 'DO': 'République dominicaine',
        'AE': 'Émirats arabes unis', 'GW': 'Guinée-Bissau', 'GQ': 'Guinée équatoriale', 'PG': 'Papouasie-Nouvelle-Guinée',
        'BN': 'Brunei', 'LA': 'Laos', 'SY': 'Syrie', 'FM': 'Micronésie', 'MH': 'Îles Marshall', 'SB': 'Îles Salomon',
        'TT': 'Trinité-et-Tobago', 'PS': 'Palestine', 'EH': 'Sahara occidental', 'TW': 'Taïwan', 'KN': 'Saint-Christophe-et-Niévès'}
# Pays demandés : États souverains (et Kosovo, Palestine, Taïwan, Groenland) ; dépendances seulement dessinées.
DEMANDES = ('Sovereign country', 'Country', 'Sovereignty', 'Disputed')
NON = {'EH', 'IO', 'FK', 'AX', 'GG', 'JE', 'IM', 'FO', 'CY-N'}
def iso(p):
    i = p.get('ISO_A2')
    if i in (None, '-99'):
        i = {'France': 'FR', 'Norway': 'NO', 'Kosovo': 'XK', 'N. Cyprus': 'CY-N', 'Somaliland': 'SO-S'}.get(p.get('NAME'), p.get('ADM0_A3'))
    return i
def nom_fr(p):
    n = NOMS.get(iso(p)) or p.get('NAME_FR') or p.get('NAME')
    return n[0].upper() + n[1:]
def demande(p):
    return (p.get('TYPE') in DEMANDES or iso(p) in ('PS', 'TW')) and iso(p) not in NON and len(iso(p)) == 2

def carte_pays(c, choix, seuil, tol, titre, cle):
    zs = []
    for f in ne['features']:
        p = f['properties']
        if p.get('CONTINENT') == 'Antarctica':
            continue
        d, bb = c.chemin(f['geometry'], tol, dedans=True)
        if not d:
            continue
        ok = demande(p) and choix(p) and assez_grande(bb, c, seuil)
        zs.append({'id': 'p' + iso(p), 'nom': nom_fr(p), 'd': d, 'cible': ok, 'cont': p.get('CONTINENT'), '_aire': aire(f['geometry'])})
    rangs = quarts([z['id'] for z in sorted([z for z in zs if z['cible']], key=lambda z: -z['_aire'])])
    for z in zs:
        z['niv'] = rangs.get(z['id'])
        del z['_aire']
        if not z['cible']:
            del z['niv']
    CARTES[cle] = {'vb': '0 0 %d %d' % (LARGEUR, round(c.h)), 'titre': titre, 'quoi': 'le pays', 'zones': zs}

EUROPE = lambda p: p.get('CONTINENT') == 'Europe' or iso(p) == 'CY'
carte_pays(Carte(-25, 50, 34, 71.5), EUROPE, 0.0035, 1.0, 'l’Europe', 'europe')
carte_pays(Carte(-170, 180, -57, 83.7), lambda p: True, 0.0028, 0.9, 'le monde', 'monde')

for c in CARTES.values():
    for z in c['zones']:
        if z.get('cont') is None: z.pop('cont', None)

js = """// Cartes des jeux Carte France, Carte Europe et Carte Monde (Géographie, v8.0), générées par outils/cartes_geo.py — ne pas modifier à la main.
// France : IGN Admin Express COG 2018 (Licence ouverte), via github.com/gregoiredavid/france-geojson ; niveaux = population Insee 2022.
// Europe et monde : Natural Earth 1:50m (domaine public) ; niveaux = superficie des pays.
// Chaque zone : id, nom, chemin SVG (d), cible (assez grande pour être touchée, même en zoomant), niv (niveau), cont (continent).
(function (racine) {
  'use strict';
  var CARTES = %s;
  function auHasard(t, h) { return t[Math.floor(h() * t.length)]; }
  function melanger(t, h) {
    t = t.slice();
    for (var i = t.length - 1; i > 0; i--) { var k = Math.floor(h() * (i + 1)); var x = t[i]; t[i] = t[k]; t[k] = x; }
    return t;
  }
  function zonesDu(id, niveau) { return (CARTES[id] || { zones: [] }).zones.filter(function (z) { return z.cible && z.niv === niveau; }); }
  // carte : 'france', 'europe' ou 'monde' ; niveau : 'facile'… ; mode : 'normal' (toucher la zone nommée)
  // ou 'quiz' (la zone est en vert, 4 noms au choix dont un seul bon, choix de l'utilisateur du 13/11/2026).
  function tirer(id, niveau, hasard, mode) {
    hasard = hasard || Math.random;
    var carte = CARTES[id], cibles = zonesDu(id, niveau);
    if (!carte || !cibles.length) return null;
    var z = auHasard(cibles, hasard);
    if (mode !== 'quiz') {
      return { format: 'C', consigne: 'Touche ' + carte.quoi + ' : ' + z.nom, carte: id, bonne: z.id, bonneNom: z.nom, touche: null };
    }
    // Mauvais choix : du même niveau, de préférence du même continent (monde) ; sinon des niveaux voisins.
    var autres = cibles.filter(function (x) { return x.id !== z.id && (!z.cont || id !== 'monde' || x.cont === z.cont); });
    if (autres.length < 3) autres = cibles.filter(function (x) { return x.id !== z.id; });
    if (autres.length < 3) autres = carte.zones.filter(function (x) { return x.cible && x.id !== z.id; });
    var noms = melanger(autres, hasard).slice(0, 3).map(function (x) { return x.nom; });
    return {
      format: 'Q', consigne: 'Comment s’appelle ' + carte.quoi + ' en vert ?', carte: id, verte: z.id,
      options: melanger([z.nom].concat(noms), hasard), bonne: z.nom
    };
  }
  var api = { CARTES: CARTES, tirer: tirer, zonesDu: zonesDu };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.CartesGeo = api;
})(this);
""" % json.dumps(CARTES, ensure_ascii=False, separators=(',', ':'))
open('js/cartes-geo.js', 'w').write(js)
for k, v in CARTES.items():
    cib = [z for z in v['zones'] if z['cible']]
    print(k, len(v['zones']), len(cib), {n: sum(1 for z in cib if z['niv'] == n) for n in NIVEAUX})
print(len(js) // 1024, 'Ko')
