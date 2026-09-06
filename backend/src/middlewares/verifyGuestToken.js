import crypto from "crypto";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const verifyGuestToken = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.registrationId || req.body.registrationId || req.query.registrationId;
    const rawToken = req.header("X-Guest-Token");

    if (!rawToken) {
      throw new ApiError("Guest token is missing.", HTTP_STATUS.UNAUTHORIZED);
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError("Invalid Registration ID.", HTTP_STATUS.BAD_REQUEST);
    }
    
    const Registration = mongoose.model("Registration");
    const registration = await Registration.findById(id).select("+guestTokenHash +guestTokenExpiresAt").populate("event festival");

    if (!registration) {
      throw new ApiError("Registration not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (!registration.guestTokenHash || !registration.guestTokenExpiresAt) {
      throw new ApiError("This registration does not support guest access.", HTTP_STATUS.FORBIDDEN);
    }

    if (new Date() > registration.guestTokenExpiresAt) {
      throw new ApiError("Guest token has expired. Please contact support.", HTTP_STATUS.UNAUTHORIZED);
    }

    const providedHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    if (providedHash !== registration.guestTokenHash) {
      throw new ApiError("Invalid guest token.", HTTP_STATUS.UNAUTHORIZED);
    }

    // Attach registration to request to avoid re-fetching in controller
    req.registration = registration;
    
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyGuestToken;
