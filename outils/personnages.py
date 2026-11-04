"""Personnages d'Aventura à partir des illustrations de l'utilisateur (v6.19).

Sources : outils/personnages/<id>.jpeg (personnages en pied sur fond blanc, 688 × 1529,
dossier « 09- Aventura/Images/personnages/détouré » de l'utilisateur ; « papi jo » → jo).

Produit :
  img/aventuriers/<id>.webp       buste pour le choix des aventuriers (400 × 440, fond pâle
                                  de la couleur de sa tenue, coins arrondis)
  img/aventuriers/<id>-pied.webp  corps entier détouré (fond transparent) pour le plateau
  js/figurines.js                 SVG en ligne du plateau : l'image découpée en corps + 2 jambes,
                                  pour que les jambes se balancent pendant la marche (css/site.css).

Lancer : python3 outils/personnages.py   (Pillow, NumPy et SciPy)
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RACINE, 'outils', 'personnages')
IDS = ['lea', 'tom', 'nour', 'malo', 'ines', 'jo', 'kenji', 'zoe', 'sam', 'awa']
# Fond du buste : teinte claire de la couleur principale de la tenue (choix de l'utilisateur, 04/11/2026),
# relevée à la main (le calcul automatique se laissait tromper par la peau et les objets).
FONDS = {
    'lea': '#fbd8bd',    # combinaison orange
    'tom': '#f3cfbd',    # tee-shirt rouille
    'nour': '#cdd9f1',   # manteau bleu marine
    'malo': '#d8eac6',   # gilet vert
    'ines': '#cbe3cb',   # veste vert foncé
    'jo': '#f0c9c3',     # gilet rouge brique
    'kenji': '#e7e2c3',  # gilet kaki
    'zoe': '#f8ecb3',    # combinaison jaune
    'sam': '#e9d8c1',    # gilet brun
    'awa': '#e2d1f4',    # tenue violette
}
HAUTEUR_PIED = 420  # pixels de l'image du plateau (personnage ≈ 116 px max à l'écran, ×3 pour les écrans denses)


# ---------- Détourage ----------
def masque_jo(forme, im):
    """Papi Jo se tient sur un tapis : tout le tapis est du fond, sauf ses jambes
    (contours relevés à la main sur l'image 688 × 1529), et les trous blancs de son filet."""
    h, w = forme
    tapis = Image.new('L', (w, h), 0); d = ImageDraw.Draw(tapis)
    d.rectangle([110, 1148, 580, 1400], fill=255)
    d.rectangle([470, 1148, 580, 1168], fill=0)    # bas du filet
    d.rectangle([306, 1398, 398, 1445], fill=255)  # ombre entre les bottes
    jg = [(222, 1140), (220, 1190), (212, 1210), (223, 1230), (224, 1260), (225, 1290), (230, 1330), (227, 1370), (218, 1400),
          (304, 1400), (300, 1390), (298, 1350), (304, 1310), (314, 1270), (319, 1230), (327, 1210), (324, 1190), (329, 1140)]
    jd = [(388, 1140), (385, 1190), (380, 1215), (390, 1240), (398, 1280), (403, 1330), (400, 1380), (403, 1400),
          (507, 1400), (492, 1390), (479, 1360), (479, 1320), (482, 1270), (482, 1240), (492, 1215), (489, 1190), (494, 1140)]
    d.polygon(jg, fill=0); d.polygon(jd, fill=0)
    blanc = (im.min(2) > 205) & ((im.max(2) - im.min(2)) < 30)
    filet = np.zeros(forme, bool); filet[950:1160, 470:545] = True
    return (np.asarray(tapis) > 0) | (blanc & filet)


def detourer(im, fond_force=None, seuil_clair=175, seuil_sat=28):
    """Fond = pixels clairs et peu saturés reliés au bord de l'image (ombres grises sous les
    pieds comprises). Renvoie une image RGBA, bord adouci, couleur « décontaminée » du blanc."""
    mx, mn = im.max(2), im.min(2)
    candidat = (mn > seuil_clair) & ((mx - mn) < seuil_sat)
    bas = np.zeros_like(candidat); bas[int(im.shape[0] * .85):] = True  # ombres un peu teintées
    candidat |= bas & (mn > 140) & ((mx - mn) < 50)
    if fond_force is not None:
        candidat |= fond_force
    lab, _ = nd.label(candidat)
    bord = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fond = np.isin(lab, list(bord))
    # Grands trous blancs fermés (entre un bras et le corps…).
    trou = (mn > 238) & ((mx - mn) < 10) & ~fond
    lab2, n2 = nd.label(trou)
    tailles = nd.sum(trou, lab2, range(1, n2 + 1))
    fond |= np.isin(lab2, [i + 1 for i, t in enumerate(tailles) if t > 400])
    if fond_force is not None:
        fond |= fond_force
    perso = ~fond
    lab3, n3 = nd.label(perso)
    tailles = nd.sum(perso, lab3, range(1, n3 + 1))
    perso = np.isin(lab3, [i + 1 for i, t in enumerate(tailles) if t > 1500])
    alpha = perso.astype(np.float32)
    bordure = perso & ~nd.binary_erosion(perso, iterations=2)
    alpha[bordure] = np.clip((255 - mn[bordure]) / 70.0, 0, 1)  # près du blanc → transparent
    a = np.clip(nd.gaussian_filter(alpha, 0.6) * perso, 0, 1)[..., None]
    F = np.where(a > 0.05, (im - (1 - a) * 255) / np.maximum(a, 0.05), im)  # C = aF + (1-a)·blanc
    return np.dstack([np.clip(F, 0, 255), a[..., 0] * 255]).astype(np.uint8)


# ---------- Buste ----------
def buste(rgba, fond):
    W, H = 400, 440
    a = rgba[..., 3] > 128
    ys, xs = np.nonzero(a)
    y0, y1 = ys.min(), ys.max(); hf = y1 - y0
    tete = a[y0: y0 + int(.09 * hf)]
    cx = np.nonzero(tete)[1].mean()
    hc = .40 * hf                      # du haut de la tête à la taille
    wc = hc * W / H
    haut = y0 - .05 * hf
    boite = (cx - wc / 2, haut, cx + wc / 2, haut + hc)
    perso = Image.fromarray(rgba).crop(tuple(int(round(v)) for v in boite)).resize((W, H), Image.LANCZOS)
    carte = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(carte)
    d.rounded_rectangle([0, 0, W - 1, H - 1], radius=48, fill=fond + (255,))
    halo = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse([W * .55, -H * .12, W * 1.25, H * .52], fill=(255, 255, 255, 60))
    masque = Image.new('L', (W, H), 0); ImageDraw.Draw(masque).rounded_rectangle([0, 0, W - 1, H - 1], radius=48, fill=255)
    carte.alpha_composite(Image.composite(halo, Image.new('RGBA', (W, H)), masque))
    perso_m = Image.composite(perso, Image.new('RGBA', (W, H)), masque)
    carte.alpha_composite(perso_m)
    return carte


# ---------- Figurine du plateau ----------
def pied(rgba):
    """Recadre au personnage et met à l'échelle ; renvoie l'image et la découpe des jambes."""
    a = rgba[..., 3] > 40
    ys, xs = np.nonzero(a)
    m = 6
    img = Image.fromarray(rgba).crop((xs.min() - m, ys.min() - m, xs.max() + m + 1, ys.max() + 2))
    k = HAUTEUR_PIED / img.height
    img = img.resize((round(img.width * k), HAUTEUR_PIED), Image.LANCZOS)
    al = np.asarray(img)[..., 3] > 100
    h, w = al.shape
    # Pieds : bas de l'image, deux morceaux séparés par l'écart entre les jambes.
    cols = np.nonzero(al[int(h * .95):].any(0))[0]
    trous = np.nonzero(np.diff(cols) > 1)[0]
    ecart = max(trous, key=lambda i: cols[i + 1] - cols[i])  # le plus grand écart
    gx0, gx1, dx0, dx1 = cols[0], cols[ecart], cols[ecart + 1], cols[-1]
    cx = (gx1 + dx0) / 2
    # Entrejambe (ou bas du manteau) : plus haut point d'où l'axe entre les jambes est vide jusqu'en bas.
    bande = al[:, int(cx) - 1: int(cx) + 2].any(1)
    y = h - 1
    while y > 0 and not bande[y - 1]:
        y -= 1
    yc = y
    # Largeur des jambes sous la découpe (sans les objets suspendus plus loin).
    rang = al[min(yc + 6, h - 1)]
    g = int(cx)
    while g > 0 and rang[g - 1]: g -= 1
    if not rang[int(cx) - 3]:  # rien juste à gauche : on prend les pieds
        g = gx0
    dd = int(cx) + 1
    while dd < w - 1 and rang[dd + 1]: dd += 1
    if not rang[int(cx) + 3]:
        dd = dx1
    g = min(g, gx0) - 3
    dd = max(dd, dx1) + 3
    return img, dict(w=w, h=h, cx=round(cx, 1), yc=int(yc), g=int(max(g, 0)), d=int(min(dd, w)))


def svg_figurine(id_, p):
    w, h, cx, yc, g, d = p['w'], p['h'], p['cx'], p['yc'], p['g'], p['d']
    rec = int(h * .05)  # les jambes remontent sous le corps : pas de trou quand elles pivotent
    url = f'img/aventuriers/{id_}-pied.webp'
    img = f'<image href="{url}" width="{w}" height="{h}"'
    pivot_g = f'{(g + cx) / 2:.1f}px {yc}px'
    pivot_d = f'{(cx + d) / 2:.1f}px {yc}px'
    corps = f'M0 0H{w}V{h}H0Z M{g} {yc}H{d}V{h}H{g}Z'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMax meet" '
            f'class="figurine-svg" aria-hidden="true" focusable="false"><defs>'
            f'<clipPath id="fg-{id_}-g"><rect x="{g}" y="{yc - rec}" width="{cx - g:.1f}" height="{h - yc + rec}"/></clipPath>'
            f'<clipPath id="fg-{id_}-d"><rect x="{cx}" y="{yc - rec}" width="{d - cx:.1f}" height="{h - yc + rec}"/></clipPath>'
            f'<clipPath id="fg-{id_}-c"><path clip-rule="evenodd" d="{corps}"/></clipPath></defs>'
            f'<g class="jambe-g" style="transform-box:view-box;transform-origin:{pivot_g}">{img} clip-path="url(#fg-{id_}-g)"/></g>'
            f'<g class="jambe-d" style="transform-box:view-box;transform-origin:{pivot_d}">{img} clip-path="url(#fg-{id_}-d)"/></g>'
            f'<g class="corps" style="transform-box:view-box;transform-origin:{cx}px {yc}px">{img} clip-path="url(#fg-{id_}-c)"/></g></svg>')


