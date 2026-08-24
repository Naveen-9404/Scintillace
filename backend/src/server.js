import app from './app.js';
import { initializeDatabase } from './config/database.js';
import config from './config/index.js';
import logger from './config/logger.js';

const startServer = async () => {
  try {
    await initializeDatabase();

    const server = app.listen(config.env.port, () => {
      logger.info(
        `Scintillace backend running on http://localhost:${config.env.port}`,
      );
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.env.port} is already in use.`);
        process.exit(1);
      }

      logger.error(error);
      process.exit(1);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

startServer();
