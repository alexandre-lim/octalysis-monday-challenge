import { createCustomError } from './error-handler';

function customAuthMiddleware(req, res, next) {
  const OCTALYSIS_KEY_HEADER = 'x-octalysis-key';
  if (!req.headers[OCTALYSIS_KEY_HEADER]) {
    const error = createCustomError({ message: 'Missing X-Octalysis-Key Header', statusCode: 401 });
    return next(error);
  }

  const isOctalysisKeyValid = req.headers[OCTALYSIS_KEY_HEADER].trim() === process.env.OCTALYSIS_KEY;
  if (isOctalysisKeyValid === false) {
    const error = createCustomError({ message: 'Invalid X-Octalysis-Key Header value', statusCode: 401 });
    return next(error);
  }

  next();
}

export { customAuthMiddleware };
