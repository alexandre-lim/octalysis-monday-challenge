import { getMongDb } from '../utils/mongo-db';
import {
  getAllConversationsHistory,
  getMessagesFromConversationsHistory,
} from '../../slack/methods/conversations-history';
import { createCustomError } from '../../../utils/error-handler';
import { insertHistoryByDate } from '../../../services/history';
import { getRepliesFromConversationsHistoryMessages } from '../../slack/methods/conversations-replies';
import { insertRepliesByTimestamp } from '../../../services/replies';

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

async function insertConversationsRepliesRoute(req, res, next) {
  const { allConversationsHistory, error: conversationsHistoryError } = await getAllConversationsHistory();

  if (conversationsHistoryError.hasError) return next(conversationsHistoryError.trace);

  const conversationsHistoryMessages = getMessagesFromConversationsHistory(allConversationsHistory);

  const { replies, error: repliesError } = await getRepliesFromConversationsHistoryMessages(
    conversationsHistoryMessages
  );

  if (repliesError.hasError) return next(repliesError.trace);

  if (repliesError.hasError === false) {
    const db = getMongDb(req);
    if (db) {
      const results = await insertRepliesByTimestamp(db, replies);
      return res.json(results);
    } else {
      const error = createCustomError({ message: 'No mongo database instance found in req' });
      return next(error);
    }
  }
}

export { insertConversationsAllHistoryRoute, insertConversationsRepliesRoute };
