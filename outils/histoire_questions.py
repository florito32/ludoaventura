#!/usr/bin/env python3
"""Fabrique les fichiers js/histoire-<période>.js à partir des questions rangées dans outils/donnees/histoire/*.tsv.

Contexte (demande du 18/11/2026, BACKLOG ligne 425) : l'utilisateur a écrit des centaines de questions d'histoire avec leur
bonne réponse. Chaque ligne d'un fichier .tsv est une question reformulée (15 mots au plus), la bonne réponse (courte) et
les 3 mauvaises réponses du mode Quiz. Les fichiers js/histoire-*.js ne se modifient jamais à la main : on corrige le .tsv
puis on relance ce script.

Format d'un fichier .tsv (séparateur : tabulation ; les lignes qui commencent par # sont des réglages) :
    # jeu: r01                 identifiant du jeu de js/histoire.js qui reçoit les questions
    # famille: ren             période (nom du fichier js/histoire-ren.js produit)
    # source: histoire renaissance.docx, thème « Découvertes »
    niveau  question  bonne réponse  fausse 1  fausse 2  fausse 3  [extra]
  - niveau : facile, moyen, difficile ou expert (le niveau du fichier d'origine) ;
  - bonne réponse : « A|B » = A s'affiche, B est aussi accepté en question ouverte ;
  - extra (facultatif) : « ordre=Libellé|année » (frise chronologique : année négative avant J.-C.)
    ou « paire=Gauche|Droite » (à relier : un écrivain et son livre…).

Usage : python3 outils/histoire_questions.py [--verifier]   (--verifier : contrôle seulement, n'écrit rien)
"""
import csv
import glob
import json
import os
import re
import sys
import unicodedata

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DONNEES = os.path.join(RACINE, 'outils', 'donnees', 'histoire')
NIVEAUX = ['facile', 'moyen', 'difficile', 'expert']
MAX_MOTS = 15

# Réglages propres à chaque période : consigne de la frise, et poids de la série de questions (voir js/savoirs.js, auPoids).
PERIODES = {
    'pre': 'de la Préhistoire', 'ant': 'de l’Antiquité', 'mag': 'du Moyen Âge', 'ren': 'de la Renaissance',
    'mod': 'des Temps modernes', 'xix': 'du XIXe siècle', 'xx': 'du XXe siècle',
}
POIDS_QUESTIONS = 3


def typo(t):
    """Apostrophes courbes comme partout dans le jeu."""
    return t.strip().replace("'", '’')


def normal(t):
    t = unicodedata.normalize('NFD', t.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in t if not unicodedata.combining(c)))


def lire(chemin, erreurs):
    reglages, lignes = {}, []
    with open(chemin, encoding='utf-8', newline='') as f:
        for n, brut in enumerate(f, 1):
            brut = brut.rstrip('\n').rstrip('\r')
            if not brut.strip():
                continue
            m = re.match(r'#\s*(\w+)\s*:\s*(.*)$', brut)
            if m:
                reglages[m.group(1)] = m.group(2).strip()
                continue
            if brut.startswith('#'):
                continue
            c = brut.split('\t')
            nom = os.path.basename(chemin) + ':' + str(n)
            if len(c) < 6:
                erreurs.append(nom + ' : 6 colonnes attendues, %d trouvées' % len(c))
                continue
            niveau, q, bonne = c[0].strip(), typo(c[1]), typo(c[2])
            fausses = [typo(x) for x in c[3:6]]
            extra = c[6].strip() if len(c) > 6 else ''
            if niveau not in NIVEAUX:
                erreurs.append(nom + ' : niveau inconnu « %s »' % niveau)
            if len(q.split()) > MAX_MOTS:
                erreurs.append(nom + ' : %d mots (15 au plus) : %s' % (len(q.split()), q))
            if not q.endswith('?'):
                erreurs.append(nom + ' : la question doit finir par « ? » : ' + q)
            if re.search(r'[:{}]', q):
                erreurs.append(nom + ' : ni deux-points ni accolades dans la question : ' + q)
            attendues = [normal(x) for x in bonne.split('|')]
            if not bonne or '' in attendues:
                erreurs.append(nom + ' : bonne réponse vide')
            toutes = [normal(x) for x in fausses]
            if '' in toutes or len(set(toutes)) < 3:
                erreurs.append(nom + ' : 3 mauvaises réponses différentes attendues : ' + q)
            if set(toutes) & set(attendues):
                erreurs.append(nom + ' : une mauvaise réponse est aussi la bonne : ' + q)
            lignes.append({'niveau': niveau, 'q': q, 'bonne': bonne, 'fausses': fausses, 'extra': extra, 'nom': nom})
    return reglages, lignes


