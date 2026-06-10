const firestoreService = require('../services/firestore');

/**
 * Enterprise Base Repository representing standard CRUD data-access interfaces.
 */
class BaseRepository {
  /**
   * @param {string} collection - The Firestore collection name
   */
  constructor(collection) {
    this.collection = collection;
  }

  /**
   * Add a new document
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async create(data) {
    return await firestoreService.addDocument(this.collection, data);
  }

  /**
   * Retrieve document by ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return await firestoreService.getDocument(this.collection, id);
  }

  /**
   * Retrieve all documents from collection
   * @returns {Promise<Array<Object>>}
   */
  async getAll() {
    return await firestoreService.getCollection(this.collection);
  }

  /**
   * Update or set a document by ID
   * @param {string} id 
   * @param {Object} data 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async update(id, data, options = {}) {
    return await firestoreService.saveDocument(this.collection, id, data, options);
  }

  /**
   * Delete document by ID
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async delete(id) {
    return await firestoreService.deleteDocument(this.collection, id);
  }
}

module.exports = BaseRepository;
