import MongoClient from 'mongodb';
import { createCustomError } from './utils/error-handler';

function expressMongoMiddleware(req, res, next) {
  const { MONGO_HOST, MONGO_PORT, MONGO_DB_NAME, MONGO_DB_USER, MONGO_DB_PASSWORD } = process.env;

  let MONGO_URL = `mongodb://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}`;

  if (process.env.NODE_ENV !== 'production') {
    const { MONGO_LOCAL_HOST, MONGO_LOCAL_PORT } = process.env;
    MONGO_URL = `mongodb://${MONGO_LOCAL_HOST}:${MONGO_LOCAL_PORT}`;
  }

  MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
    .then((client) => {
      console.log('Connected successfully to server');
      const db = client.db(MONGO_DB_NAME);
      req['db'] = db;
      next();
    })
    .catch((err) => {
      const message = 'Error on mongodb connection';
      next(createCustomError({ message, details: { name: err.name, message: err.message, stack: err.stack } }));
    });
}

export { expressMongoMiddleware };
