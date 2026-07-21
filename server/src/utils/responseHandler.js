export const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode, message, errorDetails = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errorDetails) {
    // Only include in dev or if explicitly passed
    response.error = errorDetails;
  }
  
  return res.status(statusCode).json(response);
};
