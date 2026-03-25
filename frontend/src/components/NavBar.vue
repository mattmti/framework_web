<template>
  <header class="sticky top-0 z-40 border-b border-white/5"
    style="background: rgba(8,15,23,0.92); backdrop-filter: blur(16px);">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 group">
        <div class="w-9 h-9 rounded-xl bg-pitch-500/20 border border-pitch-500/30 flex items-center justify-center
                    group-hover:bg-pitch-500/30 transition-colors">
          <span class="text-lg leading-none">⚽</span>
        </div>
        <span class="font-display text-2xl text-white tracking-wide hidden sm:block">FootballDle</span>
      </RouterLink>

      <!-- Nav links -->
      <nav class="flex items-center gap-1">
        <RouterLink to="/leaderboard" class="nav-link flex items-center gap-1.5">
          <span>🏆</span>
          <span class="hidden sm:inline">Classement</span>
        </RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin" class="nav-link flex items-center gap-1.5 text-yellow-400/70 hover:text-yellow-400">
          <span>⚙️</span>
          <span class="hidden sm:inline">Admin</span>
        </RouterLink>
      </nav>

      <!-- Auth zone -->
      <div class="flex items-center gap-2">
        <template v-if="auth.isLoggedIn">
          <!-- Points badge -->
          <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pitch-500/10 border border-pitch-500/20">
            <span class="text-xs text-pitch-500 font-mono font-semibold">{{ auth.totalPoints }}</span>
            <span class="text-xs text-white/40">pts</span>
          </div>
          <!-- Avatar / Profil -->
          <RouterLink to="/profile"
            class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pitch-500 to-pitch-700 flex items-center justify-center text-xs font-bold text-white">
              {{ auth.username.charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm text-white/70 group-hover:text-white transition-colors hidden sm:block">
              {{ auth.username }}
            </span>
          </RouterLink>
        </template>

        <template v-else>
          <button @click="$emit('open-login')" class="btn-secondary text-sm py-2 px-4">
            Connexion
          </button>
          <button @click="$emit('open-register')" class="btn-primary text-sm py-2 px-4">
            S'inscrire
          </button>
        </template>
      </div>

    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
defineEmits(['open-login', 'open-register'])
</script>
