import express from 'express';
import { insertConversationsAllHistoryRoute, insertConversationsRepliesRoute } from './routes';

const router = express.Router();

router.use(express.json());

router.get('/insert/conversations.allhistory', insertConversationsAllHistoryRoute);

router.get('/insert/conversations.replies', insertConversationsRepliesRoute);

export { router as mongoRouter };
