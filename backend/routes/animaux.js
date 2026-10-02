const express = require("express");
const router = express.Router();
const Animal = require("../models/Animal");
const Appointment = require("../models/Appointment");
const Client = require("../models/Client"); // Ajout
const ANIMAUX_LIMIT = parseInt(process.env.ANIMAUX_LIMIT, 10) || 15;


// Liste filtrée/paginée des animaux
router.get("/", async (req, res) => {
  try {
    const { nom, espece, race, exclureDecedes, clientId, recents, exclureClientsArchives } = req.query;
    const query = {};
    if (nom) query.nom = new RegExp(nom, "i");
    if (espece) query.espece = new RegExp(espece, "i");
    if (race) query.race = new RegExp(race, "i");
    if (exclureDecedes === "true" || exclureDecedes === true) query.decede = false;
    if (clientId) query.clientId = clientId;

    // Clients archivés exclus directement dans la requête (filtre, tri et limite côté Mongo)
    if (exclureClientsArchives === "true" || exclureClientsArchives === true) {
      const archives = await Client.find({ archive: true }).distinct("_id");
      query.clientId = { ...(clientId ? { $eq: clientId } : { $ne: null }), $nin: archives };
    }

    const animaux = await Animal.find(query)
      .sort(recents === "true" || recents === true ? { updatedAt: -1 } : { nom: 1 })
      .limit(ANIMAUX_LIMIT)
      .populate("clientId", "nom prenom archive")
      .lean();

    res.json(animaux.map(a => ({ ...a, client: a.clientId })));
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer un animal par son ID
router.get("/:animalId", async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.animalId).populate("clientId", "nom prenom");
    if (!animal) return res.status(404).json({ error: "Animal non trouvé" });
    const animalObj = animal.toObject();

    // Si le flag withClient=true est présent, on ajoute le client complet
    if (req.query.withClient === "true") {
      const client = await Client.findById(animal.clientId);
      animalObj.client = client;
    } else {
      animalObj.client = animal.clientId; // nom/prenom déjà peuplé
    }

    // Si le flag withAppointments=true est présent, on ajoute les rendez-vous
    if (req.query.withAppointments === "true") {
      const appointments = await Appointment.find({ animalId: animal._id }).sort({ start: -1 }).lean();
      animalObj.appointments = appointments;
    }

    res.json(animalObj);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'animal" });
  }
});

// Créer un animal
router.post("/", async (req, res) => {
  try {
    // Vérification existence client
    const client = await Client.findById(req.body.clientId);
    if (!client) {
      return res.status(400).json({ error: "Client inexistant" });
    }
    const animal = new Animal(req.body);
    await animal.save();
    const animalPop = await Animal.findById(animal._id).populate("clientId", "nom prenom");
    res.status(201).json({ ...animalPop.toObject(), client: animalPop.clientId });
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de la création de l'animal" });
  }
});

// Modifier un animal
router.put("/:animalId", async (req, res) => {
  try {
    // Vérification existence client si clientId fourni
    if (req.body.clientId) {
      const client = await Client.findById(req.body.clientId);
      if (!client) {
        return res.status(400).json({ error: "Client inexistant" });
      }
    }
    const animal = await Animal.findByIdAndUpdate(req.params.animalId, req.body, { new: true }).populate("clientId", "nom prenom");
    if (!animal) return res.status(404).json({ error: "Animal non trouvé" });
    res.json({ ...animal.toObject(), client: animal.clientId });
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de la mise à jour de l'animal" });
  }
});

// Supprimer un animal
router.delete("/:animalId", async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.animalId);
    if (!animal) return res.status(404).json({ error: "Animal non trouvé" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'animal" });
  }
});

// Récupérer tous les rendez-vous d'un animal
router.get("/:animalId/appointments", async (req, res) => {
  try {
    const { animalId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find({ animalId })
        .sort({ start: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments({ animalId })
    ]);

    res.json({
      appointments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des rendez-vous" });
  }
});

module.exports = router;