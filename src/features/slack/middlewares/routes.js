import {
  getConversationsHistory,
  getAllConversationsHistory,
  getMessagesFromConversationsHistory,
} from '../methods/conversations-history';
import { getConversationsList } from '../methods/conversations-list';
import { getConversationsReplies, getRepliesFromConversationsHistoryMessages } from '../methods/conversations-replies';
import { getUsersInfo } from '../methods/users-info';
import { writeHistoryJSON, writeMessagesJSON, writeRepliesJSON } from '../../../utils/file/write';
import { getHistoryMessagesWithReplies, readStoredConversationsHistory } from '../../../utils/file/read';
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

async function storeConversationsHistoryRoute(req, res, next) {
  const { allConversationsHistory, error } = await getAllConversationsHistory();

  if (error.hasError === false) {
    await writeHistoryJSON(allConversationsHistory);
  }

  error.hasError === true ? next(error.trace) : res.json(allConversationsHistory);
}

async function storeConversationsRepliesRoute(req, res, next) {
  const { allConversationsHistory, error: conversationsHistoryError } = await getAllConversationsHistory();

  if (conversationsHistoryError.hasError) return next(conversationsHistoryError.trace);

  const conversationsHistoryMessages = getMessagesFromConversationsHistory(allConversationsHistory);

  const { replies, error: repliesError } = await getRepliesFromConversationsHistoryMessages(
    conversationsHistoryMessages
  );

  if (repliesError.hasError) return next(repliesError.trace);

  const repliesMessages = [];
  for (let i = 0, len = replies.length; i < len; i += 1) {
    repliesMessages.push(...replies[i].messages);
  }

  await writeRepliesJSON(replies);

  res.json({
    parentMessages: conversationsHistoryMessages.length,
    replies: replies.length,
    repliesMessages: repliesMessages.length,
  });
}

async function storeMessagesRoute(req, res, next) {
  const conversationsHistory = await readStoredConversationsHistory();

  if (conversationsHistory.error === true) return next(conversationsHistory);

  const conversationsHistoryMessages = getMessagesFromConversationsHistory(conversationsHistory);

  const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies(conversationsHistoryMessages);

  if (error.hasError === true) return next(error.trace);

  await writeMessagesJSON(historyMessagesWithReplies);

  res.json(historyMessagesWithReplies.slice(0, 10));
}

export {
  getConversationsListRoute,
  getConversationsHistoryRoute,
  getConversationsAllHistoryRoute,
  getConversationsRepliesRoute,
  getLatestMessagesRoute,
  getUsersInfoRoute,
  storeConversationsRepliesRoute,
  storeConversationsHistoryRoute,
  storeMessagesRoute,
};
