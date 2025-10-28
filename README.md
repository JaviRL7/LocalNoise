# 🎸 Mapa Mundial de Bandas Locales

Una aplicación web interactiva para crear un mapa colaborativo de bandas de rock y escenas musicales locales de todo el mundo.

## 📋 Descripción

Esta aplicación permite a los usuarios registrados agregar bandas de sus escenas locales en un mapa mundial interactivo. Los visitantes pueden explorar bandas de diferentes ciudades, descubrir nueva música y conectar con escenas musicales de todo el planeta.

## ✨ Características

- 🗺️ **Mapa interactivo mundial** con Leaflet
- 🎵 **Añadir bandas locales** con información detallada
- 🔍 **Búsqueda y filtrado** por ciudad, país o género
- 🔐 **Sistema de autenticación** (registro/login)
- 🔗 **Enlaces a redes sociales** (Spotify, YouTube, Instagram)
- 📍 **Geocodificación automática** de ciudades
- 👥 **Sistema de contribuciones** (cada usuario puede editar/eliminar solo sus bandas)

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- PostgreSQL con Sequelize ORM
- JWT para autenticación
- bcryptjs para encriptación de contraseñas

### Frontend
- React 18
- Vite
- React Leaflet (mapas)
- Axios (peticiones HTTP)

## 📦 Instalación

### Requisitos previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd planetas
```

### 2. Configurar la base de datos

Crea una base de datos PostgreSQL:

```bash
psql -U postgres
CREATE DATABASE local_bands_map;
\q
```

### 3. Configurar el backend

```bash
cd backend
npm install

# Copiar y configurar variables de entorno
cp .env.example .env
# Edita el archivo .env con tus credenciales de base de datos
```

Edita `backend/.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=local_bands_map
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

JWT_SECRET=genera_una_clave_secreta_muy_segura
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

Inicializar la base de datos:

```bash
npm run init-db
```

### 4. Configurar el frontend

```bash
cd ../frontend
npm install
```

## 🚀 Ejecución

### Desarrollo

Necesitas dos terminales:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
El servidor estará en `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
La aplicación estará en `http://localhost:5173`

## 📚 Estructura del proyecto

```
planetas/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Configuración de Sequelize
│   │   ├── controllers/
│   │   │   ├── authController.js    # Lógica de autenticación
│   │   │   └── bandController.js    # Lógica de bandas
│   │   ├── middleware/
│   │   │   └── auth.js              # Middleware de autenticación
│   │   ├── models/
│   │   │   ├── User.js              # Modelo de usuario
│   │   │   ├── Band.js              # Modelo de banda
│   │   │   └── index.js             # Relaciones
│   │   ├── routes/
│   │   │   ├── auth.js              # Rutas de autenticación
│   │   │   └── bands.js             # Rutas de bandas
│   │   └── server.js                # Servidor principal
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map.jsx              # Componente del mapa
│   │   │   └── AddBandForm.jsx      # Formulario de agregar banda
│   │   ├── services/
│   │   │   └── api.js               # Cliente API
│   │   ├── styles/
│   │   │   ├── App.css
│   │   │   └── AddBandForm.css
│   │   ├── App.jsx                  # Componente principal
│   │   └── main.jsx                 # Entrada de la app
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   └── init.js                       # Script de inicialización
│
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Bandas

- `GET /api/bands` - Listar todas las bandas
- `GET /api/bands/:id` - Obtener banda por ID
- `GET /api/bands/search?q=texto` - Buscar bandas
- `POST /api/bands` - Crear banda (requiere auth)
- `PUT /api/bands/:id` - Actualizar banda (requiere auth)
- `DELETE /api/bands/:id` - Eliminar banda (requiere auth)

## 💾 Modelo de datos

### Usuario
```javascript
{
  id: UUID,
  username: String,
  email: String,
  password: String (encriptada),
  city: String,
  country: String
}
```

### Banda
```javascript
{
  id: UUID,
  name: String,
  city: String,
  country: String,
  latitude: Decimal,
  longitude: Decimal,
  genre: String,
  description: Text,
  yearFormed: Integer,
  website: String,
  spotifyUrl: String,
  youtubeUrl: String,
  instagramUrl: String,
  isActive: Boolean,
  addedBy: UUID (FK -> User)
}
```

## 🎯 Uso

1. **Registrarse**: Crea una cuenta con tu email y elige un nombre de usuario
2. **Iniciar sesión**: Accede con tus credenciales
3. **Agregar banda**: Click en "Agregar Banda"
   - Introduce el nombre de la banda
   - Especifica la ciudad y país
   - Usa "Buscar coordenadas" para obtener lat/long automáticamente
   - Añade información adicional (género, año, enlaces, etc.)
4. **Explorar**: Navega por el mapa y haz click en los marcadores para ver información de las bandas

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación JWT
- Validación de datos en backend
- CORS configurado
- Solo el usuario que agregó una banda puede editarla o eliminarla

## 🚧 Próximas mejoras

- [ ] Sistema de valoraciones/likes
- [ ] Comentarios en bandas
- [ ] Subida de imágenes
- [ ] Búsqueda por proximidad
- [ ] Filtros avanzados
- [ ] Mapa de calor por densidad de bandas
- [ ] Integración con APIs de música (Last.fm, Deezer)
- [ ] Modo oscuro
- [ ] Exportar datos a CSV/JSON

## 📝 Notas para producción

Antes de desplegar en producción:

1. Cambiar `JWT_SECRET` por una clave segura generada
2. Configurar variables de entorno en el servidor
3. Usar `NODE_ENV=production`
4. Configurar HTTPS
5. Ajustar CORS a tu dominio específico
6. Configurar límites de rate limiting
7. Implementar backups de base de datos
8. Añadir monitoreo y logs

## 📄 Licencia

MIT

## 👨‍💻 Autor

Creado por ti :)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

¡Disfruta mapeando la escena musical mundial! 🎸🌍
# LocalNoise
