#!/bin/bash

# Script para configurar PostgreSQL y la base de datos

echo "🔧 Configurando PostgreSQL para Mapa Mundial de Bandas Locales..."
echo ""

# Iniciar PostgreSQL si no está ejecutándose
if ! sudo service postgresql status > /dev/null 2>&1; then
    echo "Iniciando PostgreSQL..."
    sudo service postgresql start
    sleep 2
fi

echo "✓ PostgreSQL ejecutándose"
echo ""

# Verificar si el usuario javier existe en PostgreSQL
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='javier'" | grep -q 1; then
    echo "Creando usuario PostgreSQL 'javier'..."
    sudo -u postgres createuser -s javier
    echo "✓ Usuario 'javier' creado"
else
    echo "✓ Usuario 'javier' ya existe"
fi

echo ""

# Crear base de datos si no existe
if ! psql -lqt | cut -d \| -f 1 | grep -qw local_bands_map; then
    echo "Creando base de datos 'local_bands_map'..."
    createdb local_bands_map
    echo "✓ Base de datos 'local_bands_map' creada"
else
    echo "✓ Base de datos 'local_bands_map' ya existe"
fi

echo ""

# Actualizar .env si es necesario
if grep -q "DB_USER=postgres" backend/.env; then
    echo "Actualizando archivo .env para usar el usuario 'javier'..."
    sed -i 's/DB_USER=postgres/DB_USER=javier/' backend/.env
    echo "✓ Archivo .env actualizado"
fi

echo ""

# Inicializar las tablas
echo "Inicializando tablas de la base de datos..."
cd backend
npm run init-db

echo ""
echo "✅ Configuración completada!"
echo ""
echo "Ahora puedes ejecutar:"
echo "  ./start.sh          # Para iniciar la aplicación"
echo "  cd backend && npm run dev    # Solo backend"
echo "  cd frontend && npm run dev   # Solo frontend"
