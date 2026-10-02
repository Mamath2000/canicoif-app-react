const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  animalId: { type: Schema.Types.ObjectId, required: false },
  title: { type: String }, 
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  comment: { type: String },
  tarif: { type: Number },
  highlight: { type: Boolean, default: false }
}, { timestamps: true });

// Index : agenda par période (et stats), historique d'un animal
appointmentSchema.index({ start: 1 });
appointmentSchema.index({ animalId: 1, start: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);