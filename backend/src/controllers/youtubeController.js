const youtubeService = require('../services/youtubeService');

/**
 * Buscar videos de una banda en YouTube
 */
exports.searchBandVideos = async (req, res) => {
  try {
    const { bandName, limit } = req.query;

    if (!bandName || bandName.trim().length < 2) {
      return res.status(400).json({
        error: 'El nombre de la banda debe tener al menos 2 caracteres'
      });
    }

    const videos = await youtubeService.searchBandVideos(
      bandName,
      limit ? parseInt(limit) : 5
    );

    res.json({
      bandName: bandName,
      total: videos.length,
      videos: videos
    });
  } catch (error) {
    console.error('Error en searchBandVideos:', error);
    res.status(500).json({
      error: error.message || 'Error al buscar videos'
    });
  }
};

/**
 * Obtener el video más popular de una banda
 */
exports.getMostPopularVideo = async (req, res) => {
  try {
    const { bandName } = req.params;

    if (!bandName || bandName.trim().length < 2) {
      return res.status(400).json({
        error: 'El nombre de la banda debe tener al menos 2 caracteres'
      });
    }

    const video = await youtubeService.getMostPopularVideo(bandName);

    if (!video) {
      return res.status(404).json({
        error: 'No se encontraron videos para esta banda'
      });
    }

    res.json(video);
  } catch (error) {
    console.error('Error en getMostPopularVideo:', error);
    res.status(500).json({
      error: error.message || 'Error al obtener video'
    });
  }
};
