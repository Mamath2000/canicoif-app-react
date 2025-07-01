const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'canicoif-secret';
const JWT_EXPIRES_IN = '12h';

// POST /api/login
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Champs manquants' });
  }
  const user = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  // Si resetFlag est actif, vérifier le code temporaire
  if (user.resetFlag) {
    const match = await bcrypt.compare(password, user.tempPasswordHash);
    if (!match) {
      return res.status(401).json({ error: 'Code temporaire incorrect' });
    }
    // Auth temporaire, demander nouveau mot de passe côté front
    const token = jwt.sign({ username: user.username, id: user._id, role: user.role, reset: true }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ success: true, token, username: user.username, role: user.role, reset: true, id: user._id });
  }
  // Sinon, vérification classique
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  const token = jwt.sign({ username: user.username, id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ success: true, token, username: user.username, role: user.role, id: user._id });
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
