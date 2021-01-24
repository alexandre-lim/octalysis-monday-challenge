import { WebClient } from '@slack/web-api';
import { createCustomError } from '../../../../utils/error-handler';
import { getUsersInfo } from '../users-info';

jest.mock('../utils/slack-api-token', () =>
  require('../utils/__mocks__/slack-api-token')
);

jest.mock('@slack/web-api', () => ({
  WebClient: jest.fn(),
  ErrorCode: { PlatformError: 'slack_webapi_platform_error' },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getUsersInfo', () => {
  test('should return usersInfo on success', async () => {
    // https://api.slack.com/methods/users.info
    const usersInfoResultsMock = {
      ok: true,
      user: {},
      is_admin: true,
      is_owner: false,
      is_primary_owner: false,
      is_restricted: false,
      is_ultra_restricted: false,
      is_bot: false,
      updated: 1502138686,
      is_app_user: false,
      has_2fa: false,
    };

    const webClientMock = {
      users: {
        info: () => usersInfoResultsMock,
      },
    };

    WebClient.mockReturnValue(webClientMock);

    const usersInfo = await getUsersInfo();

    expect(usersInfo).toEqual(usersInfoResultsMock);
  });

  test('should enter the catch branch and return an error object with details from slack error', async () => {
    const slackErrorMock = {
      code: 'slack_webapi_platform_error',
      data: {
        ok: false,
        error: 'user_not_found',
      },
    };
    const expectedError = createCustomError({
      message: 'Error returned by slack api when calling method users info',
      details: slackErrorMock.data,
    });
    const webClientMock = {
      users: {
        info: () => {
          throw slackErrorMock;
        },
      },
    };

    WebClient.mockReturnValue(webClientMock);
    const usersInfoError = await getUsersInfo();

    expect(usersInfoError).toEqual(expectedError);
  });

  test('should enter the catch branch and return an error object with empty details object property', async () => {
    const message = 'Unexpected error when calling slack api method users info';
    const expectedError = createCustomError({ message });
    const webClientMock = {
      users: {
        info: () => {
          throw new Error('Unexpected Error');
        },
      },
    };

    WebClient.mockReturnValue(webClientMock);
    const usersInfoError = await getUsersInfo();

    expect(usersInfoError).toEqual(expectedError);
    expect(usersInfoError).toHaveProperty('details', {});
  });
});
