const goalRepository = require('../repositories/goalRepository');
const logger = require('./cloudLogger');

/**
 * Service to manage user goals, target reductions, and updates.
 */
const goalService = {
  /**
   * Create a new carbon reduction goal.
   * @param {string} userId 
   * @param {Object} goalData 
   * @returns {Promise<Object>}
   */
  async createGoal(userId, goalData) {
    const goal = {
      userId,
      title: goalData.title,
      targetValue: Number(goalData.targetValue) || 0,
      currentValue: Number(goalData.currentValue) || 0,
      category: goalData.category || 'general',
      startDate: goalData.startDate || new Date().toISOString().split('T')[0],
      endDate: goalData.endDate,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    logger.info(`Creating goal for user ${userId}: ${goal.title}`);
    const res = await goalRepository.create(goal);
    return {
      id: res.id,
      ...goal
    };
  },

  /**
   * Retrieve goals belonging to a specific user.
   * @param {string} userId 
   * @returns {Promise<Array<Object>>}
   */
  async getGoals(userId) {
    return await goalRepository.getGoalsByUser(userId);
  },

  /**
   * Retrieve a specific goal by ID, checking ownership.
   * @param {string} userId 
   * @param {string} goalId 
   * @returns {Promise<Object>}
   */
  async getGoal(userId, goalId) {
    const goal = await goalRepository.getById(goalId);
    if (!goal || goal.userId !== userId) {
      throw new Error('Goal not found or unauthorized');
    }
    return { id: goalId, ...goal };
  },

  /**
   * Update goal completion progress.
   * @param {string} userId 
   * @param {string} goalId 
   * @param {number} currentValue 
   * @returns {Promise<Object>}
   */
  async updateGoalProgress(userId, goalId, currentValue) {
    const goal = await this.getGoal(userId, goalId);
    
    const val = Number(currentValue) || 0;
    const isCompleted = val >= goal.targetValue;
    const status = isCompleted ? 'completed' : goal.status;

    const updated = {
      ...goal,
      currentValue: val,
      status,
      updatedAt: new Date().toISOString()
    };

    // Remove id from payload
    delete updated.id;

    logger.info(`Updating goal progress for user ${userId}, goal ${goalId} to ${val}`);
    await goalRepository.update(goalId, updated);
    return { id: goalId, ...updated };
  },

  /**
   * Delete a specific goal.
   * @param {string} userId 
   * @param {string} goalId 
   * @returns {Promise<Object>} success verification
   */
  async deleteGoal(userId, goalId) {
    await this.getGoal(userId, goalId);
    await goalRepository.delete(goalId);
    return { success: true };
  }
};

module.exports = goalService;
