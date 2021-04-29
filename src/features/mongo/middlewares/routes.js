import { getMongDb } from '../utils/mongo-db';
import { getAllConversationsHistory } from '../../slack/methods/conversations-history';
import { createCustomError } from '../../../utils/error-handler';
import { insertHistoryByDate } from '../../../services/history';

async function insertConversationsAllHistoryRoute(req, res, next) {
  const { allConversationsHistory, error } = await getAllConversationsHistory();

  if (error.hasError === false) {
    const db = getMongDb(req);
    if (db) {
      try {
        const results = await insertHistoryByDate(db, allConversationsHistory);
        return res.json(results);
      } catch (err) {
        const error = createCustomError({ message: err.message });
        return next(error);
      }
    } else {
      const error = createCustomError({ message: 'No mongo database instance found in req' });
      return next(error);
    }
  }

  error.hasError === true ? next(error.trace) : res.json(allConversationsHistory);
}

export { insertConversationsAllHistoryRoute };
