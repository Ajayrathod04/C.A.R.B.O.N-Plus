import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardPage from './pages/DashboardPage';
import CalculatorPage from './pages/CalculatorPage';
import HabitsPage from './pages/HabitsPage';
import GoalsPage from './pages/GoalsPage';
import InsightsPage from './pages/InsightsPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
      case 'calculator':
        return <CalculatorPage onFootprintLogged={triggerRefresh} />;
      case 'habits':
        return <HabitsPage refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
      case 'goals':
        return <GoalsPage refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
      case 'insights':
        return <InsightsPage refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
      default:
        return <DashboardPage refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
