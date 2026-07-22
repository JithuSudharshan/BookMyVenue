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
