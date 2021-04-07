import { google } from 'googleapis';
import { getGoogleDocumentsInstance } from '../auth';

jest.mock('googleapis');

beforeEach(() => {
  jest.clearAllMocks();
});

test('getGoogleDocumentsInstance should not return a falsy value like null or undefined', () => {
  google.docs.mockReturnValue('Something different than a falsy value');
  const docs = getGoogleDocumentsInstance();
  expect(docs).not.toBeFalsy();
});
