import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

function Map({ bands, onBandClick, onMapClick, selectedBand, darkMode, user, onAddBandClick, onShowAuth, onEditBand, onDeleteBand }) {
  const [position] = useState([28.0, 0.0]); // Centro inicial del mapa

  const handleAddClick = () => {
    if (!user) {
      onShowAuth();
    } else {
      onAddBandClick();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={position}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        onClick={onMapClick}
      >
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
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Add Band Button */}
      <button onClick={handleAddClick} className="map-add-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
        <span>Agregar Banda</span>
      </button>
    </div>
  );
}

export default Map;
