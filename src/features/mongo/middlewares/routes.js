import { getMongDb } from '../utils/mongo-db';
import { getAllConversationsHistory } from '../../slack/methods/conversations-history';
import { createCustomError } from '../../../utils/error-handler';
import { insertHistoryByDate } from '../../../services/history';

async function insertConversationsAllHistoryRoute(req, res, next) {
  const { allConversationsHistory, error } = await getAllConversationsHistory();

  if (error.hasError === false) {
    const db = getMongDb(req);
    if (db) {
      const results = await insertHistoryByDate(db, allConversationsHistory);
      return results.error === true ? next(results) : res.json(results);
    } else {
      const error = createCustomError({ message: 'No mongo database instance found in req' });
      return next(error);
    }
  }

  error.hasError === true ? next(error.trace) : res.json(allConversationsHistory);
}

export { insertConversationsAllHistoryRoute };
