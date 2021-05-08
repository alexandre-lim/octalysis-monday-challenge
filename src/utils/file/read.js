import { promises as fsPromises } from 'fs';
import path from 'path';
import { createCustomError } from '../error-handler';
import { DATA_HISTORY_DIR_PATH, DATA_REPLIES_DIR_PATH } from './path';

async function readStoredConversationsHistory(historyPath = DATA_HISTORY_DIR_PATH, fileName = '2021-04-26') {
  try {
    const storedConversationsHistory = await readStoredConversations(historyPath, fileName);
    return storedConversationsHistory;
  } catch (error) {
    const { message, err } = error;
    return createCustomError({
      message,
      details: { message: 'Error in getStoredConversationsHistory function', ...err },
    });
  }
}

async function readStoredConversationsReplies(fileName, repliesPath = DATA_REPLIES_DIR_PATH) {
  try {
    const storedConversationsReplies = await readStoredConversations(repliesPath, fileName);
    return storedConversationsReplies;
  } catch (error) {
    const { message, err } = error;
    return createCustomError({
      message,
      details: { message: 'Error in getStoredConversationsReplies function', ...err },
    });
  }
}

async function readStoredConversations(dataPath, filename) {
  try {
    const results = await fsPromises.readFile(path.resolve(`${dataPath}/${filename}.json`), {
      encoding: 'utf-8',
    });
    return JSON.parse(results);
  } catch (err) {
    throw {
      message: `Access to ${dataPath}/${filename}.json failed`,
      err,
    };
  }
}

async function getHistoryMessagesWithReplies(conversationsHistoryMessages = []) {
  const historyMessagesWithReplies = [];
  const error = {
    hasError: false,
    trace: null,
  };

  for (let i = 0, len = conversationsHistoryMessages.length; i < len; i += 1) {
    const threadTimestamp = conversationsHistoryMessages[i].thread_ts;
    if (typeof threadTimestamp !== 'undefined') {
      const conversationsReplies = await readStoredConversationsReplies(threadTimestamp);
      if (conversationsReplies.error === true) {
        error.hasError = true;
        error.trace = conversationsReplies;
        break;
      }
      conversationsHistoryMessages[i]['replies'] = conversationsReplies.messages;
    }
    historyMessagesWithReplies.push(conversationsHistoryMessages[i]);
  }

  return {
    historyMessagesWithReplies,
    error,
  };
}

export { readStoredConversationsHistory, readStoredConversationsReplies, getHistoryMessagesWithReplies };
