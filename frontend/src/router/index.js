import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // ── Page d'accueil ────────────────────────────────────────────────────────
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'FootballDle - Accueil' },
  },

  // ── Routes de jeu imbriquées sous /play ───────────────────────────────────
  // PlayLayout est un composant "coquille" qui contient <RouterView />.
  // Le paramètre dynamique :mode (contraint à 'daily' ou 'random') est passé
  // comme prop au composant enfant GameView grâce à `props: true`.
  {
    path: '/play',
    component: () => import('@/views/PlayLayout.vue'),
    children: [
      {
        // :mode(daily|random) — contrainte regex : seules ces deux valeurs sont valides
        path: ':mode(daily|random)',
        name: 'Game',
        component: () => import('@/views/GameView.vue'),
        props: true, // Le paramètre :mode est automatiquement passé comme prop
        meta: { title: 'FootballDle - Jouer' },
      },
    ],
  },

  // ── Classement ────────────────────────────────────────────────────────────
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('@/views/LeaderboardView.vue'),
    meta: { title: 'Classement - FootballDle' },
  },

  // ── Profil (connexion requise) ────────────────────────────────────────────
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: 'Mon profil - FootballDle', requiresAuth: true },
  },

  // ── Administration (admin uniquement) ─────────────────────────────────────
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: 'Administration - FootballDle', requiresAuth: true, requiresAdmin: true },
  },

  // ── 404 ───────────────────────────────────────────────────────────────────
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

// ── Guard de navigation global ────────────────────────────────────────────
router.beforeEach((to, from, next) => {
  // Mise à jour du titre de l'onglet
  document.title = to.meta.title || 'FootballDle'

  const auth = useAuthStore()

  // Mode quotidien : connexion obligatoire
  // Géré ici plutôt que via meta.requiresAuth pour distinguer
  // le mode 'daily' (protégé) du mode 'random' (public) sur la même route.
  if (to.name === 'Game' && to.params.mode === 'daily' && !auth.isLoggedIn) {
    return next({ name: 'Home', query: { redirect: to.fullPath, login: '1' } })
  }

  // Pages génériques nécessitant une connexion (profil, etc.)
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'Home', query: { redirect: to.fullPath, login: '1' } })
  }

  // Pages réservées aux administrateurs
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
