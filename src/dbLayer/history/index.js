import { HISTORY_COLLECTION_NAME } from '../collections';
import { findOne, insertOne } from '../mongo';

async function dbFindHistoryByDate(dbHandler, date) {
  const historyFoundFromDate = await findOne(dbHandler, HISTORY_COLLECTION_NAME, { date });
  return historyFoundFromDate;
}

async function dbInsertHistory(dbHandler, document) {
  const insertResults = await insertOne(dbHandler, HISTORY_COLLECTION_NAME, document);
  return insertResults;
}

export { dbFindHistoryByDate, dbInsertHistory };
