const express = require('express');
const router = express.Router();
const { getDailyStatus, startDailyGame, startRandomGame, makeGuess, searchPlayers } = require('../controllers/gameController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/daily/status', optionalAuth, getDailyStatus);
router.post('/daily/start', authenticate, startDailyGame);
router.post('/random/start', optionalAuth, startRandomGame);
router.post('/guess', optionalAuth, makeGuess);
router.get('/players/search', searchPlayers);

module.exports = router;
