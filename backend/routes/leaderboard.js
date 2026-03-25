const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getLeaderboard);

module.exports = router;
