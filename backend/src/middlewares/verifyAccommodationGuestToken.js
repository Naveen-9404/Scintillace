import crypto from "crypto";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const verifyAccommodationGuestToken = async (req, res, next) => {
  try {
    const id = req.params.id;
    const rawToken = req.header("X-Accommodation-Token");

    if (!rawToken) {
      throw new ApiError("Accommodation guest token is missing.", HTTP_STATUS.UNAUTHORIZED);
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError("Invalid Accommodation ID.", HTTP_STATUS.BAD_REQUEST);
    }

    const Accommodation = mongoose.model("Accommodation");
    const accommodation = await Accommodation.findById(id).select("+guestTokenHash");

    if (!accommodation) {
      throw new ApiError("Accommodation booking not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (!accommodation.guestTokenHash) {
      throw new ApiError("This accommodation booking does not support guest access.", HTTP_STATUS.FORBIDDEN);
    }

    const providedHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    if (providedHash !== accommodation.guestTokenHash) {
      throw new ApiError("Invalid accommodation guest token.", HTTP_STATUS.UNAUTHORIZED);
    }

    // Attach accommodation to request to avoid re-fetching in controller
    req.accommodation = accommodation;
    
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyAccommodationGuestToken;
