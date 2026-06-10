const { calculatorService } = require('../services/calculatorService');
const { successResponse } = require('../utils/responseFormatter');

const getUserId = (req) => {
  return req.headers['x-user-id'] || 'default-user';
};

const calculatorController = {
  async logEmissions(req, res, next) {
    try {
      const userId = getUserId(req);
      const data = req.body;
      const log = await calculatorService.computeAndSave(userId, data);
      return successResponse(res, 201, 'Carbon footprint logged successfully', log);
    } catch (error) {
      next(error);
    }
  },

  async getLogs(req, res, next) {
    try {
      const userId = getUserId(req);
      const logs = await calculatorService.getLogs(userId);
      return successResponse(res, 200, 'Emissions logs retrieved successfully', logs);
    } catch (error) {
      next(error);
    }
  },

  async deleteLog(req, res, next) {
    try {
      const userId = getUserId(req);
      const logId = req.params.id;
      await calculatorService.deleteLog(userId, logId);
      return successResponse(res, 200, 'Emissions log deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = calculatorController;
