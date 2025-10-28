const deezerService = require('../services/deezerService');

/**
 * Buscar artista en Deezer
 */
exports.searchArtist = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const artist = await deezerService.searchArtist(q);

    if (!artist) {
      return res.status(404).json({
        error: 'No se encontró el artista en Deezer'
      });
    }

    res.json(artist);
  } catch (error) {
    console.error('Error en searchArtist:', error);
    res.status(500).json({
      error: error.message || 'Error al buscar artista'
    });
  }
};

/**
 * Obtener top tracks de un artista por ID
 */
exports.getTopTracks = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { limit } = req.query;

    if (!artistId) {
      return res.status(400).json({
        error: 'Se requiere el ID del artista'
      });
    }

    const tracks = await deezerService.getArtistTopTracks(
      artistId,
      limit ? parseInt(limit) : 5
    );

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
 * Buscar tracks directamente por nombre de banda
 */
exports.searchTracks = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const tracks = await deezerService.searchTracks(
      q,
      limit ? parseInt(limit) : 5
    );

    res.json({
      query: q,
      total: tracks.length,
      tracks: tracks
    });
  } catch (error) {
    console.error('Error en searchTracks:', error);
    res.status(500).json({
      error: error.message || 'Error al buscar canciones'
    });
  }
};
