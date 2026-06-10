const BaseRepository = require('./baseRepository');

/**
 * Repository for emissions_logs collection.
 */
class LogRepository extends BaseRepository {
  constructor() {
    super('emissions_logs');
  }

  /**
   * Retrieve sorted list of emission logs for a specific user.
   * @param {string} userId 
   * @returns {Promise<Array<Object>>}
   */
  async getLogsByUser(userId) {
    const logs = await this.getAll();
    return logs.filter(log => log.userId === userId)
               .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

module.exports = new LogRepository();
