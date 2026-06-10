const { Firestore } = require('@google-cloud/firestore');
const logger = require('./cloudLogger');
const config = require('../config/config');

let db = null;
let isFallback = false;
const localDb = {}; // In-memory fallback database: { [collectionName]: { [docId]: data } }

// Helper for local db operations
const localDbHelper = {
  collection: (collectionName) => {
    if (!localDb[collectionName]) {
      localDb[collectionName] = {};
    }
    return {
      doc: (docId) => {
        const id = docId || Math.random().toString(36).substring(2, 15);
        return {
          get: async () => {
            const data = localDb[collectionName][id];
            return {
              exists: !!data,
              id,
              data: () => data || null
            };
          },
          set: async (data, options) => {
            const current = localDb[collectionName][id] || {};
            if (options && options.merge) {
              localDb[collectionName][id] = { ...current, ...data };
            } else {
              localDb[collectionName][id] = { ...data };
            }
            return { writeTime: new Date() };
          },
          delete: async () => {
            delete localDb[collectionName][id];
            return { writeTime: new Date() };
          }
        };
      },
      add: async (data) => {
        const id = Math.random().toString(36).substring(2, 15);
        localDb[collectionName][id] = { ...data, id };
        return {
          id,
          get: async () => ({
            exists: true,
            id,
            data: () => localDb[collectionName][id]
          })
        };
      },
      get: async () => {
        const docs = Object.keys(localDb[collectionName]).map(id => ({
          id,
          data: () => localDb[collectionName][id]
        }));
        return {
          docs,
          forEach: (callback) => docs.forEach(callback),
          empty: docs.length === 0
        };
      }
    };
  }
};

try {
  // Try to initialize firestore using environment config
  // Ensure we only attempt it if projectId is provided.
  if (config.FIRESTORE_PROJECT_ID) {
    db = new Firestore({
      projectId: config.FIRESTORE_PROJECT_ID,
      databaseId: config.FIRESTORE_DATABASE_ID,
    });
    logger.info('Google Cloud Firestore initialized.');
  } else {
    logger.warn('FIRESTORE_PROJECT_ID not set. Using in-memory fallback database.');
    db = localDbHelper;
    isFallback = true;
  }
} catch (error) {
  logger.error('Failed to initialize Firestore client. Falling back to in-memory.', error);
  db = localDbHelper;
  isFallback = true;
}

// Wrapper interface to ensure absolute safety across application code
const firestoreService = {
  /**
   * Save a document
   */
  async saveDocument(collection, docId, data, options = {}) {
    try {
      if (isFallback) {
        await db.collection(collection).doc(docId).set(data, options);
        return { success: true, docId, mode: 'fallback' };
      }
      await db.collection(collection).doc(docId).set(data, options);
      return { success: true, docId, mode: 'cloud' };
    } catch (error) {
      logger.error(`Firestore saveDocument error on collection ${collection}, doc ${docId}. Attempting fallback...`, error);
      // Fallback
      await localDbHelper.collection(collection).doc(docId).set(data, options);
      return { success: true, docId, mode: 'fallback_active' };
    }
  },

  /**
   * Add a new document (auto-generated ID)
   */
  async addDocument(collection, data) {
    try {
      if (isFallback) {
        const ref = await db.collection(collection).add(data);
        return { success: true, id: ref.id, mode: 'fallback' };
      }
      const ref = await db.collection(collection).add(data);
      return { success: true, id: ref.id, mode: 'cloud' };
    } catch (error) {
      logger.error(`Firestore addDocument error on collection ${collection}. Attempting fallback...`, error);
      const ref = await localDbHelper.collection(collection).add(data);
      return { success: true, id: ref.id, mode: 'fallback_active' };
    }
  },

  /**
   * Retrieve a single document
   */
  async getDocument(collection, docId) {
    try {
      let docSnap;
      if (isFallback) {
        docSnap = await db.collection(collection).doc(docId).get();
      } else {
        docSnap = await db.collection(collection).doc(docId).get();
      }
      
      if (!docSnap.exists) {
        // Check local DB if not found in cloud, just in case fallback was previously active
        const localSnap = await localDbHelper.collection(collection).doc(docId).get();
        if (localSnap.exists) {
          return localSnap.data();
        }
        return null;
      }
      return docSnap.data();
    } catch (error) {
      logger.error(`Firestore getDocument error on collection ${collection}, doc ${docId}. Attempting fallback...`, error);
      const docSnap = await localDbHelper.collection(collection).doc(docId).get();
      return docSnap.exists ? docSnap.data() : null;
    }
  },

  /**
   * Get all documents in a collection
   */
  async getCollection(collection) {
    try {
      let querySnapshot;
      if (isFallback) {
        querySnapshot = await db.collection(collection).get();
      } else {
        querySnapshot = await db.collection(collection).get();
      }

      const results = [];
      querySnapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });

      // Merge with fallback database to ensure seamless experience
      if (!isFallback) {
        const localSnap = await localDbHelper.collection(collection).get();
        localSnap.forEach(doc => {
          if (!results.some(r => r.id === doc.id)) {
            results.push({ id: doc.id, ...doc.data() });
          }
        });
      }

      return results;
    } catch (error) {
      logger.error(`Firestore getCollection error on collection ${collection}. Attempting fallback...`, error);
      const querySnapshot = await localDbHelper.collection(collection).get();
      const results = [];
      querySnapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(collection, docId) {
    try {
      if (isFallback) {
        await db.collection(collection).doc(docId).delete();
      } else {
        await db.collection(collection).doc(docId).delete();
      }
      // Also delete from local db to maintain parity
      await localDbHelper.collection(collection).doc(docId).delete();
      return { success: true };
    } catch (error) {
      logger.error(`Firestore deleteDocument error on collection ${collection}, doc ${docId}.`, error);
      await localDbHelper.collection(collection).doc(docId).delete();
      return { success: true, mode: 'fallback_active' };
    }
  },

  isFallbackMode() {
    return isFallback;
  },

  // Test helper to mock Firestore mode
  __setMode(fallback, mockDb) {
    isFallback = fallback;
    if (mockDb !== undefined) {
      db = mockDb;
    }
  }
};

module.exports = firestoreService;
