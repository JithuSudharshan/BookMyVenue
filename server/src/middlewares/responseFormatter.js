export const responseFormatter = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Prevent double wrapping
    if (data && typeof data === 'object' && ('success' in data)) {
      return originalJson.call(this, data);
    }

    const statusCode = res.statusCode;

    // Handle Error Responses
    if (statusCode >= 400) {
      return originalJson.call(this, {
        success: false,
        message: data?.message || 'An error occurred',
        error: data?.errors || data?.error || data,
      });
    }

    // Handle Success Responses
    // If the data object is just { message: '...' }, extract it.
    let message = 'Success';
    let payload = data;

    if (data && typeof data === 'object' && Object.keys(data).length === 1 && 'message' in data) {
      message = data.message;
      payload = null;
    } else if (data && typeof data === 'object' && 'message' in data) {
      message = data.message;
      // We keep the rest of the object as the payload, or extract 'data' if it exists.
      if ('data' in data) {
        payload = data.data;
      } else {
        const { message: _, ...rest } = data;
        payload = rest;
      }
    }

    return originalJson.call(this, {
      success: true,
      message,
      data: payload,
    });
  };

  next();
};
