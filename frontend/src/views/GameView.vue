<template>
  <div class="max-w-3xl mx-auto px-4 py-8">

    <!-- Header jeu -->
    <div class="flex items-center gap-3 mb-8">
      <RouterLink to="/" class="w-8 h-8 flex items-center justify-center rounded-lg
        hover:bg-white/10 text-white/40 hover:text-white transition-colors text-sm">
        ←
      </RouterLink>
      <div class="flex-1">
        <h1 class="font-display text-3xl text-white tracking-wide">
          {{ mode === 'daily' ? '🗓️ Joueur du jour' : '🎲 Mode aléatoire' }}
        </h1>
        <p class="text-white/40 text-sm">
          {{ mode === 'daily' ? 'Un seul essai par jour · 100 pts' : 'Illimité · 5 pts par victoire' }}
        </p>
      </div>

      <!-- Compteur tentatives -->
      <div class="text-right">
        <div class="font-display text-3xl" :class="attemptsColor">
          {{ game.attemptsUsed }}/{{ game.maxAttempts }}
        </div>
        <div class="text-xs text-white/40">tentatives</div>
      </div>
    </div>

    <!-- Barre de progression -->
    <div class="h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
      <div class="h-full rounded-full transition-all duration-500"
        :class="progressColor"
        :style="{ width: `${(game.attemptsUsed / game.maxAttempts) * 100}%` }" />
    </div>

    <!-- Résultat final -->
    <GameResult v-if="game.isGameOver"
      :is-won="game.isWon"
      :attempts-used="game.attemptsUsed"
      :points-earned="game.pointsEarned"
      :target-player="game.targetPlayer"
      :game-type="mode"
      @play-again="restartRandom"
      class="mb-8"
    />

    <!-- Zone de saisie (si partie en cours) -->
    <div v-if="!game.isGameOver && !loading" class="card p-6 mb-6">
      <div class="mb-4">
        <label class="block text-sm text-white/60 mb-2 font-semibold">
          Qui est ce joueur ? 🤔
        </label>
        <PlayerSearch
          v-model="searchQuery"
          :results="game.searchResults"
          :loading="game.searchLoading"
          :disabled="game.loading || game.isGameOver"
          placeholder="Tape un nom de joueur..."
          @search="game.searchPlayers"
          @select="handleGuess"
        />
      </div>

      <!-- Hint : indices connus -->
      <div v-if="knownHints.length > 0" class="flex flex-wrap gap-2 mt-3">
        <span class="text-xs text-white/30 mr-1">Indices confirmés :</span>
        <span v-for="hint in knownHints" :key="hint"
          class="text-xs px-2 py-0.5 rounded-full bg-pitch-500/20 text-pitch-500 border border-pitch-500/20">
          {{ hint }}
        </span>
      </div>
    </div>

    <!-- Erreur -->
    <div v-if="error" class="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      {{ error }}
    </div>

    <!-- Chargement initial -->
    <div v-if="loading" class="text-center py-16">
      <div class="w-12 h-12 border-2 border-pitch-500/30 border-t-pitch-500 rounded-full animate-spin mx-auto mb-4" />
      <p class="text-white/40">Chargement de la partie...</p>
    </div>

    <!-- Liste des tentatives -->
    <div v-if="game.attempts.length > 0" class="space-y-3">
      <!-- En-tête colonnes -->
      <div class="hidden sm:grid grid-cols-6 gap-2 px-4">
        <div v-for="col in columns" :key="col" class="text-xs text-white/30 text-center font-mono">{{ col }}</div>
      </div>

      <AttemptRow
        v-for="(attempt, idx) in game.attempts"
        :key="idx"
        :attempt="attempt"
        :attempt-number="game.attemptsUsed - idx"
        :delay="0"
      />
    </div>

    <!-- Placeholder si aucune tentative -->
    <div v-if="!loading && !game.isGameOver && game.attempts.length === 0"
      class="text-center py-16 text-white/20">
      <div class="text-5xl mb-4">⚽</div>
      <p class="font-display text-xl tracking-wide">Lance ta première tentative !</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import PlayerSearch from '@/components/PlayerSearch.vue'
