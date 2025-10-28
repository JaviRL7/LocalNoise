# 🚀 Inicio Rápido

## ¿Qué he hecho por ti?

✅ Estructura completa del proyecto creada
✅ Backend configurado (Node.js + Express + PostgreSQL)
✅ Frontend configurado (React + Vite + Leaflet)
✅ Dependencias instaladas (backend y frontend)
✅ Archivos de configuración listos
✅ Scripts automáticos creados

## ⚠️ Lo que necesitas hacer ahora:

### 1. Configurar PostgreSQL (SOLO UNA VEZ)

Ejecuta este comando:

```bash
./setup-db.sh
```

Este script:
- Inicia PostgreSQL
- Crea el usuario de base de datos
- Crea la base de datos 'local_bands_map'
- Inicializa las tablas
- Actualiza la configuración

**Si te pide contraseña de sudo**: es normal, escribe tu contraseña de usuario de Ubuntu/WSL.

### 2. Iniciar la aplicación

Una vez configurado PostgreSQL, ejecuta:

```bash
./start.sh
```

Esto iniciará:
- Backend en http://localhost:5000
- Frontend en http://localhost:5173

**¡Abre tu navegador en http://localhost:5173 para ver la aplicación!**

---

## 🎸 Primeros pasos en la app

1. **Regístrate** con un usuario y contraseña
2. **Inicia sesión**
3. Click en **"+ Agregar Banda"**
4. Rellena el formulario:
   - Nombre: Los Bourbons
   - Ciudad: Sanlúcar de Barrameda
   - País: España
   - Click en "Buscar coordenadas" (obtendrá las coordenadas automáticamente)
   - Añade género, año, enlaces, etc.
5. **¡Tu banda aparecerá en el mapa!**

---

## 🛠️ Comandos útiles

### Iniciar todo:
```bash
./start.sh
```

### Solo backend:
```bash
cd backend
npm run dev
```

### Solo frontend:
```bash
cd frontend
npm run dev
```

### Reiniciar base de datos (CUIDADO: borra todo):
```bash
cd backend
# Edita database/init.js y cambia force: false por force: true
npm run init-db
# No olvides volver a cambiar force: true por force: false
```

### Ver logs de PostgreSQL:
```bash
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## ❓ Solución de problemas

### PostgreSQL no inicia
```bash
sudo service postgresql start
sudo service postgresql status
```

### Error "Base de datos no existe"
```bash
./setup-db.sh
```

### Error de conexión a la base de datos
Verifica el archivo `backend/.env`:
```bash
cat backend/.env
```

Asegúrate de que:
- DB_USER sea 'javier' o 'postgres'
- DB_PASSWORD esté vacío o tenga la contraseña correcta
- DB_NAME sea 'local_bands_map'

### Puerto 5000 o 5173 ya en uso
Busca y mata el proceso:
```bash
# Para el puerto 5000
lsof -ti:5000 | xargs kill -9

# Para el puerto 5173
lsof -ti:5173 | xargs kill -9
```

---

## 📚 Documentación completa

Lee `README.md` para más información detallada sobre:
- Arquitectura del proyecto
- Endpoints de la API
- Modelo de datos
- Características avanzadas

---

## 🎉 ¡Listo!

Tu aplicación está configurada y lista para usar. Disfruta creando el mapa mundial de bandas locales.

Si necesitas ayuda con PostgreSQL, consulta `SETUP_POSTGRESQL.md`.
