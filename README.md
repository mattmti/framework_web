# ⚽ FootballDle

> Jeu de devinette de joueurs de football inspiré de Wordle — devine le joueur mystère en 10 tentatives grâce aux indices donnés à chaque essai.

---

## 🎯 Objectif du projet

FootballDle est une application web full-stack permettant aux fans de football de tester leurs connaissances. Chaque jour, un nouveau joueur est sélectionné automatiquement. Les joueurs disposent de 10 tentatives pour le trouver en s'aidant d'indices comparatifs (âge, numéro de maillot, poste, ligue, nationalité, club).

---

## ✨ Fonctionnalités principales

- **Mode quotidien** — Un seul joueur par jour, commun à tous les utilisateurs (100 points). Connexion requise.
- **Mode aléatoire** — Parties illimitées avec un joueur tiré au sort (5 points). Accessible sans compte.
- **Système de comparaison** — Chaque tentative révèle 6 indices : âge (↑↓), numéro de maillot (↑↓), poste, ligue, nationalité, club.
- **Classement global** — Leaderboard en temps réel trié par points.
- **Profil utilisateur** — Historique des parties, stats, modification du pseudo/email/mot de passe.
- **Panel d'administration** — Import de joueurs depuis api-football.com, gestion des utilisateurs, statistiques.
- **Authentification JWT** — Inscription / connexion sécurisées, tokens 7 jours.
- **Joueur quotidien automatique** — Cron job à minuit (Europe/Paris).
- **Recherche sans accents** — "Muller" trouve "Müller" grâce à l'extension PostgreSQL `unaccent`.

---

## 🧑‍💻 Organisation du projet

Projet réalisé **individuellement**.

| Tâche | Détail |
|---|---|
| Architecture backend | MVC Express, modèle BDD PostgreSQL, routes REST |
| Authentification | JWT, bcrypt, middleware auth/admin |
| Logique de jeu | Système de comparaison, sessions, tentatives, points |
| Import API football | Intégration api-football.com, rate-limit, numéros de maillot |
| Frontend Vue 3 | Composants, stores Pinia, router imbriqué, UI Tailwind |
| Panel admin | Gestion utilisateurs, import joueurs, stats globales |
| Tests | Tests unitaires Vitest sur stores et composants |

---

## 🔧 Difficultés rencontrées et solutions apportées

### 1. Numéros de maillot manquants dans l'API
**Problème :** L'endpoint `/players?season=2024` renvoie souvent `statistics[0].games.number = null`.  
**Solution :** Utilisation de l'endpoint dédié `/players/squads` qui retourne directement le champ `number` de façon fiable. Un `Map { playerId → shirtNumber }` est construit puis injecté lors de l'import.

### 2. Rate-limiting silencieux de l'API
**Problème :** L'API limite à 10 requêtes/minute mais répond HTTP 200 avec `response: []` (pas de 429).  
**Solution :** Délai de 7 secondes entre chaque appel + détection explicite via `data.errors?.requests`.

### 3. Session anonyme vs authentifiée
**Problème :** Le mode aléatoire doit fonctionner sans compte ET avec compte (pour les points).  
**Solution :** Middleware `optionalAuth` — une session BDD est créée uniquement si l'utilisateur est connecté.

### 4. Restauration de la session quotidienne
**Problème :** Rechargement de page en plein milieu d'une partie quotidienne.  
**Solution :** `GET /api/game/daily/status` renvoie l'historique complet (`attempts_list`), que le store Pinia reconstruit.

### 5. Recherche insensible aux accents
**Problème :** "Muller" ne trouvait pas "Müller" avec `ILIKE`.  
**Solution :** Extension PostgreSQL `unaccent` + requête `unaccent(name) ILIKE unaccent($1)`.

---

## 🚀 Installation et lancement

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Clé API sur [api-football.com](https://www.api-football.com) (100 requêtes/jour gratuites)

### 1. Cloner le dépôt
```bash
git clone <url-du-repo>
cd framework_web
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
```

Compléter `.env` :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=footballdle
DB_USER=postgres
DB_PASSWORD=ton_mot_de_passe
JWT_SECRET=une_clé_secrète_longue_et_aléatoire
FOOTBALL_API_KEY=ta_clé_api_football
PORT=3000
NODE_ENV=development
```

```bash
npm run migrate          # Crée les tables + compte admin par défaut
node db/seed-players.js  # (Optionnel) ~70 joueurs de base sans API
npm run dev              # Démarrage développement (port 3000)
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api
npm run dev              # Démarrage développement (port 5173)
npm run build            # Build production
```

### 4. Tests
```bash
cd frontend
npm run test             # Mode watch
npm run test:run         # Exécution unique
```

### 5. Accès

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Backend | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |

Compte admin créé automatiquement : `admin@footballdle.com` / `Admin1234!`

---

## 🏗️ Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Vue 3 (Composition API) + Vite |
| State management | Pinia |
| Routing | Vue Router 4 (routes imbriquées) |
| Styles | Tailwind CSS |
| HTTP client | Axios |
| Backend | Node.js + Express |
| Base de données | PostgreSQL |
| Auth | JWT + bcrypt |
| Tâches planifiées | node-cron |
| API externe | api-football.com v3 |
| Tests | Vitest + @vue/test-utils |

---

## 📁 Structure du projet

```
framework_web/
├── backend/
│   ├── config/         # Connexion BDD
│   ├── controllers/    # Logique métier (auth, game, players, admin…)
│   ├── db/             # Migrations et seeds
│   ├── middleware/     # JWT authenticate / requireAdmin / optionalAuth
│   ├── routes/         # Routes API REST
│   ├── services/       # Cron joueur quotidien
│   └── server.js       # Point d'entrée
└── frontend/
    └── src/
        ├── components/ # Composants réutilisables (NavBar, PlayerSearch…)
        ├── stores/     # Pinia : auth.js, game.js
        ├── views/      # Pages : Home, GameView, Leaderboard, Profile, Admin
        ├── router/     # Vue Router — routes imbriquées /play/:mode
        └── services/   # Client Axios configuré
```

---

## 🎮 Système de points

| Action | Points |
|---|---|
| Trouver le joueur quotidien | 100 pts |
| Trouver un joueur aléatoire | 5 pts |
| Échec ou abandon | 0 pt |
| Maximum de tentatives | 10 par partie |
