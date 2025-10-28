# 🎵 Integración de Spotify API - Guía Completa

## 📋 Índice
1. [Obtener credenciales de Spotify](#obtener-credenciales)
2. [Configuración del Backend](#configuración-backend)
3. [Cómo funciona](#cómo-funciona)
4. [API Endpoints](#api-endpoints)
5. [Frontend - Uso](#frontend)
6. [Alternativas a Spotify](#alternativas)
7. [Límites y buenas prácticas](#límites)

---

## 🔑 Obtener credenciales de Spotify {#obtener-credenciales}

### Paso 1: Crear una cuenta de desarrollador

1. Ve a [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Inicia sesión con tu cuenta de Spotify (o crea una gratis)
3. Acepta los términos de servicio

### Paso 2: Crear una aplicación

1. Click en **"Create app"**
2. Rellena los campos:
   - **App name**: `Local Bands Map` (o el nombre que quieras)
   - **App description**: `Mapa mundial de bandas locales con previews de Spotify`
   - **Redirect URIs**: `http://localhost:5173` (para desarrollo local)
   - **APIs used**: Marca **Web API**
3. Acepta los términos y click en **"Save"**

### Paso 3: Obtener las credenciales

1. En el dashboard de tu app, click en **"Settings"**
2. Copia el **Client ID**
3. Click en **"View client secret"** y copia el **Client Secret**

⚠️ **IMPORTANTE**: Nunca compartas tu Client Secret públicamente ni lo subas a Git.

---

## ⚙️ Configuración del Backend {#configuración-backend}

### 1. Actualizar variables de entorno

Edita el archivo `backend/.env`:

```env
# Spotify API
SPOTIFY_CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
```

### 2. Reiniciar el servidor

```bash
cd backend
npm run dev
```

El servidor obtendrá automáticamente un token de acceso cuando se necesite.

---

## 🔄 Cómo funciona {#cómo-funciona}

### Autenticación: Client Credentials Flow

El backend usa **Client Credentials Flow** de Spotify:

1. **Backend** solicita un token a Spotify usando Client ID + Client Secret
2. Spotify devuelve un **access token** válido por 1 hora
3. El token se **cachea** en memoria
4. Cuando expira, se solicita uno nuevo automáticamente

```javascript
// backend/src/services/spotifyService.js
async getAccessToken() {
  if (this.accessToken && Date.now() < this.tokenExpiresAt) {
    return this.accessToken; // Token en caché
  }

  // Solicitar nuevo token
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    { headers: { 'Authorization': `Basic ${credentials}` } }
  );

  this.accessToken = response.data.access_token;
  this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;

  return this.accessToken;
}
```

### Flujo completo de búsqueda

```
Usuario escribe "Metallica" → Frontend llama a /api/spotify/search
                                        ↓
                    Backend obtiene token (si no existe o expiró)
                                        ↓
                    Backend llama a Spotify API con el token
                                        ↓
                    Spotify devuelve resultados de artistas
                                        ↓
                    Backend formatea y filtra los datos
                                        ↓
                    Frontend muestra resultados con imágenes
                                        ↓
            Usuario selecciona → Datos se auto-rellenan en formulario
                                        ↓
                    Se guarda en DB con spotifyId, isVerified=true
```

---

## 🛠️ API Endpoints {#api-endpoints}

### 1. Buscar artistas

```http
GET /api/spotify/search?q=metallica&limit=10
```

**Respuesta:**
```json
{
  "query": "metallica",
  "total": 10,
  "artists": [
    {
      "id": "2ye2Wgw4gimLv2eAKyk1NB",
      "name": "Metallica",
      "genres": ["metal", "rock", "thrash metal"],
      "popularity": 82,
      "followers": 23456789,
      "imageUrl": "https://i.scdn.co/image/...",
      "spotifyUrl": "https://open.spotify.com/artist/2ye2Wgw4gimLv2eAKyk1NB"
    }
  ]
}
```

### 2. Obtener top tracks de un artista

```http
GET /api/spotify/artists/{artistId}/top-tracks?market=US
```

**Respuesta:**
```json
{
  "artistId": "2ye2Wgw4gimLv2eAKyk1NB",
  "total": 10,
  "tracks": [
    {
      "id": "0VgkVdmE4gld66l8iyGjgx",
      "name": "Enter Sandman",
      "previewUrl": "https://p.scdn.co/mp3-preview/...",
      "albumName": "Metallica",
      "albumImage": "https://i.scdn.co/image/...",
      "duration": 331000,
      "spotifyUrl": "https://open.spotify.com/track/...",
      "popularity": 86
    }
  ]
}
```

### 3. Obtener información de un artista

```http
GET /api/spotify/artists/{artistId}
```

---

## 🎨 Frontend - Uso {#frontend}

### Componente SpotifySearch

```jsx
import SpotifySearch from './components/SpotifySearch';

<SpotifySearch
  onSelectArtist={(artist) => {
    // artist contiene: id, name, genres, imageUrl, spotifyUrl
    console.log('Artista seleccionado:', artist);
  }}
/>
```

### Reproductor en el popup del mapa

El componente `BandPopup` automáticamente:

1. Detecta si la banda tiene `spotifyId`
2. Obtiene las top 3 canciones del artista
3. Filtra solo las que tienen `preview_url` (fragmentos de 30 segundos)
4. Muestra reproductores de audio HTML5

```jsx
<audio controls>
  <source src={track.previewUrl} type="audio/mpeg" />
</audio>
```

### Diferenciar bandas verificadas vs manuales

```jsx
{band.isVerified && (
  <span className="verified-badge">✓ Verificado con Spotify</span>
)}
```

---

## 🔀 Alternativas a Spotify {#alternativas}

### 1. **Last.fm API**

**Ventajas:**
- Datos de millones de artistas
- Información de biografía, tags, artistas similares
- API gratuita con límite generoso

**Limitaciones:**
- No tiene previews de audio
- Requiere API key (gratuita)

**Uso:**
```javascript
// Buscar artista
GET http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=metallica&api_key=YOUR_KEY&format=json

// Obtener info del artista
GET http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=metallica&api_key=YOUR_KEY&format=json
```

### 2. **MusicBrainz API**

**Ventajas:**
- Base de datos abierta y colaborativa
- Datos muy completos (discografía, miembros, fechas)
- Totalmente gratuita, sin API key

**Limitaciones:**
- No tiene previews de audio
- No tiene información de popularidad

**Uso:**
```javascript
// Buscar artista
GET https://musicbrainz.org/ws/2/artist/?query=metallica&fmt=json

// Incluye rate limit: máximo 1 req/segundo
```

### 3. **Deezer API**

**Ventajas:**
- Tiene previews de 30 segundos
- API gratuita sin autenticación para búsquedas
- Buena cobertura internacional

**Limitaciones:**
- Menor catálogo que Spotify
- Menos popular en algunos países

**Uso:**
```javascript
// Buscar artista
GET https://api.deezer.com/search/artist?q=metallica

// Obtener top tracks
GET https://api.deezer.com/artist/{id}/top?limit=10
```

### 4. **Bandsintown API**

**Ventajas:**
- Especializada en música en vivo y bandas locales
- Información de conciertos y tours
- Gratuita con registro

**Limitaciones:**
- No tiene previews de audio
- Enfocada más en eventos que en discografía

---

## ⚡ Límites y Buenas Prácticas {#límites}

### Límites de Spotify Web API

| Tipo de límite | Valor |
|----------------|-------|
| Rate limit | Varía (generalmente ~180 req/min) |
| Token expiration | 1 hora |
| Búsquedas simultáneas | Sin límite específico documentado |

### Buenas prácticas implementadas

#### 1. **Cacheo de tokens**
```javascript
// El token se guarda en memoria y solo se renueva cuando expira
if (this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
  return this.accessToken; // Usar token en caché
}
```

#### 2. **Evitar llamadas innecesarias**
- Solo se buscan top tracks cuando el usuario hace click en un marcador
- Los resultados de búsqueda se limitan a 5-10 artistas
- Las top tracks se limitan a 3 canciones

#### 3. **Manejo de errores**
```javascript
try {
  const artists = await spotifyService.searchArtists(query);
} catch (error) {
  // Permitir entrada manual si Spotify falla
  setError('Error al buscar en Spotify. Puedes agregar la banda manualmente.');
}
```

#### 4. **Fallback a entrada manual**
- Si Spotify no encuentra resultados → Opción de agregar manualmente
- Si no hay credenciales configuradas → Formulario manual funciona igual
- Si falla la API → Usuario puede continuar sin Spotify

### Recomendaciones adicionales

1. **Para producción**: Implementa rate limiting en tu backend
```javascript
const rateLimit = require('express-rate-limit');

const spotifyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30 // máximo 30 requests por minuto
});

app.use('/api/spotify', spotifyLimiter);
```

2. **Cacheo de resultados en base de datos**:
   - Guardar los top tracks en la tabla Bands
   - Evitar llamadas repetidas a Spotify para la misma banda

3. **Monitoreo**:
   - Registrar errores 429 (Rate Limit Exceeded)
   - Implementar reintentos con exponential backoff

---

## 🎯 Resumen

✅ **Qué hemos implementado:**
- Búsqueda automática de bandas en Spotify
- Auto-rellenado de formularios con datos verificados
- Reproductor de previews de 30 segundos
- Fallback a entrada manual
- Cacheo de tokens y optimización de llamadas

✅ **Qué puedes hacer ahora:**
1. Buscar cualquier banda en Spotify
2. Ver sus datos auto-completados
3. Escuchar previews de sus canciones más populares
4. Distinguir bandas verificadas de las manuales
5. Seguir agregando bandas manualmente si Spotify no las tiene

---

## 📚 Referencias

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [Client Credentials Flow](https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/)
- [Last.fm API](https://www.last.fm/api)
- [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API)
- [Deezer API](https://developers.deezer.com/api)

---

¿Necesitas ayuda? Revisa los logs del servidor o abre un issue en el repositorio.
