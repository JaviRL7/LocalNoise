import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile')
};

// Servicios de bandas
export const bandService = {
  getAll: (params) => api.get('/bands', { params }),
  getById: (id) => api.get(`/bands/${id}`),
  create: (bandData) => api.post('/bands', bandData),
  update: (id, bandData) => api.put(`/bands/${id}`, bandData),
  delete: (id) => api.delete(`/bands/${id}`),
  search: (query) => api.get('/bands/search', { params: { q: query } })
};

// Servicios de Spotify
export const spotifyService = {
  searchArtists: (query, limit = 10) => api.get('/spotify/search', {
    params: { q: query, limit }
  }),
  getArtist: (artistId) => api.get(`/spotify/artists/${artistId}`),
  getTopTracks: (artistId, market = 'US') => api.get(`/spotify/artists/${artistId}/top-tracks`, {
    params: { market }
  })
};

// Servicios de YouTube
export const youtubeService = {
  searchBandVideos: (bandName, limit = 5) => api.get('/youtube/search', {
    params: { bandName, limit }
  }),
  getMostPopularVideo: (bandName) => api.get(`/youtube/popular/${encodeURIComponent(bandName)}`)
};

// Servicios de Deezer (sin API key requerida!)
export const deezerService = {
  searchArtist: (artistName) => api.get('/deezer/search/artist', {
    params: { q: artistName }
  }),
  searchTracks: (bandName, limit = 5) => api.get('/deezer/search/tracks', {
    params: { q: bandName, limit }
  }),
  getTopTracks: (artistId, limit = 5) => api.get(`/deezer/artists/${artistId}/top-tracks`, {
    params: { limit }
  }),
  // Sistema híbrido optimizado (Spotify + Deezer)
  getHybridTracks: (bandName, spotifyId, limit = 5) => api.get('/deezer/hybrid/tracks', {
    params: { bandName, spotifyId, limit }
  })
};

export default api;
