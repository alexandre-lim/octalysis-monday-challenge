import { WebClient } from '@slack/web-api';
import { createCustomError } from '../../../../utils/error-handler';
import { getConversationsList } from '../conversations-list';

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

describe('getConversationsList', () => {
  test('should execute try branch and return a conversationList object', async () => {
    const listResultsMock = {
      ok: true,
      channels: [],
      response_metadata: {},
    };
    const webClientMock = {
      conversations: {
        list: () => listResultsMock,
      },
    };

    WebClient.mockReturnValue(webClientMock);
    const conversationsList = await getConversationsList();

    expect(conversationsList).toEqual(listResultsMock);
  });

  test('should enter the catch branch and return an error object with details from slack error', async () => {
    const slackErrorMock = {
      code: 'slack_webapi_platform_error',
      data: {
        ok: false,
        error: 'invalid_auth',
        response_metadata: {},
      },
    };
    const expectedError = createCustomError({
      message:
        'Error returned by slack api when calling method conversations list',
      details: slackErrorMock.data,
    });
    const webClientMock = {
      conversations: {
        list: () => {
          throw slackErrorMock;
        },
      },
    };

    WebClient.mockReturnValue(webClientMock);
    const conversationsListError = await getConversationsList();

    expect(conversationsListError).toEqual(expectedError);
  });

  test('should enter the catch branch and return an error object with empty details object property', async () => {
    const message =
      'Unexpected error when calling slack api method conversations list';
    const expectedError = createCustomError({ message });
    const webClientMock = {
      conversations: {
        list: () => {
          throw new Error('Unexpected Error');
        },
      },
    };

    WebClient.mockReturnValue(webClientMock);
    const conversationsListError = await getConversationsList();

    expect(conversationsListError).toEqual(expectedError);
    expect(conversationsListError).toHaveProperty('details', {});
  });
});
