import React, { useState, Suspense, lazy, useCallback } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import Loader from './components/Loader';

// Lazy load page components to enable route splitting and bundle size optimization
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const HabitsPage = lazy(() => import('./pages/HabitsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));

/**
 * Main application content wrapper.
 * Manages the active tab state and provides global data refresh triggers.
 */
function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Memoize state trigger to prevent unnecessary child component updates
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

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
        <Suspense fallback={<Loader message="Loading page..." />}>
          {renderContent()}
        </Suspense>
      </main>
    </div>
  );
}

/**
 * Root React Entry component.
 * Integrates global Error Boundaries and Translation Providers.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
