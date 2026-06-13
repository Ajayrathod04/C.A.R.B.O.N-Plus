// Simple API helper with user session persistence
const getUserId = () => {
  let id = localStorage.getItem('carbon_plus_user_id');
  if (!id) {
    id = 'usr_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('carbon_plus_user_id', id);
  }
  return id;
};

// Set API URL base. In production, serve from same domain; in dev fallback to backend port 8080
const API_BASE = '/api';

const request = async (endpoint, options = {}) => {
  const userId = getUserId();
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }
    
    return result.data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
};

export const api = {
  // Calculator
  getLogs: () => request('/calculator'),
  logFootprint: (data) => request('/calculator', { method: 'POST', body: JSON.stringify(data) }),
  deleteLog: (id) => request(`/calculator/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Insights
  getInsights: () => request('/insights'),
  getRoadmap: () => request('/insights/roadmap'),
  getReport: () => request('/insights/report'),

  // Goals
  getGoals: () => request('/goals'),
  createGoal: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoalProgress: (id, currentValue) => request(`/goals/${id}`, { method: 'PUT', body: JSON.stringify({ currentValue }) }),
  deleteGoal: (id) => request(`/goals/${id}`, { method: 'DELETE' }),

  // Habits
  getHabits: () => request('/habits'),
  logHabit: (data) => request('/habits', { method: 'POST', body: JSON.stringify(data) }),
  deleteHabit: (id) => request(`/habits/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // Health
  checkHealth: () => request('/health'),
  
  getUserId
};
export default api;
