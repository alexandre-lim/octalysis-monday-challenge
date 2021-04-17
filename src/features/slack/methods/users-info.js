import { ErrorCode, WebClient } from '@slack/web-api';
import { createCustomError } from '../../../utils/error-handler';
import { getSlackApiToken } from './utils/slack-api-token';

async function getUsersInfo() {
  const SLACK_API_TOKEN = getSlackApiToken();
  const web = new WebClient(SLACK_API_TOKEN);

  try {
    const usersInfo = await web.users.info({
      user: 'UFRE0CD55',
    });
    return usersInfo;
  } catch (error) {
    if (error.code === ErrorCode.PlatformError) {
      const message = 'Error returned by slack api when calling method users info';
      return createCustomError({ message, details: error.data });
    } else {
      const message = `Unexpected error when calling slack api method users info`;
      return createCustomError({ message });
    }
  }
}

export { getUsersInfo };
