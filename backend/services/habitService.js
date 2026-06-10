const firestoreService = require('./firestore');
const emissionFactors = require('../constants/emissionFactors');
const logger = require('./cloudLogger');

const COLLECTION_NAME = 'habit_logs';

const habitService = {
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
    const res = await firestoreService.addDocument(COLLECTION_NAME, logEntry);
    return {
      id: res.id,
      ...logEntry
    };
  },

  async getHabits(userId) {
    const logs = await firestoreService.getCollection(COLLECTION_NAME);
    return logs.filter(log => log.userId === userId)
               .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async deleteHabitLog(userId, logId) {
    const log = await firestoreService.getDocument(COLLECTION_NAME, logId);
    if (!log || log.userId !== userId) {
      throw new Error('Habit log not found or unauthorized');
    }
    await firestoreService.deleteDocument(COLLECTION_NAME, logId);
    return { success: true };
  }
};

module.exports = habitService;
