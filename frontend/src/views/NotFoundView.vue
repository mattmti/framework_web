<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <div class="font-display text-8xl text-pitch-500/30 mb-4">404</div>
    <h1 class="font-display text-4xl text-white tracking-wide mb-3">Page introuvable</h1>
    <p class="text-white/40 mb-8 max-w-sm">
      On dirait que tu as tiré à côté du but. Cette page n'existe pas.
    </p>
    <RouterLink to="/" class="btn-primary">
      ⚽ Retour à l'accueil
    </RouterLink>
  </div>
</template>
