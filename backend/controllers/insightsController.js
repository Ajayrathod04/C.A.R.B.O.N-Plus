const insightsService = require('../services/insightsService');
const { successResponse } = require('../utils/responseFormatter');

const getUserId = (req) => {
  return req.headers['x-user-id'] || 'default-user';
};

const insightsController = {
  async getInsights(req, res, next) {
    try {
      const userId = getUserId(req);
      const data = await insightsService.getInsights(userId);
      return successResponse(res, 200, 'Sustainability insights retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = insightsController;
