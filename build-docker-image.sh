#!/bin/bash
command -v jq >/dev/null 2>&1 || { echo "jq est requis mais non installé. Abandon."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker est requis mais non installé. Abandon."; exit 1; }
docker info | grep -q Username || { echo "Non connecté à Docker Hub. Lancez 'docker login'."; exit 1; }

DOCKER_USER="mathmath350"
# Ce script compile l'image Docker pour l'application et la pousse sur Docker Hub.

# Récupère la version actuelle du fichier package.json avec une commande jq
VERSION=$(jq -r '.version' frontend/package.json)
echo "Version actuelle : $VERSION"

# Nom de l'application
APP_NAME="canicoif"

# Compile l'image Docker
docker compose build $APP_NAME

# Tag les images avec le nom d'utilisateur Docker Hub
DOCKER_USER=${DOCKER_USER:-$(read -p "Entrez votre nom d'utilisateur Docker Hub : " user && echo $user)}
docker tag $APP_NAME-app-react-canicoif:latest $DOCKER_USER/$APP_NAME:latest
docker tag $APP_NAME-app-react-canicoif:latest $DOCKER_USER/$APP_NAME:$VERSION

# docker login --username $DOCKER_USER

# Pousse les images sur Docker Hub
docker push $DOCKER_USER/$APP_NAME:latest
docker push $DOCKER_USER/$APP_NAME:$VERSION



# Messages de confirmation
echo "Image Docker compilée avec succès avec les tags : latest et $NEW_VERSION"
echo "Version mise à jour dans package.json : $NEW_VERSION"
echo "Images poussées sur Docker Hub avec succès : $DOCKER_USER/$APP_NAME:latest et $DOCKER_USER/$APP_NAME:$NEW_VERSION"


# Incrémente le numéro de build (dernier segment de la version)
IFS='.' read -r MAJOR MINOR BUILD <<< "$VERSION"
BUILD=$((BUILD + 1))
NEW_VERSION="$MAJOR.$MINOR.$BUILD"

# Met à jour la version dans package.json
sed -i "s/\"version\": \"$VERSION\"/\"version\": \"$NEW_VERSION\"/" frontend/package.json
