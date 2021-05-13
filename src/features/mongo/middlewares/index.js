import express from 'express';
import {
  getMessagesRoute,
  insertConversationsAllHistoryRoute,
  insertConversationsRepliesRoute,
  insertLatestMessagesRoute,
  insertMessagesRoute,
} from './routes';

const router = express.Router();

router.use(express.json());

router.get('/insert/conversations.allhistory', insertConversationsAllHistoryRoute);

router.get('/insert/conversations.replies', insertConversationsRepliesRoute);

router.get('/insert/conversations.messages', insertMessagesRoute);

router.get('/insert/conversations.latest', insertLatestMessagesRoute);

router.get('/read/conversations.messages', getMessagesRoute);

export { router as mongoRouter };
