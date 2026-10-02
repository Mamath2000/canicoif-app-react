// Application Express (routes, middlewares, front) sans démarrage : utilisée par server.js et par les tests
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();

// En-têtes de sécurité (CSP, nosniff, frame-ancestors…). Pas de CORS : l'API ne sert que le front de même origine.
// - upgrade-insecure-requests désactivé : l'app est aussi utilisée en http sur le LAN (192.168.100.174:8000)
// - HSTS désactivé : le TLS est géré par le reverse proxy (NPM)
// - COOP et Origin-Agent-Cluster désactivés : ignorés en http par le navigateur (avertissements en console), sans apport ici
app.use(helmet({
  contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } },
  strictTransportSecurity: false,
  crossOriginOpenerPolicy: false,
  originAgentCluster: false,
}));
app.use(compression());
app.use(express.json());

// Auth JWT : toutes les routes API sauf /api/login
const loginRouter = require('./routes/login');
const { authenticateJWT, authenticateResetJWT } = loginRouter;

app.use('/api/login', loginRouter);
app.use('/api/banner', authenticateJWT, require('./routes/dev-banner'));
app.use('/api/clients', authenticateJWT, require('./routes/clients'));
app.use('/api/appointments', authenticateJWT, require('./routes/appointments'));
app.use('/api/animaux', authenticateJWT, require('./routes/animaux'));
// Statistiques (tous users connectés)
app.use('/api/stats', authenticateJWT, require('./routes/stats'));
// Gestion des utilisateurs (admin seulement, sauf reset-password qui accepte le token de réinitialisation)
app.use('/api/users', authenticateResetJWT, require('./routes/users'));
// Paramètres globaux (lecture : tous ; modification : admin)
app.use('/api/settings', authenticateJWT, require('./routes/settings'));

// 📁 Fichiers statiques du frontend (build Vite)
const frontendPath = path.join(__dirname, '../frontend/dist');
// Fichiers de build versionnés (/assets, nom avec hash) : cache long ; index.html jamais en cache
app.use(express.static(frontendPath, {
  setHeaders(res, filePath) {
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

// Fallback (après toutes les routes API) : 404 JSON pour l'API, sinon index.html (routage côté front)
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'API introuvable' });
  }
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
