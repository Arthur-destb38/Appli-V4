#!/bin/bash

echo "🦍 Lancement simple de Gorillax"

# Tuer les processus existants
echo "Nettoyage des processus..."
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
pkill -f "node.*expo" 2>/dev/null || true

# Attendre un peu
sleep 2

# Lancer l'API
echo "Démarrage de l'API..."
cd api
python3 -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 &
API_PID=$!
cd ..

# Attendre que l'API démarre
echo "Attente de l'API..."
sleep 5

# Lancer l'app
echo "Démarrage de l'app..."
cd app
npm start &
APP_PID=$!
cd ..

echo ""
echo "🦍 Gorillax démarré !"
echo "API: http://localhost:8000"
echo "App: http://localhost:8081"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"

# Attendre et nettoyer à la fermeture
trap "echo 'Arrêt...'; kill $API_PID $APP_PID 2>/dev/null; exit" INT TERM

wait