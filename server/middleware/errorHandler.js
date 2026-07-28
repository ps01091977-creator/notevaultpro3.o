const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  let message = err.message;
  if (
    err.message.includes('ENOTFOUND') || 
    err.message.includes('ECONNREFUSED') || 
    err.name === 'MongoNetworkError' ||
    err.message.includes('MongooseError')
  ) {
    message = 'Database connection error. Please check your internet connection and try again.';
  }

  res.json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
