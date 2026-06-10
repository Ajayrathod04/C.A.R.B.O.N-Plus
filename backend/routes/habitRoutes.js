const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const { validateHabit } = require('../validators/habitValidator');

router.post('/', validateHabit, habitController.logHabit);
router.get('/', habitController.getHabits);
router.delete('/:id', habitController.deleteHabitLog);

module.exports = router;
