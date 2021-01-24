import express from 'express';
import {
  getConversationsHistoryRoute,
  getConversationsListRoute,
  getConversationsRepliesRoute,
  getUsersInfoRoute,
} from './routes';

const router = express.Router();

router.use(express.json());

router.get('/conversations.list', getConversationsListRoute);

router.get('/conversations.history', getConversationsHistoryRoute);

router.get('/conversations.replies', getConversationsRepliesRoute);

router.get('/users.info', getUsersInfoRoute);

export { router as slackRouter };
