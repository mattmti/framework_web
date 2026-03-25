<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation -->
    <NavBar @open-login="showLogin = true" @open-register="showRegister = true" />

    <!-- Page principale -->
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <!-- Modals auth -->
    <LoginModal v-if="showLogin" @close="showLogin = false" @switch="showLogin = false; showRegister = true" />
    <RegisterModal v-if="showRegister" @close="showRegister = false" @switch="showRegister = false; showLogin = true" />

    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'
import LoginModal from '@/components/LoginModal.vue'
import RegisterModal from '@/components/RegisterModal.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const auth = useAuthStore()
const showLogin = ref(false)
const showRegister = ref(false)

// Écouter les événements globaux pour ouvrir les modals depuis les routes
const handleOpenLogin = () => { showLogin.value = true }
const handleOpenRegister = () => { showRegister.value = true }

onMounted(async () => {
  if (auth.isLoggedIn) {
    await auth.fetchMe()
  }
  window.addEventListener('open-login', handleOpenLogin)
  window.addEventListener('open-register', handleOpenRegister)
})
</script>
