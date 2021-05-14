import { createCustomError } from './error-handler';

function basicAuthMiddleware(req, res, next) {
  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
    const error = createCustomError({ message: 'Missing Authorization Header', statusCode: 401 });
    res.setHeader('WWW-Authenticate', 'Basic');
    return next(error);
  }

  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString().split(':');
  const [username, password] = credentials;
  const areCredentialsValid = username === process.env.API_USERNAME && password === process.env.API_PASSWORD;
  if (areCredentialsValid === false) {
    const error = createCustomError({ message: 'Invalid Authentication Credentials', statusCode: 401 });
    res.setHeader('WWW-Authenticate', 'Basic');
    return next(error);
  }

  next();
}

export { basicAuthMiddleware };
