import { ErrorCode, WebClient } from '@slack/web-api';
import { createCustomError } from '../../../utils/error-handler';
import { getSlackApiToken } from './utils/slack-api-token';
import { getMondayChallengeChannelId } from './utils/channel';

async function getConversationsReplies(timestamp, limit = 100) {
  const SLACK_API_TOKEN = getSlackApiToken();
  const SLACK_MONDAY_CHALLENGE_CHANNEL_ID = getMondayChallengeChannelId();
  const web = new WebClient(SLACK_API_TOKEN);

  try {
    const conversationsReplies = await web.conversations.replies({
      channel: SLACK_MONDAY_CHALLENGE_CHANNEL_ID,
      ts: timestamp,
      limit,
    });
    return conversationsReplies;
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      const message =
        'Error returned by slack api when calling method conversations replies';
      return createCustomError({
        message: { error: message, timestamp },
        details: error.data,
      });
    } else {
      const message = `Unexpected error when calling slack api method conversations replies`;
      return createCustomError({ message: { error: message, timestamp } });
    }
  }
}

async function getRepliesFromConversationsHistoryMessages(
  conversationsHistoryMessages = []
) {
  const replies = [];
  let error = {
    hasError: false,
    trace: null,
  };
  for (let i = 0, len = conversationsHistoryMessages.length; i < len; i += 1) {
    if (conversationsHistoryMessages[i].thread_ts) {
      let timestamp = conversationsHistoryMessages[i].ts;
      const repliesResult = await getConversationsReplies(timestamp);
      if (repliesResult?.error === true) {
        error.hasError = true;
        error.trace = repliesResult;
        break;
      }
      replies.push(repliesResult);
    }
  }
  return {
    replies,
    error,
  };
}

export { getConversationsReplies, getRepliesFromConversationsHistoryMessages };
