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

router.post('/insert/conversations.allhistory', insertConversationsAllHistoryRoute);

router.post('/insert/conversations.replies', insertConversationsRepliesRoute);

router.post('/insert/conversations.messages', insertMessagesRoute);

router.post('/insert/conversations.latest', insertLatestMessagesRoute);

const publicRouter = express.Router();

publicRouter.use(express.json());

publicRouter.get('/read/conversations.messages', getMessagesRoute);

export { router as mongoRouter, publicRouter as mongoPublicRouter };
