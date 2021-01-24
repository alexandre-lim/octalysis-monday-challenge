import { getMondayChallengeChannelId } from '../channel';

jest.mock('../channel', () => require('../__mocks__/channel'));

beforeEach(() => {
  jest.clearAllMocks();
});

test('getMondayChallengeChannelId return a string channel id', () => {
  const expectedChannelId = 'fake_channel_id';

  const SLACK_MONDAY_CHALLENGE_CHANNEL_ID = getMondayChallengeChannelId();

  expect(SLACK_MONDAY_CHALLENGE_CHANNEL_ID).toBe(expectedChannelId);
});