def main():
    sortie = os.path.join(RACINE, 'img', 'aventuriers')
    figs, couleurs = {}, {}
    for id_ in IDS:
        im = np.asarray(Image.open(os.path.join(SRC, id_ + '.jpeg')).convert('RGB')).astype(np.float32)
        rgba = detourer(im, masque_jo(im.shape[:2], im) if id_ == 'jo' else None)
        fond = tuple(int(FONDS[id_][i:i + 2], 16) for i in (1, 3, 5))
        couleurs[id_] = '#%02x%02x%02x' % fond
        buste(rgba, fond).save(os.path.join(sortie, id_ + '.webp'), 'WEBP', quality=84, method=6)
        img, p = pied(rgba)
        img.save(os.path.join(sortie, id_ + '-pied.webp'), 'WEBP', quality=86, method=6)
        figs[id_] = svg_figurine(id_, p)
        print(id_, couleurs[id_], p)
    js = ('// Personnages en pied posés sur le plateau (SVG en ligne). Fichier généré par outils/personnages.py : ne pas modifier à la main.\n'
          '// Chaque personnage est son illustration (img/aventuriers/<id>-pied.webp) découpée en trois : le corps et les deux jambes,\n'
          '// qui se balancent pendant la marche (css/site.css → .pion.marche).\n'
          '(function (racine) {\n  \'use strict\';\n  var FIGURINES = ' + json.dumps(figs, indent=2, ensure_ascii=False) + ';\n'
          '  if (typeof module !== \'undefined\' && module.exports) module.exports = FIGURINES;\n'
          '  else racine.Figurines = FIGURINES;\n})(this);\n')
    open(os.path.join(RACINE, 'js', 'figurines.js'), 'w', encoding='utf-8').write(js)


if __name__ == '__main__':
    main()
