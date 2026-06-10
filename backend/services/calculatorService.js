const firestoreService = require('./firestore');
const emissionFactors = require('../constants/emissionFactors');
const logger = require('./cloudLogger');

const COLLECTION_NAME = 'emissions_logs';

const calculateFootprint = (data) => {
  const transportDistance = Number(data.transportDistance) || 0;
  const transportType = data.transportType || 'car_petrol';
  const transportFactor = emissionFactors.TRANSPORT[transportType] || 0;
  const transportEmissions = transportDistance * transportFactor;

  const electricityKwh = Number(data.electricityKwh) || 0;
  const electricityType = data.electricityType || 'grid';
  const electricityFactor = emissionFactors.ELECTRICITY[electricityType] || 0;
  const electricityEmissions = electricityKwh * electricityFactor;

  const foodHabit = data.foodHabit || 'meat_average';
  const foodFactor = emissionFactors.FOOD[foodHabit] || 0;
  const foodEmissions = foodFactor; // Daily standard factor

  const wasteWeight = Number(data.wasteWeight) || 0;
  const wasteType = data.wasteType || 'landfill';
  const wasteFactor = emissionFactors.WASTE[wasteType] || 0;
  const wasteEmissions = wasteWeight * wasteFactor;

  const totalEmissions = transportEmissions + electricityEmissions + foodEmissions + wasteEmissions;

  return {
    breakdown: {
      transport: parseFloat(transportEmissions.toFixed(2)),
      electricity: parseFloat(electricityEmissions.toFixed(2)),
      food: parseFloat(foodEmissions.toFixed(2)),
      waste: parseFloat(wasteEmissions.toFixed(2))
    },
    total: parseFloat(totalEmissions.toFixed(2)),
    transportDistance,
    transportType,
    electricityKwh,
    electricityType,
    foodHabit,
    wasteWeight,
    wasteType,
    date: data.date || new Date().toISOString().split('T')[0]
  };
};

const calculatorService = {
  async computeAndSave(userId, data) {
    const result = calculateFootprint(data);
    const logEntry = {
      userId,
      ...result,
      createdAt: new Date().toISOString()
    };

    logger.info(`Calculating footprint for user: ${userId}`, { total: result.total });
    const saveRes = await firestoreService.addDocument(COLLECTION_NAME, logEntry);
    
    return {
      id: saveRes.id,
      ...logEntry
    };
  },

  async getLogs(userId) {
    const logs = await firestoreService.getCollection(COLLECTION_NAME);
    return logs.filter(log => log.userId === userId)
               .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async deleteLog(userId, logId) {
    const log = await firestoreService.getDocument(COLLECTION_NAME, logId);
    if (!log || log.userId !== userId) {
      throw new Error('Emission log not found or unauthorized');
    }
    await firestoreService.deleteDocument(COLLECTION_NAME, logId);
    return { success: true };
  }
};

module.exports = {
  calculatorService,
  calculateFootprint // exported for unit testing
};
