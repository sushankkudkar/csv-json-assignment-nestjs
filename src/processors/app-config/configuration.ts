/**
 * Application configuration.
 * @file Application configuration settings
 * @module config/app.config
 * @description Provides configuration settings for the application, including environment variables and database settings.
 */

import { registerAs } from '@nestjs/config';

/**
 * Registers application configuration.
 * @returns {Object} Configuration settings for the application.
 */
export default registerAs('app', () => ({
  env: process.env.NODE_ENV,
  name: process.env.APP_NAME,
  port: process.env.PORT,
  csvImportQueueMax: process.env.CSV_IMPORT_QUEUE_MAX,
  csvImportQueueDuration: process.env.CSV_IMPORT_QUEUE_DURATION,
  s3Bucket: process.env.S3_BUCKET || '',
  aws: {
    accessToken: process.env.AWS_ACCESS_TOKEN || '',
    accessSecretToken: process.env.AWS_ACCESS_SECRET_TOKEN || '',
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
}));
