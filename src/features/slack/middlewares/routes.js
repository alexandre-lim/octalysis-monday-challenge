import {
  getConversationsHistory,
  getAllConversationsHistory,
  getMessagesFromConversationsHistory,
} from '../methods/conversations-history';
import { getConversationsList } from '../methods/conversations-list';
import { getConversationsReplies, getRepliesFromConversationsHistoryMessages } from '../methods/conversations-replies';
import { getUsersInfo } from '../methods/users-info';
import { getDateFromTwoWeeksAgo } from '../../../utils/date';

async function getConversationsListRoute(req, res, next) {
  const results = await getConversationsList();
  results?.error === true ? next(results) : res.json(results);
}

async function getConversationsHistoryRoute(req, res, next) {
  const results = await getConversationsHistory();
  results?.error === true ? next(results) : res.json(results);
}

async function getConversationsAllHistoryRoute(req, res, next) {
  const { allConversationsHistory, error } = await getAllConversationsHistory();
  error.hasError === true ? next(error.trace) : res.json(allConversationsHistory);
}

async function getConversationsRepliesRoute(req, res, next) {
  const results = await getConversationsReplies('1618250497.084500');
  results?.error === true ? next(results) : res.json(results);
}

async function getLatestMessagesRoute(req, res, next) {
  const { intervalDate, twoWeeksAgoTimestamp } = getDateFromTwoWeeksAgo();

  const conversationsHistory = await getConversationsHistory(null, twoWeeksAgoTimestamp);

  if (conversationsHistory?.error === true) return next(conversationsHistory);

  const conversationsHistoryMessages = getMessagesFromConversationsHistory([conversationsHistory]);

  const { historyMessagesWithReplies, error: repliesError } = await getRepliesFromConversationsHistoryMessages(
    conversationsHistoryMessages
  );

  if (repliesError.hasError) return next(repliesError.trace);

  res.json({ intervalDate, historyMessagesWithReplies });
}

async function getUsersInfoRoute(req, res, next) {
  const results = await getUsersInfo();
  results?.error === true ? next(results) : res.json(results);
}

export {
  getConversationsListRoute,
  getConversationsHistoryRoute,
  getConversationsAllHistoryRoute,
  getConversationsRepliesRoute,
  getLatestMessagesRoute,
  getUsersInfoRoute,
};
