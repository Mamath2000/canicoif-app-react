const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String },
  adresse: {
    rue: String,
    codePostal: String,
    ville: String
  },
  tel: String,
  mobile: String,
  email: String,
  commentaire: String,
  archive: { type: Boolean, default: false } // <-- Ajout du flag archive
}, { timestamps: true });

module.exports = mongoose.model("Client", ClientSchema);