/* eslint-disable no-console */
import {
  getHistoryMessagesWithReplies,
  readStoredConversationsHistory,
  readStoredConversationsReplies,
} from '../../read';
import { fakeDate, fakeFileContent, fakeFilename } from '../../../../tests/integrations/fake';
import { DATA_HISTORY_DIR_PATH } from '../../path';

describe('readStoredConversationsHistory', () => {
  it('should read json file with success', async () => {
    const results = await readStoredConversationsHistory(DATA_HISTORY_DIR_PATH, fakeDate);
    expect(results).toEqual(fakeFileContent);
  });

  it('should return en error when file do not exist', async () => {
    const results = await readStoredConversationsHistory(DATA_HISTORY_DIR_PATH, 'notFoundFile');
    expect(results).toMatchInlineSnapshot(`
      Object {
        "details": Object {
          "code": "ENOENT",
          "errno": -2,
          "message": "Error in getStoredConversationsHistory function",
          "path": "/home/alim/Documents/workspace/octalysis-monday-challenge/src/data/tests/history/notFoundFile.json",
          "syscall": "open",
        },
        "error": true,
        "message": "Access to src/data/tests/history/notFoundFile.json failed",
        "statusCode": 500,
      }
    `);
  });
});

describe('readStoredConversationsReplies', () => {
  it('should read json file with success', async () => {
    const results = await readStoredConversationsReplies(fakeFilename);
    expect(results).toEqual(fakeFileContent);
  });

  it('should return en error when file do not exist', async () => {
    const results = await readStoredConversationsReplies('notFoundFile');
    expect(results).toMatchInlineSnapshot(`
      Object {
        "details": Object {
          "code": "ENOENT",
          "errno": -2,
          "message": "Error in getStoredConversationsReplies function",
          "path": "/home/alim/Documents/workspace/octalysis-monday-challenge/src/data/tests/replies/notFoundFile.json",
          "syscall": "open",
        },
        "error": true,
        "message": "Access to src/data/tests/replies/notFoundFile.json failed",
        "statusCode": 500,
      }
    `);
  });
});

describe('getHistoryMessagesWithReplies', () => {
  it('should return an array with two messages and one with replies property on success', async () => {
    const conversationsHistoryMessages = [
      {
        text: 'Message with a thread_ts',
        thread_ts: fakeFilename,
      },
      {
        text: 'Message without a thread_ts',
      },
    ];
    const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies(conversationsHistoryMessages);
    expect(historyMessagesWithReplies).toHaveLength(2);
    expect(error.hasError).toBe(false);
  });

  it('should return an empty array when no param', async () => {
    const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies();
    expect(historyMessagesWithReplies).toHaveLength(0);
    expect(error.hasError).toBe(false);
  });

  it('should return an error with true value on failure', async () => {
    const conversationsHistoryMessages = [
      {
        thread_ts: 'notFoundFile',
      },
    ];
    const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies(conversationsHistoryMessages);
    expect(historyMessagesWithReplies).toHaveLength(0);
    expect(error.hasError).toBe(true);
  });
});
