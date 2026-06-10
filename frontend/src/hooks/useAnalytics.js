import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useAnalytics(refreshTrigger) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [refreshTrigger, fetchAnalytics]);

  return { analyticsData, loading, error, refetch: fetchAnalytics };
}
