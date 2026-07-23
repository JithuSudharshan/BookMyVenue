import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid MongoDB ObjectId format",
});

export const getBookingsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    bookingStatus: z.string().optional(),
    venueId: z.string().optional(),
    vendorId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const bookingIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    cancellationReason: z.enum(['Disputes', 'Fraud', 'Legal issues', 'Emergencies', 'Support intervention'], {
      invalid_type_error: "Cancellation reason must be one of: Disputes, Fraud, Legal issues, Emergencies, Support intervention",
      required_error: "Cancellation reason is required",
    }),
    cancellationDescription: z.string().optional(),
  }),
});
