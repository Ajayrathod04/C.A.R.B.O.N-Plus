const firestoreService = require('../services/firestore');
const { successResponse } = require('../utils/responseFormatter');

const healthController = {
  checkHealth(req, res, next) {
    try {
      const isFallback = firestoreService.isFallbackMode();
      
      const healthData = {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          status: 'CONNECTED',
          mode: isFallback ? 'fallback_in_memory' : 'google_cloud_firestore'
        }
      };

      return successResponse(res, 200, 'Health check passed', healthData);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = healthController;
