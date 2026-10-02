const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnimalSchema = new Schema({
  nom: { type: String, required: true },
  espece: { type: String, required: true },
  race: String,
  taille: String,
  couleur: String,
  comportement: String,
  dateNaissance: Date,
  activiteDefault: String,
  decede: { type: Boolean, default: false },
  tarif: Number,
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true }
}, { timestamps: true });

// Index : animaux d'un client, liste des récents, tri par nom
AnimalSchema.index({ clientId: 1 });
AnimalSchema.index({ updatedAt: -1 });
AnimalSchema.index({ nom: 1 });

module.exports = mongoose.model('Animal', AnimalSchema);