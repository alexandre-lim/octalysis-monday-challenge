function getSlackApiToken() {
  const { SLACK_API_TOKEN } = process.env;
  return SLACK_API_TOKEN;
}

export { getSlackApiToken };
