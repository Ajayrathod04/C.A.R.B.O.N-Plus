const { validateBody } = require('../utils/validator');

const habitSchema = {
  habitType: {
    type: 'string',
    enum: ['walking', 'cycling', 'public_transport', 'recycling', 'energy_saving'],
    required: true
  },
  value: {
    type: 'number',
    min: 0.01,
    required: true
  },
  date: {
    type: 'date',
    required: false
  }
};

module.exports = {
  validateHabit: validateBody(habitSchema)
};
