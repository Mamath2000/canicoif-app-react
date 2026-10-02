require('dotenv').config();
const mongoose = require('mongoose');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET manquant : définissez-le dans l\'environnement (ex. `openssl rand -hex 32`). Arrêt.');
  process.exit(1);
}

const app = require('./app');

// Connexion à la base Mongo
mongoose.connect(process.env.MONGO_URI);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur prêt sur http://localhost:${PORT}`);
});
