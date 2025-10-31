const axios = require('axios');

/**
 * Servicio para interactuar con la API de Spotify
 * Utiliza el Client Credentials Flow para autenticación
 */
class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Obtiene un token de acceso de Spotify usando Client Credentials Flow
   * El token se cachea y solo se renueva cuando expira
   */
  async getAccessToken() {
    // Si ya tenemos un token válido, lo retornamos
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Guardamos el tiempo de expiración (restamos 5 minutos como margen de seguridad)
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Error obteniendo token de Spotify:', error.response?.data || error.message);
      throw new Error('No se pudo autenticar con Spotify');
    }
  }

  /**
   * Busca artistas en Spotify por nombre
   * @param {string} query - Nombre del artista a buscar
   * @param {number} limit - Número máximo de resultados (default: 10)
   * @returns {Array} - Array de artistas encontrados
   */
  async searchArtists(query, limit = 10) {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Credenciales de Spotify no configuradas');
    }

    try {
      const token = await this.getAccessToken();

      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'artist',
          limit: limit
        }
      });

      // Formateamos los resultados para enviar solo lo necesario
      return response.data.artists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total,
        images: artist.images,
        imageUrl: artist.images[0]?.url || null,
        spotifyUrl: artist.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error buscando artistas en Spotify:', error.response?.data || error.message);
      throw new Error('Error al buscar en Spotify');
    }
  }

  /**
   * Obtiene las canciones más populares de un artista
   * @param {string} artistId - ID del artista en Spotify
   * @param {string} market - Código de país ISO (default: 'US')
   * @returns {Array} - Array de canciones populares con preview_url
   */
  async getArtistTopTracks(artistId, market = 'US') {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Credenciales de Spotify no configuradas');
    }

    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            market: market
          }
        }
      );

      // Formateamos las canciones
      return response.data.tracks.map(track => ({
        id: track.id,
        name: track.name,
        previewUrl: track.preview_url, // URL del fragmento de 30 segundos
        albumName: track.album.name,
        albumImage: track.album.images[0]?.url || null,
        duration: track.duration_ms,
        spotifyUrl: track.external_urls.spotify,
        popularity: track.popularity
      }));
    } catch (error) {
      console.error('Error obteniendo top tracks:', error.response?.data || error.message);
      throw new Error('Error al obtener canciones del artista');
    }
  }

  /**
   * Extrae el ID del artista de una URL de Spotify
   * @param {string} url - URL de Spotify (ej: https://open.spotify.com/artist/1234)
   * @returns {string|null} - ID del artista o null si no es válida
   */
  extractArtistIdFromUrl(url) {
    try {
      // Patrones de URL de Spotify para artistas
      // Soporta URLs con internacionalización: /intl-XX/
      // Soporta query params: ?si=...
      const patterns = [
        /spotify\.com\/(?:intl-[a-z]{2}\/)?artist\/([a-zA-Z0-9]+)/i,  // URLs web con/sin intl
        /spotify:artist:([a-zA-Z0-9]+)/  // URIs de Spotify
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Busca un artista por URL de Spotify
   * @param {string} url - URL del artista en Spotify
   * @returns {Object} - Información del artista
   */
  async getArtistByUrl(url) {
    const artistId = this.extractArtistIdFromUrl(url);

    if (!artistId) {
      throw new Error('URL de Spotify no válida. Usa el formato: https://open.spotify.com/artist/...');
    }

    return await this.getArtist(artistId);
  }

  /**
   * Obtiene información completa de un artista
   * @param {string} artistId - ID del artista en Spotify
   * @returns {Object} - Información del artista
   */
  async getArtist(artistId) {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Credenciales de Spotify no configuradas');
    }

    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const artist = response.data;

      return {
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total,
        images: artist.images,
        imageUrl: artist.images[0]?.url || null,
        spotifyUrl: artist.external_urls.spotify
      };
    } catch (error) {
      console.error('Error obteniendo artista:', error.response?.data || error.message);
      throw new Error('Error al obtener información del artista');
    }
  }
}

// Exportamos una instancia única (singleton)
module.exports = new SpotifyService();
