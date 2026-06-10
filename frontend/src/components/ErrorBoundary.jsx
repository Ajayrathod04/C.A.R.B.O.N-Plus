import React, { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Enterprise-grade React Error Boundary component.
 * Catches JavaScript errors anywhere in the child component tree, logs them,
 * and displays a premium sustainability-themed fallback UI.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '80vh', 
          padding: '24px' 
        }}>
          <div className="glass-card" style={{ 
            maxWidth: '500px', 
            textAlign: 'center', 
            borderColor: 'var(--danger)',
            padding: '40px 24px'
          }}>
            <div style={{ 
              display: 'inline-flex', 
              background: 'hsla(350, 89%, 60%, 0.1)', 
              padding: '16px', 
              borderRadius: '50%', 
              color: 'var(--danger)', 
              marginBottom: '20px' 
            }}>
              <AlertTriangle size={36} />
            </div>
            
            <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
              An unexpected error occurred in the navigator application. We have logged this event and are working to resolve it.
            </p>
            
            <button 
              className="btn btn-primary" 
              onClick={this.handleReset}
              style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}
            >
              <RotateCcw size={16} />
              Reset Navigator
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
