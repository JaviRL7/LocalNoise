import { useState, useEffect, useRef } from 'react';
import { deezerService } from '../services/api';
import '../styles/BandPopup.css';
import '../styles/PopupClose.css';

function BandPopup({ band, user, onEdit, onDelete, translations }) {
  const [tracks, setTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState({});
  const audioRefs = useRef({});

  // Check if current user owns this band
  const isOwner = user && band.addedBy === user.id;

  useEffect(() => {
    loadTracksFromDeezer();
  }, [band.name, band.spotifyId]);

  const loadTracksFromDeezer = async () => {
    setLoadingTracks(true);
    try {
      // Usar sistema híbrido optimizado
      const response = await deezerService.getHybridTracks(
        band.name,
        band.spotifyId || null,
        5
      );

      const tracksData = response.data.tracks || [];
      setTracks(tracksData);

      // Log del método usado para debugging
      if (response.data.method) {
        console.log(`🎵 Método usado: ${response.data.method} (${tracksData.length} tracks)`);
      }

      // Reproducir automáticamente la primera canción después de un breve delay
      if (tracksData.length > 0) {
        setTimeout(() => {
          playTrack(tracksData[0].id);
        }, 500);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
      setTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  };

  const playTrack = (trackId) => {
    // Pausar todos los audios
    Object.keys(audioRefs.current).forEach(id => {
      if (audioRefs.current[id] && id !== trackId) {
        audioRefs.current[id].pause();
        audioRefs.current[id].currentTime = 0;
      }
    });

    // Reproducir el audio seleccionado
    if (audioRefs.current[trackId]) {
      audioRefs.current[trackId].play().catch(err => {
        console.error('Error playing audio:', err);
      });
      setCurrentlyPlaying(trackId);
      setIsPlaying(prev => ({ ...prev, [trackId]: true }));
    }
  };

  const pauseTrack = (trackId) => {
    if (audioRefs.current[trackId]) {
      audioRefs.current[trackId].pause();
      setIsPlaying(prev => ({ ...prev, [trackId]: false }));
    }
  };

  const togglePlayPause = (trackId) => {
    if (isPlaying[trackId]) {
      pauseTrack(trackId);
    } else {
      playTrack(trackId);
    }
  };

  const handleAudioPlay = (trackId) => {
    setCurrentlyPlaying(trackId);
    setIsPlaying(prev => ({ ...prev, [trackId]: true }));
  };

  const handleAudioPause = (trackId) => {
    setIsPlaying(prev => ({ ...prev, [trackId]: false }));
  };

  const handleAudioEnded = (trackId) => {
    setIsPlaying(prev => ({ ...prev, [trackId]: false }));
    // Reproducir la siguiente canción si existe
    const currentIndex = tracks.findIndex(t => t.id === trackId);
    if (currentIndex < tracks.length - 1) {
      playTrack(tracks[currentIndex + 1].id);
    }
  };

  return (
    <div className="band-popup">
      {/* Imagen cuadrada de fondo estilo Spotify */}
      <div
        className="spotify-header"
        style={{
          backgroundImage: band.spotifyImageUrl
            ? `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${band.spotifyImageUrl})`
            : 'linear-gradient(135deg, #1DB954 0%, #191414 100%)'
        }}
      >
        <div className="header-overlay">
          <h2 className="band-name">{band.name}</h2>
          <div className="band-meta">
            <span className="location">{band.city}, {band.country}</span>
            {band.genre && <span className="genre">{band.genre}</span>}
            {band.isVerified && <span className="verified">{translations.verified}</span>}
          </div>
        </div>
      </div>

      {/* Reproductor pequeño abajo */}
      <div className="player-section">
        {loadingTracks && <p className="loading">{translations.loading}</p>}

        {!loadingTracks && tracks.length > 0 && (
          <div className="mini-player">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`track-row ${currentlyPlaying === track.id ? 'active' : ''}`}
                onClick={() => !isPlaying[track.id] ? playTrack(track.id) : pauseTrack(track.id)}
              >
                <div className="track-number-col">{index + 1}</div>
                <div className="track-info-col">
                  <div className="track-title-mini">{track.title}</div>
                </div>
                <div className="track-play-col">
                  {isPlaying[track.id] ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </div>
                <audio
                  ref={el => audioRefs.current[track.id] = el}
                  className="track-audio-hidden"
                  onPlay={() => handleAudioPlay(track.id)}
                  onPause={() => handleAudioPause(track.id)}
                  onEnded={() => handleAudioEnded(track.id)}
                >
                  <source src={track.preview} type="audio/mpeg" />
                </audio>
              </div>
            ))}
          </div>
        )}

        {!loadingTracks && tracks.length === 0 && (
          <p className="no-tracks">
            {translations.noTracksAvailable || 'No hay previews disponibles en Deezer'}
            {band.spotifyUrl && (
              <span className="no-tracks-hint">
                {translations.trySpotify || ' Escúchala en Spotify ↓'}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Edit/Delete buttons for owner */}
      {isOwner && (
        <div className="band-actions">
          <button onClick={() => onEdit(band)} className="action-button edit-button" title={translations.edit}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button onClick={() => onDelete(band.id)} className="action-button delete-button" title={translations.delete}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Enlaces */}
      <div className="popup-links">
        {band.spotifyUrl && (
          <a href={band.spotifyUrl} target="_blank" rel="noopener noreferrer" className="popup-link spotify-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            {translations.openSpotify}
          </a>
        )}
        {band.instagramUrl && (
          <a href={band.instagramUrl} target="_blank" rel="noopener noreferrer" className="popup-link instagram-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram
          </a>
        )}
        {band.twitterUrl && (
          <a href={band.twitterUrl} target="_blank" rel="noopener noreferrer" className="popup-link twitter-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </a>
        )}
        {band.youtubeUrl && (
          <a href={band.youtubeUrl} target="_blank" rel="noopener noreferrer" className="popup-link youtube-link">
            {translations.youtube}
          </a>
        )}
        {band.website && (
          <a href={band.website} target="_blank" rel="noopener noreferrer" className="popup-link website-link">
            {translations.website}
          </a>
        )}
      </div>

      {/* Contributor info at the bottom */}
      {band.contributor && (
        <p className="popup-contributor">
          {translations.addedBy} <strong>{band.contributor.username}</strong>
        </p>
      )}
    </div>
  );
}

export default BandPopup;
