import express from 'express';
import { getGoogleDocumentRoute } from './routes';

const router = express.Router();

router.use(express.json());

router.get('/document', getGoogleDocumentRoute);

export { router as googleRouter };
