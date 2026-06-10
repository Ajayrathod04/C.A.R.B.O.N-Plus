import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Lightbulb, Info, RefreshCw, Star } from 'lucide-react';

export default function InsightsPage({ refreshTrigger, triggerRefresh }) {
  const { t } = useLanguage();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getPriorityColor = (priority) => {
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
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 className="gradient-text-green" style={{ fontSize: '32px', marginBottom: '8px' }}>
          {t('insights')} & Recommendations
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Personalized opportunities to reduce carbon emissions based on your activity.
        </p>
      </div>

      <div className="info-banner" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Info size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 600 }}>How it works</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            We analyze your weekly carbon footprints and highlight your largest source of emissions. Logging more details in the calculator makes recommendations more accurate.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {insights.map((ins, i) => (
            <div 
              key={ins.id || i}
              className="glass-card" 
              style={{ 
                display: 'flex', 
                gap: '20px', 
                alignItems: 'flex-start',
                borderLeft: `5px solid ${getPriorityColor(ins.priority)}`
              }}
            >
              <div style={{ 
                background: 'var(--primary-glow)', 
                padding: '12px', 
                borderRadius: '12px', 
                color: 'var(--primary)',
                flexShrink: 0
              }}>
                <Lightbulb size={24} />
              </div>
              
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px' }}>{ins.title}</h3>
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
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px', lineHeight: 1.5 }}>
                  {ins.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                  <Star size={12} fill="var(--primary)" />
                  Category: <span style={{ textTransform: 'capitalize' }}>{ins.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
