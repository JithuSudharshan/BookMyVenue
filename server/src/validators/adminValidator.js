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
    status: z.enum(["requested", "approved", "rejected", "under_review", "changes_requested"], {
      errorMap: () => ({ message: "Status must be 'requested', 'approved', 'rejected', 'under_review', or 'changes_requested'" }),
    }),
    adminRemarks: z.string().optional(),
  }).refine((data) => {
    if (data.status === "rejected" || data.status === "changes_requested") {
      return !!data.adminRemarks && data.adminRemarks.trim().length > 0;
    }
    return true;
  }, {
    message: "Admin remarks are required when rejecting or requesting changes",
    path: ["adminRemarks"],
  }),
});

export const updateUserBlockStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    isBlocked: z.boolean({
      required_error: "isBlocked is required",
      invalid_type_error: "isBlocked must be a boolean",
    }),
  }),
});

export const mongoIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const updateVenueStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.enum(["approved", "rejected", "under_review"], {
      errorMap: () => ({ message: "Status must be 'approved', 'rejected', or 'under_review'" }),
    }),
    rejectionReason: z.string().optional(),
  }).refine((data) => {
    if (data.status === "rejected") {
      return !!data.rejectionReason && data.rejectionReason.trim().length > 0;
    }
    return true;
  }, {
    message: "Reason for rejection is required",
    path: ["rejectionReason"],
  }),
});

export const updateVenueVisibilitySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    venueStatus: z.enum(["active", "inactive"], {
      errorMap: () => ({ message: "venueStatus must be 'active' or 'inactive'" }),
    }),
  }),
});
