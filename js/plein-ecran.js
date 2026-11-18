// Bouton « Plein écran » sur le plateau (v10.18, demande du 18/11/2026).
// Utilise l'API Fullscreen du navigateur (ordinateur, tablette, Android). Safari sur iPhone ne l'offre pas pour une page :
// le bouton reste alors caché (document.fullscreenEnabled faux) ; la page sans bandeau, elle, est la même partout.
(function () {
  'use strict';

  var bouton = document.getElementById('btn-plein-ecran');
  if (!bouton) return;
  var racine = document.documentElement;
  var demander = racine.requestFullscreen || racine.webkitRequestFullscreen;
  var sortir = document.exitFullscreen || document.webkitExitFullscreen;
  if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) return; // pas de plein écran possible ici : le bouton reste caché
  if (!demander || !sortir) return;

  function actif() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  // Met le bouton à jour : icône, nom pour les lecteurs d'écran, état.
  function majBouton() {
    var oui = actif();
    bouton.setAttribute('aria-pressed', String(oui));
    document.getElementById('plein-texte').textContent = oui ? 'Quitter le plein écran' : 'Plein écran';
    document.getElementById('plein-icone').textContent = oui ? '⤢' : '⛶';
  }
  bouton.hidden = false;
  bouton.addEventListener('click', function () {
    try {
      var p = actif() ? sortir.call(document) : demander.call(racine);
      if (p && p.catch) p.catch(function () { /* refusé par le navigateur : rien ne change */ });
    } catch (e) { /* idem */ }
  });
  document.addEventListener('fullscreenchange', majBouton);
  document.addEventListener('webkitfullscreenchange', majBouton);
  majBouton();
})();
