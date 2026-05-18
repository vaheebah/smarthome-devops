const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');

// GET latest readings per room/type
router.get('/latest', async (req, res) => {
  try {
    const readings = await Reading.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET readings for a specific device (last 24 hours)
router.get('/device/:deviceId', async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const readings = await Reading.find({
      deviceId: req.params.deviceId,
      timestamp: { $gte: since }
    }).sort({ timestamp: 1 });
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new reading
router.post('/', async (req, res) => {
  try {
    const reading = new Reading(req.body);
    await reading.save();
    res.status(201).json(reading);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET summary stats
router.get('/summary', async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stats = await Reading.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: { room: '$room', type: '$type' },
          avg: { $avg: '$value' },
          min: { $min: '$value' },
          max: { $max: '$value' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
