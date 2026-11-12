#!/usr/bin/env python3
"""Génère js/cartes-geo.js : les cartes du jeu « Carte à toucher » (Géographie, v7.1).

Sources (libres) :
  - France : contours IGN Admin Express COG (édition 2018, Licence ouverte), mis en GeoJSON par
    Grégoire David (github.com/gregoiredavid/france-geojson), versions simplifiées.
  - Europe et monde : Natural Earth 1:50m (domaine public, naturalearthdata.com).
Usage : python3 outils/cartes_geo.py <france-geojson> <ne_50m_admin_0_countries.geojson> <deps.json>
Zones trop petites pour être touchées (demande de l'utilisateur) : dessinées, mais jamais demandées.
"""
import json, math, sys

FR, NE, DEPS = sys.argv[1], sys.argv[2], sys.argv[3]
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

CARTES = {}

# ---------- France : régions ----------
reg = json.load(open(FR + '/regions-version-simplifiee.geojson'))
france = Carte(-5.3, 9.7, 41.2, 51.2)
zs = []
for f in reg['features']:
    d, bb = france.chemin(f['geometry'], 1.2)
    zs.append({'id': 'r' + f['properties']['code'], 'nom': f['properties']['nom'], 'd': d, 'cible': True})
CARTES['regions'] = {'vb': '0 0 %d %d' % (LARGEUR, round(france.h)), 'zones': zs, 'titre': 'les régions de France'}

# ---------- France : départements, une carte par région ----------
deps = {d['code']: d for d in json.load(open(DEPS))}
NOMS_REG = {'ARA': 'Auvergne-Rhône-Alpes', 'BFC': 'Bourgogne-Franche-Comté', 'BRE': 'Bretagne', 'CVL': 'Centre-Val de Loire',
            'COR': 'Corse', 'GE': 'Grand Est', 'HDF': 'Hauts-de-France', 'IDF': 'Île-de-France', 'NOR': 'Normandie',
            'NA': 'Nouvelle-Aquitaine', 'OCC': 'Occitanie', 'PDL': 'Pays de la Loire', 'PACA': 'Provence-Alpes-Côte d’Azur'}
dep = json.load(open(FR + '/departements-version-simplifiee.geojson'))
par_reg = {}
for f in dep['features']:
    par_reg.setdefault(deps[f['properties']['code']]['reg'], []).append(f)
for r, feats in par_reg.items():
    lons, lats = [], []
    for f in feats:
        for a in anneaux(f['geometry']):
            lons += [c[0] for c in a]; lats += [c[1] for c in a]
    marge = 0.15
    c = Carte(min(lons) - marge, max(lons) + marge, min(lats) - marge, max(lats) + marge)
    zs = []
    for f in feats:
        d, bb = c.chemin(f['geometry'], 1.0)
        code = f['properties']['code']
        if not d: print('vide', code, r); continue
        zs.append({'id': 'd' + code, 'nom': deps[code]['nom'], 'd': d, 'cible': assez_grande(bb, c, 0.07)})
    if sum(1 for z in zs if z['cible']) >= 2:
        CARTES['dep-' + r] = {'vb': '0 0 %d %d' % (LARGEUR, round(c.h)), 'zones': zs, 'titre': NOMS_REG[r]}

# ---------- Europe et monde (Natural Earth) ----------
ne = json.load(open(NE))
# Noms français corrigés (Natural Earth donne parfois une forme moins courante).
NOMS = {'CZ': 'Tchéquie', 'GB': 'Royaume-Uni', 'MK': 'Macédoine du Nord', 'BA': 'Bosnie-Herzégovine', 'RU': 'Russie',
        'US': 'États-Unis', 'CD': 'République démocratique du Congo', 'CF': 'République centrafricaine', 'SS': 'Soudan du Sud',
        'KR': 'Corée du Sud', 'KP': 'Corée du Nord', 'MM': 'Myanmar', 'VN': 'Viêt Nam', 'SA': 'Arabie saoudite', 'NL': 'Pays-Bas',
        'IE': 'Irlande', 'MD': 'Moldavie', 'BY': 'Biélorussie', 'CN': 'Chine', 'IR': 'Iran', 'TZ': 'Tanzanie', 'LY': 'Libye',
        'GL': 'Groenland (Danemark)', 'EH': None, 'PS': None, 'XK': 'Kosovo', 'NO': 'Norvège', 'FR': 'France'}
