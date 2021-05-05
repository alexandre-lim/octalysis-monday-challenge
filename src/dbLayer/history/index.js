import { createCustomError } from '../../utils/error-handler';
import { HISTORY_COLLECTION_NAME } from '../collections';
import { find, findOne, insertOne } from '../mongo';

async function dbFindHistoryByDate(dbHandler, date) {
  const historyFoundFromDate = await findOne(dbHandler, HISTORY_COLLECTION_NAME, { date });
  return historyFoundFromDate;
}

async function dbInsertHistory(dbHandler, document) {
  const insertResults = await insertOne(dbHandler, HISTORY_COLLECTION_NAME, document);
  return insertResults;
}

async function dbFindLatestHistory(dbHandler) {
  try {
    const cursor = find(dbHandler, HISTORY_COLLECTION_NAME);
    if (cursor.error === true) return cursor;

    const results = await cursor.sort({ _id: -1 }).limit(1).toArray();
    return results;
  } catch (err) {
    const error = createCustomError({ message: 'Error in dbFindHistory function', details: err });
    return error;
  }
}

export { dbFindHistoryByDate, dbInsertHistory, dbFindLatestHistory };
