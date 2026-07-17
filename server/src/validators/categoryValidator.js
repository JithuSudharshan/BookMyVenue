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

export const validateCategory = [
  body('name')
    .notEmpty().withMessage('Category name is required')
    .isString().withMessage('Category name must be a string')
    .isLength({ min: 3, max: 50 }).withMessage('Category name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9\s-]+$/).withMessage('Category name can only contain letters, numbers, spaces, and hyphens'),
  
  body('description')
    .optional({ checkFalsy: true })
    .isString().withMessage('Description must be a string')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  handleValidationErrors,
];

export const validateSubcategory = [
  body('name')
    .notEmpty().withMessage('Subcategory name is required')
    .isString().withMessage('Subcategory name must be a string')
    .isLength({ min: 3, max: 50 }).withMessage('Subcategory name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9\s-]+$/).withMessage('Subcategory name can only contain letters, numbers, spaces, and hyphens'),
  
  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isMongoId().withMessage('Invalid Category ID format'),
  
  handleValidationErrors,
];
