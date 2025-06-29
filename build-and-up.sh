#!/bin/bash

# Ce script build l'image Docker avec la ref git courante et lance docker-compose up

set -e

# Récupère le hash court du commit git
GIT_REF=$(git rev-parse --short HEAD)
echo "Ref git utilisée pour le build : $GIT_REF"

# Build avec la ref git injectée
export VITE_GIT_REF=$GIT_REF
docker-compose build --build-arg VITE_GIT_REF=$VITE_GIT_REF

echo "Build terminé. Lancement de docker-compose up -d ..."
docker-compose up -d

echo "Déploiement terminé. Version affichée : $GIT_REF"
