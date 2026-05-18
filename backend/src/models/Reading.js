const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  room: { type: String, required: true },
  type: { type: String, required: true },   // temperature, humidity, motion, energy
  value: { type: Number, required: true },
  unit: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reading', readingSchema);
