import express from 'express';
import {
  getConversationsHistoryRoute,
  getConversationsAllHistoryRoute,
  getConversationsListRoute,
  getConversationsRepliesRoute,
  getUsersInfoRoute,
  getLatestMessagesRoute,
} from './routes';

const router = express.Router();

router.use(express.json());

router.get('/conversations.list', getConversationsListRoute);

router.get('/conversations.history', getConversationsHistoryRoute);

router.get('/conversations.allhistory', getConversationsAllHistoryRoute);

router.get('/conversations.replies', getConversationsRepliesRoute);

router.get('/conversations.latest', getLatestMessagesRoute);

router.get('/users.info', getUsersInfoRoute);

export { router as slackRouter };
