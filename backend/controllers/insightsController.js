const insightsService = require('../services/insightsService');
const { successResponse } = require('../utils/responseFormatter');

const getUserId = (req) => {
  return req.headers['x-user-id'] || 'default-user';
};

const insightsController = {
  /**
   * Fetches general priority recommendations.
   */
  async getInsights(req, res, next) {
    try {
      const userId = getUserId(req);
      const data = await insightsService.getInsights(userId);
      return successResponse(res, 200, 'Sustainability insights retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generates a 30/60/90 day action roadmap.
   */
  async getRoadmap(req, res, next) {
    try {
      const userId = getUserId(req);
      const data = await insightsService.getRoadmap(userId);
      return successResponse(res, 200, 'AI sustainability roadmap generated successfully', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generates a downloadable text report.
   */
  async getReport(req, res, next) {
    try {
      const userId = getUserId(req);
      const data = await insightsService.getReport(userId);
      return successResponse(res, 200, 'Sustainability report generated successfully', data);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = insightsController;
