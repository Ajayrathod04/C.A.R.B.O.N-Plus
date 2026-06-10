const goalService = require('../services/goalService');
const { successResponse } = require('../utils/responseFormatter');

const getUserId = (req) => {
  return req.headers['x-user-id'] || 'default-user';
};

const goalController = {
  async createGoal(req, res, next) {
    try {
      const userId = getUserId(req);
      const goal = await goalService.createGoal(userId, req.body);
      return successResponse(res, 201, 'Goal created successfully', goal);
    } catch (error) {
      next(error);
    }
  },

  async getGoals(req, res, next) {
    try {
      const userId = getUserId(req);
      const goals = await goalService.getGoals(userId);
      return successResponse(res, 200, 'Goals retrieved successfully', goals);
    } catch (error) {
      next(error);
    }
  },

  async getGoalById(req, res, next) {
    try {
      const userId = getUserId(req);
      const goalId = req.params.id;
      const goal = await goalService.getGoal(userId, goalId);
      return successResponse(res, 200, 'Goal retrieved successfully', goal);
    } catch (error) {
      next(error);
    }
  },

  async updateGoalProgress(req, res, next) {
    try {
      const userId = getUserId(req);
      const goalId = req.params.id;
      const { currentValue } = req.body;
      const updated = await goalService.updateGoalProgress(userId, goalId, currentValue);
      return successResponse(res, 200, 'Goal progress updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteGoal(req, res, next) {
    try {
      const userId = getUserId(req);
      const goalId = req.params.id;
      await goalService.deleteGoal(userId, goalId);
      return successResponse(res, 200, 'Goal deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = goalController;
