# Canicoif

## 🐕 Fonctionnalités principales

> **À savoir :** Cette application de gestion de RDV pour salon de toilétage, fonctionne entièrement en `local` avec votre propre base de données MongoDB. Cela garantit la confidentialité des données de vos clients et la rapidité d'accès, même sans connexion internet.

```mermaid
flowchart TD
    A[Application Canicoif]
    subgraph Backend
        B1[API Express.js]
        B2[Base MongoDB locale]
        B3[Authentification JWT]
    end
    subgraph Frontend
        C1[Interface React]
        C2[Agenda hebdomadaire]
        C3[Gestion clients/animaux]
        C4[Recherche avancée]
    end
    subgraph Features
        D1[Rendez-vous]
        D2[Fiches clients]
        D3[Historique soins]
        D4[Statistiques]
    end
    subgraph Admin
        E1[Gestion utilisateurs]
        E2[Paramètres globaux]
        E3[Configuration système]
        E1 --- E2
        E2 --- E3
    end

    A --> B1
    A --> C1
    B1 --> B2
    B1 --> B3
    B1 --> C1
    C1 --> C2
    C1 --> C3
    C1 --> C4
    C2 --> D1
    C3 --> D2
    C3 --> D3
    C1 --> D4
    B3 --> E1
    C1 --> E2
    C1 --> E3

    %% Styles
    classDef frontend fill,stroke:#0277bd,stroke-width:2px;
    classDef backend fill,stroke:#7b1fa2,stroke-width:2px;
    classDef features fill,stroke:#2e7d32,stroke-width:2px;
    classDef admin fill,stroke:#ff6f00,stroke-width:2px;
    
    class C1,C2,C3,C4 frontend;
    class B1,B2,B3 backend;
    class D1,D2,D3,D4 features;
    class E1,E2,E3 admin;
```

Cette application de gestion vétérinaire propose plusieurs fonctionnalités complètes :

### 1. Gestion complète des rendez-vous

- Interface agenda hebdomadaire intuitive avec vue claire des créneaux
- Création, modification et suppression de rendez-vous en temps réel
- Association automatique client-animal pour chaque rendez-vous
- Gestion des horaires et optimisation de l'emploi du temps

### 2. Base de données clients et animaux

- Fiches clients détaillées avec coordonnées complètes
- Gestion multi-animaux par client avec historique individualisé
- Recherche avancée par nom, téléphone, espèce, ou autres critères
- Suivi personnalisé de chaque animal (espèce, race, âge, comportement)

### 3. Interface de recherche performante

- Recherche clients instantanée avec filtres multiples
- Localisation rapide d'animaux dans la base de données
- Interface responsive adaptée aux tablettes et mobiles
- Navigation intuitive entre les différentes sections

## ⚡ Commande principale pour lancer Canicoif

La commande `make` permet de gérer facilement toutes les étapes du projet : installation, lancement, diagnostic, génération mot de passe admin, etc. Elle automatise les tâches courantes pour simplifier l'utilisation.

Voici la liste des commandes disponibles :

| Commande              | Description |
|-----------------------|-------------|
| `make help`           | Affiche l'aide et la liste des commandes |
| `make quick-start`    | Installation et démarrage complet en une commande |
| `make install`        | Installe toutes les dépendances (backend + frontend) |
| `make dev`            | Lance l'application en mode développement |
| `make prod`           | Lance l'application en mode production |
| `make admin-pwd`      | Génère un nouveau mot de passe administrateur |
| `make check`          | Diagnostic complet (dépendances, .env, MongoDB, Docker) |
| `make setup-env`      | Crée un fichier .env basique |
| `make start-mongo`    | Démarre le service MongoDB |
| `make docker-build`   | Construit l'image Docker |
| `make docker-up`      | Lance avec Docker Compose |
| `make clean`          | Nettoie les fichiers temporaires |

Pour lancer le service en mode interactif (Ctrl+C pour arrêter) :

```bash
make dev
```

## 🚀 Installation rapide

```bash
# 1. Installation complète automatique
make quick-start
```

Cette commande unique va :
- Installer toutes les dépendances
- Créer le fichier `.env`
- Démarrer MongoDB
- Générer le mot de passe admin
- Lancer l'application en mode développement

## 📋 Prérequis

Avant d'installer l'application, assurez-vous d'avoir :

