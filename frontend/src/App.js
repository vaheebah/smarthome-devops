import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import './App.css';

const API = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState('All');

  const fetchData = async () => {
    try {
      const [devRes, roomRes, readRes] = await Promise.all([
        axios.get(`${API}/devices`),
        axios.get(`${API}/rooms`),
        axios.get(`${API}/readings/latest`)
      ]);
      setDevices(devRes.data);
      setRooms(roomRes.data);
      setReadings(readRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = async (id) => {
    try {
      const res = await axios.patch(`${API}/devices/${id}/toggle`);
      setDevices(prev => prev.map(d => d._id === id ? res.data : d));
    } catch (err) {
      console.error(err);
    }
  };

  const updateValue = async (id, value) => {
    try {
      const res = await axios.patch(`${API}/devices/${id}/value`, { value });
      setDevices(prev => prev.map(d => d._id === id ? res.data : d));
    } catch (err) {
      console.error(err);
    }
  };

  const addDevice = async (deviceData) => {
    try {
      const res = await axios.post(`${API}/devices`, deviceData);
      setDevices(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDevice = async (id) => {
    try {
      await axios.delete(`${API}/devices/${id}`);
      setDevices(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const seedData = async () => {
    const sampleRooms = [
      { name: 'Living Room', icon: '🛋️', floor: 1 },
      { name: 'Bedroom', icon: '🛏️', floor: 2 },
      { name: 'Kitchen', icon: '🍳', floor: 1 },
      { name: 'Garage', icon: '🚗', floor: 0 },
    ];
    for (const r of sampleRooms) {
      try { await axios.post(`${API}/rooms`, r); } catch {}
    }

    const sampleDevices = [
      { name: 'Main Light', type: 'light', room: 'Living Room', status: true, value: 80, unit: '%', icon: '💡' },
      { name: 'AC Unit', type: 'thermostat', room: 'Living Room', status: true, value: 22, unit: '°C', icon: '❄️' },
      { name: 'Smart Lock', type: 'lock', room: 'Living Room', status: false, icon: '🔒' },
      { name: 'Ceiling Fan', type: 'fan', room: 'Bedroom', status: false, value: 3, unit: 'speed', icon: '🌀' },
      { name: 'Bedside Lamp', type: 'light', room: 'Bedroom', status: true, value: 40, unit: '%', icon: '🪔' },
      { name: 'Security Cam', type: 'camera', room: 'Garage', status: true, icon: '📷' },
      { name: 'Temp Sensor', type: 'sensor', room: 'Kitchen', status: true, value: 24, unit: '°C', icon: '🌡️' },
      { name: 'Smart Plug', type: 'plug', room: 'Kitchen', status: false, value: 0, unit: 'W', icon: '🔌' },
    ];
    for (const d of sampleDevices) {
      try { await axios.post(`${API}/devices`, d); } catch {}
    }
    await fetchData();
  };

  return (
    <Dashboard
      devices={devices}
      rooms={rooms}
      readings={readings}
      loading={loading}
      activeRoom={activeRoom}
      setActiveRoom={setActiveRoom}
      onToggle={toggleDevice}
      onValueChange={updateValue}
      onAddDevice={addDevice}
      onDeleteDevice={deleteDevice}
      onSeedData={seedData}
      onRefresh={fetchData}
    />
  );
}

export default App;
