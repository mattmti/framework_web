// routes/players.js
const express = require('express');
const router = express.Router();
const { syncPlayers, getPlayers, getDailyPlayerInfo } = require('../controllers/playerController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', getPlayers);
router.get('/daily', getDailyPlayerInfo);
router.post('/sync', authenticate, requireAdmin, syncPlayers);

module.exports = router;
