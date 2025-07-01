// RDV par mois sur 2 ans (année courante + précédente)
const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

// RDV par semaine sur 2 ans (année courante + précédente)
router.get('/rdv-per-week', async (req, res) => {
  try {
    const now = new Date();
    const nowYear = now.getFullYear();
    const prevYear = nowYear - 1;
    const start = new Date(prevYear, 0, 1); // 1er janvier année précédente
    const end = new Date(nowYear + 1, 0, 1); // 1er janvier année suivante

    // Récupère tous les rendez-vous sur 2 ans
    const rdvs = await Appointment.find({ start: { $gte: start, $lt: end } });

    // Regroupe par année et semaine ISO
    // Structure: { [year]: { [week]: count } }
    const stats = { [nowYear]: {}, [prevYear]: {} };
    rdvs.forEach(rdv => {
      const d = new Date(rdv.start);
      const year = d.getFullYear();
      const week = getISOWeek(d);
      if (!stats[year]) stats[year] = {};
      if (!stats[year][week]) stats[year][week] = 0;
      stats[year][week]++;
    });

    // Labels S1 à S52
    const labels = Array.from({ length: 52 }, (_, i) => `S${i + 1}`);

    // Pour chaque année, on crée un tableau de 52 valeurs (0 si pas de RDV pour la semaine)
    const dataCurrent = labels.map((l, i) => stats[nowYear][i + 1] || 0);
    const dataPrev = labels.map((l, i) => stats[prevYear][i + 1] || 0);

    res.json({
      labels,
      datasets: [
        { label: `Année ${nowYear}`, data: dataCurrent, backgroundColor: '#1976d2' },
        { label: `Année ${prevYear}`, data: dataPrev, backgroundColor: '#90caf9' }
      ]
    });
  } catch (e) {
    res.status(500).json({ error: 'Erreur statistiques' });
  }
});

// RDV par mois sur 2 ans (année courante + précédente)
router.get('/rdv-per-month', async (req, res) => {
  try {
    const now = new Date();
    const nowYear = now.getFullYear();
    const prevYear = nowYear - 1;
    const start = new Date(prevYear, 0, 1); // 1er janvier année précédente
    const end = new Date(nowYear + 1, 0, 1); // 1er janvier année suivante

    // Récupère tous les rendez-vous sur 2 ans
    const rdvs = await Appointment.find({ start: { $gte: start, $lt: end } });

    // Regroupe par année et mois (1-12)
    // Structure: { [year]: { [month]: count } }
    const stats = { [nowYear]: {}, [prevYear]: {} };
    rdvs.forEach(rdv => {
      const d = new Date(rdv.start);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-12
      if (!stats[year]) stats[year] = {};
      if (!stats[year][month]) stats[year][month] = 0;
      stats[year][month]++;
    });

    // Labels M1 à M12
    const labels = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);

    // Pour chaque année, on crée un tableau de 12 valeurs (0 si pas de RDV pour le mois)
    const dataCurrent = labels.map((l, i) => stats[nowYear][i + 1] || 0);
    const dataPrev = labels.map((l, i) => stats[prevYear][i + 1] || 0);

    res.json({
      labels,
      datasets: [
        { label: `Année ${nowYear}`, data: dataCurrent, backgroundColor: '#1976d2' },
        { label: `Année ${prevYear}`, data: dataPrev, backgroundColor: '#90caf9' }
      ]
    });
  } catch (e) {
    res.status(500).json({ error: 'Erreur statistiques' });
  }
});

// Calcule le numéro de semaine ISO
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

module.exports = router;
