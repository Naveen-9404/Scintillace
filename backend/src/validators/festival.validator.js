import { body, param } from 'express-validator';

const FESTIVAL_STATUS = [
  'DRAFT',
  'PUBLISHED',
  'COMPLETED',
  'CANCELLED',
];

const createFestivalValidator = [
  body('title')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Festival title is required.')
    .isLength({ max: 150 })
    .withMessage('Festival title cannot exceed 150 characters.'),

  body('description')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Festival description is required.'),

  body('theme')
    .optional()
    .trim()
    .escape(),

  body('venue')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Venue is required.'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required.')
    .isISO8601()
    .withMessage('Invalid start date.'),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required.')
    .isISO8601()
    .withMessage('Invalid end date.'),

  body('bannerUrl')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Banner URL must be a valid URL.'),

  body('registrationOpen')
    .optional()
    .isBoolean()
    .withMessage('registrationOpen must be true or false.'),

  body('status')
    .optional()
    .isIn(FESTIVAL_STATUS)
    .withMessage('Invalid festival status.'),
];

const updateFestivalValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Festival ID.'),

  body('title')
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Festival title cannot be empty.')
    .isLength({ max: 150 })
    .withMessage('Festival title cannot exceed 150 characters.'),

  body('description')
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Festival description cannot be empty.'),

  body('theme')
    .optional()
    .trim()
    .escape(),

  body('venue')
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Venue cannot be empty.'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date.'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date.'),

  body('bannerUrl')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Banner URL must be a valid URL.'),

  body('registrationOpen')
    .optional()
    .isBoolean()
    .withMessage('registrationOpen must be true or false.'),

  body('status')
    .optional()
    .isIn(FESTIVAL_STATUS)
    .withMessage('Invalid festival status.'),
];

const festivalIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Festival ID.'),
];

export {
  createFestivalValidator,
  updateFestivalValidator,
  festivalIdValidator,
};