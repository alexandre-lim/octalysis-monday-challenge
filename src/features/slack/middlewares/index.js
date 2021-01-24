import express from 'express';
import {
  getConversationsHistoryRoute,
  getConversationsListRoute,
} from './routes';

const router = express.Router();

router.use(express.json());

router.get('/conversations.list', getConversationsListRoute);

router.get('/conversations.history', getConversationsHistoryRoute);

export { router as slackRouter };
