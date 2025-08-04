#!/bin/bash

# Railway Build Script
echo "Starting Railway build process..."

# Build frontend with Vite
echo "Building frontend..."
npx vite build

# Build backend with esbuild
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build complete!"
echo "Frontend files in: dist/public/"
echo "Backend file: dist/index.js"