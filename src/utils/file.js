import { promises as fsPromises } from 'fs';
import path from 'path';
import { format } from 'date-fns';

async function writeHistoryJSON(history, historyPath = 'src/data/history') {
  if (Array.isArray(history)) {
    try {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      await fsPromises.writeFile(path.resolve(`${historyPath}/${currentDate}.json`), JSON.stringify(history, null, 4));
      console.log(`Writing file ${currentDate}.json success !`);
    } catch (err) {
      console.error(err);
    }
  }
}

async function writeRepliesJSON(replies, repliesPath = 'src/data/replies') {
  if (Array.isArray(replies)) {
    console.log('Process of writing replies...');
    for (let i = 0, len = replies.length; i < len; i += 1) {
      const timestamp = replies[i].messages[0].ts;
      try {
        await fsPromises.writeFile(
          path.resolve(`${repliesPath}/${timestamp}.json`),
          JSON.stringify(replies[i], null, 4)
        );
        console.log(`${i} - Writing file ${timestamp}.json success`);
      } catch (err) {
        console.error(err);
      }
    }
    console.log('Writing replies finished !');
  }
}

export { writeHistoryJSON, writeRepliesJSON };
