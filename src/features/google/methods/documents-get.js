import { getGoogleDocumentsInstance } from './utils/auth';

async function getGoogleDocument() {
  const docs = getGoogleDocumentsInstance();
  const results = await docs.documents
    .get({
      documentId: '16nCBcSnGHhue_VkwReQ3gjhItDnYK9wkOJEaccViL48',
    })
    .catch((err) => err);

  return results;
}

export { getGoogleDocument };
