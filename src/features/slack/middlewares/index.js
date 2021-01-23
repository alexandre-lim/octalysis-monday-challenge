import express from 'express';
import { getConversationsListRoute } from './routes';

const router = express.Router();

router.use(express.json());

router.get('/conversations.list', getConversationsListRoute);

export { router as slackRouter };
