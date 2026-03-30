/**
 * Tests unitaires — Composant AttemptRow
 *
 * Vérifie l'affichage d'une tentative :
 * - Nom du joueur
 * - Cellule verte (cell-correct) si la comparaison est vraie
 * - Cellule rouge (cell-wrong) si la comparaison est fausse
 * - Flèche directionnelle ↑ ou ↓ pour l'âge et le numéro
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AttemptRow from '@/components/AttemptRow.vue'

// ── Tentative de test : comparaison partielle ─────────────────────────────
const mockAttemptPartial = {
  player: {
    name: 'Erling Haaland',
    age: 24,
    shirt_number: 9,
    position: 'Attacker',
    league: 'Premier League',
    nationality: 'Norway',
    club: 'Manchester City',
    photo_url: null,
  },
  comparison: {
    age: false,
    age_direction: 'up',       // Le joueur cible est plus vieux → monter
    shirt_number: true,
    shirt_direction: null,
    position: true,
    league: false,
    nationality: false,
    club: true,
  },
}

// ── Tentative parfaite (toutes valeurs correctes) ─────────────────────────
const mockAttemptPerfect = {
  player: {
    name: 'Kylian Mbappé',
    age: 25,
    shirt_number: 7,
    position: 'Attacker',
    league: 'La Liga',
    nationality: 'France',
    club: 'Real Madrid',
    photo_url: null,
  },
  comparison: {
    age: true,
    age_direction: null,
    shirt_number: true,
    shirt_direction: null,
    position: true,
    league: true,
    nationality: true,
    club: true,
  },
}

describe('AttemptRow — affichage du joueur', () => {
  it('affiche le nom du joueur deviné', () => {
    const wrapper = mount(AttemptRow, {
      props: { attempt: mockAttemptPartial, attemptNumber: 1, delay: 0 },
    })
    expect(wrapper.text()).toContain('Erling Haaland')
  })

  it('affiche le numéro de tentative', () => {
    const wrapper = mount(AttemptRow, {
      props: { attempt: mockAttemptPartial, attemptNumber: 3, delay: 0 },
    })
    expect(wrapper.text()).toContain('Tentative 3')
  })

  it('affiche l\'âge du joueur', () => {
    const wrapper = mount(AttemptRow, {
      props: { attempt: mockAttemptPartial, attemptNumber: 1, delay: 0 },
    })
    expect(wrapper.text()).toContain('24')
  })

  it('affiche le numéro de maillot', () => {
    const wrapper = mount(AttemptRow, {
      props: { attempt: mockAttemptPartial, attemptNumber: 1, delay: 0 },
    })
    expect(wrapper.text()).toContain('9')
  })
})

describe('AttemptRow — classes CSS selon la comparaison', () => {
  it('applique cell-correct sur le numéro de maillot si correct', () => {
    const wrapper = mount(AttemptRow, {
      props: { attempt: mockAttemptPartial, attemptNumber: 1, delay: 0 },
    })
    // La 2e cellule (N° maillot) doit avoir cell-correct
    const cells = wrapper.findAll('.result-cell')
    expect(cells[1].classes()).toContain('cell-correct')
  })

  it('applique cell-wrong sur l\'âge si incorrect', () => {
    const wrapper = mount(AttemptRow, {
      props: { attempt: mockAttemptPartial, attemptNumber: 1, delay: 0 },
    })
    const cells = wrapper.findAll('.result-cell')
    expect(cells[0].classes()).toContain('cell-wrong')
  })

  it('toutes les cellules sont cell-correct si la tentative est parfaite', () => {
    const wrapper = mount(AttemptRow, {
      props: { attempt: mockAttemptPerfect, attemptNumber: 1, delay: 0 },
    })
    const cells = wrapper.findAll('.result-cell')
    cells.forEach(cell => {
      expect(cell.classes()).toContain('cell-correct')
    })
  })
})

describe('AttemptRow — flèches directionnelles', () => {
  it('affiche la flèche ↑ si age_direction est "up"', () => {
    const wrapper = mount(AttemptRow, {
      props: { attempt: mockAttemptPartial, attemptNumber: 1, delay: 0 },
    })
    expect(wrapper.text()).toContain('↑')
  })

  it('affiche la flèche ↓ si age_direction est "down"', () => {
    const attempt = {
      ...mockAttemptPartial,
      comparison: { ...mockAttemptPartial.comparison, age_direction: 'down' },
    }
    const wrapper = mount(AttemptRow, {
      props: { attempt, attemptNumber: 1, delay: 0 },
    })
    expect(wrapper.text()).toContain('↓')
  })

  it('n\'affiche pas de flèche si la valeur est correcte', () => {
    const wrapper = mount(AttemptRow, {
      props: { attempt: mockAttemptPerfect, attemptNumber: 1, delay: 0 },
    })
    // Aucune flèche quand tout est correct
    expect(wrapper.text()).not.toContain('↑')
    expect(wrapper.text()).not.toContain('↓')
  })
})
