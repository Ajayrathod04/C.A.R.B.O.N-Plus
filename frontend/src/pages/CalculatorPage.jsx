import React, { useState } from 'react';
import api from '../services/api';
import useLanguage from '../hooks/useLanguage';
import { Calculator, Navigation, Sun, Flame, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

/**
 * Calculator log entry page view component.
 * Validates and submits daily transport, electricity, diet and waste metrics.
 * @param {Object} props
 * @param {Function} props.onFootprintLogged - Callback trigger on submit
 */
export default function CalculatorPage({ onFootprintLogged }) {
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
      onFootprintLogged();
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
        <Card className="animate-fade-in" style={{ borderColor: 'var(--primary)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <CheckCircle2 size={36} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '18px', color: 'var(--primary)' }}>Footprint Logged!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Your carbon footprint has been successfully recorded. Total impact of this entry: <strong style={{ color: 'var(--text-main)' }}>{computedTotal} kg CO2e</strong>.
            </p>
          </div>
        </Card>
      )}

      {error && (
        <Card style={{ borderColor: 'var(--danger)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <AlertTriangle size={36} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '18px', color: 'var(--danger)' }}>Calculation Error</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{error}</p>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <Input 
          id="date" 
          label="Date of Activities" 
          type="date" 
          name="date" 
          value={formData.date} 
          onChange={handleChange} 
          required 
        />

        {/* Section 1: Transportation */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Navigation size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px' }}>Transportation</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="transportType" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('transportType')}</label>
              <select id="transportType" name="transportType" value={formData.transportType} onChange={handleChange}>
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
            <Input 
              id="transportDistance"
              label={trans('distance')}
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

        {/* Section 2: Electricity */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sun size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px' }}>Electricity Consumption</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="electricityType" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('electricityType')}</label>
              <select id="electricityType" name="electricityType" value={formData.electricityType} onChange={handleChange}>
                <option value="grid">{trans('grid')}</option>
                <option value="renewable">{trans('renewable')}</option>
              </select>
            </div>
            <Input 
              id="electricityKwh"
              label={trans('electricity')}
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

        {/* Section 3: Food Habits */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Flame size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px' }}>{trans('food')}</h3>
          </div>
          <div>
            <label htmlFor="foodHabit" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('foodHabit')}</label>
            <select id="foodHabit" name="foodHabit" value={formData.foodHabit} onChange={handleChange}>
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
              <label htmlFor="wasteType" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{trans('wasteType')}</label>
              <select id="wasteType" name="wasteType" value={formData.wasteType} onChange={handleChange}>
                <option value="landfill">{trans('landfill')}</option>
                <option value="organic">{trans('organic')}</option>
                <option value="recycled">{trans('recycled')}</option>
              </select>
            </div>
            <Input 
              id="wasteWeight"
              label={trans('waste')}
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

        {/* Submit */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '14px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <Calculator size={18} />
            {loading ? 'Processing...' : trans('logFootprint')}
          </Button>
        </div>

      </form>
    </div>
  );
}
