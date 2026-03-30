// routes/players.js
const express = require('express');
const router = express.Router();
const { importTopPlayers, getPlayers, getDailyPlayerInfo } = require('../controllers/playerController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', getPlayers);
router.get('/daily', getDailyPlayerInfo);
// Import des top joueurs mondiaux depuis football-api.com (admin seulement)
router.post('/import-top', authenticate, requireAdmin, importTopPlayers);

module.exports = router;
