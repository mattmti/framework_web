require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const playerRoutes = require('./routes/players');
const gameRoutes = require('./routes/game');
const adminRoutes = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');
const { pickDailyPlayer } = require('./services/dailyPlayer');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Trop de requêtes, réessaie dans quelques minutes.' },
});
app.use('/api', globalLimiter);

// Rate limiter strict pour l'auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives de connexion.' },
});

// ─── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Erreur interne du serveur'
      : err.message,
  });
});

// ─── Cron : joueur quotidien à minuit ───────────────────────────────
cron.schedule('0 0 * * *', async () => {
  console.log('🕛 Sélection du joueur quotidien...');
  try {
    await pickDailyPlayer();
    console.log('✅ Joueur quotidien sélectionné');
  } catch (err) {
    console.error('❌ Erreur cron daily player:', err);
  }
}, { timezone: 'Europe/Paris' });

// ─── Démarrage ──────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n⚽ FootballDle Backend démarré sur http://localhost:${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);

  // Sélectionner le joueur du jour au démarrage si pas encore fait
  try {
    await pickDailyPlayer();
    console.log('✅ Joueur quotidien vérifié au démarrage');
  } catch (err) {
    console.warn('⚠️  Impossible de vérifier le joueur quotidien:', err.message);
  }
});

module.exports = app;
