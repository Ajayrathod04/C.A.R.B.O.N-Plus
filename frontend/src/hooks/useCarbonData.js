import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useCarbonData(refreshTrigger, triggerRefresh) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [refreshTrigger, fetchDashboard]);

  const deleteLog = useCallback(async (id) => {
    await api.deleteLog(id);
    if (triggerRefresh) triggerRefresh();
  }, [triggerRefresh]);

  return { dashboardData, loading, error, deleteLog, refetch: fetchDashboard };
}
