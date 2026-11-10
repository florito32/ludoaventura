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
    'pack temps': 'Jours et mois',  # « Temps » jusqu'à la v6.38 (choix de l'utilisateur, 10/11/2026)
    'pack numerique': 'Nombres',     # « Numérique » jusqu'à la v6.38
    'pack lettres': 'Lettres',
    # 15 packs ajoutés le 04/11/2026 (idées acceptées par l'utilisateur)
    'pack animaux': 'Animaux', 'pack lieux': 'Lieux et constructions', 'pack pays': 'Pays', 'pack villes': 'Villes',
    'pack nature': 'Paysages et nature', 'pack meteo': 'Météo et saisons', 'pack corps': 'Le corps', 'pack aliments': 'Aliments',
    'pack maison': 'Dans la maison', 'pack vetements': 'Vêtements', 'pack ecole': 'L’école', 'pack metiers': 'Métiers',
    'pack transports': 'Transports', 'pack couleurs': 'Couleurs et formes', 'pack loisirs': 'Sports et musique',
}

# Thèmes proposés aux joueurs, rangés en familles (choix de l'utilisateur du 10/11/2026, proposition A).
# Les feuilles absentes de ces familles ne sont plus proposées : « Lettres » (03/11/2026),
# « Mots simples » et « Mots compliqués » (10/11/2026) ; leurs mots restent dans le fichier.
FAMILLES = [
    {'id': 'nature', 'nom': 'Nature et animaux', 'icone': '🌿', 'themes': ['animaux', 'nature', 'meteo']},
    {'id': 'quotidien', 'nom': 'Tous les jours', 'icone': '🏠', 'themes': ['corps', 'aliments', 'maison', 'vetements', 'couleurs']},
    {'id': 'ville', 'nom': 'En ville', 'icone': '🏙️', 'themes': ['lieux', 'ecole', 'metiers', 'transports', 'loisirs']},
    {'id': 'monde', 'nom': 'Le monde, le temps, les nombres', 'icone': '🌍', 'themes': ['pays', 'villes', 'temps', 'numerique']},
]

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
    # Packs du 04/11/2026 : voyelles qui se prononcent séparément (comme LI-ON)
    'AÉROPORT': 'A-É-RO-PORT', 'OCÉAN': 'O-CÉ-AN', 'IMPERMÉABLE': 'IM-PER-MÉ-A-BLE', 'RÉCRÉATION': 'RÉ-CRÉ-A-TION',
    'ACCORDÉON': 'AC-COR-DÉ-ON', 'PIANO': 'PI-A-NO', 'VIOLET': 'VI-O-LET', 'VIOLON': 'VI-O-LON', 'TRIANGLE': 'TRI-AN-GLE',
    'LYON': 'LY-ON', 'BIBLIOTHÈQUE': 'BI-BLI-O-THÈ-QUE', 'CRAYON': 'CRA-YON',
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
    # ----- Packs du 04/11/2026 (mêmes règles : consonne finale non prononcée, e muet final, h hors ch/ph/th) -----
    # Animaux
    'LOUP': 'LOUp', 'VACHE': 'VACHe', 'POULE': 'POULe', 'CANARD': 'CANARd', 'TORTUE': 'TORTUe', 'SINGE': 'SINGe',
    'CHÈVRE': 'CHÈVRe', 'BALEINE': 'BALEINe', 'CROCODILE': 'CROCODILe', 'HIPPOPOTAME': 'HIPPOPOTAMe', 'HÉRISSON': 'hÉRISSON',
    'PANTHÈRE': 'PANTHÈRe', 'GUÊPE': 'GUÊPe',
    # Lieux et constructions
    'PONT': 'PONt', 'GARE': 'GARe', 'PORT': 'PORt', 'RUE': 'RUe', 'ÉCOLE': 'ÉCOLe', 'CABANE': 'CABANe', 'GRENIER': 'GRENIEr',
    'VILLAGE': 'VILLAGe', 'FERME': 'FERMe', 'HÔPITAL': 'hÔPITAL', 'BIBLIOTHÈQUE': 'BIBLIOTHÈQUe', 'IMMEUBLE': 'IMMEUBLe',
    'ÉGLISE': 'ÉGLISe', 'MUSÉE': 'MUSÉe', 'BOULANGERIE': 'BOULANGERIe', 'PHARE': 'PHARe', 'AÉROPORT': 'AÉROPORt',
    # Pays
    'FRANCE': 'FRANCe', 'ITALIE': 'ITALIe', 'CHINE': 'CHINe', 'INDE': 'INDe', 'ESPAGNE': 'ESPAGNe', 'BELGIQUE': 'BELGIQUe',
    'SUISSE': 'SUISSe', 'ÉGYPTE': 'ÉGYPTe', 'GRÈCE': 'GRÈCe', 'ALLEMAGNE': 'ALLEMAGNe', 'ANGLETERRE': 'ANGLETERRe',
    'AUSTRALIE': 'AUSTRALIe', 'MEXIQUE': 'MEXIQUe', 'ARGENTINE': 'ARGENTINe', 'NORVÈGE': 'NORVÈGe',
    # Villes
    'PARIS': 'PARIs', 'NICE': 'NICe', 'LILLE': 'LILLe', 'NANTES': 'NANTes', 'ROME': 'ROMe', 'MARSEILLE': 'MARSEILLe',
    'BORDEAUX': 'BORDEAUx', 'TOULOUSE': 'TOULOUSe', 'RENNES': 'RENNes', 'LONDRES': 'LONDRes', 'STRASBOURG': 'STRASBOURg',
    'MONTPELLIER': 'MONtPELLIEr', 'GRENOBLE': 'GRENOBLe', 'BRUXELLES': 'BRUXELLes', 'GENÈVE': 'GENÈVe', 'LISBONNE': 'LISBONNe',
    # Paysages et nature
    'BOIS': 'BOIs', 'ARBRE': 'ARBRe', 'SABLE': 'SABLe', 'PLAGE': 'PLAGe', 'RIVIÈRE': 'RIVIÈRe', 'COLLINE': 'COLLINe',
    'DÉSERT': 'DÉSERt', 'GROTTE': 'GROTTe', 'MONTAGNE': 'MONTAGNe', 'CASCADE': 'CASCADe', 'FALAISE': 'FALAISe',
    'MARÉCAGE': 'MARÉCAGe', 'PRAIRIE': 'PRAIRIe', 'GLACIER': 'GLACIEr', 'ROCHER': 'ROCHEr', 'VALLÉE': 'VALLÉe',
    # Météo et saisons
    'PLUIE': 'PLUIe', 'VENT': 'VENt', 'FROID': 'FROId', 'CHAUD': 'CHAUd', 'ORAGE': 'ORAGe', 'AUTOMNE': 'AUTOmNe',
    'BROUILLARD': 'BROUILLARd', 'TEMPÊTE': 'TEMPÊTe', 'PRINTEMPS': 'PRINTEMps', 'TONNERRE': 'TONNERRe', 'GRÊLE': 'GRÊLe',
    'VERGLAS': 'VERGLAs', 'TEMPÉRATURE': 'TEMPÉRATURe', 'AVERSE': 'AVERSe', 'ROSÉE': 'ROSÉe',
    # Le corps
    'TÊTE': 'TÊTe', 'PIED': 'PIEd', 'BRAS': 'BRAs', 'NEZ': 'NEz', 'DOS': 'DOs', 'DENT': 'DENt', 'JAMBE': 'JAMBe',
    'OREILLE': 'OREILLe', 'ÉPAULE': 'ÉPAULe', 'CHEVEUX': 'CHEVEUx', 'VENTRE': 'VENTRe', 'BOUCHE': 'BOUCHe', 'DOIGT': 'DOIgt',
    'ESTOMAC': 'ESTOMAc', 'POIGNET': 'POIGNEt', 'CHEVILLE': 'CHEVILLe', 'PAUPIÈRE': 'PAUPIÈRe', 'MOLLET': 'MOLLEt',
    'SQUELETTE': 'SQUELETTe', 'COUDE': 'COUDe',
    # Aliments
    'LAIT': 'LAIt', 'RIZ': 'RIz', 'POIRE': 'POIRe', 'SOUPE': 'SOUPe', 'JUS': 'JUs', 'FROMAGE': 'FROMAGe', 'CAROTTE': 'CAROTTe',
    'CERISE': 'CERISe', 'BANANE': 'BANANe', 'TOMATE': 'TOMATe', 'BEURRE': 'BEURRe', 'SALADE': 'SALADe', 'POULET': 'POULEt',
    'CONCOMBRE': 'CONCOMBRe', 'AUBERGINE': 'AUBERGINe', 'FRAMBOISE': 'FRAMBOISe', 'ÉPINARD': 'ÉPINARd',
    'CITROUILLE': 'CITROUILLe', 'HARICOT': 'hARICOt', 'ANANAS': None,
    # Dans la maison
    'LIT': 'LIt', 'TABLE': 'TABLe', 'LAMPE': 'LAMPe', 'PORTE': 'PORTe', 'TAPIS': 'TAPIs', 'VERRE': 'VERRe', 'CHAISE': 'CHAISe',
    'FENÊTRE': 'FENÊTRe', 'ARMOIRE': 'ARMOIRe', 'ESCALIER': 'ESCALIEr', 'CUISINE': 'CUISINe', 'PLACARD': 'PLACARd',
    'BAIGNOIRE': 'BAIGNOIRe', 'CHEMINÉE': 'CHEMINÉe', 'ÉTAGÈRE': 'ÉTAGÈRe', 'CASSEROLE': 'CASSEROLe', 'OREILLER': 'OREILLEr',
    # Vêtements
    'ROBE': 'ROBe', 'JUPE': 'JUPe', 'GANT': 'GANt', 'BOTTE': 'BOTTe', 'BONNET': 'BONNEt', 'VESTE': 'VESTe', 'CAPE': 'CAPe',
    'CHAUSSETTE': 'CHAUSSETTe', 'ÉCHARPE': 'ÉCHARPe', 'CHEMISE': 'CHEMISe', 'CEINTURE': 'CEINTURe', 'IMPERMÉABLE': 'IMPERMÉABLe',
    'SANDALE': 'SANDALe', 'CASQUETTE': 'CASQUETTe', 'SALOPETTE': 'SALOPETTe', 'MAILLOT': 'MAILLOt', 'PANTOUFLE': 'PANTOUFLe',
    'CHAUSSURE': 'CHAUSSURe',
    # L'école
    'LIVRE': 'LIVRe', 'COLLE': 'COLLe', 'GOMME': 'GOMMe', 'CRAIE': 'CRAIe', 'CLASSE': 'CLASSe', 'CAHIER': 'CAhIEr', 'RÈGLE': 'RÈGLe',
    'TROUSSE': 'TROUSSe', 'CARTABLE': 'CARTABLe', 'CISEAUX': 'CISEAUx', 'MAÎTRE': 'MAÎTRe', 'MAÎTRESSE': 'MAÎTRESSe',
    'DICTIONNAIRE': 'DICTIONNAIRe', 'COMPAS': 'COMPAs', 'FEUTRE': 'FEUTRe', 'ÉQUERRE': 'ÉQUERRe',
    # Métiers
    'JUGE': 'JUGe', 'PILOTE': 'PILOTe', 'FERMIER': 'FERMIEr', 'POMPIER': 'POMPIEr', 'PEINTRE': 'PEINTRe', 'BOULANGER': 'BOULANGEr',
    'JARDINIER': 'JARDINIEr', 'INFIRMIER': 'INFIRMIEr', 'CUISINIER': 'CUISINIEr', 'BOUCHER': 'BOUCHEr', 'DENTISTE': 'DENTISTe',
    'VÉTÉRINAIRE': 'VÉTÉRINAIRe', 'ARCHITECTE': 'ARCHITECTe', 'POLICIER': 'POLICIEr', 'ASTRONAUTE': 'ASTRONAUTe', 'MENUISIER': 'MENUISIEr',
    # Transports
    'LUGE': 'LUGe', 'FUSÉE': 'FUSÉe', 'BARQUE': 'BARQUe', 'HÉLICOPTÈRE': 'hÉLICOPTÈRe', 'AMBULANCE': 'AMBULANCe',
    'MONTGOLFIÈRE': 'MONtGOLFIÈRe', 'TROTTINETTE': 'TROTTINETTe', 'SOUS-MARIN': 'SOUs-MARIN', 'PAQUEBOT': 'PAQUEBOt',
    'TÉLÉPHÉRIQUE': 'TÉLÉPHÉRIQUe',
    # Couleurs et formes
    'ROUGE': 'ROUGe', 'VERT': 'VERt', 'GRIS': 'GRIs', 'ROSE': 'ROSe', 'ROND': 'RONd', 'BLANC': 'BLANc', 'JAUNE': 'JAUNe',
    'VIOLET': 'VIOLEt', 'CERCLE': 'CERCLe', 'LIGNE': 'LIGNe', 'POINT': 'POINt', 'TRIANGLE': 'TRIANGLe', 'RECTANGLE': 'RECTANGLe',
    'LOSANGE': 'LOSANGe', 'TURQUOISE': 'TURQUOISe', 'BEIGE': 'BEIGe', 'OVALE': 'OVALe', 'CYLINDRE': 'CYLINDRe',
    # Sports et musique
    'DANSE': 'DANSe', 'BALLE': 'BALLe', 'FLÛTE': 'FLÛTe', 'CHANT': 'CHANt', 'COURSE': 'COURSe', 'GUITARE': 'GUITARe',
    'TROMPETTE': 'TROMPETTe', 'ESCRIME': 'ESCRIMe', 'GYMNASTIQUE': 'GYMNASTIQUe', 'ESCALADE': 'ESCALADe', 'BATTERIE': 'BATTERIe',
    'HARPE': 'hARPe',
}
SANS_COMPTE_DE_LETTRES = {'SŒUR'}  # Œ : une ou deux lettres selon les usages → pas de question « combien de lettres »

