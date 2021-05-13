import MongoClient from 'mongodb';
import { fakeMessages, fakeMessagesWithDate } from '../../../tests/integrations/fake';
import { getDayTimestampInterval, getMonthTimestampInterval, getYearTimestampInterval } from '../../../utils/date';
import { MESSAGES_COLLECTION_NAME } from '../../collections';
import { dbInsertMessagesByTimestamp, dbGetMessagesByIntervalDate } from '../../messages';

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

describe('dbGetMessagesByIntervalDate', () => {
  it('should return an error if called with no param', async () => {
    const messages = await dbGetMessagesByIntervalDate();
    expect(messages.error).toBe(true);
    expect(messages?.details?.message).toMatchInlineSnapshot(`"aggregationCursor.toArray is not a function"`);
  });

  it('should return an empty array if no messages are found', async () => {
    const messages = await dbGetMessagesByIntervalDate(db);
    expect(messages).toHaveLength(0);
  });

  it('should return an empty array from 2021-04-01', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);
    await messagesCollection.insertMany(fakeMessagesWithDate);

    const date = new Date(`2021-04-01`);
    const { startDayTimestamp, endDayTimestamp } = getDayTimestampInterval(date);

    const messages = await dbGetMessagesByIntervalDate(db, startDayTimestamp, endDayTimestamp);

    expect(messages).toHaveLength(0);
  });

  it('should return one message from 2021-05-02', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);
    await messagesCollection.insertMany(fakeMessagesWithDate);

    const date = new Date(`2021-05-02`);
    const { startDayTimestamp, endDayTimestamp } = getDayTimestampInterval(date);

    const messages = await dbGetMessagesByIntervalDate(db, startDayTimestamp, endDayTimestamp);

    expect(messages).toHaveLength(1);
    expect(messages).toEqual([fakeMessagesWithDate[2]]);
  });

  it('should return two messages from 2021-05-06', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);
    await messagesCollection.insertMany(fakeMessagesWithDate);

    const date = new Date(`2021-05-06`);
    const { startDayTimestamp, endDayTimestamp } = getDayTimestampInterval(date);

    const messages = await dbGetMessagesByIntervalDate(db, startDayTimestamp, endDayTimestamp);

    expect(messages).toHaveLength(2);
    expect(messages).toEqual([fakeMessagesWithDate[0], fakeMessagesWithDate[1]]);
  });

  it('should return three messages from month 2021-05', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);
    await messagesCollection.insertMany(fakeMessagesWithDate);

    const date = new Date(`2021-05-01`);
    const { startMonthTimestamp, endMonthTimestamp } = getMonthTimestampInterval(date);

    const messages = await dbGetMessagesByIntervalDate(db, startMonthTimestamp, endMonthTimestamp);

    expect(messages).toHaveLength(3);
    expect(messages).toEqual([fakeMessagesWithDate[0], fakeMessagesWithDate[1], fakeMessagesWithDate[2]]);
  });

  it('should return five messages from year 2021', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);
    await messagesCollection.insertMany(fakeMessagesWithDate);

    const date = new Date(`2021-01-01`);
    const { startYearTimestamp, endYearTimestamp } = getYearTimestampInterval(date);

    const messages = await dbGetMessagesByIntervalDate(db, startYearTimestamp, endYearTimestamp);

    expect(messages).toHaveLength(5);
    expect(messages).toEqual([
      fakeMessagesWithDate[0],
      fakeMessagesWithDate[1],
      fakeMessagesWithDate[2],
      fakeMessagesWithDate[3],
      fakeMessagesWithDate[4],
    ]);
  });
});
