<template>
  <div class="max-w-5xl mx-auto px-4 py-12">

    <!-- Hero -->
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pitch-500/10
                  border border-pitch-500/20 text-pitch-500 text-xs font-semibold mb-6">
        ⚽ Le jeu de foot du jour
      </div>
      <h1 class="font-display text-6xl sm:text-8xl text-white tracking-wide mb-4">
        Football<span class="text-pitch-500">Dle</span>
      </h1>
      <p class="text-white/50 text-lg max-w-md mx-auto">
        Devine le joueur mystère en 10 tentatives. Chaque indice te rapproche de la réponse.
      </p>
    </div>

    <!-- Modes de jeu -->
    <div class="grid sm:grid-cols-2 gap-6 mb-12">

      <!-- Joueur quotidien -->
      <div class="card p-8 relative overflow-hidden group cursor-pointer transition-all duration-300
                  hover:border-pitch-500/30 hover:-translate-y-1"
        @click="handleDailyClick">

        <!-- Background effet terrain -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style="background: radial-gradient(ellipse at center, rgba(34,197,94,0.05) 0%, transparent 70%);" />

        <div class="relative">
          <div class="flex items-start justify-between mb-6">
            <div class="w-14 h-14 rounded-2xl bg-pitch-500/20 border border-pitch-500/30 flex items-center justify-center text-2xl">
              🗓️
            </div>
            <div class="flex flex-col items-end gap-2">
              <span class="badge-green">100 pts</span>
              <!-- Statut quotidien -->
              <span v-if="dailyStatus?.already_won" class="badge bg-pitch-500/20 text-pitch-500 text-xs">
                ✓ Complété
              </span>
              <span v-else-if="dailyStatus?.attempts_used > 0" class="badge bg-yellow-500/20 text-yellow-400 text-xs border border-yellow-500/30">
                {{ dailyStatus.attempts_used }}/10 tentatives
              </span>
              <span v-else class="text-xs text-white/30">Disponible</span>
            </div>
          </div>

          <h2 class="font-display text-3xl text-white tracking-wide mb-2">Joueur du jour</h2>
          <p class="text-white/50 text-sm leading-relaxed">
            Un nouveau joueur chaque jour. Une seule chance par 24h.
            Résous le challenge et grimpe dans le classement.
          </p>

          <div class="mt-6 flex items-center justify-between">
            <div class="text-xs text-white/30 font-mono">
              Prochain joueur dans :
              <span class="text-white/50">{{ timeUntilMidnight }}</span>
            </div>
            <div class="w-8 h-8 rounded-full bg-pitch-500/20 border border-pitch-500/30
                        flex items-center justify-center text-pitch-500 text-sm
                        group-hover:bg-pitch-500 group-hover:text-white transition-all">
              →
            </div>
          </div>
        </div>

        <!-- Badge "connexion requise" si non connecté -->
        <div v-if="!auth.isLoggedIn"
          class="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="text-center px-4">
            <p class="text-white font-semibold mb-2">Connexion requise</p>
            <p class="text-white/60 text-sm">Le mode quotidien nécessite un compte</p>
          </div>
        </div>
      </div>

      <!-- Joueur aléatoire -->
      <div class="card p-8 relative overflow-hidden group cursor-pointer transition-all duration-300
                  hover:border-white/20 hover:-translate-y-1"
        @click="handleRandomClick">

        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style="background: radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 70%);" />

        <div class="relative">
          <div class="flex items-start justify-between mb-6">
            <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
              🎲
            </div>
            <span class="badge bg-white/10 text-white/60 border border-white/10">5 pts</span>
          </div>

          <h2 class="font-display text-3xl text-white tracking-wide mb-2">Mode aléatoire</h2>
          <p class="text-white/50 text-sm leading-relaxed">
            Joue autant que tu veux ! Un joueur aléatoire à chaque partie.
            Parfait pour s'entraîner et cumuler des points.
          </p>

          <div class="mt-6 flex items-center justify-between">
            <div class="text-xs text-white/30">Illimité · Disponible sans connexion</div>
            <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10
                        flex items-center justify-center text-white/50 text-sm
                        group-hover:bg-white/10 group-hover:text-white transition-all">
              →
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment jouer -->
    <div class="card p-6 mb-8">
      <h3 class="font-display text-2xl text-white tracking-wide mb-5">Comment jouer ?</h3>
      <div class="grid sm:grid-cols-3 gap-4">
        <div v-for="step in howToPlay" :key="step.number" class="flex gap-4">
          <div class="w-8 h-8 flex-shrink-0 rounded-full bg-pitch-500/20 border border-pitch-500/30
                      flex items-center justify-center text-sm font-bold text-pitch-500">
            {{ step.number }}
          </div>
          <div>
            <div class="text-sm font-semibold text-white mb-1">{{ step.title }}</div>
            <div class="text-xs text-white/50 leading-relaxed">{{ step.desc }}</div>
          </div>
        </div>
      </div>

      <!-- Légende couleurs -->
      <div class="mt-5 pt-5 border-t border-white/5 flex flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-pitch-600/80 border border-pitch-500/50 flex items-center justify-center text-xs">✓</div>
          <span class="text-xs text-white/50">Correct</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-red-900/60 border border-red-700/40 flex items-center justify-center text-xs text-red-300">✗</div>
          <span class="text-xs text-white/50">Incorrect</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-red-900/60 border border-red-700/40 flex items-center justify-center text-xs text-red-300">↑</div>
          <span class="text-xs text-white/50">La valeur est plus haute</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-red-900/60 border border-red-700/40 flex items-center justify-center text-xs text-red-300">↓</div>
          <span class="text-xs text-white/50">La valeur est plus basse</span>
        </div>
      </div>
    </div>

    <!-- Top 5 aperçu classement -->
    <div v-if="topPlayers.length" class="card p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-display text-2xl text-white tracking-wide">Classement</h3>
        <RouterLink to="/leaderboard" class="text-sm text-pitch-500 hover:text-pitch-400 transition-colors">
          Voir tout →
        </RouterLink>
      </div>
      <div class="space-y-2">
        <div v-for="(player, idx) in topPlayers" :key="player.id"
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors hover:bg-white/5">
          <div class="w-7 text-center font-display text-lg" :class="rankColor(idx + 1)">
            {{ rankIcon(idx + 1) }}
          </div>
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pitch-500 to-pitch-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {{ player.username.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 font-semibold text-white text-sm">{{ player.username }}</div>
          <div class="font-mono text-sm text-pitch-500 font-semibold">{{ player.total_points }} pts</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import api from '@/services/api'

const router = useRouter()
const auth = useAuthStore()
const game = useGameStore()

const dailyStatus = ref(null)
const topPlayers = ref([])

const howToPlay = [
  { number: 1, title: 'Tape un nom', desc: 'Recherche n\'importe quel joueur des 5 grands championnats.' },
  { number: 2, title: 'Analyse les indices', desc: 'Chaque cellule révèle si l\'info correspond au joueur mystère.' },
  { number: 3, title: 'Affine ta recherche', desc: 'Utilise les flèches ↑↓ pour l\'âge et le numéro de maillot.' },
]

const timeUntilMidnight = computed(() => {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight - now
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
})

const rankIcon = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

const rankColor = (rank) => {
  if (rank === 1) return 'text-yellow-400'
  if (rank === 2) return 'text-gray-300'
  if (rank === 3) return 'text-amber-600'
  return 'text-white/30'
}

const handleDailyClick = async () => {
  if (!auth.isLoggedIn) {
    // Ouvrir le modal de connexion si l'utilisateur n'est pas connecté
    window.dispatchEvent(new Event('open-login'))
    return
  }
  // Navigation vers la sous-route /play/daily via le paramètre dynamique :mode
  router.push({ name: 'Game', params: { mode: 'daily' } })
}

const handleRandomClick = () => {
  // Navigation vers la sous-route /play/random — accessible sans connexion
  router.push({ name: 'Game', params: { mode: 'random' } })
}

// ── Watcher : mise à jour du statut quotidien à la connexion/déconnexion ──
// Si l'utilisateur se connecte depuis la page d'accueil (modal),
// on rafraîchit automatiquement l'indicateur "Complété / X tentatives".
// Si l'utilisateur se déconnecte, on efface le statut.
watch(() => auth.isLoggedIn, async (loggedIn) => {
  if (loggedIn) {
    dailyStatus.value = await game.checkDailyStatus()
  } else {
    dailyStatus.value = null
  }
})

onMounted(async () => {
  // Statut quotidien (uniquement si connecté)
  if (auth.isLoggedIn) {
    dailyStatus.value = await game.checkDailyStatus()
  }

  // Top 5 du classement
  try {
    const { data } = await api.get('/leaderboard', { params: { limit: 5 } })
    topPlayers.value = data.leaderboard
  } catch {}
})
</script>
