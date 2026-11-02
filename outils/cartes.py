"""Génère js/cartes.js (cartes JEU) à partir de outils/donnees/carte francais.xlsx.

Seules les feuilles dont le nom commence par « pack » sont reprises (demande de l'utilisateur).
Chaque feuille = un pack ; colonnes « mot niveau 1 / 2 / 3 » = les 3 niveaux.
Corrections d'accents et de fautes validées par l'utilisateur le 02/11/2026 (CORRECTIONS ci-dessous).
Lancer : python3 outils/cartes.py
"""
import json, pathlib, re, openpyxl

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

# ---------- Syllabes (syllabes écrites, découpage par règles puis corrections relues à la main) ----------
V=set('aeiouyàâäéèêëîïôöùûüÿœ')
INSEP={'bl','br','cl','cr','dr','fl','fr','gl','gr','pl','pr','tr','vr','ch','ph','th','gn'}
def syl_mot(m):
    w=m.lower()
    # u après q/g devant voyelle : fait partie de la consonne
    units=[];i=0
    while i<len(w):
        if w[i] in 'qg' and i+1<len(w) and w[i+1]=='u' and i+2<len(w) and w[i+2] in V:
            units.append(w[i:i+2]);i+=2;continue
        units.append(w[i]);i+=1
    isv=[u in V for u in units]
    # noyaux = groupes de voyelles consécutives
    groups=[];cur=[];
    for u,v in zip(units,isv):
        if v: cur.append(u)
        else:
            if cur: groups.append(('V',''.join(cur)));cur=[]
            groups.append(('C',u))
    if cur: groups.append(('V',''.join(cur)))
    # assemble syllables
    syls=[];buf=''
    idx=[k for k,g in enumerate(groups) if g[0]=='V']
    if not idx: return [m]
    out=[];start=0
    for n,k in enumerate(idx):
        if n==len(idx)-1:
            out.append(''.join(g[1] for g in groups[start:])); break
        nxt=idx[n+1]
        cons=[g[1] for g in groups[k+1:nxt]]
        if len(cons)==0: cut=k+1
        elif len(cons)==1: cut=k+1
        elif len(cons)==2: cut=k+1 if (cons[0]+cons[1]) in INSEP else k+2
        else:
            cut=k+2 if (cons[1]+cons[2]) in INSEP else k+3
        out.append(''.join(g[1] for g in groups[start:cut])); start=cut
    return out
def syl(expr):
    parts=re.split(r"([\s'’\-…\.]+)",expr)
    res=[]
    for p in parts:
        if not p or re.fullmatch(r"[\s'’\-…\.]+",p): res.append(p); continue
        res.append('-'.join(syl_mot(p)))
    return ''.join(res)

SYLLABES_CORRIGEES = {
    'LION': 'LI-ON', 'NUAGE': 'NU-A-GE', 'KOALA': 'KO-A-LA', 'YAOURT': 'YA-OURT', 'JOUET': 'JOU-ET',
    "AUJOURD'HUI": "AU-JOUR-D'HUI",
}

