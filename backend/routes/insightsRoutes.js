const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');

router.get('/', insightsController.getInsights);
router.get('/roadmap', insightsController.getRoadmap);
router.get('/report', insightsController.getReport);

module.exports = router;
