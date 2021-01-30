import { createCustomError } from '../../../utils/error-handler';
import { getGoogleDocument } from '../methods/documents-get';

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

export { getGoogleDocumentRoute };
