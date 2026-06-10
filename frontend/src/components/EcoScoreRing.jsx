import React, { useMemo } from 'react';
import { ArrowDown } from 'lucide-react';

export default function EcoScoreRing({ score, improvement, goals, t }) {
  const radius = 60;
  const circumference = useMemo(() => 2 * Math.PI * radius, []);
  const strokeDashoffset = useMemo(() => circumference - (score / 100) * circumference, [score, circumference]);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>{t('ecoScore')}</h3>
      
      <div className="progress-ring-container">
        <svg width="150" height="150">
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="hsla(142, 71%, 45%, 0.1)"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            className="progress-ring-circle"
            cx="75"
            cy="75"
            r={radius}
            stroke="var(--primary)"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px var(--primary-glow))' }}
          />
        </svg>
        <div className="progress-ring-text">
          <div style={{ fontSize: '32px', color: 'var(--text-main)' }}>{score}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ECO</div>
        </div>
      </div>

      <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
        {score >= 80 ? '🌱 Exceptional Sustainability Score!' : 
         score >= 50 ? '🌿 Good effort, but room for improvement.' : 
         '⚠️ High impact. Try logging green habits to reduce your footprint.'}
      </p>

      <div style={{ borderTop: '1px solid var(--border-color)', width: '100%', marginTop: '20px', paddingTop: '16px', display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('improvement')}</p>
          <h4 style={{ color: improvement >= 0 ? 'var(--primary)' : 'var(--danger)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            {improvement >= 0 ? <ArrowDown size={14} /> : ''}
            {improvement.toFixed(1)}%
          </h4>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Goals Met</p>
          <h4 style={{ fontSize: '18px', color: 'var(--accent)' }}>
            {goals?.completed || 0}/{goals?.total || 0}
          </h4>
        </div>
      </div>
    </div>
  );
}
