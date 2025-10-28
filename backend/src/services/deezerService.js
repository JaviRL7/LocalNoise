const axios = require('axios');

/**
 * Servicio para interactuar con la API de Deezer
 * NO requiere API key - es completamente gratuito
 */
class DeezerService {
  constructor() {
    this.baseUrl = 'https://api.deezer.com';
  }

  /**
   * Busca un artista en Deezer
   * @param {string} artistName - Nombre del artista
   * @returns {Object|null} - Artista encontrado o null
   */
  async searchArtist(artistName) {
    try {
      const response = await axios.get(`${this.baseUrl}/search/artist`, {
        params: {
          q: artistName,
          limit: 1
        }
      });

      if (response.data.data && response.data.data.length > 0) {
        const artist = response.data.data[0];
        return {
          id: artist.id,
          name: artist.name,
          picture: artist.picture_medium,
          link: artist.link
        };
      }

      return null;
    } catch (error) {
      console.error('Error buscando artista en Deezer:', error.message);
      return null;
    }
  }

  /**
   * Obtiene los top tracks de un artista con previews
   * @param {number} artistId - ID del artista en Deezer
   * @param {number} limit - Número de tracks (default: 5)
   * @returns {Array} - Array de tracks con preview URLs
   */
  async getArtistTopTracks(artistId, limit = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/artist/${artistId}/top`, {
        params: {
          limit: limit
        }
      });

      if (response.data.data) {
        return response.data.data.map(track => ({
          id: track.id,
          title: track.title,
          duration: track.duration,
          preview: track.preview, // URL del preview de 30 segundos
          albumCover: track.album.cover_medium,
          albumTitle: track.album.title,
          link: track.link
        })).filter(track => track.preview); // Solo tracks con preview
      }

      return [];
    } catch (error) {
      console.error('Error obteniendo top tracks de Deezer:', error.message);
      return [];
    }
  }

  /**
   * Busca tracks directamente por nombre de banda
   * Útil cuando no tenemos el artist ID
   * @param {string} bandName - Nombre de la banda
   * @param {number} limit - Número de tracks (default: 5)
   * @returns {Array} - Array de tracks con preview URLs
   */
  async searchTracks(bandName, limit = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/search/track`, {
        params: {
          q: bandName,
          limit: limit
        }
      });

      if (response.data.data) {
        return response.data.data.map(track => ({
          id: track.id,
          title: track.title,
          artist: track.artist.name,
          duration: track.duration,
          preview: track.preview, // URL del preview de 30 segundos
          albumCover: track.album.cover_medium,
          albumTitle: track.album.title,
          link: track.link
        })).filter(track => track.preview); // Solo tracks con preview
      }

      return [];
    } catch (error) {
      console.error('Error buscando tracks en Deezer:', error.message);
      return [];
    }
  }
}

// Exportamos una instancia única (singleton)
module.exports = new DeezerService();
