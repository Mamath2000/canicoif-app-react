const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'canicoif-secret';
const JWT_EXPIRES_IN = '12h';

// POST /api/login
router.post('/', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Champs manquants' });
  }
  const usersPath = path.join(__dirname, '../../users.json');
  let users = [];
  try {
    users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  } catch (e) {
    return res.status(500).json({ error: 'Impossible de lire les utilisateurs' });
  }
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  // Génère un token JWT
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ success: true, token, username });
});

// Middleware pour vérifier le token JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
}

// Exporte le middleware pour l'utiliser ailleurs
router.authenticateJWT = authenticateJWT;

module.exports = router;
