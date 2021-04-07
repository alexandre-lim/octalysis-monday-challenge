import express from 'express';
import {
  getGoogleDocumentRoute,
  postGoogleDocumentBatchUpdateRoute,
} from './routes';

const router = express.Router();

router.use(express.json());

router.get('/document', getGoogleDocumentRoute);

router.post('/batchUpdate', postGoogleDocumentBatchUpdateRoute);

export { router as googleRouter };
