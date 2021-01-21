import { WebClient, ErrorCode } from '@slack/web-api';
import { createCustomError } from '../../../utils/error-handler';
import { getSlackApiToken } from './utils/slack-api-token';

async function getConversationsList() {
  const SLACK_API_TOKEN = getSlackApiToken();
  const web = new WebClient(SLACK_API_TOKEN);

  try {
    const conversationsList = await web.conversations.list();
    return conversationsList;
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      const message =
        'Error returned by slack api when calling method conversations list';
      return createCustomError({ message, details: error.data });
    } else {
      const message = `Unexpected error when calling slack api method conversations list`;
      return createCustomError({ message });
    }
  }
}

export { getConversationsList };