def iso(p):
    i = p.get('ISO_A2')
    if i in (None, '-99'):
        i = {'France': 'FR', 'Norway': 'NO', 'Kosovo': 'XK'}.get(p.get('NAME'), p.get('ADM0_A3'))
    return i
def nom_fr(p):
    i = iso(p)
    return NOMS.get(i, p.get('NAME_FR') or p.get('NAME'))

def carte_pays(c, choix, seuil, tol):
    zs = []
    for f in ne['features']:
        p = f['properties']
        d, bb = c.chemin(f['geometry'], tol, dedans=True)
        if not d:
            continue
        n = nom_fr(p)
        zs.append({'id': 'p' + iso(p), 'nom': n or '', 'd': d, 'cible': bool(n) and choix(p) and assez_grande(bb, c, seuil)})
    return zs

europe = Carte(-25, 45, 34, 71.5)
CARTES['europe'] = {'vb': '0 0 %d %d' % (LARGEUR, round(europe.h)), 'titre': 'l’Europe',
                    'zones': carte_pays(europe, lambda p: p.get('CONTINENT') == 'Europe' and iso(p) != 'RU', 0.06, 1.2)}
# Monde (Expert) : une carte par grande région, zoomée, pour que les pays restent assez grands à toucher.
MONDES = [('afrique', 'Afrique', (-20, 55, -36, 38), ('Africa',)),
          ('asie', 'Asie et Océanie', (25, 180, -48, 60), ('Asia', 'Oceania')),
          ('ameriques', 'Amériques', (-170, -30, -56, 75), ('North America', 'South America'))]
for cle, titre, b, conts in MONDES:
    c = Carte(*b)
    CARTES['monde-' + cle] = {'vb': '0 0 %d %d' % (LARGEUR, round(c.h)), 'titre': titre,
                              'zones': carte_pays(c, lambda p, conts=conts: p.get('CONTINENT') in conts, 0.06, 1.0)}

js = """// Cartes du jeu « Carte à toucher » (Géographie, v7.1), générées par outils/cartes_geo.py — ne pas modifier à la main.
// France : IGN Admin Express COG 2018 (Licence ouverte), via github.com/gregoiredavid/france-geojson.
// Europe et monde : Natural Earth 1:50m (domaine public).
// Chaque zone : id, nom, chemin SVG (d), cible (assez grande pour être touchée, sinon seulement dessinée).
(function (racine) {
  'use strict';
  var CARTES = %s;
  // niveau : 'regions' (Facile), 'departements' (Moyen : la carte d'une seule région), 'europe', 'monde'.
  function tirer(niveau, hasard) {
    hasard = hasard || Math.random;
    var id = niveau;
    // Départements : la carte d'une seule région ; monde : la carte d'une grande région (Afrique, Asie, Amériques).
    var prefixe = { departements: 'dep-', monde: 'monde-' }[niveau];
    if (prefixe) {
      var regs = Object.keys(CARTES).filter(function (k) { return k.indexOf(prefixe) === 0; });
      id = regs[Math.floor(hasard() * regs.length)];
    }
    var carte = CARTES[id];
    if (!carte) return null;
    var cibles = carte.zones.filter(function (z) { return z.cible; });
    var z = cibles[Math.floor(hasard() * cibles.length)];
    var quoi = { regions: 'la région', europe: 'le pays', monde: 'le pays' }[niveau] || 'le département';
    return {
      consigne: 'Touche ' + quoi + ' : ' + z.nom + (prefixe ? ' (' + carte.titre + ')' : ''),
      carte: id, zones: null, bonne: z.id, bonneNom: z.nom
    };
  }
  var api = { CARTES: CARTES, tirer: tirer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.CartesGeo = api;
})(this);
""" % json.dumps(CARTES, ensure_ascii=False, separators=(',', ':'))
open('js/cartes-geo.js', 'w').write(js)
for k, v in CARTES.items():
    print(k, len(v['zones']), sum(1 for z in v['zones'] if z['cible']))
print(len(js) // 1024, 'Ko')
