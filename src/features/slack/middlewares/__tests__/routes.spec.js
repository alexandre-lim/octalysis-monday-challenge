import { buildNextParameter, buildReqParameter, buildResParameter } from '../../../../tests/middleware-mock';
import { createCustomError } from '../../../../utils/error-handler';
import { getConversationsList } from '../../methods/conversations-list';
import { getConversationsHistory } from '../../methods/conversations-history';
import { getConversationsReplies } from '../../methods/conversations-replies';
import {
  getConversationsHistoryRoute,
  getConversationsListRoute,
  getConversationsRepliesRoute,
  getUsersInfoRoute,
} from '../routes';
import { getUsersInfo } from '../../methods/users-info';

jest.mock('../../methods/conversations-list');
jest.mock('../../methods/conversations-history');
jest.mock('../../methods/conversations-replies');
jest.mock('../../methods/users-info');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getConversationsListRoute', () => {
  test('shoud call next on error', async () => {
    const req = buildReqParameter();
    const res = buildResParameter();
    const next = buildNextParameter();
    const errorResults = createCustomError();

    getConversationsList.mockResolvedValue(errorResults);

    await getConversationsListRoute(req, res, next);

    expect(next).toHaveBeenCalledWith(errorResults);
    expect(res.json).not.toHaveBeenCalled();
  });

  test('shoud call res.json on success', async () => {
    const req = buildReqParameter();
    const res = buildResParameter();
    const next = buildNextParameter();

    getConversationsList.mockResolvedValue({});

    await getConversationsListRoute(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({});
  });
});

describe('getConversationsHistoryRoute', () => {
  test('shoud call next on error', async () => {
    const req = buildReqParameter();
    const res = buildResParameter();
    const next = buildNextParameter();
    const errorResults = createCustomError();

    getConversationsHistory.mockResolvedValue(errorResults);

    await getConversationsHistoryRoute(req, res, next);

    expect(next).toHaveBeenCalledWith(errorResults);
    expect(res.json).not.toHaveBeenCalled();
  });

  test('shoud call res.json on success', async () => {
    const req = buildReqParameter();
    const res = buildResParameter();
    const next = buildNextParameter();

    getConversationsHistory.mockResolvedValue({});

    await getConversationsHistoryRoute(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({});
  });
});

describe('getConversationsRepliesRoute', () => {
  test('shoud call next on error', async () => {
    const req = buildReqParameter();
    const res = buildResParameter();
    const next = buildNextParameter();
    const errorResults = createCustomError();

    getConversationsReplies.mockResolvedValue(errorResults);

    await getConversationsRepliesRoute(req, res, next);

    expect(next).toHaveBeenCalledWith(errorResults);
    expect(res.json).not.toHaveBeenCalled();
  });

  test('shoud call res.json on success', async () => {
    const req = buildReqParameter();
    const res = buildResParameter();
    const next = buildNextParameter();

    getConversationsReplies.mockResolvedValue({});

    await getConversationsRepliesRoute(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({});
  });
});

describe('getUsersInfoRoute', () => {
  test('shoud call next on error', async () => {
    const req = buildReqParameter();
    const res = buildResParameter();
    const next = buildNextParameter();
    const errorResults = createCustomError();

    getUsersInfo.mockResolvedValue(errorResults);

    await getUsersInfoRoute(req, res, next);

    expect(next).toHaveBeenCalledWith(errorResults);
    expect(res.json).not.toHaveBeenCalled();
  });

  test('shoud call res.json on success', async () => {
    const req = buildReqParameter();
    const res = buildResParameter();
    const next = buildNextParameter();

    getUsersInfo.mockResolvedValue({});

    await getUsersInfoRoute(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({});
  });
});
