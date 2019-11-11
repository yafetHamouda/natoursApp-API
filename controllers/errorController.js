const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFields = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}, Please use another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// eslint-disable-next-line no-unused-vars
const handleJWTError = err =>
  new AppError(`Invalid token, please login again`, 401);

// eslint-disable-next-line no-unused-vars
const handleJWTExpiredError = err =>
  new AppError('Your Token has expired, please log in again', 401);

const sendErrorDev = (err, req, res) => {
  //a- API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  //b- RENDER
  console.error('ERROR', err);

  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  //a- API
  if (req.originalUrl.startsWith('/api')) {
    //a- operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    //b- programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR', err);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message
    });
  }
  //programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR', err);

  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: 'please try again later'
  });
};

module.exports = (err, req, res, next) => {
  /*   
    console.log(err.stack);
*/
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.Node_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.Node_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFields(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(error);

    sendErrorProd(error, req, res);
  }
};
