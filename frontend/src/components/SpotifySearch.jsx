import { useState } from 'react';
import { spotifyService } from '../services/api';
import '../styles/SpotifySearch.css';

function SpotifySearch({ onSelectArtist }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchQuery.trim().length < 2) {
      setError('Escribe al menos 2 caracteres');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const response = await spotifyService.searchArtists(searchQuery, 5);
      setResults(response.data.artists);

      if (response.data.artists.length === 0) {
        setError('No se encontraron artistas en Spotify');
      }
    } catch (err) {
      setError('Error al buscar en Spotify. Puedes agregar la banda manualmente.');
      console.error('Error searching Spotify:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist);
    onSelectArtist(artist);
  };

  const handleManualEntry = () => {
    setSelectedArtist(null);
    setResults([]);
    onSelectArtist(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e);
    }
  };

  return (
    <div className="spotify-search">
      <div className="spotify-search-header">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#1DB954">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        <h3>Buscar en Spotify</h3>
      </div>
      <div className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Buscar banda en Spotify..."
            className="search-input"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || searchQuery.trim().length < 2}
            className="search-button-spotify"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="spotify-info">
          {error}
        </div>
      )}

      {selectedArtist && (
        <div className="selected-artist">
          <div className="selected-artist-header">
            <img
              src={selectedArtist.imageUrl || '/placeholder-artist.png'}
              alt={selectedArtist.name}
              className="selected-artist-image"
            />
            <div className="selected-artist-info">
              <h4>{selectedArtist.name}</h4>
              <p className="verified-badge">✓ Verificado con Spotify</p>
              {selectedArtist.genres && selectedArtist.genres.length > 0 && (
                <p className="artist-genres">{selectedArtist.genres.slice(0, 3).join(', ')}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleManualEntry}
              className="change-selection-btn"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {!selectedArtist && results.length > 0 && (
        <div className="search-results">
          <p className="results-header">Selecciona una banda:</p>
          {results.map((artist) => (
            <div
              key={artist.id}
              className="result-item"
              onClick={() => handleSelectArtist(artist)}
            >
              <img
                src={artist.imageUrl || '/placeholder-artist.png'}
                alt={artist.name}
                className="result-image"
              />
              <div className="result-info">
                <h4>{artist.name}</h4>
                {artist.genres && artist.genres.length > 0 && (
                  <p className="result-genres">{artist.genres.slice(0, 2).join(', ')}</p>
                )}
                <p className="result-followers">
                  {artist.followers ? `${(artist.followers / 1000).toFixed(0)}k seguidores` : ''}
                </p>
              </div>
            </div>
          ))}
          <div className="manual-entry-option">
            <button
              type="button"
              onClick={handleManualEntry}
              className="manual-entry-btn"
            >
              No está en la lista - Agregar manualmente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpotifySearch;
