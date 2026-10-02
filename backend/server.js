const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET manquant : définissez-le dans l\'environnement (ex. `openssl rand -hex 32`). Arrêt.');
  process.exit(1);
}

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Connexion à la base Mongo
mongoose.connect(process.env.MONGO_URI);

// Auth middleware JWT (protège toutes les routes sauf /api/utils/login et /api/utils/test-banner)
const loginRouter = require('./routes/login');
const { authenticateJWT, authenticateResetJWT } = loginRouter;

// Routes API protégées par JWT
app.use('/api/banner', authenticateJWT, require('./routes/dev-banner'));

app.use('/api/clients', authenticateJWT, require('./routes/clients'));
app.use('/api/appointments', authenticateJWT, require('./routes/appointments'));
app.use('/api/animaux', authenticateJWT, require('./routes/animaux'));

// Statistiques (tous users connectés)
app.use('/api/stats', authenticateJWT, require('./routes/stats'));
// Gestion des utilisateurs (admin seulement, sauf reset-password qui accepte le token de réinitialisation)
app.use('/api/users', authenticateResetJWT, require('./routes/users'));
app.use('/api/login', require('./routes/login'));

// Ajout de la route pour les paramètres globaux
app.use('/api/settings', authenticateJWT, require('./routes/settings'));




// 📁 Serve fichiers statiques frontend (Vite)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// ⚠️ Catch-all propre qui évite les conflits avec les API
// Fallback pour routes non-API (à faire après toutes les routes API)
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ message: 'API introuvable' });
  }

  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur prêt sur http://localhost:${PORT}`);
});