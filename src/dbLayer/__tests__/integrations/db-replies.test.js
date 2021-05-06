import MongoClient from 'mongodb';
import { fakeReplies } from '../../../tests/integrations/fake';
import { REPLIES_COLLECTION_NAME } from '../../collections';
import { dbInsertRepliesByTimestamp, dbFindOneRepliesByTimestamp } from '../../replies';

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

describe('dbInsertRepliesByTimestamp', () => {
  it('should return an error when there is no document param', async () => {
    const replies = await dbInsertRepliesByTimestamp(db);
    expect(replies.error).toBe(true);
    expect(replies?.details?.message).toMatchInlineSnapshot(`"document param must not be an empty object"`);
  });

  it('should return an error if document.messages[0].ts is undefined or null', async () => {
    const document = {
      test: 'test',
      messages: [],
    };
    const replies = await dbInsertRepliesByTimestamp(db, document);
    expect(replies.error).toBe(true);
    expect(replies?.details?.message).toMatchInlineSnapshot(`"document.messages[0].ts should exist"`);
  });

  it('should create a new document in replies collection if not exist', async () => {
    const replies = await dbInsertRepliesByTimestamp(db, fakeReplies);

    expect(replies.ok).toBeTruthy();
    expect(replies.lastErrorObject.updatedExisting).toBe(false);

    const _id = replies.lastErrorObject.upserted;
    const expectedDocument = {
      _id,
      ...fakeReplies,
    };

    expect(replies.value).toEqual(expectedDocument);
  });

  it('should replace document if it exist', async () => {
    const repliesCollection = db.collection(REPLIES_COLLECTION_NAME);

    const insertedReplies = await repliesCollection.insertOne(fakeReplies);

    const newFakeReplies = {
      messages: [fakeReplies.messages[0]],
    };

    const expectedDocument = {
      _id: insertedReplies.ops[0]._id,
      ...newFakeReplies,
    };

    const replies = await dbInsertRepliesByTimestamp(db, newFakeReplies);

    expect(replies.ok).toBeTruthy();
    expect(replies.lastErrorObject.updatedExisting).toBe(true);
    expect(replies.value).toEqual(expectedDocument);
  });
});

describe('dbFindOneRepliesByTimestamp', () => {
  it('should return an error if db param is wrong', async () => {
    const fakeDatabase = null;

    const replies = await dbFindOneRepliesByTimestamp(fakeDatabase);

    expect(replies.error).toBe(true);
    expect(replies?.details?.message).toMatchInlineSnapshot(`"Cannot read property 'collection' of null"`);
  });

  it('should return null if replies collection is empty', async () => {
    const repliesCollection = db.collection(REPLIES_COLLECTION_NAME);

    await repliesCollection.deleteMany({});

    const replies = await dbFindOneRepliesByTimestamp(db);
    expect(replies).toBeNull();
  });

  it('should return null if no replies is found', async () => {
    const repliesCollection = db.collection(REPLIES_COLLECTION_NAME);

    await repliesCollection.insertOne(fakeReplies);

    const replies = await dbFindOneRepliesByTimestamp(db, 'wrongTimestamp');
    expect(replies).toBeNull();
  });

  it('should return null if there is no timestamp param', async () => {
    const repliesCollection = db.collection(REPLIES_COLLECTION_NAME);

    await repliesCollection.insertOne(fakeReplies);

    const replies = await dbFindOneRepliesByTimestamp(db);
    expect(replies).toBeNull();
  });

  it('should return a replies document by timestamp', async () => {
    const repliesCollection = db.collection(REPLIES_COLLECTION_NAME);

    const insertedReplies = await repliesCollection.insertOne(fakeReplies);

    const replies = await dbFindOneRepliesByTimestamp(db, fakeReplies.messages[0].thread_ts);
    expect(replies).toEqual(insertedReplies.ops[0]);
  });
});