import AttemptRow from '@/components/AttemptRow.vue'
import GameResult from '@/components/GameResult.vue'

const props = defineProps({
  mode: { type: String, default: 'random' }, // 'daily' | 'random'
})

const router = useRouter()
const auth = useAuthStore()
const game = useGameStore()

const loading = ref(true)
const error = ref('')
const searchQuery = ref('')

const columns = ['Âge', 'N° Maillot', 'Poste', 'Ligue', 'Nationalité', 'Club']

const attemptsColor = computed(() => {
  const ratio = game.attemptsUsed / game.maxAttempts
  if (ratio < 0.5) return 'text-pitch-500'
  if (ratio < 0.8) return 'text-yellow-400'
  return 'text-red-400'
})

const progressColor = computed(() => {
  const ratio = game.attemptsUsed / game.maxAttempts
  if (ratio < 0.5) return 'bg-pitch-500'
  if (ratio < 0.8) return 'bg-yellow-400'
  return 'bg-red-400'
})

// Indices déjà confirmés (pour guider l'utilisateur)
const knownHints = computed(() => {
  if (game.attempts.length === 0) return []
  const hints = []
  const latest = game.attempts
  const fields = ['position', 'league', 'nationality', 'club']
  const labels = { position: null, league: null, nationality: null, club: null }

  for (const attempt of latest) {
    if (attempt.comparison.position && !labels.position) {
      labels.position = formatPosition(attempt.player.position)
    }
    if (attempt.comparison.league && !labels.league) {
      labels.league = attempt.player.league
    }
    if (attempt.comparison.nationality && !labels.nationality) {
      labels.nationality = attempt.player.nationality
    }
    if (attempt.comparison.club && !labels.club) {
      labels.club = attempt.player.club
    }
  }

  Object.values(labels).forEach(v => { if (v) hints.push(v) })
  return hints
})

const formatPosition = (pos) => {
  const map = { Goalkeeper: 'Gardien', Defender: 'Défenseur', Midfielder: 'Milieu', Attacker: 'Attaquant' }
  return map[pos] || pos
}

const handleGuess = async (player) => {
  if (game.isGameOver) return
  error.value = ''
  const result = await game.makeGuess(player.id)
  if (!result.success) {
    error.value = result.error
  } else {
    // Update points dans l'auth store si victoire
    if (result.data.is_won && result.data.points_earned && auth.isLoggedIn) {
      auth.updatePoints(result.data.points_earned)
      window.showToast?.({
        type: 'success',
        title: 'Bravo ! 🏆',
        message: `+${result.data.points_earned} points gagnés !`,
      })
    } else if (result.data.is_game_over && !result.data.is_won) {
      window.showToast?.({
        type: 'error',
        title: 'Partie terminée',
        message: 'Tu n\'as plus de tentatives.',
      })
    }
  }
}

const restartRandom = async () => {
  loading.value = true
  game.clearGame()
  const result = await game.startRandomGame()
  if (!result.success) error.value = result.error
  loading.value = false
}

onMounted(async () => {
  game.clearGame()
  loading.value = true
  error.value = ''

  if (props.mode === 'daily') {
    if (!auth.isLoggedIn) {
      router.push({ name: 'Home' })
      return
    }
    
    const status = await game.checkDailyStatus()
    
    if (status?.already_won) {
      error.value = 'Tu as déjà gagné le jeu quotidien aujourd\'hui ! Reviens demain. 🌅'
      loading.value = false
      return
    }
    
    if (status?.attempts_used >= game.maxAttempts && !status?.already_won) {
      error.value = 'Tu as utilisé toutes tes tentatives pour aujourd\'hui. Reviens demain ! ⏰'
      loading.value = false
      return
    }
    
    const result = await game.startDailyGame()
    if (!result.success) error.value = result.error
  } else {
    const result = await game.startRandomGame()
    if (!result.success) error.value = result.error
  }

  loading.value = false
})

onUnmounted(() => {
  if (!game.isGameOver) {
  }
})
</script>
