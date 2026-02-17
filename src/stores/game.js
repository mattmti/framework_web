import { defineStore } from 'pinia'
import api from '@/services/api'

const MAX_ATTEMPTS = 10

export const useGameStore = defineStore('game', {
  state: () => ({
    // Session active
    sessionId: null,
    targetPlayerId: null,
    gameType: null, // 'daily' | 'random'

    // État du jeu
    attempts: [],
    attemptsUsed: 0,
    isWon: false,
    isGameOver: false,
    pointsEarned: 0,
    targetPlayer: null,

    // Recherche
    searchQuery: '',
    searchResults: [],
    searchLoading: false,

    // UI
    loading: false,
    error: null,

    // Statut quotidien
    dailyStatus: null,
  }),

  getters: {
    attemptsRemaining: (state) => MAX_ATTEMPTS - state.attemptsUsed,
    hasActiveGame: (state) => !!state.sessionId || !!state.targetPlayerId,
    maxAttempts: () => MAX_ATTEMPTS,
  },

  actions: {
    async checkDailyStatus() {
      try {
        const { data } = await api.get('/game/daily/status')
        this.dailyStatus = data
        return data
      } catch (err) {
        this.dailyStatus = null
        return null
      }
    },

    async startDailyGame() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/game/daily/start')
        this._resetGame('daily')
        this.sessionId = data.session_id
        this.attemptsUsed = data.attempts_used || 0

        // Restaurer tentatives si session existante
        if (this.dailyStatus?.session?.attempts_list) {
          this.attempts = this.dailyStatus.session.attempts_list.map(a => ({
            player: {
              id: a.guessed_player_id,
              name: a.guessed_player_name || a.name,
              age: a.age,
              shirt_number: a.shirt_number,
              position: a.position,
              league: a.league,
              nationality: a.nationality,
              club: a.club,
              photo_url: a.photo_url,
            },
            comparison: {
              age: a.result_age,
              shirt_number: a.result_shirt_number,
              position: a.result_position,
              league: a.result_league,
              nationality: a.result_nationality,
              club: a.result_club,
              age_direction: a.age_direction,
              shirt_direction: a.shirt_direction,
            },
          }))
        }

        return { success: true }
      } catch (err) {
        this.error = err.response?.data?.error || 'Impossible de démarrer la partie quotidienne'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async startRandomGame() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/game/random/start')
        this._resetGame('random')
        this.sessionId = data.session_id
        this.targetPlayerId = data.player_id
        return { success: true }
      } catch (err) {
        this.error = err.response?.data?.error || 'Impossible de démarrer une partie aléatoire'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async makeGuess(guessedPlayerId) {
      if (this.isGameOver || this.attemptsUsed >= MAX_ATTEMPTS) return

      this.loading = true
      this.error = null
      try {
        const payload = {
          guessed_player_id: guessedPlayerId,
          session_id: this.sessionId,
          player_id: this.targetPlayerId,
        }

        const { data } = await api.post('/game/guess', payload)

        this.attempts.unshift({
          player: data.guessed_player,
          comparison: data.comparison,
        })

        this.attemptsUsed = data.attempts_used
        this.isWon = data.is_won
        this.isGameOver = data.is_game_over

        if (data.is_game_over) {
          this.targetPlayer = data.target_player
          this.pointsEarned = data.points_earned || 0
        }

        return { success: true, data }
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors de la tentative'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async searchPlayers(query) {
      this.searchQuery = query
      if (!query || query.length < 2) {
        this.searchResults = []
        return
      }
      this.searchLoading = true
      try {
        const { data } = await api.get('/game/players/search', { params: { q: query } })
        this.searchResults = data.players
      } catch {
        this.searchResults = []
      } finally {
        this.searchLoading = false
      }
    },

    _resetGame(type) {
      this.gameType = type
      this.sessionId = null
      this.targetPlayerId = null
      this.attempts = []
      this.attemptsUsed = 0
      this.isWon = false
      this.isGameOver = false
      this.pointsEarned = 0
      this.targetPlayer = null
      this.searchQuery = ''
      this.searchResults = []
      this.error = null
    },

    clearGame() {
      this._resetGame(null)
    },
  },
})
