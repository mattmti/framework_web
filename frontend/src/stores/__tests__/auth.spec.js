/**
 * Tests unitaires — Store auth (Pinia)
 *
 * On teste les getters et les actions du store d'authentification
 * sans faire d'appels réseau réels (l'API est mockée).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// ── Mock du module api pour éviter les appels réseau ──────────────────────
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}))

describe('Store auth — getters', () => {
  beforeEach(() => {
    // Créer une instance Pinia fraîche avant chaque test
    setActivePinia(createPinia())
  })

  it('isLoggedIn retourne false si token et user sont null', () => {
    const auth = useAuthStore()
    auth.token = null
    auth.user = null
    expect(auth.isLoggedIn).toBe(false)
  })

  it('isLoggedIn retourne false si token présent mais user null', () => {
    const auth = useAuthStore()
    auth.token = 'eyJhbGciOiJIUzI1NiJ9.test'
    auth.user = null
    expect(auth.isLoggedIn).toBe(false)
  })

  it('isLoggedIn retourne true si token ET user sont définis', () => {
    const auth = useAuthStore()
    auth.token = 'eyJhbGciOiJIUzI1NiJ9.test'
    auth.user = { id: 1, username: 'TestUser', role: 'user', total_points: 50 }
    expect(auth.isLoggedIn).toBe(true)
  })

  it('isAdmin retourne false pour un utilisateur normal', () => {
    const auth = useAuthStore()
    auth.user = { id: 1, username: 'TestUser', role: 'user', total_points: 0 }
    expect(auth.isAdmin).toBe(false)
  })

  it('isAdmin retourne true pour un administrateur', () => {
    const auth = useAuthStore()
    auth.user = { id: 1, username: 'admin', role: 'admin', total_points: 0 }
    expect(auth.isAdmin).toBe(true)
  })

  it('isAdmin retourne false si user est null', () => {
    const auth = useAuthStore()
    auth.user = null
    expect(auth.isAdmin).toBe(false)
  })

  it('username retourne le pseudo de l\'utilisateur connecté', () => {
    const auth = useAuthStore()
    auth.user = { id: 1, username: 'FootballFan', role: 'user', total_points: 0 }
    expect(auth.username).toBe('FootballFan')
  })

  it('username retourne une chaîne vide si user est null', () => {
    const auth = useAuthStore()
    auth.user = null
    expect(auth.username).toBe('')
  })

  it('totalPoints retourne le nombre de points de l\'utilisateur', () => {
    const auth = useAuthStore()
    auth.user = { id: 1, username: 'TestUser', role: 'user', total_points: 350 }
    expect(auth.totalPoints).toBe(350)
  })

  it('totalPoints retourne 0 si user est null', () => {
    const auth = useAuthStore()
    auth.user = null
    expect(auth.totalPoints).toBe(0)
  })
})

describe('Store auth — actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('logout efface le token et l\'utilisateur', () => {
    const auth = useAuthStore()
    // Simuler un utilisateur connecté
    auth.token = 'eyJhbGciOiJIUzI1NiJ9.test'
    auth.user = { id: 1, username: 'TestUser', role: 'user', total_points: 100 }

    auth.logout()

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
  })

  it('updatePoints incrémente les points du store', () => {
    const auth = useAuthStore()
    auth.user = { id: 1, username: 'TestUser', role: 'user', total_points: 100 }

    auth.updatePoints(50)

    expect(auth.user.total_points).toBe(150)
    expect(auth.totalPoints).toBe(150)
  })

  it('updatePoints ne plante pas si user est null', () => {
    const auth = useAuthStore()
    auth.user = null
    // Ne doit pas lever d'erreur
    expect(() => auth.updatePoints(50)).not.toThrow()
  })
})
