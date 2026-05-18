const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, default: '🏠' },
  floor: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
