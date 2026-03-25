const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getMyHistory } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/history', authenticate, getMyHistory);

module.exports = router;
