import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    username: (state) => state.user?.username || '',
    totalPoints: (state) => state.user?.total_points || 0,
  },

  actions: {
    async register(username, email, password) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/auth/register', { username, email, password })
        this._setSession(data.token, data.user)
        return { success: true }
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors de l\'inscription'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/auth/login', { email, password })
        this._setSession(data.token, data.user)
        return { success: true }
      } catch (err) {
        this.error = err.response?.data?.error || 'Email ou mot de passe incorrect'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      if (!this.token) return
      try {
        const { data } = await api.get('/auth/me')
        this.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
      } catch {
        this.logout()
      }
    },

    async updateProfile(payload) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.put('/users/profile', payload)
        this.user = { ...this.user, ...data.user }
        localStorage.setItem('user', JSON.stringify(this.user))
        return { success: true, message: data.message }
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors de la mise à jour'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    updatePoints(points) {
      if (this.user) {
        this.user.total_points = (this.user.total_points || 0) + points
        localStorage.setItem('user', JSON.stringify(this.user))
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    _setSession(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
  },
})
