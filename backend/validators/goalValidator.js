const { validateBody } = require('../utils/validator');

const goalSchema = {
  title: {
    type: 'string',
    required: true
  },
  targetValue: {
    type: 'number',
    min: 0.01,
    required: true
  },
  category: {
    type: 'string',
    required: false
  },
  startDate: {
    type: 'date',
    required: false
  },
  endDate: {
    type: 'date',
    required: true
  }
};

const updateGoalSchema = {
  currentValue: {
    type: 'number',
    min: 0,
    required: true
  }
};

module.exports = {
  validateCreateGoal: validateBody(goalSchema),
  validateUpdateGoal: validateBody(updateGoalSchema)
};
