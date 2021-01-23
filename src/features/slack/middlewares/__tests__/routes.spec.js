import {
  buildNextParameter,
  buildReqParameter,
  buildResParameter,
} from '../../../../tests/middleware-mock';
import { createCustomError } from '../../../../utils/error-handler';
import { getConversationsList } from '../../methods/conversations-list';
import { getConversationsListRoute } from '../routes';

jest.mock('../../methods/conversations-list');

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
