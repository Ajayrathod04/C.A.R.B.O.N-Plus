const logRepository = require('../repositories/logRepository');
const emissionFactors = require('../constants/emissionFactors');
const logger = require('./cloudLogger');

/**
 * Calculates emissions breakdown and totals based on entry data.
 * @param {Object} data - Emission values from client input
 * @returns {Object} Calculated emission logs and metadata
 */
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

/**
 * Service to process and manage emission records.
 */
const calculatorService = {
  /**
   * Calculate emission logs and persist to DB.
   * @param {string} userId 
   * @param {Object} data 
   * @returns {Promise<Object>} The saved log entry with unique ID
   */
  async computeAndSave(userId, data) {
    const result = calculateFootprint(data);
    const logEntry = {
      userId,
      ...result,
      createdAt: new Date().toISOString()
    };

    logger.info(`Calculating footprint for user: ${userId}`, { total: result.total });
    const saveRes = await logRepository.create(logEntry);
    
    return {
      id: saveRes.id,
      ...logEntry
    };
  },

  /**
   * Retrieve emission logs sorted by date.
   * @param {string} userId 
   * @returns {Promise<Array<Object>>}
   */
  async getLogs(userId) {
    return await logRepository.getLogsByUser(userId);
  },

  /**
   * Delete specific log if owned by the user.
   * @param {string} userId 
   * @param {string} logId 
   * @returns {Promise<Object>} success verification
   */
  async deleteLog(userId, logId) {
    const log = await logRepository.getById(logId);
    if (!log || log.userId !== userId) {
      throw new Error('Emission log not found or unauthorized');
    }
    await logRepository.delete(logId);
    return { success: true };
  }
};

module.exports = {
  calculatorService,
  calculateFootprint
};
