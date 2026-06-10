const express = require('express');
const router = express.Router();
const calculatorController = require('../controllers/calculatorController');
const { validateCalculator } = require('../validators/calculatorValidator');

router.post('/', validateCalculator, calculatorController.logEmissions);
router.get('/', calculatorController.getLogs);
router.delete('/:id', calculatorController.deleteLog);

module.exports = router;