# ---------- Genre et pluriel des noms (v6.18 : questions « Le ou la ? » et « Au pluriel ») ----------
# Seuls les noms ont un genre ; les mots outils, nombres, adjectifs de couleur et noms de villes n'en ont pas ici.
# m = masculin, f = féminin. Les métiers qui s'écrivent pareil au masculin et au féminin (juge, pilote,
# dentiste…) n'ont pas de question « Le ou la ? » : les deux réponses seraient justes.
_M = """TONTON PAPA COUSIN FRÈRE
LUNDI MARDI MERCREDI JEUDI VENDREDI SAMEDI DIMANCHE JOUR MOIS SIÈCLE JANVIER FÉVRIER MARS AVRIL MAI JUIN JUILLET AOÛT SEPTEMBRE OCTOBRE NOVEMBRE DÉCEMBRE
MILLIER MILLION MILLIARD
CHIEN LAPIN OURS LOUP COQ CANARD CHEVAL MOUTON SINGE OISEAU COCHON CROCODILE ÉCUREUIL HIPPOPOTAME KANGOUROU PINGOUIN HÉRISSON
PONT MUR PORT PARC CHÂTEAU GRENIER MAGASIN VILLAGE CHEMIN HÔPITAL IMMEUBLE MUSÉE PHARE AÉROPORT
JAPON MAROC PÉROU CHILI CANADA BRÉSIL KENYA PORTUGAL MEXIQUE SÉNÉGAL
LAC BOIS CIEL ARBRE PRÉ SABLE DÉSERT VOLCAN OCÉAN MARÉCAGE GLACIER ROCHER
VENT ÉTÉ GEL SOLEIL NUAGE ORAGE HIVER AUTOMNE BROUILLARD ÉCLAIR PRINTEMPS ARC-EN-CIEL TONNERRE VERGLAS
PIED BRAS NEZ DOS COU GENOU CHEVEUX VENTRE DOIGT ESTOMAC POIGNET MOLLET POUMON SQUELETTE COUDE
PAIN LAIT RIZ MIEL JUS SEL FROMAGE BEURRE POULET CHAMPIGNON CONCOMBRE ÉPINARD HARICOT ANANAS
LIT TAPIS BOL VERRE FOUR ESCALIER PLACARD COUSSIN MIROIR RÉFRIGÉRATEUR OREILLER TIROIR ASPIRATEUR
PULL GANT BONNET CHAPEAU MANTEAU PANTALON PYJAMA BLOUSON IMPERMÉABLE MAILLOT
LIVRE STYLO SAC AMI CAHIER CRAYON CARTABLE TABLEAU CISEAUX MAÎTRE DICTIONNAIRE COMPAS PINCEAU FEUTRE BUREAU
MAÇON FERMIER POMPIER FACTEUR BOULANGER COIFFEUR JARDINIER INFIRMIER CUISINIER BOUCHER PHARMACIEN POLICIER CHIRURGIEN MENUISIER ÉLECTRICIEN
BUS TRAIN VÉLO TAXI TRAM MÉTRO AVION BATEAU CAMION TRACTEUR HÉLICOPTÈRE SOUS-MARIN PAQUEBOT TÉLÉPHÉRIQUE AUTOBUS
CARRÉ CERCLE POINT TRIANGLE RECTANGLE LOSANGE CYLINDRE
JUDO SKI PIANO CHANT TENNIS FOOTBALL TAMBOUR VIOLON BASKET ACCORDÉON XYLOPHONE"""
_F = """MAMAN SŒUR COUSINE TANTE
SEMAINE ANNÉE UNITÉ DIZAINE CENTAINE
VACHE POULE TORTUE CHÈVRE BALEINE PANTHÈRE GUÊPE
MAISON TOUR GARE RUE ÉCOLE CABANE FERME BIBLIOTHÈQUE ÉGLISE BOULANGERIE
FRANCE ITALIE CHINE INDE ESPAGNE BELGIQUE SUISSE ÉGYPTE GRÈCE ALLEMAGNE ANGLETERRE AUSTRALIE ARGENTINE NORVÈGE
MER FLEUR FORÊT PLAGE RIVIÈRE COLLINE GROTTE MONTAGNE CASCADE FALAISE PRAIRIE VALLÉE
PLUIE NEIGE TEMPÊTE CHALEUR GRÊLE TEMPÉRATURE AVERSE ROSÉE
TÊTE MAIN DENT JAMBE OREILLE ÉPAULE BOUCHE CHEVILLE PAUPIÈRE
POIRE SOUPE CAROTTE CERISE BANANE TOMATE SALADE AUBERGINE FRAMBOISE CITROUILLE
TABLE LAMPE PORTE CHAISE FENÊTRE ARMOIRE CUISINE BAIGNOIRE CHEMINÉE ÉTAGÈRE CASSEROLE
ROBE JUPE BOTTE VESTE CAPE CHAUSSETTE ÉCHARPE CHEMISE CEINTURE SANDALE CASQUETTE SALOPETTE PANTOUFLE CHAUSSURE
COLLE GOMME CRAIE CLASSE RÈGLE TROUSSE RÉCRÉATION MAÎTRESSE ÉQUERRE
LUGE AUTO MOTO VOITURE FUSÉE BARQUE AMBULANCE MONTGOLFIÈRE TROTTINETTE
LIGNE
DANSE BALLE FLÛTE COURSE NATATION GUITARE TROMPETTE ESCRIME GYMNASTIQUE ÉQUITATION ESCALADE BATTERIE HARPE"""
GENRES = {}
for g, liste in (('m', _M), ('f', _F)):
    for m in liste.split():
        if m in GENRES:
            raise SystemExit('Genre en double : ' + m)
        GENRES[m] = g
