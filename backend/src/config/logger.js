import winston from 'winston';

import env from './env.js';

const {
  combine,
  colorize,
  errors,
  json,
  printf,
  timestamp,
} = winston.format;

const isDevelopment =
  env.nodeEnv === 'development';

const logger = winston.createLogger({
  level: env.logLevel || 'info',

  format: isDevelopment
    ? combine(
        colorize(),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        errors({ stack: true }),
        printf(
          ({
            timestamp,
            level,
            message,
            stack,
          }) =>
            stack
              ? `${timestamp} [${level}] ${message}\n${stack}`
              : `${timestamp} [${level}] ${message}`,
        ),
      )
    : combine(
        timestamp(),
        errors({ stack: true }),
        json(),
      ),

  transports: [
    new winston.transports.Console(),
  ],

  exceptionHandlers: [
    new winston.transports.Console(),
  ],

  rejectionHandlers: [
    new winston.transports.Console(),
  ],

  exitOnError: false,
});

export default Object.freeze(logger);