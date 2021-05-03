import { dbInsertRepliesByTimestamp } from '../../dbLayer/replies';

async function insertRepliesByTimestamp(dbHandler, replies = []) {
  const results = {
    error: { count: 0, traces: [] },
    insert: { count: 0, traces: [] },
    update: { count: 0, traces: [] },
  };

  for await (const insertRepliesResult of replies.map((reply) => dbInsertRepliesByTimestamp(dbHandler, reply))) {
    if (insertRepliesResult.error) {
      results.error.count++;
      results.error.traces.push(insertRepliesResult);
    } else if (insertRepliesResult?.lastErrorObject?.updatedExisting === false) {
      results.insert.count++;
      results.insert.traces.push(insertRepliesResult);
    } else if (insertRepliesResult?.lastErrorObject?.updatedExisting === true) {
      results.update.count++;
      results.update.traces.push(insertRepliesResult);
    }
  }

  return results;
}

export { insertRepliesByTimestamp };
