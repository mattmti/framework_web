# ⚽ FootballDle

Jeu de devinette de joueurs de football inspiré de Wordle.

## Stack technique
- **Frontend** : Vue 3 + Vite + Pinia + Vue Router + TailwindCSS
- **Backend** : Node.js + Express + PostgreSQL + JWT
- **API** : API-Football (RapidAPI)

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Clé API RapidAPI (API-Football)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Remplis le fichier .env avec tes valeurs
npm run migrate   # Crée les tables en BDD
npm run dev       # Lance le serveur (port 3000)
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Remplis VITE_API_URL et VITE_RAPIDAPI_KEY
npm run dev       # Lance le frontend (port 5173)
```

## Variables d'environnement

### Backend `.env`
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=footballdle
DB_USER=postgres
DB_PASSWORD=ton_mot_de_passe
JWT_SECRET=une_clé_secrète_longue
RAPIDAPI_KEY=ta_clé_rapidapi
PORT=3000
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:3000/api
```

## Système de points
- 🏆 Joueur quotidien deviné → **100 points**
- ⚽ Joueur aléatoire deviné → **5 points**
- 10 tentatives maximum par partie

## Règles du jeu
À chaque tentative, le jeu indique quelles informations correspondent :
- ✅ Correct / ❌ Incorrect / 🔺 Proche (pour l'âge et le numéro)
- Informations : Âge, Numéro de maillot, Position, Championnat, Nationalité, Club
