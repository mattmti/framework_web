/**
 * Tests unitaires — Store game (Pinia)
 *
 * Teste les getters et la méthode clearGame / _resetGame
 * sans appels réseau.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '@/stores/game'

// ── Mock de l'API ─────────────────────────────────────────────────────────
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('Store game — getters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('maxAttempts vaut 10', () => {
    const game = useGameStore()
    expect(game.maxAttempts).toBe(10)
  })

  it('attemptsRemaining vaut 10 au départ (0 tentative)', () => {
    const game = useGameStore()
    expect(game.attemptsRemaining).toBe(10)
  })

  it('attemptsRemaining diminue avec les tentatives', () => {
    const game = useGameStore()
    game.attemptsUsed = 3
    expect(game.attemptsRemaining).toBe(7)
  })

  it('attemptsRemaining vaut 0 quand toutes les tentatives sont épuisées', () => {
    const game = useGameStore()
    game.attemptsUsed = 10
    expect(game.attemptsRemaining).toBe(0)
  })

  it('hasActiveGame retourne false au départ', () => {
    const game = useGameStore()
    expect(game.hasActiveGame).toBe(false)
  })

  it('hasActiveGame retourne true si sessionId est défini', () => {
    const game = useGameStore()
    game.sessionId = 42
    expect(game.hasActiveGame).toBe(true)
  })

  it('hasActiveGame retourne true si targetPlayerId est défini (mode anonyme)', () => {
    const game = useGameStore()
    game.targetPlayerId = 15
    expect(game.hasActiveGame).toBe(true)
  })
})

describe('Store game — clearGame', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('clearGame remet toutes les valeurs de jeu à zéro', () => {
    const game = useGameStore()

    // Simuler une partie en cours
    game.sessionId = 10
    game.attemptsUsed = 5
    game.isWon = false
    game.isGameOver = false
    game.attempts = [{ player: { name: 'Mbappe' }, comparison: {} }]
    game.pointsEarned = 0
    game.gameType = 'random'

    game.clearGame()

    // Vérifier la remise à zéro complète
    expect(game.sessionId).toBeNull()
    expect(game.targetPlayerId).toBeNull()
    expect(game.attemptsUsed).toBe(0)
    expect(game.isWon).toBe(false)
    expect(game.isGameOver).toBe(false)
    expect(game.attempts).toHaveLength(0)
    expect(game.pointsEarned).toBe(0)
    expect(game.hasActiveGame).toBe(false)
  })

  it('clearGame remet attemptsRemaining à maxAttempts', () => {
    const game = useGameStore()
    game.attemptsUsed = 7
    game.clearGame()
    expect(game.attemptsRemaining).toBe(10)
  })
})