# ---------- Lettres muettes ----------
# Convention (à valider par l'utilisateur) : consonnes finales non prononcées, « e » muet final, « h » (hors ch, ph, th).
# Écriture : la lettre muette est en minuscule. None = mot exclu de cette question (prononciation variable).
MUETTES = {
    # Mots simples
    'UNE': 'UNe', 'DES': 'DEs', 'SES': 'SEs', 'ELLE': 'ELLe', 'ILS': 'ILs', 'DONT': 'DONt', 'ET': 'Et', 'ENSUITE': 'ENSUITe',
    'DANS': 'DANs', 'CHEZ': 'CHEz', 'APRÈS': 'APRÈs', 'TÔT': 'TÔt', 'NOTRE': 'NOTRe', 'NOS': 'NOs', 'MES': 'MEs', 'CES': 'CEs',
    'NOUS': 'NOUs', 'ELLES': 'ELLes', 'TOUT': 'TOUt', 'ALORS': 'ALORs', 'ENTRE': 'ENTRe', 'QUAND': 'QUANd', 'PRÈS': 'PRÈs',
    'TOUJOURS': 'TOUJOURs', 'TROP': 'TROp', 'PLUS': None, 'VOTRE': 'VOTRe', 'VOS': 'VOs', 'COUSINE': 'COUSINe', 'LES': 'LEs',
    'TES': 'TEs', 'QUELLE': 'QUELLe', 'VOUS': 'VOUs', 'MAIS': 'MAIs', 'PUIS': 'PUIs', 'SOUS': 'SOUs', 'AVANT': 'AVANt',
    'SANS': 'SANs', 'COMME': 'COMMe', 'COMMENT': 'COMMENt', 'TARD': 'TARd', 'ENCORE': 'ENCORe', 'TRÈS': 'TRÈs', 'MOINS': 'MOINs',
    'LEURS': 'LEURs', 'FRÈRE': 'FRÈRe', 'TANTE': 'TANTe',
    # Mots compliqués
    'PLUSIEURS': 'PLUSIEURs', 'PEUT-ÊTRE': 'PEUt-ÊTRe', 'DESSUS': 'DESSUs', 'VERS': 'VERs', 'DEPUIS': 'DEPUIs', 'PARCE QUE': 'PARCe QUE',
    'AILLEURS': 'AILLEURs', 'CÔTE À CÔTE': 'CÔTe À CÔTe', "AUJOURD'HUI": "AUJOURD'hUI", 'AVANT-HIER': 'AVANT-hIER', 'HIER': 'hIER',
    'EN RETARD': 'EN RETARd', 'MAINTENANT': 'MAINTENANt', 'SOUVENT': 'SOUVENt', 'DAVANTAGE': 'DAVANTAGe', 'ENSEMBLE': 'ENSEMBLe',
    'BRUSQUEMENT': 'BRUSQUEMENt', 'FACILEMENT': 'FACILEMENt', 'SAGEMENT': 'SAGEMENt', 'NE... PAS': 'NE... PAs', "D’ACCORD": "D’ACCORd",
    'DERRIÈRE': 'DERRIÈRe', 'DEVANT': 'DEVANt', 'DURANT': 'DURANt', 'DÈS QUE': 'DÈs QUE', 'PENDANT QUE': 'PENDANt QUE', 'DEDANS': 'DEDANs',
    'AUSSITÔT': 'AUSSITÔt', 'BIENTÔT': 'BIENTÔt', 'QUELQUEFOIS': 'QUELQUEFOIs', 'TOUT À COUP': 'TOUt À COUp', 'AUTANT': 'AUTANt',
    'PRESQUE': 'PRESQUe', 'MIEUX': 'MIEUx', 'EXACTEMENT': 'EXACTEMENt', 'HEUREUSEMENT': 'hEUREUSEMENt', 'SEULEMENT': 'SEULEMENt',
    'NE… JAMAIS': 'NE… JAMAIs', 'HÉLAS': 'hÉLAS', 'POURTANT': 'POURTANt', 'DESSOUS': 'DESSOUs', 'PENDANT': 'PENDANt', 'LORSQUE': 'LORSQUe',
    'DEHORS': 'DEhORs', 'PARTOUT': 'PARTOUt', 'AUTREFOIS': 'AUTREFOIs', "D'ABORD": "D'ABORd", 'EN CE MOMENT': 'EN CE MOMENt',
    'EN AVANCE': 'EN AVANCe', 'LONGTEMPS': 'LONgTEMps', 'ASSEZ': 'ASSEz', 'BEAUCOUP': 'BEAUCOUp', 'DEBOUT': 'DEBOUt',
    'DOUCEMENT': 'DOUCEMENt', 'LENTEMENT': 'LENTEMENt', 'NE… GUÈRE': 'NE… GUÈRe', 'NE… PLUS': 'NE… PLUs',
    # Temps
    'DIMANCHE': 'DIMANCHe', 'MOIS': 'MOIs', 'SEPTEMBRE': 'SEPTEMBRe', 'DÉCEMBRE': 'DÉCEMBRe', 'JANVIER': 'JANVIEr', 'JUILLET': 'JUILLEt',
    'OCTOBRE': 'OCTOBRe', 'ANNÉE': 'ANNÉe', 'SEMAINE': 'SEMAINe', 'FÉVRIER': 'FÉVRIEr', 'AOÛT': None, 'NOVEMBRE': 'NOVEMBRe', 'SIÈCLE': 'SIÈCLe',
    # Numérique
    'TROIS': 'TROIs', 'DOUZE': 'DOUZe', 'QUINZE': 'QUINZe', 'DIX-HUIT': 'DIX-hUIT', 'TRENTE': 'TRENTe', 'SOIXANTE': 'SOIXANTe',
    'QUATRE-VINGT-DIX': 'QUATRe-VINgt-DIX', 'MILLIER': 'MILLIEr', 'QUATRE': 'QUATRe', 'SEPT': 'SEpT', 'TREIZE': 'TREIZe', 'SEIZE': 'SEIZe',
    'QUARANTE': 'QUARANTe', 'SOIXANTE-DIX': 'SOIXANTe-DIX', 'CENT': 'CENt', 'DIZAINE': 'DIZAINe', 'DEUX': 'DEUx', 'HUIT': 'hUIT',
    'ONZE': 'ONZe', 'QUATORZE': 'QUATORZe', 'DIX-SEPT': 'DIX-SEpT', 'VINGT': 'VINgt', 'CINQUANTE': 'CINQUANTe', 'QUATRE-VINGT': 'QUATRe-VINgt',
    'MILLE': 'MILLe', 'MILLIARD': 'MILLIARd', 'CENTAINE': 'CENTAINe',
    # Lettres (mots)
    'CHAT': 'CHAt', 'ÉLÉPHANT': 'ÉLÉPHANt', 'GIRAFE': 'GIRAFe', 'HIBOU': 'hIBOU', 'ÎLE': 'ÎLe', 'NUAGE': 'NUAGe', 'OLIVE': 'OLIVe',
    'POMME': 'POMMe', 'QUILLE': 'QUILLe', 'RENARD': 'RENARd', 'TIGRE': 'TIGRe', 'UNIVERS': 'UNIVERs', 'XYLOPHONE': 'XYLOPHONe',
    'YAOURT': None, 'ZÈBRE': 'ZÈBRe', 'ABEILLE': 'ABEILLe', 'CHOCOLAT': 'CHOCOLAt', 'DINOSAURE': 'DINOSAURe', 'ÉTOILE': 'ÉTOILe',
    'FORÊT': 'FORÊt', 'HABIT': 'hABIt', 'IMAGE': 'IMAGe', 'JOUET': 'JOUEt', 'LUNE': 'LUNe', 'NEIGE': 'NEIGe', 'ORANGE': 'ORANGe',
    'ROBOT': 'ROBOt', 'SERPENT': 'SERPENt', 'USINE': 'USINe', 'VOITURE': 'VOITURe',
}
SANS_COMPTE_DE_LETTRES = {'SŒUR'}  # Œ : une ou deux lettres selon les usages → pas de question « combien de lettres »

