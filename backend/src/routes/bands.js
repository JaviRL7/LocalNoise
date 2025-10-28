const express = require('express');
const router = express.Router();
const bandController = require('../controllers/bandController');
const auth = require('../middleware/auth');

router.get('/', bandController.getAllBands);
router.get('/search', bandController.searchBands);
router.get('/:id', bandController.getBandById);
router.post('/', auth, bandController.createBand);
router.put('/:id', auth, bandController.updateBand);
router.delete('/:id', auth, bandController.deleteBand);

module.exports = router;
