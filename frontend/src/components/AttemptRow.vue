<template>
  <div class="card p-4 animate-slide-in" :style="{ animationDelay: `${delay}ms` }">
    <!-- Nom du joueur deviné -->
    <div class="flex items-center gap-3 mb-3">
      <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
        <img v-if="attempt.player.photo_url" :src="attempt.player.photo_url"
          :alt="attempt.player.name" class="w-full h-full object-cover" loading="lazy" />
        <div v-else class="w-full h-full flex items-center justify-center text-sm text-white/30">?</div>
      </div>
      <div>
        <div class="font-semibold text-white text-sm">{{ attempt.player.name }}</div>
        <div class="text-xs text-white/40">Tentative {{ attemptNumber }}</div>
      </div>
    </div>

    <!-- Grille de comparaison -->
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">

      <!-- Âge -->
      <div class="flex flex-col">
        <div class="text-xs text-white/40 text-center mb-1 font-mono">Âge</div>
        <div :class="attempt.comparison.age ? 'cell-correct' : 'cell-wrong'" class="result-cell">
          <span class="font-mono font-bold">{{ attempt.player.age ?? '?' }}</span>
          <span v-if="!attempt.comparison.age && attempt.comparison.age_direction"
            class="text-lg leading-none">
            {{ attempt.comparison.age_direction === 'up' ? '↑' : '↓' }}
          </span>
        </div>
      </div>

      <!-- Numéro -->
      <div class="flex flex-col">
        <div class="text-xs text-white/40 text-center mb-1 font-mono">N°</div>
        <div :class="attempt.comparison.shirt_number ? 'cell-correct' : 'cell-wrong'" class="result-cell">
          <span class="font-mono font-bold">{{ attempt.player.shirt_number ?? '?' }}</span>
          <span v-if="!attempt.comparison.shirt_number && attempt.comparison.shirt_direction"
            class="text-lg leading-none">
            {{ attempt.comparison.shirt_direction === 'up' ? '↑' : '↓' }}
          </span>
        </div>
      </div>

      <!-- Position -->
      <div class="flex flex-col">
        <div class="text-xs text-white/40 text-center mb-1 font-mono">Poste</div>
        <div :class="attempt.comparison.position ? 'cell-correct' : 'cell-wrong'" class="result-cell">
          <span class="text-xs text-center leading-tight">{{ formatPosition(attempt.player.position) }}</span>
        </div>
      </div>

      <!-- Championnat -->
      <div class="flex flex-col">
        <div class="text-xs text-white/40 text-center mb-1 font-mono">Ligue</div>
        <div :class="attempt.comparison.league ? 'cell-correct' : 'cell-wrong'" class="result-cell">
          <span class="text-xs text-center leading-tight">{{ shortLeague(attempt.player.league) }}</span>
        </div>
      </div>

      <!-- Nationalité -->
      <div class="flex flex-col">
        <div class="text-xs text-white/40 text-center mb-1 font-mono">Nation</div>
        <div :class="attempt.comparison.nationality ? 'cell-correct' : 'cell-wrong'" class="result-cell">
          <span class="text-xs text-center leading-tight">{{ attempt.player.nationality }}</span>
        </div>
      </div>

      <!-- Club -->
      <div class="flex flex-col">
        <div class="text-xs text-white/40 text-center mb-1 font-mono">Club</div>
        <div :class="attempt.comparison.club ? 'cell-correct' : 'cell-wrong'" class="result-cell">
          <span class="text-xs text-center leading-tight">{{ attempt.player.club }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  attempt: { type: Object, required: true },
  attemptNumber: { type: Number, required: true },
  delay: { type: Number, default: 0 },
})

const formatPosition = (pos) => {
  const map = {
    'Goalkeeper': 'Gardien',
    'Defender': 'Défenseur',
    'Midfielder': 'Milieu',
    'Attacker': 'Attaquant',
    'Forward': 'Avant',
  }
  return map[pos] || pos || '?'
}

const shortLeague = (league) => {
  const map = {
    'Premier League': 'Premier L.',
    'La Liga': 'La Liga',
    'Serie A': 'Serie A',
    'Bundesliga': 'Bundesl.',
    'Ligue 1': 'Ligue 1',
  }
  return map[league] || league || '?'
}
</script>
