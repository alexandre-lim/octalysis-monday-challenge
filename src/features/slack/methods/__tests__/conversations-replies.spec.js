import { WebClient } from '@slack/web-api';
import { createCustomError } from '../../../../utils/error-handler';
import { getConversationsReplies } from '../conversations-replies';

jest.mock('../utils/slack-api-token', () => require('../utils/__mocks__/slack-api-token'));

jest.mock('../utils/channel', () => require('../utils/__mocks__/channel'));

jest.mock('@slack/web-api', () => ({
  WebClient: jest.fn(),
  ErrorCode: { PlatformError: 'slack_webapi_platform_error' },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getConversationsReplies', () => {
  test('should return conversationsReplies on success', async () => {
    // https://api.slack.com/methods/conversations.replies
    const repliesResultsMock = {
      ok: true,
      messages: [{}],
      has_more: true,
      response_metadata: {
        next_cursor: 'bmV4dF90czoxNTEyMDg1ODYxMDAwNTQz',
      },
    };

    const webClientMock = {
      conversations: {
        replies: () => repliesResultsMock,
      },
    };

    WebClient.mockReturnValue(webClientMock);

    const conversationReplies = await getConversationsReplies();

    expect(conversationReplies).toEqual(repliesResultsMock);
  });

  test('should enter the catch branch and return an error object with details from slack error', async () => {
    const slackErrorMock = {
      code: 'slack_webapi_platform_error',
      data: {
        ok: false,
        error: 'thread_not_found',
        response_metadata: {},
      },
    };
    const message = 'Error returned by slack api when calling method conversations replies';
    const expectedError = createCustomError({
      message: { error: message, timestamp: undefined },
      details: slackErrorMock.data,
    });
    const webClientMock = {
      conversations: {
        replies: () => {
          throw slackErrorMock;
        },
      },
    };

    WebClient.mockReturnValue(webClientMock);
    const conversationsRepliesError = await getConversationsReplies();

    expect(conversationsRepliesError).toEqual(expectedError);
  });

  test('should enter the catch branch and return an error object with empty details object property', async () => {
    const message = 'Unexpected error when calling slack api method conversations replies';
    const expectedError = createCustomError({
      message: { error: message, timestamp: undefined },
    });
    const webClientMock = {
      conversations: {
        replies: () => {
          throw new Error('Unexpected Error');
        },
      },
    };

    WebClient.mockReturnValue(webClientMock);
    const conversationsRepliesError = await getConversationsReplies();

    expect(conversationsRepliesError).toEqual(expectedError);
    expect(conversationsRepliesError).toHaveProperty('details', {});
  });
});
