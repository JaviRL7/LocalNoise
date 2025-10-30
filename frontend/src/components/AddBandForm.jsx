import { useState, useEffect } from 'react';
import { bandService } from '../services/api';
import SpotifySearch from './SpotifySearch';
import SocialMediaModal from './SocialMediaModal';
import '../styles/AddBandForm.css';

function AddBandForm({ band, initialCoordinates, onBandAdded, onBandUpdated, onClose, translations }) {
  const isEditMode = !!band;

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
    genre: '',
    // yearFormed: '',
    spotifyUrl: '',
    spotifyId: '',
    spotifyImageUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    tiktokUrl: '',
    isVerified: false,
    isActive: true
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSpotifyArtist, setSelectedSpotifyArtist] = useState(null);
  const [showSocialMediaModal, setShowSocialMediaModal] = useState(false);

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
        // yearFormed: band.yearFormed || '',
        spotifyUrl: band.spotifyUrl || '',
        spotifyId: band.spotifyId || '',
        spotifyImageUrl: band.spotifyImageUrl || '',
        instagramUrl: band.instagramUrl || '',
        twitterUrl: band.twitterUrl || '',
        tiktokUrl: band.tiktokUrl || '',
        isVerified: band.isVerified || false,
        isActive: band.isActive !== undefined ? band.isActive : true
      });
    }
  }, [band]);

  // Pre-fill form with coordinates from map click
  useEffect(() => {
    if (initialCoordinates && !band) {
      setFormData(prev => ({
        ...prev,
        latitude: initialCoordinates.latitude || '',
        longitude: initialCoordinates.longitude || '',
        city: initialCoordinates.city || '',
        country: initialCoordinates.country || ''
      }));
    }
  }, [initialCoordinates, band]);

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
        genre: artist.genres && artist.genres.length > 0 ? artist.genres.join(', ') : '',
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
      setError(translations.errors.cityCountryRequired);
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
        setError(translations.errors.locationNotFound);
      }
    } catch (err) {
      setError(translations.errors.searchError);
    }
  };

  const handleSaveSocialMedia = (socialData) => {
    setFormData(prev => ({
      ...prev,
      instagramUrl: socialData.instagramUrl,
      twitterUrl: socialData.twitterUrl,
      tiktokUrl: socialData.tiktokUrl
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditMode ? translations.editTitle : translations.addTitle}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="add-band-form">
          {error && <div className="error-message">{error}</div>}

          {!isEditMode && <SpotifySearch onSelectArtist={handleSpotifyArtistSelect} />}

          {/* Nombre de banda - oculto solo si viene de Spotify en modo click-to-add */}
          {!(initialCoordinates && !isEditMode && selectedSpotifyArtist) && (
            <div className="form-group">
              <label>{translations.bandName}</label>
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
          )}
          {initialCoordinates && !isEditMode && selectedSpotifyArtist && (
            <input type="hidden" name="name" value={formData.name} />
          )}

          {/* Ubicación y coordenadas */}
          <div className="form-row">
            <div className="form-group">
              <label>{translations.city}</label>
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
              <label>{translations.country}</label>
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
              <label>{translations.latitude}</label>
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
              <label>{translations.longitude}</label>
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
              {translations.searchCoordinates}
            </button>
          </div>

          {/* Campos opcionales - siempre visibles */}
          <div className="form-row">
            <div className="form-group">
              <label>{translations.genre}</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="Rock, Metal, Punk, etc."
              />
            </div>
          </div>

          {/* Botón para agregar redes sociales (opcional) */}
          <div className="social-media-section">
            <button
              type="button"
              onClick={() => setShowSocialMediaModal(true)}
              className="add-social-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
              {translations.addSocialMedia || 'Agregar redes sociales (opcional)'}
            </button>
            {(formData.instagramUrl || formData.twitterUrl || formData.tiktokUrl) && (
              <div className="social-media-added">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>{translations.socialMediaAdded || 'Redes sociales agregadas'}</span>
              </div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              {translations.isActive}
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              {translations.cancel}
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading
                ? (isEditMode ? translations.updating : translations.adding)
                : (isEditMode ? translations.updateButton : translations.addButton)
              }
            </button>
          </div>
        </form>
      </div>

      {/* Modal de redes sociales */}
      <SocialMediaModal
        isOpen={showSocialMediaModal}
        onClose={() => setShowSocialMediaModal(false)}
        onSave={handleSaveSocialMedia}
        initialData={{ instagramUrl: formData.instagramUrl, twitterUrl: formData.twitterUrl, tiktokUrl: formData.tiktokUrl }}
        translations={{
          title: translations.socialMediaModal?.title || '¿Agregar redes sociales?',
          description: translations.socialMediaModal?.description || 'Ayuda a otros a encontrar a esta banda en sus redes sociales. Este paso es completamente opcional.',
          instagram: translations.instagram || 'Instagram',
          twitter: translations.twitter || 'X / Twitter',
          tiktok: translations.tiktok || 'TikTok',
          twitter: translations.twitter || 'X / Twitter',
          skip: translations.socialMediaModal?.skip || 'Omitir',
          save: translations.socialMediaModal?.save || 'Guardar'
        }}
      />
    </div>
  );
}

export default AddBandForm;
