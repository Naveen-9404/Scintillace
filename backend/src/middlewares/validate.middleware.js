import { validationResult } from 'express-validator';

import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../constants/httpStatus.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        errors.array()
      )
    );
  }

  next();
};

export default validate;