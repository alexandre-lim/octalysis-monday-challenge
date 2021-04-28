import express from 'express';
import {
  storeConversationsHistoryRoute,
  storeConversationsRepliesRoute,
  storeMessagesRoute,
  storeLatestMessagesRoute,
} from './routes';

const router = express.Router();

router.use(express.json());

router.get('/store/conversations.history', storeConversationsHistoryRoute);

router.get('/store/conversations.replies', storeConversationsRepliesRoute);

router.get('/store/conversations.messages', storeMessagesRoute);

router.get('/store/conversations.latest', storeLatestMessagesRoute);

export { router as jsonRouter };
