import MongoClient from 'mongodb';

const state = {
  client: null,
  db: null,
};

function databaseConnect(callback) {
  if (state.client) return callback();

  const { MONGO_DB_NAME, MONGO_DB_USER, MONGO_DB_PASSWORD } = process.env;

  let MONGO_URL = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@clusteroctalysis.ouaxa.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`;

  if (process.env.NODE_ENV !== 'production') {
    const { MONGO_LOCAL_HOST, MONGO_LOCAL_PORT } = process.env;
    MONGO_URL = `mongodb://${MONGO_LOCAL_HOST}:${MONGO_LOCAL_PORT}`;
  }

  console.log('Connect to database...');

  MongoClient.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
      console.log('Connected successfully to server');
      const db = client.db(MONGO_DB_NAME);
      state.client = client;
      state.db = db;
      callback();
    })
    .catch((err) => {
      const error = {
        message: 'Error on mongodb connection',
        details: { name: err.name, message: err.message, stack: err.stack },
      };
      callback(error);
    });
}

function getDatabase() {
  return state.db;
}

export { databaseConnect, getDatabase };
