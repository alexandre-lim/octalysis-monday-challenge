import { getConversationsList } from '../methods/conversations-list';

async function getConversationsListRoute(req, res, next) {
  const results = await getConversationsList();
  results?.error === true ? next(results) : res.json(results);
}

export { getConversationsListRoute };
