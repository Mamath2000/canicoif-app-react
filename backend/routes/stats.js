// Statistiques des rendez-vous sur 2 ans (année courante + précédente), comptées par MongoDB
const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

// Fuseau du serveur : les regroupements par année / semaine / mois se font à l'heure locale
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Compte les RDV des 2 dernières années, groupés par année civile et par période ($isoWeek ou $month)
async function countPerPeriod(periodOperator) {
  const nowYear = new Date().getFullYear();
  const prevYear = nowYear - 1;
  const start = new Date(prevYear, 0, 1); // 1er janvier année précédente
  const end = new Date(nowYear + 1, 0, 1); // 1er janvier année suivante

  const rows = await Appointment.aggregate([
    { $match: { start: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: {
          year: { $year: { date: '$start', timezone: TIMEZONE } },
          period: { [periodOperator]: { date: '$start', timezone: TIMEZONE } },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // Structure: { [year]: { [period]: count } }
  const stats = { [nowYear]: {}, [prevYear]: {} };
  rows.forEach(({ _id, count }) => {
    if (!stats[_id.year]) stats[_id.year] = {};
    stats[_id.year][_id.period] = count;
  });
  return { stats, nowYear, prevYear };
}

function chartData(labels, { stats, nowYear, prevYear }) {
  // Pour chaque année, un tableau de valeurs (0 si pas de RDV sur la période)
  const dataCurrent = labels.map((l, i) => stats[nowYear][i + 1] || 0);
  const dataPrev = labels.map((l, i) => stats[prevYear][i + 1] || 0);
  return {
    labels,
    datasets: [
      { label: `Année ${nowYear}`, data: dataCurrent, backgroundColor: '#1976d2' },
      { label: `Année ${prevYear}`, data: dataPrev, backgroundColor: '#90caf9' }
    ]
  };
}

// RDV par semaine ISO (S1 à S52)
router.get('/rdv-per-week', async (req, res) => {
  try {
    const labels = Array.from({ length: 52 }, (_, i) => `S${i + 1}`);
    res.json(chartData(labels, await countPerPeriod('$isoWeek')));
  } catch (e) {
    res.status(500).json({ error: 'Erreur statistiques' });
  }
});

// RDV par mois (M1 à M12)
router.get('/rdv-per-month', async (req, res) => {
  try {
    const labels = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
    res.json(chartData(labels, await countPerPeriod('$month')));
  } catch (e) {
    res.status(500).json({ error: 'Erreur statistiques' });
  }
});

module.exports = router;
