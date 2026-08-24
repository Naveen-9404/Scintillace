import { validationResult } from 'express-validator';

import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../constants/httpStatus.js';

/**
 * Express Validator Middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((error) => ({
    field: error.path,
    message: error.msg,
    value: error.value,
  }));

  return next(
    new ApiError(
      'Validation failed.',
      HTTP_STATUS.BAD_REQUEST,
      formattedErrors,
    ),
  );
};

export default Object.freeze(validate);