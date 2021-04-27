import { WebClient } from '@slack/web-api';
import { createCustomError } from '../../../../utils/error-handler';
import { getConversationsReplies, getRepliesFromConversationsHistoryMessages } from '../conversations-replies';

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

describe('getRepliesFromConversationsHistoryMessages', () => {
  test('should return an empty array if function is called with no param', async () => {
    const { replies, error: repliesError } = await getRepliesFromConversationsHistoryMessages();
    expect(WebClient).toBeCalledTimes(0);
    expect(repliesError).toEqual({
      hasError: false,
      trace: null,
    });
    expect(replies).toEqual([]);
  });

  test('should return an array of conversationsReplies and historyMessagesWithReplies on success', async () => {
    const conversationsHistoryMessages = [
      {
        type: 'message',
        user: 'U061F7AUR',
        text: 'island',
        thread_ts: '1482960137.003543',
        reply_count: 3,
        subscribed: true,
        last_read: '1484678597.521003',
        unread_count: 0,
        ts: '1482960137.003543',
      },
      {
        type: 'message',
        user: 'U061F7AUR',
        text: 'one island',
        thread_ts: '1482960137.003543',
        parent_user_id: 'U061F7AUR',
        ts: '1483076303.017503',
      },
      {
        type: 'message',
        user: 'U061F7AUR',
        text: 'Message with no thread_ts',
        ts: '1483076303.017503',
      },
    ];

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

    const {
      replies,
      historyMessagesWithReplies,
      error: repliesError,
    } = await getRepliesFromConversationsHistoryMessages(conversationsHistoryMessages);
    expect(WebClient).toBeCalledTimes(2);
    expect(repliesError).toEqual({
      hasError: false,
      trace: null,
    });
    expect(replies).toEqual([repliesResultsMock, repliesResultsMock]);
    expect(historyMessagesWithReplies).toHaveLength(3);
    expect(historyMessagesWithReplies[0]).toHaveProperty('replies');
    expect(historyMessagesWithReplies[1]).toHaveProperty('replies');
    expect(historyMessagesWithReplies[2]).not.toHaveProperty('replies');
  });

  test('should return an object error on second loop', async () => {
    const conversationsHistoryMessages = [
      {
        type: 'message',
        user: 'U061F7AUR',
        text: 'island',
        thread_ts: '1482960137.003543',
        reply_count: 3,
        subscribed: true,
        last_read: '1484678597.521003',
        unread_count: 0,
        ts: '1482960137.003543',
      },
      {
        type: 'message',
        user: 'U061F7AUR',
        text: 'one island',
        thread_ts: '1482960137.003543',
        parent_user_id: 'U061F7AUR',
        ts: '1483076303.017503',
      },
      {
        type: 'message',
        user: 'U061F7AUR',
        text: 'one island',
        thread_ts: '1482960137.003543',
        parent_user_id: 'U061F7AUR',
        ts: '1483076303.017503',
      },
    ];

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

    const slackErrorMock = {
      code: 'slack_webapi_platform_error',
      data: {
        ok: false,
        error: 'thread_not_found',
        response_metadata: {},
      },
    };
    const message = 'Error returned by slack api when calling method conversations replies';
    const expectedError = {
      hasError: true,
      trace: createCustomError({
        message: { error: message, timestamp: conversationsHistoryMessages[1].ts },
        details: slackErrorMock.data,
      }),
    };
    const webClientErrorMock = {
      conversations: {
        replies: () => {
          throw slackErrorMock;
        },
      },
    };

    WebClient.mockReturnValueOnce(webClientMock)
      .mockReturnValueOnce(webClientErrorMock)
      .mockReturnValueOnce(webClientMock);

    const { replies, error: repliesError } = await getRepliesFromConversationsHistoryMessages(
      conversationsHistoryMessages
    );
    expect(WebClient).toBeCalledTimes(2);
    expect(repliesError).toEqual(expectedError);
    expect(replies).toEqual([repliesResultsMock]);
  });
});
