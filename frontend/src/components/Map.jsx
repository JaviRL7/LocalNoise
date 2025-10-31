import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BandPopup from './BandPopup';

// Fix para los iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icono personalizado para bandas - Pin verde limpio
const svgIcon = `<svg width="32" height="44" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 0C9.373 0 4 5.373 4 12c0 8 12 24 12 24s12-16 12-24c0-6.627-5.373-12-12-12z" fill="#1DB954" stroke="#1aa34a" stroke-width="1.5"/>
  <circle cx="16" cy="12" r="5" fill="white"/>
</svg>`;

const bandIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgIcon),
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

// Componente para capturar clicks en el mapa
function MapClickHandler({ onMapClick, user, onShowAuth, clickToAddMode, onToggleClickToAdd }) {
  useMapEvents({
    click: (e) => {
      if (!clickToAddMode) return;

      if (!user) {
        onShowAuth();
        return;
      }
      // Llamar al handler con las coordenadas del click
      onMapClick(e.latlng);
    },
    contextmenu: (e) => {
      // Cancelar con click derecho
      if (clickToAddMode) {
        e.originalEvent.preventDefault();
        onToggleClickToAdd();
      }
    }
  });
  return null;
}

function Map({ bands, onBandClick, onMapClick, selectedBand, darkMode, user, onAddBandClick, onShowAuth, onEditBand, onDeleteBand, translations, bandPopupTranslations, clickToAddMode, onToggleClickToAdd }) {
  const [position] = useState([28.0, 0.0]); // Centro inicial del mapa
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Track cursor position for custom cursor
  useEffect(() => {
    if (!clickToAddMode) return;

    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [clickToAddMode]);

  const handleAddClick = () => {
    if (!user) {
      onShowAuth();
    } else {
      onAddBandClick();
    }
  };

  const handleClickToAddToggle = () => {
    if (!user) {
      onShowAuth();
    } else {
      onToggleClickToAdd();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Overlay oscuro cuando está en modo agregar banda */}
      {clickToAddMode && (
        <div className="map-overlay-dark" />
      )}

      {/* Custom cursor for add band mode */}
      {clickToAddMode && (
        <div
          className="custom-map-cursor"
          style={{
            position: 'fixed',
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
            pointerEvents: 'none',
            zIndex: 9999,
            transform: 'translate(-50%, -100%)',
            transition: 'transform 0.1s ease'
          }}
        >
          <svg width="32" height="44" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C9.373 0 4 5.373 4 12c0 8 12 24 12 24s12-16 12-24c0-6.627-5.373-12-12-12z" fill="#1DB954" stroke="#1aa34a" strokeWidth="1.5" opacity="0.9"/>
            <circle cx="16" cy="12" r="5" fill="white"/>
            <path d="M16 9v6M13 12h6" stroke="#1DB954" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      )}

      <MapContainer
        center={position}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        style={{
          height: '100%',
          width: '100%',
          cursor: clickToAddMode ? 'none' : 'grab'
        }}
      >
        <MapClickHandler
          onMapClick={onMapClick}
          user={user}
          onShowAuth={onShowAuth}
          clickToAddMode={clickToAddMode}
          onToggleClickToAdd={onToggleClickToAdd}
        />
        <TileLayer
          key={darkMode ? 'dark' : 'light'}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={darkMode
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
          subdomains='abcd'
          maxZoom={20}
        />

        {bands && bands.map((band) => (
          <Marker
            key={band.id}
            position={[band.latitude, band.longitude]}
            icon={bandIcon}
            eventHandlers={{
              click: () => onBandClick(band)
            }}
          >
            <Popup maxWidth={420} minWidth={320}>
              <BandPopup
                band={band}
                user={user}
                onEdit={onEditBand}
                onDelete={onDeleteBand}
                translations={bandPopupTranslations}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Add Band Button */}
      <div className="map-buttons-container">
        <button
          onClick={handleClickToAddToggle}
          className={`map-add-button ${clickToAddMode ? 'active' : ''}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>{clickToAddMode ? translations.cancelButton : translations.addBandButton}</span>
        </button>
      </div>
    </div>
  );
}

export default Map;
