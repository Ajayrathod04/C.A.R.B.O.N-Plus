import React, { useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Calculator, Navigation, Sun, Flame, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function CalculatorPage({ onFootprintLogged }) {
  const { t } = { t: (key) => key }; // Fallback context helper if hook is missing
  const { t: trans } = useLanguage();

  const [formData, setFormData] = useState({
    transportType: 'car_petrol',
    transportDistance: '',
    electricityKwh: '',
    electricityType: 'grid',
    foodHabit: 'meat_average',
    wasteWeight: '',
    wasteType: 'landfill',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [computedTotal, setComputedTotal] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setComputedTotal(null);

    // Format fields
    const payload = {
      ...formData,
      transportDistance: formData.transportDistance === '' ? 0 : Number(formData.transportDistance),
      electricityKwh: formData.electricityKwh === '' ? 0 : Number(formData.electricityKwh),
      wasteWeight: formData.wasteWeight === '' ? 0 : Number(formData.wasteWeight),
    };

    try {
      const res = await api.logFootprint(payload);
      setComputedTotal(res.total);
      setSuccess(true);
      onFootprintLogged(); // trigger dashboard refresh
      // Reset form
      setFormData({
        transportType: 'car_petrol',
        transportDistance: '',
        electricityKwh: '',
        electricityType: 'grid',
        foodHabit: 'meat_average',
        wasteWeight: '',
        wasteType: 'landfill',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError(err.message || 'Failed to submit calculation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 className="gradient-text-green" style={{ fontSize: '32px', marginBottom: '8px' }}>
          {trans('calculator')}
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Enter your daily activities below to estimate and log your carbon footprint.
        </p>
      </div>

      {success && (
        <div className="glass-card animate-fade-in" style={{ borderColor: 'var(--primary)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <CheckCircle2 size={36} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '18px', color: 'var(--primary)' }}>Footprint Logged!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Your carbon footprint has been successfully recorded. Total impact of this entry: <strong style={{ color: 'var(--text-main)' }}>{computedTotal} kg CO2e</strong>.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ borderColor: 'var(--danger)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <AlertTriangle size={36} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '18px', color: 'var(--danger)' }}>Calculation Error</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Date Input */}
        <div>
          <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Date of Activities</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>

        {/* Section 1: Transportation */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Navigation size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px' }}>Transportation</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('transportType')}</label>
              <select name="transportType" value={formData.transportType} onChange={handleChange}>
                <option value="car_petrol">{trans('carPetrol')}</option>
                <option value="car_diesel">{trans('carDiesel')}</option>
                <option value="car_electric">{trans('carElectric')}</option>
                <option value="motorbike">{trans('motorbike')}</option>
                <option value="bus">{trans('bus')}</option>
                <option value="train">{trans('train')}</option>
                <option value="flight">{trans('flight')}</option>
                <option value="none">No commuting</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('distance')}</label>
              <input 
                type="number" 
                name="transportDistance" 
                value={formData.transportDistance} 
                onChange={handleChange} 
                placeholder="0"
                min="0"
                step="any"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Electricity */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sun size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px' }}>Electricity Consumption</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('electricityType')}</label>
              <select name="electricityType" value={formData.electricityType} onChange={handleChange}>
                <option value="grid">{trans('grid')}</option>
                <option value="renewable">{trans('renewable')}</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('electricity')}</label>
              <input 
                type="number" 
                name="electricityKwh" 
                value={formData.electricityKwh} 
                onChange={handleChange} 
                placeholder="0"
                min="0"
                step="any"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Food Habits */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Flame size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px' }}>{trans('food')}</h3>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('foodHabit')}</label>
            <select name="foodHabit" value={formData.foodHabit} onChange={handleChange}>
              <option value="meat_heavy">{trans('meatHeavy')}</option>
              <option value="meat_average">{trans('meatAverage')}</option>
              <option value="vegetarian">{trans('vegetarian')}</option>
              <option value="vegan">{trans('vegan')}</option>
            </select>
          </div>
        </div>

        {/* Section 4: Waste */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Trash2 size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px' }}>Waste Generation</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('wasteType')}</label>
              <select name="wasteType" value={formData.wasteType} onChange={handleChange}>
                <option value="landfill">{trans('landfill')}</option>
                <option value="organic">{trans('organic')}</option>
                <option value="recycled">{trans('recycled')}</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('waste')}</label>
              <input 
                type="number" 
                name="wasteWeight" 
                value={formData.wasteWeight} 
                onChange={handleChange} 
                placeholder="0"
                min="0"
                step="any"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'right' }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            <Calculator size={18} />
            {loading ? 'Processing...' : trans('logFootprint')}
          </button>
        </div>

      </form>
    </div>
  );
}
