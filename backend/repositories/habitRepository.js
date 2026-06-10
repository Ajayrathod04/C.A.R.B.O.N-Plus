const BaseRepository = require('./baseRepository');

/**
 * Repository for habit_logs collection.
 */
class HabitRepository extends BaseRepository {
  constructor() {
    super('habit_logs');
  }

  /**
   * Retrieve habits log history for a specific user.
   * @param {string} userId 
   * @returns {Promise<Array<Object>>}
   */
  async getHabitsByUser(userId) {
    const habits = await this.getAll();
    return habits.filter(h => h.userId === userId)
                 .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

module.exports = new HabitRepository();
