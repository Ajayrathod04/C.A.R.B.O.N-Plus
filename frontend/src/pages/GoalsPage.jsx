import React, { useState } from 'react';
import useLanguage from '../hooks/useLanguage';
import useGoals from '../hooks/useGoals';
import { Target } from 'lucide-react';
import GoalsList from '../components/GoalsList';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

/**
 * Main goals management page view container.
 * Displays forms to create new carbon reduction goals and lists existing goals.
 * @param {Object} props
 * @param {number} props.refreshTrigger
 * @param {Function} props.triggerRefresh
 */
export default function GoalsPage({ refreshTrigger, triggerRefresh }) {
  const { t } = useLanguage();
  const { goals, loading, createGoal, updateGoalProgress, deleteGoal } = useGoals(refreshTrigger, triggerRefresh);

  const [formData, setFormData] = useState({
    title: '',
    targetValue: '',
    category: 'transport',
    endDate: ''
  });
  const [progressUpdate, setProgressUpdate] = useState({}); // { [goalId]: value }
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetValue || !formData.endDate) return;

    try {
      setSubmitting(true);
      await createGoal(formData);
      setFormData({
        title: '',
        targetValue: '',
        category: 'transport',
        endDate: ''
      });
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
      await updateGoalProgress(goalId, val);
      setProgressUpdate(prev => ({ ...prev, [goalId]: '' }));
    } catch (err) {
      alert('Failed to update progress');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (confirm('Delete this goal?')) {
      try {
        await deleteGoal(goalId);
      } catch (err) {
        alert('Failed to delete goal');
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
      
      {/* Create Goal Form */}
      <Card style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target style={{ color: 'var(--primary)' }} />
          {t('createGoal')}
        </h3>

        <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            id="goalTitle"
            label={t('goalTitle')}
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Use train for 3 commutes"
            required
          />

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
            
            <Input
              id="goalTarget"
              label="Target (kg CO2e)"
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

          <Input
            id="goalEndDate"
            label={t('endDate')}
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />

          <Button type="submit" variant="primary" disabled={submitting} style={{ marginTop: '8px' }}>
            {submitting ? 'Creating...' : t('add')}
          </Button>
        </form>
      </Card>

      {/* Goals List */}
      <GoalsList 
        goals={goals}
        progressUpdate={progressUpdate}
        setProgressUpdate={setProgressUpdate}
        loading={loading}
        onDeleteGoal={handleDeleteGoal}
        onUpdateProgress={handleUpdateProgress}
        t={t}
      />

    </div>
  );
}
