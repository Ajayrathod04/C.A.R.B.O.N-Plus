const analyticsService = require('../services/analyticsService');
const { successResponse } = require('../utils/responseFormatter');

const getUserId = (req) => {
  return req.headers['x-user-id'] || 'default-user';
};

const analyticsController = {
  async getAnalytics(req, res, next) {
    try {
      const userId = getUserId(req);
      const data = await analyticsService.getAnalytics(userId);
      return successResponse(res, 200, 'Sustainability analytics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = analyticsController;
