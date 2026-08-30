import app from './app.js';
import { initializeDatabase, closeDatabase } from './config/database.js';
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

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await closeDatabase();
        process.exit(0);
      });

      // Force close if it takes too long
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

startServer();
