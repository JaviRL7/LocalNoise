const express = require('express');
const router = express.Router();
const deezerController = require('../controllers/deezerController');

// Sistema híbrido optimizado (Spotify + Deezer)
router.get('/hybrid/tracks', deezerController.getHybridTracks);

// Buscar artista
router.get('/search/artist', deezerController.searchArtist);

// Buscar tracks directamente
router.get('/search/tracks', deezerController.searchTracks);

// Obtener top tracks de un artista
router.get('/artists/:artistId/top-tracks', deezerController.getTopTracks);

module.exports = router;
