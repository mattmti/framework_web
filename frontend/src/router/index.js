import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'FootballDle - Accueil' },
  },
  {
    path: '/play/daily',
    name: 'DailyGame',
    component: () => import('@/views/GameView.vue'),
    props: { mode: 'daily' },
    meta: { title: 'Joueur du jour - FootballDle', requiresAuth: true },
  },
  {
    path: '/play/random',
    name: 'RandomGame',
    component: () => import('@/views/GameView.vue'),
    props: { mode: 'random' },
    meta: { title: 'Mode aléatoire - FootballDle' },
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('@/views/LeaderboardView.vue'),
    meta: { title: 'Classement - FootballDle' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: 'Mon profil - FootballDle', requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: 'Administration - FootballDle', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '404 - FootballDle' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'FootballDle'

  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'Home', query: { redirect: to.fullPath, login: '1' } })
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
