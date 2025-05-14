#!/bin/bash

# Instalar dependencias
npm install

# Construir la aplicación
npm run build

# Mover los archivos estáticos al directorio de publicación
mkdir -p ./dist
cp -r ./build/* ./dist/
