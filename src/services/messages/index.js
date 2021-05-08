import { dbInsertMessagesByTimestamp } from '../../dbLayer/messages';
import { dbFindOneRepliesByTimestamp } from '../../dbLayer/replies';

async function insertMessagesByTimestamp(dbHandler, messages = []) {
  const results = {
    error: { count: 0, traces: [] },
    insert: { count: 0, traces: [] },
    update: { count: 0, traces: [] },
  };

  for await (const insertMessagesResult of messages.map((messages) =>
    dbInsertMessagesByTimestamp(dbHandler, messages)
  )) {
    if (insertMessagesResult.error) {
      results.error.count++;
      results.error.traces.push(insertMessagesResult);
    } else if (insertMessagesResult?.lastErrorObject?.updatedExisting === false) {
      results.insert.count++;
      results.insert.traces.push(insertMessagesResult);
    } else if (insertMessagesResult?.lastErrorObject?.updatedExisting === true) {
      results.update.count++;
      results.update.traces.push(insertMessagesResult);
    }
  }

  return results;
}

async function getHistoryMessagesWithReplies(dbHandler, conversationsHistoryMessages = []) {
  const historyMessagesWithReplies = [];
  const error = {
    hasError: false,
    trace: null,
  };

  for (let i = 0, len = conversationsHistoryMessages.length; i < len; i += 1) {
    const threadTimestamp = conversationsHistoryMessages[i].thread_ts;
    if (typeof threadTimestamp !== 'undefined') {
      const conversationsReplies = await dbFindOneRepliesByTimestamp(dbHandler, threadTimestamp);
      if (conversationsReplies?.error === true) {
        error.hasError = true;
        error.trace = conversationsReplies;
        break;
      }
      if (conversationsReplies?.messages) conversationsHistoryMessages[i]['replies'] = conversationsReplies.messages;
    }
    historyMessagesWithReplies.push(conversationsHistoryMessages[i]);
  }

  return {
    historyMessagesWithReplies,
    error,
  };
}

export { insertMessagesByTimestamp, getHistoryMessagesWithReplies };
