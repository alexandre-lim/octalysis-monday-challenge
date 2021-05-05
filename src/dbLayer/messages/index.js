import { createCustomError } from '../../utils/error-handler';
import { MESSAGES_COLLECTION_NAME } from '../collections';
import { findOneAndReplace } from '../mongo';

async function dbInsertMessagesByTimestamp(dbHandler, document = {}) {
  try {
    if (Object.entries(document).length === 0) throw new Error('document param must not be an empty object');
    if (!document?.ts) throw new Error('document.ts should exist');
    const filter = { ts: { $eq: document.ts } };
    const options = {
      upsert: true,
      returnOriginal: false,
    };
    const insertResults = await findOneAndReplace(dbHandler, MESSAGES_COLLECTION_NAME, filter, document, options);
    return insertResults;
  } catch (err) {
    const error = createCustomError({ message: 'Error in dbInsertMessagesByTimestamp function', details: err });
    return error;
  }
}

export { dbInsertMessagesByTimestamp };
