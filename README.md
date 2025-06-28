# Projet Canicoif

Ce projet est une application de gestion de rendez-vous construite avec React pour le frontend et Express pour le backend. Il utilise MongoDB comme base de données pour stocker les informations des rendez-vous.

## Structure du projet

Le projet est organisé comme suit :

```
canicoif-app
├── backend
│   ├── .env
│   ├── server.js
│   ├── models
│   │   └── Appointment.js
│   └── routes
│       └── appointments.js
├── frontend
│   ├── App.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── vite.config.js
│   ├── components
│   │   ├── AppointmentForm.js
│   │   └── AppointmentList.js
│   ├── public
│   │   └── vite.svg
│   └── src
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       └── assets
│           └── react.svg
```

## Backend

- **`backend/.env`** : Contient la variable d'environnement `MONGO_URI` pour la connexion à MongoDB.
- **`backend/server.js`** : Point d'entrée du serveur, configure Express, CORS et connecte à MongoDB.
- **`backend/models/Appointment.js`** : Définit le modèle Mongoose pour les rendez-vous.
- **`backend/routes/appointments.js`** : Gère les routes pour obtenir, ajouter et supprimer des rendez-vous.

## Frontend

- **`frontend/App.js`** : Composant principal de l'application React, gère l'état des rendez-vous.
- **`frontend/components/AppointmentForm.js`** : Permet d'ajouter un nouveau rendez-vous.
- **`frontend/components/AppointmentList.js`** : Affiche la liste des rendez-vous et permet de les supprimer.
- **`frontend/eslint.config.js`** : Configure ESLint pour le projet.
- **`frontend/index.html`** : Fichier HTML principal pour charger l'application React.
- **`frontend/package.json`** : Contient les métadonnées et les dépendances du projet.
- **`frontend/vite.config.js`** : Configure Vite pour le projet.
- **`frontend/public/vite.svg`** : Icône utilisée dans l'application.
- **`frontend/src/App.css`** : Styles CSS pour le composant `App`.
- **`frontend/src/App.jsx`** : Version JSX du composant `App`.
- **`frontend/src/index.css`** : Styles CSS globaux pour l'application.
- **`frontend/src/main.jsx`** : Point d'entrée de l'application React.
- **`frontend/src/assets/react.svg`** : Logo de React utilisé dans l'application.

## Installation

1. Clonez le dépôt.
2. Installez les dépendances pour le backend :
   ```
   cd backend
   npm install
   ```
3. Installez les dépendances pour le frontend :
   ```
   cd frontend
   npm install
   ```
4. Configurez votre base de données MongoDB et mettez à jour le fichier `.env` avec l'URL de connexion.
5. Démarrez le serveur backend :
   ```
   cd backend
   node server.js
   ```
6. Démarrez le frontend :
   ```
   cd frontend
   npm run dev
   ```

## Utilisation

Accédez à l'application via `http://localhost:5173` pour le frontend et `http://localhost:5000` pour le backend. Vous pouvez ajouter, afficher et supprimer des rendez-vous à partir de l'interface utilisateur.