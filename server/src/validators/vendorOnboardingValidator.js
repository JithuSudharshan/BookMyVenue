import { body, validationResult } from 'express-validator';

export const validateStep1 = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('phone').notEmpty().withMessage('Primary phone is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  // Add other validations as needed
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    next();
  },
];

export const validateStep2 = [
  body('address.line1').notEmpty().withMessage('Address Line 1 is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('address.pincode').notEmpty().withMessage('Pincode is required'),
  body('roleInBusiness').notEmpty().withMessage('Role in business is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    next();
  },
];

export const validateStep3 = [
  body('documentType').notEmpty().withMessage('Document type is required'),
  body('documentNumber').notEmpty().withMessage('Document number is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    next();
  },
];
