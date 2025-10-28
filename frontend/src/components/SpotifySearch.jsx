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
            {searching ? 'Buscando...' : 'Buscar en Spotify'}
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
