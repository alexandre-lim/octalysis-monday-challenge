import express from 'express';
import logger from 'morgan';
import { initEnvVar } from './utils/env';
import { errorHandler } from './utils/error-handler';
import { slackRouter } from './features/slack/middlewares';

initEnvVar();

const app = express();
const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT;

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

app.use('/api', router);

// Handle errors with middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`App listening on port ${PORT}! => http://localhost:${PORT}/`));
