const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Animal = require('../models/Animal'); // Assure-toi que c'est bien importé


router.get('/', async (req, res) => {
  try {
    let { start, end } = req.query;
    let query = {};
    if (start && end) {
      // Ajoute l'heure minuit pour start et minuit du lendemain pour end
      const startDate = new Date(`${start}T00:00:00.000Z`);
      const endDate = new Date(`${end}T00:00:00.000Z`);
      query.start = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query);

    // On récupère tous les animaux concernés en une seule requête
    const animalIds = appointments.map(a => a.animalId).filter(Boolean);
    const animaux = await Animal.find({ _id: { $in: animalIds } }).select('comportement nom').lean();
    const animauxById = {};
    animaux.forEach(a => { animauxById[a._id.toString()] = a; });

    // On ajoute le comportement dynamiquement à chaque rendez-vous
    const result = appointments.map(a => {
      const animal = animauxById[a.animalId?.toString()];
      return {
        ...a.toObject(),
        animal: animal,
        comportement: animal?.comportement || ""
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  try {
    const { animalId, title, start, end, highlight, comment, tarif } = req.body;
    const appointment = new Appointment({
      animalId,
      title,
      start,
      end,
      highlight: highlight || false,
      comment: comment || "",
      tarif: tarif || null,
    });
    await appointment.save();

    // Met à jour la date de modification de l'animal
    if (animalId) {
      await Animal.findByIdAndUpdate(animalId, { $set: { updatedAt: new Date() } });
    }
    
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id || id === "undefined") {
    return res.status(400).json({ error: "Id manquant ou invalide" });
  }
  try {
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        appointment[key] = req.body[key];
      }
    });
    await appointment.save();

    // Met à jour la date de modification de l'animal lié au rendez-vous
    if (appointment.animalId) {
      await Animal.findByIdAndUpdate(appointment.animalId, { $set: { updatedAt: new Date() } });
    }

    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;