const express = require('express');
const router = express.Router();
const deezerController = require('../controllers/deezerController');

// Buscar artista
router.get('/search/artist', deezerController.searchArtist);

// Buscar tracks directamente
router.get('/search/tracks', deezerController.searchTracks);

// Obtener top tracks de un artista
router.get('/artists/:artistId/top-tracks', deezerController.getTopTracks);

module.exports = router;
