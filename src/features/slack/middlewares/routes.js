import {
  getConversationsHistory,
  getAllConversationsHistory,
  getMessagesFromConversationsHistory,
} from '../methods/conversations-history';
import { getConversationsList } from '../methods/conversations-list';
import { getConversationsReplies, getRepliesFromConversationsHistoryMessages } from '../methods/conversations-replies';
import { getUsersInfo } from '../methods/users-info';
import { writeHistoryJSON, writeRepliesJSON } from '../../../utils/file';

async function getConversationsListRoute(req, res, next) {
  const results = await getConversationsList();
  results?.error === true ? next(results) : res.json(results);
}

async function getConversationsHistoryRoute(req, res, next) {
  const results = await getConversationsHistory();
  results?.error === true ? next(results) : res.json(results);
}

async function getConversationsRepliesRoute(req, res, next) {
  const results = await getConversationsReplies('1618250497.084500');
  results?.error === true ? next(results) : res.json(results);
}

async function getUsersInfoRoute(req, res, next) {
  const results = await getUsersInfo();
  results?.error === true ? next(results) : res.json(results);
}

async function storeConversationsHistoryRoute(req, res, next) {
  const { allConversationsHistory, error } = await getAllConversationsHistory();

  if (error.hasError === false) {
    writeHistoryJSON(allConversationsHistory);
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

  writeRepliesJSON(replies);

  res.json({
    parentMessages: conversationsHistoryMessages.length,
    replies: replies.length,
    repliesMessages: repliesMessages.length,
  });
}

export {
  getConversationsListRoute,
  getConversationsHistoryRoute,
  getConversationsRepliesRoute,
  getUsersInfoRoute,
  storeConversationsRepliesRoute,
  storeConversationsHistoryRoute,
};
