const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { validateCreateGoal, validateUpdateGoal } = require('../validators/goalValidator');

router.post('/', validateCreateGoal, goalController.createGoal);
router.get('/', goalController.getGoals);
router.get('/:id', goalController.getGoalById);
router.put('/:id', validateUpdateGoal, goalController.updateGoalProgress);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
