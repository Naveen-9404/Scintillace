import mongoose from 'mongoose';

import env from './env.js';
import logger from './logger.js';

/**
 * Initialize MongoDB Connection
 */
export const initializeDatabase = async () => {
  try {
    await mongoose.connect(env.mongoDbUri);

    logger.info(
      'MongoDB connected successfully.',
    );

    mongoose.connection.on(
      'disconnected',
      () => {
        logger.warn(
          'MongoDB disconnected.',
        );
      },
    );

    mongoose.connection.on(
      'error',
      (error) => {
        logger.error(error);
      },
    );

    return true;
  } catch (error) {
    logger.error(
      `MongoDB connection failed: ${error.message}`,
    );

    throw error;
  }
};

export default Object.freeze({
  initializeDatabase,
});