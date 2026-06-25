#!/usr/bin/env bash
set -euo pipefail

echo "=== Déploiement Parking Management System ==="

cd "$(dirname "$0")"

echo "1. Création du fichier .env de production..."
cp -n backend/.env.example backend/.env 2>/dev/null || echo "   .env déjà existant"

echo "2. Build et démarrage des conteneurs..."
cd docker
docker compose build --no-cache
docker compose up -d

echo "3. Seed de la base de données (parkings + places)..."
docker compose exec -T backend python seed.py

echo ""
echo "=== Déploiement terminé ==="
echo "   Backend:  http://$(curl -s http://checkip.amazonaws.com):8000"
echo "   Frontend: http://$(curl -s http://checkip.amazonaws.com)"
echo ""
echo "   Utilisateurs de test:"
echo "     admin / admin123"
echo "     agent / agent123"
echo "     super-admin / supadmin123"