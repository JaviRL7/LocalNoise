const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');

// Buscar videos de una banda
router.get('/search', youtubeController.searchBandVideos);

// Obtener video más popular de una banda
router.get('/popular/:bandName', youtubeController.getMostPopularVideo);

module.exports = router;
