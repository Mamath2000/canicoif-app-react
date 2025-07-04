// RDV par mois sur 2 ans (année courante + précédente)
const express = require('express');
const GlobalSettings = require('../models/GlobalSettings');
const router = express.Router();

// Route pour gérer les paramètres globaux
router.get('/', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { showStatsFlag } = req.body;

    if (typeof showStatsFlag !== 'boolean') {
      return res.status(400).json({ error: 'Le champ showStats doit être un booléen.' });
    }

    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = new GlobalSettings({ showStatsFlag });
    } else {
      settings.showStatsFlag = showStatsFlag;
    }

    await settings.save();
    res.status(200).json(settings);
  } catch (e) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres.' });
  }
});

module.exports = router;
