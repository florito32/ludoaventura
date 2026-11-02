"""Génère js/cartes.js (cartes JEU) à partir de outils/donnees/carte francais.xlsx.

Seules les feuilles dont le nom commence par « pack » sont reprises (demande de l'utilisateur).
Chaque feuille = un pack ; colonnes « mot niveau 1 / 2 / 3 » = les 3 niveaux.
Corrections d'accents et de fautes validées par l'utilisateur le 02/11/2026 (CORRECTIONS ci-dessous).
Lancer : python3 outils/cartes.py
"""
import json, pathlib, openpyxl

RACINE = pathlib.Path(__file__).resolve().parent.parent
SOURCE = RACINE / 'outils' / 'donnees' / 'carte francais.xlsx'

# Nom affiché de chaque pack (clé = nom de la feuille en minuscules).
NOMS = {
    'pack mots simples': 'Mots simples',
    'pack mots compliqués': 'Mots compliqués',
    'pack temps': 'Temps',
    'pack numerique': 'Numérique',
    'pack lettres': 'Lettres',
}

CORRECTIONS = {
    'APRES': 'APRÈS', 'TOT': 'TÔT', 'PRES': 'PRÈS', 'TRES': 'TRÈS', 'A': 'À',
    'CÔTE A CÔTE': 'CÔTE À CÔTE', 'TOUT A COUP': 'TOUT À COUP', 'ZERO': 'ZÉRO',
    'MIILIARD': 'MILLIARD', 'ÉLEPHANT': 'ÉLÉPHANT', 'VELO': 'VÉLO', 'ZEBRE': 'ZÈBRE',
    'GATEAU': 'GÂTEAU',
}

def corriger(feuille, niveau, mot, deja):
    mot = ' '.join(str(mot).split())
    if feuille == 'pack lettres' and niveau == 1:
        return mot  # la lettre « A » reste une lettre
    mot = CORRECTIONS.get(mot, mot)
    if mot == 'OU' and 'OU' in deja:
        mot = 'OÙ'  # « OU » était en double : le 2e est « OÙ »
    return mot

wb = openpyxl.load_workbook(SOURCE, data_only=True)
packs = []
for ws in wb.worksheets:
    cle = ws.title.strip().lower()
    if not cle.startswith('pack'):
        continue
    lignes = list(ws.iter_rows(values_only=True))[1:]
    niveaux = {}
    for n in (1, 2, 3):
        deja = []
        for ligne in lignes:
            v = ligne[n - 1] if len(ligne) >= n else None
            if v is None or str(v).strip() == '':
                continue
            deja.append(corriger(cle, n, v, deja))
        niveaux[str(n)] = deja
    ident = cle.replace('pack ', '').replace(' ', '-').replace('é', 'e')
    packs.append({'id': ident, 'nom': NOMS.get(cle, ws.title), 'niveaux': niveaux})

js = """// Cartes JEU d'Aventura — GÉNÉRÉ par outils/cartes.py depuis « carte francais.xlsx » (feuilles « pack »).
// Ne pas modifier à la main : corriger le fichier Excel puis relancer le script.
(function (racine) {
  'use strict';
  var PACKS = %s;
  if (typeof module !== 'undefined' && module.exports) module.exports = { PACKS: PACKS };
  else racine.Cartes = { PACKS: PACKS };
})(this);
""" % json.dumps(packs, ensure_ascii=False, indent=2)
(RACINE / 'js' / 'cartes.js').write_text(js, encoding='utf-8')
for p in packs:
    print(p['id'], p['nom'], {k: len(v) for k, v in p['niveaux'].items()})
