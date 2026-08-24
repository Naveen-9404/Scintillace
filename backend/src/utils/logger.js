import logger from '../config/logger.js';

/**
 * Application Logger
 *
 * Re-export the configured logger instance so the rest
 * of the application remains independent of the underlying
 * logging library (Winston, Pino, etc.).
 */
export default Object.freeze(logger);