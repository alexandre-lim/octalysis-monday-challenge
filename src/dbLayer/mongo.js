import { createCustomError } from '../utils/error-handler';

async function findOne(dbHandler, collectionName, query = {}, options = {}) {
  const collection = dbHandler.collection(collectionName);
  try {
    const results = await collection.findOne(query, options);
    return results;
  } catch (err) {
    const error = createCustomError({ message: 'Error in findOne function' });
    return error;
  }
}

async function insertOne(dbHandler, collectionName, document = {}, options = {}) {
  const collection = dbHandler.collection(collectionName);
  try {
    const results = await collection.insertOne(document, options);
    return results;
  } catch (err) {
    const error = createCustomError({ message: 'Error in insertOne function' });
    return error;
  }
}

export { findOne, insertOne };
