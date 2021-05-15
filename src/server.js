import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import { initEnvVar } from './utils/env';
import { errorHandler } from './utils/error-handler';
import { slackRouter } from './features/slack/middlewares';
import { jsonRouter } from './features/json/middlewares';
import { databaseConnect } from './features/mongo/utils/mongo-db';
import { mongoPublicRouter, mongoRouter } from './features/mongo/middlewares';
import { customAuthMiddleware } from './utils/auth';

initEnvVar();

const app = express();
const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (dev) {
  app.use(logger('dev'));
} else {
  app.use(logger('combined'));
}

const router = express.Router();

app.get('/', (req, res) => {
  res.send('Welcome to Octalysis Monday Mini Challenge app');
});

router.use('/slack', customAuthMiddleware, slackRouter);
router.use('/mongo', mongoPublicRouter);
router.use('/mongo', customAuthMiddleware, mongoRouter);

if (dev) {
  router.use('/json', jsonRouter);
}

app.use('/api', router);

// Handle errors with middleware
app.use(errorHandler);

databaseConnect(function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.log('\n----- PRODUCTION MODE -----\n');
    }
    app.listen(PORT, () => console.log(`App listening on port ${PORT}! => http://localhost:${PORT}/`));
  }
});
