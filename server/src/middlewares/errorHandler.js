export const globalErrorHandler = (err, req, res, next) => {
  // Log the error for developer context (consider using a logger like Winston/Morgan for production)
  console.error(err.stack);

  // If the error has a status property, it's typically an AppError/ApiError we intentionally threw
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational || false;

  // Formatting response based on environment
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status: err.status || 'error',
      message: err.message || 'Internal Server Error',
      error: err,
      stack: err.stack,
    });
  }

  // Production response (don't leak details)
  if (isOperational) {
    return res.status(statusCode).json({
      status: err.status || 'error',
      message: err.message,
    });
  }

  // Programming or unknown errors
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};
