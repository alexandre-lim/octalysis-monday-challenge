import MongoClient from 'mongodb';
import { insertRepliesByTimestamp } from '../../replies/index';
import { REPLIES_COLLECTION_NAME } from '../../../dbLayer/collections';

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
  await db.collection(REPLIES_COLLECTION_NAME).deleteMany({});
});

describe('insertRepliesByTimestamp', () => {
  it('should return a results object with two error, two insert and one update', async () => {
    const replies = [
      { test: 'test' },
      { messages: [] },
      { messages: [{ ts: '5' }] },
      { messages: [{ ts: '10' }] },
      { messages: [{ ts: '10' }] },
    ];

    const results = await insertRepliesByTimestamp(db, replies);

    expect(results.error.count).toBe(2);
    expect(results.insert.count).toBe(2);
    expect(results.update.count).toBe(1);

    expect(results.error.traces).toHaveLength(2);
    expect(results.insert.traces).toHaveLength(2);
    expect(results.update.traces).toHaveLength(1);
  });

  it('should return an object with three error', async () => {
    const replies = [{ test: 'test' }, { messages: [] }, { messages: [{ ts: null }] }];

    const results = await insertRepliesByTimestamp(db, replies);

    expect(results.error.count).toBe(3);
    expect(results.insert.count).toBe(0);
    expect(results.update.count).toBe(0);

    expect(results.error.traces).toHaveLength(3);
    expect(results.insert.traces).toHaveLength(0);
    expect(results.update.traces).toHaveLength(0);
  });

  it('should return an object with no error, insert or update', async () => {
    const replies = [];

    const results = await insertRepliesByTimestamp(db, replies);

    expect(results.error.count).toBe(0);
    expect(results.insert.count).toBe(0);
    expect(results.update.count).toBe(0);

    expect(results.error.traces).toHaveLength(0);
    expect(results.insert.traces).toHaveLength(0);
    expect(results.update.traces).toHaveLength(0);
  });

  it('should return an object with two insert', async () => {
    const replies = [{ messages: [{ ts: '5' }] }, { messages: [{ ts: '10' }] }];

    const results = await insertRepliesByTimestamp(db, replies);

    expect(results.error.count).toBe(0);
    expect(results.insert.count).toBe(2);
    expect(results.update.count).toBe(0);

    expect(results.error.traces).toHaveLength(0);
    expect(results.insert.traces).toHaveLength(2);
    expect(results.update.traces).toHaveLength(0);
  });

  it('should return an object with two updates', async () => {
    const documentNotUpdated = { _id: 'fake_id', messages: [{ ts: '1' }] };
    const replies = [{ messages: [{ ts: '5' }] }, { messages: [{ ts: '10' }] }];

    const repliesCollection = db.collection(REPLIES_COLLECTION_NAME);

    await repliesCollection.insertOne(documentNotUpdated);
    await repliesCollection.insertMany(replies);

    const results = await insertRepliesByTimestamp(db, replies);

    expect(results.error.count).toBe(0);
    expect(results.insert.count).toBe(0);
    expect(results.update.count).toBe(2);

    expect(results.error.traces).toHaveLength(0);
    expect(results.insert.traces).toHaveLength(0);
    expect(results.update.traces).toHaveLength(2);

    const findDocumentNotUpdated = await repliesCollection.findOne({ _id: documentNotUpdated._id });

    expect(findDocumentNotUpdated).toEqual(documentNotUpdated);
  });
});
