#!/usr/bin/env python3
"""Captures d'écran des mini-jeux (img/minijeux/<id>.webp), montrées dans la fenêtre « i » de js/minijeux.js.

À relancer quand un mini-jeu est ajouté ou change d'aspect :
    python3 -m http.server 4173 --bind 127.0.0.1 &      # depuis la racine du dépôt
    python3 outils/captures_minijeux.py [id …]           # sans id : tous les mini-jeux
Chaque capture est prise au milieu d'une partie, sur un format de téléphone (390 × 640), puis réduite en WebP.
Pour un nouveau mini-jeu : ajouter une entrée dans ETAPES (gestes à faire pour arriver « au milieu du jeu »).
"""
import io, sys
from PIL import Image
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:4173/'
SORTIE = 'img/minijeux/'
LARGEUR = 390  # largeur finale de la capture (px)

def qui_joue(page):
    f = page.get_by_role('dialog', name='Qui joue ?')
    f.wait_for()
    while f.locator('.cj-ligne.vide [data-ouvrir]').count():
        f.locator('.cj-ligne.vide [data-ouvrir]').first.click()
        f.locator('.cj-profil[data-choisir]:not([disabled])').first.click()
    f.get_by_role('button', name='C’est parti').click()

# Gestes pour arriver au milieu du jeu (après « Qui joue ? »).
def fabrique(page):
    page.locator('.baby-touche').nth(0).click()
    page.locator('.baby-touche').nth(3).click()

def sons(page):
    page.wait_for_timeout(600)

def etoiles(page):
    page.locator('.mj-etoiles [data-table="3"]').click()
    page.locator('[data-demarrer]').click()
    page.wait_for_timeout(600)

def aventure(page):
    page.locator('.mj-aventure [data-table="3"]').click()  # une table de multiplication
    page.locator('[data-jouer]').click()
    page.wait_for_timeout(1500)

def quiz(page):
    page.locator('#quiz-lancer').click()
    page.wait_for_timeout(600)

def reperes(page):
    page.locator('.rep-touche[data-l="b"]').click()
    page.locator('[data-jouer]').click()
    page.wait_for_timeout(4200)  # décompte 3-2-1, puis la grille

ETAPES = {'fabrique': fabrique, 'sons': sons, 'etoiles': etoiles, 'aventure': aventure, 'quiz': quiz, 'reperes': reperes}

def main(ids):
    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        for jeu in ids:
            ctx = nav.new_context(viewport={'width': 390, 'height': 640}, device_scale_factor=2, is_mobile=True, has_touch=True, reduced_motion='reduce')
            page = ctx.new_page()
            page.add_init_script("window.AVENTURA_PAUSE=80;window.AVENTURA_DUREE_DE=0;window.AVENTURA_AUTO_DE=600000;window.AVENTURA_SANS_BANDE=true;try{localStorage.setItem('ludo-vu','1')}catch(e){}")
            page.goto(URL)
            page.evaluate("""() => { const J = window.Joueurs, c = window.Recompenses.compte, A = window.Aventuriers.LISTE;
              const l = J.duCompte(); if (l.length === 1 && l[0].nom === 'Joueur 1') J.renommer(c.etat, l[0].id, A[0].nom);
              localStorage.setItem(window.Etoiles.CLE, JSON.stringify(c.etat)); }""")
            page.locator('#btn-minijeux').click()
            page.locator('.minijeu-carte[data-jeu="%s"]' % jeu).click()
            qui_joue(page)
            ETAPES[jeu](page)
            png = page.screenshot()  # le haut de l'écran (390 × 640), sans défiler
            im = Image.open(io.BytesIO(png)).convert('RGB')
            im = im.resize((LARGEUR, round(im.height * LARGEUR / im.width)), Image.LANCZOS)
            im.save(SORTIE + jeu + '.webp', 'WEBP', quality=80, method=6)
            print(jeu, im.size)
            ctx.close()
        nav.close()

if __name__ == '__main__':
    main(sys.argv[1:] or list(ETAPES))