def infos(mot):
    m = MUETTES.get(mot, '')
    if m is None:
        muettes = None
    else:
        if m and m.upper() != mot.upper():
            raise SystemExit('Lettres muettes mal recopiées : ' + mot + ' / ' + m)
        muettes = [i for i, ch in enumerate(m) if ch.islower()] if m else []
    return {
        'syllabes': SYLLABES_CORRIGEES.get(mot, syl(mot).upper()),
        'muettes': muettes,
        'lettres': None if mot in SANS_COMPTE_DE_LETTRES else sum(1 for ch in mot if ch.isalpha()),
    }

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

INFOS = {}
for p_ in packs:
    for n_, mots_ in p_['niveaux'].items():
        for m_ in mots_:
            if not (p_['id'] == 'lettres' and n_ == '1'):
                INFOS[m_] = infos(m_)
inconnus = [k for k in MUETTES if k not in INFOS]
if inconnus:
    raise SystemExit('Mots de MUETTES absents des cartes : ' + ', '.join(inconnus))

js = """// Cartes JEU d'Aventura — GÉNÉRÉ par outils/cartes.py depuis « carte francais.xlsx » (feuilles « pack »).
// Ne pas modifier à la main : corriger le fichier Excel puis relancer le script.
(function (racine) {
  'use strict';
  var PACKS = %s;
  // Pour chaque mot : syllabes écrites, positions des lettres muettes (null = question non posée), nombre de lettres.
  var INFOS = %s;
  if (typeof module !== 'undefined' && module.exports) module.exports = { PACKS: PACKS, INFOS: INFOS };
  else racine.Cartes = { PACKS: PACKS, INFOS: INFOS };
})(this);
""" % (json.dumps(packs, ensure_ascii=False, indent=2), json.dumps(INFOS, ensure_ascii=False))
(RACINE / 'js' / 'cartes.js').write_text(js, encoding='utf-8')
for p in packs:
    print(p['id'], p['nom'], {k: len(v) for k, v in p['niveaux'].items()})
