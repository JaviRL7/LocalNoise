const axios = require('axios');

/**
 * Servicio para interactuar con la API de YouTube Data v3
 * Busca videos musicales de bandas
 */
class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  /**
   * Busca videos de una banda en YouTube
   * @param {string} bandName - Nombre de la banda
   * @param {number} maxResults - Número máximo de resultados (default: 5)
   * @returns {Array} - Array de videos encontrados
   */
  async searchBandVideos(bandName, maxResults = 5) {
    if (!this.apiKey) {
      // Si no hay API key, retornar array vacío (la app sigue funcionando)
      console.warn('YouTube API key no configurada');
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          part: 'snippet',
          q: `${bandName} official music video`,
          type: 'video',
          maxResults: maxResults,
          videoCategoryId: '10', // Categoría de Música
          order: 'viewCount', // Ordenar por views
          key: this.apiKey
        }
      });

      // Formatear resultados
      return response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
      }));
    } catch (error) {
      console.error('Error buscando videos en YouTube:', error.response?.data || error.message);
      // No lanzar error, solo retornar array vacío
      return [];
    }
  }

  /**
   * Obtiene el video más popular de una banda
   * @param {string} bandName - Nombre de la banda
   * @returns {Object|null} - Video más popular o null
   */
  async getMostPopularVideo(bandName) {
    const videos = await this.searchBandVideos(bandName, 1);
    return videos.length > 0 ? videos[0] : null;
  }
}

// Exportamos una instancia única (singleton)
module.exports = new YouTubeService();
