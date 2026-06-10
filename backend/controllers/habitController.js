const habitService = require('../services/habitService');
const { successResponse } = require('../utils/responseFormatter');

const getUserId = (req) => {
  return req.headers['x-user-id'] || 'default-user';
};

const habitController = {
  async logHabit(req, res, next) {
    try {
      const userId = getUserId(req);
      const log = await habitService.logHabit(userId, req.body);
      return successResponse(res, 201, 'Habit logged successfully', log);
    } catch (error) {
      next(error);
    }
  },

  async getHabits(req, res, next) {
    try {
      const userId = getUserId(req);
      const habits = await habitService.getHabits(userId);
      return successResponse(res, 200, 'Habit logs retrieved successfully', habits);
    } catch (error) {
      next(error);
    }
  },

  async deleteHabitLog(req, res, next) {
    try {
      const userId = getUserId(req);
      const logId = req.params.id;
      await habitService.deleteHabitLog(userId, logId);
      return successResponse(res, 200, 'Habit log deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = habitController;
