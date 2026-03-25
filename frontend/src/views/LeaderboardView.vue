<template>
  <div class="max-w-3xl mx-auto px-4 py-12">

    <!-- Header -->
    <div class="text-center mb-12">
      <div class="text-5xl mb-4">🏆</div>
      <h1 class="font-display text-5xl text-white tracking-wide mb-2">Classement</h1>
      <p class="text-white/40">Les 50 meilleurs joueurs de FootballDle</p>

      <!-- Mon rang -->
      <div v-if="auth.isLoggedIn && userRank" class="inline-flex items-center gap-3 mt-4 px-5 py-2.5
        rounded-full bg-pitch-500/10 border border-pitch-500/20">
        <span class="text-white/60 text-sm">Mon rang :</span>
        <span class="font-display text-xl text-pitch-500">#{{ userRank }}</span>
        <span class="text-white/40 text-sm">· {{ auth.totalPoints }} pts</span>
      </div>
    </div>

    <!-- Podium top 3 -->
    <div v-if="leaderboard.length >= 3" class="grid grid-cols-3 gap-4 mb-10 items-end">

      <!-- 2ème -->
      <div class="card p-5 text-center order-1">
        <div class="text-3xl mb-2">🥈</div>
        <div class="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-600
          flex items-center justify-center font-bold text-white text-sm mb-2">
          {{ leaderboard[1].username.charAt(0).toUpperCase() }}
        </div>
        <div class="font-semibold text-white text-sm truncate">{{ leaderboard[1].username }}</div>
        <div class="font-mono text-gray-300 font-bold mt-1">{{ leaderboard[1].total_points }}</div>
        <div class="text-xs text-white/30 mt-0.5">points</div>
      </div>

      <!-- 1er -->
      <div class="card p-6 text-center order-2 border-yellow-500/20 relative overflow-hidden"
        style="background: linear-gradient(to bottom, rgba(234,179,8,0.05), transparent);">
        <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />
        <div class="text-4xl mb-3">🥇</div>
        <div class="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600
          flex items-center justify-center font-bold text-white mb-2">
          {{ leaderboard[0].username.charAt(0).toUpperCase() }}
        </div>
        <div class="font-bold text-white truncate">{{ leaderboard[0].username }}</div>
        <div class="font-mono text-yellow-400 font-bold text-lg mt-1">{{ leaderboard[0].total_points }}</div>
        <div class="text-xs text-white/30 mt-0.5">points</div>
      </div>

      <!-- 3ème -->
      <div class="card p-5 text-center order-3">
        <div class="text-3xl mb-2">🥉</div>
        <div class="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800
          flex items-center justify-center font-bold text-white text-sm mb-2">
          {{ leaderboard[2].username.charAt(0).toUpperCase() }}
        </div>
        <div class="font-semibold text-white text-sm truncate">{{ leaderboard[2].username }}</div>
        <div class="font-mono text-amber-500 font-bold mt-1">{{ leaderboard[2].total_points }}</div>
        <div class="text-xs text-white/30 mt-0.5">points</div>
      </div>
    </div>

    <!-- Liste complète -->
    <div class="card overflow-hidden">
      <!-- En-tête -->
      <div class="grid grid-cols-12 gap-2 px-6 py-3 border-b border-white/5 text-xs text-white/30 font-mono">
        <div class="col-span-1 text-center">#</div>
        <div class="col-span-6">Joueur</div>
        <div class="col-span-2 text-center hidden sm:block">Quotidiens</div>
        <div class="col-span-2 text-center hidden sm:block">Aléatoires</div>
        <div class="col-span-3 sm:col-span-1 text-right">Points</div>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="py-16 text-center">
        <div class="w-8 h-8 border-2 border-pitch-500/30 border-t-pitch-500 rounded-full animate-spin mx-auto mb-3" />
        <p class="text-white/30 text-sm">Chargement...</p>
      </div>

      <div v-else>
        <div v-for="(player, idx) in leaderboard" :key="player.id"
          class="grid grid-cols-12 gap-2 items-center px-6 py-4 border-b border-white/5 last:border-0
                 transition-colors hover:bg-white/3"
          :class="{ 'bg-pitch-500/5': auth.user?.id === player.id }">

          <!-- Rang -->
          <div class="col-span-1 text-center font-display text-lg" :class="rankColor(idx + 1)">
            {{ idx < 3 ? rankIcon(idx + 1) : `${idx + 1}` }}
          </div>

          <!-- Joueur -->
          <div class="col-span-6 flex items-center gap-3">
            <div class="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
              :class="avatarClass(idx + 1)">
              {{ player.username.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <span class="font-semibold text-white text-sm truncate block">{{ player.username }}</span>
              <span v-if="auth.user?.id === player.id" class="text-xs text-pitch-500">Toi</span>
            </div>
          </div>

          <!-- Victoires quotidiennes -->
          <div class="col-span-2 text-center text-sm text-white/40 hidden sm:block">
            {{ player.daily_wins }} 🗓️
          </div>

          <!-- Victoires aléatoires -->
          <div class="col-span-2 text-center text-sm text-white/40 hidden sm:block">
            {{ player.random_wins }} 🎲
          </div>

          <!-- Points -->
          <div class="col-span-3 sm:col-span-1 text-right font-mono font-bold text-sm" :class="rankColor(idx + 1)">
            {{ player.total_points }}
          </div>

        </div>

        <div v-if="leaderboard.length === 0" class="py-12 text-center text-white/30">
          <div class="text-4xl mb-3">🏜️</div>
          <p>Aucun joueur dans le classement pour l'instant.</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()
const leaderboard = ref([])
const userRank = ref(null)
const loading = ref(true)

const rankIcon = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}`
}

const rankColor = (rank) => {
  if (rank === 1) return 'text-yellow-400'
  if (rank === 2) return 'text-gray-300'
  if (rank === 3) return 'text-amber-500'
  return 'text-white/50'
}

const avatarClass = (rank) => {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600'
  if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500'
  if (rank === 3) return 'bg-gradient-to-br from-amber-500 to-amber-700'
  return 'bg-gradient-to-br from-pitch-600 to-pitch-800'
}

onMounted(async () => {
  try {
    const { data } = await api.get('/leaderboard', { params: { limit: 50 } })
    leaderboard.value = data.leaderboard
    userRank.value = data.user_rank
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
