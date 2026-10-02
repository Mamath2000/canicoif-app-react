#!/bin/bash
# Construit l'image Docker de l'application et la pousse sur Docker Hub (tags <version> et latest),
# <version> étant celle de frontend/package.json ; passe ensuite package.json à la version suivante
# (patch + 1) : les modifications à venir partent sur la nouvelle version.
set -euo pipefail
cd "$(dirname "$0")"

command -v jq >/dev/null 2>&1 || { echo "jq est requis mais non installé. Abandon."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker est requis mais non installé. Abandon."; exit 1; }
docker info 2>/dev/null | grep -q Username || { echo "Non connecté à Docker Hub. Lancez 'docker login'."; exit 1; }

DOCKER_USER="mathmath350"
APP_NAME="canicoif"
IMAGE="$DOCKER_USER/$APP_NAME"

VERSION=$(jq -r '.version' frontend/package.json)
# Ref git affichée dans l'app (suffixe -dirty si des modifications ne sont pas commitées)
GIT_REF=$(git rev-parse --short HEAD)
git diff --quiet HEAD -- . || GIT_REF="$GIT_REF-dirty"
echo "Version : $VERSION — ref git : $GIT_REF"

docker build --build-arg VITE_GIT_REF="$GIT_REF" -t "$IMAGE:$VERSION" -t "$IMAGE:latest" .
docker push "$IMAGE:$VERSION"
docker push "$IMAGE:latest"
echo "Images poussées sur Docker Hub : $IMAGE:$VERSION et $IMAGE:latest"

# Version suivante (patch + 1) dans package.json et package-lock.json
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
(cd frontend && npm version "$NEW_VERSION" --no-git-tag-version >/dev/null)
echo "frontend/package.json passé en $NEW_VERSION (prochaine version)"
