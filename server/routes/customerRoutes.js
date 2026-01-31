const express = require('express');
const router = express.Router();
const { updateProfile, getProfile } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

module.exports = router;
