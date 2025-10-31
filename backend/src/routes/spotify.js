const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');

// Buscar artistas
router.get('/search', spotifyController.searchArtists);

// Buscar artista por URL de Spotify
router.get('/search-by-url', spotifyController.getArtistByUrl);

// Obtener información de un artista específico
router.get('/artists/:artistId', spotifyController.getArtist);

// Obtener top tracks de un artista
router.get('/artists/:artistId/top-tracks', spotifyController.getTopTracks);

module.exports = router;
