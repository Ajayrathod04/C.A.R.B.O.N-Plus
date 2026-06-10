import React from 'react';
import { Trash2, Compass, RefreshCw } from 'lucide-react';
import Card from './Card';
import Button from './Button';

/**
 * Renders a list of carbon reduction goals, progress tracking bar, and updates.
 * @param {Object} props
 * @param {Array.<Object>} props.goals - List of user goals
 * @param {Object} props.progressUpdate - Current input progress values
 * @param {Function} props.setProgressUpdate 
 * @param {boolean} props.loading
 * @param {Function} props.onDeleteGoal
 * @param {Function} props.onUpdateProgress
 * @param {Function} props.t - Translate helper
 */
export default function GoalsList({ goals, progressUpdate, setProgressUpdate, loading, onDeleteGoal, onUpdateProgress, t }) {
  return (
    <Card>
      <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Active & Completed Goals</h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <RefreshCw className="animate-spin" size={24} style={{ animation: 'spin 2s linear infinite' }} />
        </div>
      ) : goals && goals.length > 0 ? (
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
                      onClick={() => onDeleteGoal(goal.id)}
                      style={{ background: 'transparent', padding: '4px', color: 'var(--danger)' }}
                      title="Delete goal"
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
                      id={`progress-update-${goal.id}`}
                      type="number"
                      placeholder="Log achievement..."
                      value={progressUpdate[goal.id] || ''}
                      onChange={(e) => setProgressUpdate(prev => ({ ...prev, [goal.id]: e.target.value }))}
                      style={{ padding: '6px 10px', fontSize: '12px', flexGrow: 1 }}
                      min="0"
                      step="any"
                    />
                    <Button 
                      onClick={() => onUpdateProgress(goal.id)}
                      variant="secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Update
                    </Button>
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
    </Card>
  );
}
