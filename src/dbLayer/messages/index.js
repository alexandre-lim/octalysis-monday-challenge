import { createCustomError } from '../../utils/error-handler';
import { MESSAGES_COLLECTION_NAME } from '../collections';
import { aggregate, findOneAndReplace } from '../mongo';

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

async function dbGetMessagesByIntervalDate(dbHandler, startDateTimestamp, endDateTimestamp) {
  try {
    const pipeline = [
      {
        $addFields: {
          convertTimestamp: {
            $toDecimal: '$ts',
          },
        },
      },
      {
        $match: {
          convertTimestamp: {
            $gte: startDateTimestamp,
            $lte: endDateTimestamp,
          },
        },
      },
      {
        $project: { convertTimestamp: 0 },
      },
    ];
    const aggregationCursor = await aggregate(dbHandler, MESSAGES_COLLECTION_NAME, pipeline);

    const results = await aggregationCursor.toArray();
    return results;
  } catch (err) {
    const error = createCustomError({ message: 'Error in dbGetMessagesByIntervalDate function', details: err });
    return error;
  }
}

export { dbInsertMessagesByTimestamp, dbGetMessagesByIntervalDate };
