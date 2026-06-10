import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useGoals(refreshTrigger, triggerRefresh) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [refreshTrigger, fetchGoals]);

  const createGoal = useCallback(async (formData) => {
    await api.createGoal(formData);
    if (triggerRefresh) triggerRefresh();
  }, [triggerRefresh]);

  const updateGoalProgress = useCallback(async (goalId, value) => {
    await api.updateGoalProgress(goalId, value);
    if (triggerRefresh) triggerRefresh();
  }, [triggerRefresh]);

  const deleteGoal = useCallback(async (goalId) => {
    await api.deleteGoal(goalId);
    if (triggerRefresh) triggerRefresh();
  }, [triggerRefresh]);

  return { goals, loading, createGoal, updateGoalProgress, deleteGoal, refetch: fetchGoals };
}
