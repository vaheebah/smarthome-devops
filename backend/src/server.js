const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const deviceRoutes = require('./routes/devices');
const readingRoutes = require('./routes/readings');
const roomRoutes = require('./routes/rooms');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/rooms', roomRoutes);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smarthome';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
