import { z } from 'zod';

const nameRegex = /^[a-zA-Z]+(?:[\s'-][a-zA-Z]+)*$/;
const alphaSpacesRegex = /^[a-zA-Z\s]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const pinRegex = /^\d{6}$/;

export const customerProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { message: 'First name must be at least 2 characters.' })
    .max(50, { message: 'First name must not exceed 50 characters.' })
    .regex(nameRegex, { message: 'First name must contain only letters, single spaces, hyphens, or apostrophes, and cannot start or end with spaces.' }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: 'Last name must be at least 2 characters.' })
    .max(50, { message: 'Last name must not exceed 50 characters.' })
    .regex(nameRegex, { message: 'Last name must contain only letters, single spaces, hyphens, or apostrophes, and cannot start or end with spaces.' }),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, { message: 'Phone number must be a valid 10-digit Indian mobile number (e.g. 9876543210).' }),
  addressStreet: z
    .string()
    .trim()
    .min(3, { message: 'Street address must be at least 3 characters.' })
    .max(100, { message: 'Street address must not exceed 100 characters.' }),
  addressCity: z
    .string()
    .trim()
    .min(2, { message: 'City name must be at least 2 characters.' })
    .max(50, { message: 'City name must not exceed 50 characters.' })
    .regex(alphaSpacesRegex, { message: 'City must contain only letters and spaces.' }),
  addressDistrict: z
    .string()
    .trim()
    .min(2, { message: 'District name must be at least 2 characters.' })
    .max(50, { message: 'District name must not exceed 50 characters.' })
    .regex(alphaSpacesRegex, { message: 'District must contain only letters and spaces.' }),
  addressState: z
    .string()
    .trim()
    .min(2, { message: 'State name must be at least 2 characters.' })
    .max(50, { message: 'State name must not exceed 50 characters.' })
    .regex(alphaSpacesRegex, { message: 'State must contain only letters and spaces.' }),
  addressZipCode: z
    .string()
    .trim()
    .regex(pinRegex, { message: 'PIN Code must be exactly 6 digits (e.g. 682001).' }),
  addressCountry: z
    .string()
    .trim()
    .optional()
    .default('India'),
  profileImage: z
    .string()
    .trim()
    .optional()
});
