# 📹 Configuración de YouTube API (OPCIONAL)

## ¿Por qué YouTube?

Spotify con Client Credentials Flow **NO proporciona previews de audio** para la mayoría de las canciones. Por eso hemos integrado YouTube como alternativa, que funciona con el 99% de las bandas.

## ✅ Lo que YA funciona SIN YouTube API:

- ✅ Búsqueda de bandas en Spotify
- ✅ Auto-completado de datos
- ✅ Badge de "Verificado"
- ✅ Botón "Abrir en Spotify" (funcional y bonito)
- ✅ Imagen de la banda

## 🎵 Lo que añade YouTube API:

- 📹 Reproductor de video oficial en el popup
- 🎬 Video más popular de cada banda
- 🔥 Funciona con casi todas las bandas (incluso locales)

---

## 🔑 Cómo obtener YouTube API Key (5 minutos - GRATIS)

### Paso 1: Ir a Google Cloud Console

Ve a: https://console.cloud.google.com/

### Paso 2: Crear un proyecto (si no tienes uno)

1. Click en el desplegable de proyectos (arriba a la izquierda)
2. Click en **"Nuevo proyecto"**
3. Nombre: `Local Bands Map`
4. Click en **"Crear"**

### Paso 3: Habilitar YouTube Data API v3

1. En el menú lateral, ve a **"APIs y servicios" → "Biblioteca"**
2. Busca: `YouTube Data API v3`
3. Click en el resultado
4. Click en **"HABILITAR"**

### Paso 4: Crear credenciales (API Key)

1. Ve a **"APIs y servicios" → "Credenciales"**
2. Click en **"+ CREAR CREDENCIALES"**
3. Selecciona **"Clave de API"**
4. Se creará tu API key
5. **COPIA la clave** (algo como: `AIzaSyC-DpXXXXXXXXXXXXXXX`)

### Paso 5: (Opcional pero recomendado) Restringir la API key

1. Click en **"Editar clave de API"**
2. En **"Restricciones de la API"**:
   - Selecciona **"Restringir clave"**
   - Marca solo: **YouTube Data API v3**
3. Click en **"Guardar"**

### Paso 6: Agregar al proyecto

Edita `backend/.env`:

```env
YOUTUBE_API_KEY=AIzaSyC-TU_CLAVE_AQUI
```

### Paso 7: Reiniciar backend

```bash
cd backend
npm run dev
```

---

## 📊 Límites de uso (Cuota gratuita)

YouTube Data API v3 usa un sistema de "unidades":
- **Cuota diaria**: 10,000 unidades (gratis)
- **Búsqueda**: 100 unidades por petición
- **Capacidad**: ~100 búsquedas por día

Para tu uso (mapa de bandas locales), es **MÁS que suficiente**.

### ¿Qué pasa si se acaba la cuota?

- No se rompe la app
- Solo no se muestran videos ese día
- El botón de Spotify sigue funcionando
- Al día siguiente se resetea automáticamente

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**: La API key de YouTube es segura para usar en backend (nunca en frontend público).

En este proyecto:
- ✅ La API key está en `.env` (backend)
- ✅ No se expone al cliente
- ✅ No está en Git (`.gitignore`)

---

## 🧪 Probar que funciona

Una vez que hayas agregado la API key:

1. Abre http://localhost:5173
2. Busca una banda (ej: "Arctic Monkeys")
3. Agrégala al mapa
4. Haz click en el marcador
5. **Deberías ver un video de YouTube reproduciéndose** 📹

---

## ❓ Solución de problemas

### No aparece el video

**Verifica** el backend:
```bash
curl "http://localhost:5000/api/youtube/search?bandName=Metallica"
```

**Debería retornar** un JSON con videos. Si retorna `{"videos":[]}`:
- Verifica que la API key esté en `.env`
- Verifica que reiniciaste el backend
- Verifica que habilitaste YouTube Data API v3

### Error 403 (Forbidden)

- La API key es incorrecta
- No has habilitado YouTube Data API v3
- La API key está restringida incorrectamente

### Error 429 (Quota Exceeded)

- Alcanzaste el límite diario (10,000 unidades)
- Espera hasta mañana
- La app sigue funcionando sin videos

---

## 🎯 Resumen

| Funcionalidad | Sin YouTube API | Con YouTube API |
|---------------|-----------------|-----------------|
| Búsqueda Spotify | ✅ | ✅ |
| Datos verificados | ✅ | ✅ |
| Botón de Spotify | ✅ | ✅ |
| **Video reproductor** | ❌ | ✅ |
| **Funciona con bandas locales** | ❌ | ✅ |

---

## 💡 Alternativa: Usar sin YouTube

Si no quieres configurar YouTube:

1. **Deja el .env sin YouTube API key** (ya está así por defecto)
2. El popup mostrará:
   - ✅ Información de la banda
   - ✅ Botón grande de "Abrir en Spotify"
   - ✅ Enlaces a redes sociales
   - ❌ Sin video de YouTube

**La app funciona perfectamente sin YouTube**, solo es un extra.

---

¿Prefieres configurar YouTube ahora o dejarlo para después?
