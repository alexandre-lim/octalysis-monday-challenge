// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  const dev = process.env.NODE_ENV !== 'production';
  if (res.headersSent) {
    next(error);
  } else {
    let details = null;
    if (dev) {
      if (error.details instanceof Error) {
        details = error.details.stack;
      } else {
        details = error.details;
      }
    }
    res.status(error.statusCode).json({
      message: error.message,
      details,
    });
  }
}

function createCustomError({ message = '', statusCode = 500, details = {} } = {}) {
  return {
    error: true,
    message,
    statusCode,
    details,
  };
}

export { errorHandler, createCustomError };
