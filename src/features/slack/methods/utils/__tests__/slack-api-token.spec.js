import { getSlackApiToken } from '../slack-api-token';

jest.mock('../slack-api-token', () => require('../__mocks__/slack-api-token'));

beforeEach(() => {
  jest.clearAllMocks();
});

test('getSlackApiToken return a string token', () => {
  const expectedToken = 'token';

  const SLACK_API_TOKEN = getSlackApiToken();

  expect(SLACK_API_TOKEN).toBe(expectedToken);
});
