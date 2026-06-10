import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Target, Trash2, Check, RefreshCw, Compass } from 'lucide-react';

export default function GoalsPage({ refreshTrigger, triggerRefresh }) {
  const { t } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    targetValue: '',
    category: 'transport',
    endDate: ''
  });
  const [progressUpdate, setProgressUpdate] = useState({}); // { [goalId]: value }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchGoals() {
      try {
        setLoading(true);
        const data = await api.getGoals();
        setGoals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, [refreshTrigger]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetValue || !formData.endDate) return;

    try {
      setSubmitting(true);
      await api.createGoal(formData);
      setFormData({
        title: '',
        targetValue: '',
        category: 'transport',
        endDate: ''
      });
      triggerRefresh();
    } catch (err) {
      alert('Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (goalId) => {
    const val = Number(progressUpdate[goalId]);
    if (isNaN(val) || val < 0) return;

    try {
      await api.updateGoalProgress(goalId, val);
      setProgressUpdate(prev => ({ ...prev, [goalId]: '' }));
      triggerRefresh();
    } catch (err) {
      alert('Failed to update progress');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (confirm('Delete this goal?')) {
      try {
        await api.deleteGoal(goalId);
        triggerRefresh();
      } catch (err) {
        alert('Failed to delete goal');
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
      
      {/* Create Goal Form */}
      <div className="glass-card" style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target style={{ color: 'var(--primary)' }} />
          {t('createGoal')}
        </h3>

        <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="goalTitle" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              {t('goalTitle')}
            </label>
            <input
              id="goalTitle"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Use train for 3 commutes"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="goalCategory" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Category
              </label>
              <select id="goalCategory" name="category" value={formData.category} onChange={handleChange}>
                <option value="transport">Transportation</option>
                <option value="electricity">Electricity</option>
                <option value="food">Diet/Food</option>
                <option value="waste">Waste Management</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label htmlFor="goalTarget" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Target (kg CO2e)
              </label>
              <input
                id="goalTarget"
                type="number"
                name="targetValue"
                value={formData.targetValue}
                onChange={handleChange}
                placeholder="20"
                min="0.1"
                step="any"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="goalEndDate" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              {t('endDate')}
            </label>
            <input
              id="goalEndDate"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '8px' }}>
            {submitting ? 'Creating...' : t('add')}
          </button>
        </form>
      </div>

      {/* Goals List */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Active & Completed Goals</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <RefreshCw className="animate-spin" size={24} style={{ animation: 'spin 2s linear infinite' }} />
          </div>
        ) : goals.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
            {goals.map((goal) => {
              const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
              
              return (
                <div 
                  key={goal.id} 
                  style={{ 
                    padding: '16px', 
                    background: 'hsla(218, 25%, 10%, 0.4)', 
                    borderRadius: '12px', 
                    border: goal.status === 'completed' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', textDecoration: goal.status === 'completed' ? 'line-through' : 'none', color: goal.status === 'completed' ? 'var(--primary)' : 'var(--text-main)' }}>
                        {goal.title}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Category: <span style={{ textTransform: 'capitalize' }}>{goal.category}</span> • Ends: {goal.endDate}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge ${goal.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {goal.status === 'completed' ? t('completed') : t('active')}
                      </span>
                      <button 
                        onClick={() => handleDeleteGoal(goal.id)}
                        style={{ background: 'transparent', padding: '4px', color: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ margin: '14px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Progress: {goal.currentValue} / {goal.targetValue} kg CO2e</span>
                      <span>{percentage}%</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', background: 'hsla(0,0%,100%,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${percentage}%`, 
                          background: goal.status === 'completed' ? 'var(--primary)' : 'linear-gradient(90deg, var(--primary), var(--secondary))',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Update progress input */}
                  {goal.status !== 'completed' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <input
                        type="number"
                        placeholder="Log achievement..."
                        value={progressUpdate[goal.id] || ''}
                        onChange={(e) => setProgressUpdate(prev => ({ ...prev, [goal.id]: e.target.value }))}
                        style={{ padding: '6px 10px', fontSize: '12px', flexGrow: 1 }}
                        min="0"
                        step="any"
                      />
                      <button 
                        onClick={() => handleUpdateProgress(goal.id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Update
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Compass size={32} style={{ marginBottom: '8px' }} />
            <p>No carbon goals logged yet. Set a goal and start saving!</p>
          </div>
        )}
      </div>

    </div>
  );
}
