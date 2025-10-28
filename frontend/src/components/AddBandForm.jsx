import { useState, useEffect } from 'react';
import { bandService } from '../services/api';
import SpotifySearch from './SpotifySearch';
import '../styles/AddBandForm.css';

function AddBandForm({ band, onBandAdded, onBandUpdated, onClose }) {
  const isEditMode = !!band;

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
    genre: '',
    yearFormed: '',
    spotifyUrl: '',
    spotifyId: '',
    spotifyImageUrl: '',
    isVerified: false,
    isActive: true
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSpotifyArtist, setSelectedSpotifyArtist] = useState(null);

  // Pre-fill form when editing
  useEffect(() => {
    if (band) {
      setFormData({
        name: band.name || '',
        city: band.city || '',
        country: band.country || '',
        latitude: band.latitude || '',
        longitude: band.longitude || '',
        genre: band.genre || '',
        yearFormed: band.yearFormed || '',
        spotifyUrl: band.spotifyUrl || '',
        spotifyId: band.spotifyId || '',
        spotifyImageUrl: band.spotifyImageUrl || '',
        isVerified: band.isVerified || false,
        isActive: band.isActive !== undefined ? band.isActive : true
      });
    }
  }, [band]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSpotifyArtistSelect = (artist) => {
    setSelectedSpotifyArtist(artist);

    if (artist) {
      // Auto-rellenar el formulario con datos de Spotify
      setFormData(prev => ({
        ...prev,
        name: artist.name,
        genre: artist.genres && artist.genres.length > 0 ? artist.genres[0] : prev.genre,
        spotifyUrl: artist.spotifyUrl,
        spotifyId: artist.id,
        spotifyImageUrl: artist.imageUrl,
        isVerified: true
      }));
    } else {
      // Limpiar datos de Spotify si se cambia a manual
      setFormData(prev => ({
        ...prev,
        spotifyUrl: '',
        spotifyId: '',
        spotifyImageUrl: '',
        isVerified: false
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode) {
        const response = await bandService.update(band.id, formData);
        onBandUpdated(response.data);
      } else {
        const response = await bandService.create(formData);
        onBandAdded(response.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || `Error al ${isEditMode ? 'actualizar' : 'agregar'} la banda`);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener coordenadas de una ciudad usando Nominatim (OpenStreetMap)
  const searchLocation = async () => {
    if (!formData.city || !formData.country) {
      setError('Por favor, ingresa ciudad y país primero');
      return;
    }

    try {
      const query = `${formData.city}, ${formData.country}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat).toFixed(6),
          longitude: parseFloat(data[0].lon).toFixed(6)
        }));
        setError('');
      } else {
        setError('No se encontró la ubicación. Intenta con otro formato o ingresa las coordenadas manualmente.');
      }
    } catch (err) {
      setError('Error al buscar la ubicación');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditMode ? 'Editar Banda' : 'Agregar Banda Local'}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="add-band-form">
          {error && <div className="error-message">{error}</div>}

          {!isEditMode && <SpotifySearch onSelectArtist={handleSpotifyArtistSelect} />}

          <div className="form-group">
            <label>Nombre de la banda *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Los Bourbons"
              readOnly={!isEditMode && selectedSpotifyArtist !== null}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ciudad *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Sanlúcar de Barrameda"
              />
            </div>

            <div className="form-group">
              <label>País *</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                placeholder="España"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitud *</label>
              <div className="number-input-wrapper">
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  placeholder="36.7780"
                />
                <div className="number-controls">
                  <button
                    type="button"
                    className="number-control-btn"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      latitude: prev.latitude ? (parseFloat(prev.latitude) + 0.1).toFixed(6) : '0.1'
                    }))}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="number-control-btn"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      latitude: prev.latitude ? (parseFloat(prev.latitude) - 0.1).toFixed(6) : '-0.1'
                    }))}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Longitud *</label>
              <div className="number-input-wrapper">
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  placeholder="-6.3526"
                />
                <div className="number-controls">
                  <button
                    type="button"
                    className="number-control-btn"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      longitude: prev.longitude ? (parseFloat(prev.longitude) + 0.1).toFixed(6) : '0.1'
                    }))}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="number-control-btn"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      longitude: prev.longitude ? (parseFloat(prev.longitude) - 0.1).toFixed(6) : '-0.1'
                    }))}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={searchLocation}
              className="search-button"
            >
              Buscar coordenadas
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Año de formación</label>
              <div className="number-input-wrapper">
                <input
                  type="number"
                  name="yearFormed"
                  value={formData.yearFormed}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="2010"
                />
                <div className="number-controls">
                  <button
                    type="button"
                    className="number-control-btn"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      yearFormed: prev.yearFormed ? Math.min(parseInt(prev.yearFormed) + 1, new Date().getFullYear()).toString() : '2000'
                    }))}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="number-control-btn"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      yearFormed: prev.yearFormed ? Math.max(parseInt(prev.yearFormed) - 1, 1900).toString() : '2000'
                    }))}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Género musical</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="Rock, Metal, Punk, etc."
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Banda actualmente activa
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading
                ? (isEditMode ? 'Actualizando...' : 'Agregando...')
                : (isEditMode ? 'Actualizar Banda' : 'Agregar Banda')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBandForm;
