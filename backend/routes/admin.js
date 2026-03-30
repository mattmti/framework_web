// routes/admin.js
const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, getUserHistory, updateUserRole, getStats, getImportedToday } = require('../controllers/adminController');
const { importTopPlayers } = require('../controllers/playerController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/history', getUserHistory);
router.put('/users/:id/role', updateUserRole);
router.get('/stats', getStats);

// Joueurs importés aujourd'hui depuis football-api.com
router.get('/imported-today', getImportedToday);
// Déclencher l'import des top joueurs (max ~8 requêtes API)
router.post('/import-top-players', importTopPlayers);

module.exports = router;
