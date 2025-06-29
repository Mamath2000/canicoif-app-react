const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Connexion à la base Mongo
mongoose.connect(process.env.MONGO_URI);

// Routes API
app.use('/api/clients', require('./routes/clients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/animaux', require('./routes/animaux'));

// Route utilitaire pour exposer la variable TEST_BANNER
app.use('/api/utils', require('./routes/utils'));

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