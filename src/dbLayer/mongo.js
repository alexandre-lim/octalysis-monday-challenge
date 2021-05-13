import { createCustomError } from '../utils/error-handler';

function find(dbHandler, collectionName, query = {}, options = {}) {
  try {
    const collection = dbHandler.collection(collectionName);
    const cursor = collection.find(query, options);
    return cursor;
  } catch (err) {
    const error = createCustomError({ message: 'Error in find function', details: err });
    return error;
  }
}

async function findOne(dbHandler, collectionName, query = {}, options = {}) {
  try {
    const collection = dbHandler.collection(collectionName);
    const results = await collection.findOne(query, options);
    return results;
  } catch (err) {
    const error = createCustomError({ message: 'Error in findOne function', details: err });
    return error;
  }
}

async function insertOne(dbHandler, collectionName, document = {}, options = {}) {
  try {
    const collection = dbHandler.collection(collectionName);
    const results = await collection.insertOne(document, options);
    return results;
  } catch (err) {
    const error = createCustomError({ message: 'Error in insertOne function', details: err });
    return error;
  }
}

async function findOneAndReplace(dbHandler, collectionName, filter = {}, document = {}, options = {}) {
  try {
    const collection = dbHandler.collection(collectionName);
    const results = await collection.findOneAndReplace(filter, document, options);
    return results;
  } catch (err) {
    const error = createCustomError({ message: 'Error in findOneAndReplace function', details: err });
    return error;
  }
}

async function aggregate(dbHandler, collectionName, pipeline = [], options = {}) {
  try {
    const collection = dbHandler.collection(collectionName);
    const aggregationCursor = await collection.aggregate(pipeline, options);
    return aggregationCursor;
  } catch (err) {
    const error = createCustomError({ message: 'Error in aggregate function', details: err });
    return error;
  }
}

export { find, findOne, insertOne, findOneAndReplace, aggregate };
