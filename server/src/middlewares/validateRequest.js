import { z } from "zod";

export const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return the first error message or format it better
      const errorMessage = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessage, errors: error.errors });
    }
    return res.status(500).json({ message: "Internal server error during validation" });
  }
};
