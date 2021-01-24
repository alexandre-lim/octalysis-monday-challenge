import { ErrorCode, WebClient } from '@slack/web-api';
import { createCustomError } from '../../../utils/error-handler';
import { getSlackApiToken } from './utils/slack-api-token';
import { getMondayChallengeChannelId } from './utils/channel';

async function getConversationsReplies() {
  const SLACK_API_TOKEN = getSlackApiToken();
  const SLACK_MONDAY_CHALLENGE_CHANNEL_ID = getMondayChallengeChannelId();
  const web = new WebClient(SLACK_API_TOKEN);

  try {
    const conversationsReplies = await web.conversations.replies({
      channel: SLACK_MONDAY_CHALLENGE_CHANNEL_ID,
      ts: '1605953166.001000',
    });
    return conversationsReplies;
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      const message =
        'Error returned by slack api when calling method conversations replies';
      return createCustomError({ message, details: error.data });
    } else {
      const message = `Unexpected error when calling slack api method conversations replies`;
      return createCustomError({ message });
    }
  }
}

export { getConversationsReplies };
