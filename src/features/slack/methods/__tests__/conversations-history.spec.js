import { WebClient } from '@slack/web-api';
import { createCustomError } from '../../../../utils/error-handler';
import {
  getAllConversationsHistory,
  getConversationsHistory,
  getMessagesFromConversationsHistory,
} from '../conversations-history';

jest.mock('../utils/slack-api-token', () => require('../utils/__mocks__/slack-api-token'));

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
      message: 'Error returned by slack api when calling method conversations history',
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
    const message = 'Unexpected error when calling slack api method conversations history';
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

describe('getAllConversationsHistory', () => {
  test('should return an array of 2 conversationsHistory on success', async () => {
    const historyResultsHasMoreAndNextCursorMock = {
      ok: true,
      messages: [{}],
      has_more: true,
      pin_count: 0,
      response_metadata: {
        next_cursor: 'bmV4dF90czoxNTEyMDg1ODYxMDAwNTQz',
      },
    };

    const webClientCursorMock = {
      conversations: {
        history: () => historyResultsHasMoreAndNextCursorMock,
      },
    };

    const historyResultsMock = {
      ok: true,
      messages: [{}],
      has_more: false,
      pin_count: 0,
      response_metadata: {},
    };

    const webClientMock = {
      conversations: {
        history: () => historyResultsMock,
      },
    };

    WebClient.mockReturnValueOnce(webClientCursorMock).mockReturnValueOnce(webClientMock);

    const { allConversationsHistory, error: conversationsHistoryError } = await getAllConversationsHistory();

    const results = [historyResultsHasMoreAndNextCursorMock, historyResultsMock];
    expect(conversationsHistoryError).toEqual({
      hasError: false,
      trace: null,
    });
    expect(WebClient).toHaveBeenCalledTimes(2);
    expect(allConversationsHistory).toEqual(results);
  });

  test('should return an object error on second loop', async () => {
    const historyResultsHasMoreAndNextCursorMock = {
      ok: true,
      messages: [{}],
      has_more: true,
      pin_count: 0,
      response_metadata: {
        next_cursor: 'bmV4dF90czoxNTEyMDg1ODYxMDAwNTQz',
      },
    };

    const webClientCursorMock = {
      conversations: {
        history: () => historyResultsHasMoreAndNextCursorMock,
      },
    };

    const slackErrorMock = {
      code: 'slack_webapi_platform_error',
      data: {
        ok: false,
        error: 'channel_not_found',
        response_metadata: {},
      },
    };

    const expectedError = {
      hasError: true,
      trace: createCustomError({
        message: 'Error returned by slack api when calling method conversations history',
        details: slackErrorMock.data,
      }),
    };

    const webClientMock = {
      conversations: {
        history: () => {
          throw slackErrorMock;
        },
      },
    };

    WebClient.mockReturnValueOnce(webClientCursorMock).mockReturnValueOnce(webClientMock);

    const { allConversationsHistory, error: conversationsHistoryError } = await getAllConversationsHistory();

    const results = [historyResultsHasMoreAndNextCursorMock];
    expect(conversationsHistoryError).toEqual(expectedError);
    expect(WebClient).toHaveBeenCalledTimes(2);
    expect(allConversationsHistory).toEqual(results);
  });
});

describe('getMessagesFromConversationsHistory', () => {
  test('should return an empty array if function is called with no param', () => {
    const results = getMessagesFromConversationsHistory();
    expect(results).toEqual([]);
  });

  test(' return an array of messages object without a subtype property', () => {
    const validMessages = [
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
    ];

    const messageWithSubtype = {
      type: 'message',
      subtype: 'channel_join',
      ts: '1618679516.099200',
      user: 'U061F7AUR',
      text: '<@U061F7AUR> has joined the channel',
    };

    const allConversationsHistory = [
      {
        ok: true,
        messages: [validMessages[0], validMessages[1], messageWithSubtype],
        has_more: true,
        pin_count: 0,
        response_metadata: {
          next_cursor: 'bmV4dF90czoxNTEyMDg1ODYxMDAwNTQz',
        },
      },
      {
        ok: true,
        messages: [messageWithSubtype, validMessages[1]],
        has_more: false,
        pin_count: 0,
        response_metadata: {},
      },
    ];

    const expectedResults = [validMessages[0], validMessages[1], validMessages[1]];

    const results = getMessagesFromConversationsHistory(allConversationsHistory);
    expect(results).toEqual(expectedResults);
  });
});
