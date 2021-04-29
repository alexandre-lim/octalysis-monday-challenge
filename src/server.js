import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import { initEnvVar } from './utils/env';
import { errorHandler } from './utils/error-handler';
import { slackRouter } from './features/slack/middlewares';
import { jsonRouter } from './features/json/middlewares';
import { expressMongoMiddleware } from './express-mongo';

initEnvVar();

const app = express();
const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT;

app.use(cors());
app.use(expressMongoMiddleware);
app.use(express.json());
app.use(express.urlencoded());

if (dev) {
  app.use(logger('dev'));
} else {
  app.use(logger('combined'));
}

const router = express.Router();

app.get('/', (req, res) => {
  res.send('Welcome to Express starter app');
});

router.use('/slack', slackRouter);
router.use('/json', jsonRouter);

app.use('/api', router);

// Handle errors with middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`App listening on port ${PORT}! => http://localhost:${PORT}/`));
