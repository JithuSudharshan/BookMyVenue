import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: errors.array()[0].msg, 
      errors: errors.array() 
    });
  }
  next();
};

export const validateVenueSubmit = [
  body('name')
    .notEmpty().withMessage('Venue name is required')
    .isString().withMessage('Venue name must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Venue name must be between 3 and 200 characters')
    .matches(/^[a-zA-Z0-9\s-&']+$/).withMessage('Venue name can only contain letters, numbers, spaces, hyphens, ampersands, and apostrophes'),
  
  body('description')
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid Category format'),

  body('subcategory')
    .notEmpty().withMessage('Subcategory is required')
    .isMongoId().withMessage('Invalid Subcategory format'),

  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isNumeric().withMessage('Capacity must be a number')
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),

  body('address')
    .notEmpty().withMessage('Address is required')
    .isString().withMessage('Address must be a string'),

  body('city')
    .notEmpty().withMessage('City is required')
    .isString().withMessage('City must be a string'),

  body('state')
    .notEmpty().withMessage('State is required')
    .isString().withMessage('State must be a string'),

  body('pincode')
    .notEmpty().withMessage('Pincode is required')
    .isString().withMessage('Pincode must be a string')
    .matches(/^\d{6}$/).withMessage('Pincode must be exactly 6 digits'),

  body('googleMapLink')
    .notEmpty().withMessage('Google Map link is required')
    .isString().withMessage('Google Map link must be a string')
    .matches(/^https?:\/\/(www\.)?google\.com\/maps.*|^https?:\/\/maps\.app\.goo\.gl\/.*/).withMessage('Please enter a valid Google Maps URL'),

  body('images')
    .isArray({ min: 3 }).withMessage('At least 3 images are required for submission'),

  body('bookingModel')
    .notEmpty().withMessage('Booking model is required')
    .isIn(['daily', 'hourly']).withMessage('Booking model must be either daily or hourly'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative'),

  handleValidationErrors,
];

export const validateVenueUpdate = [
  body('name')
    .optional()
    .notEmpty().withMessage('Venue name is required')
    .isString().withMessage('Venue name must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Venue name must be between 3 and 200 characters')
    .matches(/^[a-zA-Z0-9\s-&']+$/).withMessage('Venue name can only contain letters, numbers, spaces, hyphens, ampersands, and apostrophes'),
  
  body('description')
    .optional()
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('category')
    .optional()
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid Category format'),

  body('subcategory')
    .optional()
    .notEmpty().withMessage('Subcategory is required')
    .isMongoId().withMessage('Invalid Subcategory format'),

  body('capacity')
    .optional()
    .notEmpty().withMessage('Capacity is required')
    .isNumeric().withMessage('Capacity must be a number')
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),

  body('address')
    .optional()
    .notEmpty().withMessage('Address is required')
    .isString().withMessage('Address must be a string'),

  body('city')
    .optional()
    .notEmpty().withMessage('City is required')
    .isString().withMessage('City must be a string'),

  body('state')
    .optional()
    .notEmpty().withMessage('State is required')
    .isString().withMessage('State must be a string'),

  body('pincode')
    .optional()
    .notEmpty().withMessage('Pincode is required')
    .isString().withMessage('Pincode must be a string')
    .matches(/^\d{6}$/).withMessage('Pincode must be exactly 6 digits'),

  body('googleMapLink')
    .optional()
    .notEmpty().withMessage('Google Map link is required')
    .isString().withMessage('Google Map link must be a string')
    .matches(/^https?:\/\/(www\.)?google\.com\/maps.*|^https?:\/\/maps\.app\.goo\.gl\/.*/).withMessage('Please enter a valid Google Maps URL'),

  body('images')
    .optional()
    .isArray({ min: 3 }).withMessage('At least 3 images are required for submission'),

  body('bookingModel')
    .optional()
    .notEmpty().withMessage('Booking model is required')
    .isIn(['daily', 'hourly']).withMessage('Booking model must be either daily or hourly'),

  body('price')
    .optional()
    .notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative'),

  handleValidationErrors,
];