def serie_ordre(lignes, famille):
    niv = {}
    for l in lignes:
        if l['extra'].startswith('ordre='):
            libelle, annee = l['extra'][6:].split('|')
            annee = int(annee)
            affiche = ('%d av. J.-C.' % -annee) if annee < 0 else str(annee)
            niv.setdefault(l['niveau'], []).append([typo(libelle), annee, affiche, l['q']])
    if not niv:
        return None
    return {'k': 'ordre', 'consigne': 'Range ces événements %s du plus ancien au plus récent.' % PERIODES[famille],
            'q': 'En quelle année a eu lieu cet événement ?', 'niveaux': niv}


def serie_paires(lignes):
    niv = {}
    for l in lignes:
        if l['extra'].startswith('paire='):
            g, d = l['extra'][6:].split('|')
            niv.setdefault(l['niveau'], []).append([typo(g), typo(d), l['q']])
    return niv


def main():
    verifier = '--verifier' in sys.argv
    erreurs, par_famille, vus = [], {}, {}
    for chemin in sorted(glob.glob(os.path.join(DONNEES, '*.tsv'))):
        if os.path.basename(chemin).startswith('a-verifier'):
            continue  # questions écartées (pas à publier) : voir ce fichier
        reglages, lignes = lire(chemin, erreurs)
        jeu, famille = reglages.get('jeu'), reglages.get('famille')
        if not jeu or famille not in PERIODES:
            erreurs.append(os.path.basename(chemin) + ' : réglages « jeu » et « famille » manquants ou inconnus')
            continue
        # Une question ne doit apparaître qu'une fois dans un jeu (le jeu n'a que le contenu propre à chaque niveau).
        for l in lignes:
            cle = (jeu, normal(l['q']))
            if cle in vus:
                erreurs.append('%s : question déjà vue en %s : %s' % (l['nom'], vus[cle], l['q']))
            vus[cle] = l['nom']
        par_famille.setdefault(famille, {}).setdefault(jeu, []).extend(lignes)
    if erreurs:
        print('\n'.join(erreurs[:80]))
        print('%d erreur(s)' % len(erreurs))
        sys.exit(1)
    for famille, jeux in par_famille.items():
        sorties = []
        for jeu, lignes in jeux.items():
            niv = {n: [[l['q'], l['bonne'], l['fausses']] for l in lignes if l['niveau'] == n] for n in NIVEAUX}
            niv = {n: t for n, t in niv.items() if t}
            series = [{'k': 'qcm', 'ouverte': True, 'poids': POIDS_QUESTIONS, 'niveaux': niv}]
            ordre = serie_ordre(lignes, famille)
            if ordre:
                series.append(ordre)
            sorties.append((jeu, series, len(lignes)))
        total = sum(n for _, _, n in sorties)
        corps = ''
        for jeu, series, _ in sorties:
            corps += "  S.ajouterSeries('%s', [\n" % jeu
            for s in series:
                corps += '    ' + presenter(s) + ',\n'
            corps += '  ]);\n'
        texte = (
            "// Questions d'histoire ajoutées aux jeux existants — période « %s » : %d questions (demande du 18/11/2026, BACKLOG ligne 425).\n"
            "// FICHIER GÉNÉRÉ par outils/histoire_questions.py à partir de outils/donnees/histoire/*.tsv : ne pas modifier à la main.\n"
            "// Format : voir js/savoirs.js (série « qcm » : [question, bonne réponse, [3 mauvaises réponses]] ; « ouverte » : se pose aussi\n"
            "// en question ouverte à partir de Difficile ; « poids » : part de cette série dans le tirage).\n"
            "(function (racine) {\n  'use strict';\n"
            "  var S = typeof module !== 'undefined' && module.exports ? require('./savoirs.js') : racine.Savoirs;\n%s"
            "})(this);\n" % (famille, total, corps))
        chemin = os.path.join(RACINE, 'js', 'histoire-%s.js' % famille)
        if verifier:
            print('ok : %s (%d questions)' % (os.path.basename(chemin), total))
        else:
            with open(chemin, 'w', encoding='utf-8') as f:
                f.write(texte)
            print('écrit : %s (%d questions)' % (os.path.relpath(chemin, RACINE), total))


def presenter(s):
    """Une série en JavaScript : une ligne par niveau, pour que les différences restent lisibles."""
    j = lambda x: json.dumps(x, ensure_ascii=False, separators=(', ', ': '))
    tete = ', '.join('%s: %s' % (k, j(v)) for k, v in s.items() if k != 'niveaux')
    niv = ',\n'.join('      %s: [\n%s\n      ]' % (n, ',\n'.join('        ' + j(x) for x in t)) for n, t in s['niveaux'].items())
    return '{ %s, niveaux: {\n%s\n    } }' % (tete, niv)


if __name__ == '__main__':
    main()
