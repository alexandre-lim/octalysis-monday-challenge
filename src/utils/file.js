import { promises as fsPromises } from 'fs';
import path from 'path';
import { format } from 'date-fns';

function writeHistoryJSON(allHistory) {
  if (Array.isArray(allHistory)) {
    try {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      fsPromises.writeFile(
        path.resolve(`src/data/history/${currentDate}.json`),
        JSON.stringify(allHistory, null, 4)
      );
      console.log(`Writing file ${currentDate}.json success !`);
    } catch (err) {
      console.error(err);
    }
  }
}

function writeRepliesJSON(allReplies) {
  if (Array.isArray(allReplies)) {
    console.log('Process of writing replies...');
    for (let i = 0, len = allReplies.length; i < len; i += 1) {
      const timestamp = allReplies[i].messages[0].ts;
      try {
        fsPromises.writeFile(
          path.resolve(`src/data/replies/${timestamp}.json`),
          JSON.stringify(allReplies[i], null, 4)
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
