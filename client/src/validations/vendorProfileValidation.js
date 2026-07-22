import { z } from 'zod';

const phoneRegex = /^[0-9]{10}$/;

export const vendorPersonalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  alternatePhone: z.string().regex(phoneRegex, "Invalid phone number").optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
});

export const vendorAddressSchema = z.object({
  line1: z.string().min(3, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
});

export const vendorIdentitySchema = z.object({
  roleInBusiness: z.enum(['owner', 'co-owner', 'partner', 'manager', 'authorized_representative']),
  documentType: z.enum(['aadhar', 'pan', 'driving_license', 'passport', 'voter_id']),
  documentNumber: z.string().min(5, "Document number is required"),
  documentFile: z.any().optional(),
});
