// Génère les écrans de lancement plein écran de l'iPhone (balises apple-touch-startup-image).
// Chaque image est une capture de l'accueil à la taille exacte de l'écran de l'appareil,
// pour que l'ouverture de l'application enchaîne sans saut sur la vraie page d'accueil.
// Sur Android, l'écran de lancement est fabriqué par le téléphone (icône + background_color
// du manifeste) : il ne peut pas être une image plein écran.
//
// Usage (depuis la racine du dépôt, serveur local lancé : python3 -m http.server 4173) :
//   node outils/ecrans-lancement.js
// Puis copier les balises affichées dans le <head> de index.html, et recompresser les PNG
// (sharp : png({ compressionLevel: 9, adaptiveFiltering: true }), sans palette pour éviter les aplats).
const { chromium } = require('playwright');
const path = require('path');

// Tailles d'écran des iPhone en pixels CSS × densité (portrait).
const APPAREILS = [
  { w: 440, h: 956, dpr: 3 }, // iPhone 16 Pro Max, 17 Pro Max
  { w: 402, h: 874, dpr: 3 }, // iPhone 16 Pro, 17, 17 Pro
  { w: 430, h: 932, dpr: 3 }, // iPhone 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  { w: 393, h: 852, dpr: 3 }, // iPhone 14 Pro, 15, 15 Pro, 16
  { w: 428, h: 926, dpr: 3 }, // iPhone 12 / 13 Pro Max, 14 Plus
  { w: 390, h: 844, dpr: 3 }, // iPhone 12, 13, 14, 16e
  { w: 375, h: 812, dpr: 3 }, // iPhone X, XS, 11 Pro, 12 mini, 13 mini
  { w: 414, h: 896, dpr: 3 }, // iPhone XS Max, 11 Pro Max
  { w: 414, h: 896, dpr: 2 }, // iPhone XR, 11
  { w: 414, h: 736, dpr: 3 }, // iPhone 6s Plus, 7 Plus, 8 Plus
  { w: 375, h: 667, dpr: 2 }, // iPhone 6s, 7, 8, SE (2e et 3e gén.)
  { w: 320, h: 568, dpr: 2 }, // iPhone SE (1re gén.)
];

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173/';

(async () => {
  const navigateur = await chromium.launch();
  const balises = [];
  for (const a of APPAREILS) {
    const pw = a.w * a.dpr, ph = a.h * a.dpr;
    const nom = `icons/lancement/lancement-${pw}x${ph}.png`;
    const page = await navigateur.newPage({ viewport: { width: a.w, height: a.h }, deviceScaleFactor: a.dpr, isMobile: true, hasTouch: true });
    // Ludo s'est déjà présenté : pas de bulle d'accueil sur la capture.
    await page.addInitScript(() => { try { localStorage.setItem('ludo-vu', '1'); } catch (e) { /* stockage bloqué */ } });
    await page.goto(BASE);
    // Le numéro de version change à chaque mise en ligne : on ne le fige pas dans l'image.
    await page.addStyleTag({ content: '[data-version]{visibility:hidden}' });
    await page.evaluate(() => Promise.all([...document.querySelectorAll('.accueil img')].map((i) => i.decode().catch(() => {}))));
    await page.waitForTimeout(800); // fin des fondus d'apparition
    await page.screenshot({ path: path.join(__dirname, '..', nom) });
    await page.close();
    balises.push(`  <link rel="apple-touch-startup-image" href="${nom}" media="(device-width: ${a.w}px) and (device-height: ${a.h}px) and (-webkit-device-pixel-ratio: ${a.dpr}) and (orientation: portrait)">`);
  }
  await navigateur.close();
  console.log(balises.join('\n'));
})();
