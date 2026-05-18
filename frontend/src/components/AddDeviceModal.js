import React, { useState } from 'react';
import './AddDeviceModal.css';

const DEVICE_ICONS = {
  light: '💡', thermostat: '❄️', lock: '🔒',
  camera: '📷', fan: '🌀', sensor: '🌡️', plug: '🔌'
};

export default function AddDeviceModal({ rooms, onAdd, onClose }) {
  const [form, setForm] = useState({
    name: '', type: 'light', room: rooms[0]?.name || '',
    value: '', unit: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' ? { icon: DEVICE_ICONS[value] } : {})
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.room) return;
    onAdd({
      ...form,
      icon: DEVICE_ICONS[form.type],
      value: form.value !== '' ? Number(form.value) : null,
      status: false
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Device</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label mono">DEVICE NAME</label>
            <input
              className="form-input"
              name="name"
              placeholder="e.g. Living Room Light"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label mono">TYPE</label>
              <select className="form-input" name="type" value={form.type} onChange={handleChange}>
                {Object.keys(DEVICE_ICONS).map(t => (
                  <option key={t} value={t}>{DEVICE_ICONS[t]} {t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label mono">ROOM</label>
              <select className="form-input" name="room" value={form.room} onChange={handleChange}>
                {rooms.map(r => (
                  <option key={r._id} value={r.name}>{r.icon} {r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label mono">INITIAL VALUE</label>
              <input
                className="form-input"
                name="value"
                type="number"
                placeholder="e.g. 75"
                value={form.value}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label mono">UNIT</label>
              <input
                className="form-input"
                name="unit"
                placeholder="%, °C, W..."
                value={form.unit}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-modal btn-submit" onClick={handleSubmit}>Add Device</button>
        </div>
      </div>
    </div>
  );
}
