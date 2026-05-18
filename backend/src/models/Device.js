const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['light', 'thermostat', 'lock', 'camera', 'fan', 'sensor', 'plug'],
    required: true
  },
  room: { type: String, required: true },
  status: { type: Boolean, default: false },
  value: { type: Number, default: null },   // e.g. brightness %, temperature
  unit: { type: String, default: '' },
  icon: { type: String, default: '💡' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
