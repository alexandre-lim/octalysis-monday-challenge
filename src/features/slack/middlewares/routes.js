import { getConversationsHistory } from '../methods/conversations-history';
import { getConversationsList } from '../methods/conversations-list';
import { getConversationsReplies } from '../methods/conversations-replies';
import { getUsersInfo } from '../methods/users-info';

async function getConversationsListRoute(req, res, next) {
  const results = await getConversationsList();
  results?.error === true ? next(results) : res.json(results);
}

async function getConversationsHistoryRoute(req, res, next) {
  const results = await getConversationsHistory();
  results?.error === true ? next(results) : res.json(results);
}

async function getConversationsRepliesRoute(req, res, next) {
  const results = await getConversationsReplies();
  results?.error === true ? next(results) : res.json(results);
}

async function getUsersInfoRoute(req, res, next) {
  const results = await getUsersInfo();
  results?.error === true ? next(results) : res.json(results);
}

export {
  getConversationsListRoute,
  getConversationsHistoryRoute,
  getConversationsRepliesRoute,
  getUsersInfoRoute,
};
