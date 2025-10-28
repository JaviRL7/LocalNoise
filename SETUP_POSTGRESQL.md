# Configuración de PostgreSQL en WSL

## 1. Iniciar el servicio de PostgreSQL

Ejecuta este comando en tu terminal (te pedirá tu contraseña de sudo):

```bash
sudo service postgresql start
```

## 2. Crear un usuario PostgreSQL para tu usuario de sistema

```bash
sudo -u postgres createuser -s javier
```

## 3. Crear la base de datos

```bash
createdb local_bands_map
```

O alternativamente:

```bash
sudo -u postgres createdb local_bands_map
```

## 4. Configurar contraseña para el usuario postgres (opcional)

Si prefieres usar el usuario postgres con contraseña:

```bash
sudo -u postgres psql
```

Dentro de psql, ejecuta:
```sql
ALTER USER postgres PASSWORD 'tu_contraseña';
\q
```

Luego actualiza el archivo `/home/javier/planetas/backend/.env`:
```env
DB_USER=postgres
DB_PASSWORD=tu_contraseña
```

## 5. Verificar que PostgreSQL está ejecutándose

```bash
sudo service postgresql status
```

## 6. Continuar con la instalación

Una vez que PostgreSQL esté ejecutándose y la base de datos creada, ejecuta:

```bash
cd /home/javier/planetas/backend
npm run init-db
```

---

## Opción alternativa: Usar tu usuario actual

Si creaste el usuario 'javier' en PostgreSQL, actualiza el archivo .env:

```env
DB_USER=javier
DB_PASSWORD=
```

## Auto-inicio de PostgreSQL en WSL

Para que PostgreSQL se inicie automáticamente en WSL, añade esto a tu `~/.bashrc`:

```bash
# Auto-start PostgreSQL
if ! sudo service postgresql status > /dev/null 2>&1; then
    sudo service postgresql start > /dev/null 2>&1
fi
```