# h aspiré : on dit « le hérisson », pas « l'hérisson » → la question reste « Le ou la ? ».
H_ASPIRE = {'HÉRISSON', 'HARICOT', 'HARPE'}

# Pluriel : par défaut le mot + S. Exceptions ci-dessous ; None = pas de question « Au pluriel »
# (noms qu'on ne compte pas, déjà au pluriel, pays, ou pluriel discuté).
PLURIELS = {
    'CHEVAL': 'CHEVAUX', 'OISEAU': 'OISEAUX', 'CHÂTEAU': 'CHÂTEAUX', 'HÔPITAL': 'HÔPITAUX', 'GENOU': 'GENOUX',
    'CHAPEAU': 'CHAPEAUX', 'MANTEAU': 'MANTEAUX', 'TABLEAU': 'TABLEAUX', 'BATEAU': 'BATEAUX', 'BUREAU': 'BUREAUX',
    'PINCEAU': 'PINCEAUX', 'AOÛT': None,
    # mots qui finissent déjà par s, x ou z : pluriel identique
    'OURS': 'OURS', 'BOIS': 'BOIS', 'BRAS': 'BRAS', 'NEZ': 'NEZ', 'DOS': 'DOS', 'TAPIS': 'TAPIS', 'COMPAS': 'COMPAS',
    'BUS': 'BUS', 'AUTOBUS': 'AUTOBUS', 'JUS': 'JUS', 'MOIS': 'MOIS', 'PRINTEMPS': 'PRINTEMPS', 'ANANAS': 'ANANAS',
    'MARS': None,
    'SOUS-MARIN': 'SOUS-MARINS',
    # pas de pluriel demandé
    'CHEVEUX': None, 'CISEAUX': None, 'CIEL': None, 'ARC-EN-CIEL': None, 'LAIT': None, 'MIEL': None, 'SEL': None,
    'BEURRE': None, 'RIZ': None, 'SABLE': None, 'GEL': None, 'VERGLAS': None, 'CHALEUR': None, 'TONNERRE': None,
    'GRÊLE': None, 'ROSÉE': None, 'SOLEIL': None, 'NEIGE': None, 'BROUILLARD': None, 'ÉPINARD': None,
    'JUDO': None, 'SKI': None, 'CHANT': None, 'TENNIS': None, 'FOOTBALL': None, 'BASKET': None, 'NATATION': None,
    'ESCRIME': None, 'GYMNASTIQUE': None, 'ÉQUITATION': None, 'ESCALADE': None, 'DANSE': None,
    # mois de l'année : pas de pluriel demandé
    'JANVIER': None, 'FÉVRIER': None, 'AVRIL': None, 'MAI': None, 'JUIN': None, 'JUILLET': None, 'SEPTEMBRE': None,
    'OCTOBRE': None, 'NOVEMBRE': None, 'DÉCEMBRE': None,
}
PAYS = {'FRANCE', 'ITALIE', 'CHINE', 'INDE', 'ESPAGNE', 'BELGIQUE', 'SUISSE', 'ÉGYPTE', 'GRÈCE', 'ALLEMAGNE', 'ANGLETERRE',
        'AUSTRALIE', 'ARGENTINE', 'NORVÈGE', 'JAPON', 'MAROC', 'PÉROU', 'CHILI', 'CANADA', 'BRÉSIL', 'KENYA', 'PORTUGAL',
        'MEXIQUE', 'SÉNÉGAL'}

