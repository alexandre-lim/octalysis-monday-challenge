import { dbFindHistoryByDate, dbInsertHistory } from '../../dbLayer/history';
import { getFormatTodayDate } from '../../utils/date';

async function findHistoryByDate(dbHandler, date) {
  const history = await dbFindHistoryByDate(dbHandler, date);
  const { _id, ts, ...results } = history;
  return results;
}

async function insertHistory(dbHandler, document) {
  const history = await dbInsertHistory(dbHandler, document);
  return history.ops[0];
}

async function insertHistoryByDate(dbHandler, histories = []) {
  const { formattedDate, timestamp } = getFormatTodayDate();
  const historyFoundFromDate = await findHistoryByDate(dbHandler, formattedDate);
  if (historyFoundFromDate) {
    return historyFoundFromDate;
  } else {
    const document = {
      date: formattedDate,
      ts: timestamp,
      histories,
    };
    const insertResults = await insertHistory(dbHandler, document);
    return insertResults;
  }
}

export { insertHistoryByDate };
