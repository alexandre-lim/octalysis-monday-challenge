import MongoClient from 'mongodb';
import { HISTORY_COLLECTION_NAME } from '../../collections';
import { dbFindLatestHistory, dbFindHistoryByDate, dbInsertHistory } from '../../history';

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
  await db.collection(HISTORY_COLLECTION_NAME).deleteMany({});
});

describe('dbFindHistoryByDate', () => {
  it('should return null when there is no query param', async () => {
    const history = await dbFindHistoryByDate(db);
    expect(history).toBeNull();
  });

  it('should return null when query is not matching', async () => {
    const historyCollection = db.collection(HISTORY_COLLECTION_NAME);
    const fakeDate = '04/29/2021';
    const noMatchDate = '04/20/2021';
    const mockHistory = { date: noMatchDate };

    await historyCollection.insertOne(mockHistory);
    const history = await dbFindHistoryByDate(db, fakeDate);

    expect(history).toBeNull();
  });

  it('should return a document when date query is matching', async () => {
    const historyCollection = db.collection(HISTORY_COLLECTION_NAME);
    const fakeDate = '04/29/2021';
    const mockHistory = { date: fakeDate };

    await historyCollection.insertOne(mockHistory);
    const history = await dbFindHistoryByDate(db, fakeDate);

    expect(history).toEqual(mockHistory);
  });

  it('should return an error when params are omitted', async () => {
    const history = await dbFindHistoryByDate();

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"Cannot read property 'collection' of undefined"`);
  });

  it('should return an error when db param is not right', async () => {
    const db = 'test';

    const history = await dbFindHistoryByDate(db);

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"dbHandler.collection is not a function"`);
  });
});

describe('dbInsertHistory', () => {
  it('should insert a document in history collection', async () => {
    const mockHistory = { _id: 'history-fake-id' };
    const historyCollection = db.collection(HISTORY_COLLECTION_NAME);

    const history = await dbInsertHistory(db, mockHistory);
    const insertedHistory = await historyCollection.findOne({ _id: mockHistory._id });

    expect(history.result.ok).toBeTruthy();
    expect(history.ops[0]).toEqual(mockHistory);

    expect(insertedHistory).toEqual(mockHistory);
  });

  it('should return an error when params are omitted', async () => {
    const history = await dbInsertHistory();

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"Cannot read property 'collection' of undefined"`);
  });

  it('should return an error when db param is not right', async () => {
    const db = 'test';
    const mockHistory = { _id: 'history-fake-id' };

    const history = await dbInsertHistory(db, mockHistory);

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"dbHandler.collection is not a function"`);
  });

  it('should return an error when document param is not object', async () => {
    const mockHistory = [];

    const history = await dbInsertHistory(db, mockHistory);

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"doc parameter must be an object"`);
  });
});

describe('dbFindLatestHistory', () => {
  it('should return an empty array', async () => {
    const history = await dbFindLatestHistory(db);
    expect(history).toHaveLength(0);
  });

  it('should return an array with latest document', async () => {
    const mockHistory = [
      { _id: 'history-fake-id-1' },
      { _id: 'history-fake-id-2', test: 'test' },
      { _id: 'history-fake-id-3' },
    ];
    const latstIndex = mockHistory.length - 1;

    const historyCollection = db.collection(HISTORY_COLLECTION_NAME);
    await historyCollection.insertMany(mockHistory);
    const history = await dbFindLatestHistory(db);

    expect(history).toHaveLength(1);
    expect(history).toEqual([mockHistory[latstIndex]]);
  });

  it('should return an error when params are omitted', async () => {
    const history = await dbFindLatestHistory();

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"Cannot read property 'collection' of undefined"`);
  });

  it('should return an error when db param is not right', async () => {
    const db = 'test';
    const mockHistory = { _id: 'history-fake-id' };

    const history = await dbFindLatestHistory(db, mockHistory);

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"dbHandler.collection is not a function"`);
  });
});
