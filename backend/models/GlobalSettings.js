const mongoose = require('mongoose');

const GlobalSettingsSchema = new mongoose.Schema({
  showStatsFlag: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('GlobalSettings', GlobalSettingsSchema);
