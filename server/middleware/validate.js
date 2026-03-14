import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    next();
};

export const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name max 50 chars'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors,
];

export const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
];

export const transactionValidation = [
    body('type').isIn(['credit', 'debit']).withMessage('Type must be credit or debit'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('description').optional().trim(),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    handleValidationErrors,
];

export const ledgerEntryValidation = [
    body('accountName').trim().notEmpty().withMessage('Account name is required'),
    body('period').trim().notEmpty().withMessage('Period is required'),
    body('openingBalance').isNumeric().withMessage('Opening balance must be a number'),
    handleValidationErrors,
];
