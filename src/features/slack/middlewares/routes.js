import { promises as fsPromises } from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { getConversationsHistory } from '../methods/conversations-history';
import { getConversationsList } from '../methods/conversations-list';
import { getConversationsReplies } from '../methods/conversations-replies';
import { getUsersInfo } from '../methods/users-info';

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
    try {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      fsPromises.writeFile(
        path.resolve(`src/data/history/${currentDate}.json`),
        JSON.stringify(allHistory, null, 4)
      );
      console.log(`Writing file ${currentDate}.json success !`);
    } catch (err) {
      console.error(err);
    }
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
  console.log('Process of writing replies...');
  for (let i = 0, len = allReplies.length; i < len; i += 1) {
    allRepliesMessages.push(...allReplies[i].messages);
    const timestamp = allReplies[i].messages[0].ts;
    try {
      fsPromises.writeFile(
        path.resolve(`src/data/replies/${timestamp}.json`),
        JSON.stringify(allReplies[i], null, 4)
      );
    } catch (err) {
      console.error(err);
    }
  }
  console.log('Writing replies finished !');

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
