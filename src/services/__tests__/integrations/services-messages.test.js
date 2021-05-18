import MongoClient from 'mongodb';
import {
  insertMessagesByTimestamp,
  getHistoryMessagesWithReplies,
  getMessagesByIntervalDate,
} from '../../messages/index';
import { MESSAGES_COLLECTION_NAME, REPLIES_COLLECTION_NAME } from '../../../dbLayer/collections';
import { fakeMessagesWithDate } from '../../../tests/integrations/fake';

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
  it('should return an object with an empty array and error to true when db param is wrong', async () => {
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

  it('should return an object with an array of 3 messages and one with replies property', async () => {
    const replies = [
      { ok: true, messages: [{ ts: '5', test: 'Matching thread_ts from messages' }] },
      { ok: true, messages: [{ ts: '10', text: 'No matching thread_ts from messages' }] },
    ];
    const messages = [
      { text: 'Message with thread', thread_ts: '5' },
      { text: 'Message without thread prop', ts: '10' },
      { text: 'Message with no replies prop', thread_ts: '15' },
    ];
    const expectedResult = [{ ...messages[0], replies: replies[0].messages }, messages[1], messages[2]];

    const repliesCollection = db.collection(REPLIES_COLLECTION_NAME);
    await repliesCollection.insertMany(replies);

    const { historyMessagesWithReplies, error } = await getHistoryMessagesWithReplies(db, messages);

    expect(error.hasError).toBe(false);
    expect(historyMessagesWithReplies).toHaveLength(3);
    expect(historyMessagesWithReplies).toEqual(expectedResult);
  });
});

describe('getMessagesByIntervalDate', () => {
  it('should return an error if called with wrong db param', async () => {
    const messages = await getMessagesByIntervalDate(null, '2021', '05', '02');
    expect(messages.error).toBe(true);
    expect(messages?.details?.message).toMatchInlineSnapshot(`"aggregationCursor.toArray is not a function"`);
  });

  it('should return an error when date params are wrong', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);
    await messagesCollection.insertMany(fakeMessagesWithDate);

    const errorNoParams = await getMessagesByIntervalDate(db);
    const errorNoYears = await getMessagesByIntervalDate(db, null, '05', '01');
    const errorNoMonth = await getMessagesByIntervalDate(db, '2021', '', '01');
    const errorEmptyString = await getMessagesByIntervalDate(db, '', '', '');
    const errorSpaceStringDay = await getMessagesByIntervalDate(db, '2021', '05', ' ');
    const errorIncorrectMonth = await getMessagesByIntervalDate(db, '2021', '15');
    const errorIncorrectDate = await getMessagesByIntervalDate(db, '2021', '02', '31');

    expect(errorNoParams.error).toBe(true);
    expect(errorNoParams?.message).toMatchInlineSnapshot(
      `"Error in the requested date: year:undefined / month:undefined  / day:undefined. Query params must be valid yyyy/mm/dd or yyyy/mm or yyyy}"`
    );

    expect(errorNoYears.error).toBe(true);
    expect(errorNoYears?.message).toMatchInlineSnapshot(
      `"Error in the requested date: year:null / month:05  / day:01. Query params must be valid yyyy/mm/dd or yyyy/mm or yyyy}"`
    );

    expect(errorNoMonth.error).toBe(true);
    expect(errorNoMonth?.message).toMatchInlineSnapshot(
      `"Error in the requested date: year:2021 / month:  / day:01. Query params must be valid yyyy/mm/dd or yyyy/mm or yyyy}"`
    );

    expect(errorEmptyString.error).toBe(true);
    expect(errorEmptyString?.message).toMatchInlineSnapshot(
      `"Error in the requested date: year: / month:  / day:. Query params must be valid yyyy/mm/dd or yyyy/mm or yyyy}"`
    );

    expect(errorSpaceStringDay.error).toBe(true);
    expect(errorSpaceStringDay?.message).toMatchInlineSnapshot(
      `"Error in the requested date: year:2021 / month:05  / day: . Query params must be valid yyyy/mm/dd or yyyy/mm or yyyy}"`
    );

    expect(errorIncorrectMonth.error).toBe(true);
    expect(errorIncorrectMonth?.message).toMatchInlineSnapshot(
      `"Error in the requested date: year:2021 / month:15  / day:undefined. Query params must be valid yyyy/mm/dd or yyyy/mm or yyyy}"`
    );

    expect(errorIncorrectDate.error).toBe(true);
    expect(errorIncorrectDate?.message).toMatchInlineSnapshot(
      `"Error in the requested date: year:2021 / month:02  / day:31. Query params must be valid yyyy/mm/dd or yyyy/mm or yyyy}"`
    );
  });

  it('should return one message from 2021-05-02', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);
    await messagesCollection.insertMany(fakeMessagesWithDate);

    const messages = await getMessagesByIntervalDate(db, '2021', '05', '02');

    expect(messages).toHaveLength(1);
    expect(messages).toEqual([fakeMessagesWithDate[2]]);
  });

  it('should return two messages from 2021-05-06', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);
    await messagesCollection.insertMany(fakeMessagesWithDate);

    const messages = await getMessagesByIntervalDate(db, '2021', '05', '6');

    expect(messages).toHaveLength(2);
    expect(messages).toEqual([fakeMessagesWithDate[0], fakeMessagesWithDate[1]]);
  });

  it('should return three messages from month 2021-05', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);
    await messagesCollection.insertMany(fakeMessagesWithDate);

    const messages = await getMessagesByIntervalDate(db, '2021', '05');
    const messagesNullDay = await getMessagesByIntervalDate(db, '2021', '05', null);
    const messagesEmptyStringDay = await getMessagesByIntervalDate(db, '2021', '05', '');

    expect(messages).toHaveLength(3);
    expect(messages).toEqual([fakeMessagesWithDate[0], fakeMessagesWithDate[1], fakeMessagesWithDate[2]]);

    expect(messagesNullDay).toHaveLength(3);

    expect(messagesEmptyStringDay).toHaveLength(3);
  });

  it('should return five messages from year 2021', async () => {
    const messagesCollection = db.collection(MESSAGES_COLLECTION_NAME);
    await messagesCollection.insertMany(fakeMessagesWithDate);

    const messages = await getMessagesByIntervalDate(db, '2021');
    const messagesEmptyMonth = await getMessagesByIntervalDate(db, '2021', '');
    const messagesEmptyStringMonthDay = await getMessagesByIntervalDate(db, '2021', '', '');
    const messagesUndefinedMonthDay = await getMessagesByIntervalDate(db, '2021', undefined, undefined);

    expect(messages).toHaveLength(5);
    expect(messages).toEqual([
      fakeMessagesWithDate[0],
      fakeMessagesWithDate[1],
      fakeMessagesWithDate[2],
      fakeMessagesWithDate[3],
      fakeMessagesWithDate[4],
    ]);
    expect(messagesEmptyMonth).toHaveLength(5);
    expect(messagesEmptyStringMonthDay).toHaveLength(5);
    expect(messagesUndefinedMonthDay).toHaveLength(5);
  });
});
