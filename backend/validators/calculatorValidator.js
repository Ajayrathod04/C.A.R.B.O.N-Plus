const { validateBody } = require('../utils/validator');

const calculatorSchema = {
  transportType: {
    type: 'string',
    enum: ['car_petrol', 'car_diesel', 'car_electric', 'motorbike', 'bus', 'train', 'flight', 'none'],
    required: false
  },
  transportDistance: {
    type: 'number',
    min: 0,
    required: false
  },
  electricityKwh: {
    type: 'number',
    min: 0,
    required: false
  },
  electricityType: {
    type: 'string',
    enum: ['grid', 'renewable'],
    required: false
  },
  foodHabit: {
    type: 'string',
    enum: ['meat_heavy', 'meat_average', 'vegetarian', 'vegan'],
    required: false
  },
  wasteWeight: {
    type: 'number',
    min: 0,
    required: false
  },
  wasteType: {
    type: 'string',
    enum: ['landfill', 'organic', 'recycled'],
    required: false
  },
  date: {
    type: 'date',
    required: false
  }
};

module.exports = {
  validateCalculator: validateBody(calculatorSchema)
};
