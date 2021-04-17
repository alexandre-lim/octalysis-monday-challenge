import { ErrorCode, WebClient } from '@slack/web-api';
import { createCustomError } from '../../../utils/error-handler';
import { getSlackApiToken } from './utils/slack-api-token';
import { getMondayChallengeChannelId } from './utils/channel';

async function getConversationsHistory(cursor = null) {
  const SLACK_API_TOKEN = getSlackApiToken();
  const SLACK_MONDAY_CHALLENGE_CHANNEL_ID = getMondayChallengeChannelId();
  const web = new WebClient(SLACK_API_TOKEN);

  try {
    const conversationsHistory = await web.conversations.history({
      channel: SLACK_MONDAY_CHALLENGE_CHANNEL_ID,
      cursor,
    });
    return conversationsHistory;
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      const message =
        'Error returned by slack api when calling method conversations history';
      return createCustomError({ message, details: error.data });
    } else {
      const message = `Unexpected error when calling slack api method conversations history`;
      return createCustomError({ message });
    }
  }
}

async function getAllConversationsHistory() {
  const allConversationsHistory = [];
  let hasNextCursor = false;
  let error = {
    hasError: false,
    trace: null,
  };
  let nextCursor = null;

  do {
    const historyResults = await getConversationsHistory(nextCursor);

    if (historyResults?.error === true) {
      error.hasError = true;
      error.trace = historyResults;
      break;
    }

    allConversationsHistory.push(historyResults);

    if (historyResults.has_more === false) break;

    if (
      historyResults.has_more === true &&
      historyResults.response_metadata?.next_cursor
    ) {
      nextCursor = historyResults.response_metadata.next_cursor;
      hasNextCursor = true;
    }
  } while (hasNextCursor === true);

  return {
    allConversationsHistory,
    error,
  };
}

function getMessagesFromConversationsHistory(allConversationsHistory = []) {
  const conversationsHistoryMessages = [];

  for (let i = 0, len = allConversationsHistory.length; i < len; i += 1) {
    conversationsHistoryMessages.push(...allConversationsHistory[i].messages);
  }

  const getMessagesWithoutSubtype = conversationsHistoryMessages.filter(
    (message) => typeof message.subtype === 'undefined'
  );

  return getMessagesWithoutSubtype;
}

export {
  getConversationsHistory,
  getAllConversationsHistory,
  getMessagesFromConversationsHistory,
};
