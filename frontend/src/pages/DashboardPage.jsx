import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Trash2, AlertCircle, ArrowDown, Award, Calendar, Compass, RefreshCw } from 'lucide-react';

export default function DashboardPage({ refreshTrigger, triggerRefresh }) {
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [dash, analytics] = await Promise.all([
          api.getDashboard(),
          api.getAnalytics()
        ]);
        setDashboardData(dash);
        setAnalyticsData(analytics);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshTrigger]);

  const handleDeleteLog = async (id) => {
    if (confirm('Are you sure you want to delete this emission log?')) {
      try {
        await api.deleteLog(id);
        triggerRefresh();
      } catch (err) {
        alert('Failed to delete log');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading analytics dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ borderColor: 'var(--danger)', textAlign: 'center', padding: '40px 20px' }}>
        <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
        <h3>{error}</h3>
        <button className="btn btn-secondary" onClick={triggerRefresh} style={{ marginTop: '16px' }}>Retry</button>
      </div>
    );
  }

  const score = analyticsData?.ecoScore || 0;
  const trend = analyticsData?.dailyTrend || [];
  const improvement = analyticsData?.improvementPercentage || 0;
  
  // Calculate SVG details for progress ring
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Render SVG Chart for Weekly Trend
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;
  
  // Find max value in trend for Y scale
  const maxVal = Math.max(...trend.map(d => Math.max(d.emissions, d.saved, 5)), 10);
  
  const getX = (index) => paddingX + (index * (chartWidth - paddingX * 2)) / Math.max(1, trend.length - 1);
  const getY = (value) => chartHeight - paddingY - (value / maxVal) * (chartHeight - paddingY * 2);

  // Generate path coordinates
  const emissionsPoints = trend.map((d, i) => `${getX(i)},${getY(d.emissions)}`).join(' ');
  const savedPoints = trend.map((d, i) => `${getX(i)},${getY(d.saved)}`).join(' ');

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 className="gradient-text-green" style={{ fontSize: '32px', marginBottom: '8px' }}>
          {t('brandName')} Dashboard
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {t('subheading')}
        </p>
      </div>

      {/* Analytics Score & Stats Row */}
      <div className="analytics-grid">
        {/* Left Side: Score & Core Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="dashboard-grid" style={{ marginTop: 0 }}>
            {/* Daily */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>{t('daily')}</p>
                <h3 style={{ fontSize: '28px', marginTop: '8px' }}>
                  {dashboardData?.daily?.total || 0} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>kg CO2e</span>
                </h3>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <span className="badge badge-success" style={{ fontSize: '9px' }}>T: {dashboardData?.daily?.breakdown?.transport || 0}</span>
                <span className="badge badge-warning" style={{ fontSize: '9px' }}>E: {dashboardData?.daily?.breakdown?.electricity || 0}</span>
                <span className="badge badge-danger" style={{ fontSize: '9px' }}>W: {dashboardData?.daily?.breakdown?.waste || 0}</span>
              </div>
            </div>

            {/* Weekly */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>{t('weekly')}</p>
                <h3 style={{ fontSize: '28px', marginTop: '8px' }}>
                  {dashboardData?.weekly?.total || 0} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>kg CO2e</span>
                </h3>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <span className="badge badge-success" style={{ fontSize: '9px' }}>T: {dashboardData?.weekly?.breakdown?.transport || 0}</span>
                <span className="badge badge-warning" style={{ fontSize: '9px' }}>E: {dashboardData?.weekly?.breakdown?.electricity || 0}</span>
                <span className="badge badge-danger" style={{ fontSize: '9px' }}>W: {dashboardData?.weekly?.breakdown?.waste || 0}</span>
              </div>
            </div>

            {/* Monthly */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>{t('monthly')}</p>
                <h3 style={{ fontSize: '28px', marginTop: '8px' }}>
                  {dashboardData?.monthly?.total || 0} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>kg CO2e</span>
                </h3>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <span className="badge badge-success" style={{ fontSize: '9px' }}>T: {dashboardData?.monthly?.breakdown?.transport || 0}</span>
                <span className="badge badge-warning" style={{ fontSize: '9px' }}>E: {dashboardData?.monthly?.breakdown?.electricity || 0}</span>
                <span className="badge badge-danger" style={{ fontSize: '9px' }}>W: {dashboardData?.monthly?.breakdown?.waste || 0}</span>
              </div>
            </div>
          </div>

          {/* Weekly Carbon Chart */}
          <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Carbon Emissions vs Savings Trend (7 Days)</h3>
            
            {trend.length > 0 ? (
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
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>{t('noData')}</p>
            )}
          </div>
        </div>

        {/* Right Side: Score Circle & Progress Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Eco Score ring */}
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
                  {analyticsData?.goals?.completed || 0}/{analyticsData?.goals?.total || 0}
                </h4>
              </div>
            </div>
          </div>

          {/* Commuting behavioral badge */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
              <Compass size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '2px' }}>Eco-Friendly Transit</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {analyticsData?.behavioral?.ecoFriendlyCommutePercentage || 0}% of your commutes are clean transit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="glass-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px' }}>{t('recentLogs')}</h3>
          <button className="btn btn-secondary" onClick={triggerRefresh} style={{ padding: '6px 12px', fontSize: '12px' }}>
            <RefreshCw size={12} />
          </button>
        </div>

        {dashboardData?.recentLogs?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Transportation</th>
                  <th style={{ padding: '12px' }}>Electricity</th>
                  <th style={{ padding: '12px' }}>Diet</th>
                  <th style={{ padding: '12px' }}>Waste</th>
                  <th style={{ padding: '12px' }}>Total (CO2e)</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid hsla(0,0%,100%,0.02)', fontSize: '14px' }}>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                        {log.date}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {log.transportDistance > 0 ? (
                        <span>{t(log.transportType.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()))} ({log.transportDistance} km)</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {log.electricityKwh > 0 ? (
                        <span>{log.electricityKwh} kWh ({t(log.electricityType)})</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span>{t(log.foodHabit)}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {log.wasteWeight > 0 ? (
                        <span>{log.wasteWeight} kg ({t(log.wasteType)})</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--danger)' }}>
                      {log.total} kg
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteLog(log.id)}
                        style={{ background: 'transparent', padding: '6px', color: 'var(--danger)' }}
                        title="Delete log"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Compass size={36} style={{ marginBottom: '12px', strokeWidth: 1.5 }} />
            <p>{t('noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
