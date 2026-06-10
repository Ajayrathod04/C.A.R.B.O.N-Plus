import React from 'react';
import { AlertCircle, Compass, RefreshCw } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import useCarbonData from '../hooks/useCarbonData';
import useAnalytics from '../hooks/useAnalytics';
import WeeklyChart from '../components/WeeklyChart';
import EcoScoreRing from '../components/EcoScoreRing';
import RecentLogsTable from '../components/RecentLogsTable';

export default function DashboardPage({ refreshTrigger, triggerRefresh }) {
  const { t } = useLanguage();
  
  const { 
    dashboardData, 
    loading: carbonLoading, 
    error: carbonError, 
    deleteLog 
  } = useCarbonData(refreshTrigger, triggerRefresh);

  const { 
    analyticsData, 
    loading: analyticsLoading, 
    error: analyticsError 
  } = useAnalytics(refreshTrigger);

  const loading = carbonLoading || analyticsLoading;
  const error = carbonError || analyticsError;

  const handleDeleteLog = async (id) => {
    if (confirm('Are you sure you want to delete this emission log?')) {
      try {
        await deleteLog(id);
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

  return (
    <div className="animate-fade-in">
      {/* Premium SaaS Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            MEASURE.<br />
            UNDERSTAND.<br />
            REDUCE.
          </h1>
          <p className="hero-subtitle">
            Small actions. Big environmental impact.
          </p>
        </div>
        
        {/* Animated Statistics Row */}
        <div className="hero-stats-row">
          <div className="hero-stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="hero-stat-value">12,840+</div>
            <div className="hero-stat-label">Active Navigators</div>
          </div>
          <div className="hero-stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="hero-stat-value">45,280 kg</div>
            <div className="hero-stat-label">Carbon Reduced</div>
          </div>
          <div className="hero-stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="hero-stat-value">3,120</div>
            <div className="hero-stat-label">Trees Saved Equiv.</div>
          </div>
        </div>
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
            <WeeklyChart trend={trend} t={t} />
          </div>
        </div>

        {/* Right Side: Score Circle & Progress Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <EcoScoreRing score={score} improvement={improvement} goals={analyticsData?.goals} t={t} />

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
      <RecentLogsTable 
        recentLogs={dashboardData?.recentLogs} 
        onDeleteLog={handleDeleteLog} 
        onRefresh={triggerRefresh} 
        t={t} 
      />
    </div>
  );
}
