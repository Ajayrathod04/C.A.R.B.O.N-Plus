const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/responseFormatter');

const getUserId = (req) => {
  return req.headers['x-user-id'] || 'default-user';
};

const dashboardController = {
  async getDashboard(req, res, next) {
    try {
      const userId = getUserId(req);
      const data = await dashboardService.getDashboardData(userId);
      return successResponse(res, 200, 'Dashboard data retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;
