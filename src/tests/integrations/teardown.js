import { promises as fsPromises } from 'fs';
import { TESTS_DIR_PATH } from './test-path';

module.exports = async () => {
  console.log('\n----- TEARDOWN INTEGRATION -----\n');
  await fsPromises.rm(TESTS_DIR_PATH, { recursive: true, force: true });
};
