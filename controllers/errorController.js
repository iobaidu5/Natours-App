const AppError = require('../utils/appError');

const handleCastError = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400); 
}

const handleValidationErorDB = err => {
  const errors = Object.values(err.erros).map(el => el.message);
  const message = `Invalid input data, ${errors.join('. ')}`;
  return new AppError(message, 400);
}

const handleJWTError = err => new AppError('Invalid Toekn. Please Login again', 401);
const handleJWTExpiredError = err => new AppError('Your Token has expired. Please Login again', 401);
const sendErrorDev = (err,res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

const sendErrorProd = (err,res) => {
  if (err.isOperational) {
  res.status(err.statusCode).json({
   status: err.status,
   message: err.message
  });
} else {
  res.status(500).json({
    status: 'error',
    message: "Something went wrong"
  })
}

}

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
      sendErrorDev(err,res)
    } else if (process.env.NODE_ENV === 'production'){
      sendErrorProd(err,res);
    }
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    if(error.name === 'CasrError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if(error.name === 'ValidationError') 
      error = handleValidationErorDB(error);
    if(error.name === 'JsonWebTokenError') error = handleJWTError(error)
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error)
      
    sendErrorProd(err,res);
}