import React from 'react';

/**
 * Enterprise reusable Input form field component.
 * Links labels to input nodes with explicit id accessibility.
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} [props.type='text']
 * @param {string} [props.placeholder]
 * @param {*} props.value
 * @param {Function} props.onChange
 * @param {boolean} [props.required=false]
 */
export default function Input({ id, label, type = 'text', placeholder, value, onChange, required = false, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      />
    </div>
  );
}
