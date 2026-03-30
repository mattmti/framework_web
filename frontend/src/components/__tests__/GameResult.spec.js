/**
 * Tests unitaires — Composant GameResult
 *
 * Vérifie le rendu conditionnel selon l'état de fin de partie :
 * victoire, défaite (10 tentatives) et abandon.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import GameResult from '@/components/GameResult.vue'

// ── Router minimal pour que <RouterLink> fonctionne dans les tests ─────────
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
})

// ── Joueur cible de test ──────────────────────────────────────────────────
const mockPlayer = {
  name: 'Kylian Mbappé',
  club: 'Real Madrid',
  nationality: 'France',
  position: 'Attacker',
  photo_url: null,
}

describe('GameResult — victoire', () => {
  it('affiche "Bravo !" en cas de victoire', async () => {
    const wrapper = mount(GameResult, {
      global: { plugins: [router] },
      props: {
        isWon: true,
        attemptsUsed: 4,
        pointsEarned: 100,
        targetPlayer: mockPlayer,
        gameType: 'daily',
      },
    })
    expect(wrapper.text()).toContain('Bravo')
  })

  it('affiche le nombre de tentatives utilisées', () => {
    const wrapper = mount(GameResult, {
      global: { plugins: [router] },
      props: {
        isWon: true,
        attemptsUsed: 4,
        pointsEarned: 100,
        targetPlayer: mockPlayer,
        gameType: 'daily',
      },
    })
    expect(wrapper.text()).toContain('4')
  })

  it('affiche les points gagnés', () => {
    const wrapper = mount(GameResult, {
      global: { plugins: [router] },
      props: {
        isWon: true,
        attemptsUsed: 3,
        pointsEarned: 100,
        targetPlayer: mockPlayer,
        gameType: 'daily',
      },
    })
    expect(wrapper.text()).toContain('100')
  })

  it('affiche le nom du joueur cible', () => {
    const wrapper = mount(GameResult, {
      global: { plugins: [router] },
      props: {
        isWon: true,
        attemptsUsed: 2,
        pointsEarned: 100,
        targetPlayer: mockPlayer,
        gameType: 'daily',
      },
    })
    expect(wrapper.text()).toContain('Kylian Mbappé')
  })
})

describe('GameResult — défaite', () => {
  it('affiche "Dommage" en cas de défaite', () => {
    const wrapper = mount(GameResult, {
      global: { plugins: [router] },
      props: {
        isWon: false,
        attemptsUsed: 10,
        pointsEarned: 0,
        targetPlayer: mockPlayer,
        gameType: 'random',
      },
    })
    expect(wrapper.text()).toContain('Dommage')
  })

  it('affiche le nom du joueur révélé après défaite', () => {
    const wrapper = mount(GameResult, {
      global: { plugins: [router] },
      props: {
        isWon: false,
        attemptsUsed: 10,
        pointsEarned: 0,
        targetPlayer: mockPlayer,
        gameType: 'random',
      },
    })
    expect(wrapper.text()).toContain('Kylian Mbappé')
  })
})

describe('GameResult — bouton Rejouer', () => {
  it('émet "play-again" au clic sur Rejouer (mode random)', async () => {
    const wrapper = mount(GameResult, {
      global: { plugins: [router] },
      props: {
        isWon: true,
        attemptsUsed: 6,
        pointsEarned: 5,
        targetPlayer: mockPlayer,
        gameType: 'random',
      },
    })
    // Trouver le bouton "Rejouer"
    const btn = wrapper.findAll('button').find(b => b.text().includes('Rejouer'))
    expect(btn).toBeTruthy()
    await btn.trigger('click')
    expect(wrapper.emitted('play-again')).toBeTruthy()
  })

  it('n\'affiche pas Rejouer en mode daily (un seul essai par jour)', () => {
    const wrapper = mount(GameResult, {
      global: { plugins: [router] },
      props: {
        isWon: true,
        attemptsUsed: 3,
        pointsEarned: 100,
        targetPlayer: mockPlayer,
        gameType: 'daily',
      },
    })
    const btns = wrapper.findAll('button')
    expect(btns.every(b => !b.text().includes('Rejouer'))).toBe(true)
    expect(wrapper.text()).toContain('Reviens demain')
  })
})
