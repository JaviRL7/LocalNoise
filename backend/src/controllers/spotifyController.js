const spotifyService = require('../services/spotifyService');

/**
 * Buscar artistas en Spotify
 */
exports.searchArtists = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const artists = await spotifyService.searchArtists(q, limit ? parseInt(limit) : 10);

    res.json({
      query: q,
      total: artists.length,
      artists: artists
    });
  } catch (error) {
    console.error('Error en searchArtists:', error);
    res.status(500).json({
      error: error.message || 'Error al buscar artistas'
    });
  }
};

/**
 * Obtener canciones más populares de un artista
 */
exports.getTopTracks = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { market } = req.query;

    if (!artistId) {
      return res.status(400).json({
        error: 'Se requiere el ID del artista'
      });
    }

    const tracks = await spotifyService.getArtistTopTracks(artistId, market || 'US');

    res.json({
      artistId: artistId,
      total: tracks.length,
      tracks: tracks
    });
  } catch (error) {
    console.error('Error en getTopTracks:', error);
    res.status(500).json({
      error: error.message || 'Error al obtener canciones'
    });
  }
};

/**
 * Obtener información de un artista
 */
exports.getArtist = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!artistId) {
      return res.status(400).json({
        error: 'Se requiere el ID del artista'
      });
    }

    const artist = await spotifyService.getArtist(artistId);

    res.json(artist);
  } catch (error) {
    console.error('Error en getArtist:', error);
    res.status(500).json({
      error: error.message || 'Error al obtener información del artista'
    });
  }
};

/**
 * Obtener información de un artista por URL de Spotify
 */
exports.getArtistByUrl = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'Se requiere la URL de Spotify'
      });
    }

    const artist = await spotifyService.getArtistByUrl(url);

    res.json({
      artist: artist,
      source: 'url'
    });
  } catch (error) {
    console.error('Error en getArtistByUrl:', error);
    res.status(400).json({
      error: error.message || 'Error al obtener artista por URL'
    });
  }
};
