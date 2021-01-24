import { WebClient } from '@slack/web-api';
import { createCustomError } from '../../../../utils/error-handler';
import { getConversationsHistory } from '../conversations-history';

jest.mock('../utils/slack-api-token', () =>
  require('../utils/__mocks__/slack-api-token')
);

jest.mock('../utils/channel', () => require('../utils/__mocks__/channel'));

jest.mock('@slack/web-api', () => ({
  WebClient: jest.fn(),
  ErrorCode: { PlatformError: 'slack_webapi_platform_error' },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getConversationsHistory', () => {
  // https://api.slack.com/methods/conversations.history
  test('should return conversationsHistory on success', async () => {
    const historyResultsMock = {
      ok: true,
      messages: [{}],
      has_more: true,
      pin_count: 0,
      response_metadata: {
        next_cursor: 'bmV4dF90czoxNTEyMDg1ODYxMDAwNTQz',
      },
    };

    const webClientMock = {
      conversations: {
        history: () => historyResultsMock,
      },
    };

    WebClient.mockReturnValue(webClientMock);

    const conversationHistory = await getConversationsHistory();

    expect(conversationHistory).toEqual(historyResultsMock);
  });

  test('should enter the catch branch and return an error object with details from slack error', async () => {
    const slackErrorMock = {
      code: 'slack_webapi_platform_error',
      data: {
        ok: false,
        error: 'channel_not_found',
        response_metadata: {},
      },
    };
    const expectedError = createCustomError({
      message:
        'Error returned by slack api when calling method conversations history',
      details: slackErrorMock.data,
    });
    const webClientMock = {
      conversations: {
        history: () => {
          throw slackErrorMock;
        },
      },
    };

    WebClient.mockReturnValue(webClientMock);
    const conversationsHistoryError = await getConversationsHistory();

    expect(conversationsHistoryError).toEqual(expectedError);
  });

  test('should enter the catch branch and return an error object with empty details object property', async () => {
    const message =
      'Unexpected error when calling slack api method conversations history';
    const expectedError = createCustomError({ message });
    const webClientMock = {
      conversations: {
        history: () => {
          throw new Error('Unexpected Error');
        },
      },
    };

    WebClient.mockReturnValue(webClientMock);
    const conversationsHistoryError = await getConversationsHistory();

    expect(conversationsHistoryError).toEqual(expectedError);
    expect(conversationsHistoryError).toHaveProperty('details', {});
  });
});
