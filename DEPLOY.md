# 🚀 Guía de Deploy en Render

## Paso 1: Crear cuenta en Render

1. Ve a [https://render.com](https://render.com)
2. Haz click en "Get Started" o "Sign Up"
3. Regístrate con tu cuenta de GitHub (recomendado) o email
4. Verifica tu email si es necesario

## Paso 2: Conectar el repositorio

1. En el dashboard de Render, haz click en "New +"
2. Selecciona "Blueprint"
3. Conecta tu cuenta de GitHub si aún no lo has hecho
4. Busca y selecciona el repositorio `LocalNoise`
5. Render detectará automáticamente el archivo `backend/render.yaml`

## Paso 3: Configurar variables de entorno secretas

Antes de hacer el deploy, necesitas configurar las siguientes variables de entorno en Render:

### 🔑 Variables obligatorias:

1. **SPOTIFY_CLIENT_ID** y **SPOTIFY_CLIENT_SECRET**
   - Ve a [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
   - Crea una nueva aplicación
   - Copia el Client ID y Client Secret
   - En "Redirect URIs" añade: `https://tu-app-backend.onrender.com/auth/google/callback`

2. **DEEZER_APP_ID** y **DEEZER_SECRET_KEY**
   - Ve a [https://developers.deezer.com/myapps](https://developers.deezer.com/myapps)
   - Crea una nueva aplicación
   - Copia el Application ID y Secret Key

3. **GOOGLE_CLIENT_ID** y **GOOGLE_CLIENT_SECRET**
   - Ve a [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
   - Crea un nuevo proyecto (si no tienes uno)
   - Ve a "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
   - Tipo: Web application
   - Authorized redirect URIs: `https://tu-app-backend.onrender.com/auth/google/callback`
   - Copia el Client ID y Client Secret

### ⚙️ Cómo añadir las variables en Render:

1. Una vez creado el servicio, ve a "Environment"
2. En "Environment Variables", haz click en "Add Environment Variable"
3. Añade cada una de las variables secretas mencionadas arriba
4. Las demás variables (DATABASE_URL, JWT_SECRET, etc.) se configuran automáticamente

## Paso 4: Deploy del Frontend

1. En Render, haz click en "New +" > "Static Site"
2. Conecta el mismo repositorio `LocalNoise`
3. Configura:
   - **Name**: `localnoise-frontend` (o el que prefieras)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Variables de entorno del frontend:
   - **VITE_API_URL**: `https://tu-app-backend.onrender.com` (URL de tu backend)

5. Haz click en "Create Static Site"

## Paso 5: Actualizar URLs de callback

Una vez que tengas las URLs finales de Render:

1. **Backend URL**: `https://localnoise-backend.onrender.com`
2. **Frontend URL**: `https://localnoise-frontend.onrender.com`

Actualiza las URLs de callback en:
- Spotify Developer Dashboard
- Google Cloud Console
- Deezer Developer Portal

Y actualiza la variable `FRONTEND_URL` en el backend de Render.

## Paso 6: Verificar el deploy

1. Espera a que ambos servicios terminen de deployar (5-10 minutos la primera vez)
2. Ve a la URL del frontend
3. Prueba:
   - Registro/Login
   - Login con Google
   - Añadir una banda
   - Buscar en Spotify
   - Reproducir previews

## 🔧 Troubleshooting

### Error de CORS
- Verifica que `FRONTEND_URL` en el backend esté correctamente configurada
- Debe ser la URL exacta del frontend sin `/` al final

### Error de base de datos
- Render crea automáticamente la base de datos PostgreSQL
- Las tablas se crean automáticamente al iniciar el backend por primera vez

### Error 503 en el backend
- El tier gratuito de Render "duerme" después de 15 minutos de inactividad
- La primera petición puede tardar 30-60 segundos en "despertar"

### Previews de Spotify/Deezer no funcionan
- Verifica que las credenciales de API estén correctamente configuradas
- Revisa los logs del backend en Render

## 📝 Notas importantes

- **Tier gratuito**: Render ofrece 750 horas/mes gratis para el backend
- **Base de datos**: PostgreSQL gratis con 90 días de retención
- **SSL**: Render incluye certificados SSL gratis automáticamente
- **Dominio custom**: Puedes añadir un dominio personalizado más adelante

## 🎉 ¡Listo!

Tu aplicación LocalNoise debería estar funcionando en:
- Frontend: `https://localnoise-frontend.onrender.com`
- Backend: `https://localnoise-backend.onrender.com`

¡Felicidades! 🎊
