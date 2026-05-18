import React, { useState } from 'react';
import './DeviceCard.css';

const TYPE_COLORS = {
  light: '#f59e0b',
  thermostat: '#00e5ff',
  lock: '#7c3aed',
  camera: '#ef4444',
  fan: '#10b981',
  sensor: '#06b6d4',
  plug: '#f97316',
};

export default function DeviceCard({ device, onToggle, onValueChange, onDelete }) {
  const [showSlider, setShowSlider] = useState(false);
  const color = TYPE_COLORS[device.type] || '#64748b';
  const hasValue = device.value !== null && device.value !== undefined;

  return (
    <div
      className={`device-card ${device.status ? 'on' : 'off'}`}
      style={{ '--card-color': color }}
      id={`device-${device._id}`}
    >
      <div className="card-top">
        <span className="device-icon">{device.icon}</span>
        <div className="card-type mono">{device.type.toUpperCase()}</div>
        <button
          className="delete-btn"
          onClick={() => onDelete(device._id)}
          title="Remove device"
        >×</button>
      </div>

      <div className="card-body">
        <h3 className="device-name">{device.name}</h3>
        <p className="device-room">{device.room}</p>

        {hasValue && (
          <div className="device-value mono">
            {device.value}
            <span className="device-unit">{device.unit}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        {hasValue && ['light', 'fan', 'thermostat', 'plug'].includes(device.type) && (
          <button
            className="slider-toggle"
            onClick={() => setShowSlider(!showSlider)}
          >
            {showSlider ? '▲' : '▼'}
          </button>
        )}

        <div className="toggle-wrapper">
          <span className="toggle-label mono">{device.status ? 'ON' : 'OFF'}</span>
          <button
            className={`toggle-switch ${device.status ? 'active' : ''}`}
            onClick={() => onToggle(device._id)}
            aria-label={`Toggle ${device.name}`}
          >
            <span className="toggle-knob"></span>
          </button>
        </div>
      </div>

      {showSlider && hasValue && (
        <div className="slider-panel">
          <input
            type="range"
            min={device.type === 'thermostat' ? 16 : 0}
            max={device.type === 'thermostat' ? 32 : 100}
            value={device.value}
            onChange={e => onValueChange(device._id, Number(e.target.value))}
            className="value-slider"
            style={{ '--slider-color': color }}
          />
          <span className="slider-val mono">{device.value}{device.unit}</span>
        </div>
      )}

      <div className="card-glow"></div>
    </div>
  );
}
