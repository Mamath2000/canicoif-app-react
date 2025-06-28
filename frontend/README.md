# React + Vite

Ce projet est une application de gestion de rendez-vous construite avec React et Vite. Il permet aux utilisateurs d'ajouter, de visualiser et de supprimer des rendez-vous.

## Structure du projet

- **backend/** : Contient le serveur Express qui gère les rendez-vous.
  - **.env** : Contient la variable d'environnement `MONGO_URI` pour la connexion à la base de données MongoDB.
  - **server.js** : Point d'entrée du serveur, configure Express et connecte à MongoDB.
  - **models/** : Contient les modèles Mongoose.
    - **Appointment.js** : Définit le modèle pour les rendez-vous.
  - **routes/** : Contient les routes pour gérer les rendez-vous.
    - **appointments.js** : Définit les routes pour obtenir, ajouter et supprimer des rendez-vous.

- **frontend/** : Contient l'application React.
  - **App.js** : Composant principal qui gère l'état des rendez-vous.
  - **components/** : Contient les composants réutilisables.
    - **AppointmentForm.js** : Formulaire pour ajouter un nouveau rendez-vous.
    - **AppointmentList.js** : Liste des rendez-vous avec option de suppression.
  - **eslint.config.js** : Configuration d'ESLint pour le projet.
  - **index.html** : Fichier HTML principal qui charge l'application React.
  - **package.json** : Métadonnées du projet, dépendances et scripts.
  - **vite.config.js** : Configuration de Vite pour le projet.
  - **public/** : Contient les fichiers publics comme les images.
    - **vite.svg** : Icône utilisée dans l'application.
  - **src/** : Contient les fichiers source de l'application.
    - **App.css** : Styles CSS pour le composant App.
    - **App.jsx** : Version JSX du composant App.
    - **index.css** : Styles CSS globaux.
    - **main.jsx** : Point d'entrée de l'application React.
    - **assets/** : Contient les fichiers d'assets comme les images.
      - **react.svg** : Logo de React.

## Installation

1. Clonez le dépôt.
2. Accédez au dossier `backend` et installez les dépendances :
   ```
   npm install
   ```
3. Configurez votre base de données MongoDB et mettez à jour le fichier `.env` avec l'URL de connexion.
4. Démarrez le serveur :
   ```
   node server.js
   ```
5. Accédez au dossier `frontend` et installez les dépendances :
   ```
   npm install
   ```
6. Démarrez l'application React :
   ```
   npm run dev
   ```

## Utilisation

- Ajoutez un rendez-vous en remplissant le formulaire et en soumettant.
- Visualisez la liste des rendez-vous.
- Supprimez un rendez-vous en cliquant sur le bouton "Supprimer".

## Contribution

Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage pour toute amélioration ou correction.