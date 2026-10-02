const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // required, checked at startup in server.js
const JWT_EXPIRES_IN = '12h';

// POST /api/login
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'Champs manquants' });
  }
  // Case-insensitive exact match: escape regex metacharacters of the user input
  const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const user = await User.findOne({ username: { $regex: `^${escaped}$`, $options: 'i' } });
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

// Middleware pour vérifier le token JWT.
// Un token de réinitialisation (reset: true, obtenu avec le code temporaire) n'est accepté
// que si allowReset est vrai : il ne sert qu'à changer le mot de passe.
function verifyJWT({ allowReset }) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Token invalide' });
      if (user.reset && !allowReset) {
        return res.status(403).json({ error: 'Mot de passe à réinitialiser' });
      }
      req.user = user;
      next();
    });
  };
}
const authenticateJWT = verifyJWT({ allowReset: false });
const authenticateResetJWT = verifyJWT({ allowReset: true });

// Middleware admin (à placer après authenticateJWT / authenticateResetJWT)
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin' && !req.user.reset) return next();
  return res.status(403).json({ error: 'Accès refusé' });
}

// Exporte les middlewares pour les utiliser ailleurs
router.authenticateJWT = authenticateJWT;
router.authenticateResetJWT = authenticateResetJWT;
router.isAdmin = isAdmin;

module.exports = router;
