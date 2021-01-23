import {
  buildReqParameter,
  buildResParameter,
  buildNextParameter,
} from '../../tests/middleware-mock';
import { createCustomError, errorHandler } from '../error-handler';

test('createCustomError should return an object with the default value properties', () => {
  const error = createCustomError();
  const expectedError = {
    error: true,
    message: '',
    statusCode: 500,
    details: {},
  };
  expect(error).toMatchObject(expectedError);
});

test('calls next if headersSent is true', () => {
  const req = buildReqParameter();
  const res = buildResParameter({ headersSent: true });
  const next = buildNextParameter();
  const error = createCustomError();

  errorHandler(error, req, res, next);

  expect(next).toHaveBeenCalledWith(error);
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
});

test('responds with status 500 if statusCode is not defined and return an error object', () => {
  const req = buildReqParameter();
  const res = buildResParameter();
  const next = buildNextParameter();
  const error = createCustomError({ message: 'errror message' });

  errorHandler(error, req, res, next);

  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.status).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledWith({
    message: error.message,
    details: error.details,
  });
  expect(res.json).toHaveBeenCalledTimes(1);
});

test('responds with 400 status code and return an error object', () => {
  const req = buildReqParameter();
  const res = buildResParameter();
  const next = buildNextParameter();
  const error = createCustomError({ message: 'Bad Request', statusCode: 400 });

  errorHandler(error, req, res, next);

  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.status).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledWith({
    message: error.message,
    details: error.details,
  });
  expect(res.json).toHaveBeenCalledTimes(1);
});
