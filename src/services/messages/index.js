import isValid from 'date-fns/isValid';
import { dbGetMessagesByIntervalDate, dbInsertMessagesByTimestamp } from '../../dbLayer/messages';
import { dbFindOneRepliesByTimestamp } from '../../dbLayer/replies';
import { checkValidDate, DATE_MODE, getTimestampInterval } from '../../utils/date';
import { createCustomError } from '../../utils/error-handler';

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

async function getMessagesByIntervalDate(dbHandler, year, month, day) {
  const dateInfo = {
    date: null,
    mode: null,
  };

  if (day && day?.trim() !== '') {
    dateInfo.date = new Date(`${year}-${month}-${day}`);
    dateInfo.mode = DATE_MODE.DAY;
  }

  if (!isValid(dateInfo.date) && month && month?.trim() !== '' && dateInfo.mode === null) {
    dateInfo.date = new Date(`${year}-${month}`);
    dateInfo.mode = DATE_MODE.MONTH;
  }

  if (!isValid(dateInfo.date) && dateInfo.mode === null) {
    dateInfo.date = new Date(`${year}`);
    dateInfo.mode = DATE_MODE.YEAR;
  }

  if (checkValidDate(dateInfo.date, year, month, day)) {
    const { startDateTimestamp, endDateTimestamp } = getTimestampInterval(dateInfo.date, dateInfo.mode);
    const results = await dbGetMessagesByIntervalDate(dbHandler, startDateTimestamp, endDateTimestamp);
    return results;
  } else {
    const message = `Error in the requested date: year:${year} / month:${month}  / day:${day})}`;
    const error = createCustomError({ message });
    return error;
  }
}

export { insertMessagesByTimestamp, getHistoryMessagesWithReplies, getMessagesByIntervalDate };
