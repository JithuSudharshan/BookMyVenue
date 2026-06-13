import { z } from "zod";
import mongoose from "mongoose";

// Custom Zod schema to validate MongoDB ObjectIds
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid MongoDB ObjectId format",
});

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const verifyVendorSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.enum(["approved", "rejected", "pending"], {
      errorMap: () => ({ message: "Status must be 'approved', 'rejected', or 'pending'" }),
    }),
    rejectReason: z.string().optional(),
  }).refine((data) => {
    if (data.status === "rejected") {
      return !!data.rejectReason && data.rejectReason.trim().length > 0;
    }
    return true;
  }, {
    message: "Reason for rejection is required",
    path: ["rejectReason"],
  }),
});

export const mongoIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
