const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const calculatorRoutes = require('./calculatorRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const insightsRoutes = require('./insightsRoutes');
const goalRoutes = require('./goalRoutes');
const habitRoutes = require('./habitRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Map routes
router.use('/health', healthRoutes);
router.use('/calculator', calculatorRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/insights', insightsRoutes);
router.use('/goals', goalRoutes);
router.use('/habits', habitRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
