import { promises as fsPromises } from 'fs';
import { DATA_DIR_PATH } from '../../utils/file/path';

module.exports = async () => {
  console.log('\n----- TEARDOWN INTEGRATION -----\n');
  await fsPromises.rm(DATA_DIR_PATH, { recursive: true, force: true });
};
