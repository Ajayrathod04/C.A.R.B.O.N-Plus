import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Enterprise reusable Loader component.
 * Provides a standardized loading indicator.
 * @param {Object} props
 * @param {string} [props.message='Loading...']
 */
export default function Loader({ message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '16px' }}>
      <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}
