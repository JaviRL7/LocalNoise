import { useState, useEffect } from 'react';
import { bandService } from '../services/api';
import SpotifySearch from './SpotifySearch';
import SocialMediaModal from './SocialMediaModal';
import { Search, MapPin, Users, Share2, CheckCircle, Info } from 'lucide-react';
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
  const [missingGenre, setMissingGenre] = useState(false);
  const [createdBand, setCreatedBand] = useState(null);

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

    // Limpiar error de género cuando el usuario empieza a escribir
    if (name === 'genre' && missingGenre) {
      setMissingGenre(false);
      setError('');
    }
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
    setMissingGenre(false);
    setLoading(true);

    // Validación específica del género
    if (!formData.genre || formData.genre.trim() === '') {
      setMissingGenre(true);
      setLoading(false);
      // Scroll al campo de género
      setTimeout(() => {
        const genreInput = document.querySelector('input[name="genre"]');
        if (genreInput) {
          genreInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          genreInput.focus();
        }
      }, 100);
      return;
    }

    try {
      if (isEditMode) {
        const response = await bandService.update(band.id, formData);
        onBandUpdated(response.data);
        onClose();
      } else {
        const response = await bandService.create(formData);
        setCreatedBand(response.data);
        onBandAdded(response.data);
        // Mostrar modal de redes sociales después de crear
        setShowSocialMediaModal(true);
      }
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

  const handleSaveSocialMedia = async (socialData) => {
    if (createdBand) {
      // Actualizar la banda recién creada con las redes sociales
      try {
        await bandService.update(createdBand.id, {
          ...createdBand,
          instagramUrl: socialData.instagramUrl,
          twitterUrl: socialData.twitterUrl,
          tiktokUrl: socialData.tiktokUrl
        });
        onClose();
      } catch (err) {
        console.error('Error actualizando redes sociales:', err);
        onClose();
      }
    } else {
      setFormData(prev => ({
        ...prev,
        instagramUrl: socialData.instagramUrl,
        twitterUrl: socialData.twitterUrl,
        tiktokUrl: socialData.tiktokUrl
      }));
    }
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

          {!isEditMode && <SpotifySearch onSelectArtist={handleSpotifyArtistSelect} translations={translations.spotifySearch} />}

          {/* Nota informativa sobre búsqueda por URL */}
          {!isEditMode && (
            <div className="search-tip">
              <Info size={14} />
              <span>{translations.spotifySearch?.tip || 'Para bandas pequeñas, igual es necesario pegar la URL de Spotify'}</span>
            </div>
          )}

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

          {/* Género musical */}
          <div className={`form-group ${missingGenre ? 'field-error' : ''}`}>
            <label>{translations.genre} {missingGenre && <span className="required-indicator">*</span>}</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="Rock, Metal, Punk..."
              className={missingGenre ? 'input-error' : ''}
            />
            {missingGenre && (
              <div className="field-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Este campo es obligatorio. Spotify no siempre proporciona esta información.</span>
              </div>
            )}
          </div>

          {/* Ubicación - editable en modo edición, solo lectura en modo agregar */}
          {isEditMode ? (
            <>
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

              <div className="coordinates-search-section">
                <button
                  type="button"
                  onClick={searchLocation}
                  className="search-coords-button-edit"
                  title={translations.searchCoordinates}
                >
                  <Search size={16} />
                  <span>{translations.searchCoordinates}</span>
                </button>
                <p className="coords-help-text">
                  <Info size={18} />
                  <span>{translations.automaticSearch}</span>
                </p>
              </div>

              <div className="coordinates-row">
                <div className="form-group">
                  <label>{translations.latitude}</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                    placeholder="36.7780"
                  />
                </div>

                <div className="form-group">
                  <label>{translations.longitude}</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                    placeholder="-6.3526"
                  />
                </div>
              </div>

              <div className="map-manual-selection">
                <button
                  type="button"
                  onClick={onClose}
                  className="map-select-button"
                  title={translations.selectOnMap}
                >
                  <MapPin size={18} />
                  <span>{translations.selectOnMap}</span>
                </button>
                <p className="map-help-text">
                  <Info size={18} />
                  <span>{translations.clickMapHint}</span>
                </p>
              </div>
            </>
          ) : (
            <div className="location-info">
              <label className="location-info-label">Ubicación seleccionada en el mapa:</label>
              <div className="location-info-grid">
                <div className="location-info-item">
                  <span className="location-info-key">Ciudad:</span>
                  <span className="location-info-value">{formData.city || '-'}</span>
                </div>
                <div className="location-info-item">
                  <span className="location-info-key">País:</span>
                  <span className="location-info-value">{formData.country || '-'}</span>
                </div>
                <div className="location-info-item">
                  <span className="location-info-key">Lat:</span>
                  <span className="location-info-value">{formData.latitude || '-'}</span>
                </div>
                <div className="location-info-item">
                  <span className="location-info-key">Lon:</span>
                  <span className="location-info-value">{formData.longitude || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sección de redes sociales - solo en modo edición */}
          {isEditMode && (
            <div className="social-media-edit-section">
              <div className="social-media-header">
                <Users size={28} />
                <div>
                  <h3>{translations.socialMedia}</h3>
                  <p className="social-media-subtitle">{translations.socialMediaSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSocialMediaModal(true)}
                className="edit-social-button"
              >
                <Share2 size={18} />
                <span>{(formData.instagramUrl || formData.twitterUrl || formData.tiktokUrl) ? translations.editSocialMedia : translations.addSocialMedia}</span>
              </button>
              {(formData.instagramUrl || formData.twitterUrl || formData.tiktokUrl) && (
                <div className="social-media-added-indicator">
                  <CheckCircle size={15} />
                  <span>{translations.socialMediaConfigured}</span>
                </div>
              )}
            </div>
          )}


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
        onClose={() => {
          setShowSocialMediaModal(false);
          if (createdBand) {
            // Si ya creamos la banda, cerrar todo el formulario
            onClose();
          }
        }}
        onSave={handleSaveSocialMedia}
        initialData={{ instagramUrl: formData.instagramUrl, twitterUrl: formData.twitterUrl, tiktokUrl: formData.tiktokUrl }}
        translations={{
          title: translations.socialMediaModal?.title || '¿Agregar redes sociales?',
          description: translations.socialMediaModal?.description || 'Ayuda a otros a encontrar a esta banda en sus redes sociales. Este paso es completamente opcional.',
          descriptionPart1: translations.socialMediaModal?.descriptionPart1,
          descriptionHighlight1: translations.socialMediaModal?.descriptionHighlight1,
          descriptionPart2: translations.socialMediaModal?.descriptionPart2,
          descriptionHighlight2: translations.socialMediaModal?.descriptionHighlight2,
          descriptionPart3: translations.socialMediaModal?.descriptionPart3,
          instagram: translations.instagram || 'Instagram',
          twitter: translations.twitter || 'X / Twitter',
          tiktok: translations.tiktok || 'TikTok',
          skip: translations.socialMediaModal?.skip || 'Omitir',
          save: translations.socialMediaModal?.save || 'Guardar'
        }}
      />
    </div>
  );
}

export default AddBandForm;
