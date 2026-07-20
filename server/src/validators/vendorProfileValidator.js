import { body, validationResult } from 'express-validator';

// Helper to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

export const validateProfileUpdate = [
  // Personal Info Validation (Only applied if personalInfo object exists in req.body)
  body('personalInfo.fullName')
    .if(body('personalInfo').exists())
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Full name can only contain letters and spaces'),

  body('personalInfo.phone')
    .if(body('personalInfo').exists())
    .notEmpty().withMessage('Primary phone is required')
    .matches(/^[0-9]{10}$/).withMessage('Primary phone must be exactly 10 digits'),

  body('personalInfo.alternatePhone')
    .if(body('personalInfo').exists())
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{10}$/).withMessage('Alternate phone must be exactly 10 digits'),

  body('personalInfo.gender')
    .if(body('personalInfo').exists())
    .optional({ checkFalsy: true })
    .isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender selection'),

  body('personalInfo.dateOfBirth')
    .if(body('personalInfo').exists())
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Invalid date of birth format'),

  // Address Validation (Only applied if address object exists in req.body)
  body('address.line1')
    .if(body('address').exists())
    .notEmpty().withMessage('Address Line 1 is required')
    .isLength({ min: 3, max: 100 }).withMessage('Address Line 1 must be between 3 and 100 characters'),

  body('address.line2')
    .if(body('address').exists())
    .optional({ checkFalsy: true })
    .isLength({ max: 100 }).withMessage('Address Line 2 cannot exceed 100 characters'),

  body('address.city')
    .if(body('address').exists())
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('City can only contain letters and spaces'),

  body('address.state')
    .if(body('address').exists())
    .notEmpty().withMessage('State is required')
    .isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('State can only contain letters and spaces'),

  body('address.pincode')
    .if(body('address').exists())
    .notEmpty().withMessage('Pincode is required')
    .matches(/^[0-9]{6}$/).withMessage('Pincode must be exactly 6 digits'),

  body('address.country')
    .if(body('address').exists())
    .notEmpty().withMessage('Country is required')
    .isString().withMessage('Country must be a string'),

  handleValidationErrors,
];

export const validateIdentityUpdate = [
  body('roleInBusiness')
    .notEmpty().withMessage('Role in business is required')
    .isIn(['owner', 'co-owner', 'partner', 'manager', 'authorized_representative']).withMessage('Invalid role selection'),

  body('documentType')
    .notEmpty().withMessage('Document type is required')
    .isIn(['aadhar', 'pan', 'driving_license', 'passport', 'voter_id']).withMessage('Invalid document type'),

  body('documentNumber')
    .notEmpty().withMessage('Document number is required')
    .isAlphanumeric().withMessage('Document number must be alphanumeric')
    .isLength({ min: 5, max: 20 }).withMessage('Document number must be between 5 and 20 characters'),

  handleValidationErrors,
];
