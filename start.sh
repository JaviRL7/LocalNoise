#!/bin/bash

# Script para iniciar la aplicación completa

echo "🚀 Iniciando Mapa Mundial de Bandas Locales..."
echo ""

# Verificar si PostgreSQL está ejecutándose
if ! sudo service postgresql status > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL no está ejecutándose. Iniciando..."
    sudo service postgresql start
    sleep 2
fi

# Verificar si la base de datos existe
if ! psql -lqt | cut -d \| -f 1 | grep -qw local_bands_map; then
    echo "⚠️  Base de datos no encontrada. Por favor, ejecuta primero:"
    echo "   ./setup-db.sh"
    exit 1
fi

echo "✓ PostgreSQL ejecutándose"
echo ""

# Iniciar backend en background
echo "📡 Iniciando backend en http://localhost:5000..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
sleep 3

# Iniciar frontend
echo "🌐 Iniciando frontend en http://localhost:5173..."
cd frontend
npm run dev

# Cleanup cuando se cierre el script
trap "kill $BACKEND_PID 2>/dev/null" EXIT
