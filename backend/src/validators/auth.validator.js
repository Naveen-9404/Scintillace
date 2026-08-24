import { body } from "express-validator";

/**
 * ============================================================
 * Register Validator
 * ============================================================
 *
 * Public registration always creates a STUDENT.
 */

const register = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage(
      "Full name is required.",
    )
    .bail()
    .isLength({
      min: 2,
      max: 100,
    })
    .withMessage(
      "Full name must be between 2 and 100 characters.",
    ),

  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage(
      "Email is required.",
    )
    .bail()
    .isEmail()
    .withMessage(
      "Please enter a valid email address.",
    )
    .isLength({
      max: 254,
    })
    .withMessage(
      "Email address cannot exceed 254 characters.",
    ),

  body("password")
    .notEmpty()
    .withMessage(
      "Password is required.",
    )
    .bail()
    .isLength({
      min: 8,
      max: 128,
    })
    .withMessage(
      "Password must be between 8 and 128 characters.",
    )
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
    )
    .withMessage(
      "Password must contain uppercase, lowercase, number and special character.",
    ),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage(
      "Phone number is required.",
    )
    .bail()
    .matches(
      /^\+?[0-9\s()-]{7,15}$/,
    )
    .withMessage(
      "Invalid phone number.",
    ),

  body("collegeId")
    .trim()
    .notEmpty()
    .withMessage(
      "College ID is required.",
    )
    .bail()
    .isLength({
      min: 2,
      max: 50,
    })
    .withMessage(
      "College ID must be between 2 and 50 characters.",
    )
    .matches(
      /^[A-Za-z0-9_-]+$/,
    )
    .withMessage(
      "College ID contains invalid characters.",
    ),
];

/**
 * ============================================================
 * Login Validator
 * ============================================================
 */

const login = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage(
      "Email is required.",
    )
    .bail()
    .isEmail()
    .withMessage(
      "Please enter a valid email address.",
    )
    .isLength({
      max: 254,
    })
    .withMessage(
      "Email address cannot exceed 254 characters.",
    ),

  body("password")
    .notEmpty()
    .withMessage(
      "Password is required.",
    ),
];

/**
 * ============================================================
 * Update Profile Validator
 * ============================================================
 *
 * Users can update their own profile information.
 *
 * Email, password, role, account status and authentication
 * provider information are intentionally excluded.
 */

const updateProfile = [
  body("fullName")
    .optional()
    .trim()
    .isLength({
      min: 2,
      max: 100,
    })
    .withMessage(
      "Full name must be between 2 and 100 characters.",
    ),

  body("phone")
    .optional()
    .trim()
    .matches(
      /^\+?[0-9\s()-]{7,15}$/,
    )
    .withMessage(
      "Invalid phone number.",
    ),

  body("collegeId")
    .optional()
    .trim()
    .isLength({
      min: 2,
      max: 50,
    })
    .withMessage(
      "College ID must be between 2 and 50 characters.",
    )
    .matches(
      /^[A-Za-z0-9_-]+$/,
    )
    .withMessage(
      "College ID contains invalid characters.",
    ),

  body("avatarUrl")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Avatar URL cannot exceed 500 characters.",
    ),
];

/**
 * ============================================================
 * Export
 * ============================================================
 */

const authValidator =
  Object.freeze({
    register,
    login,
    updateProfile,
  });

export default authValidator;