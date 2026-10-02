const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const { isAdmin } = require('./login');
const router = express.Router();

// Liste des utilisateurs
router.get('/', isAdmin, async (req, res) => {
    const users = await User.find({}, '-passwordHash -tempPasswordHash');
    res.json(users);
});

// Créer un utilisateur
router.post('/', isAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: 'Champs manquants' });

    // Vérification des doublons
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(409).json({ error: 'Nom d\'utilisateur déjà pris' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, role });
    res.status(201).json({ id: user._id, username: user.username, role: user.role });
});

// Flag pour réinitialisation du mot de passe
router.post('/:id/flag-reset', isAdmin, async (req, res) => {
    const tempPassword = String(crypto.randomInt(100000000)).padStart(8, '0'); // 8 chiffres
    const tempPasswordHash = await bcrypt.hash(tempPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { resetFlag: true, tempPasswordHash });
    res.json({ tempPassword }); // Affiché à l'admin uniquement
});

// Réinitialisation du mot de passe par l'utilisateur
// Middleware spécial pour autoriser la réinit même avec un token de reset
const allowResetJWT = (req, res, next) => {
    // Autorise si le token est valide, même avec reset: true
    if (req.user && req.user.id === req.params.id) return next();
    return res.status(401).json({ error: 'Non autorisé' });
};

router.post('/:id/reset-password', allowResetJWT, async (req, res) => {
    const { tempPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user || !user.resetFlag) return res.status(400).json({ error: 'Non autorisé' });
    // Si skipTempPassword (connexion déjà validée par code temporaire)
    if (tempPassword === 'SKIP') {
        // pas de vérification du code temporaire
    } else {
        const match = await bcrypt.compare(tempPassword, user.tempPasswordHash);
        if (!match) return res.status(401).json({ error: 'Code temporaire incorrect' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.resetFlag = false;
    user.tempPasswordHash = null;
    await user.save();
    res.json({ message: 'Mot de passe réinitialisé' });
});

// Supprimer un utilisateur
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        if (user.username === 'admin') {
            // 400 et non 403 : le front traite tout 403 comme une session invalide (déconnexion)
            return res.status(400).json({ error: 'Impossible de supprimer l\'utilisateur admin' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
});

module.exports = router;
