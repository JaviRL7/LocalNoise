const deezerService = require('../services/deezerService');
const spotifyService = require('../services/spotifyService');

/**
 * Sistema híbrido optimizado: Obtiene tracks de Spotify y previews de Deezer
 * Prioriza bandas con spotifyId para máxima precisión
 */
exports.getHybridTracks = async (req, res) => {
  try {
    const { bandName, spotifyId, limit } = req.query;

    if (!bandName || bandName.trim().length < 2) {
      return res.status(400).json({
        error: 'El nombre de la banda es requerido'
      });
    }

    const maxLimit = limit ? parseInt(limit) : 5;
    let tracks = [];

    // ESTRATEGIA 1: Si tiene Spotify ID, usar sistema híbrido (más preciso)
    if (spotifyId) {
      console.log(`🎵 Usando sistema híbrido para banda con Spotify ID: ${spotifyId}`);

      try {
        // Obtener top tracks de Spotify
        const spotifyTracks = await spotifyService.getArtistTopTracks(spotifyId, 'ES');

        if (spotifyTracks && spotifyTracks.length > 0) {
          // Preparar data para Deezer
          const tracksToSearch = spotifyTracks.slice(0, maxLimit).map(track => ({
            name: track.name,
            artistName: bandName,
            spotifyUrl: track.spotifyUrl,
            popularity: track.popularity
          }));

          // Buscar cada canción en Deezer
          tracks = await deezerService.getTracksFromSpotifyData(tracksToSearch);

          console.log(`✓ Encontradas ${tracks.length}/${tracksToSearch.length} canciones en Deezer`);
        }
      } catch (error) {
        console.error('Error en sistema híbrido, intentando método alternativo:', error.message);
      }
    }

    // ESTRATEGIA 2: Si no tiene Spotify ID o falló el híbrido, buscar en Deezer directamente
    if (tracks.length === 0) {
      console.log(`🔍 Buscando directamente en Deezer: ${bandName}`);
      tracks = await deezerService.searchTracks(bandName, maxLimit);
    }

    res.json({
      bandName: bandName,
      spotifyId: spotifyId || null,
      method: spotifyId && tracks.length > 0 ? 'hybrid' : 'deezer-direct',
      total: tracks.length,
      tracks: tracks
    });
  } catch (error) {
    console.error('Error en getHybridTracks:', error);
    res.status(500).json({
      error: error.message || 'Error al obtener canciones'
    });
  }
};

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
