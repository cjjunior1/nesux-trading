#!/bin/bash

# Deploy script para Nesux Trading Academy
# Este script actualiza el código y reinicia la aplicación

set -e  # Salir si hay error

echo "🚀 Iniciando deploy..."

# 1. Traer cambios del repositorio
echo "📥 Actualizando código..."
git pull origin main

# 2. Instalar/actualizar dependencias
echo "📦 Instalando dependencias..."
npm install

# 3. Construir la aplicación
echo "🔨 Compilando aplicación..."
npm run build

# 4. Reiniciar la aplicación con PM2
echo "♻️  Reiniciando aplicación..."
pm2 restart nesux-trading || pm2 start npm --name "nesux-trading" -- start

# 5. Ver logs
echo "📊 Mostrando últimos logs..."
pm2 logs nesux-trading --lines 20 --nostream

echo "✅ Deploy completado exitosamente!"
