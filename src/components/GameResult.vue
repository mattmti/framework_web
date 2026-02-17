<template>
  <div class="card p-6 text-center animate-pop border-2"
    :class="isWon ? 'border-pitch-500/50' : 'border-red-500/30'">

    <!-- Icône résultat -->
    <div class="text-6xl mb-4">{{ isWon ? '🏆' : '😔' }}</div>

    <!-- Titre -->
    <h2 class="font-display text-4xl mb-2" :class="isWon ? 'text-pitch-500' : 'text-red-400'">
      {{ isWon ? 'Bravo !' : 'Dommage...' }}
    </h2>

    <p v-if="isWon" class="text-white/70 mb-2">
      Tu as trouvé en <strong class="text-white">{{ attemptsUsed }} tentative{{ attemptsUsed > 1 ? 's' : '' }}</strong> !
    </p>
    <p v-else class="text-white/70 mb-2">
      Tu avais 10 tentatives. Le joueur était :
    </p>

    <!-- Points gagnés -->
    <div v-if="isWon && pointsEarned" class="inline-flex items-center gap-2 px-4 py-2 rounded-full
      bg-pitch-500/20 border border-pitch-500/30 mb-4">
      <span class="text-pitch-500 font-display text-2xl">+{{ pointsEarned }}</span>
      <span class="text-white/60 text-sm">points</span>
    </div>

    <!-- Joueur révélé -->
    <div v-if="targetPlayer" class="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
      <div class="flex items-center gap-4 justify-center">
        <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
          <img v-if="targetPlayer.photo_url" :src="targetPlayer.photo_url"
            :alt="targetPlayer.name" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full bg-white/10 flex items-center justify-center text-2xl">⚽</div>
        </div>
        <div class="text-left">
          <div class="font-bold text-white text-lg">{{ targetPlayer.name }}</div>
          <div class="text-white/50 text-sm">{{ targetPlayer.club }}</div>
          <div class="text-white/40 text-xs mt-1">{{ targetPlayer.nationality }} · {{ formatPosition(targetPlayer.position) }}</div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 justify-center mt-6">
      <RouterLink to="/" class="btn-secondary">
        ← Accueil
      </RouterLink>
      <button v-if="gameType === 'random'" @click="$emit('play-again')" class="btn-primary">
        Rejouer ⚽
      </button>
      <button v-else class="btn-primary opacity-50 cursor-not-allowed" disabled>
        Reviens demain ! 🌅
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isWon: { type: Boolean, required: true },
  attemptsUsed: { type: Number, required: true },
  pointsEarned: { type: Number, default: 0 },
  targetPlayer: { type: Object, default: null },
  gameType: { type: String, required: true },
})
defineEmits(['play-again'])

const formatPosition = (pos) => {
  const map = { Goalkeeper: 'Gardien', Defender: 'Défenseur', Midfielder: 'Milieu', Attacker: 'Attaquant' }
  return map[pos] || pos || '?'
}
</script>
