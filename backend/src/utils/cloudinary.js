import { v2 as cloudinary } from "cloudinary";
import env from "../config/env.js";
import logger from "./logger.js";

/**
 * Configure Cloudinary
 */
cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

/**
 * Delete an asset from Cloudinary
 * @param {string} publicId - The public ID of the asset to delete
 * @returns {Promise<boolean>} True if successfully deleted or missing credentials
 */
const deleteAsset = async (publicId) => {
  if (!publicId) return false;

  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    logger.warn(`Cloudinary credentials missing. Skipping deletion of asset: ${publicId}`);
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      logger.info(`Successfully deleted Cloudinary asset: ${publicId}`);
      return true;
    } else {
      logger.warn(`Failed to delete Cloudinary asset: ${publicId}. Result: ${result.result}`);
      return false;
    }
  } catch (error) {
    logger.error(`Error deleting Cloudinary asset: ${publicId}. Error: ${error.message}`);
    return false;
  }
};

const cloudinaryUtil = Object.freeze({
  deleteAsset,
});

export default cloudinaryUtil;
