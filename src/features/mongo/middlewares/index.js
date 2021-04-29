import express from 'express';
import { insertConversationsAllHistoryRoute } from './routes';

const router = express.Router();

router.use(express.json());

router.get('/insert/conversations.allhistory', insertConversationsAllHistoryRoute);

export { router as mongoRouter };
