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

module.exports = mongoose.model('Appointment', appointmentSchema);