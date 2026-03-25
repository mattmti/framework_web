// routes/admin.js
const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, getUserHistory, updateUserRole, getStats } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/history', getUserHistory);
router.put('/users/:id/role', updateUserRole);
router.get('/stats', getStats);

module.exports = router;
