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
   * Ahora busca primero el artista para asegurar coincidencia exacta
   * @param {string} bandName - Nombre de la banda
   * @param {number} limit - Número de tracks (default: 5)
   * @returns {Array} - Array de tracks con preview URLs
   */
  async searchTracks(bandName, limit = 5) {
    try {
      // Primero buscar el artista para obtener coincidencia exacta
      const artist = await this.searchArtist(bandName);

      if (artist && artist.id) {
        // Si encontramos el artista, obtener sus top tracks reales
        const tracks = await this.getArtistTopTracks(artist.id, limit);
        console.log(`✓ Encontradas ${tracks.length} canciones de "${artist.name}" en Deezer`);
        return tracks;
      }

      // Si no encontramos el artista exacto, no retornar tracks inventados
      console.log(`✗ No se encontró el artista exacto "${bandName}" en Deezer`);
      return [];
    } catch (error) {
      console.error('Error buscando tracks en Deezer:', error.message);
      return [];
    }
  }

  /**
   * Busca una canción específica en Deezer por artista y título
   * Usado para el sistema híbrido Spotify → Deezer
   * @param {string} artistName - Nombre del artista
   * @param {string} trackTitle - Título de la canción
   * @returns {Object|null} - Track encontrado o null
   */
  async findExactTrack(artistName, trackTitle) {
    try {
      // Buscar con artista + título para mejor precisión
      const query = `${artistName} ${trackTitle}`;
      const response = await axios.get(`${this.baseUrl}/search/track`, {
        params: {
          q: query,
          limit: 10
        }
      });

      if (response.data.data && response.data.data.length > 0) {
        // Normalizar nombres para comparación (lowercase, sin acentos, trim)
        const normalizeString = (str) => str.toLowerCase().trim()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const artistNorm = normalizeString(artistName);
        const titleNorm = normalizeString(trackTitle);

        // Buscar coincidencia exacta o muy cercana
        for (const track of response.data.data) {
          const trackArtistNorm = normalizeString(track.artist.name);
          const trackTitleNorm = normalizeString(track.title);

          // Verificar coincidencia del artista (exacta o contiene)
          const artistMatch = trackArtistNorm === artistNorm ||
                             trackArtistNorm.includes(artistNorm) ||
                             artistNorm.includes(trackArtistNorm);

          // Verificar coincidencia del título (exacta o muy similar)
          const titleMatch = trackTitleNorm === titleNorm ||
                            trackTitleNorm.includes(titleNorm) ||
                            titleNorm.includes(trackTitleNorm);

          if (artistMatch && titleMatch && track.preview) {
            return {
              id: track.id,
              title: track.title,
              artist: track.artist.name,
              duration: track.duration,
              preview: track.preview,
              albumCover: track.album.cover_medium,
              albumTitle: track.album.title,
              link: track.link
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error(`Error buscando "${trackTitle}" de "${artistName}":`, error.message);
      return null;
    }
  }

  /**
   * Sistema híbrido: Obtiene tracks de Spotify y busca previews en Deezer
   * @param {Array} spotifyTracks - Array de tracks de Spotify con {name, artistName}
   * @returns {Array} - Array de tracks con preview de Deezer
   */
  async getTracksFromSpotifyData(spotifyTracks) {
    try {
      const results = [];

      // Buscar cada canción de Spotify en Deezer (en paralelo para optimizar)
      const promises = spotifyTracks.map(track =>
        this.findExactTrack(track.artistName, track.name)
      );

      const deezerTracks = await Promise.all(promises);

      // Filtrar nulls y retornar solo los que tienen preview
      deezerTracks.forEach((deezerTrack, index) => {
        if (deezerTrack && deezerTrack.preview) {
          results.push({
            ...deezerTrack,
            spotifyUrl: spotifyTracks[index].spotifyUrl, // Agregar URL de Spotify
            popularity: spotifyTracks[index].popularity
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Error en sistema híbrido Spotify→Deezer:', error.message);
      return [];
    }
  }
}

// Exportamos una instancia única (singleton)
module.exports = new DeezerService();
