import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import useLanguage from '../hooks/useLanguage';
import { Lightbulb, Info, RefreshCw, Star, Download, TrendingDown, Users, Award, HelpCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';

/**
 * Insights and sustainability tools page component.
 * Features: Personalized recommendations, AI Roadmap, Carbon Simulator, Community leaderboard and Report downloader.
 * @param {Object} props
 * @param {number} props.refreshTrigger - Trigger page data reload
 */
export default function InsightsPage({ refreshTrigger }) {
  const { t } = useLanguage();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Roadmap State
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState(null);

  // Report State
  const [reportLoading, setReportLoading] = useState(false);

  // Carbon Simulator State
  const [simDeed, setSimDeed] = useState('cycling');
  const [simDays, setSimDays] = useState(3);
  const [commuteDistance, setCommuteDistance] = useState(15); // standard commute distance in km

  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true);
        const data = await api.getInsights();
        setInsights(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [refreshTrigger]);

  // Priority color utility
  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'high':
        return 'var(--danger)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--primary)';
      default:
        return 'var(--text-muted)';
    }
  }, []);

  // Fetch AI Roadmap
  const handleFetchRoadmap = useCallback(async () => {
    try {
      setRoadmapLoading(true);
      setRoadmapError(null);
      const data = await api.getRoadmap();
      setRoadmap(data);
    } catch (err) {
      setRoadmapError('Failed to fetch AI Roadmap. Please try again.');
    } finally {
      setRoadmapLoading(false);
    }
  }, []);

  // Download Sustainability Report
  const handleDownloadReport = useCallback(async () => {
    try {
      setReportLoading(true);
      const data = await api.getReport();
      
      const blob = new Blob([data.reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carbon-plus-report-${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate report file.');
    } finally {
      setReportLoading(false);
    }
  }, []);

  // Memoized Simulator calculations
  const simulatedSavings = useMemo(() => {
    let dailySaving = 0; // kg CO2e
    
    switch (simDeed) {
      case 'cycling':
        // Commute distance * 2 trips * 0.20 kg saved per km
        dailySaving = commuteDistance * 2 * 0.20;
        break;
      case 'transit':
        // Commute distance * 2 trips * 0.12 kg saved (0.20 car - 0.08 transit)
        dailySaving = commuteDistance * 2 * 0.12;
        break;
      case 'diet':
        // meat_heavy to vegan difference per day
        dailySaving = 5.7;
        break;
      case 'standby':
        // standby power average saving per day
        dailySaving = 0.8;
        break;
      default:
        dailySaving = 0;
    }

    const weekly = dailySaving * simDays;
    const annual = weekly * 52;

    return {
      weekly: Number(weekly.toFixed(1)),
      annual: Number(annual.toFixed(0))
    };
  }, [simDeed, simDays, commuteDistance]);

  // Mock community leaderboard data
  const leaderboard = useMemo(() => [
    { rank: 1, name: 'EcoPioneer_26', offset: 240, badge: 'Forest Protector' },
    { rank: 2, name: 'GreenGuardian', offset: 198, badge: 'Carbon Slayer' },
    { rank: 3, name: 'SolarCycle_09', offset: 175, badge: 'Green Commuter' },
    { rank: 4, name: 'ZeroWasteHero', offset: 142, badge: 'Landfill Divert' },
    { rank: 5, name: 'EcoSaver_99', offset: 110, badge: 'Efficiency Ace' }
  ], []);

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
      
      {/* Left Column: Recommendations & AI Roadmap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Banner */}
        <Card style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <Info size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>{t('insights')} & Recommendations</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
              Personalized carbon reduction suggestions computed based on your logged transport, energy, and diet activities.
            </p>
          </div>
        </Card>

        {/* Dynamic Recommendations List */}
        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>Personalized Action Tips</h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {insights.map((ins, i) => (
                <div 
                  key={ins.id || i}
                  className="glass-card" 
                  style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    alignItems: 'flex-start',
                    borderLeft: `5px solid ${getPriorityColor(ins.priority)}`,
                    padding: '16px',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ 
                    background: 'var(--primary-glow)', 
                    padding: '10px', 
                    borderRadius: '10px', 
                    color: 'var(--primary)',
                    flexShrink: 0
                  }}>
                    <Lightbulb size={20} />
                  </div>
                  
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{ins.title}</h4>
                      <span 
                        className="badge" 
                        style={{ 
                          background: 'hsla(0,0%,100%,0.05)', 
                          color: getPriorityColor(ins.priority),
                          border: `1px solid ${getPriorityColor(ins.priority)}`,
                          fontSize: '10px'
                        }}
                      >
                        {ins.priority} priority
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '13px', lineHeight: 1.5 }}>
                      {ins.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                      <Star size={12} fill="var(--primary)" />
                      Category: <span style={{ textTransform: 'capitalize' }}>{ins.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Carbon Reduction Roadmap */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown style={{ color: 'var(--primary)' }} />
              AI Carbon Reduction Roadmap
            </h3>
            {!roadmap && (
              <Button onClick={handleFetchRoadmap} disabled={roadmapLoading} variant="primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                {roadmapLoading ? 'Analyzing...' : 'Generate Roadmap'}
              </Button>
            )}
          </div>

          {roadmapLoading && (
            <div style={{ padding: '30px 0', display: 'flex', justifyContent: 'center' }}>
              <Loader message="Analyzing user habits and compiling 90-day plan..." />
            </div>
          )}

          {roadmapError && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center', padding: '10px 0' }}>
              {roadmapError}
            </div>
          )}

          {roadmap && (
            <div className="roadmap-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border-color)' }}>
              
              {/* 30-Day Plan */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-33px', top: '2px', background: 'var(--primary)', width: '16px', height: '16px', borderRadius: '50%', border: '4px solid var(--bg-dark)' }} />
                <h4 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: 600 }}>30-Day Goal: {roadmap.roadmap30?.title || 'Initial Adjustments'}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                  Expected savings: <strong>{roadmap.roadmap30?.expectedSavingDescription}</strong>
                </p>
                <ul style={{ margin: '8px 0 0 16px', fontSize: '13px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {roadmap.roadmap30?.keyActions?.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* 60-Day Plan */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-33px', top: '2px', background: 'var(--secondary)', width: '16px', height: '16px', borderRadius: '50%', border: '4px solid var(--bg-dark)' }} />
                <h4 style={{ fontSize: '15px', color: 'var(--secondary)', fontWeight: 600 }}>60-Day Goal: {roadmap.roadmap60?.title || 'Habit Consolidation'}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                  Expected savings: <strong>{roadmap.roadmap60?.expectedSavingDescription}</strong>
                </p>
                <ul style={{ margin: '8px 0 0 16px', fontSize: '13px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {roadmap.roadmap60?.keyActions?.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* 90-Day Plan */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-33px', top: '2px', background: 'var(--primary)', width: '16px', height: '16px', borderRadius: '50%', border: '4px solid var(--bg-dark)' }} />
                <h4 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: 600 }}>90-Day Goal: {roadmap.roadmap90?.title || 'Low Carbon Lifestyle'}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                  Expected savings: <strong>{roadmap.roadmap90?.expectedSavingDescription}</strong>
                </p>
                <ul style={{ margin: '8px 0 0 16px', fontSize: '13px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {roadmap.roadmap90?.keyActions?.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button onClick={() => setRoadmap(null)} variant="secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Reset Plan
                </Button>
              </div>

            </div>
          )}

          {!roadmap && !roadmapLoading && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
              Need a personalized action plan? Click compile to map out your 90-day footprint journey.
            </p>
          )}
        </Card>

      </div>

      {/* Right Column: Simulator, Report & Leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Carbon Savings Simulator */}
        <Card>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle style={{ color: 'var(--primary)' }} />
            Carbon Savings Simulator
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="simDeed" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                If I commit to...
              </label>
              <select id="simDeed" value={simDeed} onChange={(e) => setSimDeed(e.target.value)}>
                <option value="cycling">Cycle instead of Petrol Car</option>
                <option value="transit">Bus/Train instead of Petrol Car</option>
                <option value="diet">Eat a fully vegan/plant-based diet</option>
                <option value="standby">Switch standby devices off at night</option>
              </select>
            </div>

            {(simDeed === 'cycling' || simDeed === 'transit') && (
              <div>
                <label htmlFor="commuteDistance" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Commute Distance: {commuteDistance} km (one-way)
                </label>
                <input 
                  id="commuteDistance"
                  type="range" 
                  min="2" 
                  max="50" 
                  value={commuteDistance} 
                  onChange={(e) => setCommuteDistance(Number(e.target.value))} 
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div>
              <label htmlFor="simDays" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Frequency: {simDays} days per week
              </label>
              <input 
                id="simDays"
                type="range" 
                min="1" 
                max="7" 
                value={simDays} 
                onChange={(e) => setSimDays(Number(e.target.value))} 
                style={{ width: '100%' }}
              />
            </div>

            {/* Calculations Card */}
            <div style={{ marginTop: '10px', padding: '14px', background: 'hsla(150, 80%, 15%, 0.15)', borderRadius: '10px', border: '1px solid var(--primary-glow)', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated Carbon Savings</p>
              <h4 style={{ fontSize: '26px', color: 'var(--primary)', margin: '6px 0', fontWeight: 'bold' }}>
                {simulatedSavings.annual} kg
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                CO2e saved annually ({simulatedSavings.weekly} kg/week)
              </p>
            </div>
          </div>
        </Card>

        {/* Sustainability Report */}
        <Card style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <Download style={{ color: 'var(--primary)' }} />
            Sustainability Report
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
            Generate and download your complete weekly emissions, goals progress, and carbon reduction roadmap in a single report document.
          </p>
          <Button onClick={handleDownloadReport} disabled={reportLoading} variant="secondary" style={{ width: '100%', padding: '10px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            {reportLoading ? 'Compiling Report...' : 'Download Report (.txt)'}
          </Button>
        </Card>

        {/* Community Leaderboard */}
        <Card>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users style={{ color: 'var(--primary)' }} />
            Community Leaderboard
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leaderboard.map((user) => (
              <div key={user.rank} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'hsla(218, 25%, 10%, 0.4)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: user.rank <= 3 ? 'var(--primary)' : 'var(--text-muted)', width: '16px' }}>
                    #{user.rank}
                  </span>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{user.name}</span>
                    <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{user.badge}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={12} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>
                    {user.offset} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}
