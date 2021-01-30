import { google } from 'googleapis';
import RootPath from 'app-root-path';

let docs = null;

// https://github.com/googleapis/google-api-nodejs-client#application-default-credentials
function getGoogleDocumentsInstance() {
  if (docs === null) {
    const auth = new google.auth.GoogleAuth({
      keyFile:
        process.env.NODE_ENV !== 'production'
          ? RootPath.resolve('octalysis-service-account-key.json')
          : null,
      scopes: ['https://www.googleapis.com/auth/documents.readonly'],
    });

    docs = google.docs({ version: 'v1', auth });
  }
  return docs;
}

export { getGoogleDocumentsInstance };
