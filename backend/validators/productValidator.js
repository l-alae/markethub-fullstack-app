const { body } = require('express-validator');

exports.productValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters.'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer.'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required.')
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters.'),
];
