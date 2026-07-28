import { z } from 'zod';
import mongoose from 'mongoose';

const isMongoId = (val) => mongoose.Types.ObjectId.isValid(val);

export const submitReviewSchema = z.object({
  bookingId: z
    .string()
    .trim()
    .refine(isMongoId, { message: 'Invalid booking ID.' }),
  rating: z.coerce
    .number({ invalid_type_error: 'Rating must be a number.' })
    .int({ message: 'Rating must be a whole number.' })
    .min(1, { message: 'Rating must be at least 1.' })
    .max(5, { message: 'Rating must not exceed 5.' }),
  comment: z
    .string()
    .trim()
    .max(1000, { message: 'Comment must not exceed 1000 characters.' })
    .optional(),
});

export const editReviewSchema = z.object({
  rating: z.coerce
    .number({ invalid_type_error: 'Rating must be a number.' })
    .int({ message: 'Rating must be a whole number.' })
    .min(1, { message: 'Rating must be at least 1.' })
    .max(5, { message: 'Rating must not exceed 5.' })
    .optional(),
  comment: z
    .string()
    .trim()
    .max(1000, { message: 'Comment must not exceed 1000 characters.' })
    .optional(),
});
