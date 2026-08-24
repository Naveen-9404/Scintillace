import mongoose from "mongoose";
import bcrypt from "bcrypt";

import ROLES from "../constants/roles.js";

const { Schema, model } = mongoose;

const SALT_ROUNDS = 12;

const AUTH_PROVIDERS = Object.freeze({
  LOCAL: "LOCAL",
  GOOGLE: "GOOGLE",
});

const userSchema = new Schema(
  {
    /**
     * ============================================================
     * Basic Information
     * ============================================================
     */

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    /**
     * ============================================================
     * Authentication Provider
     * ============================================================
     */

    authProvider: {
      type: String,
      enum: Object.values(
        AUTH_PROVIDERS,
      ),
      default: AUTH_PROVIDERS.LOCAL,
      required: true,
      index: true,
    },

    /**
     * ============================================================
     * Google Identity
     * ============================================================
     *
     * Google `sub` is stored here.
     *
     * select:false prevents this value from being returned
     * during normal user queries.
     */

   googleId: {
  type: String,
  default: undefined,
  unique: true,
  sparse: true,
  index: true,
  select: false,
  trim: true,
},

    /**
     * ============================================================
     * Password
     * ============================================================
     *
     * Required for LOCAL accounts.
     *
     * GOOGLE accounts do not require a local password.
     */

    password: {
      type: String,
      required: function () {
        return (
          this.authProvider ===
          AUTH_PROVIDERS.LOCAL
        );
      },
      minlength: 8,
      select: false,
    },

    /**
     * ============================================================
     * Contact / College
     * ============================================================
     */

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    collegeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    /**
     * ============================================================
     * Role
     * ============================================================
     */

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
      required: true,
      index: true,
    },

    /**
     * ============================================================
     * Profile
     * ============================================================
     */

    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * ============================================================
     * Refresh Token
     * ============================================================
     */

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    /**
     * ============================================================
     * Login Tracking
     * ============================================================
     */

    lastLoginAt: {
      type: Date,
      default: null,
    },

    lastLoginIp: {
      type: String,
      default: null,
      trim: true,
    },

    /**
     * ============================================================
     * Account Status
     * ============================================================
     */

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      virtuals: true,

      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.googleId;

        return ret;
      },
    },

    toObject: {
      virtuals: true,
    },
  },
);

/**
 * ============================================================
 * Password Hashing
 * ============================================================
 */

userSchema.pre(
  "save",
  async function () {
    if (
      !this.isModified("password") ||
      !this.password
    ) {
      return;
    }

    this.password =
      await bcrypt.hash(
        this.password,
        SALT_ROUNDS,
      );
  },
);

/**
 * ============================================================
 * Compare Password
 * ============================================================
 */

userSchema.methods.comparePassword =
  async function (
    candidatePassword,
  ) {
    if (!this.password) {
      return false;
    }

    return bcrypt.compare(
      candidatePassword,
      this.password,
    );
  };

/**
 * ============================================================
 * Virtual ID
 * ============================================================
 */

userSchema.virtual("id").get(
  function () {
    return this._id.toHexString();
  },
);

/**
 * ============================================================
 * Model
 * ============================================================
 */

const User = model(
  "User",
  userSchema,
);

export default User;

export {
  AUTH_PROVIDERS,
};