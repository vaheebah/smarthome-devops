const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// GET all devices
router.get('/', async (req, res) => {
  try {
    const devices = await Device.find().sort({ room: 1, name: 1 });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET devices by room
router.get('/room/:room', async (req, res) => {
  try {
    const devices = await Device.find({ room: req.params.room });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single device
router.get('/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create device
router.post('/', async (req, res) => {
  try {
    const device = new Device(req.body);
    await device.save();
    res.status(201).json(device);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH toggle status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    device.status = !device.status;
    device.lastUpdated = new Date();
    await device.save();
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update value (brightness, temperature, etc.)
router.patch('/:id/value', async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { value: req.body.value, lastUpdated: new Date() },
      { new: true }
    );
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE device
router.delete('/:id', async (req, res) => {
  try {
    await Device.findByIdAndDelete(req.params.id);
    res.json({ message: 'Device deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
