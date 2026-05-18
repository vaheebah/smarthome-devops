import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import './StatsPanel.css';

function StatCard({ label, value, sub, color, trend }) {
  return (
    <div className="stat-card" style={{ '--sc': color }}>
      <div className="stat-top">
        <span className="stat-label mono">{label}</span>
      </div>
      <div className="stat-value mono">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {trend && (
        <div className="stat-trend">
          <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={trend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                fill={color + '22'}
                strokeWidth={1.5}
                dot={false}
              />
              <Tooltip
                contentStyle={{ background: '#111318', border: '1px solid #1e2330', borderRadius: '6px', fontSize: '0.7rem' }}
                itemStyle={{ color: color }}
                labelFormatter={() => ''}
                formatter={(v) => [v, '']}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function StatsPanel({ devices, readings }) {
  const on = devices.filter(d => d.status).length;
  const off = devices.length - on;
  const lights = devices.filter(d => d.type === 'light' && d.status).length;
  const thermostats = devices.filter(d => d.type === 'thermostat');
  const avgTemp = thermostats.length > 0
    ? (thermostats.reduce((s, d) => s + (d.value || 0), 0) / thermostats.length).toFixed(1)
    : '--';

  // Simulated mini sparkline data
  const makeTrend = (base, variance, n = 12) =>
    [...Array(n)].map((_, i) => ({ v: +(base + (Math.random() - 0.5) * variance).toFixed(1) }));

  return (
    <div className="stats-panel">
      <StatCard
        label="ACTIVE DEVICES"
        value={on}
        sub={`${off} offline · ${devices.length} total`}
        color="#00e5ff"
        trend={makeTrend(on, 2)}
      />
      <StatCard
        label="LIGHTS ON"
        value={lights}
        sub={`of ${devices.filter(d => d.type === 'light').length} lights`}
        color="#f59e0b"
        trend={makeTrend(lights, 1)}
      />
      <StatCard
        label="AVG TEMPERATURE"
        value={avgTemp === '--' ? '--' : `${avgTemp}°C`}
        sub={`${thermostats.length} thermostat${thermostats.length !== 1 ? 's' : ''}`}
        color="#10b981"
        trend={makeTrend(Number(avgTemp) || 22, 2)}
      />
      <StatCard
        label="TOTAL DEVICES"
        value={devices.length}
        sub={`across ${[...new Set(devices.map(d => d.room))].length} rooms`}
        color="#7c3aed"
        trend={makeTrend(devices.length, 0)}
      />
    </div>
  );
}
