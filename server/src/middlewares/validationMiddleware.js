export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorMessages = result.error.errors.map(err => err.message).join(', ');
    return res.status(400).json({
      success: false,
      message: `Validation failed: ${errorMessages}`,
      errors: result.error.format()
    });
  }
  // Override body with cleaned/trimmed Zod outputs
  req.body = result.data;
  next();
};
