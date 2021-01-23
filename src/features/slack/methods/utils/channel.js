function getMondayChallengeChannelId() {
  const { SLACK_MONDAY_CHALLENGE_CHANNEL_ID } = process.env;
  return SLACK_MONDAY_CHALLENGE_CHANNEL_ID;
}

export { getMondayChallengeChannelId };
