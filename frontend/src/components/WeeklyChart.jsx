import React, { useMemo } from 'react';

export default function WeeklyChart({ trend, t }) {
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  // Find max value in trend for Y scale
  const maxVal = useMemo(() => {
    if (!trend || trend.length === 0) return 10;
    return Math.max(...trend.map(d => Math.max(d.emissions, d.saved, 5)), 10);
  }, [trend]);

  const getX = (index) => paddingX + (index * (chartWidth - paddingX * 2)) / Math.max(1, trend.length - 1);
  const getY = (value) => chartHeight - paddingY - (value / maxVal) * (chartHeight - paddingY * 2);

  // Generate path coordinates
  const { emissionsPoints, savedPoints } = useMemo(() => {
    if (!trend || trend.length === 0) return { emissionsPoints: '', savedPoints: '' };
    return {
      emissionsPoints: trend.map((d, i) => `${getX(i)},${getY(d.emissions)}`).join(' '),
      savedPoints: trend.map((d, i) => `${getX(i)},${getY(d.saved)}`).join(' ')
    };
  }, [trend, maxVal]);

  if (!trend || trend.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>{t('noData')}</p>;
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', minWidth: '400px', height: 'auto' }}>
        <defs>
          <linearGradient id="emissionsGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="var(--danger)" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="savedGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Grid Lines */}
        <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="hsla(0,0%,100%,0.05)" />
        <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="hsla(0,0%,100%,0.05)" />
        <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="hsla(0,0%,100%,0.05)" />

        {/* Filled Areas */}
        <path d={`M ${getX(0)} ${chartHeight - paddingY} L ${emissionsPoints} L ${getX(trend.length - 1)} ${chartHeight - paddingY} Z`} fill="url(#emissionsGlow)" />
        <path d={`M ${getX(0)} ${chartHeight - paddingY} L ${savedPoints} L ${getX(trend.length - 1)} ${chartHeight - paddingY} Z`} fill="url(#savedGlow)" />

        {/* Lines */}
        <polyline fill="none" stroke="var(--danger)" strokeWidth="3" points={emissionsPoints} />
        <polyline fill="none" stroke="var(--primary)" strokeWidth="3" points={savedPoints} />

        {/* Draw dots */}
        {trend.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.emissions)} r="4" fill="var(--danger)" />
            <circle cx={getX(i)} cy={getY(d.saved)} r="4" fill="var(--primary)" />
          </g>
        ))}

        {/* X axis labels */}
        {trend.map((d, i) => {
          const dateObj = new Date(d.date);
          const label = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
          return (
            <text key={i} x={getX(i)} y={chartHeight - 4} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
              {label}
            </text>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--danger)', borderRadius: '2px' }}></span>
          <span>Emissions (kg CO2e)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }}></span>
          <span>Saved (kg CO2e)</span>
        </div>
      </div>
    </div>
  );
}
