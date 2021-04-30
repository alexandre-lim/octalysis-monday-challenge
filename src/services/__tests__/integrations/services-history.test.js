import MongoClient from 'mongodb';
import { findHistoryByDate, insertHistory, insertHistoryByDate } from '../../history/index';
import { HISTORY_COLLECTION_NAME } from '../../../dbLayer/collections';
import { getFormatTodayDate } from '../../../utils/date';

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

describe('findHistoryByDate', () => {
  it('should return null when there is no query param', async () => {
    const history = await findHistoryByDate(db);
    expect(history).toBeNull();
  });

  it('should return null when query is not matching', async () => {
    const historyCollection = db.collection(HISTORY_COLLECTION_NAME);
    const fakeDate = '04/29/2021';
    const noMatchDate = '04/20/2021';
    const mockHistory = { date: noMatchDate };

    await historyCollection.insertOne(mockHistory);
    const history = await findHistoryByDate(db, fakeDate);

    expect(history).toBeNull();
  });

  it('should return a document when date query is matching', async () => {
    const historyCollection = db.collection(HISTORY_COLLECTION_NAME);
    const fakeDate = '04/29/2021';
    const mockHistory = { date: fakeDate };
    const expectedResult = { date: fakeDate };

    await historyCollection.insertOne(mockHistory);
    const history = await findHistoryByDate(db, fakeDate);

    expect(history).toEqual(expectedResult);
  });

  it('should return an error when params are omitted', async () => {
    const history = await findHistoryByDate();

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"Cannot read property 'collection' of undefined"`);
  });

  it('should return an error when db param is not right', async () => {
    const db = 'test';

    const history = await findHistoryByDate(db);

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"dbHandler.collection is not a function"`);
  });
});

describe('insertHistory', () => {
  it('should insert a document in history collection', async () => {
    const mockHistory = { _id: 'history-fake-id' };
    const historyCollection = db.collection(HISTORY_COLLECTION_NAME);

    const history = await insertHistory(db, mockHistory);
    const insertedHistory = await historyCollection.findOne({ _id: mockHistory._id });

    expect(history).toEqual(mockHistory);

    expect(insertedHistory).toEqual(mockHistory);
  });

  it('should return an error when params are omitted', async () => {
    const history = await insertHistory();

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"Cannot read property 'collection' of undefined"`);
  });

  it('should return an error when db param is not right', async () => {
    const db = 'test';
    const mockHistory = { _id: 'history-fake-id' };

    const history = await insertHistory(db, mockHistory);

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"dbHandler.collection is not a function"`);
  });

  it('should return an error when document param is not object', async () => {
    const mockHistory = [];

    const history = await insertHistory(db, mockHistory);

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"doc parameter must be an object"`);
  });
});

describe('insertHistoryByDate', () => {
  it('should not find history by today date and insert a document in history collection', async () => {
    const histories = [{ test: 'test' }];
    const { formattedDate } = getFormatTodayDate();
    const historyCollection = db.collection(HISTORY_COLLECTION_NAME);

    const results = await insertHistoryByDate(db, histories);
    const insertedHistory = await historyCollection.findOne({ date: formattedDate });
    expect(results).toEqual(insertedHistory);
  });

  it('should find history by today date and return it', async () => {
    const histories = [{ test: 'test' }];
    const { formattedDate, timestamp } = getFormatTodayDate();

    const fakeDocument = {
      date: formattedDate,
      ts: timestamp,
      histories,
    };

    const expectedResult = {
      date: formattedDate,
      histories,
    };

    const historyCollection = db.collection(HISTORY_COLLECTION_NAME);
    await historyCollection.insertOne(fakeDocument);

    const results = await insertHistoryByDate(db, histories);
    expect(results).toEqual(expectedResult);
  });

  it('should return an error when params are omitted', async () => {
    const history = await insertHistoryByDate();

    expect(history.error).toBe(true);
    expect(history?.details?.message).toMatchInlineSnapshot(`"Cannot read property 'collection' of undefined"`);
  });
});
