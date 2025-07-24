# Canicoif - Makefile
.PHONY: help install dev prod admin-pwd docker-build docker-up check setup-env start-mongo stop-mongo clean quick-start

help:
	@echo "🐕 Canicoif - Application de gestion de RDV pour Salon de Toilétage"
	@echo ""
	@echo "⚡ COMMANDES PRINCIPALES:"
	@echo "  make quick-start    - Installation et démarrage complet"
	@echo "  make install        - Installer les dépendances"
	@echo "  make dev            - Lancer en mode développement"
	@echo "  make prod           - Lancer en mode production"
	@echo "  make admin-pwd      - Générer mot de passe admin"
	@echo ""
	@echo "🔧 CONFIGURATION:"
	@echo "  make check          - Vérifier la configuration"
	@echo "  make setup-env      - Créer fichier .env"
	@echo "  make start-mongo    - Démarrer MongoDB"
	@echo "  make stop-mongo     - Arrêter MongoDB"
	@echo ""
	@echo "🐳 DOCKER:"
	@echo "  make docker-build   - Construire image Docker"
	@echo "  make docker-up      - Lancer avec Docker Compose"
	@echo ""
	@echo "🧹 MAINTENANCE:"
	@echo "  make clean          - Nettoyer fichiers temporaires"

install:
	@echo "🔧 Installation des dépendances..."
	@cd backend && npm install
	@cd frontend && npm install
	@echo "✅ Installation terminée!"

dev: check
	@echo "🚀 Lancement en mode développement..."
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:5000"
	@echo "Appuyez sur Ctrl+C pour arrêter"
	@echo ""
	@(cd backend && npx nodemon server.js) & \
	(cd frontend && npm run dev) & \
	wait

prod: check
	@echo "🏗️ Build et lancement en mode production..."
	@cd frontend && npm run build
	@echo "Application: http://localhost:5000"
	@cd backend && npm start

admin-pwd: check
	@echo "🔑 Génération du mot de passe administrateur..."
	@cd backend && node initAdmin.js

docker-build:
	@echo "🐳 Construction de l'image Docker..."
	@if [ -f "./build-docker-image.sh" ]; then \
		chmod +x ./build-docker-image.sh && ./build-docker-image.sh; \
	else \
		docker build -t canicoif-app .; \
	fi
	@echo "✅ Image Docker construite!"

docker-up:
	@echo "🐳 Lancement avec Docker Compose..."
	@if [ -f "./build-and-up.sh" ]; then \
		chmod +x ./build-and-up.sh && ./build-and-up.sh; \
	else \
		docker-compose up --build; \
	fi

check:
	@echo "🔍 Vérification de la configuration..."
	
	@echo "📦 Vérification des dépendances système..."
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js n'est pas installé"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "❌ npm n'est pas installé"; exit 1; }
	@command -v mongod >/dev/null 2>&1 || { echo "❌ MongoDB n'est pas installé"; exit 1; }
	@command -v mongosh >/dev/null 2>&1 || { echo "❌ mongosh (client MongoDB) n'est pas installé"; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "⚠️ Docker n'est pas installé (optionnel)"; }
	@echo "✅ Node.js: $$(node --version)"
	@echo "✅ npm: $$(npm --version)"
	@echo "✅ MongoDB: $$(mongod --version | head -n1)"
	@echo "✅ mongosh: $$(mongosh --version)"
	@if command -v docker >/dev/null 2>&1; then \
		echo "✅ Docker: $$(docker --version)"; \
	fi
	@echo "📝 Vérification du fichier .env..."
	@if [ ! -f "backend/.env" ]; then \
		echo "❌ Fichier .env manquant dans backend/"; \
		echo "Créez le fichier avec : make setup-env"; \
		exit 1; \
	fi
	@if ! grep -q "MONGO_URI" "backend/.env"; then \
		echo "❌ Variable MONGO_URI manquante dans .env"; \
		exit 1; \
	fi
	@echo "✅ Fichier .env présent et valide"
	
	@echo "🍃 Vérification de la connexion MongoDB..."
	@mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1 || { \
		echo "❌ Impossible de se connecter à MongoDB"; \
		echo "Démarrez MongoDB avec: make start-mongo"; \
		exit 1; \
	}
	@echo "✅ MongoDB répond correctement"
	
	@echo "✅ Toutes les vérifications sont passées!"

setup-env:
	@echo "📝 Création du fichier .env..."
	@if [ ! -f "backend/.env" ]; then \
		echo "MONGO_URI=mongodb://localhost:27017/canicoif" > backend/.env; \
		echo "JWT_SECRET=$$(openssl rand -base64 32)" >> backend/.env; \
		echo "NODE_ENV=development" >> backend/.env; \
		echo "PORT=5000" >> backend/.env; \
		echo "✅ Fichier .env créé dans backend/"; \
		echo "Modifiez MONGO_URI si nécessaire"; \
	else \
		echo "⚠️ Fichier .env existe déjà"; \
	fi

start-mongo:
	@echo "🚀 Démarrage de MongoDB..."
	@sudo systemctl start mongod || { 
		echo "⚠️ Échec du démarrage avec systemctl, tentative manuelle..."; 
		sudo mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork || { 
			echo "❌ Impossible de démarrer MongoDB"; 
			exit 1; 
		}; 
	}
	@echo "✅ MongoDB démarré!"

stop-mongo:
	@echo "🛑 Arrêt de MongoDB..."
	@sudo systemctl stop mongod || sudo pkill mongod
	@echo "✅ MongoDB arrêté!"

clean:
	@echo "🧹 Nettoyage..."
	@rm -rf backend/node_modules 2>/dev/null || true
	@rm -rf frontend/node_modules 2>/dev/null || true
	@rm -rf frontend/dist 2>/dev/null || true
	@echo "✅ Nettoyage terminé!"

quick-start: install setup-env start-mongo admin-pwd dev
