import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useLanguage from '../hooks/useLanguage';
import { Award, Check, Navigation, Leaf, Sun, Trash2, ShieldCheck } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Loader from '../components/Loader';

/**
 * Habits log and offset tracking page component.
 * Allows tracking eco-habits like cycling, recycling, and solar usage.
 * @param {Object} props
 * @param {number} props.refreshTrigger
 * @param {Function} props.triggerRefresh
 */
export default function HabitsPage({ refreshTrigger, triggerRefresh }) {
  const { t } = useLanguage();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState('walking');
  const [habitValue, setHabitValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchHabits() {
      try {
        setLoading(true);
        const data = await api.getHabits();
        setHabits(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHabits();
  }, [refreshTrigger]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!habitValue || Number(habitValue) <= 0) return;

    try {
      setSubmitting(true);
      await api.logHabit({
        habitType: selectedHabit,
        value: Number(habitValue),
        date: new Date().toISOString().split('T')[0]
      });
      setHabitValue('');
      triggerRefresh();
    } catch (err) {
      alert('Failed to log habit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (confirm('Delete this habit log?')) {
      try {
        await api.deleteHabit(id);
        triggerRefresh();
      } catch (err) {
        alert('Failed to delete habit log');
      }
    }
  };

  const getHabitUnit = (type) => {
    switch (type) {
      case 'walking':
      case 'cycling':
      case 'public_transport':
        return 'km';
      case 'recycling':
        return 'items';
      case 'energy_saving':
        return 'hours';
      default:
        return 'units';
    }
  };

  const getHabitIcon = (type, size = 20) => {
    switch (type) {
      case 'walking':
        return <Navigation size={size} />;
      case 'cycling':
        return <Award size={size} />;
      case 'public_transport':
        return <Leaf size={size} />;
      case 'recycling':
        return <Trash2 size={size} />;
      case 'energy_saving':
        return <Sun size={size} />;
      default:
        return <Check size={size} />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      
      {/* Log Habit Form */}
      <Card style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck style={{ color: 'var(--primary)' }} />
          {t('logHabit')}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
              Select Eco Action
            </label>
            <div className="habit-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: 0 }}>
              {['walking', 'cycling', 'public_transport', 'recycling', 'energy_saving'].map((type) => (
                <div
                  key={type}
                  className={`habit-card ${selectedHabit === type ? 'active' : ''}`}
                  onClick={() => setSelectedHabit(type)}
                  style={{ padding: '12px', borderRadius: '8px' }}
                >
                  {getHabitIcon(type, 24)}
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{t(type)}</span>
                </div>
              ))}
            </div>
          </div>

          <Input
            id="habitValue"
            label={`Value (${getHabitUnit(selectedHabit)})`}
            type="number"
            value={habitValue}
            onChange={(e) => setHabitValue(e.target.value)}
            placeholder={`Enter ${getHabitUnit(selectedHabit)}`}
            min="0.01"
            step="any"
            required
          />

          <Button type="submit" variant="primary" disabled={submitting} style={{ marginTop: '8px' }}>
            {submitting ? 'Logging...' : t('add')}
          </Button>
        </form>
      </Card>

      {/* Logged Habits History */}
      <Card>
        <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Logged Green Habits</h3>

        {loading ? (
          <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
            <Loader message="Loading habits..." />
          </div>
        ) : habits.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {habits.map((h) => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'hsla(218, 25%, 10%, 0.4)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: 'var(--primary)', background: 'var(--primary-glow)', padding: '8px', borderRadius: '50%' }}>
                    {getHabitIcon(h.habitType, 16)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', textTransform: 'capitalize' }}>{t(h.habitType)}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {h.value} {getHabitUnit(h.habitType)} • {h.date}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-success" style={{ fontWeight: 'bold' }}>
                    -{h.carbonSaved} kg CO2e
                  </span>
                  <button
                    onClick={() => handleDeleteHabit(h.id)}
                    style={{ background: 'transparent', padding: '4px', color: 'var(--danger)' }}
                    title="Delete log"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Leaf size={32} style={{ marginBottom: '8px' }} />
            <p>No habits tracked yet. Start doing green deeds!</p>
          </div>
        )}
      </Card>

    </div>
  );
}
