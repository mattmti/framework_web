import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'
console.log('🔧 API baseURL:', baseURL)

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Intercepteur requête : injecter le token JWT
api.interceptors.request.use((config) => {
  console.log('📤 Requête sortante:', config.method, config.url, config.params)
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur réponse : gérer les 401
api.interceptors.response.use(
  (response) => {
    console.log('📥 Réponse reçue:', response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('❌ Erreur API:', error.config?.url, error.response?.data || error.message)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Rediriger vers accueil si token expiré
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api
