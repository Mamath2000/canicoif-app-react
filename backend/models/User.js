const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  resetFlag: { type: Boolean, default: false },
  tempPasswordHash: { type: String, default: null },
});

module.exports = mongoose.model('User', userSchema);
