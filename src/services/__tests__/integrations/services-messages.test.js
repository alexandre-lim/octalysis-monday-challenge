import MongoClient from 'mongodb';
import { insertMessagesByTimestamp, getHistoryMessagesWithReplies } from '../../messages/index';
import { MESSAGES_COLLECTION_NAME, REPLIES_COLLECTION_NAME } from '../../../dbLayer/collections';

let connection;
let db;

beforeAll(async () => {
  connection = await MongoClient.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  db = await connection.db();
});

afterAll(async () => {
  await connection.close();
});

beforeEach(async () => {
  await db.collection(MESSAGES_COLLECTION_NAME).deleteMany({});
});

describe('insertMessagesByTimestamp', () => {
  it('should return a results object with two error, two insert and one update', async () => {
    const messages = [{ test: 'test' }, { messages: [] }, { ts: '5' }, { ts: '10' }, { ts: '10' }];

    const results = await insertMessagesByTimestamp(db, messages);

    expect(results.error.count).toBe(2);
    expect(results.insert.count).toBe(2);
    expect(results.update.count).toBe(1);

    expect(results.error.traces).toHaveLength(2);
    expect(results.insert.traces).toHaveLength(2);
    expect(results.update.traces).toHaveLength(1);
  });

  it('should return an object with three error', async () => {
    const messages = [{ test: 'test' }, { messages: [] }, { messages: [{ ts: null }] }];

    const results = await insertMessagesByTimestamp(db, messages);

    expect(results.error.count).toBe(3);
    expect(results.insert.count).toBe(0);
    expect(results.update.count).toBe(0);

    expect(results.error.traces).toHaveLength(3);
    expect(results.insert.traces).toHaveLength(0);
    expect(results.update.traces).toHaveLength(0);
  });

  it('should return an object with no error, insert or update', async () => {
    const messages = [];

    const results = await insertMessagesByTimestamp(db, messages);

    expect(results.error.count).toBe(0);
    expect(results.insert.count).toBe(0);
    expect(results.update.count).toBe(0);

    expect(results.error.traces).toHaveLength(0);
    expect(results.insert.traces).toHaveLength(0);
    expect(results.update.traces).toHaveLength(0);
  });

  it('should return an object with two insert', async () => {
    const messages = [{ ts: '5' }, { ts: '10' }];

    const results = await insertMessagesByTimestamp(db, messages);

    expect(results.error.count).toBe(0);
    expect(results.insert.count).toBe(2);
    expect(results.update.count).toBe(0);

    expect(results.error.traces).toHaveLength(0);
    expect(results.insert.traces).toHaveLength(2);
    expect(results.update.traces).toHaveLength(0);
  });

  it('should return an object with two updates', async () => {
    const documentNotUpdated = { _id: 'fake_id', ts: '1' };
    const messages = [{ ts: '5' }, { ts: '10' }];

    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);

    await messagesCollection.insertOne(documentNotUpdated);
    await messagesCollection.insertMany(messages);

    const results = await insertMessagesByTimestamp(db, messages);

    expect(results.error.count).toBe(0);
    expect(results.insert.count).toBe(0);
    expect(results.update.count).toBe(2);

    expect(results.error.traces).toHaveLength(0);
    expect(results.insert.traces).toHaveLength(0);
    expect(results.update.traces).toHaveLength(2);

    const findDocumentNotUpdated = await messagesCollection.findOne({ _id: documentNotUpdated._id });

    expect(findDocumentNotUpdated).toEqual(documentNotUpdated);
  });
});

describe('getHistoryMessagesWithReplies', () => {
  it('should return an object with an empty array and error to trye when db param is wrong', async () => {
    const fakeDb = null;
    const messages = [{ thread_ts: '5' }, { ts: '10' }];

    const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies(fakeDb, messages);

    expect(error.hasError).toBe(true);
    expect(historyMessagesWithReplies).toHaveLength(0);
    expect(error.trace).toMatchInlineSnapshot(`
      Object {
        "details": [TypeError: Cannot read property 'collection' of null],
        "error": true,
        "message": "Error in findOne function",
        "statusCode": 500,
      }
    `);
  });

  it('should return an object with an empty array and error to false when second param is missing', async () => {
    const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies(db);

    expect(error.hasError).toBe(false);
    expect(historyMessagesWithReplies).toHaveLength(0);
  });

  it('should return an object with an empty array and error to false when array messages do not have thread_ts property', async () => {
    const messages = [{ ts: '5' }, { ts: '10' }];

    const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies(db, messages);

    expect(error.hasError).toBe(false);
    expect(historyMessagesWithReplies).toHaveLength(0);
  });

  it('should return an object with an array but no replies property', async () => {
    const messages = [{ thread_ts: '5' }, { ts: '10' }];
    const expectedResult = [{ thread_ts: '5' }];

    const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies(db, messages);
    expect(error.hasError).toBe(false);

    expect(historyMessagesWithReplies).toHaveLength(1);
    expect(historyMessagesWithReplies).toEqual(expectedResult);
  });

  it('should return an object with an array but no replies property', async () => {
    const replies = [
      { ok: true, messages: [{ ts: '5', test: 'test' }] },
      { ok: true, messages: [{ ts: '10', test: 'test' }] },
    ];
    const messages = [
      { text: 'Good message', thread_ts: '5' },
      { ts: '10' },
      { text: 'Message with no replies prop', thread_ts: '15' },
    ];
    const expectedResult = [
      { text: 'Good message', thread_ts: '5', replies: replies[0].messages },
      { text: 'Message with no replies prop', thread_ts: '15' },
    ];

    const repliesCollection = db.collection(REPLIES_COLLECTION_NAME);
    await repliesCollection.insertMany(replies);

    const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies(db, messages);

    expect(error.hasError).toBe(false);
    expect(historyMessagesWithReplies).toHaveLength(2);
    expect(historyMessagesWithReplies).toEqual(expectedResult);
  });
});
