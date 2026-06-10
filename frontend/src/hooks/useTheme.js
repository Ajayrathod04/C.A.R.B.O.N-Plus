import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('carbon_plus_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('carbon_plus_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return { theme, toggleTheme };
}
