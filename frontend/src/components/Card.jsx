import React from 'react';

/**
 * Enterprise reusable Card container component.
 * Provides a standardized glassmorphic card wrapping look.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} [props.style]
 * @param {string} [props.className]
 */
export default function Card({ children, style, className = '', ...props }) {
  return (
    <div
      className={`glass-card ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
