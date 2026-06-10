const habitRepository = require('../repositories/habitRepository');
const emissionFactors = require('../constants/emissionFactors');
const logger = require('./cloudLogger');

/**
 * Service to manage green habit logs and carbon savings calculation.
 */
const habitService = {
  /**
   * Log habit occurrence and calculate offset metrics.
   * @param {string} userId 
   * @param {Object} habitData 
   * @returns {Promise<Object>}
   */
  async logHabit(userId, habitData) {
    const habitType = habitData.habitType;
    const value = Number(habitData.value) || 0;
    
    const factor = emissionFactors.HABIT_SAVINGS[habitType] || 0;
    const carbonSaved = value * factor;

    const logEntry = {
      userId,
      habitType,
      value,
      carbonSaved: parseFloat(carbonSaved.toFixed(2)),
      date: habitData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    logger.info(`Logging habit for user ${userId}: ${habitType} (${value})`);
    const res = await habitRepository.create(logEntry);
    return {
      id: res.id,
      ...logEntry
    };
  },

  /**
   * Get habit logging history for a user.
   * @param {string} userId 
   * @returns {Promise<Array<Object>>}
   */
  async getHabits(userId) {
    return await habitRepository.getHabitsByUser(userId);
  },

  /**
   * Delete habit logging record.
   * @param {string} userId 
   * @param {string} logId 
   * @returns {Promise<Object>} success verification
   */
  async deleteHabitLog(userId, logId) {
    const log = await habitRepository.getById(logId);
    if (!log || log.userId !== userId) {
      throw new Error('Habit log not found or unauthorized');
    }
    await habitRepository.delete(logId);
    return { success: true };
  }
};

module.exports = habitService;
