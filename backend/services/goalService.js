const firestoreService = require('./firestore');
const logger = require('./cloudLogger');

const COLLECTION_NAME = 'goals';

const goalService = {
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
    const res = await firestoreService.addDocument(COLLECTION_NAME, goal);
    return {
      id: res.id,
      ...goal
    };
  },

  async getGoals(userId) {
    const goals = await firestoreService.getCollection(COLLECTION_NAME);
    return goals.filter(g => g.userId === userId);
  },

  async getGoal(userId, goalId) {
    const goal = await firestoreService.getDocument(COLLECTION_NAME, goalId);
    if (!goal || goal.userId !== userId) {
      throw new Error('Goal not found or unauthorized');
    }
    return { id: goalId, ...goal };
  },

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
    await firestoreService.saveDocument(COLLECTION_NAME, goalId, updated);
    return { id: goalId, ...updated };
  },

  async deleteGoal(userId, goalId) {
    const goal = await this.getGoal(userId, goalId);
    await firestoreService.deleteDocument(COLLECTION_NAME, goalId);
    return { success: true };
  }
};

module.exports = goalService;
