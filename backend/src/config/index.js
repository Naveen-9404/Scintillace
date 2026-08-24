import env from './env.js';
import database from './database.js';
import logger from './logger.js';
import cors from './cors.js';

const config = {
  env,
  database,
  logger,
  cors,
};

export { env, database, logger, cors };

export default config;