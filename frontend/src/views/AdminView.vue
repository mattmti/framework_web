<template>
  <div class="max-w-6xl mx-auto px-4 py-12">

    <!-- Header -->
    <div class="flex items-center gap-4 mb-10">
      <div class="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-xl">
        ⚙️
      </div>
      <div>
        <h1 class="font-display text-4xl text-white tracking-wide">Administration</h1>
        <p class="text-white/40 text-sm">Gestion des utilisateurs et statistiques</p>
      </div>
    </div>

    <!-- Stats globales -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
      <div v-for="stat in stats" :key="stat.label" class="card p-4 text-center">
        <div class="text-2xl mb-1">{{ stat.icon }}</div>
        <div class="font-display text-2xl text-white">{{ stat.value }}</div>
        <div class="text-xs text-white/40 mt-0.5">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        :class="activeTab === tab.id
          ? 'bg-pitch-500 text-white'
          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'">
        {{ tab.label }}
      </button>
    </div>

    <!-- TAB: Utilisateurs -->
    <div v-if="activeTab === 'users'" class="card overflow-hidden">
      <div class="p-4 border-b border-white/5">
        <input v-model="userSearch" @input="fetchUsers" type="text" class="input max-w-xs"
          placeholder="Rechercher un utilisateur..." />
      </div>
      <div v-if="usersLoading" class="py-12 text-center text-white/30">
        <div class="w-6 h-6 border-2 border-pitch-500/30 border-t-pitch-500 rounded-full animate-spin mx-auto mb-2" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-xs text-white/30 font-mono border-b border-white/5">
              <th class="text-left px-4 py-3">#ID</th>
              <th class="text-left px-4 py-3">Pseudo</th>
              <th class="text-left px-4 py-3 hidden sm:table-cell">Email</th>
              <th class="text-center px-4 py-3">Rôle</th>
              <th class="text-right px-4 py-3">Points</th>
              <th class="text-center px-4 py-3 hidden md:table-cell">Victoires</th>
              <th class="text-center px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id"
              class="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
              <td class="px-4 py-3 text-white/30 font-mono text-xs">{{ user.id }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-pitch-600 to-pitch-800
                    flex items-center justify-center text-xs font-bold text-white">
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-white text-sm font-semibold">{{ user.username }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-white/50 text-sm hidden sm:table-cell">{{ user.email }}</td>
              <td class="px-4 py-3 text-center">
                <span class="badge text-xs"
                  :class="user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/10 text-white/50 border border-white/10'">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-mono text-sm text-pitch-500 font-semibold">
                {{ user.total_points }}
              </td>
              <td class="px-4 py-3 text-center text-sm text-white/40 hidden md:table-cell">
                {{ user.daily_wins }}🗓️ + {{ user.random_wins }}🎲
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <button @click="viewHistory(user)"
                    class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors">
                    Historique
                  </button>
                  <button v-if="user.role !== 'admin'"
                    @click="confirmDelete(user)"
                    class="px-2 py-1 rounded-lg bg-red-600/10 hover:bg-red-600/30 text-red-400 text-xs transition-colors">
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="7" class="px-4 py-12 text-center text-white/30 text-sm">Aucun utilisateur trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB: Joueurs importés du jour -->
    <div v-if="activeTab === 'imported'" class="space-y-6">
      <!-- Import action card -->
      <div class="card p-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="font-display text-2xl text-white mb-1">🌍 Importer les top joueurs du jour</h3>
            <p class="text-white/40 text-sm max-w-lg">
              Récupère les données fraîches des meilleurs joueurs mondiaux (Real Madrid, Barcelona,
              Man City, Liverpool, Arsenal, Bayern, PSG, Inter) depuis football-api.com.
              Utilise <strong class="text-white/70">~8 requêtes API</strong> sur les 100 disponibles par jour.
            </p>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <select v-model="importSeason"
              class="bg-white/10 text-white text-sm rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-pitch-500">
              <option value="2024">Saison 2024-25</option>
              <option value="2025">Saison 2025-26</option>
            </select>
            <button @click="triggerImport" :disabled="importing"
              class="btn-primary whitespace-nowrap">
              <span v-if="importing" class="animate-spin mr-2">⟳</span>
              {{ importing ? 'Import en cours...' : '📡 Lancer l\'import' }}
            </button>
          </div>
        </div>

        <!-- Résultat import -->
        <div v-if="importResult" class="mt-4 px-4 py-3 rounded-xl border text-sm"
          :class="importResult.error
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-pitch-500/10 border-pitch-500/20 text-pitch-500'">
          <template v-if="!importResult.error">
            ✅ Import terminé — {{ importResult.added }} nouveaux joueurs · {{ importResult.updated }} mis à jour
            · {{ importResult.api_requests_used }} requêtes API utilisées
          </template>
          <template v-else>
            ❌ {{ importResult.error }}
          </template>
        </div>
      </div>

      <!-- Liste joueurs importés aujourd'hui -->
      <div class="card overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h3 class="font-display text-xl text-white">
              Joueurs importés aujourd'hui
              <span class="text-pitch-500 ml-2">{{ importedPlayers.length }}</span>
            </h3>
            <p class="text-xs text-white/30 mt-0.5">{{ todayDate }}</p>
          </div>
          <button @click="fetchImportedToday"
            class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors">
            ↻ Actualiser
          </button>
        </div>

        <!-- Loader -->
        <div v-if="importedLoading" class="py-12 text-center text-white/30">
          <div class="w-6 h-6 border-2 border-pitch-500/30 border-t-pitch-500 rounded-full animate-spin mx-auto mb-2" />
          <p class="text-sm">Chargement...</p>
        </div>

        <!-- Aucun joueur -->
        <div v-else-if="importedPlayers.length === 0" class="py-16 text-center text-white/30">
          <div class="text-4xl mb-3">📭</div>
          <p class="font-display text-lg">Aucun joueur importé aujourd'hui</p>
          <p class="text-sm mt-1">Lance l'import ci-dessus pour récupérer les données fraîches.</p>
        </div>

        <!-- Grille joueurs -->
        <div v-else class="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div v-for="player in importedPlayers" :key="player.id"
            class="flex flex-col items-center text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <!-- Photo joueur -->
            <div class="w-16 h-16 rounded-full overflow-hidden bg-white/10 mb-2 flex-shrink-0">
              <img
                :src="player.photo_url"
                :alt="player.name"
                class="w-full h-full object-cover"
                @error="onPhotoError($event)"
              />
            </div>
            <!-- Infos -->
            <div class="font-semibold text-white text-xs leading-tight mb-1">{{ player.name }}</div>
            <div class="text-white/40 text-xs">{{ player.club }}</div>
            <div class="mt-1 flex items-center gap-1 justify-center flex-wrap">
              <span class="text-xs px-1.5 py-0.5 rounded-full bg-pitch-500/20 text-pitch-500 border border-pitch-500/20">
                {{ formatPosition(player.position) }}
              </span>
            </div>
            <div class="mt-1 text-white/30 text-xs">{{ player.league }}</div>
            <div class="mt-0.5 text-white/20 text-xs font-mono">
              #{{ player.shirt_number ?? '?' }} · {{ player.age }} ans
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: Joueurs DB -->
    <div v-if="activeTab === 'players'" class="card p-6">
      <h3 class="font-display text-2xl text-white mb-1">Gestion des joueurs en base</h3>
      <p class="text-white/40 text-sm mb-6">
        L'import des top joueurs mondiaux se fait depuis l'onglet
        <button @click="activeTab = 'imported'" class="text-pitch-500 hover:underline">🌍 Joueurs importés</button>.
        Le seed initial est disponible via <code class="text-white/60 bg-white/5 px-1 rounded">node db/seed-players.js</code>.
      </p>
      <div class="px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
        ⚠️ Limite : 100 requêtes/jour sur football-api.com. L'import top joueurs en utilise ~8.
      </div>
    </div>

    <!-- Modal: Historique utilisateur -->
    <Teleport to="body">
      <div v-if="historyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="historyModal = false">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="historyModal = false" />
        <div class="relative card w-full max-w-2xl max-h-[80vh] flex flex-col animate-pop">
          <div class="flex items-center justify-between p-6 border-b border-white/5">
            <div>
              <h3 class="font-display text-2xl text-white">Historique de {{ selectedUser?.username }}</h3>
              <p class="text-white/40 text-xs mt-1">{{ selectedUser?.total_points }} pts · {{ selectedUser?.email }}</p>
            </div>
            <button @click="historyModal = false" class="text-white/40 hover:text-white transition-colors">✕</button>
          </div>
          <div class="overflow-y-auto flex-1 p-6">
            <div v-if="userHistory.length === 0" class="text-center py-8 text-white/30">Aucune partie jouée.</div>
            <div v-else class="space-y-2">
              <div v-for="s in userHistory" :key="s.id"
                class="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <span class="text-lg">{{ s.won ? '🏆' : '😔' }}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-white">{{ s.player_name || '?' }}</div>
                  <div class="text-xs text-white/40">
                    {{ s.game_type === 'daily' ? '🗓️ Quotidien' : '🎲 Aléatoire' }}
                    · {{ s.attempts }}/10 · {{ formatDate(s.game_date) }}
                  </div>
                </div>
                <div class="font-mono text-sm" :class="s.won ? 'text-pitch-500' : 'text-white/30'">
                  {{ s.won ? `+${s.points_earned}` : '—' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Confirmer suppression -->
    <Teleport to="body">
      <div v-if="deleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="deleteModal = false" />
        <div class="relative card w-full max-w-sm p-8 animate-pop text-center">
          <div class="text-4xl mb-4">⚠️</div>
          <h3 class="font-display text-2xl text-white mb-2">Supprimer le compte</h3>
          <p class="text-white/50 text-sm mb-6">
            Supprimer <strong class="text-white">{{ userToDelete?.username }}</strong> ?
            Cette action est irréversible.
          </p>
          <div class="flex gap-3 justify-center">
            <button @click="deleteModal = false" class="btn-secondary">Annuler</button>
            <button @click="executeDelete" class="btn-danger" :disabled="deleteLoading">
              {{ deleteLoading ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const activeTab = ref('users')
const tabs = [
  { id: 'users',    label: '👥 Utilisateurs' },
  { id: 'imported', label: '🌍 Joueurs importés du jour' },
  { id: 'players',  label: '⚽ Joueurs DB' },
]

// ─── Stats globales ───────────────────────────────────────────────
const globalStats = ref(null)
const stats = computed(() => [
  { icon: '👥', value: globalStats.value?.total_users    ?? '—', label: 'Utilisateurs' },
  { icon: '🎮', value: globalStats.value?.total_sessions ?? '—', label: 'Parties jouées' },
  { icon: '🏆', value: globalStats.value?.total_wins     ?? '—', label: 'Victoires' },
  { icon: '📅', value: globalStats.value?.today_sessions ?? '—', label: "Parties aujourd'hui" },
  { icon: '⚽', value: globalStats.value?.total_players  ?? '—', label: 'Joueurs en BDD' },
])

// ─── Users ───────────────────────────────────────────────────────
const users = ref([])
const usersLoading = ref(true)
const userSearch = ref('')

let searchTimer = null
const fetchUsers = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    usersLoading.value = true
    try {
      const { data } = await api.get('/admin/users', { params: { search: userSearch.value, limit: 50 } })
      users.value = data.users
    } catch {}
    usersLoading.value = false
  }, 300)
}

// ─── Historique ──────────────────────────────────────────────────
const historyModal = ref(false)
const selectedUser = ref(null)
const userHistory = ref([])

const viewHistory = async (user) => {
  selectedUser.value = user
  historyModal.value = true
  userHistory.value = []
  try {
    const { data } = await api.get(`/admin/users/${user.id}/history`)
    userHistory.value = data.history
    selectedUser.value = data.user
  } catch {}
}

// ─── Suppression ─────────────────────────────────────────────────
const deleteModal = ref(false)
const userToDelete = ref(null)
const deleteLoading = ref(false)

const confirmDelete = (user) => {
  userToDelete.value = user
  deleteModal.value = true
}

const executeDelete = async () => {
  deleteLoading.value = true
  try {
    await api.delete(`/admin/users/${userToDelete.value.id}`)
    users.value = users.value.filter(u => u.id !== userToDelete.value.id)
    window.showToast?.({ type: 'success', message: 'Utilisateur supprimé.' })
  } catch (err) {
    window.showToast?.({ type: 'error', message: err.response?.data?.error || 'Erreur lors de la suppression.' })
  } finally {
    deleteLoading.value = false
    deleteModal.value = false
  }
}

// ─── Import top joueurs ──────────────────────────────────────────
const importing = ref(false)
const importResult = ref(null)
const importedPlayers = ref([])
const importedLoading = ref(false)
const importSeason = ref('2025')
const todayDate = computed(() => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

const fetchImportedToday = async () => {
  importedLoading.value = true
  try {
    const { data } = await api.get('/admin/imported-today')
    importedPlayers.value = data.players
  } catch {
    importedPlayers.value = []
  } finally {
    importedLoading.value = false
  }
}

const triggerImport = async () => {
  importing.value = true
  importResult.value = null
  try {
    const { data } = await api.post('/admin/import-top-players', { season: parseInt(importSeason.value) })
    importResult.value = data
    // Actualiser la liste après import
    await fetchImportedToday()
    // Rafraîchir les stats
    const stats = await api.get('/admin/stats')
    globalStats.value = stats.data
  } catch (err) {
    importResult.value = { error: err.response?.data?.error || 'Erreur lors de l\'import.' }
  } finally {
    importing.value = false
  }
}

// ─── Helpers ─────────────────────────────────────────────────────
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

const formatPosition = (pos) => {
  const map = { Goalkeeper: 'Gardien', Defender: 'Défenseur', Midfielder: 'Milieu', Attacker: 'Attaquant' }
  return map[pos] || pos || '?'
}

const onPhotoError = (event) => {
  // Fallback : silhouette générique si la photo ne charge pas
  event.target.src = 'https://media.api-sports.io/football/players/default.png'
  event.target.onerror = null
}

// ─── Init ────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    fetchUsers(),
    api.get('/admin/stats').then(({ data }) => { globalStats.value = data }).catch(() => {}),
    fetchImportedToday(),
  ])
})
</script>
