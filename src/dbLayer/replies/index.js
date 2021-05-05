import { createCustomError } from '../../utils/error-handler';
import { REPLIES_COLLECTION_NAME } from '../collections';
import { findOne, findOneAndReplace } from '../mongo';

async function dbInsertRepliesByTimestamp(dbHandler, document = {}) {
  try {
    if (Object.entries(document).length === 0) throw new Error('document param must not be an empty object');
    if (!document?.messages?.[0]?.ts) throw new Error('document.messages[0].ts should exist');
    const filter = { 'messages.0.ts': { $eq: document.messages[0].ts } };
    const options = {
      upsert: true,
      returnOriginal: false,
    };
    const insertResults = await findOneAndReplace(dbHandler, REPLIES_COLLECTION_NAME, filter, document, options);
    return insertResults;
  } catch (err) {
    const error = createCustomError({ message: 'Error in dbInsertRepliesByTimestamp function', details: err });
    return error;
  }
}

async function dbFindOneRepliesByTimestamp(dbHandler, timestamp = '') {
  const query = { 'messages.0.ts': { $eq: timestamp } };
  const historyFoundFromDate = await findOne(dbHandler, REPLIES_COLLECTION_NAME, query);
  return historyFoundFromDate;
}

export { dbInsertRepliesByTimestamp, dbFindOneRepliesByTimestamp };
