import dotenv from 'dotenv';
import RootPath from 'app-root-path';

function initEnvVar() {
  if (process.env.NODE_ENV === 'production') return;
  const result = dotenv.config({
    path: RootPath.resolve('.env'),
  });

  if (result.error) {
    console.error(result.error);
  }
}

export { initEnvVar };
