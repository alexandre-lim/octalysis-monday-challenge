import MongoClient from 'mongodb';
import { fakeMessages } from '../../../tests/integrations/fake';
import { MESSAGES_COLLECTION_NAME } from '../../collections';
import { dbInsertMessagesByTimestamp } from '../../messages';

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

describe('dbInsertMessagesByTimestamp', () => {
  it('should return an error when there is no document param', async () => {
    const messages = await dbInsertMessagesByTimestamp(db);
    expect(messages.error).toBe(true);
    expect(messages?.details?.message).toMatchInlineSnapshot(`"document param must not be an empty object"`);
  });

  it('should return an error if document.ts is undefined or null', async () => {
    const document = {
      test: 'test',
      messages: [],
    };
    const messages = await dbInsertMessagesByTimestamp(db, document);
    expect(messages.error).toBe(true);
    expect(messages?.details?.message).toMatchInlineSnapshot(`"document.ts should exist"`);
  });

  it('should create a new document in messages collection if not exist', async () => {
    const messages = await dbInsertMessagesByTimestamp(db, fakeMessages);

    expect(messages.ok).toBeTruthy();
    expect(messages.lastErrorObject.updatedExisting).toBe(false);

    const _id = messages.lastErrorObject.upserted;
    const expectedDocument = {
      _id,
      ...fakeMessages,
    };

    expect(messages.value).toEqual(expectedDocument);
  });

  it('should replace document if it exist', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);

    const insertedMessages = await messagesCollection.insertOne(fakeMessages);

    const newFakeMessages = {
      ts: fakeMessages.ts,
      test: 'test',
    };

    const expectedDocument = {
      _id: insertedMessages.ops[0]._id,
      ...newFakeMessages,
    };

    const messages = await dbInsertMessagesByTimestamp(db, newFakeMessages);

    expect(messages.ok).toBeTruthy();
    expect(messages.lastErrorObject.updatedExisting).toBe(true);
    expect(messages.value).toEqual(expectedDocument);
  });
});
