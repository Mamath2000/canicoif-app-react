const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Middleware d'authentification admin (à compléter selon votre logique d'auth)
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') return next();
    return res.status(403).json({ message: 'Accès refusé' });
}

// Liste des utilisateurs
router.get('/', isAdmin, async (req, res) => {
    const users = await User.find({}, '-passwordHash -tempPasswordHash');
    res.json(users);
});

// Créer un utilisateur
router.post('/', isAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ message: 'Champs manquants' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, role });
    res.status(201).json({ id: user._id, username: user.username, role: user.role });
});

// Flag pour réinitialisation du mot de passe
router.post('/:id/flag-reset', isAdmin, async (req, res) => {
    const tempPassword = Math.random().toString().slice(2, 10); // 8 chiffres
    const tempPasswordHash = await bcrypt.hash(tempPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { resetFlag: true, tempPasswordHash });
    res.json({ tempPassword }); // Affiché à l'admin uniquement
});

// Réinitialisation du mot de passe par l'utilisateur
// Middleware spécial pour autoriser la réinit même avec un token de reset
const allowResetJWT = (req, res, next) => {
    // Autorise si le token est valide, même avec reset: true
    if (req.user && req.user.id === req.params.id) return next();
    return res.status(401).json({ message: 'Non autorisé' });
};

router.post('/:id/reset-password', allowResetJWT, async (req, res) => {
    const { tempPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user || !user.resetFlag) return res.status(400).json({ message: 'Non autorisé' });
    // Si skipTempPassword (connexion déjà validée par code temporaire)
    if (tempPassword === 'SKIP') {
        // pas de vérification du code temporaire
    } else {
        const match = await bcrypt.compare(tempPassword, user.tempPasswordHash);
        if (!match) return res.status(401).json({ message: 'Code temporaire incorrect' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.resetFlag = false;
    user.tempPasswordHash = null;
    await user.save();
    res.json({ message: 'Mot de passe réinitialisé' });
});

module.exports = router;
