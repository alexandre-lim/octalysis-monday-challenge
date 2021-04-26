import { promises as fsPromises } from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { DATA_HISTORY_DIR_PATH, DATA_MESSAGES_DIR_PATH, DATA_REPLIES_DIR_PATH } from './path';

async function writeHistoryJSON(history, historyPath = DATA_HISTORY_DIR_PATH) {
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

async function writeRepliesJSON(replies, repliesPath = DATA_REPLIES_DIR_PATH) {
  if (Array.isArray(replies)) {
    console.log('Process of writing replies...');
    for (let i = 0, len = replies.length; i < len; i += 1) {
      const timestamp = replies[i].messages[0].ts;
      if (timestamp) {
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
    }
    console.log('Writing replies finished !');
  }
}

async function writeMessagesJSON(messages, messagesPath = DATA_MESSAGES_DIR_PATH) {
  if (Array.isArray(messages)) {
    console.log('Process of writing messages...');
    for (let i = 0, len = messages.length; i < len; i += 1) {
      const timestamp = messages[i].ts;
      if (timestamp) {
        try {
          await fsPromises.writeFile(
            path.resolve(`${messagesPath}/${timestamp}.json`),
            JSON.stringify(messages[i], null, 4)
          );
          console.log(`${i} - Writing file ${timestamp}.json success`);
        } catch (err) {
          console.error(err);
        }
      }
    }
    console.log('Writing messages finished !');
  }
}

export { writeHistoryJSON, writeRepliesJSON, writeMessagesJSON };
