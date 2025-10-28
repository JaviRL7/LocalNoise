import { useState, useEffect, useRef } from 'react';
import { deezerService } from '../services/api';
import '../styles/BandPopup.css';
import '../styles/PopupClose.css';

function BandPopup({ band, user, onEdit, onDelete }) {
  const [tracks, setTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState({});
  const audioRefs = useRef({});

  // Check if current user owns this band
  const isOwner = user && band.addedBy === user.id;

  useEffect(() => {
    loadTracksFromDeezer();
  }, [band.name]);

  const loadTracksFromDeezer = async () => {
    setLoadingTracks(true);
    try {
      // Buscar tracks en Deezer por nombre de banda
      const response = await deezerService.searchTracks(band.name, 5);
      const tracksData = response.data.tracks || [];
      setTracks(tracksData);

      // Reproducir automáticamente la primera canción después de un breve delay
      if (tracksData.length > 0) {
        setTimeout(() => {
          playTrack(tracksData[0].id);
        }, 500);
      }
    } catch (error) {
      console.error('Error loading tracks from Deezer:', error);
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
            {band.isVerified && <span className="verified">Verificado</span>}
          </div>
        </div>
      </div>

      {/* Reproductor pequeño abajo */}
      <div className="player-section">
        {loadingTracks && <p className="loading">Cargando...</p>}

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
          <p className="no-tracks">No hay canciones disponibles</p>
        )}
      </div>

      {/* Edit/Delete buttons for owner */}
      {isOwner && (
        <div className="band-actions">
          <button onClick={() => onEdit(band)} className="action-button edit-button" title="Editar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button onClick={() => onDelete(band.id)} className="action-button delete-button" title="Eliminar">
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
            Abrir en Spotify
          </a>
        )}
        {band.youtubeUrl && (
          <a href={band.youtubeUrl} target="_blank" rel="noopener noreferrer" className="popup-link youtube-link">
            YouTube
          </a>
        )}
        {band.website && (
          <a href={band.website} target="_blank" rel="noopener noreferrer" className="popup-link website-link">
            Web
          </a>
        )}
      </div>

      {/* Contributor info at the bottom */}
      {band.contributor && (
        <p className="popup-contributor">
          Agregada por <strong>{band.contributor.username}</strong>
        </p>
      )}
    </div>
  );
}

export default BandPopup;
