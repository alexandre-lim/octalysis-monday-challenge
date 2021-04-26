import { promises as fsPromises } from 'fs';
import path from 'path';
import {
  fakeDate,
  fakeFileContent,
  fakeFilename,
  TESTS_DIR_PATH,
  TESTS_HISTORY_DIR_PATH,
  TESTS_MESSAGES_DIR_PATH,
  TESTS_REPLIES_DIR_PATH,
} from './test-path';

module.exports = async () => {
  console.log('\n----- SETUP INTEGRATION -----\n');
  await fsPromises.mkdir(path.resolve(TESTS_DIR_PATH));
  await fsPromises.mkdir(path.resolve(TESTS_HISTORY_DIR_PATH));
  await fsPromises.mkdir(path.resolve(TESTS_REPLIES_DIR_PATH));
  await fsPromises.mkdir(path.resolve(TESTS_MESSAGES_DIR_PATH));

  await fsPromises.writeFile(
    path.resolve(`${TESTS_HISTORY_DIR_PATH}/${fakeDate}.json`),
    JSON.stringify(fakeFileContent, null, 4)
  );

  await fsPromises.writeFile(
    path.resolve(`${TESTS_REPLIES_DIR_PATH}/${fakeFilename}.json`),
    JSON.stringify(fakeFileContent, null, 4)
  );
};
