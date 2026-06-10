import React from 'react';

/**
 * Enterprise reusable Button component.
 * Supports primary, secondary, and danger variants.
 * @param {Object} props
 * @param {'primary'|'secondary'|'danger'} [props.variant='primary']
 * @param {boolean} [props.disabled=false]
 * @param {Function} [props.onClick]
 * @param {React.ReactNode} props.children
 */
export default function Button({ variant = 'primary', disabled = false, onClick, children, ...props }) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
