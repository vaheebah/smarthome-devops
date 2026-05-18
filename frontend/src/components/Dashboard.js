import React, { useState } from 'react';
import DeviceCard from './DeviceCard';
import StatsPanel from './StatsPanel';
import AddDeviceModal from './AddDeviceModal';
import './Dashboard.css';

export default function Dashboard({
  devices, rooms, readings, loading, activeRoom,
  setActiveRoom, onToggle, onValueChange, onAddDevice,
  onDeleteDevice, onSeedData, onRefresh
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const allRooms = ['All', ...rooms.map(r => r.name)];
  const filtered = activeRoom === 'All' ? devices : devices.filter(d => d.room === activeRoom);
  const activeDevices = devices.filter(d => d.status).length;

  const getRoomIcon = (name) => {
    const r = rooms.find(r => r.name === name);
    return r ? r.icon : '🏠';
  };

  return (
    <div className="dash-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⌂</span>
            {sidebarOpen && <span className="logo-text mono">NEXUS<span className="logo-accent">HOME</span></span>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {sidebarOpen && <p className="nav-label mono">ROOMS</p>}
          {allRooms.map(room => (
            <button
              key={room}
              className={`nav-item ${activeRoom === room ? 'active' : ''}`}
              onClick={() => setActiveRoom(room)}
              title={room}
            >
              <span className="nav-icon">
                {room === 'All' ? '⬡' : getRoomIcon(room)}
              </span>
              {sidebarOpen && <span className="nav-text">{room}</span>}
              {sidebarOpen && activeRoom === room && (
                <span className="nav-count">
                  {room === 'All' ? devices.length : devices.filter(d => d.room === room).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="status-dot-row">
              <span className="dot green"></span>
              <span className="status-text mono">{activeDevices} ACTIVE</span>
            </div>
            <div className="status-dot-row">
              <span className="dot grey"></span>
              <span className="status-text mono">{devices.length - activeDevices} OFFLINE</span>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="dash-main">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {activeRoom === 'All' ? 'All Devices' : (
                <>{getRoomIcon(activeRoom)} {activeRoom}</>
              )}
            </h1>
            <span className="device-count mono">{filtered.length} devices</span>
          </div>
          <div className="topbar-right">
            {devices.length === 0 && (
              <button className="btn btn-secondary" onClick={onSeedData}>
                ⚡ Load Sample Data
              </button>
            )}
            <button className="btn btn-ghost" onClick={onRefresh} title="Refresh">
              ↻
            </button>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              + Add Device
            </button>
          </div>
        </header>

        {/* STATS */}
        <StatsPanel devices={devices} readings={readings} />

        {/* DEVICE GRID */}
        <div className="section-label mono">
          {activeRoom.toUpperCase()} — DEVICES
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📡</div>
            <p>No devices found</p>
            <p className="empty-sub">Add a device or load sample data to get started</p>
          </div>
        ) : (
          <div className="device-grid">
            {filtered.map(device => (
              <DeviceCard
                key={device._id}
                device={device}
                onToggle={onToggle}
                onValueChange={onValueChange}
                onDelete={onDeleteDevice}
              />
            ))}
          </div>
        )}
      </main>

      {showAdd && (
        <AddDeviceModal
          rooms={rooms}
          onAdd={onAddDevice}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
