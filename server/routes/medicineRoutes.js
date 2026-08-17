const express = require('express');
const router = express.Router();
const {
    getMedicines,
    getFastMovingMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine
} = require('../controllers/medicineController');
const { protect, adminOnly, optionalProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(optionalProtect, getMedicines)
    .post(protect, adminOnly, upload.single('image'), createMedicine);

router.get('/fast-moving', optionalProtect, getFastMovingMedicines);

router.route('/:id')
    .get(optionalProtect, getMedicineById)
    .put(protect, adminOnly, upload.single('image'), updateMedicine)
    .delete(protect, adminOnly, deleteMedicine);

module.exports = router;
