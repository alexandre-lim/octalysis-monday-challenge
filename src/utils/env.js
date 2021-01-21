import dotenv from 'dotenv';
import RootPath from 'app-root-path';

function initEnvVar() {
  // Something may be done with dockerisation
  const result = dotenv.config({
    path: RootPath.resolve('.env'),
  });

  if (result.error) {
    console.error(result.error);
  }
}

export { initEnvVar };
