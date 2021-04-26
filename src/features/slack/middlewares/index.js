import express from 'express';
import {
  getConversationsHistoryRoute,
  getConversationsListRoute,
  getConversationsRepliesRoute,
  getUsersInfoRoute,
  storeConversationsHistoryRoute,
  storeConversationsRepliesRoute,
  storeMessagesRoute,
} from './routes';

const router = express.Router();

router.use(express.json());

router.get('/conversations.list', getConversationsListRoute);

router.get('/conversations.history', getConversationsHistoryRoute);

router.get('/conversations.replies', getConversationsRepliesRoute);

router.get('/users.info', getUsersInfoRoute);

router.get('/store/conversations.history', storeConversationsHistoryRoute);

router.get('/store/conversations.replies', storeConversationsRepliesRoute);

router.get('/store/conversations.messages', storeMessagesRoute);

export { router as slackRouter };
