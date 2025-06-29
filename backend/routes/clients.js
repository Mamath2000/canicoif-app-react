const express = require("express");
const router = express.Router();
const Client = require('../models/Client');
const Appointment = require('../models/Appointment'); // ou le nom de ton modèle
const Animal = require('../models/Animal'); // à ajouter en haut

const CLIENTS_LIMIT = parseInt(process.env.CLIENTS_LIMIT, 10) || 15;

// Lire tous les clients
router.get("/", async (req, res) => {
  const query = {};
  let clientIdsFromAnimal = null;

  // 1. Si filtre animal, cherche les animaux correspondants et récupère leurs clientId
  if (req.query.animal) {
    const animaux = await Animal.find({ nom: { $regex: req.query.animal, $options: "i" } }, "clientId");
    clientIdsFromAnimal = animaux.map(a => a.clientId);
    if (clientIdsFromAnimal.length === 0) {
      // Aucun animal trouvé, donc aucun client à retourner
      return res.json([]);
    }
    query._id = { $in: clientIdsFromAnimal };
  }

  if (req.query.nom) query.nom = { $regex: req.query.nom, $options: "i" };
  if (req.query.tel) query.$or = [
    { tel: { $regex: req.query.tel, $options: "i" } },
    { mobile: { $regex: req.query.tel, $options: "i" } }
  ];

  // Filtrage sur l'archivage (nouvelle logique : exclureArchives comme pour animaux)
  // Si exclureArchives est true (par défaut), on exclut les archivés
  // Si exclureArchives est false, on retourne tout
  if (req.query.exclureArchives === undefined || req.query.exclureArchives === "true" || req.query.exclureArchives === true) {
    query.archive = { $ne: true };
  }
  // Si exclureArchives est "false" ou false, on ne filtre pas

  try {
    const clients = await Client.find(query)
      .sort({ nom: 1 }) // Trie par nom de client (ordre alphabétique)
      .limit(CLIENTS_LIMIT);

    // Ajout : si withAnimaux=true, on ajoute les animaux à chaque client
    if (req.query.withAnimaux === "true") {
      const clientIds = clients.map(c => c._id);
      const animaux = await Animal.find({ clientId: { $in: clientIds } }).lean();
      const animauxByClient = {};
      animaux.forEach(a => {
        const cid = String(a.clientId);
        if (!animauxByClient[cid]) animauxByClient[cid] = [];
        animauxByClient[cid].push(a);
      });
      const clientsWithAnimaux = clients.map(c => ({
        ...c.toObject(),
        animaux: animauxByClient[String(c._id)] || []
      }));
      return res.json(clientsWithAnimaux);
    }

    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la recherche" });
  }
});

// Créer un client
router.post("/", async (req, res) => {
  try {
    const client = new Client(req.body);  
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });  
  }  
});  

// Lire un client par ID (+ animaux si demandé)
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: "Client non trouvé" });

    // Si le flag withAnimaux=true est présent, on ajoute les animaux
    if (req.query.withAnimaux === "true") {
      let animaux = await Animal.find({ clientId: client._id }).lean();

      // Si le flag withAppointments=true est aussi présent, on ajoute les rendez-vous à chaque animal
      if (req.query.withAppointments === "true") {
        const animalIds = Array.isArray(animaux) ? (animaux || []).map(a => a._id) : [];
        const appointments = await Appointment.find({ animalId: { $in: animalIds } }).lean();

        // On ajoute les appointments à chaque animal
        animaux = Array.isArray(animaux)
          ? animaux.map(animal => ({
              ...animal,
              appointments: Array.isArray(appointments)
                ? appointments.filter(rdv => String(rdv.animalId) === String(animal._id))
                : []
            }))
          : [];
      }

      return res.json({ ...client.toObject(), animaux: Array.isArray(animaux) ? animaux : [] });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Modifier un client
router.put("/:id", async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ error: "Client non trouvé" });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un client
router.delete("/:id", async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) return res.status(404).json({ error: "Client non trouvé" });
  res.json({ message: "Client supprimé" });
});

module.exports = router;