const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, updateShopSettings, updateDeveloperSettings, requestUpiChange, verifyUpiUpdate } = require('../controllers/settingsController');
const { protect, adminOnly, developerOnly } = require('../middleware/authMiddleware');

router.route('/').get(getSettings).put(protect, adminOnly, updateSettings);
router.put('/shop', protect, adminOnly, updateShopSettings);
router.put('/developer', protect, developerOnly, updateDeveloperSettings);
router.post('/upi/request', protect, adminOnly, requestUpiChange);
router.put('/upi/verify', protect, adminOnly, verifyUpiUpdate);

module.exports = router;