def genre_pluriel(mot):
    """(genre, pluriel) d'un mot ; None si la question n'est pas posée."""
    g = GENRES.get(mot)
    if not g:
        return None, None
    if mot in PAYS:
        return g, None
    p = PLURIELS.get(mot, mot + 'S')
    return g, p

VOYELLES_DEBUT = set('AEIOUYÀÂÉÈÊËÎÏÔÙÛ')
def devant_voyelle(mot):
    """Vrai si on dit « l' » devant le mot (voyelle ou h muet) : la question devient « Un ou une ? »."""
    return mot[0] in VOYELLES_DEBUT or (mot[0] == 'H' and mot not in H_ASPIRE)

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
        # v6.18 : genre (m/f, None = pas un nom), pluriel (None = question non posée), « l' » devant le mot
        'genre': genre_pluriel(mot)[0],
        'pluriel': genre_pluriel(mot)[1],
        'elision': devant_voyelle(mot) if genre_pluriel(mot)[0] else None,
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
inconnus = [t for f in FAMILLES for t in f['themes'] if t not in [p['id'] for p in packs]]
if inconnus:
    raise SystemExit('Thèmes de FAMILLES absents des feuilles : ' + ', '.join(inconnus))
inconnus = [k for k in GENRES if k not in INFOS]
if inconnus:
    raise SystemExit('Mots de GENRES absents des cartes : ' + ', '.join(inconnus))
