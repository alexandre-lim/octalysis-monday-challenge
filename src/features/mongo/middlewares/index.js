import express from 'express';
import { insertConversationsAllHistoryRoute, insertConversationsRepliesRoute, insertMessagesRoute } from './routes';

const router = express.Router();

router.use(express.json());

router.get('/insert/conversations.allhistory', insertConversationsAllHistoryRoute);

router.get('/insert/conversations.replies', insertConversationsRepliesRoute);

router.get('/insert/conversations.messages', insertMessagesRoute);

export { router as mongoRouter };
