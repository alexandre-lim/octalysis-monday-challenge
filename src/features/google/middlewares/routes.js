import { createCustomError } from '../../../utils/error-handler';
import { getGoogleDocument } from '../methods/documents-get';
import { getGoogleDocumentsInstance } from '../methods/utils/auth';

async function getGoogleDocumentRoute(req, res, next) {
  const results = await getGoogleDocument();

  if (results.status === 200) {
    res.json(results);
  } else {
    results?.response?.data
      ? next(
          createCustomError({
            message: results.response.data.error.message,
            statusCode: results.response.data.error.code,
            details: results.response.data.error,
          })
        )
      : res.json(results);
  }
}

async function postGoogleDocumentBatchUpdateRoute(req, res, next) {
  const docs = getGoogleDocumentsInstance();
  const results = await docs.documents
    .batchUpdate({
      documentId: '16nCBcSnGHhue_VkwReQ3gjhItDnYK9wkOJEaccViL48',
      requestBody: {
        requests: [
          {
            insertText: {
              text: 'Inserting text',
              endOfSegmentLocation: {},
            },
          },
        ],
        writeControl: {},
      },
    })
    .catch((err) => err);

  if (results.status === 200) {
    res.json(results);
  } else {
    results?.response?.data
      ? next(
          createCustomError({
            message: results.response.data.error.message,
            statusCode: results.response.data.error.code,
            details: results.response.data.error,
          })
        )
      : res.json(results);
  }
}

export { getGoogleDocumentRoute, postGoogleDocumentBatchUpdateRoute };
