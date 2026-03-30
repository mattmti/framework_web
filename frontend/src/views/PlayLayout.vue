<template>
  <!--
    Layout parent pour les routes de jeu (/play/daily, /play/random).
    Ce composant sert de "coquille vide" pour les sous-routes imbriquées.
    Vue Router injecte ici le composant enfant (GameView) via <RouterView />.
  -->
  <RouterView />
</template>
