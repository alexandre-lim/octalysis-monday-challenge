import { getConversationsHistory } from '../methods/conversations-history';
import { getConversationsList } from '../methods/conversations-list';
import { getConversationsReplies } from '../methods/conversations-replies';
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
  const allHistory = [];
  let hasNextCursor = false;
  let error = false;
  let nextCursor = null;

  do {
    const historyResults = await getConversationsHistory(nextCursor);
    allHistory.push(historyResults);

    if (historyResults?.error === true) {
      error = true;
      break;
    }

    if (historyResults.has_more === false) break;

    if (
      historyResults.has_more === true &&
      historyResults.response_metadata?.next_cursor
    ) {
      nextCursor = historyResults.response_metadata.next_cursor;
      hasNextCursor = true;
    }
  } while (hasNextCursor === true);

  if (error === false) {
    writeHistoryJSON(allHistory);
  }

  error === true ? next(allHistory[0]) : res.json(allHistory);
}

async function storeConversationsRepliesRoute(req, res, next) {
  const historyMessages = [];
  let hasNextCursor = false;
  let nextCursor = null;
  let error = {
    hasError: false,
    trace: null,
  };
  do {
    const historyResults = await getConversationsHistory(nextCursor);

    if (historyResults?.error === true) {
      error.hasError = true;
      error.trace = historyResults;
      break;
    }
    historyMessages.push(...historyResults.messages);

    if (historyResults.has_more === false) break;

    if (
      historyResults.has_more === true &&
      historyResults.response_metadata?.next_cursor
    ) {
      nextCursor = historyResults.response_metadata.next_cursor;
      hasNextCursor = true;
    }
  } while (hasNextCursor === true);

  if (error.hasError) return next(error.trace);

  const filteredMessages = historyMessages.filter(
    (message) => typeof message.subtype === 'undefined'
  );

  const allReplies = [];

  for (let i = 0, len = filteredMessages.length; i < len; i += 1) {
    if (filteredMessages[i].thread_ts) {
      let timestamp = filteredMessages[i].ts;
      const repliesResult = await getConversationsReplies(timestamp);
      if (repliesResult?.error === true) {
        error.hasError = true;
        error.trace = repliesResult;
        break;
      }
      allReplies.push(repliesResult);
    }
  }

  if (error.hasError) return next(error.trace);

  const allRepliesMessages = [];
  for (let i = 0, len = allReplies.length; i < len; i += 1) {
    allRepliesMessages.push(...allReplies[i].messages);
  }

  writeRepliesJSON(allReplies);

  res.json({
    parentMessages: filteredMessages.length,
    replies: allReplies.length,
    repliesMessages: allRepliesMessages.length,
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