inconnus = [k for k in MUETTES if k not in INFOS]
if inconnus:
    raise SystemExit('Mots de MUETTES absents des cartes : ' + ', '.join(inconnus))

js = """// Cartes JEU d'Aventura — GÉNÉRÉ par outils/cartes.py depuis « carte francais.xlsx » (feuilles « pack »).
// Ne pas modifier à la main : corriger le fichier Excel puis relancer le script.
(function (racine) {
  'use strict';
  var PACKS = %s;
  // Pour chaque mot : syllabes écrites, positions des lettres muettes (null = question non posée), nombre de lettres,
  // genre (m / f, null = pas un nom), pluriel (null = question non posée), elision (on dit « l' » devant le mot).
  var INFOS = %s;
  // Thèmes proposés aux joueurs, rangés en familles (v6.39) ; les autres packs ne sont plus proposés.
  var FAMILLES = %s;
  if (typeof module !== 'undefined' && module.exports) module.exports = { PACKS: PACKS, INFOS: INFOS, FAMILLES: FAMILLES };
  else racine.Cartes = { PACKS: PACKS, INFOS: INFOS, FAMILLES: FAMILLES };
})(this);
""" % (json.dumps(packs, ensure_ascii=False, indent=2), json.dumps(INFOS, ensure_ascii=False), json.dumps(FAMILLES, ensure_ascii=False, indent=2))
(RACINE / 'js' / 'cartes.js').write_text(js, encoding='utf-8')
for p in packs:
    print(p['id'], p['nom'], {k: len(v) for k, v in p['niveaux'].items()})
