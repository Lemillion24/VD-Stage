#!/usr/bin/env bash
set -euo pipefail

echo "=== Déploiement Parking Management System ==="

cd "$(dirname "$0")"

echo "1. Création du fichier .env de production..."
cp -n backend/.env.example backend/.env 2>/dev/null || echo "   .env déjà existant"

echo "2. Ajout de swap (évite les OOM sur t2.micro)..."
sudo dd if=/dev/zero of=/swapfile bs=128M count=8 2>/dev/null || true
sudo mkswap /swapfile 2>/dev/null || true
sudo swapon /swapfile 2>/dev/null || true

echo "3. Build des conteneurs (séquentiel pour éviter OOM)..."
cd docker
docker compose build --no-cache postgres
docker compose build --no-cache backend
docker compose build --no-cache agent-app
docker compose build --no-cache client-app
docker compose build --no-cache admin-app
docker compose build --no-cache nginx

echo "4. Démarrage des conteneurs..."
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