const BaseRepository = require('./baseRepository');

/**
 * Repository for goals collection.
 */
class GoalRepository extends BaseRepository {
  constructor() {
    super('goals');
  }

  /**
   * Retrieve reduction goals for a specific user.
   * @param {string} userId 
   * @returns {Promise<Array<Object>>}
   */
  async getGoalsByUser(userId) {
    const goals = await this.getAll();
    return goals.filter(g => g.userId === userId);
  }
}

module.exports = new GoalRepository();