- **Node.js** (version 18+ recommandée) : [Télécharger Node.js](https://nodejs.org/)
- **npm** (inclus avec Node.js)
- **MongoDB** : 
  - Installation locale : [Télécharger MongoDB](https://www.mongodb.com/try/download/community)
  - Ou utiliser MongoDB Atlas (cloud) : [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Docker** (optionnel) : Pour le déploiement en conteneur

### Vérification des prérequis

```bash
make check  # Vérifie tout automatiquement
```

## 📝 Configuration

### Configuration automatique

```bash
make setup-env  # Crée un fichier .env avec les valeurs par défaut
```

### Configuration manuelle

Éditez le fichier `backend/.env` avec les paramètres suivants :

```env
# Base de données
MONGO_URI=mongodb://localhost:27017/canicoif
# Ou pour MongoDB Atlas :
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/canicoif

# Sécurité
JWT_SECRET=votre_secret_jwt_genere_automatiquement

# Serveur
NODE_ENV=development
PORT=5000
```

### Configuration du compte administrateur

```bash
make admin-pwd  # Génère un mot de passe admin sécurisé
```

Le script affichera :
- **Nom d'utilisateur** : `admin`
- **Mot de passe** : généré aléatoirement (16 caractères)

⚠️ **Important** : Notez bien le mot de passe car il ne sera plus accessible après.

## 🌐 Accès à l'application

### Mode développement
- **Frontend** : `http://localhost:5173` (Vite dev server)
- **Backend API** : `http://localhost:5000`

### Mode production
- **Application complète** : `http://localhost:5000`

## 🐳 Déploiement Docker

```bash
# Construction de l'image
make docker-build

# Lancement avec Docker Compose
make docker-up
```

## 📊 Structure du projet

```
canicoif-app-react/
├── backend/                 # API Express.js
│   ├── models/             # Modèles MongoDB (Mongoose)
│   ├── routes/             # Routes API REST
│   ├── server.js           # Point d'entrée serveur
│   └── initAdmin.js        # Script génération admin
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── hooks/          # Hooks personnalisés
│   │   └── utils/          # Utilitaires
│   └── public/             # Assets statiques
├── ecrans/                 # Captures d'écran
├── Makefile               # Commandes automatisées
└── docker-compose.yml     # Configuration Docker
```

## 🔧 Commandes détaillées

### Installation et démarrage

```bash
make install      # Installation des dépendances uniquement
make dev         # Développement (backend + frontend séparés)
make prod        # Production (frontend compilé)
```

### Diagnostic et maintenance

```bash
make check       # Vérification complète de la configuration
make start-mongo # Démarrage manuel de MongoDB
make clean       # Nettoyage des fichiers temporaires
```

### Docker

```bash
make docker-build  # Construction de l'image
make docker-up     # Lancement avec Docker Compose
```

## 🔍 Dépannage

### Problèmes courants

1. **Erreur MongoDB** : `make start-mongo` puis `make check`
2. **Fichier .env manquant** : `make setup-env`
3. **Mot de passe admin perdu** : `make admin-pwd`
4. **Dépendances manquantes** : `make install`

### Installation MongoDB sur Debian/Ubuntu

```bash
# Importez la clé GPG MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Ajoutez le dépôt
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Installez
sudo apt update && sudo apt install -y mongodb-org

# Démarrez
sudo systemctl start mongod && sudo systemctl enable mongod
```

### Diagnostic automatique

```bash
make check  # Vérifie automatiquement :
```
- ✅ Node.js, npm, MongoDB, Docker
- ✅ Fichier `.env` présent et valide  
- ✅ Connexion MongoDB active
- ✅ Dépendances installées

## ✅ Statut de fonctionnement

Si vous voyez ces messages, tout fonctionne correctement :
- `✅ Toutes les vérifications sont passées !`
- `🚀 Lancement en mode développement...`
- `📦 Installation des dépendances terminée`
- `🔑 Mot de passe administrateur généré`

## 📸 Aperçu de l'application

### Page d'accueil - Agenda hebdomadaire
![Page d'accueil](ecrans/Canicoif-Accueil.png)

Interface principale avec vue agenda claire des rendez-vous planifiés et navigation intuitive.

### Gestion des rendez-vous
![Rendez-vous](ecrans/Canicoif-RDV.png)

Interface de création/modification des appointments avec sélection de créneaux et association client-animal.

### Fiche client complète
![Fiche client](ecrans/Canicoif-ficheClient.png)

Vue centralisée des informations client, historique des visites et liste des animaux.

### Recherche de clients
![Recherche client](ecrans/Canicoif-RechercheClient.png)

Fonction de recherche rapide avec critères multiples et identification instantanée.

### Recherche d'animaux
![Recherche animal](ecrans/Canicoif-RechercheAnimal.png)

Localisation rapide d'animaux avec accès direct aux informations et historique.
