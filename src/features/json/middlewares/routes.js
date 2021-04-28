import {
  getConversationsHistory,
  getAllConversationsHistory,
  getMessagesFromConversationsHistory,
} from '../../slack/methods/conversations-history';
import { getRepliesFromConversationsHistoryMessages } from '../../slack/methods/conversations-replies';
import { writeHistoryJSON, writeMessagesJSON, writeRepliesJSON } from '../../../utils/file/write';
import { getHistoryMessagesWithReplies, readStoredConversationsHistory } from '../../../utils/file/read';
import { getDateFromTwoWeeksAgo } from '../../../utils/date';

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

async function storeLatestMessagesRoute(req, res, next) {
  const { intervalDate, twoWeeksAgoTimestamp } = getDateFromTwoWeeksAgo();

  const conversationsHistory = await getConversationsHistory(null, twoWeeksAgoTimestamp);

  if (conversationsHistory?.error === true) return next(conversationsHistory);

  const conversationsHistoryMessages = getMessagesFromConversationsHistory([conversationsHistory]);

  const { historyMessagesWithReplies, error: repliesError } = await getRepliesFromConversationsHistoryMessages(
    conversationsHistoryMessages
  );

  if (repliesError.hasError) return next(repliesError.trace);

  await writeMessagesJSON(historyMessagesWithReplies);

  res.json({ intervalDate, historyMessagesWithReplies });
}

export { storeConversationsRepliesRoute, storeConversationsHistoryRoute, storeMessagesRoute, storeLatestMessagesRoute };
