import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Leaf, BarChart3, Calculator, Target, Award, Lightbulb } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentLang, changeLanguage, languages, t } = useLanguage();

  return (
    <header>
      <div className="nav-container">
        <div className="logo-group">
          <Leaf className="logo-icon" size={28} />
          <div>
            <h1 className="brand-title gradient-text-green">{t('brandName')}</h1>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {t('tagline')}
            </p>
          </div>
        </div>

        <div className="nav-controls">
          <nav style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('dashboard')}
              style={{ padding: '8px 12px', fontSize: '13px' }}
            >
              <BarChart3 size={16} />
              <span className="hide-mobile">{t('dashboard')}</span>
            </button>
            <button 
              className={`btn ${activeTab === 'calculator' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('calculator')}
              style={{ padding: '8px 12px', fontSize: '13px' }}
            >
              <Calculator size={16} />
              <span className="hide-mobile">{t('calculator')}</span>
            </button>
            <button 
              className={`btn ${activeTab === 'habits' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('habits')}
              style={{ padding: '8px 12px', fontSize: '13px' }}
            >
              <Award size={16} />
              <span className="hide-mobile">{t('habits')}</span>
            </button>
            <button 
              className={`btn ${activeTab === 'goals' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('goals')}
              style={{ padding: '8px 12px', fontSize: '13px' }}
            >
              <Target size={16} />
              <span className="hide-mobile">{t('goals')}</span>
            </button>
            <button 
              className={`btn ${activeTab === 'insights' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('insights')}
              style={{ padding: '8px 12px', fontSize: '13px' }}
            >
              <Lightbulb size={16} />
              <span className="hide-mobile">{t('insights')}</span>
            </button>
          </nav>

          <select 
            value={currentLang} 
            onChange={(e) => changeLanguage(e.target.value)} 
            className="lang-dropdown"
            style={{ padding: '6px 10px', fontSize: '13px' }}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
