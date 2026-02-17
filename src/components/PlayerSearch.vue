<template>
  <div class="relative" ref="containerRef">
    <div class="relative">
      <input
        v-model="localQuery"
        @input="onInput"
        @keydown.down.prevent="highlightNext"
        @keydown.up.prevent="highlightPrev"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.escape="close"
        @focus="showDropdown = true"
        type="text"
        class="input pr-10"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
      />
      <div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
        <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>

    <!-- Dropdown résultats -->
    <Transition name="dropdown">
      <div v-if="showDropdown && (results.length > 0 || (localQuery.length >= 2 && !loading))"
        class="absolute top-full mt-2 w-full z-50 rounded-xl border border-white/10 overflow-hidden shadow-2xl"
        style="background: #0f1923;">

        <div v-if="results.length === 0 && localQuery.length >= 2 && !loading"
          class="px-4 py-3 text-sm text-white/40 text-center">
          Aucun joueur trouvé pour "{{ localQuery }}"
        </div>

        <ul v-else>
          <li v-for="(player, idx) in results" :key="player.id"
            @click="selectPlayer(player)"
            @mouseenter="highlighted = idx"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
            :class="highlighted === idx ? 'bg-white/10' : 'hover:bg-white/5'">

            <!-- Photo -->
            <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
              <img v-if="player.photo_url" :src="player.photo_url" :alt="player.name"
                class="w-full h-full object-cover" loading="lazy" />
              <div v-else class="w-full h-full flex items-center justify-center text-xs text-white/30">
                ?
              </div>
            </div>

            <!-- Infos -->
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-white truncate">{{ player.name }}</div>
              <div class="text-xs text-white/40 truncate">{{ player.club }} · {{ player.nationality }}</div>
            </div>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  results: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Rechercher un joueur...' },
  disabled: { type: Boolean, default: false },
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'search', 'select'])

const localQuery = ref(props.modelValue)
const showDropdown = ref(false)
const highlighted = ref(-1)
const containerRef = ref(null)

let debounceTimer = null

const onInput = () => {
  emit('update:modelValue', localQuery.value)
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', localQuery.value)
  }, 300)
}

const selectPlayer = (player) => {
  emit('select', player)
  localQuery.value = ''
  showDropdown.value = false
  highlighted.value = -1
}

const highlightNext = () => {
  if (!showDropdown.value) return
  highlighted.value = Math.min(highlighted.value + 1, props.results.length - 1)
}

const highlightPrev = () => {
  highlighted.value = Math.max(highlighted.value - 1, -1)
}

const selectHighlighted = () => {
  if (highlighted.value >= 0 && props.results[highlighted.value]) {
    selectPlayer(props.results[highlighted.value])
  }
}

const close = () => {
  showDropdown.value = false
  highlighted.value = -1
}

// Fermer en cliquant à l'extérieur
const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    close()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.dropdown-enter-active { transition: all 0.15s ease-out; }
.dropdown-leave-active { transition: all 0.1s ease-in; }
.dropdown-enter-from { opacity: 0; transform: translateY(-4px); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
