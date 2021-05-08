import { getMongDb } from '../utils/mongo-db';
import {
  getAllConversationsHistory,
  getConversationsHistory,
  getMessagesFromConversationsHistory,
} from '../../slack/methods/conversations-history';
import { createCustomError } from '../../../utils/error-handler';
import { insertHistoryByDate, findLatestHistory } from '../../../services/history';
import { getRepliesFromConversationsHistoryMessages } from '../../slack/methods/conversations-replies';
import { insertRepliesByTimestamp } from '../../../services/replies';
import { getHistoryMessagesWithReplies, insertMessagesByTimestamp } from '../../../services/messages';
import { getDateFromTwoWeeksAgo } from '../../../utils/date';

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

async function insertMessagesRoute(req, res, next) {
  const db = getMongDb(req);
  if (db) {
    const conversationsHistory = await findLatestHistory(db);

    if (conversationsHistory.error === true) return next(conversationsHistory);

    const conversationsHistoryMessages = getMessagesFromConversationsHistory(conversationsHistory);

    const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies(db, conversationsHistoryMessages);

    if (error.hasError === true) return next(error.trace);

    const results = await insertMessagesByTimestamp(db, historyMessagesWithReplies);
    return res.json(results);
  } else {
    const error = createCustomError({ message: 'No mongo database instance found in req' });
    return next(error);
  }
}

async function insertLatestMessagesRoute(req, res, next) {
  const db = getMongDb(req);
  if (db) {
    const { intervalDate, twoWeeksAgoTimestamp } = getDateFromTwoWeeksAgo();

    const conversationsHistory = await getConversationsHistory(null, twoWeeksAgoTimestamp);

    if (conversationsHistory?.error === true) return next(conversationsHistory);

    const conversationsHistoryMessages = getMessagesFromConversationsHistory([conversationsHistory]);

    const {
      replies,
      historyMessagesWithReplies,
      error: repliesError,
    } = await getRepliesFromConversationsHistoryMessages(conversationsHistoryMessages);

    if (repliesError.hasError) return next(repliesError.trace);

    const resultInsertReplies = await insertRepliesByTimestamp(db, replies);

    const resultInsertMessages = await insertMessagesByTimestamp(db, historyMessagesWithReplies);

    res.json({ intervalDate, resultInsertMessages, resultInsertReplies });
  } else {
    const error = createCustomError({ message: 'No mongo database instance found in req' });
    return next(error);
  }
}

export {
  insertConversationsAllHistoryRoute,
  insertConversationsRepliesRoute,
  insertMessagesRoute,
  insertLatestMessagesRoute,
};
