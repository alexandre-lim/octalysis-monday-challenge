import { dbFindLatestHistory, dbFindHistoryByDate, dbInsertHistory } from '../../dbLayer/history';
import { getFormatTodayDate } from '../../utils/date';

async function findHistoryByDate(dbHandler, date) {
  const history = await dbFindHistoryByDate(dbHandler, date);
  if (history === null || history.error === true) return history;
  const { _id, ts, ...results } = history || {};
  return results;
}

async function insertHistory(dbHandler, document) {
  const history = await dbInsertHistory(dbHandler, document);
  if (history.error === true) return history;
  return history.ops[0];
}

async function insertHistoryByDate(dbHandler, histories = []) {
  const { formattedDate, timestamp } = getFormatTodayDate();
  const historyFoundFromDate = await findHistoryByDate(dbHandler, formattedDate);

  if (historyFoundFromDate) return historyFoundFromDate;

  const document = {
    date: formattedDate,
    ts: timestamp,
    histories,
  };
  const insertResults = await insertHistory(dbHandler, document);
  return insertResults;
}

async function findLatestHistory(dbHandler) {
  const history = await dbFindLatestHistory(dbHandler);
  return history?.[0]?.histories ? history?.[0]?.histories : history;
}

export { insertHistoryByDate, findHistoryByDate, insertHistory, findLatestHistory };
